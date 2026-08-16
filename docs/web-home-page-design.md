# Web 首页改版设计（紧凑 Hero + 财务速览条）

## 目标

解决 Web 首页“超多个模块堆积、显得臃肿”的问题。用户最终确认的根因是：**第一个模块（渐变 Hero）太大**。因此本次改版把“7 张信息卡堆叠”压缩为**单列轻量信息流**，并重点把 Hero 瘦身为紧凑横幅。随后用户反馈“内容有点少”，再补回两块真实数据卡，平衡信息密度。

## 迭代背景

- v1–v3：4 模块仪表盘（Hero 仍约 233px），多次被否。
- v4：把资产数字并入 Hero，Hero 涨到 318px，被否。
- **关键反馈：`第一个模块就是太大了我才不喜欢的`** → Hero 压到约 162px，净资产/总资产/总负债/储蓄拆出为独立的瘦身速览条（86px）。
- **趋势图去重**：收支趋势折线图消费页已有，首页不再重复添加。
- **补内容**：`内容有点少` → 加回储蓄/贷款进度卡（154px）与预算预警/待办卡。
- **压缩预警/待办卡**：`预算预警和本周待这两个模块貌似做的太高了吧` → 预算行改为单行布局、待办限 3 条，卡从 502px 压到 354px。
- **删除本周待办**：`本周待办也删除吧` → 只保留预算预警，卡降到 159px。

## 新首页结构（自上而下）

1. **本月收支汇总（紧凑 Hero，约 162px）**：蓝色渐变横幅。
   - 标题行：`本月收支汇总` + 月份选择。
   - 结余行：`本月结余 / 薪资周期结余` 大数字 + 自然月/薪资周期切换（glass toggle）。
   - 收支行：收入 / 支出 两列，各带真实较上月变化（↑/↓ 百分比）。
   - 发薪日设置仅在“薪资周期”口径下显示。
2. **财务速览（瘦身条，约 86px）**：独立白卡。
   - 主数字：真实净资产 `netWorth`（≥0 绿 / <0 红），状态徽标“资产结构健康/负债需关注”。
   - 3 列：总资产 `assetTotal` / 总负债 `liabilityTotal` / 储蓄 `totalSavings`。
3. **储蓄与贷款（约 154px）**：两条玻璃进度条。
   - 储蓄计划 `savingProgress`：已存 / 目标 / 百分比（蓝）。
   - 贷款还款进度 `loanProgress`：已还 / 总额 / 百分比（绿）。
4. **预算预警（约 159px）**：`budgetAlerts` 单行列表。
   - 行内：标题 + 「已用 ¥x / ¥y · z%」 + 状态徽标（正常/预警/超支）+ 细轨道条。
   - 无数据时显示空状态。
5. **最近记账（约 220px）**：真实流水 `summary.recent`，分类徽标 + 标题 + 类别 + 时间 + 收支金额（收绿支红），无数据时显示空状态。

## 设计要点

1. Hero 作为唯一视觉焦点，但压到最小必要高度；其余为轻量白卡。
2. 全部数字使用 `summary.ts` 真实字段，删除硬编码假 delta。
3. 净资产等资产信息从 Hero 拆出到独立速览条，避免 Hero 过高。
4. 收支趋势图由消费页承载，首页不重复展示。
5. 百分比统一经 `formatPercent` 格式化（整数直出，小数保留 1 位）。
6. 结余大数字自带自适应缩放：超宽时字号从 26px 逐步下调（≥10 位整数自动缩，永不省略号截断），hover 显示完整金额。
7. 延续 liquid-glass 白卡 + 22px 圆角风格，单列排布。
8. 移动端优先，420px 内完整显示、无横向溢出。

## 涉及文件

- `web/src/app/(tabs)/page.tsx`：Hero 改为紧凑结构（`.overview-hero-balance` + `.overview-hero-flow`）；新增 `FinanceOverviewCard` 瘦身条、`ProgressCard` 进度卡、`ReminderCard` 预算预警卡（已删本周待办）；移除首页趋势图（`TrendCard`/`TrendChart`/`buildTrendOption`/`TrendLegend` 及 `EChartsCoreOption`/`EChartView`/`HomeTrend` 引用）；删除 `DeltaLine`/`hero-asset`。
- `web/src/app/globals.css`：新增 `.overview-hero-balance`/`.balance-label`/`.overview-hero-flow` 紧凑 Hero 样式；`.finance-overview-card`/`.fo-*` 速览条样式；`.progress-card`/`.progress-item*` 进度卡与 `.reminder-card`/`.budget-alert-top` 样式；以上卡片接入 `.home-liquid-screen` 玻璃选择器组；`.overview-hero` 内边距由 `14px` 收紧到 `12px`。（`trend-*`/`budget-alert-*` 样式为消费页及本页共享，保留；`task-*` 样式随本周待办删除不再使用。）
- `web/package.json`：版本 0.0.55 → 0.0.60。
- `docs/web-home-page-design.md`：本文档。

## 验证

1. 类型检查 `pnpm typecheck` 通过。
2. 首页浏览器截图：hero(162px) + 速览条(86px) + 进度卡(154px) + 预算预警(159px) + 最近记账(220px)，无横向溢出。
3. 净资产、资产负债、储蓄/贷款进度、预算、最近流水金额均为真实数据，无硬编码假数字。
4. 百分比显示已格式化（32%、32.3%、9.3%、5.7%），无裸小数。
5. 首页不再展示本周待办与收支趋势图。
6. 结余区（右侧为口径切换按钮，可用宽约 244px）：9 位整数内保持 26px；10 位起自动缩放（25px/20px/18px），大数字完整显示不截断。
