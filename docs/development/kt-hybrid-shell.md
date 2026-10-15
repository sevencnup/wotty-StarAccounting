# KT 混合版开发记录

## 目标

新增一个可与现有 Web 壳并存安装的 KT 混合版：Android 外层和底部主导航使用 Kotlin 原生代码，账本页面继续复用现有 Next.js 静态页面及 API。纯 KT 版保持独立，不纳入本次改动。

## 三种安装包的身份

| 版本 | 应用名 | Android applicationId | 页面实现 |
| --- | --- | --- | --- |
| Web 壳版 | 星会计 Web 壳 | `com.wotty.stark.web` | Capacitor WebView，网页底栏 |
| KT 混合版 | 星会计 KT 混合版 | `com.wotty.stark.ktweb` | Capacitor WebView 页面，Kotlin 原生底栏 |
| 纯 KT 版 | 星会计 原生版 | `com.wotty.stark.nativeapp` | 原生页面；源码不在当前仓库 |

## 实施步骤

1. 将 Android WebView 工程配置为 `web` 与 `ktweb` 两个独立构建变体，分别设置应用名、包名、版本号、版本码和可追溯 APK 文件名。
2. 新增 Kotlin 原生底栏；复用现有 Capacitor Activity、静态页面和路由，底栏点击通过已校验的应用内路由切页。
3. 为混合版隐藏网页底栏，保留网页记账入口；登录页等非应用路由不显示原生底栏。
4. 为三种安装包建立简明对照文档；隔离混合版的更新提示，避免它误领 Web 壳安装包。
5. 构建并安装 KT 混合版到 `10.126.126.2`，核对包名、版本、页面显示和底栏切换。
6. 更新 CHANGELOG 与版本历史，完成后本地提交，不推送 GitHub。

## 版本

新功能，混合版目标版本为 `0.4.0-dev.1`。Web 壳和 KT 混合版保持相同产品版本名，分别使用 `versionCode` `137` 和 `138`；纯 KT APK 和数据不作修改。

## 验收

- 三个 applicationId 可同时存在，安装或更新其中一个不会覆盖另两个。
- KT 混合版启动后页面来自当前 Web 前端，底栏由原生 Kotlin 绘制。
- 原生底栏可切换首页、消费、储蓄、贷款、资产、设置；网页记账入口仍可用。
- 登录/访问入口不显示应用底栏；返回键仍由现有 Android/Web 路由策略处理。
- 构建产物使用独立版本名及带时间戳的文件名。
