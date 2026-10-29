# Android Live Reload 开发记录

## 目标

让 Android 开发版直接加载局域网中的 Next.js 开发服务器，Web 代码保存后手机自动刷新，不需要每次重新打包 APK。

## 实施步骤

- [x] 复用现有 Web 与 API 开发服务。
- [x] 通过 Capacitor Live Reload 将开发版 WebView 指向局域网开发地址。
- [x] 自动识别 ADB 设备和与手机同网段的电脑 IPv4 地址。
- [x] 保留环境变量覆盖设备、主机和端口的能力。
- [x] 增加统一的 `dev:mobile` 开发命令。
- [x] 兼容 Windows 下通过 `cmd.exe` 启动 pnpm 子命令。
- [x] 兼容项目版本化 APK 文件名与 Capacitor CLI 的部署约定。
- [x] 保留 `app-debug.apk` 作为 Capacitor CLI 部署输入，并单独归档版本化 APK。
- [x] 重启前清理 Next.js 开发缓存，退出时清理 Windows 子进程树。
- [x] 在已连接的 Android 设备上启动并验证热更新。

## 使用方式

```powershell
pnpm --dir app dev:mobile
```

默认使用已连接的第一个 ADB 设备、端口 `12366`，并自动选择与手机同网段的电脑地址。也可以显式指定：

```powershell
pnpm --dir app dev:mobile -- --target 10.126.126.7:5555 --host 10.126.126.5 --port 12366
```

命令首次启动会先执行一次生产构建，确保 Capacitor 可以完成原生资源同步；之后手机加载的是开发服务器，日常修改 Web 代码无需再次构建 APK。

## 验收标准

1. 手机安装并启动 Live Reload 开发版。
2. 修改 `app/src` 下的 Web 代码并保存后，手机页面自动刷新。
3. 退出命令后，Web/API 开发进程能够一起结束。
4. 正式 `pnpm --dir app apk` 仍然使用打包进 APK 的静态资源。
