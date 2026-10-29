# Docker 首次部署 MySQL 自动初始化开发文档

## 目标

让全新部署者通过 Docker Compose 自动获得独立的 MySQL 数据库；MySQL 首次启动创建数据库和应用账号，API 在数据库健康后连接并创建业务表。账单数据保存在 Docker 命名卷中。保留现有部署通过 `DATABASE_URL` 连接外部数据库的能力。

## 实施步骤

1. 在 Compose 中加入 MySQL 8 服务、健康检查和命名数据卷；数据库宿主机端口仅绑定 `127.0.0.1`，默认使用 `3307`，避免与主机已有 MySQL 的 `3306` 冲突。
2. 保持 API 当前 Linux host 网络方式以避免改变现有 API 监听地址；默认 JDBC 地址使用 `127.0.0.1:3307`，并等待 MySQL 健康后启动。显式设置的 `DATABASE_URL` 继续优先，以兼容当前使用外部数据库的部署。
3. 调整 `.env.example` 与 README、数据库配置文档，明确新部署可留空 `DATABASE_URL` 使用 Compose 内置 MySQL；本地开发连接主机 MySQL 时需配置 `127.0.0.1:3306`。
4. 更新 CHANGELOG 的未发布记录，说明首次 Docker 部署流程完善。
5. 验证 Compose 配置、服务清单、文档差异和工作区；不执行 `docker compose up/down`，不切换当前运行实例的数据源。
6. 将本次修改单独提交到本地 Git，不推送 GitHub。

## 风险与保护

- MySQL 初始化变量只会在空数据卷首次启动时生效；重启不得清空数据。
- 不运行会删除卷的 `docker compose down -v`。
- 当前 `.env` 中已有的 `DATABASE_URL` 必须继续生效，避免现有账单看似消失。
- 不读取、输出或提交真实环境变量、密码或密钥。
