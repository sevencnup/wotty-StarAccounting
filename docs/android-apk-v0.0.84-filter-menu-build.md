# Android APK 移动端筛选菜单修复打包记录

## 目标

将消费页面移动端分类/账户筛选下拉菜单宽度修复打包进 Android APK，并生成新的带时间戳产物，不覆盖历史 APK。

## 实施步骤

- [x] 构建 Web 静态资源。
- [x] 同步 Capacitor Android 工程。
- [x] 编译 debug APK 并归档到 `releases/`。
- [x] 校验 APK 文件、版本号和文件大小。
- [x] 完成本地 Git 提交。

## 验收标准

1. 新 APK 文件名包含版本号、versionCode 和时间戳。
2. 新 APK 不覆盖已有 APK。
3. APK 使用 Web `0.0.84` / Android `versionCode 84`。
4. 产物包含移动端筛选下拉菜单宽度修复。

## 版本记录

本次为 Android 构建产物更新，不提升应用版本号。

产物：`releases/wotty-stark-web-debug-v0.0.84-c84-20260912-214542.apk`

校验：`versionName=0.0.84`、`versionCode=84`、SHA-256：`7DC19FE1704061845FB48A1B1B21DCFF601DB014D89C36847D8E29E5E86E002F`。
