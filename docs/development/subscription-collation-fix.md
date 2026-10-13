# 修复订阅保存时的排序规则冲突

## 问题

手机订阅页打开后，新增订阅仍返回 HTTP 500。数据库报错为 `Error 1267 (HY000): Illegal mix of collations`，涉及 `utf8mb4_0900_ai_ci` 与 `utf8mb4_unicode_ci`。Go API 在校验订阅所属账本时，将新建订阅表的 `accountId` 与旧账户表的 `id` 直接比较；两列继承了不同的默认排序规则。

## 实施步骤

1. 让订阅账户归属查询在比较两侧显式使用 `utf8mb4_unicode_ci`，保留既有不区分大小写的标识符比较语义，不改写数据库数据。
2. 增加覆盖排序规则的回归检查，并运行 Go API 验证。
3. 构建新的本地 API Docker 镜像，通过 YHK SSH MCP 安全替换 API 容器；候选版本验收通过前保留旧容器，正式切换后保留旧镜像作为回滚点。
4. 确认 API 健康，再在手机已打开的订阅表单中保存订阅并确认列表展示正常。
5. 记录内部版本 `0.0.104` 和部署结果，完成本地 Git 提交，不推送 GitHub。

## 验收标准

- 订阅账户归属校验不再触发混合排序规则错误。
- 保存后的订阅可以正常出现在订阅列表。
- Go API 健康检查通过，原有账务数据不受影响。

## 执行结果

- 订阅账户归属 SQL 对 `subscription.accountId` 和 `account.id` 显式使用 `utf8mb4_unicode_ci`；没有改写数据库表或既有数据。
- 新增排序规则回归检查；`go test ./...` 全部通过。
- 本机构建镜像 `wotty-staraccounting-api:collation-0.0.104-20261013`，经 SCP 上传并由 YHK SSH MCP 导入。
- 候选 API 的数据库健康检查通过后，手机安装版显示“订阅已保存”，列表中出现“百度网盘 · ¥18.00 · 每月 20 日”。
- 正式 `api-runtime` 容器现为 `running / healthy`，沿用 host 网络、`/app` 工作目录及 `unless-stopped` 重启策略；`/api/health` 返回 `{"status":"ok","db":true}`，启动日志正常。
- 更新前的 Go API 镜像保存在 `wotty-staraccounting-api:rollback-collation-20261013-0733`；Web、MySQL 和 APK 均未更新。
- 已清理本地及 YHK `/tmp` 下的镜像 tar、临时验证镜像和手机截图；源码只提交到本地 Git，不推送 GitHub。
