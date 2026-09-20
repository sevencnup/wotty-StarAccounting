# Flutter 清理归档开发文档

## 0. 文档版本

- 大版本：`v1.0`
- 小版本：`v1.0.0`
- 本次更新：按当前仓库主线决策，删除 Flutter 实验目录、Web 预览入口和相关迁移文档。

---

## 1. 背景

仓库已经确认不再以 Flutter 作为正式前端方案。

当前主线为：

- Web：`Next.js + React + TypeScript`
- Android：`Capacitor`
- 后端：`Express REST API + JWT`

继续保留 Flutter 目录只会带来三类问题：

1. 仓库体积增大，尤其是 `web/public/flutter-runtime` 这类静态产物。
2. 开发入口混乱，容易误进 `/flutter` 预览页或继续维护废弃目录。
3. 文档和代码主线分叉，增加协作成本。

---

## 2. 本轮删除范围

### 代码目录

- `flutter_app/`
- `web/src/app/flutter/`
- `web/src/components/flutter-preview/`
- `web/public/flutter-runtime/`

### 文档

- `docs/flutter-migration-phase2.md`
- `docs/flutter-migration-handoff-window2.md`

### 代码引用清理

- `web/src/components/shared/navigation.ts`
  - 删除 `/flutter` 相关页面元信息

---

## 3. 执行结果

1. Flutter 实验目录已从仓库移除。
2. Web 端 Flutter 预览入口和运行时资源已移除。
3. Flutter 专项迁移文档已删除。
4. React 主线文档已同步为唯一前端主线。

---

## 4. 验收标准

1. 仓库根目录下不再存在 `flutter_app/`。
2. `web/src/app/` 下不再存在 `flutter/` 路由。
3. `web/public/` 下不再存在 `flutter-runtime/`。
4. React 代码中不再引用 Flutter 预览页面。
5. `npm run typecheck` 通过。
