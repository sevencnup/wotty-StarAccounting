# Wotty Star Accounting

## 项目介绍

Wotty Star Accounting 是一个面向个人的记账与财务管理项目，支持收入支出、预算、储蓄目标、资产、贷款、账单导入和消费分析。

项目由两个部分组成：

- `app`：Next.js Web 前端，也可通过 Capacitor 打包为 Android 应用。
- `api-server`：Ktor + MySQL 后端，为云端模式提供数据读写和同步接口。

前端支持两种数据模式：

- `LOCAL`：数据保存在浏览器 IndexedDB，不依赖后端和 MySQL，适合离线使用。
- `CLOUD`：数据通过 API 服务保存到 MySQL，适合多设备或长期部署。应用默认使用云端模式。

## 目录结构

```text
app/                    Web 前端和 Android 工程
api-server/             Ktor API 后端
docs/                   使用说明和开发文档
releases/               已归档的 APK 安装包
```

## 环境要求

- Node.js
- pnpm
- Java 17（启动 `api-server` 时需要）
- MySQL 8（仅使用 `CLOUD` 模式时需要）

依赖统一由仓库根目录的 pnpm workspace 管理。首次使用时在项目根目录执行：

```bash
pnpm install
```

不要在 `app` 或其他子目录单独执行 `npm install`、`pnpm install`。

## 本地开发

### 一键启动 Web 和 API

在项目根目录执行：

```bash
cp .env.example .env
# 修改 .env 中的本机 MySQL 连接信息
pnpm dev
```

启动后：

- Web 前端：`http://127.0.0.1:12366`
- API 后端：`http://127.0.0.1:12367`
- API 健康检查：`http://127.0.0.1:12367/api/health`

`app/scripts/dev.mjs` 会自动读取项目根目录 `.env`，同时启动前端和 API；退出命令时会一并停止两个服务。

### 只启动前端

```bash
pnpm --filter wotty-stark-web dev
```

只启动前端适合使用 `LOCAL` 模式开发；使用 `CLOUD` 模式时仍需启动 API 和 MySQL。

### 只启动 API

Linux/macOS：

```bash
sh app/android/gradlew -p api-server run
```

Windows：

```powershell
app\android\gradlew.bat -p api-server run
```

## 数据库配置

API 使用 MySQL，但应用不会自动安装 MySQL，也不会自动创建 `star_accounting` 数据库。首次部署前需要先创建数据库、用户和权限。

完整配置步骤请参阅：[数据库配置与部署说明](docs/database-config.md)。

配置完成后检查：

```bash
curl http://127.0.0.1:12367/api/health
```

返回以下内容表示 API 和数据库均已连通：

```json
{"status":"ok","db":true}
```

首次连接成功时，API 会自动创建缺失的业务表和字段，但不会创建 MySQL 数据库本身。

### Docker Compose 一键部署

项目根目录已提供 Compose 部署文件。首次部署时执行：

```bash
cp .env.example .env
# 编辑 .env，设置强密码
docker compose up -d --build
```

MySQL 容器会在空数据卷中自动创建数据库和应用账号，API 容器会在数据库健康后启动并自动创建业务表。Web、API 和数据库分别由 `12366`、`12367` 以及内部 MySQL 服务提供。

数据保存在 `mysql-data` 数据卷中。只有确认要清空全部数据时，才执行 `docker compose down -v`。

## 使用 Web 应用

1. 打开 `http://127.0.0.1:12366`。
2. 进入账户设置，确认数据模式和云端服务地址。
3. 使用 `CLOUD` 模式时，将服务地址设置为 API 地址，例如 `http://127.0.0.1:12367`。
4. 点击连接测试，确认健康检查通过后再录入数据。
5. 使用 `LOCAL` 模式时，数据仅保存在当前浏览器，清理浏览器站点数据可能导致本地数据丢失。

默认云端地址为当前访问主机的 `12367` 端口；如果前端和 API 不在同一台机器，请填写 API 所在机器的局域网 IP 或域名。

## 构建和检查

```bash
pnpm --filter wotty-stark-web typecheck
pnpm --filter wotty-stark-web test
pnpm --filter wotty-stark-web build
```

Android 调试与 Live Reload 说明请参阅：[Android Live Reload](docs/android-live-reload.md)。

## 常见问题

### 健康检查返回 `db:false`

检查 MySQL 是否运行、数据库是否已创建、账号是否有权限，并确认 `DATABASE_URL`、`DB_USER`、`DB_PASSWORD` 已注入 API 进程。数据库配置缺失时，API 仍会启动，但数据接口会返回 500。

### 前端无法连接 API

确认 API 监听 `12367`，浏览器能访问 `/api/health`，并在账户设置中填写正确的云端服务地址。手机访问时不能填写手机自己的 `localhost`，应填写运行 API 的电脑 IP。

### 想完全离线使用

在账户设置中切换到 `LOCAL` 模式。此模式不需要启动 API 或配置 MySQL，但数据不会自动同步到其他设备。

## 其他文档

- [数据库配置与部署说明](docs/database-config.md)
- [Android Live Reload](docs/android-live-reload.md)
- [版本记录](docs/version-history.md)
