# Go API 契约迁移清单

本文记录 Go 服务需兼容的当前 Ktor HTTP 接口。状态以可对照的实际实现为准，未迁移的接口不得被 Go Docker 镜像接管。

| 域 | 方法与路径 | 鉴权 | Go 状态 |
| --- | --- | --- | --- |
| 基础 | `GET /api/health` | 否 | 已实现 |
| 基础 | `GET /api/app/version` | 否 | 已实现 |
| 认证 | `GET /api/auth/registration` | 否 | 已实现，数据库只读验证通过 |
| 认证 | `POST /api/auth/register` | 否 | 已实现，待隔离库契约验证 |
| 认证 | `POST /api/auth/login` | 否 | 已实现，待现有账户跨服务验证 |
| 认证 | `POST /api/auth/password/recover` | 否 | 已实现，待隔离库契约验证 |
| 认证 | `POST /api/auth/registration` | JWT + 管理员密钥 | 已实现，待隔离库契约验证 |
| 认证 | `POST /api/auth/password` | JWT | 已实现，待隔离库契约验证 |
| 认证 | `GET /api/auth/me` | JWT | 已实现，单元测试通过 |
| 认证 | `POST /api/auth/logout` | JWT | 已实现，单元测试通过 |
| 用户 | `GET /api/user/me` | JWT | 未迁移 |
| 用户 | `POST /api/user` | JWT | 未迁移 |
| 账本 | `GET /api/accounts` | JWT | 未迁移 |
| 账本 | `GET /api/accounts/{id}` | JWT | 未迁移 |
| 账本 | `POST /api/accounts` | JWT | 未迁移 |
| 账本 | `DELETE /api/accounts/{id}` | JWT | 未迁移 |
| 交易 | `GET /api/transactions` | JWT | 未迁移 |
| 交易 | `GET /api/transactions/months` | JWT | 未迁移 |
| 交易 | `GET /api/transactions/{id}` | JWT | 未迁移 |
| 交易 | `POST /api/transactions` | JWT | 未迁移 |
| 导入 | `POST /api/transactions/import` | JWT | 未迁移 |
| 贷款 | `POST /api/transactions/loan-repayments` | JWT | 未迁移 |
| 交易 | `DELETE /api/transactions/{id}` | JWT | 未迁移 |
| 同步 | `GET /api/sync` | JWT | 未迁移 |
| 同步 | `POST /api/sync` | JWT | 未迁移 |
| 同步 | `POST /api/sync/demo` | JWT | 未迁移 |
| 资产 | `GET/POST /api/assets` | JWT | 未迁移 |
| 资产 | `DELETE /api/assets/{id}` | JWT | 未迁移 |
| 预算 | `GET/POST /api/budgets` | JWT | 未迁移 |
| 预算 | `DELETE /api/budgets/{id}` | JWT | 未迁移 |
| 贷款 | `GET/POST /api/loans` | JWT | 未迁移 |
| 贷款 | `DELETE /api/loans/{id}` | JWT | 未迁移 |
| 储蓄 | `GET/POST /api/savings-goals` | JWT | 未迁移 |
| 储蓄 | `DELETE /api/savings-goals/{id}` | JWT | 未迁移 |
| 储蓄 | `GET/POST /api/savings-plans` | JWT | 未迁移 |
| 储蓄 | `DELETE /api/savings-plans/{id}` | JWT | 未迁移 |
| 分类 | `GET/POST /api/category-rules` | JWT | 未迁移 |
| 导入错误 | `GET/POST /api/import-errors` | JWT | 未迁移 |
| 汇率 | `GET /api/exchange-rates` | JWT | 未迁移 |
| 主题 | `GET /api/theme-config/{userId}` | JWT | 未迁移 |
| 主题 | `PUT /api/theme-config` | JWT | 未迁移 |

## 不变量

- JWT 保持 HS256、发行者 `wotty-stark-api`、受众 `wotty-stark-client`、`userId` claim 与 30 天有效期。
- 成功的写操作保持 `204 No Content`；账户无权访问保持中文错误消息和 `403`。
- 时间字段继续使用 `yyyy-MM-dd HH:mm:ss`，金额 JSON 字段保持前端当前可接受的数值语义。
- Go 迁移期间仅以现有 MySQL 表为事实来源；不得因使用不同 ORM 而重命名列、索引或清空数据。
