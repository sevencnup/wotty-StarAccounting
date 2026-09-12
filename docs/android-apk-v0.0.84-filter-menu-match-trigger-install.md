# Android APK 筛选菜单等宽修复打包安装记录

## 目标

将消费页面移动端分类/账户筛选下拉菜单改为与对应按钮等宽后，重新打包并通过 Wi-Fi ADB 安装到测试设备。

## 实施步骤

- [x] 构建 Web 静态资源。
- [x] 同步 Capacitor Android 工程。
- [x] 编译并归档新的 debug APK。
- [x] 通过 Wi-Fi ADB 安装到设备。
- [x] 校验手机实际安装版本并启动应用。
- [x] 完成本地 Git 提交。

## 验收结果

- 产物：`releases/wotty-stark-web-debug-v0.0.84-c84-20260912-215200.apk`
- 设备：`192.168.31.248:5555`
- 安装结果：成功
- 手机版本：`versionName=0.0.84`、`versionCode=84`

## 版本记录

本次为 Android 构建与安装记录，不提升应用版本号。
