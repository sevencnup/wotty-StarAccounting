# Web 首页改版设计（紧凑 Hero + 财务速览条）

## 目标

解决 Web 首页“超多个模块堆积、显得臃肿”的问题。用户最终确认的根因是：**第一个模块（渐变 Hero）太大**。因此本次改版把“7 张信息卡堆叠”压缩为**单列轻量信息流**，并重点把 Hero 瘦身为紧凑横幅：结余（可切换口径）→ 收支速览条 → 最近记账。

## 迭代背景

- v1–v3：4 模块仪表盘（Hero 仍约 233px），多次被否。
- v4：把资产数字并入 Hero，Hero 涨到 318px，被否。
- **关键反馈：`第一个模块就是太大了我才不喜欢的`** → Hero 压到约 162px，净资产/总资产/总负债/储蓄拆出为独立的瘦身速览条（86px）。
- **趋势图去重**：收支趋势折线图消费页已有，首页不再重复添加，保留三模块。

## 新首页结构（自上而下）

1. **本月收支汇总（紧凑 Hero，约 162px）**：蓝色渐变横幅。
   - 标题行：`本月收支汇总` + 月份选择。
   - 结余行：`本月结余 / 薪资周期结余` 大数字 + 自然月/薪资周期切换（glass toggle）。
   - 收支行：收入 / 支出 两列，各带真实较上月变化（↑/↓ 百分比）。
   - 发薪日设置仅在“薪资周期”口径下显示。
2. **财务速览（瘦身条，约 86px）**：独立白卡。
   - 主数字：真实净资产 `netWorth`（≥0 绿 / <0 红），状态徽标“资产结构健康/负债需关注”。
   - 3 列：总资产 `assetTotal` / 总负债 `liabilityTotal` / 储蓄 `totalSavings`。
3. **最近记账（约 220px）**：真实流水 `summary.recent`，分类徽标 + 标题 + 类别 + 时间 + 收支金额（收绿支红），无数据时显示空状态。

## 设计要点

1. Hero 作为唯一视觉焦点，但压到最小必要高度；其余为轻量白卡。
2. 全部数字使用 `summary.ts` 真实字段，删除硬编码假 delta。
3. 净资产等资产信息从 Hero 拆出到独立速览条，避免 Hero 过高。
4. 收支趋势图由消费页承载，首页不重复展示。
5. 延续 liquid-glass 白卡 + 22px 圆角风格，单列排布。
6. 移动端优先，420px 内完整显示、无横向溢出。

## 涉及文件

- `web/src/app/(tabs)/page.tsx`：Hero 改为紧凑结构（`.overview-hero-balance` + `.overview-hero-flow`）；新增 `FinanceOverviewCard` 瘦身条；移除首页趋势图（`TrendCard`/`TrendChart`/`buildTrendOption`/`TrendLegend` 及 `EChartsCoreOption`/`EChartView`/`HomeTrend` 引用）；删除 `DeltaLine`/`hero-asset`。
- `web/src/app/globals.css`：新增 `.overview-hero-balance`/`.balance-label`/`.overview-hero-flow` 紧凑 Hero 样式；`.finance-overview-card`/`.fo-*` 速览条样式并接入 `.home-liquid-screen` 玻璃选择器组；`.overview-hero` 内边距由 `14px` 收紧到 `12px`。（`trend-*` 样式为消费页共享，保留。）
- `web/package.json`：版本 0.0.55 → 0.0.57。
- `docs/web-home-page-design.md`：本文档。

## 验证

1. 类型检查 `pnpm typecheck` 通过。
2. 首页浏览器截图：hero(162px) + 速览条(86px) + 最近记账(220px)，无横向溢出，无趋势图。
3. 净资产、资产负债、最近流水金额均为真实数据，无硬编码假数字。
4. 像素采样确认蓝色渐变区止于 ~200px（紧凑），下方为白卡。
