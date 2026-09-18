# 数据库配置与部署说明

版本：`0.0.1`

## 目标

说明 `api-server` 使用 MySQL 时的数据库准备、连接配置、首次启动行为和健康检查方式。

## 开发/部署步骤

1. 准备可访问的 MySQL 服务。
2. 创建业务数据库、连接用户并授予权限。
3. 通过环境变量或用户目录下的配置文件注入连接信息。
4. 启动 `api-server`，由应用自动创建缺失的业务表和字段。
5. 请求 `/api/health`，确认返回 `db: true`。

## 1. 准备 MySQL

应用不会安装 MySQL，也不会自动执行 `CREATE DATABASE`。首次部署前需要先创建数据库和用户：

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

### 方式一：环境变量

环境变量优先级最高，适合 Docker、Compose 和生产部署：

```text
DATABASE_URL=jdbc:mysql://127.0.0.1:3306/star_accounting
DB_USER=accounting
DB_PASSWORD=请替换为数据库密码
```

容器连接同一 Compose 网络中的 MySQL 时，将 `127.0.0.1` 改为 MySQL 服务名，例如：

```text
DATABASE_URL=jdbc:mysql://mysql:3306/star_accounting
```

不要把真实密码写入 Dockerfile、镜像或 Git 仓库，应通过部署环境变量、Compose 的 `.env` 文件或密钥管理服务注入。

### 方式二：用户目录配置文件

应用会读取运行后端的系统用户目录下的 `.wotty-stark/db.properties`：

- Linux：`~/.wotty-stark/db.properties`
- Windows：`%USERPROFILE%\\.wotty-stark\\db.properties`

文件内容：

```properties
DATABASE_URL=jdbc:mysql://127.0.0.1:3306/star_accounting
DB_USER=accounting
DB_PASSWORD=请替换为数据库密码
```

`DB_USER` 不填写时默认使用 `root`；`DATABASE_URL` 和 `DB_PASSWORD` 必须提供。

## 3. 首次启动行为

后端每次启动都会连接数据库并执行缺失结构检查：

- 不存在的业务表会自动创建；
- 已有表缺少的字段会尝试补齐；
- 不会自动创建 MySQL 数据库本身；
- 不会清空正常业务数据。

当前启动逻辑还会清理几个历史演示储蓄目标（`goal-travel`、`goal-emergency` 等）及其计划，这是代码中的兼容清理逻辑。

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

项目根目录提供了 `docker-compose.yml`、`Dockerfile.api` 和 `Dockerfile.web`，可以同时启动 MySQL、API 和 Web：

```bash
cp .env.example .env
# 编辑 .env，替换两个密码
docker compose up -d --build
```

Compose 的首次启动顺序如下：

1. MySQL 在空数据卷中创建 `MYSQL_DATABASE`、`DB_USER` 和 `DB_PASSWORD` 指定的数据库账号。
2. MySQL 健康检查通过后，API 容器才会启动。
3. API 连接 MySQL，并自动创建业务表和缺失字段。
4. Web 容器监听 `12366`，API 容器监听 `12367`。

访问地址：

- Web：`http://127.0.0.1:12366`
- API 健康检查：`http://127.0.0.1:12367/api/health`

MySQL 数据保存在 `mysql-data` 数据卷中。`MYSQL_DATABASE`、`MYSQL_USER` 和 `MYSQL_PASSWORD` 只会在该数据卷首次为空时初始化；普通重启不会删除数据或重新初始化账号。

如果确实要重置整个数据库，确认已备份后再执行：

```bash
docker compose down -v
docker compose up -d --build
```

`down -v` 会删除 Compose 管理的 MySQL 数据卷，请勿在保留数据时执行。
