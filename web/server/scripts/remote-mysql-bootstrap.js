import { Client } from "ssh2";
import argon2 from "argon2";
import mysql from "mysql2";
import fs from "fs";
import os from "os";
import path from "path";
import { execFile } from "child_process";
import { fileURLToPath } from "url";
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const serverRoot = path.resolve(scriptDir, "..");
const repoRoot = path.resolve(serverRoot, "..");
const defaultConfigPath = path.join(repoRoot, "scripts", "mysql-remote-init.config.json");
const defaultConfigExamplePath = path.join(repoRoot, "scripts", "mysql-remote-init.config.example.json");
function parseArgs(argv) {
    let configPath = defaultConfigPath;
    let dryRun = false;
    let help = false;
    for (let index = 0; index < argv.length; index += 1) {
        const arg = argv[index];
        if (arg === "--config") {
            const next = argv[index + 1];
            if (!next) {
                throw new Error("--config 需要一个文件路径");
            }
            configPath = path.resolve(process.cwd(), next);
            index += 1;
            continue;
        }
        if (arg === "--dry-run") {
            dryRun = true;
            continue;
        }
        if (arg === "--help" || arg === "-h") {
            help = true;
            continue;
        }
        throw new Error(`不支持的参数: ${arg}`);
    }
    return { configPath, dryRun, help };
}
function printHelp() {
    console.log(`
wotty 远程 MySQL 一键初始化脚本

用法:
  npm run db:remote:init
  npm run db:remote:init -- --config ../../scripts/mysql-remote-init.config.json
  npm run db:remote:init -- --dry-run

默认配置文件:
  ${defaultConfigPath}

示例配置文件:
  ${defaultConfigExamplePath}
`);
}
function ensureConfigExists(configPath) {
    if (fs.existsSync(configPath)) {
        return;
    }
    if (configPath === defaultConfigPath && fs.existsSync(defaultConfigExamplePath)) {
        throw new Error(`未找到配置文件：${configPath}\n请先复制示例配置：${defaultConfigExamplePath}\n重命名为：${configPath}\n再填写 SSH 与 MySQL 参数后重新执行。`);
    }
    throw new Error(`未找到配置文件：${configPath}`);
}
function loadConfig(configPath) {
    ensureConfigExists(configPath);
    const raw = fs.readFileSync(configPath, "utf8");
    try {
        return JSON.parse(raw);
    }
    catch (error) {
        throw new Error(`配置文件 JSON 解析失败：${configPath}\n${String(error)}`);
    }
}
function assertNonEmpty(value, label) {
    if (!value || !value.trim()) {
        throw new Error(`${label} 不能为空`);
    }
    return value.trim();
}
function validateConfig(rawConfig, configPath) {
    const sshHost = assertNonEmpty(rawConfig.ssh?.host, "ssh.host");
    const sshUsername = assertNonEmpty(rawConfig.ssh?.username, "ssh.username");
    const mysqlDatabase = assertNonEmpty(rawConfig.mysql?.database, "mysql.database");
    const mysqlAppUser = assertNonEmpty(rawConfig.mysql?.appUser, "mysql.appUser");
    const mysqlAppPassword = assertNonEmpty(rawConfig.mysql?.appPassword, "mysql.appPassword");
    let privateKey;
    if (rawConfig.ssh?.privateKeyPath) {
        const privateKeyPath = path.isAbsolute(rawConfig.ssh.privateKeyPath)
            ? rawConfig.ssh.privateKeyPath
            : path.resolve(path.dirname(configPath), rawConfig.ssh.privateKeyPath);
        if (!fs.existsSync(privateKeyPath)) {
            throw new Error(`ssh.privateKeyPath 指向的文件不存在：${privateKeyPath}`);
        }
        privateKey = fs.readFileSync(privateKeyPath, "utf8");
    }
    const sshPassword = rawConfig.ssh?.password?.trim();
    if (!sshPassword && !privateKey) {
        throw new Error("ssh.password 和 ssh.privateKeyPath 至少需要提供一个");
    }
    const createDefaultAdmin = rawConfig.admin?.createDefaultAdmin ?? true;
    const grantHosts = (rawConfig.mysql?.grantHosts ?? ["localhost", "127.0.0.1"]).filter(Boolean);
    return {
        ssh: {
            host: sshHost,
            port: rawConfig.ssh?.port ?? 22,
            username: sshUsername,
            password: sshPassword || undefined,
            privateKey,
            passphrase: rawConfig.ssh?.passphrase?.trim() || undefined,
            readyTimeoutMs: rawConfig.ssh?.readyTimeoutMs ?? 20000,
        },
        server: {
            useSudo: rawConfig.server?.useSudo ?? false,
            packageManager: rawConfig.server?.packageManager ?? "auto",
            workspaceDir: rawConfig.server?.workspaceDir?.trim() || "/tmp/wotty-mysql-init",
            cleanupRemoteFiles: rawConfig.server?.cleanupRemoteFiles ?? true,
        },
        mysql: {
            installServer: rawConfig.mysql?.installServer ?? true,
            rootPassword: rawConfig.mysql?.rootPassword?.trim() || undefined,
            port: rawConfig.mysql?.port ?? 3306,
            bindAddress: rawConfig.mysql?.bindAddress?.trim() || "127.0.0.1",
            database: mysqlDatabase,
            appUser: mysqlAppUser,
            appPassword: mysqlAppPassword,
            grantHosts: grantHosts.length > 0 ? grantHosts : ["localhost", "127.0.0.1"],
        },
        admin: {
            createDefaultAdmin,
            email: createDefaultAdmin ? assertNonEmpty(rawConfig.admin?.email, "admin.email") : "",
            password: createDefaultAdmin ? assertNonEmpty(rawConfig.admin?.password, "admin.password") : "",
            name: createDefaultAdmin ? assertNonEmpty(rawConfig.admin?.name, "admin.name") : "",
            accountName: createDefaultAdmin ? assertNonEmpty(rawConfig.admin?.accountName, "admin.accountName") : "",
        },
        configPath,
    };
}
function execFileAsync(command, args, cwd) {
    return new Promise((resolve, reject) => {
        execFile(command, args, { cwd, encoding: "utf8", maxBuffer: 50 * 1024 * 1024 }, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(`${command} ${args.join(" ")} 执行失败\n${stderr || error.message}`));
                return;
            }
            resolve(stdout);
        });
    });
}
async function generateSchemaSql() {
    const prismaCliPath = path.join(serverRoot, "node_modules", "prisma", "build", "index.js");
    return execFileAsync(process.execPath, [
        prismaCliPath,
        "migrate",
        "diff",
        "--from-empty",
        "--to-schema-datamodel",
        "prisma/schema.prisma",
        "--script",
    ], serverRoot);
}
function createBootstrapSql(config) {
    const databaseId = mysql.escapeId(config.mysql.database);
    const lines = [
        "SET NAMES utf8mb4;",
        `CREATE DATABASE IF NOT EXISTS ${databaseId} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
        `USE ${databaseId};`,
        "",
    ];
    for (const grantHost of config.mysql.grantHosts) {
        lines.push(`CREATE USER IF NOT EXISTS ${mysql.escape(config.mysql.appUser)}@${mysql.escape(grantHost)} IDENTIFIED BY ${mysql.escape(config.mysql.appPassword)};`, `ALTER USER ${mysql.escape(config.mysql.appUser)}@${mysql.escape(grantHost)} IDENTIFIED BY ${mysql.escape(config.mysql.appPassword)};`, `GRANT ALL PRIVILEGES ON ${databaseId}.* TO ${mysql.escape(config.mysql.appUser)}@${mysql.escape(grantHost)};`, "");
    }
    lines.push("FLUSH PRIVILEGES;");
    return `${lines.join("\n")}\n`;
}
function createSeedSql(config, adminPasswordHash) {
    if (!config.admin.createDefaultAdmin) {
        return "-- 已关闭默认管理员初始化\n";
    }
    return `USE ${mysql.escapeId(config.mysql.database)};
SET @admin_email = ${mysql.escape(config.admin.email)};
SET @admin_password_hash = ${mysql.escape(adminPasswordHash)};
SET @admin_name = ${mysql.escape(config.admin.name)};
SET @admin_account_name = ${mysql.escape(config.admin.accountName)};

SET @admin_user_id = (
  SELECT \`id\`
  FROM \`user\`
  WHERE \`email\` = @admin_email
  LIMIT 1
);
SET @admin_user_id = IFNULL(@admin_user_id, UUID());

INSERT INTO \`user\` (\`id\`, \`email\`, \`password\`, \`name\`, \`createdAt\`, \`updatedAt\`, \`role\`)
SELECT @admin_user_id, @admin_email, @admin_password_hash, @admin_name, NOW(3), NOW(3), 'ADMIN'
WHERE NOT EXISTS (
  SELECT 1 FROM \`user\` WHERE \`email\` = @admin_email
);

UPDATE \`user\`
SET
  \`password\` = @admin_password_hash,
  \`name\` = @admin_name,
  \`role\` = 'ADMIN',
  \`updatedAt\` = NOW(3)
WHERE \`id\` = @admin_user_id;

SET @admin_account_id = (
  SELECT \`id\`
  FROM \`account\`
  WHERE \`ownerId\` = @admin_user_id
  ORDER BY \`createdAt\` ASC
  LIMIT 1
);
SET @admin_account_id = IFNULL(@admin_account_id, UUID());

INSERT INTO \`account\` (\`id\`, \`name\`, \`ownerId\`, \`createdAt\`, \`updatedAt\`)
SELECT @admin_account_id, @admin_account_name, @admin_user_id, NOW(3), NOW(3)
WHERE NOT EXISTS (
  SELECT 1 FROM \`account\` WHERE \`ownerId\` = @admin_user_id
);

UPDATE \`account\`
SET
  \`name\` = @admin_account_name,
  \`updatedAt\` = NOW(3)
WHERE \`id\` = @admin_account_id;

UPDATE \`user\`
SET
  \`defaultAccountId\` = @admin_account_id,
  \`updatedAt\` = NOW(3)
WHERE \`id\` = @admin_user_id
  AND (\`defaultAccountId\` IS NULL OR \`defaultAccountId\` = '');

INSERT INTO \`account_member\` (
  \`id\`,
  \`accountId\`,
  \`userId\`,
  \`role\`,
  \`nickname\`,
  \`canViewOwn\`,
  \`canManageOwn\`,
  \`canViewAll\`,
  \`canManageAll\`,
  \`joinedAt\`
)
SELECT UUID(), @admin_account_id, @admin_user_id, 'OWNER', @admin_name, TRUE, TRUE, TRUE, TRUE, NOW(3)
WHERE NOT EXISTS (
  SELECT 1
  FROM \`account_member\`
  WHERE \`accountId\` = @admin_account_id
    AND \`userId\` = @admin_user_id
);
`;
}
function shellQuote(value) {
    return `'${value.replace(/'/g, `'\\''`)}'`;
}
function createRemoteBootstrapScript(config) {
    return `#!/usr/bin/env bash
set -euo pipefail

REMOTE_WORKDIR=${shellQuote(config.server.workspaceDir)}
USE_SUDO=${config.server.useSudo ? "true" : "false"}
PACKAGE_MANAGER=${shellQuote(config.server.packageManager)}
INSTALL_SERVER=${config.mysql.installServer ? "true" : "false"}
MYSQL_BIND_ADDRESS=${shellQuote(config.mysql.bindAddress)}
MYSQL_ROOT_PASSWORD=${shellQuote(config.mysql.rootPassword ?? "")}
CLEANUP_REMOTE_FILES=${config.server.cleanupRemoteFiles ? "true" : "false"}

log() {
  printf '[wotty-mysql-init] %s\\n' "$1"
}

fail() {
  printf '[wotty-mysql-init] %s\\n' "$1" >&2
  exit 1
}

run_root() {
  if [ "$(id -u)" -eq 0 ]; then
    "$@"
    return
  fi

  if [ "$USE_SUDO" != "true" ]; then
    fail "当前 SSH 用户不是 root，且 server.useSudo=false，无法执行安装与 MySQL 初始化。"
  fi

  if ! command -v sudo >/dev/null 2>&1; then
    fail "当前 SSH 用户不是 root，服务器也没有 sudo，请改用 root 登录或启用 sudo。"
  fi

  sudo -n "$@"
}

run_root_shell() {
  if [ "$(id -u)" -eq 0 ]; then
    bash -lc "$1"
    return
  fi

  if [ "$USE_SUDO" != "true" ]; then
    fail "当前 SSH 用户不是 root，且 server.useSudo=false，无法执行安装与 MySQL 初始化。"
  fi

  if ! command -v sudo >/dev/null 2>&1; then
    fail "当前 SSH 用户不是 root，服务器也没有 sudo，请改用 root 登录或启用 sudo。"
  fi

  sudo -n bash -lc "$1"
}

cleanup() {
  if [ "$CLEANUP_REMOTE_FILES" = "true" ] && [ -d "$REMOTE_WORKDIR" ]; then
    rm -rf "$REMOTE_WORKDIR"
  fi
}

trap cleanup EXIT

detect_package_manager() {
  if [ "$PACKAGE_MANAGER" != "auto" ]; then
    echo "$PACKAGE_MANAGER"
    return
  fi

  if command -v apt-get >/dev/null 2>&1; then
    echo "apt"
    return
  fi

  if command -v dnf >/dev/null 2>&1; then
    echo "dnf"
    return
  fi

  if command -v yum >/dev/null 2>&1; then
    echo "yum"
    return
  fi

  fail "未识别到 apt / dnf / yum，请在配置中手动指定 server.packageManager。"
}

install_mysql_server() {
  if [ "$INSTALL_SERVER" != "true" ]; then
    log "已跳过 MySQL 安装步骤。"
    return
  fi

  if command -v mysql >/dev/null 2>&1; then
    log "检测到 mysql 客户端已存在，跳过安装。"
    return
  fi

  local manager
  manager="$(detect_package_manager)"

  log "开始安装 MySQL/MariaDB，包管理器: $manager"

  case "$manager" in
    apt)
      run_root env DEBIAN_FRONTEND=noninteractive apt-get update -y
      if ! run_root env DEBIAN_FRONTEND=noninteractive apt-get install -y mysql-server mysql-client; then
        run_root env DEBIAN_FRONTEND=noninteractive apt-get install -y mariadb-server mariadb-client
      fi
      ;;
    dnf)
      if ! run_root dnf install -y mysql-server mysql; then
        run_root dnf install -y mariadb-server mariadb
      fi
      ;;
    yum)
      if ! run_root yum install -y mysql-server mysql; then
        run_root yum install -y mariadb-server mariadb
      fi
      ;;
    *)
      fail "不支持的包管理器: $manager"
      ;;
  esac
}

MYSQL_SERVICE_NAME=""

ensure_mysql_service() {
  local service_name
  for service_name in mysql mysqld mariadb; do
    if run_root systemctl enable --now "$service_name" >/dev/null 2>&1; then
      MYSQL_SERVICE_NAME="$service_name"
      log "MySQL 服务已启动: $service_name"
      return
    fi
  done

  for service_name in mysql mysqld mariadb; do
    if run_root service "$service_name" start >/dev/null 2>&1; then
      MYSQL_SERVICE_NAME="$service_name"
      log "MySQL 服务已启动: $service_name"
      return
    fi
  done

  log "未能自动识别服务名，请确认数据库服务已经启动。"
}

configure_bind_address() {
  if [ -z "$MYSQL_BIND_ADDRESS" ]; then
    return
  fi

  local updated="false"
  local conf_file
  for conf_file in \
    /etc/mysql/mysql.conf.d/mysqld.cnf \
    /etc/mysql/mariadb.conf.d/50-server.cnf \
    /etc/my.cnf \
    /etc/mysql/my.cnf; do
    if run_root test -f "$conf_file"; then
      if run_root grep -qE '^[[:space:]]*bind-address[[:space:]]*=' "$conf_file"; then
        run_root sed -i -E "s|^[[:space:]]*bind-address[[:space:]]*=.*|bind-address = $MYSQL_BIND_ADDRESS|g" "$conf_file"
      else
        run_root bash -lc "printf '\\n[mysqld]\\nbind-address = %s\\n' '$MYSQL_BIND_ADDRESS' >> '$conf_file'"
      fi
      updated="true"
      log "已设置 bind-address: $MYSQL_BIND_ADDRESS ($conf_file)"
      break
    fi
  done

  if [ "$updated" = "true" ] && [ -n "$MYSQL_SERVICE_NAME" ]; then
    if ! run_root systemctl restart "$MYSQL_SERVICE_NAME" >/dev/null 2>&1; then
      run_root service "$MYSQL_SERVICE_NAME" restart >/dev/null 2>&1 || true
    fi
    log "MySQL 服务已重启"
  fi
}

MYSQL_CMD=""

choose_mysql_root_command() {
  if run_root_shell "mysql --protocol=socket -uroot -e 'SELECT 1' >/dev/null 2>&1"; then
    MYSQL_CMD="mysql --protocol=socket -uroot"
    return
  fi

  if [ -n "$MYSQL_ROOT_PASSWORD" ]; then
    local mysql_pwd_escaped
    mysql_pwd_escaped="$(printf "%q" "$MYSQL_ROOT_PASSWORD")"
    if run_root_shell "MYSQL_PWD=$mysql_pwd_escaped mysql -uroot -e 'SELECT 1' >/dev/null 2>&1"; then
      MYSQL_CMD="MYSQL_PWD=$mysql_pwd_escaped mysql -uroot"
      return
    fi
  fi

  fail "无法以 root 身份连接 MySQL。请确认 root 可通过 socket 登录，或在配置里提供 mysql.rootPassword。"
}

run_sql_file() {
  local sql_file="$1"
  local sql_file_escaped

  if [ ! -f "$sql_file" ]; then
    fail "缺少 SQL 文件: $sql_file"
  fi

  sql_file_escaped="$(printf "%q" "$sql_file")"
  log "执行 SQL 文件: $(basename "$sql_file")"
  run_root_shell "$MYSQL_CMD < $sql_file_escaped"
}

main() {
  install_mysql_server
  ensure_mysql_service
  configure_bind_address
  choose_mysql_root_command
  run_sql_file "$REMOTE_WORKDIR/bootstrap.sql"
  run_sql_file "$REMOTE_WORKDIR/schema.sql"

  if [ -s "$REMOTE_WORKDIR/seed.sql" ]; then
    run_sql_file "$REMOTE_WORKDIR/seed.sql"
  fi

  log "远程 MySQL 初始化完成。"
}

main
`;
}
function connectSsh(config) {
    return new Promise((resolve, reject) => {
        const client = new Client();
        const sshConfig = {
            host: config.ssh.host,
            port: config.ssh.port,
            username: config.ssh.username,
            readyTimeout: config.ssh.readyTimeoutMs,
        };
        if (config.ssh.privateKey) {
            sshConfig.privateKey = config.ssh.privateKey;
            if (config.ssh.passphrase) {
                sshConfig.passphrase = config.ssh.passphrase;
            }
        }
        else if (config.ssh.password) {
            sshConfig.password = config.ssh.password;
        }
        client.once("ready", () => resolve(client));
        client.once("error", (error) => reject(error));
        client.connect(sshConfig);
    });
}
function execSsh(client, command) {
    return new Promise((resolve, reject) => {
        client.exec(command, (error, stream) => {
            if (error) {
                reject(error);
                return;
            }
            let stdout = "";
            let stderr = "";
            stream.on("close", (code) => {
                resolve({ stdout, stderr, code });
            });
            stream.on("data", (chunk) => {
                stdout += chunk.toString();
            });
            stream.stderr.on("data", (chunk) => {
                stderr += chunk.toString();
            });
        });
    });
}
function uploadFile(client, localPath, remotePath) {
    return new Promise((resolve, reject) => {
        client.sftp((error, sftp) => {
            if (error) {
                reject(error);
                return;
            }
            sftp.fastPut(localPath, remotePath, (putError) => {
                sftp.end();
                if (putError) {
                    reject(putError);
                    return;
                }
                resolve();
            });
        });
    });
}
function createTempFiles(config, schemaSql, seedSql) {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "wotty-mysql-init-"));
    const files = {
        tempDir,
        bootstrapSqlPath: path.join(tempDir, "bootstrap.sql"),
        schemaSqlPath: path.join(tempDir, "schema.sql"),
        seedSqlPath: path.join(tempDir, "seed.sql"),
        bootstrapScriptPath: path.join(tempDir, "bootstrap.sh"),
    };
    fs.writeFileSync(files.bootstrapSqlPath, createBootstrapSql(config), "utf8");
    fs.writeFileSync(files.schemaSqlPath, `USE ${mysql.escapeId(config.mysql.database)};\n${schemaSql.trim()}\n`, "utf8");
    fs.writeFileSync(files.seedSqlPath, seedSql, "utf8");
    fs.writeFileSync(files.bootstrapScriptPath, createRemoteBootstrapScript(config), { encoding: "utf8", mode: 0o755 });
    return files;
}
async function runRemoteBootstrap(config, files) {
    console.log(`连接 SSH: ${config.ssh.username}@${config.ssh.host}:${config.ssh.port}`);
    const client = await connectSsh(config);
    try {
        const mkdirResult = await execSsh(client, `mkdir -p ${shellQuote(config.server.workspaceDir)}`);
        if (mkdirResult.code !== 0) {
            throw new Error(`远程目录创建失败\n${mkdirResult.stderr || mkdirResult.stdout}`);
        }
        await uploadFile(client, files.bootstrapSqlPath, `${config.server.workspaceDir}/bootstrap.sql`);
        await uploadFile(client, files.schemaSqlPath, `${config.server.workspaceDir}/schema.sql`);
        await uploadFile(client, files.seedSqlPath, `${config.server.workspaceDir}/seed.sql`);
        await uploadFile(client, files.bootstrapScriptPath, `${config.server.workspaceDir}/bootstrap.sh`);
        const chmodResult = await execSsh(client, `chmod +x ${shellQuote(`${config.server.workspaceDir}/bootstrap.sh`)}`);
        if (chmodResult.code !== 0) {
            throw new Error(`远程脚本授权失败\n${chmodResult.stderr || chmodResult.stdout}`);
        }
        console.log("已上传远程初始化文件，开始执行...");
        const runResult = await execSsh(client, `bash ${shellQuote(`${config.server.workspaceDir}/bootstrap.sh`)}`);
        if (runResult.stdout.trim()) {
            process.stdout.write(runResult.stdout);
        }
        if (runResult.stderr.trim()) {
            process.stderr.write(runResult.stderr);
        }
        if (runResult.code !== 0) {
            throw new Error(`远程初始化失败，退出码: ${runResult.code}`);
        }
    }
    finally {
        client.end();
    }
}
function printConfigSummary(config) {
    console.log("配置摘要:");
    console.log(`- 配置文件: ${config.configPath}`);
    console.log(`- SSH: ${config.ssh.username}@${config.ssh.host}:${config.ssh.port}`);
    console.log(`- 远程目录: ${config.server.workspaceDir}`);
    console.log(`- 安装数据库服务: ${config.mysql.installServer ? "是" : "否"}`);
    console.log(`- MySQL bind-address: ${config.mysql.bindAddress}`);
    console.log(`- 数据库: ${config.mysql.database}`);
    console.log(`- 应用数据库账号: ${config.mysql.appUser}`);
    console.log(`- 授权主机: ${config.mysql.grantHosts.join(", ")}`);
    console.log(`- 初始化默认管理员: ${config.admin.createDefaultAdmin ? "是" : "否"}`);
    if (config.admin.createDefaultAdmin) {
        console.log(`- 默认管理员邮箱: ${config.admin.email}`);
    }
    console.log("");
}
function printFinalSummary(config) {
    const hostForDatabaseUrl = config.mysql.grantHosts.includes("%") || config.mysql.bindAddress === "0.0.0.0"
        ? config.ssh.host
        : "127.0.0.1";
    console.log("");
    console.log("建议写入 server/.env 的数据库连接串:");
    console.log(`DATABASE_URL="mysql://${config.mysql.appUser}:${config.mysql.appPassword}@${hostForDatabaseUrl}:${config.mysql.port}/${config.mysql.database}"`);
    if (config.admin.createDefaultAdmin) {
        console.log("");
        console.log("默认后台管理员:");
        console.log(`- 邮箱: ${config.admin.email}`);
        console.log(`- 密码: ${config.admin.password}`);
    }
}
async function main() {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
        printHelp();
        return;
    }
    const rawConfig = loadConfig(args.configPath);
    const config = validateConfig(rawConfig, args.configPath);
    printConfigSummary(config);
    const schemaSql = await generateSchemaSql();
    const adminPasswordHash = config.admin.createDefaultAdmin ? await argon2.hash(config.admin.password) : "";
    const seedSql = createSeedSql(config, adminPasswordHash);
    const tempFiles = createTempFiles(config, schemaSql, seedSql);
    try {
        if (args.dryRun) {
            console.log("Dry run 模式：已完成配置校验、Prisma SQL 生成和初始化脚本渲染，未连接服务器。");
            printFinalSummary(config);
            return;
        }
        await runRemoteBootstrap(config, tempFiles);
        printFinalSummary(config);
    }
    finally {
        fs.rmSync(tempFiles.tempDir, { recursive: true, force: true });
    }
}
main().catch((error) => {
    console.error("");
    console.error("远程 MySQL 初始化失败:");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
});
