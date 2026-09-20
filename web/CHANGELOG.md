## 2.5.18 - 2026-05-09

### Improved

- **继续收口 app 首页整体 UI 比例与留白**:
  - 更新 `app/src/views/HomeView.vue`，继续调整蓝色头部、余额卡、四个统计卡、消费卡和商户卡的圆角、尺寸、密度与留白关系。
  - 更新 `app/src/components/BottomNav.vue`，进一步收紧底部导航托盘的圆角、阴影、图标与标签节奏。

### Versioning

- **版本号同步更新**:
  - 根目录 `package.json` / `package-lock.json` 升级到 `2.5.18`。
  - `app/package.json` / `app/package-lock.json` 升级到 `1.0.3`。

### Verified

- `npm run build --prefix app` 构建通过

## 2.5.17 - 2026-05-09

### Fixed

- **修正 app 首页余额卡层级**:
  - 更新 `app/src/views/HomeView.vue`，将余额卡从蓝色 Hero 的普通内部排版改为独立叠层。
  - 余额卡现在会压在顶部蓝色区域上方，更贴近参考设计图中的上层卡片关系。

### Versioning

- **版本号同步更新**:
  - 根目录 `package.json` / `package-lock.json` 升级到 `2.5.17`。
  - `app/package.json` / `app/package-lock.json` 升级到 `1.0.2`。

### Verified

- `npm run build --prefix app` 构建通过

## 2.5.16 - 2026-05-08

### Changed

- **按参考图重做 app 端首页并移除页面内伪状态栏**:
  - 重做 pp/src/views/HomeView.vue，按参考图重新收口蓝色 Hero、余额卡、快捷统计卡、消费圆环卡和商户卡的结构比例。
  - 删除首页内容中的系统状态栏模拟元素，不再把时间、信号、电池等设备状态绘制为业务页面的一部分。
  - 重做 pp/src/components/BottomNav.vue，将底部导航改成更接近参考图的白色圆角托盘样式。

### Versioning

- **版本号同步更新**:
  - 根目录 package.json / package-lock.json 升级到 2.5.16。
  - pp/package.json / pp/package-lock.json 升级到 1.0.1。

### Verified

- 
pm run build --prefix app 构建通过
## 2.3.163 - 2026-04-15

### Changed

- **首页图表切换为 ECharts**:
  - 更新 `web-vue/src/views/DashboardHomeView.vue`
  - 将首页折线图、柱图和环图从手写 `svg` / CSS 图形切换为 ECharts 配置驱动
- **补齐 ECharts 依赖与容器样式**:
  - 更新 `web-vue/package.json`
  - 更新 `web-vue/package-lock.json`
  - 更新 `web-vue/src/style.css`

### Docs

- 更新 `docs/开发进度.md`
- 新增 `历史版本/2026-04-15-web-vue首页图表切换为echarts.md`

### Verified

- `npm --prefix web-vue run build`

## 2.3.162 - 2026-04-15

### Changed

- **首页按参考布局重排**:
  - 更新 `web-vue/src/views/DashboardHomeView.vue`
  - 将首页重排为两块主图、四张 KPI 卡、底部明细表和右侧信息堆栈结构
- **顶部工作台头部收口**:
  - 更新 `web-vue/src/components/shared/TopHeader.vue`
  - 新增搜索框、通知按钮、头像信息块和更贴近参考图的操作区布局
- **表格与样式基础层补齐**:
  - 更新 `web-vue/src/components/shared/DataTable.vue`，支持按列数自适应布局
  - 更新 `web-vue/src/style.css`，补齐首页布局、头部工作台和移动端响应式样式

### Docs

- 更新 `docs/开发进度.md`
- 新增 `历史版本/2026-04-15-web-vue首页按参考布局重排.md`

### Verified

- `npm --prefix web-vue run build`

## 2.3.161 - 2026-04-15

### Changed

- **首页已按旧默认主题接入图表模块**:
  - 更新 `web-vue/src/views/DashboardHomeView.vue`
  - 新增收支趋势、渠道结构、重点分类、资金健康和重点信号模块
- **总览数据层补齐图表聚合字段**:
  - 更新 `web-vue/src/features/dashboard/api.ts`
  - 更新 `web-vue/src/types/index.ts`
- **补充默认主题图表样式**:
  - 更新 `web-vue/src/style.css`

### Docs

- 更新 `docs/开发进度.md`
- 更新 `docs/Vue3并行重构开发文档.md`
- 新增 `历史版本/2026-04-15-web-vue默认主题总览图表落地.md`

### Verified

- `npm --prefix web-vue run build`

## 2.3.160 - 2026-04-15

### Added

- **新增中层公共组件**:
  - 新增 `web-vue/src/components/ui/AppConfirmDialog.vue`
  - 新增 `web-vue/src/components/shared/FilterToolbar.vue`
  - 新增 `web-vue/src/components/shared/ChartPanel.vue`
  - 新增 `web-vue/src/components/shared/DataTable.vue`
- **新增总览页数据层**:
  - 新增 `web-vue/src/features/dashboard/api.ts`
- **扩展总览页类型**:
  - 更新 `web-vue/src/types/index.ts`，补齐 DashboardSummary 类型

### Changed

- **首页已替换为真实业务总览**:
  - 更新 `web-vue/src/views/DashboardHomeView.vue`
  - 移除迁移说明占位内容，改为展示 KPI、预算提醒与最近流水
- **补充中层组件与首页样式**:
  - 更新 `web-vue/src/style.css`

### Docs

- 更新 `docs/开发进度.md`
- 更新 `docs/Vue3并行重构开发文档.md`
- 新增 `历史版本/2026-04-15-web-vue真实总览页与中层组件落地.md`

### Verified

- `npm --prefix web-vue run build`

## 2.3.159 - 2026-04-15

### Added

- **新增共享弹层与表单组件**:
  - 新增 `web-vue/src/components/ui/AppModal.vue`
  - 新增 `web-vue/src/components/ui/AppSelect.vue`
  - 新增 `web-vue/src/components/ui/AppTextarea.vue`
  - 新增 `web-vue/src/components/shared/FormField.vue`
- **新增 Vue 贷款页数据层与主题版**:
  - 新增 `web-vue/src/features/loans/api.ts`
  - 新增 `web-vue/src/features/loans/emptyData.ts`
  - 新增 `web-vue/src/views/LoansView.vue`
- **新增储蓄操作弹层能力**:
  - 新增 `web-vue/src/features/savings/month-utils.ts`
  - 新增 `SavingsGoalDialog.vue`
  - 新增 `SavingsPlanDialog.vue`
  - 新增 `SavingsWithdrawalDialog.vue`

### Changed

- **贷款页正式接入 Vue 路由主线**:
  - 更新 `web-vue/src/router/index.ts`
- **储蓄页接入新增/编辑/计划/取款能力**:
  - 更新 `web-vue/src/views/SavingsView.vue`
- **补充共享表单、贷款页与弹层样式**:
  - 更新 `web-vue/src/style.css`
- **扩展贷款与储蓄类型定义**:
  - 更新 `web-vue/src/types/index.ts`

### Docs

- 更新 `docs/开发进度.md`
- 更新 `docs/Vue3并行重构开发文档.md`
- 新增 `历史版本/2026-04-15-web-vue贷款页与储蓄弹层整包落地.md`

### Verified

- `npm --prefix web-vue run build`

## 2.3.158 - 2026-04-15

### Added

- **新增 Vue 储蓄页数据层**:
  - 新增 `web-vue/src/features/savings/api.ts`
- **扩展 Vue 储蓄页类型**:
  - 更新 `web-vue/src/types/index.ts`，补齐储蓄目标、计划配置与储蓄流水类型
- **新增 Vue 储蓄页主题版**:
  - 新增 `web-vue/src/views/SavingsView.vue`
  - 将 `/savings` 从占位页升级为真实业务页

### Changed

- **储蓄页正式接入 Vue 路由主线**:
  - 更新 `web-vue/src/router/index.ts`
- **补充储蓄页主题样式**:
  - 更新 `web-vue/src/style.css`

### Docs

- 更新 `docs/开发进度.md`
- 更新 `docs/Vue3并行重构开发文档.md`
- 新增 `历史版本/2026-04-15-web-vue储蓄页主题版落地.md`

### Verified

- `npm --prefix web-vue run build`

## 2.3.157 - 2026-04-15

### Added

- **新增 Vue 消费页数据层**:
  - 新增 `web-vue/src/features/consumption/api.ts`
  - 新增 `web-vue/src/features/consumption/emptyData.ts`
- **扩展 Vue 消费页类型**:
  - 更新 `web-vue/src/types/index.ts`，补齐消费页 summary、transactions、insights 等类型
- **新增 Vue 消费页主题版**:
  - 新增 `web-vue/src/views/ConsumptionView.vue`
  - 将 `/consumption` 从占位页升级为真实业务页

### Changed

- **消费页正式接入 Vue 路由主线**:
  - 更新 `web-vue/src/router/index.ts`
- **补充消费页主题样式**:
  - 更新 `web-vue/src/style.css`

### Docs

- 更新 `docs/开发进度.md`
- 更新 `docs/Vue3并行重构开发文档.md`
- 新增 `历史版本/2026-04-15-web-vue消费页主题版落地.md`

### Verified

- `npm --prefix web-vue run build`

## 2.3.156 - 2026-04-15

### Changed

- **默认前端入口切换到完整 Vue 主线**:
  - 根目录 `dev` 改为启动 `server + web-vue`
  - 根目录 `build` 改为构建 `web-vue`
  - 根目录 `start` 改为预览 `web-vue`
  - 新增 `dev:vue-main`、`build:legacy`、`start:legacy`
- **Vue 主线固定主端口入口**:
  - `web-vue/package.json` 新增 `dev:main`
  - `web-vue/package.json` 新增 `preview:main`
- **移除挂在旧 web 里的嵌套预览方案**:
  - 删除 `scripts/sync-vue-preview.mjs`
  - 删除 `web/src/app/vue-preview/page.tsx`
  - 删除 `web/public/vue-preview-app/`

### Docs

- 更新 `README.md`
- 更新 `docs/开发进度.md`
- 更新 `docs/Vue3并行重构开发文档.md`
- 新增 `历史版本/2026-04-15-web-vue切为默认完整前端入口.md`

### Verified

- `npm --prefix web-vue run build`
- `npm --prefix web-vue run dev -- --port 3301`

## 2.3.155 - 2026-04-15

### Added

- **新增独立 Vue 页面入口**:
  - 新增 `web/src/app/vue-preview/page.tsx`
  - 访问 `/vue-preview` 时将直接跳转到独立静态 Vue 页面 `/vue-preview-app/`
- **新增 Vue 页面同步脚本**:
  - 新增 `scripts/sync-vue-preview.mjs`
  - 支持将 `web-vue/dist` 自动同步到 `web/public/vue-preview-app/`
- **新增根目录命令**:
  - `build:vue:page`
  - `sync:vue-preview`

### Changed

- **补充文档与入口说明**:
  - 更新 `README.md`，补充独立 Vue 页面入口和构建命令说明
  - 更新 `docs/开发进度.md`
  - 新增 `历史版本/2026-04-15-web-独立Vue页面入口.md`

### Verified

- `npm run build:vue:page`

## 2.3.154 - 2026-04-15

### Added

- **新增 Vue 主线第一批 UI 基础组件**:
  - 新增 `web-vue/src/components/ui/AppButton.vue`
  - 新增 `web-vue/src/components/ui/AppInput.vue`
  - 新增 `web-vue/src/components/ui/AppCard.vue`
  - 新增 `web-vue/src/components/ui/AppProgress.vue`
- **新增 Vue 主线第一批 shared 公共组件**:
  - 新增 `PageContainer.vue`、`EmptyState.vue`、`SkeletonBlock.vue`
  - 新增 `StatsCardSkeleton.vue`、`ChartSkeleton.vue`、`CardListSkeleton.vue`、`ListTableSkeleton.vue`
  - 新增 `SidebarNav.vue`、`TopHeader.vue`、`MobileBottomNav.vue`
- **新增公共工具**:
  - 新增 `web-vue/src/lib/cn.ts`，用于 Vue 组件层类名组合

### Changed

- **重构 Vue 主线布局壳为组件化结构**:
  - 更新 `web-vue/src/components/layout/AppShell.vue`，改为组合式复用 `SidebarNav`、`TopHeader`、`MobileBottomNav`
- **重构现有页面复用公共组件**:
  - 更新 `LoginView.vue`、`RegisterView.vue`，改用 `AppInput`、`AppButton`
  - 更新 `AssetsView.vue`，改用 `PageContainer`、`AppCard`、`AppProgress`、`EmptyState`、骨架组件
  - 更新 `DashboardHomeView.vue`、`ThemeCenterView.vue`、`PagePlaceholderView.vue`，改用 `PageContainer`、`AppCard`
- **补充组件样式层**:
  - 更新 `web-vue/src/style.css`，补齐基础 UI、空态、骨架、表格骨架与页面容器样式

### Docs

- 更新 `docs/开发进度.md`
- 更新 `docs/Vue3并行重构开发文档.md`
- 新增 `历史版本/2026-04-15-web-vue首批公共组件层落地.md`

### Verified

- `npm --prefix web-vue run build`

## 2.3.153 - 2026-04-15

### Added

- **新增 Vue 主线 API 基础层**:
  - 新增 `web-vue/src/lib/runtime.ts`，补齐浏览器 / 原生壳 API Base URL 解析与作用域标识。
  - 新增 `web-vue/src/lib/api.ts`，统一封装超时控制、鉴权头、错误处理与 401 清会话逻辑。
  - 新增 `web-vue/src/types/index.ts`，补齐认证用户与资产模型定义。
- **新增 Vue 版真实资产页**:
  - 新增 `web-vue/src/views/AssetsView.vue`，把 `/assets` 从占位页升级为真实业务页。
  - 接入 `/api/assets`，展示资产总估值、流动资产、资产结构与明细列表。

### Changed

- **升级 Vue 主线鉴权流程**:
  - 更新 `web-vue/src/stores/auth.ts`，从本地假登录切换为真实 `/api/auth/login` 与 `/api/auth/me` 会话恢复。
  - 更新 `web-vue/src/router/index.ts` 与 `web-vue/src/views/LaunchView.vue`，为受保护路由增加登录恢复与失效跳转处理。
  - 更新 `web-vue/src/views/LoginView.vue` 与 `web-vue/src/views/RegisterView.vue`，补齐登录失败提示与注册跳转衔接。
- **补充资产页样式能力**:
  - 更新 `web-vue/src/style.css`，新增错误提示、下拉筛选、进度条和资产列表样式。

### Docs

- 更新 `docs/开发进度.md`，记录 Vue 主线第二阶段已接通真实登录和资产页。

### Verified

- `npm --prefix web-vue run build`

## 2.3.152 - 2026-04-14

### Added

- **新增 Vue 3 并行重构主线**:
  - 新建 `web-vue/`，接入 `Vue 3`、`Vite`、`Pinia`、`Vue Router` 与 `Capacitor` 依赖。
  - 新增 `web-vue/capacitor.config.ts`，预留 Android 壳的 `CAP_SERVER_URL` 注入能力。
  - 执行 `npx cap add android`，生成 `web-vue/android/` 原生工程目录。
- **复刻当前项目的 Vue 框架壳**:
  - 新增登录页、注册页、启动页、404 页与统一工作台布局。
  - 新增主题注册表、主题切换存储和 Dashboard 路径映射逻辑。
  - 新增总览页、主题页及资产/消费/储蓄/贷款/连接/数据/预算/设置/关于等业务占位页。
- **补充根目录并行命令**:
  - 更新根目录 `package.json`，新增 `dev:vue`、`build:vue`、`start:vue`、`build:vue:apk`。

### Docs

- **同步 Vue 并行重构文档与版本记录**:
  - 新增 `docs/Vue3并行重构开发文档.md`，明确并行迁移边界、阶段目标与运行方式。
  - 更新 `docs/开发进度.md`，记录 `V2.3.152` 的需求判断、首轮交付与验证情况。
  - 更新 `README.md`，补充 `web-vue/` 的定位与命令入口。
  - 新增 `历史版本/2026-04-14-新增Vue并行重构主线骨架.md` 归档本次并行重构起点。

### Verified

- `npm --prefix web-vue run build`
- `cd web-vue && npx cap add android`

## 2.3.151 - 2026-04-12

### Changed

- **补齐 Analytics 主题的业务页套系**:
  - 新增 `web/src/features/assets/components/themes/AnalyticsAssets.tsx`，将资产页重做为 Analytics 风格的资产总览、结构图、账户分布与清单布局。
  - 新增 `web/src/features/consumption/components/themes/AnalyticsConsumption.tsx`，将消费页重做为 Analytics 风格的总览、趋势、平台结构、商户排行与账单列表布局。
  - 新增 `web/src/features/savings/components/themes/AnalyticsSavings.tsx`，将储蓄页重做为 Analytics 风格的目标总览、状态结构、目标清单与流水布局。
  - 新增 `web/src/features/loans/components/themes/AnalyticsLoans.tsx`，将贷款页重做为 Analytics 风格的贷款总览、平台结构、偿还拆分与清单布局。
- **接入 Analytics 主题切换逻辑**:
  - 更新 `web/src/app/(dashboard)/assets/page.tsx`、`web/src/app/(dashboard)/consumption/page.tsx`、`web/src/app/(dashboard)/savings/page.tsx`、`web/src/app/(dashboard)/loans/page.tsx`，按当前主题在默认页与 Analytics 页之间动态切换。
- **统一收敛模块规范**:
  - 所有新增模块统一改为中文标题。
  - 避免多层边框套娃，改为单层圆角卡片与浅色块面。
  - 压缩移动端图表与信息卡高度，保持页面更紧凑。
  - 布局不复用 `DefaultDashboard.tsx` 的四卡工作台结构，改为更接近 Analytics 总览的分层工作台。

### Docs

- **同步 Analytics 主题页版本记录**:
  - 更新 `docs/开发进度.md`，记录 `V2.3.151` 的范围判断、交付内容与验证结果。
  - 新增 `历史版本/2026-04-12-补齐Analytics主题业务页.md` 归档本次主题扩展。

### Verified

- `npm run typecheck`
- `npm run build`

## 2.3.150 - 2026-04-11

### Fixed

- **修复 Android 壳内文档跳转仍拼成 `*.html`，导致登录页白屏**:
  - 更新 `web/src/lib/document-navigation.ts`，在原生壳 / 嵌入式静态运行时下改为优先跳转目录入口，例如 `/auth/login/`，不再错误拼成 `/auth/login.html`。
  - 修复登录、注册、鉴权守卫与壳内刷新场景下的文档级跳转继续命中不存在静态资源的问题，避免新包清完缓存后又卡在登录页白屏。
- **同步 Android 壳版本**:
  - 更新 `web/android/app/build.gradle`，将 Android `versionCode` / `versionName` 同步到 `23150` / `2.3.150`。

### Docs

- **同步 Android 登录页白屏热修版本记录**:
  - 更新 `docs/React重构迁移开发文档.md` 到 `v1.1.22`。
  - 更新 `docs/Android联调壳开发文档.md` 到 `v1.0.4`。
  - 更新 `docs/开发进度.md`，记录 `V2.3.150` 的问题定位、修复方案与构建验证结果。
  - 新增 `历史版本/2026-04-11-修复Android壳内文档跳转误拼html导致登录页白屏.md` 归档本次热修。

### Verified

- `npm.cmd --prefix web run build:export`
- `npm.cmd --prefix web run typecheck`

## 2.3.149 - 2026-04-11

### Fixed

- **修复 Android 新 APK 仍复用旧 PWA / WebView 缓存，导致继续命中旧页面与错误后端地址**:
  - 更新 `web/src/components/shared/PWARegister.tsx`，让原生壳与嵌入式静态运行时启动时都先清理已有 Service Worker / Cache，并仅做一次受控刷新，避免旧缓存继续接管新包。
  - 更新 `web/public/sw.js`，在 `http://localhost/` 无端口的原生壳作用域下跳过缓存安装、激活时主动清空缓存并注销旧 Service Worker，阻断历史 PWA 残留。
  - 更新 `web/android/app/src/main/java/com/wotty/star_accounting/MainActivity.java`，在应用升级后按版本号一次性清理 WebView 的 `Service Worker`、`Cache`、`Code Cache` 与 `GPUCache`，尽量不影响业务存储。
- **修复原生壳历史保存的本地 `3000` 地址继续被当成 API 地址**:
  - 更新 `web/src/lib/runtime-server.ts`，自动把旧存储里局域网 / 本地 `http://*:3000` 的原生服务器地址迁移为 `http://*:3006`，避免登录请求继续误打到前端端口。
- **同步 Android 壳版本**:
  - 更新 `web/android/app/build.gradle`，将 Android `versionCode` / `versionName` 同步到 `23149` / `2.3.149`。

### Docs

- **同步 Android 缓存热修版本记录**:
  - 更新 `docs/React重构迁移开发文档.md` 到 `v1.1.21`。
  - 更新 `docs/Android联调壳开发文档.md` 到 `v1.0.3`。
  - 更新 `docs/开发进度.md`，记录 `V2.3.149` 的问题定位、修复方案与构建验证结果。
  - 新增 `历史版本/2026-04-11-修复Android旧缓存导致新APK仍命中旧页面与错误后端.md` 归档本次热修。

### Verified

- `npm.cmd --prefix web run build:export`
- `npm.cmd --prefix web run typecheck`
- `powershell -ExecutionPolicy Bypass -File .\web\scripts\build-android-debug.ps1`

## 2.3.148 - 2026-04-11

### Fixed

- **修复 Android 调试 APK 默认后端地址未注入，导致登录请求回落到前端 `/api/auth/login`**:
  - 新增并纳入版本控制 `web/scripts/build-android-debug.ps1`，调试 APK 构建时默认写入 `NEXT_PUBLIC_NATIVE_DEFAULT_API_BASE_URL=http://当前电脑局域网IP:3006`；若手动设置了原生专用地址，则优先使用手动值。
  - 新增并纳入版本控制 `web/scripts/build-android-release.ps1`，正式 APK 构建时优先读取 `NEXT_PUBLIC_NATIVE_DEFAULT_API_BASE_URL`，未提供时自动继承 `NEXT_PUBLIC_API_BASE_URL`，避免原生包仍然掉回相对 `/api`。
  - 更新 `web/android/app/build.gradle`，将 Android `versionCode` / `versionName` 同步到 `23148` / `2.3.148`。

### Docs

- **同步 Android 打包链路版本记录**:
  - 更新 `docs/React重构迁移开发文档.md` 到 `v1.1.20`。
  - 更新 `docs/Android联调壳开发文档.md` 到 `v1.0.2`。
  - 更新 `docs/开发进度.md`，记录 `V2.3.148` 的处理与验证结果。
  - 新增 `历史版本/2026-04-11-修复调试APK默认后端未注入导致登录请求回落前端.md` 归档本次热修。

### Verified

- `powershell -ExecutionPolicy Bypass -File .\web\scripts\build-android-debug.ps1`
- `$tokens = $null; $errors = $null; [void][System.Management.Automation.Language.Parser]::ParseFile('F:\1code\wotty-StarAccounting\web\scripts\build-android-release.ps1', [ref]$tokens, [ref]$errors); if ($errors.Count) { throw ($errors | Out-String) }`

## 2.3.147 - 2026-04-11

### Fixed

- **修复导航预热模块缺失 `normalizeNavigationPath` 导出导致的 PC 端构建失败**:
  - 更新 `web/src/components/shared/navigation.ts`，补回 `normalizeNavigationPath` 导出，恢复 `web/src/components/shared/navigation-warmup.ts` 的静态导入。
  - 统一 `resolveNavigationHref`、`isNavigationItemActive` 与 `getPageMeta` 复用路径标准化逻辑，避免 `/assets`、`/consumption` 一类无尾斜杠路径与实际导航映射不一致。

### Docs

- **同步 React 热修版本记录**:
  - 更新 `docs/React重构迁移开发文档.md` 到 `v1.1.19`。
  - 更新 `docs/开发进度.md`，记录 `V2.3.147` 的问题定位、修复方案与验证结果。
  - 新增 `历史版本/2026-04-11-修复导航路径标准化导出缺失并恢复PC构建.md` 归档本次热修。

### Verified

- `npm.cmd --prefix web run build`
- `npm.cmd --prefix web run typecheck`

## 2.3.146 - 2026-04-11

### Fixed

- **修复 Android 联调壳自动识别单设备时把 adb 设备号截成首字母**:
  - 更新 `web/scripts/run-android-dev-shell.ps1`，把 `Get-ConnectedDeviceIds` 与 `Resolve-TargetDeviceId` 改为显式返回数组并强制转成字符串，避免单设备场景下 `b1695dee` 被误取成 `b`。
  - 更新联调壳安装与启动命令，统一改成参数数组调用，并在安装前打印真实 `deviceId`，减少 PowerShell 参数拆分带来的误判。
- **同步 Android 壳版本**:
  - 更新 `web/android/app/build.gradle`，将 Android `versionCode` / `versionName` 同步到 `23146` / `2.3.146`。

### Docs

- **补充联调壳热修文档记录**:
  - 更新 `docs/Android联调壳开发文档.md` 到 `v1.0.1`。
  - 更新 `docs/React重构迁移开发文档.md` 到 `v1.1.18`。
  - 更新 `docs/开发进度.md`，记录 `V2.3.146` 的修复与验证结果。
  - 新增 `历史版本/2026-04-11-修复Android联调壳单设备安装识别错误.md` 归档本次热修。

### Verified

- `powershell -ExecutionPolicy Bypass -File .\web\scripts\run-android-dev-shell.ps1`

## 2.3.145 - 2026-04-11

### Changed

- **新增 Android 联调壳一键启动脚本**:
  - 新增 `web/scripts/run-android-dev-shell.ps1`，自动识别局域网 IP，把 Capacitor 联调前端地址写成 `http://当前电脑IP:3000`，并把 APK 默认 API 地址写成 `http://当前电脑IP:3006`。
  - 脚本支持自动 `cap sync android`、构建 debug 壳、检测单台设备后直接 `adb install -r` 并启动 App，减少手动切换 `server.url`、前后端地址和安装命令的重复操作。
  - 构建产物会额外输出到 `web/dist-apk/wotty-android-dev-shell-2.3.145.apk`，便于和正式 APK 区分。
- **同步 Android 壳版本**:
  - 更新 `web/android/app/build.gradle`，将 Android `versionCode` / `versionName` 同步到 `23145` / `2.3.145`。

### Docs

- **补充联调壳使用文档与迁移记录**:
  - 新增 `docs/Android联调壳开发文档.md`，整理联调壳命令、参数、运行机制和常见问题。
  - 更新 `docs/React重构迁移开发文档.md` 到 `v1.1.17`。
  - 更新 `docs/开发进度.md`，记录 `V2.3.145` 的交付内容和验证结果。
  - 新增 `历史版本/2026-04-11-新增Android联调壳一键启动脚本.md` 归档本次处理。

### Verified

- `powershell -ExecutionPolicy Bypass -File .\web\scripts\run-android-dev-shell.ps1 -SkipInstall -SkipLaunch`

## 2.3.143 - 2026-04-11

### Fixed

- **修复静态导出侧边栏路由点击失效并补充导航日志**:
  - 更新 `web/src/components/shared/navigation.ts`，统一导航项、页面元信息与激活态判断使用尾斜杠路径，修复 `/assets`、`/consumption`、`/savings`、`/loans`、`/connections`、`/ai` 在静态导出目录下与真实入口 `/assets/` 等不一致导致的命中异常。
  - 更新 `web/src/components/shared/navigation-warmup.ts`，同步路由预热映射为尾斜杠路径，避免预热、命中和页面高亮继续使用旧路径。
  - 更新 `web/src/components/shared/Sidebar.tsx`，为侧边栏点击增加 `pointerdown`、`click-capture`、`touchstart`、`navigate` 等捕捉日志，并在主按钮点击时改用 `navigateDocument(href)` 执行文档级跳转，绕开静态导出场景下 Next 客户端导航偶发不生效的问题。
  - 更新 `web/src/components/shared/Header.tsx`，统一设置页与退出登录路径为尾斜杠形式，并按规范化路径执行“同页”判断，避免菜单跳转误判。
  - 新增 `web/src/components/shared/navigation-debug.ts`，把最近一次导航日志暂存到 `sessionStorage` 并在新页面回放，方便线上排查“点击没反应”。

### Docs

- **同步版本记录**:
  - 更新 `docs/React重构迁移开发文档.md` 到 `v1.1.15`，补充静态导出场景下侧边栏导航路径、文档级跳转与调试日志约束。
  - 更新 `docs/开发进度.md`，记录 `V2.3.143` 的问题定位、修复方案与构建验证结果。
  - 新增 `历史版本/2026-04-11-修复静态导出侧边栏路由点击失效并补充导航日志.md`，归档本次处理记录。

### Verified

- `npm.cmd --prefix web run typecheck`
- `npm.cmd --prefix web run build:export`
- 确认 `web/out/assets/index.html`、`web/out/consumption/index.html`、`web/out/savings/index.html`、`web/out/loans/index.html`、`web/out/connections/index.html` 与 `web/out/ai/index.html` 已生成

## 2.3.142 - 2026-04-11

### Fixed

- **补齐静态导出缺失依赖并恢复干净发布**:
  - 更新 `web/package.json` 与 `web/package-lock.json`，补充 `build:export` 脚本、`cross-env`、`@capacitor/core` 与 `@capacitor/cli`，让 GitHub 干净工作树也能独立执行静态导出构建。
  - 新增 `web/src/lib/document-navigation.ts`，补齐登录页、注册页、PWA 清理与系统栏同步所依赖的文档导航工具，避免干净构建时再次出现模块缺失。
  - 更新 `web/src/app/(dashboard)/[dashboardEntry]/page.tsx`，补充 `generateStaticParams()`，让 `DefaultDashboard` 等主题总览路由在 `output: export` 下可以生成真实静态页面。
  - 更新 `web/src/app/(dashboard)/data/DataLoadingShell.tsx` 与 `web/src/features/assets/components/themes/AssetsLoadingShell.tsx`，显式标记为客户端组件，修复静态导出预渲染阶段误把客户端主题样式函数当作服务端调用的问题。

### Docs

- **同步静态导出发布恢复记录**:
  - 更新 `docs/React重构迁移开发文档.md` 到 `v1.1.14`，补充干净工作树静态导出所需的依赖、动态参数与客户端骨架边界要求。
  - 更新 `docs/开发进度.md`，记录 `V2.3.142` 的缺失项定位、补齐方案与构建验证结果。
  - 新增 `历史版本/2026-04-11-补齐静态导出缺失依赖并恢复干净发布.md`，归档本次处理记录。

### Verified

- `npm.cmd install`
- `npm.cmd run typecheck`
- `npm.cmd run build:export`
- 确认 `web/out/DefaultDashboard/index.html`、`web/out/auth/login/index.html` 与 `web/out/data/index.html` 已生成

## 2.3.141 - 2026-04-11

### Fixed

- **修复静态导出主题路由尾斜杠命中目录 403**:
  - 更新 `web/next.config.ts`，在 `NEXT_EXPORT=1` 的静态导出构建下启用 `trailingSlash: true`，让 `DefaultDashboard`、`auth/login` 等页面在 `web/out/<route>/index.html` 生成真正的目录入口文件。
  - 修复部署到 Nginx 静态目录后，访问 `/DefaultDashboard/`、`/auth/login/` 这类尾斜杠路径时因目录存在但缺少 `index.html` 而返回 `403 Forbidden` 的问题。

### Docs

- **同步静态导出部署记录**:
  - 更新 `docs/React重构迁移开发文档.md` 到 `v1.1.13`，补充静态导出场景下尾斜杠目录入口要求。
  - 更新 `docs/开发进度.md`，记录 `V2.3.141` 的问题定位、修复方案与构建验证结果。
  - 新增 `历史版本/2026-04-11-修复静态导出主题路由尾斜杠403.md`，归档本次处理记录。

### Verified

- `npm.cmd --prefix web run build:export`
- 确认 `web/out/DefaultDashboard/index.html` 已生成

## 2.3.140 - 2026-04-11

### Changed

- **根路径改为公开登录入口并默认进入主题总览**:
  - 删除 `web/src/app/(dashboard)/page.tsx` 对 `/` 的占用，新增 `web/src/app/page.tsx` 直接复用登录页，让未登录访问域名根路径时不再跳转到 `/auth/login?next=%2F`。
  - 更新 `web/src/themes/dashboard-routes.ts`，将 `/` 从 dashboard 路径识别中移除，避免导航高亮和路由预热继续把公开根页识别成受保护总览。
  - 更新 `web/src/app/auth/login/page.tsx`，把登录成功后的默认落点改为当前主题的 dashboard 路由，并在已登录时自动回到对应主题总览。
  - 更新 `web/src/app/auth/register/page.tsx`，注册成功后直接进入当前主题总览，不再回跳到公开根页。

### Docs

- **同步 React 路由入口收口记录**:
  - 更新 `docs/React重构迁移开发文档.md` 到 `v1.1.12`，补充根路径公开入口与主题总览分流方案。
  - 更新 `docs/开发进度.md`，记录 `V2.3.140` 的需求判断、代码改动与构建验证结果。
  - 新增 `历史版本/2026-04-11-根路径改为公开登录入口并默认进入主题总览.md`，归档本次处理记录。

### Verified

- `npm.cmd --prefix web run build`

## 2.3.139 - 2026-04-11

### Fixed

- **修复发布脚本内嵌 Bash 变量与 JS 模板字符串冲突**:
  - 更新 `scripts/deploy.js`，转义远程 Bash 中的 `\${...}` 占位符，避免本地执行 `node scripts/deploy.js` 时被误当成 JavaScript 模板表达式解析。
  - 修复后 `deploy.js` 可正常通过 `node --check`，远程 Node 版本自动探测逻辑可以继续执行。

### Docs

- **同步版本记录**:
  - 更新 `docs/根目录一键打包发布脚本开发文档.md` 到 `v1.3.3`。
  - 更新 `docs/开发进度.md`，记录 `V2.3.139` 的脚本语法修复结果。
  - 新增 `历史版本/2026-04-11-修复发布脚本内嵌Bash变量与JS模板字符串冲突.md`，归档本次处理记录。

## 2.3.138 - 2026-04-11

### Fixed

- **修复 SSH 非交互环境误用旧版 Node 导致发布失败**:
  - 更新 `scripts/deploy.js`，远程部署时不再盲信 SSH 会话默认 `node`，会自动扫描 `PATH`、`/usr/local/bin`、`/usr/bin`、`/opt/node/bin`、`~/.nvm` 与宝塔 `/www/server/nodejs` 下的 Node 可执行文件。
  - 更新 `scripts/deploy.js`，优先选取满足 `Node >= 18.18` 的版本并重写当前远程会话 `PATH`，解决“手动登录是 Node 20，但脚本执行仍命中 Node 16” 的问题。
  - 更新 `scripts/deploy.js`，输出默认 PATH 命中的 Node 与最终选中的 Node / npm 版本，方便后续定位服务器环境差异。

### Docs

- **同步恢复说明与版本记录**:
  - 更新 `docs/根目录一键打包发布脚本开发文档.md` 到 `v1.3.2`，补充 SSH 非交互 shell 命中旧 Node 的问题说明。
  - 更新 `docs/服务器Node升级与发布恢复指引.md`，补充“手动登录 Node 版本正常但脚本仍显示旧版本”时的排查结论。
  - 更新 `docs/开发进度.md`，记录 `V2.3.138` 的脚本修复结果。
  - 新增 `历史版本/2026-04-11-修复SSH非交互环境误用旧版Node导致发布失败.md`，归档本次处理记录。

## 2.3.137 - 2026-04-11

### Docs

- **补充服务器升级 Node 与恢复发布指引**:
  - 新增 `docs/服务器Node升级与发布恢复指引.md`，整理 Debian/Ubuntu 与 CentOS/RHEL 两类环境下的 Node 20 升级命令、静态目录权限修复、PM2 重启与 Nginx 校验步骤。
  - 更新 `docs/根目录一键打包发布脚本开发文档.md` 到 `v1.3.1`，补充“服务器恢复操作”章节，说明本项目远程发布依赖 `Node >= 18.18`，推荐直接使用 Node 20 LTS。
  - 更新 `docs/开发进度.md`，记录 `V2.3.137` 的恢复步骤文档化结果。
  - 新增 `历史版本/2026-04-11-补充服务器Node升级与发布恢复指引.md`，归档本次处理记录。

## 2.3.136 - 2026-04-10

### Fixed

- **加固一键发布脚本的远程部署稳定性**:
  - 更新 `scripts/deploy.js`，远程部署脚本增加 `set -e`，避免服务器端 `npm install` 失败后仍继续重启 PM2 并误报“Deployment completed successfully”。
  - 更新 `scripts/deploy.js`，在远程安装依赖前显式检查 Node.js 版本，小于 `18.18` 时直接中止并输出明确错误，避免 Prisma 在 `Node 16.9.0` 环境下安装失败。
  - 更新 `scripts/deploy.js`，PM2 重启改为使用绝对路径 `/server/dist/main.js`，修复依赖安装失败后当前目录异常导致的 `cd: server: No such file or directory`。
  - 更新 `scripts/deploy.js`，上传完成后自动校验 `web/index.html` 是否存在，并统一修正静态目录权限为目录 `755`、文件 `644`，降低 Nginx 出现 `403 Forbidden` 的概率。

### Docs

- **同步发布脚本文档与版本记录**:
  - 更新 `docs/根目录一键打包发布脚本开发文档.md` 到 `v1.3.0`，补充远程发布失败即中断、Node 版本门槛和静态目录权限修正约束。
  - 更新 `docs/开发进度.md`，记录 `V2.3.136` 的问题定位、脚本修复点与服务器处理建议。
  - 新增 `历史版本/2026-04-10-修复一键发布脚本远程部署误报成功与403风险.md`，归档本次处理记录。

### Verified

- `node --check scripts/deploy.js`

## 2.3.135 - 2026-04-10

### Added

- **新增 SSH 远程 MySQL 一键初始化脚本**:
  - 新增 `server/scripts/remote-mysql-bootstrap.ts`，支持读取本地配置后通过 SSH 连接 Linux 服务器，自动安装 MySQL/MariaDB、创建数据库、生成表结构并初始化默认管理员。
  - 新增 `scripts/mysql-remote-init.config.example.json`，提供可开源提交的配置模板，并通过 `.gitignore` 忽略真实配置文件。
  - 新增根目录 `一键初始化MySQL数据库.bat`，方便 Windows 环境直接双击执行。
  - 更新 `server/package.json` 与 `server/package-lock.json`，新增 `npm run db:remote:init` 和 `ssh2` 依赖。
  - 更新 `README.md`，补充远程 MySQL 一键初始化的使用说明。

### Docs

- **同步专项开发文档与版本记录**:
  - 新增 `docs/SSH远程MySQL一键初始化开发文档.md`，文档版本 `v1.0.0`。
  - 更新 `docs/开发进度.md`，记录 `V2.3.135` 的需求判断、实现方案与验证结果。
  - 新增 `历史版本/2026-04-10-新增SSH远程MySQL一键初始化脚本.md`，归档本次改动。

### Verified

- `cd server && npm run db:remote:init -- --dry-run --config ..\\scripts\\mysql-remote-init.config.example.json`

## 2.3.132 - 2026-04-10

### Fixed

- **修复 Android APK 在未登录时跳转登录页陷入死循环白屏**:
  - 新增 `web/src/lib/document-navigation.ts`，为 Capacitor 内嵌静态运行时统一把硬导航路径转换成 `.html` 文档路径，避免 `https://localhost/auth/login` 被错误解析成根页面后再次触发登录守卫。
  - 更新 `web/src/components/shared/AuthGate.tsx`，未登录或鉴权失败时统一通过文档导航助手跳到登录页，并阻止登录页自身被拼成 `next=/auth/login`。
  - 更新 `web/src/app/auth/login/page.tsx`、`web/src/app/auth/register/page.tsx`、`web/src/components/shared/Header.tsx`、`web/src/app/(dashboard)/settings/page.tsx`，把 APK 内的硬跳转统一改成可识别的文档跳转。
  - 更新 `web/src/components/shared/PWARegister.tsx`，在 Capacitor 内嵌运行时跳过 Service Worker 注册，避免 APK 本地壳再被 PWA 逻辑干扰。
  - 更新 `web/android/app/build.gradle`，将 Android `versionCode` / `versionName` 同步到 `23132` / `2.3.132`。

### Docs

- **同步版本记录**:
  - 更新 `docs/React重构迁移开发文档.md` 到 `v1.1.9`，补充 Capacitor 静态导出环境下必须使用 `.html` 文档导航，且 APK 运行时禁用 PWA 注册。
  - 更新 `docs/开发进度.md`，记录 `V2.3.132` 的 Android 登录跳转死循环修复结果。
  - 新增 `历史版本/2026-04-10-修复Android登录跳转死循环白屏.md`，沉淀本次处理记录。

## 2.3.131 - 2026-04-10

### Fixed

- **移除登录守卫的整屏验证提示并改成后台校验**:
  - 更新 `web/src/components/shared/AuthGate.tsx`，不再显示“正在验证登录状态...”整屏提示；当本地已有 token 但用户信息仍在校验时，页面直接渲染，认证请求改为后台继续执行。
  - 未登录或 token 失效时仍会清理登录态并直接跳回登录页，避免保护路由被放开。
- **登录成功跳转改为原生地址跳转**:
  - 更新 `web/src/app/auth/login/page.tsx` 与 `web/src/app/auth/register/page.tsx`，登录/注册成功后不再使用 `router.replace`，改为 `window.location.href`，降低 Next.js 客户端路由在 Android 壳里卡住的概率。
  - 更新 `web/android/app/build.gradle`，将 Android `versionCode` / `versionName` 同步到 `23131` / `2.3.131`，用于区分本轮新 APK。

### Docs

- **同步版本记录**:
  - 更新 `docs/React重构迁移开发文档.md` 到 `v1.1.8`，补充 Android 壳里登录守卫不再使用整屏验证提示，且登录成功跳转统一走原生地址跳转。
  - 更新 `docs/开发进度.md`，记录 `V2.3.131` 的登录守卫收口结果。
  - 新增 `历史版本/2026-04-10-移除登录守卫验证状态并改用原生跳转.md`，沉淀本次处理记录。

## 2.3.130 - 2026-04-10

### Changed

- **统一 Android 调试 APK 版本号并重打局域网包**:
  - 更新 `web/android/app/build.gradle`，将 Android `versionCode` / `versionName` 提升到 `23130` / `2.3.130`，让安装包版本号与本轮版本记录保持一致，避免继续误装旧包。
  - 使用 `NEXT_PUBLIC_API_BASE_URL=http://192.168.31.112:3006` 重新执行 `npm.cmd run apk:debug`，生成新的局域网调试 APK。

### Docs

- **同步版本记录**:
  - 更新 `docs/React重构迁移开发文档.md` 到 `v1.1.7`，补充 Android 壳重打包时应同时校对 APK 版本号与版本文档编号。
  - 更新 `docs/开发进度.md`，记录 `V2.3.130` 的版本对齐与重打包结果。
  - 新增 `历史版本/2026-04-10-统一Android调试APK版本号并重打局域网包.md`，沉淀本次处理记录。

### Verified

- `cd web && $env:NEXT_PUBLIC_API_BASE_URL='http://192.168.31.112:3006'; npm.cmd run apk:debug`
- `rg -n "2.3.130|192.168.31.112:3006" web/android/app/src/main/assets/public`

## 2.3.129 - 2026-04-10

### Changed

- **同步 Android 壳版本并重打局域网调试 APK**:
  - 更新 `web/android/app/build.gradle`，将 Android `versionCode` / `versionName` 同步到 `23128` / `2.3.128`，避免新旧安装包难以区分。
  - 使用 `NEXT_PUBLIC_API_BASE_URL=http://192.168.31.112:3006` 重新执行 `npm.cmd run apk:debug`，确认 `web/android/app/src/main/assets/public` 中已写入最新 API 解析逻辑与局域网后端地址。

### Docs

- **同步版本记录**:
  - 更新 `docs/React重构迁移开发文档.md` 到 `v1.1.6`，补充 Android 壳重打包时的版本号与局域网后端地址校验要求。
  - 更新 `docs/开发进度.md`，记录 `V2.3.129` 的 APK 重打包结果。

### Verified

- `cd web && $env:NEXT_PUBLIC_API_BASE_URL='http://192.168.31.112:3006'; npm.cmd run apk:debug`
- 反查 `web/android/app/src/main/assets/public`，确认已包含 `http://192.168.31.112:3006`

## 2.3.128 - 2026-04-10

### Fixed

- **修复移动端通过局域网访问开发环境时登录请求误打到前端 3000 的问题**:
  - 更新 `web/src/lib/api.ts`，当开发环境构建变量仍为 `localhost:3006` 且页面是通过局域网 IP 打开时，客户端会把接口地址自动改写为 `当前访问 IP:3006`，不再错误请求同域 `3000` 上的 `/api/auth/login`。
  - 正式环境仍保持同域 `/api` 反向代理策略，不影响服务器域名部署。

### Docs

- **同步版本记录**:
  - 更新 `docs/React重构迁移开发文档.md` 到 `v1.1.5`，补充“开发环境局域网访问”与“正式环境域名访问”两种 API 解析分支。
  - 更新 `docs/开发进度.md`，记录 `V2.3.128` 本轮修复与验证结果。

### Verified

- `cd web && npm.cmd run build`

## 2.3.127 - 2026-04-10

### Fixed

- **修复正式环境移动端与手机浏览器的 API 地址误指向问题**:
  - 更新 `web/src/lib/api.ts`，当页面运行在非本地 hostname 且构建变量仍为 `localhost:3006` 时，客户端不再误拼成 `当前域名:3006`，而是改为优先走同域 `/api` 反向代理。
  - 无显式 `NEXT_PUBLIC_API_BASE_URL` 的线上浏览器场景同样优先走同域 `/api`；本地开发环境仍保持 `localhost:3006` / `127.0.0.1:3006` 联调方式不变。
  - API 超时与连接失败文案补充实际目标地址，便于区分“前端地址解析错误”和“服务器后端未启动/反向代理异常”。

### Docs

- **同步版本记录**:
  - 更新 `docs/React重构迁移开发文档.md` 到 `v1.1.4`，补充正式环境移动端 API 地址解析策略。
  - 更新 `docs/开发进度.md`，记录 `V2.3.127` 本轮修复与验证结果。

### Verified

- `cd web && npm.cmd run build`

## 2.3.126 - 2026-04-10

### Fixed

- **修复前端页面永久卡在“正在验证登录状态...”骨架屏的问题**:
  - 更新 `web/src/components/shared/AuthGate.tsx`，将 `router.replace` 替换为原生的 `window.location.href` 重定向，解决 Next.js 13+ App Router 某些场景下客户端路由静默失败的问题。

### Docs

- **同步版本记录**:
  - 更新 `docs/开发进度.md`，记录 `V2.3.126` 修复情况。
  - 在 `历史版本` 目录中新增 `2026-04-10-修复页面卡在验证登录状态问题.md`。

## 2.3.125 - 2026-04-10

### Fixed

- **修复开发环境残留 Service Worker 导致的旧页面卡住问题**:
  - 更新 `web/src/components/shared/PWARegister.tsx`，开发环境不再只是跳过 PWA 注册，而是会主动检查并卸载当前域名下残留的 Service Worker，同时清理对应 Cache Storage。
  - 当检测到旧 Service Worker 或缓存桶时，会使用 `sessionStorage` 标记仅触发一次自动刷新，避免本地调试反复命中陈旧 HTML、静态资源或旧版登录校验页。
  - 保留生产环境下的 PWA 注册与安装提示逻辑，不影响正式发布包的离线与安装能力。

### Docs

- **同步版本记录**:
  - 更新 `docs/React重构迁移开发文档.md` 到 `v1.1.3`，补充 React 主线在开发环境下的 Service Worker 清理策略。
  - 更新 `docs/开发进度.md`，记录 `V2.3.125` 本轮修复与验证结果。

### Verified

- `npm.cmd run typecheck`
- Playwright 模拟先注册旧 `sw.js` 与缓存桶，再刷新开发页，确认注册数与缓存桶数量都会被清零

## 2.3.124 - 2026-04-10

### Changed

- **消除 Next.js 开发环境的 127.0.0.1 跨域告警**:
  - 更新 `web/next.config.ts`，新增 `allowedDevOrigins: ["127.0.0.1"]`，允许本机在 `localhost` 与 `127.0.0.1` 两种入口之间切换时继续访问 `/_next/*` 开发资源，不再反复出现 cross origin warning。

### Docs

- **同步版本记录**:
  - 更新 `docs/React重构迁移开发文档.md` 到 `v1.1.2`，补充本机多入口开发时的 Next.js 开发域名允许策略。
  - 更新 `docs/开发进度.md`，记录 `V2.3.124` 本轮修复。

### Verified

- 本地类型定义确认 `allowedDevOrigins?: string[]` 已存在于当前 Next.js 16.1.6 安装版本。

## 2.3.123 - 2026-04-10

### Fixed

- **修复开发环境登录态校验卡住问题**:
  - 更新 `web/src/lib/api.ts`，当浏览器以局域网 IP 或其他非本机主机名访问前端时，不再盲目沿用 `.env.local` 中写死的 `localhost:3006`，而是自动回落到当前访问主机名，避免 `/api/auth/me` 请求打到错误设备。
  - 更新 `web/src/components/shared/AuthGate.tsx`，在用户缓存已存在或本地缺少 token 时同步收敛网关状态，避免页面停留在“正在验证登录状态...”。

### Docs

- **同步版本记录**:
  - 更新 `docs/React重构迁移开发文档.md` 到 `v1.1.1`，补充开发环境下的鉴权恢复与 API 地址解析策略。
  - 更新 `docs/开发进度.md`，记录 `V2.3.123` 本轮修复与验证结果。

### Verified

- `npm.cmd --prefix web run typecheck`
- Playwright 回归：伪造无效 token 时可正确从 `/` 跳转到 `/auth/login?next=%2F`
- `tsx` 模拟验证：局域网主机名场景会将 API 请求解析为 `http://当前主机名:3006`

## 2.3.119 - 2026-04-09

### Changed

- **删除 Flutter 主线与 Web 预览运行时**:
  - 删除 `flutter_app/`、`web/src/app/flutter/`、`web/src/components/flutter-preview/` 与 `web/public/flutter-runtime/`，仓库主线不再保留 Flutter 实验目录和 Web 预览入口。
  - 删除 `docs/flutter-migration-phase2.md` 与 `docs/flutter-migration-handoff-window2.md`，避免并行窗口继续沿用过期迁移计划。
  - 更新 `web/src/components/shared/navigation.ts`，移除 `/flutter` 相关页面元信息与导航引用。

### Docs

- **同步清理后的仓库边界与归档说明**:
  - 新增 `docs/Flutter清理归档开发文档.md`，记录本轮删除范围、执行结果与验收标准。
  - 更新 `docs/Expo原生App开发计划文档.md`，明确 Flutter 试验线已删除归档，不再作为现存目录或后续扩展方向。
  - 更新 `docs/主题开发框架文档.md` 到 `v2.1.31`，移除“后续迁移到 Flutter”的旧口径。
  - 更新 `docs/开发进度.md` 记录到 `V2.3.119`。

### Verified

- `npm.cmd --prefix web run typecheck`
## 2.3.118 - 2026-04-09

### Changed

- **鏂板 Expo 鍘熺敓 App 寮€鍙戣鍒掓枃妗?*:
  - 鏂板 `docs/Expo鍘熺敓App寮€鍙戣鍒掓枃妗?md`锛屾槑纭」鐩悗缁鏋滆鍋氱湡姝ｇ殑绉诲姩绔?App锛屼紭鍏堥噰鐢?`Expo + React Native` 鐙珛宸ョ▼锛岃€屼笉鏄户缁互 `Next.js` 濂楀３涓轰富绾挎柟妗堛€?  - 鏂囨。涓ˉ鍏呬簡鐩綍瑙勫垝銆侀樁娈垫媶鍒嗐€侀壌鏉冧笌鏁版嵁澶嶇敤杈圭晫銆佸浘琛ㄦ€ц兘绛栫暐鍜岀Щ鍔ㄧ閲岀▼纰戯紝渚夸簬鍚庣画鎸夐樁娈靛紑宸ャ€?
### Docs

- **鐗堟湰璁板綍鍚屾**:
  - 鏇存柊 `docs/React閲嶆瀯杩佺Щ寮€鍙戞枃妗?md` 灏忕増鏈埌 `v1.0.4`锛岃ˉ鍏?Expo 鍘熺敓 App 瑙勫垝鍏ュ彛璇存槑銆?  - 鏇存柊 `docs/寮€鍙戣繘搴?md` 褰撳墠鐩爣鍒?`V2.3.118`銆?
## 2.3.117 - 2026-04-09

### Changed

- **寮€鍙戠幆澧冭矾鐢辩紪璇戦鐑ˉ榻?*:
  - 鏇存柊 `web/src/components/shared/navigation-warmup.ts`锛屽湪 `next dev` 涓嬪杩涘叆棰勭儹闃熷垪鐨勭洰鏍囪矾鐢辫拷鍔犱竴娆″悗鍙?`fetch()`锛屾妸棣栧紑椤甸潰鏃剁殑璺敱缂栬瘧鎻愬墠鍒扮┖闂查樁娈碉紝闄嶄綆渚ц竟鏍忛娆＄偣鍑讳粛瑕佺瓑寰?1 鍒?2 绉掔殑闂銆?  - 娌跨敤鐜版湁鐨勮矾鐢便€佹暟鎹拰涓婚缁勪欢棰勭儹鍘婚噸閫昏緫锛屽苟鎶婄紪璇戦鐑檺鍒跺湪寮€鍙戠幆澧冿紝閬垮厤褰卞搷鐢熶骇鐜瀵艰埅閾捐矾銆?
### Docs

- **鐗堟湰璁板綍鍚屾**:
  - 鏇存柊 `docs/React閲嶆瀯杩佺Щ寮€鍙戞枃妗?md` 灏忕増鏈埌 `v1.0.3`銆?  - 鏇存柊 `docs/寮€鍙戣繘搴?md` 褰撳墠鐩爣鍒?`V2.3.117`銆?
## 2.3.116 - 2026-04-09

### Changed

- **渚ц竟鏍忎笌瀵艰埅鐐瑰嚮棰勭儹鎻愰€?*:
  - 鏂板 `web/src/components/shared/navigation-warmup.ts`锛岀粺涓€璺敱銆佹暟鎹拰涓婚缁勪欢鐨勯鐑叆鍙ｏ紝閬垮厤鐐瑰嚮鍚庢墠寮€濮嬫媺鍙栭〉闈?chunk銆?  - 璋冩暣 `web/src/components/shared/DashboardRouteWarmup.tsx`锛屾妸鍚庡彴棰勭儹鍚姩鏃堕棿浠庡亸鏅氱殑绌洪棽璋冨害鏀逛负鏇存棭鎵ц锛屽苟澶嶇敤缁熶竴棰勭儹閫昏緫銆?  - 鏇存柊 `web/src/components/shared/Sidebar.tsx` 涓?`web/src/components/shared/MobileBottomNav.tsx`锛屽湪 hover銆乫ocus銆乼ouchstart 鏃舵彁鍓嶉鐑洰鏍囬〉闈€?  - 鏇存柊 `web/src/components/shared/Header.tsx`锛屾悳绱㈣烦杞笌璁剧疆鍏ュ彛涔熶細鍏堝仛瀵艰埅棰勭儹锛屽噺灏戠偣寮€鍚庣殑绛夊緟鎰熴€?
### Docs

- **鐗堟湰璁板綍鍚屾**:
  - 鏇存柊 `docs/React閲嶆瀯杩佺Щ寮€鍙戞枃妗?md` 灏忕増鏈埌 `v1.0.2`銆?  - 鏇存柊 `docs/寮€鍙戣繘搴?md` 褰撳墠鐩爣鍒?`V2.3.116`銆?
## 2.3.115 - 2026-04-09

### Changed

- **绐楀彛浜屼笟鍔￠〉鏀跺彛绗竴杞畬鎴?*:
  - 淇 `web/src/app/(dashboard)/ai/page.tsx`銆乣settings/page.tsx`銆乣connections/page.tsx` 鐨勯灞忕┖鐧介棶棰橈紝鏀规垚杞婚噺鍗犱綅鍔犺浇鎬侊紝閬垮厤鍒犳帀鏁撮〉楠ㄦ灦鍚庣洿鎺ョ櫧灞忋€?  - 璋冩暣 `web/src/app/(dashboard)/budgets/page.tsx` 涓洪潪闃诲鍚屾鎻愮ず锛屽垪琛ㄥ埛鏂版椂涓嶅啀闈犳暣椤?skeleton 鎸′綇椤甸潰銆?  - 淇 `web/src/app/(dashboard)/consumption/page.tsx` 鍦?effect 涓悓姝?`setState` 鐨?lint 鍛婅锛屼繚鐣欏綋鍓嶅紓姝ュ姞杞介摼璺絾閬垮厤绾ц仈娓叉煋椋庨櫓銆?  - 鏀跺彛 `web/src/features/loans/components/themes/DefaultLoans.tsx` 涓?`web/src/features/savings/components/themes/DefaultSavings.tsx`锛屾妸 render 鍐呭０鏄庣粍浠舵敼涓洪《灞傜ǔ瀹氱粍浠讹紝骞惰ˉ鍥炶交閲忓姞杞藉崰浣嶃€?
### Docs

- **React 杩佺Щ涓庣増鏈褰曞悓姝?*:
  - 鏇存柊 `docs/React閲嶆瀯杩佺Щ寮€鍙戞枃妗?md` 灏忕増鏈埌 `v1.0.1`锛岃褰曠獥鍙ｄ簩椤甸潰灞備慨琛ヤ笌鍔犺浇浣撻獙鏀跺彛缁撴灉銆?  - 鏇存柊 `docs/寮€鍙戣繘搴?md` 褰撳墠鐩爣鍒?`V2.3.115`銆?
## 2.3.114 - 2026-04-09

### Changed

- **琛ュ厖 React 骞惰寮€鍙戝垎宸ユ枃妗?*:
  - 鏂板 docs/react-migration-handoff-window2.md锛屾槑纭綋鍓嶇獥鍙ｈ礋璐ｇ櫥褰曘€侀壌鏉冦€佽矾鐢卞拰鍔犺浇鎬ц兘锛屽彟涓€涓獥鍙ｈ礋璐ｄ笟鍔￠〉楠屾敹涓庨〉闈㈠眰淇ˉ銆?  - 缁嗗寲 React 涓荤嚎鐨勬枃浠跺啓鍏ヨ竟鐣岋紝閬垮厤涓や釜绐楀彛鍚屾椂淇敼 AuthGate銆?pi.ts銆乴ayout.tsx 绛夋牳蹇冩枃浠躲€?
### Docs

- **React 杩佺Щ鍗忎綔鏂囨。琛ラ綈**:
  - 涓哄苟琛屽紑鍙戝鍔犵獥鍙ｄ簩鎵ц椤哄簭銆佺姝㈤噸鍙犳枃浠舵竻鍗曚笌鎻愪氦鍓嶆鏌ョ害鏉熴€?## 2.3.113 - 2026-04-09

### Changed

- **閹垹顦?React 娑撹崵鍤庢潻浣盒╅崘宕囩摜閺傚洦銆傞獮鑸电閻?Flutter 娑擃厽鏌囧▓瀣殌**:
  - 閺傛澘顤?docs/React闁插秵鐎潻浣盒╁鈧崣鎴炴瀮濡?md閿涘本妲戠涵顔煎缁旑垯瀵岀痪鍨礀瑜?web/ Next.js + React 19閿涘苯鑻熸禒?Capacitor 娴ｆ粈璐熼崥搴ｇ敾 App 婢瑰啿鐪伴弬瑙勵攳閵?  - 閸氬本顒?docs/瀵偓閸欐垼绻樻惔?md閿涘矁顔囪ぐ?V2.3.113 瑜版挸澧犻惄顔界垼閵?  - 閹垹顦?lutter_app/lib/core/auth/auth_storage.dart閿涘本绔婚悶鍡曠瑐娑撯偓鏉烆喕鑵戦弬顓粣閻ｆ瑧娈戠拠顖氬灩閻樿埖鈧降鈧?
### Docs

- **React 闁插秵鐎潻浣盒╅弬瑙勵攳缁斿銆?*:
  - 閺傚洦銆傞悧鍫熸拱閸掓繂顫愰崠鏍﹁礋 1.0.0閿涘矁藟姒绘劘鍎楅弲顖樷偓浣瑰Η閺堫垰鍠呯粵鏍モ偓渚€妯佸▓浣冾吀閸掓帇鈧線顥撻梽鈺€绗屾灞炬暪閺嶅洤鍣妴?# Changelog

## 2.3.112 - 2026-04-09

### Changed

- **Flutter 濮掓稒顭堥濠氬嫉椤掆偓濠€鎾触椤栨艾袟闁衡偓闁稖绀嬮弶鈺傛煥濞叉牠鏌ч悙顒€澶嶉柨娑樺缁楀宕樺鍫濇闁告柣鍔嶆晶锕€顕ｉ埀顒€霉韫囨凹娼旈柛?*:
  - 闁哄洤鐡ㄩ弻?`flutter_app/Makefile`闁挎稑鑻惃銏☆渶濡鍚?`make dev` 闁告帒娲﹀畷鍙夌▔?`flutter run -d web-server`闁挎稑鑻懟鐔烘偘閵夈儱甯?`WEB_HOST`闁靛棔姊梂EB_PORT` 闁告瑥鍊归弳鐔兼晬鐏炶姤鍎欓柛鏂诲妼閹鎯勭€涙ê澶嶉弶鈺傛煥濞叉牜鎷嬮崸妤侊紪闂佸墽鍋撶敮鎾Υ?  - 闁哄倹婢橀·?`flutter_app/dev-web.ps1`闁挎稑鑻﹢?Windows PowerShell 濞戞挸顑囧ú鍧楀箳閵夈儲鍎欓柛?Flutter Web Server 妤犵偠鍩栨晶锕傚础閹峰矈鍟忛梻鍌ゅ枛濠€鎾锤閳ь剟濡?  - 闁哄倹婢橀·?`flutter_app/README.md`闁挎稑鏈Σ鎴犳兜椤曗偓缁垳鎷嬮妶鍛；闁告瑦鍨甸幊鈩冪閵堝嫮鐟㈤悹浣告健濡爼寮悷鎵闁挎稑鑻懟鐔哥┍濠靛牊娈?`make dev-chrome` 濞达絾绮堢拹鐔煎箥鐎ｎ亜袟闁瑰灚鎸哥槐鎴澝硅箛姘兼綌闁革絻鍔庡▓鎴﹀矗椤栫偐鍋撴径濠傚汲闁告瑱绲婚埀?
### Docs

- **Flutter 閺夆晙鑳朵簺闁哄倸娲﹂妴鍌炲触鐏炵虎鍔?*:
  - 闁哄洤鐡ㄩ弻?`docs/flutter-migration-phase2.md` 闁?`v1.0.3`闁?  - 闁哄洤鐡ㄩ弻?`docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md` 閻犱焦婢樼紞宥夊嫉椤掍緡鍋ч柡鍫墮濠€鏉戭嚕閳ь剟宕ｉ幋婵呯矗濞达絾绮嶇粊锔炬嫬閸愨晜娈婚柕?
## 2.3.111 - 2026-04-09

### Changed

- **Flutter 閺夆晙鑳朵簺闁衡偓鐠哄搫缍撻柨娑欎亢钘熼柛蹇嬪妺鐎靛本锛?婵炴垵鐗愰崹鍌毭规担瑙勫瘻+AI闁告帒妫欓悗?濡炪倗鏁诲浼村礉閵娧勬毎/闁哄瀚紓鎾绘嚇濮橆厽鎷?*:
  - 閻炴稏鍎遍崣?`flutter_app/lib/core/theme/app_theme.dart` 闁稿繈鍔戦崕?13 濞戞搩浜欑€靛本锛愬Ο鍏肩暠 `AppThemeTokens` 闁艰褰冮埀顒傘€嬬槐妾噓styBlue闁靛棔绠峣brant闁靛棔鎭環armingPurple闁靛棔绨歨iteGrid闁靛棔澶焢ruce闁靛棔杈渆rracotta闁靛棔鍏瑀ost 濞戞挸鍟╅柌婊勭▔婵犳凹鏆ù鐘查瀹曠増鎷呭鍛亾閸忓吋绂岄柟璇℃線鐠愮喖鎯囬悢椋庢澖濡増绮忔竟濠囨晬鐏炶棄妫橀柣?`web/src/themes/registry.ts` 濞戞搩鍘奸顔芥償?CSS 闁告瑦锕㈤崳鐑樻姜椤掍礁搴婇柨娑橆槶閳?
  - 闁圭鏅涢惈?`flutter_app/lib/features/consumption/data/consumption_provider.dart`闁挎稑鏈弻濠冩櫠?`TransactionQuery`闁靛棔姊梩ransactionListProvider`闁挎稑婀橢T `/api/transactions`闁挎稑鑻崹搴亜绾板绀嗗ù鐘劚瀵?`AiAnalysisResult`/`AiInsight`/`AiSuggestion` 缂?AI 闁告帒妫欓悗浠嬪极閻楀牆绁︽俊顖椻偓宕団偓鐑藉Υ?
  - 闂佹彃绉撮崯?`flutter_app/lib/features/consumption/presentation/pages/consumption_page.dart`闁挎稑鑻﹢顏堝炊閹规劑鈧啴寮介崶鈺婂姰濡炪倝娼х花鎶芥焾閵婏附鐓€濠?AI 闁告帒妫欓悗浠嬪础閿涘嫬顣婚柨娑樻綁_AiAnalysisCard`闁挎稒纰嶆晶锔锯偓娑欘殕濠р偓闁哄倸娲ら悺褔鏌呴幇顒傛憻婵炴挻鍔曢崵?20ms/閻庢稒銇滈埀顑跨劍缁€濠勨偓鐢靛枍缁楀本瀵煎Ο鍝勵嚙鐎点倝缂氶鍛存焻閹邦厽钂?150ms 婵炴挻鍔曢崣鍡涘Υ娴ｇ璁查柟鑸得ぐ鏃傛嫚閿旇棄鍓伴梻鍫涘灪濠㈡﹢鏁嶆径娑氱妤犵偠鍩栭弻濠冩櫠閻愮増鍞夐柡鍕尰缁侊箑顫濈€涙鍨肩紒娑㈢畺閵嗗鏁嶉崸鍒淭ransactionsTab`闁挎稒鑹鹃柦鈺呭矗閺夋寧绂堥柡宥呮储閳ь兛鑳剁€涒晝绱掗崸妤€娅ㄥΛ鐗堢箚婢瑰﹪濡存担椋庣憮闁瑰嘲顦崹搴亜绾板绀嗛柕?
  - 闁告娲ㄦ?`flutter_app/lib/core/router/app_router.dart`闁挎稑鑻惃銏ゅ箥閳ь剟寮垫径搴ｇ唴闁汇垹褰夌划?`builder:` 闁告帒娲﹀畷鍙夌▔?`pageBuilder:` + `CustomTransitionPage`闁挎稒鐭崡搴ｆ偘閵娧勭８閻犱警鍨抽弫鍗炃庨垾鍐插汲濞戞挸锕︿簺 220ms闁挎稑鐬煎▍銉ㄣ亹?婵炲鍔岄崬鐣屾崉椤栨粍鏆犳俊顖ｄ簼缁?280ms闁?
  - 闁哄洤鐡ㄩ弻?`flutter_app/web/manifest.json`闁挎稒鑹剧花鏌ユ偨閵娿儲鍊抽柡鈧柅娑滅闁靛棗顒玹arAccounting 闁哄懘缂氶崗妯兼嫻閿旇姤鎷遍柕鍡楃▌缁辨繃绋夋繝姘兼毌闁?`#168F9C`闁挎稑鏈弻鐔煎触閹寸偞鏆☉?`any`闁挎稑鐭佽棢闁稿繐鎳庣花鏌ユ偨閵婏箑浼庨弶鈺勫焽閳?
  - 闁哄洤鐡ㄩ弻?`flutter_app/web/index.html`闁挎稒鑹鹃幃鎾愁潰閵夛妇鍨煎Λ鐗埱滈埀顑跨劍瀵寧娼婚弶鎸庡 apple-mobile-web-app-title闁?
  - 濞ｅ浂鍠栭ˇ?`flutter_app/pubspec.yaml`闁挎稒姘ㄤ簺闂傚嫨鍊撶粭澶屸偓娑櫭﹢顏堟儍閸曨剚鎷遍柛锔芥緲閻⊙勬媴閹剧绱ｉ柡鍕嚱缁辨┈otoSansSC 闁?google_fonts 闁告柣鍔嶉埀顑跨婵偞娼弬銈囩闁告粌鐬奸埞鏍導閸曨剛鐖遍柣鈺婂枛缂嶅秵绔熼悧鍫燁潠闁挎稑鐭佽闁?`flutter run` 闁搞儳濮垫竟妯荤▔瀹ュ懎鐓傞悹褍瀚鍥棘閸ワ附顐介柤鏉胯嫰缁屽灝鈹冮崘顏呯暠闂傚偆鍣ｉ。浠嬪Υ?
  - 闁哄倹婢橀·?`flutter_app/Makefile`闁挎稒纰嶈ぐ浣圭瑹?`dev`闁靛棔姊梑uild-web`闁靛棔姊梑uild-apk`闁靛棔姊梑uild-aab`闁靛棔姊梑uild-ios`闁靛棔姊梘en`闁靛棔姊梚cons`闁靛棔姊條int`闁靛棔姊梩est`闁靛棔姊梒lean` 缂佹稑顦幓鈺呭箲瀹勭増鍤掑ù鐘€戦埀?
  - 闁?`flutter_app/pubspec.yaml` dev_dependencies 濞戞搩鍘介崸濠囧礉?`flutter_launcher_icons: ^0.14.3` 妤犵偛鐖奸崢銈囩磾椤旂⒈妯嬫鐐插暱瑜版挳宕堕悙顒傚灱闁汇垻鍠愰崹姘跺矗閸屾稒娈堕柨娑樻箯ndroid 闁煎浜埀顒€鍊哥花鏌ュ炊閻愵剛鍨奸柤鍐叉湰濞呮瑩鎳?`#168F9C`闁挎稑顦埀?

### Docs

- **閺夆晙鑳朵簺闁哄倸娲﹂妴鍌炲触鐏炵虎鍔?*:
  - 闁哄洤鐡ㄩ弻?`flutter_app/MIGRATION.md`闁挎稑鑻€ｂ偓闂侇偄顦靛Ο浣糕枔闂堟稑褰嬮柨娑樼墛缁夐鎷圭憴鍕偊婵ɑ娼欓崹顏嗘偘閵婏絺鍋撴稉鍑?闁告帒妫欓悗浠嬪础閿涘嫬顣婚柨娑橆槸閹蜂即姊奸懜娈垮斀闁告ぞ妞掔花鏌ユ晬閸粌鐦滃Λ鐗堫焾钘熼柛蹇嬪妸閳ь兛妞掗崬顒勬儘娴ｇ儤鏅搁柟瀛樺姂閳ь兛绶氶妴澶愭閵忕姴袟闁汇垺鐪归埀顑跨畼eb manifest闁靛棔鐒﹂悗顖氼嚈妤﹀灝澹栭柡鍫墾缁辨艾顔忛幓鎺旀殮闁瑰瓨鍔栧顖炴儎椤旇　鍋?

## 2.3.110 - 2026-04-09

### Changed

- **閻庣懓鏈崹?Flutter 濞存粌鏈﹢鈩冩交娴ｇ洅鈺呯嵁閼稿灚鏆柛?8 濞?feature**:
  - 閻庣懓鏈崹?`flutter_app/lib/features/assets/`闁靛棔姊梖lutter_app/lib/features/budgets/`闁靛棔姊梖lutter_app/lib/features/connections/`闁靛棔姊梖lutter_app/lib/features/settings/` 濞寸姰鍎卞?`flutter_app/lib/features/loans/`闁靛棔姊梖lutter_app/lib/features/savings/`闁靛棔姊梖lutter_app/lib/features/ai_config/`闁靛棔姊梖lutter_app/lib/features/data_import/` 闁汇劌瀚婊冾嚕韫囨稏鈧妫冮姀鐘垫澖闁绘粌搴滅槐婵嬪箥閳ь剟寮垫径搴ｈ缂佸宕靛ú浼村冀閸ヮ兙鈧妫冮～顓犵憹闁告劕绉存禒鐘绘偩濞嗗繑韬柛妤冨С缂嶅懐绮欑憗銈傚亾?
  - 闁哄洤鐡ㄩ弻?`flutter_app/lib/features/loans/presentation/pages/loans_page.dart`闁挎稑鐭佽棢濮掔粯鍔栭弳锝嗘媴閹惧湱绠锋繛鍡楀⒔楠炲棜銇愰姀鐘崇濞戞挸姘︾换鏇炩枎閹规劗绠婚幖杈鹃檮閻綊骞€閺勫浚鍤涢柡鍕昂閳?
  - 闁哄洤鐡ㄩ弻?`flutter_app/lib/features/data_import/presentation/pages/data_import_page.dart`闁挎稑鏈弫鍏肩▔閸濆嫷鍤ら柛?/ 濞存嚎鍊栧Σ妤呭礆濡ゅ嫨鈧?/ 闂佹寧鐟ㄩ銈夊籍閵夈儳绠跺☉鎾愁槹閻栵絿绮甸幆褌绱ｅù锝嗙矊瑜版挳鏁嶇仦鍊熷珯濞ｅ洦绻勯弳鈧悗鐢靛帶閸欏棝濡存担鐟邦杹闁告柣鍔岀紞宥夊礂閵夛絺鍋撴担鐟邦棗闂佹彃绻愰ˇ鈺呮偠閸℃瀚查梺鎸庣懆椤曘倖寰勯崟顓熷€為梺鐐礃閻箖濡?
  - 婵炴挸鎳愰幃?Flutter 濞撴皜鍥ㄩク闁诡兛绶氬Λ鑸碉紣濮楀牏绀夊ǎ鍥跺枟椤?Dropdown 閺夆晛娲﹀?API闁靛棔绀佺槐鎾愁潰?`BuildContext` 濞达綀娉曢弫銈夊Υ娴ｅ嘲鐦滃Λ?opacity 闁告劖鐟︾涵鑸电▔鎼淬垺鏆堥悷娆欑到閸ㄥ酣寮搁幇鏉垮赋缂傚喚鍣槐婵囨媴?Flutter 鐎规悶鍎抽埢濂告煂瀹ュ棙鐓€閺夊牊鍎抽崺?0 issue闁?

### Docs

- **閺夆晙鑳朵簺闁哄倸娲﹂妴鍌涚▔鎼达絽顣奸柡鍫墲椤斿洩銇愰弴鐐村€辨慨?*:
  - 闁哄洤鐡ㄩ弻?`flutter_app/MIGRATION.md`闁挎稑鑻幃鎾愁潰閵夛附鎷遍弶鐑嗗枛閸戯紕鈧懓鏈崹?feature 闁汇劌瀚缓鑲╃矓鐠囨彃鐟庨梺顐㈩槺婵悂骞€娴ｇ鍋?
  - 闁哄洤鐡ㄩ弻?`docs/flutter-migration-phase2.md` 闁?`v1.0.2`闁?
  - 闁哄洤鐡ㄩ弻?`docs/flutter-migration-handoff-window2.md`闁靛棔姊梔ocs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁挎稑鐭傛导鈺呭礂瀹ュ懓瀚欓悶娑樼灱閻涖儵宕ｉ敐澶婃濠㈣泛绉甸弻锕€顔忛妷锝傚亾?

### Verified

- `dart run build_runner build --delete-conflicting-outputs`
- `flutter analyze --no-pub`

## 2.3.109 - 2026-04-06

### Changed

- **闁衡偓鐠哄搫缍撳銈囨暬濞间即宕氶崶銊ュ簥濡澘瀚崕褰掓煣閹规劗鐔呴柨娑樿嫰閸ｈ櫣浜搁幋鐐达紜濡ょ姰鍔嶉悘锔界鐏炵虎鍋ч梻鍌や簻閸?*:
  - 闁哄洤鐡ㄩ弻?`web/src/themes/dashboard-registry.tsx`闁挎稑鏈繛濠囧礄閸濆嫬璁插璺虹Ф閺併倝鎯?Dashboard 濞戞挸顭烽。浠嬪礉閵婏腹鍋撴担绋款潱閺夌偠妫勫▍鎺楁晬鐏炲€熷珯闁哄倹婢橀·?`preloadDashboardThemeComponent()`闁挎稑鐭侀鈧憸鐗堟尭婢х姵绋夋繝姘兼毌闁汇劌瀚慨鈺呭箑?chunk 闁告瑯鍨禍鎺楀捶閵娾斂鈧妫冮姀鐘茬€奸柟骞垮灩婢х姷浜告潏顐ょ闁稿繈鍎崇槐锔锯偓娑櫱滈埀?
  - 闁哄洤鐡ㄩ弻?`web/src/components/shared/DashboardRouteWarmup.tsx`闁挎稑鏈俊鎼佸箑閺勫浚娼旈柕鍡曟祰缁侇偅绂嶈閳ь兛鐒︾粔椋庢嫻楠炲簱鍋撴担绋夸憾闁藉啫瀚ㄩ埀顑挎祰閹硅泛鈻庨崜褎鐣卞Λ鏉垮閸庤绂掓惔妯峰亾濠婂啫娑уΛ鏉垮閸庡湱鎹勯婊勬殸闁告粌鏈弳鐔煎箲椤斿厜鍋撳┑鍥р挅閻忕偞娲戠拹鐔煎灳濠婂棛鐔呴柣?+ warm-cache 闁轰胶澧楀畵?+ 闁告柣鍔嶉埀顑挎鐎靛本锛愬Ο鑲╃煁濞?chunk闁炽儲绻€缁斿鎸ч悜绛嬫殨闁绘埈鍙忕槐婵嬫⒔瀹ュ嫮绉甸柛鎺戞处瀹曟煡寮捄鍝勬櫃婵炲棴绱曞﹢鍛村礆閻楀牊锛嬪Δ鐘妽閻忥箓鎯冮崟顒夋搐闁绘粌娲㈤埀?
  - 闁哄洤鐡ㄩ弻?`web/src/app/(dashboard)/about/page.tsx`闁挎稑鑻ぐ鍥р槈?`pageLoading` 闁轰焦鎸抽妴澶愭⒓鐠囧樊鏁氬Δ鐘妽閻忥箓鏁嶅畝鈧ú鍧楀箳閵壯勬殢 fallback 闁告劕鎳庨鎰板箥閹稿骸澶嶅Λ锝嗙墪閻棝鏁嶇仦钘夋櫃闁革负鍔岄幃妤呭矗閺夊灝鐓曢柡鍌涘婢ф寮甸鈧濠氬矗閹绘帗瀚查柡鍥х摠閺屽﹥绌遍埄鍐х礀闁?

### Docs

- **闁告梻濮惧ù鍥煣閹规劗鐔呴悷娆忓閸垱绋夋惔锝咁暭闁哄牜鍓濋鍥亹閺囩偞鍊辨慨?*:
  - 闁哄洤鐡ㄩ弻?`docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md`闁挎稑鏈弻濠冩櫠閻愨斁鍋撳鍐ㄐ楅柟顑挎鐎靛本锛?chunk 濞戞梻鍠庣换鈧銈堝吹閹惧ジ宕楅妷銊х唴闁汇垽浜堕。鈺呮倻椤撱垺鎳犻悹渚灙閳ь剚绻傞幏浼村灳濠婂啫鍤掗柡?fallback 闁告劕鎳庨鎰版儍閸曨垬鈧妫冮～顓犵憹闁告劕绉撮崢鎴犳媼閸涘﹥娈诲銈囨暬椤庡洭寮搁崼鏇熲枎濠靛鍋愰埀顒佺箘濞堟垹鎲撮崟顐㈢仧闁?
  - 闁哄洤鐡ㄩ弻?`docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁挎稑鏈弻濠冩櫠?V2.3.109 閻犱焦婢樼紞宥夊Υ?
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.30`闁?

### Verified

- `npm.cmd --prefix web run lint -- "src/components/shared/DashboardRouteWarmup.tsx" "src/themes/dashboard-registry.tsx" "src/app/(dashboard)/about/page.tsx"`
- `npm.cmd run typecheck`
- `git diff --check -- "web/src/components/shared/DashboardRouteWarmup.tsx" "web/src/themes/dashboard-registry.tsx" "web/src/app/(dashboard)/about/page.tsx"`

## 2.3.108 - 2026-04-06

### Changed

- **闂傚牊鐟╃划顖涘緞閸曨厽鍊為梺鏉戠摠濞煎牏鈧懓鐗嗗畷濂告儍閸曨剚寮撻柣褑顕х紞宥夋煂瀹ュ懐鏆伴柛姘灥濞呮棃妫?*:
  - 闁哄洤鐡ㄩ弻?`web/src/components/shared/AuthGate.tsx`闁挎稑鏈繛濠囧礄閾忓湱鍩犲☉鎾亾闁汇劌瀚▍銉ㄣ亹閺囶潿鈧鎹勭€圭姵绁柛锔芥緲濞煎啴鎮介悢绋跨亣闂侇偅妲掔欢顐︽晬瀹€鍕級闁稿繐绉靛﹢顓㈡儌鐠囪尙绉块柛婊冪灱濞呫儴銇愰弴鐐杭闁轰礁鐗婂鍌炴煂瀹ュ拋妲婚柟宄板悑鐢?`next` 闁告瑥鍊归弳鐔煎Υ?
  - 闁哄倹婢橀·鍐嫉椤忓懎鎴块柡澶婂暣閺佸﹦鎷犻婵堟闁告帩鍋婇埀顒佹缁额偊鏁嶇仦鐣屾 `/api/auth/me` 閺夆晜鏌ㄥú鏍儍?`401` 闁告粌澶囬埀顒佺矎椤曨剟宕楅崼銏☆仮鐟滅増娲嶉埀顒佺箚椤绋夊ú顏嶆殨闁哄牏鍠栨竟宀勫级閸愩劌鐎婚柡鈧銈囩濞戞挸绉撮崯鈧弶鍫熸尭閸?`console.error`闁?
  - 闁谎嗩嚙缂嶅秵寰勬潏銊︽珡闁哄啯婀圭划娑欏濮橆厾顏搁柣鐐叉濠€浼村捶?token 妤犵偞鍎奸悜锔芥姜椤掑倹顏㈢憸鐗堟礋閵嗗鏁嶇仦鑲╃ɑ缂傚啯鍨圭划鍫曞极閸涘瓨顔囬柕鍡曟祰琚欓柡瀣姇缁辨挾鏁粙鎸庡闂傚牏鍋ら。鈺呭嫉閻斿憡绠涢柛鏃撶磿椤忣剙顕ｉ崒姘卞煑濞寸姴绉崇换姘舵偩濞嗘挻鏅╅悹鍥跺灡濡晞绠涘Δ瀣闂侇剙鐏濋崢銈夊箳閳哄啯纾伴柣顏嗗枎閻ゅ嫰姊婚鈧。浠嬪Υ?

### Docs

- **闁稿繐褰夐棅鈺呮煄鐎涙ɑ缍€閻庣懓鐗嗗畷鑲╂喆閸曨偄鐏熷☉鎾虫捣婢ф寮甸鍐惧敹鐟滅増娲栭幃鎾愁潰?*:
  - 闁哄洤鐡ㄩ弻?`docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md`闁挎稑鏈弻濠冩櫠閻愨斁鍋撳鍐ㄥ綑濞存粠鍋婃竟宀勫级閸愩劎鏆撻柛妤婂亰娴滐綁宕氶悧鍫熷紦闁谎嗩嚙缂嶅秹骞?`401` 闁哄啳娉涚花鏌ユ濞嗘挾甯涢梺鎻掔Т閻ｉ箖宕ラ幋顖滅濞戞挸绉垫俊鍝モ偓鐟板暙缂嶅骞嬮幇顓炰粯闁告帟娉涜ぐ鎾煥濞嗘帩鍤栭柍銉︾箘濞堟垹鎲撮崟顐㈢仧闁?
  - 闁哄洤鐡ㄩ弻?`docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁挎稑鏈弻濠冩櫠?V2.3.108 閻犱焦婢樼紞宥夊Υ?
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.29`闁?

### Verified

- `npm.cmd --prefix web run lint -- src/components/shared/AuthGate.tsx`
- `npm.cmd run typecheck`
- `git diff --check -- web/src/components/shared/AuthGate.tsx docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md CHANGELOG.md`

## 2.3.107 - 2026-04-06

### Changed

- **濡絾鐗曢惈鍡椢熼垾铏仴闁衡偓闁稖绀嬮柤濂変簷缁楀懘鎳撶仦鑲╃憪闁汇劌瀚ˉ鍡涘礆閸ャ劍鈻旈柣?*:
  - 闁哄洤鐡ㄩ弻?`web/src/components/shared/DelayedRender.tsx`闁挎稑鑻惃銏★純閺嵮呮綄婵☆垪鈧櫕鍋ラ柣?reveal 闁告柣鍔嶉弲銉︾鎼淬垺娈诲ù锝嗘尫缂嶅懐绮旂拠鎻掔€奸柟璇℃線鐠?`clip-path` 閻熶椒绀侀崹蹇涘及閸撗冪疀闁?
  - 婵☆垪鈧櫕鍋ュù鍏肩煯娴滄帡鍨惧鍡楁濞戞挸顑呯欢姘▔婵犲倻娼旂€殿喒鍋撻柍銉︾箘濞堟垿寮悷鎵闁告垼娅ｉ獮鍥晬鐏炶偐绋婚柡鍫氬亾缂備礁鐗呯紞鍛磾椤旇崵鐟濋柛娆愬灩閺佹捇宕戣箛鏇呪晠鏁嶇仦鑲╃憹闁告劕绉烽鈧柣顫妽閸╂盯骞囬悢铏瑰弨闁瑰瓨鍔欓妴澶愭閵忊剝娈诲ù锝嗘尫缁楀倻绮旂紒妯虹仐闁搞儳鍋涢懘濠囧Υ?
  - `lazy=true` 闁汇劌瀚紞鍡樺濡搫甯ョ紒鐙欏啫闅橀柛褎顨堥幋椋庣磼椤撶儐妲婚柣顫妼閹挻绋夐埀顒佺附?reveal 闁哄牆鎼崺妤呮晬鐏炶偐绠介柟闀愭祰缁诲啫銆掗敓鐙€妫戦柡宥夋？缁旀挳鎳涘ǎ顑藉亾?

### Docs

- **濡絾鐗曢惈?reveal 閻熸瑥瀚崹顖涚▔鎼达絽顣奸柡鍫墲椤斿洩銇愰弴鐐村€辨慨?*:
  - 闁哄洤鐡ㄩ弻?`docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md`闁挎稑鏈弻濠冩櫠閻愨斁鍋撳鍫禃閻忕偛绻戣啯闁秆勵殔椤┭囨閳ь剚绌卞┑鍫熸畬闁告梻濮惧ù鍥礉閵婏附娅忛柨娑樺缁鳖參宕楅崼婊冣枏闁活潿鍔嬬粭澶愬绩閻熸澘缍侀柡鍫氬亾缂備礁鐗呯紞鍛磾椤旂偓鐣遍悷浣风閸?reveal闁挎稑鐭侀埀顒€濂旂粭澶愬及椤栨稒娈诲ù锝嗘尫缂嶅懐绮旈悜鈹惧亾濠靛牊鐣遍悷娆忓閸垶濡?
  - 闁哄洤鐡ㄩ弻?`docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁挎稑鏈弻濠冩櫠?V2.3.107 閻犱焦婢樼紞宥夊Υ?
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.28`闁?

### Verified

- `npm.cmd --prefix web run lint -- src/components/shared/DelayedRender.tsx`
- `npm.cmd run typecheck`
- `git diff --check -- web/src/components/shared/DelayedRender.tsx docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md CHANGELOG.md`

## 2.3.106 - 2026-04-05

### Changed

- **闁告瑦鐗楃粔閿嬶純閺嵮呮綄闁轰胶绻濈紞瀣媴瀹ュ泦鈺呭礉閵娧勬毎闁挎稑濂旈幈銊ヮ潰閿濆洦鍩傞悗鍦仦鑶╅柛褎銇炵粭鍌滅矓缂佹ê濡?*:
  - 闁告劕绉甸濂稿即鐎涙ɑ鐓€ `web/src/components/shared/DelayedRender.tsx`闁挎稑鐬间簺闂傚嫨鍊濆顏堝箠閹烘垵顫ｉ弶鐐舵濠р偓闁哄拋鍨粭鍛存儍閸曨剚娈诲ù?`translateY` 濞达絽绉朵簺闁告粌鑻▎銏℃交?reveal闁?
  - 闂傚牏鍋為崳鍧楀礉閻樼儤绁板Λ锝嗙墪閻棝宕橀崨顓у晣闁衡偓闁稖绀嬮柣鈺佺摠鐢绮欓崘鑼毎婵炴挸寮堕悡瀣晬鐏炶偐鐟濋柛鎰Т閸ゎ參鎮抽幍鏂ュ亾濠婂懏鍩傞悗鍦仦鑶╅柛褎顨嗛弳锝嗘媴閹惧啿甯ュù锝呯凹缁旀挳鎮欓悷鏉挎櫃鐎垫壋鍋撳☉鎾筹工濞叉牕顕ｉ崗澶嗗亾濠靛牊鐣遍悷娆忔椤酣宕戣箛鏇呪晠濡?
  - `lazy=true` 闁汇劌瀚亸顖炲锤濡炲墽鐭濆ǎ鍥ㄧ箘閺嗏偓閺夌偛顭烽崳娲焻韫囨梹顫栭幖杈剧畳缁诲啫銆掗埥鍛濞达絽妫旂粭澶愬礃瀹ュ懎顨涢柛婵嗙Ч椤╄崵浠﹁箛搴＄槣婵☆垪鈧櫕鍋ラ柕?

### Docs

- **濡絾鐗曢惈鍡欑矙閸愯尙鏆版繛鎾冲级閻撳鎲撮崟顐㈢仧濞戞挸娴锋晶妤呭嫉椤掑喚鍞剁憸鐗堟礀閹挸顫?*:
  - 闁哄洤鐡ㄩ弻?`docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md`闁挎稑鏈弻濠冩櫠閻愨斁鍋撳鍫熷闁硅櫕甯掓慨鐐存姜娴犲娴曢悘鐐茬箰閸炲鈧綊鈧稓鐟濈€电増顨呴崯鈧柛瀣閺嗭綁宕稿鍓хТ缂佸绮崹銊ヮ嚈閹壆绠?reveal闁挎稒绋戝▎銏℃交閻旀瓕顩柡灞炬尭瑜把勭┍濠靛牊娈岀紓?`lazy=true` 闁汇劌瀚紞鍡樺濡搫甯ョ紒鐙欏啫闅橀柛褎銇涢埀顒佺箘濞堟垹鎲撮崟顐㈢仧闁?
  - 闁哄洤鐡ㄩ弻?`docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁挎稑鏈弻濠冩櫠?V2.3.106 閻犱焦婢樼紞宥夊Υ?
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.27`闁?

### Verified

- `npm.cmd --prefix web run lint -- src/components/shared/DelayedRender.tsx`
- `npm.cmd run typecheck`
- `git diff --check -- web/src/components/shared/DelayedRender.tsx docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md CHANGELOG.md`

## 2.3.105 - 2026-04-05

### Changed

- **濞ｅ浂鍠栭ˇ鍙夘殽閵婏妇浠搁柛鎺戞川濠€锛勨偓鍦仜閸炲鈧顫夊鍌炴儍閸曨剚娈婚悘鐐茬箳濞呇囨⒒?*:
  - 闁哄洤鐡ㄩ弻?`web/src/components/shared/DelayedRender.tsx`闁挎稑鑻惃銏ゆ閻愭潙娅╅柛鏃傚Ь濞村洭宕烽悜妯荤彲濞寸姴绨堕埀顒佺矊閸樻稒娼婚弬鎸庣 `null`闁挎稑鑻▎銏℃交閻旈攱鍊甸柛鎰У鐎垫洟鎯囬悢椋庢澖闁煎搫鍊婚崑锝夊灳濠靛洦鏆☉鎾广€€閳ь剚绮岄崢娑㈠箰閸屾粍鍩傞悗鍦仩婵☆參鎮欓惂鍝ョ闁告劕绉存禒娑欐姜婵犳艾娅ゅù锝呯Ф浜涢柛鏂诲妽閺呫儵鍨惧┑鍕ㄥ亾?
  - 缂佸顭峰▍搴㈩殽閵婏妇浠搁柛妤佺摃濞村洭宕ユ惔鈥崇厒闁活亞鍠庨悿鍕熼垾铏仴闁圭鍊藉ù鍥礈瀹ュ洦鐣辩紒宀冩閻涖儵鏁嶅畝鍕級闁稿繐绉归妴澶愭閵忕姵韬柛鏃傚Ь濞村洨鈧懓鏈崹姘舵儔椤掑嫭锛熼柛鎴ｆ楠炲洭寮弶鎴炲仴闁谎傜矙濡垶濡?
  - 濞ｅ洦绻勯弳鈧柟铏笒婵偞娼挊澶嬬皻闁哄拋鍨冲▓鎴犳喆閸℃缍撻弶鈺傜☉閸欏棝宕ユ惔銏犵槸閺夌偛鈧喎鍘撮柛鏃€鍐荤槐婵囨媴閸℃瑧鍩犲☉鎾亾閻犙呭濞插潡鐛搹顐ゆ嫧闁?reveal 闂侇偅妲掔欢顐︽晬鐏炶偐鐟濋柛鎰С缁堕鎸ч弽顓ф禃閻忕偛绻掗埞鏍儌閽樺绐楀ù锝呯Р閳?

### Docs

- **閺夆晛娲﹀ù顔笺€掗崣澶屽帬閻熸瑥瀚崹顖涚▔鎼达絽顣奸柡鍫墲椤斿洩銇愰弴鐐村€辨慨?*:
  - 闁哄洤鐡ㄩ弻?`docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md`闁挎稑鏈弻濠冩櫠閻愨斁鍋撳鍫偓鍥几鐠哄搫鐎奸柣顏嗗枎閻ゅ嫰宕橀崨顓у晣闁哄啯婀圭粭澶婎嚗濡ゅ啯娈屽☉?`null` 缂佸矁娅ｉ悰銉╂晬濞戞ɑ顐介弶鈺冨枑鐟曞棝寮婚幘鍐叉锭閻犳劗鍠曢惌妤佹姜婵犳艾娅ら柛蹇嬪劚濠р偓闁告柣鍔嶉弲銉╁灳濠靛牊鐣遍悷娆忓閸垶濡?
  - 闁哄洤鐡ㄩ弻?`docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁挎稑鏈弻濠冩櫠?V2.3.105 閻犱焦婢樼紞宥夊Υ?
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.26`闁?

### Verified

- `npm.cmd --prefix web run lint -- src/components/shared/DelayedRender.tsx`
- `npm.cmd run typecheck`
- `git diff --check -- web/src/components/shared/DelayedRender.tsx docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md CHANGELOG.md`

## 2.3.104 - 2026-04-05

### Changed

- **濮掓稒顭堥濠氬箑閺勫浚娼斿☉鎾愁煼椤ｈ姤顨ラ妸锔句桓缂備綀鍛暰閻庨潧缍婄紞鍫ユ儑閻旈鏉芥俊顖椻偓铏仴閻忓繐鎼?*:
  - 闁哄洤鐡ㄩ弻?`web/src/features/dashboard/components/themes/DashboardLoadingShell.tsx`闁挎稑鑻惃銏★純閺嶎剦鏀介柛銉︾☉缁卞爼宕￠垾鑼煠闂侇偅姘ㄩ弫銈咁啅閵夈倗绋婇柛娆庡嵆椤庡洭寮搁懜鍨毉闁瑰瓨鍔栧ú璺ㄦ嫻绾惧绠?`web/src/features/dashboard/components/themes/DefaultDashboard.tsx` 闁汇劌瀚粭鎾绘偨閵娾晜娈旈柛宥呯箰濞硷繝濡?
  - 濞戞挶鍊曠槐鑸殿殗濡懓鐦ㄩ柛妞斻伀澶嬵瀲閹邦喗鍩傞悗鍦仱閵嗗妫冮姀銏＄暠濠㈠爢鍕閻庢稒顨婇悵顔芥償閿旇　鍋撴笟鈧妴濠囨焾閵娿儲绂堥柡宥呮搐閺勫倻鈧數顭堥幏鐗堟償閺囥垹鍔ラ柣锝嗙懅濞呇囨晬濞戙埄鏆曠紒鐘愁殕婢х晫鎮扮仦钘夊耿閻炴稏鍎电紞鍫ュ础閺囩喐钂嬮弶鈺傜☉鐎规娊寮堕垾鑼憿鐎归潻绠戣ぐ鍛婄┍閳╁啩绱栭柨娑欑⊕缁夐鎷圭憴鍕瑩閻炴稑鑻畷閬嶅绩鐟欏嫬鐏囬柍銉︾矊閸ㄥ海鐚剧紒妯煎灱缂?+ 鐎甸偊鍠涚粔濂稿礉鐠恒劌娈?+ 闁告瑥鍘栭弲鍫曟煂閹达富鏉洪柍銉︾箑缁椾礁鈻撻棃娑氱濡ょ姰鍔嶉悘锕傚Υ?
  - 缂佹鍏涚粭浣烘偘瀹€鈧▓鎴﹀灳濠婂嫭鏆滈柛鎴犲劋閻庮垶骞嬮幇銊㈠亾濠靛棙瀚查柍銉︾矎缁诲酣寮甸悢鍛婃毆闁衡偓椤栨せ鍋撳┑鍥ㄦ毉闁瑰瓨鍔欓妴澶愭閵忋垽鐛撳☉鎾存尵閺併倖顨ラ妸锔句桓闁挎稑鑻顔筋瀲閹邦喗鍩傞悗鍦仱閵嗗妫冮姀銏＄暠鐎归潻绠戣ぐ鎼佸礆閸℃鍩夐柕鍡曟祰閵嗗啯寰勯弶鎴犳閹艰揪绠戦幏鎵偘瀹€鍕蒋闁煎搫鍊搁〃鏃堟晬鐏炶偐鐟濋柛鎰Ф濞插潡骞掗妷銉闂侇偅姘ㄩ弫?donut/table 闁告濮崇紞鍛村Υ?

### Docs

- **濡ょ姰鍔嶉悘锕傛⒐濠婂啫鍓奸悷娆忓閸垱绋夋惔锝咁暭闁哄牜鍓濋鍥亹閺囩偞鍊辨慨?*:
  - 闁哄洤鐡ㄩ弻?`docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md`闁挎稑鐭佽棢闁稿繐鎳夐埀顒佺矊閸欌剝绂嶉锔烩偓鍥几鐠哄搫鍤掗柟鎭掑劚閸欏棝宕ユ惔顖滅濠碘€冲€搁弰鍌溾偓鐢殿焾閹蜂即鎯囬悢椋庢澖婵☆垪鈧櫕鍋ュù鐘茬С缁楀绋夐埀顒勬嚊鏉堝墽绀夐柛蹇庢祰椤斿繑銇勯悽鍛婃〃缂?LoadingShell 濞ｅ洦绻勯弳鈧柡鍥ь嚟缁繒鍒掗幒鎴濐唺濞戞挻鎸鹃弫銈夋⒐濠婂啫鍓奸柛褎銇涢埀顒佺箘濞堟垹鐥敃鈧悾楣冨Υ?
  - 闁哄洤鐡ㄩ弻?`docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁挎稑鏈弻濠冩櫠?V2.3.104 閻犱焦婢樼紞宥夊Υ?
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.25`闁?

### Verified

- `npm.cmd --prefix web run lint -- src/features/dashboard/components/themes/DashboardLoadingShell.tsx`
- `git diff --check -- web/src/features/dashboard/components/themes/DashboardLoadingShell.tsx docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md CHANGELOG.md`
- `npm.cmd run typecheck`

## 2.3.103 - 2026-04-05

### Changed

- **婵炴垵鐗愰崹鍌涖亜閸偅鏆☉鎾广€€閳ь剚绮堢€靛本锛愬Ο鍦伇闁奸攱鐣埀顑挎缁楃喖宕濋埄鍐ㄧ瑩闁绘鐗忕€氼厾绮╃€Ｑ€鍋撳┑鎾剁濞戞挸绉撮崯鈧€殿喛娅ｇ划锔斤純閺嶎厹鈧绋夋径濠傚耿濡ょ姰鍔嶉悘?*:
  - 闁哄洤鐡ㄩ弻?`web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`闁挎稑鑻惃銏犫槈閸絽鐎銈囨暬閵嗗﹦浠﹂崒鐐叉缂備礁瀚拹鐔煎灳濠婂嫮啸閻犳劘顫夐埀顒佹椤秵绋夋惔銏′粯閺夆晜鍨剁粊锕€顫?/ 闁衡偓閼稿灚鏆滈柛娆惷€靛弶绋夋惔锟犳尙闁告瑦澹嗙划銊╁几?/ 闁告帒妫涚悮顐や沪閸屾粓鐛撳☉鎾抽叄濡礁鈻撻棃娑氬灮闁告瑧濮埀顒佺箑缁椾礁鈻撻棃娑氱闁挎稑濂旂换姘舵偩濞嗘挾甯涢悹浣靛€撶€靛本锛愬Ο鍏肩暠闁藉啯绻勭挒銏ゅ础閿涘嫬顣婚悹鍥跺弨閳诲牓濡存担鍛婂閻熸瑦甯囬埀顑跨窔濡叉崘銇愰崣妯肩憿闁告绱曟晶鏍偘閵娾晜妗ㄩ柨娑樺缁茬偓绋夊鍛櫃闁哄牏鍎ら～顐ｅ緞瀹ュ洦鏆?`DefaultDashboard` 闁汇劌瀚伴妴濠囨焾閵娿倗鐟忛柛妞诲墲鐢挸鈻旈弴妯峰亾?
  - 閻忓繐妫岄埀顒佺矎缁诲酣寮甸悢鍝ャ偊婵琛ラ埀顒佺箖瑜颁線宕￠崶锕佺濡絾鐗曢惈鍡涘矗閸忓懏娅犻柛蹇嬪劚瑜版盯鏁嶇仦鎯╅柍銉︾矋缁夐鎷圭涵鍛濆┑鍌氱箚閳ь剚绻€缁楀矂鏌屽鍥т化闁告帒妫涚悮顐㈩嚗椤旇法歇闁告柨鐏濋幃搴ㄧ嵁閹壆绠婚柟顒佹椤秹宕犻悮瀵哥闁硅泛艌閳ь剚绮岄崹搴ｇ尵鐠囪尙鍨婚柛娆戝Ь缁夊ジ宕濇惔鎾亾濠靛棗顤呯紓鍐惧枛閸╁瞼绱掗幘瀵糕偓顖氣枔绾板绀夐柡浣虹節缂嶅绌遍埄鍐х礀閻忕偛鍊绘鍥即绾惧鍨遍弶鈺傚灦缁夐鎷归悷鏉跨€婚柡瀣姇濠р偓闁哄拋鍨埀?

### Docs

- **閻炴稏鍎遍崢鏍ㄧ▔婵犳凹鏆☉鎾亾闁煎嘲鐡ㄩ埀顑倻鐟㈠Δ鐘妽閻忥附寰勫鍥ㄦ殢閺夊牆婀遍弲顐︾嵁鐠虹儤鍊辨慨婵勫劤婢ф寮甸鍐惧敹鐟?*:
  - 闁哄洤鐡ㄩ弻?`docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md`闁挎稑鏈Σ鎴犳兜椤斿厜鍋撳鈧€靛本锛愬Ο鍦伇闁煎嘲鐡ㄩ埀顑偓閳ь剚绻堢划顖滄媼閵堝棗鐦归柛妤嬬磿婢ф牜鎷犻鈾€鏋呴柕鍡曟祰婢瑰﹨銇愰埞搴撳亾娴ｈ棄螡濠靛倸绻愰幏鐗堢珶閸愯尙婀村☉鎾亾闁肩柉鎻槐婵囩▔瀹ュ甯涢悹浣靛€楅悺鎴炵鎼粹槅妲婚柣顫妿濞蹭即寮介崶锕€鐦滃Λ鐗堫焽濞堟垵螣閳ヨ櫕鍋ュΔ鐘妽閻忥箓鏁嶅☉妯烘锭闁哄牆顦遍弫銈夊箣闁垮顫栫痪顓у枦椤╋箑效閸屾繄绠鹃悽顖氬暙閻?/ 濡ょ姰鍔嶉悘锔界▕閻旈攱鍊遍柡瀣濡炲倿鏁嶇仦鎯ь枀闁烩晛鐡ㄧ敮鎾偂瑜庨幆澶愭儎椤旂晫鍨煎☉鎾愁煼椤ｇ晫绱掗幘瀵糕偓顖炲Υ?
  - 闁哄洤鐡ㄩ弻?`docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁挎稑鏈弻濠冩櫠?V2.3.103 閻犱焦婢樼紞宥夊Υ?
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.24`闁?

### Verified

- `npm.cmd --prefix web run lint -- src/features/consumption/components/ConsumptionDefaultTheme.tsx src/features/consumption/components/ConsumptionLoadingShell.tsx`
- `git diff --check -- web/src/features/consumption/components/ConsumptionDefaultTheme.tsx web/src/features/consumption/components/ConsumptionLoadingShell.tsx docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md CHANGELOG.md`
- `npm.cmd --prefix web run typecheck`

## 2.3.102 - 2026-04-05

### Changed

- **濞村吋锚鐎垫彃鈽夐崼锝呯€銈呯仛濠€浼村捶閹殿喚鎽ｉ梺顐㈩槸瀹曡鲸銇勯崠锛勭濞ｅ洦绻勯弳鈧柣婊呭濠€渚€宕堕幑鎰┾偓鍐偓闈涙鐎硅櫕绋夋惔锛勵伌閻忕偐鍋?*:
  - 闁哄洤鐡ㄩ弻?`web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`闁挎稑鑻惃銏ょ嵁閸愭彃閰辩紒娑欑洴閳ь剙顦粭宀勫礂閹惰姤鏆涢悹鍥хУ閹磭妲愰姀鈥愁€曢柟瀛樺姀閳ь剚绮忕欢顓㈠礂閵壯冃﹂柟顑胯閳ь剚绻傞幏浼村灳濠婂牆娅㈤柛銉﹀礃閵嗗啰绱掗幘瀵镐函闁绘鍩栭埀顑胯閳ь剚绻€鐞氳京浠﹂崒锔剧閻犱讲鏅滈崑鎾趁归鍓ф懀闂侇偄顦▍鎺撶┍濠靛洤鐦柛妤勬珪濡炲倿宕鍛畨闁挎稑鐭傞崳鎼佸礆閸℃鈧粙宕犻崫鍕幍闂侇偅淇虹换鍐嚈閹壆绠块柛濠囨？缂嶅棙瀵煎Ο鍝勫弗缂佺嫏鍐ㄧ厱闁哄倽鍩囬埀?
  - 濞戞捁妗ㄥ锕傚及閹惧啿鐏欓悶娑栧姂椤ｂ晝鎷嬮敍鍕毈闂佸弶鍨块·鍌炲Υ娴ｈ锛夐柡鍫㈠枂閳ь兛绀侀柦鈺呭矗閼割兘鍋撴担鍝ユ瘓闁告劖鐟﹂幃宕囨椤叀顩☉鎾抽椤︻剙鈻旈妸锔惧灱閻犱礁搴滅槐婵嬫焼閸喖甯虫慨锝呯箲椤愯偐绮靛☉鈶╁亾婢舵劕鍘撮梺鎻掔Т椤︽煡骞忛崗鐓庡閻庢稒顨堥浣圭▔鐏炲倵鍋撴担鍙帡寮搁幇顓燂級闁哄牏鍠庨幏鐗堟姜椤掍礁搴婇梺鍙夊灴椤ゅ倿濡?
  - 鐟滅増鎸诲﹢浼村捶閻楀牊寮撻柛姘煎灣閺併倝鐛崘鎻掗叡 / 闁瑰吋绮庨崒銊︽交閸ャ劍濮㈤柡鍐啇缁辨繈宕氶崱妯尖偓浠嬪础閿涘嫬顣诲ù鍏济崢娑欏緞瀹ュ洦鏆忛柛姘捣椤忣剙顔忛懠顒傜梾閺夆晜鏌ㄥú鏍儍閸曨偄鐎荤紒?Pareto闁靛棔绀侀柦鈺呭矗閺夊灝鐎婚悽顖氬暕缁楀矂宕崱妯虹厱闁圭儤甯熼、鎴︽嚂濮橆剚鍊ょ紓浣规尰閻忓鏁嶇仦钘夋閻忓繑鍨垫晶鐘电博椤栨艾寮块梺鎻掔箻閸ｅ摜绮诲灏栧亾?
  - 濞ｅ浂鍠楅婊冣槈閸絽鐎銈夋涧閵囨棃鏌堥妸銉︽珜闁规潙鍢查崢瑙勬償閺囩喐鐎俊妤€鐗呴懙鎴︽儍閸曨亣纭€闁活喕绶ょ槐婵嬫焼閸喖甯抽柟顑棗鍘撮柡鈧悷鏉啃楀銈囧劋婢ф粌顕ｉ弴鐐插汲鐎殿喖鍊搁悥鍓佷沪閺囩姰浠涢柕?

### Docs

- **閻炴稏鍎遍崢鏍煂瀹ュ懏绂堥悶娑栧姂閵嗗妫冮姀銏㈡懀闂侇偄顦伴埀顑棗鍘寸紒鎾呯畱閻ｉ箖鐛捄鐑樺€辨慨婵勫劤婢ф寮甸鍐惧敹鐟?*:
  - 闁哄洤鐡ㄩ弻?`docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md`闁挎稑鏈弻濠冩櫠閻愨斁鍋撳鍫濇闁搞儲宕橀妴鍐┿亜閻㈠憡妗ㄩ柣銊ュ濠€浼村捶閹殿喚鎽ｉ梺顐㈩槼缁额參宕楅妷褍笑闁诡兛妞掔粭宀勬煂瀹ュ洨娉㈤柡瀣矌婵悂骞€娴ｇ瓔娲ｉ柛鎺戞閻即鏁嶇仦鑲╁枠闁稿繐鐗忛弫?`useDeferredValue` 缂佹稑顦紞鍡樺濡搫甯ョ紒鐙欏嫭绨氶柛鎺曞煐婢规瑩骞掗妷銉︾閻炴稏鍔岄崺娑㈠棘閹垫枼鍋撳┑鍫熺暠閻熸瑥瀚崹顖炲Υ?
  - 闁哄洤鐡ㄩ弻?`docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁挎稑鏈弻濠冩櫠?V2.3.102 閻犱焦婢樼紞宥夊Υ?
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.22`闁?

### Verified

- `npm.cmd --prefix web run lint -- src/features/consumption/components/ConsumptionDefaultTheme.tsx src/features/consumption/components/ConsumptionLoadingShell.tsx`
- `git diff --check -- web/src/features/consumption/components/ConsumptionDefaultTheme.tsx docs/Dashboard闁归攱鐗楃€氳法鏁崘銊ф拱鐎殿喒鍋撻柛娆愬灦閺嬪啫顩?md docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md CHANGELOG.md`
- `npm.cmd --prefix web run typecheck` blocked by pre-existing errors in `web/src/app/(dashboard)/connections/page.tsx`

## 2.3.101 - 2026-04-05

### Docs

- **闁哄倹婢橀·?Dashboard 闁归攱鐗楃€氳法鏁崘銊ф拱濞戞挻鎹囬妴宥咁嚕閳ь剟宕ｉ幋鐐寸€俊?*:
  - 闁哄倹婢樼紓?`docs/Dashboard闁归攱鐗楃€氳法鏁崘銊ф拱鐎殿喒鍋撻柛娆愬灦閺嬪啫顩?md`闁挎稑鏈Σ鎴犳兜椤旇偐绉奸柛鎾崇Ч閵嗗秹鎯勯纰辨搐闂傚洠鍋撻柡鈧娑樼槷闁搞儲宕橀妴鍐ㄎ熼垾铏仴闁归攱鐗楃€氬潡鎳涢鍕毎濞戞柨顦粩椋庝沪閳ь剟鏁嶇仦鐣屽畨濞村吋锚閸樻稓鎸ч幍鏂ュ亾濠婂嫮鍨洪柡宥呭悑鐎氬骞忛挊澶岊伌閻忕偐鍋撶€殿喗娲橀幖?+ 闁哄拋鍣ｉ埀顒佺煯鐎靛本锛愬Ο鍝勫耿闁?DOM闁炽儲绻冮弻鐔奉浖閸剛绀夐柤鏉垮缁楀寮伴娑樜?Dashboard 闁煎啿鏈▍娆戜沪閸屾粍绾柟鎭掑劜閺佸ジ骞嬮幇顖氭闁汇垼浜弫鍓ф暜閸愶腹鍋?
  - 闁哄倸娲﹂妴鍌涚▔椤撯埛澶嬵瀲閹邦亞鍟婇柟鎭掑姀瀹曟ɑ鎯旈幘鐑╁亾婢跺﹦鈧兘濡存禍鈧琲dget 婵炲鍔岄崬鐣屾偘閵婏絺鍋撴担鍝ヮ伌閻忕偐鍋撻柡浣哄瀹撲胶绱掗幘瀵糕偓顖炲Υ娴ｈ櫣妞介弶鍫熷灦鑶╃€殿喖绻堥埀顑跨缁旈浠﹂埀顒勫箰娴ｉ鐣介柛鏍ㄧ墦閳ь兛鑳朵簺闁告柣鍔庨顒勬⒔瀹ュ洭鐛撻柕鍡曠劍閳ь儸鍡楀幋閻熸洑鐒﹂惇浼村椽鐏炶棄鐎婚梻鍐煐椤斿瞼鈧湱鍋為弻锔炬媼閳ュ啿鐏婇柕?
  - 闁哄洤鐡ㄩ弻?`docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md`闁挎稑鏈弻濠冩櫠閻愨斁鍋撳鍐伌閻忕偐鍋撻悘鐐插€歌ぐ褏绮婚敍鍕€炲ù锝呯Ф閻ゅ棛浜搁崫鍕靛殶闁挎稑濂旂€靛本锛愬Ο铏规勾缂備綀鍛暰閻犳劗鍠曢惌妤併亜閻㈠憡妗ㄥ鐟板暱閹蜂即宕￠敍鍕暬閻炴稏鍔戝浼村灳濠靛牊鐣遍悷娆忓閸垶濡?
  - 闁哄洤鐡ㄩ弻?`docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁挎稑鏈弻濠冩櫠?V2.3.101 閻犱焦婢樼紞宥夊Υ?
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.21`闁?

### Verified

- `git diff --check -- docs/Dashboard闁归攱鐗楃€氳法鏁崘銊ф拱鐎殿喒鍋撻柛娆愬灦閺嬪啫顩?md docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md CHANGELOG.md`

## 2.3.100 - 2026-04-05

### Changed

- **婵炴垵鐗愰崹鍌涖亜閸偂鍒掑璺虹Т閸ㄥ酣寮搁幇顒佺閻炴侗鐓夌槐婵堢磼瑜忛悽缁樼┍濠靛洤鐦?Dashboard 鐎规悶鍎扮紞鏃堝矗娴兼惌妫戦柡?*:
  - 闁哄洤鐡ㄩ弻?`web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`闁挎稑鑻﹢顏呯┍濠靛牊娈屽娑欘焾椤撶粯绋夋繝姘兼毌鐎规悶鍎扮紞鏃堝矗閹殿喚娉㈤柡瀣閹蜂即宕￠敍鍕暬閻犲浂鍙€閳诲牓鎯冮崟顐㈩枀闁圭粯鍔掔粭鍛存晬鐏炴儳惟闁炽儲绮忕粊顐︽煂閹寸偟銈﹂柛姘灍閳ь剚绻傜亸顖炲锤濡や椒鍒掑璺虹С鐠愮喖鎯囬悢椋庢澖婵炵繝绀侀幃婊堝炊閹惧懐绀夊☉鎾崇Т閸熲偓闂傚嫬绉舵鍥箣閹邦厽鍠呴悷鏇氱劍濞碱垵銇愰姀鐘崇闁?
  - 濞ｅ洦绻冪€垫柨顫㈤妶鍛枀鐎规瓕灏欑划锛勬偘閵夈儲绀€闁汇劌瀚弲銏ゅ箣闁垮绗撻悶娑樿閳ь兛鑳堕崕褰掑礌閹巻鍋撴担铏规尝闁哄瀚粈濠勨偓鐢靛枂閳ь兛绶氶崳鍛婂緞瀹ュ懏娅岄柟瀛樼仛閳ь兛绶氶。鈺冪不濡も偓娴滅顔忛琛″亾娴ｅ壊妲垫繛澶堝妽缁€濠勨偓鐢靛枂閳ь兛绀侀悥銏ゅ矗閻樿櫣歇闁告棁锟ラ埀顑胯兌閸庡綊宕濆☉娆愶級闁告ê妫庨埀顑跨劍閺嗗酣鎮欓悷鐗堢闁告粌鐬煎ú鍧楀棘閻熺増绂堢紒娑橆槸閸ㄥ酣寮搁幇顒戒線宕稿Δ瀣濞ｅ浂鍠楅婊堝灳濠婂喚鍤犲缁樺姃鐎靛本锛?= 闁告帞濮村ù妯兼偘閵娾懇鍋撳┑鍫熺暠闁稿绻愬Ο濠囧Υ?
  - 闁圭鏅涢惈?`web/src/features/consumption/components/ConsumptionLoadingShell.tsx`闁挎稑鐭侀鈧柛鏃傚Ь濞村洭骞€娴ｉ鐟㈤柟顓滃灩椤︽煡宕ユ惔锝嗙暠闁告帒妫欓悗浠嬪礌閸濆嫭鍋ラ悗闈涙鐎硅櫕绋夐埀顒勬嚊鏉堝墽绀夐柤鏉垮缁楀寮伴姘不闁伙絾鐟ュ﹢顏堝礆閻樻彃娅ら柛姘捣濞?4 + 3 + 3 濡ょ姰鍔嶉悘锕傚Υ?

### Docs

- **閻炴稏鍎遍崢鏍ㄧ▔婵犳凹鏆悗闈涚秺缂嶅牓鎯冮崟顏嗙闁搞儲宕橀妴鍐棯閿曗偓閻ｉ箖鐛捄鐑樺€辨慨婵勫劤婢ф寮甸鍐惧敹鐟?*:
  - 闁哄洤鐡ㄩ弻?`docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md`闁挎稑鏈弻濠冩櫠閻愨斁鍋撳鈧€靛本锛愬Ο渚殸濮掔粯鍔欑划顖滄媼閵堝嫮鐟濋柤铏灊鐎靛矂宕濋妸銉ョ仼闂傚嫨鍊曠敮顐ｃ亜閻㈠憡妗ㄩ柛蹇斿▕閺侇參宕堕幑鎰┾偓鍐偓闈涙鐎规娊鏁嶅畝鍕彑闂傚牏鍋熼弫銈夊箣闁垮顫栫痪顓у枦椤╋箑效閸屾繍姊块柛鎿冧簴閳ь剚绻勫▓鎴犳喆閸曨偄鐏熼柕?
  - 闁哄洤鐡ㄩ弻?`docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁挎稑鏈弻濠冩櫠?V2.3.100 閻犱焦婢樼紞宥夊Υ?
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.20`闁?

### Verified

- `npm.cmd --prefix web run lint -- src/features/consumption/components/ConsumptionDefaultTheme.tsx src/features/consumption/components/ConsumptionLoadingShell.tsx`
- `git diff --check -- web/src/features/consumption/components/ConsumptionDefaultTheme.tsx web/src/features/consumption/components/ConsumptionLoadingShell.tsx`
- `npm.cmd --prefix web run typecheck` blocked by pre-existing errors in `web/src/app/(dashboard)/connections/page.tsx`

## 2.3.99 - 2026-04-05

### Changed

- **闁稿繐褰夐棅鈺冪驳濞戔懇鍋撴径濠冪彜濞戞挸楠哥花鎶芥焾閵娿儴鍓ㄩ悘鐐插€界粣锟犳⒕韫囧骸鐦滃Λ鐗埳戦弫褰掑矗?*:
  - 闁哄洤鐡ㄩ弻?`web/src/components/shared/theme-primitives.tsx`闁挎稑鐭佽棢闁稿繐鎳庨崣鈩冪椤愶綀鐧侀悘鐐插€垮浼村级鐟併倐鍋撴担绋块殬闁秆勩仠閳ь兛娴囪闁告瑦鍨靛▍鎺撶閵夈儱鎸ら悗鐢殿攰閻﹁棄顩奸崱姘辩炕闁稿繈鍎查、?/ 闂侇偄顦扮€氥劑宕抽妸褎鐣卞☉鎾愁煼椤ｄ粙宕㈤悢娲诲殧缂侇偉顕ч幃鏇㈡晬鐏炲€熷珯閻?`ThemeSectionHeader` 婵繐绲界槐鈥炽€掗崣澶屽帬 `description`闁?
  - 闁哄洤鐡ㄩ弻?`web/src/components/ui/bottomsheet.tsx`闁靛棔姊梬eb/src/components/ui/select.tsx`闁挎稑鑻惃銏℃償閺囥垹鍔ョ€殿喚鎳撻惇浼村Υ娴ｇ懓鐝涢柟鐤Г濞碱垶濡存担绋垮綘闂傚偆鍘界€垫粓鏌﹂琛″亾娴ｅ湱鍨煎Λ鐗埱滈埀顑跨婢瑰洭寮介崶顒夋毌闁靛棔妞掔粭鍛村箯婢跺巩鏇㈠矗閹存繃鐝ら柕鍡曟缁楀懘骞忔径濠傛暥閻庣懓绠嶉埀顑跨窔閳ь剙顦甸妴宥嗙▔鎼粹€崇€婚梻鍛⒒閸ゅ海绱掗悢鍓侇伇闁告帒娲ら崺灞剧▔婵犳凹鏆?token闁挎稑濂旂粭澶愬礃瀹ュ懏绁奸悗瑙勫哺缁垳鎷嬮妶鍥︾礂闁谎嗗Г閻楀崬顕ｈ箛瀣у亾?
  - 闁哄洤鐡ㄩ弻?`web/src/components/shared/FloatingFilter.tsx`闁挎稑鐭侀鈧紒澶庮嚙婵晝绮╅婊呮懀闂侇偄顦花鎶芥焾閵娿儴鍓ㄩ悘鐐插€搁幏鏉款浖瀹€鍕〃缂佹棏鍨抽悺顐︽焻婢跺鐧侀悘鐐插€块埀顒佷亢缁诲啴宕楅崣姗€鐓╁☉鎾愁煼椤ｄ粙宕㈤悢娲诲殧濞戞挸瀛╄啯闁?accent 闁煎浜滄慨鈺冩崉閻斿吋顓圭憸鐗堟尭婢х姵绋夋繝姘兼毌闁挎稒鐩划顖滄媼閵堝棌鍋撻弰蹇ｆ綌濡炪倗鏁搁幋椋庣磼椤撀ゆ巢 `dashboard` 婵☆垪鈧櫕鍋ラ柨娑樻湰缁夐鎷硅ぐ鎺嬧偓澶愬及閹呯闁规亽鍎遍崣?`module="consumption"`闁?
  - 濡炪倗鍎ゆ晶婊冦€掗崨顖涘€?`web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` 闁?`web/src/components/shared/theme-primitives.tsx` 濞戞搩鍘惧▓鎴﹀籍閵忊剝绠掗柡鍫簷婵炲洭鎮介妸銉﹀暈閻犫偓閿旇法鐟㈢紓鍌氭惈閵囨垿骞撹箛姘墯婵炴挸寮堕悡瀣⒒椤曗偓椤ｄ粙濡?

### Docs

- **濞戞挸顭烽。钘夘浖閸℃浠搁悷娆忓閸垱绋夋惔锝咁暭闁哄牜鍓濋鍥亹閺囩偞鍊辨慨?*:
  - 闁哄洤鐡ㄩ弻?`docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md`闁挎稑鐭佽棢闁稿繐鎳夐埀顒佺矊閸欌剝绂嶉銈囨懀闂侇偄顦▍?/ BottomSheet / Select 闁告瑯浜埀顒佷亢缁?token 闁告粌濂旂€靛本锛愬Ο鍝勬枾閻犲浂鍘藉畷鏌ユ儍椤曞棛绀夊☉鎾崇Т濠€顏堝礂閸欐﹢鐓╃紓浣稿濞嗐垽鏌岀仦鐣屽灮 `themeId` 闁告帒妫欓弫顕€鏁嶅☉姘辨尝闁哄瀚ぐ澶愬礌閺嶃劍鈻旈柦浣诡殕濡炲倿骞嶅鍡楊€曢柛娆惷肩紞瀣灳濠靛牊鐣辩紒鎾呯畱閻ｉ箖濡?
  - 闁哄洤鐡ㄩ弻?`docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁挎稑鏈弻濠冩櫠?V2.3.99 閻犱焦婢樼紞宥夊Υ?
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.19`闁?

### Verified

- `npm.cmd --prefix web run lint -- src/components/shared/FloatingFilter.tsx src/components/shared/theme-primitives.tsx src/components/ui/bottomsheet.tsx src/components/ui/select.tsx src/features/consumption/components/ConsumptionDefaultTheme.tsx`
- `git diff --check -- web/src/components/shared/theme-primitives.tsx web/src/components/ui/bottomsheet.tsx web/src/components/ui/select.tsx web/src/components/shared/FloatingFilter.tsx web/src/features/consumption/components/ConsumptionDefaultTheme.tsx docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md CHANGELOG.md`
- `npm.cmd run typecheck` blocked by pre-existing errors in `web/src/app/(dashboard)/connections/page.tsx`

## 2.3.98 - 2026-04-05

### Changed

- **婵炴垵鐗愰崹鍌涖亜閻㈠摜甯涢悹浣靛€撶€靛本锛愬Ο渚殸濮?`DefaultDashboard` 鐎规悶鍎扮紞鏃堝矗娴兼惌鈧洭寮?*:
  - 闂佹彃绉撮崯?`web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`闁挎稑鑻惃銏犫槈閸絽鐎銈呯仛閺佸ジ骞嬮幇顏嗙憿 `web/src/features/dashboard/components/themes/DefaultDashboard.tsx` 闁告艾鏈悗顖炴儍閸曨亞鐟忛悶娑樿嫰娴兼劖鎷呭鍐ㄩ叡閻㈩垰鍟惇顒勬晬? 鐎殿喚濮甸々褏鎲撮崼婵嗗耿闁? 鐎殿喚濮村ù妯兼偘閵娿儱骞㈤柨娑樺娴滄帡宕ｆ繛閿亾濠婂嫭鏆滈柛鎴︾細缁夊ジ宕?+ 妤犵偛鍟胯ぐ鎾几閸曨剙鐏?+ 閺夆晜鍨跺﹢鈥趁规担瑙勫瘻闁炽儲绻冮弫褰掑矗閿濆懎闅橀柕?
  - 缂佹鍏涚粩瀵告偘瀹€鈧划鐑樼▔閳ь剚绋夋ウ鎸庢啱闁告せ鍓濋埀顒傜帛閺侇噣宕欓幁鎺嗗亾娴ｉ缚闆归柛妞诲墲閳ь剛绮弫褰掑礂閵夛絺鍋撴担鐑橆仱闁告銈庡敹鐟滅増娲濆婵嬫煂韫囧鍋撴担鍦偓闁藉啯绻傚畷鍗炩槈閸絽鐎柟鐑樺笩椤㈡垿鏁嶇仦鍓ラ悹鎰嚀濞存鎮伴妸銉﹀婵炵繝鐒﹂幐澶愬礌濞差亜鍘撮悹铏瑰枛濞堛垺顪€濡鍚囧☉鎾愁煼椤ｄ粙宕￠敍鍕暬閻犲浂鍙€閳诲牓鏁嶇仦鑲╃憹闁告劕绉崇换姘舵偩濞嗘劖锛嬮柣妤€鐗撻弳閬嶅礆閸℃鈧粙妫冮姀鈩冪凡缂備焦鎸婚悗顖炲Υ?
  - 濞ｅ洦绻勯弳鈧鐐跺煐鐢挳宕堕悙鎻掑綑濞存粠鍋呴崑鎾趁归鍓ф懀闂侇偄顦▍鎺楀Υ娴ｈ鎷遍柛锔芥緲闁解晠宕?闁稿繑濞婇弫顓犳嫚瀹ュ牏绠栨繝濞垮€戦埀顑挎闁告瑯浜炲﹢鍛緞閸ャ劍鏆坄 鐎殿喒鍋撻柛蹇曨劜缁辨繃绂掗妷銉ユ尋 `AI閻犱線顣︾粩瀵哥箔?-> /api/ai/scan-receipt -> /api/transactions` 闁汇劌瀚花鎶芥焾閵娿儴鍓ㄩ悘鐐插€介鍥╂嫻閿旂晫銈︾紒瀣儍閳?
  - 闂佹彃绉撮崯?`web/src/features/consumption/components/ConsumptionLoadingShell.tsx`闁挎稑鐭侀鈧繛鎴濈墣閸ㄥ倹銇勯悽鍓测偓鍥几鐠鸿櫣娼屽☉鎾虫捣濠€锛勨偓鍦仱閵嗗妫冮～顓犵闁归晲绀侀幃鎾寸▔閳ь剚绺?4 + 3 + 3 鐎规悶鍎扮紞鏃堝矗閻楀煬渚€宕稿Δ鍛偓搴㈡償韫囧鍋?

### Docs

- **濞戞挸顭烽。鑺ョ▔閳ь剟鎳涚€涙ǚ鍋撹椤宕氬▎搴ｇ憿闁绘鐗婂﹢鎵媼閺夎法绉块柛姘湰椤?*:
  - 闁哄洤鐡ㄩ弻?`docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md`闁挎稑鐭佽棢闁稿繐鎳夐埀顒佺矊缂嶅宕濋悢璇插幋濡炪倓绲婚～锕傚及鎼达絺鈧鎲版担鍦勾濞戞挸瀛╅悡鍥ㄧ▔椤忓懏锛嗛柡鍫濐槷鐎靛本锛?100% 濞戞挴鍋撻柤宄扮摠濡炲倿鏁嶇仦鐣岀畱濡炪倛宕靛ú鍧楀箳閵夈儺妲婚柣顫妿濞蹭即寮介崶锕€鐦滃Λ鐗堫焽濞堟垵顔忛妷銈囩▕闁告瑦澹嗙划銊╁几閸曨亞鐟?LoadingShell 闂傗偓濠婂啫鍓奸柍銉︾箘濞堟垹鐥敃鈧悾楣冨Υ?
  - 闁哄洤鐡ㄩ弻?`docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁挎稑鏈弻濠冩櫠?V2.3.98 閻犱焦婢樼紞宥夊Υ?
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.18`闁?

### Verified

- `npm.cmd --prefix web run lint -- src/features/consumption/components/ConsumptionDefaultTheme.tsx src/features/consumption/components/ConsumptionLoadingShell.tsx`
- `git diff --check -- web/src/features/consumption/components/ConsumptionDefaultTheme.tsx web/src/features/consumption/components/ConsumptionLoadingShell.tsx`
- `npm.cmd --prefix web run typecheck` blocked by pre-existing errors in `web/src/features/loans/components/themes/DefaultLoans.tsx`

## 2.3.97 - 2026-04-05

### Changed

- **濮掓稒顭堥缁樼▔婵犳凹鏆銈呯仛濡矂宕楅鈧崣鈩冾殽閵婏妇浠搁弶鈺€鑳朵簺闁衡偓鐠哄搫缍?*:
  - 闁圭鏅涢崢?`web/src/components/shared/PageLoadingShell.tsx`闁挎稑鏈弻濠冩櫠閻愯櫣甯涢悹浣靛€撶€靛本锛愬Ο杞扮矗濞达絾绮岃ぐ瀵告嫚椤撴繄鐤呴柣銊ュ閸欌剝绂嶉锔烩偓鍥几鐠虹儤鍋ラ柨娑樿嫰鐎垫﹢骞忛鈧导鎰媴濠婂啫閰遍柛妤嬬磿婢ф牗绔熼悙瑙ｅ亾娴ｇ骞㈤柣妤€娲ら妵鏃堝Υ娴ｇ绻侀悹瀣暞鐎垫岸寮介崶褍骞㈤柕鍡曟祰缁绘ɑ鎯旈敃鈧畷閬嶅Υ娴ｇ晫歇闁告柨鐏濋崹顏嗘偘閵婏絺鍋撴担鍛婄閻炴稏鍔屽畷閬嶅椽瀹€鍐︹偓鍐冀閻撳骸骞㈤柕?
  - 闂佹彃绉撮崯?`web/src/features/dashboard/components/themes/DashboardLoadingShell.tsx`闁挎稑鑻惃銏☆渶濡鍚囧☉鎾愁煼椤ｄ粙骞€閺勫浚娼斿銈囨暬椤庡洭寮搁懜鍨毉闁瑰瓨鍔忛埀顒佺矊閸欌剝绂嶉顫矗濞达絾绮岃ぐ鎾锤?+ 濡炪倗鏁诲浼存寘閸曨偆娈遍悷浣告噳閳ь剚绻勭划宥夊触閸稈鍋?
  - 闂佹彃绉撮崯?`web/src/features/assets/components/themes/AssetsLoadingShell.tsx`闁挎稑鐭侀鈧娑欘焾椤撶粯绋夋繝姘兼毌閻犙冨妤犲洦銇勯悽鍓测偓鍥几鐠轰警妲婚柣顫妼閹挻绋夐埀顒佺附濡も偓閸欌剝绂嶉顫矗濞达絾绮岃ぐ鎾锤濡ゅ绀夐柛娆樹簷缁绘岸鎮惧▎蹇撳綘婵炲鍔忔径鍕箣瀹勬澘鐏欓悶娑栧姀缁绘牗绋夐埀顒備焊韫囨棏鍞藉銈囨暬濞兼壆浠﹂埀顒勬焾閵娿儱绐楀ù锝呯Р閳?
  - 闁绘粍婢樺﹢顏咁渶濡鍚囧☉鎾愁煼椤ｈ姤銇勯崹顐ｎ棏濞戞搩鍘惧▓鎴濃槈閸絽鐎銈囧仯閳ь兛绀侀崑宥夋嫅閸曨垬鈧濡存担绯曞亾閻旂粯宓嶅銈囧仯閳ь兛鐒﹂埀顒佹椤秵銇勯悙鍏夊亾娴ｇ晫銈ù婧犲洢鈧鏌堥挊澶婂殥缂備礁绻戠敮鎾礆閺夊灝褰嗛柛蹇涗憾椤庡洭寮搁懜娈挎敱闁哄婀圭粭鍌炲Υ?

### Docs

- **閻炴稏鍎遍崢鏍礂椤掆偓閸欌剝顨ラ妸锔句桓閺夆晙鑳朵簺闁活厹鍎撮惁鎴︽倷閻熺増瀚叉繛澶堝妽閸撲即鎮?*:
  - 闁哄洤鐡ㄩ弻?`docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md`闁挎稑鏈弻濠冩櫠閻愨斁鍋撳鍐ㄥ絾闁稿繘浜堕鍥几閹壆璁ｇ紒澶庡吹閻擄紕鎷犻崱娆忎化闁炽儲绻傞幏浼村灳濠婂啫褰嗛柛蹇涗憾椤庡洭寮搁幆鎵缂佸绮弫鐐哄箛韫囨洖浠柍銉︾箰缁辨繈鐛懜鍨潠缁绢収鍣ｇ划顖滄媼閵堝嫬鐦滃Λ鐗堬耿閵嗗寮箛鏇熺暠閺夆晙鑳朵簺闁肩厧鍟ú鍧楀Υ?
  - 闁哄洤鐡ㄩ弻?`docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁挎稑鏈弻濠冩櫠?V2.3.97 閻犱焦婢樼紞宥夊Υ?
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.17`闁?

### Verified

- `npm.cmd --prefix web run lint -- src/components/shared/PageLoadingShell.tsx src/features/dashboard/components/themes/DashboardLoadingShell.tsx src/features/assets/components/themes/AssetsLoadingShell.tsx`
- `git diff --check -- web/src/components/shared/PageLoadingShell.tsx web/src/features/dashboard/components/themes/DashboardLoadingShell.tsx web/src/features/assets/components/themes/AssetsLoadingShell.tsx docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md`

## 2.3.96 - 2026-04-05

### Docs

- **閻炴稏鍎遍崢鏍ㄧ▔婵犳凹鏆柟鎭掑劚閸欏棝宕楅鈧崣鈩冾殽閵婏妇浠告俊妤€妫欓悘锕傛儍閸曨剚鐎俊妤嬬稻鐢鐥懗顖ｅ殯闁?*:
  - 闁哄洤鐡ㄩ弻?`docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md`闁挎稑鏈Σ鎴犳兜椤旇鐦滃Λ鐗埫肩粭澶嬪濮樿鲸绾柟鎭掑劚濠€?Manifest 濞戞搩鍘奸敍鎰板及鎼搭煈鈧洭寮搁懜娈挎敱闁哄顔愮槐婵嬫嚀鐏炵偓笑闂侇偅淇虹换?`dashboardVariant -> dashboard-registry -> XxxLoadingShell -> PageLoadingShell` 闁规亽鍎遍崣鍡涘Υ?
  - 閻炴稏鍎遍崢鏍灳濠婂喚妲婚柣顫妿楠炲洭寮垫径濠傜秮濞达絾鎸诲鍌涗繆閸屾瑧绉块柤濂変簻婵晜寰勫鍥ㄦ殢濡ょ姰鍔嶉悘锕傚灳濠靛棙瀚查柍銉︾矋閺屽﹥鏅堕悙闈涱仾缂佹柨顑勭€靛本锛愬Ο鍝勭秮濞达絾鎸诲鍌涗繆閸屾瑧绉块柣顫妼閸欌剝绂嶉锔烩偓鍥几鐠虹儤鍋ョ紓浣稿椤?`XxxLoadingShell`闁炽儲绻勫▓鎴犵棯閿曗偓閻ｉ箖濡?
  - 闁哄洤鐡ㄩ弻?`docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁挎稑鏈弻濠冩櫠?V2.3.96 閻犱焦婢樼紞宥夊Υ?
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.16`闁?

### Verified

- `git diff --check -- docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md CHANGELOG.md`

## 2.3.95 - 2026-04-05

### Changed

- **閻犙冨妤犲洦銇勯悽鍝ュ笡閻犱降鍊撶€靛本锛愬Ο渚殸濮?DefaultDashboard 闁藉啯绻勭挒銏ゅ础閿涘嫬顣荤€规悶鍎扮紞鏃堝矗?*:
  - 闂佹彃绉存禒?`web/src/features/assets/components/themes/DefaultAssets.tsx`闁挎稑鑻惃銏㈡導閸曨亪鐛撳銈勭祷閻ㄧ喖寮紙鐘虹濞?`DefaultDashboard.tsx` 濞戞挴鍋撻柤宄邦嚟濞堟垿鎷?缂備礁鐏濆杈╂嫬閸愩劌骞㈤柕鍡曡兌濞呇囧础閳ュ啿鐎婚柡瀣姇鐏忣垶宕畝鍕闁绘劗鎳撻崹顏嗘偘閵娿儳婀寸紒鐙欎讲鍋?
  - 閻犙冨妤犲洦銇勯悽闈涚疀闁革负鍔庣划鐑樼▔閳ь剛浠﹂弴鐘粵閻犙冨妤犲洭宕欓埀顒勫磹缁楄　鍋撴担绋胯闁告柣鍔庨弫銈囨導閸曨亪鐛撻柕鍡曡兌缁劑寮搁崟顑藉亾閺勫浚娼旈柕鍡曠窔閸ｆ悂鎮欑憴鍕槷濞寸姵鎸堕埀顑挎祰婢跺嫰骞嬫搴ゎ潶闁搞劌顑冮埀顑跨缁旂數绮斿鍛€婚悽顖氬暔閳ь兛鑳堕鎼佹偠閸℃稒妗ㄩ柡澶庯骏閳ь兛绀侀崣褍鈻旈妸銊ヮ槱闁圭娓圭粭宀€鎸ч崟顏堢崜閻犳劧闄勯崺娑㈠礆濡ゅ嫨鈧啴濡?
  - 闁告艾鏈鐐哄即鐎涙ɑ鐓€ `web/src/features/assets/components/themes/AssetsLoadingShell.tsx`闁挎稑鐭侀鈧Δ鐘妽閻忥妇浠﹁箛姘鳖€€闂傚懎绻戦弻濠囨儍閸曨儫渚€宕稿Δ鈧粩椋庝沪閳ь剟宕仦钘夊耿闁绘娲ら惇鎵棯瑜嬮埀?

### Docs

- **闁绘鐗婂﹢鎵媼閺夎法绉垮☉鎾崇凹鐎靛本锛愬Ο娆炬綈闁告帗鐟ラ幃鎾愁潰?*:
  - 闁哄洤鐡ㄩ弻?`docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md`闁挎稑鐭佽棢闁稿繐鎳夐埀顒佺矊婵盯鎳楁禒瀣ㄢ偓澶愬及鎼达絺鈧鎲版担鍦勾閻犺櫣鍠栧▓銏ゅ籍閵忊剝绠掑☉鎾愁煼椤ｄ粙寮崶锔筋偨闁哄啳顔愮槐婵囨償閺傚墽鍠橀柛蹇撶墕椤︽煡鎮介妸顭戝殙濞戞挸顭烽。浠嬪础閿涘嫬顣婚悹鍥跺弨閳诲牓宕仦鐏镐線宕稿Δ鍐煁缂備礁娲犻埀顒佺箘濞堟垹鐥敃鈧悾楣冨Υ?
  - 闁哄洤鐡ㄩ弻?`docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁挎稑鏈弻濠冩櫠?V2.3.95 閻犱焦婢樼紞宥夊Υ?
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.15`闁?

### Verified

- `npm.cmd --prefix web run lint -- src/features/assets/components/themes/DefaultAssets.tsx src/features/assets/components/themes/AssetsLoadingShell.tsx`
- `git diff --check -- web/src/features/assets/components/themes/DefaultAssets.tsx web/src/features/assets/components/themes/AssetsLoadingShell.tsx`
- `npm.cmd --prefix web run typecheck` blocked by pre-existing syntax error in `web/src/features/savings/components/themes/DefaultSavings.tsx`

## 2.3.94 - 2026-04-05

### Changed

- **闁规儼妫勮ぐ鍥礂椤掆偓閸欙繝鎯囬悢椋庢澖濡ょ姰鍔嶉悘锕€顩奸崱妯间桓妤犵偛澧庣划鐑樼▔閳ь剟寮界粙璺ㄥ濞戞挻鑹炬慨鐔搞亜?LoadingShell**:
  - 闁圭鏅涢崢?`web/src/components/shared/PageLoadingShell.tsx`闁挎稑鏈弻濠冩櫠閻愬灚褰涢柛?Hero闁靛棔绶氶埀顒佹皑閺?Surface闁靛棔娴囬妴鍐冀婵傚壊鈧洭寮搁煬娴嬪亾娴ｇ鐏欓悶娑栧姂椤庡洭寮搁煬娴嬪亾娴ｅ憡绂堥悶娑栧姂椤庡洭寮哥捄鐑樺闁告绱曟晶鏍殽閵婏妇浠哥紒娑橆槸閸欌剝绂嶉銏狀潱閺夌偠妫勫锟犲Υ?
  - 閻?`DashboardLoadingShell.tsx`闁靛棔姊桟onsumptionLoadingShell.tsx`闁靛棔姊桝ssetsLoadingShell.tsx`闁靛棔姊桽avingsLoadingShell.tsx`闁靛棔姊桳oansLoadingShell.tsx`闁靛棔姊桪ataLoadingShell.tsx` 闁衡偓闁稖绀嬮柛鈺勬〃缁剟宕楅崣姗€鐓╁Δ鐘妽閻忥箑顩奸崱妯间桓缂備礁瀚ˉ濠囨晬鐏炵偓鏆柡浣圭洴閸ｅ憡寰勫鍛澖闁绘粏鍩囬埀?
  - 闁哄秶顭堢缓鐐▔濮橆剙顫ゅ銈夋涧閹绱掗锛勬闁轰焦娼欐慨鐐存姜閼恒儮鍋撴担瑙勵槯闁挎稑濂旂粭澶愬礃瀹ュ浠橀悷鏇氱椤︽煡宕氶懜鍨濡炪倗鏁婚鍥几鐠佸湱绀夐柛娆樹邯濞撹埖绌遍鑺ユ毉闁稿繐褰夐棅鈺傤殽閵婏妇浠搁柛褎顨嗛崹銊︺亜閻㈠憡妗ㄩ柦鏍у閻ㄦ繄鎲楅崨顖滅煁闁告艾鐗勯埀?

### Docs

- **闁稿繐褰夐棅鈺呭礉閻樼儤绁板Δ鐘妽閻忥箑顩奸崱妯间桓缂佹拝绠戦悾鐐▔鎼达絽顣奸柡鍫墲椤斿洩銇愰弴鐔哥函闁?*:
  - 闁哄洤鐡ㄩ弻?`docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md`闁挎稑鏈弻濠冩櫠?`PageLoadingShell` 闁稿繐褰夐棅鈺呭礉閻樼儤绁板Δ鐘妽閻忥箑顩奸崱妯间桓濞达綀娉曢弫銈囩棯閿曗偓閻ｉ箖濡?
  - 闁哄洤鐡ㄩ弻?`docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁挎稑鏈弻濠冩櫠?V2.3.94 閻犱焦婢樼紞宥夊Υ?
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.14`闁?

### Verified

- `git diff --check -- web/src/components/shared/PageLoadingShell.tsx web/src/features/dashboard/components/themes/DashboardLoadingShell.tsx web/src/features/consumption/components/ConsumptionLoadingShell.tsx web/src/features/assets/components/themes/AssetsLoadingShell.tsx web/src/features/savings/components/themes/SavingsLoadingShell.tsx web/src/features/loans/components/themes/LoansLoadingShell.tsx web/src/app/(dashboard)/data/DataLoadingShell.tsx docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md CHANGELOG.md`
- `npm.cmd --prefix web run typecheck` blocked by pre-existing syntax error in `web/src/features/savings/components/themes/DefaultSavings.tsx`

## 2.3.93 - 2026-04-05

### Changed

- **濞ｅ浂鍠栭ˇ鍙夘渶濡鍚囧☉鎾愁煼椤ｄ粙骞€閺勫浚娼斿銈囨暬椤庡洭寮哥捄铏规綄濞寸姴绉崇换姘舵偩濞嗘劖锛嬮柤鍐叉湰濞呮瑦绔熼崗鍛懍婵☆垪鈧櫕鍋ョ紓浣规尰閻庮垰顭抽崒婧?*:
  - 闁哄洤鐡ㄩ弻?`web/src/features/dashboard/components/themes/DashboardLoadingShell.tsx`闁挎稑鐬间簺闂傚嫨鍊曢崙锟犲礆閻樼粯鐝熷銈囨暬濞间即寮藉畡鎵闂侇剚顨堥弳鈧柣銊ュ娴煎棝鎳濋幓鎺嬩海闁煎啿鏈▍娆愮珶閻愯В鍋撴担鍓叉▎閻忕偛鍊稿〒鍓ф喆閹烘埈鍟囬柛锝冨妼閹?`min-h-screen`闁?
  - 閻庨潧缍婄紞鍫燁殽閵婏妇浠搁悘鐐茬箣缁?`DefaultDashboard.tsx` 闁汇劌瀚ˇ鑽や沪閸屾凹鍟囬柛锝冨姂濡法鎹勫┑鍕ㄥ亾娴ｇ骞㈤柣妤€娲ゅ〒鍓ф喆閹烘垶瀚叉俊顖椻偓铏仴閻㈩垰鍟惇顒勬晬瀹€鍕級闁稿繐绉存慨鐐存姜閼恒儮鍋撴担椋庣憿闁活亞鍠庨悿鍕亜閻㈠憡妗ㄩ柛鎴ｆ楠炲洦绋夐妶鍜佹濡ょ姰鍔嶉悘锕傚Υ?
  - 閻忓繐妫涢鍥ㄧ▔婢跺寒鏀藉Δ鐘妽閻忥箓寮ㄧ憴鍕亣闁告粌鐬煎﹢锛勨偓鍦仱閵嗗妫冮～顓狀伇闁煎嘲顕▓鎴﹀灳濠婂嫭锛夐幖杈鹃檮閺侇噣宕欐ウ璺ㄐ柛?+ 闁哥喎妫欓崺娑㈠几閸曨剙鐏囬柣婊庡灠濞?+ 闁哄牃鍋撻弶鈺傚灣濮橈箓寮伴幘骞库偓鍐冀鐏忔牑鍋撳┑鍕ㄥ亾?

### Docs

- **LoadingShell 闁告艾鏈鐐电棯閿曗偓閻ｇ偓绋夋惔锝咁暭闁哄牜鍓濋鍥亹閺囩喐绾柡?*:
  - 闁哄洤鐡ㄩ弻?`docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md`闁挎稑鐭佽棢闁?Dashboard 濡炪倗鏁诲鎵嫬閸愨晜娈婚悗鍦嚀濞呮帡濡存担钘夊壒闁哄拋鍨伴敍鎾朵沪閸屾稑鐏楁俊顖椻偓铏仴濡炪倕鎼花顓㈠籍鐠佸湱绀夐煫鍥ф嚇閵嗗繘宕ョ仦缁㈠妱闁哄洤鐡ㄩ弻濠勨偓鐢垫嚀缁?LoadingShell 闁汇劌瀚～澶愬礆濞嗗秮鍋?
  - 闁哄洤鐡ㄩ弻?`docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁挎稑鏈弻濠冩櫠?V2.3.93 閻犱焦婢樼紞宥夊Υ?
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.13`闁?

### Verified

- `npm.cmd --prefix web run typecheck`
- `git diff --check -- web/src/features/dashboard/components/themes/DashboardLoadingShell.tsx docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md CHANGELOG.md`

## 2.3.92 - 2026-04-05

### Changed

- **缂備胶鍠嶇粩瀵哥矓鐠囨彃袟缂佹棏鍨抽悺顐︽焻婢舵劖妗ㄩ柡澶庢硶濞堟垿鎳涢鍕毎濞戞柨顦崟楣冨嫉閸繂鐎奸柟骞垮灪閻楀崬顕?*:
  - 闁哄洤鐡ㄩ弻?`web/src/components/shared/FloatingFilter.tsx`闁挎稑鐬间簺闁告柣鍔庨?`CustomPeriodPicker` 闁衡偓闁稖绀嬮柣鈺佺摠鐢瓨寰勫鍥ㄦ殢 `YearStepper` 濞?`MonthStepper`闁?
  - 闁煎浜滈悾鐐▕婢跺顦ч梻鍌滅節缁楀宕樺鍕枏闁活潿鍔夐埀顒佺矊閸曠偓绂掗崐鐔虹炕闁稿繈鍎查、?+ 闁哄牆鐗呴崬銈嗙▔鐎ｎ偄顎欓梺顐㈩槹鐎氥劑鍨惧┑鎾剁闁归潧顑嗗┃鈧紒鏃戝灟缁″啴寮ㄧ憴鍕亣濞戞挸瀛╅、鎴︽閵忋埄浼傚☉鎾亾闁煎嘲顕▓鎴濐啅閿曗偓瑜版悂骞愭径鎰唉婵縿鍎寸换姗€宕氶崶銊ュ簥闁?
  - 濞ｅ洦绻勯弳鈧柣婊呭濠€渚€鐛崘鎻掗叡缂佹稒鐩埀顒€顦粭鍛村箯婢跺鐟㈤柟鍏肩矌閸屻劍娼忛幘鍐插汲闁挎稑濂旂划搴ㄥ绩鐠哄搫缍撴鐐茬摠濠€鈧柛鎺戞处瀹曞弶绂嶉妶鍕瀺闁?

### Docs

- **闁稿繐褰夐棅鈺冪驳濞戔懇鍋撴径濠冪彜濞存嚎鍊撶花鎵棯閿曗偓閻ｇ偓绋夋惔锝咁暭闁哄牜鍓濋鍥亹閺囩偞鍊辨慨?*:
  - 闁哄洤鐡ㄩ弻?`docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md`闁挎稑鐭佽棢闁稿繐鎳愪簺闁告柣鍔庨顒勫礂閸欐﹢鐓╃紒娑欑洴閳ь剙顦▍鎺撴償閺傚墽鍠橀柛蹇撶墕椤︽煡鎮介妸銉ュ瑎闁哄牆鐗婇鐐存交濞戞ɑ鐝ら柣銊ュ鐎瑰磭鈧鍝庨埀?
  - 闁哄洤鐡ㄩ弻?`docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁挎稑鏈弻濠冩櫠?V2.3.92 閻犱焦婢樼紞宥夊Υ?
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.12`闁?

### Verified

- `npm.cmd --prefix web run typecheck`
- `git diff --check -- web/src/components/shared/FloatingFilter.tsx docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md CHANGELOG.md`

## 2.3.91 - 2026-04-05

### Changed

- **濞ｅ浂鍠栭ˇ鍙夘渶濡鍚囧☉鎾愁煼椤ｄ粙骞€閺勫浚娼斿銈囨暩閻☆偊鏌呮径瀣檨閻忕偛鍊哥槐鎴﹀礂閸愬樊鍤ら柤閿嬫綑濞存鎮伴妸鈺佹濠㈣泛绉归崳鍝ョ磼?*:
  - 闁哄洤鐡ㄩ弻?`web/src/features/dashboard/components/themes/DefaultDashboard.tsx`闁挎稑鑻惃銏ゅ矗閸忓懐鐟撻悷娆愬笧閻☆偊鏌呮径瀣檨閻忕偛鍊诲▓鎴濐嚕閳ь剟宕楀畷鍥﹂柟顑挎缁?Dashboard 闁搞儲宕橀妴鍐╃▔鐠佸磭绉煎☉鎿冨幗婵爼宕欓幁鎺嗗亾?
  - 濮掓稒顭堥缁樼▔婵犳凹鏆☉鎾诡唺缂嶅寮ㄩ柅娑滅閻犱焦婢樼换鍌炲礌閺嶎剦娼掗柛銉ュ⒔缁秵绂掔拋鍦闁瑰灚鎸哥槐鎴﹀箣閺嵮冨綘闂傚偆鍘鹃悺顐︽焻婢跺鐧侀悘鐐插€瑰鍌涚▔瀹ュ懎鏅欓悽顖ゅ濞煎啴寮幘顔衡偓?Recharts 闁搞儲宕橀妴鍐╃▔閳ь剛鎸ч悜钘夋闁哄倻澧楃憰鍡涘蓟閹炬墎鍋?
  - 婵炴挸鎳愰幃濠冾渶濡鍚囧☉鎾愁煼椤ｄ粙宕橀崨顓炲殥濠㈡儼椴搁弲銉╂儍閸曨剚锛?Popover 闂侇剚顨堥弳鈧柣妯垮煐閳ь兛妞掔粭宀勫嫉椤忓啫鈻忛柣顫妽鐢鐥崠锛勭闁衡偓鐠哄搫缍撶憸鐗堟尭婢х娀宕娆戭伇闁汇垻鍠愰弲銉╂儍閸曨偄褰欏ù婊庡亝閸嬫挸霉椤斿墽鎽ｉ梺顐㈩槸濞呮帡宕楅妷銉ョ稉闁?

### Docs

- **缂佹稒鐩埀顒€顦▍鎺戙€掗崣澶屽帬缂佹拝绠戦悾鐐▔鎼达絽顣奸柡鍫墲椤斿洩銇愰弴鐐村€辨慨?*:
  - 闁哄洤鐡ㄩ弻?`docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md`闁挎稑鐭佽棢闁稿繐鎳忛埀顒佹椤秵銇勯悽闈涘毐 UI 婵炴惌鍠栭惇鏉款嚕閳ь剟宕楀畷鍥﹂柟顑胯兌濞堟垿姊鹃弮鍌ょ€茬紒鎾呯畱閻ｉ箖濡?
  - 闁哄洤鐡ㄩ弻?`docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁挎稑鏈弻濠冩櫠?V2.3.91 閻犱焦婢樼紞宥夊Υ?
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.11`闁?

### Verified

- `npm.cmd --prefix web run typecheck`
- `git diff --check -- web/src/features/dashboard/components/themes/DefaultDashboard.tsx docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md CHANGELOG.md`

## 2.3.90 - 2026-04-05

### Changed

- **濞ｅ浂鍠栭ˇ鍙夘渶濡鍚囧☉鎾愁煼椤ｄ粙骞€閺勫浚娼斿銈呭悁閺呰埖娼忕憴鍕焿閻犲搫鐤囧ù鍡欐偖?Dashboard 閻犱警鍨抽弫閬嶅触鐏炵虎鍔勯柟韬插灩瀹?*:
  - 闁哄洤鐡ㄩ弻?`web/src/features/dashboard/components/DashboardPageShell.tsx`闁挎稑鏈弫鍦玻閸曨兘鍋撻弰蹇ｆ綌濡炪倝娼ч崬鎾焾?`router.replace` 闁汇劌瀚闁告瑦鍨跺顖涚闊祴鍋?
  - 闁绘粍婢樺﹢顏堝矗椤忓嫭韬悹浣告健濡爼宕氶幍鏂ュ亾濠娾偓缁楀矁銇愰幘鍐差枀濞戞挸顭烽。鑺ョ▔瀹ュ嫮顏遍柤椋庤ˉ閳ь剚绻勫▓?Dashboard 闁哄倸娲ｅ▎銏ゅ触瀹ュ懎鐒奸柛姘Х閻箖鎮芥潏銊︻槯闁归潧绉烽崵婊堝礉閵娧呯湴婵繐缍囩槐婵囩▔瀹ュ懎鏅欓柛锔哄妽閻楀鎹勯姘辩獮 `/` 闁圭鍊藉ù鍥触鎼达絿褰岄柛鎺撴閻戯箓宕?`/<Dashboard闁哄倸娲ｅ▎銏ゅ触?`闁?
  - 闂侇剙鐏濋崢銈嗩渶濡鍚囧☉鎾愁煼椤ｈ姤绗熻缁旂喖寮借箛鏇炰化闁告垼顔婄粭宀勫箑閺勫浚娼斿銈勭祷閻箖鎮介崡鐐村€辨慨婵勫劦閳ь剚妲掔欢顐ょ博閻愭壆鎸ㄩ柨娑樿嫰閸ｈ櫣浜搁幋锔绘禃闁告垼顕ф导鎾诲矗閹寸偞锟ラ柛婵嗙Т缁ㄦ煡宕畝鍕┾偓澶愭閵忕姴鐎奸柟骞垮灩濞嗐垺娼婚悢绮瑰亾?

### Docs

- **濞戞挸顭烽。鐣屾崉椤栨粍鏆犵紒鎾呯畱閻ｇ偓绋夋惔锝咁暭闁哄牜鍓濋鍥亹閺囩偞鍊辨慨?*:
  - 闁哄洤鐡ㄩ弻?`docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md`闁挎稑鐭佽棢闁稿繐鎳忛悧鎾礂閵夈儱缍?`/` 濞?Dashboard 闁哄倸娲ｅ▎銏ゅ触瀹ュ懎鐒奸柛姘Х閻箖鎮芥潏鈺傜暠闁哄牃鍋撻柡鍌涘椤㈡垶绋夋ウ娆惧殯闁哄嫬绨洪埀?
  - 闁哄洤鐡ㄩ弻?`docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁挎稑鏈弻濠冩櫠?V2.3.90 閻犱焦婢樼紞宥夊Υ?
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.10`闁?

### Verified

- `npm.cmd --prefix web run typecheck`
- `git diff --check -- web/src/features/dashboard/components/DashboardPageShell.tsx docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md CHANGELOG.md`

## 2.3.89 - 2026-04-05

### Changed

- **闁告艾鏈鐐寸▔婵犳凹鏆俊妤€妫欓悘锕傚棘閸ャ劊鈧倿鎯冮崟顔捐缂佸妲掔粩鐔兼偩瀹€鍐惧殯闁?*:
  - 闁哄洤鐡ㄩ弻?`docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md`闁挎稑鐭佽棢闁稿繐鎳庣紞瀣礈瀹ュ棭鍔€鐎殿喖绻掗弫鎾诲极閸垺鐣遍柛鎾崇Ф椤忣剟鎯勯鑲╃Э濞?`web/src`闁靛棔绀侀幃妤冪博椤栨粍绐楃憸鐗堟磻鐠?`server/src`闁?
  - 闁哄嫬娴烽垾姗€寮介崷顓熺獥鐟滅増娲樺Λ?`src/` 闁告瑯浜濆Σ鍛婃交娴ｇ洅鈺呭触鎼达絾鐣遍柛妯烘瑜拌泛鈻撶€ｎ剚娈岄柨娑樺缁楀宕樺鍛笒閻犱礁鎽滈幋椋庣磼椤撶喎顥為弶鐐跺Г椤掓粌顕ｈ箛鏃傜埍闁活喕闄嶉埀?
  - 婵炴挸鎳愰幃濠囧嫉椤掆偓濠€鏉戔枔鐎ｎ剚娈岄柣銊ュ閳?`src/server` 闁烩晩鍠栫紞宥夋晬瀹€鍕級闁稿繐绉堕幋椋庣磼椤撯槅鍤栭悗鐢靛帶缁辨垿宕ｉ幋锝囩唴鐎垫澘瀚崹浠嬪棘椤撴壕鍋?

### Docs

- **闁绘鐗婂﹢鎵媼閺夎法绉块柛姘湰椤?*:
  - 闁哄洤鐡ㄩ弻?`docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁挎稑鏈弻濠冩櫠?V2.3.89 閻犱焦婢樼紞宥夊Υ?
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.9`闁?

### Verified

- `git diff --check -- docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md CHANGELOG.md`
- `Test-Path src`

## 2.3.88 - 2026-04-05

### Changed

- **闁告艾娴烽顒傜磼閻旀椿鍚€闂佺偓宕橀惌鍓х矙閸愯尙鏆伴柟顑倻鐟㈤柟顒佹椤秹鎳曞顒佸€ら柟顑棗鍘村ù鍏济€?*:
  - 闁哄倹婢橀·?`server/src/main.ts` 濞戞搩鍘惧▓?`/api/dashboard/summary`闁挎稑鐬奸弫閬嶅触鎼达綆浼傚☉鎾亾婵炲棌鍓濋埀顑棔绮甸柛姘墛閳ь剚妲掗～宥嗐亜閸偄顣查梻鍥ｅ亾闁轰胶澧楀畵渚€鏁嶇仦鐐濞寸媴绲芥晶鐘电博椤栨俺瀚欓柛娆愬灦鐎氶箖骞?9 濞戞搩浜濈敮鎾矗閿濆啠鍋?
  - 濞ｅ浂鍠栭ˇ?`/api/metrics/consumption/summary` 閻?`platform`闁靛棔姊梥earch` 闁汇劌瀚幏鐑芥偩閵夆晜锛栧Λ鐗堬公缁辨繈鐛幆鍏绋?`accountId` 缂佺嫏鍐ㄧ劶闁汇劌瀚悡锛勬嫚閵忊剝鏆柛娆欑祷閳?
  - 濞ｅ浂鍠栭ˇ鎻掆槈閸絽鐎紓浣哄枙椤撴悂濡存担鐣屻偒濞存籂浣插亾娴ｇ浜堕柦鍐ㄥ閳ь兛绶氶。鈺冪不濡ゅ啰鎼煎Δ鍌涳耿椤ｅ墎鎷犵拠鎻掔悼闁规亽鍎辫ぐ娑㈡儍閸曨喖顦╅柟瀵告焿鐎垫牠宕舵潏鍓х闂侇剙鐏濋崢銈嗗緞濮樺啿顦╅柟鎾敱閺嗙喖骞戦鍊熺┛闁哄被鍎埀?
  - 閻?`/api/budgets` 濞?`/api/budgets/alerts` 濞寸姴绨堕埀顒佺矋閻︼繝寮堕敓鐙€鏆曠紒鐘炽仦缁旀潙鈻?aggregate闁炽儲绻冮弫鍏肩▔鐞涒檧鍋撳鍐ㄧ婵炲枴銈庡殺闁告瑦鐗楅弫顕€宕欐潪鐗堝攭闁哄嫭鎸搁幃妤呭嫉椤掆偓濠€瀛樺緞瀹ュ洦鏆忓Λ鏉垮閻ｅ宕戦妷銉﹀€ｉ悹渚婄磿閻ｅ鍨惧┑鎾剁闁告绮敮鈧?N+1 闁哄被鍎撮妤呭Υ?
  - 缂佸顭峰▍搴♀槈閸絽鐎柟顒佹椤秹骞掗妷銉ョ稉濞戞搩鍘惧▓鎴︽煂瀹ュ拋妲?`console.time` 閻犲鍟抽惁顖滄媼閳╁啯顦ч柨娑樿嫰閸ｈ櫣浜搁幋婵婂珯闁告瑦鍨奸顒€效閸屾稒顦ч柣銊ュ濡晞绠涘Δ鈧▍鏃堟閻愯В鍋?
  - 闁哄洤鐡ㄩ弻?`web/src/features/dashboard/data-loader.ts`闁挎稑鏈埀顒佹椤秵銇勯崹顐ｆ毉濞戞捁娅ｅú鍧楀箳閵夛妇啸閻犳劘顫夐弻濠囨儍閸曨偅鍊电紒鏃戝灥娴犳盯宕ラ崼鐔峰闁告瑱绲婚埀?

### Docs

- **缂佸鍟块悾楣冨箑瑜岀粭宀勫箑瑜戦崗姗€骞掗幒鎾跺弨闁哄倸娲﹂妴鍌氼嚈閻戞ǜ鈧?*:
  - 闁哄倹婢橀·?`docs/闁告艾娴烽顒傜矙閸愯尙鏆伴柟顑倻鐟㈤柟顒佹椤秹骞€瑜戦崗妯诲濡搫顕х€殿喒鍋撻柛娆愬灦閺嬪啫顩?md`闁挎稑鐭侀鍥亹閺囩喐鎷辨繛鍡忓墲閸欏啴寮婚妷顭戝殑闁哄鍎茬花顕€濡存担鐟板闁告瑱绲鹃弫褰掑矗閿濆洨鎽滈柣锝冨劙缁楀本顨ョ仦鐐毆缂備焦鎸婚悘澶愬Υ?
  - 闁哄洤鐡ㄩ弻?`docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁挎稑鏈弻濠冩櫠?V2.3.88 閺夆晜绋戠€瑰磭鎷嬮弶璺ㄧЭ闁?

### Verified

- `npm.cmd --prefix server run build`
- `npm.cmd --prefix web run typecheck`
- `npm.cmd run build`
- 闁哄牜鍓欏﹢鎾倻椤撶啿鍋撴担绋跨婵?`/api/dashboard/summary` 缂?`86ms`

## 2.3.87 - 2026-04-05

### Changed

- **缂佸顭峰▍搴ㄥ箑閺勫浚娼斿銈呭悁缁楀绠涢崨閭︽矗闁汇劌瀚划鎾礉閵婏附钂?*:
  - 闁?`web/src/features/dashboard/components/themes/DefaultDashboard.tsx` 濞戞搩鍘句簺闂?`minHeight: "100vh"` 閻犱礁澧介悿鍡涘Υ?
  - 闂侇剙鐏濋崢銈夊礃閸涱収鍟囬柡鍫海缁夋挳宕欐ウ娆炬綊闁告瑱绲惧鍌炲礄閾忕懓绠涘鑸电煯缂嶆垿鎯冮崟顒傛硦闁告柣鍔嶅顖炲Υ?

## 2.3.86 - 2026-04-05

### Changed

- **缂佸顭峰▍搴ㄥ箑閺勫浚娼斿銈囨暬缁垳鎷嬮妶鍕槣濡増顭囧▓鎴︽倶閹峰苯顥忛柤鍐叉湰濞呮瑧浠?*:
  - 闁?`web/src/features/dashboard/components/themes/DefaultDashboard.tsx` 濞戞搩鍘句簺闂傚嫨鍊曢ˇ鑽や沪閸屾凹鍟囬柛锝冨妿濞堟垿鎮橀幏灞筋棌闁煎啿鏈▍娆撴嚌?`#F5F6FA` 闁告粌鑻〒鍓ф喆閹烘挾澹夌€殿喖绻堥埀?
  - 濡炪倗鏁诲浼存偝閺夋寧韬ù锝堟硶閺併倝鏌呰箛鏃€顫栭柤鍐叉湰濞呮瑩鏁嶇仦鐐函濠靛倽妫勫﹢鎾懚瀹ュ懎寮抽柡浣虹節缂嶅绋夋繝姘兼毌闁?

## 2.3.85 - 2026-04-05

### Changed

- **濞ｅ浂鍠栭ˇ鏌ュ箑閺勫浚娼斿銈夋涧閸欏繘鏌堥妸锔筋槯闂傚倸顕悺顐︽焻婢跺寒鍤栭柛銉у仱閳ь兘鍋撻柛鎺斿濠€浼村嫉?*:
  - 濞ｅ浂鍠楅?`web/src/features/dashboard/data-loader.ts` 闁汇劌瀚悡锛勬嫚閵忕姷绉哄☉鎾亾闁告牗鐗犻埀顒佹缁额偊濡?
  - 闁绘粍婢樺﹢顏呯閸涱厽韬悗鐟拌嫰閸欏繑绋夊鍕倞 query 闁哄啳鍩栨晶鐘虫媴鐠恒劍鏆忓娑欘焾椤撳寮甸浣圭畱闁哄被鍎撮妤呮晬濞戞绉奸柟顒佹椤秵銇勯悽绯曞亾婢跺顏ラ柍銉︾矊閸欏繘鏌堥妸锔筋槯闂傚倻琛ラ埀顒佺箖濡炲倿鏁嶅畝鈧埞鏍儍?`startDate/endDate` 濞村吋淇洪～锔界┍濠靛牊娈屽☉鎾愁儐濞肩敻鏁嶇仦鑲╃憹闁告劕绉烽～锕傛煥濞嗘帩鍤栭悷鏇炴濞插﹥绋夐悜妯绘嫳闁哄牆鐗嗙亸顖炴⒒濞ｎ兘鍋?

### Docs

- **濞戞挸顭烽。浠嬪棘閸ャ劊鈧倹绋夋惔锝咁暭闁哄牜鍓濋鍥亹閺囩偞鍊辨慨?*:
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.8`闁挎稑鐭佽棢闁稿繐鎳夐埀顒佺矊閸欏繘鏌堥妸锔筋槯闂傚倻琛ラ埀顒佺箘閻☆偊鏌呮径灞剧暠缂佸苯鎼亸顖炴⒒閺夋埈妲遍柣鐐叉鐎瑰磭鈧鍝庨埀?
  - `docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁靛棔姊桟HANGELOG.md` 闁告艾鏈鐐垫媼閺夎法绉块柡鍫墯椤愯偐鎮伴妷銈囶伈濞ｅ浂鍠栭ˇ鏌ュΥ?

### Verified

- `npm.cmd --prefix web run typecheck`
- `git diff --check -- web/src/features/dashboard/data-loader.ts docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md CHANGELOG.md`

## 2.3.84 - 2026-04-05

### Changed

- **闁诡剚妲掗～宥嗐亜閻㈢數鎽ｉ梺顐㈩槹鐢挳宕楅妷褎鍩傞悗鍦仦閺嗙喖骞戦鐣屽弨閻?*:
  - 闂佹彃绉撮崯?`web/src/features/dashboard/components/DashboardPageShell.tsx`闁挎稑鐭佽棢濮掔粯鍔栧Λ鈺呭嫉閻旇櫣鎽ｉ梺顐㈩槶閳ь兛娴囬崵婊呪偓瑙勭煯缁犵喖寮崼鏇燂紵闁靛棔绀侀柦鈺呭矗閺夋寧瀚查柛蹇斿▕閺侇厾鎷犲鍥﹂柟顑跨筏缁辨繈鐛捄鐑樿含缂佹稒鐩埀顒€顦ぐ澶愬礌閺嶃劍顦ч梺鎻掔У閺屽﹪宕濋悩鐑樼グ闁诡剚妲掗～宥夊极閻楀牆绁﹂柕?
  - 闂佹彃绉撮崯?`web/src/features/dashboard/data-loader.ts`闁挎稑鏈弻濠冩櫠?`DashboardQuery`闁挎稑鏈弫顕€骞愭担鐟扮樆闁哄啨鍎插﹢锟犲礌濞差亝锛熼柕鍡曠椤曨喖袙閺傚灝闅橀梻鍌涚暘閳ь兛绀侀柦鈺呭矗閺夋寧瀚查柛蹇斿▕閺侇厾鎷犲鍡欏弨閻犲浂婢佺槐婵嬪触鐏炵偓顦ч柟绋款槹閻擄紕鎷犻姀鈩冭拫濞寸姾鍩栨刊鍫曞礆閸℃瑧澶勯悗娑欙耿閺侇參濡?
  - 闁哄洤鐡ㄩ弻?`web/src/features/dashboard/components/themes/DefaultDashboard.tsx` 濞?`web/src/themes/dashboard-registry.tsx`闁挎稑鏈俊鎼佸礂閸欐﹢鐓╃紒娑欑洴閳ь剙顦▍鎺楁儍閸曨厼笑闁诡兛妞掔粭宀勫炊閻愬墎娈剁紓浣堝懐鏁鹃梺顐㈢箣缁卞爼宕氭导瀵稿笡閻犱降鍊撶€靛本锛愬Ο鐑╁亾閺勫浚娼斿銈囧仯閳?

### Docs

- **濞戞挸顭烽。浠嬪棘閸ャ劊鈧倹绋夋惔锝咁暭闁哄牜鍓濋鍥亹閺囩偞鍊辨慨?*:
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.7`闁挎稑鐭佽棢闁稿繐鎳忛埀顒佹椤秵銇勯棃娑樺綑濞存粠鍋嗛悺顐︽焻婢跺﹥鐝ら柣銊ュ濠€锛勨偓鍦仦鐢鐥幐搴㈢厵鐎殿喖绻堥埀?
  - `docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁靛棔姊桟HANGELOG.md` 闁告艾鏈鐐垫媼閺夎法绉块柡鍫墯椤愬ジ骞€閺勫浚娼斿銈囨暩閻☆偊鏌呮径瀣缂佹儳銇橀幈銊﹀緞瀹ュ啠鍋?

### Verified

- `npm.cmd --prefix web run typecheck`
- `git diff --check -- web/src/features/dashboard/data-loader.ts web/src/features/dashboard/components/DashboardPageShell.tsx web/src/themes/dashboard-registry.tsx web/src/features/dashboard/components/themes/DefaultDashboard.tsx docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md CHANGELOG.md`

## 2.3.83 - 2026-04-05

### Changed

- **闁稿繐褰夐棅鈺呭箖椤掍浇鐧佺紒娑欑洴閳ь剙顦▍鎺旀偘閵夆晝绉烽梻鍫㈠仜瑜板牓骞掕濮橈附绂?*:
  - 闁?`web/src/components/shared/FloatingFilter.tsx` 濞戞搩鍘虹拹鐔煎籍閵夛附鍩傜紒娑欑洴閳ь剙顦埀顑挎祰閸ゆ粎鈧鐭粻鐔煎籍閸洘锛熼柕鍡曠闁解晠宕ｉ弶鎸庡闁稿繑濞婇弫顓犳嫚瀹ュ煻澶嬵瀲閹邦剙缍€闁?/ 闂傚牏鍋涜ぐ鍫ュ箳瑜嶅璇参熼垾宕囩闁绘鍩栭埀顑胯兌椤撴悂鎮堕崱鎰ㄥ亾?
  - 鐟滅増鎸鹃崺妤併亜閻㈠憡妗ㄩ柛娆樹簷缁?`isOpen`闁靛棔姊梠nOpenChange` 缂佹稑顦悢鈧痪顓涘亾闁告瑥鍊归弳鐔兼嚀鐏炵偓寮撳ù鑲╁Х閻☆偊鏌呮径濠冪閻犲鍟鍌炴晬鐏炴崘鐧侀悘鐐插€风槐浼存嚊椤忓嫬袟闁搞儳鍋ら埀顑藉亾闁告帗婢橀崬鎾焾閵娧冃﹂柟顑跨筏缁辨繈鏌嗛崹顔煎赋闁诡剚妲掗～宥嗐亜娴ｅ啰绠圭紒顐ょ帛鐢挳宕楅妷銉︾皻闁哄拋鍨伴崵顓㈡偝閻楀牆鐦婚梺绛嬪枤閸嬶綁宕欑紒妯伙骏闁告繂绉寸花鏌ュΥ?
  - 濮掓稒顭堥缁樼▔婵犳凹鏆柟顒佹椤秵銇勯棃娑辨Щ闁活潿鍔岄崣鈩冪椤愩倗鎽ｉ梺顐㈩槸濞呮帡宕ユ惔顖滅婵炴惌鍠栭惇浼村礃閸涱垱鐣遍柍銉︾矋濠€浼村嫉?/ 闁稿繈鍔戦崕鎾籍閸洘锛?/ 闁煎浜滈悾鐐▕婢跺棌鍋撳┑鍛鞍闁告瑥锕ら崟鐐婵劏鍋撴担瑙勭畱濞寸姾妫勯崹蹇涘箲閵忊€崇樆闂佺瓔鍠氶獮鍥捶閵娾晛鍘撮柛娆樺灟娴滄帒顫㈤敐鍛煑濞存嚎鍊撶花浼村Υ?

### Docs

- **濞戞挸顭烽。浠嬪棘閸ャ劊鈧倹绋夋惔锝咁暭闁哄牜鍓濋鍥亹閺囩偞鍊辨慨?*:
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.6`闁挎稑鐭佽棢闁稿繐鎳庨崣鈩冪椤愶絽浜炬繛鎼枤閻☆偊鏌呮径濠冪彜闁汇劌瀚敮鎾礂閵壯冾唺閻庤鍝庨埀?
  - `docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁靛棔姊桟HANGELOG.md` 闁告艾鏈鐐垫媼閺夎法绉块柡鍫墯椤愬ジ宕楅崣姗€鐓╃紓浣稿濞嗐垺绌遍纰辨Щ闁?

### Verified

- `npm.cmd --prefix web run typecheck`
- `git diff --check -- web/src/components/shared/FloatingFilter.tsx docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md CHANGELOG.md`

## 2.3.82 - 2026-04-05

### Changed

- **闁告艾娴烽顒勬儎椤旇偐绉块柡鈧捄鍝勭稉闁告帞澧楅悧鎾儎椤旇偐绉?`server/`**:
  - 閻忓繐妫楃敮?`src/server/` 闁告艾娴烽顒€顔忛妷褉鏌ら柡浣虹節缂嶅娼绘担鐩掆晠宕氶悧鍫㈠闁烩晩鍠栫紞?`server/`闁挎稑濂旂换姘舵偩?Prisma闁靛棔娴囬崜濂稿嫉椤戦敮鍋撴担鍦埍闁活喕闄嶉埀顑跨劍缁佸鎷犻弴姘辩憿鐎圭寮惰ぐ浣圭閵堝棛鈧垰顕欐潪浼寸崜闁绘せ鏂傞埀?
  - 闁哄洤鐡ㄩ弻濠囧冀閸︻厽绐楃憸?`package.json` 闁?`dev:server`闁挎稑鐬肩划鐑樼▔閳ь剚绂?`server/` 闁告凹鍨版慨鈺呭触鎼达綆浼傞柕?
  - 闁哄洤鐡ㄩ弻?`docker-compose.yml`闁靛棔姊?github/workflows/ci.yml`闁靛棔姊?github/workflows/deploy-non-docker.yml` 濞?`server/scripts/deploy-linux.sh`闁靛棔姊梥erver/scripts/deploy-windows.ps1`闁挎稑鐬肩划鐑樼▔閳ь剟寮ㄩ柅娑滅鐎殿喗娲滈弫銈夊冀閸︻厽绐楃憸?`server/`闁?
  - 闁哄洤鐡ㄩ弻?`README.md` 濞戞挸楠哥紞瀣礈瀹ュ嫮鐭濆ù锝堟硶閺併倝鎯冮崟顔剧缂備礁鐡ㄩ弸鍐浖閿濆繒绀夌紒澶婎煼濞呭海鈧?`src/server/` 闁汇劌瀚獮鍥╂偘瀹€鍐惧殯闁哄嫬绨洪埀?

### Docs

- **闁烩晩鍠栫紞宥夊绩鐠哄搫缍撻柡鍌氭处閵嗗倿宕ョ仦缁㈠妱**:
  - 闁哄倹婢橀·?`docs/闁告艾娴烽顒勬儎椤旇偐绉块柡鈧捄鍝勭稉鐎殿喒鍋撻柛娆愬灦閺嬪啫顩?md`闁挎稑鐭侀鍥亹閺囩偞鍊电紒鏃戝灥缁鸿偐绮旈弰蹇撶槺闁搞儲鐣埀顑跨瑜板牐銇愰崡鐐存儥闁稿繈鍎辫ぐ娑㈠Υ娴ｇ懓鈷旈悶娑樻湰椤掔偞顨ラ妶鍛濡ょ姴鏈弫褰掑冀閸パ冩珯闁?
  - 闁哄洤鐡ㄩ弻?`docs/闁告挸绉堕顒勬儎椤旇偐绉块柡鈧捄鍝勭稉鐎殿喒鍋撻柛娆愬灦閺嬪啫顩?md`闁挎稑鑻惃顒勬偋閸喐鎷遍柛妤€娲ㄦ鍥礆?`v1.0.2`闁挎稑鑻惃銏ゅ嫉閳ь剛绱掗崼婊呮尝閹煎瓨鎸剧划銊╁几閸曨剚鏆柛鎰懁鐠?`web/ + server/`闁?
  - 闁哄洤鐡ㄩ弻?`docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁挎稑鏈弻濠冩櫠?V2.3.82 閺夆晜绋戠€瑰磭鎷嬮弶璺ㄧЭ闁?

### Verified

- `npm.cmd --prefix server run build`
- `npm.cmd run build`
- `git diff --check -- package.json docker-compose.yml README.md CHANGELOG.md docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md docs/闁告挸绉堕顒勬儎椤旇偐绉块柡鈧捄鍝勭稉鐎殿喒鍋撻柛娆愬灦閺嬪啫顩?md docs/闁告艾娴烽顒勬儎椤旇偐绉块柡鈧捄鍝勭稉鐎殿喒鍋撻柛娆愬灦閺嬪啫顩?md .github/workflows/ci.yml .github/workflows/deploy-non-docker.yml server/scripts/deploy-linux.sh server/scripts/deploy-windows.ps1`

## 2.3.81 - 2026-04-05

### Changed

- **闁哄唲鍐枀缂佹棏鍨冲ú鎷屻亹閺囩噥鍔€鐎殿喖绻愰崹褰掓⒔閵堝懓瀚欓弶鈺€绀侀崣鍡涘嫉婢跺娅忕€瑰壊鍠栫槐?*:
  - 闁?`web/src/components/shared/AuthGate.tsx` 濞戞搩鍙€钘熼柛?`setAuthUser`闁挎稑鏈弫顕€骞愭担鐑橆仮鐟?婵炲鍔岄崬浠嬪箣閹邦剙顫犻柛姘捣濞插潡骞掗妷锔芥殘闁稿繈鍎抽弫銈夊箣妞嬪海澶勯悗娑櫱滈埀?
  - 闁?`web/src/app/auth/login/page.tsx` 濞戞搩鍘芥禒顔藉緞?`setAuthUser(data.user)` 濞?`router.prefetch(next)`闁?
  - 闁?`web/src/app/auth/register/page.tsx` 濞戞搩鍘芥禒顔藉緞?`setAuthUser(data.user)`闁?
  - 閻?`web/package.json` 闁汇劌瀚悗顖氼嚈妤﹀灝澹栭柡鍫墮閸ㄥ繘骞戦～顓＄ `next build --webpack`闁挎稑鐭侀～澶愭焼?Next.js 16 Turbopack 闁?`/_global-error` 濡澘瀚憰鍡涘蓟閹剧粯鈻夋繛鍫㈡暩濞堟垿寮搁崟顐ょ处鐎殿喖鍊搁悥鍫曞Υ?
  - 閻忓繐妫欓悧鎾儎椤旇偐绉?`package.json` 闁?`build` 闁衡偓闁稖绀嬪┑顔芥⒐婢ь參骞嶈椤?`cd web && npm run build`闁挎稑鐬肩划鐑樼▔閳ь剟寮搁崟顐ょ处闁稿繈鍎辫ぐ娑㈠Υ?
  - 闁告帞濞€濞呭酣寮介崷顓熺獥鐟滅増娲樺Λ顐﹀礈瀹ュ浂浼傛繝褎鍔楅悥婊堟儎椤旇偐绉?`src/app`闁靛棔姊梥rc/components`闁靛棔姊梥rc/features`闁靛棔姊梥rc/lib`闁靛棔姊梥rc/themes`闁靛棔姊梥rc/types`闁?
  - 闁告帞濞€濞呭酣寮介崷顓熺獥鐟滅増娲樺Λ顐﹀礈瀹ュ浂浼傞梺鏉跨Ф閻?`components.json`闁靛棔姊梟ext.config.ts`闁靛棔姊梩sconfig.json`闁靛棔姊梟ext-env.d.ts` 闁?`public/`闁?

### Docs

- **闁衡偓鐠哄搫缍撻柡鍌氭处閵嗗倻鈧懓鏈崹姘跺箑娴ｅ憡鍊辨慨?*:
  - 闁哄洤鐡ㄩ弻?`README.md`闁挎稑鏈Σ鎴犳兜椤旇崵娉㈤幖瀛樻尭閸戔剝绋夊鍛櫃濞ｅ洦绻勯弳鈧柡鍐勫啫顤呯紒鏃戝灡缁噣鎯嶆担椋庣憿闁哄唲鍐枀缂佹棏鍨遍悗顖氼嚈濞差亜甯崇紓鍐惧枔閳?
  - 闁哄洤鐡ㄩ弻?`docs/闁告挸绉堕顒勬儎椤旇偐绉块柡鈧捄鍝勭稉鐎殿喒鍋撻柛娆愬灦閺嬪啫顩?md`闁挎稑鏈弸鍐浖閿濆懐姣堥柣妤€鐗婂﹢浼村础閸モ晠鐛撻柛?`v1.0.1`闁挎稑鐭侀鍥亹閺囩偟鏉介梻鍕嚀缁哄ジ宕楅妷褎鐣辩€瑰壊鍠栫槐鎾寸▔鎼粹€冲殥闁告帞濞€濞呭酣鎯勯鑲╃Э闁?
  - 闁哄洤鐡ㄩ弻?`docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁挎稑鏈弻濠冩櫠?V2.3.81 閺夆晜绋戠€瑰磭鎷嬮弶璺ㄧЭ闁?

### Verified

- `npm.cmd --prefix web run typecheck`
- `npm.cmd --prefix web run build -- --webpack`
- `npm.cmd run build`
- `git diff --check -- README.md CHANGELOG.md docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md docs/闁告挸绉堕顒勬儎椤旇偐绉块柡鈧捄鍝勭稉鐎殿喒鍋撻柛娆愬灦閺嬪啫顩?md web/src/app/auth/login/page.tsx web/src/app/auth/register/page.tsx web/src/components/shared/AuthGate.tsx Dockerfile package.json web/package.json`

## 2.3.80 - 2026-04-05

### Changed

- **闁告挸绉堕顒勬儎椤旇偐绉块柡鈧捄鍝勭稉濞戞挸瀛╁Λ顐﹀礂閵夈儱缍撻悹鍥х摠濡叉垹鎮伴妷鈺冪Х**:
  - 闂佹彃绉撮崯鎾诲冀閸︻厽绐楃憸?`README.md`闁挎稑鏈Σ鎴犳兜?`web/` 濞戞挸鎼紞瀣礈瀹ュ懏鏆滃☉鎾亾闁汇垻鍠愰弲銉╂儍閸曨偄顤呯紒鏃戝灣濞叉媽銇愰弴顏嗙`src/server/` 濞戞挸鎼紞瀣礈瀹ュ懏鏆滃☉鎾亾闁汇垻鍠愰弲銉╂儍閸曨偅鍊电紒鏃戝灣濞叉媽銇愰弴妯峰亾?
  - 濞ｅ浂鍠楅婊堝冀閸︻厽绐楃憸?`Dockerfile`闁挎稑濂旂划鐘崇閹惧磭姘ㄩ柡宥堫潐閻庮垰顕欓悜妯活槯闁烩晛鐡ㄧ敮鎾箥閹惧啿鐦?`web/` 闁告挸绉堕顒勬晬瀹€鍕級闁稿繐绉堕幋椋庣磼椤撶儐妲婚柛鎺曞煐濡偊寮介崷顓熺獥鐟滅増娲栨晶鐘电博椤栨瑩鐛撻柣妞绘櫈閻儳顕ラ崟鈹惧亾?
  - 闁哄倹婢橀·?`docs/闁告挸绉堕顒勬儎椤旇偐绉块柡鈧捄鍝勭稉鐎殿喒鍋撻柛娆愬灦閺嬪啫顩?md`闁挎稑鑻ù鎰板礌?`src` 濞?`web/src` 闁汇劌瀚伴崳鎼佸矗閻樼數鍩犻悹浼壋鍋?7 濞戞搩浜滈崹搴ㄥ矗婢跺鐎ù鐘烘硾閹蜂即宕ユ惔锝囨暰闁告帞濞€濞呭孩銇勯崫鍕闁?

### Docs

- **闁烩晩鍠栫紞宥嗘交娴ｇ洅鈺呭棘閸ャ劊鈧倸顕欓悜妯糕偓?*:
  - 闁哄倹婢樼紓?`docs/闁告挸绉堕顒勬儎椤旇偐绉块柡鈧捄鍝勭稉鐎殿喒鍋撻柛娆愬灦閺嬪啫顩?md`闁挎稑鏈弸鍐浖閿濆懌浜ｉ柣妤€鐗婂﹢鐗堢▔?`v1.0`闁挎稑鑻惃顒勬偋閸喐鎷卞☉?`v1.0.0`闁?
  - 闁告艾鏈鐐哄即鐎涙ɑ鐓€ `docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁挎稑鏈弻濠冩櫠?V2.3.80 閺夆晜绋戠€瑰磭鎷嬮弶璺ㄧЭ闁?

### Verified

- `npm.cmd --prefix web run typecheck`
- `git diff --check -- README.md Dockerfile CHANGELOG.md docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md docs/闁告挸绉堕顒勬儎椤旇偐绉块柡鈧捄鍝勭稉鐎殿喒鍋撻柛娆愬灦閺嬪啫顩?md`
- 闁稿繈鍔嬬划?`git diff --check` 濞寸姴绉撮悺銊╁捶閵娿倗鐟㈤柡鍫墲閻ゅ棝寮悩鎻掑綘闁?trailing whitespace闁挎稑鐭傚▔锔界▔椤撶偞韬?`src/features/dashboard/components/themes/DefaultDashboard.tsx` 濞?`闁硅翰鍎甸弫?txt`

## 2.3.79 - 2026-04-05

### Changed

- **闁诡剚妲掗～宥嗐亜閸偒鍔€鐎殿喖绻戦弫鍏肩▔?Dashboard 闁哄倸娲ｅ▎銏ゅ触瀹ュ牏鐔呴柣?*:
  - 闁哄倹婢橀·?`web/src/app/(dashboard)/[dashboardEntry]/page.tsx`闁挎稑濂旀繛鍥箑閺勫浚娼斿銈夋涧瑜版煡鎯勭€涙ê澶嶉梺顐ｄ亢缁?`/<Dashboard闁哄倸娲ｅ▎銏ゅ触?` 閻犱礁娼″Λ鍫曟晬鐏炶偐浼愬┑?`/DefaultDashboard`闁?
  - `web/src/app/(dashboard)/page.tsx` 闁衡偓闁稖绀嬮柡宥囨嚀閸欏棝宕ｉ敐澶堚偓澶愭晬鐏炶棄顫ｉ弶鐐舵閹瀵煎顓炵樆鐟滅増鎸告晶鐘崇▔婵犳凹鏆柤濂変簻婵晝鎹勭€圭姵绁柛鎺撴緲椤曨喗鎯旈弮鍌涚暠 Dashboard 闁哄倸娲ｅ▎銏ゅ触瀹ュ牏鐔呴柣顫┒閳?
  - 濞撴皜鍡欑彾闁哄秴绻堥埀顑胯兌浜涢柛鏂诲妿椤忣剚鎯旈弴銏犲姤閻庝絻澹堥崺鍛村Υ娓氣偓閵嗗宕橀崨顔藉仢缂佷究鍨归幏鎵崉椤栨粍鏆犲Λ鏉垮閸庡綊宕ョ仦缁㈠妱闂侇偄鍊块崢銈夊棘閹殿喗鐣遍柟顒佹椤秶鎹勯婊勬殸闁挎稑濂旂粭澶愬礃瀹ュ嫮璐╅悹褎鐗犻妴澶愭閵忊€崇倒缂佲偓閻戞ɑ钂嬮柕?

### Docs

- **濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐐寸€俊妤嬬到閹挸顫㈤妷锔界函闁?*:
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.5`闁?
  - 閻炴稏鍎遍崢鏍嫚鐎涙ɑ顫栭柟顒佹椤秵銇勯悽闈涚疀鐎规瓕灏欏ú鍧楀箳閵夈倕鈻忛柣?`/<Dashboard闁哄倸娲ｅ▎銏ゅ触?` 閻犱警鍨抽弫閬嶆晬鐎?` 闁告瑯浜欑紞鏃€绋夋ウ鍨闁告柣鍔忛悜锔芥姜椤掆偓閸欏棝宕ｉ敐鍐ｅ亾?

### Verified

- `npm.cmd run typecheck`

## 2.3.78 - 2026-04-05

### Changed

- **闁诡剚妲掗～宥嗐亜閸偅鐎ù鐘烘硾閹洟骞撻幇顔轰粵闁衡偓闁稖绀嬮悹渚灣閺侀亶宕橀崨棰佺矒閻忕偞娲滈妵?*:
  - `web/src/app/(dashboard)/page.tsx` 閻忓繐妫楄ぐ鍛婄▔鐎ｎ収娼￠柟顕呭墯鐠囩偤骞撻幇顔轰粵闁衡偓闁稖绀嬪銈囨暬濞肩増銇勯崼鏇炲姤闁汇劌瀚崬鎾嚂閺冣偓瑜颁胶绮堥悜妯昏拫闁挎稑鐭傛导鈺呭礂瀹ュ绱曢柟绯曞墲閳ь剚妲掗～宥嗐亜閻㈢數鎽ｉ梺顐㈩槹鐎垫粓鏌﹂琛″亾?
  - 缂備綀鍛暰濞ｅ洦绻勯弳鈧憸鐗堟尭婢?`themeId` 闁告粌鑻悿鍕⒔閸涱厽鍤掑☉鎿冨幘濞?Dashboard 闁哄倸娲ｅ▎銏ゅ触瀹ュ繒绀夐柡鍌炩偓娑氣敀闁烩晛鐡ㄧ敮瀛樼鎼淬倗鐔呴柣銏や憾閵嗗鈧鐭紞鍛偓鐢垫嚀缁ㄦ煡骞€閺勫浚娼旈柡鍌氭矗濞嗐垽濡?

### Docs

- **濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐐寸€俊妤嬬到閹挸顫㈤妷锔界函闁?*:
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.4`闁?
  - 閻犲洤鐡ㄥΣ鎴ｃ亹閹惧啿顤呴柟缁樺姉閵囨艾顔忛崣澶嬫毉濞戞捇缂氶惌楣冩偨闁秲鈧﹪鏌堥妸銉ユ暥闁艰鲸鏌ㄩ惈宥囩矆閻氬绀夊☉鎾崇Т閸熲偓濞达綀娉曢弫銈夊矗閸忓懐鐟撻悷娆愬笚鐠囩偟浠﹂崒妯峰亾?

### Verified

- `npm.cmd run typecheck`

## 2.3.77 - 2026-04-05

### Changed

- **闁诡剚妲掗～宥嗐亜閸偅鏆☉鎾存そ閵嗗妫冮姀鐘茶閻熸瑤鐒﹀Ο澶岀矆閸濆嫮绉奸柛?Dashboard 闁哄倸娲ｅ▎銏ゅ触?*:
  - `web/src/app/(dashboard)/page.tsx` 闁哄倹婢橀·鍐嚕閳ь剟宕ｉ幋鐐╁亾娴ｇ绀佸☉鎾愁儓椤?`Dashboard Source` 婵炴惌鍠栭惇浼存晬瀹€鈧ú鍧楀箳閵夛附鈻旂紒鈧崫鍕Ъ闁告挸绉崇€靛本锛愬Ο鐑樺殥濞戞搩鍘惧▓鎴﹀箑閺勫浚娼旈柡鍌氭矗濞嗐垽宕ュ鍐ｅ亾?
  - 婵炴惌鍠栭惇浼村触鐏炵偓顦ч柡鍕⒔閵囨俺銇愰幘鍐差枀 `themeId`闁挎稑鏈弻鐔哥瑹鐠恒劉鈧鎷嬮妶鍌楀亾濠婂啰绉奸柛鎾崇С鐎靛本锛?-> 閻庡湱鍋ゅ顖炲箑閺勫浚娼旈柡鍌氭矗濞嗐垽鍨惧┑鍫熺暠闁哄嫮濮撮惃鐘诲礂瀹曞洭鍏囬柕?

### Docs

- **濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐐寸€俊妤嬬到閹挸顫㈤妷锔界函闁?*:
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.3`闁?
  - 閻炴稏鍎遍崢鏍嫚鐎涙ɑ顫栫憸鐗堟尭婢х娀骞€閺勫浚娼旈柡鍌氭矗濞嗐垽宕ュ鍥х疀闁革负鍔嬬槐浼村捶閵娿儳纾婚柛娆愬灩楠炲棙鏅堕崘褑鍘柣鈺佺摠鐢挳寮伴崜褋浠涢柛锔哄姂閵嗗妫冮姀鐘茬濞戞挸顑堥～妤呭Υ?

### Verified

- `npm.cmd run typecheck`

## 2.3.76 - 2026-04-05

### Changed

- **web 闁告挸绉堕顒勭嵁鐠虹儤绀€濞戞捁顔婄划銊︽償閹惧墎鍩犲☉鎾亾閺夆晛鈧喖鍤?*:
  - 閻忓繐妫欓悧瀛樼閹惧磭姘ㄥ☉鎿冨幘濞?`web` 濞?gitlink 闁烩晩鍠栫紞宥囨嫬閸愨晜娈诲☉鎾跺劋濞呮﹢鏌呭顒€缍€缂佺媴绱曞ú鎷屻亹閺囶亞绀夐柛姘捣閻㈠宕滃鍥朵紓闁衡偓閻熸澘袟闁告瑯鍨冲ú鍧楀箳閵夆晜顓瑰☉鎾诡唺缁劍鎯旈幘鏉戠倒濞存嚎鍊曢幏浼村箳閵娾斁鍋撴担纰樺亾?
  - 閻炴稏鍎电紞鍫ュ冀闁稓娉㈤幖瀛樻尭椤?`web/.next`闁靛棔姊梬eb/playwright-report` 缂佹稑顦晶鐘电博椤栨瑩鐛撻柣妞绘櫇濞堟垼绠涢悾灞炬閻熸瑥瀚崹顖炴晬瀹€鍕級闁稿繐绉撮懟鐔哥閹捐櫕鍊甸悹鍥跺灡瑜颁焦绂嶉妶鍡欌偓顖氼嚈妤﹁法缈婚柛鎴炰航閳?

### Docs

- **濞戞挸顭烽。浠嬪棘閸ャ劊鈧倹绋夋惔锝咁暭闁哄牜鍓濋鍥亹閺囩偞鍊辨慨?*:
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 閻忓繐绻掓晶妤呭嫉椤掆偓瀹曞瞼鐥閸?`v2.1.2`闁挎稑鐭佽棢闁?`web/` 鐎瑰憡褰冮懟鐔煎炊閻愭澘鐦滃ù鐘虫尭缁ㄨ京绱掗悢鍓侇伇缂佺媴绱曢幃濠囨儍閸曨噮鍤涢柡鍕昂閳?
  - `docs/鐎殿喒鍋撻柛娆愬灱缁绘ɑ鎯?md`闁靛棔姊桟HANGELOG.md` 闁告艾鏈鐐垫媼閺夎法绉块柡鍫墯椤愬吋绂掗幘宕囨皑缂備焦鎸婚悗顖滄嫬閸愨晜娈婚柕?

### Verified

- `npm.cmd run typecheck`

## 2.3.75 - 2026-04-05

### Changed

- **闁诡剚妲掗～宥囨崉椤栨粍鏆犻悶娑栧劚閸樻牞銇愰幘鍐差枀 Dashboard 闁哄倸娲ｅ▎銏⑩偓瑙勭煯缂嶅懏绌遍埄鍐х礀**:
  - `web/src/app/(dashboard)/page.tsx` 闁哄倹婢橀·?`data-dashboard-entry-file`闁挎稑鑻ぐ鏌ユ儎鐎涙ê澶嶉柣顏勵儏閸╁矁銇愰幘鍐差枀濞戞挸顭烽。鐣屸偓鍦仱濡绢垶宕ㄩ幋鎺曞幀闁汇劌瀚埀顒佹椤秹寮崶锔筋偨闁告艾绉查埀?
  - 閻犱警鍨抽弫閬嶅礂閵夈儱缍撻柛姘湰濡炲倸顕ｉ弴鐐插汲 `getDashboardEntryFileName(themeId)`闁挎稑鐭侀鈧柍銉︾矊缂嶅宕滃鍕槣濡?-> 閻庡湱鍋ゅ顖炲箑閺勫浚娼旈柡鍌氭矗濞嗐垽鍨惧┑鍫熺暠閻庤鐭紞鍛存煣閹规劗鐔呴柡鍥ь嚟濞插潡骞掗妷锝傚亾?

### Docs

- **濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐐寸€俊妤嬬秬钘熼柛蹇撴噺閳ь剚妲掗～宥夊棘閸ワ附顐介柛娆忕У閻擄紕鎷犵€涙ɑ顫?*:
  - `docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md` 闁告娲ㄦ鍥礆?`v2.1 / v2.1.1`闁?
  - 閻炴稏鍎遍崢?`page.tsx -> getDashboardEntryFileName(themeId) -> DASHBOARD_ENTRY_FILES -> [ThemeName]Dashboard.tsx` 闁汇劌瀚悡锟犲箥閹规劗鐔呯€垫澘瀚ㄩ埀?

### Verified

- `npm.cmd run typecheck`
- `npm.cmd run build` 濠㈡儼绮剧憴锕傛晬濮濅骏xt.js 闁革负鍔戦。鈺併€掗崣澶屽帬 `/_global-error` 闁哄啳鍩栨慨蹇涘礄?`Expected workUnitAsyncStorage to have a store`

## 2.3.74 - 2026-04-05

### Changed

- **濞戞挸顭烽。鐣屽寲閼姐倗鍩犻柡鈧柅娑滅濞戞挸顦惇浼村礆閸℃绲洪柡瀣煐閻?*:
  - 闁哄倹婢橀·?`web/src/themes/theme-manifest.ts`闁挎稑鑻惃?Dashboard 闁告瑦眉缂嶅濡存稉鐖€ader闁靛棔璁debar闁靛棔鑳朵簺闁告柣鍔庨顒傗偓浣冨閸╁懘宕仦鐓庣槣濡増锕㈤。鈺冩喆閸儺妫戦柡宥堝亹缁儤绋夐埀顒勫绩鐠哄搫缍撻柛鎺斿鐢鐥崹顔炬勾闁?
  - 闁哄倹婢橀·?`web/src/themes/dashboard-registry.tsx`闁挎稑鐭傚▔锔界▔椤撶媭鍚€闁?Dashboard 闁告柣鍔嶉埀顑跨婵偞娼懞銉︽殘闁告劕鐭侀妴鍐晬瀹€鈧簺闂傚嫨鍊栭埀顒佹椤秵銇勯棃娑樺汲闁告瑱绲奸懙鎴︽儍閸曨垱姣愬☉鎾瑰紦鐎靛本锛愬Ο缁樿拫濞寸姾娉涢崹搴ㄥ绩椤栨ǚ鍋?
  - `web/src/components/shared/Header.tsx`闁靛棔姊梬eb/src/components/shared/Sidebar.tsx`闁靛棔姊梬eb/src/components/shared/MobileBottomNav.tsx` 濞?`web/src/app/(dashboard)/themes/page.tsx` 闁衡偓闁稖绀嬪ù鍏济崢娑氭嫚鐠囨彃绲?manifest闁挎稑鐭侀埀顒€濂旂粭澶愬及椤栨粍鍩涚紓渚囧幘濞插潡骞掗妷銉ョ伈闁哄偆鍘虹€靛本锛愬Ο鐑樺€抽柕?

### Docs

- **濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐐寸€俊妤嬬到閹挸顫㈤妷銉ョ３缂?*:
  - 闂佹彃绉撮崯?`docs/濞戞挸顭烽。钘夘嚕閳ь剟宕ｉ幋鐑嗘敱闁哄鍩栭弸鍐浖?md`闁挎稑鏈婊冾嚕韫囨挸鐎奸柟璇℃線鐠?`token -> manifest -> registry -> shared pages / dedicated overrides` 闁汇劌瀚鈺呭及鎼淬垺鐓欑€殿喖绻堥埀?
  - 閻炴稏鍎遍崢鏍棘閺夋鏉诲☉鎾愁煼椤ｈ棄顫㈤妷鈺娾偓鍐Υ娴ｇ褰欏ù婊庡亰閵嗗骞忛崱妤€鐎婚弶鍫濇贡閺咁偊濡存稉寤皊hboard 婵炲鍔岄崬鐣屾喆閸曨偄鐏熼柛婊冭嫰瀵棄螣閳ュ磭纭€婵炴挸鎳庡畷鐔煎Υ?

### Verified

- `npm.cmd run typecheck`
- `npm.cmd run build`

## 2.3.73 - 2026-04-04

### Fixed

- **濞ｅ浂鍠栭ˇ鐫styBlueDashboard闁哄瀚紓鎾绘煥濞嗘帩鍤?*:
  - 濞ｅ浂鍠栭ˇ?`web/src/features/dashboard/components/themes/DustyBlueDashboard.tsx` 濞戞搩鍘惧▓鎴犳嫚椤撶喓銆婇梺鎸庣懆椤曘倝濡?
  - 濞ｅ浂鍠栭ˇ?categories useMemo 濞戞搩鍘藉﹢顓㈡⒒椤撶偞鍊ら柣?if 閻犲浂鍘艰ぐ鐐烘晬鐏炴儳娼戦柛鏃傚Х瀹歌鲸寰勬潏鈺傜暠 return 閻犲浂鍘艰ぐ鐐哄椽鐏炶偐璐╅悹褎鐗楅弳鐔虹磼閸曗斁鍋?
  - 閻熸瑱绲介崰?"Expected ',', got '<eof>'" 闁哄瀚紓鎾绘煥濞嗘帩鍤栭柕?

### Verified

- TypeScript缂侇偉顕ч悗宄拔涢埀顒勫蓟閵夆斁鍋撳宕囩畺闁挎稑鏈Λ銈夋煥濞嗘帩鍤?

## 2.3.72 - 2026-04-04

### Modified

- **濮掓稒顭堥缁樼▔婵犳凹鏆柟顒佹椤秵銇勯悽鍛婃〃"閺夆晜鍨跺﹢锟犲绩閼稿灚鏆?婵☆垪鈧櫕鍋ラ柡鈧柅娑滅濞存嚎鍊栧Σ妤呭及鎼达絿鐭庨悶?*:
  - 闁哄洤鐡ㄩ弻?`src/features/dashboard/components/themes/DefaultDashboard.tsx`闁挎稑鑻惃顢痭comeExpenseCard缂備礁瀚▎銏＄鎼淬垺鏆柡鈧娑辨搐閻熸瑥鐗婇弫鍏肩▔鏉炵増鍞夐柡鍕尰濡叉垹绱掗崱姘モ偓鍐Υ?
  - 闁哄嫬澧介妵姘跺嫉閳ь剚娼?闁哄鈧弶鍞夐柡鍕崄椤斿洩銇愰弴顏嗙闁告牕鎳庨幆鍫熺閵堝棙顫滅紒顐ヮ嚙閻庣兘濡存担绋跨€荤紒顐ｇ湽閳ь兛鐒﹀鍌炴⒒濞ｎ兘鍋撴担鍛婃珜闁瑰瓨鐏氶埀顑跨窔閸ｇ偓锛愬┑鍡樺妤犵偛鍟胯ぐ瀛樼┍閳╁啩绱栭柕?
  - 濞达綀娉曢弫銈夊础閿涘嫬顣荤€殿喖绻愮粩椋庝沪閳ь剟鏁嶇仦鍓фЖ闁哄銈庡敹鐟滅増娲樺Ο澶岀矆閻戞ɑ鏆柛?闁衡偓椤栨艾姣夐柛銉у亾閻栵綁濡存担绋跨€荤紒顐ょ帛閻栵絿绮垫穱鎵佸亾娴ｈ顦ч梻鍌氱摠閸╂垿宕畝鍕濡増绺块埀?
  - 闁衡偓椤栨稑鐦紒宀冩婵悂骞€娴ｅ摜娼旂紒鈧悮瀵哥鐟滅増鎸婚惀鍛村嫉婢跺鍞夐柡鍕崄椤斿洩銇愰弴鐔割槯闁哄嫬澧介妵姘跺矗鐎ｎ亗鍋ㄩ柣銊ュ瑜颁胶绮堟潪棰佺箚闁诡収鍨埀?
  - 婵烇綀顕ф慨?闁哄被鍎冲﹢鍛村礂閵娾晛鍔?闁圭顦甸幐鎶芥晬鐏炵偓鐓欏〒姘虫硶閺併倝骞嬮悿顖滃劜閺夌儐鍓欓崺灞解槈閸絽鐎銈囨暬濞间即寮婚妷褎绠欓悗鐟版湰閺嗭絿鎷嬮弶璺ㄧЭ闁?
  - 闁告帞濞€濞呭孩绋夊鍛櫃濞达綀娉曢弫銈夋儍閸掝湯tMonthOverMonthMeta闁告垼濮ら弳鐔煎椽鐎涱湑M_BADGE_CLASS閻㈩垱鎮傞崳娲Υ?

### Verified

- TypeScript缂侇偉顕ч悗宄拔涢埀顒勫蓟閵夆斁鍋撳宕囩畺闁挎稑鏈Λ銈夋煥濞嗘帩鍤?

## 2.3.71 - 2026-04-04

### Modified

- **濮掓稒顭堥缁樼▔婵犳凹鏆柟顒佹椤秵銇勯悽鍛婃〃闁搞儲宕橀妴鍐礉閻旇鍘撮悗鐟拌嫰閺?*:
  - 闁哄洤鐡ㄩ弻?`src/features/dashboard/components/themes/DefaultDashboard.tsx`闁挎稑鑻惃銏ゅ储閻斿憡鎷卞☉鎾规閳规牗绔熼崘鑼綌缂佲偓閾忚鐣遍柛銉﹀礃閵嗗啯娼诲☉妤冾伇婵縿鍎辩槐鎴﹀矗閹存粏绀嬮柛蹇涙敱濠€浣衡偓鍦仱濡绢垶宕濋悢璇插幋闁汇劌瀚ぐ鑼喆閸℃顕ф俊顖椻偓铏仴闁?
  - 闁衡偓绾懐绠绘繛鎴濈墣閸ㄥ倿寮搁崟顒€鐏囬柛銉﹀礃閵嗗啴鎯冮崟顑熶線骞忛悢鍛婃闁硅鍠曠拹鐔哥▔椤撶喐鐎柨娑樻湰瑜颁線宕￠崶鈺傛殢闁圭娓圭紞瀣殽鐏炵儵鍋?
  - 闁哄倹婢橀·鍐嫉閸繂顔婇柡鈧懜鍨殰閻℃帒顑呮繛宥夊炊閹规劑鈧啴鏁嶇仦鐣屾綌缂佲偓妤﹁法绠?濞戞搩浜濆﹢鈧柣銊ュ閺佸綊宕楅妷锝傚亾娴ｈ鏆滈柛鎴濇惈閹锋壆绱掗幘鑼▏闁告瑦锚鐎佃尙鎼剧€ｎ亜鈼㈤柨娑樺婵炲洭鎮介妸锕€顫戠紒鎯х仢濞存鈧湱鍋熼獮鍥Υ?
  - 闁哄倹婢橀·鍐導閸曨亪鐛撻悹鎰枎閳ь剛鍎ら惁顔界瑹鐎ｎ亜璁查悷娆忔鐎垫煡鏁嶇仦鐓庘枏闁活潿鍔戦妶濂稿炊閹呮綌缂佲偓妤﹁法銈ù婧犲倻鐟㈤悹鎰枎閳ь剝娅ｅ▓鎴犫偓浣冾潐閻︻噣鏁嶇仦鍊熷珯闁哄嫬澧介妵姘辨嫻閻斿皝鍋撻搹鐟拌姵闁圭娲﹂悥锝夊Υ?
  - 闁哄倹婢橀·鍐磼閵娿劍鎯堥弶鈺傜☉鐎规娊宕ｉ婵愭綊闁告牗鐗槐婵嬪及閸撗佷粵闁哄牜鍓氬﹢鈧柛灞诲姀閹碱偊鎮抽崶顏嗘濞寸厧搴滅槐婵嬪礌閸涱喖顏弶鈺傜☉鐎规娊寮堕垾铏闁稿被鍔忛幖顐⒚规担绋垮汲婵炵繝绀侀崵顓㈠箚閸涱厼鏋岄柕?
  - 濞村吋锚鐎靛弶锛愰崟顓犳毈闁圭瑳鍡╂斀闁诡垰鎳庨崰宀€浠﹂弴鐘粵闁挎稑鏈崸濠囧礉閻曟ΠdgetFocusPanel缂備礁瀚▎銏ゆ晬鐏炵晫娼旂紒鈧ú顏呬粯閻熸洑妞掔槐顓㈠礂閸繍妲遍柣鐐叉濞堟垶锛愰崟顓犳毈濡炪倕绠嶉埀?
  - 闁圭鍋撻柡鍫濐槸濞存鎮伴妸銉︾秵闁衡偓椤栨稑鐦柛婵嗙Т缁ㄦ彃顕ｈ箛姘煎晭閻犱讲妲勭槐婵嬪捶閵婎灝鈺呭礉閵娧屼紓闁告粌鏈、鎴︽閵忋埄浼傞梺顔垮Г濠€渚€鎳濋姘ュ仺闁汇劌瀚惈宥囩矆閻戞ɑ娅忛柡瀣殠閳?

### Verified

- TypeScript缂侇偉顕ч悗宄拔涢埀顒勫蓟閵夆斁鍋撳宕囩畺闁挎稑鏈Λ銈夋煥濞嗘帩鍤?

## 2.3.70 - 2026-04-04

### Modified

- **濡ゅ倹顭囨鍥礆閸℃鈧粙骞€閺勫浚娼斿銈勭祷钘熼柛蹇嬪妿濠€锛勨偓鍦仜濞存鎮伴妸銉ユ暥閻?*:
  - 闁哄洤鐡ㄩ弻?`web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`闁挎稑鑻惃銏ゅ储閻斿憡鎷卞☉鎾规閳规牗绔?濞戞棁浜悥婊堟儍閸曘劉鍋撳鍫濇濠㈣泛绉电粔椋庢嫻閸忓鍋撳┑鍡楃€婚柡瀣姇瀹曢亶鎮ч崶銊︽毉濞戞捁銆€閳ь剚绮撻崳鍛婂緞瀹ュ懏娅岄柟纾嬫腹缁楀矂姊块崱鏇″幀閹艰揪闄勯埀顒佹椤秹鍨惧┑鍕ㄥ亾?
  - 闁哄倹婢橀·?4 濞戞搩浜濋埀顒佹椤秹骞愰崶銊у灱闁告せ妲勭槐婵堜沪閺囩姰浠涢梺鎻掔Т椤︽煡宕崱妯虹厱闁告濮甸惁顕€濡存担鎼炰粓闂侇喓鍔岄弲銏ゅ箣瀹勬澘绐楁慨锝嗘煟閳ь兛绀佹晶鐘崇▔婢跺﹥娅岄柟鏉戝槻瀹曟澘袙閺傜儵鍋撴担鎼炰粓闂侇喓鍔岄崹搴ｇ尵鐠囨彃绐楁慨锝嗘煟閳?
  - 閻忓繐妫楃敮顐﹀础閺囨氨顏遍梻鈧鍐ㄥ壖闁搞儳鍋撴晶璺ㄤ沪閺囨俺绀嬮柛娆忚嫰濞存﹢鎳曢弬鍨楅悽顖氬暙閻剟鏁嶇仦鎴掔濞撴皜鍐綌缂佲偓濞差亞褰Λ鐗堝灴閸ｅ憡寰勫鍛珜闁规潙鍤栫槐婵嬪矗閸忓懏娅犻悘鐐存礈閵囨艾鈽夐崼锝呯€梻鍡楁閼垫垶鎯旈敂钘夘€曢悷娆欑秶缁辨繆銇愰姀鈥崇亣闁哄洦娼欓悾顒勫极鐎靛憡鐣卞Δ鍌涱焽妤犲洭宕氶崱妯尖偓浠嬪箑閺勫浚娼旈悷娆忔濞存﹢濡?
  - 缂佸瞼鍎ら弳鐔煎箲椤斿吋绨氶柡鍜佸灡閺佸吋绋夐搹鍦煚濞戞挴鍋撶紒宀冩婵悂骞€娴ｈ櫣鐭嬪ù鐘侯啇缁辨繈骞撻幇顒€纾抽柡鍐У閺嗙喖骞戦鑺ヮ槯闁汇劌瀚ぐ鏌ユ偠閸℃鎺楀箑瑜岀粭灞俱亜閻㈠憡妗ㄩ悗鐟版湰閸ㄦ碍鎯旈敂琛″亾?

### Verified

- `npm run typecheck`

## 2.3.69 - 2026-04-04

### Modified

- **濮掓稒顭堥缁樼▔婵犳凹鏆〒姘€鍡欑彾闁哄秴绻戦弫鍏肩▔閸濆嫬妫橀柤鏉垮暙濞存ɑ顦版惔銏㈠**:
  - 閻犲鍟弳?`web/src/components/shared/Sidebar.tsx`闁挎稑鑻惃銏☆渶濡鍚囧〒姘€鍡欑彾闁哄秴绻戦弫鍏肩▔閻戞ɑ绾紒鎰濞堟垿骞冮浣界檨闁谎冣偓鐔奉棌闁革箑妫滈～妤呮閵忊剝绶查柨娑樼焸閵嗗﹪鏌堥妸銉ヮ潱闁稿繈鍎崇€氼厾绮╃€ｎ厾绠查柛銉у仜濞撻箖鏌﹂鍡欑闁轰胶绻濈紞瀣嫻绾惧绠柛娆忓€介埀顒€鍟ù姗€鎯冮崟顐ゆ勾婵炲棌鈧尙鐟㈡慨锝嗘煣缁躲儵濡?
  - 闂佹彃绉存禒娑氣偓浣冨閸╁懏銇勭憴鍕礋婵炶尙绮埀顑挎缁楀矂骞冮鈧禒鐘诲箑娓氬﹦绀夋繝纰樺亾婵炴彃顭烽妴宥夊绩闁稖绀嬮柦鍐╃箚婢瑰﹤銆掗幇顒€缍侀柤瀹犳硾濞夘厽顨囧Ο鐟扮槰闁挎稑鏈▍姗€鏌呭韬测偓宥夊绩闁稖绀嬮弶鐐差煼閸ｆ椽鎮惧▎鎴烆仱闁哄秴鍢茬槐锟犳晬鐏炲€熷珯閻忓繐妫欏﹢顖滀焊閸欍儴鈷堝☉鎿冧簻婵盯鎳楁禒瀣ㄢ偓宥嗙▔鐎ｎ偆鐒介柛鎺撴緲缁ㄦ娊鏌堥妸銉ㄥ煂闁瑰瓨鍔曢崹搴ｇ磼閸曨偆顏撮悘鐐╁亾闁?

### Verified

- `npm run typecheck`
- `npm run build`
## 2.3.68 - 2026-04-04

### Modified

- **?????????????**:
  - ? `web/src/features/dashboard/components/themes/DefaultDashboard.tsx` ???????????????????????????????????????????
  - ???????????????????????????????????????????????????

### Verified

- ????????????????????

## 2.3.67 - 2026-04-04

### Modified

- **濠殿喗甯掗崐浠嬶綖瀹ュ纭€闁炽儱鍟跨粈浣搞€掑鈧崱娅侯亪鏌涢弬璺ㄤ虎婵炲瓨蓱濞艰鈽夊Δ鍐句紘濠殿喗绺块崕鎶芥偩濠靛绀?*:
  - 闂佸憡顭囩划顖滄暜閳?`web/src/features/dashboard/components/themes/DefaultDashboard.tsx` 婵炴垶鎼╅崢浠嬨€呰閹叉挳宕煎┑鍡楄€块梺鍛婄懃閸樻牠寮查崜浣规儱閻庯綆浜滈埣銏ゆ煕閵夈儱鈷旀繛鍫熷灴瀹曠兘宕卞▎蹇庡寲婵炴垶鎸哥€涒晛锕㈤埀顒€霉閻樺搫袚闁哄鍟伴埀顒佺⊕閵囨粓鍩€?
  - 婵炲濮撮幊宥囨崲濮樿埖鍋╂繛鍡樺灥濞堢娀鏌℃径鍡忓亾閼碱剛鎲块梻鍌氱墑閸ㄦ槒鈪堕柣蹇曞仜閸嬪﹦妲愬┑鍫熷闁宠桨绀侀獮銏ゆ煟濡も偓濞层倛銇愰幖浣哥濠电姴鎳愰悵鍫曟煛閸パ呮憼閻㈩垰鐡ㄥ濠氬箣閻樻彃姣愰柣鐔剁閹虫﹢濡舵导鏉戝瀭閻庯綆鍘炬瓏闂佸憡鏌ㄩ悘婵喢瑰鈧俊?

### Verified

- `npm run typecheck`
- `npm run build`

## 2.3.66 - 2026-04-04

### Modified

- **濠殿喗甯掗崐浠嬶綖瀹ュ纭€闁斥晛鍟弳顓炩槈閹捐櫕鎯堝☉鏂跨箻瀵剟宕惰缁€渚€鏌涢妷銉モ挃缂侇喓鍔戝?*:
  - 闁荤姴顑呴崯顖炲汲?`web/src/features/dashboard/components/themes/DefaultDashboard.tsx` 婵炴垶鎼╅崢浠嬨€呰閹叉挳宕煎┑鍡楄€块柣銏╁灠閸燁偊鎯囬鍕櫖閻忕偟鏅▓娲煕閵壯冧壕闁绘牭绲跨划鏃傛嫚閹绘崼妤呮煕閹烘挻绶插☉鏂跨箲缁嬪绻濋崪浣瑰仴闂佹寧绋戦張顒勫几閸愵煈娴栭柛顐犲劜閼茬姴鈽夐幙鍐ㄥ箹婵犫偓椤忓嫷鍟呴柨鏃€瀵у▍鐘绘煏?
  - 闁诲繐绻愬Λ妤€鐣烽柆宥嗗亱闁搞儜鍐╂殽闂備緡鍠撻崝蹇曠矓婵傜绀夐柛顭戝枟缁傚牆霉閻樻煡顎楃紒銊﹀▕閺屽牓濡搁敂鑺ヮ啋闁荤偞绋戦懟顖滅博妞嬪簼娌柍褜鍓熷銊╂焻濞戞粎顦伴梺鍛婄懃閸熷灝鐣烽幇顓熺秶闁荤喐澹嗗鏃傜磼閳ь剟鎮€靛摜顦梺杞拌兌缁绘繄绱炵€ｎ喖鍗抽悗娑櫭径宥夊级閳哄倸鐏︽繛鎾崇埣瀵剟寮堕崹顔筋棟闂佸吋婢橀崯顐⒚瑰鈧幆鍐礋椤掑倵鍋撻鐐茬倞闁绘劦鍓氶悡娆戔偓娈垮枛缁诲牓鍩€?

### Verified

- `npm run typecheck`
- `npm run build`

## 2.3.65 - 2026-04-04

### Modified

- **闁荤姍鍐伃闁革絽澧介幐褔寮堕崹顔规＆闂佽　鍋撻梺顐ｇ缁€瀣磼缂併垹鐏ｆ繛鍛囧洤鐭楅柛灞剧妇閸嬫捇宕橀妸銉ヨ€块梺缁橆殔濞差參藟閹捐鍐€?*:
  - 闁?`web/src/features/dashboard/components/themes/DefaultDashboard.tsx` 婵炴垶鎼╅崢鎼佸焵椤掍胶鐭庣紒渚囧亰閺屽矂骞嬮敐鍫熷发闂佸憡鏌ㄧ花閬嶅焵椤掍胶绠撴繛瀛橆焽閹即濡搁妷顔兼櫍闂侀潻绲婚崝瀣垝閻樼粯瀚呮繝闈涚墣闂嗚鎱ㄥΟ鑽も槈婵炲弶瀵ч幆鏃堝即閻愯尙鈧ジ鏌熺拠鈩冪窔閻犳劗鍠撻惀顏堫敍濠婂嫷浠遍梺鍛婎殣缁辨洘鏅堕弽顓炲唨鐎瑰嫭澹嗙涵鈧梺鎸庣☉閼活垶鎳熼悢鍛婃珷闁绘劖褰冮～锝夋煕濞嗗繐甯犵紒妤€鍊婚幉鎾箳閺囨碍鍞夐梻浣瑰絻缁绘帡鎮洪锔界劵濠㈣泛楠搁崢锟犳煕閵夈儺鐒鹃柍?
  - 闂佹悶鍎插畷姗€濡撮崘顔肩闁告稒娼欓崝銉╂⒑閹绘帞孝濞寸姵绋掔粙澶愭倻濡鍋撻梺钘夊暞缁哄潡鍩€椤戣法鍔嶇紒璁崇窔閹锋垵鈹戦崟銊ヤ壕濞达綁缂氶梿褰掓煠绾懎绱︾紒妞捐兌娴狅箓宕掑☉姘赋闂佸憡绮岄惌鍌氼焽閹殿喚鐭撴い鏍ㄧ☉椤垹绱掗幆褏浠㈢憸鐗堟瀹曟繈鎮崨顖滎槷闂佽桨鑳剁换婵堢礊鐎ｎ喖鍗抽悗娑櫭径宥夊级閳哄倸鐏︽繛鎾崇埣瀵剟寮堕崹顔筋棟闂佸吋婢橀崯顐⒚瑰鈧幆鍐礋椤撶姵娈曞┑鐐跺紦濡炴帡宕℃惔锝嗗仒闁靛ě鍕紭闁荤偞绋忛崝搴ㄧ嵁閸ヮ剙违?

### Verified

- `npm run typecheck`
- `npm run build`

## 2.3.64 - 2026-04-04

### Modified

- **闁荤姍鍐伃闁革絽澧介幐褔寮堕崹顔规＆闂佺鍩栭…鍥吹鎼淬劌鐐婇柣鎰靛墯閺嗩厼鈽夐幘铏儓鐎殿噮鍓熼幊鎾诲礃閵婏妇顩俊鐐差儏鐎涒晠鎮?*:
  - 闂備焦褰冪粔瀛樼?`web/src/features/dashboard/components/themes/DefaultDashboard.tsx` 婵炴垶鎼╅崢鎼佸焵椤掍胶鐭庣紒渚囧亰閺屽矂骞嬮敐鍫熷发闂佸憡鏌ㄧ花閬嶅焵椤掍胶绠撴繛瀛橆焽閹即濡搁妷顔兼櫍闂侀潻缍嗛悡澶屾濠靛绀夐柣妯诲絻瀵娊鏌﹂崘鈺冪畼閻犵偑鍨归妴鎺楀箛椤掆偓缂嶄線鏌ら崘鍙夋拱婵炲懏鐟╂俊瀛樼瑹閳ь剟鎮甸鈧畷妤佸緞婵犲嫭鍕炬繛鎴炴尭鐎涒晛煤閸ф钃熼柡鍌涘鐎氭煡鏌ｉ妸銉ヮ仼婵炲瓨顭囬幃浼村Ω閿曗偓椤ョ偤寮堕悙鑸殿棄閻忓浚鍨舵俊?
  - 闂佽　鍋撻悹鍝勬惈瀵啿鈽夐幘鍐差劉闁轰緡鍣ｅ畷娆愭姜閹峰备鎷￠梺鍝勵檧缁绘繂顭囬幍顔剧煋妞ゆ牗绋戦～鎴犵磼閻愵剙顕滈柡浣稿悑缁嬪鎮滃Ο鑽ゅ嚱闂佽浜介崕瀵告崲鎼淬劌鐭楅柛灞剧妇閸嬫捇宕橀妸锔绢洯闂佹眹鍔岀€氼剟藝鐠恒劋娌柛灞剧☉閻ㄥ墽鈧懓瀚晶妤呭疾閵夆晛鍑犳繝濠冨姉缁€澶嬵殽閻愯埖纭鹃柟顔芥尭椤垽濡烽妸褎顔嶉梺杞扮劍濞兼瑥顭囧Δ鍛唨闁搞儺浜崣锟犳煏閸℃洝鍏岀紓宥咁樀瀵粙鎳栭埡浣圭枃婵?tooltip 闂佹眹鍔岀€氼厾绮婇鍕殞闁告瑥顦禍鐐箾閹碱厼鏋熼柣妤€宕锝堢疀鐎Ｑ冧壕?

### Verified

- `npm run typecheck`
- `npm run build`

## 2.3.63 - 2026-04-04

### Modified

- **濠殿喗甯掗崐浠嬶綖瀹ュ纭€闂勫洨绮旀總绋跨闁割煈鍠楃粋鍫㈢磼婢跺鐓兼繛鍛叄瀵粯娼忛埡浣囷箓鏌涜椤ㄥ濡撮崘鈺傜秶?*:
  - 闂佸憡顭囩划顖滄暜閳?`web/src/features/dashboard/components/themes/DefaultDashboard.tsx` 婵炴垶鎼╅崢鐓庣暦闁秵鍋嬮柛銉簽姝囬梺鍛婃煥閻忔繂霉濮椻偓閺屽苯鐣濋埀顒€鈻撻幋锕€钃熼弶鍫氭櫅绗戦梺绉嗗嫨浠︾紒妤€鏈濠氭倷閺夋垵顦查梺绉嗗嫷娈ｇ紒杈ㄧ箖缁傛帡宕ㄩ鍌滎啍闂佷紮绲鹃悷锔芥叏瀹€鈧惀顏嗘啑閵堝倸浜惧ù锝堟铻￠梺缁樺姇缁犲秹鍩€椤戣法绐旀繛鍏煎缁棃顢涘杈ㄥ嬀闂佸憡绮岄張顒€锕㈤埀顒€霉閻樺搫袚闁绘牭绲跨划鍨┍閹典礁浜?
  - 闁荤姳璁查弲娑㈠闯閿濆洦灏庨柛鏇ㄤ邯閻涙捇鏌曢崱鏇狀槮闁稿绉归幏鎴﹀礋閳规儳浜惧ù锝囨櫕椤︿即鏌涙繝鍌涙儓闁归澧楅敍鎰板礋椤撶姵姣堟俊顐ｆ緲鐎氼垶顢楅悢鐓庣闁挎稑瀚。鑽ょ磽娴ｅ搫鏋嶇紒鏃€鎸冲銊╂焻濞戞粎顦伴梺鍝勬搐椤曨參宕欓悾灞藉灊闁革富鍘介悾閬嶆偤閹烘埈鍎忓┑鐐茬Ф閻ヮ亪宕归鐐秾缂備讲鍋撻柣姘嚟缁€澶愭⒑椤掆偓閻忔繈宕㈤妶鍥╃＜鐟滃繘鎮芥繝姘闁惧繒鎳撶粻娑㈡煛瀹€鍐у惈濠殿喗鎮傚畷鍫曞箲閹板灚缍嗛梺瑙勫閸犲棝鍩€?

### Verified

- `npm run typecheck`
- `npm run build`

## 2.3.62 - 2026-04-04

### Modified

- **濠殿喗甯掗崐浠嬶綖瀹ュ纭€闁跨喓濮疯ぐ顖炲箹鏉堥箖妾憸棰佺窔瀹曪繝宕惰鐎氭瑩鏌涢幒鎴炲鐎规洖寮剁粙澶愭倻濡绮柡?3 婵炴垶鎼╂禍婵嗭耿閳ь剟鎮洪幒鎴剰濠电偛绉瑰畷?*:
  - 闂佸湱绮崝娆撴偟?`web/src/features/dashboard/components/themes/DefaultDashboard.tsx` 婵炴垶鎼╅崢鐓幟洪幘鎰佸殨闁绘ɑ鍓氬ú銈夋偡濞嗗繒澧曠€规洟浜堕幆鍐礋椤栨粌钂嬮柟鑹版彧鐠侊絿妲愬┑鍫㈢＜婵炲棗绻愰弫鍫曟⒑椤斿搫濮€缂佸銈稿畷婵嬪垂椤旂晫顩梺浼欑稻閻熴儵宕甸銏犲嵆闁哄鍨归弳姘舵煛娴ｅ壊鍤熸繛鍫熷灩娴狅箓寮撮悩顔荤驳闂佸憡鐗曢幖顐︽偂濞嗘挸违?
  - 闁诲繐绻愬Λ妤€鐣烽柆宥嗗亱闁搞儜鍐╂殽闂佹眹鍔岀€氼剚绂嶉弴銏犵倞闁硅鍔戦埀顒€鍟村銊╂焻濞戞粎顦伴梺鍝勭墐閸嬫捇寮?3 婵炴垶鎼╂禍婵嗭耿閳ь剟鏌ｉ妸銉ヮ仾濠殿喖鐬奸惀顏嗘崉閵娿垹浜鹃柟瀛樼箘椤忔挳鎮洪幒鎴剰濠电偛绉归弫宥囦沪閸婄喎鐝梺闈╄礋閸斿瞼鑺遍幎鑺ョ劸闁靛鍓径鎰闁告侗鍠楃粻鎴澝归悩鍝勑撻柣鏍电悼缁灚绌遍幍浣镐壕?
- **闂佸憡顨愮槐鏇熸櫠閺嵮屽殫妞ゆ柨鍚嬬粋鍫ユ偠濞戞牕濡跨紒顔哄姂瀵悂宕熼銏紦缂?*:
  - 闂佸憡顭囬崰搴ㄥ储濞戞瑧顩烽柛娑卞枛婢跺秹鏌涘▎鎰垫當缂傚秴锕ョ粙澶愬焵椤掑嫬绀岄柡宥冨妽濞堝爼鏌涢幒鎿冩畼婵炲牊鍨甸銉╊敊閸忚偐顩柣鐐翠緱閻撳妲愬┑瀣哗闂侇偅绋栫粈瀣煙閹帒鍔滈柡浣哥秺閸ㄦ儳顭ㄩ崟顒傜暠婵?+ 闂佽桨鐒﹀姗€鍩€?+ 閻熸粎澧楃敮濠勭博閹绢喖绀岄柡宓偓閸嬫挾浜搁弽銈呬壕婵犻潧鐗婇悾閬嶆偤閹烘埈鍎忓┑鐐茬Ч瀵偊鎮ч崼婵堛偊缂傚倷鐒﹂幐濠氭倵椤栫偛违?
  - SVG 濠电偞鎸稿鍫曟偂鐎ｎ喖瑙﹂悘鐐佃檸閸斿嫬顭胯閸嬫稒鎱ㄩ悙鍝勭婵☆垳鍘у▓鐘绘煠閸濆嫬鈧宕戦敐澶娢ュ〒姘ｅ亾婵炲吋澹嗙划鏃堫敍濮樿鲸鍕鹃梺鍛婄矊閺堫剙煤閸喓鈧帡宕ㄩ鐣屽酱闂佹眹鍔岀€氼噣鍩€椤掍礁鐏ョ紒鏃傚厴瀹曠螖閸曨厾顔曢梺瑙勪航閸庤崵妲愬┑鍫熷闁冲搫瀚▔鏌ユ煕閺冨洤鍔甸柕鍡楀暞濞煎繘鎮欓浣哄嚱闂佺儵鏅濋ˉ鎰帮綖閸ヮ剙违?

### Verified

- `npm run typecheck`
- `npm run build`

## 2.3.61 - 2026-04-04

### Modified

- **闂佽鍓氬Σ鎺楋綖瀹ュ拋娼￠柛灞剧箥濞兼棃鏌涘鐑╁亾閸愬樊娼遍梺绋跨箞閸庢娊鍩€椤掍礁鐏ョ紒鏃傚厴楠炲洭鎮㈤摎鍌滀亢闂佹悶鍔岄鍛瑰Ο鍏煎仒?*:
  - 闂?`web/src/features/dashboard/components/themes/DefaultDashboard.tsx` 闂佹眹鍔岀€氼剙煤閹炬剚鍤曢柣妯诲墯濞层倝鎮峰▎蹇曞鐎规洟浜跺畷姗€宕ㄩ弶鎴濆Г闂佸憡姊绘慨鎾矗閸℃稒鍊甸柟瀛樼箘椤忔挳鏌?+ 闁烩剝甯掗鍛箾瀹ュ洨妫柛顭戝枛缂嶅矂鏌涢弮鍌毿ユ繛鍫熷灥椤曘儵顢欓懖鈹惧亾閻戣棄鐐婇柟瑙勫姂閳ь剙鍟存俊?
  - 闂佹悶鍎插畷姗€濡撮崘顏呭磯闁绘柨鍚嬮鍦喐閻楀牊灏褏濞€閹锋垵鈹戦崼锝夋祵婵炴垶鎸搁…鐑姐€傛禒瀣闁挎稑瀚。濠氭⒑閺夎法啸濠㈢懓锕弫宥呯暆閳ь剙鈻嶈閹虫繈骞撻幒鎴濊€块梺缁橆殔濞层倝宕归娑欏閻犳亽鍔嶉弳蹇涙煛閸モ晩妫庡ù婧垮€濋幆鍐礋椤栨稓绋堥梺璇茬箲婵姤绔熸繝鍕／闁圭瀛╅拏瀣煥濞戞ê顨欑紒缁樺哺楠炴劖鎷呯憴鍕啋婵炶揪绲鹃幑鍥夐幘璇插唨闂傚倸顕閬嶆煠闁垮鏆橀柍?
- **闂佸憡顨愮槐鏇熸櫠閺嶃劎鈹嶉柍鈺佸暕缁辨牠鎮楅棃娑欘棞閻庣娅曞璇测槈濡ゅ喚浼囧┑顔界缚閸庤尪銇愭笟鈧畷?*:
  - 闂佸搫鍊瑰姗€路閸愵煈娼￠柛灞剧箥濞兼棃鏌涘鐑╁亾閸忓懐淇洪梺鎼炲劜瀹曟﹢濡撮崘顔兼瀬闁绘鐗嗙粊锕傛煟閵忋垹鏋戦柛銊﹀哺閺屽懘寮拌箛鏇炵闂佹寧绋戦惌渚€顢欓埀顒勬煕閹存柨浜鹃柣鐘欏啫顏уΔ鐘叉喘婵″瓨鎷呯粙澶告喚闂佽棄鍟€氥劑鍩€椤戞寧绁扮紒鈧€ｎ喖纾归柛婵嗗鐎氭彃螞閺夊灝顏柣锝囩帛閿涙劙宕熼鍛Τ闂佸憡顨愮槐鏇熸櫠閺嶎厼鎹堕柕濞垮€楅悷婵嗩熆瑜忛崑娑欐叏閻愭潙绶炵憸鏃堝闯濞差亜妫橀柛銉戝懏鎲婚梺姹囧妼鐎氼剚鏅堕悩璇茬闁归偊浜為悷鎾绘煙缂佹ê濮冪紒鍓佹暩閹煎墽鈧綆浜滈埣銏ゆ煙閹殿喖鏋傞柍?

### Verified

- `npm run typecheck`
- `npm run build`

## 2.3.60 - 2026-04-04

### Modified

- **闂佽鍓氬Σ鎺楋綖瀹ュ棎浜滈柣銏㈩焾濞呫垽鏌涚€ｎ偆鐓悹鎰枛閹锋垵鈹戦崼锝夋祵闂佽偐顢婄亸顏呯閵堝鐓傞煫鍥ㄦ尫缁憋絽霉閿濆棛鐭婄憸?*:
  - 闁诲繐绻愬Λ娆撱€侀幋锔筋棃闁靛繈鍩勬导鍌炴煕濮橆剟顎楃憸鏉款嚟閺侇噣宕橀妸褎鎷遍柣鐘差儏閸燁垶寮抽敐鍡欌枖闁惧繒鎳撻崵閬嶆煟瑜庨崹婵嬪疾閼稿灚缍囬悷娆忓閸╁鏌曢崱鏇犲妽缂佷緡鍓熼幃妯伙紣娴ｅ摜妲ｉ悗瑙勬偠閸庢壆绱為弮鍫濈闁告繂瀚€氭煡鏌涘▎蹇撳笭缂佹鍊婚幉鎾箳閺囨碍鍞夐梻浣瑰絻缁绘﹢濡存繝鍥у唨闊洢鍎崇粈澶愭煕濡偐甯涢悽顖楀亾闂佸憡顭囬崰搴ㄥ储濞戙垹绀岄柛娑樺簻缁鳖喚鈧鍠栫换姗€濡存繝鍥ㄧ劸闁靛瀵岄弨鍗灻归敐鍡樺蔼闁?
  - 闂備焦褰冪粔瀛樼?`web/src/features/dashboard/components/themes/DefaultDashboard.tsx`闂佹寧绋戦張顒佷繆閸涘绱旈柡宥庡幑閳ь剙顦靛銊╂焻濞戞粎顦伴柣鈩冨笒椤戝懏绻涘澶婄倞濞ｅ洦澧庨崑鎾存媴閾忚灏濋梺鍝勵儏鐎氼剙霉濮椻偓婵″瓨鎷呯拠鈩冩悙闁荤喐鐟ラ悧鍡楃暦闁秴妞介悘鐐插悑閸炲鏌￠崟顒佸磩闁靛棗鍟扮槐鎺楀礋椤愶絽鈧倝鏌ｉ妸銉ヮ仹闁告娴烽幃浼村Ω瑜庣壕鎼佹偨椤栨艾鏆欓柣顏嶅墴婵?
- **闂佸憡鑹炬姝屻亹鐎靛憡瀚氶悗娑櫳戦～鏍煛閸屾碍澶勬い銏犵Ч瀵偆绱欓悩鐢敌梺琛″亾閻犲搫鎼紞?*:
  - `ThemeSectionHeader` 婵炴垶鎸哥粔鎾疮閳ь剚绻涢幘鍐茬骇闁绘挸顑嗗鍕槼妞ゆ柨鐭傞獮鎾圭疀濮橆剛澧梺鍝勫€稿ú锕€锕㈡导瀛樻櫖閻忕偠鍋愰惌灞角庨崶銊х畼闁哄棌鍋撻梺鍝勭Т濞差參銆傛禒瀣そ閻忕偟鍋撻幆娆徝归敐鍡欑煀闁告瑥妫濆畷锝夋晲閸愶絽浜?
  - 婵炴挻鐨滈崱娆戝骄闂佸搫绉寸换妤勩亹瀹ュ纭€闁哄洨鍋涚粻鐢告煙閸濆嫷妯€闁逞屽墯閸旀瑩濡村鍥ㄥ珰閻庢稒蓱椤?caption闂佹寧绋戦懟顖炲闯閾忛€涚剨闁瑰鍋熷Σ銊モ槈閹垮啩閭柕鍡楊樀濡啴濮€閵堝啠鍋撴繝鍥ㄧ劸闁靛鍎茬€氭煡鎮楁担鍐棈闁糕晛鎳樺畷鐘绘惞鐟欏嫮鏆犻梺鍛婂姈閵囩偟绱為幋鐐殿浄閻庯綆鍓涢惌婵嬫煛閸屾碍鎼愰柣鈯欏洤违?
- **婵帗绋掗…鍫ヮ敇缂佹鈻斿┑鐘冲嚬閺嗩垶鏌￠埀顒勬焻濞戞粎顦伴梺鍝勬搐閻°劎绮╂繝姘亯闁伙絽鏈悾閬嶆煢閸愨晝绠橀悹鐐灪缁嬪寮拌箛鎿冩**:
  - 婵帗绋掗…鍫ヮ敇缂佹鈻斿┑鐘冲嚬閺嗩垶鏌曢崱鏇狀槮闁告瑥绻掓禒锕傚焵椤掑嫬鐐婇柣鎰€€閸嬫捇鍩€椤掑嫬鐭楁慨妞诲亾闁革絿鍎ょ粙?dashboard 濠碘槅鍨埀顒冩珪閸嬨儳鈧鍣ｇ紓姘舵儍閻斿吋鍤岄柟缁樺笚閸婅鲸鎱ㄥ┑鍕姤闁汇劎鍠栧顐ょ礄閻樿櫣顦伴梺钘夊暞缁诲嫮鎸掗姀銏㈢＜闁告洦鍋呴崐銈夋煥濞戞鐏辩紒顔惧劋缁嬪鍩€椤掆偓闇夐柛娑欐緲椤ュ繒鈧鎮堕崕鎵礊閺冨牆鐭楅柡澶庢硶濠€瀛樼箾閸犫剝澹嬮崑?

### Verified

- `npm run typecheck`
- `npm run build`

## 2.3.59 - 2026-04-03

### Fixed

- **婵烇絽娴傞崰鏍囬幓鎺嗘闁割偓绲介悗顓烆渻閵堝嫮绁风紒渚囧亰閺屽矂骞嬮悙鐐瑰亰闂佸憡纰嶉崹宕囩箔鐏炲墽顩查柕鍫濇椤粓鏌￠崟顐ｆ崳缂侇喖绻樺畷鐘绘惞鐟欏嫮鏆犻梺鐟版贡閸犲骸顭?JSX 闂佸搫鍊稿ú锕€锕?*:
  - 婵烇絽娴傞崰鏍?`web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` 婵炴垶鎼╅崣鈧紒渚囧亰閺屽矂骞嬮悙鐐瑰亰闂佸憡纰嶉崹顖炲焵?4 闁诲繐绻愮换鎴濐渻閸岀偛鏋侀柨婵嗘搐娴狀垶鏌涢妷銈呭珟闁逞屽厸缁舵岸宕抽悙顒婄矗婵犻潧妫楅悗濠氭偨椤栨艾鏆旈柍褜鍏涘鎺戭潩閿曞倸鍙婇柟鎯х摠椤牜绱撴担鍛婎棤闁烩剝鍨垮畷鐘诲传閸曨剙浠撮梺姹囧妼鐎氼亞鎷归敓鐘冲剺濞达綀顫夐悗顔戒繆濡も偓閻楀嫰鍩€?
  - 婵烇絽娴傞崰鏍囬懠顒佸仏妞ゆ劧缍€閺変粙鏌＄仦鐐暗婵炲牊鍨垮浠嬪炊椤掑姣屾繛鎴炴尭濮橈箓顢氶埡鍛強閹兼番鍨洪悗顕€鏌￠崼顐㈠⒕缂佽鲸绻堥弻鍡涘垂椤旂厧璧嬮梻鍌氬亞閸樺ジ骞冩惔銊ュ唨闁搞儮鏅╅崝顔剧磽娴ｅ牆鎳愰弫楣冩偠濮樼厧浜為柣妤婂墴瀹曟瓕绠涢幘鐟扮彲闁荤喐鐟辩粻鎴ｃ亹?`Unexpected token`闂?

### Verified

- `npm run build`

## 2.3.58 - 2026-04-03

### Fixed

- **婵烇絽娴傞崰鏍囬幓鎺嗘闁割偓绲介悗顓烆渻閵堝娑ч柡鍛灲楠炲鎮滈懞銉ㄥ亖婵炴垶鎼╅崢铏圭箔瀹€鍕闁糕剝顭囬埀顑跨矙瀹曪繝鏁嶉崟顐毈闂佸憡鐗炲▍锝呪枔閹达箑绠查柣鏃堟敱缂?JSX 闂佸搫鍊稿ú锕€锕?*:
  - 婵烇絽娴傞崰鏍?`web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` 婵炴垶鎼╅崢濂稿疾閵忋倕绠ｉ柣鎴ｅГ閼茬姴鈽夐幙鍐ㄥ箲闁逞屽厸缁€渚€鏌﹂埡鍛煑闁规鍠栭崝浼存煕閺冣偓缁嬫垿宕规惔锝嗘殰闁告劧鑵归崑鎾存媴缁嬭法鈧鏌＄€ｎ偄濮囩€规洟浜堕幃褔宕堕宥嗙秺闂佹悶鍎辨晶浠嬫偤閹达箑绀岄柛婵嗗閸樼敻鏌ｉ妸銉ヮ仹閻犳劧绻濋幆宥嗘媴鐟欏嫮鈧喗淇婂Δ鈧悧鍕焵?
  - 闂佸憡鑹鹃張顒勵敆閻愬鈹嶆い鏃傗拡濡茶崵绱撴担瑙勫鞍闁诲寒鍨跺畷鍫曞箲閹邦厾娈ら梺闈涙閼冲爼鍩為弽顓熷亹闁煎摜顣介崑鎾存媴缁涘娈梺鍝勫妤犳悂骞忔导鏉戠闁糕剝鐟ч惌瀣煛瀹ュ懏鍠樻い锝勭矙閺佸秴鐣濋崟顏嗙礆闂佺绻愮粔闈涚暦椤栫偛閿ら煫鍥ㄦ⒐閻庮噣鏌￠崼顐㈠闁规挳顥撶槐鎺楊敇閻橀潧顥堥梺?JSX 闂佸搫绉村ú銊╊敆妞嬪海纾奸柟鎯ь嚟閳ь剦鍨堕悰顕€骞嗛棃鑸垫礋瀹?`Unexpected token`闂?

### Verified

- `npm run build`

## 2.3.57 - 2026-04-03

### Fixed

- **婵烇絽娴傞崰鏍囬幓鎺嗘闁割偓绲介悗顓烆渻閵堝娑ф繛瀛橆焽閹即濡搁妷銉р偓濠氭煛鐎ｎ偄濮囬悘蹇ｅ灦閹啴宕熼鈧悿顕€鏌涜缁绘垼鍟梺鍝勵槸閻忔繈鎮鸿缁參鏁傞懗顖ｆ船婵?JSX 闂佸搫鍊稿ú锕傘€?*:
  - 婵烇絽娴傞崰鏍?`web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` 婵炴垶鎼╅崢鐣岀矈閹稿孩鍎熼柨鏇炲€瑰▓鏃堟煕瀹ュ懐绠版繛瀛橈耿婵″瓨绗熼埀顒勩€傞埡鍐笉婵°倐鍋撻柛銊ラ叄瀵悂骞囬埞鎯т壕濞达絽澹婂Σ鍨箾婢跺牆濡界紒鈧繝鍕ㄥ亾閻㈤潧鏋傞柍褜鍏涢懗鍫曞磿瑜版帒绀夋繛鎴炵懄閿涘鏌涘Ο鐑橆棤闁烩剝鍨垮畷鐘诲传閸曨剙浠撮梺姹囧妼鐎氼厼鐣烽鐐查敜闊洦鎸鹃幗鐔虹磼濡ゅ绱伴悷鏇炴婵?
  - 闁荤偞绋忛崕閬嶅矗韫囨柨顕辨慨妯块哺缁绢垶鏌熼幁鎺戝姢闁绘鍓熷畷姝岀疀濮樼厧娈у┑鐐差槹濞叉粌鈻撻幋锕€鍐€闁搞儺鍓﹂弳顖炴煏閸℃洘绁版い鏇楁櫊瀵増鎯斿☉鎺戜壕濞达綀顫夊▓鍓佺磽娴ｇ顏柣鏍电悼缁敻宕ｉ妷褏鎲块梺鍝勵槴閳ь剙寮堕浠嬫煛閸屾碍澶勬い銏犵Ч閺佸秶浠﹂崜顬儵姊?`Unterminated string constant` 缂備焦绋戦ˇ宕囨崲濞戞氨纾兼い鎾跺枔閳ь剦鍨伴娆徝洪鍛珦闁荤姴娴傞崹顒勫焵?

### Verified

- `npm run build`

## 2.3.56 - 2026-04-03

### Fixed

- **婵烇絽娴傞崰鏍囬幓鎺嗘闁割偓绲介悗顓烆渻閵堝洦鏆╅柣鈽嗗亰閺屽懏寰勭€ｎ厾妾ㄩ柣蹇曞仜閸婄兘鎳欓幋锔藉剭闁告洦鍓欓悿顕€鏌?JSX 闂佸搫鍊稿ú锕€锕?*:
  - 婵烇絽娴傞崰鏍?`web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` 婵炴垶鎼╅崢楣冩偤椤愶附鐒诲璺猴龚閸撱劑鎮橀悙鎻掆偓褰掓偉閿濆棴绱ｆ俊顖滅《閸嬫挻鎷呯粙娆炬闂佸搫绉村ú顓€傛禒瀣ュù锝嗘倐閹割剟鏌?闂佸搫鍟悥鐓幬涢崸妤€妫橀柛銉厛閺€鎶芥煟閵娿儱顏ч悹鎰剁節閹秵鎷呯憴鍕偓顕€鏌￠崼顐㈠幍闁?
  - 濠电偞鍨甸悧鎾斥枍鎼淬劌绠查柣鏃堟敱缂嶅酣鏌￠崒姘婵犫偓娴煎瓨鍎橀柡澶嬪灦缂?JSX 缂傚倷鐒﹂幐濠氭倵椤栫偛瑙﹂幖娣紗閺囥垹鐭楅柟瀵稿У閻?`Unexpected token` 闂佸搫顑呯€氼剛绱撻幘缁樼叆婵炲棙甯╅崵鏍煏?

### Verified

- `npm run build`

## 2.3.55 - 2026-04-03

### Fixed

- **婵烇絽娴傞崰鏍囬幓鎺嗘闁割偓绲介悗顓烆渻閵堝嫮绁烽柛銈嗙矌閳ь剝顫夐惌顔剧不閻旂厧绫嶉柛顐ｆ礃閿涚喓绱掑☉娆戞创闁逞屽墮椤︻垳浜搁鐐村剭闁告洦鍓氬鎾绘⒒閸屻倕骞栭柟顔兼捣閳ь剚绋掗〃鍫ヮ敄娴ｅ湱鈻?*:
  - 婵烇絽娴傞崰鏍?`web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` 婵炴垶鎼╅崣鈧柛銈嗙矌閳ь剝顫夐惌顔剧不閻旂厧绫嶉柛顐ｆ礃閿涚喓绱掑☉娆戞创闁逞屽墮椤︻垳浜搁鐐叉槬闁绘梻鍎ら悾閬嶆煙閸︻厼鏋庢繛鍏肩墵瀵剟宕堕妸锔藉闂?
  - 闁荤偞绋忛崕閬嶅矗韫囨稓宓佺紓鍫㈠Т閺佹粓鏌涘Δ鍐ㄐ＄紓宥呮嚇瀵剟宕堕…鎴炴暤闂侀潧妫旈悞锕€锕㈤埀顒€霉閻樿京鐭欓柍褜鍓欓ˇ鐢稿Υ瀹ュ棛鈻旈幖绮光偓鍐茬憥闂佸搫鐗嗛悧鍡涘垂韫囨稑绠查柕蹇娾偓宕囨▎闂備胶鐡旈崰妤呭几閸愵喖瀚夋い鎺戯功缁€澶嬬箾閹存繄澧︽繛?`Unterminated string constant` 闂佸搫顑呯€氼剛绱撻幘缁樼叆婵炲棙甯╅崵鏍煏?

### Verified

- `npm run build`

## 2.3.54 - 2026-04-03

### Fixed

- **婵烇絽娴傞崰鏍囬幓鎺嗘闁割偓绲介悗顓烆渻閵堝懐浠涢柛锝呮健瀹曟繈鎮╅悜妯笺偘闂佹悶鍎插畷姗€濡撮崘顏嗙＜闁告洦浜濋鑺ョ箾閸繍鍎戦柡鍡忓亾婵炲濯寸徊鍧楁偉濠婂應鍋撴担鍐棈闁搞伇鍥ㄥ剭闁告洦鍣崵鏃€绻涙径瀣闁轰礁锕﹂幏?*:
  - 濠电偞鎸搁幊鎰板箖?`web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` 婵?`LazyChart` 闂佸憡鑹剧€涒晠寮婚悢灏佹灁閻庯綆鍓氬▓宀勬煟閵娿儱顏柛锝呮啞瀵?`return` 婵炲濯寸徊鍧楁偉濠婂牆閿ゆ俊鐐茬毞閸?
  - 缂備礁顦…宄扳枍鎼淬劌瀚夋い蹇撳閺嗘岸鏌熺€涙ê濮夋繛?`motion.div` 闂佸憡鐗曢幊鎾凰夋繝鍌楁灁閻庯綆鍓欓。濠氭煥濞戞ɑ婀扮紒澶屽厴濮?`Return statement is not allowed here` 闂佸搫顑呯€氼剛绱撻幘缁樼叆婵炲棙甯╅崵鏍煏?

### Verified

- `npm run build`

## 2.3.53 - 2026-04-03

### Fixed

- **婵烇絽娴傞崰鏍囬幓鎺嗘闁割偓绲介悗顓烆渻閵堝懎鎮侀悗闈涙湰閿涙劕螣閼测晝鐓佹繛瀵稿У濠€褰掓嚈閹达附鍎嶉柛鏇ㄥ灡婵粍绻?import 濠电姍鍕闁?*:
  - 婵烇絽娴傞崰鏍?`web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` 婵＄偑鍊曢悥濂稿磿?import 闁荤偞绋戦惌渚€锝為敂鐐珰妞ゆ牗鑹鹃弲鎼佹煕韫囧鍔ゆ繛鍫熷灦濞碱亪顢栫捄銊ф瀫閻庢鍠楀ú鏍亹閹稿海鈻?`` `n `` 闁诲孩绋掗〃鍫ヮ敄娴ｅ湱鈻旈悘鐐插€甸崑?
  - 濠电偞鍨甸悧鎾斥枍?Turbopack 闂侀潻璐熼崝蹇氼暰闂佸搫顑嗛崝鏍矓妞嬪孩瀚荤憸鐗堝竾閳ь剙顦辩槐鎺楀礋椤忓拋鍋ㄩ梺鍝勫暙婢у骸鈻?`Expected unicode escape` 闂佸搫顑呯€氼剛绱撻幘缁樼叆婵炲棙甯╅崵鏍煥濞戞ɑ婀板ù鐙€鍠楀鍕吋閸℃銉╂偣閹邦剛绉洪柕鍡楊槺閹瑰嫰顢涘鍕闂佹眹鍔岀€氼參顢楀鍛殰闁告縿鍎冲浠嬫偣閸ャ劌鐏熼柍?

### Verified

- `npm run build`

## 2.3.52 - 2026-04-03

### Fixed

- **婵烇絽娴傞崰鏍?3000 缂備焦妫忛崹鎷屻亹濞戞瑣浜滈柣銏犳啞濡椼劑鏌涢妷褍校缂侇煈鍣ｉ幆宥嗘媴閾忚銇濋梺娲诲枙閻掞箑鐣烽鐐查敜闊洦鎼╅崵銈夋煠瀹勯偊鍤熸繛鍫熷灦濞煎骞囬锝嗘杸闂佸搫鍟冲▔娑氭閹捐埖鏆?*:
  - 婵烇絽娴傞崰鏍?`web/src/app/globals.css` 婵炴垶鎼╅崢钘夌暦椤栫偛閿ら煫鍥ㄦ礃閻ｈ鲸绻涙径鍫濆闁革絽顕埀顒佺⊕椤ㄥ牓顢栨笟鈧弫宥囦沪閸擃灝銉╂⒒?Turbopack 闂侀潻璐熼崝蹇氼暰闂佸搫顑嗛崝鏇㈠矗韫囨洑娌柍褜鍓熷钘夌暋閹殿喚顢呴梺鍝勫暙婢у骸鈻?UTF-8 闂佺缈伴崕鐢稿极婵犲洤违?
  - 婵烇絽娴傞崰鏍?`web/src/components/shared/Header.tsx`闂侀潧妫斿姊琫b/src/features/dashboard/components/themes/DefaultDashboard.tsx`闂侀潧妫斿姊琫b/src/app/(dashboard)/layout.tsx` 婵炴垶鎼╅崢鎯р枔閹达箑绠查柣鏃堟敱缂嶅酣鎮楀☉娆樻畼妞ゆ垳鐒︾粙澶嬫償閿涘嫮锛濋柣?JSX 闂佸搫鍊稿ú锕€锕㈡导瀛樻櫖閻忕偛褰為崚鎺戭熆鐠鸿櫣效妞も晝绮妵鍕礂閸濄儳鎲块梺璋庡棭鍤欑紓宥呯У閵囧嫰鎮介崹顐ゆ殸濠殿喗绻愮徊浠嬫偉閸撲胶纾介柡宥庡墰濡差垶鏌?
  - 濠电偞鎸搁幊鎰板箖?3000 缂備焦妫忛崹鎷屻亹濞戞ǚ鏋旈悗锝庡墯濞堝矂鏌ｉ妸銉ヮ仾婵?Next 闁哄鏅滅粙鎾诲煝婵傚摜宓侀柛顐ｆ礀濞呫垽鏌￠崒娑欑凡闁诡垰閰ｅ畷?`web` 闂佸憡鎸哥粔鍫曨敂椤掑嫭鏅€光偓閳ь剟鍨惧Ο鍏煎闁靛牆鎳愮粔濂告煕閹惧磭啸妞ゆ梹鐗犲濠氼敊閻愵剛鏆犻柣蹇撶箺妞寸危?3000 缂備焦妫忛崹鎷屻亹濞戞埃鍋撻崷顓炰粧缂佽翰鍎垫俊?

### Verified

- `http://localhost:3000` 闁荤姳绀佸鈥澄涢崼鏇炵畳闁靛繒濯Σ缁樻叏濠垫挾鍒伴柣鏍х埣閺佸秶浠﹂崐鐔风彲闂備焦褰冪粔鎾偩妤ｅ啫瑙﹂柟瀛樼箓閻撳倿鏌ｈ椤曆呯礊瀹ュ棎浜?
- 濠电偞娼欑换妤咃綖瀹ュ闂柕濞炬櫇瀹曪綁鎮?3000 缂備焦妫忛崹鎷屻亹濞戞瑣浜滈柣銏犳啞濡椼劎鈧鐡曞鎾剁箔婢舵劕绀冪€广儱鎳庡В澶愭煟?`useInsertionEffect` 闂佺缈伴崕鐢稿极?

## 2.3.51 - 2026-04-03

### Fixed

- **婵烇絽娴傞崰鏍囬弻銉ュ唨闁革富鍘界粣妤冩喐閻楀牊绀冩俊顐亰閹?dashboard 濠碘槅鍨崜婵嗩熆濡吋鍠嗛柨鏇楀亾鐟?useInsertionEffect 闁哄鏅滈崝姗€銆侀幋锕€绫嶉悹楦挎绾句粙鎮?*:
  - 缂備礁顦…宄扳枍?[src/app/(dashboard)/template.tsx](file:///F:/1code/wotty-StarAccounting/src/app/\(dashboard\)/template.tsx) 婵炴垶鎼╅崢濂割敋?`framer-motion` 闂佹眹鍔岀€氼亞娆㈡搴㈠皫闁哄秶鏁哥粈澶愭⒑椤掆偓閻忔繈宕㈤妶澶婃嵍闁靛闄勯敍瀣煕韫囧鍔氱憸鐗堢〒閹噣顢曢姀鈥冲壔闂佸憡鏌ｉ崝宥咁渻閸屾粍鍠嗛柨鏇楀亾鐟?`Cannot read properties of null (reading 'useInsertionEffect')`闂?
  - 婵烇絽娲︾换鍕汲閳ь剟鎮归崶銉ュ姕閼垛晠鏌℃径搴㈢《婵炲牊鍨归埀顒€婀遍幊鎾斥枍閹烘鍤傜€光偓閸愵亞鍘梺鎸庣☉婵傛梻绮径鎰鐎广儱鐗滈崬銊╂煛閸愬嫬鎳庨。濂告煛瀹ュ懏璐℃繛鍙夊閵囨劙寮撮悙宸瀫缂備焦妫忛崹鏉棵哄鍕枖闁告繂瀚闂佹眹鍨奸褏鈧灚顭囬幉妤呭川閹靛啿浜鹃悘鐐村劤缁插綊鏌涢幘宕囆㈡繝鈧鍡忓亾楠炲灝鐏柛鈺傜〒缁晠顢涘┑鍫㈩吋闁荤偞绋戦張顒€顪冮崒姘辨殾闁冲搫鍊婚惃楣冩煏?

### Verified

- `npx next build`
- 闂佸搫绉村﹢鍗灻洪幏灞讳汗?`npx next dev -p 3010` 闂佸憡鍑归崹鐗堟叏閳哄懎绠ｉ柟閭﹀墮椤娀鏌ㄥ☉妯绘拱缂佷浇宕甸幉鎾醇濠靛洨褰滈梺鐟扮仛閹稿摜妲愰幋鐑囩磾闁哄稁鍘归埀顒€顦靛畷銉︽償閵忊€崇处闂佸憡鍔曠粔鎾吹椤撱垺鍋?`useInsertionEffect` 闂佺缈伴崕鐢稿极?

## 2.3.50 - 2026-04-03

### Modified

- **婵帗绋掗…鍫ヮ敇缂佹鈻斿┑鐘冲嚬閺嗩垰霉閻樻彃顒㈡繛鍫氭櫊閹倿鎸婃径妯恍╅梺鍛婄懀閸婃牠宕濋崨顖涘闁告劏鏅滃▓璇测槈閹捐顏犳鐐叉处缁傛帡鏁愰崨顓熺€婚梺璋庡倻鐭欐い?*:
  - 婵帗绋掗…鍫ヮ敇缂佹鈻斿┑鐘冲嚬閺嗩垰鈽夐幘瀛橆潡濠㈢懓锕ョ粋鎺撴償閿濆牆鍓瑰┑鈽嗗亝濞插繘鍩€椤戣法顦︽繝鈧埄鍐炬付闁告洍鏂侀崑鎾存媴閸撳弶些闂佸憡鐟ｉ崐鏍р枔閳哄懏鍎岄柦妯侯槸閻庡ジ鏌熺拠鈩冪窔閻犳劗鍠栧畷妯活槹鎼淬埄浠遍梺闈涙閻掞妇绮婇鍕挅闁告挆鍌滅闂侀潧妫旂欢姘焽瑜旈幏鎴濃攽閸繀鍖栫紓鍌氬€甸崑鎾绘煥濞戞ɑ婀伴柡鍡稻閹峰懘骞樼€涙鍑藉┑鐐存尭閹虫劙宕洪妷鈺佄ュù锝堫潐缁绢垱顨ラ悙娈挎濞存嚎鍊濇俊?
  - 婵炴垶鎸搁…鐑姐€傞挊澶嗘灃闁靛鍎遍弬鈧柣鐐寸◤閸斿﹪鍩€椤戣法顦﹂柛娆忕箳娴狅箓鍩€?CSS 闂佸憡鐟﹂敃銏ゅ闯閻戞鈻旈幖绮光偓鍐茬稇婵炲瓨绮犻崑鍌溾偓闈涙湰閿涙劕螣閸濆嫭鏋鹃柣鐘叉祩閸樺ジ骞冮幘鎰佹桨闁靛闄勯弳顓㈡煠绾拋鍤嬬紒杈ㄧ箖缁屽崬鈹戦崼鐔哥暚缂備胶濮崑鎾剁磼閹惧懎顩紒顔哄姂瀵悂宕熼鍡櫳戠紓浣割槸椤嘲鈻嶆惔銊ョ伋婵犲﹤鍟╅悞濠囨煛閸愬嫧鍋撻柍褜鍓氱换鍕枔閹寸姵鍠嗛柛鈩冨嚬濞兼洘鎱ㄥΟ缁橆梿鐎瑰憡绻堟俊?
- **婵☆偓绲鹃悧鐘诲Υ婢舵劖鐓€鐎广儱鐗嗛ˉ蹇涘级閳哄倻鈼ョ紒鏃€娼欓～銏ゅΨ閵夈儱鐟庨柡澶屽仩椤曆呪偓?*:
  - 婵☆偓绲鹃悧鐘诲Υ婢舵劕绠戦柡鍕禋濞兼棃鏌涘鏃€澹嬮崑鎾存媴鐟欏嫭姣嗛梺琛″亾妞ゆ牗渚楀ú銈夋偡濞嗗繒澧戦柍褜鍏涚粈浣该瑰Ο鍏煎仒闁靛鍎茬€氭彃霉濠у灝鈧牕危濡ゅ懎绀嗘俊銈呭閳ь剙鍟村銊╁捶椤撶喐娈㈤梻鍌氱墛缁嬫牠骞楅幋锕€违濞达綀濮ゅ鏍煠娴犲妫戦悹鐐灲婵″瓨鎷呴崫鍕皨闂佽崵鍠愮喊宥夆€﹂崼鏇炍ュù锝呮贡閵堫剛绱掓鏍т簻濞寸姵绋掗幏鍛償閵婏絽浠氶梺鍛婄矊閼活垰顔忔潏鈺傚闁告劦鍘奸ˉ蹇涙煏?
  - 婵烇絽娲︾换鍕汲閳ь剚绻涢弶鎴炲殌濠㈢懓锕幊妤冧沪閻愵剛褰查梺鍛婄矊閺堫剛绮╂繝姘亯闁芥ê顦卞﹢瀛樼箾閸″繑顫夌紒杈ㄧ箞瀹曘儳浠﹂悙顒夋Н闂備緡鍓欓悘婵嬪储閵堝棭娓堕柟杈剧到椤ュ繘鏌曢崱鏇犲妽闁伙附妞介幃鎶芥嚒閵堝棗鐝旈梺闈涙缁舵艾顭囧鑸靛殞闂婎偒鍘鹃悷銏狀熆鐠鸿櫣孝鐟滅増绮撳畷鐑芥偄鐠囧樊妫岄梺?

### Verified

- `npm run typecheck`
- `npm run build`

## 2.3.49 - 2026-04-03

### Modified

- **婵帗绋掗…鍫ヮ敇缂佹鈻斿┑鐘冲嚬閺嗩垶姊洪幓鎺斝㈠ù鐘崇⊕缁嬪鎮滃Ο娲诲敤闂佽皫鍛珪闁伙絾绻勯惀顏堟晝閸屻倖顥?*:
  - 婵帗绋掗…鍫ヮ敇缂佹鈻斿┑鐘冲嚬閺嗩垰鈽夐幘鎶筋€楅柛娆忕箳娴狅箓鍩€椤掑嫬鍐€鐎瑰嫭澹嗙涵鈧梺鍛婄懄閿曘垽宕冲ú顏勬瀬缂傚牏濮风粔鐓幟归悩鏌ヮ€楅柛鐘查叄閹锋垵鈹戦崼顐ｇ稑闂佺懓鐏堥崑鎾愁渻鐎ｎ亪顎楅柛銊ョ箻楠炴垿锝為锛勵槹闂佸搫妫欓悧婊冣枍瑜旀俊瀛樻媴妤﹀灝鍓归梺璇茬箺閸╁洭鍩€椤戞寧绁伴柟鑺ュ灴閹﹢骞嶉闂村寲缂傚倸鍊甸崑鎾绘煟閵娿儱顏柣锝嗙箘閻ヮ亪鏁傞懞銉у幍濠碘剝顨呴悧鐐垫濠靛鍌ㄧ紓浣姑粩鏉戭熆閸棗娲﹀銊х磼婢舵ê鐏︽繛鍏煎哺閹锋垵鈹戞繝搴㈢秵闂佽澹嗛崰鍡涘焵?
  - 闂佺绻愯ぐ澶愭閳哄倻鈻斿┑鐘冲嚬閺嗩垶鏌涘Ο鐓庢灆妞ゆ洏鍨藉畷銉т沪缂併垹濡遍梺琛″亾闁告挷鐒﹁ぐ娑㈡煕閿曗偓濡粓锝炲Δ鍛ュù锝囶焾缁犵敻姊婚崟鈺佲偓娑⑺夋繝鍐炬闁绘鐗冮崑鎾诡槼闁伙附妞介幃鎶芥嚒閵堝棗鐝旈梺鍛婄矊閻胶鎹㈤崘顭戝殨闁绘垶锚娴滅偓绻涢幖顓炴灍闁告柨鎳橀弫宥囦沪閻愵剚姣夋繛鎴炴尵閸庛倕煤閹稿孩濮滈柤濮愬€栭悾閬嶅级閸綆娼愭い銏狀儔婵″瓨绗熼埀顒€危閹规劑浜归柛妤冨仦鐎氭煡鏌涢幒鎴烆棞闁活亙鍗抽幃鎯р枎閹寸儐浠遍梺?
- **婵☆偓绲鹃悧鐘诲Υ婢舵劕绠戦柡鍕禋濞兼梹淇婇妞诲亾閾忣偄浠撮柣鐔哥懃濡粓锝炴惔銊︾厒鐎广儱妫楃粭?*:
  - 闂佽鍓氬Σ鎺楋綖?Hero闂侀潧妫旈懗鍓佸垝閾忚濯奸柍銉ュ暱楠炪垽鏌曢崱鏇犲妽闁轰礁缍婂銊╊敍濮橆剙鑰块梺闈涙缁€浣该瑰Ο鍏煎仒闁靛绠戠徊鍦磼閳ь剚銈﹂崹顕呮闂佸憡绮岄張顒€銆掗懜鍨氦闁瑰瓨绮嶉崬澶愭煛閸曨剚灏悘蹇ｅ灦瀵劑鏌呭☉婊咁槹婵炶揪绲介柊锝夊Χ闁秴妞界€光偓閸曨偄璧嬮梺鑲╊攰椤曟粎妲愬┑鍥┾攳婵犻潧鐗婂▓宀勬倶閻愭彃鈧綊顢曢崗鍏煎闁糕剝顨呭▍銈夋倶韫囨柨鐏﹂懚鈺呮煛婢跺顕滈柛鏂挎嚇婵?
  - 婵炴挻鐨滈崱娆戝骄闂佸搫绉寸换鍫ュ焵椤戣法绐旈柕鍡楋躬閺屽牓濡搁敂鎯х効闂佸憡绮岄惉闂寸昂闂佸憡鏌ｉ崝宀€鑺遍幎鑺ョ劸闁靛鍎洪崵銈夋煠閸撹弓绨婚柟顔芥尭椤垽濡烽敃鈧惔濠囨煙鐎涙ê濮堟繛鑼舵硶閳ь剛鎳撻ˇ闈涱焽閵堝鍎嶉柛鏇ㄥ墰閵堫剟骞栫€涙ɑ绀€妞ゆ洟浜堕幊婊堫敂閸ヨ泛娈ч柣鐔风殱閸嬫捇鏌ㄥ☉妯垮鐎规悂浜跺畷鐘诲冀閵堝倸浜炬繝濠傛噽閺嗗棛绱掗幘鍛窗缂佽尙鍋撶粙澶婎吋閸涱厾顦伴柣鐘差儏閸熺娀鍩€椤掍胶绠樻繛鍫熷灴瀵偆绱欓悩鐢敌紓鍌欒兌閸犲秶绮╅幘顔肩疀闁绘梻琛ラ崑?

### Verified

- `npm run typecheck`
- `npm run build`

## 2.3.48 - 2026-04-01

### Fixed

- **闂佸搫绉村﹢鍗灻洪幏灞讳汗?npm 闂佺厧鐡ㄧ喊宥咃耿娴兼潙绠掗柕蹇曞濡插鏌熺粙鎸庢悙闁诡喗绮撳顔款槾濠?web 婵＄偑鍊曞﹢鍗灻?*:
  - package.json 婵炴垶鎼╅崢鎯р枔?dev:web 闂佽　鍋撻梺顐ｇ缁€瀣煛閸曨剙鍔ょ紒鎵佸墲濞艰鈽夊Ο鍝勬辈 web 闂佺儵鏅╅崰鏍礊瀹ュ绀冪€广儱鎳忛崕娆撴煕?next dev闂佹寧绋戦惌鍌涘閳哄懎绀傜€广儱妫涙竟宀勬煟閳哄﹤鏋涚紓宥呯Ч楠炲秷顦舵い銏″灴瀵噣骞嗛柇锕€娈╅柣鐘靛劋閸ㄧ敻宕虹仦鍓ь浄闁规儳纾銊╂煛瀹ュ牜娼愭繝鈧导瀵稿彆妞ゆ劗濮崑?
  - build闂侀潧妫旀径鐒rt闂侀潧妫旈崟绶刵t闂侀潧妫旀潏娓琾echeck闂侀潧妫旀潏娓唖t:e2e 婵?test:e2e:ui 婵炴垶姊婚崰搴ㄥ箖閹炬剚娼伴柕澶涢檮閺嗩厼鈽夐幘瑙勩€冮柛鐑嗗墴閹爼宕卞Δ鈧悡?web闂佹寧绋戦惌渚€顢欓埀顒勬煛瀹ュ懏璐℃繛鍙夊閵?npm 闂佸憡绋掗崹婵嬪箮閵堝鐓傜€广儱妫欓悡鈧柣搴ｆ暩閹虫挾鑺遍弻銉ョ睄鐟滃繑鏅跺Δ鍛鐎广儱娴傛导鍌炴煏?
  - dev:legacy 闂佸憡鑹鹃張顒勵敆閻愭潙绶炵€广儱娲﹂弳蹇撉庨崶璺烘灍妞ゆ帗绮撳畷銉︽償閿濆棛鏆?dev:web闂佹寧绋戦惌鍌涘閳哄懎绀傜€广儱娲﹂崺娑氱磽娓氬洤骞掔紒缁樺哺閹儳鈻庨幘瀛樻珦闁荤姴娴傞崹浼村箚鎼淬劌绀夐柕濞垮妿閻斿懐鈧灚婢樼€氥劑鍩€?

### Verified

- 闂佸搫绉村﹢鍗灻洪幏灞讳汗闁哄洨鍠庨埛鏃堟偠?npm run typecheck 閻庡湱顭堝鑸电椤旇棄绶炵€广儱瀚粈瀣偣鐎ｎ亜鏆熼柡?web 闂?TypeScript 闂佸搫绋勭换婵嬫偘濞嗘挻鐓ｉ柟瑙勫姉閻斿懘鏌?

## 2.3.47 - 2026-04-01

### Modified

- **濠电偞鎸搁幊鎰板箖婵犲偆鍟呴柟缁樺笧閻旑剛鈧鍠栭崯顐ｆ櫠閻樼數鍗氭い鏍ㄧ箘鐠侊絿绱掓径瀣潡妞ゆ柨娲╅妵鎰板即濮樿京鎲挎繛鎴炴尭閻°劌顪冮崒娑欎氦婵犲﹤鎷嬫导鍌炴煕閹烘垶顥為柡?*:
  - 闂佸憡甯炴繛鈧繛鍛缁傛帡骞樺畷鍥ㄧ殤闂佸憡鍔曢幊搴ㄥ礄閳╁啯鍎熼柣鏃堫棑绾鹃箖鏌ｉ妸銉ヮ仹缂佹鎸婚妵鍕偡閹殿喚锛涢梺鍛婄懄閸ㄥ爼寮搁崘顭戞禆闁挎繂瀚悷銏ゆ倵閻㈠灚鍤€缂併劍鐓″畷銏ゅ幢濡も偓閽戝鏌ｅΔ鈧悧濠傦耿閹殿喗濯奸柡澶庢硶缁夊潡鏌ㄥ☉妯肩劯濞村皷鏅犲畷妤€顓奸崨顔尖偓鐢电磽娓氬洤骞橀柟鎾棑缁辨帡顢橀悙鍙夘棟闂佸吋婢橀崯顖毼涢妶澶婃瀬闁割偓绲跨拋锝囩磼婢跺瞼甯涢柡宀€鍠庨々濂稿醇濞戞帒浜?
  - 婵炲濮寸花鑲┾偓闈涚焸閹囧醇閻斿憡瀚抽柣鐘辩劍濠㈡绱炲鍡欌枖閹艰揪绱曠壕濠氭煕濞嗘劕鐏辩紒缁樕戦幆鏃堟晜閼愁垰骞€缂備礁顦…宄扳枍鎼达絺鍋撻悽鍨殌缂併劍鐓″濂告嚋濞堝灝鏂€闂佸搫顧€缁辨洖煤娴煎瓨鏅悘鐐跺亹缁犱粙鏌ｉ敐鍡欐噧缂傚秴顑夊畷婊冾吋閸曨厾鐓楅梺鍝勭墕椤︿即寮查妷鈺傚剭闁告洦鍘奸。濂告煛閸偄澧紒渚垮妽濞艰鈽夊鍓х畾闂佽鍙庨崹顒勫焵?
  - 濠电偞鎸搁幊鎰板箖婵犲嫧鍋撻悽鍨殌缂併劍鐓￠幆鍐礋椤斿墽顔撶紓浣规閸垱寰勫澶婄睄閻犲搫鎼悗濠氭煛閳ь剟顢涢妶鍥╊槷闂備緡鍓欓悘婵嬪储?GitHub 婵炴垶鎸搁敃锕傚箣妞嬪海纾兼い鎾寸箘缁犱粙鏌ｉ敐鍡欐噧闁告垟鍓濋幆鏃堟偄妞嬪海锛為梺姹囧妼鐎氼垶鎯侀娑辨閻忕偤鏁崑鎾诡槼鐟滈鐒︾粋宥夊Χ閸涱厼姹查梺鍛婄懕缁插鍩€?

## 2.3.29 - 2026-03-31

### Modified

- **婵＄偑鍊楅弫璇差焽娴兼潙绀嗛柛銉ｅ妼鎼村﹤螞閺夊灝顏柛搴ゎ潐缁嬪鎯旈妶鍥╁敶闂佹眹鍨兼ご姝屻亹娓氣偓閺?*:
  - 闂佸搫鍊瑰姗€路?`DashboardRouteWarmup`闂佹寧绋戦惉鐓庘枍閵夈劊浜归柡鍥╁仦閸婄敻鏌熺粙娆炬Х缂侀硸鍙冨畷妤呭醇閵忋倗宕滅紓浣告湰濡炶棄螞閼恒儻绱ｉ柛鏇ㄥ亜缁插潡鏌熼浣诡潡妞ゎ偄绉规俊瀛樻媴閸︻厜銉╂偣閹邦剛鐣柍褜鍏涘ù鍥╃矈椤愶絿顩茬憸瀣焵椤戣法顦﹂柛瀣Ч閹锋垿宕熼埞鎯т壕濞达綀濮ゅ畵宥嗙箾閸℃ê鍔ら柟铚傚嵆瀵偊鎮ч崼婵堛偊婵＄偑鍊撶徊濠氭儗妤ｅ啯鍋ㄩ柟鎻掝儑缁€澶愭煕閹存繄绠伴柣顭戝灦閹瑩鎮烽弶鎸庣槚闂佸憡鑹惧ù宄扳枔閹寸姷椹冲璺猴功缁愶繝鏌￠崘銊у煟婵☆偄娼℃俊?
  - 婵☆偅婢樼€氼噣宕曠憴鍕嚤婵﹩鍘炬竟宀勬煙鐠団€虫灓缂傚秴顦辩槐鎺戭煥閸涱厜锕傛煕閹邦亞绁烽柛銈嗙矒瀹曟繈濡搁敂鑺ユ瘑闂佽桨鐒﹂崘鑽ゆ濠靛棭鍤曢弶鍫氭櫇缁夊綊鏌ｅ搴＄仩妞わ絻鍔戝畷锝夘敂閸愵亞顔旈梺浼欑稻閻熲晠鎮甸钘夘嚤婵☆垰鎼敮銉х磼閻欐瑥娲﹁闂佸憡甯楅〃鎰濠靛鐒奸柛顭戝枛鐢娊鏌￠崘顏勑㈡俊顖氾躬瀹曟岸顢曢敐鍜佹降闂佸憡顨堟慨鎾偨椤愩倐鍋撻悷閭︽綗闁?
- **婵炴垶鎸搁…鐑藉Υ婢舵劖顥堥柕蹇婂墲濞堣顪冮妶澶嬫锭濠殿喚鍋炲顏呯鐎ｎ偅鍤戦柣鐘辫閸ㄩ亶寮崷顓犵幓?*:
  - 闂佽鍓氬Σ鎺楋綖瀹ュ违濞达絿鏅妶顐⒚瑰┃鐘辫閸嬫挻鎷呯粙澶告喚闂佽棄鍟€氥劑鍩€椤戞寧绁伴柟纭呮硾閳诲孩銈ｉ崘锔瑰亾婢舵劖顥堥柕蹇曞Т缁叉寧绻涢幋婵堝闁哄棴绲鹃妵鍕礂缁嬭法妲ｆ俊顐ゅ椤洦顨?`dynamic(..., { ssr: false })`闂佹寧绋戦張顒佷繆閸涘﹦鈻斿┑鐘冲搸閳ь剙顦靛Λ?UI 婵炲濯寸徊鍧楁偉濠婂牆绠甸柟閭﹀墮椤ゅ懐绱掗幆褍鏆遍柛娆忔閹瑰嫰顢涘鍕闁荤姍鍐仾缂侇煈鍣ｆ俊?
  - 濠电偞鍨甸悧鎰板垂閸屾稓鈻旈幖娣€栧畵宥嗙箾閸℃稓鐣洪柕鍡楊樀濡啴濮€閵忊€崇厱缂傚倷绶￠崢铏规崲濮樿埖鍋╂繛鍡楃箲缁傚牓鎮跺☉鏍у缂併劑浜堕獮鎰緞閹邦厺绮梺绉嗗嫷娈ｇ紒杈ㄧ箞閺屽棝宕归鐓庤祴婵炴垶鎹佸銊ц姳閿熺姴绀嗛柛銉厵閳ь剙顦扮€电厧螣閸濆嫷鍤欓梺纭呮硾閿曘儲鏅跺澶婂珘濠㈣埖鍔曞▍銏ゆ煕閵夛箑绀冮柕鍡楀暞缁楃喎鈹戞繝鍕垫船婵炴垶鎸撮崑鎾寸箾閸″繐澧查柍褜鍎搁崘鐐殎闂佹悶鍎抽崑妯尖偓闈涚焸瀹曠娀宕ㄩ鐔蜂壕?
- **婵＄偑鍊楅弫璇差焽娴兼潙鏋侀柣妤€鐗嗙粊锕傛煟閹搭厼骞樼紒鎲嬪閳ь剚绋掕摫閻㈩垱鎸冲畷?*:
  - 闂佸搫鍊瑰姗€路閸愵喗鐒绘慨妯块哺閺?`warm-cache` 闂佸憡绮岄惌鍌炲Υ婢舵劖顥堥柕蹇嬪灲閻?data loader闂佹寧绋戞總鏃傛嫻閻旂厧绠戦柡鍕禋濞兼棃鏌曢崱鏇犲妽缂佸顥撻幏褰掔嵁鎼存挸浜惧ù锝囨櫕閵堫偄霉濠х姳璁查崑鎾存媴缁嬪じ鎲鹃梺钘夊暙鐎氥劑鍩€椤戞寧绁伴柟纭呮硾閳诲酣鎮欓鈧徊鐟般€掑顓犮€掗柣鎿冨弮瀵噣宕滄担绋垮Р缂傚倸鍊归幐鎼佹偤閵婏妇鈻旈幖杈剧岛閺佸嫰姊婚崒娑氬弨妞わ絺鏅犲畷锝夊冀閻㈢數顦梺鍛婂灥缁绘劙鎯冮鐐寸厒鐎广儱鎷嬪Σ?loading 婵犮垻鎳撻崯鍧楀箯娴兼潙绠抽柕澶堝劚缂嶆挾鈧灚澹嬮崑鎾诲级閳哄倹鐓熼柍?
  - `npm run typecheck` 婵?`npm run build` 閻庣懓鎲￠悡锟犲焵椤掍椒浜㈢紒璇插暣閺佸秴鐣濋埀顒勫灳濡吋濯奸柕鍫濇閹烽亶寮堕悜鍡楁灆缂侀硸鍙冨畷鐘诲冀瑜嶇拋鍙夋叏濠垫挾鍒伴柣鏍х埣瀵悂宕熼銈囧闂?

## 2.3.23 - 2026-03-31

### Modified

- **闂佽桨鑳舵晶妤€鐣垫担骞夸簻闂傚牊绋愮槐锝吤归敐鍡欑煀閻忓浚鍨堕弻灞筋吋閸℃鐟?*:
  - 婵＄偑鍊曢悥濂稿磿閹绢喖缁╅梺顐ｇ缁€瀣煃閵夛妇鐭嬮柍褜鍓氬Σ鎺楊敊閸ヮ亗浜归柡鍥╁枑濞?+ 闁荤姵鍔х粻鎴濈暦閻旇　鍋撻悽闈涘付闁告瑥妫濋崹鎯р攽閸℃ê鈧亶鏌熼悜妯虹瑨闁活偄绉剁划鍫ユ偖鐎靛摜顦梺鍛婂灥缁绘劙鎯冮鐐寸厒鐎广儱鎷嬪Σ璇睬庨崶锝呭⒉濞寸厧鎳樺畷绋款渻鐏忔牕浜?
  - PC 缂備焦妫忛崹鐢垫崲濡崵鈻旈柍褜鍓欓～銏ゅΨ閿旇姤顔掗梺鑽ゅ仜濡梻鎷归悢鐓庣煑閻忕偠妫勯悘娆戔偓瑙勬偠閸庢壆绱為弮鍫濈闁绘艾顕粈澶屸偓褰掓交缂傛岸寮查崼鏇炵哗闁绘劦鍏橀崑鎾诲及韫囷絽鏁归悷婊呭濞叉﹢寮抽悢鍝モ枖閹兼番鍨归·渚€鏌涢弬璇插閽樼喓鎲搁悧鍫熺┛缂佽鲸绻堝畷锝夊礂閸涱喗鐝烽梺琛″亾闁硅鍔曢ˇ鈺呮煕濡や焦绀€妞ゆ洟浜跺畷妤呭Ψ閵堝洨鎲块梺鐓庮殠娴滄粍鎱ㄩ埡鍕╀汗闁圭儤妫侀～锕傛煥濞戞ɑ婀伴柡鍡稻閹峰懘骞樼紒姗嗘綈闁荤姴娲﹀Σ鎺楁儗閹屽殫闁告洦鍓氱痪顖涚箾閹捐櫕鍣烘繛鍛哺婵?
- **AI 婵＄偑鍊楅弫璇差焽閻楀牏顩查柕鍫濆闂夊秹鏌￠埀顒傛崉閸濆嫮绋?*:
  - 婵＄偑鍊曢悥濂稿磿鐎电硶鍋撴担鍐棈闁糕晛鎳樺鍊熺疀閺冣偓閺嗩厼鈽夐幘瑙勵仩婵炴彃娼￠獮鎺楀Ψ閿旇В鏋栫紓浣插亾閻炴稈妾ч崑鎾城庡?濠碘槅鍨埀顒€纾埀顒傚厴閺屽﹤顓奸崶鈺傜€梺鐐藉劜缁绘劗妲愬┑瀣闁绘绮悵鐔奉渻閵堝洦鏆繛闂村嵆瀹曟﹢宕ㄩ弶鎴濆Г闂備焦褰冪粔鎾囬弻銉﹀剭闁告洦鍋佹禍锝夋煛瀹ュ懏鍠樻い锝堟铻ｉ柍銉ㄦ珪閸嬨儵鏌?
  - 閻庣懓鎲￠悡锟犲储閵堝洨纾炬い鏂捐寧娓氣偓瀹曞湱鈧絺鏅為崢顒勬煟閵娿儱顏┑鐐叉处濞碱亪顢欓崹顔剧Т闂佸憡顨嗗ú鎴﹀箞閵婏箑绶炵€广儱鐗滃鍧楁煕閹烘垶鍠樻俊顐ュ煐閿涙劕顫滈崼銏㈩槷闂佸吋瀵х划灞界暦閻旀悶浜滈梺顐ｇ〒缁犱粙鏌熼梹鎰槮鐎规洜鍠撻幃鎵沪閻愵兘鏋栫紓浣插亾闁绘艾顕粈澶愭⒑閺夎法肖闁汇倕妫楅锝夋偡閹殿喗鍕鹃梺鍛婂姇閹冲酣顢欓幇鏉跨闁绘垶蓱閺嗘粓鏌熼梹鎰妽缂侇喗鎸冲畷婵嬪Ω閿濆倸浜?
- **閻庢鍠氶幊鎾绘儑閻楀牏鈻旈幖绮光偓宕団偓濠氭煛鐎ｎ偄濮夌紒顔哄姂瀵顭ㄩ崘銊愭鏌℃担鍝ュ缂侀硸鍙冨畷?*:
  - 闁圭厧鐡ㄥú鐔煎磿閺夋埈鐓ラ柟瀛樼箓濮ｅ顪冮妶鍛粵闁轰礁鍚嬬粙澶愭倻濡崵鍑芥俊鐐€楅崕銈囧垝閿曞倹鍎嶉柛鏇ㄤ簽閻熸劖绻濇繝鍐ㄧ伇缂佺粯锕㈠畷妤呭Ψ閵堝洨鎲挎繛鎴炴尭椤戝棛鍒掗敃鍌涚劵闁逞屽墴瀹曟瑩鎮€靛摜顦梻渚囧墻閸犳岸宕撻崹顐も枖閹兼番鍔嶅銊╂煛婢跺骸鍔电紒璇插暙閵嗘帡妾卞┑鈽嗗幗缁哄€熺疀閺囩姴鐓氭繛鎴炴尨閸嬫捇鏌?
  - 濠电偞鍨甸悧鎰板垂閸屾稏浜?AI 闂佸憡甯掑Λ娆撴倵娴犲纭€闁炽儴娅曢煬顒勬煕閹烘挾绠撴い顐ｅ姍楠炩偓濞达絿顣介崑鎾存媴缁嬫娼遍柡澶屽仩婵倝鍩€椤戝潡妾烽柍褜鍏涚欢姘跺极婵犲嫭瀚氭い鏍ㄧ▓閸嬫挻鎷呴崨濠傤伅缂傚倷鐒﹂幐濠氭倶婢舵劕绠戝ù锝夘棑椤撴椽姊婚崒婊庢閽樼喎顫楃紒妯哄缂佹閰ｅ畷妤呭Ψ閿斿墽鎳侀梺鍛婂灴缂傛氨鎹㈤崘銊ｂ偓鎺楀煡閸涱垳顦梺鍛婂灥缁绘劙鎯冮婊勫厹妞ゆ巻鍋撻柛銊ョ箻楠炴垿濮€閳ュ啿韦闂?

## 2.3.22 - 2026-03-30

### Modified

- **濠电偞鍨甸悧鎰板垂閸屾稏浜滃ù锝呭枤濞兼劙鏌涢幒鎾舵噧妞わ富鍓欓埢鏃堝Ω閵夈儳鈧鏌＄€ｎ偄濮堥柡浣哥秺瀹?*:
  - 闁诲繐绻愬Λ娆戠矓妞嬪孩瀚荤憸鐗堝竾閳ь剙顦甸崹鎯ь煥閸♀晜缍堥梺鍛婂笚閻熴儵藝椤掆偓閳绘棃濡搁埗鈺佷壕婵犻潧鐗忛崺鐘绘偣娴ｆ彃澧查柡鍡秮瀹曘儵宕煎鍡欘槹闂佸憡顨嗗ú鏍閸洖绀嗛柛鈩冾焽閳ь兛绮欏畷锟犲煡閸涱垳顦紓鍌欒兌閸犲秶绮╃€甸晲娌柡鍥╁О娴犳盯鎮烽弴鐐搭棤婵炴彃锕︾槐鎺楁偄濞茶鎮侀梺闈涙缁€渚€藝椤掆偓閳绘棃濡搁埡浣诡仴婵☆偆澧楃换鍌炲垂鎼达絾鏆滈柛鎰屽懐鎲?Top 婵犮垼娉涘ú锕傚极閻愬搫绠抽柟鐑樻处閺€浠嬫煏?
  - 闁荤喐鐟ョ€氼剟宕归娑樼窞闁搞儯鍔嶉弳鍫ユ煕閵夛箑绀冮柕鍡楀暣瀵劑鏌呭☉婊咁槹婵炴潙鍚嬮敋闁告ɑ鐩獮鎰緞鎼粹剝顔囬梺鍛婃煟閸斿瞼绱炴繝鍕暗闁哄嫬娴氬鎰版煕閹烘挾鎳囬柛锝囧厴閹啴宕熼顐Ｐｅ┑鐐差槶閸斿秹宕归妸褎鍠嗛柛鏇ㄥ亜閻忕喖鏌涘顒傂ュù鐘崇洴瀹曘儵宕奸鍌滎槷婵炴垶鎸哥粔鎾疮閳ь剟鏌ｉ埡浣烘憼閻㈩垱娼欒彁鐎瑰嫭婢樺鎶芥煕濡厧鏋庢い顐ｅ姉閹峰濮€閻樿尙顦伴梺纭咁嚙缁绘宕奸鍫澪?
- **闁荤姵浜介崝鎴﹀Υ婢舵劖顥堟い顐幗閸炲鏌￠崟顒佸鞍婵″弶鍨圭槐鎺楀幢濡厧顥庨悗娈垮枛缁绘帞鍒掗悜妯尖枖闁?*:
  - 闂佺懓澧庨弲顐︹€栭崶顒€绀傞柛娆愶耿閻撯晠鏌ｉ妸銉ヮ伀闁逛紮缍佸畷娆撳箣濠靛牃鍋撻悜钘夌闁哄洠妲呴弨鑺ョ箾缂堢姷鍔嶉柟绋款槺閹澘鐣濋埀顒傚垝瀹ュ棛顩烽悹浣告贡缁€澶嬵殽閻愭彃顣崇紒顔惧劋缁嬪鍩€椤掍焦鍎熼柡鍐ㄥ€归弳蹇涙煕閹烘柨顣肩紒澶愵棑閹峰綊鐛惔鎾充壕濞达絽鍘滈崑鎾诲及韫囷絾缍岄梺闈涙缁€渚€宕戝澶嬪珔闁告洦浜為悷銏ゆ煛娴ｅ搫顣肩€规挷鐒﹂妵鍕偨閸涘﹥銆冮梺姹囧妼鐎氼厼危閹寸姷纾奸柛鈩冾殔闂呮﹢鏌?
  - 濠电偞鍨甸悧鎰板垂閸屾稏浜滈梻鍫熺〒娣囨椽姊洪鍝勫缂佷緤绠戦～婵堚偓娑櫳戦弳顓炩槈閹捐銆冪紒顔兼捣娴狅箓寮撮悩顔荤驳闂佸搫鐗冮崑鎾诲级?5 闂佸搫顦Σ鍕濠靛鏋佺紓鍫㈠Х缁夊ジ鏌涢幒鎿冩畽闁靛棗鍟村畷銏⑩偓锝庡墰缁辨艾鈽夐幘铏儓闁搞劌閰ｅ畷婊堟嚑椤掆偓濞堢娀鏌″鍛Щ缂佹唻绻濋弫宥囦沪閽樺顏￠柣蹇撶箲閸ㄥ潡濡存径鎰棃闁靛繈鍨哄Λ濠氭煕濮橆厼鐏ョ€规洑鍗抽幃浠嬪Ω閿濆倸浜?
- **濠电偞鍨甸悧鎰板垂閸屾稏浜滈柣銏㈡暩閻酣鏌ら崫鍕偓鐑藉箞閵娿儺娼?*:
  - 婵烇絽娴傞崰鏍囬幓鎺嗘闁割偓绲介悗顓㈡煛閸愶箑鍔氱€圭顭烽獮鎰緞鐎ｎ偆鐣遍柣鐔哥懃濡霉濡崵鈻旀い鎾跺枑缁犳垵霉閻樼儤顥夐柟顔筋殘缁辨捇鍩€椤掍胶鈻曢弶鍫氭櫇閸ㄦ娊姊婚崒銈呮珝妞わ絼绮欐俊?
  - 濠电偞鍨甸悧鎰板垂閸屾稏浜滈梻鍫熺〒娣囨椽姊洪鍝勫缂佷緤绠戦～婵堚偓娑櫳戦ˇ褔姊婚崒姘辨憼闁轰礁鍚嬬粙澶愭倻濡崵鍑介梺鍝勫閹逛線顢氭导瀛樺剭闁告洦鍓氶幏閬嶆煕閿旇棄顥嬮柣鎿冨弮瀵粙鎮℃惔锝囶攨闂佸搫瀚晶浠嬪Φ濮樿泛违?

## 2.3.21 - 2026-03-30

### Added

- **闂?Docker 闂佺厧顨庢禍婊勬叏閳哄懏鐒鹃柕濞у棭鍞归梻浣哄亾瀹曟﹢鎯?*:
  - 闂佸搫鍊瑰姗€路?`.github/workflows/deploy-non-docker.yml`闂佹寧绋戦懟顖氾耿?`main` 闂佸憡甯掑Λ娆撳极椤曗偓楠炴帡濡搁埞鎯т壕濞达絽鎲￠崐鐢告煕濞嗘ê鐏ラ柛銈嗙矒瀹曟繈濡搁敂鎯р叞婵°倗濮撮懟顖炴嚐閻斿吋鐒绘慨妯虹－缁?SSH 闂佸湱鐟抽崱鈺傛杸闁哄鏅滅划搴ㄥ煝婵傚憡鐒鹃柕濞у棭鍞归梺?
  - 闂佸搫鍊瑰姗€路?`src/server/scripts/deploy-linux.sh` 婵?`src/server/scripts/deploy-windows.ps1`闂佹寧绋戦惉鑲╁垝閻戞鈻旈柍?Linux / Windows 闂佸搫鐗嗙粔瀛樻叏閻旂厧闂柕濞垮€楅悷鎰版煟閵娿儱顏┑顖涙そ瀹曪綁寮介妷銏犱壕濞达絽婀遍埀顒夊灠椤曟瑩骞侀幒鍡椾壕濞戞挾鐔? 闂備焦褰冪粔鎾箚鎼淬垻鈻旈幖绮光偓鍙夋▕闁瑰吋鎸抽弨閬嵥夐崨鏉戣摕闁靛濡囬妶锔剧磼鐎ｎ亶鍎嶉柍?
  - 闂佸搫鍊瑰姗€路?`docs/闂傚倸鐗婂鈧琽cker闂佺厧顨庢禍婊勬叏閳哄懏鐒鹃柕濞у棭鍞归悗娈垮枓閸嬫捇鏌涘▎鎰仸闁哄鍟々?md`闂佹寧绋戦張顒勫汲閿濆鍋犻柛鈩冪懄缁愭鏌″鍛偍闁逞屽厸缁€浣规櫠閻樼數纾炬い鏃囧Г閽傚霉閻樿櫣鍫柍褜鍏涚拋顤玞rets 闁荤喐鐟ョ€氼剟宕瑰┑鍥┾枖閹兼番鍊曟竟鏍煛閸偄澧插ù婊冾嚟閹峰綊鏁愰崼銏㈠骄闂佷紮绲界悮顐﹀焵?

### Modified

- **闁荤姵鍔х粻鎴濈暦閻旇　鍋撻悽闈涘付闁告瑥妫濋獮鎰緞鎼搭喖鎮呴梺鍛婎殕濞叉牞銇愰崹顕呭殨闁惧繒鎳撻濠囨煛婢跺苯鏋庢鐐存崌閺?*:
  - 閻庣敻鍋婇崰鏇熺┍婵犲嫭瀚婚柨鏇楀亾鐎规洜鍠栭獮鎰緞閸″繐浜炬繝濞惧亾婵﹫绠撳浼村箻閸愯尙顦伴梺鍛婄懃閻ㄦ繈鍩€椤掍胶缂氶柍褜鍏涢悞锕傚极椤旂晫顩锋俊顖濇閺夋椽鎮归幇鍓佺暠鐎规洜鍠栭獮鎰緞閸″繐浜炬繝濞惧亾婵﹫绠撳浼村箻鐠団€虫倕闂佸憡顨嗗ú鏍亹閸ф鐏虫繝闈涙处琛奸柣?`orderId`闂佹寧绋戦懟顖烆敋闁秴绀傞柕澶涢檮椤ρ呯磽閸屾碍鎯堥柣顭戝灣閹峰濮€閻樿尙顦伴梺鍛婄懇椤ユ挸鈻撻幋鐘冲闁哄娉曠粔鍧楁煟閳轰胶鎽犻悽顖氼嚟閹峰锛愭担鐣岊槹闂佸搫鍟版慨鐢稿疾閵壯勫仒閻忕偟鍎甸崑?
  - 闁诲海鏁搁崢褔宕ｉ崱娑欌挀闁煎憡顔栭崬鐣岀磽娴ｅ牆鎳愰弫楣冩煙?`orderId` 闁荤姴鎼悿鍥╂崲閸愵喖鏋侀柣妤€鐗嗙粊锕傚箹鐎涙ɑ灏柛鎴磿閳ь剚绋掗敋婵犫偓椤忓棙濯奸柡澶庢硶缁夊灝鈽夐幘鎶筋€楅柟顔芥崌楠炲秶鎲撮崟顒傗偓顔济归悩鐑樼【闁哥偞鎸抽弻灞筋吋閸滀焦些闁荤姳鐒﹀妯肩礊瀹ュ鏅€光偓閳ь剟鍨惧Ο鑽も攳婵犻潧妫欓崐鍗炩槈閹绢垰浜鹃柣鐘遍檷閸ㄧ懓鐣烽悢鍝モ枖鐎广儱瀚粣妤呮⒑閹绘帞孝妞わ附鐓″畷妤呭Ψ閵壯勭殤闂?
- **闂佽桨鑳舵晶妤€鐣垫担骞夸簻闂傚牊绋戦悗鑽ょ磼椤愩儱鍚规繛鍙夊閵囨劙寮村杈╂喛閻熸粎澧楀ú鏍矗閸℃鍤堝Δ锔筋儥閸炴挳鏌ゆ潏銊︾叆濠?*:
  - 闂佸搫鍊瑰姗€路?`web/src/lib/transaction-categories.ts`闂佹寧绋戦惉鑲╁垝閻戞鈻旈柍褜鍓涚槐鎺斺偓娑櫭闂佽　鍋撻悹鍝勬惈瀵?闂佽　鍋撴い鏍ㄨ壘濮ｅ鏌涢幒鎴烆棤閻炴凹鍋婇幆鍕敊閼测晝协濡ょ姷鍋犲▔娑⑺囬弻銉﹀仺闁靛鍎遍悡鍌炴煛娴ｅ搫顣肩€规挷鐒﹂妵鍕礂閸濄儳鎲垮┑鐐村灥閻楁劙宕归崒娑栦簻闁绘劕鍘滈崑?
  - 闂佽桨鑳舵晶妤€鐣垫担骞夸簻闁割煈鍋勯·渚€鏌涢弬璇插閽樼喓鎲搁悧鍫熺８闁逞屽厸閻掞附绔熼幒妤佺厒闊洦姊归弳顓㈡煕閹烘垶顥犻悶姘煎亰婵″瓨鎷呴挊澶嬵唶闂佸憡鏌ｉ崝宀€绱炴繝鍕暗闁哄嫬娴氬鎰版煕閹烘挾鎳冮柛銊ュ船椤曟瑦娼幍顔炬喛闁诲海鏁搁崢褔宕ｉ崱娆屽亾閻熺増婀伴柛銊﹀哺瀹曘儲鎯斿┑鍫㈢崶闂佸憡鑹鹃張顒勵敆閻愬搫绀嗛梺鍨儐閻撯偓闂佸憡甯掑Λ娑氭偖椤愶附鍎庢い鏃囧亹缁夊潡鏌ㄥ☉妯肩劮缂侀鍙冨畷妤呭Ψ閿旂粯鏁遍梺琛″亾妞ゆ牗绋戦惁顕€鏌ｉ埡浣烘憼閻㈩垱鎸抽幊鏇㈠籍閳ь剟宕楅崒鐐插珘闁逞屽墯濞煎骞嬮悩鍐茬劯闁诲骸婀遍崑娑㈠垂鎼达絿灏垫慨鐟版礌閸?
- **濠电偞鍨甸悧鎰板垂閸屾稏浜滃ù锝呭枤濞兼劙鏌涢幒鎾舵噧妞わ富鍓欓埢鏃堝Ω閵夈儳鈧鏌＄€ｎ偄濮囨い銈呭暙椤?*:
  - 濠电偞鍨甸悧鎰板垂閸岀偛绀嗛柛鈩冾焽閳ь兛绮欏顒勫级濞嗙偓婢旈梺鐐藉劜缁繘锝炴径鎰婵炲棗娴氬Σ鍨箾婢跺牆濡烽柍褜鍓氱换鍕垝閾忚濯奸幒鎶藉焵椤戣法鐣眔p 婵犮垼娉涘ú锕傚极閻愬鈻旈幖娣妼濞呫劌螞閻楀牏绠撻柛銊ユ捣閺侇噣宕樼捄銊ь槷婵炴潙鍚嬮敋闁告ɑ绋撴禒锕傚即閻橆喕绮甸梺鐓庮殠娴滄粍鎱ㄩ埡鍕╀汗闁圭儤妫侀～锕傛偡濞嗗繐顏╅柛顭戝灠閳昏姤寰勭€ｎ兘鏀ㄦ繛鎴炴尭椤戝棗顭囬悽鍛婂剭闁告洦鍋呯粊濂告倵鐟欏嫯澹樻繝褉鍋撻梺鍝勬媼閸ㄩ亶寮鈧畷娆撳箒閹哄棗浜?
  - 婵炲瓨鍤庨崐鏍ｅΔ鍛強閹艰揪绲块惌搴ㄦ煛閳ь剟顢涘☉妯兼Х闂佺懓鍚嬬划搴ㄥ磼閵婏箑绶為柛銉ｅ妽閺嗗牓鏌ㄥ☉妯垮闁艰崵鍠栧顒勫级濞嗙偓婢旈梺鐐藉劜缁矁銇愯閹洨鈧綆鍋呯粻鎺戭熆鐠虹儤澶勯柡浣哄仱閸ㄦ儳鈹戦崼銏℃噣闂備緡鍋勯¨鈧紒杈ㄧ箖缁楃喐寰勯崫銉ㄥ闂婎偄娴傞崑濠囧焵椤掑倸鏋庢い鎾存倐瀵濡烽妷銉ユ闂佸搫绉村ú锕傚极閻愯瑙勬媴鐟欏嫬鐦婚梺?
  - 婵炲瓨鍤庨崐鏍ｅΔ鍛強閹艰揪绲块惌搴ㄦ煛閸愩劎鍩ｆ俊顐㈡健瀵劑鏌呭☉婊咁槹 `MM-DD HH:mm` 闂佹眹鍔岀€氼噣鎮￠銏犲唨闁绘挸娴风涵鈧梺鍝勫婢т粙濡靛鑸垫櫖閻忕偠妫勫▍銈夋倶韫囨柨鐏撮柡鍡涗憾瀵噣宕奸弴鐕傜吹婵炴垶鎸昏ぐ鍐敋椤斿墽鐜婚柛鏇ㄥ亞濞煎矂鏌涢幒鎿冩畽闁靛棗鍟撮幆鍐礋椤掆偓閻ㄣ劑鏌涘Ο渚剭闁?
- **AI 濠碘槅鍨埀顒€纾埀顒傚厴閺屽﹤顓奸崶鈺傜€梺鍛婂姇閹冲酣鎮洪妸銉庣喖鍨惧畷鍥╊攨闁荤偞绋忛崕鐢电礊?*:
  - `/api/ai/models` 闂侀潻璐熼崝宥呂涢妶澶婃瀬闁绘鐗嗙粊锕傚箹鐎涙ɑ灏版俊鐐插€婚幃浼村Ψ閳哄啰啸闂佸憡鍔曢幊搴ㄦ偤閵娾晛绠戝ù锝囧劋閻ｅ崬顭胯閸嬫盯宕硅ぐ鎺戠哗閻熸瑥瀚崣鈧繛鎴炴尭闁帮絿鍒掗婊勫闁靛牆鏋烘笟鈧畷鍦偓锝庡弾閸ゃ垽鏌涘▎鎰⒌闁逞屽墯濡叉帞娆㈤锔芥櫖閻忕偠鍋愰悷婵嬫煕閹邦剛孝闁搞値鍙冮幃鎶藉级閸喚浠氶柣鐐寸◤閸斿矁銇愰弻銉ョ闁规儳纾壕璇裁归敐鍛棞闁搞劌宕娆撴惞鐟欏嫮鍑介梺?500 闂佹眹鍔岀€氼參宕曡箛娑樼闁绘劕鍘滈崑?

### Fixed

- **闂佽鍓氬Σ鎺楋綖瀹ュ洦灏庨柛鏇ㄤ邯閻涙挾绱撴担鍝勬灆妞ゆ挻鎮傞弻鍡涘垂椤旂厧璧嬮梻浣瑰絻缁夋挳藝閼碱剚濯奸柨娑樺閺嗩剟鏌涚仦璇插闁?*:
  - 闂佽鍓氬Σ鎺楋綖瀹ュ棎浜滈柛顭戝亞濠€浠嬫煙椤掑倻甯涢柍褜鍓氬Σ鎺旂矈椤愶絿顩茬憸搴☆渻閸岀偞鏅悘鐐舵閸ゆ帡鏌涘顒佹拱妞ゆ帞鍋ゅ畷姘跺箯瀹€鈧妶顐⒚瑰┃鐘叉椤︹晠鏌熼幘顕呮婵炲牊鍨垮畷鎺楀Ω閵婏附鍎撻梺鐑╂櫓閸犳鎮ラ敐鍡欌枖鐎广儱鎳庨弲娆撴⒑閹绘帞孝妞わ附鐓″畷锝夋偐閹绘帩娼遍梺鍛婂笚婵晫绮婇锝囶洸鐟滃秹骞冩惔锝嗗閹烘娊鍩€?
- **闁荤姍鍐仹濡ょ姴娲﹂妵鍕礂閸濄儳鎲块梺绋胯閸斿繘骞栭锝冧簻闁汇垻顣介弫鍕煛娴ｅ搫顣肩€规挷绶氬畷鍫曟倷鐞涒€充壕闁逞屽墯缁岄亶顢欑粵瀣Η**:
  - 闁荤姍鍐仹濡ょ姴娲﹂妵鍕倷閸忓浜惧ù锝囶焾娴滃爼鏌﹂崘銊ヮ伃闁靛棗顦靛畷鐑藉Ω瑜庨崺鍌炴倵閸︻厼浠ч柍瑙勭墵瀵偊鎮ч崼婵堛偊闂佺懓鐡ㄩ悧妤冩暜閹绢喖鐭楅柨婵嗘噹椤綁寮堕悙鑸殿棄闁靛洦鍨归幏褰掑Ψ閿旂瓔妲繛鎴炴尭缁夋挳宕埀顒傗偓娈垮櫍缂傛岸銆侀幋锕€鐐婇柣鎰€€閸嬫捇鍩€?mock 闂佽桨鑳舵晶妤€鐣垫笟鈧弫宥囦沪閻愵剚姣夋繛鎴炴崌缂傛氨鎹㈤幋锕€鐐婇柣鎰暯閺佸嫰鏌涢幒鎿冩畽闁靛棗鍟撮悰顔炬崉閾忚缍岀紓浣插亾闁惧繗顫夐崺鍌炴倵閸︻厼浠ч柍瑙勭墵楠炩偓濞达絿顣介崑?

## 2.3.20 - 2026-03-29

### Fixed

- **闂佸憡鎸哥粔鍫曨敂椤掑嫬鍑犻柛鏇ㄥ亞缁憋箓鏌熼婊冪仼妞?*:
  - 濠电偞鎸搁幊妯衡枍?`web/package.json` 闂?BOM 濡ょ姷鍋涘鑸电珶閸儳宓侀柛鎾茶閳ь剚顭囬幏瀣Χ閸℃鈧喖霉閻樼儤纭剧憸鐗堝絻椤垽鏁愰崨顖氱厬闁荤喐鐟辩徊楣冩倵娴犲违?
  - 婵烇絽娴傞崰鏍?`SavingsGoalDialog` 婵?`SavingsPlanDialog` 婵炴垶鎼╅崢鐓幟哄鍕枙閺夊牃鏅濋崹鍐测槈閹炬娊顎楁繛鍏肩墱閳ь剚绋掗〃鍫ヮ敄娴ｅ湱鈻旈柟缁樺俯閸ゃ倝鏌ゅ畡閭﹀殶婵炲牊鍨归幏鐘活敇閻旀亽鈧﹪鏌熼崷顓炴瀻婵炲吋鐗犻弫宥囦沪閸欍儱鍨濇繝?`web/` 闂佸搫顑呯€氼剛绱撻幘缁樼叄闁硅鍔楅悢鍛存煏?

## 2.3.19 - 2026-03-29

### Modified

- **婵犮垼娉涚粔鐑藉窗濡崵鈻旈幖娣妽閼茬姴鈽夐幙鍐ㄥ箹閻庤濞婂畷鍫曟倷椤掑倸鐏辩紓浣圭⊕瀹曟﹢藟閸℃稑绀嗛柛銉檮閸欏繑鎱?*:
  - 缂傚倷缍€閸涱垱鏆伴柣鐘差儏閸燁垶寮抽敐鍛闁割偓绲介悗顓烆渻閵堝浂鏆柍褜鍓氱划宀勊囬懠顒佸妞ゆ挻绻勯悷銏ゆ⒒閸℃顥欓柤鍨灴閸ㄦ儳鈹戦崵閫涚窔瀹曠顪冮幑鎰箑闂傚倸妫楀Λ鏃堟嚈閹寸偞鍎熼柨鏃囧Г閽傚鎲搁懜顒€鐏╂繛瀛橈耿閹啴宕熼銏㈩槮婵炴挻鐨滈崨顔界暚闂佽皫鍕亰缂?X 闁哄鍋熼ˉ鎰偓鍨墵瀹曡埖娼忛崜褏顦紒缁㈠弾閸犳洜鎹㈠璺虹煑闁稿繐鎳忓▍鐘绘煟瑜庨崕鎶藉垂鎼粹寬鎺楀籍閳ь剟鎮ラ敐鍥╅┏闁诡垎鍛闂佽桨绀侀悺銊ノ熸径宀€鐭嗛柟顓熷坊閸?

## 2.3.18 - 2026-03-29

### Modified

- **濠电偞鍨甸悧鎰板垂閸岀偛鐐婇柟瑙勫姂閳ь剙鍟扮划鏃傛嫚閹绘崼妤冪磼閺冩垵鐏犵紒鏃堫棑娴狅箓鍩€椤掑倵鍋撻棃娑氱Ш缂?PC**:
  - 闁诲繐绻愬Λ宀勫焵椤掍胶鐭嬮柡渚囧枟缁傛帒螣閼姐値鍎撻梻渚囧墯閹哥鐣烽弶鍟冩帡寮悰鈥充壕婵犻潧妫欑€氭煡鏌嶉妷锔剧煁婵犫偓娴兼潙瀚夐柣鏂挎啞閺嗩亪鏌涜箛瀣姍缂佹鐭傚銊╊敍濮橆剚鐦旈梺鐐藉劜缁烩偓閻炴艾宕锝夋偐閹绘帒鑰块梺缁橆殔濞层倕锕㈤鍡欑煋閻犲洦褰冭缂備焦妫忛崹顖滃姬閸愵喖缁╅梺顐ｇ缁€瀣煕閵夛箑绀冮柕鍡楀暣瀹曠兘濡搁妷銈囶唵闂侀潧妫斿ù鍥敋閳哄懎鍙婇幖绮瑰墲闊剟鏌涘▎蹇曪紞婵炲牊鍨垮畷锝囦沪閽樺浠氶柣銏╁灠閸燁偊鎯囬鍕?
  - 缂備礁顦抽褎鎱ㄩ埡鍐崥妞ゆ牗纰嶇粋鍫ユ偠濞戞牕濡奸柡鍕€婚埀顒傛暩椤牓骞冮幘鎰佹桨闁靛闄勯弳顏嗙磼閹邦剙顏╅柛?`84px`闂佹寧绋戦懟顖氾耿椤忓懐鈹嶆繝闈涚墛濞堝矂鏌涘▎蹇撳笭闁哄懎鐖煎顒勫炊瑜忛幗鐔兼煕濞嗘ê鐏ユい鏇氬嵆楠炩偓鐟滃繐鈻撻幋锕€绀堢€广儱妫楃徊鐟扳槈閹炬剚鍎忛柡浣圭墵閺屽矁绠涘顒€鐏￠柡?PC 闂佺粯顨呴悧鎾澄ｉ崟顓熷珰缂備焦蓱閻撴瑧鈧鍠栫换鍫ュ焵?
- **濠电偞鍨甸悧鎰板垂閸岀偟宓侀柛鎰絻闁?Logo 婵犮垼鍩栭悧鏇烇耿閳ь剟寮堕崼锝庢綈妞ゃ垹顑囩划鏃€绻濆顓犲綉**:
  - 闂佸憡顭囩划顖滄暜閳ь剟鏌￠埀顒勵敍濞嗘垵绗￠柣搴ゎ潐缁哄潡鍩€椤戣法顦﹀ù婊勬礃缁岄亶鍨鹃崘鍙夊皨婵帗绋掗…鍫ヮ敇婵犳氨宓侀柛鎰絻闁伴亶鏌涢妷褍浜鹃柣鏍电稻瀵板嫰寮借濠€鎾煟?`ring` 闂佺顕х换妤冪博閻斿吋鏅悘鐐跺亹缁犱粙鏌ｉ敐鍡欐噭閻犳劒鍗抽幊婵嬪箵閹烘柧浜㈤梺鐟扮仛閿曨偆妲愬┑瀣闊洦鎸惧В宀€鈧灚濯芥慨銈夋偉閿濆绀岄柛婵嗗閸樼敻鏌ｉ妸銉ヮ伂妞ゎ偄顑囬幉瀛樺緞婵犲倸褰欓梺閫涚祷閸╁洭鍩€?
- **濠电偞鍨甸悧鎰板垂閸岀偟宓侀柛鎰絻闁?Logo 闁圭厧鐡ㄥú妯绘櫠椤撶姷鐭撳┑鐘崇閻?*:
  - 闁哄鏅滅粙鎰博閺夋埈娼伴柕澶堝劚缁犵敻鏌熼崫鍕垫Ч闁轰緡鍠楃粋鎺懳熼搹瑙勬緭闂侀潧妫旂粈浣圭閺囩喓鈹嶉柍銉ュ暱閹搞倕顫楀☉娆樼劸妞ゆ挸顭烽悰顕€宕橀幓鎺楀彙闂佹悶鍎抽崑鎾绘偉閿濆棗绶為柡宓懏鍕鹃梺姹囧妼鐎氼厾绮婇鍕殞闁圭粯甯楁俊鍥偡濞嗘劕绗掔紒銊﹀▕楠炲秴顫滈崼銏㈩槷婵炲濮撮幊宥囨崲濮樿埖鍋?logo 闂佸搫鐗滈崗娑氱礊鐎ｎ偆鈻旈幖绮光偓宕囩崶婵炶揪绲界粔鎾及閸屾壕鍋撻崹顐ｅ仩闁?
- **濠电偞鍨甸悧鎰板垂閸岀偞鍊绘い鎾跺仜闂呮﹢鏌ｉ娑欐珚婵☆垪鍋撴俊銈呭€归敋閻庤濞婂畷銏⑩偓锝庡墰缁?*:
  - 闂佸憡锚椤戝洨绱撴径鎰伋婵犲﹤鍟撮幐顒勬煕?闁?闂佸憡甯掑Λ娑氭偖椤愶箑鐏虫繝闈涚墕閸斾即鏌涢弽顒侇仩闁绘挴鏅犲濂告偨閸偆鏆犻梺鍝勭Т濞层劑顢楅悜钘夌婵°倐鍋撴い鏃€妫冩俊瀛樻媴缁涘鏂€闂傚倸鍊婚ˉ鎰玻濞戙垹妞介悘鐐舵缁€瀣煕韫囨挸鏆為柣妤€鎲￠〃鍥熼崫鍕靛敽闂佹寧绋戦懟顖炲闯閾忛€涚剨闁硅揪缍嗛崵澶嬩繆椤栨せ鍋撻搹顐淮闂侀潻璐熼崝鎴﹀Υ婢舵劖顥堟い顐弨閸橆剟鏌ｉ妸銉ヮ伀闁哄啴浜跺畷銉╁箣濠靛棛鐛ラ梺娲绘娇閸斿﹪鍩€?
- **濠电偞鍨甸悧鎰板垂閸岀偛鐐婇柟瑙勫姂閳ь剙鍟村畷锝夊礂閸涱垳鎲柣鐔哥懄鐢帡宕㈤幘鑸殿潟闁绘ê纾鎼佹煟?*:
  - 闂佸憡顭囩划顖滄暜閳ь剚绻涢幋婵堝ⅲ闁搞劌鍊归妵鍕濞戞瑥鈧鏌涢妷锕€绀冮柕鍡楀暣瀹曪繝鏁嶉崟顐毈闂佸憡鐟ラ崢鏍箔閸屾粍鍠嗛柟鐑樻⒐閻ｉ亶鏌涢妷褍浜鹃柣鏍电秮婵″瓨鎷呴搹鐟扮厷闁荤姳绫嶉妶鍛腐闂佹悶鍎遍敃銈夊箯娴兼潙绫嶉柛顐ｆ礃閿涚喖鏌ょ€圭姵纭炬繛澶樺弮閺佸秴鐣濋埀顒傚垝閻戞鈻旈柍褜鍓熷銊╂嚋閸偅鐣伴梺鎼炲劜瀹曟﹢濡撮崘顔煎唨闁搞儺鍓﹂弳顖炴煕閺嶃劋鑸柍?
- **濠电偞鍨甸悧鎰板垂閸岀偞鍊绘い鎾跺仜闂呮﹢鏌ｉ娑欐珚婵☆垪鍋撴繛鎴炴尭鐎涒晛螞閳哄懎鍌ㄩ柛鈩冾殕婵″洭鎮峰▎鎰瑲闁轰礁缍婂?*:
  - 闂佽　鍋撻柛鎾茬劍瑜版盯鏌嶉妷锔剧煀闂佽В鏅犲畷?闁?闂佸憡甯掑Λ娑氭偖椤愶箑鐏虫繝闈涙鐎氭煡鏌嶉妷锔剧煁缂佸顥撻幏鍦喆閸曨剨绱氶梺鍛娒Λ宀勫焵椤掍胶绠撶€规洜鍠栧畷妤呭礃閳哄啫顥曢梺闈╃畱濡粓锝炲Δ鍛櫖鐎光偓閸曨亞绱氶梺绋跨箰缁夋潙锕㈤鍡欑煋閻犲洦褰冭缂備焦妫忛崹鎵暜閸モ晝纾介柍杞扮贰閸熷秹骞栨潏鍓х暠闁诡喗顨婂畷娆撴惞閻熸壆鐤€闂佺厧鐤囧▔娑樷枖椤撱垹妞介悘鐐板嫎娴滃爼鏌涢敃鈧Λ婊堬綖閸ヮ剙绠涢柣鏃傝ˉ閸?
- **濠电偞鍨甸悧鎰板垂閸岀偛鐐婇柟瑙勫姂閳ь剙鍟村畷姘旈崟鈹惧亾閸愵喖鍐€鐎瑰嫭澹嗙涵鈧梺鍛婄閸ㄥ爼鍩€椤掍焦顫楁い顐㈢У閵囧嫰妫冨☉鍗炴婵?*:
  - 闁诲繐绻愬Λ娆戠矓妞嬪孩瀚荤憸鐗堝竾閳ь剙顦甸崹鎯ь煥閸愵喗灏欓梺鍛婄懄濠㈡﹢宕规惔锝嗘殰闁告劧绲洪崑鎾斥攽閸℃ê顏梺鐐藉劜缁秹寮ぐ鎺戠哗妞ゆ牗鍑归崵鐘虫叏閿濆棙鐓涢柍褜鍓氱换鈧悶姘船椤曪綁鎮╅崣澶岊洯闁荤偞绋忛崝宥夊极婵傜绠ｉ柟閭︿簽閻熴垽鏌熼浣诡潡妞ゎ偄绉甸妵鍕枈濡嘲浜炬繝濠傛缁狀噣鏌￠崼銏犳瀾缂佸顥撻幏鍦喆閸曨厸鍋撻鐐茬闁硅埇鍔夐崑鎾斥攽閸涱垼浼囬梺鐓庡槻椤曨厼鈻撻幋婵愬晠闁挎洍鍋撴繛瀛橈耿瀹曪綁宕楅崨顔界彿闂侀潻绠戝Λ婊堬綖濡や胶鈹嶉柍鈺佸暕缁辨牠鎮跺☉妯垮缂佹棃顥撴禒锕傚焵椤掑嫬违?
  - 闂佸憡顭囩划顖滄暜閳ь剟鏌￠埀顒勬嚋閸偅娈伴柣搴濈祷椤鎯侀鐣屸枖妞ゆ挾濮甸悾杈ㄤ繆椤栵絼绨婚柟顔界矋濞艰鈽夊Ο渚敽闂佸搫顦Σ鍕濠靛牏纾奸柣鏂垮椤忓崬鈽夐幘璺哄妺婵炶尪娉曠划濠氬焵椤掆偓鐓ゅù锝囧劋閻ｉ亶鏌℃担瑙勭凡闁逞屽墰閸樠囧垂椤忓棙鍋橀柕濞垮劤绾偓闁荤偞绋忛崝蹇涘箵椤忓牆违?
- **濠电偞鍨甸悧鎰板垂閸岀偛绫嶉柕澶堝劚閸?PC 缂備焦妫忛崹浼存偤瑜庨幏鍛村箻閹颁焦婢旈悗?*:
  - 闂佸湱绮崝娆撴偟椤斿皷妲堥柛顐到閻庮參鏌￠崘锕€鍔氱€圭顭峰畷?PC 缂備焦妫忛崹鍐测枔閹达箑绫嶉柕澶涢檮閸╁倿鏌涘鍐劯闁革絿鍋撻敍鎰攽閸℃瑦鎲婚梺鍛婄懃閸ゆ牜妲愬┑鍥ㄦ珷闁绘劖褰冪换渚€鏌￠崒婊勫殌婵炵》绻濆畷姗€宕ㄩ鑺ヮ啀闂佺锕ㄩ崑鎰枔閹达箑鐭楁い鏍ㄧ箥閸ゃ垽鏌熼顑胯閸?
- **濠电偞鍨甸悧鎰板垂閸屾稓顩查柕鍫濇椤粓鏌￠崟顐ｆ崳缂侇喖绻戠粙濠冩綇閳哄啫鐏ｆ繛锝呮祩閸犳牠藝?*:
  - 婵烇絽娴傞崰鏍囬幓鎺嗘闁割偓绲介悗顓烆渻閵堝娑х紒銊﹀▕閺屽牓濡搁妶鍡楁敪闂佸搫瀚幐璇参ｉ幋鐘电＜闁糕剝顨呴獮銏ゆ煟濡も偓濞诧綁鎳欓幋锕€鐏虫繝濠傚閺嗩亪鏌?/ 闂佽　鍋撴い鏍ㄨ壘濮ｅ鏌嶉妷锔剧畼濠殿喗鎮傞獮鈧ù锝堫潐閻庮喗淇婂Δ鈧悧蹇撯枔閹寸偟鈻曢弶鍫氭櫇閸ㄦ娊鏌￠崟顐⑩挃闁靛洦宀稿濠氼敋閳ь剟銆傛禒瀣?
- **濠电偞鍨甸悧鎰板垂閸岀偛绀嗛柛鈩冾焽閳ь剛鏅槐鎺楀级閹存繍鍞洪梺褰掓涧缂嶅﹪宕冲ú顏勭闁宠桨鑳跺?*:
  - 婵炴垶鎸鹃崕銈囩矓妞嬪孩瀚荤憸鐗堝竾閳ь剙顦靛顒勫级濞嗙偓婢斿┑鐐村灥閻楁劙宕归崒婊€娌柣鎰ˉ閸嬫捁顦伴柍褜鍏涚粈浣烘崲閳ь剟鎮?闂佸憡鐟崹鍫曞焵椤掆偓椤︻參鍩€椤戞寧绁扮紒渚囧亰閺屽矂骞嬮悙鈺佷壕鐟滄垵顔忓┑瀣ュ〒姘ｅ亾闁绘繍鍠楅敍鎰板箣濠靛洦鐝滈梺?闁荤姳闄嶉崹钘壩ｉ崟顖毼ュ〒姘ｅ亾妞わ絺鏅濈划璇参旈埀顒佺缁嬫鍟呮い鏃囥€€閸嬫挻绗熼埀顒勬偟椤旇偐鏆嬮柡澶嬪缁ㄦ岸鏌￠崪浣哥仜闁逞屽厸缁€渚€骞婇崱娑樺珘妞ゆ劦婢€閻掑﹤鈹戦崒姘兼綗闁逞屽厸缁€渚€濡甸崶顭掔矗婵犻潧顑愰弳鏇㈡偣閳ь剟鏁冮埀顒勫箯閺夊簱妲堥柛顐到閻庮參姊婚崱妤侇棛闁煎灚鍨堕幆鏃堟晜閸撗勬儯婵犮垼鍩栧銊у垝瀹ュ绀嗛柛鈩冾焽閳ь剛鏅槐鎺楀级閹存繍鍞洪梺?
  - 闂佸湱顣介弲娑㈡儓?`/api/consumption/dashboard` 闂佽壈椴搁懝楣冨箖鎼达絿纾奸柟鎯ь嚟娴滎垰鈽?mock 闂佽桨鑳舵晶妤€鐣垫笟鈧弫宥囦沪閻撳簶鏋忛梺鍝勫€瑰姗€路閸愵喖绀嗛柛鈩冾焽閳ь剝妫勮灒闁炽儴娅曢崑銉╂煕閿斿搫濡挎繝鈧敍鍕ㄥ亾閸︻厼浠﹂柡鍡欏枛楠炴垿顢欓崗鐓庮伅濠电姵娲樺濠氬Φ濮樿泛鏋侀柣妤€鐗嗙粊锕€鈽夐幘鎰佸剶闁稿繑锕㈤幊妤呮寠婢跺本缍岀紓浣插亾闁诡厽宸婚崑?
- **濠电偞鍨甸悧鎰板垂閸岀偛绀嗛柛鈩冾焽閳ь剛鏅槐鎺楀级閹存繍鍞洪梺鎼炲劜瀹曟﹢濡撮崘顔肩闁哄秲鍔嶉弳顏堟煛?*:
  - 闁诲繐绻愬Λ宀勫焵椤掍胶鐭嬫繛鍙夊瀵板嫬顫濋鈧悗濠氭煛鐎ｎ偄濮夋繛锝庡枟閹棃鏁傞崗澶婁壕婵犻潧鎳愰惌銈吳庨崶锝呭⒉濞寸厧鎳樺畷锟犲灳閸愯尙浠氶柣鐐寸◤閸斿秹寮崗鑲┾枖闁告繂瀚В宀勬⒑閹绘帞绠版繛瀛橆焽閹即濡搁妷銉ヨ€块梺鎸庣☉閻偐鍒掗悜妯尖枖闁逞屽墴瀵劑鎳滈棃娑氫海缂傚倷鐒﹂幐濠氭倵椤栨粍鍠嗛柛鈩冾殕缁傚牓鏌曢崱鏇狀槮妞わ箒灏欓幏褰掝敇濠靛牏鎲块梻鍌氭濡棃鎳欓幋鐐村劅闁挎棁銆€閸嬫挻绗熼埀顒勩€傞埡鍐笉婵＄偛澧介悷銏狀渻鐎ｎ亪鍙勬繛鍛崌婵″瓨鎷呴崨濠勭毣闂佸搫鎷嬮崹鐗堢閸涘﹦闄勯柦妯侯槹绾剧晫绱撴担绋款仼婵炲瓨顭囬幃浼村Ω閳哄倹銆冮梺鍝勵槼閿熴儵鍩€?
- **濠电偞鍨甸悧鎰板垂閸岀偛绀嗛柛鈩冾焽閳ь兛绮欏鍫曞灳鐎圭姴鐓傞梺鎼炲劤閸嬫捇鎮ラ敐鍥╅┏濡わ絽鍟簺闁荤喍妞掔粈渚€宕?*:
  - 闁荤姴顑呴崯顖炲汲閿濆棴绱ｉ柛鏇ㄥ幘閺嗩剟鏌涚€ｎ亞绠版俊顖氾躬婵″瓨鎷呴幖鐐版捣婵☆偆澧楃换鍫ャ€傞埡鍐╁闁挎棁銆€閸嬫挻鎷呯憴鍕垫Н濠电偛鐗忛弫鎼佸磿瑜版帗鍊锋鐐茬氨閸嬫挻鎷呴崨濠傛珯闂佸搫鐗滈崑鍕閸涘﹦闄勯柣锝呯灱閹煎ジ鏌℃径鍡忓亾鐎圭姴鐓傞梺鎼炲劚婢ц棄鈻撻幋锕€鐭楅柛蹇撴噺濞呯娀鏌ｉ敐鍡欐噮婵炲憞鍥фそ?X 闁哄鍋熼ˉ鎰偓鍨墵瀹曡埖娼忛崜褏顦梻渚囧墮閻忔繈宕㈤妶澶婃瀬闁哄绨遍崑鎾诲礂閼测晛鐏辩紓浣圭⊕瀹曟绮旈幘顔肩闁告繂瀚烽崯鍥煕閿濆啫濡搁柍?

## 2.3.17 - 2026-03-28

### Modified

- **婵炴垶鎸搁…鐑姐€傞懞銉矗婵犲﹤妫楅ˉ蹇涙倶閻愭彃鈧粯顨ラ崶銊︽珷闁绘劖褰冪换?*:
  - 闂佺绻愯ぐ澶愭閳哄倻鈻斿┑鐘冲嚬閺嗩垶鏌涘Ο鐓庢灆妞ゆ洏鍨藉顒勫级濞嗙偓婢斿┑鈽嗗灙閳ь剝娅曢崑銉╂煠閻熸澘绾ф繝銏★耿瀹曪絽顫滈埀顒勫闯濞差亝鏅悘鐐靛亾閺嗘粓鏌熼梹鎰妽閻庡灚绮岃灒闁炽儴娅曢崑銉╂偡閺囩偞顥犳繛?Hero闂侀潧妫旂拋顤籸face闂侀潧妫旀惔娓唗ric Card 闂佹眹鍔岀€氼厾绮婇鍕殞闁圭粯甯掔紞宀勬倶閻愭彃鈧绮仦鐐秶閻熸瑥瀚烽弨杈┾偓娈垮櫍缂傛岸鎯冮悢鐓幬?
  - 婵炲濯禍锝夊Υ閸愵喗鍎庢俊顖滅《閸嬫挻鎷呴崷顓夈儵鎮归幇顒傜暛闁逞屽厸濞村洨绮婇锝囶洸鐟滃鍩€椤戞寧绁伴柟纭呮硾閳诲孩绌遍幍浣镐壕濞达絿顭堟禍鍫曟煢閸愩劌顏╅柛銊ラ叄瀹曟岸顢曢姀銏⑩敍闂佺绻堥崕閬嶅窗鎼淬劍瀚呮繝闈涘閸嬫挻绗熼埀顒€顭囧杈╃＜閻熶降鍊愰崑鎾寸瑹閳ь剙顭囪濡叉劙顢曢悩顐壕濞达綀顫夐鈧梻浣哄亾閸ゅ酣鍩€椤戣儻鍏屽ǎ鍥э功缁辨瑩鎮╂潏鈺佺暔缂傚倷绀佺€氼叀鍟梺绉嗗嫨浠﹂悗闈涚焸閹虫繄鎷犺缁€澶屸偓娈垮枛瀹曨剛鈧灚鐓￠崹鎯ь煥閸曨剚顔掔紓浣规⒐閻熴倗绮╅弶鎴殨闁绘灏欐穱娲煛婢跺﹦姘ㄩ柍褜鍓氱换鍕枔閹寸姵鍠嗛柛灞剧☉婵℃娊鏌?
  - 闂佸憡鑹鹃張顒勵敆閻愬灚瀚柛鎰ㄦ櫆濞堝鏌涜箛鏂库枙闁轰緡鍘界粙澶岀磼濡櫣妯嗛梻浣虹摂閸犳捇鍩€椤戞寧绁扮紒缁樕戦幆鏃堟晜閼恒儴鎷梺闈涙缁€浣虹玻濮椻偓瀵粙宕惰鐎氭煡鎮橀悙鈺佷壕闂備緡鍠撻崝鎴︽偟椤旂晫顩叉い鏇炴缁€澶愭偣娴ｅ弶娅冪紒妤€顦靛畷銉т沪閼测晝鎳濋梺鍛婃煛閸撴繆鍟梺绉嗗嫷娈旀繝鈧鍜冪磾闁哄诞鍛秳闁诲繐绻楃划楣冨礂濮椻偓楠炲繑寰勬繝鍕紱闁荤喐鐟ュΛ婊堬綖鎼淬劌鐭楃€广儱鎳忛埢鏇㈡煏?
- **婵炴垶鎸搁…鐑姐€傛禒瀣偍缂備焦顭囧Ο鍛存煟濠婂棗鍚归柟閿嬪灴瀹曠娀寮介妸锔芥瘑闂?*:
  - 婵帗绋掗…鍫ヮ敇缂佹鈻斿┑鐘冲嚬閺嗩垶鏌涘鍐殭閻庨潧鏈敍鎰熺紒妯绘畼闂佸憡鍔曢惌渚€濡撮崘顔兼瀬缂傚牏濮风粔濂告煕閹烘垶澶勭€规洖寮剁粙澶愭倻濡崵鍑介梺褰掓涧妤犳悂鎮块崟顖涘剭闁告洦鍋嗛弶浠嬫煠鐟欏嫬绲绘い鏃€鍔欏畷鎶解€﹂幒鏃傤槷闂傚倸瀚粔宕囩礊閸℃稑纭€濠电姴娲犻崑鎾圭疀閺冣偓椤牠鏌ら崘鍙夋拱婵炲懏鐟╂俊瀛樻媴姒ф挷鑳堕崠鏍ㄧ節閸屾氨绉鹃柣蹇曞仜閸婃悂骞忔导瀛樺仢闁煎鍊栫€氬懘鏌熼幍顔兼灆闁靛棗鍟村Λ鍐綖椤戣棄浜?
  - 闂佺绻愯ぐ澶愭?`ThemeHero / ThemeSurface / ThemeMetricCard` 闂佽　鍋撻梺顐ｇ缁€瀣归崗娴庮亪宕㈠☉娆愬閻犳亽鍔嶉弳蹇曠磼缂併垹鐏ュ鐟帮攻閹棃寮撮悙鏉戭伅濠电偞鎸搁幊蹇撯枍濮橆厽缍囬悷娆忓閺€閬嶆煥濞戞ɑ婀伴懚鈺呮煕瑜庨〃澶嬬珶婵犲啰顩烽柛娑卞墰缁犱粙鏌ｉ敐鍡欐噧婵犫偓椤忓懏缍囬悷娆忓閺€閬嶆煏閸℃洜鍔嶉悗鍨矒閺岋箓顢欓懡銈囨喛閻庢鍣ｇ紓姘舵儍閻旂厧閿ゆ俊鐐茬毞閸?
  - 婵炲濯禍锝夊Υ閸愵喗鍎庢俊顖滅《閸嬫挻鎷呴崷顓夈儵鎮归幇顒傜暛闁逞屽厸濞村洨绮婇锝囶洸鐟滃繘鎮洪幋鐐簻闁汇垺鏅埡鍛挃闁靛牆瀚惁婊堟偡閺囨氨鍔嶉懚鈺冪磼椤栨熬宸ラ柛妯荤矒瀵剟骞嬪▎灞戒壕濞达絿顭堢壕褰掓⒑椤愩垻绠叉俊鍙夊灥闇夋い鏃傚帶楠炪垽鏌?`backdrop-blur` 缂備焦绋掗惄顖炲焵椤掆偓椤︽壆鎷犻悙鍏告勃闁稿矉濡囩粈澶娒归敐鍫熺《闁哄拋鍋婂Λ鍐閳╁啰鍑介梺绋跨箰椤戝懘宕哄Δ鍛?

## 2.3.16 - 2026-03-29

### Added

- **闂佽桨鑳舵晶妤€鐣垫担骞夸簻闁割煈鍋呴悡鈧繝鈷€鍛粧婵﹫绠撳浼村箻閹颁礁娈搁梺鍝勫€婚、濠囧吹濠婂牆绀夐柕濞垮劤缁夎櫣绱掗锝嗩潡妞ゎ偄顦靛畷?*:
  - 闂佽　鍋撴い鏍ㄧ☉閻︻喖霉閻樿尙鍑规慨姗堢畵瀵即骞橀幇浣告闂佸搫鍊婚幊鎾荤嵁閹剧粯鐓傜€广儱鎳庨悘娆撴偠濞戞牕濡洪柤鍨灴楠炴牕顭ㄩ崨顓炰憾闂侀潧妫旂粈浣衡偓锝傚亾闂備緡鍋勯ˇ顖炴嚐閻旂厧绠ョ憸鐗堝笒濞呫倗鈧偣鍊涘▍锝夋偟濞戞碍鍠嗛柛鏇ㄥ亜閻忕喖鏌?
  - 闁荤喐鐟ョ€氼剟宕归鐐茬煑妞ゆ牗绮庨幏銊╂倵鐟欏嫯澹橀柛鈺佺焸楠炲鎹勯…鎴炲尃缂備焦绋戦ˇ鎶藉吹濠婂應鍋撶憴鍕叝缂佺姷鍠栧畷姘跺幢濞嗘帩娼堕梺鎸庣☉閼活垶鎳熼悢鐓庣煑妞ゆ牜鍋愰崑鎾村緞瀹€鈧崺鐘测槈閹绢垰浜炬繝銏ｆ硾濞诧箓寮悙瀵糕枖閹肩补鍓濈粈鈧繝闈涱樈閸嬪嫬顔忔繝姘煑闂婎偒鍘介崬澶愭煛閸曨剚灏柍?

### Modified

- **婵炲瓨鍤庨崐鏍ｅΔ鍛闁靛鍎冲銊︾箾缂堢姾鍏岄柍璇层偢楠炴帡濡烽妷銉ユ辈闂佺厧顨庢禍婊勬叏閳哄嫨浜归柟鐑樻椤?*:
  - 闂佸綊娼ч鍛叏閳哄懎妫橀柡澶嬵儥閺夎霉濠у灝鈧牕危濡ゅ懎违濞达綀妫勯ˇ鈺呮煕濡や焦绀€妞ゆ洟浜跺畷妤呭Ψ閵夛箑顏?APP 闂佸憡鑹鹃張顒勵敆閻愬搫绠抽柕濞炬杹閸嬫挻绗熼埀顒勫礂濡顕辨慨姗嗗幖閻﹁霉濠у灝鈧牕危濡ゅ啠鍋撴担鍐炬綈闁哄瞼鍠撻幉鎾礋椤愩垻浠ч梺鐓庮殠娴滄粍鎱ㄩ埡鍌滈檮婵°倕鍟弳蹇涙煕閹烘垶顥犻悶姘煎亰婵?
  - 闂佸憡鑹惧ù鐑芥偨婵犳艾妫橀柡澶嬵儥閺夊鏌涘顒€顨欑紒鏂跨摠缁傚秹濡堕崱姗嗘建闁诲簼绲婚～澶愬蓟閻斿吋鍎嶉柛鏇ㄥ墯閺嗘粓鏌涢幋鐘插妺婵＄偛鍊块弫宥囦沪閻愵剨楠忛梻鍌氭礌閸嬫捇鏌涢幇顒傂ｆい鎰偢楠炲秶鈧綆浜滆闂佽　鍋撻柣鐔告緲閻庤崵绱掗锝囨菇闁?
- **AI 濠碘槅鍨埀顒€纾埀顒傚厴閺屽﹤顓奸崶鈺傜€梺鍛婂笒濞诧箑鐣烽弻銉ョ闁哄娉曠粔濂告煕閹惧磭啸濠㈣泛瀚伴獮瀣憥閸屾粎鈻曢梺娲绘娇閸斿矂鎮?*:
  - 婵烇絽娴傞崰鏍?AI 婵＄偑鍊楅弫璇差焽閺夊３搴ｆ嫚閹绘帩娼辨繝銏犵垻閸曗偓娓氣偓瀹曞湱鈧綆鍋呴ˇ褔鏌?`accountId` 闂佸憡鍔栭悷銉╁矗閸℃稒鐓ユ繛鍡樺俯閸ゆ牠鎮楁担鍐棈闁搞伇鍥х煑妞ゅ繐鎳庣徊鍦磼閳ь剛鎮伴埦鈧崑鎾愁煥閸愩劎浠悗鐐瑰€曢幖顐﹀Φ閹寸姵瀚婚柕澶嗘噰閸嬫挸鈹戦崼鐔烘殸闂傚倸鍋嗛崳锝夈€傛禒瀣?
  - AI 濠碘槅鍨埀顒€纾埀顒傚厴瀹曟艾螖閸曗斁鍋撻崘顔嘉ュù锝堫潐缁绢垶鏌￠崒婵嗙劷闁逞屽厸缁€渚€宕硅ぐ鎺撯挃闁靛牆瀚花浼存煕濞嗗骏韬紒顕呭灣閹峰濡堕崰锝勭窔瀹曞湱鈧綆鍙庨崵銏ゆ煕濞嗘劗澧甸柍褜鍓氬Σ鎺旀椤愩倗纾奸柣鏂垮椤忛亶鏌熺粙娆炬Ц缂傚秴顑夊畷婊冾吋閸繍妲遍梺鐟邦嚟閸忔ê鈻撹缁效閸ワ絽浜?
- **AI 婵＄偑鍊楅弫璇差焽閺夋娼￠柛灞剧箥濞兼棃鏌涘Δ瀣？濠⒀勭墵瀹?PC 缂備焦妫忛崹宕囧垝閻戞鈻旈柍褜鍓熷畷锟犲即閳藉棙鏂€**:
  - 濠碘槅鍨埀顒€纾埀顒傚厴楠炩偓缂備焦蓱濞堝爼鏌曢崱鏇狀槮闁告埊绻濋弻濠傤吋閸モ晜鐎梺闈涙閻掞箑锕㈤銏＄厐鐎广儱娲ㄩ弸鍌炴煕濠婂啳瀚板┑顔界洴閹虫宕愰悤浣告闂佸搫瀚绋棵洪幘瀵糕枖妞ゅ繐鎯€娓氣偓瀹曠螖閳ь剙锕㈤鍛窞鐟滃秹鎯堥崱妯尖枖閻庯綆鍋呴弳顓炩槈閹捐櫕鎯堥柟顔芥尰缁嬪鍩€椤掑倹鍋橀悘鐐垫櫕濞兼梻绱掗埀顒勫箒閹哄棗浜?

## 2.3.15 - 2026-03-25

### Added

- **闁荤姵鍔欓弨閬嶎敄濞嗘劑浜滈柛顭戝亝閻撯偓婵犫拃鍛粶鐎圭顭峰畷锝夋嚑閸撲胶顔庡┑鐐叉閸嬫挻绔熼崒鐐茬闊洦鑹鹃崢鎾煕?*:
  - 濠殿噯绲界换鎺楁偡椤忓棙瀚婚梺鍨儛閸庛儵鏌涘▎妯虹仧閻庨潧鐭傚畷婵嬪Ω閿曗偓椤ュ洭鏌熺拠鑼缂傚秴顑夊畷婊冾吋閸繍妲遍梺鍦棎濞撳湱绮崨顓у晠闁圭粯甯╅崵銈夋煕韫囧鍔ゆ繛鍫熷灴瀹曘垽宕卞Δ鈧拺澶愬级閳哄伒鎴︻敄濞嗘劗顩查柕鍫濇椤粓鏌?
  - 闂佸憡鐗曠紞濠囧储閵堝绠ｉ柟閭﹀墮椤娀鏌涘顒傚嚬缂佽京澧楃粙澶愭倻濡紮绱滄繛瀛樺殠閸婃牕危濡ゅ啯鍋橀柕澶堝€楅悷?`loanId`闂佹寧绋戦懟顖炴嚐閻旂厧绠板璺猴工閸ゆ帡鎮归崶褎顥滈柛鈺佹閹啴宕熼鍓ь啂濠电偛妫欏畷姗€顢欓崶顏備汗闁哄洢鍨瑰▍銏㈢磼閻樻剚娈欓柟纭呮硾閳诲酣骞嗚閳锋牕霉閿濆棛鎳囬柛锝囧亾閿涙劕鈹戦崨顖滄喛閻庤鐡曠亸顏嗘崲閺囥垹瀚夐柣鏂挎啞濞堝爼鏌?

### Modified

- **闂佽桨鑳舵晶妤€鐣垫担铏逛笉闁挎稑瀚崐鐐差渻閵堝懐浠涘褎绮撳畷婵嬪Ω閵壯呅梺绋跨箞閸庡崬鐣峰畝鈧惀顏囶槺閻犳劗鍠栧銊ф崉閸濆嫬姹?/ 闂佽　鍋撴い鏍ㄨ壘濮ｅ鏌涘▎蹇旀拱閼垛晝鈧?*:
  - 闂佸搫鍊瑰姗€路閸愵喖鐏虫繝濠傚暟缁夊潡鏌涜箛瀣姕闁轰礁缍婂畷?/ 閻熸粎澧楀ú鏍矗閸℃稑缁╂い鏍ㄨ壘濮ｅ鏌嶉妷锔剧畺閻庡灚绮撻弻锕傤敊閻撳海鈧ジ鏌熺拠鈩冨▏闁?
  - 闂佽　鍋撴い鏍ㄧ☉閻︻喖霉濠婂嫬鐏存俊顐灡缁傛帒螣缁洖浜惧〒姘ｅ亾闁瑰€熶含閹壆浠﹂挊澶婅€块梺闈涙閼冲爼鐛崶顒佺厒闁瑰濮烽幖濂告煛閸愵亜校缁绢厼澧庨埀顒傛暩閸樠囧吹椤撱垺鍎嶉柛鏇ㄥ墰鍟搁柣鐘冲姌椤鏅跺鍫濈闁靛鍓径搴涗汗闁哄洦菤閸?
  - 闂佽　鍋撴い鏍ㄨ壘濮ｅ鏌涢幒鎴烆棤閻炴凹鍋嗛幃浼村Ψ閵夈儱绗梺鐐藉劜缁繒鎹㈤弴鐐╂瀻?/ 婵烇絽娴勭槐鏇㈠极閵堝纭€闂勫洨鎹㈤弴鐐╂瀻?/ 闁荤姵鍔欓弨閬嶎敄濞嗘劖浜ゆ俊顖涙た閸?/ 闁哄鍎愰崜婵囧緞閸曨垰缁╂い鏍ㄨ壘濮ｅ鏌嶉妷锔剧畼闁烩剝鍨块弻鍛緞閹扳斁鍋撳澶娢?
- **婵烇絽娴勭槐鏇㈠极閵堝纾归柣鏃囧吹缁犵兘鎮楅悽闈涘付闁告瑥妫涢幏鐘诲幢濡も偓閻掔厧顭胯閸嬫稑顔?*:
  - 閻庣敻鍋婇崰鏇熺┍婵犲洤鐏虫繝濞惧亾濞ｅ洤锕幃浠嬪Ω閵夈儱鑰块柡澶嗘櫆钃辨い鎴炵懇閸ㄦ儳鈹戦崨顔兼敪闂佸搫瀚幐鎼侇敋闁秴绀傞柕澶涢檮椤ρ囨偣閸パ勵棞闁糕晛妫欑粙?`REPAYMENT`闂?
  - 闂佽　鍋撴い鏍ㄧ懅鐢盯鎮楃憴鍕闁逞屽墯缁牊绌辨繝鍥ㄥ仺闁靛鍎崑鎾绘偄閼姐倗顔庨梺鐐藉劜缁烩偓闁煎灚鍨块幆鍐礋椤斿墽顔庡┑?/ 閻熸粎澧楃敮鐔烘崲?/ 闂佽　鍋撻柣鎰靛墻閸庛儳绱掗锝嗩潡妞ゆ柨娲╅妵鎰板即濮樿京鐛ラ柣鐘叉搐濡宕洪崱妯尖枖?`REPAYMENT / TRANSFER`闂?
  - 濠电偞鍨甸悧鎰板垂閸屾稏浜滈梻鍫熺洴閹割剟鏌涘▎鎴濐暭婵℃儹鍛剨闁告洦鍟熸径鎰闁告侗浜栭崑鎾愁煥閸喐鍤傞柣鐐寸☉閼活垰鐣?/ 闂佺粯绮堥崡鎶藉闯妤ｅ啫鐏虫繝鍨尵缁€澶愭⒑椤掆偓閻忔繈宕㈤妶澶婄閻庯綆浜滆閻熸粎澧楀ú鏍矗閸℃稑瑙﹂幖娣灪閳绘梻绱掗埀顒佹姜閹峰瞼顦伴梺鐐藉劜缁矂宕ｉ悙顒傤浄闁哄秲鍊愰崑鎾斥攽閸曘劌浜?

## 2.3.14 - 2026-03-25

### Added

- **闂佽桨鑳舵晶妤€鐣垫担铏逛笉闁挎稑瀚崐鐐差渻閵堝懐浠涢柡灞斤攻閺呭爼鎮欓弶鎴澒闂佸憡鏌ｉ崝宥夊极瑜版帒绀傞柕澶堝壂婢跺簺浜归柡鍤舵壋鍋撻崘顔肩?*:
  - 闂佸搫鍊瑰姗€路閸愵喖鐏虫繝濠傜墛閹虫洟鎮跺☉妯垮鐎规洟浜跺銊ф崉閸濆嫬姹查梺鐐藉劜缁诲啯鏅跺鍫濈闁靛鍓径搴涗汗闁哄洨鍋涢梾姗€鏌ㄥ☉妯绘拱闁轰緡鍣ｉ獮鎰媴缁涘鏁归悷婊呭濞叉牗瀵奸幇顔藉皫闁告洍鏂侀崑鎾存媴閸撳弶顔嗛梻浣稿级閸垶鍩€椤戣法鍔嶅┑顔哄€濋弻銊╁焵椤掑倻椹冲璺侯儐閿熴儲绻涙径瀣；缂侇喚濞€閺屟囧箚闁附鏂€闂佸憡顦归妶鍜佹П闂佸憡顨嗗ú婵嬪吹濠婂牆绀夐柕濞垮労閸ゃ倝鏌涜箛瀣姢婵炲牊鍨垮銊ф崉閸濆嫬姹查梺?
  - 闂佽　鍋撴い鏍ㄧ☉閻︻喖鈹戞径妯轰簻闁哥喐鎹囬弻宀勫箣閿旂粯婢撻梺闈涙缁€渚€宕ｉ崱娆愬闁挎棁濮らˇ褔姊婚崒娑氭殬闁逞屽厸閻掞箓寮ぐ鎺戠闁靛鍎遍悗鑽ょ磼椤愶絿婀介柍褜鍏涚粈渚€宕ｉ崱娆愬闁挎洍鍋撻梺瑙ｆ櫊瀹曪綁鎳滈钘変壕濞达綀顫夐梽宥嗙節?/ 闂佸憡鐟﹂崹鍫曞棘娓氣偓瀵剟鎮烽悧鍫濐伅婵犮垼娉涘ú锕傚极閻愬搫违?
  - 婵烇絽娲︾换鍌炴偤閵娾晛瑙﹂幖瀛樼箘缁愭鏌ゆ總澶夌盎濠殿喒鏅犲畷姘舵煥鐎ｎ偆鍘愰梺杞拌兌婢ф鐣垫担铏逛笉闁挎稑瀚崐鐐烘煕閹烘搩娈欓柕鍡楀暣閺佸秶浠﹂懖鈹炬晙婵炲瓨绮屾鎼佸箵閳哄懏鐒婚柣鏂挎憸婢э繝鎮楁担鍐炬綈闁轰礁缍婂銊╊敍濮樿埖灏欓柣鐐存€犻幍鍐蹭壕?

### Modified

- **婵炲瓨鍤庨崐鏍ｅΔ鍛闁靛鍎辩紞鎾剁磽娴ｅ搫鏋嶇紒鏃€鎸冲畷姘跺炊閵娿儱绨ラ梺鍛婂笚濠㈡绱炵€ｎ喖绀堢€广儱鐗嗛ˇ鈺呮煙绾惧鑵圭紓宥嗘閹粙濡搁妷褍骞?*:
  - `GET /api/transactions`
  - `POST /api/transactions`
  - `PUT /api/transactions/:id`
  - `DELETE /api/transactions/:id`
  - `POST /api/transactions/batch`
  - 婵炴垶鎸搁敃銊╁醇椤忓牆绠抽柕澶堝劚缂嶆捇鏌￠埀顒勬焻濞戞粎顦扮紓鍌欒兌閸犲秶绮╃€涙ɑ濯撮悹鎭掑妽閺?`requireAccountId`闂佹寧绋戦惌鍌涘閳哄懎绀傜€广儱瀚崬澶愭煛閸曨剚灏伴柡鍡欏枛楠炴垿顢欓悡搴㈤敪闂佸湱顭堥ˇ閬嶅极閵堝绠ｅ瀣濡﹪骞栨潏鍓х暢妞ゆ洑鍗冲畷妯衡枎閹哄棗浜鹃悘鐐跺Г鐎氬綊鏌ｉ敐鍐ㄥ姎缂傚秴顑夊畷婊冾吋閸繍妲遍梺鐟扮摠閻忔岸鍩€?

## 2.3.13 - 2026-03-25

### Modified

- **缂備礁顦抽褎鎱ㄩ埡鍐崥妞ゆ牗鐟ラ惁婊兾涢悧鍩亜鐣烽柆宥嗗亱闁搞儮鏅滈崺娑氱磽娓氬洤骞栭柛锝堟閹?*:
  - 闂佺绻愯ぐ澶愭閳哄倻鈻斿┑鐘冲嚬閺嗩垰顭块悷鏉挎毐闁活亙鍗虫俊瀛樻媴閻熸壆鍊掔紓浣插亾闁诡厽宸婚崑鎾存媴婵劏鍋撻崘顔肩闁哄洨鍋涢梾姗€鏌曢崱鏇狀槮濞村吋鍔欏畷妤呮煥鐎ｎ剙鐒块梺闈╄礋閸斿簼绨洪梺鍛婃煟閸斿酣顢旈浣逛氦婵炴垶顨堥杈ㄦ叏濠靛嫬鍔氶柟顑惧劦瀹曠娀寮介鍌滃骄濠碘剝顨呭Λ妤呭箯娴煎瓨鈷撻柡澶嬪灥椤ㄦ盯鏌ㄥ☉妯垮闁革綀娅ｆ禍鎼佸箣閺傚搫浜炬繝濠傚濡层劑鎮橀悙鎻掆偓鍧楀礂濮椻偓楠炴捁绠涘杈╁骄闂佺偨鍎茬换鍕枔閹达附鍤婇柛鎰靛幖娴犻箖鏌熼幍顔兼瀭闁?
  - 闂佺琚崝蹇涘箹椤愶絻浜滈柛蹇撴憸閻熴垽鎮归幇鐗堟暠妞ゆ垶鐟﹂妵鍕偨閸偆鏆犳繛鎴炴尰閼圭偓鎱ㄩ悢鐓庣闁挎稑瀚。鑽ょ磽娴ｅ牆鎳愰弫楣冩煕濡警鍎忛梺瑙ｆ櫊瀹曟﹢宕ㄩ弶鎴濆Г缂傚倷鐒﹂幐濠氭倵椤栫偞鏅悘鐐舵濞呫倝鎮樿箛鏂跨仴缂佷礁鐏氱缓钘壩旀导鍏呯窔瀹曠螖娴ｈ顔嶉梻浣瑰絻妤犲繒妲愬┑瀣祦闁告挷鑳堕崺鐘测槈閹绢垰浜剧紓浣割槼椤曆勬叏閳哄啰鍗氭い鏍ㄦ皑閹界喖鏌涘▎蹇撴Щ闁活亝澹嗛惀顏囶槹闁?
  - 闁荤姵鍔欓弨閬嶎敄濞嗘劑浜滈柛蹇撴憸閻熴垽鏌涚仦璇插闁圭⒈鍋呴妵鍕濞戞瑨鍚紓浣割槼椤曆勬叏閳哄啰鍗氭い鏍ㄧ⊕閺嗩厼鈽夐幘骞库偓鈧柍褜鍓氱划宥夋偋鐎圭姷鐤€闁告劑鍔岄悘娆撴偠濞戞牕濡虹紒槌栧弮瀹曟宕煎☉鎺戜壕濞达絿顭堥悗濠氭煛鐎ｎ偄濮堥懚鈺呮煕瑜庨〃鍛村箖濡ゅ啰纾炬い鏂垮帨閸嬫挸鈹戦崼鐔烘殸闂傚倸鍟幊鎾活敋閻楀牄浜滈柛婵嗗绾板秹鏌ㄥ☉妯肩劯妞も晞宕垫禒锕佺疀閺冣偓缁绢垶鏌ゆ潏銊︾殤闁告柨绉规俊?
- **闁荤姵鍔欓弨閬嶎敄濞嗘劑浜滈梻鍫熺⊕缁傚牓鎮跺☉鏍у鐟滄媽灏欓幏鐘电磼濡嘲浜剧憸宀勫箞閵娿儺娼?*:
  - 闁诲繐绻愬Λ宀勫焵椤掍胶鐭庣紒缁樻礀閳诲酣骞戦幇顔绢啋闁硅壈鎻懙褰掑焵椤掍胶绠撴繛瀛橆焽閹即濡搁妷锔绢洯婵炴挻鑹鹃鍥︾昂闂佸憡鏌ｉ崝宀勫春鐏炰勘浜滈柛顐ｆ礀閸斻儵鏌?
  - 闂備焦褰冪粔鐢稿蓟婵犲嫭瀚柛鎰ㄦ櫆濞堝鏌涢妷锕€绀冮柕鍡楀暟缁辨棃骞嬮悙闈涱棔闂佷紮绲鹃悷褍鈻嶈閺佸秴鐣濋崟顏嗙礆闂佺绻愮粔鏉懨瑰Ο鑽ょ懝閻庯絺鏅濋悷?X 闁哄鍋炲娆撴煢閳哄懎鐭楅柡澶嬪閸婂磭绱掓径澶婂祮闁革絾鎮傚畷锝夋偐椤旂懓浜?

## 2.3.12 - 2026-03-24

### Added

- **闂佸搫鍊瑰姗€路閸愨晝鈻斿┑鐘冲嚬閺嗩垰螖閻樺弶婀伴柡浣哥秺瀵粙鏌ㄧ€ｎ偅瀚?* **`terracotta`**:
  - 闂?`web/src/themes/registry.ts` 闂佸搫鍊瑰姗€路閸愵亝灏庨柕鍫濐槹閻濆嘲鈽夐幘鎰佺吋妞わ絼绮欓弫宥呯暆閸忣垰顦伴‖鍥箛椤掑倹娈梺杞拌兌缁绘繄鈧潧鏈敍鎰熼崫鍕М闂備焦褰冪换鍫ュ焵?
  - 婵炴垶鎸搁…鐑姐€傞懞銉р枖妞ゆ挾鍋熸俊鍥煠婵傚绨诲┑顔规櫇娴狅箓寮撮悩顔荤驳闂佸搫鍊块。锔锯偓闈涙湰閿涙劕顫滈崼銏㈩槷闂佸搫鍟版繛鈧繛鎾瑰煐缁岄亶顢欓懞銉︽瘔婵炴垶鎸搁…鐑姐€傞懞銉ｄ簻闁汇垻纭堕崑鎾诲及韫囨洖绔奸梺鎸庣☉閼活垶鎮鹃鍕闁硅埇鍔夐崑鎾愁煥閸曨剛鍘愭繝鈷€鍛粧閻庨潧鏈敍鎰熺紒姗堥獜闂傚倸娲犻崑鎾绘⒑椤愶絽濮嶉柕鍡楊樀瀵劑鏌呭☉妯绘殨闂佹椿鍠曠拋鏌ュ焵椤掍胶绠樻繛鍫熷灦椤ㄣ儳浠﹂悙顒佹瘑闂?

### Modified

- **婵炴垶鎸搁…鐑姐€傞悾灞藉闁煎鍊楅崺鐘绘煛閳ь剛鎹勯搹鐟版殹濡ょ姷鍋涙晶搴ㄥ箣妞嬪海纾兼い鎾寸箘閻熸挻绻涚仦绛嬫Ц闁告瑢鍓濈粋?UI primitive**:
  - 闁?AI闂侀潧妫斿ù鍥╃矈椤愶絿顩茬憸瀣焵椤戣法绐旀い锝傛櫇缁顪冪亸鏍т壕濞达綀濮ゅ畵宥嗙箾閸℃洖瀚庨柍褜鍏涘ù鍥敊閺囩姷纾炬い鏃囥€€閸嬫挻鎷呴悜姗嗕划閻熸粎澧楀ú蹇涘焵椤戣法鍔嶉柡浣哄仱瀹曟浠﹂悜鈺佷壕濞达綀顫夊▓鍫曟煙鐠団€虫灓妞ゆ挻鎮傞幃鍫曞幢閹般劌浜惧ù锝囨櫕缁犻箖鏌熼幁鎺戝姢闁烩剝鍨堕妵鍕偨閸涘﹥銆冮梺姹囧妼鐎氼垶濡撮崘顔肩闁哄洦菤閸嬫挻鎷呴悷鎵€掔紓浣插亾閺夌偞澹嗛悷銏ゆ煙閸喚小缂傚秵妫冨畷鐘绘惞鐟欏嫬鐓曠紓鍌欑贰閸樹粙寮ぐ鎺戠煑闁挎繂鎳庨悡?shared primitive闂?
  - 闂?`web/src/components/shared/theme-primitives.tsx` 婵炴垶鎼╅崣鈧挊鐔兼煕韫囨挻鍤€缂侀鍙冨畷妤呭Ψ閿旂粯鏁遍梺闈涙濡炴帞绮崨鏉戠濠㈣泛鐗冮崑鎾存媴閸撳弶鈻奸柣鐐寸☉閻胶娆㈤銏犵闁靛绲洪崑鎾存媴閻戞﹩浠遍柟鐓庣摠濞叉鈧灚绮撻弻锕傤敊鐞涒€充壕濞达絽鎲＄粋鍫ユ煛瀹ュ懏澶勯悗鍨矒閺岋箓顢欑悰鈥充壕濞达絿顭堥悘娆撴偠濞戞牕濮傞柕鍡楃Ч瀹曨亜鐣濋埀顒佹叏閹间礁绠戝ù锝夋交缁憋箓鎮楀☉娆忓闁烩剝鍨垮畷妤呭矗濮椻偓閻撯晠鎮介娑欏€愰柛锝嗘そ婵?
  - 缂傚倷缍€閸涱垱鏆板┑鐐存尭閹虫劙骞冩繝鍐枖濠电姵鍑归弳顖滅磽娴ｇ顏ф繛鍡愬灪缁嬪顢橀悢鍛婄枃闂佽В鍋撻柣锝呮湰閻ｉ亶姊洪幓鎺斝㈡い锔界叀瀵棄鐣￠幍顔绢攨闂佹寧绋戞總鏃€绻涢崶鈺傚皫闁告洦浜悰鎾绘煏閸℃洜鍔嶇紒澶愵棑閹峰綊鐛惔鎾充壕濞达絿顭堟禍鍫曟煢閸愩劌顏ラ柍褜鍏涘ù鍥箲鐠鸿　鏋庨柛鎾楀懏鎯ｆ繛鎴炴尭椤兘銆傞懞銉ｄ簻闁汇垻鏁搁崺鐘测槈閹绢垰浜炬繛鎾寸缁诲棛绮嬮崱娑樼闁告瑦锕㈤悡鈺呮煛瀹ュ懎妲荤紒鎲嬬磿娴狅箓宕掑Ο宄颁壕?
- **闂佺绻堥崝鎴﹀闯濞差亜绀堢€广儱娴傛导鍌炴煛瀹ュ繒绡€闁绘稒鐟╅弻褔骞戦幇顔惧敶闂佽鍘归崹褰捤囬崣澶屸枖婵炲樊浜栭崑鎾愁潩瀹曞洨鐣洪梺缁橆焾閸╂牠鍩€?*:
  - 婵烇絽娴傞崰鏍?`ClientOnly`闂侀潧妫斿妗漸thGate`闂侀潧妫斿妗絢eletons`闂侀潧妫斿姊攁shboard/page.tsx`闂侀潧妫斿姊恠sets/page.tsx`闂侀潧妫斿姊vings/page.tsx`闂侀潧妫斿姊blic/sw.js` 缂備焦绋戦ˇ顖氼啅婵犳艾鐭?lint/typecheck 闂傚倸鍋嗛崳锝夈€傛禒瀣?
  - 闂佸搫鐗滈崜姘额敃婵傚憡濯伴柦妯侯槹閸曢箖鏌?`npm run lint`闂侀潧妫斿姊焢m run typecheck`闂侀潧妫斿姊焢m run build` 闂佺鍐╁枠闁逞屽墯娣囪櫣鎹㈤崘顔嘉?

## 2.3.11 - 2026-03-24

### Modified

- **闂佽鍓氬Σ鎺楋綖瀹ュ棎浜滃ù锝呭暟閵堫偊姊洪崣澶婄仯缂傚秴顑呰灋闁逞屽墴瀵劑鏌呭☉婊咁槹闂佸憡鑹鹃張顒勵敄濞嗘挸绠伴柛銉ｅ妿閸ㄥジ鏌涘璇插⒉闁绘宕?*:
  - 闂佸憡顭囩划顖滄暜閳ь剟鎮硅鐎氫即宕抽悙顒佸闁圭偓鎯屽楣冩煟閵娿儱顏╅柕鍥ф搐铻ｉ柍銉ㄦ珪閸嬨儵鎮楅崷顓熷殌婵炲懏甯℃俊瀛樻媴閸︻厼鐏辨俊顐ゅ閿氶悘蹇ｅ灦瀹曨亞浠﹂崜褏鐣抽梺鑹邦潐瑜板啴宕规惔锝勬勃闁稿本绋撴竟澶屸偓?
  - 闁诲繐绻愬Λ婊呯矆鐎ｎ喖纾归柛婵嗗缁愭鎱ㄩ敐鍡樼厽闁逞屽厸缁舵岸銆傞埡鍐笉婵°倕鎷嬮弳鏇㈡偣閳ь剟鏁傜悰鈥充壕濞达絿顭堟禍鍫曟煢閸愩劌顏╅柛锝忕到闇夊ù锝囶焾瀵娊鏌￠埀顒勬焻濞戞粎顦版繛鎴炴尭闁帮綁濡存繝鍥ㄧ劸闁靛鍊楅悷蹇曗偓娈垮枤婵敻鎮х€圭姷鐤€闁告劑鍔岄獮銏ゆ煟濡も偓濞诧絿绮╅幘顔藉殜閻庨潧鎲￠悾閬嶆煙缁嬫寧澶勯柣鏍电秮瀹曪繝鍩勯崘顏勵棊閻?
  - 婵烇絽娲︾换鍐偓鍨⒒閹风娀濡疯閻鏌涘Δ瀣？濠⒀勭墱缁辨帟顦撮柣銏㈢帛閹峰懎顓奸崟顓″闂佺偨鍎茬划宥夊焵椤掍焦顫楃紒渚囧亝缁?/ 闂佽鍓氬Σ鎺旂矆鐎ｎ喖纾?/ 闂佺琚崝蹇涘箹椤愶箑绀勯柍褜鍓欓湁濞达絿顭堝鎶芥煃閵夛妇绠戠紒妤€鎳樺顒勬儌閸濄儳顦梺杞拌兌缁绘繄绱炵€ｎ喖缁╅悷娆忓閻忓洭鎮峰▎蹇擃仾闁哄棴缍侀幆鍐礋椤戠儐鍙冨畷銉╁箣濠靛棗鑰块梺缁橆殔濞诧妇鏁幘鑸垫殰?

## 2.3.10 - 2026-03-24

### Modified

- **闂佽鍓氬Σ鎺楋綖瀹ュ棎浜滃ù锝呭暟閵堫偊姊洪崣澶婄仯缂傚秴顑呰灋闁逞屽墮铻ｉ柍銉ㄦ珪閸嬨儵鎮圭€ｎ亜鏆為柡鍡稻閹峰懎顓奸崶鈺傜€繛鎴炴尭妤犲摜绮╂搴濇勃闁?*:
  - 闁诲繐绻愬Λ娆撳焵椤掍焦顫楁い顐㈢У閵囧嫮鍠婂Ο宄颁壕婵犲﹤妫涢妶顐︽⒑閸欏鐏ｇ紓宥咁儏铻為柍褜鍓熼崹鎯р攽閸ら€涚窔瀹曠螖閸愬啠鏅犲畷婵嬪Ω閵夈儳鍘掓俊鐐€曢悥濂稿磿鐎涙鈻斿璺猴功閻愬﹪鏌″鍥剁劸缂佹椽绠栭獮鎰板炊閵娧冪伇闂佸憡顨愮槐鏇熸櫠閺嶃劎鈻旈悗锝庡亝閻?
  - 闁荤姍鍐伃闁革絿鍋撻幏鍛村箻閹碱厽鈷曢梺姹囧妼鐎氼亞绮担鍓插殨闁绘ê纾ˇ顖炴倵閻㈤潧鏋庣€规洟浜跺畷鐑藉Ω閵堝牆骞€缂備焦绋戦ˇ顖氼嚕闁垮顩烽柕澶堝€楅悷鎰版倶閻愯尙绠扮紒鐘靛厴瀵劑鏌呭☉婊咁槹婵炴垶鎸撮崑鎾绘偠濞戞ê顨欑紒妞剧窔瀹曟艾螖閳ь剟鎯堝鍥╃焼?
  - 婵烇絽娲︾换鍐偓鍨瀹曘垽鎮㈤崨濠勭暢闂佽桨鑳舵晶妤€鐣垫担鐑樺闁挎稑瀚弳顒€鈽夐幘铏崳濠殿喗鎮傞獮鈧ù锝囨嚀缁插湱绱掗埀顒€煤椤忎礁浜鹃柡鍕箳鐢棗鈽夐幘宕囆㈢憸鏉款樀閺佸秶浠﹂懖鈺冪厒闁荤姴顑呴崯顖炲汲閿濆洣娌柡鍥╁О娴犳盯鎮橀悙鎻掆偓缁橆殽閸ャ劎鈻旈幖娣灩缁楁捇鏌ｅΔ鈧悧鎰繆椤撶喓闄?

## 2.3.9 - 2026-03-24

### Modified

- **闁圭厧鐡ㄥú鐔煎磿閺夋埈鍤曢柣鐔稿濠€鎾偠濞戞牕濡肩€规洜鍠栧钘夌暋閹殿喚顢呯紓鍌欑秬閸涱垱鏆扮紓鍌欒兌閸犲秶绮?*:
  - 闁荤姵鍔欓弨閬嶎敄濞嗘劑浜滈柣銏犳啞濡椼劑鏌ｉ妸銉ヮ仾闁哄苯锕ラ弲鍫曟倷閼搁潧绁跺┑鐐叉閸庢娊骞忔导瀛樺剬闁哄嫬娴氶崬鍫曞级閳哄伒鎴︻敄濞嗘劖鍎熼柡鍥ュ灩閸斻儳鈧鍠氶幊鎾绘儑閹殿喚纾奸柣鏂垮椤忓崬霉閿濆牊纭堕柡浣靛€栫粙澶嬬節濮樺吋姣岄梺鐟扮仢缁夊磭绱為弮鍫濆唨?
  - 闂佺琚崝蹇涘箹椤愶附鍎庢い鏃傛櫕閸ㄥジ鏌涢幒鎾垛槈缂傚倹鎸搁湁濞达綀銆€閺屻倝鏌ｉ妸銉ヮ仼缂併劍濞婇弻鍫ュΩ閵夈儛妤€霉閿濆棛鐭婇悘蹇ｅ灣缁辨帡鎮㈤崜渚囦紘闂佽浜介崕閬嶅矗閸℃鈻斿┑鐘冲嚬閺嗩垶鏌熼崹顔拘＄紓宥嗘瀵?
  - 闂佺琚崝蹇涘箹椤愶箑鐭楅柡宥庣厛閸庛儳鈧鍠氶幊鎾绘儑娴煎瓨鍎嶉柛鏇ㄥ墮缁插湱绱掗埀顒勫传閸曨偊娈梺闈涙濞村洭濡撮崘顔肩闁哄洨鍋涢梾姗€鏌涘鍐╂拱闁瑰ジ鏀遍幏鍛煥閸愩劑娈紓鍌欒兌閸犲秶绮╅幘顔肩闁靛鍎卞鍐测槈閹炬剚鐓兼い锝勭矙瀵棄鐣￠幍顔绢攨
  - 缂備礁顦抽褎鎱ㄩ埡鍐崥妞ゆ牗绺块埀顒€鍟村畷锟犲即閻愭畫妤€霉閿濆棛鐭婇悘蹇ｅ灣閹叉挳宕卞鍏肩秿婵炴垶鎸告鍝ョ礊鐎ｎ喖绀堢€广儱瀚惁婊兾涢悧鍫€挎い銉︽崌瀵粙姊荤€靛摜顔旈梺褰掓櫜濡炴帞绮╅幘顔藉殜?

## 2.3.8 - 2026-03-24

### Added

- **闂佺绻愰崢鏍姳椤掍降浜滈柣銏犳啞濡椼劑鏌￠崒娑欑凡妞ゃ倕鍟扮槐鎺楁偄閸撲緡浼囬梺鍝勬搐閻°劑寮绘繝鍐枖妞ゆ挾鍋熸俊?*:
  - 闂佸搫鍊瑰姗€路閸愵喖鍗抽悗娑櫳戦悡鈧┑鈽嗗亐閸嬫捇鏌＄仦璇插姕閻㈩垱鎸冲畷锝夋晲閸曨厾鎲挎繛鎴炴尭椤戝牆霉閸ャ劎顩烽柨婵嗘处閸婄偤鏌熼幁鎺戝姎鐟?
  - 闂佸搫鍊瑰姗€路閸愵亞纾鹃柟瀵稿Х瑜版煡鏌￠崼顐㈠婵犫偓閹绢喖鍗抽悗娑櫳戦悡鈧┑鐐存尭閹冲骸鐣?`web/public/updates/latest.json`
  - 闂佸搫鍊瑰姗€路?`docs/闂佸搫娲ら悺銊╁蓟婵犲洤鐭楅柟瀛樼箘椤忔潙鈽夐幘鎶藉弰闁哄棗鎳樺畷鎾圭疀濮樼厧娈梺?md`
  - 闂佸搫鍊瑰姗€路?`docs/APP缂備焦妫忛崹鍗灻洪崸妤€妫橀柡澶婄仢缁叉椽鎮介姘殭闁革綆鍨卞鍕炊閵娧屼紩闂?md`

### Modified

- **闂佺绻愰崢鏍姳椤掍降浜滈柣銏犳啞濡椼劑鏌涘Δ鈧ú銊︻殽閸ャ劎鈻旈柧蹇撴贡閸╃姴鈽夐幘顖氫壕闂佸搫娲ら悺銊╁蓟婵犲洤绀傞柕澶堝劚缂?*:
  - 缂傚倸鍟崹鍧楀Υ婢跺瞼鍗氭い鏍ㄧ⊕閺嗘粓鏌熼梹鎰唹闁逞屽墯缁矂宕哄☉銏犳闁哄鍎荤€氭瑩鏌￠崶褏鎽犻柡灞斤躬閸?
  - App 缂備焦妫忛崹閬嶅极椤曗偓楠炴劖绗熼埀顒勫焵椤掍椒浜㈢紒璇插暣瀹曘儲鎯旈敐搴濈磽婵炲濯寸徊鍧楀箖婵犲啰鈻旈悗锝庡幗缁佷即鎮楅悷閭︽Ъ妞ゃ儱锕畷?
  - 闂佸憡鎸哥粔鍫曨敂椤掍胶鈻旂€广儱鎳庨弲娆撴煟閳轰胶鎽犻悽顖氱摠缁楃喎鈹戞繝鍕垫船 GitHub闂佹寧绋戦張顒勫极閸忚偐鈻旈柧蹇撴贡缁夊湱绱掗弮鈧悷鈺呭汲閸涙潙纾介煫鍥ф捣閸犳﹢鏌涜箛鎾跺闁逞屽厸缁楋箠tHub 婵犮垼娉涘ú銊╁极?
- **缂備礁顦抽褎鎱ㄩ埡鍐崥妞ゆ牗鍑归崵銈夋煠閸撹弓绨风紒妤€鏈鍕箻椤旂厧濮ゆ繛瀛樺殠閸婃挾鑺遍幍顔剧＜鐟滃繘鎮界紒妯侯嚤婵☆垰鎼?*:
  - 闁圭厧鐡ㄥú鐔煎磿閺夋埈鐓ラ柟瀛樼箓琚熼柣搴濈祷婢瑰牓宕洪崨顔戒氦婵炴垶顨堥杈ㄦ叏濠靛嫬鍔ょ紓鍌氼槺娴滄瓕绠涢幘瀛橆潊闁?
  - 婵＄偑鍊曢悥濂稿磿鐎电硶鍋撴担鍐棈闁糕晛鎳樺銊╊敍濞戞妲锋繛鎴炴尭椤戝棛鍒掗敃鍌涒挄闁归偊鍨遍ˉ鎴︽煏閸℃洘顦风紒妤€鍊搁…銊╁箣閻愮补鏋栫紓浣插亾?
  - 缂傚倷缍€閸涱垱鏆伴梺鍛娒鍥╃磽婢跺瞼鐭撻悹鍥ㄥ絻琚熺紓浣规閸ㄥ爼濡存繝鍥ㄧ劸闁靛鍎洪崵銈夋煠閸撹弓绨奸柣鏍村枟椤ㄥ洤螣閸濆嫷鍞烘繛鎴炴尭鐎涒晝鏁懜鐢殿浄閻犺櫣鍎ゅΣ鈧柣?

## 2.3.7 - 2026-03-23

### Added

- **闂佸搫鍊瑰姗€路閸愵喖绀傞柕濞垮劤濠€鏉库槈閹炬剚鐓兼い锝囨櫕閸栨牠鎳￠妶鍥х厷婵炴垶鎸哥花鑲┾偓闈涙湰閿涙劕螣缂佹ɑ娈橀梺鍛婂姇婵傛棃鎳欓幋锝囩杸?*:
  - 闂佸搫鍊瑰姗€路?`web/src/themes/registry.ts`闂佹寧绋戦惌鍌氣枖閿旂晫鈻旀い鎾跺仧閺嗘澘鈽夐弬娆炬Х閻庨潧鏈敍鎰熼崫鍕瑲婵烇絽娲犻崜婵囧閸涙潙违濞达絽鍢查惁婊兾涢悧鍫€挎い锝傛櫇閹叉挳宕煎鈧花浼存煕濞嗗骏宸ラ柛娆忕箳娴狅箓鍩€?CSS 闂佸憡鐟﹂敃銏ゅ闯濞差亜鍙婇柣妯垮皺濞堟悂鏌?
  - 闂佸搫鍊瑰姗€路?`web/src/components/shared/theme-provider.tsx`闂佹寧绋戦張顒勫极椤曗偓楠炴劖鎷呭畡鎵В婵☆偆澧楅…鍥ㄦ叏閹间礁绠戝ù锝勮閸氣偓闂佽崵鍋涘Λ搴ㄥ焵椤戣法鍔嶆繝鈧导鏉戞嵍闁绘鐗嗛惁顔尖槈閺傛寧鍣归悗闈涘级缁嬪鎯旈垾鍐蹭紟闁诲繒鍋愰崑鎾绘煕濞嗘劧鑰块柛锝呮惈閳绘棃濡搁妷銉ユ辈闂?
  - 闂佸搫鍊瑰姗€路?`web/src/components/shared/theme-primitives.tsx`闂佹寧绋戦張顒佺箾婵犲嫭瀵?`ThemeHero`闂侀潧妫斿妗緃emeSurface`闂侀潧妫斿妗緃emeDarkPanel`闂侀潧妫斿妗緃emeSectionHeader`闂侀潧妫斿妗緃emeMetricCard` 缂備焦绋戦ˇ顖炲矗閳╁啰顩叉い鎰ㄢ偓宕囨В婵☆偆澧楅…鍥╁垝瀹ュ棛顩烽棅顒佺ゴ閸?
  - 婵炴垶鎸搁…鐑姐€傞懞銉р枖妞ゆ挾鍋熸俊鍥ь渻?`web/src/app/(dashboard)/themes/page.tsx` 闂佸憡顨呭ú銊︻殽閸ャ劎鈻旈柧蹇氼潐閸╁倹鎱ㄥ┑鎾舵偧婵炲牊鍨垮畷妤呭Ω閵壯勬嫳婵炴垶鎸搁…鐑姐€傛禒瀣闁搞儯鍔屾惔濠囨煕韫囧鍔氱憸鐗堢洴閺佸秶浠﹂悙顒佹闂佸綊鏅茬粈渚€宕硅箛娑樼闁靛繒濮甸崐鐢告煕濡ゅ嫭鐝俊鐐插€归幏鍛煥閸涱喗娈㈡繛瀛樼矊鐎涒晠寮抽敐鍡欓檮?dashboard UI闂?

### Modified

- **Dashboard 闂佸憡鐗曢幖顐︽偂濞嗘劑浜滈柣銏犳啞濡椼劌鈽夐幘鎰佺吋妞わ絿鏅槐鎺楁偄閸撲緡浼囬梺瑙勪航閸庨亶宕ｉ崱娑樼闁告瑦锕㈤悡鈺備繆濡も偓濡瑩鎮?*:
  - 闁诲繐绻愬Λ娆撳焵椤掍焦顫楁い顐㈢Ч婵″瓨鎷呴悾灞诲亽婵炲瓨绫傛担鎻掍壕濞达絽婀卞暩闁荤姵鍔曠粻宥夊焵椤戣法顦﹂柛瀣Ч閹锋垿宕熼埞鎯т壕濞达綀濮ゅ畵宥嗙箾閸℃洖瀚庨柍褜鍏涘ù鍥敊閺囩姷纾炬い鏃囥€€閸嬫挻鎷呴悾宀€顔曢梺瑙勪航閸庮垶鍩€椤戣法鍔嶉柡鍡欏枛楠炴垿顢欑紒銏犳倎闂佽崵鍋涘Λ搴ㄥ焵椤戣法顦﹂柟顔筋殜瀹曪綁骞嶉鍛倎闂佽崵鍋涘Λ搴ㄥ焵椤戣法顦﹂柛娅诲嫮顩查幖瀛樼▓閸嬫挻绋夐崙?闂備焦婢樼粔鍫曟偪閸℃ǜ浜滈柣銏犳啞濡椼劑鏌熼幁鎺戝姎闁告瑥妫濆畷妤呭矗濮椻偓閻撯晛鈽夐幘鎰佺吋妞?primitive闂佹寧绋戦懟顖炲闯閾忛€涚剨闁硅揪鑵归崑鎾诲箛閼割兘鍋撴径灞惧厹妞ゆ帒鍊诲浠嬫煟椤旇崵鍔嶉柣妤€宕锝堢疀鐎Ｑ冧壕?
  - 闁?`Header`闂侀潧妫斿妗絠debar`闂侀潧妫斿妗猘shboard Layout` 缂傚倷鑳堕崰宥囩博閹绢喖缁╅梺顐ｇ缁€瀣偣閸ヮ亶鍤欑憸鏉挎处缁嬪绻濆鍏兼瘜闂佸憡鐟﹂敃銏ゅ闯濞差亝鏅€光偓閳ь剟鍨惧Ο鑽も攳婵犻潧妫崵銈夋煠閸撹弓绨甸柍褜鍏涚粈渚€宕€电硶鍋撻崷顓熷殌闁挎稒鎸炬禒锕傚磼濞嗘垹鎲挎俊鐐€楅弫璇差焽娴兼潙纭€闁挎稑瀚。濠氭煕濮橆剚婀版い鎺斿仱瀹曟岸宕堕妸銉ョ哎闂?
  - 闁荤姳璁查弲婊堝蓟婵犲啯娅犻柣鎰緲閻︽粌螞閻楀煶鎴濐渻閸屾稓鈻旂€广儱鎳庨弲娆撴⒒閸ワ絽浜鹃柣鐔告磻缁舵岸鍩€椤掍礁濮嶉柕鍡楊樀閺屽苯顓奸崨顓熸 UI闂佹寧绋戦懟顖濄亹瑜斿Λ渚€鍩€椤掑倹鍋橀柕澶堝劚鐢姴鈽夐幘鎰佺吋妞わ絼绮欓弻濠傤吋閸モ晜鐎梺鍛婎殔閸熻儻銇愰懠顑藉亾閻熺増婀伴柛銊﹀哺瀹曟濡搁妷褎鎷遍梺鍛婂笒濞诧箑鐣烽弻銉ノ?
- **婵炴垶鎸搁…鐑姐€傞悾灞藉闁煎鍊楅崺鐘绘煕閳哄嫭顏犳い銏犳嚇瀹曪絽顫滈埀顒勫闯濞差亜绠抽柕澶堝劚瀵娊鏌涜箛瀣闁活亶鍓熷钘夌暋閹殿喚顢呴柣?*:
  - 闂?`web/src/app/globals.css` 婵炴垶鎼╅崢浠嬪蓟婵犲啯娅?`theme-*` 缂備緡鍨甸褔宕?CSS 闂佸憡鐟﹂敃銏ゅ闯閻戞﹩娓舵俊顖涱儥閸氬洭鏌涙繝鍕靛劆闁?
  - `Providers` 闂佽浜介崕閬嶅矗?`ThemeProvider`闂佹寧绋戦張顒勫汲閿濆棛鈻旀い蹇撳鐎瑰鏌ｉ～顒€濡兼繝鈧鍫濆唨闁革富鍙冮悰鎾绘煕閹烘繂浜濋悗鍨礃濞碱亪骞嬮幒鎴犳В婵☆偆澧楃湁缂佹鍊圭粙澶屸偓锝庡亝閻庮噣鏌?

### Modified Files

1. `web/src/themes/registry.ts` - 婵炴垶鎸搁…鐑姐€傞挊澶嗘灃闁靛鍎遍弬鈧繛鎴炴惄閸樿偐缂撻悙顒傗枖閹煎瓨绻傞惁婊兾涢悧鍫€挎い锝傛櫇閹?
2. `web/src/components/shared/theme-provider.tsx` - 婵炴垶鎸搁…鐑姐€?Provider 婵炴垶鎸告鎼佸垂韫囨稑绠查柕蹇嬪€愰崑鎾诲及韫囨洖绔?
3. `web/src/components/shared/theme-primitives.tsx` - 闂佺绻愯ぐ澶愭閳哄倻鈻斿┑鐘冲嚬閺嗩垶鏌涢埡鍕仩妞ゃ垹鎳愮槐鎺楀礋椤忓拋鍋?
4. `web/src/app/providers.tsx` - 闂佽浜介崕閬嶅矗閸℃稑绀傞柕濞垮劤濠€鏉库槈閹炬剚鐓兼い锝堝Г缁嬪绻濇担铏规啴闂?
5. `web/src/app/globals.css` - 婵犫拃鍛粶濠殿喚鍋ゅ畷妤呭Ω閵壯勬嫳婵炴垶鎸搁…鐑姐€?CSS 闂佸憡鐟﹂敃銏ゅ闯?
6. `web/src/app/(dashboard)/themes/page.tsx` - 婵炴垶鎸搁…鐑姐€傞懞銉р枖妞ゆ挾鍋熸俊鍥ь渻閵堝懐浠涢柡浣稿悑缁嬪宕崟顐紟闁诲繒鍋愰崑鎾绘煕閹烘垶澶勭€规洘鐓″畷妤呭Ψ閵夈儳绋?
7. `web/src/components/shared/Header.tsx` - 婵＄偑鍊曢悥濂稿磿鐎电硶鍋撴担鍐棈闁糕晛鎳橀獮鎺楀Ψ閵夈儱姹叉繛鎴炴尭椤兘銆傛禒瀣煑婵せ鍋撻柛?
8. `web/src/components/shared/Sidebar.tsx` - 婵炴挻鐨滈崱娆戝骄闁诲簼绲绘竟鍫ュ春閸涙潙绠抽柕澶堝劚瀵啿鈽夐幘鎰佺吋妞わ絼绮欏畷锝咁潨閳ь剟宕?
9. `web/src/app/(dashboard)/layout.tsx` - Dashboard 婵犮垼鍩栭悧鏇㈡晬閹捐绠抽柕澶堝劚瀵啿鈽夐幘鎰佺吋妞わ絼绮欏畷锝咁潨閳ь剟宕?
10. `web/src/features/dashboard/components/themes/DefaultDashboard.tsx` - 闂佽鍓氬Σ鎺楋綖瀹ュ棎浜滈柛顭戝亜婢跺秹鏌涜箛瀣姎闁告瑢鍓濈粋宥夘敃閳ュ磭妲ｆ俊顐ゅ椤洨鍒掑鍡欘浄?
11. `web/src/features/assets/components/themes/DefaultAssets.tsx` - 闁荤姍鍐仹濡ょ姴娲﹂妵鍕垂椤愩垹顦查梺绋跨箞閸庨亶宕ｉ埄鍐洸妞ゆ劏鈧磭妲ｆ俊顐ゅ椤洨鍒掑鍡欘浄?
12. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` - 濠电偞鍨甸悧鎰板垂閸屾稏浜滈柛顭戝亜婢跺秹鏌涜箛瀣姎闁告瑢鍓濈粋宥夘敃閳ュ磭妲ｆ俊顐ゅ椤洨鍒掑鍡欘浄?
13. `web/src/features/savings/components/themes/DefaultSavings.tsx` - 闂佺琚崝蹇涘箹椤愶絻浜滈柛顭戝亜婢跺秹鏌涜箛瀣姎闁告瑢鍓濈粋宥夘敃閳ュ磭妲ｆ俊顐ゅ椤洨鍒掑鍡欘浄?
14. `web/src/features/loans/components/themes/DefaultLoans.tsx` - 闁荤姵鍔欓弨閬嶎敄濞嗘劑浜滈柛顭戝亜婢跺秹鏌涜箛瀣姎闁告瑢鍓濈粋宥夘敃閳ュ磭妲ｆ俊顐ゅ椤洨鍒掑鍡欘浄?
15. `web/src/app/(dashboard)/settings/page.tsx` - 闁荤姳绀佹晶浠嬫偪閸℃ǜ浜滈柛蹇曨焾閻︽粌螞閻楀牜鐒界紒顔惧劋缁嬪鍩€?
16. `web/src/app/(dashboard)/data/page.tsx` - 闂佽桨鑳舵晶妤€鐣垫担铏逛笉闁挎稑瀚崐鐐差渻閵堝懎鎮侀悗闈涙湰閿涙劕螣閼测晛鐓氭繛鎴炴尨閸?
17. `web/src/app/(dashboard)/admin/page.tsx` - 闂佸憡鑹炬姝屻亹鐎靛摜涓嶉柨娑樺閸婄偛顪冮妶鍛倎閻庨潧鏈敍鎰熼懖鈺佺厷婵炴垶鎸撮崑?
18. `web/src/app/(dashboard)/about/page.tsx` - 闂佺绻愰崢鏍姳椤掍降浜滈柛蹇曨焾閻︽粌螞閻楀牜鐒界紒顔惧劋缁嬪鍩€椤掍胶鈻旈幖绮光偓铏殽闁诲海鎳撶紞濠囧闯閹间礁鍑?
19. `web/src/app/(dashboard)/ai/page.tsx` - AI 濠碘槅鍨埀顒€纾埀顒傚厴閺屽﹤顓奸崶鈺傜€俊鐐€曢崥鈧悗闈涙湰閿涙劕螣閼测晛鐓氭繛鎴炴尨閸?
20. `web/src/app/(dashboard)/connections/page.tsx` - 闁哄鏅濋崑鐐垫暜鐎涙ǜ浜滈柛顭戝亰閸庢挳鏌ｉ～顒€濡奸柛娆屽墲缁傚秹顢曢垾宕囨В婵☆偆澧楃湁缂傚秴顑囬崠?

## 2.3.6 - 2026-03-23

### Added

- **闂佸搫鍊瑰姗€路?APP 婵炲瓨鍤庨崐鏍ｅΔ鍛Е閻忕偟铏庨崝鍕煙閹帒鍔氱憸鐗堢⊕缁嬪鎯旈敍鍕紱闂佸憡鐟﹂崹鍫曞几閸愵煈娴?*:
  - 闂佸搫鍊瑰姗€路?`GET /api/sync/transactions/pull`闂佹寧绋戦張顒勫极椤曗偓楠?App 闂佸湱顭堥ˇ浼存偉閸洖鍐€闁搞儜灞炬緮闂備焦褰冪换鎴炲垔濞差亜鐭楅柡宥忛檮閸炲鏌?
  - 闂佸搫鍊瑰姗€路?`POST /api/sync/transactions/push`闂佹寧绋戦張顒勫极椤曗偓楠?App 闂佸綊娼х紞濠囧闯閻戞鈻斿┑鐘叉媼閺€钘壝瑰┃鍨偓鏍ｅΔ鍛祦闁兼悂娼ч惁?`orderId` 闂佺顑嗗銊╊敄閸ャ劎鈻旈柍褜鍓熼幃褔宕煎┑鍫㈡殼缂?
  - 闂佸搫鍊瑰姗€路?`docs/APP婵炲瓨鍤庨崐鏍ｅΔ鍛Е閻忕偟铏庨崝鍕煙閹帒鍔氱憸鐗堢☉椤曪綁鍩€椤掑嫬鐭楅柟瀵稿仦閻庮喗淇?md`闂佹寧绋戦張顒勫汲閿濆鍋犻柛鈩冾殕閸婅鲸鎱ㄥ┑鍕姤妞ゆ洦鍓欐晥闁稿本菤閸嬫挻鎷呴崨濠冨劌闁圭厧鐡ㄩ弻锝夊焵椤戣法绐旀俊鐐そ瀹曟岸寮甸悽鐢垫喛闂佸憡鑹惧ù鐑芥偨婵犳艾绠ラ柍杞拌兌濞兼棃鏌￠崒婊勫殌闁?
- **闂佸搫鍊瑰姗€路閸愵喖鏋侀柣妤€鐗嗙粊锕傚箹鐎涙ɑ灏电紒顔哄姂瀵悂宕熼鍌氼棎闁诲簼绲婚～澶嬫叏閵堝宸?*:
  - 闂佸搫鍊瑰姗€路?`docs/闂佽桨鑳舵晶妤€鐣垫担瑙勫劅闁规儳澧庡▔銏ゆ煛鐎ｎ亜顏柣妤€纾埀顑跨祷椤鎱ㄩ妶澶婂窛?md`
  - 闁荤姳鐒﹀妯肩礊瀹ュ牄浜归柟鎯у暱椤ゅ懘鎮楅崷顓炰槐婵＄虎鍨跺顐︽偋閸繄銈﹂柟鐓庣摠閹搁绮?Prisma 濠碘槅鍨埀顒€纾埀顒傚厴閹啴宕熼鍌氼棎闁诲酣娼у﹢杈╁垝閵娾晛鍑犳繝濠冨姉缁€澶岀棯椤撗冩灕妞ゆ挸顭烽幃铏鐎涙ǚ鏋嗗┑鐐茬墕閸氣偓缂佹顦辩槐鎾淬偊鐟併倐鍋撻崘顔嘉ュù锝夘棑閻熸繄绱撻崒姘儓闁烩姍鍐ｆ灁闁绘劕鍘滈崑鎾存媴妞嬪海鎲圭紓鍌氬€搁幖顐λ囨繝姘叆?

### Modified

- **闁哄鏅濋崑鐐垫暜鐎涙﹩娈界€光偓閸愵亝顫嶉梺娲诲枙閻掞箓寮崗鑲┾枖闁告繂瀚幆鎰版偨椤栨艾顨欑紒缁樻皑閳?*:
  - `appconnection.otpCode` 婵炴垶鎸哥粔鎾疮閳ь剙菐閸ャ劎绠撻柣掳鍔戝鐗堟償閵忥紕鈧喖螖閻樿尙鐒烽柣锕€顦甸幆宥嗙瑹婵犲嫮顦梺琛″亾闂侇偅绋栫粈瀣庨崶銊х畵闁宦板妿閺侇噣鏁冮埀顒勬儊閹达附鐓㈤柕澹嫮鏆?SHA-256 闂佸憡绻傞悧鍡欑箔閸ヮ剙纾?
  - Web 缂備焦妫忛崹鎶藉极閹捐绠ｉ柟閭﹀灣缁犻箖鏌熼幁鎺戝姢闁绘牗绮撳顔炬崉閸濆嫭閿梺鍛婄閸ㄥ灚鏅堕悩鐢靛崥妞ゆ牗绻勭粻鏌ユ煕閵壯冧粧缂佹梹娼欓埢搴ㄥ焺閸愨晩娼犻梺?OTP闂佹寧绋戦張顒勫汲閻旂厧绠叉い鏃囧亹濮樸劑鏌涢幇顒佸櫢缂佹顦靛畷妯侯吋閸喎鍔欓梺鍝勫鐎涒晠寮?
  - App 闂佸湱绮崝鎺戭潩閿旂瓔娈界€光偓閸愵亝顫嶉梺娲诲枙閻掞箑顪冮崒鐐存櫖閻忕偟鍋撶粻娑㈡煕閺冩挾纾挎い蹇ｅ墰閳ь剛鏁搁、濠勬椤撱垹绀傞柕澶堝劗閸嬫捇鎮℃惔婵堥┏闂佸憡鑹鹃張顒勬偋闁秴浼犻柛顐ｇ箘閻熸牠鏌涘顒勵€楅柛鐔插亾闂佸搫绋勭换婵嬫偘濞嗘挻鏅悘鐐村劤缁插綊鏌涘Δ鈧ú鈺冩崲濞戙垹绠抽柕澹懏瀚ч柣搴ゎ潐閼归箖鎮鹃妸鈺佺闁靛鑵归崑?
  - 婵°倗濮撮惌渚€鎯佹径鎰劵闁哄嫬绻掔敮鍡涙煕韫囨洖甯舵い鏃€鍔欏顔款槾婵炲牊鍨垮鐗堟償閵忥紕鈧?OTP 闁荤姳鐒﹀妯肩礊瀹ュ鏅€光偓閸曨亞绱氶梺绋跨箰缁夋潙鐣峰畝鈧惀顏囶槻闁诡喗顨呴蹇涘矗婢跺鐣抽梺鍝勭墱娴滐絿鎹㈤崘顔煎珘闁绘棁鍋愬畷锝夋偣閸ワ箒鍏岄柣鏍ㄧ矒閹嫮鈧稒锚婢跺秴顭块幆浼村摵闁?

### Modified Files

1. `src/server/src/main.ts` - 婵炲瓨鍤庨崐鏍ｅΔ鍛Е閻忕偟铏庨崝鍕煙閹帒鍔氱憸鐗堢⊕缁嬪鎯旈妶鍥╊啎闂佽浜介崕鐢告偘濞嗘垶瀚氬ù锝堟閸ㄦ娊鏌涘┑鍡欏缂佹娲︾粚鍗炩攽閸℃瑦鎲?
2. `docs/APP闁哄鏅濋崑鐐垫暜閹绢喖绀夐柣鏃囶嚙閸樺鈧鍠掗崑鎾绘煕濞嗘劕鐏﹂柡瀣暙椤?md` - 闂佸搫娲ら悺銊╁蓟?OTP 闁诲孩绋掗敋闁稿绉电粙澶嬫償閵忋垹鈪版俊銈囧Т閻線顢氶埡鍛強?
3. `docs/APP婵炲瓨鍤庨崐鏍ｅΔ鍛Е閻忕偟铏庨崝鍕煙閹帒鍔氱憸鐗堢☉椤曪綁鍩€椤掑嫬鐭楅柟瀵稿仦閻庮喗淇?md` - APP 闂佸憡鑹鹃張顒勵敆閻愬搫绠抽柕澶堝劚缂嶆捇鎮归崶褏鎽犳俊?
4. `docs/闂佽桨鑳舵晶妤€鐣垫担瑙勫劅闁规儳澧庡▔銏ゆ煛鐎ｎ亜顏柣妤€纾埀顑跨祷椤鎱ㄩ妶澶婂窛?md` - 闂佽桨鑳舵晶妤€鐣垫担瑙勫劅闁规儳澧庡▔銏ゆ煛鐎ｎ亜顏柣妤€纾埀顒勬涧濠€杈╁垝閵娧勫?

## 2.3.5 - 2026-03-23

### Added

- **闂佸搫鍊瑰姗€路?APP 闁哄鏅濋崑鐐垫暜閹绢喖绀夐柣鏃囶嚙閸樺鈧鍠掗崑鎾绘煕濞嗘劕鐏﹂柡瀣暙椤?*:
  - 闂佸搫鍊瑰姗€路?`docs/APP闁哄鏅濋崑鐐垫暜閹绢喖绀夐柣鏃囶嚙閸樺鈧鍠掗崑鎾绘煕濞嗘劕鐏﹂柡瀣暙椤?md`
  - 濠殿喖锕ょ壕顓㈠箖?Web 缂備焦妫忛崹鎶藉极閹捐绠ｉ柟閭﹀灣缁犻箖鏌熼幁鎺戝姢闁绘牗绮撴俊瀛樼▔閸掔穻 缂?OTP 婵°倗濮撮惌渚€鎯佹径鎰ュù锝囩摂閸熷骸顭跨捄鐑樼煑闁硅翰鍊濋幃褏浠﹂懖鈺冩喛闂佸憡鑹惧ù鐑芥偨婵犳碍鍤傞柡鍐ㄦ川濞堣埖绻涢幘铏櫣鐎?
  - 闂佸搫瀚ù鐑藉灳?`generate / verify / devices / revoke` 闂佹悶鍎茬粙鎰版煂濠婂嫭浜ら柣鎰綑婢跺秹鏌熼幁鎺戝姎鐟滅増鐩幆鍐礋椤曞懎娈插┑顔炬嚀閸婇绮仦鐐氦闁哄倹瀵х粈鈧紓鍌欑劍閹稿鎮?

### Modified

- **闁哄鏅濋崑鐐垫暜鐎涙ǜ浜滈柣銏㈩焾濞呫垽鏌＄€ｎ亜顏ч悹鎰枛瀹曪綁顢涘┑鍛煉闁荤姴顑呴崯鏉库枔閹寸姵濯奸柟顖嗗本校缂傚倷鐒﹂崹鐢告偩閹屽晠闁靛鍊楃粙濠囨煕?*:
  - 闁哄鏅濋崑鐐垫暜鐎涙ǜ浜滃ù锝呭彎婢跺鐎查柟閭︿海閸橆剟鏌￠崒姘窛闁哄拋鍋婂Λ鍐綖椤戣棄浜惧〒姘ｅ亾闁绘稒鐟ч幏鐘虫媴閾忕懓鐏ｉ柣蹇曞仦濞叉粓濡靛璺何ュù锝堫潐缁犳盯鏌涢弬琛″亾閾忣偆褰滈梺闈╅檮濠㈡ê顭囬崘顔嘉ュ〒姘ｅ亾闁绘稒鐟ч幏鐘虫媴閻ｅ瞼鍞撮悗鍨緲鐎氥劑鍩€椤戣法顦﹂柍褜鍓氱敮鐔碱敇閹间礁绫嶉柡鍫㈡暩閻熴垹顭跨捄铏剐㈤柛鈺傤殜楠炴瑥顓奸崟顓犫枙
  - 婵犫拃鍛粶濠?App 闁诲簼绲婚～澶屾暜鐎靛憡瀚氶悗娑櫳戦～鏍煕閺嶎偄鐨戠紒杈ㄧ箞閹嫮鈧稒锚婢跺秹鎮橀悙瀛樼闁?`POST /api/connect/verify` 闂佹眹鍔岀€氼垶顢氶鈧晥闁稿本鐟х粔鑲╃磼閳ь剚娼幍顔荤矗
  - 婵犫拃鍛粶濠殿喚鍋炲濠氭倷閺夋垵顦查梺缁橆焾閸╂牠鍩€椤戞寧绁伴柣銈呮閹风娀锝為鍓ь槷閻熸粎澧楅幐鍛婃櫠閻樻剚娈界€光偓閸愵亝顫嶉梺娲诲枙濞村洭锝?App 闂佺懓鐡ㄩ崝鏇熸叏濞戞瑯娈界€光偓閸愵亝顫嶉梺鍛婅壘閸戠晫妲愬┑鍥ヤ簻闁汇垹鎲″銊ッ归崗闂翠孩闁搞倖绮撳畷婵嬪Ω閵夈儳鈧ジ鏌熺拠鈩冪窔閻犳劗鍠栭崹鎯ь煥閸愩劌娈ラ柣搴ｆ嚀閺堫剟宕瑰杈╃＜闁瑰瓨绻勯弳浼存煃?
  - 閻庡湱顭堝璺侯啅閸ф绾ч柛鎰靛弾閸熷骸顭跨捄鐑樻悙闁割煈浜為幃浼村Ω閿旇姤娈伴梺褰掓櫜缁€渚€宕哄☉銏犳濡鑳堕悷銏ゆ煙娣囧崬鈧繈寮ㄩ姀銈嗘櫖閻忕偟鍋撶€电敻姊烘惔鎾充壕闂佸憡鑹惧锕傤敊閺囩喎绶為柛銉檮婵垽鏌ｅΔ鈧惉濂告偟濞戙垹纭€闁告劕鐪版禍濂告煛?
- **闁哄鏅濋崑鐐垫暜閹绢喖瑙﹂幖杈剧秵娴煎倿鏌熼幁鎺戝姎鐟滅増绋撻幃浼村Ψ閳哄啰啸闂佹椿娼块崝瀣姳?App 閻庢鍠掗崑鎾绘煕濞嗘劕鐏╂繛鍫熷灦濞煎寮幐搴ｎ槬缂傚倷鐒﹂幐濠氭倵?*:
  - `POST /api/connect/generate` 闂佸搫鍊瑰姗€路閸愨晜浜ら柡鍌涘缁€鈧?`connectionId`闂侀潧妫斿姊玡rifyPath`闂侀潧妫斿姊晉piresInSeconds`
  - `POST /api/connect/verify` 闂佸搫鍊瑰姗€路閸愨晜浜ら柡鍌涘缁€鈧?`tokenType`闂侀潧妫斿姊玡rifiedAt`
  - 闁哄鏅濋崑鐐垫暜鐎靛憡濯奸柡澶庢硶缁夊潡鏌￠埀顒勬焻濞戞粎顦伴梺?`accountId` 闂傚倸鎳忓濠氣€栭崶顒佹櫖鐎光偓閸曨亞绱氶梺绋跨箰缁夋挳藝鐠恒劍瀚婚柨鏃囨閻撴洘淇婇妞诲亾瀹曞洨顢呮繛鎴炴尭椤戝牓顢欓弴鐔风窞闁搞儻绠掗々顐︽煕?
  - 闁荤姳鐒﹂崕鎶剿囬浣侯浄闁靛牆娲ら·?`dev-<connectionId>` 闂佽浜介崕閬嶅矗閸℃瑦濯奸柕鍫濈墢濡插牊绻涚紙鐘哄厡闁宠銈搁弫宥囦沪閼测斁鏁€婵?App 闂佸憡鑹惧ù鐑芥偨婵犳碍鍎庨悗娑櫭径宥夋煙閻撳孩鎯堥柣銏╁亝缁傛帡濡堕崶褜鏉洪柣鐘辩濞尖€澄涢崼鏇炵闁靛鍎辩紞?
  - `PUBLIC_IP` 闂佸搫鐗滄禍顏堝储閵堝洨纾炬い鏃囧Г椤ρ囨煠婵傚绨诲┑顔规櫆缁傛帗鎯旈敍鍕梺鍛婃尭缁夌兘顢氶鈧晥闁稿本绋戦懙褰掓倵閻㈤潧甯剁憸鎷屽皺娴狅箓寮撮悩顔荤驳闂佹眹鍔岀€氼厼锕㈤崶顒€绀夐柍銉ㄦ珪閻濄倝鏌涢敂鑺ョ凡婵?

### Modified Files

1. `docs/APP闁哄鏅濋崑鐐垫暜閹绢喖绀夐柣鏃囶嚙閸樺鈧鍠掗崑鎾绘煕濞嗘劕鐏﹂柡瀣暙椤?md` - APP 闁哄鏅濋崑鐐垫暜閺夋埈鍤曢柍褜鍓熷畷锝夊箣閿濆骸娈梺?
2. `web/src/app/(dashboard)/connections/page.tsx` - 闁哄鏅濋崑鐐垫暜鐎涙ǜ浜滈柣銏㈩焾濞呫垽鏌?
3. `web/src/components/shared/navigation.ts` - 婵＄偑鍊楅弫璇差焽娴兼潙鍐€闁搞儺鍓﹂弳顖氣槈閹炬娊顎楁い鏇憾閹虫粓顢旈崟顐㈢瑲婵烇絽娲犻崜婵囧?
4. `web/src/components/shared/Header.tsx` - 婵＄偑鍊曢悥濂稿磿鐎涙ǜ浜滈梻鍫熺◤娴犲牆鈽夐幘铏崳闁轰降鍊濋獮瀣偪椤栨氨绉撮梺?
5. `web/src/components/shared/MobileSidebar.tsx` - 缂備礁顦抽褎鎱ㄩ埡鍐崥妞ゆ牗鍑归崵銈夋煠?
6. `src/server/src/main.ts` - 闁哄鏅濋崑鐐垫暜閹绢喖绠抽柕澶堝劚缂嶆挸鈽夐幘铏攭妞ゆ梹娲樺鍕炊閿旇棄袘闂佺粯顨呴惌渚€顢橀懡銈嗗珰?

## 2.3.4 - 2026-03-23

### Modified

- **婵＄偑鍊曞﹢鍗灻烘导鏉戣Е鐎广儱娉﹂悙鐢电＜闁绘柨澧庨閬嶆煛閸パ呮憼闁哄苯锕ョ粙?* **`wotty-StarAccounting`**:
  - 闂佸搫娲ら悺銊╁蓟婵犲洤绠ラ柍褜鍓熷鍨緞閹邦剙璧嬬紓鍌氬枤閸犳寮搁崘鈺冾浄闁哄牅绲婚崢顒勬煟閵娿儱顏柕鍡楃Ч閹嫰顢欓崗鐓庘偓宕囩磼婢跺绶茬紒鎵佹櫊閹粙鈥﹂幒鏃傤槱package.json闂侀潧妫旈崟缍紋out.tsx闂侀潧妫斿▽鐒宯ifest.json闂侀潧妫旀Λ姝癱ker-compose.yml缂備焦绋戦¨鈧紒?
  - 闂佸搫娲ら悺銊╁蓟婵犲洤绀堢€广儱娴傛导?UI 婵炴垶鎼╅崢鎯р枔閹寸偑浜滈柛锔诲幗缁愭鏌″鍛枠妞わ絼绮欓弫宥夊捶閻滎泭ebar闂侀潧妫旂粩绔峯ut婵＄偑鍊楅弫璇差焽娴兼潙违濞达絿鐡旈崯搴ｇ磽閸愭儳娅嶉柕鍡楊樀濡啴濮€閵忋垺鎯ｉ梺?
  - 闂佸搫娲ら悺銊╁蓟婵犲洤妫橀柛銉ｅ妸閳ь剙鍊圭粙澶愵敇閻樺磭鏆犳俊鐐€曞﹢鍗灻烘导鏉戣Е鐎广儱娉﹂悙宸殨闁哄洨濮甸弳蹇涙煥濞戞ɑ渚汦ADME.md闂侀潧妫旂粈浣烘閹达箑鐭楅柟杈剧悼缁犲骞栨潏楣冩闁哄鍟々濂告晲閸愶絽浜惧☉?婵°倕鍊归…鍥殽閸ヮ剙绀夐柣鏃囶嚙閸樻挳鏌￠崒姘闁靛棗鍊荤划鍨緞濞戞氨顦?
  - 闂佸搫娲ら悺銊╁蓟婵犲伅鍦偓锝庡幘濡叉悂鏌￠崒姘煑婵炲棎鍨虹粙澶愵敇閻樺磭鏆犳慨鎺撶⊕椤牓顢樻繝姘仺闁靛绠戦悡鏇㈡煕?
  - 闂佸搫娲ら悺銊╁蓟?Docker 闁诲骸婀遍幊鎾斥枍閹烘瑙︾€广儱娉﹂悙瀵糕枖?`wotty-StarAccounting-*`
  - 闂佸搫娲ら悺銊╁蓟?PWA manifest 闂?Service Worker 缂傚倸鍊归幐鎼佹偤閵娾晛瑙︾€广儱娉?
  - 闂佸搫娲ら悺銊╁蓟婵犲洤绠ラ柍褜鍓熷?GitHub 闂備礁澧介崑鎾舵暜閺夋埈鍤曢柡鍥╁У閺?

### Modified Files

1. `package.json` - 婵＄偑鍊曞﹢鍗灻烘导鏉戣Е鐎广儱娉?
2. `web/package.json` - 闂佸憡鎸哥粔鍫曨敂椤掍降浜滈柛锔诲幗缁愭鏌涘顒傂ょ悮?
3. `src/server/package.json` - 闂佸憡鑹惧ù鐑筋敂椤掍降浜滈柛锔诲幗缁愭鏌涘顒傂ょ悮?
4. `web/src/app/layout.tsx` - 闂佺绻愰崯顖炲汲閻旂厧绠叉い鏂垮悑鐎氭煡鏌″鍛枠妞?
5. `web/src/components/shared/Sidebar.tsx` - 婵炴挻鐨滈崱娆戝骄闂佸搫绉寸换鎴︽偉閿濆棴绱?
6. `web/src/components/shared/PWARegister.tsx` - PWA 闁诲海鎳撻ˇ鎶剿夋繝鍥х闁归偊鍠撴禒?
7. `web/public/manifest.json` - PWA manifest
8. `web/public/sw.js` - Service Worker 缂傚倸鍊归幐鎼佹偤閵娾晛瑙︾€广儱娉?
9. `docker-compose.yml` - Docker 闁诲骸婀遍幊鎾斥枍閹烘瑙︾€广儱娉?
10. `README.md` - 婵＄偑鍊曞﹢鍗灻烘导鏉戞闁搞儯鍔婇埀顒€鍊垮浠嬪炊椤掑姣?
11. `docs/V2婵°倕鍊归…鍥殽閸ヮ剙绀夐柣鏃囶嚙閸樺鈧鍠掗崑鎾绘煕濞嗘劕鐏﹂柡瀣暙椤?md` - 闂佸搫鍊稿ú锕傚Υ閸岀偛鍐€闁搞儺鍓﹂弳?
12. `docs/闂佽桨鑳舵晶妤€鐣垫担瑙勫劅闁规崘顕х敮宕囩磽?md` - 闂佽桨鑳舵晶妤€鐣垫担瑙勫劅闁规崘顕х敮宕囩磽?
13. `docs/閻庢鍠掗崑鎾绘煕濞嗘劕鐏辩紒缁樕戦幆?md` - 缂備胶濯寸槐鏇㈠箖婵犲洤宸濇慨妞诲亾闁稿鐗滅划?
14. `web/src/app/(dashboard)/about/page.tsx` - 闂佺绻愰崢鏍姳椤掍降浜滈柣銏犳啞濡椼劑鏌″鍛枠妞?
15. `web/src/app/(dashboard)/settings/page.tsx` - 闁荤姳绀佹晶浠嬫偪閸℃ǜ浜滈柣銏犳啞濡椼劑骞栫€涙ɑ绀嬮柛?
16. `web/public/test-api.html` - 濠电偞娼欓鍫ユ儊椤栨稏浜滈柣銏犳啞濡椼劌顫楀☉娆樼劸妞ゆ挸顭烽弻鍥敊缂併垹鏁?
17. `web/public/offline.html` - 缂備礁鍊藉畷鐢稿吹鎼搭潿浜滈柣銏犳啞濡椼劑鏌″鍛枠妞?
18. `web/tests/budget.spec.ts` - 濠电偞娼欓鍫ユ儊椤栫偛妫橀柛銉檮椤愯棄顫楀☉娆樼劸妞ゆ挸顭烽弻鍥敊缂併垹鏁?

## 2.3.3 - 2026-03-22

### Bug Fixes

- **闁荤姵鍔х粻鎴濈暦閻旇　鍋撻悽闈涘付闁告瑥妫濆顐︽偋閸繄銈︾紓鍌欒兌閸犳洟顢橀崨濠勨攳妞ゆ梻鈷堝Σ?*:
  - 婵烇絽娴傞崰鏍囬崣澶岊洸闁糕剝顨忛崵銈夋煕韫囧鍔滈柡渚囧枟缁傛帒螣閾忚婢?閻庣敻鍋婇崰鏇熺┍婵犲嫭瀚婚柨鏇楀亾鐎规洜鍠栧顔炬媼閸︻厾顦梺鎼炲劤婵挳宕ｈ箛鏇氭勃闁逞屽墴瀹曨剟顢涘▎鎴紘闁荤姳闄嶉崹鐟扮暦閻旂厧鐭楅柛鎴欏€楃粈鍒瀘rderId`闂佹寧绋戦ˇ杈┾偓瑙勫▕瀵爼鎮㈡總澶婃闂佺厧鍢查顓炩枔閹达附顥堟繛鍡樻尵鐢盯鎮归崫鍕瀮缂佽鍟村濠氼敋閳ь剟銆傛禒瀣?
  - 婵烇絽娴傞崰妤咁敆濠婂嫮顩查柛鈩冪☉濞呫垹顭跨捄铏剐ｉ柡鍡欏枛楠炴垿顢氶崱娆戭槱`duplicateCount`闂佹寧绋戦ˇ鍗炩枔閹寸姵濯奸柨娑樺閺嗩剟姊洪锝嗩潡缂侀鍋婇弫宥咁潩閸楃偟鐤€闂侀潻璐熼崝蹇涘礂濡警娼伴柨婵嗘礌閳ь剚顭囩槐鎺楁偄濞茶鎮佸Δ鐘靛仩濞夋盯鎯堝鍥╃焼闁告繂瀚粈鍫ユ煛娴ｅ搫顣肩€规挷鐒﹂幆鏃堝箻鐠轰警鍞洪梺鍝勵槺閸犳洟鍩€椤掆偓閻線锝為敂鐐磯閻庡湱濮风粻鏍煟閵娿儱顏柛锝呮啞瀵板嫬顓奸崱妯挎嫬闂佺儵鏅╅崰妤呭汲閻旂厧违?
  - 闂佸湱绮崝鏇炵暦鐏炲墽顩查柛鈩冾殢閸ゃ倝鏌涜箛瀣姕鐟滈鑳剁划鍫ユ惞鐟欏嫮鏆犻梺鍛婂灥濡盯鍨惧鈧獮鈧憸婵堟濠靛牊鍠嗛柨婵嗘噹閺嬧偓婵炲瓨绮屽Λ妤咁敋闁秴绀傞柕澹嫮銈查梺鍛婅壘閺堫剟寮搁崘鈺冾浄闁肩鐏氶ˇ褔鏌涢幋锝嗩仩妤犵偛娲崹鎯ь煥閸曨偆浜ｉ梺?0 闂佸搫顦Σ鍕濠靛鐓傜€广儱鎷嬪Σ?0 闂佸搫顦Σ鍕濠靛绫嶉柣妯挎珪濞?0 闂佸搫顦褔鍩€椤掍胶绠樻繛鍫熷灩閹风娀顢涘鐓庢闂佽鍎搁崟顐ゅ€掔紓浣插亾闁诡厽宸婚崑?

## 2.3.2 - 2026-03-21

### Features

- **闁荤姵鍔х粻鎴濈暦閻旇　鍋撻悽闈涘付闁告瑥妫欑€电厧螣閸濆嫷鍤?*:
  - 闂佸憡鑹惧ù鐑筋敂椤掑嫬绀夐柕濠忚吂閸嬫挻鎷呴悾灞绢潥闂佸憡甯炲畵濉朧闂佸憡甯楅〃鍛村箖閺囩姵鍋樼€光偓鐎ｎ剛顦╅梺?0闁荤偞绋戦張顒佺珶閸岀偛绠甸煫鍥ュ劤缁€?
  - 閻庣敻鍋婇崰鏇熺┍?闂佽　鍋撴い鏍ㄧ懅鐢盯鎮楃憴鍕畵闁搞劌閰ｅ畷姘额敃閵壯勵潥闂佸憡甯╅崑鍡樼珶閹烘埈鍤楀ù锝囶焾閻?
  - 缂傚倷鑳堕崰宥囩博閹绢喖绀嗛柛鈩冪懆椤箓鏌?8缂備礁顦粔鐢告偉閿濆绀勯柛鈩冾殔閻庤崵绱?
  - 缂傚倷鑳堕崰宥囩博閹绢喗鍋愰柤鍝ヮ暯閸嬫挻绗熸繝鍕崶SUCCESS / FAILED / REFUND
  - 閻庣敻鍋婇崰鏇熺┍婵犲啰顩查柕鍫濇椤粎绱掗銉殭闁诲海鍏橀幊娑㈩敂閸曨倣妤呮煛閸曨厼孝闁汇劎濞€瀹曟岸骞嶉鎯х厷婵炴垶鎸撮崑鎾绘煕閹烘垶顥犻悶?

### Modified Files

1. `src/server/src/etl/importCsv.ts` - 闂佽　鍋撶痪顓炴噽缁犲鏌涢幒鎿冩當闁诡喗娲滈幏鐘诲幢濡も偓閻掕偐绱掗悩鎰佹畷缁?
2. `src/server/src/etl/mapTransaction.ts` - 濠电儑缍€椤曆勬叏閻愬搫绀嗛柛鈩冪懆椤?闂佺粯顭堥崺鏍焵椤戣法鍔嶆俊鎯懍鐒?

### New Files

1. `docs/闁荤姵鍔х粻鎴濈暦閻旇　鍋撻悽闈涘付闁告瑥妫欑€电厧螣閸濆嫷鍤?md` - 闁荤姳鐒﹀畷姗€顢橀幖浣告闁搞儯鍔婇埀?

## 2.3.1 - 2026-03-21

### Features

- **闂佽桨鑳舵晶妤€鐣垫担铏逛笉闁挎稑瀚崐鐐差渻閵堝洦鏆繛?*:
  - 闂佸搫鍊瑰姗€路?`/data` 闁荤姳璀﹂崹鎶藉极闁秵鏅悘鐐插悑濞呯娀寮堕崼锝庢綈闁绘牬鍠栬彁閻犲洦褰冮～?闂佽桨鑳舵晶妤€鐣垫担铏逛笉闁挎稑瀚崐?闂佺绻堥崕杈亹?
  - 闂佽　鍋撴い鏍ㄧ☉閻︻噣鏌熼棃娑氱Ш闁革絾妞介弻鍛緞鐎ｎ亶浠撮梺闈涙缁€渚€宕硅ぐ鎺撯挃闁靛牆鍟犻崑鎾存媴闁垮寮块梺琛″亾闂侇偅绋掗崬澶愭煛閸曨剚宕勬い鏂挎穿閵?
- **闁荤姵鍔ч梽鍕春濞戞氨涓嶉柨娑樺閸婄偤鏌涢弮鍌氭灆闁?*:
  - 闁荤姳绀佹晶浠嬫偪閸℃ǜ浜滈柣銏犳啞濡椼劑鏌￠崒娑欑凡妞?闁荤姵鍔ч梽鍕春濞戞氨涓嶉柨娑樺閸?濠碘槅鍨埀顒冩珪閸嬨儵鏌ㄥ☉妯煎缂佹ぞ绶氬畷姘旈埀顒傜博妞嬪簼娌柍褜鍓熼弫?
  - 闂佽　鍋撴い鏍ㄧ☉閻︻噣鏌涢幒鎾垛槈缂傚倹鎹囧顒勫箯鐏炵瓔妲遍梺鐟扮摠閻忔岸鍩€椤戣法鍔嶉柣鎿勭節閹洨鈧綆鍘奸ˇ鈺呮煙閺夋垵妲婚柛顭戜簽閹即濡搁敐鍌氫壕濞达絿鐡旈崯搴ｇ磽閸愭儳娅嶇紒顕呭灣閹峰濡堕崼婵愭П闂?

### API

- `POST /api/accounts` - 闂佸憡甯楃粙鎴犵磽閹捐埖瀚婚柨鏃囨閻?
- `GET /api/accounts` - 闂佸吋鍎抽崲鑼躲亹閸モ晜瀚婚柨鏃囨閻撴洟鏌涢幒鎿冩畽闁?
- `PUT /api/accounts/:id/default` - 闁荤姳绀佹晶浠嬫偪閸℃﹩娓舵俊顖涱儥閸氬洭鎮归幇鍫曟闁?

### New Files

1. `web/src/app/(dashboard)/data/page.tsx` - 闂佽桨鑳舵晶妤€鐣垫担铏逛笉闁挎稑瀚崐鐐差渻閵堝洦鏆繛?

### Modified Files

1. `web/src/components/shared/Sidebar.tsx` - 濠电儑缍€椤曆勬叏閻愬搫鏋侀柣妤€鐗嗙粊锔剧磼閻欏懐纾块柟顔硷躬瀹曟濡烽妷銉х▔
2. `web/src/app/(dashboard)/settings/page.tsx` - 濠电儑缍€椤曆勬叏閻愬灚瀚婚柨鏃囨閻撴洜绱掗悪鍛？闁诡喖锕よ灒闁炽儴娅曢崑?
3. `src/server/src/main.ts` - 闂佸搫鍊瑰姗€路閸愵亝瀚婚柨鏃囨閻撴洜绱掗悪鍛？闁?API

## 2.3.0 - 2026-03-21

### Features

- **婵犮垼鍩栨穱鐑樺緞閸曨垰绠ｉ梺鍨儐缂嶁偓闂傚倸瀚崝妤呮焾鐎靛摜纾?*:
  - 闂佸搫鍊瑰姗€路?`account` 闁?- 闁荤姵鍔ч梽鍕春濞戞瑧鈹嶉柍鈺佸暕缁?
  - 闂佸搫鍊瑰姗€路?`account_member` 闁?- 闂佺懓鐡ㄩ崝鏇㈠箟閹惰棄绀傜€规洖娲崗鍥р槈閹惧啿顒㈡繛鐓庣墦濮婁粙骞囬崜浣侯槱闂佽　鍋撴い鏍ㄧ☉閻?OWNER/ADMIN/MEMBER 婵炴垶鎸搁ˇ閬嶏綖閹烘梹鍠嗛柟鐑樻礀椤ュ繘鏌?
  - 闂佸湱顣介崑鎾绘煛閸繍妲风紒妤冨枛瀹曟繈妾遍柕鍡楀暣瀵剟寮跺▎鐐緮 `accountId` 闁诲孩绋掗〃鍡涱敊瀹€鍕櫖閻忕偟鏅弶浠嬫煟濠婂懎顣奸柡鍡欏枛楠炴垿顢氶埀顒€鈻撹缁?
  - 闂佹椿娼块崝宥夊春?`defaultAccountId` 闁诲孩绋掗〃鍡涱敊瀹€鍕閻庡湱濮崇划鎾愁潡濞戞瑯鐒炬い鎾瑰吹閹峰綊鏁傞挊澶屽幈
  - `canViewOwn`/`canManageOwn`/`canViewAll`/`canManageAll` 缂傚倷绀佸Λ娑㈡儗閹寸偞鍎熼柨鏃囧Г缂嶁偓闂傚倸瀚崝鏍暜閸洖绀?

### Database Changes

- 闂佸搫鍊瑰姗€路閸愵亝鍋樻い顓熷笧缁愭account`, `account_member`
- 婵烇絽娴傞崰妤呭极閼测晜鍋樻い顓熷笧缁愭鏌熺喊妯轰壕闂佸搫鐗嗛ˇ顔剧箔閻旂厧绀夐梽鍥Υ閸愵喖妫橀柡澶嬵儥閺?`accountId` 闁诲孩绋掗〃鍡涱敊?
- 闂佸搫鍊瑰姗€路?`npm run db:create` 婵炴垶鎸撮崑鎾绘⒑濞嗘儳鏋涢柛銊ュ船椤曟瑩鎮滃Ο缁橆啀闂佺顕栭崰娑㈠Υ?

### New Files

1. `docs/婵犮垼鍩栨穱鐑樺緞閸曨垰绠ｉ梺鍨儐缂嶁偓闂傚倸瀚崝妤呮焾鐎靛摜纾奸柣鏃€妞块崯搴ㄦ偣?md` - 闁荤姳鐒﹀畷姗€顢橀幖浣告闁搞儯鍔婇埀?
2. `docs/闁诲海鎳撻張顒勫汲閿濆鏋侀柣妤€鐗嗙粊锕傚箹鐎涙ɑ灏电紒顔哄姂瀵?sql` - 闂佽桨鑳舵晶妤€鐣垫担瑙勫劅闁规儳澧庡▔銏ゆ煛?SQL
3. `src/server/scripts/create-tables.ts` - 婵炴垶鎸撮崑鎾绘⒑濞嗘儳鏋涚紓鍌涙尵閹即濡搁妸銉ヮ棝闂?

### Modified Files

1. `src/server/prisma/schema.prisma` - 闂佸搫鍊瑰姗€路?account 闂?account\_member 濠碘槅鍨埀顒€纾埀?
2. `src/server/src/main.ts` - 闂佸搫鍊瑰姗€路?`requireAccountId` 闂佸憡鍨兼慨銈夊汲閻斿吋鏅悘鐐电摂閸ゃ倝鏌涜箛瀣姦闁逞屽墯濡叉帞娆㈤锝嗗閻犳亽鍔嶉弳?accountId
3. `src/server/package.json` - 闂佸搫鍊瑰姗€路?`db:create` 闂佺厧鐡ㄧ喊宥咃耿?

## 2.2.6 - 2026-03-20

### Fixes

- **闂佺硶鏅炲銊ц姳?Next.js 闂佸搫鐗冮崑鎾趁归敐鍛毐闁汇倕瀚幑鍕濞戞鍞夐柟鐓庣摠濞叉繆顣鹃梺鍛婂姇閸熷潡宕哄☉銏犳闁绘鐗忓▔濠囨煕閺傝濮傛俊顐ュ煐閿?*:
  - 缂備礁顦…宄扳枍鎼淬垻顩查柛鈩冾殔椤ゅ懎鈽夐幘顖氫壕闂佺粯顨呴悧濠傦耿閻楀牊濯撮悹鎭掑妽閺?`min-h-screen` 闂?hack 闂佸憡鍔栭悷锔炬兜閸洖违?
  - 闁诲繐绻愬Λ娆戠矓妞嬪孩瀚荤憸鐗堝竾閳ь剙顦靛Λ鍐閵忥紕鏆犳俊銈囧О閸斿秹鎮橀敂鍙ユ勃闊洦娲滈惌瀣归悩铏瀯缂?`page.tsx` 闂佸憡鍔曢幊姗€宕曢幘顔肩闁伙絽鐭堥悗鏌ユ煥濞戞瀚伴柛銊ュ船椤曟瑦娼幍顔兼櫓缂備焦顨愮粻鎴﹀箖?Next.js App Router 缂備焦鎷濈粻鎴︽偩妤ｅ啯鍎?`app/(dashboard)/consumption/loading.tsx`闂?
  - 闂備緡鍋呮穱铏规崲閸愵喖瀚夌€广儱鎳庨～銈囩磼閺冩垵鐏ｆ繛鍫熷灴瀹曘垽鎮㈤悜妯绘 React Suspense 濠电偛顦崝宀勫矗閸℃稒鏅€光偓閳ь剟鍨惧Ο鑽も攳婵犻潧娲ㄩ妶濠氭偡濞嗗繒澧曟繛鍛浮瀹曠兘濡搁敂鑺ユ瘑闂佸憡甯楀姗€宕归崹顐ｅ弿?HTML 闂佹眹鍔岀€氼噣顢栭崶銊р枖闁逞屽墰閺侇喛顦叉慨妯稿姂楠炲繘濡烽敂鐣岀暢闁诲海鎳撻張顒勫汲閿濆鍎嶉柛鏇ㄥ灱閳ь剙娲鍝ユ崉閾忚缍勬俊銈呭€归敋閻庤濞婇弫宥囦沪閼测晝鐓犻梺鍏兼緲閻線顢欓埀顒勬煕濡厧鏋旈柡?Scroll Restoration闂佹寧绋戦悧濠勫垝閹绢喖绀夐柕濠忕細閸掓帒顭跨捄铏光枌缂佽鲸姘ㄩ埀顒傛嚀閻偐娆㈤妸鈺傚仺闁绘柨鎲″▍蹇涙煏?

### Modified Files

1. `web/src/app/(dashboard)/consumption/page.tsx`
2. `web/src/app/(dashboard)/consumption/loading.tsx` (闂佸搫鍊瑰姗€路?
3. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`

## 2.2.5 - 2026-03-20

### Fixes

- **閻熸粍濯介褏鑺卞畷鍥ㄥ枂闁挎繂鎳庨弸鈧┑鐐村灥閻楁劙宕归崒娑栦簻闁汇垹鎲″銊╂煕閹烘鏁遍柡灞斤工椤劌顫濋鈧婵炶揪绲界粔鍫曟偪閸℃鈻旈柕蹇曞О娴滃ジ姊婚崒銈呮珝妞?*:
  - 婵?`page.tsx`闂侀潧妫斿妗絢eletonLoading` 婵炲濮伴崕鍗烆嚕?`ConsumptionDefaultTheme` 闂佹眹鍔岀€氼厼銆掗懜闈涚窞闁哄诞鍛嬀闁诲骸婀遍幊鎾斥枍閹烘嚞搴ｆ嫚閹绘帩娼辨繛?`min-h-screen` 闂佸搫绉撮崲鑼閿熺姴违?
  - 闁荤喐鐟辩徊浠嬪窗閸涱喚顩查柛鈩冾殕闊?`next/dynamic` 閻庢鍠栭崐褰掝敆閻愬搫绀夐柣妯煎劋缁佷即鏌￠崼銏犳灈婵?DOM 闂佹椿鍓﹂崜鐔肺涢幐搴畻婵☆垰鎼濠囨煕瑜嶇粔鎾€侀幋锔芥櫖閻忕偟鐡旈崵銈夋煠瀹勬壆鎽犵紒浣藉吹閹叉挳宕煎┑鍥╁綔 Scroll Restoration闂佹寧绋戦悧濠勫垝閹绢喖绀夐柕濠忕細閸掓帒顭跨捄铏光枌缂佽鲸宀稿鐢稿传閸曨偆鍘繝銏″劶妞存悂寮查妷鈺傛櫖鐎光偓閸愮偓钑夐悗娈垮枛閹碱偊宕哄Δ鈧锝夋偡閻楀牏顦ユ俊鐐€曢悥濂稿磿閹绢喗鍎嶉柛鏇ㄥ灡閿涙牕螞閻楀煴婊堝焵?

### Modified Files

1. `web/src/app/(dashboard)/consumption/page.tsx`
2. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`

## 2.2.4 - 2026-03-20

### Fixes

- **婵烇絽娴傞崰鏍囬幓鎺濈叆闁瑰瓨绻傝闂佸憡甯￠弨閬嶅蓟婵犲洤绫嶉柛顐ｆ处閳ь剙娲鍝ユ崉閾忚缍勬繛杈剧到缁夊爼鎮块崱妯尖枖闁靛繒濮版禍濂告⒒閸屻倕娅嶆い?*:
  - 闁荤偞绋忛崕閬嶅矗韫囨梻顩?`consumption/page.tsx` 婵炴垶鎼╅崢鎯ь啅鏉堛劌绶為弶鍫氭櫆閻ｉ亶骞栫€涙ɑ绀€闁活亙鍗冲畷鍫曞箲閹扳斁鍋撻崘鈺婃闁靛濡囨禒鎼佹倶閻愯尙绠扮€规洜澧楅幏鍛吋韫囨洜顦╅梺鍛婄墪閹冲繒鈧凹鍘鹃弫顕€寮撮悩鍨劸闂佺懓鐏氶敋婵炲瓨锕㈡俊瀛樻媴閸︻厜銉╂偣閹邦垼娼愭俊顐熸櫊瀹曘垽宕遍幇銊ヤ壕濞达絽鎼崝浼存煕閺冣偓缁嬫垵霉濮椻偓婵″瓨鎷呯拠鈩冩櫈闂佺硶鏅涢幖顐⒚瑰鈧俊瀛樻媴鐟欏嫭鐤囬梺缁樺姉閹虫挸霉濡偐椹冲鑸电〒缁€鍡涙煏?
  - 闁荤喐鐟辩徊浠嬪窗閸涱喚顩查柛鈩冾殕缁€鍫澪旈悩顔煎闁诲骏濡囨禒锕佺疀閺傚搫浜惧┑鐘虫皑瑜邦垶骞栨潏鍓х窗缂佹顦遍幖楣冨礃瀹割喖娈奸梺鐓庡槻閻°劎绮婇懡銈嗗枂闁割偅绻冮悵銈夋煕閹烘鏁遍柡灞斤躬瀵噣鎳滈崹顐獜濠电偛顦板ú姗€顢楀鍛厹妞ゆ梹鍨濋崚鎺戭熆鐠鸿櫣校缂侇喗鎸冲畷婵嬪Ω閵堝洨孝缂傚倸鍠氶崰姘枔閹达附鈷掓い鏇楀亾妞わ絼绮欐俊?
  - 闂佺粯绮嶅妯猴耿椤忓拋娈介柕濠忓娴犳悂鎮橀悙鑼闁绘繍鍠楅幆鏃堟晜鐠恒劎鎲块梺娲讳簽閸犲酣鎮块崟顑句簻闁汇垹鎲″銊╂倵閻熸媽瀚伴柛娆忕箳閳ь剟娼х紞濠勭礊閸儲鏅€光偓閳ь剟寮妶澶婄鐎瑰嫭婢樼粊顔济归敐鍛虎婵犫偓椤忓懌浜滈柣銏犳啞濡椼劑骞栫€涙ɑ绀嬮柛搴㈡尦瀹曟岸鏌ㄧ€ｎ偆鍘愭繛鎴炴⒒閸犳洟宕楀鈧悰顕€鎼归銈嗗闁哄鏅涘ú锕€霉椤曗偓婵?

### Modified Files

1. `web/src/app/(dashboard)/consumption/page.tsx`

## 2.2.3 - 2026-03-20

### UI/UX Improvements

- **婵°倗濮伴崝宥夋倶閿斿彞娌煫鍥ㄥ嚬濞兼帡鎮峰▎蹇ｆХ缂傚秴顑嗛〃銉т沪閸撗呯暢闁硅壈鎻粻鎺旀崲閺囥垹鍌?*:
  - 閻熸粍濯介褏鑺遍幎鑺ョ厒鐎广儱妫涢埀顒夊灡缁傚秹宕卞Δ浣侯洯闁荤偞绋忛崝鎴︻敁閸ヮ剙鍑犻悹楦挎濞煎瞼绱撴担绋款仹婵炲棎鍨介弫宥囦沪閻愵剛鍘愭繝?`PieChartSkeleton` 闂佹椿娼块崝瀣姳椤掍緡娈伴柣鎾冲缁傚牓鏌涢弽褎鎯堥柣鎾寸懇瀹曪繝鎮╂潏鈺冃㈤梺?
  - 闂佸憡顭囬崰鎰耿娓氣偓閹?`ChartSkeleton` 闂佽　鍋撻梺顐ｇ缁€瀣煕閺嵮勫櫣闁诡垰鐗撳鎹愮疀閺冣偓缁ㄦ艾螖閸屾耽顏嗏偓瑙勫▕瀵粯娼忛埡浣囷箓鏌℃径娑氱？婵炲牊鍨块弻鍛潩鏉堛劍娈㈤梺娲诲幐閺呮盯鎳滄导鏉戠倞闁硅鍔戦埀顒€鍟村畷锟犳偐鏉堚晝孝闂佹寧绋戦懟顖炴偩椤掑倻绀冮幖娣妷閸嬫捇宕掗悙鎻掕祴闂佸搫顦埀顒€鐤囬崺宀勬煕閵夈倕瀚庨柍褜鍏涢悞锔芥叏瀹€鈧惀顏堝垂椤旂晫顩梺鍛婄矊閼活垶鎮ラ姀銏㈢煋妞ゆ牗纰嶇粋鍫ユ煕閺嵮勬儓闁绘挻鐟╂俊?
  - 缂備緡鍠栨晶浠嬫偩濠靛洨顩查柛鈩冪◤閳ь剙锕弻鍫ュΩ閵夛妇锛濇繛鎴炴惄娴滄繈鎮х€圭姷鐤€闁告劏鏅滃▓鍫曟煙鐠団€虫灈鐎规洟浜堕幃?(`StatsCardSkeleton`) 闂佹眹鍔岀€氼剟宕幘顔界劸闁靛ě鍛皾闂佸搫顑呯€氼亞绮仦缁㈡畻婵☆垰鎼濠囨煥濞戞ê顨欏┑鐐叉喘瀹曟寮甸悽鐢垫喒闂佸憡鍔曠粔闈浳熸径濠庡殫婵°倕瀚▍鎴︽煠閹绘帒鐨＄紒杈ㄧ箘閹峰湱澹曠€ｎ剛顔呴梺娲讳簽閸犲酣鎮块崟顖氱闁挎稑瀚。濠氭煟閵娿儱顏╃€规洜鍠撻幃鏉跨暆閳ь剟骞撻敐澶婄闁瑰瓨绻勯鎾倶閻愨晛浜鹃梺?
  - 婵炴垶鎸诲浠嬪Υ婵犲洦鐒?AI 闂佺儵鏅濋…鍫ュ矗瑜斿畷婵嬫偄鐠囨彃骞嬮梺鍦焾椤︾敻骞愰幎钘夌闁绘浜粔瀵哥磼濡ゅ妾柛褍锕畷婵嬫偐鏉堚晛鏅╅梺鍛婄墪缂嶅﹪宕㈤妶澶婄闁告挷鐒﹂崺鍌炴倵閸︻厼浠у┑顔芥倐楠炩偓濞达絿鍎ら悾杈ㄧ箾閺夋垶鍤€闁硅姤鍨块幊婵嬪箵閹哄秶淇洪梺绋跨箰椤︿即寮查妷鈺佸嚑婵犙冪氨閸?
  - 閻庣敻鍋婇崰娑㈡儍閻斿摜顩查柛鈩兠。鏌ユ煛閸繍妲告繛瀛橆焽閹即濡搁妷銉╂闂佺硶鏅濋崰鎾斥枔?`min-h` 闂佸憡鐟ラ崐褰掑汲閻斿吋鏅€光偓閸愨晛娑ч梺鍛婂笚濠㈡﹢宕曞杈潟闁绘鏁婚悰鎾绘煕濡ゅ啫小缂傚秴鎳愰埀顒勬涧缂嶅﹦绱為崼銉ノ?

### Modified Files

1. `web/src/app/(dashboard)/consumption/page.tsx`
2. `web/src/components/shared/Skeletons.tsx`

## 2.2.2 - 2026-03-20

### Fixes

- **婵烇絽娴傞崰鏍囬幓鎺嗘闁割偓绲介悗顓烆渻閵堝洦鏆繛鍏煎閺侇噣宕橀妸褎鎷遍梺绋款儏缁绘帊绨?(Layout Shift)**:
  - 婵烇絽娴傞崰鏍囬崣澶岊洸?`consumption/page.tsx` 婵炴垶鎼╅崣鍐敁閸ヮ剙鍑犻悹楦挎濞煎苯鈽夐幘铏崳婵犫偓閿涘嫧鍋撻崷顓炰户缂侇喖绉电粋鎺楀嫉閻㈢數鎲规繛鎴炴尨閸嬫捇鏌ら柨瀣稇妞ゆ洟浜堕幊娑氣偓闈涙啞閻ｉ亶鎮介姘殭闁活亶鍓涢幑鍕礃閹绘崼妤呮⒒閸屻倕娅嶆い锝勭矙婵?
  - 婵°倗濮伴崝宥夋倶閿斿彞娌煫鍥ㄦ⒐閻撯偓婵犫拃鍛粧缂併劉鍓濋妵鍕醇閺囩偛濮ら梺鍝勭Т濞差參銆傛禒瀣ュ☉鎾冲殬 闂佸搫鎳樼紓姘跺礂濮椻偓瀹曟岸宕卞Ο灏栧亾娴犲纭€闁挎稑瀚。濠氭煕濡ゅ啫小缂傚秴鎳忕粋鎺楀Ψ閵夈儲灏嬬紓浣圭⊕閻╊垶鍩€椤掆偓椤︿即鎮ラ鈧畷锟犳偐鏉堚晝孝闂?
  - 闁荤姴顑呴崯顖炲汲閿濆棛顩查柛鈩冾殕缁傚牓鎮跺☉鏍у閻忓浚鍨跺畷娲偄绾版墎鍋撻崶顒€鍑犻悹楦挎濞煎矂鏌ｉ妸銉ヮ伀缂傚秴顦靛浠嬫偂鎼达綆浼岄柣蹇曞亹閸嬫捇鏌?, 1, 2 col-spans闂佹寧绋戦¨鈧紒杈ㄧ箖缁嬪鎯旈敐鍡楃劯闁诲骸婀遍崑銈夊Υ婢舵劖顥堥柕蹇嬪灪閻ｉ亶鏌ｆ惔銏犵仴缂佹柨鍢查湁濞达絽鎽滈弳姘舵煕韫囧濡兼い鏇ㄥ枟椤洭骞囬埞鎯т壕?
  - 婵烇絽娴傞崰鏍?`AIAnalysisCard.tsx` 婵?`compact` 闁诲繒鍋熼崑鐐哄焵椤戭剙鍟煬顒勬煕閹烘挾绠撴い顐ｅ姍閹晠鎳滅喊妯轰壕濞达絾鎮舵禍濂告煛娴ｅ摜澧曟い鏇憾閹虫稓鈧潧鎲￠悾鍗炍旈崒娴㈩亞鈧懓纾划锝嗘媴缁嬭法绉?Bug闂?

### Modified Files

1. `web/src/app/(dashboard)/consumption/page.tsx`
2. `web/src/components/shared/Skeletons.tsx`
3. `web/src/features/consumption/components/AIAnalysisCard.tsx`

## 2.2.1 - 2026-03-20

### UI/UX Improvements

- **闂佸憡鎸哥粔鍫曨敂椤掑嫬绀夐柣妯煎劋缁佹澘霉閿濆棙宕岄柣娑欑懅缁辨帡鎮㈤崜渚囦紘婵炴潙鍚嬮敋閻?*:
  - 缂備礁顦…宄扳枍鎼淬垻顩查柛鈩兠。鏌ユ煛閸繍妯€闁靛棗顦靛Λ鍐綖椤斿墽顦╂俊顐稻閻楃娀濡存径鎰ュù锝呮贡鍟搁柣鐘冲姇缁犲秹鍩€椤戞寧绁扮紒渚囧亝缁傚秷顦伴柍褜鍏涘ù鍥箲鐠鸿　鏋庡ǎ鍥ㄥ閸嬫挻鎷呴崨濠傗偓鐢告煕濞嗘劕顥嬫い鎾存倐閹爼宕遍鐘殿槴闂侀潻璐熼崝搴ｅ垝瀹ュ棛顩烽柤鎼佹涧濞呪晠鏌涢弮鍌毿繛鏉戞喘瀵敻鎮㈤崗纭风吹闂佹眹鍔岀€氼噣寮幘鑸靛厹妞ゆ帒鍟粊顕€鏌?Loading 闂佹悶鍎抽崑鎾绘偉閿濆违?
  - 闁诲繐绻愬Λ娆愭櫠瀹ュ瀚夊璺侯儏濞呪晠鏌涢弮鍌毿繛鏉戞喘瀹曪繝鎮╂潏鈺冃㈢紓鍌欒兌閸犲秶绮╅幘顔煎嵆闁圭楠告惔濠傗槈閹捐銆冪紒妤€鐬奸埀顒傛暩閹虫挾鑺遍崣澶堜簻闁汇垹鎲″銊╂偨椤栨艾鏆欓柣?:1闂佸憡鐗曠紞濠囧储閵堝鍎?**婵°倗濮伴崝宥夋倶閿斿彞娌?(Skeleton)** 闂佸憡鏌ｉ崝搴ㄥ极妤ｅ啫违?
  - 闂佺粯绮嶅妯猴耿椤忓牊鍋ㄩ柕濠忕畱閻撴洟鏌涢幒妤佹暠闁哄苯锕ラ妵鍕偨閸涘﹥銆冮梺鍝勫暢椤旀劗妲愬┑瀣煑妞ゅ繐鐗婃禒姗€鏌ｉ鍕靛剰闁糕晛鏈粙澶愬焵椤掆偓閳诲酣鍨惧畷鍥ㄧ嫍婵炴垶鎼╅崢鎯р枔?濠殿喗绻愮徊钘夛耿椤忓拋娈界€光偓閸愵亝顫嶉梺璋庡棭鍤欑紓宥呯Ч閹晠鎳滅喊妯轰壕?闂佹寧绋戦惌鍌氣枔閵忋倕瑙﹂幖娣妸閳ь剙顦靛Λ鍐綖椤撶姷鐛ョ紓浣规煥椤戝懘宕洪姀锛勵浄闁靛鏅╅埀顒€娲鍝ユ崉閾忚缍勯悷婊嗗焽閸ㄥ湱妲愰敍鍕勃闁哄洨濮寸粻娑㈡煕閳哄嫭顏犳い銏犳噽缁辨帡骞樼€电硶鍋撻鐐靛祦閻犵儤妞介幐顒佺節婵犲啫鐏辩紒璇插暙閵嗘帡鍨鹃崘鑼帓闂佹椿浜為崰搴ㄦ偪閸曨垰鏋侀柣妤€鐗嗙粊锕傛煥濞戞瀚板ù婧垮€栭幆鏃堝即閻旂洅銉╂⒒閸曗晛鈧挾鑺遍埄鍐ㄧ窞婵﹩鍙庨崑褍鈽夐幘宕囆㈤柟?Loading 闂佸搫绉撮崲鑼閿涘嫭鏆滈柨鏃囧Г闂勫秹鏌ｉ妸銉ヮ伂妞ゎ偄顑囬幉瀛樺緞婵犲偆妫岄柣鐔剁閸婂綊宕濋崨鏉懳?

### Modified Files

1. `web/src/app/(dashboard)/page.tsx`
2. `web/src/app/(dashboard)/assets/page.tsx`
3. `web/src/app/(dashboard)/consumption/page.tsx`
4. `web/src/app/(dashboard)/loans/page.tsx`
5. `web/src/app/(dashboard)/admin/page.tsx`

## 2.2.0 - 2026-03-20

### Features

- **AI 闂佸搫鎳樼紓姘跺礂濮椻偓瀹曟岸宕卞Ο灏栧亾娴犲绀夐柣鏃囶嚙閸樻潙鈽夐幘绛瑰姛闁?*:
  - 闂佸搫鍊瑰姗€路?`POST /api/ai/analyze-consumption` 闂佸憡鑹惧ù鐑筋敂椤掑嫬绠抽柕澶堝劚缂?
  - AI 闂佸憡甯掑Λ娆撴倵娴犲瀚夌€广儱鎳庨～銈夋煠婵傚绨诲┑顔规櫊瀹曟岸宕卞Ο灏栧亾娴犲鍋ㄩ柕濠忕畱閻撴洘绻涢幋婵堝ⅲ闁搞劌鍊垮顐︽偋閸繄銈﹂梺鎸庣☉閻ジ寮幘璇茬闁归偊浜崵瀣煙椤戭剙鍟褎绻涢懠顒€浠滈柣?
  - 濠电偞鍨甸悧鎰板垂閸屾稏浜滈柣銏犳啞濡椼劌顪冮妶鍛煟闁稿孩鎸冲顒勫级濞嗙偓婢?AI 闂佸憡甯掑Λ娆撴倵娴犲纭€闁挎稑瀚。濠氭煥濞戞瀚伴柣顐㈢Ф缁牓鎮€靛摜鐛?
    - 闂佽鍓涚划顖炲极椤曗偓瀹曟瑩骞侀幒鍡椾壕濞达綀顫夐敍澶愭煕瑜嶅ú锔剧矓妞嬪孩瀚绘鐐茬氨閸嬫挻鎷呭畡鎵В闁荤喐娲戦懗鍓佹偖椤愶箑绀嗘い鎰╁€楅幖鑲╃磽娴ｅ搫鏋欐い?
    - 濠电偞鍨甸悧鎰板垂閸岀偛绠戦柤濮愬€楀▔銏ゆ煛閸屾碍澶勬繝鈧?
    - 闂佺绻戞繛濠囧极椤撶伝娲倷閼碱剚顎夐梺鎸庣☉濞肩劆fo/warning/success 缂備緡鍋夐褔鎮楅悜鑺ユ櫖?
    - 闂佸憡鐟崹杈ㄦ櫠閻ｅ本鍋樼€光偓閳ь剙鈻撻幋鐐差嚤婵☆垰鎼褏鈧偣鍊濈紓姘额敊閸涘瓨鏅柛顐ゅ枎閻﹁霉閸忔祹顏堝储濞戞氨妫憸鏃堟偟?婵?婵炶揪绲界€涒晝鏁幘璇茬婵°倕顑囩粈?
  - 闂佽　鍋撴い鏍ㄧ☉閻︻噣鎮橀悙瀛樼缂?闂佽　鍋撻柟顖滃瀹曟娊鎮归崶鐑芥闁?
  - 闂佽　鍋撴い鏍ㄧ☉閻︻噣姊洪幓鎺斝ｉ柡灞斤躬瀹曟岸宕卞Ο灏栧亾?
- **AI 闂佸憡甯掑Λ娆撴倵閼恒儳顩查柕鍫濆闂夊秹鏌℃担鍝ュ闁诲繐顦扮€电厧螣閸濆嫷鍤?*:
  - 婵°倗濮伴崝宥夋倶閿斿彞娌煫鍥ㄦ尭琚熼梺璇″厸缁€浣规叏閻愬瓨濮滈柤鎭掑劜濞呭繘鏌＄€ｎ偆鐜荤紒杈╂珖tats 闂佽桨鑳舵晶妤€鐣垫笟鈧鐣岀箔鐞涒€充壕濞达絽鎲＄粋鍫ユ偠濞戞牕濡奸悘蹇ｅ灦婵″瓨鎷呴崷顓фЦ闁诲海鏁搁崰搴＄暦闁秵鍋嬮柛銉戝嫮绉甸梺鍝勭墕椤﹁京鈧凹鍘剧划鈺冣偓锝庡櫘閳ь剙娲鍝ユ崉閸濆嫅妤呮煟?
  - 闂佸憡甯掑Λ娆撴倵娴犲绠柕澶堝劜閸熺偤鏌熼崹顐ｅ碍闁烩姍鍥у珘闁绘垶蓱濞呭繘鏌＄€ｎ偆鐜荤紒杈╂珖ummary 闂佸搫鍊稿ú銈夋偤瑜旈弻鍛村箛椤掑倹鎲婚梺鍝勫婢т粙濡靛鑸垫櫖閻忕偟鏅弫銊╂⒒閸屻倓绨介柛搴★躬瀹曟寰勭€ｎ剙鐏?
  - 濠电偠灏欓崑娑㈡儌閸岀偛妞介悘鐐垫櫕缁憋箓鎮规笟鍥ф珝闁逞屽墯閸旀牕顭囬姘煎殨闁荤喐婢樺В澶愭煥濞戞瑧顣查柣?300ms 闂備緡鍋呴崝鏍ь焽椤栫偛鍙婇柛鎾椾椒绮垫繛鎴炴尨閸嬫捇鏌℃径鍡橆潐缂佽鲸绻勯弫?slide-in 闂佸憡鏌ｉ崝搴ㄥ极?
  - Loading 闂佸搫鍟抽崺鏍熸径宀€鐭嗛柣鎴炆戦ˉ瀣级?Loader 闂佹悶鍎抽崑鎾绘偉閿濆鏅悘鐐垫櫕閺変粙鏌￠崘顓熺【鐎殿喛濮ら敍鍐醇濠靛棛鈧鏌＄€ｎ偄濮岀紒缁樕戦幆?
- **濠电偞鍨甸悧鎰板垂閸屾稏浜滈柣銏犳啞濡椼劎绱掓径搴殭濠殿喒鏅濈划鈺咁敍濮橆厾顩柣鐐寸◤閸斿妲愰銏犵?*:
  - 闂侀潧妫楅張顒勬儊閿熺姴绫嶉柕澶堝劦閹割剟鏌涜濞诧妇绮旀搴㈠?(闂佸湱顭堥ˇ顖炲箠?闂侀潧妫楃粔鏉懨瑰Ο鍏煎仒闁靛鍎查煬顒傜磼婢跺寒鍤欏┑顔规櫇缁晠顢涘☉娆愭闂?X 闁哄鍋涢悺銊╂偉閿濆洨椹?45 闁硅壈鎻梽鍕涢崱妯诲妞ゆ帊鐒﹂埢鏃傜磼閳?
  - PC 缂備焦妫忛崹顖滄崲濮樿泛绠板ù锝堫嚃閸斺偓闁汇埄鍨遍悺鏇綖濡や焦鍎熼柨鏃囧Г閳绘梻绱掗埀顒勬偖鐎靛摜顦梺鍝勭Х椤鐣?`isMobile` 闂佺粯顭堥崺鏍焵椤戣法顦﹀┑顔规櫊楠炩偓濞达絿顭堥悗濂告煙?

### Fixes

- **闂佸搫顑呯€氼剛绱撻幘缁樼叆婵炲棙甯╅崵鏍煕韫囧濮傛繛鑲╁缁岄亶顢欑喊杈ㄐ?*:
  - 婵烇絽娴傞崰鏍?`ConsumptionDefaultTheme.tsx` 婵?`<DelayedRender>` 闂佸搫绉村ú銊╊敆閻戣棄瀚夋い蹇撴媼閸斺偓缂佺虎鍙庨崳锝呂涢幘顔艰Е闁割偅绻嶉崵銈夋煠?JSX 闁荤喐鐟辩徊楣冩倵閼恒儱绶為弶鍫亯琚?
  - 婵烇絽娴傞崰鏍?`ai/page.tsx` 婵?Button 缂傚倷绀佺€氼亜鈻庨姀鈩冨閻犳亽鍔嶉弳蹇撯槈閹惧磭孝闁宦板姂瀹曠兘濡歌閻?`asChild` prop闂佹寧绋戝瀹巗e-ui 闂佺粯顨呴悧濠傦耿閺夋鍟呴柤纰卞劮閳哄懏鈷旈柕鍫濈箳缁€?
  - 婵烇絽娴傞崰鏍?`page.tsx` 婵?Transaction 缂備緡鍋夐褔鎮楁搴ｇ＝闁告繂瀚В?`description` 闁诲孩绋掗〃鍡涱敊瀹€鈧埀顑跨祷婢瑰牓宕?TypeScript 闂佺缈伴崕鐢稿极?
  - 婵烇絽娴傞崰鏍?`notifications.ts` 婵?`actions` 闂?`vibrate` 闁诲繒鍋熼崑鐐哄焵椤戭剙鍊婚悷婵嬫倵濞戞顏勶耿椤忓懐顩?`NotificationOptions` 闂佹眹鍔岀€氼喚鎮锕€鍨傞悗锝庡枟閺呪晠鎮?
  - 婵烇絽娴傞崰鏍?`echarts-for-react` v3.x 缂備礁顦…宄扳枍?`ref` prop 闁诲簼绲绘竟鍫ュ吹瑜旈幆鍐礋椤掆偓椤ｆ煡鏌￠崼婵愭Ц婵炲瓨顭囬幃浼村Ω閵壯呪敍闂佹椿娼块崝宥嗘叏閵堝鐓?
  - 闁诲海鎳撻ˇ鎶剿?`@playwright/test` 婵炴挻纰嶇换鍡欑矉閸℃瑦鍠嗛柨婵嗘噹閺嬧偓 Playwright 闂備焦婢樼粔鍫曟偪閸℃稑绠柕澶嗘櫆閺?
- **AI 闂佸憡甯掑Λ娆撴倵娴犲鈷撻柤鍛婎問閸炰粙寮堕悜鍡楀鐎?bug 婵烇絽娴傞崰鏍?*:
  - 婵烇絽娴傞崰鏍囬弻銉ョ闁规儳纾幗鐔兼⒒閸愵厼鐓愭い鏂挎湰濞碱亪顢楁担绋跨哎闂備緡鍋呭Σ鎺旀椤愶附鏅悗娑氱仢mmary 闁诲海鎳撻張顒勫垂濮樿泛瑙﹂幖娣焺閸斺偓缂佺虎鍙庨崰娑氭崲濮椻偓瀹?insights 闂?suggestions 闂傚倸鍟抽崺鏍敊?

### Modified Files

**New Files:**

1. `web/src/features/consumption/components/AIAnalysisCard.tsx` (闂佸搫鍊瑰姗€路?AI 闂佸憡甯掑Λ娆撴倵娴犲纭€闁挎稑瀚。鑽ょ磽娴ｇ顏ф繛?
2. `docs/AI闁荤姵鍔х粻鎴濈暦閻旂厧鐤惧Δ锕€鐏濋崢鎾煕閹烘垶顥為柣搴濈矙瀹曟繈鎮㈢拠鎻掑箣閻庢鍠掗崑鎾绘煕濞嗘劕鐏﹂柡瀣暙椤?md` (闂佸搫鍊瑰姗€路閸愵煈鍤曢柍褜鍓熷畷锝夊箣閻愬鈧喗淇?
3. `src/server/src/services/doubaoAi.ts` (闂佸搫鍊瑰姗€路?`analyzeConsumption` 闂佸憡鍨兼慨銈夊汲?

**Modified Files:**
4\. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` (闂傚倸妫楀Λ娆撳垂?AI 闂佸憡甯掑Λ娆撴倵娴犲纭€闁挎稑瀚。濠氭煥濞戞ê顨欑紒槌栧弮瀹曠娀寮介宥佹櫊瀹曟繈濡歌娴煎倿鏌涢妷锕€绀冮柕鍡楀暣瀵喚鈧綆鍘界粊?
5\. `web/src/app/(dashboard)/ai/page.tsx` (缂備礁顦…宄扳枍?asChild prop闂佹寧绋戦張顒勫极婵傚憡鍋ㄩ柕濞垮劚閺傃囨煟閵忋垹鏋涢柡浣割儔閹瑧鎲撮崟顓烆棊閻?
6\. `web/src/app/(dashboard)/page.tsx` (婵烇絽娴傞崰鏍?Transaction 缂備緡鍋夐褔鎮?
7\. `web/src/lib/notifications.ts` (缂備礁顦…宄扳枍鎼淬劌绫嶉柣妯挎珪濞呭繘鏌?Notification 闂備緡鍋勯ˇ鐢稿Υ?
8\. `web/package.json` (闂佸搫鍊瑰姗€路?@playwright/test 婵炴挻纰嶇换鍡欑矉?
9\. `src/server/src/main.ts` (闂佸搫鍊瑰姗€路?`/api/ai/analyze-consumption` 闁荤姳璀﹂崹鎶藉极?

## 2.1.8 - 2026-03-19

### Features

- **AI 闁荤姴娲ゅΛ妤呭春閸℃稓宓侀柛鎰絻闁伴亶姊洪銏╂Ч閻庢哎鍔戝畷婵嬫偄鐠囨彃骞嬫繛鎴炴尭閿曪箓宕?*:
  - 闂侀潻璐熼崝宥囩矓妞嬪孩瀚荤憸鐗堝竾閳?AI 闁荤姳鐒︽刊鑺ュ緞閸曨垰绀夐柣鏃囶嚙閸樻潙鈽夐幙鍐ㄥ箺闁哄苯锕ラ弲鍫曟倷閺屻儲灏欓梺鍛婄懁閸楁娊鍩€椤掆偓椤︽壆鈧哎鍔嶇粙澶屸偓锝庡亜椤庢瑦淇婂Δ鈧Λ瀵告濠靛缁╂い鏍ㄧ☉閻︻噣鏌涢幒鎴炲鐎规洖寮剁粙澶嬪緞婢舵劕娈濋梺琛″亾妞ゆ牗鐟х敮娑欘殽閻愭彃鏆辩憸鐗堟尦閺?*闂佽　鍋撴い鏍ㄧ懅鐢盯鎮?*闂?*閻庣敻鍋婇崰鏇熺┍婵犲洤缁╂い鏍ㄧ懅鐢?*闂?*婵炲瓨绮嶉崹鍨涢娑氼浄?*闂?
  - 闂佸憡甯掑ú锕€鐣烽弻銉у祦闁告劖褰冮柊閬嶆煕濮橆剙鍤辩紒杈ㄧ箘閹风娀宕卞Δ鈧悞鑲╃磽娴ｈ灏伴柣蹇擃槺閹即濡搁妷銉ь槹婵炴潙鍚嬮懝鐐叏閳哄懎绠戝ù锝堫潐閳绘梻绱掗埀顒併偊濞嗘儳娈欏Δ鐘靛仜閸熻儻銇愰幘顔藉亱閻熸瑥瀚粻鎺楁煟閵娿儱顏╅柣鈯欏啠鏋旈柣鎰帨閸?
- **濡ょ姷鍋涢崯鑳亹閹绢喗鍋嬮柣鐔稿閺?AI 闁荤姴娲ゅΛ妤呭春閸℃ê顕辨俊顖氭惈椤?*:
  - **闂佽　鍋撴い鏍ㄧ懅鐢盯鎮?(Alipay)**: 闂佸湱绮崝鏇°亹閸ヮ剙鐤柛鈩兠悡鏇㈡煕濮橆剛肖鐞氥劑鏌曢崱鏇犲妽缂佸顥撻幏鍦喆閸曨剨绱氶梺鍝勭墢閸犲棝鍩€椤戞寧绁板璺哄瀹曪繝寮撮悙鑼偓鑽ょ磼椤愶絿婀介柍褜鍏涘鎺斿垝椤栨埃鏋庨柣鎰靛墯閻撴瑧鈧鍠栫换鍫ュ焵椤戣法鍔嶉柡浣烘嚀閳诲酣鎮欓浣哄幍闂佺绻堥崝搴も叿闂侀潧妫旈悞锕傚极椤旂晫顩锋俊顖滅帛椤ρ囨⒒閸屾稓鏆橀柍褜鍏涚粈渚€藝椤掆偓閳绘棃濡歌閹煎ジ鎮楀☉娆樻畷妞ゆ柨鐭傛俊?
  - **閻庣敻鍋婇崰鏇熺┍婵犲洤缁╂い鏍ㄧ懅鐢?(WeChat)**: 闂佸湱绮崝鏇°亹閸ヮ剙鐤柛鈩兠悡鏇㈡煕濮橆剛肖鐞氥劑鏌曢崱鏇狀槮闁哄懌鍨藉畷顐ｆ媴閻熼绱熼柡澶嗘櫈閸╁洭鍩€椤戣法鍔嶉柡渚囧枟缁傛帒螣缂佹﹩妲梻鍌氬€归悾顏堝焵椤戣法顦﹂柡鍛灲楠炲鐣￠弶鍨紟缂備礁顦版竟鍡涙偤閹寸姭鍋撳☉娆樻畷妞ゆ柨鐭傛俊?
  - **婵炲瓨绮嶉崹鍨涢娑氼浄?(UnionPay)**: 闂佸湱绮崝鏇°亹閸パ€妲堥柛顐到閻庮參鏌涘顒傂ょ悮銊╂煏閸℃洜顦︾€规洟浜跺畷锝夊礄閵堝洨顦╅柣蹇撶箲閸庡疇銇愰崸妤佹櫖濠㈣泛鐗冮崑鎾存媴闁垮鏀梺鍝勫閹歌顪冮崒鐐粹拻閺夊牆澧界粈鍕磼椤旂厧鈷旈柍銉︼耿瀹曟岸骞嶉鍛仴闂佹寧绋戦ˇ顓㈠焵椤戞寧顦锋慨姗堢畵瀵即骞橀幆閭︽蕉闂佸憡甯╅崑渚€鍩€椤戣法顦﹂柛銊ユ捣閻氶箖鎳￠妶鍥ㄦ儯闁诲孩绋掗〃鍡涱敊瀹€鍕?
  - 婵炴垶鎸鹃崕銈夋儊閳╁啰鈻旀い蹇撳閹割剟鏌涘▎鎰凡闁伙綁绠栧畷姘跺嫉閻㈤潧鏅╅梺缁樼懐閸撴盯鎮靛☉銏″剭?AI Prompt 闂佸湱绮崝妤呭Φ濮樿鲸瀚氱€广儱绻掔粈澶岀棯椤撗冩灆缂佺粯鑹捐灒闁炽儱纾埀顒傚厴閹虫鎸婃径濠冪彲缂佺虎鍙庨崰娑㈡儊閹达箑绀嗘い鎰剁磿閻熸繈鏌涘顒冨闂佽В鏅犲畷锝夊箯鐏炵瓔妲遍梺鍛婎殕濞叉牠鎯冮鍌滅焾闁靛ě鍕殸闂佸搫绉堕崢褏妲愰敓鐘叉そ閻忕偟鏅幗鐔哥箾閸繂鎮佺紓宥呮噽缁辨棃顢欑悰鈥充壕?

### Modified Files

1. `src/server/src/services/doubaoAi.ts` (Added platform-specific prompts and new field types)
2. `src/server/src/main.ts` (Updated `/api/ai/scan-receipt` to accept platform parameter)
3. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` (Added platform selector and dynamic form fields)

## 2.1.7 - 2026-03-19

### Features

- **AI 闁荤姳鐒︽刊鑺ュ緞閸曨垰绫嶉柛顐ｆ礃閿涚喖鏌熺紒妯哄鐟滄澘娲︾粙澶嬫償閿涘嫭缍岀紓浣插亾閺夌偞澹嗛崰姗€鏌?*:
  - 婵炴潙鍚嬮敋閻庨潧寮剁粋宥夊幢濡も偓椤ゅ懐绱?AI 闂佺懓鍢茬粔鍫曞矗鎼达絾濯奸柟宄拌嫰椤︹晝鈧鍠栧﹢閬嶆偘閵夆晜鍎嶉柛鏇ㄥ墯椤ρ囨⒒閸屾稒缍戦柣顐㈢Ф缁牆煤椤忎礁浜鹃柡鍕箳鐢棝鏌ㄥ☉妯肩伇娴滄盯姊婚崟鈺佲偓鎾惰姳閿熺姴纭€闁哄洨濮撮顏堟煟閵娿儱顏ラ柍褜鍓欓張顒勫极椤旂晫顩锋俊顖滅帛椤ρ囨⒒閸屾稓鏆橀柍褜鍓欑粔椋庢椤撱垹绀傞柕澶涘瘜閺€閬嶆煥濞戞鐒稿ù灏栨櫊瀹曟顓奸崱姗嗘Н闂傚倸鍊瑰娆撴偤瑜嶉埢鎾绘偨缁嬫寧顏熸繝銏ｆ硾缁夋煡鍩€?
  - 闁诲繐绻愬Λ妤冩暜椤愶箑瀚夋い鎺戝閳ь剙锕弻鍫ュΩ瑜庨悾閬嶆煏閸℃婀版俊顐熸櫊瀵敻鎮㈢划鐟颁壕鐎广儱鎳愰幗鐔哥箾閸儲娑х€规洖鐬奸惀顏囶槺閻犳劗鍠栨俊瀵镐沪閻愵剚娈版繛瀵稿У钃辨俊鐐插€垮璇睬庨钘変壕鐎广儱绻掔粈澶嬵殽閻愯泛鐓愰柡渚囧櫍楠炴劖鎷呯憴鍕ㄦ灃缂備讲鍋撻柧蹇撴贡缂堣京鐥褍鏋涢柛鈺佺灱缁棃骞掗弮鈧悾閬嶆倵閻熺増婀伴柡鍡秮瀵噣宕奸弴鐕傜吹闂佸搫绉堕崢褏妲?(`YYYY-MM-DDThh:mm:ss`)闂?
  - 闂佸搫鎳樼紓姘跺礂濮椻偓瀹曘儵宕煎┑濠傜彲 AI 闂佸湱绮崝鏇°亹閸モ晝纾奸柟鎯ь嚟娴滎垶鏌ㄥ☉娆掑缂?AI 闂佺懓鐡ㄩ崝鏇熸叏濞戙垹绠甸柟閭﹀墮缁插潡鏌涢幒鎾寸凡闁伙綆鍓熷顐も偓闈涙啞閻ｉ亶鏌￠埀顒勵敍濞嗘垵绗￠梺鍝勫暙閻栫厧螞閸ф绫嶉悹浣告贡缁€澶娒归崗闂翠孩闁搞倖绮撳畷婵嬪Ω閿旀儳顥曢悗娈垮枛缁绘劗鈧灚鐓￠悰顔炬崉閻氬绋忛梺绋跨箰閹冲酣宕虹仦鍓р枖缂備焦蓱椤ρ囨⒒閸屾粠妫庣紒棰濆弮瀹曟濡烽敂缁樻暠婵炴垶鎼╅崣蹇曟闁秴鎹堕柕濠忛檮娴犳绱撴担鍝ュ缂佺粯姘ㄩ埀顒佺⊕钃辨俊鐐插€块弫宥囦沪閼测晝鐛ラ梺鐓庮殠娴滄粍鎱ㄩ埡鍛妞ゅ繐瀚徊鍧楁煙绾版ê浜鹃梻鍌氭礌閸嬫捇鏌ｉ妸銉ヮ仾婵☆偀鏅犲鐢告偄閻撳骸濮ら梺?(`YYYY-MM-DD`) 闂佸湱绮崝鎺戭潩閿斿墽纾兼繛鍡楃箲閸婄數绱掗弮鎴濈仜闁?

### Modified Files

1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` (Refactored date/time inputs and state merging logic)

## 2.1.6 - 2026-03-19

### Features

- **AI 闁荤姳鐒︽刊鑺ュ緞閸曨垰绀夐柣鏃囶嚙閸樻挳鏌℃担鍝勵暭鐎规挷鑳剁槐鎺楀级閹存繍鍞洪梺鍦暯閺呮盯宕?*:
  - 婵犫拃鍛粶鐎规瓕椴哥粋宥夊幢濮樿鲸鍨㈤梺鍛婄墪閹虫捇锝炵€ｎ剚鍠嗗璺虹憯娓氣偓瀹曞湱鈧綆鍓氶悾?Prompt 闂佸湱绮崝妤呭Φ濮樿鲸瀚氱€广儱绻掔粈澶娒归敐鍛虎闁告瑩绠栭幊妤呭箣閹烘梻鐓犻柣鐘冲姧缁犳垵鐣烽悢鐓庣妞ゅ繐瀚粋鍫濃槈閹垮啫骞楃憸棰佺窔瀹曪綁寮介妸锔惧嚱婵犮垼鍩栨穱娲敋濞戞氨纾奸柛鈩冩磻缁诲棝鏌熼褍鐏涢柍?
  - 闂佸搫鍊瑰姗€路閸愵喖缁╂い鏍ㄧ☉閻︻噣鏌熺紒妯哄鐟滄澘娲弫?*闁荤姵鍔х粻鎴濈暦閻旂厧绀嗛柛鈩冪懆椤?* (婵? 闂佺粯鐗炵划鎯р攦閸涙潙绀傞柡鍕箲缁?闂?*婵炲濮佃摫妞ゆ垶鐟╁顒勬偡閹殿喚顢?* (婵? 闂佺琚崝蹇涘箹椤愶箑纭€?闂傚倸妫楅悥濂稿箰?闂?*闂佽　鍋撴い鏍ㄧ懅鐢盯鏌￠崘銊у煟婵?* (缂備緡鍠栨晶浠嬪灳濮椻偓瀹曟岸骞嶉鍛仴)闂?*闂佽　鍋撻柤鍛婎問閸庛儵鏌￠崒婊勫殌闁告瑥绻掔划?* (婵? \*\*缂?婵炴垶鎼╂禍娆徯?) 婵炲濮伴崕鍗烆嚕?**婵犮垼娉涘ú锕傚极?* 婵烇絽娲犻崜婵囧閸涙潙违?
  - 婵炴潙鍚嬮敋閻庨潧寮剁粋宥夊幢濡も偓椤ゅ懐绱?AI 闂佺懓鍢茬粔鍫曞矗鎼达絾濯奸柟宄拌嫰椤︹晝鈧鍠栧﹢閬嶆偘閵夆晜鍎嶉柛鏇ㄥ枔閳ь剙鍟村畷锟犲即椤忓棛顦梺琛″亾妞ゆ牗绋戦惁顕€鎮橀悙瀛樼闁靛洦宀稿畷顏勭暆閳ь剛妲愰鍛秶闁硅揪绲跨粻鐟懊瑰鍕姇闁哄苯锕ラ弲鍫曟倷閼碱剚鎲诲┑鐐茬墢閸嬶綁鍩€?
  - 闂侀潻璐熼崝瀣崲濮樻墎鍋撳☉娅厧顫濋敃鍌氬強闁规儳鐡ㄩˇ褔鏌ㄥ☉妯肩劮闁搞倖绮撳畷婵嬪Ω閵壯勵啈闁哄鏅滈悷銈囪姳閻戞﹫绱ｆ繝闈涙－濡棗菐閸ワ絽澧插ù鐓庢嚇楠炲繘宕楅悡搴☆槻闂佸憡甯￠。锕€顫濋敃鍌氬強闁圭偓娼欐导搴ㄥ级?(Description) 婵炴垶鎼╅崣蹇曟濠靛牊鍏滄い鏃囧吹缁犺棄菐閸ワ絽澧插ù鐓庢噺缁嬪顓奸崟顑挎丢婵犮垺婀圭粚鍫曞焵?

### Modified Files

1. `src/server/src/services/doubaoAi.ts` (Updated prompt and return types for more fields)
2. `src/server/src/main.ts` (Updated API response to include new fields)
3. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` (Added new fields to form and logic)

## 2.1.5 - 2026-03-19

### Fixes

- **AI 濠碘槅鍨埀顒€纾埀顒傚厴閺屽﹤顓奸崶鈺傜€柣鐐寸◤閸斿苯鐣烽悢鐓庣闁归偊鍠撴禒娑樏瑰鍐╂拱妞ゆ劕鍚嬬€电厧螣閸濆嫷鍤?*:
  - 闂佸搫绉烽～澶婄暤娓氣偓閹﹢顢曢姀鐘差嚚閻庢鍠楀ú姗€骞栭幖浣稿珘闁逞屽墴瀵剟骞嶉鐣屾殸闂侀潧妫楅懟顖炲箵閳哄懎绠查梺鍨儏婢跺秹鏌涜箛瀣姦妞わ絺鏅濈槐鏃堫敊閽樺鍚傞梺鑽ゅ仜濡瑥锕㈤崶顒€绀夐幒鎶藉焵椤掆偓缁夌兘锝炴径鎰殤闁告劘娉曠粈澶娗庨崶璺烘灍闁轰礁鍚嬬粋宥夊幢濡も偓椤ゅ懐绱掗弮鎴濈仯婵炲牊鍨佃灒闁炽儱纾埀?ID 婵犻潧顦介崑鍕疮閹捐绠甸柟閭﹀枔娴犳盯鏌?
  - 闂佸搫瀚ù鐑藉灳濮椻偓瀹曘劍绻濋崟顓炲绩闂佹椿娼块崝宥夊春濞戙垺鏅慨姗嗗亞閻熸繈姊婚崶锝呬壕闁荤喐娲戠粈浣割啅闁秴绀嗛柡鍫ユ涧閳诲繘鏌?`ep-` 閻庢鍠掗崑鎾愁熆閹増褰х紒杈ㄧ箞閹虫挾浠﹂悙顑箓鏌ｉ埡浣烘憼閻㈩垰鐡ㄥ鍕吋閸涱厾鍘梺纭呯焽閸愩劎鍘梺鍛婄懇椤ｏ箓宕鍕剺濞达絾浜芥禒娑樸€掑顒夊剮闁煎灚鍨块幊娑㈩敂閸曨倣妤呮煟閵忋垹鏋戦柛銊﹀哺閹啴宕熼鐔剁窔瀹?ID闂佹寧绋戦悧鍡涖€?`doubao-seed-2-0-mini-260215` 闂?`ep-xxx`闂佹寧绋戦ˇ顓㈠焵?
  - 闂備緡鍓欓悘婵嬪储閵堝鍋ㄩ柕濠忕畱閻撴洟鎮归崶璺虹仩闁汇劊鍨虹粙澶屸偓锝庡亜椤庢瑦淇婂Δ鈧Λ娑樷枔閹寸偟鈻旀い鎾跺枑閻庮噣鏌熺€涙澧柕鍥ф喘瀹曟ê鈻庨幇顓涙灃缂備讲鍋撻柛婵嗗閸婂磭绱掓径濠傜盎缂佽鲸鐟︽穱?`Doubao-Seed-2.0-mini`闂佹寧绋戦ˇ鍗灻洪崸妤€绠抽柕澶堝劵缂嶆牠鏌涜箛瀣姌闁?

### Modified Files

1. `web/src/app/(dashboard)/ai/page.tsx` (Updated Volcengine model ID hint)

## 2.1.4 - 2026-03-19

### Fixes

- **AI 濠碘槅鍨埀顒€纾埀顒傚厴閺屽﹤顓奸崶鈺傜€柣鐐寸◤閸斿苯鐣烽悢鐓庣闁归偊鍠撴禒娑樏归崗娴庮亞鈧?*:
  - 闂備浇妫勯悧鍡涱敋椤旇姤濯撮悹鎭掑妽閺嗗繘鏌ｈ箛锝呬簻闁告牗顨呴锝夊即閻斿憡鍎ч梺鎸庣☉閻楁劙鎯囬幘顔肩闁告粌鍟扮粈鍡樹繆椤栨せ鍋撳畷鍥ｅ亾閻戣棄绫嶉悹浣告贡缁€澶嬬箾閺夋埈鍎撻柣锔诲灡濞煎鎮欓弶鎴濐槻闂佺缈伴崕鐢稿极?`NotFoundError: 404 The model or endpoint ... does not exist` 闂佹眹鍔岀€氭澘螞閼哥绱ｆ俊顖滅《閸?
  - 闂侀潻璐熼崝宀勫Φ閸ヮ灛鐔煎灳瀹曞洠鍋撻悜鑺ョ厐鐎广儱娲ㄩ弸鍌氼渻閵堝洦鏆繛闂村嵆閹啴宕熼埞鎯т壕閻忕偟浼曟笟鈧畷?ID闂侀潧妫楃粔椋庢椤撱垹绀傞柕澶涘瘜閺€鍗炩槈閹炬剚鍎愰柡宀€鍠栧顒勫级濞嗙偓婢旀繛瀛樼矊濡繈骞忛敍鍕ㄥ亾闂堟稒璐″ù灏栧亾闁诲繒鍋涘畷顒傛閳哄懎绠奸幖杈剧稻閻ｉ亶鏌涢弬璇插闁逞屽厸閻掞箒銇愭担铏圭焼閺夌偤顣︾换鍡涙煙椤撗冪仜闁?
  - 闂佸搫瀚ù鐑藉灳濮椻偓瀹曘劍绻濋崟顓炲绩闂佹椿娼块崝宥夊春濞戙垺鏅慨姗嗗墰缁夊ジ鏌熺紒妯哄缂佸墎鏁诲畷顖炲幢閺囷紕顦伴梺璇叉禋閸嬪嫰宕犲Δ鈧锝夊即閻斿憡鍎ч梺?API 缂備焦妫忛崹鎶藉磻閿濆绀岄柛娑卞幗閸?volces 闂佸搫鍟抽鎰濠靛﹦鐤€闁告稒鐣埀顒€绻戠换鍛搭敃閵忕姵娅㈡繛?`ep-` 閻庢鍠掗崑鎾愁熆鐠轰警鍤熸繛鍫熷灴婵″浠﹂幆褍顦查梺绋跨箞閸庢娊宕?ID闂侀潧妫楃粙鍕濠靛鍤€閻忕偠鍋愰悷婵嬫煠瀹曞洦娅曟繛鎻掓健楠炴帡濡烽妷顖滅◤闂佸憡鍔栭悷锕佸暞闂佹悶鍔岄鍛村箖閺囩姷鐭撻柤鍓插厴閸?
  - 婵炴潙鍚嬮敋閻庨潧寮剁粋宥夊幢濡劒绶氬畷?ID 闁哄鐗婇幐鎼佸矗閸℃娴栭柛鈩冪懄閻?placeholder闂?

### Modified Files

1. `web/src/app/(dashboard)/ai/page.tsx` (Added endpoint ID hint for Volcengine)

## 2.1.3 - 2026-03-19

### Fixes

- **API 缂備焦妫忛崹鎷屻亹濞戙垺鐓€鐎广儱娲ㄩ弸鍌毲庨崶璺烘灈妞?*:
  - 闂佸憡鎸哥粔鍫曨敂?API 闁荤姴娲弨閬嶆儑閹殿喚鍗氭い鏍ㄨ壘缂嶆挸霉閻樻煡鍙勯柡浣革功閹风娀顢涘鍕殸 3006 婵烇絽娴傞崰妤咁敆濠婂嫮鈻旈柣鎴烇供閸斺偓缂佺虎鍙庨崰姘枔?3004
  - 闂佸憡甯楃粙鎴犵磽?`web/.env.local` 闂佸搫鍊稿ú锝呪枎閵忋倕绠板ù锝夘棑閻ｄ粙鏌涢弽銊у⒌闁告ǜ鍊楃槐?
  - 闁荤喐鐟辩徊浠嬪窗閸涱喚顩?AI 闁荤姳鐒︽刊鑺ュ緞閸曨垰绀夐柣鏃囶嚙閸樻挳鏌￠崘顏勑ｇ痪顓炲閹奉偊宕橀鍛闂佸憡鑹惧ù鐑筋敂?API 闂佹眹鍔岀€氭澘螞閼哥绱?

### Features

- **闁荤姳绀佽ぐ鐐垫嫻閻斿壊娓舵俊顖涱儥閸氬洦淇婇妞诲亾瀹曞洠鍋撻悜钘夌闁绘棁顕ч崢?*:
  - 婵犮垹鐖㈤崟鈧笟鈧畷鍦偓锝庡墻閸氣偓闂佽崵鍋涘Λ婵嬪Υ婢舵劖顥堥柕蹇婂墲閺嗘粓鏌?闁荤姳绀佽ぐ鐐垫嫻閻斿壊娓舵俊顖涱儥閸?闂備緡鍋勯ˇ鐢稿Υ?
  - 婵帗绋掗…鍫ヮ敇鐠囧弬鐔煎灳瀹曞洠鍋撻悜钘夋嵍闁靛鍎遍獮銏ゆ煟濡も偓濞诧絿绮崒鐐插強闁告挆浣风驳闂佽棄鍟换鍡樼珶?婵帗绋掗…鍫ヮ敇?闂佸搫绉村ú銊╊敆?
  - AI 闁荤姳鐒︽刊鑺ュ緞閸曨垰绫嶉柡鍫㈡暩閸犳﹢鏌涜箛鎾跺濠电偛娲幃浠嬪Ω閳哄啫绗￠柣鐘遍檷閸婃牞鍟梺?
  - 闁荤姳绀佽ぐ鐐垫嫻閻斿壊娓舵俊顖涱儥閸氬洭鏌涘顒傚嚬缂佸彉鍗冲畷锝夊冀閵婎灝銉╂煕韫囨梹鏋勭紒顕呭墮铻ｉ柍銉ョ－閳ь剛鍏橀幆鍐礋椤栨粌绗￠柣鐘遍檷閸婃鎱ㄩ幖浣哥畱?
- **AI 闁荤姴娲ゅΛ妤呭春閸℃顩查柕鍫濆闂夊秴霉閸忔祹顏嗏偓?*:
  - 婵炴垶鎸搁敃锝囨閸洖鐐婇柛鎾楀喚鏆梺鍛婅壘缁ㄨ偐绮径鎰鐎广儱鐗嗗▓浼存煕閺傝濮€闁伙附鍨垮畷姘额敃椤掑倻顦梺琛″亾闂侇偅绋栫粈瀣煛閸曨偄鈷旈柕?閻庢鍠掗崑鎾斥攽椤旂⒈鍎撻柣锔藉灴瀹?闂佸湱顭堥ˇ鐢稿箰?
  - 闂佹椿娼块崝宥夊春濞戞瑧鈻旈悹鍥ㄥ絻琚熼梺缁樺姉閹虫捇宕甸鐐珰闁糕剝顨呴悞濂告煙缁嬫妯€闁瑰憡濞婂畷銉︽償閵忕媭鏋€闁荤喐鐟辩粻鎴ｃ亹?AI 闁荤姴娲ゅΛ妤呭春?
  - 闁荤姴娲ゅΛ妤呭春閸℃ɑ浜ら柛銉㈡杹閺屻倕鈽夐幙鍐ㄥ箺婵☆垰顦辩划?loading 闂佺粯顭堥崺鏍焵?
  - 闁荤姴娲ゅΛ妤呭春閸℃瑢鍋撻悷鐗堟拱闁搞劍宀稿畷銉︽償閵忊檧鏋栫紓浣插亾闁惧繐婀卞▔銏ゆ煛鐎ｎ偆鐭嗙紒鍓佹暬閹粙濡搁敃鈧悡鏇犵棯椤撗冩灕妞ゆ挸顭烽獮瀣冀閿旇棄寮块梺琛″亾?
- **AI 闁荤姴娲ゅΛ妤呭春閸℃稒鐓ユ繛鍡樺俯閸ゆ牠鏌熺紒妯哄闁靛洦纰嶇€电厧螣閸濆嫷鍤?*:
  - 闂佽　鍋撶痪顓炴噽缁犵粯绻涢幋婵堝ⅲ闁搞劌鍊归妵鍕偨閸涘﹥銆?AI 闁荤姴娲ゅΛ妤呭春閸℃稒鍎嶉柛鏇ㄥ灡閺呪晠鎮归崶璺虹仩妞わ腹鏅犻幃?
  - 闂佸搫鐗滄禍顏堝储閵堝洨纾?API Key 闂佸搫鍟抽崺鏍亹娴ｈ櫣鐭嗛柧蹇氼潐閺嗗繘鏌熼弶鎴濇Щ濠⒀呭Т椤曘儵鍩€椤掍礁绶炵憸搴ゅ暞闂佹悶鍔岄澶愬Υ婢舵劖顥堥柕蹇嬪€曠敮宕囩磽?
  - 闂佸搫鐗滄禍鐐测枍閵夈劊浜归柡鍥╁枑椤ρ囨煙缂佹ê濮夐柕鍥ㄥ哺閹粙濡搁敃鈧悡鏇㈡煕韫囨挾澧㈡繛鍛劥閵?
  - 闂佸湱绮崝鎺旀閻㈢鍗抽柡澶嬪灥閸戠姴鈹戦崒婊勬珪婵炲牊鍨块弻銊モ枎閹烘繂娈╅梺鍝勫€稿ú锕傘€佸澶嬫櫖鐎光偓閸愶絽浜剧€光偓閸曨剙顫＄紓浣诡殙閸嬫劗鍒掑ú顏呭剭?闁荤姴娲ゅΛ妤呭春閸℃ê绶為弶鍫亯琚?

### Modified Files

1. `web/.env.local` (New file - API port configuration)
2. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` (Added manual scan button, better error handling)
3. `web/src/app/(dashboard)/ai/page.tsx` (Added set default model feature)

## 2.1.2 - 2026-03-18

### Fixes

- **婵＄偑鍊曢悥濂稿磿鐎电硶鍋撴担鍐棈闁糕晛鎳樺鍊熺疀閺囩喐娈㈤梺鍦棎濞撹绌辨繝鍥х畳妞ゆ牗绋掗埢鏃傜磼閳ь剚娼悧鍫濆伎婵?*:
  - 婵烇絽娴傞崰鏍囬崣澶岊洸?`Header` 缂傚倷绀佺€氼亜鈻庨姀銈呮嵍闁靛闄勯敓銉╂煛娴ｅ搫顣肩€规挷鐒﹂幆鏃堝箻閺夋垹浠愰柣鐘叉喘閺€閬嶆儑閺夋鍤堥柟顖涘缁犲潡鏌￠崘鈺傛瀯缂佹梹鎸抽幆鍕偓娑櫳戦埢鏃傜磼閳ь剙煤椤忓懘銈梺?"User" 闂?"闂佸憡姊绘慨鎯归崶銊р枖?.." 闂佹眹鍔岀€氭澘螞閼哥绱ｆ俊顖滅《閸?
  - 婵犫拃鍛粶濠殿喚鍋炵粋宥夊幢濡ゅ﹤娈搁梺娲绘娇閸斿秹宕哄☉銏″殧鐎瑰嫭婢樼徊鍧楁煟濡灝鐓愰柍褜鍏涢懗璺衡枔?Loading 闂佸湱绮崝妤呭Φ濮樿埖鏅悘鐐烘？缁ㄤ即鏌涘▎蹇ュ伐闁靛洦鍨归幏褰掑Ψ閿旂瓔妲梺?闂佸搫鐗滄禍鐐测枍閵夈劊浜?闂佺绻戠划宀€鑺遍幎钘夊強闁告挆浣风驳闂?
  - 婵烇絽娴傞崰鏍囬崣澶岊洸闁糕剝鍑瑰鍫曟⒑閹稿海鎳嗘い鏇樺€曢埢鏃堝Ω閳轰焦鐝甸梺鐟版惈椤﹀崬鈻?`AuthGate` 缂傚倷绀佺€氼亜鈻庨姀銈嗘櫖鐎光偓閸曨偅顏熼梺鍝勫€瑰姗€骞嗘惔銊﹀仺闁靛鍊楅崯濠囨⒑閺夋垹鎽犳繛鐓庣墛瀵板嫭娼忛銉愭洟鏌￠崘鈺佸姸闁搞倖绮撳畷婵嬪Ω閳轰焦顏熼柣搴ゎ潐閼归箖骞冨鍫熷剬閻犲洩灏欑粔鍨渻閵堝洦鏆╂繛鍫熷灴閺屽懘寮拌箛鏇炵闂?
  - 闂佸憡鑹惧ù鐑筋敂?`/api/auth/me`闂侀潧妫斿?api/auth/login` 闂?`/api/auth/register` 闂佽浜介崕杈亹濞戙垺鍋濋柡澶婄仢閸ゆ帡鏌涜箛瀣婵為棿鍗冲銊╊敍濞戞妲烽梺闈╄礋閸斿秴螞閵堝鏋侀柣妤€鐗嗙粊锕傚箹鐎涙ɑ宕岄柛妯稿€楃槐鏃堫敊閹呯暰婵犫拃鍐ㄦ殨缂佹鎳橀幆鍐礋椤栨侗鈧牜绱掗悪娆忓暙閺佸爼鎮楀☉娅虫垼鍟悗娈垮枛妤犲繒妲愬┑瀣闁归偊鍓欑壕鍐裁瑰鍐╊棤妞ゎ剙娲ㄩ惀顏堝垂椤旇偐顦伴梺鍝勭墣濡椼劎绱炵€ｎ偒娈界€光偓閳ь剙鈻撻幋锕€纾婚柕澶堝劵缁辩喖鏌熼顑胯閸?
- **闂佽皫鍡╁殭缂傚秴绉甸妵鍕偨閸涘﹥銆冮梺鐓庮殠娴滄粍鎱ㄩ埡鍌滅畽妞ゆ劑鍨圭敮鐘测槈閹捐櫕鎹ｅ┑顔芥倐楠炩偓濞达絽婀遍鍝ョ磼瀹€鍐┿€冮柟渚垮妽瀵?*:
  - 婵烇絽娴傞崰鏍囬崣澶岊洸闁糕剝顭囬妶濠氭偡濞嗗繒澧曟繛鍛浮閺佸秹宕奸悢椋庝粣闁诲酣娼уΛ娑㈡偉濠婂懐涓嶉柨娑樺閸婄偤鏌涢敐搴ｅ帨缂佽鲸宀搁幊娑㈩敂閸曨倣妤€鈹戞径妯轰簻闁告ɑ鐗滈幏褰掓晝閳ь剝銇愮捄銊㈠亾闂堟稒顥犻柣鏍ㄧ矒瀵喚鎷嬮崷顓狀槷闂佸搫鐗滄禍锝堫杺闂?React `onChange` 婵炲瓨绮岄鍕枎閵忊懇鍋撴担鍐棈闁搞伇鍥х闁归偊浜濋崬澶岀磼瀹€鈧崕銈夊汲閻旂厧绠叉い鏇炴缁€鍕煙缂佹ê濮夐柕鍥ㄦ皑閹峰綊鏁冮埀顒冦亹閸ф绠ｉ柡宓懏顫氶梺娲诲枙缁舵岸寮繝鍕珰妞ゆ牓鍊楃粈鍡涙煟閵娿儱顏俊顐ュ煐閿涙劕顫滈崼銏㈩槷闂佺粯绮庢晶妤呭极閸忚偐鈻旀繛宸簴閸嬫挸顫濆畷鍥╃暫 `FormData` 闂佺儵鏅涢悺銊ф暜閹绢喗鍤旂€瑰嫭婢樼徊?DOM 闁诲骸婀遍崑銈咁瀶椤栫偛纾圭紒妤勩€€閸?
  - 闁诲繐绻愬Λ妤勩亹閸儱绠崇憸鎴犳椤撱垹绀傞柕澶涘瘜閺€閬嶆煥濞戞ɑ缍乿alue`闂佹寧绋戦ˇ顕€骞堥妸鈺佺哗闂侇偅绋栫粈瀣⒒閸垹浠滅憸鏉跨墦楠炴帟顦寸紒顔肩У缁傛帞鎷嬮崷顓狀槱`defaultValue`闂佹寧绋戦¨鈧紒杈ㄧ箘閹叉挳鏁愰崨顓熺€繛瀛樼矊濡稑鈻嶉妷銊ｄ汗闁哄洨鍋戞禍濂告偣閹扳晛鍔氶柟顔筋殜閹晠鎳滅喊妯轰壕濞达絿鐡斿鍫曟煙閺夎法绠版い锕€顭烽弻灞筋吋閸モ晜鐎柣搴濈祷婢瑰牓宕佃濞煎繘骞橀崘鎻掓辈濠碘剝顨呭Λ婊堬綖閿曗偓閵嗘帡宕ㄩ妤佹櫈闂佹眹鍔岀€氭澘螞閼哥绱ｆ慨妤€鐗忕粈澶愭偣娴ｅ弶娅囬柡浣靛€濋獮瀣暋閺夎儻顔夋繛瀵稿О閸庢娊骞嬫搴ｇ＜妞ゆ挻绻冮崣蹇涙煛閳ь剛娑甸崨顏勪壕閻忕偟鍋撻敓銉╂⒒閸ワ絽浜鹃梻浣瑰絻缁夌敻寮绘繝鍐╃秶闁规儳鍟垮鎶芥煏?

### Modified Files

1. `web/src/components/shared/Header.tsx` (Fixed user display logic)
2. `web/src/components/shared/AuthGate.tsx` (Restored auth routing)
3. `src/server/src/main.ts` (Added memory mode support for auth APIs)
4. `web/src/app/auth/login/page.tsx` (Fixed form autofill & state clear issues)

## 2.1.1 - 2026-03-18

### Features

- **婵犮垹鐖㈤崟鈧笟鈧畷鍦偓锝庡墻閸氣偓闂佽崵鍋涘Λ婵嬪Υ婢舵劖顥堟い顐幘閻熸劗绱?*:
  - 闂佸搫鍊瑰姗€路閸愨晝鐟圭憸鎴犵博閻旂厧鍐€?婵犮垹鐖㈤崟鈧笟鈧畷?闂佸吋瀵х划灞界暦閻旂厧绀傞柕澶堝劚缂?
  - 闂佸憡甯楃粙鎴犵磽?`web/src/app/(dashboard)/ai/page.tsx` 婵＄偑鍊楅弫璇差焽?
  - 闂佽　鍋撴い鏍ㄧ☉閻︻喗绻涢敐鍫殭濠殿喚鍋ゆ俊瀛樻媴閾忚銇濋柡澶婄墛閸垶鍩€椤戣法顦﹂柛銊ョ秺濮婁粙濡堕崼婵囶唶闁诲氦顫夐惌顔剧不閻旂绶炵憸搴ゅ暞闂佹悶鍔岄澶愬储閵堝洨纾?
  - 闂佽　鍋撴い鏍ㄧ☉閻︻噣姊洪弶璺ㄐら柣?API Key闂侀潧妫旈悞锕併亹娴ｅ湱鐟规繛鎴炆戝▍宀勬煏閸℃洝鍏屾い蹇ｅ墴閹瑩鐛惔鎾充壕濞达綁绱︽笟鈧畷?ID
  - 閻庣懓鎲￠悡锟犲储閵堝洨纾?闂佸搫鐗滄禍顏堝储閵堝洨纾炬い鏂捐寧娓氣偓瀹曞湱鈧綆浜滈悗鑽ょ磽娴ｇ顏╅柣顐㈢Ф缁牓鎮€靛摜顦梺缁橆焾閸╂牠鍩€椤戞寧顦风紒鏃€鎸抽幆鍕敊閼姐倕鏅╅梺?
- **AI 闂佺懓鍢茬粔鍫曞矗鎼达絾濯奸柟宄拌嫰椤︹晠鏌涢弮鍌氭灆闁稿繑蓱缁嬪绻濋崟顐ｇ枃**:
  - 濠电偞鍨甸悧鎰板垂閸岀偛绀嗛柛鈩冾焽閳ь剝濮ら妵鍕偨閸涘﹥銆冮梺鍝勫€瑰姗€路?AI 闁荤姳鐒︽刊鑺ュ緞?闂佸湱顭堥ˇ鐢稿箰閹惰姤鏅柛顐ゅ枔閻熴倝鏌涘▎鎰电劸濠㈢懓锕﹂幏瀣箲閹伴潧鎮侀梺?
  - 闂佺粯鍔楅幊鎾诲吹椤旂⒈鍤曢柣鐔告緲濮?BottomSheet闂佹寧绋戦懟顖濄亹閸欏鈻斿┑鐘辫兌閻愬﹪鎮樿箛鎾剁闁?闁荤姵鍔х粻鎴濈暦閻斿吋鍋傜憸蹇旀櫠?
  - 闁荤姴顑呴崯浼村极?AI 闁荤喐鐟ュΛ婊堬綖鎼粹垾鐔煎灳瀹曞洠鍋撻悜鑺ュ殜妞ゅ繐瀚闁荤姴娲ゅΛ妤呭春閸℃稒鐓傞柟杈惧瘜閺夋椽鏌曢崱鏇狀槮闁哄懌鍨介獮瀣几椤愮喎浜惧ù锝堫潐閿涘鏌￠崼銏犳瀭闁逞屽厸缁€渚€宕规惔锝囧暗?
  - 闂佹椿娼块崝宥夊春濞戙垹鐭楁い鏍ㄧ煯缁ㄦ娊鎮圭€ｎ亜鏆㈤柣锔藉灴瀹曟岸顢曢妶鍥ㄥ皾闂佸搫顑嗙划宀勫箖濡や胶鈻旈柍褜鍓熼弻銊╊敊闁款垪鍋撳Ο鍏煎闁靛牆鐗滈崬鍫曟偣?
  - 闁荤姳鐒︽刊鑺ュ緞閸曨垰绠ｉ柟閭﹀墮椤娀鏌涘顒佸攭闁搞倖绮撳畷婵嬪Ω閵夈儳浠悗鐐瑰€涘銊ヮ潩閿曞倸鍙婇柟鎹愵嚃閸炲墎鎲?
- **缂傚倷鑳堕崰宥囩博鐎涙ǜ浜滈柣銏犳啞濡椼劑鏌ら崘鍙夋拱婵炲懏鐟ч幉妤呭川濞ｎ剙浠?*:
  - 缂備胶濮崑鎾绘煕?`GridDecoration` 缂傚倷绀佺€氼亜鈻庨姀銈嗘櫖閻忕偠妫勫☉褍菐閸ャ劎绠橀柡鍡忓亾闁圭厧鐡ㄥú鐔煎磿鐎涙鈻旈柍褜鍓熷鐣屾喆閸曨剟鏁滅紓?
  - 闁诲繐绻愬Λ婊堝磿濡ゅ懎鐤炬い鏍ㄧ箥濡懎螖濡や礁顥嬫禍娑㈡煠?dashboard layout 闁?
  - 闂佸湱顣介崑鎾绘煛閸繍妯€闁靛棗顦靛Λ鍐閵忋垹鐓氭繛鎴炴尨閸嬫捇鎮橀悙瀛樼闁靛洦宀稿畷鍫曞传閸曨厽姣庨柟鐓庣摠濞茬喖宕曢幘顔藉剭闁告洦鍘煎▓鐘绘煛婢规嚎鍊曢崜褰掓煛?
  - 婵炶揪缍€濞夋洟寮?`fixed` 闁诲氦顫夐惌顔剧礊閸涘瓨鏅悘鐐插⒔濞夊﹪鏌涢弬璇插婵＄偛鍊块幊妤冧沪閻愵剛褰叉繛锝呮处缁诲啰鈧灚妫冨Λ鍐ㄢ枎閹伴潧澹?

### Modified Files

1. `web/src/components/shared/Sidebar.tsx` (Added AI menu)
2. `web/src/app/(dashboard)/ai/page.tsx` (New)
3. `web/src/app/(dashboard)/layout.tsx` (Added GridDecoration)
4. `web/src/components/shared/GridDecoration.tsx` (Simplified to single line)
5. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx` (Added AI scan)
6. `src/server/src/main.ts` (Added `/api/ai/scan-receipt`)

## 2.1.0 - 2026-03-18

### Features

- **AI 闂佸搫鎳樼紓姘跺礂濡吋鍠嗛柛鈩冨嚬濞兼洟鎮规担鐟邦€滃璺哄瀹曘儲鎯旈敐搴濈磽闂佺硶鏅炲▍锝夈€侀崨顖涘闁绘劦鍓氶悡銏犫槈閹剧鍔熼柛?*:
  - **AI 閻庢鍠楀ú姗€骞栭幖浣哥闁靛鍎卞?*: 闂傚倸妫楀Λ娆撳垂?`openai` SDK闂佹寧绋戦張顒勫垂濮樿泛绀夐柣鏂款殠閸ょ娀鏌熼幁鎺戝姎闁烩姍鍥ㄥ殟闁稿本绻勯崕鏌ユ煕閺傝濡垮ù灏栧亾闁诲繒鍋涘畷顒傛閳哄懎绠奸幖鎼灣缁€鍒卭lcengine闂佹寧绋戦ˇ鍗炩枔?**Doubao-vision-pro** 闁荤喐鐟ュΛ婊堬綖鎼淬垹绶炵憸搴ゅ暞闂佹悶鍔岄鍐焵?
  - **闂佸搫鐗嗙粔瀛樻叏閻旇桨鐒婂ù锝囩摂濡?*: 闂佸憡甯楃粙鎴犵磽閹惧顩?`doubaoAi.ts` 闂佸搫鐗嗙粔瀛樻叏閻旇偤鐔煎灳閾忣偄浠撮梺鎸庣☉閼活垶鎯冨┑鍫熷晳闁告侗鍓涢崯濠囨煕閵夈儱鈷斿?Base64 闁哄鍎愰崜姘暦閺屻儱违濞戞挾顢媜mpt 闂佸搫顑呯€氫即鍩€椤掑倸袨闁逞屽厸缁傚粻ON 婵炴垶鎸堕崕鏌ユ偋閸濄儲鍠嗛柨婵嗘閳ь剝濮ょ粙澶嬫償閵婏附娅撻柣鐘叉祩閸ㄦ澘煤閺嶎厽鐒婚柍褜鍓熷鐢稿传閸曨偆鍘梺?
  - **API 闂佽浜介崕杈亹?*: 闂佸搫鍊瑰姗€路?`POST /api/ai/scan-receipt` 闂佽浜介崕杈亹濞戙垺鏅悘鐐靛亾閺嗘粓鏌熼梹鎰槮婵炲瓨锕㈤幃褔宕堕妸褋鍋婃繛鎴炴尭閿曪絿妲愰崼鏇熸櫖閻忕偛鈧喎鐝柡澶嗘櫆閺屻劌煤閺嶎偆纾奸柟鎯ь嚟閳ь剦鍨跺畷鐘诲冀閵婎灝銉╂偣閹邦垼娼愰柡鍡欏枛楠炴垿顢氶崱娆戭槱闂備礁寮堕崹鍧椔?闂佸摜鍠庡Λ娆撳春?闂佸搫鍟ㄩ崕鎻掞耿?闂佸憡甯掑Λ娑氭偖?闂佺顕х换妤呭醇椤忓牊鏅璺虹墐閸?
  - **闂傚倸鎳忛崝妤咃綖閸℃鈹嶆繝闈涙搐琚?*: 闂備焦褰冨ú銊╁极閵堝绀冮柛娑卞幘閹界姵绻涚紙鐘殿槮缂佹墎鍓濆鍕礋椤撶喎鈧?(`multer.memoryStorage`)闂佹寧绋戦懟顖毭瑰鈧幃褔宕堕妸锔筋啀闂佺顕栭崰鏍х暤閸℃稒鍋ㄩ柕濞垮劚缁侇噣鏌ｉ幒鎾跺暡缂佽鲸绻冪粙澶婎吋閸涱喛鍚梺鍝勭墕缁夊瓨鎱ㄩ悢鐓庨棷闁靛ě灞锯挅闂佺儵鏅滈…鍥汲閳ь剟鎮楀☉娅辨粓鍩€?

### Fixes

- **闂佺粯顨呴悧濠傦耿娴兼潙绫嶉柕澶堝劤缁犲爼鏌熼幁鎺戝姎鐟滅増绋掔粚閬嶎敊绾拌鲸些**:
  - 婵烇絽娴傞崰鏍囬崣澶岊洸闁糕剝顨嗛崐鐢电磼?`/api/changelog` 闁荤姴娲╅褑銇?`CHANGELOG.md` 闂佸搫鍟晶搴♀枔閹寸姵宕夋い鏍ㄦ皑缁愮偤鎮规笟濠勭？闁伙絽顭烽弻銊モ枎閹烘繂娈╅梺鎸庣☉濞煎「ath.join` 闁诲繒鍋涢崐缁橆殽閸ャ劎鈹嶆い鏃傜摂閸斺偓闂佹寧绋戦ˇ顓㈠焵?
  - 婵炴潙鍚嬮敋閻庨潧寮剁粋?Markdown 闁荤喐鐟辩徊楣冩倵閽樺娼伴柨婵嗘噹閻忕喖鎮跺☉鏍у闁规椿浜滈锝堢疀閵壯咁槷婵犫拃鍛粶鐎规瓕椴哥粋宥夊幢濡ゅ﹤娈告繝銏ｅ煐绾板秹顢欑仦绛嬪殨闊洦娲栭。濂告煛閸偄澧憸鏉挎健閺佸秹宕煎┑鎰悙 `1.8.36`闂佹寧绋戦ˇ顖炲箯娴兼潙绀夐柣妯兼暩閻撴劙鏌￠崒姘婵犫偓娴煎瓨鍎嶉柛鏇ㄥ亜閹垿鎮楃涵鍜佹綈闁逞屽劯瀹ュ洨顦紒缁㈠弾閸犳洜鎹㈠璺虹鐎广儱娴傛导鍌炴煃閵夛妇鐭婇柛娅诲嫮顩查幖瀛樓氶崑鎾斥攽鐎ｃ劉鍋撴径鎰棃闁靛骏绲介崢瀛樻叏濠垫挾鎮奸柍銉︻焽娴狅箓寮撮悩顔荤驳闂佸湱顣介崑鎾绘煛閸繍妲哥€圭顭峰畷锝夋嚑妫版繂鏁归悷婊呭濞插繘鍩€?

### Modified Files

1. `src/server/package.json` (Added `openai`)
2. `src/server/src/services/doubaoAi.ts` (New)
3. `src/server/src/main.ts` (Added `/api/ai/scan-receipt` & Fixed `/api/changelog`)
4. `docs/AI闂佸搫鎳樼紓姘跺礂濡吋濯奸柟宄拌嫰椤︹晝鈧鍠掗崑鎾绘煕濞嗘劕鐏﹂柡瀣暙椤?md` (New)

## 2.0.6 - 2026-03-18

### Features & Refactoring

- **Dashboard 闂佸搫顑堥崺鏍倵椤栫偞鐓傜€广儱妫涢埀顒夊灡缁嬪鎯旈妶搴㈢秺闁荤喐鐟ラˇ鐢杆夐幘璇插唨闁绘挸楠哥壕宕囩磼?*:
  - **缂備礁顦…宄扳枍鎼达絿纾鹃柟瀵稿仧婢规劙鏌ら崘鍙夋拱婵?*: 闁圭厧顕崰搴ｆ閺冣偓缁傚秹宕卞Δ鈧弬褔鏌￠崼顐㈠⒉妞ゎ偄顦靛顐も偓闈涙啞閻ｈ京绱撻崘鈺佺仸闁绘鎽滈惀顏堝箰鎼淬垼鎷?(`repeating-linear-gradient`)闂?
  - **闂佸搫顑勯懗鍫曟偩濠靛牏妫柟绋垮閽傚鎮锋担鍛婂殗闁?*: 闂備焦褰冪粔鐢告倵椤栨稓顩?`GridDecoration` 缂傚倷绀佺€氼亜鈻庨姀銈嗘櫖閻忕偟鍋撻弳顓炩槈閹捐銆冨┑鐐叉喘閹?`SVG` 缂傚倷鐒﹂敋闁糕晜顨婇幆?3-4 闂佸搫顦埀顒€鍟垮鏃堟煛閸繍妲瑰┑鐐诧功閹告帡鍩勯崘銊ノら梺闈涙濡炴帒顫濋敃鍌氱煑濠㈣泛顑呮俊鎶芥煟閵娿儱顏х紒妤€顦遍幉鎾礋椤愩垻浠х紓鍌欑濡盯宕垫惔銊﹀殑閻忕偟鍋撻悵顖炴煏閸℃鈧晫鎹㈤弽顐ょ煋鐎广儱顦藉Λ鎴︽煛瀹ュ懎鎮戞繛鎻掓健瀹曟繈鎮╅棃娑氱杸婵炲濯寸徊濠氬焵椤戞寧绁板ù婧垮€濋幆鍕醇椤掑倻顦繛鎴炴尰閺屻劑宕ｉ幐搴＄窞闁搞儜鍕闂佸憡鑹鹃幉锟犲礉閸涙潙违?
  - **闁荤姵鍓崘顏嶄紙闂佸搫绉堕崢褏妲愰敓鐘茬闁哄诞鍌滅煑闂?*: 闁诲繐绻嬪ù鍥夋繝鍐洸闁糕剝绋堥崑鎾愁潩鏉堛劍娈㈤梺?`formatCurrency` 闂佸憡鍨兼慨銈夊汲閻旂厧违?
  - **闂佽　鍋撻柤绋跨仛閺嗘粓鎮洪幒鎴剰濠电偛绉堕埀顑跨祷椤鎯?*: 闂侀潻璐熼崝鎴︺€呯紒妯镐簻闁汇垻鏁搁崺鐘绘偣娴ｆ祴鍋撻崘鎻掕€块梺缁橆殔濞诧綁鎳欓幋婵愬殨闁哄洨鍋涘鍐裁瑰鍐╊棞濞存粍娲熷畷鍦偓锝庡幘姝囬梺鍛婃⒐鐎笛呪偓鍨皑缁牓宕崟顒傚綔闂?
  - **濠电偞鍨甸悧鎰板垂閸岀偛纭€闁绘ê纾Σ鐑芥煟濠婂骸鐏犻柤闀愬嵆瀹?*: 闂佸搫鍊瑰姗€路閸愩劉妲堥柛顐到閻庮參鏌涢幒鎴烆棤閻炴凹鍋婂畷锟犳偐瀹曞洦啸闂佹悶鍎插畷姗€濡撮崘顔嘉?
  - **婵☆偅婢樼€氼噣鎮剧紒姗堢矗闁告洦鍣崝鍛瑰┃鍨偓鎾惰姳?*: 婵犫拃鍛粶濠殿喚鍋炵粋宥夊幢韫囧﹤浜炬繝濠傚閻ｎ垶鏌￠崘顓熺【闁归鍏橀幃楣冨Ψ閳垛晛浜炬繝闈涙搐閻﹀姊虹粵瀣灁闁?

### Modified Files

1. `web/src/components/shared/GridDecoration.tsx`
2. `web/src/lib/utils.ts`
3. `web/src/features/dashboard/components/themes/DefaultDashboard.tsx`

## 2.0.5 - 2026-03-18

### Fixes

- **缂備緡鍠楅崕鎶藉闯椤栫偛绀岀憸鐗堝笒鐢啿螖閻橆喖濡介柣蹇ュ娴狅箒绠涘☉姘拫闁硅壈鎻紓姘閹烘垟妲堥柛顐犲劜閻濈喖鏌￠崼姘壕缂傚倷绀侀悧蹇撯枔閹寸偞濮滈悹鍥紦缁ㄦ娊鎮归崫鍕毐鐟?*:
  - 闂佸憡鐟﹂崹褰掔嵁閸ヮ剙纾奸柕濞垮妽閹牆顪冮妶鍥ㄦ毈婵炲吋澹嗛埀顒佺⊕閿氱憸鏉挎川閹峰寮剁捄銊梺姹囧妼鐎氼喖锕㈤敍鍕ㄥ亾閸︻厼浠х紒顔肩У缁傛帞鎹勯幁鎺嶇矒闂備緡鍠撻崝蹇曠博閻旂儤宕夋繝鍨尵缁€鍒瀙-6`闂佹寧绋戦ˇ顖炲箯娴兼潙绀冮柛娑卞弾閸熷洭寮堕崼銏╂敯缂佹劖绋掔粙澶嬫償閵娿垹浜炬慨妯块哺閺嗗繘鏌?`CardListSkeleton` 闁诲孩绋掗敋婵犫偓椤忓牆绀勯柣妯诲絻閸撹偐绱掓潏鈺佇ユ繛鍫熷灩閹风娀顢涘顓涙灆闂佹寧绋戦惌浣烘崲閺嶎厼绀勯柣妯诲絻閸撹偐绱掓潏鈺佇ユ繛鍫熷灥椤斿繘顢欓懖鈺冿紳闂侀潻璐熼崝宥夊汲閻旂厧绠叉い鏂库偓鐕佹船闂佸搫鏈幐楣冩倶濞戙垺鈷掔紓鍫㈠Х閻繂霉閸忚壈澹樼紒鎵佹櫊瀹曪綁骞嬮敐鍕攭閻庣敻鍋婇崰姘枔閹寸儐娈楁俊顖氭惈椤斿﹪鏌熷畡閭︽Х闁告垹濞€婵?
  - 缂備緡鍠栨晶浠嬪灳濡吋瀚柛鎰ㄦ櫆濞堣霉?`Skeletons.tsx` 婵?`CardListSkeleton` 闂?`padding` 闂佸憡鐟ラ崐褰掑汲閻旂厧妞?`div` 缂傚倷鐒﹂幐濠氭倵椤栫偞鏅悘鐐测偓鐔风彲闂佸憡鑹鹃張顒勵敆閻愮鍋撻棃娑氱Ш缂傚秴鐗婄粋宥夊幢濞嗘劕鐒搁柣搴℃贡閸嬫稑鐣烽柆宥嗗亱闁搞儮鏅滈悾?`CardHeader` 闁哄鐗忛、濠勭玻濞戙垺鏅柛顐ゅ枑閺嗩厼鈽?`p-6 pb-4`闂佹寧绋戦ˇ顓㈠焵?
  - 婵炶揪绲介悘婵堟鏉堫煈娈介柕濠忓娴犳悂鎮橀悙鑼濠殿喗鎮傞獮鈧ù锝呮啞鐎氭煡鏌ｉ鍡楁瀻闁汇倕瀚板顐︽偋閸繄銈﹂梺缁橆焾閸╂牠鍩€椤戣法顦︽繝鈧?DOM 闂佺儵鏅滅敮鎺楁偤濞嗗精鐔煎灳瀹曞洠鍋撻柨瀣枖濠电姴鎳忚ぐ褔鏌?1:1 闂佺绉寸换鎺旂矆瀹€鈧惀顏囶槻閻忓浚鍣ｉ弻濠傤吋韫囨洜顦梺娲讳簽閸犳劙顢楀鍛亾閸︻厼浠ф鐐叉处缁傚秹宕卞Ο浼欓獜闂佽澹嗛崰鏇犳崲閸愩劊鈧帗骞婇柍?

### Modified Files

1. `web/src/components/shared/Skeletons.tsx`
   - 闂佸搫娲ら悺銊╁蓟婵犲啰顩?`CardListSkeleton` 闂佹眹鍔岀€氼剟宕幘顔界劸?`padding` 闂?`margin`闂?
2. `web/src/features/savings/components/themes/DefaultSavings.tsx`
   - 闁诲酣娼х紞濠勭礊閸喓顩查柛鈩冾殘閹界娀鏌涘▎鎰⒊妞ゆ柨娲╅妵?`CardHeader` 闂佹眹鍔岀€氼剟宕€涙ɑ缍囩痪顓炴噽閻涒晠鏌?

## 2.0.4 - 2026-03-18

### Fixes

- **婵烇絽娴傞崰鏍囬弻銉ョ＜闁靛鍔嶉幆鍫濐渻閵堝洦鏆繛鍏煎閳ь剚绋掗敋鐟滄澘娲ㄩ幏瀣级鐠恒劎协濠碘槅鍨埀顒冩珪閸嬨儱螖閸屾耽顏嗏偓鐟扮－閹瑰嫰宕橀幓鎺旂М**:
  - 闂佸憡鐟﹂崹褰掔嵁閸ャ劍鍎熼柡鍥ュ灩閸斻儵鏌嶉妷锔剧煀闁宦板姂瀹曪綁寮介澶婃暪閻熸粎澧楀ú宥夊焵椤掍胶绠栭懚鈺呮煕瑜庨妵鐐测槈椤忓懎绶為柛娆愵焽閸?`DelayedRender` 闂佹眹鍔岀€氼剛鈧灚顭囬幉妤呮儌閸濄儳顦柣搴濈祷婢瑰牓宕佃瀹曠兘濡搁敂鑺ヮ啀闂佺顕栭崰鏍ㄦ叏閻愬瓨濮滈柦妯侯槺閺嗘岸鏌熺€涙ê濮夐柣蹇旂洴濮婅崵鈧潧鎲＄痪顖炴煙閹帒鍔滈悷鏇炴瀵骞橀懜闈涚劯闁诲骸婀遍崑鐐哄汲閻旂厧绠叉い鏃傚帶楠炪垽鏌ｅΔ鈧ù鍕濠靛棭鍤曢柡鍥ｅ墲瀹曟娊鎮橀悙鈺佷壕闂備緡鍠撻崝鎴︽偟椤旇姤鍎熼柨鏃傚亾閻ｈ京绱掗幇顏囧厡闁告枮鍥х哗闁荤喐婢樼紞渚€鏌涘鍐╂拱缂侇喗鎸冲畷婵嬪Ω閿斿€熸嫬闂佹眹鍔岀€氼噣鎮樺☉銏♀拻闁圭虎鍠楅敍蹇涙煟濠婂棗鐒介柍?
  - 闂備焦褰冪粔鐢稿蓟婵犲啰鈻斿Δ锔筋儥閸ゅ淇婇妞诲亾閾忣偄浠村┑鐑囩秬椤曆勬叏閻愬顩?`<DelayedRender delay={200} fallback={<CardListSkeleton count={2} />}>`闂佹寧绋戦惉濂稿灳濡崵鈹嶆繝闈涙椤綁寮堕悙璺盒撴繝鈧敓鐘斥拻閻庢稒蓱缁犳帗鎱ㄥ┑鎾舵偧闁炽儲蓱椤ㄥ洤螣閸濆嫷鍞洪梺姹囧妼鐎氫即顢撻崶顒€鍑犻悹楦挎濞煎矂鏌涘Δ鍐ㄐ＄紓宥呮嚇閺佸秶浠﹂挊澶樻奖闁哄鍋犲Λ鍕偩椤掑嫬绠ｉ柟閭﹀墯閸婂灚顨ラ悙鑸电彧缂侇噯闄勫濠氬炊閵婏箒鐧侀梺鎸庣☉婵傛梻绮径鎰鐎广儱鎳愮粚鍧楁偣瑜戝〒褰掑箲閵忊剝濯撮柡鍥ュ灮瑜邦垶骞栨潏鎯ь洭闁绘稑锕畷锝呂熺化鏇炰壕?

### Modified Files

1. `web/src/features/savings/components/themes/DefaultSavings.tsx`
   - 闂佽鍘归崹褰捤囬崣澶岊洸闁糕剝顨堥幗鐘绘煕濞嗘劗澧虫い鏂挎穿閵?`Card` 缂傚倷绀佺€氼亜鈻庨姀鈥崇窞闁哄诞鍛嬀闂?`DelayedRender` 闂佸憡鐗曢幊鎾凰夋繝鍥?

## 2.0.3 - 2026-03-18

### Fixes

- **缂傚倷绀侀悧濠囨倵椤掍胶鈹嶆い鏃傗拡濡插鏌涚仦璇插闁圭⒈鍋呴妵鍕偨閸涘﹥銆冮柣銏╁灠閸燁偊鎯囬鍕闁哄诞鍐冩鈽夐幘鍐差劉缂侇喗鎸冲畷婵嬪Ω閿斿€熸嫬闂傚倸鍋嗘禍鐐虹嵁?*:
  - 闂備浇妫勯悧鍡涱敋椤斿浜滈柣銏犳啞濡椼劑鏌涢幒妤佹暠闁哄苯锕顔炬崉閻戞顦悗娈垮枛閸婂綊顢楅悙鍝勬瀬闁绘鐗嗙粊锕傛煕閺冨倸鞋婵炴潙娲ㄩ埀顑跨祷婢瑰牓宕佃瀹曟﹢宕ㄩ褍鏅ｆ俊銈呭€归敋閻庤濞婂畷锝呂熼崫鍕靛殭闂佹寧绋戞總鏃傚垝閻樼粯鍤€閻忕偟鏅粚鍧楁煕濞嗘劕鐏︾紒顔芥尦瀹曟繈濡搁敂鍊熸嫬缂備焦鍔掗懗鍫曞礉瑜斿畷娆撴惞閻熸壆鐤€闂佹寧绋戦悧鍡涱敋闁秵鍤婇柟缁㈠枔閳ь剙顦靛Λ鍐閳╁啯顔掓繛杈剧稻閹稿骞愭径鎰祦闁告劘寮撻悞濠勭磼婢跺寒鍤欓柟閿嬪閹叉挳宕卞鍏肩秿闂傚倸鍋嗘禍鐐哄磿婵犲洦鏅璺烘湰閻ｉ亶姊婚崒銈呮珝妞わ絼绮欓弫宥囦沪閼规壆顦?`DefaultSavings.tsx` 闂佹眹鍔岀€氼參鎮х€电硶鍋撻崷顓熷殌婵炲懏甯￠弻灞筋吋閸℃鍘愬┑鐑囩秬椤曆勬叏閻愬顩?`min-h-[101vh]`闂?
  - 闁荤姴娲㈤崕鏌ュ极婵傜绀夐柕濞垮劚缁讳線鏌涢幒鎴犲煟闁靛棗顦靛Λ鍐閻欌偓濞兼绱撴担鍝ュ缂佺粯宀搁幃鎯р枎韫囨洍鍋撻銏″剮閻庢稒顭囧▔濠囨煕閺傝濡芥繛纰卞灡濞碱亪濡搁埡鈧竟鏇㈡煥濞戞鐏遍柍銉ι戠粚鍗炩攽閸涱垰鏅╂繛瀵稿Т闁帮綁顢撻崶顒€鍑犻悹楦挎濞煎矂鏌涢幒鎴炲鐎规洘鐓″畷姘跺箥椤旇棄鐒搁柣搴℃贡閸嬬偤寮抽悢鐓庣妞ゆ棁濮らˇ褍顪冮妶鍥ㄦ毈婵炲吋澹嗛弫顕€宕橀妸褎鎷遍梺姹囧妼鐎氼喚鍒掓搴樺亾闂堟稒璐￠懣娆撴倵鐟欏嫮鍟茬紒杈ㄧ箞閺屽﹤顓奸崨顔尖偓銈呪槈閺傛鍎忓褏濞€閹啴宕熼鍌滄噥闂佺绻堥崕杈ㄦ叏閳哄懏鍋ㄥù鍏肩懅缁€澶愭倵閸︻厼浠ф鐐叉处缁傚秹宕卞Δ鍐╂缂傚倸娲ゅù宄扳枔閹达箑绀夐柣妯煎劋缁佹澘霉閿濆棙宕岄柣娑欑懇婵?

### Modified Files

1. `web/src/features/savings/components/themes/DefaultSavings.tsx`
   - 婵炴垶鎸鹃崕銈夋偋鐎电硶鍋撻崷顓熷殌婵?`div` 濠电儑缍€椤曆勬叏閻愬顩?`min-h-[101vh]` 缂備緡鍋呴惇褰掑焵?

## 2.0.2 - 2026-03-18

### Fixes & Improvements

- **婵烇絽娴傞崰鏍囬弻銉ョ＜闁靛鍔嶉幆鍫濐渻閵堝洦鏆繛闂村嵆瀹曟繈鎮╅悜妯笺偘闂佸搫鍟晶搴♀枔閹寸姵鍠嗛柛鈩冨嚬濞兼洟姊婚崒銈勭敖闁稿骸锕濠氼敋閳ь剟銆傛禒瀣祦闁告挷鑳堕崺鐘测槈閹绢垰浜鹃梺鍝勵儓閸╂牠鎮?*:
  - 缂備礁顦…宄扳枍鎼淬垻顩?`DefaultSavings.tsx` 婵炴垶鎼╅崢鎯р枔閹达箑绀冩俊鐐插⒔缁嬪洭鏌ゆ總澶夌盎闁伙絿鍋撶粙濠冨緞閹扮鍋撻崶顒€鍑犻悹楦挎濞煎瞼绱撴担绋款仹婵炲棎鍨介弫宥囦沪閽樺浼庨梻鍌氱墑閸ㄥ湱妲愰埡鍛闁靛鍊楅崯?`Skeletons.tsx` 婵炴垶鎼╅崢浠嬫偉閿濆绀勯柛鈩冪懄閻?`ChartSkeleton`闂侀潧妫斿妗砳stTableSkeleton` 闂?`CardListSkeleton`闂?
  - 婵炴垶鎸搁幖顐︽偤閵娾晛鐭楅柡宥庡墻閸炲墎鎲搁悧鍫熺婵炲牊鍨堕〃銉╁Ω閿斿彞妗撻柣蹇曞仜妤犲繒妲愬渚癮rdListSkeleton`闂佹寧绋戦ˇ鎵偓鍨皑閳ь剝顫夐惌顔捐姳閿熺姴绀岀憸鐗堝笒鐢娊鏌ｉ鍡楁瀻闁汇倕瀚板顐︽偋閸繄銈﹂梺姹囧妼鐎氫即濡村澶婃瀬闁哄瀵х€氭彃螖閸屾耽顏嗏偓瑙勫▕閺佸秶浠﹂崜顬儵姊婚崟鈺佲偓鎾惰姳閿熺姵鍋ㄩ弶鍫厛閸斿啴鎮楁担鍐棈闁搞伇鍥ㄥ剭闁告洦鍓涘▔濠囨煕閺傝濡芥繛纰卞灦濮婂顢旈崱妤€澧鹃梺鍛婄矊閻倿濡存径鎰棃闁靛骏绲块崕鏌ユ煕閺傝濡搁柍?
  - 闁诲孩鍐荤紓姘卞姬閸曨剛顩查柛鈩冾焽鍟搁柣鐘冲姇缂嶅﹪濡存径鎰棃闁靛繈鍨洪悾閬嶆煕閺冨倸鞋婵炴潙娲鎼佹嚋閻㈢鍋撻鐐存櫖閻忕偠澹堢粈瀣煕鐏炶濮€闁圭⒈鍋呴妵鍕偨閸涘﹥銆冮梺姹囧妼鐎氼剙霉濡吋鍋橀柕濞垮劜鐎氭煡鎮跺☉鏍у闁绘鎽滅槐鎺楁偄閸撲緡浼囬悗娈垮枟濞叉牠宕ｉ崱妯碱洸?`DelayedRender` 缂傚倷绀佺€氼亜鈻庨姀銈嗘櫖閻忕偛鈧喎鐝梻浣规緲缁夊爼鎮块崱妯碱洸闁糕剝绋掗埢澶嬫叏婵犲骸鐏犵紒鎲嬬節閹啴宕熼锝庡仺闁哄鏅濋崰搴㈡叏閻愬瓨濮滈柤鎭掑劜椤ρ囨⒒閸屾繃褰х紒?0ms, 100ms, 150ms闂佹寧绋戦¨鈧紒杈ㄧ箘閳ь剙婀遍崑鐔肩嵁閸ャ劎顩查柛鈩冾殜閹割剚绻濇繝鍐ㄧ仼婵炲牊鍨甸妴鎺楀箛椤撗冧还闂佺绻堥崕鍗炩攦閳ь剟鏌涢弬璇插闁轰線绠栧顐﹀醇閻旇桨鍑介梺?

### Modified Files

1. `web/src/features/savings/components/themes/DefaultSavings.tsx`
   - 缂備礁顦…宄扳枍鎼淬垻顩?`StatsCardSkeleton`闂侀潧妫斿妗猧stributionChartSkeleton`闂侀潧妫斿妗畂alsTableSkeleton`闂侀潧妫斿妗緍ansactionsSkeleton`闂?
   - 閻庢鍠楀ú鏍矗閸℃稓宓侀柡鍫ユ涧閳诲繘鏌ｉ～顒€濡虹紒?`@/components/shared/Skeletons` 婵炴垶鎼╅崢鎯р枔閹达附鐒绘慨妯块哺閺嗗繒绱撴担绋款仹婵炲棎鍨芥俊?
   - 闂侀潻璐熼崝瀣偓闈涚灱缁辨棃骞嬮悙闈涱棔闁汇埄鍨伴崯顐︽儑椤掍胶鈻旀い鎾寸箚缁€瀣煕閵夛箑绀冮柕鍡楀暣瀹曨亜鐣濋崘锔瑰亾閸愵喖鍐€闁稿繒鍘у鎴︽煕閺冨倸小缂?`DelayedRender` 缂傚倷绀佺€氼亜鈻庨姀銈呯闁告稑搴滅槐顕€鏌?
   - 闂佸搫娲ら悺銊╁蓟婵犲啰顩查柛鈩冾殘閹界娀鏌涘▎鎰⒊妞ゆ柨娲╅妵鎰板即閻樺磭鏆?`fallback` 婵?`<CardListSkeleton count={2} />`闂?

## 2.0.1 - 2026-03-18

### Fixes

- **婵烇絽娴傞崰鏍囬弻銉ョ闁靛鍎冲﹢鐗堢節婵犲啳澹樺┑顔规櫊瀵爼鏁嶉崟顒変槐闁哄鐗嗙紞濠偽涢懜纰夌矗?*:
  - 缂備礁顦…宄扳枍鎼淬垻顩?`globals.css` 婵?`html` 闂佺绻愰崯鎵矆瀹€鍕剭?`scrollbar-gutter: stable` 闂佺绻堥崝宀勬儑椤掑嫬鍐€鐎瑰嫭澹嗙涵鈧梺?
  - 婵烇絽娲︾换鍕汲閳ь剙霉?`.scrollbar-stable` 缂備緡鍋夊畷闈涒枔閹寸姭鍋撶憴鍕叝缂佺姷鍠栭弫宥囦沪閼测晝鐓傞梺闈╄礋閸旀垵銆掗崜浣瑰暫濞撴埃鍋撴俊鑼额嚙椤垽濮€閻樻浼岄柣蹇曞亹閸嬫捇鏌熼懜鐢靛ⅹ濠殿喒鏅犻幆鍐礋椤撶儐妫楅柣搴ゎ潐绾板秶鍒掗幘顔肩闁靛鍎洪崯鍥煕閿濆海鍘滅紒杈ㄧ懄娣?`<main>`闂佹寧绋戦ˇ顔剧箔閸屾粈娌柍褜鍓熼弻鍫ュΩ閵壯冪暔闂佹眹鍩勯悡澶屾濠靛洨顩烽幖娣€愰崑鎾朵沪閸擃灝銉╂⒒閸曗晛鈧挾鑺遍垾瓒佺绠涘鍏肩秾闂侀潻绲婚崝搴ㄦ偘閵夆晛鐭楅柨婵嗘娴犳﹢鏌涘▎蹇撳笭闁哄懓鍩栫粙澶婎吋閸涱垳鐣遍柣鐔告磻閼宠泛鈻撻幋鐘电煔闁惧繗顫夐銈嗙節婵犲啳澹樺┑顔规櫊瀵爼鍨鹃崘鑼崶婵炶揪绲界粔鏌ュ焵?

### Modified Files

1. `web/src/app/globals.css`
   - 缂備礁顦…宄扳枍鎼淬垻顩?`html` 闂備緡鍋勯ˇ鎵偓姘ュ姂瀹曟娊濡搁妶鍫濆箑闂?`scrollbar-gutter` 闂佸搫绉撮崲鑼閿熺姴违?

## 2.0.0 - 2026-03-17

### Features

- **婵☆偅婢樼€氼噣鎮鹃懡銈呭闁煎鍊楅崺鐘测槈閹炬娊鍙勬い锝傛櫇閹峰啴鏁冮埀顒劼烽崘顭戝殨?*:
  - Budget 濠碘槅鍨埀顒€纾埀顒傚厴瀵剟寮跺▎鐐緮 `scopeType` 闁诲孩绋掗〃鍡涱敊瀹€鍕櫖閻忕偟鍋撻弳婊堟煙闂€鎰樂缂佹ぞ鑳剁划鏂款吋婢舵ɑ娈ㄧ紓浣哄У閵囩偟绱為弮鍫熷仺闁靛鍎抽崢鐢告煥?
    - `GLOBAL`: 闂佺绻堥崝宀勬儑椤掍緤绱ｉ柛鏇ㄥ幘閺嗩剟鏌ㄥ☉妯煎ⅵ缂侇噮鍨抽幏瀣Χ韫囨洜顦?
    - `CATEGORY`: 闂佸憡甯掑Λ娑氭偖椤愶綇绱ｉ柛鏇ㄥ幘閺?
    - `PLATFORM`: 濡ょ姷鍋涢崯鑳亹鐎涙﹫绱ｉ柛鏇ㄥ幘閺?
  - Budget 濠碘槅鍨埀顒€纾埀顒傚厴瀵剟寮跺▎鐐緮 `platform` 闁诲孩绋掗〃鍡涱敊瀹€鍕櫖閻忕偟鍋撻弳婊堟煙闂€鎰妽閻庡灚绮撻悰顕€宕橀幓鎺楀彙闁荤姳绀佹晶浠嬫偪閸℃﹫绱ｉ柛鏇ㄥ幘閺?
  - Budget 濠碘槅鍨埀顒€纾埀顒傚厴瀵剟寮跺▎鐐緮 `alertPercent` 闁诲孩绋掗〃鍡涱敊瀹€鍕櫖闁割偁鍎崇敮娑㈡偣?80%闂佹寧绋戦¨鈧紒杈ㄧ箞瀵劑顢涘☉妯兼Х闂佺厧顨庢禍婊堟偩閻愵剛鈻曞鑸靛姦閺嗘洟鎮归埀顒勬晝閸屾侗娼撻梺?
  - 闂佸搫鍊瑰姗€路?`BudgetScope` 闂佸搫顑嗛惌顔戒繆閸モ晝灏甸悹鍥皺閳?
  - 闂佸搫娲ら悺銊╁蓟婵犲洤鑸规い鏍ㄧ懅椤忚京绱掗幘鍛存婵炵⒈鍋呯粙?`[userId, category, period, scopeType, platform]`
- **闂佸憡鑹惧ù鐑筋敂椤掑嫬绠抽柕澶堝劚缂嶆挸顭胯閸嬫稑顔?*:
  - 闂佸湱顣介弲娑㈡儓?`/api/budgets` 闂佽浜介崕杈亹濞戙垺鏅€光偓閸愵亞顔夐梺鎼炲劤閸嬨倝銆傞埡鍐笉婵°倐鍋撳ù鐘茬摠閹梹顦版惔鈱掞箓鏌熼璺ㄧ瓘缂佽鲸鐛rmal/warning/overdue闂?
  - 闂佸搫鍊瑰姗€路?`/api/budgets/alerts` 闂佽浜介崕杈亹濞戙垺鏅€光偓閸愩劎顔嗛梺鍛婄懄閻楁鏅跺澶婂珘濠㈣埖鍔﹂弳鏇㈡偣閳?闁烩剝甯掗幊蹇涘极椤曗偓閹啴宕熼锝嗘缂備胶濮甸〃鍛村垂椤忓棙鍋?
  - 闂佸搫娲ら悺銊╁蓟?`budget.ts` 闂備緡鍋呭Σ鎺旀椤愩倓娌柛宀嬪缁€澶愭煛閸屾稒绶叉い?`calculateBudgetHealth` 闂佸憡鍨兼慨銈夊汲?
- **闂佸憡鎸哥粔鍫曨敂椤掍緤绱ｉ柛鏇ㄥ幘閺嗩剛绱掗悪鍛？闁诡喖锕ラ妵鍕偨缁嬫寧顏熼梺?*:
  - 闂佽　鍋撴い鏍ㄧ☉閻︻噣姊洪銏╂Ч閻庢哎鍔嶉敍鎰板礋椤撶姵姣堟繛杈剧稻缁酣寮妶澶婃槬闁绘洖鍊荤粈鍕煕韫囧濡奸柣?闂佸憡甯掑Λ娑氭偖?濡ょ姷鍋涢崯鑳亹閹绢喗鏅?
  - 婵☆偅婢樼€氼噣鎮剧紒妯讳氦婵炴垶锚椤斿﹪鏌℃径鍡楀⒉闁绘鎸抽獮鎴︻敊闂傚瓨妯婇柟鍏兼尦椤ユ挻鎱ㄩ幖浣哥畱濞达絿顭堢紞渚€鏌ょ涵鍜佸殝缂?
    - < 80%: 缂傚倷娴囬崕缁樼珶婵犲洦鏅柛顐ゅ櫏閸斺偓闁汇埄鍨跺鑽ゆ?
    - 80% - 100%: 婵帗绋戠€氼垱绔熸繝鍥ㄦ櫖闁割偁鍎洪弳鏇㈡偣閳ь剟鏁傞懖鈺冾槴
    - <br />
      > 100%: 缂備椒鍕橀崹鍏肩珶婵犲洦鏅柛顐悼瀛濋梺琛″亾妞ゆ牓鍊楃粈?
  - 婵☆偅婢樼€氼噣鎮炬繝姘闁挎稑瀚。濠氭煛閸曨偄鈷旈柕鍥ㄥ哺閹晠鎳滅喊妯轰壕濞达絽婀遍崹鑲╃磼濞戞瑦瀚曠紒杈ㄧ懃椤垽鏁愰崨顖氱厬/婵☆偅婢樼€氼垶顢?闁烩剝甯掗幊蹇涘极椤曗偓閺?
  - 闂佽　鍋撴い鏍ㄧ☉閻︻噣鏌ゆ總澶夌盎闁伙絿鍋撶粙濠冨緞閹板灚娈ㄩ柣鐘亾闁挎洖鍊归～宀勬煕婵犲懎顥嶆い鏃€娲滅槐?
  - 闂佸搫鍊瑰姗€路閸愵亝鏆滈柛婵勫劜閺嗗繘鏌涢幒鎴烆棤閻炴凹鍋婂畷顏嗕沪娴犲灏欓梺鍛婄懁閸楁娊鍩€椤掆偓椤︽壆鈧哎鍔戝畷姘旈崟鈹惧亾?
- **Dashboard 婵☆偓绲鹃悧鐘诲Υ婢跺绱ｉ柛鏇ㄥ幘閺嗩剙螞閺夊灝顏い?*:
  - 闂佸搫鍊瑰姗€路閸愨晪绱ｉ柛鏇ㄥ幘閺嗩剙螞閺夊灝顏い鎺斿枛楠炴捇骞囬杞扮驳闂佸憡顨愮槐鏇熸櫠閺嶎厽鏅悘鐐靛亾閳绘梻绱掗埀顒勬倻濡警鏆￠梺鍝勭墕椤︾敻銆傞埡鍐╁?闁烩剝甯掗幊蹇涘极椤曗偓閹啴宕熼锝嗘缂?
  - 婵☆偅婢樼€氼垶顢楅悢鐓庣闁挎稑瀚。濠氭煛閳ь剟顢涘☉妯兼Х闁荤姴鎼悿鍥归崱娑樼濞村吋鎯岄弳鏇犵磼閻樻剚娈樻い鎾存倐閹爼宕卞☉鏍ゅ亾?
  - 闂婎偄娴傞崑鍛暤鎼淬劌绀傞柕澶堝劚缂嶆捇鏌￠崒娑欑凡妞?婵☆偅婢樼€氼噣鎮鹃懡銈囦笉闁挎稑瀚崐?闂佺绻堥崕杈亹?

### Modified Files

1. `src/server/prisma/schema.prisma`
   - Budget 濠碘槅鍨埀顒€纾埀顒傚厴瀵剟寮跺▎鐐緮 `scopeType`, `platform`, `alertPercent` 闁诲孩绋掗〃鍡涱敊?
   - 闂佸搫鍊瑰姗€路?`BudgetScope` 闂佸搫顑嗛惌顔戒繆?
   - 闂佸搫娲ら悺銊╁蓟婵犲洤鑸规い鏍ㄧ懅椤忚京绱掗幘鍛存婵?
2. `src/server/src/logic/budget.ts`
   - 闂佸搫鍊瑰姗€路?`BudgetStatus` 缂備緡鍋夐褔鎮?
   - 闂佸搫鍊瑰姗€路?`BudgetHealthResult` 缂備緡鍋夐褔鎮?
   - 闂佸搫鍊瑰姗€路?`calculateBudgetHealth` 闂佸憡鍨兼慨銈夊汲?
   - 闂佸搫娲ら悺銊╁蓟?`calculateBudgetUsage` 闂佽　鍋撴い鏍ㄧ☉閻?scopeType
3. `src/server/src/main.ts`
   - 闂佸搫娲ら悺銊╁蓟?GET `/api/budgets` 闁哄鏅滈弻銊ッ洪弽顓炵；闁靛鍎查崐锝夋煟濡灝鐓愰柍?
   - 闂佸搫娲ら悺銊╁蓟?POST `/api/budgets` 闂佽　鍋撴い鏍ㄧ☉閻︻噣鏌￠崒娑欑凡闁烩姍鍐ｆ灁?
   - 闂佸搫娲ら悺銊╁蓟?PUT `/api/budgets/:id` 闂佽　鍋撴い鏍ㄧ☉閻︻喖菐閸ヨ泛鏋熼柡?alertPercent
   - 闂佸搫鍊瑰姗€路?GET `/api/budgets/alerts` 闂佽浜介崕杈亹?
4. `web/src/app/(dashboard)/budgets/page.tsx`
   - 闁诲海鎳撻懟顖炲矗韫囨稒鐓傜€广儱妫涢埀顒夊灡閿涙劙宕熼鐘虫瘓缂備胶濯寸槐鏇㈠箖婵犲啨浜?
   - 闂佸搫鍊瑰姗€路閸愨晜濯存繝濠傛噺閺嗗繘鏌涢埡鍐ㄦ灈闁逞屽墮椤︽壆鈧?
   - 闂佸搫鍊瑰姗€路閸愨晪绱ｉ柛鏇ㄥ櫘閸斿懘姊婚崘銊у闁逞屽墲婢瑰牓顢欓弴鐘电＞?
   - 闂佺粯顭堥崺鏍焵椤戣法鍔嶉柣鏍电悼缁敻骞嗚鐎氭彃螞閻楀牏鐭庡鐟帮躬瀹曪絽螣閸濆嫷鍤?
5. `web/src/app/(dashboard)/page.tsx`
   - 闂佸搫鍊瑰姗€路?`BudgetAlert` 缂備緡鍋夐褔鎮?
   - 闂佸憡姊绘慨鎯归崶顭掔矗闁告洦鍘鹃弳顒€螞閺夊灝顏い鎺斿枛瀵偊鎮ч崼婵堛偊
   - 婵炵鍋愭繛鈧柍褜鍓氱敮鐐靛垝?Dashboard 缂傚倷绀佺€氼亜鈻?
6. `web/src/features/dashboard/components/themes/DefaultDashboard.tsx`
   - 闂佸搫鍊瑰姗€路閸愨晪绱ｉ柛鏇ㄥ幘閺嗩剙螞閺夊灝顏い鎺斿枛瀹曪繝鏁嶉崟顐毈缂傚倷绀佺€氼亜鈻?
   - 闂婎偄娴傞崑鍛暤鎼淬劌绀傞柕澶堝劚缂嶆捇鏌￠崒娑欑凡妞ゃ倕鍟敍鎰板礋椤撶姵姣堢紓浣哄缁辨洟骞?

## 1.8.36 - 2026-03-17

### Fixes

- **婵烇絽娴傞崰鏍囬弻銉ョ＜闁靛鍔嶉幆鍫濐渻閵堝洦鏆繛鍏煎閺侇噣宕橀妸褎鎷遍梺纭呭煐閻楁洘鎱?*:
  - 婵?`DefaultSavings.tsx` 婵＄偑鍊楅弫璇差焽閺夊３搴ｆ嫚閹绘帩娼辨繛?`min-h-[101vh]` 闂佸搫鐗冮崑鎾绘倶韫囨挾绠婚柣婵愬枟閹棃鏁冮崒娑扁偓娆撴煕閹烘洜鍫柍?
  - 閻庢鍠栭幖顐﹀春濡や降浜滈柣銏犳啞濡椼劌鈹戦纰卞剳缂侇喗鎹囧浼村礈瑜嬫禒娑㈡煕閵娿儱鈧煤閸噮鐓ユ慨姗嗗墮琚熼梺鍝勵槴濡插嫮妲愬┑鍫熷枂闁挎繂鎳庨弸鈧繛瀛樼矊濡煤濠婂喚鍤曢柛灞句緱閸斿嫰鏌涢幇顒佸櫣妞ゆ梹鍔欏畷婵嬫偐閻戞銈伴梺鎸庣☉濠€鐥leton -> 闂佹椿浜為崰搴ㄦ偪閸曨垰绀冮柛娑卞弾閸熷洭鏌ㄥ☉姗嗘Ц妞ゆ洟浜堕幊娑氣偓娑欘焽濞夊﹪鏌涢弬璇插婵炵⒈鍨崇划锝嗘媴閸濆嫬衼闂佸憡鍨煎▍锝夌嵁閸ヮ剚鍤€閻忕偟鏅粚鍧楁煕濞嗘劕鐏╂繛鍫熷灦閵囧嫰鎮介崨濠冦€冨┑顔缴戝娆撴煢閳哄懎纾婚煫鍥ㄦ长閳哄懎妞介悘鐐垫櫕椤忔挳鎮橀悙鈺佷壕闁荤姴鎼崯鎸庢叏閳哄懏鈷掓い鏇楀亾妞わ絼绮欐俊?

### Modified Files

1. `web/src/features/savings/components/themes/DefaultSavings.tsx`
   - 濠电儑缍€椤曆勬叏?`min-h-[101vh]` 缂備緡鍋夐褔宕哄畝鍕唨闁荤喖鍋婇崯鍥煕閿濆啫濡搁柍?

## 1.8.35 - 2026-03-17

### UI/UX Improvements

- **闁荤姳绀佹晶浠嬫偪閸℃ǜ浜滈柣銏犳啞濡椼劑鎮介姘殭闁活亶鍓氱€电厧螣閸濆嫷鍤?*:
  - 闁诲繐绻愬Λ婊堫敊閺囩姷纾炬い鏇楀亾闁靛棗顦靛Λ鍐閳傜窔瀹曠顪冮崜褏鐓犻梻鍌氱墢婵瓨绋婅箛娑樺強闁告挆浣风驳闂佽　鍋撻梺顐ｇ缁€瀣倶閻愬弶鍣搁柤鍨灴瀵即宕滆娴?
  - 闁诲骸婀遍幊鎾斥枍閹烘瀚夐柍褜鍓氬鍕槻妞ゆ梹姊归幆鏃堟晝閸屾侗鈧瑩鏌涢幒鎾存瀯閻?2xl (缂?672px)闂佹寧绋戦惌鍌涘閳哄懎绀傜€广儱鐗忕粻鏍倵绾懏顥夊┑鍌涚墵瀹曨偄顓兼径瀣垫綈闁?
  - 闂佸搫绉村ú顓€傛禒瀣そ閻忕偟浼曟笟鈧畷绋课旀担鍝勭伇婵☆偆澧楅…鍥╁垝閻戞鈻旈柍褜鍓涙禒锕傚川椤掑啫骞€闁诲酣娼х紞濠勭礊?
- **闁哄鏅濋崑鐐垫暜鐎涙ǜ浜滈柣銏犳啞濡椼劑鎮介姘殭闁活亶鍓氱€电厧螣閸濆嫷鍤?*:
  - 闁诲繐绻愬Λ婊呮崲濞戙垹绠抽柕澶嗘杺閳ь剙顦靛Λ鍐閳傜窔瀹曠顪冮崜褏鐓犻梺绋跨箞閸斿矂鎯堥崱娆屽亾绾懏顥夐悗瑙勫▕瀵劑鏌呭☉婊咁槹闁诲繒鍋涢幊宥夋嚈閹达箑鍙婇柛鎾椾椒绮?
  - 闁诲骸婀遍幊鎾斥枍閹烘瀚夐柍褜鍓氬鍕槻妞ゆ梹姊归幆鏃堟晝閸屾侗鈧瑩鏌涢幒鎾存瀯閻?2xl (缂?672px)
  - 闂佸搫绉村ú顓€傞悾灞兼勃闁告侗鍓濋崢顒勬煛閸曨偄鈷旈柕?

### Modified Files

1. `web/src/app/(dashboard)/settings/page.tsx`
   - 濠电儑缍€椤曆勬叏?`mx-auto` 缂備緡鍋夐濠冪箾閸モ斁鍋撻崷顓熷殌婵炲懏甯炴禒锕傚川椤掑啫骞€
   - 婵炴垶鎸鹃崕銈夋偉閿濆棴绱ｆ俊顖滃劋鐎氬弶淇婇妞诲亾閾忣偄浠村┑鐑囩秬椤曆勬叏?`text-center` 缂?
2. `web/src/app/(dashboard)/connections/page.tsx`
   - 濠电儑缍€椤曆勬叏?`max-w-2xl mx-auto` 缂備緡鍋勯…宄邦瀶濞差亜绀嗛悹杞拌閸熷秹骞栨潏鍓х暠闁艰崵鍠撴禒锕傚川椤掑啫骞€
   - 婵炴垶鎸鹃崕銈夋偉閿濆棴绱ｆ俊顖濐嚙濞兼垿鏌?`text-center` 缂?

## 1.8.34 - 2026-03-17

### Performance Improvements

- **婵烇絽娴傞崰鏍囬幓鎺濈叆婵﹩鍓欒闂佸憡纰嶉幃鍌炲Υ婵犲嫧鍋撴担鍐棈闁搞伇鍥ㄥ剭闁告洦浜滅槐顒勬⒑閹绘帞孝鐎规洝椴搁妵?*:
  - 闂佸憡鐟﹂崹褰掔嵁閸ャ劍濯撮悹鎭掑妽閺?`isStickyVisible` 闂佺粯顭堥崺鏍焵椤戣法顦﹂柣銈呭閹娊寮堕幐搴″妿婵＄偑鍊涢崺鏍疾閵夆晛鍑犳繝濠傚椤ρ囨煥濞戞瀚伴柛鐔插亾濠电偛妫寸槐鏇熸叏鏉堛劎顩?闂佺粯顭堥崺鏍焵椤戣法鍔嶇憸棰佺窔瀹?闂佹眹鍔岀€氼參鍩€椤戭剙妫楅崢鎾⒒閸曨厼鍘存俊鍙夋そ閺佸秴顫濇潏銊︽婵炲瓨绮屽ù閿嬫叏閹间礁绠戝ù锝呮憸閺嗘澘鈽夐弬娆炬Ц婵犫偓椤忓懏鍎熼柣鎰湴娴滐綁鏌ｉ妸銉ヮ伀闁糕晜顨堢槐鎺楀礋椤忓拋鍋?`ConsumptionDefaultTheme` 婵炴垶鎼╅崣蹇曟濠靛柊鎺曠疀閺冩垵浠瑰┑鐘诧攻閼圭偓鎱ㄩ埡鍛闁搞儯鍔屾惔濠囨煕濮橆厽鍊愰柕鍡楋躬閹晠鎳滅喊妯轰壕濞达綀顫夐ˇ褔鏌ㄥ☉妯肩劯闁稿繑蓱鐎电厧顫濋澶婃闂佸ジ鏀遍幐鎶藉Υ婢舵劖顥堟い顐幘閻熸劙鏌熺喊妯轰壕闂佸搫鐗嗛ˇ顖炈囬弻銉ョ骇闁稿本绮嶉悾?ECharts 闂佹悶鍎插畷姗€濡撮崘顔兼そ閻忕偟鍋撳▓鍫曟煙鐠団€虫灈闁割煈浜為幃浼村Ω椤垶钑夐悗娈垮枛閹碱偊宕哄Δ鍛厒鐎广儱妫欓悡鈧┑鐐存尭瀵爼鎮＄€ｎ喗鏅悘鐐垫櫕缁屽潡鏌涘▎鎰仯鐎殿喗顨婇弻灞筋吋閸ャ劎鏆犻梺鐟版惈椤︻垶骞庡璺烘そ閻忕偠妫勯獮銏狀渻閵堝牞楠忛柍?
  - 闁哄鏅滅粙鏍€侀幋鐐殿洸闁糕剝顭囩粻鎺楀箹鏉堝墽鐣甸柛锝嗘倐瀵悂宕熼崜浣虹崶闁诲繐绻愬Λ妤呭箚濞戞瑣浜滈柛鎾茶兌閹斤綁姊洪銏╂Ч闁绘牬鍣ｅ畷锝嗙節閸屾艾绶┑鐘诧攻閼圭偓鎱ㄩ埡鍛剮闁瑰瓨绻冮崕鏃堟煟濡灝鐓愰柍褜鍏涚欢銈囨濡句堪sStickyVisible`闂佹寧绋戦ˇ顖炴偩椤掑嫬绀傞柕濠忕畱閳绘洜绱掗崒婵愬敽閻犳劗鍠愮粙澶愬焵椤掍胶鈻旀い蹇撴椤忣亞绱掗弬娆惧剳婵炲牊鍨归惀顏堫敍濮橆剚鐝濋柣搴㈢⊕閸旀鍒掑鍡欘浄?`FixedStickyHeader`闂?
  - 婵炴潙鍚嬮敋閻庡灚鐓″畷銉︽償椤栨粎顦┑鐘诧攻閼圭偓鎱ㄩ埡鍛亹闁煎摜顣介崑鎾存媴閻戞鏆犻梺琛″亾闁荤喐婢樼紞渚€鎮跺鐓庝簵鐎殿喗顨婂鑺ョ附閸涘鈧瑩鏌涢幒鏇熺【婵犫偓?`FixedStickyHeader` 闂佸憡鍔曢幊姗€宕曢幘顔芥櫖閻忕偠妫勫☉褔鏌￠崼婵愭Ъ妞ゆ洘姘ㄩ埀顑跨祷婢瑰牓宕洪崨鏉戝唨闊洤娴风粣妤呮煙缁楁稑妫弨浠嬪级閻愬樊鐓奸柛锝堟閻ヮ亣顦存繛?CSS 缂備緡鍋夐褔骞冮弴銏犵闁搞儯鍔屾惔濠囨煥濞戞鐏遍柛鈺傤殘缁辨帡宕熼鍜佸仺闂佸憡绮岄懟顖毭瑰Ο鍏煎仒闁靛鍎板锕傚箹鐎涙ɑ绀€闁告ǜ鍊濋幃鍧楊敃閿濆洦纭﹂梺鍛婃煟閸斿秴煤閸ф妫橀悽顖ｅ枤缁€澶愭倵閸︻厼浠ф鐐叉处缁傚秹宕卞▎鎴濆椽闁诲海鏁婚埀顒佺〒椤愮偓绻濇繝鍐ㄧ仼婵炲牊鍨甸…銊ヮ潩椤掆偓琚熸繛杈剧稻閹瑰洭鎮板▎鎾澄?

### Modified Files

1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 闂佸湱绮崝鏇°亹?`FixedStickyHeader` 缂傚倷绀佺€氼亜鈻庨姀銈呂?
   - 缂備礁顦…宄扳枍?`ConsumptionDefaultTheme` 婵炴垶鎼╅崢鎯р枔閹存繍鐓ユ慨姗嗗墮琚熼梺鐑╂櫆閸ㄧ敻骞嗘径鎰そ?`isStickyVisible` 闂佺粯顭堥崺鏍焵椤戝潡妾烽柍?

## 1.8.33 - 2026-03-17

### Fixes & Improvements

- **閻熸粍濯介褏鑺卞畷鍥ㄥ枂闁挎繂鎳庨弸鈧梺鍛婄閹倿濡存繝鍐ㄧ窞閺夊牄鍔嶅▍蹇涙⒒閸屻倕娅嶆い?*:
  - 闂佸憡鐟﹂崹褰掔嵁閸ヮ剙鍌ㄩ柣鏂挎啞缁犳帡鏌?`sticky` 闂佸搫鍊介～澶愩€佸澶嬪仺闁告瑦顭囬懝楣冩煕濞嗘劦娈旈柛鈺佺焸瀵挳骞橀鎯ц拫闁诲繒鍋涢崐缁橆殽閸モ晝鐭堥柡宓啫寮楅梺绋跨箰閸熸壆绮堝畝鍕剭?`overflow` 闂佺懓鐡ㄩ悧鏇犵博妞嬪簼娌柍褜鍓熷浠嬪箛椤掆偓閻撴垿鏌ㄥ☉妯垮婵犫偓椤忓牆钃熼柟閭︿簽閺勫倿鏌熼姘櫣闁哥姴鏈粙澶屸偓锝庡亝閿熴儲绻涙径瀣妞ゆ帗绮庨弫顔剧矙婢跺摜鐭楁繛杈剧稻閸ゅ酣鍩€?
  - 闂備焦褰冪粔鐢告倵椤栨稓顩查柛鈩冾殕閸幯冾渻閵堝懐鍩ｉ柍褜鍓氬Σ鎺旀椤愶附鏅慨妯挎硾濞呮岸鏌ｉ～顒€濡挎繛鎻掑暣瀹曘儵顢楁担鐑樼ˇ闂佸憡鏌ｉ崝搴㈡叏閹间礁绠戝〒姘ｅ亾闁告ǜ鍊濆畷?`fixed` 闁诲氦顫夐惌顔剧礊閸涘瓨鍎嶉柛鏇ㄥ墯閻撴瑦淇婂Δ鈧悧鍕焵?
  - 闂佸搫鍊瑰姗€路閸愨晝顩查柛鈩冩礈椤忓崬鈽夐幙鍐х敖閻庢凹鍘剧划鈺冣偓锝傛櫇閼圭偓鎱ㄥ┑鎾跺埌闁绘牕鐖煎顒勫炊閵婏絺鍋撻崒姣鎷呴悜妯兼殸 `Fixed` 闁诲簼绲绘竟鍫ュ春閸涙潙鍐€闊洢鍎崇粈澶屾喐閻楀牊宕岄柕鍡楊樀濡啴濮€閻樺啿鈧鈽夐幘鎰佸剱缂侇喗鎸冲畷婵嬪Ω閵婎灝銏ゅ级?150px 闂佸搫鍟抽鎰濠靛牊瀚氶柕澶堝労閸ゃ倝鏌ら崜韫凹闁绘牬鍠楃€电厧顫濋鍕皺濠电姴锕ラ崹闈涳耿鐎涙顩烽幖娣妸閳ь剙锕弻鍫ュΩ閿旂偓瀚ч梺鍛婂灩鐏忋劎妲愬┑濞夸汗閻犲洩灏欐穱娲煙閽樺顥￠柛鏃€纰嶇粋宥夊幢濞嗗繒鍘柣搴℃贡閹虫挸鈻嶉幒鏃€鏆滈柛鎰╁妿濠€浼存煟閵娿儱顏俊鐐そ瀹曟岸鐓ù瀣壕?
  - 闂佸憡纰嶉幃鍌炲Υ婵犲嫧鍋撴担鍐棈闁糕晛鎳樺鍊熺疀閹垮啯婢旈梺鍛婃⒒婵磭鑺?"濠电偞鍨甸悧鎰板垂閸岀偛绀嗛柛鈩冾焽閳? 闂佸搫绉村ú顓€傛禒瀣櫖閻忕偟鍘ч埢蹇涙煕韫囨碍纭炬繝鈧鍕电叆婵﹩鍓欒闂佸憡鑹剧花鑲╂閻戣姤鍊块柡鍫㈡暩缁犱粙鏌熼梹鎰グ濠㈢懓娲︾缓浠嬫偩鐏炲墽鏆犳繛鎴炴尭閿曪絿绮崨鏉戞闁搞儯鍔岀徊鍦磼閳ь剟骞侀幒鍡椾壕?

### Modified Files

1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 婵犫拃鍛粶濠?`isStickyVisible` 闂佺粯顭堥崺鏍焵椤戣法顦﹂柟閿嬫緲椤劌顫濋鈧闂佺儵鏅滈崹鐢稿箚婢舵劖鐒婚柡鍕箳鐢棝鏌?
   - 婵炶揪缍€濞夋洟寮?`fixed` 闂佺绻愰崯鎵矆瀹€鈧埀顒€婀遍崑鐔肩嵁閸ヮ剚鍤婃い蹇撳閺嗘澘鈽夐弬娆炬Ц闁诡垱绋掗妵鍕嚋閸偅鐝￠梺鍝勵儐閸ゅ酣鍩€?

## 1.8.32 - 2026-03-17

### UI/UX Improvements

- **婵＄偑鍊曢悥濂稿磿鐎靛摜椹虫繛鎴旀噰閸嬫挻寰勭€ｎ剙鐒块梺鍝勭Т閸㈣尙妲愰敓鐘茬闁搞儮鏅犻悰?*:
  - 婵烇絽娴傞崰鏍囬崣澶岊洸闁糕剝顨嗙粈鍫濃槈閹捐顏犻柛鈺傤殘閳ь剙婀遍幊鎾斥枍閹烘柡鍋撳☉娅亜锕?`relative` 闁诲繒鍋熼崑鐐哄焵椤戭剙鍟拋鏌ユ煠鐎圭姵顥夋い鏇憾閹虫稓鈧潧鎲￠悾?`sticky` 闁汇埄鍨伴崯顐︽儑椤掍礁绶為弶鍫涘妽濞呭繘姊婚崒銈呮珝妞わ絼绮欐俊?
  - 婵炴潙鍚嬮敋閻庨潧寮剁粋宥夊幢濞嗘垶鎳€闂備緡鍋勯ˇ浼存偉椤曗偓瀹曘儵骞栨担纰樺亾婵犲洤绫嶉柛鎾茬劍閻ｉ亶鎮峰▎蹇旑棥妞ゎ偄閰ｅ顐﹀醇閻旇桨鍑介梺鎸庣☉閻棿绨洪梻鍌氬閸婃挾鑺遍敍鍕灊婵°倕鍟伴妴蹇涙煟閵娿儱顏╃紒銊ㄦ珪濞煎繒鎲撮崟鍨暠闂佹寧绋戦懟顖灺烽崘顔肩闁绘浜崯濠囨煛鐏炵偓鐓ラ柟铚傚嵆閹啴宕熼娴额剛鎲?(`shadow-sm`)闂?
  - 婵犫拃鍛粶濠殿喚鍋炵粋宥夊幢濡も偓閺佸爼寮堕崼銏╂敯缂?(`py-3 px-4`) 闂佸憡绮岄懟顖氥€掗崜褎鍠?(`rounded-xl`)闂佹寧绋戞總鏃€绻涢崶顒€绀傞悹铏瑰劋闊剟鏌涘顓熷€愰柕鍡楋躬瀵噣宕滄担鍦暯闁荤姍鍥ㄦ暠婵炶偐鏁诲畷鎾圭疀鎼达綆浼囨繛鎴炴惄娴滄繈宕戦幘瓒佸綊顢欓悙顒傛殸闂佺粯鐟崜娑㈡偟濞戙垹绠崇憸宥夊春濡ゅ懏顥堥柕蹇婂墲缁舵煡鏌?
  - 闂佺懓鍚嬬划搴ㄥ磼閵娿儺娴栭柛鈩冨姀閸嬫挻鎷呮搴ｆ啴闂佺懓鍢查ˇ瀹犮亹瀹ュ纭€闁哄洨濮甸悾閬嶆煠閸愬弶婀版繛鍛懇閹虫繈鎳犻崜浣诡啀闂佽桨鑳剁换婵堟嫻閻旈潪搴ㄦ晬閸曨亞绀傞梺?(`bg-gray-50/50`)闂佹寧绋戦懟顖炴嚐閻旈潪搴ｆ嫚閹绘帩娼辨繛?`hover` 闂?`focus` 闂佺粯顭堥崺鏍焵椤戞寧顦风紒妤€鎳橀幆鍐礋椤斿墽鐣哄┑鐐存尨閳ь剙鍟胯闂佹椿婢€缁鳖喚妲愬┑瀣闁归偊鍓欑壕鍐裁瑰┃鍨偓鎾惰姳閹殿喗瀚婚柕濠忕畱婵℃娊鏌?

### Modified Files

1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 缂備礁顦…宄扳枍鎼淬垹绶為柡宓懏鍕鹃柣搴℃贡閹虫挸鈻嶉幒妤佸剭?`relative` 缂備緡鍋呴惇褰掑焵?
   - 闂佸搫娲ら悺銊╁蓟?`sticky` 闁诲骸婀遍幊鎾斥枍閹烘鐭楀┑鐘插€稿鎾绘倵濞戞瑥濮夌紒顔肩У缁傛帡宕滄担鍦殸 Tailwind 缂備緡鍋夐褔骞冮弴銏犖?

## 1.8.31 - 2026-03-17

### UI/UX Improvements

- **濠电偞鍨甸悧鎰板垂閸屾稏浜滈柣銏㈡暩閹斤綁姊洪銏╂Х婵﹫闄勭粋宥夊箳濡も偓濞呫垽鏌?*:
  - 缂備礁顦…宄扳枍鎼淬垻顩查柛鈩冾殔缁€浣糕槈閹炬剚鍎撴い顐ｎ殜閹啴宕熼鈧禍鐐箾閹碱厼鏋ら柣鈽嗗亰閺屽懏寰勭€ｎ亞妯嗛梻浣虹摂閸ｎ垳妲愬渚砽oatingFilterButton`闂佹寧绋戦ˇ顓㈠焵?
  - 闁诲繐绻愬Λ婵嬪Υ婢舵劖顥堥柕蹇嬪€戦埀顒€锕弻鍫ュΩ瑜庨悾閬嶆煙閸忚偐鐭岄柛灞诲妼椤╁ジ宕遍幇銊ヤ壕濞达絾鎮傞幐顒勬煕濞嗘劕顥嬮柣鈽嗗亰閺屽懏寰勬繝鍐伅闂佸搫鍟悥鐓幬涚捄銊ч┏婵炴垟鎳囬崑鎾村緞鐎ｅ棔绶氬畷绋课旀担瑙勬瘔婵?*闂佸憡纰嶉幃鍌炲Υ?(Sticky) 闂佽桨绀侀悧濠囨倶?*闂?
  - 闂侀潻璐熼崝宀勫箖濠婂嫮鈻旈悗锝庡亞濞夊﹪鏌涢弬璇插闁靛棗顦靛Λ鍐閳╁喚妲梺鎸庣☉閻ジ鎮洪锔界劵濠㈣泛鐟旀笟鈧畷绋款渻閸撗呯崶闂佹悶鍎遍幖顐︽偩妤ｅ啫鎹堕柕濞炬杺閳ь剙顦靛Λ鍐閵堝啠鍋撴繝鍥ㄧ劸闁靛鍎寸€氭瑩鎮介銈夋婵犫偓娴ｆ劅鎺戔槈濮橆剛顔岄梺?(Backdrop Blur) 闂佺厧鍟块張顒€鈻嶅▎鎾存櫖閻忕偟鍋撻悡娆忋€掑铏《闁轰降鍊濋獮瀣倻閼恒儺鍚傞梺鍝勫暞閸庤偐鎹㈠Ο鍏煎仒閻忕偟鍋撳▓鍫曟煙鐠団€虫灓闁烩槅鍋婇弻鍛緞濞戞氨顦繛瀛樺殠閸婃挾鑺辨导鏉戝嵆闁哄鍨甸～锝夋煟閳哄喚妫庢い顐㈡喘閹虫盯顢旈崱妤€衼闂?

### Modified Files

1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 闂佸憡甯炴繛鈧繛?`FloatingFilterButton` 缂傚倷绀佺€氼亜鈻庨姀銈呯煑濠电姴鍊稿鎾绘煟閳哄喚鐒鹃柛娅诲洦鐒婚柡鍕箳鐢棝鏌?
   - 婵炴垶鎸诲浠嬪Υ婵犲洦鐒鹃柕濞у嫮鏆犵紓浣圭⊕閻╊垶鍩€椤掆偓椤︻垶顢欓幇鏉块棷闁靛绠戝鎴︽煕?`sticky top-0 z-40 bg-gray-50/95 backdrop-blur` 缂備焦绋戦ˇ浼存偋閸楃儐鍤曢煫鍥ㄦ礉椤箓鏌?

## 1.8.30 - 2026-03-17

### Performance Improvements

- **闂佽鍣崜姘辨嫚閻愮數椹虫繛鎴旀噰閸嬫挻寰勭€ｎ亞妯嗛梻浣虹摂閸犳牗绂嶉妶鍡樺劅闁哄洠瀵幒妤€绀冮柛鎰絻楠炪垹顪?*:
  - 闂佸憡鐟﹂崹褰掔嵁閸ヮ剙绠栨い鎺嶆祰閻т線鏌熺粙娆炬█闁规瓕娅曠粙濠勨偓锝庝簻椤ゅ懘鏌ｉ妸銉ヮ仼鐎规洝椴搁妵鍕箰鎼粹懣锕傛煟閵忕姴缍佺紒?`showFloatingFilter` 闂佺粯顭堥崺鏍焵椤戣儻鍏屾繛鍫熷灴瀵劑鎮烽弶璺ㄧМ闁荤喐鐟辩粻鎴ｃ亹閸屾稓顩查柛鈩兩戝▓璇测槈?`ConsumptionDefaultTheme` 缂傚倷绀佺€氼亜鈻庨姀銈嗘櫖闁割偅绻傞惁鍫曟煕濮樼厧浜濆褍绉瑰鍨緞婵犲啰顩柣鐐翠緱閻撳妲愬鑸靛剭闁告洦鍨板▍銏＄箾閹惧啿绾ч柣鎾愁儔婵?
  - 闁诲繐绻愬Λ娆撳磻閹捐秮褰掝敊閽樺妯嗛梻浣虹摂閸犳牕顕ｉ悜钘夌闁告挷绀佺瑧闂佽鍏涚欢銈囨濡句靠howFloatingFilter`, `filterOpen`闂佹寧绋戦ˇ顖炲箯閺夋鐓ユ慨姗嗗墮琚熼梺鐑╂櫆閸ㄧ敻骞嗘径鎰劵闁哄嫬绻掔敮鍡涙煙閸撲焦娅曟い顒€娲獮瀣箛椤忓棗鏅╅梺缁樼懐閸撴盯鎮靛☉銏″剭闁告洦鍋嗛幗宥囩磽娴ｇ顏ф繛?`FloatingFilterButton`闂?
  - 闂佺粯绮嶅妯猴耿椤忓嫷鐓ユ慨姗嗗墮琚熸俊鐐€楅弫璇差焽娴兼潙绫嶉悹浣告贡缁€澶愭煟濡灝鐓愰柍褜鍏涢悞锕€煤閸ф妫橀柡澶婄仢濞懷兠归崗鑹板婵犫偓?`FloatingFilterButton` 缂傚倷绀佺€氼亜鈻庨姀銈呯闁告稒娼欓崝銉╂煕濞嗘劕鐏╅柡浣规崌閺佸秶浠﹂懖鈺冩喒婵炴潙鍚嬮懝楣冨疮閳ь剛鈧鍠楀ú婵嬪箲閿濆棗绶炵€广儱妫欑徊浠嬫煕閵夛箑绀冮柕鍡楀暟缁辨帡宕熼鍜佸仺闂佹眹鍔岀€氼厼螞閵堝鏋侀柛顐犲劚濞呫垺绻涢幘鍐茬骇闁绘挸顑夐弫宥囦沪閹存帗鍞夐柟鐓庣摠濞叉繆顣鹃梺鍛婂姇閸樻牜鑺遍垾鎰佺叆婵﹩鍓欒闂佸憡顨愮换婵嬪Υ閹达附鈷掓い鏇楀亾妞わ絼绮欐俊?

### Modified Files

1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 闂佸搫鍊瑰姗€路?`FloatingFilterButton` 缂傚倷绀佺€氼亜鈻庨姀銈呂?
   - 缂備礁顦…宄扳枍?`ConsumptionDefaultTheme` 婵炴垶鎼╅崢鎯р枔閹存繍鐓ユ慨姗嗗墮琚熼梺鐑╂櫆閸ㄧ敻骞嗘径鎰そ閻忕偞鍎虫禍鐐箾閹碱厼鏋熼悗鍨矒閺岋箓顢欓悙顒傘偛闂佺绻愮壕顓熸叏閹间礁绠戝ù锝囶暯閸?

## 1.8.29 - 2026-03-17

### Performance Improvements

- **闂佽鍣崜姘辨嫚閻愮數椹虫繛鎴旀噰閸嬫挻寰勭€ｎ亞妯嗛梻浣虹摂閸犳鎲伴崱娑樿摕闁规崘灏欓崰姗€鏌?*:
  - 婵烇絽娴傞崰鏍囬崣澶岊洸闁糕剝顨嗛崐璇测槈閹炬剚鍎愮紒顔芥尦瀹曟繈濡搁敂绛嬫Н闂佽鍣崜姘辨嫚閻愮數椹虫繛鎴旀噰閸嬫挻寰勭€ｎ亞妯嗛梻浣虹摂閸犳牠宕甸銏″仢闁哄顑欓崵銈夋煠闁垮灏﹂柕鍡楊樀濡啴濮€閻樻彃鑰挎俊鐐€涘▔鏇炩枔閹达附鈷掓い鏇楀亾妞わ絼绮欐俊?
  - 婵炴垶鎸鹃崕銈囧垝閹绢喖绀夐柕濞垮€楅惃鎴澝归悩鎻掝暢婵炴彃鍟村畷銉╊敆閳ь剙鈻嶉幒鎳海鎷犻幓鎺濇奖婵?`{ passive: true }` 闂備緡鍋勯ˇ鐢稿Υ瀹ュ鏅悘鐐村劤缁插綊鏌涘Δ鈧ú锔惧垝閹绢喖绀夐柕濠忚吂閸嬫捁顦堕柛蹇旓耿婵?
  - 婵炴潙鍚嬮敋閻庨潧寮剁粋宥夊幢濡桨澹曞┑鐐存儗閸犳鈧灚绮撻弻锕傤敊閻愵剛鏆犻梺鍛婃煟閸斿酣寮ィ鍐╃劵闁哄嫬绻掔敮鍡涙煥濞戞ê顨欏┑鐐叉喘閹?`willChange: 'transform, opacity'` 闂佸湱绮崝妤呭Φ濮橆優纭呯疀濮樺吋缍岄梺闈╃祷閸斿繒鎹㈠Ο鍏煎仒鐎光偓閳ь剟鍨鹃弽銊ь浄閻犲搫鎼～锝夋⒑?(GPU 濠电偞鎸稿鍫曟偂?闂?
  - 缂傚倸鍊甸弲婵嬫偂椤撶喓顩查柛鈩兠禍鐐箾閹碱厼鏋熼悗鍨矒閺岋箓顢欓悙顒傛殸闂佹悶鍔岄崐璇裁虹捄銊х煋閻犲洦褰冭闁荤姷鍎ょ换鍕€栭崶顒佹櫖闁割偅绮庨惌?`translate-y-20` 婵炴潙鍚嬮敋閻庨潧寮剁粙?`translate-y-10`闂佹寧绋戦¨鈧紒杈ㄧ箞瀹曟瑨绠涢幘鑸电槣闂備焦褰冪粔鍓佸垝椤栨粍瀚婚柣鏃傤焾椤庢捇鏌?
  - 婵炶揪缍€濞夋洟寮?`PopoverTrigger asChild` 闂佸搫娲︾€笛冪暦閸欏顩查柛鈩兠·渚€鏌?onClick 缂傚倷鐒﹂崹鐢告偩妤ｅ啯鏅悘鐐靛帶閳诲繒绱撴担绋款仹婵炲棎鍨绘禒锕傚磼濠婂牏宕滈梺鍝勬搐椤曨參顢栨笟鈧畷?Shadcn/UI 闁荤喐鐟ョ€氼垳鈧灚鐗犻弫宥呯暆閸曨亞绱氶梺绋跨箰缁夋挳藝閹稿孩濯存繛鍡樺灦閻ｅ崬霉濠婂喚鍎庢繛鍡愬灪瀵板嫰宕熼鐔封偓鐐碘偓娈垮枓閸嬫捇姊烘惔鎾充壕闂?

### Modified Files

1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 婵炴潙鍚嬮敋閻?`handleScroll`闂佹寧绋戦張顒勫锤婵犲洤绀?`passive: true`闂?
   - 婵炴潙鍚嬮敋閻庡灚褰冮湁妞ゆ梻鍘ц闂佸湱顭堥ˇ鐢稿箰閹惰姤鍎?`className` 闂?`style`闂?

## 1.8.28 - 2026-03-17

### Fixes

- **濠电偞鍨甸悧鎰板垂閸屾稏浜滈梻鍫熺⊕缁傚牓鎮跺☉鏍у閻庨潧鏈敍鎰熼崹顕呮婵烇絽娴傞崰鏍?*:
  - 婵烇絽娴傞崰鏍囬崣澶岊洸闁糕剝顨堝▓?Recharts 闂佸搫娲︾€笛冪暦閸欏鈻?ECharts 闂佸憡鑹炬鎼侇敋闁秵鍤婇悗闈涙啞閻ｉ亶鏌涢妷锕€绀冮柕鍡楀暞缁嬪绻濆鍏兼瘜闂佽偐顢婂鎾斥槈椤忓懎绶為梺顒€绉甸敍鏍涢悧鍩辨粓鍩€?
  - 闁诲繐绻愬Λ娆愭櫠瀹ュ瀚夊璺猴攻缁傚牓鎮跺☉鏍у婵炲牊鍨堕敍鎰煥閸℃妫岀紓鍌欒兌閸犲秶绮╃€涙鈻旈柣鎴炆戦敍澶愭煕濡儤顥滄繛瀛橈耿閹啴宕熼鑺ュ暠闂佽偐顢婄亸顏呯珶婵犲洦鈷撻悹浣告贡缁€鍒?1d4ed8`, `#3b82f6`, `#60a5fa`, `#93c5fd`, `#dbeafe`闂佹寧绋戦ˇ顓㈠焵?
  - 闂佸搫娲ら悺銊╁蓟婵犲啰顩?`mockData.ts` 婵炴垶鎼╅崢鎯р枔閹寸姵鍏滄い鎺戝€诲浠嬫煟?CSS 闂佸憡鐟﹂敃銏ゅ闯閻戞鈻旈柛婵嗗閸ょ娀骞栫€涙ɑ鈷掓繛?Hex 婵☆偆澧楃划蹇旂珶婵犲洤纾圭紒妤勩€€閸?

### Modified Files

1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 闂佸搫娲ら悺銊╁蓟婵犲洤閱囬柛鈩冾殔缂嶅矂鏌″畝鍐у惈濠殿喗鎮傚畷鑸电┍閹典礁浜惧ù锝堫潐濞堢娀鏌ｉ幇顔藉殌婵炲瓨顭囩划鍨緞婵犲啰顩柣鐐寸◤閸斿骸鈻撻幋鐘冲厹妞ゆ帒鍊诲浠嬫煟椤旇崵绐旀い銈勭窔閹虫繄浠﹂崒妤€浜?
2. `web/src/features/consumption/mockData.ts`
   - 闁?`var(--color-chart-X)` 闂佸搫娲︾€笛冪暦閸欏鈻斿Δ锔藉閹差偊鏌ょ涵鍛敿濠㈢懓锕濂哥叕濞村浜?

## 1.8.27 - 2026-03-17

### Features

- **濠电偞鍨甸悧鎰板垂閸屾稏浜滈梻鍫熺⊕缁傚牓鎮跺☉鏍у缂佹墎鏅犻獮娆愭償閳ュ啿浼庨梻鍌氱墑閸ㄧ懓鐣峰畝鈧惀?*:
  - 闁诲繐绻愬Λ娆戠矓妞嬪孩瀚荤憸鐗堝竾閳ь剙顦靛Λ?(`ConsumptionDefaultTheme.tsx`) 婵炴垶鎼╅崢鎯р枔閹达箑绠ラ柍褜鍓熷?Recharts 闂佹悶鍎插畷姗€濡撮崘顔芥櫖闁革富娅檈, Bar, Line, Scatter, Composed闂佹寧绋戦ˇ顖炲矗韫囨稒鐒鹃柕濠忛檮缁傚矂鏌熺拠鈩冪窔閻?ECharts (Canvas 濠电偞鎸稿鍫曟偂?闂?
  - 闁荤喐鐟辩徊浠嬪窗閸涱喚顩查柛鈩冪懄閺嗙姴霉?Recharts (SVG) 闂佺厧鎼崐濠氬磻閿濆棙浜ら柛銉戝本鈻奸柣搴濈祷婢瑰牓宕佃閹啴宕熼妯峰亾婢舵劖顥堥柕蹇ョ磿濞夊﹪鏌涢弬璇插鐎殿喗顨婇弻灞筋吋閸涱厼鑰挎俊鐐€曞鈥澄涢懜纰夌矗婵鐗忕粈澶愭倵閸︻厼浠ф鐐叉处缁傚秹宕遍弴鐙€鍋╁┑鐘诧攻閸ㄧ懓鈻撻幋婵愮叆婵﹩鍓欒婵炶揪绲鹃幑鍥偘濞嗘挸违?
  - 婵炴垶鎸鹃崕銈嗘櫠瀹ュ瀚?ECharts 闂佹悶鍎插畷姗€濡撮崘顏佸亾閸︻厼浠ф鐐叉处缁傚秹宕卞▎鎴濈厷婵炴垶鎸撮崑鎾绘煟閵娿儱顏俊鎻掝煼楠?(200ms) resize 闂佺儵鏅滈崹鐢稿箚婢舵劖鏅€光偓閳ь剟銆呴敃鍌涘仺闁靛鍊楅崯濠傤潡濞戞瑯鐒炬い鎾愁煼閹?`autoResize`闂佹寧绋戦惌浣烘崲濡崵鈻旈柍褜鍓欓～銏ゅΨ閵堝洤鏋犻梺鍛婄墬閻楁梻鑺遍敍鍕幓婵°倐鍋撶憸鐗堢洴楠炲繘寮介妸銉肌闂佸搫鍟晶搴♀枔閹达箑绠戠憸鎴﹀礂濮椻偓婵?
  - 婵炴潙鍚嬮敋閻庨潧寮剁粋宥夊幢濡吋纭﹂梺鍛婃煟閸斿鑺遍妸锔绢浄闁告挷鐒︾壕褔鏌涘鐓庡婵炲懏甯￠弫宥囦沪閻撳簶鏋忛梺?`requestAnimationFrame` 闁哄鏅滅粙鏍€侀幋锔藉殟闁稿本绋撻妶锕€顭跨捄鍝勵伀闁诡喖锕弫宥囦沪閽樺顏￠柣蹇撶箲閸ㄥ磭鈧潧鐬奸惀顏嗘崉閵娿垺鐓犻梺鍛婎殘婵兘寮妶澶娢?

### Modified Files

1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 缂備礁顦…宄扳枍?Recharts 闂佺儵鏅濋…鍫ュ矗瑜庣粭鐔封攽婵犲嫷娲梺?
   - 婵炶揪缍€濞夋洟寮?`ReactECharts` 闂佸搫娲︾€笛冪暦閺屻儱绠ラ柍褜鍓熷鍨緞婵犲啰顩柣鐐寸◤閸斿海鍒掑鍡欘浄闂婎剚绁撮崑?
   - 闁诲骸婀遍崑鐔肩嵁閸ャ劎顩查柛鈩冪懅閸╃姴鈽夐幘顖氫壕闂?`chartsRef` 缂備胶濯寸槐鏇㈠箖婵犲洤妞?resize 闂備緡鍋呭Σ鎺旀椤愶箑违?
   - 婵炴潙鍚嬮敋閻?`handleScroll` 婵?RAF 闂佺厧鎼崐鍦矈閿曗偓铻ｉ柍銉ョ－绾偓闂?

## 1.8.26 - 2026-03-17

### Features

- **濠电偞鍨甸悧鎰板垂閸屾稏浜滈柣銏犳啞濡椼劑鏌熼顒€妫楅崢鏉懨归崗娴庮亞鈧?*:
  - 婵烇絽娴傞崰鏍囬崣澶岊洸闁糕剝锚閻濇盯鏌熷畡鎵冲亾閻旂儤顔嶉梺杞扮椤曨參鎮伴妷鈺佺煑闁挎繂鎳屾禍锝夋倶韫囨挾绠叉俊鐐插€归妵鍕偨閸涘﹥銆冩繛鎴炴尪閸庣敻宕抽幖浣哥闁跨喓濮伴埀顒佸灴閹啴宕熼娑崇椽婵☆偆澧楄彠闁?
  - 婵炴垶鎸鹃崕銈嗘櫠瀹ュ瀚?Recharts 闂佹悶鍎插畷姗€濡撮崘顏佸亾閸︻厽鍤€婵?(`ChartContainer`) 濠电儑缍€椤曆勬叏閻愬顩查柛鈩冪〒鐢盯鎮规担闈涒偓妤€鈻撻幋锔解挀闁告瑥顦～?(debounce) 婵犮垼娉涚€氼噣骞?(200ms)闂佹寧绋戦惌鍌涘閳哄懎绀傜€广儱顦介弳銉х磼鐠佸磭绐旈柛锝呮憸缁辨帒螣缁洖浜?
  - 婵?ECharts 闂佹悶鍎插畷姗€濡撮崘銊囧海鎷犻幓鎺濇奖婵炲瓨绮屽Λ娆愭櫠濠婂牆绀夐柕濞炬櫆浜涢梺?resize 闂佺儵鏅滈崹鐢稿箚婢舵劖鏅悘鐐测偓鐔风彲缂備礁鍊烽懗鍫曞极閵堝棛顩查柛鈩冭壘濞堜即鏌?resize闂佹寧绋戦張顒€螣婢舵劖濯兼俊銈呮噺椤庢牕霉閿濆懐鍑圭紒?resize 闂佸搫鍟晶搴♀枔閹寸姵濯奸柨娑樺閺嗩剟鎮归幇顔兼灆婵炴潙娲俊?
  - 婵炴潙鍚嬮敋閻庨潧寮剁粋宥夊幢濞呰　鏅犲畷婵嬪Ω瑜滄导鍌涗繆椤愮喎浜惧┑?(`isMobile`) 闂?resize 闂佺儵鏅滈崹鐢稿箚婢舵劕闂い顓熷笧缁€澶嬬箾閿濆牜鍤欏┑顔惧仦缁傚秹宕卞☉娅衡晠鏌熼懜鐢靛ⅹ妞わ腹鏅犻幃鍫曞幢閹般劌浜?

### Modified Files

1. `web/src/components/ui/chart.tsx`
   - `ChartContainer` 闂佸搫鍊瑰姗€路?`debounce` 闁诲繒鍋熼崑鐐哄焵椤戭剙绉剁粈澶婎潡濞戞瑯鐒炬い鎾愁煼瀹曟劙姊荤壕瀣槹 200ms闂?
   - 闁?`debounce` 闁诲繒鍋熼崑鐐哄焵椤戭剙鍊婚悙濠囨⒑椤愶絽绗х紒?`RechartsPrimitive.ResponsiveContainer`闂?
2. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 婵炴潙鍚嬮敋閻?`checkMobile` 闂佸憡鍨兼慨銈夊汲閻斿吋鏅悘鐐村劤濞兼垿鏌?resize 闂傚倸鍟鑸垫叏閸儱违?
   - 婵炴潙鍚嬮敋閻?ECharts 濠碘剝顨嗛崹鐢告偄閳ь剟鏌涢妷锔藉珪缂佽鲸绻勭划瀣媴閻戞ɑ娈?`autoResize`闂佹寧绋戞總鏃€绻涢崶顒佸仺闁靛鍔屽▓浼存倵鐟欏嫮鐓紒鐘靛枛閹啴宕熼娴垛晠鏌?resize 闂備緡鍋呭Σ鎺旀椤愶箑违?

## 1.8.25 - 2026-03-17

### Features

- **闂佸搫鍊瑰姗€路閸愵喖绀傞柛蹇撴噽閼规儳顪冮妶鍥ㄦ毈婵?*:
  - 婵炴挻鐨滈崱娆戝骄闂佸搫绉寸换鎴﹀蓟婵犲啯娅?闂佺绻愰崢鏍姳?闂佺绻堥崕杈亹?
  - 婵＄偑鍊曞﹢鍗灻洪悧鍫㈩浄閻庯綆鍓涢惌婵囦繆椤栨せ鍋撻搹顐淮闂佹寧绋掗懝楣冩儓瀹ュ洨鐭嗘繛宸簵閳ь剙绉归幆鍕敊閸忕厧鈧磭绱掓径搴＄劷闁逞屽厸閼宠埖鏅跺Δ鍛珘妞ゆ垿鏁崑鎾存媴閻熸嫈妤呮煛閸偄鐏￠柣鏍ュ€濆畷顏嗕沪閻撳海妲ｉ柣鐔告磻缁€浣规叏濞戙垺鍤?
  - 闂佺粯顨呴悧濠傦耿娴兼潙鍗抽悗娑櫳戦悡鈧柣鐘辩劍濠㈡绱炲鍛傜喖鍨鹃搹顐淮闂佹寧绋掗懝鎹愩亹閼碱兛娌柡鍥╁仧绾?闂佽　鍋撻柟顖滃瀹曟娊鏌ｉ妸銉ヮ伀濠⒀勵殜瀵敻顢楅埀顒€顔忔繝姘煑闁圭粯甯掗悘娆撴偠濞戣京鍘滅紒杈ㄧ箞瀵劑顢涘☉妯兼Х闂佺绻堥崝鎴﹀磿鐎甸晲娌柡鍥╁仧绾?闂佽　鍋撻柟顖滃瀹?
  - 闂佸搫娲ら悺銊╁蓟婵犲洦鍋嬮柛顐ゅ枑閹疯鲸淇婇妞诲亾閾忣偄浠撮梺鎸庣⊕绾板秴螣婢跺瞼鐭嗛柛婵嗗缁夊ジ鏌涢幘宕囆ゅ褎顨婂鐢割敄婢跺摜绠氶梺璇″弾閸ㄧ晫妲愬┑瀣闁归偊浜炴潻?GitHub Releases 婵炴垶鎸搁鍫澝归崶顒佺叄闁绘劦鍓欐径?
  - 闁荤姵鍔х槐鏇犱焊閻愮儤鍤€闁告侗鍟楁笟鈧畷绋课旂€ｎ剛鐛ラ柣蹇曞仦濞叉粓濡靛璺哄唨缂佸娉曟俊鍥┾偓娈垮枓閸嬫捇鏌涘▎鎰仴婵炶尙鍠栧濂告偄闁垮顏紓浣插亾闁诡垎鍐闁荤姵鍔х槐鏇犱焊閻愮儤鍤€?
  - 缂傚倸鍟崹褰掓偟椤栨鐔煎灳閾忣偄浠撮梺鎸庣⊕绾板秷銇愭担鍦懝?GitHub 婵炲濮甸幐鍝ヨ姳闁秴违濞撴埃鍋撴俊顐ュ煐閿涙劕螣閸濆嫬鍞ㄦ俊顐到閻楀嫰鍩€椤戣法顦﹀┑顔界洴閹虫鎸婃径宀€澶勯柣鐘辩贰閸犳岸鎮洪幋锔界叄闁绘劦鍓欐径?

### Modified Files

1. `web/src/app/(dashboard)/about/page.tsx` (闂佸搫鍊瑰妯肩磽?
   - 闂佸憡甯楃粙鎴犵磽閹捐绀傞柛蹇撴噽閼规儳顪冮妶鍥ㄦ毈婵炲吋澹嗙槐鎺楀礋椤忓拋鍋?
   - 闁诲骸婀遍崑鐔肩嵁閸ャ劎顩查柡鍌炵畺閸ゅ鏌涢弮鍌氭灆闁稿繑锚铻ｉ柍銉ㄦ珪閸?
2. `web/src/components/shared/Sidebar.tsx`
   - 濠电儑缍€椤曆勬叏?Info 闂佹悶鍎抽崑鎾绘偉閿濆洠鍋撻悽闈涘付闁?
   - 闂侀潻璐熼崝宀勵敋闁秵鍤嬫い蹇撴搐缂嶅懘鏌涘Δ浣圭；闁煎灚鍨佃彁閻犲洦褰冮～?闂佺绻愰崢鏍姳?闂佺绻堥崕杈亹?

## 1.8.24 - 2026-03-14

### Features

- **濠碘剝顨嗛崹鐢告偄閳ь剟鏌涢妷锕€鍔ょ€规洖鐬奸惀顏囶槺閻?ECharts**:
  - 婵?Recharts 闂佸搫娲︾€笛冪暦閸欏鈻?ECharts 濠碘剝顨嗛崹鐢告偄閳ь剟鏌涢妷銉モ挃缂侇喖绉电粋?
  - 闂佽　鍋撴い鏍ㄧ☉閻?4 缂備胶瀚忛崘銊р偓濠氭煛閳ь剟顢涘☉娆愵啀闂佺顕栭崰妤冪矈閿斿彞娌柡鍥╁О娴?
  - 濠电儑缍€椤曆勬叏閻愮數绠?4 缂備胶瀚忛崱妞㈡繈鏌ｉ幇顔筋仧缂佽京澧楅ˇ锕傚箛閼割剙浠忛梺鎸庣☉閻楀﹤危閿曗偓椤斿繘寮堕幋婵嗚劘闂侀潧妫旂欢姘扁偓鐟扮枃閵囨劙骞橀崘娈嬶綁鏌曢崱鏇″厡闁瑰弶妞介悰顔剧矙閹稿骸鐦堕梺鍝ュ敼閹靛啿浜惧ù锝堟濞夋洟鏌涢妷锝呯仼妞わ箑顭峰畷锟犲冀閻㈢數顦梺闈涙濞村洭宕板鈧幃褔鍩＄€ｎ剛顦╂繛瀛樼矤閸忔稓绮姀銈呯柈闁糕剝顨堥崢鏃堟煏閸℃洜鍔嶇紒鎰姉閳ь剝顫夌缓鍧楀焵椤戣法鍔嶉悗姘卞亾瀵板嫬顫濋澶嬧柤闂佹寧绋戦ˇ顓㈠焵椤戞寧顦锋慨姗堢畵閺屽懎顫濋崜褏顦╁┑鐘诧工閻°劌菐椤曗偓瀹曟瑦銈﹀▎鐐杸闂侀潧妫旂粈浣革耿閹绢喗鐓ｅù锝囶暯閸嬫挻鎷呯粙鍨稻婵炲瓨鍤庨崐褏妲愬璺何ュù锝嗩洤椤愶絿鈻曢柟鏉垮缁€鍕煟閺嵮冭埞妞ゃ劌鐭傞幊婵嬪箒閹哄棗浜惧ù锝堟閹晠鎮规笟鍥х仴妞ゎ偄顑嗛敍鎰板箣椤栨粎顦梺闈涙閼冲爼寮幘瓒佺儤瀵煎▎鎴狀槱闁荤姴娲︾换鍡涘垂閸岀偛绀傞柛娑卞幐閸嬫挾绮悰鈥充壕濞达綀顫夌€垫粓鏌ｉ～顓犵シ闁搞劌鍊块弫?
  - 闂佺厧鎼崐濠氬磻閿濆棴绱ｆ繝濠傛椤ュ繒绱撴担鍝勬瀺缂佹柨鐡ㄧ粙澶愭惞绾懘娴岄梺鑲╊攰鐏忔瑩鏌?+ 濠电儑缍€缁箖骞楅幋锔藉殞閻犲泧鍛槷缂備胶濮崑鎾寸箾闊叀鍏岀紒韬插妿閹?
  - 闁哄鏅濋崑鐐垫暜鐎靛摜妫鍓侇焾閳诲繘鏌ｉ～顒€濡界紒妤€閰ｅ畷锝呂熼崹顕呮闂佹寧绋戞總鏂款潩閿旂晫顩查柟鐑樻尰缁绢垱绻涚紙鐘哄厡闁?
- **濠电偞鍨甸悧鎰板垂閸屾稏浜滈梻鍫熺〒椤忔挳鎮橀悙鈺佷壕婵炴潙鍚嬮敋閻?*:
  - 濠碘剝顨嗛崹鐢告偄閳ь剟鏌涢妷锕€鍔ゆい鏃€鍔欏畷鎶藉Ω閳哄啫钂嬮柟鑹版彧缁犳帡鎯冮悢鐓庢瀬閺夊牆澧界粈?00px 闂?500px闂?
  - 缂備礁顦抽褎鎱ㄩ埡鍐崥妞ゆ牗渚楅弫鍕煕閳轰焦鎯堟繛瀛橈耿瀵劑顢涘☉妯兼Х濠碘槅鍨兼禍婊堝箖濠婂喚鐓ユ慨姗嗗墮琚熼梺鍝勮閸庡啿锕?
- **婵烇絽娴傞崰鏍?hydration 闁荤姭鍋撻柨鏇楀亾闁硅绻濆濠氼敋閳ь剟銆?*:
  - 闂?layout.tsx 濠电儑缍€椤曆勬叏?suppressHydrationWarning 闁诲繒鍋熼崑鐐哄焵?
- **濠碘剝顨嗛崹鐢告偄閳ь剟鏌涢妷锕€鍔ょ紒鏃堫棑娴狅箓鍩€椤掍胶鈹嶆い鏃傗拡濡?*:
  - 闁?ECharts 濠碘剝顨嗛崹鐢告偄閳ь剟鏌?`layout` 婵?`none` 闁荤姴顑呴崯顖炲汲閿濆棛鈻?`sankey`闂佹寧绋戦張顒佺椤旇棄绶炵€广儱鐗嗗▓浼存煕閺傝濡肩紒鏃堫棑娴狅箓鍩€椤掑倻涓嶆俊銈勮兌閵?
  - 婵烇絽娴傞崰鏍囬弻銉ョ倞闁诡垎鍡楃厒婵炲濮撮幊搴＄暦閻楀牄浜滈柛顐ｆ礀閸斻儵鏌涢弽褎鎯堥柣鎾寸懇閹啴宕熼娑崇椽婵☆偆澧楅敃顐ゆ濠靛洦濯撮柤鎰佸灠铻￠梺缁樺姍閳ь剚绋撻悷銏ゅ级閳哄啫浠ч柛銈呴叄楠炴劖寰勬繝搴℃櫍闂侀潻绲婚崝鎴︽偟椤旇姤鍎熼柨鏃傜摂閸斺偓闁汇埄鍨抽…鍫ュ垂鎼达絾鏆?
  - 婵烇絽娴傞崰鏍?`DelayedRender` 闁哄鏅涘ú锕€霉椤斿彞娌柛灞剧⊕瀵捇鎮规担绋库挃闁?`h-full w-full` 闁诲簼绲绘竟鍫ュ吹瑜忛埀顒佺⊕閸旀洖霉濡吋鍋?`height: 100%` 婵犮垺鍎兼ご鎼佸疾?
- **闂佺琚崝蹇涘箹椤愩埄鍤曢柛锔诲幘瀹曡泛霉濠у灝鈧挾鑺遍悧鍫⑩攳妞ゆ梻鈷堝Σ?*:
  - 婵烇絽娴傞崰鏍囬懠顒傜煋閻犲洦褰冭缂?缂佺虎鍙庨崰娑㈩敇婵犳艾绀傞柟鎯板Г閿?闂侀潻璐熼崝宀冦亹閸パ€妲堥柛顐ｇ箖閸婄敻鏌涢幇顒傂ｆい鎰偢瀹曪絽顓奸崪浣剐╅悗娈垮枤閹虫捇宕甸銏″剭闁告洦鍨遍敍鏍?
  - 婵烇絽娴傞崰鏍?BottomSheet 闁圭厧鐡ㄥú鐔煎磿閺夋埈鐓ラ柟瀛樼箓濮?闂佽　鍋撻悹铏瑰劋缁€鈧梺鍛婃煟閸斿酣寮悙顒傗枖鐎广儱鐗忕粻楣冩偣閹伴潧鐏茬紒杈ㄧ懇濮婂顢旈崱妤€澧鹃梺鎸庣☉椤﹀崬鈻撻幋锔解拻妞ゆ洍鍋撴い锝勭矙閺佸秴鐣濋埀顒傚垝閻戞鈻旈柍褜鍓熷畷婵嬪Ω瑜庨弳浼存煛閸ヮ亜鐨洪柛銈呭缁嬪鎯旈姀鐘寖闁荤偞绋戦張顒勫蓟閻斿鍤?
  - 婵炴垶鎸搁幖顐﹀矗瑜斿濠氼敇閻橆偀鍋撳Ο鍏煎闁靛牆妫涢妶锔剧磼鐎ｎ亶鍎忔い銈呭暣瀹曟繈鎮╂潏鈺婁紘濠电偛妫岄崜婵嬪焵椤戭剙瀚弶褰掓偠濞戞ɑ婀伴柣鏍电悼閹峰鏁鍓ь槷闂備緡鍓欓悘婵嬪储?`onOpenChange(false)` 婵炲瓨绮岄張顒勵敃閼测晜鍠嗛柨鏇楀亾鐟滄澘鍊垮顕€宕奸弴鐐搭仧婵犮垼娉涚粔椋庢崲濮椻偓瀹曟濡烽敂钘夌处婵烇絽娲︾换鍌炴偤閵娧勫厹妞ゆ梹顑欓崥?
  - 婵犫拃鍛粶濠殿喚鍋ゅ畷妤呭箮閼恒儻绱ㄧ紒缁㈠弾閸犳盯顢樻繝姘亹闁煎摜顣介崑鎾寸瑹閳ь剟寮ㄩ敐鍡欌枖閹肩补鈧磭鎮煎┑鐐村灥閻楀棝骞冨Δ浣衡枖闁逞屽墮閳诲酣鍩勯崘锝呬壕鐟滃秹骞忛悜鑺ュ仼闁靛闄勭花姘舵煕閹烘洦鍟囩紒杈ㄧ箓閳藉宕奸妷锔惧綉婵炲瓨绮岄鍕枎閵忊剝浜ら柣鎰絻缁叉椽鎮楁担鍐棈闁搞伇鍥ㄥ剭闁告洦鍋勯弲娆愮箾閸″繆鍋撶€圭姴澧剧紓?
- **婵＄偑鍊楅弫璇差焽娴兼潙绀嗛柛銉ｅ妼鎼村﹪鏌熼顒€妫楅崢鏉懨归崗娴庮亞鈧?*:
  - 闁诲簼绲婚～澶愬焵椤掍焦顫楁い顐㈢Ч婵″瓨鎷呴悾灞诲亽婵炲瓨绫傛担鎻掍壕濞达絽婀卞暩闁荤姵鍔曠粻宥夊焵椤戣法顦﹂柛瀣Ч閹锋垿宕熼埞鎯т壕濞达綀濮ゅ畵宥嗙箾閸℃稓鐣洪柕鍡楊樀濡啴濮€閵忥紕鏆犻梺鍝勭Ф椤牏缂撴ィ鍐ㄧ倞闁硅鍔戦埀顒€鍟伴幉鎾幢濡や胶顩梺鎸庣☉閻楀棝銆?`ConsumptionDefaultTheme`闂佹寧绋戦ˇ顖滆姳閺屻儲鍋ㄩ柕濞垮€楅崯?`next/dynamic` 閻庢鍠栭崐褰掝敆閻愬搫绀夐柣妯煎劋缁?(ssr: false)闂?
  - 閻熸粍濯介褏鑺卞畷鍥ㄥ枂闁挎繂鎳庨弸鈧繛瀛樼矊濡繈鍩€椤掍椒浜㈢紒璇插暞缁楃喕顦剁紒鏃傚枛瀵€熺疀閹惧磭鈧ジ鏌熼獮鍨伈闁靛棗顦靛Λ鍐閳╁喚妲梺鎸庣☉閻楀棝骞愰妸鈺佺闁肩鐏氱瑧闂佸憡甯掑ú锕€鐣烽弻銉ョ闁绘鐗忓暩闁荤姵鍔曠紞濠囧Υ婢舵劖顥堥柕蹇婂墲椤ρ囨煥濞戞﹩妲洪柡浣介哺缁傚秵鎯旈埄鍐ㄢ偓杈ㄦ叏濠靛嫬鍔氬┑顔惧仦濞碱亪鎸婃径鍫滄捣闂備焦褰冪换鎰瑰Ο鍏煎仒闁靛ě鍛厑婵炲濮鹃鎰濮楊敥harts/Recharts闂佹寧绋戦ˇ顖烆敋闁秵鍤婇悗闈涙啞閻ｅ崬鈽夐幘鐟板惞闁搞倕娴风划娆戔偓锝庡枟閳诲骸鈹戞径灞戒粶闁归澧楅妵鍕偨閸涘﹥銆冮梺鍛婎殣缁绘繈濡撮幋锔解拻妞ゆ洍鍋撴い锝勭矙婵?
  - 闁诲骸婀遍崑鐔肩嵁閸ャ劎顩查柛鈩冪◤閳ь剙顦靛Λ鍐閻樿尙鈧ジ鏌熼獮鍨伄婵炲牊鍨块幆澶愵敆閸曨剨绱甸梺鍛婄箓缁夊鑺遍弻銉︽櫖閻忕偞鍎崇徊褰掓煕濡も偓濞诧絿鑺遍敓鐘茬闁靛ě鍛闁诲簼绲绘竟鍫ュ春閸涘瓨鍎嶉柛鏇ㄥ墰閵堬箓鏌ｉ敐鍛櫣閻庤濞婃俊?

### Modified Files

1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 濠碘剝顨嗛崹鐢告偄閳ь剟鏌涢妷褍浜炬繛瀛樼洴楠炴垿锝為锛勵槹 ECharts 闁诲骸婀遍崑鐔肩嵁?
   - 濠电偞鎯岄崰姘舵偘閵壯呴┏婵炴垟鎳囬崑鎾村緞鐎ｎ亞妯嗛梻浣虹摂閸犳洟骞堥妸锕€绶炵€广儱妫楅惁濠氭⒑缁涘鏋涚紒浣哥仛缁鸿棄螖閸涱噯绱俊?
2. `web/src/features/consumption/mockData.ts`
   - 濠碘剝顨嗛崹鐢告偄閳ь剟鏌涢妷褍浜鹃柡鍡欏枛楠炴垿顢欓挊澶嗘寘闁诲繒鍋炲ú鎴犳嫻?4 缂備胶瀚忛崘銊р偓濠氭煛閳?
3. `web/src/app/layout.tsx`
   - 濠电儑缍€椤曆勬叏?suppressHydrationWarning 闁诲繒鍋熼崑鐐哄焵?

### Dependencies

- 闂佸搫鍊瑰姗€路閸愵喗鏅慨婵堝壆harts
- 闂佸搫鍊瑰姗€路閸愵喗鏅慨婵堝壆harts-for-react

## 1.8.23 - 2026-03-14

### Features

- **濠电偞鍨甸悧鎰板垂閸屾稏浜滈柣銏℃櫕閳哄懎绀夐柕濞у奔绱撻梺鎼炲劜瀹曟﹢濡撮崘鈺侇嚤婵☆垰鎼?*:
  - 闂佽　鍋撴い鏍ㄨ壘濮ｅ鎮洪幒鎴剰濠电偛绉瑰畷鍫曞箲閹扳斁鍋撻崘顔芥櫖婵ɑ鐦烽埡鍛闁靛ě灞肩磽闂佸憡鐟崹鐢革綖閸℃稑绀岄柛婵嗗閸樼敻鏌￠崟顐⑩挃闁?8 婵炴垶鎼╂禍婵嬪汲閻旂厧绠叉い鏃€鍎虫禒顖炴煥濞戞ɑ婀伴柡渚囧櫍楠炴劖鎷呮慨鎴弮瀹曘儵骞嬮悙鍨闂佸憡鏌ｉ崝宥夋偂閿熺姵鍎戦悗锝庝簽閺嗘岸鏌℃担鍝ユ憼闁哄棛鍠栭獮?
  - 濠电偞鍨甸悧鎰板垂閸岀偛绀嗛柛鈩冪懆椤箓鏌涢銏☆棤鐞氀囨煕閵夛箑绀冮柕鍡楀暣閺佸秴顫濆В娆屾櫊瀹曟繈濡歌娴煎倿鏌涘▎妯虹仴妞ゎ偄妫濆畷鐘诲传閸曨厼骞嶉梺鍝勫婢т粙濡?6 闂佸搫绉烽～澶愭偂鐎电硶鍋撳☉娆忓Ё缂佽鲸绻堝銊╊敍濞戞妲峰┑鈽嗗灱娴滄粓骞冨鍐剧叆闁瑰瓨绻傝闂佸搫琚崕鍐诧耿閸涱垪鍋撻悷鐗堟拱闁哄棴缍佸顐︽偋閸繄銈?
  - 濠碘剝顨嗛崹鐢告偄閳ь剟鏌涢妷锔藉珪缂佽京娅僀 缂備焦妫忛崹鏉跨暦閺夋鐓ラ柍銉﹀墯閸熷洭鏌涢敐鍐ㄥ妞ゆ梹姊归幆鏃堟晜閼测晝顦紓浣割槼椤曆勬叏閳哄啰鍗氭い鏍ㄧ⊕閺嗘粓鏌熼梹鎰妽闁惧棝鏌涘顓炵仸缂侇喗鎸冲畷婵嬧€﹂幒鏃傤槷闂佸憡鐟ラ悿鍥╃博閻旂儤宕夋繝闈涳功濞堝爼鏌?(80 闂?120)

### Modified Files

1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 闂佽　鍋撴い鏍ㄨ壘濮ｅ鎮洪幒鎴剰濠电偛绉瑰畷鍫曞箲閹扳斁鍋撻崘顏佸亾绾懏顥夐悗鐟扮－閹奉偊宕橀埡鍌涱啋 (w-\[2000px] 闂?w-\[1200px])
   - 濠电偞鍨甸悧鎰板垂閸岀偛绀嗛柛鈩冪懆椤箓鏌涢銏☆棤鐞氀囨煕閵夛箑绀冮柕鍡楀暟閳ь剛顢婂Λ鍕偓鐟扮－閹奉偊宕橀埡鍌涱啋 (w-\[1500px] 闂?w-\[750px])
   - 濠碘剝顨嗛崹鐢告偄閳ь剟鏌?PC 缂備焦妫忛崹浼搭敊閺冣偓閹棃鏁傞幐搴″伎婵犮垼娉涚粔鎾箯娴兼潙鐭楅悗鍦Х閻濆爼鎮归悜妯肩畾闁汇劎鍠栧?

## 1.8.22 - 2026-03-14

### Features

- **濠电偞鍨甸悧鎰板垂閸屾稏浜滈柣銏℃櫕閳哄懎绀夐柕濞у奔绱撴繛鏉戝悑閿氶悗?*:
  - 闁荤姴顑呴崯顖炲汲閿濆缁╂い鏍ㄧ懅鐢稒顨ラ悙鎻掓毐鐟滅増鎸冲畷姘跺幢濡ゅ喚浼岄梺鍛婄矊閺堫剟寮ぐ鎺戠哗妞ゆ牗鑹鹃悗濠氭煛鐎ｎ偄濮囨繛瀛橆焽閹即濡搁妷锔筋潊闁?(160px 闂?100px)
  - 婵炴潙鍚嬮敋閻庡灚鐓″畷鍫曞箲閹扳斁鍋撻崘顔肩闁告稒娼欓崝銉╂⒒閸屾粠妫庣紒鎰洴閺佸秶浠﹂挊澶嬵仭闁?padding 闂?margin
  - 闂侀潻绠戝Λ娑㈢嵁閸℃稑鐐婇柛鎾楀啯鐤囬柣搴ｎ攰濡嫰骞栭柨瀣劅闁哄倽娉曠涵鈧柣鐘差儏閸燁垶寮?(PC: 4px, 缂備礁顦抽褎鎱ㄩ埡鍐崥妞ゆ牓鍊楃粣?2px)
  - 闂佹悶鍎插畷姗€濡撮崘顏冩勃闁告侗鍓濋崢顒勬倵闂堟稓绉虹紓宥呯墛鐎电厧螣閸濆嫷鍤?
- **闂佹悶鍎插畷姗€濡撮崘銊庣喖顢旈崟顒€鈧粯绻濇繝鍐濠殿喒鏅犲銊╊敍濞戞妲?*:
  - 闂佽　鍋撴い鏍ㄨ壘濮ｅ鎮洪幒鎴剰濠电偛绉瑰畷鍫曞箲閹扳斁鍋撻崘顔肩哗妞ゆ牗绋戦惁顔戒繆椤栵絼绨婚柟顔界矊椤劑骞嬪┑鍠版鏌ㄥ☉妯肩伇娴滄盯鏌涢弬璇插妞ゅ浚鍓熷畷鍫曞传閸曨厽姣?500px 闁诲海顢婂Λ鍕偓?
  - 濠电偞鍨甸悧鎰板垂閸岀偛绀嗛柛鈩冪懆椤箓鏌涢銏☆棤鐞氀囨煕閵夛箑绀冮柕鍡楀暣瀵劑顢涘☉妯兼Х濠碘槅鍨兼禍婊堝箖濠婂喚鐓ラ柟瀛樼箓琚熼梺鎸庣☉閺堫剙銆掗懜闈涚窞婵﹩鍘介埢鏃傜磼閳?10 闂佸搫绉烽～澶愭偂鐎电硶鍋?
  - PC 缂備焦妫忛崹鐢稿吹濠婂牆绀夐柕濞垮劚缁愭绻濇繛閿亾閹颁礁鏅ｉ梺闈╃祷閸斿矂顢欓弮鈧幆鏃堟晜閼测晝顦紓浣割槼椤曆勬叏閳哄啰鍗氭い鏍ㄧ懅缁犱粙鏌ｉ敐鍡欐噭缂侇喗鎸冲畷婵嬪Ω閵夈儺娼梺?
- **闂佹悶鍎插畷姗€濡撮崘顏呮殰闁告劑鍔庡﹢鏉棵归崗娴庮亞鈧?*:
  - 闁汇埄鍨卞ú婊堟偪椤曗偓楠炲秴螣閸濆嫮鈧鏌＄€ｎ偄濮囨繛瀛橆焽閹即濡搁妷銉︻仭闁诲繐绻戦崹鍨▕韫囨稑鐭楅悗鍦Х閻濆爼鎮归悜妯肩缂佽鲸绻堝濠氬础閻愬灚鎲ら柣搴ｎ攰濡嫮鈧娅曢弲鍫曟倷閹绘帩娼?(30 闂?60)
  - 闂佺粯鍩堥崣鍐ㄎ涢鍕柈闁糕剝顨忛崯鈧梺鎼炲劜瀹曟﹢濡撮崘顏嗙煋濠电姵纰嶉悵鐔兼煕濞嗗繐甯犻柡鍛板煐濞煎繒娑甸崨顖滃春闂佹寧绋戦張顒€顭囬婵勪汗闁靛繒濮电粋鍫㈢磼濮ｆ牕妫楅崹閬嶅级閸繃璐＄紒?
  - 濠碘剝顨嗛崹鐢告偄閳ь剟鏌涢妷锕€鍔ょ憸鏉挎啞濞煎繒娑甸崨顖滃春婵炴潙鍚嬮敋閻?(150 闂?80)
- **濠殿噯绲界换鎴澪涢埡鍛祦闁告劕寮剁紞鍡樼箾閹存繄澧ｉ柛銊ュ€垮畷鍫曞箲閹扳斁鍋撻崘鈺傛珷闁绘劖褰冪换?*:
  - 闂佸搫鍊瑰姗€路閸愵喖宸濋柕濠忛檮濞堝爼姊洪銏╂Ч閻庢哎鍔戦獮鎰緞閹邦厼鍞?(缂?1 闂?- 缂?5 闂?
  - X 闁哄鍋涢悺銊ノ熸径宀€鐭嗛柛婵嗗閸ｎ垶鏌涢幋鐘残㈤柟铚傚嵆瀹曟鎽庨崒婊呅梺鍝勫暔閸庢彃锕?(婵犵鈧啿浜扮紒鍙樺嵆瀹曘劑濡搁妶鍥朵紘 3 闂?2 闂?
  - 闂佸搫绉烽～澶婄暤娓氣偓閹洭鎮㈡搴㈡緰闂佸搫鍟ㄩ崕鍗烆啅閼姐倖濯奸柨娑樺閺嗩剟鏌￠崘锕€鍔滄繝鈧敓鐘虫櫖閻忕偟鍋撻弳婊堟煙闂€鎰妽婵☆垰顦辩划鍫熸姜閹殿喚鎲繛鎴炴惄娴滄繂锕㈤埀?婵炴垶鎸搁鍕煂濠婂牆瀚夐柛顐ゅ枑閿涘鏌?
  - 缂備焦顨忛崗娑氱博閹绢喖宸濋柕濞垮€楅惌?3 闂?1 闂?(闂佸憡绋忛崝宥呂? 閻庢鍠掗崑鎾斥攽椤旂⒈鍎滅紒杈ㄧ箞瀹曘劑濡搁妶鍥朵紘闂佸憡甯楀姗€宕ｅ璺哄強闁告挆浣风驳 2 闂佸搫鐗嗛悧濠偽涢埡鍛珘?

### Modified Files

1. `web/src/features/consumption/components/ConsumptionDefaultTheme.tsx`
   - 缂備礁顦抽褎鎱ㄩ埡鍐崥妞ゆ牗纰嶇粋鍫ユ偠濞戞牕濡奸柡鍕€婚埀顒傛暩椤牓骞忔导瀛樷拻缁炬儳顑囬悰鈺伱归崗娴庮亞鈧?
   - 闂佸憡绻傜粔瀵歌姳閹绘帩鍤曢煫鍥ㄦ尰婵″洭鏌ｅ搴＄仩婵炲瓨顭囬惀顏堝垂椤曞懎鏅?
   - 闂佹悶鍎插畷姗€濡撮崘銊庣喖顢旈崟顒€鈧粯绻濇繝鍐濠殿喒鏅犲畷婵嬫偄鐠囨彃骞?
   - 闂佸憡绋忛崝宥夊汲閻斿吋鐒诲璺侯儏椤忋儵鏌涘鍐╂拱婵☆偀鏅犲鐢告偄閸涘ň鏋栫紓浣插亾?
   - 闂佸搫鍟ㄩ崕鍗烆啅閼姐倖濯奸柨娑樺閺嗩剟姊洪锝嗩潡缂?

## 1.8.21 - 2026-03-14

### Bug Fixes

- **闂佽桨鑳舵晶妤€鐣垫担瑙勫劅?transaction 闁荤偞绋忛崝搴ｅ垝閵娾晛鍑犻柛鏇ㄤ簼閸欏繐顭?*:
  - 婵烇絽娴傞崰鏍?`createdAt` 闂?`updatedAt` 闁诲孩绋掗〃鍡涱敊瀹€鈧槐鎾诲传閸曨厽鐦滄慨鎺撶⊕椤牓顢樻繝姘９闁兼祴鏅滈悾閬嶆⒒閸屻倕娅嶆い?
  - 濠电儑缍€椤曆勬叏?`DEFAULT CURRENT_TIMESTAMP(3)` 婵帗绋掗…鍫ヮ敇婵犳艾纾?
  - 濠电儑缍€椤曆勬叏?`ON UPDATE CURRENT_TIMESTAMP(3)` 闂佺厧顨庢禍婊勬叏閳哄懎鍗抽悗娑櫳戦悡鈧?
  - 闁荤喐鐟辩徊浠嬪窗閸涙潙瑙﹂幖杈剧秵娴煎倿鏌涢幒鎾垛槈缂傚倹鎸荤粋宥夊Χ閸℃﹩娼ㄩ梺鍝勫暢閸╂牗鎱ㄩ妶澶嬬叆?"Field doesn't have a default value"

### 闂傚倸鍋嗛崳锝夈€傛禒瀣唨閻熸瑥瀚悥?

1. 闂佸憡鑹惧ù鐑筋敂椤掑倻纾介柛婵嗗濮?POST `/api/transactions` 闂佽浜介崕杈亹濞戙垺鏅柛顐ｇ箓閸ゆ帡鏌?v1.8.20 婵烇絽娴傞崰鏍囬弻銉︽櫖?
2. 闂佽桨鑳舵晶妤€鐣垫担瑙勫劅?`transaction` 闁荤偞绋忛崝搴♀枔?`createdAt` 闂?`updatedAt` 闁诲孩绋掗〃鍡涱敊鐏炶В鏌﹂柍鈺佸暞缁犳帒顫楀☉娆樼劸妞ゆ挸顭峰畷?
3. 闁诲簼绲绘竟鍫ュ吹?Prisma 闂佸憡甯楃粙鎴犵磽閹惧顩查柕鍫濇椤粓鎮规担瑙勭凡缂傚秴绉瑰顔炬崉閹帊鏉柣?

### Modified Files

1. 闂佽桨鑳舵晶妤€鐣垫担瑙勫劅闁规儳寮堕崣蹇擃熆?
   - `ALTER TABLE transaction MODIFY COLUMN updatedAt datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)`
   - `ALTER TABLE transaction MODIFY COLUMN createdAt datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3)`

## 1.8.20 - 2026-03-14

### Features

- **闂佸憡鑹惧ù鐑筋敂椤掍胶顩查柕鍫濇椤粓鏌涢幒鎾垛槈缂傚倹鎹囬獮鎺楀Ψ閵夈儳绋?*:
  - 闂佸搫鍊瑰姗€路?POST `/api/transactions` 闂佽浜介崕杈亹?
  - 闂佽　鍋撴い鏍ㄧ☉閻︻噣鏌涢幒鎾垛槈缂傚倹鎹囧畷锟犲即閻旀瓕鎷繛瀛樺殠閸婃牕危濡ゅ啯濯奸柡澶庢硶缁夊潡鏌ㄥ☉妯煎鐟滄澘娲ら埢搴㈢┍閹典礁浜惧ù锝囨嚀閳敻鏌涘Δ瀣？闁烩剝鍨块弫?
  - 闂婎偄娲ら幊搴ㄦ晲閻愮鍋撳☉娆樻畷妞ゆ柨鐭傞弫宥咁潰濞岀unt, type, category, platform, date
  - 闂佸憡鐟崹鍫曞焵椤掆偓椤︻垶鎮鸿閳绘挾鍠婃径宀€鐛erchant, description
  - 闂佺厧顨庢禍婊勬叏閳哄懎绀傞悗鍦С缁挾鎲搁悧鍫熷碍濠⒀呭█閹倻鎷犻懠顒傂梺娲绘娇閸斿秹宕哄☉銏″剭?userId

### Bug Fixes

- **闂佸憡鐟﹂悧妤咁敄濞嗘挸妞介悘鐐村劤閳敻鏌涘鏂诲€ら崬鍓佹喐閻楀牊纾荤紒妤€顦靛浼村礈瑜嬫禒娑㈡⒒閸屻倕娅嶆い?*:
  - 婵炴垶鏌ㄩ鍛櫠閻樿鐭楁い蹇撴噺缁犳帡鎮楅悽闈涘付闁告瑥妫濋獮鎺楀Ψ閵夈儳绋夐梺鎸庣☉閺堫剟鎯€閸涙潙瀚夊璺猴工缁€瀣煛婢跺棌鍋撻崘鑼画閻庣偣鍊楅崕銈囨暜閹绢喖鐭?
  - 闁诲簼绲绘竟鍫ュ吹瑜斿畷锝夊冀椤垵鍔岄梺鍛婄矊閺堫剚鏅堕敃鍌氱闁斥晛鍟ˇ褔鏌涢幒鎾垛槈缂傚倹鎸荤粋宥夊Χ閸℃﹩娼ㄦ繝銏″劶缁墽鎲?
  - 闂佺粯绮嶅妯猴耿椤忓牆鐭楁い鏍ㄧ懁缁ㄧ増鎱ㄥ┑鎾跺埌闁绘牕鐖煎畷姘槈濡偐澶勫Δ鐘靛仩閸╂牕螣婢跺瞼鐭嗛弶鐐靛閸炲鏌￠崟顒佸磩妞ゆ柨娲╅妵?

### Modified Files

1. `src/server/src/main.ts`
   - 濠电儑缍€椤曆勬叏?POST /api/transactions 闁荤姳璀﹂崹鎶藉极?
   - 闁诲骸婀遍崑鐔肩嵁閸ヮ剙纭€闁哄洨鍠愰拏瀣瑰┃鍨偓鏍ｅΔ鍛婵炴垶顭囩槐锕傛⒑椤愶絾顫楃紒?
   - 婵°倗濮撮惌渚€鎯佹径搴ｇ杸闁告侗鍙忕紞鏍倵濞戞瑯娈曟い?
   - 闂佺厧顨庢禍婊勬叏閳轰讲鏋栭柕濞垮劚瀵?userId

## 1.8.19 - 2026-03-14

### Features

- **闁诲孩绋掗敋鐟滄澘娲ㄩ幏瀣级鐠恒劎协闂佸憡甯楅〃澶愬Υ閸愵喖鍙婇柛鎾椾椒绮垫繛鏉戝悑閿氶悗?*:
  - 闂佺懓鐏氶幐绋跨暦鏉堚斁鍋撳☉娅虫垿顢栧▎鎾崇睄闁诡垱婢樺▓浼存煕閺傝濡奸柛銊ュ船椤曟瑦娼悧鍫濇敪闂佸搫瀚幑渚€顢欓崶顏備汗闁哄浂浜炵粈鍕磼椤愩儺鍤欓柛鈺佹閺佸秴顫濋鈧禍鍫曟煢閸愩劌顏╅柣掳鍔岄埢搴ㄥ箻閸涱垳顦?
  - 婵炴潙鍚嬮敋閻庝絻灏欓埀顒佺⊕閿氱憸鏉挎川閹峰寮剁捄銊柡澶嗘櫅濞诧箓骞庨妶澶嬬劵闁哄嫬绻掔敮鍡涙煥濞戞瀚伴柟顔芥崌瀵噣鎳滃▓鎸庘挄闂?category 闂?description 闁诲孩绋掗〃鍡涱敊?
  - 缂佺虎鍙庨崰鏇犳崲濮樿泛绠ラ柟鎯у暱楠炪垽鏌涘鍐鐟滄澘娲ら埢搴ㄥ箲閹伴潧鏁归悷婊呭濞茬喖宕楀鈧幊妤呮寠婢跺鍚柣搴㈢⊕閿氱憸鏉挎川閹峰寮剁捄銊梺鍛婂笚椤ㄥ濡撮崘鈺冣枖妞ゆ挾鍠愰埢鏃傜磼閳?
  - 闂佽　鍋撴い鏍ㄧ☉閻︻噣鏌涜箛鏂库枙闁轰緡鍘鹃幏鐘差吋韫囨洜鐛ラ梺绋胯閸斿繘骞栭锕€违濞达絽鎽滈幗鐘崇箾閸℃洖瀚庨柍褜鍏涢懗鍫曞箖婵犲嫭瀚绘い顐厴閸嬫挻鎷呴崫銉ユ暏闂備礁寮堕崹顖炲焵椤戞寧绁伴柛瀣€荤划濠囧Ω閿濆倸浜惧ù锝呮憸閺嗕即鏌熼懜鍨闁?

### Modified Files

1. `web/src/features/savings/components/SavingsPlanDialog.tsx`
   - 闂?`handleUpdatePlan` 闂佸憡鍨兼慨銈夊汲閻斿摜鈻旀い鎾跺枎濞兼垿鏌涢弮鍌毿℃慨姗堢畵瀵即骞橀崘鑼画閻庣偣鍊栧浠嬪焵椤掍焦顫楃紒?
   - 閻熸粎澧楅幐缁樻櫠閿曞倸纭€闁挎稑瀚瑧闂佽鍏涚粈浣姐亹婢跺鈻?COMPLETED 闂佸搫鍟冲▔娑㈠垂閸楃儐鍤?INCOME 缂備緡鍋夐褔鎮楅柨瀣洸闁靛牆妫欓～?
   - 婵炲瓨鍤庨崐鏍ｅΔ鍛闊洦鑹鹃悧姘舵煕閺嵮勫櫣闁诡垰鐗撳鐢稿醇濠婂啯鏆呮繛锝呮礌閸撴繃瀵?
2. `web/src/app/(dashboard)/savings/page.tsx`
   - 婵炴潙鍚嬮敋閻庨潧寮跺濠氬炊閵婏箑袘闂備緡鍋呭Σ鎺旀椤愶附鏅悘鐐跺Г閸婇亶鏌￠崘顓炵厫妞ゃ儱鎳樺?category 闂?description
   - 闂佸湱顣介弲娑㈠Φ閸ヮ剙绀岀憸鐗堝笒鐢娊鏌ら悡搴℃殭婵炴彃娼￠弫宥呯暆閳ь剟鍨惧Ο鑽も攳婵犻潧娲ら。鏌ユ煛閸繍妲搁柛瀣Ч閹锋垿宕熼鐔恒偛闂佺绻愰崢鏍ь潩閿曞倸鍙婇柟鎹愵嚙閸樻挳鏌ょ€圭姴袚婵☆垰顦辩划?

## 1.8.18 - 2026-03-14

### Features

- **闂佺懓鐏氶幐绋跨暦闁秴妞介悘鐐舵缁叉寧绻涢崱娆忎壕婵☆偀鏅犲鐢告偄閸涘ň鏋栫紓浣插亾?*:
  - 闂侀潻璐熼崝宀勫磻瀹ュ瀚呴柛鏇ㄥ墮閳敻鏌涘鐑╁亾鐎圭姴澧剧紓浣瑰姈閵囩偤鎳欓幋锕€鍙婇柛鎾椾椒绮甸梺鐟扮仛閹哥鐣烽柆宥呯睄闁靛闄勯崺鍌炴煛閸愩劎鍩ｆ俊?
  - 閻庣懓鎲¤ぐ鍐偩椤掑嫬绠ｉ柟閭﹀枟閻ｉ亶鏌熼崹顐ｅ碍鐎规洝浜幏瀣级鐠恒劎协闂佸搫瀚晶浠嬪Φ?"闂佺懓鐏氶幐绋跨暦闁秵鏅慨婵囧YY-MM-DD HH:mm"
  - 闂佸憡鐟﹂悧妤咁敄濞嗘劗顩查柕鍫濇椤粓鏌ゆ總澶夌盎濠殿喒鏅濋幏瀣级鐠恒劎协閻熸粎澧楅幐鍛婃櫠閻樿绫嶉柛顐ｆ礃閿?
  - 闁诲孩绋掗敋鐟滄澘娲ㄩ幏瀣级鐠恒劎协闂佸憡甯楅〃澶愬Υ閸愵喖鍙婇柛鎾椾椒绮垫繛瀛樺殠閸婃牕危濡ゅ懎绫嶉柕澶涢檮閸?

### Modified Files

1. `web/src/features/savings/components/SavingsPlanDialog.tsx`
   - 濠电儑缍€椤曆勬叏?`createdAt` 闂?`updatedAt` 闁诲孩绋掗〃鍡涱敊瀹€鍕闁规鍠涢～锕傛煕閵娿儺鍎忛柣锝囧亾缁?
   - 闂侀潻璐熼崝宥嗘櫠閿曞倸纭€闁挎稑瀚瑧闂佽鍏涢悞锔锯偓鍨矒閺岋箓顢欓懡銈囨啴闂佸搫鍊介～澶娢熸径宀€鐭嗛柣鎴灻埅鐢告煕濡炶澧叉俊鐐插€垮?
   - 婵炲濮撮幊搴敋椤旂⒈鍟呴柟缁樺笧閺嗘岸鏌熺€涙ê濮夊┑顔芥倐楠炩偓濞达綀顫夐埢鏃傜磼閳ь剟鎮滃Ο琛″徍闂佸憡銇涢崜婵單涢埡鍛珘?

## 1.8.17 - 2026-03-14

### Features

- **Savings 婵＄偑鍊楅弫璇差焽娴兼潙鐭楅柡宥庣厛閸庛儵鏌涢弮鍌氭灆闁?*:
  - 闂佸搫鍊瑰姗€路閸愵喖鐭楅柡宥庣厛閸庛儳鈧鍠栧﹢閬嶆偘閵壯呯＜闁告洦浜濋?`SavingsWithdrawalDialog`
  - 闂侀潻璐熼崝搴∶烘导鏉戝唨闁搞儜鍐粴闁荤偞绋忛崝瀣嚈閹存劲搴ｆ嫚閹绘帩娼?闂佸憡鐟﹂悧妤咁敄?闂佸湱顭堥ˇ鐢稿箰閹惰姤鏅悘鐐靛亾閺嗘粓鏌熼梹鎰樂缂侇喚濞€瀹曟帡濡搁妸锔藉創闂佺儵鏅╅崰妤呮偉閿濆鐭楅柡宥庣厛閸?
  - 闂佺厧顨庢禍婊勬叏閳哄懎绀嗘繛鎴烆焽缁憋箓鏌涘▎鎰妞ゆ垶鐟︾粋宥夊Χ閸℃﹩娼ㄩ柣鐘辩劍濠㈡绱炲澶嬫櫖闁割偅绻傞悗鑽ょ磼椤愶紕涓茬紒鍙樺嵆瀹曟帡濡搁妸锔藉創闂佸憡鐟﹂悧妤咁敄濞嗘挻鏅?
  - 闁诲骸婀遍崑鐐差渻閸岀偛鍗抽悗娑櫳戦悡鈧梺绋胯閸斿繘骞栭锔藉剮妞ゆ梻鏅崹濂告煟閵娿儱顏╃紓宥咁儔瀹曟粌顓奸崨顖涙喖濠电偛妫濈粻鏍闯閻愵剨绱?
  - 闂佸憡鐟﹂悧妤咁敄濞嗘挻鐓傞柟杈惧瘜閺夊搫螖閻樿尙鐒烽柣锕€顦甸弫宥咁潩椤愩倗鎲归梺鐓庡暱閳ь剛鍠撳瓭闁哄鏅涘ú銈囩礊鐎ｎ喖绀堢€广儱鎳愰幗鐘崇箾?
  - 闂佽　鍋撴い鏍ㄧ☉閻︻喖顭跨捄鐑樺闁轰胶鍋熼幏鐘碘偓娑櫳戦～鏍煥濞戞鐒锋い鏂挎穿閵囨劙寮撮悙鑼偧濠电偛妫楁晶浠嬪极閵堝鐒?

### Modified Files

1. `web/src/features/savings/components/SavingsWithdrawalDialog.tsx` (闂佸搫鍊瑰妯肩磽?
   - 闂佸憡甯楃粙鎴犵磽閹捐鐭楅柡宥庣厛閸庛儳鈧鍠栧﹢閬嶆偘閵壯呯＜闁告洦浜濋?
   - 闁诲骸婀遍崑鐔肩嵁閸ヮ剙鐭楅柡宥庣厛閸庛儵鎮跺☉鏍у鐎规洜鍠栧畷顏勭暆閸曨厼鐭楅柣鐘叉矗缁舵岸鍩€椤掍焦顫楃紒?
   - 闁荤姴顑呴崯浼村极?API 闂佸憡甯楃粙鎴犵磽閹惧顩查柕鍫濇椤粓鎮规担瑙勭凡缂傚秴绉瑰畷顏嗕沪閻愵剛鍑介梺鍝勫€瑰姗€宕戝澶嬪珔闁告洦鍘界粣妤呮煛?
2. `web/src/features/savings/components/themes/DefaultSavings.tsx`
   - 濠电儑缍€椤曆勬叏?`onOpenWithdrawal` 闂佹悶鍎抽崑鐘绘儍閻旂厧绀勯柤鎭掑劜濞?
   - 闂侀潻璐熼崝搴∶烘导鏉戝唨闁搞儜鍐粴闁荤偞绋忛崝宥夊箹闁垮濯存繝濠傚閸╁绻涢敐鍫殭濠?闂佸憡鐟﹂悧妤咁敄?闂佸湱顭堥ˇ鐢稿箰?
   - 闂佸湱顭堥ˇ鐢稿箰閹惰棄鎹堕柕濞垮劤閹界姵绻涢崱妤€缍栭悹?0 闂佸搫鍟晶搴ㄣ€呴敃鍌涘仺?
3. `web/src/app/(dashboard)/savings/page.tsx`
   - 闁诲海鏁搁崢褔宕?`SavingsWithdrawalDialog` 缂傚倷绀佺€氼亜鈻?
   - 濠电儑缍€椤曆勬叏閻愬搫鐭楅柡宥庣厛閸庛儵鏌ｅΟ鍨厫闁逞屽厸閼冲爼顢橀幖浣瑰仩?
   - 闁诲骸婀遍崑鐔肩嵁?`openWithdrawal` 闂佸憡鍨兼慨銈夊汲?
   - 婵炵鍋愭繛鈧柍褜鍓氱敮鎺懨洪弽顐ｅ闁告劑鍔岄悡?`SavingsDefaultTheme`

## 1.8.16 - 2026-03-14

### Features

- **Dashboard 婵＄偑鍊楅弫璇差焽娴煎瓨鈷栭柛鈩兠悘鍥煕鐏炶濮€闁圭⒈鍋婂顐︽偋閸繄銈?*:
  - Dashboard 闂佹眹鍔岀€氼參鍩€椤掍焦顫楃紒渚囧亝缁傚秷顦存鐐叉喘瀹曠兘濡搁妷銉ф▉闂佸憡鍑归崑鍕磻瀹ュ瀚呴柛鏇ㄥ幗缁愭鏌″鍛窛婵炲牊鍨奸妵鎰板箻閸愬樊鏋€闁诲孩绋掕摫妞?
  - 婵?`/api/savings` 闂佸吋鍎抽崲鑼躲亹閸ヮ剙纾奸柕濞垮妽閹牓鏌ｉ埡濠傛灍闁绘牭缍佸顐︽偋閸繄銈?
  - 闂佽鍓氬Σ鎺旂矈椤愶絿顩?= 闁汇埄鍨遍悺鏇綖婢跺本灏庨柛鏇ㄤ邯閻?+ 闂佺琚崝蹇涘箹椤愶附鍎庢い鏃傛櫕閸ㄥジ鎮楀☉娅虫垿顢栧▎鎾崇畱閻犲洤寮剁€?

### Bug Fixes

- **Savings 婵＄偑鍊楅弫璇差焽閹殿喗鏆滈柛鎰╁妿濠€浼存煕鐎ｎ亞绠虫禍娑㈡⒒閸屻倕娅嶆い?*:
  - 婵烇絽娴傞崰鏍囬崣澶岊洸闁糕剝顨呴悡鏇㈡煛閸屾瑥宓嗛柕鍡楊樀濡啴濮€閳╁喚妲俊銈囧О閸斿秹鎮橀敂鍙ユ勃闊洦绋撹ぐ顖炲箹鏉堝墽鐣垫繛鍫涘灲瀵敻宕崟闈涙闂佺厧鍢查顓炩枔閹寸姵鏆滈柛鎰╁妿濠€浼存偣閸濆嫬鏆卞┑?
  - 缂備礁顦…宄扳枍鎼淬垻顩查柛鈩冪⊕椤撳綊鏌￠崼鐔搞仢闁绘繍鍠楅幆鏃堟晝娓氬洤鎮佺紓浣哄У椤ㄦ劗妲愬┑鍥ㄥ閻犳亽鍔嶉弳蹇涙煕閵夈儲鎯堥柣锝夌畺閹?Tailwind CSS 婵°倕鍊归敋閻庣懓纾悮?

### Improvements

- **Savings 婵＄偑鍊楅弫璇差焽閻楀牜娈介柕濠忓娴犳悂鎮橀悙鑼濠殿喚鍋炲顏堝箣閹烘梻歇婵?*:
  - 闂佸搫鍊瑰姗€路閸愨晝鈻旈柟鎹愬煐閺嗗繐螖閻橆喖濡介柣蹇ュ娴狅箒绠涢弴鐘电厑婵炲濮鹃鎰?
    - `StatsCardSkeleton()` - 缂傚倷鑳堕崰鏇㈩敇閹间礁纭€闁挎稑瀚。璇参旈悩顔煎闁诲骏濡囨禒?
    - `DistributionChartSkeleton()` - 闂佸憡甯掑Λ妤冪博閻戣棄鐐婇柟瑙勫姂閳ь剙鍟〃銉╁Ω閿斿彞妗撻柣?
    - `GoalsTableSkeleton()` - 闂佺儵鏅╅崰妤呮偉閿濆绀嗘俊銈呭閳ь剙鍟伴幃浼村Ω閿旀儳顥曟俊銈囧О閸斿秹鎮橀敂鍙ユ勃?
    - `TransactionsSkeleton()` - 婵炲瓨鍤庨崐鏍ｅΔ鍐╁闁哄娉曠粔鍨旈悩顔煎闁诲骏濡囨禒?
  - 闂佸湱顣介崑鎾绘煛閸繍妯€妞ゅ骸娲鍝ユ崉閾忚缍勬繛杈剧秬濞夋洟寮妶澶婄倞闁告繂瀚弳浼存倶韫囨挻鎯堟い鏇ㄥ弮閺佸秴鐣濋埀顒勫灳濡崵鈹嶆繝闈涙椤綁寮堕悙璺盒撴俊鐐插€婚弫顕€宕橀妸褎鎷辩紓浣割儏閸熷潡鎮?
  - 濠电儑缍€椤曆勬叏?`loading` 闂佸憡鐟ラ崐褰掑汲閻旂厧缁╂い鏍ㄧ☉閻︻噣鏌ㄥ☉妯绘拱闁绘鎸抽獮鎴︻敊閻撳寒娼遍柡澶屽仧閺咁偅鎱ㄩ幖浣哥畱濞达綀顫夐埢鏃傜磼閳ь剙煤椤忓秮鍋撻崶顒€鍑犻悹楦挎濞煎矂鏌熺€涙澧辨繝鈧敍鍕ㄥ亾閸︻厼浠﹂柡鍡欏枛楠?
  - 濡ょ姷鍋犲▍鏇犲垝閿曞倹鍎嶉柛鏇ㄥ亜椤綁寮堕悙鑸殿棄濠殿喒鏅犻幃鑺ュ濞嗘垹顦梺鍦帛閸旀洖鐣峰畝鍕仺闁靛绠戦悡鏇灻归敐鍡樺磳闁?

### Modified Files

1. `web/src/app/(dashboard)/page.tsx`
   - 濠电儑缍€椤曆勬叏閻愬搫纾奸柕濞垮妽閹牓鏌ｉ埡濠傛灍闁?API 闁荤姴顑呴崯浼村极?
   - 婵烇絽娴傞崰妤呭极婵傜绠戦柡鍕箳閵堫偄霉濠х姴妫崥鈧紓浣哄У椤ㄥ﹪鍩€椤掍焦顫楃紒棰濆亰閺佸秶浠﹂挊澶屾▉闂佸憡鍑归崑鍕磻瀹ュ瀚呴柛鏇ㄥ亞閹界姵绻?
2. `web/src/features/savings/components/themes/DefaultSavings.tsx`
   - 闂佸憡甯楃粙鎴犵磽?4 婵炴垶鎼╂禍娆戠箔閹剧粯鍋ㄩ柕濞炬櫓閳ь剙娲鍝ユ崉閾忚缍勭紓鍌欑鐎氼亜鈻?
   - 闂佸搫娲ら悺銊╁蓟?`DelayedRender` 缂傚倷绀佺€氼亜鈻庨姀銈呯哗妞ゆ牗绋戦惁顕€鏌ゆ總澶夌盎闁伙絿鍋撶粙濠冨緞閹扮鍋撻崶顒€鍑犻悹楦挎濞?
   - 濠电儑缍€椤曆勬叏?`loading` 闂佸憡鐟ラ崐褰掑汲閻旂厧绀嗛柟娈垮枤閻霉?props
   - 婵炴垶鎸鹃崕銈嗘櫠瀹ュ瀚夊璺猴工闂呮﹢鏌涢埡鍐ㄦ瀾闁秆冿躬瀹曟繈鎮╁ú鐑╁亾閸ヮ剙鍑犻悹楦挎濞煎矂鏌￠埀顒勵敍濞戞妲?
3. `web/src/app/(dashboard)/savings/page.tsx`
   - 婵炵鍋愭繛鈧柍?`loading` 闂佸憡鐟ラ崐褰掑汲閻旂厧绀?`SavingsDefaultTheme` 缂傚倷绀佺€氼亜鈻?

## 1.8.15 - 2026-03-14

### Features

- **缂備礁顦抽褎鎱ㄩ埡鍐崥妞ゆ牜鍋愰崑鎾诲磼閻愭彃璧?*:
  - 闂佸搫鍊瑰姗€路閸愵亞鐭撻悹鍥ㄥ絻琚熺紓浣规閸ㄤ即顢氶柆宥嗗殝妞ゅ繐娲ょ紞鍛存煕?(Hamburger Menu)闂佹寧绋戞總鏃傜礊閸涱喚顩?Header 閻庡綊娼荤紓姘跺疾閸洖违?
  - 闂傚倸妫楀Λ娆撳垂濮橆厾鐟圭憸搴ｅ垝閿曞倸绠柦妯侯槺濠?(Side Drawer)闂佹寧绋戦懟顖氾耿椤忓棛鐭撻悹鍥ㄥ絻琚熺紓浣规閸ㄨ精銇愭担鍦懝婵炴垶顭囬弳姘舵煛娴ｅ壊鍤熸繛鍫熷灦缁楃喕顦剁紒鏃傚枛瀵€熺疀閹垮啫娈奸梺鐓庡娴滄粍鎱ㄥ☉銏″殑濠殿喗鍔忛崑?
  - 婵炴潙鍚嬮敋閻?Header 闁汇埄鍨伴崯顐︽儑椤掑嫭鏅悘鐐跺Г闊剛绱掓径搴殭濠殿喒鏅濈划鈺咁敍濠靛棙顔囬梺鍛婃煟閸旀垿鍩€椤掆偓閸婂潡宕㈤妶澶婂唨闁搞儺鍓﹂弳顖氣槈閹捐櫕鍞夌憸鏉跨Ч瀹曪繝寮撮悢椋庢▎闂備胶鐡旈崰鎾诲焵?
- **婵炲濯禍锝夊Υ閸愵喗鍎庢俊顖氭贡缁夌厧螖閻樻彃顨欑紒槌栧弮瀹?*:
  - 缂備礁顦抽褎鎱ㄩ埡鍐崥妞ゆ牜鍎愬ù鏇烆渻閵堝娑х紒鏃堫棑娴狅箓鍩€椤掑嫭鐓傜€广儱妫涢埀顒夊灦閺佸秴顫濈捄鐑樼彴闂佹椿娼块崝宥吤虹捄銊︻潟鐟滃秹宕虫ィ鍐╁剭闁告洦鍘剧粔褰掓煛瀹ュ洤甯剁紒鏃堫棑娴狅箓鍩€?(Grid Layout)闂?
  - 缂傚倸鍊甸弲娑㈡儍椤掑倻鐭撻悹鍥ㄥ絻琚熺紓浣规閸ㄦ澘鐣烽柆宥嗗亱闁搞儜鍕潊闁诲海鏁婚弲鑼箔瀹€鍕闁告稒澹嗛悵鍫曟偣閻戞绠扮紒杈ㄧ箞楠炴捇骞囬鈧壕鎶芥倶閻愯尙绠扮紒鐘活棑缁艾煤椤忓拑绱甸梺鍛婂坊閺呮繈寮妶澶嬪仢闁搞儯鍎崑?
  - 婵炴潙鍚嬮敋閻庝絻灏欓埀顒佺⊕閵囩偟绱炵€ｎ偄绶炵憸宥夋儍椤掍胶鈻旈幖绮瑰墲缁傚牓鏌″鍛悙闁哄嫬鍊婚埀顒傛暬濞艰崵妲愬┑瀣劵闁稿瞼鍋涚敮鎶芥倶韫囨挾绠伴柣顐㈡閹峰骞嗚濡茬敻姊婚崘銊﹀殌妞ゆ洜澧楅幏鍛村箻閼姐倕鐭楅梺?
  - **闁诲孩绋掗妵鐐电礊鐎ｎ剚瀚柛鎰ㄦ櫆濞?*:
    - 婵犫拃鍛粶闁?闂佸憡鍨熼崑鎾绘偣瑜嶇€氼亝顨?闂佽桨鐒﹀姗€鍩€椤掑倸甯堕柣鈯欏嫭濯?(text-3xl -> text-4xl)闂?
    - 婵犫拃鍛粶闁?闂佽鍓氬Σ鎺旂矈椤愶絿顩?闁荤姵鍔楅崰搴ㄥ焵?闁哄鐗嗛幊搴㈡叏椤忓懐鈹嶉柍鈺佸暕缁辨牠鎮楀☉娆嶄沪缂?(text-\[10px] -> text-xs/sm)闂佹寧绋戦張顒冦亹娓氣偓瀹曪繝宕惰鐠佹煡鎮归崶鈺冨笡闁逞屽劯娴ｆ彃浜?
  - **缂傚倷绀佺€氼亜鈻庨姀銈呬紶鐎广儱鎳愮€瑰鈧鍠栫换瀣椤撱垹绀?*:
    - "闂佸搫鐗冮崑鎾诲级閳哄倸鐏ｆ慨姗堢畵瀵?闂佸憡甯楅〃澶愬Υ閸愨斂浜滈柣鐔煎亰閺夊鏌涢弮鍌毿㈤柤鏉戯躬楠炩偓鐟滃秶绮╂搴濇勃闁逞屽墯缁嬪鎯旈姀锛勨偓顕€鏌￠崼顐㈠闁糕晛鎳樺顒勵敇閵娧咁槷闂傚倸鍟鍫曨敆濞戙垺鈷愰柟绋垮閻庮噣鏌￠崼顐㈠闁绘鍓熷畷姝岀疀閹鹃浼岄柣蹇曞亹閸嬫捇鏌?
    - "闂婎偄娴傞崑鍛暤鎼淬劌绀傞柕澶堝劚缂?缂傚倷绀佺€氼亜鈻庨姀銈呮嵍闁靛鐏濋埡鍛闁靛ě灞肩磽缂傚倸鍊甸弲娑㈡儍椤掑嫬鐐婇柣鎰靛墰閸ㄧ厧鈽夐幘鎶筋€楅柛鐐茬摠濞煎繒娑甸崨顖滃春闂佹寧绋戦惌鍌炲焵椤掆偓閸婂潡宕㈤妶鍥︾剨闊洦鎸惧宀勬煟閹邦喗鍤€闁搞値鍣ｅ畷鐘诲传閸曨厼骞嶉梺?
  - **闁汇埄鍨伴崯顐︽儑椤掆偓閳瑰啴濮€閻樺弶鐦旀繛锝呮祩閸犳牠藝?*:
    - 闂佺绻堥崝宀勬儑椤掑倵鍋撻崷顓熷殌婵炲懏甯楅弲鍫曟倷閹绘帩娼?`overflow-x-hidden`闂佹寧绋戦惌鍌毼ｇ拠宸桨闁靛繆鍓濈€垫粍顨ラ悙鑸电彧缂侇喗鎸冲畷婵嬪Ω閿濆倸浜?
    - 婵炲濯禍锝夊Υ閸愵喗鍎?Grid 闁诲孩绋掗崝娆撳Υ瀹ュ棙娅犻柣鎰絻椤?`min-w-0`闂佹寧绋戦惌鍌毼ｇ拠宸桨闁靛繒濮电粋鍫ユ偠濞戞牕濡块柣鈩冨灩閳ь剛顢婂Λ鍕船鐎电硶鍋撶涵鍜佹綈闁瑰嘲鎼锝夊焵椤掑倻纾鹃柟瀵稿仧婢规劙鏌?
    - 婵烇絽娴傞崰鏍?闁汇埄鍨奸崰鏍ㄦ叏?闂佸憡顨愮槐鏇熸櫠閺嶎偅鍟戦柛娑欑暘閸嬫﹢鏌涢敃鈧Λ妤€锕㈤埀顒勬煟閵娿儱顏紒顕€顥撻埀顒傛暩閹虫捇鎮鹃悙顒佸鐎广儱妫楅銏ゆ煕閹寸偞銇濇俊顐ュ煐閿涙劕螣缁洖浜?
  - **闁荤喐鐟ュΛ婊堬綖鎼淬垹顕辨俊顖氭惈椤?*:
    - 闂佺绻堥崝宀勬儑椤掑嫬绀夐柣妯虹－缁犳帡鏌涘Δ瀣？濠⒀勭墬濞煎繒鎲撮崟鍨暠婵☆偆澧楃划蹇旂珶?(border-gray-100 -> border-gray-200)闂佹寧绋戦惌浣筋暰闂佸憡鍔曢崯鍨耿椤忓牊鐒鹃柕濞垮劚閻庡鎮橀悙鑼缂佺娀鏀辩粙澶嬬節閸涱垳褰惧┑鈩冾殔濡梻绮径鎰煑妞ゆ牗绻嶅宀勬煟閵娿儱顏俊顐ュ煐閿涙劕螣缁洖浜?
  - **缂傚倷鑳堕崰宥囩博鐎涙ɑ缍囩痪顓炴噽閻?*:
    - 缂備礁顦…宄扳枍鎼达絾灏庨柛鏇ㄤ邯閻涙捇鏌曢崱鏇犲妽缂佸顥撻幏褰掔嵁鎼存挸浜惧ù锝囶焾娴滃爼鏌﹂崘銊ヮ仴闁逞屽厸濞村洭骞戠捄琛℃瀻濡わ絽鍟ㄩ埀顒€顦靛Λ鍐閵忥紕鏆犳俊顐ゅ缁诲倿藝婵犳艾绀冮柛娑欏閻濆爼鎮?(`p-6`)闂佹寧绋戦惉鑲╁垝閻戞鈻旈柍褜鍓氶幏鍛崉閵婏附娈㈤梺绋跨箞閸斿矂鎯?Layout 闂佸湱绮崝鎺旀閻㈠憡鍎嶉柛鏇ㄥ墰閸ㄥジ鏌涢幋婵囶棥缂佹梻鍠撻幑鍕攽閹惧墎顦柣鐔哥懕缁蹭粙宕伴崨顖滅煋閻犲洦褰冭缂?闁哄鐗愰～澶愩€佺€ｎ偅浜ら柛銉戝啳鈷?闂傚倸鍋嗛崳锝夈€傛禒瀣?

## 1.8.14 - 2026-03-14

### Features

- **濠电偞鍨甸悧鎰板垂閸屾稏浜滈柛蹇撴憸缁夌厧螖閻樻彃顨欑紒槌栧弮瀹?*:
  - 闂佸搫鍊瑰姗€路閸愨晜鍎熼柡鍥ュ灩閸斻儵鏌熼鍛閻犲洨鍋熺划闈涒槈閳垛晛浜惧璺侯儏閻﹀姊?(Floating Filter Button)闂佹寧绋戞總鏃傜箔閸涱収鐓ラ柟瀵稿仧濞夊﹪鏌涢弬璇插婵＄偛鍊块幊娑㈩敂閸曨倣妤呮煛閸曨偄鈷旀鐐叉喘婵?
  - 闂佽　鍋撴い鏍ㄧ☉閻︻噣鐓崶璺轰簼鐎规挸娴风划闈涒槈閳垛晛浜惧鑸靛姈濡椼劑鏌?(Popover)闂佹寧绋戦惌鍌氣枖閿曞倸绠ｉ柟閭﹀幗閸嬫繄绱掓鏍ㄥ▏闁逞屽厸缁€渚€鏌﹂埡鍛煑闁瑰嘲鐬肩粻鏍ㄧ節婵炲灝鈧挾绮畝鍕珘闁割偅绮岄弫婊堟煕閹烘垶澶勭€规洘鐓″畷婵嬫偄鐠囨彃骞嬮梺鎸庣☉婵傛梻绮仦淇变簻闁割偅娲栭崝銉х磼濞戞瑧娲撮柍褜鍓欓ˇ浼存偉椤旈敮鍋撻崷顓炰沪婵＄偛鍊垮畷銉т沪缂併垹濡遍梺?
  - 婵炴潙鍚嬮敋閻庡灚褰冮…銊ヮ潩椤掆偓琚熼梺鐑╂櫆閸ㄧ敻骞嗘径鎰劵闁哄嫬绻掔敮鍡涙煥濞戞ê顨欓柟渚垮妽瀵?`h-screen` 闁汇埄鍨伴崯顐︽儑椤掍胶鈻?`window.scrollY` 婵犮垺鍎兼ご鎼佸疾閵夆晜鈷掓い鏇楀亾妞わ絼绮欓弫宥囦沪閻愵剚姣夋繛鎴炴崄濞咃絽煤閸愵喖瑙?`main` 闁诲骸婀遍幊鎾斥枍閹烘埈鐓ユ慨姗嗗墮琚熼梺?

## 1.8.13 - 2026-03-14

### Features

- **闂佺琚崝蹇涘箹椤愶箑绠ラ柟鎯у暱楠炪垺绻涚紙鐘哄厡闁虫槒鍋愮槐鎺楁偄閸撲緡浼?*:
  - 缂傚倷鑳堕崰宥囩博?闂佸搫鍊瑰妯肩磽閹剧粯鍎庢い鏃傛櫕閸?濠殿噯绲界换鎴濓耿閳ь剟鏌熼崹顐ｅ碍鐎?闂佸湱顭堝ú銈夋偩閸撗勫闁炽儱鍟块悘?闂佸憡甯楀姗€骞冮幘瀵糕枖闁逞屽墮椤曪綁宕烽鐘茬倞婵炴垶鎸告鎼佸箖閹惧鈻旈柍褜鍓涢幏瀣灳閸愯尙浜伴柣鐐寸◤閸斿酣寮查锔筋棃妞ゎ偒鍏橀崑?
  - 闂佺儵鏅╅崰妤呮偉閿濆绀嗘俊銈呭閳ь剙鍟村畷妤呭Ψ閵夈儳绋夐梺鍛婄懐閸ㄥ啿煤閸ф绠抽柕澶堝妿缁犲鏌涜箛瀣姤妞ゆ挻鎮傚畷姘跺箳閺囨ǚ鍋撻崘顭戞桨闁靛鏅╅埀顒€鍟撮弫宥囦沪閽樺顏￠柣蹇撶箲閸ㄧ厧鈻旈弴鐑嗗殨闁革富鍘惧畷鍫曟煕閹烘垶澶勭€规洘鐓℃俊?
- **闂佺懓鐏氶幐绋跨暦鏉堚晜瀚氶柛鈩冾殔閻掔厧鈽夐幘鍐差劉鐟滈绶氶弻瀣箳閹搭厽婢旈悗?*:
  - 闂佺懓鐏氶幐绋跨暦鏉堚晜鍋橀柕濞垮€楅惌宀勬倶閻愬瓨绀堥柕?闁荤姳璁查埀顒€鍟块悘濠囨倵濞戞鎴︻敄?> 0"闂佹眹鍔岀€氼剛鑺遍懠顑藉亾濞戞鎴︻敄濞嗘挸瀚夐柛顐ｇ矊閺佹粓鏌ㄥ☉妯垮闁艰崵鍠栧畷銉т沪缂併垹濡辨俊銈呭€圭湁閻庡灚甯熼妵鎰板箻閸愬樊鏋€闂佸搫鐗嗛悧鍛村船閵堝违?
  - 闂佸搫鍊瑰姗€路閸愵喖鐭楅柛蹇撴噽閻熸捇鎮峰▎鎰瑲鐟滈绶氶弻瀣箳閻愮數鐛ラ梺鍏肩湽閸庢壆绮崒娑氣枖闁逞屽墯缁嬪顢旈崟顓炵暔闁诲孩绋掕摫妞ゆ垶鐟╁鐢稿醇閻旂绱﹂梺鐟扮仛閹哥鐣烽柆宥呯婵炲棙鍔曠徊鍦磼閳ь剟鎮€电鑰块梺鍝勭墕閻楀棛鑺遍幎钘夊珘闁逞屽墴瀹曘儲鎯斿┑鍫紘婵犮垹鐏堥弲鐐碘偓姘ュ灲瀵敻顢楁担鍦暠闂佸搫鐗滄禍婵囨櫠閿曞倸纭€闁炽儱鍟块悘鐔兼煙缂佹ê濮夐柕鍥ㄥ哺婵?
- **闂佺懓鐏氶幐绋跨暦闁秴绀勬い鎿勭磿濡插牓鏌￠埀顒勵敍濞戞妲?*:
  - 濠殿噯绲界换鎴濓耿閳ь剟鏌熼崹顐ｅ碍鐎规洟浜跺顒勫级濞嗙偓婢旈梺鎼炲劚婢ц姤鏅堕弽銊р枖濠电姳鑳堕悙濠傗槈閹炬娊鍙勬い锝傛櫇閹叉挳宕奸敐鍛箣闂佸憡姊归崘鑽ゆ濞嗘挸瀚夋い鎺嗗亾婵犫偓閹绢喖绠板ù锝夘棑閻ｄ粙鏌涢弽銊у缂佽鲸宀告俊?

### Fixed

- **闂佺琚崝蹇涘箹椤愩倖濯奸柍銉ュ暱閻忓﹪鏌熼幁鎺戝姎鐟滅増绋撻幏顐﹀礃椤忓懏娈㈡繛锝呮祩閸犳牠藝?*:
  - 婵烇絽娴傞崰鏍囬弻銉ョ闁规儳鍟块獮銏⑩偓娈垮枛濠€閬嶆偘閵壯勫珰闂佸灝顑囧﹢鎾煢閳ь剟鎸婃径濠勫帓闂佸憡鎸哥粔鍫曨敂椤掑倻鍗氭い鏍ㄨ壘缂嶆捇鎮楁担鍐棈闁搞伇鍥ㄥ剭?404 婵?JSON 闁荤喐鐟辩徊楣冩倵閼恒儱绶為弶鍫亯琚濋梻鍌氬亞閸ｏ綁銆傛禒瀣櫖鐎光偓閳ь剛鍒掗悜妯尖枖闁逞屽墴瀵劑鏌呭☉婊咁槹 API 闂佺硶鏅炲▍锝夈€侀崨顖欑剨濞达絿鐡斿Λ鍛存偣鐎ｎ亜鏆熼柡浣靛€濇俊?
- **闂佸憡鐟崹鐢割敊閺嶎厽鈷掓い鏃囆掗崑鎾诡槺闁逛究鍔嶅?*:
  - 婵炴垶鎸搁幖顐﹀磻瀹ュ瀚呴柛鏇ㄥ幗缁佹煡鏌涜箛鎾虫毐闁兼潙锕︾划锝呂旈崟濠傤槹椤?`DialogDescription`闂佹寧绋戦張顒傜矓閻戣姤鈷?`DialogContent` 闂佺顕х换妤呭醇椤忓棛纾介柛婵嗗娴滃ジ鏌涘☉姗堥練妞ゆ帞鍠栨俊?
- **濠电偞鍨甸悧鎰板垂閸屾稏浜滈柛顭戝亞閳ь剦鍨伴娆徝洪鍛珦闁荤姴娴傞崹顖炲箞閵婏箑绶?*:
  - 缂備礁顦…宄扳枍鎼粹檧妲堥柛顐到閻庮厼鈽夐幘鎰佺吋妞わ絿鏅槐鎺楀礋椤忓拋鍋ㄦ繛鎴炴惄閸樻儳鈻撻幋锕€绀冩俊鐐插⒔缁嬪洭姊婚崒銈呭箹闁诡喖閰ｅ浠嬪炊閳哄﹤濮伴梺鎸庣☉婵傛棃骞堥妸锕€绶?JSX 闁荤喐鐟辩徊楣冩倵閼恒儱绶為弶鍫亯琚濋柣搴濈祷婢瑰牓宕佃閹啴宕熼鍌楀亾椤栨凹鍤堥柣鎴灻闂備焦瀵ч悷锝夊焵?

## 1.8.12 - 2026-03-14

### Features

- **濠电偞鍨甸悧鎰板垂閸屾稏浜滈柛顭戝亞缁犳帡骞栨潏鍓х暠闁搞劌閰ｅ鎼佸箛椤掍胶顩柣鐐寸◤閸斿绮崒婊呮／?*:
  - 闂佸搫鍊瑰姗€路?**闁荤姍鍐伃闁革絾鍎抽湁濞达絽鎲￠崐缁樹繆濡や礁鐏ラ柣鏂哄亾闂?* (Sankey Diagram)闂佹寧绋掑銊ッ虹捄銊﹀枂闁稿本姘ㄥ鏃傜磼閳?闂佽　鍋撻悹鍝勬惈瀵娊鏌℃径鍫濆姕缂?闂?闂佽　鍋撴い鏍ㄧ懅鐢盯鎮归幇鍫曟闁?闂?闂佽　鍋撴い鏍ㄨ壘濮ｅ鏌涘Ο娆惧殭闁?闂佹眹鍔岀€氼垳绮婇锔界厒闁瑰鍋熼妶锕傛煕閺傝濡奸柛娆忕箻瀵煡顢涘Ο宄颁壕?
  - 闂佸搫鍊瑰姗€路?**濠电偞鍨甸悧鎰板垂閸岀偛绫嶉柤鍛婎問閸炰粙鏌℃笟濠勬偧闁稿缍佸畷?* (Scatter Plot)闂?4闁诲繐绻愮换鎴濐渻閸屾凹娼╅柡鍐ｅ亾闁革附妞藉畷姘跺幢濡ゅ喚浼岄梺鎼炲劜閹锋繄妲愬┑瀣煑妞ゆ牗绻嶅鎺楁煕閺嶃劎澧柛銊ラ叄瀵悂骞囬鐘樸儵鎮归幇鎵冲亾濞戞氨妲戦梺璇″灱閸ㄧ晫妲愬▎鎰箚闁稿本鑹剧壕闈涱渻?濠电儑绲藉畷顒劼ㄦ笟鈧顕€鎳滃▓鍨杸闂佹寧绋戦ˇ顓㈠焵?
  - 闂佸搫鍊瑰姗€路?**闂佸憡顨嗗ú婊堟偡椤忓牊鐓傞柟杈惧瘜閺夋椽鏌ｉ埡浣烘憼闁哄瞼鍠栧畷?* (Histogram)闂佹寧绋掑銊у垝閾忚濯奸柍鈺佸暟鍟搁柣鐘冲姇缂嶅﹪宕抽悙顒婄矗婵犻潧妫楅梾姗€姊婚崒娑欑稇闁搞劌娴烽弫顕€宕樼捄銊ь槷闂佸憡娲橀崕宕団偓?缂傚倷绀佸Λ娆撳箰婢舵劖鈷愰柟绋挎捣閵?闂?婵犮垹鐖㈤崶鑸垫緭婵炶揪绲介柊锝夈€?濠电偞鍨甸悧鎰板垂閸岀偞鍋ㄩ悹鍥ㄥ絻閸撳ジ鏌?

### Fixed

- **闂佹悶鍎插畷姗€濡撮崘顔煎唨闁搞儮鏅╅崝顔界箾閹惧啿绾ч柣鎾愁儐缁岄亶顢欑喊杈ㄐ?*:
  - 闂備焦褰冪粔鎾疮閹炬剚娴栭柟瀛樼箘閸炪劑鏌涢妷锕€绀冨┑鈽嗗弮閹瑧鎲撮崟顕呮船闂佸搫鏈幑鍥焵椤掍焦顫楃紒棰濆亰閺佸秴鐣濋崘銊︻唶闁诲氦顫夐惌顔剧不?Label 缂傚倷绀佺€氼亜鈻庨姀銈嗘櫖閻忕偛鍚嬮崣蹇擃熆鐠鸿櫣啸濠碘槅鍙冮幃娆撴偡閻楀牆鈧磭绱掓径鎰垫殥缂佹顦靛浼村礈瑜嬫禒娑㈡煟閵娿儱顏俊顐ュ煐閿涙劕螣缁洖浜?
  - 婵炴潙鍚嬮敋閻庡灚褰冮々濂稿箣濠靛牆鏁ら梺鎼炲劜閸庡疇銇愰崨濠勭懝鐟滃秶绮╂搴濇勃闁逞屽墴濮婅崵澹曠€ｎ剛宕洪梺鎸庣☉閻倸危鐠囧樊娼伴柕蹇嬪€栧В鎰版煛閸屾碍澶勬繝鈧导鏉戝唨闁搞儮鏅╅崝顕€鏌ㄥ☉妯煎妞?婵＄偘鐒﹂崝娆撳Χ椤斿墽绀冮幖鎼厛濡?闂佹寧绋戦ˇ鎶斤綖閿旈敮鍋撻崷顓熷殌婵炲懏甯￠獮瀣敂閸涱喚鍔烽梺?

## 1.8.11 - 2026-03-14

### Performance

- **濠电偞鍨甸悧鎰板垂閸屾稏浜滈梻鍫熺⊕缁傚牓鎮跺☉鏍у闁哄瞼鍠栧畷銉╁箣閻愨晛浜剧憸宥嗘叏閳哄懎鏋侀柛顐犲劚濞呫垽鏌?*:
  - 缂備礁顦…宄扳枍鎼淬劌鐐婇柟瑙勫姂閳ь剙鍟伴埀顒€婀遍幊鎾斥枍閹烘鍎嶉柛鏇ㄤ簽缁夊绱掓径瀣潡缂佽鍟妴鎺楀煡閸涱垳顦繛瀵稿Т閹冲秶鎹㈠鑸靛仼婵炲棙鎸撮崑鎾圭疀閺冣偓椤牠骞栨潏楣冩缂佹閰ｅ浼村箻閸涱垳顦繛锝呮祩閸犳牠藝?闂佽桨鑳剁换婵堢礊鐎ｎ喖纾婚煫鍥ㄦ长?闁荤喐鐟ラ崐褰掑礉閸涙潙违?
  - 闂佸搫鐭佹禍顒佹叏閹间礁鐐婇柛鎾楀懎鐓氭繛鎴炴尨閸嬫捇鏌涘鐓庣仯闁轰降鍊楅惀顏堟濞戞瑥鈧鏌ｉ姀銏犳灈闁哄棝浜跺畷婵嬪Ω瑜庨弳浼存煕濞嗗繐鈧綊寮抽悢鍏兼櫖閻忕偞鍎抽～鎴犵磼閹呬虎婵炲瓨锕㈠畷銉╊敍濠婂嫭娈㈤悗褰掓交缁犳垿宕哄畝鍕煑鐎规洖娲ㄧ敮娑㈡煕閹烘洘纭惧┑顔规櫊閹晫鎷犻幓鎺擃棟闂佽桨娴囬崺鍥焵?
  - 濠电偞鍨甸悧鎰板垂閸岀偛绫嶉柕澶堝劚閸у﹪鏌￠埀顒勬焻濞戞粎顦伴梺鍦焾椤︽澘螞閳哄懎瀚夐柣鏂垮槻缁€瀣煕韫囨挸鏆為柣妤€鎲＄粭鐔封攽閸ヨ泛浠归梺鍝勫婢т粙鐛崶顒佹櫖閻忕偛褰為崚鎺戭熆?婵炴垶鎸撮崑鎾斥槈閹垮啩绨烽梺鍙夌矒瀵剟鎮烽悧鍫濅淮闂佸憡姊绘慨鎯?闂佹眹鍔岀€氼剚鎱ㄩ埡鍛畱濞达綀顫夊▍蹇涙煛鐎ｎ偄娈犻柍?
  - 婵烇絽娲︾换鍕汲閳ь剟鏌涢幒鎴烆棡濠㈣甯￠獮濠囧箳閹存繍娼遍柡澶屽仧閺咁偊鎮洪妷鈺傚仼闁靛鍨崇粈澶愭煕韫囨挶鍋㈤柕鍡樺姍瀹曟繈鎮╅悜妯笺偘婵炴垶鎸荤换鍐垝閿旇姤鍎熼柨鏃囨硶閻熴垹鈽夐幘鐟板惞闁搞倕娴风划娆戔偓锝庝簻缁旈箖鏌涢弮鈧粙鎺旀暜閸洖绀嗛棅顒佺ゴ閸?

## 1.8.10 - 2026-03-14

### Performance

- **濠电偞鍨甸悧鎰板垂閸屾稏浜滈梻鍫熺☉椤綁寮堕悙鑸殿棄濠殿喒鏅犲顐﹀醇濠婂懐鎲块梺纭呮珪鐢帗鎱ㄩ悙瀛樺闁瑰瓨甯楅崣蹇擃熆?*:
  - 缂備礁顦…宄扳枍鎼淬劍鍋ㄩ柣鏃囥€€閳ь剚鐗犻幆鍐礋椤愩垹浼庨柣蹇曞亹閸嬫挻鎱ㄥ┑鍕姤缂佺粯蓱缁嬪鎳犳０婵囨杸闂佸搫鍊介～澶愩€佸澶嬫櫖閻忕偛褰為崚鎺戭熆鐠鸿櫣校閻庡灚绮撳畷鐘诲传閸曨剙浠撮梺鍛婂笒濡瑦绔熼幒妤€绠犻柟鐑樺灥椤綁寮堕悙鍨珪闁宦板劦閹箖濡烽敐鍌氫壕?
  - 闂佹悶鍎插畷姗€濡撮崘顔肩闁挎稑瀚。濠氭煛閳ь剟鏌呭☉婊咁槹濡ょ姷鍋犲▍鏇犲垝閿旇姤浜ら柛銉ｅ妽鐠囩偤鏌ㄥ☉妯煎ⅵ闁逞屽墮缁绘垵危閹寸偞鍎?+ 闁哄鍋犻褎绂嶉弴鐔稿鐎广儱娉﹂埡鍛闁靛ě鍕瘞闂佹寧绋戦¨鈧紒杈ㄧ箞楠炴捇骞囬鈧壕鎶芥煕閺冨倸鞋婵炴潙娲︾粙澶娾攽閸モ晜瀚ч梺瑙勫閸犲棝鍩€?
  - 闂備焦褰冪粔鐢稿蓟婵犲洤鍐€闁炽儱鍟垮▍娆徫涢敐鍡欏ⅹ闁活偄妫欑粙澶嬫償閵忋垺纭﹂梺鍛婃煟閸斿瞼浜搁姘煎殘闁诡垱澹嗙粻鍧楁煠閸濆嫬鈧悂銆冮弮鍫熸櫖閻忕偠鍋愮粻浠嬫煟閿濆棛鎳冨┑顔规櫊楠炩偓濞达絿顭堥～锝夊级閻愭祴鍋撻悤浣圭秵闂佽澹嗛崰搴ㄦ嚐閻斿吋鈷旂€广儱瀚粔鍨殽閻愯埖纭剧憸鏉垮€搁妴鎺楀矗婢跺苯甯梺鍛娒鍛叏韫囨稑违?

## 1.8.9 - 2026-03-14

### Performance

- **濠电偞鍨甸悧鎰板垂閸屾稏浜滈梻鍫熺⊕缁傚牓鎮跺☉鏍у閻熸洖妫涢幃鎵沪閽樺娼遍柡?*:
  - 闂佸搫鍊瑰姗€路閸愩劊鈧帡宕ｆ径灞藉脯濠殿喗绺块崕瀵告崲濮椻偓楠炴帟顦查柛鈺傤殜閺佸秶浠﹂懞銉ь洯闁荤偞绋忛崝宥団偓鍨矊椤垽濡烽埡濞惧亾閸愵喗鐒婚柟閭︿邯閸ゅ鏌涢弮鍌毿繛鏉戞喘閺佸秴鐣濋崟顏嗙礆闂佺绻愮粔鎾箖閹炬湹娌煫鍥ㄦ崄鐎氭瑩鏌涘▎鎰仸閻熸洖妫濆濠氬箻閹颁礁娈奸梺濂告敱濞兼瑥鐣锋潏銊ｄ簻閻熶降鍊愰崑?
  - `DelayedRender` 闂佸搫鍊瑰姗€路?`enabled` 閻庢鍠掗崑鎾绘煕韫囨洦鍔滅紒杈ㄧ箖缁傛帡宕ㄩ鐔诲惈闂佸憡绋掗崹婵嬫嚈閹达絻浜归柟鎯у暱椤ゅ懏鎱ㄥ┑鍕姦妞ゅ骸鍟村顔炬崉閻戞ê鍓婚梺鍛婃煟閸斿秶鎲伴崱娑樿摕闁规儳婀卞▓鍫曞箹鏉堟崘绀嬮柍?
  - 婵☆偓绲鹃悧鏇㈡儓閸℃稑鐐婇柟瑙勫姂閳ь剙鍟村銊╂焻濞戞粎顦版繛鎴炴尪閸庢煡鎮ч崨濠勨枖闁煎ジ顤傞弨浠嬫偡濞嗘瑧鐣辩憸鏉垮€块弫宥囦沪閸撗勭ˇ闂佸憡鏌ｉ崝宀€浜搁鐐茬倞闁硅鍔戦埀顒€鍟粚鍗炩攽閸パ呮Х闂佺娅曠敮鎺撴叏閻愬瓨濮滈柦妯侯槸椤ゅ懘鏌熺紒妯哄缂佹鎳橀獮鎰緞鐎ｉ潧濡辨俊銈囧О閸婃挾娆㈠畡鎵虫瀻闂勫洩顣鹃梻浣搞仒闂勫秹鍩€?

## 1.8.8 - 2026-03-14

### Performance

- **濠电偞鍨甸悧鎰板垂閸屾稏浜滈梻鍫熺☉閻撴洟鏌￠崒娑欑凡鐎规洝椴搁妵鍕緞閸濄儱鏋犻梺?*:
  - 婵炴潙鍚嬮敋閻?`DelayedRender` 闁荤姴顑呴崯顐も偓鐟扮－缁敻寮介锝嗩吅闂佹寧绋掔喊宥夊闯閸ф绀夐柣妯煎劋缁佷即鏌涢敂鎯у妺婵炲懏鐟╁畷婵嬫偐閹绘帒姹?`requestIdleCallback`闂佹寧绋戦懟顖炴嚐閻旇　鍋撻悷鎷屽闁哄鏅埀顒冾潐绾板秴顪冮崒鐐查棷?缂備礁鏈钘壩涙禒瀣倞闁绘劕澧庡▓鑸电箾閹捐櫕鍣介柟顔硷躬婵?
  - 闂佸憡甯掑Λ娆撳汲鎼淬劌鐐婇柟瑙勫姂閳ь剙鍟撮獮鎰板磼濠靛洨銈伴悗鐐瑰€栭崕鑲╂崲濠婂牊鏅€光偓閸曨亞绱氶梺绋跨箰缁夋挳宕哄☉銏犳闁哄瀵ч崐闈涱熆閼哥數鐓梺鍙夌矒瀹曞爼骞戦幇鈹惧亾閸愵喖瑙﹂悘鐐跺亹椤忛亶鏌￠崘顓熺【闁糕斂鍨藉鍧楀幢閺団€冲箑濠电偞鎸稿鍫曟偂鐎ｎ喗鐒婚柣妯哄暱閻忓洤鈽夐幘鐟板惞闁搞倕娴风划娆戔偓锝庝簽濮ｇ偟鈧懓瀚崺鍥焵?
  - 闁诲海鏁搁幊鎾趁瑰Ο鍏煎仒闁靛ň鏅涚敮宕囩磽閸愭儳鏋欑紒妤€鐬肩划闈涒槈閳垛晛浜惧璺侯儐濞堝爼鏌熺拠鈥虫灈濞寸姵绋撻幏瀣级鐠恒劎鐣甸梺鍛婄墬閻楊厾妲愬┑瀣闊洦鎸惧В灞矫瑰┃鍨偓鎾惰姳娴兼潙瀚夐柣鏃傚帶濞呫垹顭跨捄铏剐ｉ悷鏇炴瀵骞橀懠顒傛喛闂備焦褰冪粔鎾囬懠顒佸闁挎稑瀚弳顒勬煏?
  - 闂佺粯鍩堥崢鍏兼叏韫囨稑鐐婇柣鎰靛墰閸欌偓闂佺锕ㄩ崑鎰板极閸楃儐鍤楁い蹇撴缁犳岸鏌?`.find` 闂佽　鍋撻梺顐ｇ缁€?`Map` 婵☆偅婢樼€氼噣宕掗妸銉殨闁哄浂浜炵粈澶愭⒒閸曨偆小缂傚秴妫涢幃浼村Ω閿旀儳顥曞┑鐐存尭瀵爼鎮＄€ｎ亶鍤曢柍褜鍓熼弻銊╁焵椤掑嫬违?
  - 婵炲瓨鍤庨崐鏍ｅΔ鍛強閹艰揪绲块惌搴ㄦ煛閳ь剟鏌呭☉婊咁槹濠电偞鎸稿鍫曟偂鐎ｎ剛椹虫繛鎴旀噰閸嬫挻寰勫畝鈧▔銏ゆ煛鐎ｎ偆鐜荤紒杈ㄧ箘缁梹绻濆顓犲綉闂佸搫鍟版慨鐢稿疾閵夛附浜ら柛銉ｅ妽婵垽鎮规笟濠勭？闁伙絽顭锋俊?

## 1.8.7 - 2026-03-14

### Fixed

- **濠电偞鍨甸悧鎰板垂閸屾稏浜滈梻鍫熺⊕閹倿鏌ｅΔ鈧懟顖毭瑰鈧浠嬪炊閿旇棄寮垮┑?*:
  - 閻庣敻鍋婇崰鏇熺┍婵犲啰鈻旈幖娣灪閺嗘粌霉閻樿秮顏堟偪閸岀偛纭€闁挎稑瀚。濠氭煕閵壯冧壕闁绘牭缍佸銊╂焻濞戞粎顦伴梺绯曟櫈濡椼劎鑺?`simple-icons` 闂佹眹鍔岀€氼剟鎮炬總绋挎闁荤喓澧楅幆鍌炴煟濡も偓閻ジ鎮″┑瀣厒闊洦姘ㄩ悢鍛偓鍨緲鐎氥劑鍩€?
  - 缂傚倷鑳堕崰宥囩博閹绢喖浼犲ù锝呮惈椤ゅ倿骞栫€涙ɑ绀夊鐟帮攻缁嬪鎯旈敐鍡╀槐闂佽偐顢婂鎾垛偓闈涚焸瀵粙宕舵搴ｎ槷婵烇絽娴傞崰鏍?闂佹悶鍎抽崑鎾绘偉閿濆棛鈻旂€广儱鎳庨崜濂告倵鐟欏媶鎴﹀蓟?闂佹眹鍔岀€氼垶鎯侀幋锕€绀嗘い鎰垫線閻掑﹦鈧懓澹婇崰鎾诲焵?

## 1.8.6 - 2026-03-14

### Fixed

- **濠电偞鍨甸悧鎰板垂閸屾稏浜滈梻鍫熺⊕缁傚牓鎮跺☉鏍у闁糕晜鐩顒侊紣娴ｈ櫣孝缂備礁顦抽濠囧箞閵婏箑绶?*:
  - 闂備焦褰冪粔鐢告倵?`DelayedRender` 濠电偞鎸稿鍫曟偂鐎ｎ剛纾奸柟鎯ь嚟閳ь剦鍨堕弫宥囦沪閽樺娼遍柡澶屽仩濡嫭鏅堕悩璇茶Е閹艰揪绲块崺鐘测槈閹绢垰浜炬繛杈剧秬濞夋洟寮妶澶婅Е閻忕偠鍋愰鍗烆熆閼哥數澧柣顏呭閳ь剙婀遍幊鎾斥枍閹烘鏅€光偓閸曨亞绱氶梺绋跨箰缁夊绮╂搴濇勃闁逞屽墴閺屽苯顓奸崱妤冪懇闂?
  - 缂備礁顦…宄扳枍鎼淬劌鐐婇柟瑙勫姂閳ь剙鍟顏堟寠婢跺﹤姹查梺鍝勫暙婢у骸鈻撻幋鐘垫／闂傚牊绋掗崐璇裁归敐鍛ゆ禍娑㈡煕閺傝濡块柡渚€绠栭弫宥囦沪閼测晝鐓傛繛锝呮处缁诲嫰寮抽埀顒佺箾閿濆倵鍋撻崘鎻掓辈闂佽桨绀侀悧濠囨倶婢舵劖鏅悘鐐插⒔鍟搁梻?婵炴垶鎸搁敃锝囩箔閸涱垱宕夐柛鎰絻琚?闁荤喐鐟ラ崐褰掑礉閸涙潙违?
  - 婵°倖顨堥崢褍霉濡綍鐔煎灳閾忣偄浠撮柣搴℃贡閹虫挸鈻嶉幒妤€鐐婇柛婵嗗閺嗘澘鈽?`200x200`闂佹寧绋戦惌鍌烆敁閸ヮ剙鍑犻柡鍫㈡暩閻熴垽鏌ｉ鍡楁瀻闁汇倕瀚板畷鍫曞箲閹扳斁鍋撻崘顏冪剨闁告繂瀚烽崵鐔兼倵閻熸媽瀚伴柛娆忕箲缁嬪鍩€椤掑嫭鍤婇弶鍫濆⒔缁€澶愭煕閹烘鏁遍柡灞斤躬瀵噣寮甸悽鐢敌㈢紓鍌氬枤閸犳洜鎹㈠璺虹濞达綁顥撻悷婵嬫煕濞嗘兘婊堝焵?

## 1.8.5 - 2026-03-14

### UI/UX Improvements

- **濠电偞鍨甸悧鎰板垂閸屾稏浜滈柛蹇撴憸缁夌厧螖閻樻彃顨欑紒槌栧弮瀹?*:
  - 闂備焦褰冪粔鐢告倵椤栫偛鐐婇柟瑙勫姂閳ь剙鍟村畷婵嬫偐閻戞銈伴梺缁橆焾閸╂牠鍩€椤戣法绛忕紒杈ㄧ箘缁梹绻濆顓犲綉闂佽桨鑳剁换婵堢礊鐎ｎ喖纭€闁绘浜粔瀵哥磼濡ゅ顓虹紒杈ㄧ箞瀵劑鏌呭☉婊咁槹闂佸憡顨愮槐鏇熸櫠閺嶎厼绀冮柛娑欐儗閳ь剙娲鍝ユ崉閾忚缍?(Skeleton) 闂佸憡姊绘慨鎯归崶顒€违?
  - 婵烇絽娴傞崰鏍囬弻銉ョ倞闁硅鍔戦埀顒€鍟村畷婵嬫偐閻戞銈伴梺鍝勫暙婢у骸鈻撻幋鐑嗘畻婵☆垰鎼濠囨偣閸濆嫬鏆辩憸鏉款樀濮婂顢氶埀顒勩€傛禒瀣櫖鐎光偓閳ь剟鍨惧Ο鑽も攳婵犻潧妫楅～锝夊级閻愯埖顥夊褏濞€瀹曘儲鎯旈敍鍕典紝闁诲繒鍋愰崑鎾剁磼鐎ｎ亜鏆遍柣锝夌畺婵?
  - 婵炴垶鎹佸銊х箔婢舵劕瑙︾€光偓閳ь剛鎮锕€鍨傞悗锝庡墯閻ｉ亶鏌涢妷锕€绀冮柕鍡楀暣閺佸秹宕奸妷锝呬还闂佹悶鍎伴崟姗€鍩€椤戣法顦﹂柛顭戜簽閹即濡搁敐鍌氫壕濞达綀顫夐悗顕€鏌￠崼顐㈠⒕缂佽鲸姘ㄩ埀顒冾潐閼归箖宕哄Δ浣侯洸闁糕剝娲滈悷鈺呮倶閻愰潧浠ф繛鍫熷灦椤ㄣ儵濡搁敂鍙ユ闁诲繒鍋涚换鎴︽偋閸楃儐鍤曢煫鍥ь儌閸?

## 1.8.4 - 2026-03-14

### UI/UX Improvements

- **濠电偞鍨甸悧鎰板垂閸屾稏浜滈梻鍫熺⊕缁傚牓鎮跺☉鏍у缂佹鐬奸弫顕€宕橀妸褎鎷辩紓鍌欑濡鈧?*:
  - 婵烇絽娴傞崰鏍囬懠顒傜當?4 闁荤偞绋戦惉鑲╃礊婢舵劕鍐€闁兼祴鏅濋幖鐓幬旈崒娴垶鍒婇悜妯侯嚤缂佸顑欓崵銈夋煠瀹勯偊鍤熸繛鍫熷灩閺侇噣寮撮悩鍨劸闂佺懓鐏氶敋鐎规洟浜堕幃褔宕惰娣囨椽姊洪鍝勫闁宠鐗犻幆鍌炲棘閵堝洨顦ーitems-start`闂佹寧绋戦ˇ顓㈠焵?
  - 婵炴潙鍚嬮敋閻庝絻灏欓弫顕€寮撮悩鍨劸闂佺懓鐏氶敋婵炲瓨锕㈠畷姗€宕ㄩ幍顔惧骄闁荤姷鍎ょ换鈧紒妤€鐭傚畷鎼佸箛椤撶姴鐏遍柡澶屽仜椤曨參宕垫惔銊︽櫖鐎光偓閸愵亞顔掓繛鎴炴尨閸嬫挻鎱ㄥ┑鍕姎閻㈩垰娲ㄧ槐鎾诲煛閸屾冻楠忛梺杞扮閻楀繘寮抽埀顒勬煟瑜嶉～鏇㈠焵?
  - 濠电偞鍨甸悧鎰板垂閸岀偛绫嶉柕澶堝劚閸у﹪鏌￠埀顒勬焻濞戞粎顦伴梺鐟板悁缁€渚€鏌﹂埡鍛闁哄诞鍐ㄤ紟闁诲繒鍋炲ú婊堝Φ濮樿鲸鏆滈柛鎰╁妿濠€浼存煥濞戞鐏辨禍娑㈡⒒閸曗晛鈧牜鍒掗幘顔肩闁靛鍎寸€氭瑩鎮圭€ｎ亜鏆為柡鍡秮瀵剟鎮烽悧鍫濅淮闂傚倵鍋撻柛顭戝櫘閸熷秵鎱ㄩ敐鍡樼厽闁?
  - 婵＄偑鍊曢悥濂稿磿閹绢喖鐐婃繛鎴烆焽閻愬﹥鎱ㄩ幒鎴濃偓浠嬶綖瀹ュ纭€闁挎稑瀚。濠氭煕閵壯冧壕闁绘牭缍佸銊╁箚瑜嬫禍锝夋煥濞戞瀚伴柤鑽ゅ枔缁辨帡鎮㈤崜渚囦紘閻庣敻鍋婇崰鏇熺┍?闂佽　鍋撴い鏍ㄧ懅鐢盯鎮楃憴鍕畵闁伙絽銈稿顒冦亹閹烘垵璧嬮梺鑲╊攰瀵挾绮仦鐐秶閻熸瑥瀚烽弨閬嶆煛瀹ュ懎妲荤紒鎲嬬節婵?

## 1.8.3 - 2026-03-14

### UI/UX Improvements

- **闂佺琚崝蹇涘箹椤愶絻浜滈梻鍫熶緱閺夎崵鈧?*:
  - 闂佸搫鍊瑰姗€路?"闂佸湱顭堝ú銈夋偩閸撗勫闁炽儱鍟块悘? 闂佸憡姊婚崰鏇㈠礂濮椻偓閺佸秶浠﹂悙顒佹闂佸綊鏅插鎺旀嫻閻旀哺鎺曠疀鎼淬劌娈濋梺鐑╂櫓閸犳鎮ラ敐鍥ㄥ闁诡垎鍛瘞闂佸憡甯掑Λ娆忥耿閳ь剟鎮楀☉娅虫垿顢栧▎鎴炲闁炽儱鍟块悘濠囨煏?
  - 婵犫拃鍛粶濠?"闂傚倸鎳忓鐟帮耿閳ь剟鎮? 濠碘槅鍨埀顒€纾涵鈧梺姹囧妼鐎氼參宕戦幘瓒佸綊顢欏▎鎯ф闂佸搫瀚绋跨暦闁秵鍋?(Tooltip)闂?
  - 婵炴潙鍚嬮敋閻庡灚鐓￠幆鍕敊閻ｅ苯鐏遍梺鍛婎殣缁辨洘鏅堕弽顓炵鐎广儱瀚粙濠囨煛瀹ュ懘鐛滅紒杈ㄧ箖閺呭爼鎮欓幓鎺濇奖闂婎偄娴傞崑鍛暤鎼达絾濯奸柍銉ュ暱閻忓﹪鏌涜箛瀣姎鐟滅増鐩俊?
  - 闂佸搫鍊瑰姗€路閸愵喗鍎庢い鏃傛櫕閸ㄨ偐绱掗銉殭闁诲海鍏橀弫宥咁潩椤撶姵袞闂佸搫鐗嗛悧鍡涙偤閵娾晛违濞撴埃鍋撴繛鍫佸洤瀚夐柛顐ｇ箘閹?闂?闂?闂?
  - 闂佸搫鍊瑰姗€路閸愵亖鍋撳☉娅虫垿顢栧▎鎴犲暗閻犲洩灏欓埀顒傚厴閺佸秴顫濋崡鐐电杸闂備礁寮堕崹顖炲焵椤戣法鍔嶆い鎺撴尦瀵敻鎮㈢划鐟颁壕濞达綁顥撻柧鍌毭瑰鍐╂儓閹煎瓨绮庨埀顒佺⊕鑿ч柍?
  - 婵炴潙鍚嬮敋閻庡灚鐓″顒勫级鐠恒劎澶?缂傚倸鍊归悧鐐垫椤愩倖鍋橀柕濞垮劚缁€瀣煥濞戞ɑ婀伴柡渚囧櫍楠炴劖鎷呯憴鍕嚱婵犮垼鍩栧畝鎼佸储閵堝洨纾炬い鏇楀亾闁靛棗绉规俊?
  - **閻庢鍠栧﹢閬嶆偘閵夆晜鐓傜€广儱妫涢埀?*:
    - "闂佸搫鍊瑰妯肩磽?缂傚倸鍊归悧鐐垫椤愶附鍎庢い鏃傛櫕閸? 閻庢鍠栧﹢閬嶆偘閵夆晜鐓傞柛銉㈡櫆閺?Shadcn UI 缂傚倷绀佺€氼亜鈻庨姀銈嗙厒鐎广儱妫涢埀顒夊灦閺佸秴鐣濋埀顒勫疾椤愶附顥堥柕蹇婂墲缁绢垶鏌涢弮鍌毿ユ鐐叉处缁傛帡鏁愰崨顓у殭闂?
    - 婵炴潙鍚嬮敋閻庝絻灏欓幃浼村Ω閵夈儳顦伴柣銏╁灠閸燁偊鎯囬鍕櫖閻忕偟鐡旈弶濠氭煕閺冨倸孝婵炲瓨锕㈠浠嬪炊椤忓棛顎€闂佸憡鏌￠弲顏嗘濠靛绠甸柟閭﹀墮绾炬娊寮堕崼鐔稿碍闁告瑥妫欓幏鍛村箻閼姐倕鐭楅梺?
- **闂佺琚崝蹇涘箹椤愶絻浜滈柣銏㈩焾濞呫垽鏌?*:
  - 闁诲酣娼х紞濠勭礊閸績妲堥柛顐到閻庮厼顪?(Consumption) 婵炴垶鎸搁…鐑姐€傞懞銉Ч閹兼番鍨绘竟鎰版煥濞戞鐒搁柛锝勫嵆閹粙濡歌閸╃姴鈽夐幘顖氫壕闂佹眹鍔岀€氼剙鐣烽柆宥嗗亱闁搞儺浜堕崯搴ㄦ偣娴ｆ祴鍋撻懠顒傛喛闂備焦婢樼粔閿嬬珶婵犲洤违?
  - 闂佸搫鍊瑰姗€路?"闂佺琚崝蹇涘箹椤愶箑绀嗛柛鈩冾殘椤? 婵°倖顨堥崢褍霉?(闂佸湱顭堥ˇ杈╂偖椤愶箑鍨傞悗锝庡墰閸╃娀鎮?闂?
  - 婵炴潙鍚嬮敋閻?"闂佽鍓濋褔鎮洪妸銉㈡瀻?闂佺儵鏅╅崰妤呮偉閿濆绠戝┑鐘冲嚬閺?闂佽鍓濋濠勭礊鐎ｎ偅浜ゆ繛鎴灻? 濠殿喗甯掗崐浠嬶綖瀹ュ纭€闁挎稑瀚。濠氭煛瀹ュ懎妲荤紒鎲嬬節婵?
  - 閻庢鍠楀ú鏍矗?`DelayedRender` 闁诲骸婀遍崑鐔肩嵁閸ャ劎顩查柕鍫濐槹閺呪晠鏌涢弬璇插闁轰胶鍋撶粙澶嬫償閵忕姵顏﹂梺鍛婃⒒婵儳霉閸ヮ剙违?
  - 闂佸搫鍊瑰姗€路閸愵喖纾奸柕濞垮妽閹牓鏌ｉ埡濠傛灍闁绘牭缍侀獮鏍ь煥閸涱厼浜堕梺鍛婃⒒閸犳洟宕楀鈧俊?

## 1.8.2 - 2026-03-13

### UI/UX Improvements

- **婵炴挻鐨滈崱娆戝骄闂佸搫绉寸换瀣椤撱垹绀?*: 婵烇絽娴傞崰鏍囬崣澶岀懝鐟滄垹绮╅悢鐓庡唨闊洦姘ㄩ鈧梻鍌氭噹缁绘垹鍒掗幘顔肩闁靛ň鏅滈敍鏍涢悧鍫叕缂佽鲸绻勯幏顐﹀礃閳哄倹顔掓繛鎴炴尭閹碱偄霉閹邦喒鍋撶憴鍕缂佹棃顥撴禒锕傚焵?(`h-screen`)闂佹寧绋戦懟顖炴嚐閻旂厧妫橀柡澶嬵儥閺?`Theme` (婵炴垶鎸搁…鐑姐€? 婵＄偑鍊楅弫璇差焽娴兼潙绀傞柕澶堝劚缂嶆捇鏌?
- **濠电偞鍨甸悧鎰板垂閸屾稏浜滈柣銏㈩焾濞呫垽鏌?*:
  - 闂佸搫鍊瑰姗€路閸愨晩娈介柕濠忓娴犳悂鎮橀悙鑼濠殿喚鍋炲顏堟寠婢跺é妤呮煟?(Skeleton Loading)
  - 婵＄偑鍊曢悥濂稿磿閹绢喖纭€闁挎稑瀚。濠氭煛閸屾稒绶叉い銈呭暣瀹曞爼鎮欓鍌氱伇 (Icons)
  - 婵°倖顨堥崢褍霉濮椻偓瀵粙宕堕埡濠傚О婵炴潙鍚嬮敋閻?(缂備礁顦板Σ鎺楀吹閿旇姤鍎熼柡鍥ュ灩閸斻儵鏌涘▎蹇撳笭闁?
  - 闂佸搫鍟ㄩ崕鍗烆啅閼姐倗纾奸柛鏇ㄤ簼椤愪粙鏌″鍛Щ缂佹墎鍓濈€电厧螣閸濆嫷鍤?(闁诲孩绋掗妵鐐电礊鐎ｎ偆鈻旈幖娣灮婢规劙鎮楀☉娆忓闁靛洤娲ㄦ禍姝岀疀濮樿鲸顔嶉梺?
  - 闂佸搫鍊瑰姗€路閸愨晜浜ら柛銉ｅ妽婵垽鏌涢敐搴ｅ帨缂佸彉鍗冲畷妤呭Ω閵壯勬嫳闂佺懓鍚嬬划搴ㄥ磼?(闂佺绻戞繛濠囧极椤撶姵瀚?闂侀潧妫旂粈渚€鏌﹂埡鍛煑闁规鍠氶幗锝夋⒑椤愩埄妲堕柍褜鍏涢悞锕€螞閳哄懎瀚夐柣鏃囨閹斤綁姊?
  - 婵炴潙鍚嬮敋閻?"閻庤鎮堕崕鎵礊閺冨牆绫?vs 闂佸憡绋忛崝宥咃耿? 闂佹悶鍎插畷姗€濡撮崘鈺冣枖闁绘垶锚閻﹀鏌?(闂佸憡绋忛崝瀣博閹绢喗鍤婇柛鎰级閸ｎ垶鏌? 濠殿噯绲界换鎴澪涢埡鍛祦闁告劕寮剁紞鍡樼箾閹存繄澧ｉ柛銊ュ€荤槐鎺楁偄濞茶鎮?
- **闂佺绻堥崝搴ㄦ偟椤栨侗妲归幖娣灮婢规劗绱撴担鍝勬瀺缂?*: 闂備焦褰冪粔鐢告倵椤栨粍灏庨柛鏇ㄤ邯閻?(Assets)闂侀潧妫旂粈渚€宕戝澶嬪珔?(Savings)闂侀潧妫斿ù鍥箲鐠鸿　鏋?(Loans) 婵＄偑鍊楅弫璇差焽娴煎瓨鏅悘鐐垫櫕鐎瑰鏌ｉ～顒€濡跨紒顔惧劋缁嬪鍩€椤掑嫭鍎嶉柛鏇ㄥ亜楠炪垽鏌ｅΔ鈧ú鈺咁敊閺囩姵濯奸幒鎶藉焵椤戣法顦︽繛瀛橈耿瀵粙宕堕敂鍓紓渚囧灥椤斿﹦绮畝鍕厐鐎广儱鐗嗛ˉ蹇涙煛閸屾繍娼愭い銏犵Ч婵?

## 1.8.1 - 2026-03-13

### Performance

- **濠电偞鍨甸悧鎰板垂閸屾稏浜滈柛顭戝亐閸嬫捁顦堕柛蹇斏戠€电厧螣閸濆嫷鍤?*:
  - 閻庢鍠楀ú鏍矗?`IntersectionObserver` 闁诲骸婀遍崑鐔肩嵁閸ヮ剙鐐婇柟瑙勫姂閳ь剙鍟撮獮濠囧箳閹存繍娼遍柡澶屽仦閺嬭崵妲愬┑鍥╊浄闁告侗鍘介煬顒佺節婵犲啳澹樺┑顔规櫊瀹曪綁顢涘┑鎰秳闂佸搫鍟抽崺鏍啺閸℃稑钃熼柟鐐閸?
  - 婵炴潙鍚嬮敋閻庨潧寮堕敍鍐冀瑜忓宀勬煕閺冨倸鞋婵炴潙娲ㄧ划鐢稿冀椤愶絾顓洪梺鎸庣☉閼活垶宕规惔銊ョ閻熸瑥瀚烽崑褎绻涢幘鍐茬骇闁绘挸顑嗛敍鍐冀瑜忓宀勬煕閵夛箑绀冮柕鍡楀暣閺佸秶浠﹂幋鎺撳攭闁圭厧鐡ㄥú婵婎暰闂佸憡鍔曢崯鍧椝囬崸妤€鐐婇柟瑙勫姂閳ь剙鍟撮悰顔炬崉閸濆嫮宀涘┑鐐存尭瀵爼鎮＄€ｎ兘鍋撴担鍐棈闁搞伇鍥ㄥ剭闁告洦鍨埀顒€顦靛Λ鍐閻樻彃鑰挎俊鐐€曞鈥澄涢懜纰夌矗婵☆垳纭堕崑?

## 1.8.0 - 2026-03-13

### Architecture

- **闂佸憡鎸哥粔鍫曨敂椤掑嫬鍑犻柤鍝ユ暩閳ь剦鍨堕弻灞筋吋閸℃瑢鍋?*: 闁哄鏅欓懗鏈电昂闂?Feature-based 闂佸搫顑堥崺鏍倵?(`src/features/*`)闂佹寧绋戦懟顖炲垂鎼达絿鐭?UI/Theme 婵炴垶鎸哥€涒晠寮抽悢鐓庣妞ゆ洍鍋撻柍褜鍓氬Σ鎺旀椤愶箑违?
- **濠碘槅鍨埀顒冩珪閸嬨儵鏌?*: 闂佺懓鍢插Λ妤呭垂?`dashboard`, `assets`, `consumption`, `savings`, `loans` 婵炴垶鎹佸▍锝団偓姘煎幘缁晝鈧綆鍓欓ˉ妤呮煙椤戭剙濯笟鈧畷绋款渻鐏忔牕浜?

### UI/UX

- **缂傚倷绀佺€氼亜鈻庨姀鈩冨劅闁规儳鍟跨壕宕囩磼?*: 闂傚倸妫楀Λ娆撳垂?`shadcn/ui` 婵?`recharts`闂?
- **闂佹悶鍎插畷姗€濡撮崘鈺傛珷闁绘劖褰冪换?*:
  - 濠电偞鍨甸悧鎰板垂閸屾稏浜滅痪鏉款槺缁愭鏌￠崒娑欑凡妞ゃ倕鍟撮悰顕€宕橀幓鎺楀彙闂佸憡甯掑Λ妤冪博闁垮娈伴柣鎾冲缁傚牓鏌曢崱鏇犲妽闁轰礁缍婂銊╊敍濠婂啰鐣鹃悷婊嗗焽閸ㄧ懓霉濮椻偓婵″瓨鎷呴崨濠冪彍闁诲海顢婇崺鏍暜閹捐埖鍋橀悘鐐插⒔閸欐挳鏌ｅΟ鎸庣【婵炲瓨锕㈡俊瀛樻媴閸濆嫬濮查梺鍛婃⒐缁嬫垵霉濡偐椹冲璺虹墐閸?
  - 闁荤姍鍐仹濡ょ姴娲﹂妵鍕枈婢跺瞼鐛ラ梺鍝勫€瑰姗€路閸愵亝灏庨柛鏇ㄤ邯閻涙挸霉閸忓吋绶查柍褜鍓涢崢褍鐣烽柆宥嗗亱闁搞儯鍎崑?
  - 闁荤姵鍔欓弨閬嶎敄濞嗘劑浜滅痪鏉款槺缁愭鏌￠崒娑欑凡妞ゃ倕鍟璇参熷ú璇插妼闁荤姳璁查埀顒€鍟块悘濠囨偠濞戞牕濡虹紒妤€鏈璇测槈濡警鍞洪梺鎼炲劙閸曟﹢鍩€?
  - 闂佺琚崝蹇涘箹椤愶絻浜滅痪鏉款槺缁愭鏌￠崒娑欑凡妞ゃ倕鍟撮幆鍕敊閻ｅ苯鐏遍柡澶嗘櫆缁嬫垹鈧濞婂畷锝夘敍濠垫劖缍婇梺鍛婄墬閻楁捇鍩€?
- **婵炴垶鎸搁…鐑姐€傛禒瀣哗妞ゆ牗绋戦惁?*: 闁诲骸婀遍崑鐔肩嵁閸ャ劎顩查柛鈩冾殘閸炪劌霉濠婂啯鎹ｇ紒顔肩У缁傛帡宕滄担鍦殸婵炴垶鎸搁…鐑姐€傛禒瀣闁搞儯鍔屾惔濠囨煛鐎ｎ厼鐓愰柣搴灦婵?

### Changed

- **缂備焦妫忛崹鎷屻亹濞戙垹鐭楁俊顖滅帛缁?*: 闂佸憡鑹惧ù鐑筋敂?API 缂備焦妫忛崹鎷屻亹濞戞碍瀚柛鎰ㄦ櫆濞堣鈽?`3006`闂?

## 1.7.0 - 2026-03-13

### Added

- 婵☆偅婢樼€氼噣鎮鹃懡銈囦笉闁挎稑瀚崐鐐翠繆椤栨せ鍋撻搹顐淮婵炴垶鎸搁敃锕傚吹鎼淬劍鏅?
  - 闂佸憡鑹惧ù鐑筋敂椤掑嫬妫橀柡澶嬵儥閺夎螞閺夊灝顏柣?CRUD 闂佽浜介崕杈亹濞戙垺鏅悘鐐靛亾閺嗘粓鏌熼梹鎰妽閻庡灚绮撳?濡ょ姷鍋熼ˉ鎰邦敊閺囩姭鍋撶憴鍕闁搞劌娴烽悮鍓х磼濡櫣浠愰梺璇″墮椤兘銆傞埡鍐笉婵°倕顑囩粈澶嬵殽閻愭潙鍔堕柛銈嗙矒瀹曟繈濡歌閸╃娀鎮规导顔哄€楃粻濠氬箹?
  - 闂佸憡鎸哥粔鍫曨敂椤掑嫬妫橀柡澶嬵儥閺夎螞閺夊灝顏柣锝堝吹缁鏁嶉崟顒€鈧偛顪冮妶鍥舵殰缂佽鲸绻堝銊╊敍濞戞妲烽柣蹇曞仦濞叉粓濡靛顓熶氦婵炴垶锚椤斿﹪鏌℃径鍡橆潐缂佽鲸鐟﹂敍鎰煥閸℃妫岄梺鍛婄墪閹碱偊宕规惔顫矗闁告洦鍣崝鍛存煟濡灝鐓愰柍褜鍏涚欢銈囨濮橆厾鈻旈幖绮规閺夊鏌涢幒鏂啃ｉ柡浣搞偢楠炴瑥顓奸崟顓犫枙

## 1.6.0 - 2026-03-13

### Added

- 婵炲瓨鍤庨崐鏍ｅΔ鍐笉闁挎稑瀚崐鐐差熆瑜忛崑娑橆啅闁秵鏅?
  - 闂佸憡鑹惧ù鐑筋敂椤掑嫬妫橀柡澶嬵儥閺夎霉濠у灝鈧牕危濡ゅ啰纾介柡宥庡墰鐢棗鈽夐幘鎶筋€楅柛銊ョ秺濮婁粙濡堕崱妤€顦查梺鍛婄懕缂嶅洨妲愬渚綰T/DELETE`闂?
  - 闂佸憡鎸哥粔鍫曨敂椤掆偓閳藉宕奸敐鍛偓顓熺箾缂堢姷鍔嶉柟绋款樀瀹曟艾螖閸曗斁鍋撻崘顔肩哗妞ゆ牗绋戦惁顕€鏌熼鍛濞寸姷濞€瀵即宕滆娴犳盯鏌熼崹顔拘＄紓宥嗘楠炴劖寰勯幇顓炲攭闂佹寧绋戦懟顖濄亹閼碱剛纾介柡宥庡墰鐢棝姊洪崣澶婄伌妞?闂佸憡甯掑Λ娑氭偖?闂佸摜鍠庡Λ妤咁敊?闂佸搫鍟悥鐓幬涢崸妤€绠ｉ柡宓啰浠奸梻鍌氬閸婃盯顢欓崶顏備汗?

## 1.5.0 - 2026-03-13

### Added

- 濠电偞鍨甸悧鎰板垂閸岀偛绀嗛柛鈩冾焽閳ь剝濮ら弲鍫曟倷閹绘帞绠掗梺?
  - 闁烩剝甯掗鍛箾瀹ュ鐐婇柣鎰靛墯閺嗘粓鏌?闂佸湱顭堥ˇ鏉课?闂佸湱顭堥ˇ鏉匡耿閳?闂佸搫鍟悥鐓幬涚捄銊ュ灊闁圭儤鍨甸濠囨煕閹烘垶澶勭€?
  - 闂佸憡甯掑Λ娑氭偖椤愶箑绠抽柟鐑樻处閺€浠嬫煛閳ь剟顢涘☉妯兼Х"Top 5/10/20"缂備焦绋掗惄顖炲焵?
  - 闂佸憡鑹惧ù鐑筋敂椤掑嫬绠抽柕澶堝劚缂嶆挸顭胯閸嬫稑顔?`groupBy` 婵?`limit` 闂佸憡鐟ラ崐褰掑汲閻旂厧缁╂い鏍ㄧ☉閻?

## 1.4.0 - 2026-03-13

### Added

- 闁荤姳绀佹晶浠嬫偪閸℃あ鐔煎灳閾忣偄浠存繛鎴炴尭閿曪箓宕垫惔銊︽櫖?
  - 闂佸憡鑹惧ù鐑筋敂椤掑嫬妫橀柡澶嬵儥閺夊鏌ｉ～顒€濡介柛鈺傜⊕缁岄亶鍩勯崘褏绀€婵烇絽娴傞崰妤呭极閸忚偐鈻旈幖杈剧磿濡叉洟鏌ｉ鑽ょ獢闁革絽鎽滅槐鏃堫敊閽樺顦查梺?
  - 闂佸憡鎸哥粔鍫曨敂椤掑嫬妫橀柡澶嬵儥閺夊鎮规担绋库挃闁汇倕妫欓妵鍕枈婢跺瞼顦梺琛″亾妞ゆ牗绋戦惁顔记庨崶璺烘灍闁轰礁銈稿浼存偨閺佸瞼鍋炵粙澶嬫償閵娿儲顏熺紓鍌氬枤閸犳牠鎯侀幋锔藉剺?
- 闂佺硶鏅炲▍锝夈€侀崨顖涘闁绘劦鍓氶悡銏犆归崗娴庮亞鈧灚鐓￠弫?
  - 闂佸搫绉村﹢鍗灻洪幏灞讳汗?`npm run dev` 闂佸憡鐟崹顖滅博閹绢喗鐓ユい鏂垮悑閸婇亶鏌￠崘顓熺【闁诡垰閰ｅ畷婵嬪Ω閵夈儺鏋€闂佸憡鑹惧ù鐑筋敂椤掑嫭鏅柛锔芥▓ncurrently闂?

## 1.3.0 - 2026-03-13

### Added

- 婵炲濯禍锝夊Υ閸愵喗鍎庢慨妞诲亾妞も晝绮妵鍕枈婢跺瞼顦〥ashboard Home闂佹寧绋戦ˇ顔剧箔閸屾粎妫柛鏍电磿缁?
  - 闂佽壈椴搁懝楣冨箖鎼达絼娌柡鍥╁О娴犳盯鏌涢幋鏂夸壕闁荤姍鍐仹濡ょ姴娲俊瀛樻媴閸忓浜鹃柡鍕箳閵堫偄霉濠х姳璁查崑鎾存媴閸忓浜鹃柡鍕箳椤︿即鏌?
  - 闁诲繒鍋炲ú婊堝Φ濮樿泛瀚夋い鎺嶇劍缁犳垿鏌￠埀顒勵敍濮橆剚鐦旈梺闈涙閻掞箓寮ぐ鎺戠闁靛鍊楅悷銏㈢磽娴ｈ灏紓?
  - 闁诲繒鍋炲ú婊堝Φ濮樿泛瀚夐柍褜鍓氬?5 缂備焦顨嗛弻褍顫濋敃鍌氬強闁规崘顕栭崬鍓佹喐閻楀牊纾荤紒妤€鐭佺粻娑㈩敃閿濆懐銈归梺鍛婃⒒閸犳洟宕楀鈧畷妤呭Ψ閵夈儳绋?

## 1.2.0 - 2026-03-13

### Added

- 闂佸憡鑹惧ù鐑筋敂椤掑嫬妫橀柡澶嬵儥閺夊鎮硅鐎氼亝顨ラ崶顒佹櫖闁革附鎮瀞et闂佹寧绋戦ˇ鎷屽暞闂佺鍕垫缂佽鲸绻堝銊╊敍濞戞妲烽柣鐘辩劍濠㈡绱炲澶嬪仢濞村吋娼欏▍?闂備胶鍋撻崕濂搞€侀幋锕€纭€?闂佽　鍋撴い鏍ㄧ懅鐢盯鎮?閻庣敻鍋婇崰鏇熺┍?闂佺鍩栧ú婵堢矈椤愩倗椹冲璺烘捣閵堫偄霉濠х姴绉剁粈鍑淩UD闂?
- 闂佸憡鎸哥粔鍫曨敂椤掑嫬妫橀柡澶嬵儥閺夊鎮硅鐎氼亝顨ラ崶鈺冧笉闁挎稑瀚崐鐐差渻閵堝浂鏆滅紒杈ㄧ箞瀵劑顢涘☉妯兼Х闁诲繒鍋炲ú婊堝Φ濮樿泛绠戦柡鍕箳閵堫偄霉濠х姴鍊稿鐑芥煕婵犲嫷鍎犻柍褜鍏涘ù鍥╃矈椤愶絿顩茬憸宥呯暦闁秵鍋嬮柛銉閻熴垹顭胯閸嬫盯宕硅ぐ鎺戠哗閻熸瑥瀚幆娆徝?

## 1.1.0 - 2026-03-13

### Added

- 闂佸憡鎸哥粔鍫曨敂椤掑倹瀚婚梺鍨儛閸庛儱顪冮妶鍛粵闁哄苯锕ラ弲?闁哄鏅滆摫妞ゆ垶鐟ч幏瀣灳閸愯尙浜?闂佸憡姊婚崰鏇㈠礂濮椻偓閺佸秹宕煎┑鍫濇暏婵炲瓨绮屾鍛婃櫠閹稿孩濯存繛鍡樻尭濞呫劌螞閻楀牏绠戠紒妤€鐭傚鐢稿醇濠婂懓绻戦梺鐓庮殠娴滄粍鎱ㄩ埡鍛闁靛ě鍛瘓闂?
- 闂佸憡鎸哥粔鍫曨敂椤掆偓閳藉宕奸敐鍛偓顓烆渻閵堝懐浠涢柡灞斤攻閺呭爼鎮欓悧鍫濇敪闂佸搫瀚幑渚€顢欓崶顏備汗?CSV 闁诲海鏁搁崢褔宕甸銏犵闁绘棁顕ч崢鎾煥濞戞澧涢柡渚囧櫍楠炴劖鎷呴崫銉梺鍛婃尭缁夊爼鎮洪锔界劵濠㈣泛顑嗛拏瀣归悩渚晣缂?

## 1.0.0 - 2026-03-13

### Added

- 闂佸憡鑹惧ù鐑筋敂椤掑嫬妫橀柡澶嬵儥閺夊鎮归幇鐗堟暠妞ゆ垶鐟╅弫宥夊捶閻栧獘n闂佹寧绋戦ˇ鎷屽暞闂佺鍕垫缂佽鲸绻堝銊╊敍濞戞妲烽柣鐘辩劍濠㈡绱炲鍥ㄥ闂佸灝顑愰崕銉╂煙椤掆偓椤兘路閸岀偛违濞达絿鏅粻閿嬬箾閸℃瑥浜炬繝鈧敓鐘叉瀬濡鑳堕悷銏ゆ煕閹绢垱娅冪紓宥嗗灴閺屽矂骞嬮敂缁樻緭闂佹寧绋戝﹢鎱燯D闂?
- 闂佸憡鎸哥粔鍫曨敂椤掑嫬妫橀柡澶嬵儥閺夊鎮归幇鐗堟暠妞ゆ垶鐟х划濠氭晬閸曨剙鈧偛顪冮妶鍥舵殰缂佽鲸绻堝銊╊敍濞戞妲烽柣蹇曞仦濞叉粓濡靛顓熶氦婵☆垱妞块崕銉╁级閳哄倻鈽夐悗瑙勫▕瀵埖骞婇柍褜鍏涢悞锕傛儊閿熺姴瀚夐柛顐悼缁犻攱绻涢崱妤€缍栧ǎ鍥э躬楠炰線顢涘▎鎴犳喛婵犫拃鍛粶闁搞劌缍婂銊ф喆閸曨剚鍎ユ繛?

## 0.9.0 - 2026-03-13

### Added

- 闂佸憡鑹惧ù鐑筋敂椤掑嫬妫橀柡澶嬵儥閺夊鏌涚仦璇插闁圭⒈鍋婇幆鍕敊閻ｅ苯鐏遍梺鎸庣☉濠€鐥憊ingsGoal闂佹寧绋戦ˇ鎷屽暞闂佺鍕垫缂佽鲸绻堝銊╊敍濞戞妲?CRUD 闂佽浜介崕杈亹濞戙垺鏅柛顐ｇ箓閺佸爼鎮?Prisma 闂佸憡鐟ラ張顒冨暞閻庢鍠栨蹇曟?
- 闂佸憡鎸哥粔鍫曨敂椤掑嫬妫橀柡澶嬵儥閺夊鏌涚仦璇插闁圭⒈鍋婇幆鍕敊閻ｅ苯鐏辩紓浣哄缁辨洟骞冩繝鍐︿簻缁炬澘顦辩粈澶愭煛閳ь剟顢涘☉妯兼Х闁诲繒鍋炲ú婊堝Φ濮樿埖鍎庢い鏃傛櫕閸ㄥジ鏌涘Δ瀣？濠⒀勭墵婵″瓨鎷呴悾宀€顔掗柟鑹版彧闂勫嫬顭囬娑氣枖閹肩补妲呴弶濠氭煕閹烘柨校闁轰礁銈搁獮娆忣吋閸曨厾鈻?

## 0.8.0 - 2026-03-13

### Added

- 濠电偞鍨甸悧鎰板垂閸屾稏浜滈柛顭戝亝閻撯偓婵犫拃鍛沪婵☆偀鏅犲鐢告偄鐠囪尙妲洪梺鎼炲劚椤曨參鎮洪锔界劵濠㈣埖绋撶粈鍕叓閸ヨ泛浜濈€规挸閰ｉ獮鎰緞閹邦厼鍞?闂佺厧顨庢禍婊堟偩閻愵剛鈻曞鑸电〒缁€鍡椻槈閹惧啿顒㈤柡浣哥秺瀵劑顢涘鍡╂蕉闂佹悶鍔岄鍛村垂韫囨稑绠?
- 闂佸憡鑹惧ù鐑筋敂椤掆偓閳藉宕奸敐鍛偓顓㈡煠鏉堛劏澹橀柟顔奸叄楠炴帡濡烽妷銉х▔闂佽　鍋撴い鏍ㄧ☉閻︻噣鏌熺粙娆炬Ч闁轰礁缍婂銊╊敍濠婂棭娼堕梺鎼炲妼椤戞垹妲愬顢綪ENSE/INCOME闂佹寧绋戦ˇ顔剧箔瀹€鍕祦闁告劖褰冮柊杈╃磼濞戞瑧娲撮柍?

## 0.7.0 - 2026-03-13

### Added

- 闂佸憡鎸哥粔鍫曨敂椤掑嫬妫橀柡澶嬵儥閺夌粯绻涙径鍫濆闁哥偠濮ら妵鍕枈婢跺瞼顦柣搴ｆ嚀閼活垶寮舵禒瀣剬閻犲洩灏欑粔?闂備緡鍋€閸嬫捇鏌涢幋鐘插妺缂佷緤濡囩划娆戔偓锝傛櫇閻?Header 闂佹椿娼块崝宥夊春濞戞矮娌柡鍥╁О娴?
- 闂備焦娼欓悺銊ヮ焽閸懇鍋撻悷鎵鐎规洖銈稿畷锟犲炊閳哄懐宕滄繛鎴炴尵閸庛倝鎮ф惔銏╂?/api/auth/me闂佹寧绋戦鐠穔en 闂佸搫鍟版慨鐢稿疾閵夆晜鍤婃い蹇撳琚熷┑鐐存尭閹虫ê鈻嶆惔銊у祦闁诡垱澹嗛崕鏌ュ级閻戝棗澧版繛鍛劥閵?

## 0.6.0 - 2026-03-13

### Added

- 濠电偞鍨甸悧鎰板垂閸屾稏浜滈柛顭戝亝閻撯偓婵犫拃鍛沪閻庡灚绮撳顕€濡烽妸顬亪鏌涢弮鈧€笛勬叏瀹€鈧惀顏堝垂椤旂晫顩繛鎴炴尭妤犳悂宕规惔锝囧暗?Top10 闂佸憡甯掑Λ妤冪博妞嬪簼娌柡鍥╁О娴?

## 0.5.0 - 2026-03-13

### Added

- 闂佸憡鑹惧ù鐑筋敂椤掑嫬妫橀柡澶嬵儥閺?JWT 闂佽皫鍡╁殭缂?濠电偛顦崝宀勫船閼恒儳鈻旈幖娣妼椤ユ垿鏌℃径濠傛殨闁煎灚鍨垮濠氬箻椤旂懓浜鹃柡鍕箳鐢棝鏌ㄥ☉妯垮闁艰崵鍠撴禍鎼佸幢濡厧顥愰棅顐㈡搐閸燁垶寮抽悢鐓庣妞ゆ棁妫勬径宥夋煕濞嗘瑧鎮奸柟鎯с偢瀹曟濡烽埡渚囨闂佸搫顦崯鈺冩崲濮樿泛绠?
- 闂佸憡鎸哥粔鍫曨敂椤掑嫬绠抽柕澶堝劚瀵娊鏌ｈ椤曆呯礊瀹ュ棎浜滈柛蹇撴憸閻?Token 闁诲孩绋掗敋闁稿绉归弫宥団偓娑樼暜shboard 闁荤姳璀﹂崹鎶藉极鏉堚晝纾奸柛鏇ㄥ亽閺夊鏌涢弮鍌毿ｆ繝鈧銏″剬閻犲洩灏欑粔鍧楁偣閸濆嫮鏋冩繛?
- 闂佸憡鎸哥粔鍫曨敂椤掑倹瀚氶梺鍨儑濠€鎾煛閳ь剟鏌呭☉婊咁槹缂傚倷鑳堕崰宥囩博鐎甸晲鐒婂ù锝囩摂濡懘鏌ㄥ☉妯肩劮闁搞倖绮撳畷婵嬪Ω閿旇棄鍔栭柣?Authorization Bearer Token

## 0.4.0 - 2026-03-13

### Added

- 闂佸搫鍊瑰姗€路?PostgreSQL + Prisma 闂佽桨鑳舵晶妤€鐣垫担瑙勫劅闁规崘顕х敮宕囩磽閸愭儳鏋熼柡瀣暙椤╁ジ鏁愯箛鏇狀槷濡ょ姷鍋為崕鑹版＂婵帞绮崝鏇㈠箖濡ゅ啰鍗?Prisma Studio 闂佺厧鐡ㄧ喊宥咃耿?
- 闂佸憡鑹惧ù鐑筋敂椤掑嫬妫橀柡澶嬵儥閺夌粯绻涢幋婵堝ⅲ闁搞劌鍊垮畷姘跺幢濡皷鍋撴禒瀣殏婵﹩鍓氶崐銈夋煙缁嬫寧澶勯柣鏍电秮楠炴帡濡烽妷銉х▔闂佹寧绋戦悧濠囨儑瑜版帒绠?闂佸湱顭堥ˇ顖炴煢閳哄懎鐭?闂佸湱顭堥ˇ顖炲垂鎼达絿灏?闂佸湱顭堥ˇ鏉课涢埡鍐╂儱閻庯綆浜滈埣銏ゆ煥?
- 闂佸憡鎸哥粔鍫曨敂椤掆偓閳藉宕奸敐鍛偓顓烆渻閵堝懐浠涢柡灞斤攻閺呭爼鎮欑€靛憡鑿囬梺璇″墲椤曆冪暦闁秵鍋嬮柛銉閻熴垽鏌熺粙娆炬Ц闂佽В鏅犲畷锝夊级閸喚鈧鎮介姘殭闁活偄绉剁划鍫ユ偖鐎靛摜顦Δ鐘靛仩閸╂牠寮鈧獮鎰媴閸撴彃娈奸梺绋跨箞閸庨亶骞冨Δ鍛殜妞ゅ繐瀚闂佸憡甯￠弨閬嶅蓟?

## 0.3.0 - 2026-03-13

### Added

- 闂佸憡鑹惧ù鐑筋敂椤掑嫬妫橀柡澶嬵儥閺夎霉濠у灝鈧牕危濡ゅ啠鍋撻悽闈涘付闁告瑥妫欑粙澶嬫償閵忋垹寮ㄩ柣鐘叉储閸ㄨ櫣鏁幘顔肩煑闁挎繂绻掔粈鍕煛閳ь剟顢涘☉妯兼Х閻庣敻鍋婇崰鏇熺┍?闂佽　鍋撴い鏍ㄧ懅鐢盯鎮?CSV 闁荤喐鐟辩徊楣冩倵娴犲违濞达絿顭堢粻鐢告⒑閹绘帞小缂佹鐬肩槐鎺楁偄濞茶鎮侀梺?
- 闂佸憡鎸哥粔鍫曨敂椤掆偓閳藉宕奸敐鍛偓顓烆渻閵堝懐浠涢柡灞斤攻閺呭爼鎮欑捄渚П闂佸憡顨嗗ú鏍敋闁秴绀傞柕澶堝€楅悷銏ゆ煛閳ь剟顢涘顒佺様濠电偟绻濋悞锕傚箰婢舵劕绀嗘俊銈呭閳ь剙鍟撮弫宥夊醇濠靛棛鈧顪冮妶澶嬫锭闁活偄绉剁划鍫ユ偖鐎靛摜顦?

## 0.2.0 - 2026-03-13

### Added

- 闂佸憡鑹惧ù鐑筋敂椤掑嫬绠抽柕澶堝劚瀵?Prisma闂佹寧绋戦張顒勫蓟婵犲啯娅犻柣鎰嚟婢瑰鐓崶褍鏆為柡鍡欏枛楠炴垿顢欐笟銉ょ窔瀹曞湱鈧絺鏅濋悷銏㈢磼閳ь剚娼幍顔荤矗闂佺粯绮犻崹浼淬€傞妸鈺佺煑婵せ鍋撻柛?
- 闁哄鏅濋崑鐐垫暜閹绢喖鏄ラ柣鏂款殠閺夎崵鈧鍠氱亸銊ф閻фゾP 闂佹眹鍨婚崰鎰板垂?闂佸搫绋勭换婵嬫偘?闂侀€涘嫎閸婃繈寮ㄩ姀銈呯哗妞ゆ牗绋戦惁顕€鏌℃担鍝勵暭鐎规挷鐒﹂幆鏃堝箻閼笺劋绀侀锝堢疀閵壯咁槷濡ょ姷鍋犻崺鏍亹娴ｅ湱鐟规繛鎴炵矤閸熷骸顭跨捄鐑樻悙闁割煈浜為幃浼村Ω閿曗偓婢跺秹鏌?
- 闂佸憡鎸哥粔鍫曨敂椤掍焦浜ら柣鎰綑婢跺秶绱掗悪鍛？闁诡喖锕ラ妵鍕枈婢跺瞼鐛ラ梺姹囧灮閸犳劙宕瑰顓熶氦闁绘劖娼欐径宥夋煟椤旂粯顦风紒妤€鐭傚畷鎰板箳閺囥劌鎮侀梺鍝勫暢缂堜即鍩€椤戞寧绁版い鏃€娲樺鍕炊瑜嶉悘娆撴偠濞戞牕濡虹紒妤€鐭傞獮姗€濡舵径瀣櫩闂佺懓鎼悧濠傤焽?

## 0.1.0 - 2026-03-13

### Added

- 闂佸憡甯楃换鍌烇綖閹版澘绀岄柡宓喚鏋€缂?Next.js 閻庤鎮堕崕鎶藉煝婵傚憡鏅柛褏銇朾/闂佹寧绋戦¨鈧紒杈ㄧ箓椤曟瑩鎼归崷顓炵秳 Dashboard 闁荤姳璀﹂崹鎶藉极鏉堚晝纾奸柛鏇ㄤ簽閻熴垽鏌涢埡鍕仩妞ゃ垹鎳愰弫顕€宕橀妸褎鎷?
- 婵犫拃鍛粶濠?TanStack Query Provider 婵炶揪绲剧划鍫㈡嫻閻旂厧绀堢€广儱娴傛导鍌炴煛娴ｅ搫顣肩€规挷鑳堕幏鐘绘煥鐎ｎ剚鍕鹃梺绯曟櫈濞咃綁銆侀崨顖涘闁绘劦鍓氶悡?
- 闂佸憡甯楃换鍌烇綖閹版澘绀岄柡宓嫬鈧數绱?Express 閻庤鎮堕崕鎶藉煝婵傚憡鏅柛褏娈檆/server闂佹寧绋戦¨鈧紒杈ㄧ箞楠炴捇骞囬鍡氱箲闂佺顑冮崕閬嶅箖瀹ュ憘娑㈠焵椤掑嫬钃熼柕澶堝€楅悷銏ゅ级閳哄啫浠﹂悽顖涙尦閹?API 婵°倗濮伴崝宥夋倶?








## 2.3.120 - 2026-04-10

### Changed

- **新增根目录一键打包发布入口**:
  - 新增根目录 `一键打包发布.bat`，双击后即可执行构建、提交、推送和触发 GitHub Actions 部署。
  - 新增根目录 `deploy-one-click.ps1`，统一处理 `server` 与 `web` 构建、自动提交、推送当前分支以及同步 `HEAD` 到 `origin/main` 的逻辑。
  - 默认复用仓库现有的 `push main -> GitHub Actions -> 非 Docker 自动部署` 链路，不再额外维护第二套本地直传服务器脚本。

### Docs

- **补充本次发布入口开发记录**:
  - 新增 `docs/根目录一键打包发布脚本开发文档.md`，文档版本为 `v1.0.0`，记录设计原因、执行流程和可选参数。
  - 更新 `docs/开发进度.md` 当前目标到 `V2.3.120`。

### Verified

- `powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy-one-click.ps1 -DryRun`

## 2.3.121 - 2026-04-10

### Changed

- **根目录一键打包发布改为本地直传服务器**:
  - 更新根目录 `一键打包发布.bat`，不再提示 GitHub 推送与 Actions，而是改为本地打包、SCP 上传、SSH 远端部署。
  - 重写根目录 `deploy-one-click.ps1`，改为读取 `wotty_DIRECT_*` 配置或交互询问服务器信息，使用 `tar`、`scp`、`ssh` 直接把当前工作区上传到 Linux 服务器。
  - 新增 `server/scripts/deploy-direct-linux.sh`，负责服务器端安装依赖、生成 Prisma Client、构建前后端、重启 `pm2` 进程并执行健康检查。
  - 直传部署默认目标目录为 `/www/wwwroot/staraccountting.sevencn.com`，覆盖 `server/` 与 `web/` 时会保留已有环境配置文件。

### Docs

- **同步根目录发布脚本文档**:
  - 更新 `docs/根目录一键打包发布脚本开发文档.md` 到 `v1.1.0`，改写为“本地直传服务器”方案说明。
  - 更新 `docs/开发进度.md` 当前目标到 `V2.3.121`。

### Verified

- `powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy-one-click.ps1 -DryRun`
- `bash -n ./server/scripts/deploy-direct-linux.sh`

## 2.3.122 - 2026-04-10

### Changed

- **根目录一键发布补齐本地配置文件自动读取**:
  - 更新根目录 `deploy-one-click.ps1`，新增对根目录 `.env`、`.env.local` 与 `deploy-config.json` 的自动读取能力，优先用本地配置填充服务器地址、端口、用户名与远端目录。
  - 新增根目录 `deploy-config.json`，按现有部署环境预填 `103.69.128.25:22011`、`root` 与 `/www/wwwroot/staraccountting.sevencn.com`，对齐 `sevencn.com` 旧版脚本的配置方式。
  - 更新根目录 `一键打包发布.bat`，明确说明脚本会先读取 `deploy-config.json` 和 `.env` / `.env.local`。
  - 更新根目录 `.env.example`，补充 `wotty_DIRECT_KEY_PATH` 入口。

### Docs

- **同步根目录发布脚本配置说明**:
  - 更新 `docs/根目录一键打包发布脚本开发文档.md` 到 `v1.2.0`，补充与 `sevencn.com` 的对齐说明和本地配置优先级。
  - 更新 `docs/开发进度.md` 当前目标到 `V2.3.122`。

### Verified

- `powershell -NoProfile -ExecutionPolicy Bypass -File .\deploy-one-click.ps1 -DryRun`
## 2.3.133 - 2026-04-10

### Changed

- **修复 Android APK 登录页卡住与 HTTP 后端被拦截**:
  - 更新 `web/capacitor.config.ts`，将 Android 本地壳统一切到 `http` scheme，并开启 `allowMixedContent`，让 APK 可直接访问当前局域网或公网的 `http://...:3006` 后端。
  - 更新 `web/src/components/shared/PWARegister.tsx`，在嵌入式运行时主动清理残留 Service Worker 与 Cache，并仅做一次受控刷新，避免旧缓存继续触发 `/auth/login?next=/auth/login` 死循环。
  - 更新 `web/src/app/auth/login/page.tsx` 与 `web/src/app/auth/register/page.tsx`，把登录/注册页互跳改成文档导航锚点，减少 Capacitor 静态导出场景下的预取干扰。
  - 更新 `web/android/app/build.gradle`，同步 Android 壳版本到 `2.3.133`。

### Docs

- **同步版本记录与迁移文档**:
  - 更新 `docs/开发进度.md`，记录本次 Android APK 登录链路修复与验证结论。
  - 更新 `docs/React重构迁移开发文档.md` 到 `v1.1.10`。
  - 新增 `历史版本/2026-04-10-修复Android混合内容拦截与登录缓存干扰.md`。

### Verified

- `web/` 目录执行 `npm.cmd run typecheck`
- 真机 `adb logcat` 确认已命中 `auth/login.html`，并定位旧问题包含 Mixed Content 拦截 HTTP 后端请求
## 2.3.134 - 2026-04-10

### Changed

- **修复 Android APK 顶部状态栏颜色偏黑**:
  - 新增 `web/src/components/shared/SystemBarsSync.tsx`，在 Android 原生壳中主动同步浅色 `theme-color`，并把系统栏图标切为深色样式。
  - 更新 `web/src/app/layout.tsx`，将全局 `themeColor` 统一为浅色值，避免系统深色模式把顶部状态栏自动渲染成暗色。
  - 新增 `web/android/app/src/main/res/values/colors.xml`，并更新 `web/android/app/src/main/res/values/styles.xml`，让启动主题和正式主题都显式使用浅色状态栏 / 导航栏，同时补上 `postSplashScreenTheme`。
  - 更新 `web/android/app/build.gradle`，同步 Android 壳版本到 `2.3.134`。

### Docs

- **同步版本记录与迁移文档**:
  - 更新 `docs/开发进度.md`，记录 Android 状态栏颜色修复。
  - 更新 `docs/React重构迁移开发文档.md` 到 `v1.1.11`。
  - 新增 `历史版本/2026-04-10-修复Android状态栏颜色偏黑.md`。

### Verified

- `web/` 目录执行 `npm.cmd run typecheck`
- `web/` 目录执行 `npm.cmd run apk:debug`
