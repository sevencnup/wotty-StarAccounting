# 服务器 Node 升级与发布恢复指引

- 文档版本: `v1.0.0`
- 关联版本: `V2.3.137`
- 更新时间: `2026-04-11`

## 1. 适用场景

当正式环境执行根目录 `一键打包发布.bat` 后出现以下问题时，按本文处理：

1. 首页返回 `403 Forbidden`
2. 远程日志出现 `Prisma only supports Node.js >= 18.18`
3. 远程日志显示当前 Node 版本为 `v16.x`
4. PM2 重启后服务未正常恢复

## 2. 根因结论

当前项目的远程发布至少要求：

1. `Node.js >= 18.18`
2. 推荐直接使用 `Node.js 20 LTS`
3. `web/` 静态目录需要可被 Nginx 读取
4. `wotty-server` 需要由 PM2 正常托管

## 3. 服务器信息确认

先登录服务器执行：

```bash
node -v
npm -v
pm2 -v
pwd
ls -la /www/wwwroot/staraccountting.sevencn.com
```

如果 `node -v` 小于 `18.18`，先升级 Node，再重新发布。

## 4. Debian / Ubuntu 升级 Node 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
node -v
npm -v
```

## 5. CentOS / RHEL 升级 Node 20

```bash
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs
node -v
npm -v
```

如果服务器使用 `dnf`，把 `yum install -y nodejs` 改成：

```bash
dnf install -y nodejs
```

## 6. 修正站点权限

```bash
APP_DIR=/www/wwwroot/staraccountting.sevencn.com
WEB_DIR=$APP_DIR/web

chmod 755 "$APP_DIR" "$WEB_DIR"
find "$WEB_DIR" -type d -exec chmod 755 {} \;
find "$WEB_DIR" -type f -exec chmod 644 {} \;
ls -l "$WEB_DIR/index.html"
```

如果这里看不到 `index.html`，说明前端静态文件还没有成功上传。

## 7. 重发版与重启

Node 升级完成后，在你本地仓库重新执行：

```powershell
F:\1code\wotty-StarAccounting\一键打包发布.bat
```

如果需要在服务器上手动补一遍依赖和 PM2：

```bash
cd /www/wwwroot/staraccountting.sevencn.com/server
npm install --omit=dev
pm2 delete wotty-server || true
pm2 start /www/wwwroot/staraccountting.sevencn.com/server/dist/main.js --name wotty-server
pm2 save
pm2 logs wotty-server --lines 100
```

## 8. 校验项

```bash
curl -I http://127.0.0.1:3006/api/health
curl -I https://staraccountting.sevencn.com/
nginx -t
pm2 status
```

预期结果：

1. `/api/health` 返回 `200`
2. 域名首页不再返回 `403`
3. `nginx -t` 成功
4. `wotty-server` 状态为 `online`

## 9. 建议顺序

1. 先升级 Node 到 20
2. 再重新执行一键发布
3. 如果仍然 403，再检查 `web/index.html` 是否存在和目录权限
4. 最后检查 Nginx `root` 是否仍指向 `/www/wwwroot/staraccountting.sevencn.com/web`

## 10. SSH 非交互 shell 特殊情况

如果你手动登录服务器看到的是 `Node 20`，但发布日志里仍显示旧版 `Node 16`，通常不是升级失败，而是 SSH 非交互 shell 命中了旧 PATH。

当前仓库里的 `scripts/deploy.js` 已经会自动扫描常见 Node 安装路径并优先选择满足 `>= 18.18` 的版本，所以重新拉取最新代码后再发布即可。
