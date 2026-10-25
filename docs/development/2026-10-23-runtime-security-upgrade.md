# Go API 构建工具链安全更新

## 分类与版本

此次只提升构建安全性，属于 PATCH；仓库根版本从 `0.0.1` 升至 `0.0.2`。

## 执行

1. 将 Go API Dockerfile 的 Go 构建器更新至 `1.26.10`。
2. 使用只包含 Dockerfile 和 `server-go` 源码的临时构建上下文构建候选镜像。
3. 本机没有运行该 API 容器；不启动服务。

## 验收

- 本地提交：`27d0e31`；镜像 `wotty-staraccounting-api:local-0.0.2-27d0e31-20261023`，镜像 ID `sha256:5a0e87d0be3744da0588063e7f8fbc28887e1bd7d823fbd414dd93a4bfd0bf1f`。
- 镜像由 Go `1.26.10` 工具链构建。API 没有运行，未启动容器，也未运行项目测试。
