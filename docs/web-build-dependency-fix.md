# Web 构建依赖解析修复

## 目标

修复 Next.js/Turbopack 构建时无法解析 `nanoid/non-secure`、`picocolors` 和 `source-map-js` 的问题，并保证当前导航组件可以通过 Next.js 16 的类型检查。

## 实施步骤

- [x] 检查 pnpm lockfile、依赖包存储和当前 `node_modules` 链接状态。
- [x] 将 workspace 的 pnpm linker 固定为 hoisted，并离线重建依赖链接。
- [x] 兼容 `usePathname()` 返回 `null` 的 Next.js 16 类型定义。
- [x] 运行 Web 单元测试。
- [x] 运行生产构建并确认所有页面静态生成成功。
- [x] 完成本地 Git 提交。

## 验收标准

1. PostCSS 可以解析 `nanoid/non-secure`、`picocolors` 和 `source-map-js`。
2. Web 测试全部通过。
3. `pnpm --dir web run build` 成功完成 TypeScript 检查和页面生成。

## 版本记录

### 0.0.1

修复 Web 构建依赖解析和导航路径类型兼容性。
