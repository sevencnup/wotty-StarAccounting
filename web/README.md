# openstars StarAccounting

## 仓库结构

- `web-vue/`: 当前默认运行的 Vue 3 + Vite 前端主线，包含完整页面框架、路由、主题、登录和 Android 原生目录。
- `web/`: 保留的旧 Next.js 前端参考工程，不再作为默认可见前端入口。
- `server/`: 当前唯一生效的后端服务、Prisma 和部署脚本。
- `docs/`: 开发、发布和迁移文档。

## 当前启动方式

在仓库根目录执行：

```bash
npm run dev
```

它会同时启动：

- 前端：`web-vue/`
- 后端：`server/`

常用命令：

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run typecheck
npm run test:e2e
```

Vue 并行主线常用命令：

```bash
npm run dev
npm run build
npm run start
npm run dev:vue
npm run build:vue
npm run start:vue
npm run dev:legacy
npm run build:legacy
npm run start:legacy
```

说明：

- 根目录默认 `dev/build/start` 已切到 `web-vue`
- 如果需要查看旧 Next 版本，请使用 `dev:legacy`、`build:legacy`、`start:legacy`

## 远程 MySQL 一键初始化

如果你要把项目部署到新的 Linux 服务器，可以直接使用仓库内置的 SSH 初始化脚本：

1. 复制 `scripts/mysql-remote-init.config.example.json`
2. 重命名为 `scripts/mysql-remote-init.config.json`
3. 填好服务器 SSH、MySQL 库名、数据库账号和默认管理员信息
4. 执行：

```bash
npm --prefix server run db:remote:init
```

Windows 也可以直接双击根目录：

`一键初始化MySQL数据库.bat`

如果只想先校验配置和生成 SQL，不实际连接服务器，可以执行：

```bash
npm --prefix server run db:remote:init -- --dry-run
```

## 开发约定

- 当前主线前端代码统一维护在 `web-vue/src/`。
- 旧 Next 参考代码维护在 `web/src/`。
- 后端代码统一维护在 `server/src/`。
- 当前前端开发默认以 `web-vue/` 为目标目录；`web/` 仅作旧实现参考。
- 仓库根目录已不再保留旧前端源码与旧前端构建配置。

## 收口结果

- 历史前端目录 `src/app`、`src/components`、`src/features`、`src/lib`、`src/themes`、`src/types` 已移除。
- 根目录旧前端配置 `components.json`、`next.config.ts`、`tsconfig.json`、`next-env.d.ts` 和 `public/` 已移除。
- CI、Playwright、Docker Compose、非 Docker 部署脚本和根目录 Dockerfile 已统一指向 `web/` 前端与 `server/` 后端。
- 目录收口过程与核对结果见 `docs/前端目录收口开发文档.md`。
