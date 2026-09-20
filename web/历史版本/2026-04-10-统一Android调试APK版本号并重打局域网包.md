# 统一 Android 调试 APK 版本号并重打局域网包

## 更新时间
2026-04-10

## 更新内容
- 更新 `web/android/app/build.gradle`，将 Android `versionCode` / `versionName` 提升到 `23130` / `2.3.130`。
- 使用 `NEXT_PUBLIC_API_BASE_URL=http://192.168.31.112:3006` 重新执行 Android 打包，生成新的局域网调试 APK。
- 反查 `web/android/app/src/main/assets/public`，确认新包中已写入 `http://192.168.31.112:3006`，并且版本资源已切换到本轮新包。

## 影响范围
- Android 壳版本号：`web/android/app/build.gradle`
- Android 打包资源：`web/android/app/src/main/assets/public`
- 版本记录文档：`CHANGELOG.md`、`docs/开发进度.md`、`docs/React重构迁移开发文档.md`
