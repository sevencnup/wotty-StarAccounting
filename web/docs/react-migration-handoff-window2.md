# React 重构迁移 - 窗口二交接文档

> 路径：`F:\1code\wotty-StarAccounting\web\`

---

## 当前基线（2026-04-09）

主方案文档：`docs/React重构迁移开发文档.md`

当前结论已经固定：

- 前端主线只剩 `web/`
- Flutter 目录和 Flutter 预览已经删除
- Android 路线继续使用 `Capacitor`

---

## 当前窗口分工

### 我这个窗口负责

- 登录、鉴权、API、路由守卫、版本记录、仓库清理

已完成：

- `web/src/lib/auth.ts`
- `web/src/lib/api.ts`
- `web/src/components/shared/AuthGate.tsx`
- `web/src/components/shared/UserContext.tsx`
- `web/src/app/auth/login/page.tsx`
- Flutter 相关目录与预览入口清理

### 另一个窗口负责

只处理 React 业务页面和体验收口，不再考虑 Flutter 对照实现：

- `web/src/app/(dashboard)/assets/page.tsx`
- `web/src/app/(dashboard)/budgets/page.tsx`
- `web/src/app/(dashboard)/connections/page.tsx`
- `web/src/app/(dashboard)/data/page.tsx`
- `web/src/app/(dashboard)/loans/page.tsx`
- `web/src/app/(dashboard)/savings/page.tsx`
- `web/src/app/(dashboard)/settings/page.tsx`
- `web/src/app/(dashboard)/ai/page.tsx`
- `web/src/app/(dashboard)/consumption/page.tsx`
- `web/src/features/**`

---

## 不要再改的内容

- 不要恢复 `flutter_app/`
- 不要恢复 `/flutter` 路由
- 不要再新增 Flutter 预览页
- 不要再写 Flutter 迁移文档

---

## 后续目标

1. 继续把 React 业务页做稳。
2. 继续沿着 `Capacitor` 打 Android。
3. 所有新功能只落在 React 主线。
