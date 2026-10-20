# 星会计原生 Android 版

这是独立于 `app/android` Capacitor 工程的 Kotlin + Jetpack Compose 原生实现。应用页面和账本流程由原生界面实现；图表以本地 WebView 承载 ECharts 6.1.0，资源随 APK 打包，可离线显示。当前已有原生首页、按月消费分析、储蓄/贷款/资产概览、云端连接设置和快速记账；新增、编辑、删除及完整本地账本流程仍在开发中。完整范围见 [`docs/development/native-kt-full-development.md`](../docs/development/native-kt-full-development.md)。

本地账本数据保存于设备应用私有存储；卸载应用或清除应用数据会清空本地账本。点击首页左上角云朵按钮，可以填写 API 地址（本地 Android 模拟器默认 `http://10.0.2.2:12367`）、登录云端账户，原生首页会拉取流水和资产余额；新增记账在本地保存后也会尝试写回云端。

在仓库根目录构建：

```powershell
.\gradlew.bat :native-app:assembleDebug
```

Linux/macOS 使用 `./gradlew :native-app:assembleDebug`。

输出 APK：`native-app/build/outputs/apk/debug/native-app-debug.apk`。构建任务还会在 `releases/` 保留带版本号与时间戳的副本。
