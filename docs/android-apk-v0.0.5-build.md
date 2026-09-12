# Android APK 0.0.5 打包开发文档

## 目标

基于当前 Web 储蓄编辑页修复打包一个新的 Android Debug APK，并将新包归档到独立目录，避免后续构建清理历史安装包。

## 实施步骤

- [x] 检查现有 APK 和 Android 版本，确认旧包为 `v0.0.4-c4`。
- [x] 将 Android 版本递增至 `v0.0.5-c5`，使新产物使用不同文件名。
- [x] 构建 Web 静态资源并同步至 Capacitor Android 工程。
- [x] 编译 Android Debug APK。
- [x] 校验 APK 路径、版本标识及文件完整性。
- [x] 更新版本记录并完成本地 Git 提交。
- [x] 增加 APK 独立归档，避免后续 Gradle 构建清理历史安装包。

## 验收标准

1. 生成新的 `wotty-stark-web-debug-v0.0.5-c5.apk`。
2. 新 APK 包含当前 Web 生产构建产物。
3. 新 APK 自动归档到 `releases/`，文件名带构建时间戳。

## 打包结果

- 归档 APK：`releases/wotty-stark-web-debug-v0.0.5-c5-20260912-120813.apk`
- 包名：`com.wotty.stark.web`
- 版本：`0.0.5`（versionCode `5`）
- SHA-256：`2A1B20912BD4DE4E7DD92097D99E52909EE7329B22CA7B11CAFC65FB470DD5A0`

原 `v0.0.4-c4` 仅放在 Gradle 的标准输出目录内；该目录被新的 Gradle 构建清理，当前工作区和回收站均未发现可恢复副本。此后新包会先自动归档，不再依赖可被清理的标准输出目录。

## 版本记录

### 0.0.1

打包储蓄编辑数据回填修复后的 Android Debug APK。

### 0.0.2

为 Android Debug APK 增加带时间戳的独立归档。
