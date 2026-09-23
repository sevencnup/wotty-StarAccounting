# Wotty Star Accounting

Wotty Star Accounting（星会计）是一个面向个人的记账与财务规划项目，支持收支记录、
预算、储蓄目标、资产、贷款、微信/支付宝账单导入、消费分析和账户对账。

项目由以下部分组成：

- `app`：Next.js 前端，同时作为 Capacitor Android App 的界面。
- `api-server`：Ktor API 服务，为云端模式提供认证、数据读写和 MySQL 持久化。
- `docs`：数据库部署、Android 调试和开发过程文档。
- `releases`：按版本归档的 APK 安装包。

## 数据模式

| 运行环境 | 本地模式 | 云端模式 |
| --- | --- | --- |
| Android App | 支持，数据保存在 App 的 IndexedDB | 支持，通过 API 保存到 MySQL |
| Web 浏览器 | 不支持 | 支持 |

Android 首次安装默认使用本地模式；Web 端固定使用云端模式。本地与云端是两个完全隔离的
数据源，切换模式不会自动迁移、合并或同步账单。

本地模式不需要 API、MySQL 或登录。云端模式适合多设备访问，但必须先部署 API 和数据库，
并在统一入口完成 API 检测与账户登录。

## 技术栈

- Next.js 16、React 19、TypeScript
- Capacitor 6、Android Gradle
- Kotlin、Ktor 3
- MySQL 8、Exposed、HikariCP
- pnpm workspace

## 环境要求

- Node.js 20.9 或更高版本
- pnpm
- Java 17（运行或构建 API）
- MySQL 8（仅云端模式需要）
- Android SDK（仅打包 Android App 需要）

所有 Node 依赖由根目录的 pnpm workspace 管理。请在仓库根目录执行安装，不要在 `app`
目录单独运行 `npm install` 或 `pnpm install`。

## 本地开发

### 1. 安装依赖

```bash
pnpm install
```

### 2. 配置云端服务

如果只调试 Android 本地模式，可以跳过数据库配置。开发云端模式时，复制环境变量模板：

```bash
cp .env.example .env
```

至少需要确认以下配置：

```text
DATABASE_URL=jdbc:mysql://127.0.0.1:3306/star_accounting
DB_USER=accounting
DB_PASSWORD=请替换为数据库密码
JWT_SECRET=请替换为至少 32 位的随机字符串
ACCOUNT_ADMIN_KEY=请替换为至少 12 位的管理员恢复密钥
```

`JWT_SECRET` 用于云端登录令牌；`ACCOUNT_ADMIN_KEY` 用于无邮件密码找回以及开启或关闭注册。
这两个值只能配置在 API 环境变量中，不能写入前端源码或提交到 Git。

### 3. 启动 Web 和 API

```bash
pnpm dev
```

启动地址：

- Web：`http://127.0.0.1:12366`
- API：`http://127.0.0.1:12367`
- 健康检查：`http://127.0.0.1:12367/api/health`

健康检查返回以下内容时，表示 API 和数据库均可用：

```json
{"status":"ok","db":true}
```

开发脚本会读取根目录 `.env` 并同时启动 Web 与 API；退出命令时会停止它启动的两个服务。

### 单独启动前端

```bash
pnpm --filter wotty-stark-web dev
```

浏览器版仍然需要云端 API。只有通过 Capacitor 运行的 Android App 才能在没有 API 时使用
本地模式。

### 单独启动 API

Linux/macOS：

```bash
sh app/android/gradlew -p api-server run
```

Windows：

```powershell
app\android\gradlew.bat -p api-server run
```

## 登录和 API 地址

根路径 `/` 是 Web 与 Android App 共用的统一入口：

- Web 会自动检测已保存的云端 API，然后显示登录界面。
- Android App 可在入口选择本地模式或云端模式。
- 切换到本地模式会立即取消云端检测并进入本地账本。
- 切换到云端模式会自动检测 API；已有有效登录状态时会直接进入并加载账单。

浏览器访问时，默认 API 地址是当前主机的 `12367` 端口。Android 安装包中的 `localhost`
指手机本身，因此应填写 API 服务器的局域网 IP、公网 IP 或域名，例如
`http://192.168.1.10:12367`。公网部署建议通过 HTTPS 反向代理开放 API。

## Docker Compose 部署

根目录提供 `docker-compose.yml`，可同时启动 MySQL、API 和 Web：

```bash
cp .env.example .env
# 编辑 .env，替换数据库密码、JWT_SECRET 和管理员恢复密钥
docker compose up -d --build
```

默认端口：

- Web：`12366`
- API：`12367`
- MySQL：仅在 Compose 内部网络使用

MySQL 数据保存在 `mysql-data` 数据卷中。普通停止或重启不会删除数据。

> `docker compose down -v` 会删除 MySQL 数据卷和全部云端账本。只有确认已经备份且确实要
> 清空数据库时才能执行。

## 检查与构建

```bash
pnpm typecheck
pnpm test
pnpm build
```

## Android 开发与打包

局域网 Live Reload：

```bash
pnpm --dir app dev:mobile
```

Windows 打包：

```powershell
pnpm --dir app apk
```

Linux 打包：

```bash
pnpm --dir app apk:linux
```

构建会生成 `app-debug.apk`，并在 `releases/` 中保存带版本号和时间戳的副本，不会覆盖旧包。
安装到已连接设备：

```bash
adb install -r releases/<安装包文件名>.apk
```

## 数据安全

- Android 本地模式的数据只存在当前 App 中；卸载 App、清除应用数据或设备损坏都可能导致丢失。
- 本地模式和云端模式不会自动互相同步，切换前请确认自己进入的是正确账本。
- 云端模式应定期备份 MySQL 数据库，并妥善保存 `JWT_SECRET` 和数据库凭据。
- 不要将真实 `.env`、密码、管理员恢复密钥或令牌提交到仓库。

## 相关文档

- [更新日志](CHANGELOG.md)
- [开发迭代记录](docs/version-history.md)
- [数据库配置与部署说明](docs/database-config.md)
- [Android Live Reload](docs/android-live-reload.md)
- [Android APK 构建记录](docs/android-apk-build-development.md)
