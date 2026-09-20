# Android 联调壳开发文档

## 0. 文档版本

- 大版本：`v1.0`
- 小版本：`v1.0.3`
- 本次更新：补充 Android 原生壳缓存清理与历史 `3000 -> 3006` 地址迁移规则，避免新 APK 继续命中旧页面缓存。

---

## 1. 目标

联调壳解决的是这个问题：

- 手机浏览器访问 `http://电脑IP:3000`，虽然能热更新，但运行环境是浏览器，不是 APK。
- 正式 APK 最接近真实交付环境，但每次改代码都要重新打包安装。

联调壳取两者中间值：

- 手机里运行的是 **Capacitor App 壳**
- App 壳加载的是 **电脑上的前端开发服务**
- API 默认指向 **电脑上的后端开发服务**

这样可以同时验证：

- WebView 与 Chrome 的差异
- Android 状态栏、返回键、跳转逻辑
- 原生壳与前端开发环境的组合行为

---

## 2. 脚本入口

联调壳脚本路径：

- `web/scripts/run-android-dev-shell.ps1`

推荐命令：

```powershell
powershell -ExecutionPolicy Bypass -File .\web\scripts\run-android-dev-shell.ps1 -StartFrontendServer -StartBackendServer
```

默认行为：

- 自动识别当前电脑局域网 IP
- 前端联调地址默认写成 `http://当前电脑IP:3000`
- 后端接口地址默认写成 `http://当前电脑IP:3006`
- 自动 `cap sync android`
- 自动构建 debug APK
- 检测到单台 Android 设备时自动覆盖安装并启动

---

## 3. 可选参数

### 自定义前端地址

```powershell
powershell -ExecutionPolicy Bypass -File .\web\scripts\run-android-dev-shell.ps1 -FrontendUrl "http://192.168.31.112:3000"
```

### 自定义后端地址

```powershell
powershell -ExecutionPolicy Bypass -File .\web\scripts\run-android-dev-shell.ps1 -ApiBaseUrl "http://192.168.31.112:3006"
```

### 指定设备

```powershell
powershell -ExecutionPolicy Bypass -File .\web\scripts\run-android-dev-shell.ps1 -DeviceId "b1695dee"
```

### 只构建，不安装

```powershell
powershell -ExecutionPolicy Bypass -File .\web\scripts\run-android-dev-shell.ps1 -SkipInstall
```

### 不自动启动 App

```powershell
powershell -ExecutionPolicy Bypass -File .\web\scripts\run-android-dev-shell.ps1 -SkipLaunch
```

### 强制重做一次静态导出兜底资源

```powershell
powershell -ExecutionPolicy Bypass -File .\web\scripts\run-android-dev-shell.ps1 -ForceWebBootstrapBuild
```

---

## 4. 运行机制

脚本会同时写入两类地址：

1. `CAP_SERVER_URL`
说明：
- 给 Capacitor 原生壳用
- 决定 APK 内部 WebView 实际加载哪个前端页面
- 联调壳场景下通常指向 `http://电脑IP:3000`

2. `NEXT_PUBLIC_NATIVE_DEFAULT_API_BASE_URL`
说明：
- 给 APK 内部 API 请求默认地址用
- 决定登录、鉴权、业务接口打到哪里
- 联调壳场景下通常指向 `http://电脑IP:3006`

3. 原生壳版本升级后会自动做一次旧运行时清理
说明：
- `MainActivity` 会按版本号一次性清理 WebView 的 `Service Worker`、`Cache`、`Code Cache` 与 `GPUCache`
- 目标是避免重新安装新 APK 后，壳内仍然复用历史 PWA / WebView 缓存

4. 历史误存地址会自动迁移
说明：
- 如果旧包曾把 `http://局域网IP:3000` 保存成原生默认后端地址
- 新包启动时会自动把它迁移成 `http://局域网IP:3006`

这两个地址必须分开看：

- `3000` 是前端开发服务
- `3006` 是后端 API 服务

只配 `3000` 不配 `3006`，联调壳很容易出现“页面能开，但登录接口打错地址”的假成功。

---

## 5. 推荐联调用法

### 场景 A：看页面、跳转、状态栏、WebView 差异

```powershell
powershell -ExecutionPolicy Bypass -File .\web\scripts\run-android-dev-shell.ps1 -StartFrontendServer -StartBackendServer
```

适合：

- 登录页
- 路由跳转
- 状态栏颜色
- Android 返回键
- 壳内白屏、闪烁、卡死

### 场景 B：只想热更新前端，不重装壳

第一次先把联调壳装到手机上，之后只要：

- 保持 `web/` 的 `npm.cmd run dev` 在运行
- 保持 `server/` 的 `npm.cmd run dev` 在运行

后续绝大多数前端修改都可以直接在手机里刷新看到，不需要再次构建 APK。

### 场景 C：准备交付前最终验收

联调壳测完后，再回到正式打包命令：

```powershell
npm.cmd --prefix web run apk:release
```

原因：

- 联调壳更接近正式 APK，但仍然不是最终静态包
- 发布前仍要用正式 APK 再验一次

---

## 6. 常见问题

### 6.1 手机浏览器能打开 3000，联调壳却连不上

优先检查：

- 电脑上的 `web/` 是否真的在跑 `npm.cmd run dev`
- 电脑上的 `server/` 是否真的在跑 `npm.cmd run dev`
- 手机和电脑是否在同一个局域网
- Windows 防火墙是否放行了 `3000` 与 `3006`
- 设备里旧 APK 是否被新联调壳覆盖成功

### 6.2 联调壳页面能开，但登录失败

优先检查：

- `NEXT_PUBLIC_NATIVE_DEFAULT_API_BASE_URL` 是否指向正确的 `3006`
- 后端是否监听 `0.0.0.0`
- 手机能否直接访问 `http://电脑IP:3006/api/auth/me`

### 6.3 为什么联调壳和手机浏览器仍然会有差别

因为它们不是一个运行环境：

- 手机浏览器：Chrome
- 联调壳：Android WebView + Capacitor

联调壳的意义就是尽量把差异提前暴露出来。

### 6.4 重装新 APK 后还是看到旧页面或旧提示

优先检查：

- 新 APK 是否真的安装到了新版本号，例如 `2.3.149`
- 首次启动时是否已经走过一次应用升级后的缓存清理逻辑
- 电脑端 `adb devices` 是否能正常识别设备，避免以为覆盖安装成功，实际还是老包
- 如果极端情况下系统仍保留旧运行时数据，再手动执行一次“清除应用存储”做兜底

---

## 7. 日志排查

推荐命令：

```powershell
& 'F:\1python\Sdk\platform-tools\adb.exe' -s b1695dee logcat | Select-String 'Capacitor|Console|chromium|wotty|ERR_|api'
```

如果要先清空再抓：

```powershell
& 'F:\1python\Sdk\platform-tools\adb.exe' -s b1695dee logcat -c
& 'F:\1python\Sdk\platform-tools\adb.exe' -s b1695dee logcat | Select-String 'Capacitor|Console|chromium|wotty|ERR_|api'
```

---

## 8. 验收标准

1. 运行联调壳脚本后能成功生成 debug APK。
2. 检测到单台 Android 设备时，脚本能完成覆盖安装并自动启动。
3. APK 内部实际加载地址为局域网 `3000`。
4. APK 内部 API 默认地址为局域网 `3006`。
5. 修改前端代码后，手机里的联调壳刷新可见最新变化。
6. 新版本首次启动后，不再继续命中旧的 `http://localhost/` Service Worker 缓存。
7. 历史保存的本地 `3000` 原生后端地址会自动迁移为 `3006`。
