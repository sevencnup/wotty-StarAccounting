# Android 应用图标替换

## 目标

使用 `app/public/logo.webp` 作为 Android 启动器图标，并生成一个可覆盖安装旧版本、不会覆盖历史 APK 的新安装包。

## 实施步骤

1. 检查项目 Logo 的格式与尺寸，以及 Android Manifest 当前引用的图标资源。
2. 将 Logo 复制到 Android 的 `mipmap-nodpi` 资源目录，并让 `icon` 与 `roundIcon` 都引用该资源。
3. 将 Android `versionCode`、`versionName`、前端包版本和运行时版本同步更新为 `123` / `0.0.123`。
4. 在 `CHANGELOG.md` 记录新安装包的图标变化。
5. 使用仓库已有的 Linux Android APK 构建脚本打包；脚本应将带版本号和时间戳的 APK 归档到 `releases/`。
6. 检查 APK 包版本与图标资源，确认工作树中没有把 APK 或构建缓存加入提交，再提交本地仓库。

## 验收标准

- Manifest 的普通图标和圆形图标均引用项目 Logo。
- APK 构建成功，版本为 `0.0.123` / `versionCode 123`，且生成新的带时间戳归档。
- 历史 APK 保持不变；APK、Gradle 缓存和生成目录不提交到 Git。

## 执行结果

- `pnpm --dir app run apk:linux` 构建成功。
- `aapt` 确认 APK 版本为 `0.0.123` / `versionCode 123`，启动器图标解析到 `res/mipmap-nodpi-v4/ic_launcher.webp`；其 SHA-256 与项目 Logo 一致。
- 新安装包：`releases/wotty-stark-web-debug-v0.0.123-c123-20261011-141149.apk`。

## 二次调整（0.0.124）

首版装机截图显示，Android 启动器把旧式图标缩进了自适应图标框。保留公开 Logo 原图及其外边框，让原图在自适应图标中满幅铺设，不裁切或额外缩小。

### 实施步骤

1. 保留现有完整 Logo 位图，为 Android 8.0 及以上设备提供满幅自适应图标背景，并继续保留旧系统的位图回退资源。
2. 将应用版本更新为 `0.0.124` / `versionCode 124`，便于覆盖安装。
3. 构建新 APK，核对包内自适应图标、位图和版本信息。
4. 将新 APK 覆盖安装到之前使用的 `10.126.126.5` 设备。

## 二次调整结果

- Android 8.0 及以上使用整张 Logo 作为自适应图标背景，前景透明，不再由安全区将 Logo 额外缩小；Android 7.x 及以下继续读取原始位图图标。
- 应用版本更新为 `0.0.124` / `versionCode 124`。
- `pnpm --dir app run apk:linux` 构建成功；`aapt` 确认 APK 同时包含 Android 8+ 自适应图标配置和旧系统回退位图，版本为 `0.0.124` / `versionCode 124`。
- 新安装包：`releases/wotty-stark-web-debug-v0.0.124-c124-20261011-142559.apk`。
- 已覆盖安装到 `10.126.126.5`，设备确认版本为 `0.0.124` / `versionCode 124`。
- 本次启动的 ADB 服务已停止；旧版 APK 保持不变。
