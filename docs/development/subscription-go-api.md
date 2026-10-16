# Go API 订阅接口补齐

## 问题

Android 订阅管理页打开后，云端模式报 `Cloud API 404: {"error":"Not found"}`。手机连接的是 YHK 上的 Go API；前端和旧 Ktor API 已实现订阅管理，但 Go API 没有 `/api/subscriptions` 路由及相应数据库实体。

## 实施步骤

1. 为 Go API 增加与 Ktor 一致的 subscription 数据表字段和账户索引。
2. 将订阅加入 Go API 的实体读写、同步列表、账户归属授权及用户字段规范化。
3. 增加鉴权的 `GET/POST/DELETE /api/subscriptions` 路由，并保持 Ktor 的响应语义。
4. 增加路由、服务和 schema 覆盖检查，运行 Go 相关验证并构建 API 镜像。
5. 记录 YHK 当前容器运行参数，通过 SSH MCP 导入本机构建镜像并安全替换 API 容器；验证健康状态及订阅接口，然后在手机复查页面。
6. 记录版本变更并完成本地 Git 提交；不推送 GitHub。

## 验收标准

- 订阅列表按用户拥有的账本隔离；未授权账户不能读取或写入。
- 新增、读取、删除订阅使用现有 Ktor 同款 JSON 字段及 `204 No Content` 写入响应。
- 数据库升级只创建缺失表/索引，不删除或改写既有账务数据。
- 部署后的 API 健康检查通过，手机订阅页不再显示 404。

## 执行结果

- 已为 Go API 补齐 subscription 表结构、实体序列化、账本权限校验、同步读取及订阅 REST 路由。
- 新增 HTTP 路由与用户范围测试、Go schema 表覆盖检查；`go test ./...` 全部通过。
- `docker compose -f docker-compose.yml config --quiet` 通过。
- 本地构建镜像 `wotty-staraccounting-api:subscriptions-0.0.103-20261013` 成功，并经 SSH MCP 上传到 YHK。
- YHK 通过 `api-runtime` Compose 服务启动新 API，保留原容器为已停止的 `wotty-staraccounting-api-backup-20261013-0711`；原镜像另存为 `wotty-staraccounting-api:rollback-subscriptions-20261013-0711`。
- 新容器沿用原有 `.env` 环境变量、`/app` 工作目录、host 网络、`unless-stopped` 重启策略及 healthcheck；数据库卷、Web 容器和数据未调整。
- YHK `/api/health` 返回 `{"status":"ok","db":true}`，未登录访问 `/api/subscriptions` 返回预期的 `401`，确认路由已注册且仍受认证保护。
- 已在手机 `10.126.126.2` 的 `0.0.125` App 中重新打开订阅页；列表正常显示空状态，404 错误已消失。
- 本次只更新云端 API，无需重打 APK。
