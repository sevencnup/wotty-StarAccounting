# Android 与 Docker 同步触发发布构建

## 需求与分类

Android 公测版目前由版本标签自动构建 APK，Docker 镜像包仍需在 GitHub Actions 中手动触发。调整后，同一个公测版本标签会同时触发 APK 与 Docker 镜像包构建，同时保留 Docker 镜像包的手动构建入口。

本次不增加应用内能力，也不改变部署方式，属于体验优化（PATCH）。根工作区目标版本为 `0.3.2-dev.1`，Android 应用版本保持不变。

## 实施步骤

1. 为 Docker 镜像包工作流增加与 Android 公测发布相同的版本标签触发规则。
2. 标签触发时使用公测版本号命名镜像标签和归档包；手动触发时继续使用根工作区版本号。
3. 更新 README 中的构建说明和根工作区版本记录。
4. 本地提交改动；后续推送新的公测版本标签时确认两条构建同时启动。

## 验收范围

- 推送 `v<版本>-beta.<序号>` 标签时，Android APK 与 Docker 镜像包工作流均被触发。
- 标签构建的 Docker 包名包含对应公测版本号和提交短哈希。
- GitHub Actions 中仍可单独手动构建 Docker 镜像包。
- Docker 镜像包仍只包含 Web 和 Go API；MySQL 与 Alpine 继续在部署时联网拉取。
