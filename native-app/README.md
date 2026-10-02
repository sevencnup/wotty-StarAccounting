# 星会计原生 Android 版

这是独立于 `app/android` Capacitor 工程的 Kotlin + Jetpack Compose 原生实现。当前阶段提供可安装的原生导航、首页、账单列表、云端同步和快速记账。

本地账本数据保存于设备应用私有存储；卸载应用或清除应用数据会清空本地账本。点击首页左上角云朵按钮，可以填写 API 地址（本地 Android 模拟器默认 `http://10.0.2.2:12367`）、登录云端账户，原生首页会拉取流水和资产余额；新增记账在本地保存后也会尝试写回云端。

在仓库根目录构建：

```powershell
.\gradlew.bat :native-app:assembleDebug
```

输出 APK：`native-app/build/outputs/apk/debug/native-app-debug.apk`。构建任务还会在 `releases/` 保留带版本号与时间戳的副本。
