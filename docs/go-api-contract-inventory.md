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
| 用户 | `GET /api/user/me` | JWT | 已实现，待 Ktor/Go 数据库契约比对 |
| 用户 | `POST /api/user` | JWT | 已实现，待 Ktor/Go 数据库契约比对 |
| 账本 | `GET /api/accounts` | JWT | 已实现，隔离库验收通过 |
| 账本 | `GET /api/accounts/{id}` | JWT | 已实现，待 Ktor/Go 数据库契约比对 |
| 账本 | `POST /api/accounts` | JWT | 已实现，待 Ktor/Go 数据库契约比对 |
| 账本 | `DELETE /api/accounts/{id}` | JWT | 已实现，待 Ktor/Go 数据库契约比对 |
| 交易 | `GET /api/transactions` | JWT | 已实现，隔离库验收通过 |
| 交易 | `GET /api/transactions/months` | JWT | 已实现，待 Ktor/Go 数据库契约比对 |
| 交易 | `GET /api/transactions/{id}` | JWT | 已实现，待 Ktor/Go 数据库契约比对 |
| 交易 | `POST /api/transactions` | JWT | 已实现，待 Ktor/Go 数据库契约比对 |
| 导入 | `POST /api/transactions/import` | JWT | 已实现，隔离库验收通过 |
| 贷款 | `POST /api/transactions/loan-repayments` | JWT | 已实现，待 Ktor/Go 数据库契约比对 |
| 交易 | `DELETE /api/transactions/{id}` | JWT | 已实现，待 Ktor/Go 数据库契约比对 |
| 同步 | `GET /api/sync` | JWT | 已实现，待完整表结构契约比对 |
| 同步 | `POST /api/sync` | JWT | 已实现，待 Ktor/Go 数据库契约比对 |
| 同步 | `POST /api/sync/demo` | JWT | 暂不迁移：旧接口会覆写真实用户字段，需先安全重做 |
| 资产 | `GET/POST /api/assets` | JWT | 已实现，待 Ktor/Go 数据库契约比对 |
| 资产 | `DELETE /api/assets/{id}` | JWT | 已实现，待 Ktor/Go 数据库契约比对 |
| 预算 | `GET/POST /api/budgets` | JWT | 已实现，待 Ktor/Go 数据库契约比对 |
| 预算 | `DELETE /api/budgets/{id}` | JWT | 已实现，待 Ktor/Go 数据库契约比对 |
| 贷款 | `GET/POST /api/loans` | JWT | 已实现，隔离库验收通过 |
| 贷款 | `DELETE /api/loans/{id}` | JWT | 已实现，待 Ktor/Go 数据库契约比对 |
| 储蓄 | `GET/POST /api/savings-goals` | JWT | 已实现，待 Ktor/Go 数据库契约比对 |
| 储蓄 | `DELETE /api/savings-goals/{id}` | JWT | 已实现，待 Ktor/Go 数据库契约比对 |
| 储蓄 | `GET/POST /api/savings-plans` | JWT | 已实现，待 Ktor/Go 数据库契约比对 |
| 储蓄 | `DELETE /api/savings-plans/{id}` | JWT | 已实现，待 Ktor/Go 数据库契约比对 |
| 分类 | `GET/POST /api/category-rules` | JWT | 已实现，待 Ktor/Go 数据库契约比对 |
| 导入错误 | `GET/POST /api/import-errors` | JWT | 已实现，待 Ktor/Go 数据库契约比对 |
| 汇率 | `GET /api/exchange-rates` | JWT | 已实现，待 Ktor/Go 数据库契约比对 |
| 主题 | `GET /api/theme-config/{userId}` | JWT | 已实现，待 Ktor/Go 数据库契约比对 |
| 主题 | `PUT /api/theme-config` | JWT | 已实现，待 Ktor/Go 数据库契约比对 |

## 不变量

- JWT 保持 HS256、发行者 `wotty-stark-api`、受众 `wotty-stark-client`、`userId` claim 与 30 天有效期。
- 成功的写操作保持 `204 No Content`；账户无权访问保持中文错误消息和 `403`。
- 时间字段继续使用 `yyyy-MM-dd HH:mm:ss`，金额 JSON 字段保持前端当前可接受的数值语义。
- Go 迁移期间仅以现有 MySQL 表为事实来源；不得因使用不同 ORM 而重命名列、索引或清空数据。
