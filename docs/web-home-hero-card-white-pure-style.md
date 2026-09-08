# 首页顶部总览卡纯白极简风格改造开发文档

## 1. 需求与目标

- 去除首页顶部总览卡（`stark-hero-card`）原有的渐变背景（包括 Three.js 渐变材质渲染）。
- 将该卡片调整为纯白底色（`#ffffff`），保持与下方罗盘、分类、建议卡片一致的视觉语言（统一细边框与柔和阴影）。
- 保留背景中的月份英文大水印文字（如 "Jan"、"Feb" 等），保持通透和层次感。
- 梳理右下角“添加薪资收入”入口：移除原先耦合 Three.js 渐变切角的悬浮层，转为优雅、轻量的标准操作按钮（如胶囊轻背景按钮），布局协调且可直观点击。

## 2. 影响范围

- `docs/web-home-hero-card-white-pure-style.md`：新增开发文档。
- `web/src/app/(tabs)/page.tsx`：调整总览卡组件结构，移除/替换 `SalaryHeroSurface` 依赖，重构“添加薪资收入”入口。
- `web/src/app/globals.css`：更新 `.stark-hero-card` 样式为纯白、优化边框与阴影，调整 `.stark-card-watermark` 水印颜色深度，调整“添加薪资收入”按钮样式。
- `web/src/components/stark/SalaryHeroSurface.tsx`：如不再使用或已精简，做适当清理或解耦。

## 3. 实施步骤

- [x] 步骤 1：创建开发文档（已就绪）。
- [x] 步骤 2：调整 CSS 样式，将 `.stark-hero-card` 设置为纯白背景、统一边框与柔和微阴影，确保 `.stark-card-watermark` 水印字清晰可见、质感高级。
- [x] 步骤 3：调整卡片内部 DOM 结构，移除 Three.js 渐变背景层，将“添加薪资收入”重构为精致的右下/右侧轻量胶囊按钮。
- [x] 步骤 4：清理无用的 Three.js 画布引用，避免冗余渲染资源消耗。
- [x] 步骤 5：运行类型检查（TypeScript）和生产构建验证。
- [x] 步骤 6：按规范完成本地 Git 提交并回复汇报。
