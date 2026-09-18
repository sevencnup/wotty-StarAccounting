# Docker Compose 首次部署方案

版本：`0.0.1`

## 目标

提供 Web、API 和 MySQL 的一键部署配置。首次创建 MySQL 数据卷时，由 MySQL 官方镜像自动创建数据库和账号；API 启动后自动创建业务表。

## 执行步骤

1. 新增 API 多阶段 Dockerfile。
2. 新增 Web 静态构建 Dockerfile 和 Nginx 配置。
3. 新增 Compose 文件，将 MySQL 健康检查作为 API 启动条件。
4. 新增 `.env.example`，只提供配置模板，不提交真实密码。
5. 在使用文档中补充首次部署、数据卷和重置说明。
6. 校验 Compose 配置和 Docker 构建上下文，创建本地提交，不推送 GitHub。

## 验收标准

- `docker compose config` 可以解析配置。
- MySQL 使用持久化数据卷，并在空数据卷首次启动时创建数据库和用户。
- API 通过 Compose 服务名连接 MySQL，不把数据库密码写入镜像。
- API 启动后健康检查可返回 `db: true`。
- Web 和 API 可分别通过 `12366`、`12367` 访问。
