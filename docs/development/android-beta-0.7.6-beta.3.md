# 星会计 0.7.6-beta.3 公测发布

## 背景

`v0.7.6-beta.2` 已推送，但 GitHub Actions 在前端 TypeScript 检查时发现设置页更新状态订阅回调类型不匹配，未生成 APK 或 Release。保留失败标签，不覆盖它；后续发布使用新的 `v0.7.6-beta.3` 标签。

## 步骤

1. 修正设置页订阅回调，让无参数通知读取当前更新状态并写入页面状态。
2. 将应用版本统一为 `0.7.6-beta.3`，Android `versionCode` 递增为 `163`；将更新记录中的公测条目调整为实际发布版本。
3. 本地提交并快进推送到 GitHub `master`；创建并推送 `v0.7.6-beta.3` 标签。
4. 等待 GitHub Actions 构建、签名、校验并发布新 APK；检查 Release 附件及包版本。
5. 将新 APK 下载为独立文件，在已连接的手机上原位升级并确认版本。

## 验收

- GitHub Release 为预发布版 `v0.7.6-beta.3`，附件名称显示“星会计”，旧版 APK 仍保留。
- APK 包名为 `com.wotty.stark.ktweb`，版本为 `0.7.6-beta.3` / `163`，能覆盖手机上的 `0.7.6-beta.1`。
- 设置页更新提示能接收状态变化，GitHub 构建流程完成。
