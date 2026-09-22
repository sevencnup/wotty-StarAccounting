# Android APK 构建与 HTTP API 连通开发文档

## 目标

- 让 Android 安装包能够访问当前以 HTTP 暴露的云端 API。
- 在本机构建一个新的、可追溯的 APK，不覆盖已有安装包。

## 实施步骤

1. 核对 Capacitor、Android Gradle 工程、SDK 版本与现有构建脚本。
2. 为 Android 应用启用明文 HTTP 访问；当前云端 API 为 IP 地址 HTTP 服务，Android WebView 默认会拦截该请求。
3. 安装 Android SDK command-line tools、工程所需 Android platform 和 build-tools；复用项目 Gradle Wrapper，不安装全局 Gradle。
4. 构建前端生产静态资源并同步至 Android 工程，再执行 APK 构建。
5. 将新 APK 复制到带版本号的独立产物路径，校验文件存在与 Android 包信息。
6. 更新版本记录，检查 Git 差异并仅提交源码与文档，不提交 SDK、Gradle 缓存和 APK 产物。

## 验收标准

- Android Manifest 声明允许 HTTP API 请求。
- Gradle 构建成功并生成新的 APK 文件。
- APK 不会覆盖仓库中已有的历史 APK。
- 源码通过前端类型检查；构建生成目录、SDK 和 APK 不进入 Git 提交。

## 本机重复构建

```bash
pnpm --dir app run apk:linux
```

该命令使用已安装在 `/opt/android-sdk` 的 SDK，并在仓库根目录 `releases/` 生成带版本号与时间戳的新 APK。
