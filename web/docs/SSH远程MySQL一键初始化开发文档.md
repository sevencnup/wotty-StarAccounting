# SSH 远程 MySQL 一键初始化开发文档

- 文档版本: `v1.0.0`
- 关联版本: `V2.3.135`
- 更新时间: `2026-04-10`

## 1. 需求背景

为了方便项目后续开源，需要提供一套可以直接交给他人使用的初始化脚本，满足以下目标：

1. 在本地填写服务器 SSH 用户名、密码、IP、端口
2. 一键连接远程 Linux 服务器
3. 自动安装 MySQL 或 MariaDB
4. 自动创建数据库、应用数据库账号与授权
5. 按当前 Prisma 结构自动建表
6. 自动创建默认后台管理员账号和默认账本

同时，这套方案不能把真实密码硬编码进仓库，必须适合开源场景。

## 2. 方案设计

本次实现拆成四部分：

1. `server/scripts/remote-mysql-bootstrap.ts`
   负责本地读取配置、生成 Prisma SQL、通过 SSH 上传文件并远程执行初始化
2. `scripts/mysql-remote-init.config.example.json`
   提供可提交到仓库的示例配置模板
3. `一键初始化MySQL数据库.bat`
   提供 Windows 下的双击入口
4. `server/package.json`
   新增 `npm run db:remote:init` 执行入口

## 3. 配置约定

### 3.1 默认配置文件

脚本默认读取：

`scripts/mysql-remote-init.config.json`

仓库中仅提交示例文件：

`scripts/mysql-remote-init.config.example.json`

并通过 `.gitignore` 忽略真实配置文件，避免 SSH/MySQL 密码被提交。

### 3.2 主要配置项

1. `ssh.host` / `ssh.port` / `ssh.username` / `ssh.password`
2. `server.useSudo`
3. `server.packageManager`
4. `mysql.installServer`
5. `mysql.bindAddress`
6. `mysql.database`
7. `mysql.appUser`
8. `mysql.appPassword`
9. `mysql.grantHosts`
10. `admin.email`
11. `admin.password`
12. `admin.accountName`

### 3.3 兼容说明

1. 支持 SSH 密码登录
2. 支持 SSH 私钥登录
3. 支持 `apt` / `dnf` / `yum`
4. 非 root 用户场景下，可通过 `server.useSudo=true` 配合免密 sudo 执行

## 4. 执行流程

脚本执行时会按顺序完成：

1. 读取并校验本地 JSON 配置
2. 基于 `server/prisma/schema.prisma` 动态生成当前数据库结构 SQL
3. 生成数据库账号授权 SQL
4. 生成默认管理员账号与默认账本初始化 SQL
5. 通过 SSH 上传 `bootstrap.sql`、`schema.sql`、`seed.sql` 和远程执行脚本
6. 在服务器上安装并启动 MySQL/MariaDB
7. 配置 `bind-address`
8. 执行建库、建表、授权和管理员初始化
9. 输出建议写入 `server/.env` 的 `DATABASE_URL`

## 5. 使用方式

### 5.1 命令行

```bash
npm --prefix server run db:remote:init
```

### 5.2 仅校验配置

```bash
npm --prefix server run db:remote:init -- --dry-run
```

### 5.3 Windows 双击入口

双击根目录：

`一键初始化MySQL数据库.bat`

## 6. 安全约束

1. 示例配置文件只放占位值，不放真实密码
2. 真实配置文件通过 `.gitignore` 忽略
3. 远程执行目录默认在 `/tmp/wotty-mysql-init`
4. 默认会在执行完成后清理远程临时文件，避免 SQL 和密码长时间留在服务器
5. 默认只授权 `localhost` 和 `127.0.0.1`，避免未明确要求时直接暴露数据库

## 7. 验收标准

1. 本地可通过示例配置执行 `--dry-run`
2. 脚本可根据 Prisma 当前模型自动生成最新建表 SQL
3. 可通过 SSH 一键安装和初始化远程数据库
4. 可自动生成数据库应用账号
5. 可自动生成默认后台管理员和默认账本
6. README、开发进度、CHANGELOG、历史版本记录同步完成
