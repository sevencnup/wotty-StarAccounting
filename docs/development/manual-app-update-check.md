# Android 设置页手动检查更新

## 目标

在设置页加入“检查更新”入口，Android Web 壳版与 KT 混合版均可手动查询各自对应的 APK 更新；普通浏览器不显示入口。检查结果复用现有更新弹窗。

## 实施步骤

1. 为设置页增加 Android 原生环境判断和手动检查入口，触发已有的 `stark:check-app-update` 事件。
2. 扩展版本查询接口，按 `web` 或 `ktweb` 返回对应的版本和 APK 下载信息；当 KT 混合版下载地址缺失或服务器仍为旧接口时，丢弃不匹配的 Web 壳 APK 地址。
3. 在 Go 与 Ktor API 中支持独立的 KT 混合版更新环境变量，并将配置透传到 Docker Compose 与 `.env.example`。
4. 保留 Web 壳的启动时自动检查；KT 混合版只在用户点按时检查，避免启动时弹窗打断操作。
5. 更新版本记录并递增 APK 版本码；不构建或安装 APK，除非另行提出。

## 更新服务配置

- Web 壳版继续使用 `APP_VERSION_CODE`、`APP_VERSION_NAME`、`APP_APK_URL`、`APP_CHANGELOG` 和 `APP_FORCE_UPDATE`。
- KT 混合版使用对应的 `APP_KTWEB_*` 变量。版本号可以暂时回退到 Web 壳版的版本号，但下载地址不会回退；没有独立混合版 APK 地址时，客户端会提示暂不可下载，不会误装 Web 壳版。
- 已部署的 API 需要更新后才支持 `edition=ktweb`。旧 API 的响应不会被混合版客户端当作有效的混合版安装包。

## 分类与版本

用户现在可以主动检查并获取对应安装版的更新，属于新增功能 / MINOR。目标版本为 `0.7.0-dev.1`，Android `versionCode` 为 `154`。

## 验收

- Android Web 壳版和 KT 混合版显示设置入口，浏览器隐藏。
- 两种安装版查询各自更新信息；KT 混合版不会使用 Web 壳版下载地址。
- 更新提示、下载入口和“已是最新版本”提示复用现有弹窗流程。
