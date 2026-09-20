# 同步 Android 壳版本并重打局域网调试 APK

## 更新时间
2026-04-10

## 更新内容
- 更新 `web/android/app/build.gradle`，将 Android `versionCode` / `versionName` 同步到 `23128` / `2.3.128`。
- 使用 `NEXT_PUBLIC_API_BASE_URL=http://192.168.31.112:3006` 重新执行 Android 打包，生成新的局域网调试 APK。
- 反查 `web/android/app/src/main/assets/public`，确认新包内已经写入 `http://192.168.31.112:3006` 与最新 API 解析逻辑，不再是旧版 `localhost:3006` 资源。

## 影响范围
- Android 壳版本号：`web/android/app/build.gradle`
- Android 打包资源：`web/android/app/src/main/assets/public`
- 版本记录文档：`CHANGELOG.md`、`docs/开发进度.md`、`docs/React重构迁移开发文档.md`
