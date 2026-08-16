# Web 消费页图表模块优化

## 目标

消费页顶部收据卡用户认可（保留不动）。其余图表模块做质感与可读性优化，与首页液态玻璃风格统一。

## 迭代背景

- 收据 Hero（米色 #fffaf7、打孔、虚线分隔）用户反馈「设计的还不错」→ **保留不改**。
- 其余卡均为 `.home-card` 液态玻璃白卡（22px 圆角、`rgba(255,255,255,0.7)`、`tabs-liquid-shell` 包裹），与首页一致，无需动卡片外壳。
- 优化点集中在 3 处：日历热力图色阶/圆角、桑基图横向滚动提示、趋势折线图可读性。

## 改动明细

1. **每日支出日历（`.calendar-day`）**
   - 圆角 5px → 8px；空态底色 `#f0f5ff` → `#f4f7fb`，边框更淡。
   - 四级色阶对齐品牌蓝渐变（`#0060c0 → #3a86d6`）：`level-1 #e7f0ff`、`level-2 #b9d4ff`、`level-3 #3a86d6`（白字）、`level-4 #0060c0`（白字）。
   - 格子间距 4px → 3px，更紧凑。
2. **消费流向图（`.sankey-scroll`）**
   - 右缘加白色渐变遮罩（`::after`，30px），提示可横向滑动。
3. **本月收支趋势折线图（`buildTrendOption`）**
   - y 轴开启淡虚线分隔线，方便读值。

## 涉及文件

- `web/src/app/globals.css`：`.calendar-day` 系列、`.calendar-grid/.calendar-week-row` 间距、`.sankey-scroll::after`。
- `web/src/components/stark/ConsumptionCharts.tsx`：`buildTrendOption` 的 yAxis `splitLine` 由 `{ show: false }` 改为淡虚线；`buildSankeyOption` 的 `left` 由 8px 增到 22px，缓解左侧微信节点贴边。
- `web/package.json`：版本 0.0.63 → 0.0.65。
- `docs/web-consumption-page-design.md`：本文档。

## 验证

1. 类型检查 `pnpm typecheck` 通过。
2. 消费页 420px 截图：日历格子 8px 圆角、四级品牌蓝（#e7f0ff/#b9d4ff/#3a86d6/#0060c0，后两级白字）、间距 3px；桑基右缘白色渐变提示生效；趋势图渲染 5 条淡虚线横向网格线（y=380/397/422/447/472）。
3. 无横向溢出（body 420 = viewport 420，各卡右缘齐 412）。
4. 唯一 console 报错为 `api-sync` 8080 连接失败，与页面无关。
5. 收据 Hero 保持原样未动。
