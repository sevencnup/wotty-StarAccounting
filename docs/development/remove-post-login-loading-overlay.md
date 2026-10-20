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

## 2026-10-20 追修：模式选择卡片仍闪现

用户截图显示的实际文案是“正在准备账本...”，来自根入口 `AppAccessGate` 的 `BOOTING` 阶段；此前只移除了 `ProtectedProductRoute` 的另一处文案，未覆盖这个入口。

1. 在 `BOOTING` 阶段不渲染模式选择卡片；保留初始化、云端连接检测、模式切换及登录逻辑。
2. 将 Web 壳版和 KT 混合版递增至 `0.5.1-dev.2`、Android `versionCode 152`，同步客户端版本常量。
3. 构建两个 APK，核对打包资源不含“正在准备账本...”并安装到当前手机；不代填登录凭据。
4. 更新版本记录并提交本地仓库。

### 完成记录

- `AppAccessGate` 的 `BOOTING` 阶段现在不渲染卡片及模式切换按钮；初始化流程仍执行。
- Next.js 静态构建、Capacitor Android 同步及两个 Android 调试包构建成功，打包网页资源已无“正在准备账本...”文案。
- Web 壳 APK：`releases/wotty-stark-web-debug-v0.5.1-dev.2-c152-20261020-085022.apk`。
- KT 混合版 APK：`releases/wotty-stark-ktweb-debug-v0.5.1-dev.2-c152-20261020-085022.apk`。
- 两包均已安装到 `10.126.126.2:5555`，设备报告版本 `0.5.1-dev.2` / `versionCode 152`；两个入口均可启动，混合版进入首页。

修复 / PATCH：去除已有登录流程中的瞬时卡片，不改变账本功能。
