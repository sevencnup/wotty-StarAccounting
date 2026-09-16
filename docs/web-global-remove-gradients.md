# 全局 UI 去渐变设计与实施开发文档

## 1. 需求与目标

全面排查并去除全局 UI 中所有的 `linear-gradient` / `radial-gradient` 渐变效果，包括卡片底色、页面背景、按钮、徽章、高亮选中态、图表指示器等，统一替换为纯净、克制的高级纯色（如纯白 `#ffffff`、清爽主题纯色或优雅浅灰底色），实现整体一致的现代纯色扁平/微立体视觉风格。

## 2. 影响范围

- `docs/web-global-remove-gradients.md`：本开发文档。
- `app/src/app/globals.css`：核心样式表中的所有渐变规则清洗与统一。
- `app/src/components/**/*.tsx` 及 `app/src/app/**/*.tsx`：包含内联样式 `background: linear-gradient(...)` 或渐变色定义的组件。

## 3. 实施步骤

- [x] 步骤 1：排查全局 CSS 与 TSX/JSX 代码中所有的 `gradient` 出现位置。
- [x] 步骤 2：对全局背景、卡片背景、按钮、Tab 选项、选中态、进度条等分类制定纯色替换方案。
- [x] 步骤 3：修改 `app/src/app/globals.css`，去除所有渐变定义。
- [x] 步骤 4：检查并修改各组件及页面的行内渐变样式。
- [x] 步骤 5：运行类型检查和全量单元测试与生产构建验证。
- [x] 步骤 6：按规范完成本地 Git 提交并汇报。
