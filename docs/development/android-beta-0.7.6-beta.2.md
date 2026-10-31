# 星会计 0.7.6-beta.2 公测发布

> 状态：GitHub Actions 前端 TypeScript 检查失败，未生成 APK 或 Release。后续修复与发布见 [0.7.6-beta.3](android-beta-0.7.6-beta.3.md)。

## 目标

将已完成的检查更新提醒和 MIT 许可发布到 GitHub，并由 GitHub Actions 构建、签名和发布新的星会计 Android 公测安装包。保留上一版安装包，使用现有签名在手机上原位升级。

## 步骤

1. 基于当前 GitHub `master` 的后续提交，统一应用版本为 `0.7.6-beta.2`，Android `versionCode` 递增到 `162`。
2. 在更新记录中加入本次公测版的简短描述，修正发布流程中仅适用于首版公测的文案。
3. 本地提交改动；将提交快进推送到 GitHub `master`，创建并推送 `v0.7.6-beta.2` 标签。
4. 等待 GitHub Actions 从该标签构建、签名并发布新 APK，确认发布页、附件名称、包名与版本。
5. 将新 APK 下载为独立文件，在已连接的手机上升级安装并确认安装版本。

## 验收

- GitHub Release 为预发布版 `v0.7.6-beta.2`，附件名显示“星会计”，旧版 `v0.7.6-beta.1` 仍保留。
- APK 包名为 `com.wotty.stark.ktweb`，版本为 `0.7.6-beta.2` / `162`，可覆盖手机上的 `0.7.6-beta.1`。
- `LICENSE` 和 README 明确采用 MIT 协议，远端源码与发布标签一致。
