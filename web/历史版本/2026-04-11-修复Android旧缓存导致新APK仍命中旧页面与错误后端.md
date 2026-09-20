# 2026-04-11 修复 Android 旧缓存导致新 APK 仍命中旧页面与错误后端

## 版本信息

- 变更记录：`V2.3.149`
- Android 版本：`2.3.149`
- React + Capacitor 迁移文档：`v1.1.21`
- Android 联调壳开发文档：`v1.0.3`

## 背景

- 真机已经安装了新 APK，但壳内仍然会出现旧页面、旧提示文案，甚至继续命中错误的后端地址。
- 之前抓到的日志说明壳内仍在注册 / 复用 `http://localhost/` 作用域下的旧 Service Worker。
- 同时存在一类历史数据问题：早期包曾把局域网 `3000` 保存成原生默认后端地址，升级后仍会继续沿用。

## 本次处理

1. 清理原生壳启动阶段的旧缓存
   - 更新 `web/android/app/src/main/java/com/wotty/star_accounting/MainActivity.java`
   - 应用升级后按版本号一次性清理 WebView 的 `Service Worker`、`Cache`、`Code Cache` 与 `GPUCache`

2. 清理前端运行时的旧缓存接管
   - 更新 `web/src/components/shared/PWARegister.tsx`
   - 原生壳与嵌入式静态运行时启动时先清理已有 Service Worker / Cache，并仅在必要时做一次受控刷新
   - 更新 `web/public/sw.js`
   - 在 `http://localhost/` 无端口的壳内作用域跳过缓存安装、激活时主动注销旧 Service Worker 并清空缓存

3. 迁移错误保存的历史服务器地址
   - 更新 `web/src/lib/runtime-server.ts`
   - 自动把旧存储里局域网 / 本地 `http://*:3000` 的原生服务器地址迁移为 `http://*:3006`

4. 同步 Android 壳版本
   - 更新 `web/android/app/build.gradle`
   - Android `versionCode` / `versionName` 提升到 `23149` / `2.3.149`

## 验证

- `npm.cmd --prefix web run build:export`
- `npm.cmd --prefix web run typecheck`
- `powershell -ExecutionPolicy Bypass -File .\web\scripts\build-android-debug.ps1`

## 结果

- 已成功生成 `web/dist-apk/wotty-android-debug-2.3.149.apk`
- 构建产物中已确认默认原生后端地址为 `http://192.168.31.112:3006`
- 原生壳缓存治理和历史地址迁移逻辑已进入新包
