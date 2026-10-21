# Android 安装包版本区分

| 安装包 | 手机应用名 | `applicationId` | 页面与导航 |
| --- | --- | --- | --- |
| Web 壳版 | 星会计 Web 壳 | `com.wotty.stark.web` | Capacitor WebView，网页底部导航 |
| KT 混合版 | 星会计 KT 混合版 | `com.wotty.stark.ktweb` | 复用网页页面，Kotlin 原生底部导航 |

当前仓库保留 Web 壳版和 KT 混合版，两者分别构建且可同时安装，均由 `app/android` 工程构建。

构建命令：

- Web 壳：`pnpm --dir app apk:linux`
- KT 混合版：`pnpm --dir app apk:ktweb:linux`

APK 文件名包含应用类型、版本名、Android 版本码和时间戳，构建时归档到 `releases/`。
