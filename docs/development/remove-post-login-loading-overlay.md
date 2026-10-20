# 登录后账本路由过渡提示

## 目标

去掉成功登录后保护路由短暂显示的“正在进入账本...”全屏提示。该路由仍须校验本地/云端授权；校验期间不渲染业务页面，失败提示与未登录跳转保持有效。

改动同时适用于 Web 壳版和 KT 混合版，因为两个 APK 共用 `app` 的 Next.js 页面资源。

## 实施步骤

1. 对照 Next.js App Router 的 loading 与 authentication 文档，确认提示来自 `ProtectedProductRoute`，不是登录表单中的 API 检测状态。
2. 只移除受保护路由等待授权时的可见提示，不提前渲染账本内容，不改变授权、云端会话校验或失败跳转。
3. 按修复 / PATCH 递增 app 版本至 `0.5.1-dev.1`、Android `versionCode` 至 `151`，同步更新版本服务使用的客户端版本常量。
4. 构建 Web 壳和 KT 混合版调试 APK，检查包名与版本信息，并安装到当前手机验证两个入口都不再显示该提示。
5. 更新版本记录，停止临时进程，只提交本次 Web/App 改动与文档到本地仓库；不推送 GitHub。

## 完成记录

- `ProtectedProductRoute` 在授权完成前不再渲染“正在进入账本...”全屏占位；授权失败提示和未登录跳转逻辑保留。
- Next.js 静态构建、Capacitor Android 同步及 Web 壳/KT 混合版 Android 构建成功。
- Web 壳 APK：`releases/wotty-stark-web-debug-v0.5.1-dev.1-c151-20261020-083937.apk`，包名 `com.wotty.stark.web`。
- KT 混合版 APK：`releases/wotty-stark-ktweb-debug-v0.5.1-dev.1-c151-20261020-083937.apk`，包名 `com.wotty.stark.ktweb`。
- 两个包均安装到 `10.126.126.2:5555`；设备报告版本 `0.5.1-dev.1` / `versionCode 151`。构建产物中已检索不到原占位文案。

修复 / PATCH：登录通过后不再出现全屏等待提示，不改变用户可完成的任务或认证流程。
