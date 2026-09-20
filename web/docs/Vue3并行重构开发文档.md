# Vue 3 + Vite 并行重构开发文档

## 0. 文档版本

- 大版本：`v1.0`
- 小版本：`v1.8.0`
- 本次更新：在 `web-vue` 中按旧默认主题样式为首页接入总览图表模块。

---

## 1. 当前结论

当前前端入口策略已经调整为：

- 默认前端主线：`web-vue/`
- 保留旧 Next 参考工程：`web/`
- 后端继续复用：`server/`
- Android 原生壳新增对应目录：`web-vue/android/`

这样做的原因：

1. 用户当前需要看到的是完整 Vue 页面，而不是挂在旧壳里的预览页。
2. `web-vue` 已具备页面框架、登录、主题和首批业务能力，可以承担默认可见前端入口。
3. 旧 `web` 继续保留，便于对照迁移与回溯实现。

---

## 2. 本轮目标

第一阶段只做“框架复刻”，不做全量业务迁移：

1. 搭建 `Vue 3 + Vite + Pinia + Vue Router` 基础工程。
2. 复刻当前项目的登录页、注册页、工作台布局、主题切换和主路由骨架。
3. 保持主题总览入口与主题切换联动，延续 `Dashboard` 路由映射思路。
4. 接入 `Capacitor Android` 基础目录与配置，保证后续可继续接 Android 壳。
5. 在根目录补充 `dev:vue`、`build:vue`、`start:vue` 等并行命令。

---

## 3. 当前目录边界

### 保留

- `web-vue/`
- `server/`
- `web/` 旧 Next 参考工程

### 本轮删除

- `web/src/app/vue-preview/page.tsx`
- `web/public/vue-preview-app/`
- `scripts/sync-vue-preview.mjs`

### 持续保留文档

- `web-vue/android/`
- `docs/Vue3并行重构开发文档.md`

---

## 4. 已完成内容

### 4.0 第二阶段增量

- 已新增 Vue 主线 API 基础层：
  - `runtime.ts`：处理浏览器 / 原生壳 API 地址解析
  - `api.ts`：统一处理鉴权头、超时、接口错误和 401 清会话
- 已将 Vue 主线登录从本地假登录升级为真实接口：
  - `/api/auth/login`
  - `/api/auth/me`
- 已将 `/assets` 从占位页升级为真实业务页，直接读取 `/api/assets`
- 已实现会话恢复与受保护路由登录校验

### 4.0.1 第三阶段增量

- 已新增第一批 `ui` 基础组件：
  - `AppButton.vue`
  - `AppInput.vue`
  - `AppCard.vue`
  - `AppProgress.vue`
- 已新增第一批 `shared` 公共组件：
  - `PageContainer.vue`
  - `EmptyState.vue`
  - `SkeletonBlock.vue`
  - `StatsCardSkeleton.vue`
  - `ChartSkeleton.vue`
  - `CardListSkeleton.vue`
  - `ListTableSkeleton.vue`
  - `SidebarNav.vue`
  - `TopHeader.vue`
  - `MobileBottomNav.vue`
- 已将 `AppShell`、登录页、注册页、总览页、主题页、资产页和占位页接入这些公共组件。

### 4.0.2 第四阶段增量

- 已新增消费页数据层：
  - `web-vue/src/features/consumption/api.ts`
  - `web-vue/src/features/consumption/emptyData.ts`
- 已扩展 Vue 消费页类型模型。
- 已将 `/consumption` 从占位页切换为真实主题业务页：
  - 支持本月 / 全部 / 自定义时间筛选
  - 支持按月 / 按年切换
  - 展示平台分布、商户排行、趋势与最近交易
- 已让消费页在当前主题框架下呈现更偏默认版或 analytics 的视觉风格。

### 4.0.3 第五阶段增量

- 已新增储蓄页数据层：
  - `web-vue/src/features/savings/api.ts`
- 已扩展 Vue 储蓄页类型模型。
- 已将 `/savings` 从占位页切换为真实主题业务页：
  - 展示已储蓄金额、目标总额、整体进度
  - 展示目标状态分布、储蓄目标列表和储蓄相关流水
- 已让储蓄页在当前主题框架下呈现更偏默认版或 analytics 的视觉风格。

### 4.0.4 第六阶段增量

- 已新增共享弹层与复杂表单组件：
  - `AppModal.vue`
  - `AppSelect.vue`
  - `AppTextarea.vue`
  - `FormField.vue`
- 已新增贷款页数据层与真实主题业务页：
  - `web-vue/src/features/loans/api.ts`
  - `web-vue/src/features/loans/emptyData.ts`
  - `web-vue/src/views/LoansView.vue`
- 已为储蓄页补齐操作链路：
  - 新增目标
  - 编辑目标
  - 初始化计划
  - 编辑月度计划
  - 储蓄取款
- 至此，资产 / 消费 / 储蓄 / 贷款四条核心业务页都已落到 `web-vue` 主线。

### 4.0.5 第七阶段增量

- 已新增中层公共组件：
  - `AppConfirmDialog.vue`
  - `FilterToolbar.vue`
  - `ChartPanel.vue`
  - `DataTable.vue`
- 已新增总览页数据层：
  - `web-vue/src/features/dashboard/api.ts`
- 已将首页从迁移说明板替换为真实业务总览页：
  - 核心 KPI
  - 预算提醒
  - 核心态势
  - 最近流水
  - 首页筛选工具条

### 4.0.6 第八阶段增量

- 已按旧 `DefaultDashboard` 默认主题样式补齐首页图表模块：
  - 收支趋势
  - 渠道结构
  - 重点分类
  - 资金健康
  - 重点信号
- 图表数据继续复用现有总览接口，并在 Vue 端基于真实流水做聚合。

### 4.1 Vue 工程骨架

- 新建 `web-vue/` Vite + Vue 3 + TypeScript 工程。
- 接入 `pinia`、`vue-router`、`lucide-vue-next`、`@capacitor/core`、`@capacitor/android`、`@capacitor/cli`。
- 新增 `capacitor.config.ts`，沿用 Android 混合内容与 `CAP_SERVER_URL` 动态注入思路。

### 4.2 框架页面与路由

- 新增启动页、登录页、注册页、404 页。
- 新增统一工作台壳 `AppShell.vue`，包含桌面侧边栏、顶部头部和移动底部导航。
- 复刻主路由入口：
  - `DefaultDashboard`
  - `AnalyticsDashboard`
  - `OrangePurpleDashboard`
  - `DustyBlueDashboard`
  - `VibrantDashboard`
  - `CharmingPurpleDashboard`
  - `WhiteGridDashboard`
  - `assets`
  - `consumption`
  - `savings`
  - `loans`
  - `connections`
  - `ai`
  - `data`
  - `budgets`
  - `themes`
  - `settings`
  - `about`
  - `admin`

### 4.3 主题体系

- 新增 Vue 版主题注册表与主题 token 应用逻辑。
- 首批接入与现有主线一致的主题 ID：
  - `default`
  - `analytics`
  - `orange-purple`
  - `dusty-blue`
  - `vibrant`
  - `charming-purple`
  - `white-grid`
  - `graphite`
  - `spruce`
  - `terracotta`
  - `nova`
  - `midnight`
  - `frost`
- 主题切换后自动跳转到该主题对应的 Dashboard 默认入口。

### 4.4 Android 基础链路

- 已执行 `npx cap add android`，生成 `web-vue/android/`。
- 已完成首轮静态构建并成功复制前端产物到 Android 原生目录。

---

## 5. 当前限制

本轮先解决“可运行骨架”，以下内容仍待后续阶段迁移：

- 真实登录接口与 JWT 会话恢复
- 资产 / 消费 / 储蓄 / 贷款真实业务组件
- 图表、筛选器、弹窗与复杂表单
- Android 联调壳一键脚本
- Vue 版正式 APK 打包脚本
- Vue 类型检查链单独收口

说明：

- 当前 `web-vue` 的构建已切到 `vite build`，先保证预览产物与 Android 目录可生成。
- `vue-tsc` 工具链在当前环境里存在依赖包异常，后续单独做工具链修复，不阻塞框架迁移。

---

## 6. 下一阶段建议

建议按下面顺序继续迁移：

1. 登录与鉴权恢复链路
2. 资产页
3. 消费页
4. 储蓄页
5. 贷款页
6. 数据、连接、设置与关于页
7. Android 联调壳脚本与发布链路

---

## 7. 运行命令

根目录：

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

进入 `web-vue/`：

```bash
npm run dev
npm run build
npm run cap:sync:android
npm run cap:open:android
```

说明：

- 根目录默认 `dev/build/start` 已切到 `web-vue`
- 旧 `web` 只保留为参考工程，需通过 `legacy` 脚本手动启动

---

## 8. 验收标准

第一阶段验收以“框架复刻完成”为准：

1. `web-vue/` 可以成功构建静态产物。
2. 登录、注册、总览、主题页与各占位业务页都可访问。
3. 主题切换后，Dashboard 默认入口能随主题变化。
4. `web-vue/android/` 已生成，可继续用于后续原生壳联调。
5. 默认可见前端已切换到 `web-vue`，旧 `web` 保留为参考工程而不再作为默认入口。
