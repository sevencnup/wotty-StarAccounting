# 星会计 Android 公测发布

## 目标

通过 GitHub Actions 构建并发布第一个 Android 公测安装包。对外名称统一为“星会计”，用户看到的应用名称与 APK 文件名不包含内部构建渠道名称。

## 版本与安装包

- 公测目标版本：`0.7.6-beta.1`，Android `versionCode` 为 `161`。
- 从当前 `0.7.6-dev.1` / `160` 开发包进入同一目标版本的第一版公测。
- 仅构建现有主 Android 客户端对应的内部 `ktweb` Gradle 变体；商店及 GitHub 发行页显示为“星会计”。
- APK 名称：`星会计-v0.7.6-beta.1.apk`。
- 保持与现有开发包兼容的应用签名，Android 可原位升级并保留本地数据。

## 实施步骤

1. 将已有待发布的 Logo、网页引用和 Android 启动器图标改动纳入本次源码；恢复构建自动生成的 Next.js 类型文件。
2. 统一 App 版本为 `0.7.6-beta.1` / `161`，将公测 App 的显示名称改为“星会计”。
3. 为版本标签 `v0.7.6-beta.1` 配置 GitHub Actions：构建网页资源和 Android 包、核对包名与版本、上传 APK 并创建 GitHub Release。
4. 将现有兼容签名密钥通过 GitHub Actions 加密 Secret 提供给签名步骤，不将密钥或副本提交到仓库。
5. 保留 GitHub `master` 上的提交。由于本地 `master` 与 GitHub 已分叉，在 GitHub 远端基线上整合当前源码树后以快进方式推送；不强推或删除远端提交。
6. 推送分支与版本标签，确认 Action 成功、Release 附件可下载且 APK 名称为“星会计”。

## 验收

- Android Manifest 显示应用名称“星会计”，包版本为 `0.7.6-beta.1` / `161`。
- APK 与当前安装版具有相同签名，可覆盖安装并保留数据。
- GitHub Release 标题和 APK 文件名使用“星会计”，不带 Web 壳或混合版等内部名称。
- Release 由 GitHub Actions 从已推送的源码标签构建并附带 APK。
