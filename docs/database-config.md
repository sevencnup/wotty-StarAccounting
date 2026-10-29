# 数据库配置与部署说明

版本：`0.0.1`

## 目标

说明 `api-server` 使用 MySQL 时的数据库准备、连接配置、首次启动行为和健康检查方式。

## 开发/部署步骤

1. Docker Compose 首次部署直接执行 `docker compose up -d --build`，由附带的 MySQL 自动建库、创建账号，并保存自动生成的密钥。
2. 本地开发或使用外部 MySQL 时，先准备数据库与账号，再配置项目根目录 `.env` 或环境变量。
3. 启动 API，由应用自动创建缺失的业务表和字段。
4. 请求 `/api/health`，确认返回 `db: true`。

## 1. 准备 MySQL

API 服务本身不会安装 MySQL，也不会自动执行 `CREATE DATABASE`。Docker Compose 附带的 MySQL 会在空数据卷中建库。使用外部 MySQL 时，需要先创建数据库和用户：

```sql
CREATE DATABASE star_accounting
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'accounting'@'%' IDENTIFIED BY '请替换为强密码';
GRANT ALL PRIVILEGES ON star_accounting.* TO 'accounting'@'%';
FLUSH PRIVILEGES;
```

如果 MySQL 只允许本机连接，可以把用户主机部分改为 `'accounting'@'localhost'`，并相应使用本机地址连接。

## 2. 配置连接信息

### 方式一：本地开发使用项目根目录 `.env`

在项目根目录创建 `.env`（可从 `.env.example` 复制）：

```bash
cp .env.example .env
```

填写现有 MySQL 的连接信息：

```text
DATABASE_URL=jdbc:mysql://127.0.0.1:3306/star_accounting
DB_USER=accounting
DB_PASSWORD=请替换为数据库密码
JWT_SECRET=请替换为至少 32 位的随机字符串
ACCOUNT_ADMIN_KEY=请替换为至少 12 位的随机管理员恢复密钥
```

执行 `pnpm dev` 时，开发脚本会自动读取该文件并传给 API。已经存在的系统环境变量优先于 `.env`。

### 方式二：部署使用环境变量

外部数据库或非 Compose 部署可以提供环境变量：

```text
DATABASE_URL=jdbc:mysql://127.0.0.1:3306/star_accounting
DB_USER=accounting
DB_PASSWORD=请替换为数据库密码
JWT_SECRET=请替换为至少 32 位的随机字符串
ACCOUNT_ADMIN_KEY=请替换为至少 12 位的随机管理员恢复密钥
```

Docker Compose 新部署无需 `.env`，会自动创建数据库和密钥；如果要指定外部数据库或自定义密钥，可在首次启动前填写 `.env`。API 使用 host 网络，因此内置数据库连接地址为宿主机回环地址 `127.0.0.1:3307`，而不是 Compose 服务名。外部数据库连接串例如：

```text
DATABASE_URL=jdbc:mysql://<host>:3306/star_accounting
```

不要把真实密码写入 Dockerfile、镜像或 Git 仓库，应通过部署环境变量、Compose 的 `.env` 文件或密钥管理服务注入。

API 进程读取环境变量。Docker Compose 的启动脚本会先从持久化密钥卷读取密码和密钥，再传给 API 进程。执行 `pnpm dev` 时，项目根目录 `.env` 会由开发脚本自动加载；如果没有 `.env` 或对应环境变量，本地开发 API 的数据库状态会为 `db:false`。

`JWT_SECRET` 用于签发云端登录令牌。Compose 会自动生成 64 位随机十六进制字符串；非 Compose 部署应设置至少 32 位的随机字符串。部署后不要随意更换，否则已有登录状态会失效。

`ACCOUNT_ADMIN_KEY` 用于无邮件环境下的密码找回，以及已登录后开启或关闭新用户注册。Compose 会生成至少 12 位的随机值，保存在 API 密钥卷中，并注入 API 进程；不能填入 Web 页面配置、数据库或 Git 仓库。本地开发未配置时，普通登录和注册仍可用，但找回密码与注册开关会提示不可用。

连接池默认最多 10 个连接、启动时保持 1 个空闲连接（`DB_POOL_MAX_SIZE=10`、`DB_POOL_MIN_IDLE=1`）。用户量增加时可通过环境变量调大，但个人部署不需要修改。

## 3. 首次启动行为

后端每次启动都会连接数据库并执行缺失结构检查：

- 不存在的业务表会自动创建；
- 已有表缺少的字段会尝试补齐；
- 不会自动创建 MySQL 数据库本身；
- 不会清空正常业务数据。

当前启动逻辑还会清理几个历史演示储蓄目标（`goal-travel`、`goal-emergency` 等）及其计划，这是代码中的兼容清理逻辑。

### Go API 的迁移行为

Go API 同样使用 `DB_AUTO_MIGRATE`。未设置时默认开启，适合全新部署；设为
`false`、`0`、`no` 或 `off` 时只连接已有表结构，不执行结构检查。其迁移逻辑只会创建缺失
的表、列和索引，不会执行历史演示数据清理，也不会删除、重命名或覆盖已有业务数据。

当前 Compose 默认运行 Go API；本地 `pnpm dev` 使用 Ktor API。

## 4. 验证

服务默认监听 `12367`，启动后执行：

```bash
curl http://127.0.0.1:12367/api/health
```

数据库配置正确时应返回：

```json
{"status":"ok","db":true}
```

若返回 `db:false`，检查 MySQL 是否可访问、数据库是否已创建、账号权限、JDBC 地址以及密码，并查看后端启动日志。

## 5. Docker Compose 首次部署

项目根目录提供了 `docker-compose.yml`、`Dockerfile.api.go` 和 `Dockerfile.web`，可以同时启动 MySQL、Go API 和 Web。首次拉取后在根目录直接执行：

```bash
docker compose up -d --build
```

Compose 的首次启动顺序如下：

1. 一次性初始化容器生成 MySQL root 密码、应用账号密码、JWT 密钥和管理员恢复密钥，并保存到独立的 Docker 命名卷。
2. MySQL 在空数据卷中创建 `MYSQL_DATABASE` 指定的数据库，以及 `DB_USER` 应用账号。
3. MySQL 健康检查通过后，API 连接 MySQL 并自动创建业务表和缺失字段。
4. API 健康后，Web 容器监听 `12366`，API 容器监听 `12367`。

如需自行指定密钥或端口，请在**第一次启动前**复制 `.env.example` 为 `.env` 并填写。已保存的密钥不会因为后续修改 `.env` 而自动轮换。既有部署升级时，如果已有 MySQL 数据卷，但还没有密钥卷，必须提供原来的 `MYSQL_ROOT_PASSWORD` 和 `DB_PASSWORD`；初始化容器会将这两个值保存下来。缺失时会明确报错，避免为旧数据库生成无法登录的新密码。使用外部 MySQL 时，也要提供它的应用账号密码。

自动生成的密钥不会写入日志。只有在需要时才查看对应文件，例如：

```bash
# 管理员恢复密钥
docker compose exec api-runtime cat /run/secrets/api/account_admin_key
# 内置 MySQL 的 root 密码
docker compose exec mysql cat /run/secrets/mysql-root/password
# 应用数据库账号密码
docker compose exec api-runtime cat /run/secrets/db/password
```

`mysql-data`、`mysql-root-secret`、`db-secret`、`api-secret` 四个命名卷应一起备份和迁移。只丢失密钥卷而保留数据库卷时，不能凭空恢复原密码。

MySQL 宿主机端口默认是 `127.0.0.1:3307`，只供本机 API 连接，避免与宿主机常见的 `3306` 冲突，也不会直接暴露到公网。需要更换端口时设置 `MYSQL_HOST_PORT`。API 保持 host 网络模式，故该 Compose 部署面向 Linux Docker 主机。Web 默认只绑定 `127.0.0.1:12366`；需要局域网访问时，在 `.env` 中设置 `WEB_BIND_HOST=0.0.0.0`，或设置为指定网卡 IP，然后运行 `docker compose up -d --build`。局域网客户端使用同一主机的 `12367` 端口访问 API。

访问地址：

- Web：`http://127.0.0.1:12366`
- API 健康检查：`http://127.0.0.1:12367/api/health`
- 开启局域网访问后：`http://<服务器局域网 IP>:12366`

首次打开根入口会自动检测云端 API，再进行注册或登录；Android App 还可在登录页选择本地模式。不同账户只能看到自己拥有的账本。已登录后可在“设置 → 账户设置”修改密码，并用管理员恢复密钥控制是否允许新用户注册。

MySQL 数据保存在 `mysql-data` 数据卷中。`MYSQL_DATABASE`、`DB_USER` 和 `DB_PASSWORD` 只会在该数据卷首次为空时初始化；普通重启不会删除数据或重新初始化账号。若使用已有外部 MySQL，在 `.env` 中填写 `DATABASE_URL` 和 `DB_PASSWORD` 即可继续使用外部库；API 仍会等待 Compose 中 MySQL 健康后启动。对于外部 MySQL，数据库和账号仍需自行创建。

如果确实要重置整个数据库，确认已备份后再执行：

```bash
docker compose down -v
docker compose up -d --build
```

`down -v` 会同时删除 MySQL 数据卷与三个密钥卷，请勿在保留数据时执行。
