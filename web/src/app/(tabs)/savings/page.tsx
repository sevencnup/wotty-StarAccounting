"use client";

import { useEffect, useMemo, useState } from "react";
import { PageTopBar } from "@/components/stark/PageTopBar";
import { PageSkeleton } from "@/components/stark/Skeleton";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { formatMoney, nowText } from "@/lib/stark/utils/format";
import type { SavingsGoal } from "@/lib/stark/models";

const repo = new DataModeManager().getRepository();

export default function SavingsPage() {
  const [list, setList] = useState<SavingsGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  const summary = useMemo(() => ({
    total: list.reduce((sum, item) => sum + item.currentAmount, 0),
    target: list.reduce((sum, item) => sum + item.targetAmount, 0),
    active: list.length,
  }), [list]);

  const reload = () => void repo.getSavingsGoals("default").then(setList);

  useEffect(() => {
    void repo.getSavingsGoals("default").then((data) => {
      setList(data);
      setLoading(false);
    });
  }, []);

  async function saveGoal() {
    const now = nowText();
    await repo.saveSavingsGoal({
      id: crypto.randomUUID(),
      userId: "local-user",
      accountId: "default",
      name: name || "新储蓄计划",
      targetAmount: Number(targetAmount) || 0,
      currentAmount: Number(currentAmount) || 0,
      deadline: deadline || null,
      type: "LONG_TERM",
      status: "ACTIVE",
      depositType: "CASH",
      planConfig: null,
      createdAt: now,
      updatedAt: now,
    });
    setName("");
    setTargetAmount("");
    setCurrentAmount("");
    setDeadline("");
    reload();
  }

  if (loading) {
    return <PageSkeleton title="储蓄" cards={3} />;
  }

  return (
    <div className="page-stack">
      <PageTopBar title="储蓄" />

      <section className="home-card page-hero">
        <div className="page-hero-label">总储蓄</div>
        <div className="page-hero-value">¥ {formatMoney(summary.total)}</div>
        <div className="page-hero-sub">目标 ¥ {formatMoney(summary.target)} · 共 {summary.active} 个计划</div>
      </section>

      <section className="home-card page-card">
        <h2 className="page-card-title">新建计划</h2>
        <div className="app-field-grid">
          <input className="app-input" value={name} onChange={(event) => setName(event.target.value)} placeholder="计划名称" />
          <input className="app-input" value={targetAmount} onChange={(event) => setTargetAmount(event.target.value.replace(/[^\d.]/g, ""))} placeholder="目标金额" />
          <input className="app-input" value={currentAmount} onChange={(event) => setCurrentAmount(event.target.value.replace(/[^\d.]/g, ""))} placeholder="当前金额" />
          <input className="app-input" value={deadline} onChange={(event) => setDeadline(event.target.value)} placeholder="截止日期 2026-12-31" />
          <button type="button" className="primary-button" onClick={() => void saveGoal()}>保存计划</button>
        </div>
      </section>

      <section className="home-card page-card">
        <h2 className="page-card-title">储蓄计划</h2>
        <div className="app-list">
          {list.map((item) => {
            const percent = item.targetAmount > 0 ? Math.min(100, (item.currentAmount / item.targetAmount) * 100) : 0;
            return (
              <div key={item.id} className="app-list-row" style={{ display: "block" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <div className="app-list-main">
                    <div className="app-list-title">{item.name}</div>
                    <div className="app-list-subtitle">
                      已存 ¥ {formatMoney(item.currentAmount)} / 目标 ¥ {formatMoney(item.targetAmount)}
                    </div>
                  </div>
                  <div className="app-list-value">{Math.round(percent)}%</div>
                </div>
                <div className="mini-progress">
                  <span style={{ width: `${Math.max(4, Math.min(percent, 100))}%`, background: "linear-gradient(90deg,#2f7cff,#7aa8ff)" }} />
                </div>
                <div className="app-list-subtitle" style={{ marginTop: 7 }}>
                  截止 {item.deadline || "未设置"}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
