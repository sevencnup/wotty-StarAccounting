# Web 开发服务器 Turbopack 启动修复开发文档

## 问题

Web 开发服务器日志出现 Turbopack panic，并提示 `Next.js package not found`；浏览器首页返回 200 但持续加载。

## 目标

恢复 `web` 的完整 pnpm 依赖链接，清理受损的 Next.js 开发缓存，并确认 Web 开发服务器可以稳定编译首页。由于 Next 16 在当前多 workspace lockfile 环境下的 Turbopack 模块解析仍会 panic，开发启动暂时固定使用 Webpack。

## 实施步骤

- [x] 确认 panic 日志与本地依赖解析状态。
- [x] 补齐仓库 pnpm workspace 声明并恢复 Web 依赖。
- [x] 清理本次故障产生的 Next.js 开发缓存。
- [x] 在真实仓库路径 `F:\1code\wotty-stark\web` 启动开发服务器并验证首页请求与重复编译情况。
- [x] 为开发启动增加 `--webpack`，绕过当前 Turbopack 的模块解析 panic。
- [x] 运行类型检查和生产构建。
- [x] 更新版本记录并完成本地 Git 提交。

## 验收标准

1. `next` 可以从 Web 项目的依赖树正常解析。
2. 开发服务器启动后首页返回成功，日志不再出现 `Next.js package not found` 或 Turbopack panic。
3. 类型检查与生产构建通过。
4. 调试启动的进程在验证结束后已关闭。

## 版本记录

### `0.0.1`

修复 Web 开发服务器依赖解析与 Turbopack 启动异常。

### `0.0.2`

修复开发模式 Turbopack 反复刷新问题，改用 Webpack 启动 Web 服务。
