# GitHub Actions 联网部署镜像包

## 需求与分类

部署环境可以联网，镜像包只需交付项目自己的 Web 和 Go API 镜像。MySQL 与 Alpine 由 Docker Compose 在部署时拉取，减少 Actions 下载包体积。用户仍使用同一套 Compose 部署流程，属于体验优化（PATCH）；根工作区版本目标为 `0.3.1-dev.1`，Android 应用版本不变。

## 实施步骤

1. 调整 Docker 镜像包工作流，只导出 Web 和 Go API 镜像，保留版本标签、校验文件与历史包命名规则。
2. 更新 README，说明镜像包内容及部署时需要访问 Docker Hub 拉取 MySQL 和 Alpine。
3. 更新根工作区版本和简短版本记录。
4. 本地提交，再推送 GitHub 并触发 Actions，确认新 artifact 可下载及体积。

## 验收范围

- 下载包只包含 `wotty-staraccounting-web` 和 `wotty-staraccounting-api` 镜像及 SHA-256 校验文件。
- `docker load` 后，联网执行 `docker compose up -d --no-build`，Compose 会拉取缺少的 `mysql:8.0` 和 `alpine:3.21`。
- 镜像包不包含数据库数据卷、密码或密钥。
