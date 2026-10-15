# Android 安装包版本区分

| 安装包 | 手机应用名 | `applicationId` | 页面与导航 |
| --- | --- | --- | --- |
| Web 壳版 | 星会计 Web 壳 | `com.wotty.stark.web` | Capacitor WebView，网页底部导航 |
| KT 混合版 | 星会计 KT 混合版 | `com.wotty.stark.ktweb` | 复用网页页面，Kotlin 原生底部导航 |
| 纯 KT 版 | 星会计 原生版 | `com.wotty.stark.nativeapp` | Kotlin 原生页面；当前 APK 已装在设备，源码不在本仓库 |

Web 壳版和 KT 混合版由本仓库 `app/android` 工程构建，可同时安装。纯 KT 版目前只作为独立的已安装应用记录；本仓库不构建或更新它。

构建命令：

- Web 壳：`pnpm --dir app apk:linux`
- KT 混合版：`pnpm --dir app apk:ktweb:linux`

APK 文件名包含应用类型、版本名、Android 版本码和时间戳，构建时归档到 `releases/`。
