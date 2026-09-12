# Web 与 Android 版本号同步

## 目标

统一 Web 关于页面与 Android 构建配置中的应用版本号。

## 实施步骤

- [x] 确认 Web 版本号为 0.0.84。
- [x] 将 Android versionName 同步为 0.0.84。
- [x] 将 Android versionCode 同步为 84。
- [x] 运行 Web 测试、类型检查与生产构建。
- [x] 完成本地 Git 提交。
- [ ] 按用户指令重新打包 APK。

## 验收标准

1. 关于页面继续显示 版本 0.0.84。
2. 下一次 Android 构建产物使用 v0.0.84-c84 命名。
3. 本次修改不覆盖历史 APK，也不自动执行 APK 打包。

## 版本记录

### 0.0.1

建立 Web 与 Android 版本号同步记录。

### 0.0.2

统一当前 Web 与 Android 应用版本标识。
