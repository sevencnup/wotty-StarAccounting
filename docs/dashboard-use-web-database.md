# Dashboard 接入 Web 数据库开发文档

版本：`0.0.1`

## 目标

让 `dashboard` 使用 `web` 项目背后的 MySQL 数据库 `star_accounting`，打通登录和消费看板数据链路。

## 已知差异

1. `web` 使用 `127.0.0.1:3306/star_accounting`，配置来自用户目录下的 `.wotty-stark/db.properties`。
2. `web` 用户表为 `user`，登录字段为 `email`、`password`、`role`。
3. `dashboard` 当前登录逻辑查询 `users`，字段为 `username`、`password`、`role`。

## 执行步骤

1. 读取并验证 Web 数据库配置，不输出密码。
2. 确认 Web 用户表和可用用户记录。
3. 将 Dashboard 数据库连接改为 Web 数据库，并为登录查询增加 Web 用户表兼容。
4. 将消费、统计、趋势和筛选接口适配到 Web 的 `transaction` 表。
5. 验证 Dashboard 登录和消费看板接口。
6. 记录版本变更并创建本地提交，不推送 GitHub。

## 验收标准

- Dashboard 后端使用 `star_accounting`，不再连接原远程数据库。
- 登录接口可以访问 Web 用户表并返回明确的成功或密码错误结果。
- 消费、统计、平台和趋势接口可以读取 Web 的交易数据。
- 不在日志、文档或提交内容中写入数据库密码。

## 版本记录

### `0.0.1`

Dashboard 接入 Web 数据库，兼容 Web 用户表登录，并读取 Web 交易数据。
