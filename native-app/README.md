# 星会计原生 Android 版

这是独立于 `app/android` Capacitor 工程的 Kotlin + Jetpack Compose 原生实现。当前阶段提供可安装的原生导航、首页、账单列表和本地快速记账。

本地账本数据保存于设备应用私有存储；卸载应用或清除应用数据会清空该原生预览账本。当前尚未接入旧 Web/Capacitor 数据迁移和云端同步。

在仓库根目录构建：

```powershell
.\gradlew.bat :native-app:assembleDebug
```

输出 APK：`native-app/build/outputs/apk/debug/native-app-debug.apk`。构建任务还会在 `releases/` 保留带版本号与时间戳的副本。
