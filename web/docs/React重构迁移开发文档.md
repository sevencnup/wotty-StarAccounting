# React + Capacitor 重构迁移开发文档

## 0. 文档版本

- 大版本：`v1.0`
- 小版本：`v1.1.21`
- 本次更新：补强 Android 原生壳缓存治理，应用升级时自动清理旧 WebView / Service Worker 缓存，并把历史误存的 `3000` 原生后端地址迁移到 `3006`。

---

## 1. 当前结论

当前仓库只保留一条正式前端主线：

- Web 主线：`web/` 下的 `Next.js + React + TypeScript`
- App 方向：在 React 主线上继续通过 `Capacitor` 打包 Android
- 后端：继续复用 `server/` Express REST API 与 JWT 认证

以下内容已经不再保留：

- `flutter_app/`
- `web/src/app/flutter/`
- `web/src/components/flutter-preview/`
- `web/public/flutter-runtime/`
- `docs/flutter-migration-phase2.md`
- `docs/flutter-migration-handoff-window2.md`

---

## 2. 本轮目标

1. 保持 React 作为唯一前端开发入口，不再回退到 Flutter 或双轨维护。
2. 继续稳定登录、鉴权、路由、主题工作台和 Android 打包链路。
3. 让 Android APK 既能发布正式静态包，也能快速切到联调壳模式。
4. 在联调壳模式下，把前端热更新地址和后端 API 地址明确分开，避免页面能开但接口地址打错。
5. 每次重新生成 Android APK 前，同步 `web/android/app/build.gradle` 的 `versionCode` / `versionName`。

---

## 3. 当前目录边界

### 保留

- `web/`
- `server/`
- React / Capacitor 相关文档

### 删除

- Flutter 运行目录
- Flutter 预览路由与预览组件
- Flutter Web 运行时产物
- Flutter 迁移交接文档

---

## 4. 当前主流程

### 阶段 A：React 主线稳定

1. 继续收口登录、鉴权恢复、路由守卫和页面加载体验。
2. 继续完善 `assets / savings / loans / budgets / data / connections / ai / settings` 页面体验。
3. 统一 React 页面、主题系统和后端 API 的对接方式。

### 阶段 B：Android 双模式

1. 正式包模式：
说明：
- 走 `npm.cmd --prefix web run apk:debug` 或 `apk:release`
- 使用静态导出资源
- 用于交付和最终验收

2. 联调壳模式：
说明：
- 走 `web/scripts/run-android-dev-shell.ps1`
- App 壳加载电脑上的前端开发服务 `3000`
- APK 默认 API 指向电脑上的后端服务 `3006`
- 用于验证 WebView、状态栏、跳转、登录链路、返回键和原生壳差异

---

## 5. 联调壳原则

1. `CAP_SERVER_URL` 只负责前端页面加载地址，默认指向 `http://局域网IP:3000`。
2. `NEXT_PUBLIC_NATIVE_DEFAULT_API_BASE_URL` 只负责 APK 内默认 API 地址，默认指向 `http://局域网IP:3006`。
3. 手机浏览器访问局域网页面只能说明“网页正常”，不能替代 APK 壳内验证。
4. 发布前必须再用正式 APK 验收一次，联调壳不能替代最终交付包。

---

## 6. 验收标准

1. React 是唯一前端开发入口。
2. 根路径 `/` 直接复用登录页，主题总览固定走 `/:dashboardEntry`，登录与注册成功后默认进入当前主题总览。
3. 静态导出构建必须启用 `trailingSlash: true`，并具备 `build:export` / `cross-env` / `@capacitor/core` / `@capacitor/cli`、`web/src/lib/document-navigation.ts`、`[dashboardEntry]/generateStaticParams()` 与显式客户端 loading shell，才能稳定导出完整静态产物。
4. 侧边栏导航项、页面元信息与预热映射统一使用尾斜杠路径，生产环境优先走 `navigateDocument(href)`，并可通过 `navigation-debug.ts` 回放点击日志。
5. `npm.cmd --prefix web run typecheck` 通过。
6. 正式 APK 可构建、可安装、可登录。
7. 联调壳可一键生成，且能正确指向 `3000` 前端与 `3006` 后端。
8. 手机里联调壳刷新后能看到最新前端修改。
9. Android 原生壳升级后会自动清理旧 WebView / PWA 缓存，并把历史保存的本地 `3000` 地址迁移为 `3006`，避免新包继续命中旧页面或错误后端。

## 7. 当前状态

- Flutter 已从主线清理。
- React 是唯一前端开发入口。
- Android 继续沿用 `Capacitor` 推进。
- 正式 APK 与联调壳两条链路都已建立。
- Android 壳缓存治理链路已补齐，后续重打包默认不会再被旧 Service Worker / WebView 缓存劫持。
