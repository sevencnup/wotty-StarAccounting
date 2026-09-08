# 记账类型分段控件对齐与圆角几何修复开发文档

## 1. 需求与问题诊断

在记账弹窗的“支出 / 收入 / 转账”分段切换栏中，当前样式使用 `border-radius: 999px` 纯胶囊结合 `flex: 1`。
由于左侧“支出”处于容器最外侧半圆处，其 999px 圆角与外容器胶囊圆角在 3px padding 下产生重叠挤压，导致：
- “支出”选中时贴满左侧边缘，上下灰槽被吞噬，显得尺寸过大、无内嵌感；
- “收入”和“转账”在直边区域，四周灰槽间距明显，产生视觉上“收入/转账高度/位置与支出不一致”的高低错觉。

本次优化目标：
- 采用规范的同心圆角分段控件设计（外层 `border-radius: 12px; padding: 3px`，内层 `border-radius: 9px; height: 32px`，外层总高 `38px`）。
- 使用 `display: grid; grid-template-columns: repeat(3, 1fr)` 确保三个 tab 宽度均等对称。
- 保证“支出”、“收入”、“转账”在激活与未激活时，四周的浅灰凹槽间隙（3px）与圆角完全对称统一，彻底消除高低差。

## 2. 影响范围

- `docs/web-type-switch-alignment-fix.md`
- `web/src/app/globals.css` (`.modern-type-switch`, `.type-tab`, `.type-tab.active`)

## 3. 实施步骤

- [x] 步骤 1：创建修复开发文档。
- [x] 步骤 2：重构 `globals.css` 中的 `.modern-type-switch` 与 `.type-tab` 样式，应用 Grid 布局与同心圆角规范。
- [x] 步骤 3：运行类型检查、单元测试与生产构建验证。
- [x] 步骤 4：按规范完成本地 Git 提交并汇报。
