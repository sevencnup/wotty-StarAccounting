# Android APK 0.0.107 Wi-Fi 安装记录

## 目标

构建当前 Web 容器 Android debug APK，归档为新的可追溯安装包，并通过 Wi-Fi ADB 安装到测试手机。

## 实施步骤

- [x] 运行 Web 生产构建。
- [x] 同步 Capacitor Android 资源。
- [x] 编译 debug APK，并归档至 `releases/`。
- [x] 通过 Wi-Fi ADB 连接 `10.126.126.7:5555`。
- [x] 安装 APK 并启动应用。
- [x] 校验设备上的版本信息。
- [x] 完成本地 Git 提交。

## 验收结果

- 产物：`releases/wotty-stark-web-debug-v0.0.107-c107-20260915-225246.apk`
- 文件大小：`5,309,706` 字节
- 设备：`10.126.126.7:5555`（PJZ110）
- 安装结果：成功
- 手机版本：`versionName=0.0.107`、`versionCode=107`
- 已启动：`com.wotty.stark.web.MainActivity`

## 版本记录

本次为 Android 构建与安装记录，不提升应用版本号。
