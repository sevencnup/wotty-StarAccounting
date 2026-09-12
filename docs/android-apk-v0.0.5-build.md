# Android APK 0.0.5 打包开发文档

## 目标

基于当前 Web 储蓄编辑页修复打包一个新的 Android Debug APK，保留已有 `v0.0.4-c4` 安装包以便追溯。

## 实施步骤

- [x] 检查现有 APK 和 Android 版本，确认旧包为 `v0.0.4-c4`。
- [x] 将 Android 版本递增至 `v0.0.5-c5`，使新产物使用不同文件名。
- [x] 构建 Web 静态资源并同步至 Capacitor Android 工程。
- [x] 编译 Android Debug APK。
- [x] 校验 APK 路径、版本标识及文件完整性。
- [x] 更新版本记录并完成本地 Git 提交。

## 验收标准

1. 旧的 `wotty-stark-web-debug-v0.0.4-c4.apk` 不被覆盖。
2. 生成新的 `wotty-stark-web-debug-v0.0.5-c5.apk`。
3. 新 APK 包含当前 Web 生产构建产物。

## 版本记录

### 0.0.1

打包储蓄编辑数据回填修复后的 Android Debug APK。
