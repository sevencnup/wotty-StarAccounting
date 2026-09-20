# Expo 原生 App 开发计划文档
## 0. 文档版本

- 大版本：`v1.0`
- 小版本：`v1.0.1`
- 本次更新：在 Expo 原生 App 计划基础上同步 Flutter 清理后的仓库边界，明确 `flutter_app/` 已删除归档，移动端如需新开 App 应直接走 `expo_app/`。

---

## 1. 背景

当前仓库的前端边界已经比较清楚：

- `web/`：正在运行的 `Next.js + React + TypeScript` Web 主线
- `flutter_app/`：上一轮 Flutter 迁移实验产物，现已从仓库删除，仅作为历史归档背景提及

结合最近几轮切换结论，当前问题已经比较清楚：

1. Web 后台继续使用 `Next.js + React` 是合理的，因为现有页面、路由、主题系统和后端 API 都已经打通。
2. 如果把 Web 再套一层壳做 App，本质仍然是 WebView，移动端交互和复杂图表体验上限有限。
3. 如果目标是做“真正的手机 App”，优先级更高的方案应该是 `Expo + React Native`，而不是继续在 `Next.js` 上做 App 套壳。

结论：

- **Web 主线不变，继续用 `web/`。**
- **移动端 App 新开 `Expo` 工程独立开发。**

---

## 2. 技术决策

### 2.1 总体方案

- Web 前端：继续使用 `web/` 下的 `Next.js + React + TypeScript`
- App 前端：新增 `expo_app/`，使用 `Expo + React Native + TypeScript + Expo Router`
- 后端：继续复用 `server/` 下现有 `Express REST API`
- 鉴权：继续使用当前 `JWT Bearer Token`
- 数据请求：App 侧继续使用 `@tanstack/react-query` 思路做缓存与请求状态管理

### 2.2 为什么不用 Next.js 套壳作为 App 主方案

- 套壳后依旧是 WebView，本质上还是“网页装进 App”
- 导航、手势、长列表、复杂动画、重图表场景的体验上限不如原生渲染
- 后续如果要接入更多移动端能力，壳方案会越来越偏“补洞”

### 2.3 为什么选择 Expo

- 对 React 技术栈更友好，上手成本比完全原生更低
- 可以更稳定地接入 Android / iOS 能力，不依赖 WebView
- 适合先做 MVP，再逐步把高频核心功能迁过去

### 2.4 当前不做的事

- 不把 `web/` 页面直接硬搬成 App 页面
- 不恢复已删除的 `flutter_app/` 或任何 Flutter 试验目录
- 不把 `Capacitor` 作为移动端主线方案，最多保留为低优先备选

---

## 3. 目标

本轮 Expo 方向的目标不是“一次性全量重做”，而是分阶段落地：

1. 新建一个真正可运行的原生 App 工程
2. 先打通登录、鉴权恢复、底部导航、主题基础能力
3. 优先完成高频页面：总览、消费、资产
4. 再逐步补齐储蓄、贷款、预算、数据、连接、设置、AI 等页面
5. 最终形成“Web 后台 + 原生 App”双端并行架构

---

## 4. 目录规划

建议新增目录：

```text
expo_app/
```

建议内部结构：

```text
expo_app/
  app/
    (auth)/
      login.tsx
    (tabs)/
      dashboard.tsx
      consumption.tsx
      assets.tsx
      settings.tsx
    _layout.tsx
  src/
    components/
    features/
      dashboard/
      consumption/
      assets/
      savings/
      loans/
      budgets/
      data/
      connections/
      ai/
      settings/
    lib/
      api/
      auth/
      query/
    theme/
    types/
```

目录原则：

- `web/` 和 `expo_app/` 分开维护，不互相覆盖
- 后续如果复用类型或通用常量，再单独抽 `packages/shared/`
- 在 App 正式落地前，不急着做大范围跨端抽象

---

## 5. 分阶段执行计划

### 阶段 A：基础工程搭建

1. 初始化 `Expo + TypeScript + Expo Router`
2. 建立 `.env`、API Base URL、构建环境区分
3. 接入 ESLint、TypeScript、基础目录结构
4. 配置 Android 包名、应用名、图标、启动图

阶段验收：

- `expo_app/` 可以在 Android 模拟器或真机正常启动
- 基础路由和空页面切换正常

### 阶段 B：鉴权与应用骨架

1. 新建 `AuthProvider`
2. 用 `expo-secure-store` 保存 JWT
3. 封装 App 侧 API Client
4. 接入 `React Query`
5. 完成登录页、登录恢复、退出登录
6. 完成底部导航或 Tab 骨架

阶段验收：

- 登录成功后可进入主界面
- 关闭 App 再打开能恢复登录态
- Token 失效后能正确回到登录页

### 阶段 C：第一批核心业务页

优先落地：

1. `dashboard`
2. `consumption`
3. `assets`

执行重点：

- 先保证信息结构和主要交互完整
- 不要求一开始就和 Web 视觉完全一比一
- 图表优先做“稳定可用”，再做“高级表现”

阶段验收：

- 三个核心页可正常展示真实数据
- 页面切换流畅，无明显白屏和阻塞

### 阶段 D：第二批业务页补齐

按优先级推进：

1. `savings`
2. `loans`
3. `budgets`
4. `data`
5. `connections`
6. `settings`
7. `ai`

阶段验收：

- 高频核心业务能力可在 App 内完成闭环
- 非核心页面允许先做轻量版本，不强求一步到位

### 阶段 E：移动端专项能力

视实际需要接入：

1. 文件导入
2. 相册 / 图片选择
3. 系统分享
4. 推送通知
5. 原生更新与发版流程

---

## 6. 共享与复用边界

### 6.1 可以复用的部分

- `server/` 后端接口
- 现有接口字段定义和业务规则
- 账户、交易、预算、分类等领域模型
- 大部分筛选参数和查询逻辑

### 6.2 不能直接复用的部分

- `web/src/` 下的页面组件
- Web 的布局、CSS、主题样式写法
- 基于 DOM 的图表和交互组件

### 6.3 建议的复用方式

- 先复制“业务规则”，不要复制“页面实现”
- App 端重新组织 UI，但尽量沿用 Web 的数据结构和命名
- 等 App 跑通后，再决定是否抽公共包

---

## 7. 图表与性能策略

这是 Expo 方案最需要提前说清楚的部分。

### 7.1 基本原则

- App 端不要继续依赖 Web 图表组件
- 优先选择 React Native 生态内可维护、性能稳定的图表方案
- 长列表统一优先考虑虚拟化列表

### 7.2 推荐策略

- 普通统计图：优先 `react-native-svg` 体系方案
- 高频滚动列表：优先 `FlashList`
- 如果后续总览页图表仍然吃性能，再对单个模块升级为更高性能的绘制方案

### 7.3 性能目标

- 首屏不出现长时间空白
- Tab / 页面切换保持快速响应
- 图表页滚动和筛选时不出现明显掉帧

---

## 8. 视觉与交互策略

App 端不建议直接照搬 Web 后台布局。

建议原则：

1. 信息结构延续 Web
2. 交互方式按移动端重做
3. 图表、卡片和筛选器优先为单手操作优化
4. 复杂筛选弹层、表格、大面积横向布局都需要改成移动端版本

---

## 9. 风险与注意事项

1. `Expo` 不是“零成本复用现有 Web 页面”，UI 需要重新实现。
2. 如果一开始就追求所有页面和 Web 端完全一致，开发周期会被明显拉长。
3. App 侧图表方案选型太晚，会在中后期反复返工。
4. 如果过早抽公共包，容易把 Web 和 App 都绑死，增加维护成本。

---

## 10. 建议的第一阶段里程碑

建议先以一个最小可交付版本为目标：

### 里程碑 M1

- 新建 `expo_app/`
- 完成登录、鉴权恢复、底部导航
- 完成总览页基础版

### 里程碑 M2

- 完成消费页和资产页
- 接入真实数据与基础图表

### 里程碑 M3

- 打通 Android 内测包
- 完成第一轮真机体验验收

---

## 11. 当前结论

对这个项目来说，更务实的路线是：

- `web/` 继续承担 Web 后台主线
- App 端不要再走 WebView 套壳作为主方案
- 新建 `expo_app/`，用 `Expo + React Native` 做真正的移动端
- 先做核心高频页，再补齐长尾页面

这条路线的好处是：

- Web 端现有成果不推倒重来
- App 端能获得比套壳更好的体验上限
- 后端 API 可以继续复用
- 后续 Android / iOS 双端扩展更自然
