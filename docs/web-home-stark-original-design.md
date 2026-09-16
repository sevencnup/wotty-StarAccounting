# Web 首页 Stark 原创轻盈设计重构开发文档

## 1. 设计原则与去同质化目标
摒弃对特定第三方 App（如支付宝）界面的元素套用，基于 **Wotty Stark** 自身的品牌调性（现代、通透、数据驱动、高效），构建完全原创的轻盈财务仪表盘：

1. **Stark 晶透浮岛 (Crystal Island Hero)**：
   - 移除月份大斜体水印及仿制渐变。
   - 采用冷白微晶高斯模糊质感（Glassmorphism），搭配左侧健康度光标（Status Orb）与右侧微型走势曲线（Sparkline）。
   - 结余/支出/收入平滑切换，轻量透明。
2. **AI 财务诊断条 (Stark Diagnostics)**：
   - 胶囊卡片形式，由情绪标签（🟢 良好 / 🟡 关注 / 🔴 超支）+ 简洁行动建议构成。
3. **四维财务罗盘 (Financial Compass Matrix)**：
   - 采用 2×2 资产/预算/负债/储蓄 四象限高质感卡片组，自带微型视觉标识，告别简单四方块堆叠。
4. **Stark 收支平衡走势图 (Cash Flow Wave)**：
   - 原创平滑曲线与收支柱状对比，清晰直观。

---

## 2. 实施步骤

- [x] **步骤 1：重构 `app/src/app/(tabs)/page.tsx` 页面组件**
  - 构建 `StarkCrystalHero`、`StarkDiagnosticBanner`、`StarkCompassMatrix`、`StarkCashflowTrend`、`RecentFeed`。
- [x] **步骤 2：更新 `app/src/app/globals.css` 样式**
  - 移除 `alipay-` 命名的同质化样式，构建 Stark 专属晶透浮岛、四象限罗盘等专属 CSS。
- [x] **步骤 3：构建与类型校验**
  - 运行 `next build` 确保 TypeScript 类型与静态导出正常。
- [x] **步骤 4：更新开发文档并完成本地 Git 提交**

---

## 3. 验收标准
1. 视觉保持通透轻盈、不压抑，但整体排版与视觉元素具有 Stark 专属原创风格。
2. 所有数据联动、Tab 切换与直达跳转正常工作。
3. 构建测试 100% 通过。
