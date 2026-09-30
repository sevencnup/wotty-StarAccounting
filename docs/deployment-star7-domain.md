# star7.sevencn.com Docker 部署步骤

## 目标

- 以 `https://star7.sevencn.com` 提供前端，不在浏览器地址中暴露端口。
- 浏览器 API 请求使用同域 `/api`，由主机 Nginx 转发到本机 API。
- Web 容器只绑定 `127.0.0.1:12366`；API 绑定内网隧道地址 `10.126.126.9:12367`，保留原生 App 的内网 API 访问。
- API 继续连接现有 MySQL（`10.126.126.9:3306`），不创建空数据库替代现有账单数据。
- 不改动主机上其他 Docker 容器或 Nginx 站点。

## 执行步骤

1. 确认域名回源到当前 VPS、HTTP/HTTPS 入口可达、现有数据库连接配置可用，并记录目标端口/进程状态。
2. 修改 Web API 默认地址：浏览器使用 `window.location.origin`；Capacitor 原生 App 继续使用现有 API 端口。
3. 调整 Docker Compose：Web 绑定 `127.0.0.1:12366`；API 使用主机网络并只监听 `10.126.126.9:12367`，通过现有 `.env` 连接 MySQL；不启动 Compose 自带的空 MySQL。
4. 增加仅供 `star7.sevencn.com` 使用的 Nginx 配置：`/api/` 转到 `10.126.126.9:12367`，其余路径转到 `127.0.0.1:12366`；保留 HTTP ACME 验证路径并将其他 HTTP 请求升级到 HTTPS。
5. 通过 HTTP-01 申请域名证书。若 Cloudflare 代理阻止验证，暂停部署并请用户调整 DNS 代理/验证方式，不使用明文或无效证书上线。
6. 本地构建 Web/API 镜像，逐项验证配置后启动目标 Compose 服务；不停止或重建无关容器。
7. 检查 Nginx 配置、HTTPS 域名、前端静态路由、`/api/health` 和现有 MySQL API 连接；失败时仅回滚本次新增的 Nginx 配置和目标 Compose 服务。

## 验收

- `https://star7.sevencn.com/app/` 返回成功。
- `https://star7.sevencn.com/api/health` 返回成功。
- 浏览器版默认 API 地址为当前 HTTPS 域名，无需显式端口；旧的同主机 `:12367` 地址自动升级为同源域名。
- 原生 App 的 API 默认地址仍使用 `12367`。
- API 数据仍来自现有 MySQL；Docker 未创建或切换到空数据库。
- 其他站点、容器及其端口保持不变。
