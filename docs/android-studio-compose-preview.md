# Android Studio Compose 预览说明

版本：`0.0.2`

## 目标

1. 让 `composeApp` 在 Android Studio 中直接看到页面画面。
2. 支持通过 `@Preview` 快速查看整 App、记账页、设置页。
3. 让整 App 预览默认带假数据，尽量接近真实画面。
4. 配合 `Live Edit` 实现接近实时的画面联动。

## 使用步骤

1. 打开 [App.kt](F:/1code/wotty-stark/composeApp/src/main/java/com/wotty/stark/ui/App.kt)。
2. 在 Android Studio 右上角切到 `Split` 或 `Design`。
3. 等待 `整App交互预览`、`记账页预览`、`设置页预览` 渲染完成。
4. 在 Preview 面板点击 `Interactive Mode`，就可以像网页一样点底部 tab 切页面。
5. 如果想看运行中的实时变化，先运行到模拟器，再开启 `Live Edit`。

## Live Edit

1. 打开 `File > Settings > Editor > Live Edit`。
2. 勾选启用。
3. 保持模拟器或真机运行当前 App。
4. 修改 Compose UI 代码后，运行画面会自动刷新。

## 说明

1. 当前项目是 `Jetpack Compose` 工程，适合用 `@Preview + Live Edit`。
2. `整App交互预览` 会加载预览专用假数据，适合直接看完整 UI。
3. 普通 Compose 组件预览效果最好。
4. `WebView/ECharts` 这类嵌入视图在 Preview 中可能不如模拟器完整。

## 版本记录

### `0.0.1`

1. 初版预览说明文档。
2. 记录 `App.kt` 中新增的 3 个预览入口。

### `0.0.2`

1. 将首页预览升级为 `整App交互预览`。
2. 补充 Interactive Preview 的使用方式。
3. 说明预览使用假数据渲染完整页面。
