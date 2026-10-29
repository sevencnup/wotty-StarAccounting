# Go API 契约迁移清单

本文记录 Go 服务需兼容的当前 Ktor HTTP 接口。状态以可对照的实际实现为准，未迁移的接口不得被 Go Docker 镜像接管。

| 域 | 方法与路径 | 鉴权 | Go 状态 |
| --- | --- | --- | --- |
| 基础 | `GET /api/health` | 否 | 已实现，隔离环境契约验证通过 |
| 基础 | `GET /api/app/version` | 否 | 已实现，隔离环境契约验证通过 |
| 认证 | `GET /api/auth/registration` | 否 | 已实现，隔离环境契约验证通过 |
| 认证 | `POST /api/auth/register` | 否 | 已实现，隔离环境契约验证通过 |
| 认证 | `POST /api/auth/login` | 否 | 已实现，Ktor/Go 跨服务登录验证通过 |
| 认证 | `POST /api/auth/password/recover` | 否 | 已实现，管理员密钥正向流待部署前隔离验证 |
| 认证 | `POST /api/auth/registration` | JWT + 管理员密钥 | 已实现，管理员密钥正向流待部署前隔离验证 |
| 认证 | `POST /api/auth/password` | JWT | 已实现，单元测试通过 |
| 认证 | `GET /api/auth/me` | JWT | 已实现，隔离环境契约验证通过 |
| 认证 | `POST /api/auth/logout` | JWT | 已实现，隔离环境契约验证通过 |
| 用户 | `GET /api/user/me` | JWT | 已实现，隔离环境契约验证通过 |
| 用户 | `POST /api/user` | JWT | 已实现，统一写入路径隔离验证通过 |
| 账本 | `GET /api/accounts` | JWT | 已实现，隔离环境契约验证通过 |
| 账本 | `GET /api/accounts/{id}` | JWT | 已实现，隔离环境契约验证通过 |
| 账本 | `POST /api/accounts` | JWT | 已实现，隔离环境契约验证通过 |
| 账本 | `DELETE /api/accounts/{id}` | JWT | 已实现，统一删除路径单元测试通过 |
| 交易 | `GET /api/transactions` | JWT | 已实现，隔离环境契约验证通过 |
| 交易 | `GET /api/transactions/months` | JWT | 已实现，隔离环境契约验证通过 |
| 交易 | `GET /api/transactions/{id}` | JWT | 已实现，隔离环境契约验证通过 |
| 交易 | `POST /api/transactions` | JWT | 已实现，隔离环境契约验证通过 |
| 导入 | `POST /api/transactions/import` | JWT | 已实现，有效、重复和失败行契约验证通过 |
| 贷款 | `POST /api/transactions/loan-repayments` | JWT | 已实现，隔离环境契约验证通过 |
| 交易 | `DELETE /api/transactions/{id}` | JWT | 已实现，统一删除路径单元测试通过 |
| 同步 | `GET /api/sync` | JWT | 已实现，完整表结构与权限契约验证通过 |
| 同步 | `POST /api/sync` | JWT | 已实现，隔离环境契约验证通过 |
| 同步 | `POST /api/sync/demo` | JWT | 暂不迁移：旧接口会覆写真实用户字段，需先安全重做 |
| 资产 | `GET/POST /api/assets` | JWT | 已实现，隔离环境契约验证通过 |
| 资产 | `DELETE /api/assets/{id}` | JWT | 已实现，统一删除路径单元测试通过 |
| 预算 | `GET/POST /api/budgets` | JWT | 已实现，隔离环境契约验证通过 |
| 预算 | `DELETE /api/budgets/{id}` | JWT | 已实现，统一删除路径单元测试通过 |
| 贷款 | `GET/POST /api/loans` | JWT | 已实现，隔离环境契约验证通过 |
| 贷款 | `DELETE /api/loans/{id}` | JWT | 已实现，统一删除路径单元测试通过 |
| 订阅 | `GET/POST /api/subscriptions` | JWT | 已实现，账户隔离及字段契约验证通过 |
| 订阅 | `DELETE /api/subscriptions/{id}` | JWT | 已实现，统一删除路径单元测试通过 |
| 储蓄 | `GET/POST /api/savings-goals` | JWT | 已实现，隔离环境契约验证通过 |
| 储蓄 | `DELETE /api/savings-goals/{id}` | JWT | 已实现，级联删除隔离验证通过 |
| 储蓄 | `GET/POST /api/savings-plans` | JWT | 已实现，隔离环境契约验证通过 |
| 储蓄 | `DELETE /api/savings-plans/{id}` | JWT | 已实现，统一删除路径单元测试通过 |
| 分类 | `GET/POST /api/category-rules` | JWT | 已实现，隔离环境契约验证通过 |
| 导入错误 | `GET/POST /api/import-errors` | JWT | 已实现，隔离环境契约验证通过 |
| 汇率 | `GET /api/exchange-rates` | JWT | 已实现，隔离环境契约验证通过 |
| 主题 | `GET /api/theme-config/{userId}` | JWT | 已实现，隔离环境契约验证通过 |
| 主题 | `PUT /api/theme-config` | JWT | 已实现，隔离环境契约验证通过 |

## 不变量

- JWT 保持 HS256、发行者 `wotty-stark-api`、受众 `wotty-stark-client`、`userId` claim 与 30 天有效期。
- 成功的写操作保持 `204 No Content`；账户无权访问保持中文错误消息和 `403`。
- 账本时间字段保持 `yyyy-MM-dd HH:mm:ss`；认证用户时间按 Ktor `LocalDateTime.toString()` 保留非零微秒。金额 JSON 字段保持 Ktor 的 `Double` 输出语义。
- Go 迁移期间仅以现有 MySQL 表为事实来源；不得因使用不同 ORM 而重命名列、索引或清空数据。
