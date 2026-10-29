# GitHub Actions Docker 镜像包

## 需求与分类

在 GitHub Actions 页面手动构建并下载可用于 Docker Compose 首次部署的镜像包。此前只能在本机导出镜像，仓库访客无法从 Actions 获取。此项属于新增功能（MINOR），根工作区版本目标为 `0.3.0-dev.1`；Android 应用版本不变。

## 实施步骤

1. 增加可手动触发的 GitHub Actions 工作流，在 Linux amd64 runner 上构建 Web 和 Go API 镜像。
2. 固定 Compose Web 镜像名称，拉取首次启动所需的 MySQL 与 Alpine 镜像，将四种镜像及应用镜像的版本标签导出到同一个压缩归档，并生成 SHA-256 校验文件。归档名称包含版本、提交和运行编号，避免覆盖历史包。
3. 通过 Actions artifact 上传归档与校验文件；README 增加下载入口及加载说明。
4. 更新根工作区版本与简短版本记录，本地提交后推送 GitHub，手动触发工作流并确认 Actions 运行和 artifact。

## 验收范围

- 工作流成功完成，运行页面可下载镜像归档和校验文件。
- 镜像包包含 `wotty-staraccounting-web`、`wotty-staraccounting-api`、`mysql:8.0`、`alpine:3.21`，可用 `docker load -i` 加载。
- 镜像包不包含数据库数据卷、密码或密钥。
