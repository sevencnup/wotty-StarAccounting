# 2026-04-15 - web-vue 首页图表切换为 ECharts

## 本次目标

把 `web-vue` 首页里当前手写的折线图、柱图和环图替换为真正的 ECharts 实现，作为后续业务页统一图表方案的起点。

## 本次交付

- 更新依赖：
  - `web-vue/package.json`
  - `web-vue/package-lock.json`
- 更新首页图表：
  - `web-vue/src/views/DashboardHomeView.vue`
- 更新图表容器样式：
  - `web-vue/src/style.css`

## 本次替换

- 收支趋势主图改为 ECharts 折线面积图
- 右侧表现图改为 ECharts 柱状图
- 渠道结构图改为 ECharts 环图
- 保持首页原有参考布局结构不变，只替换图表实现层

## 实现说明

- 使用 `vue-echarts` 承载 Vue 组件
- 按需注册 `LineChart`、`BarChart`、`PieChart`、`GridComponent`、`TooltipComponent`、`LegendComponent` 和 `CanvasRenderer`
- 继续复用现有真实总览聚合数据，不额外引入假数据

## 验证

- `npm --prefix web-vue run build`
- VS Code Diagnostics 检查通过，当前无新增显式诊断错误

## 风险提示

- 接入 ECharts 后，`web-vue` 当前生产构建主包明显变大
- 后续建议继续做首页图表按需拆包或懒加载

## 后续建议

继续推进：

1. 让资产、消费、储蓄、贷款页图表统一到 ECharts
2. 拆分首页图表代码，降低主包体积
3. 继续收口 tooltip、legend、配色和旧默认主题的细节一致性
