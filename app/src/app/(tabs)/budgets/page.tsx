"use client";

import { useEffect, useState } from "react";
import { PageTopBar } from "@/components/stark/PageTopBar";
import { PageDataError, PageSkeleton } from "@/components/stark/Skeleton";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { getCurrentAccountId } from "@/lib/stark/storage/local-config";
import { nowText } from "@/lib/stark/utils/format";
import { createId } from "@/lib/stark/utils/id";
import type { Budget } from "@/lib/stark/models";

const repo = new DataModeManager().getRepository();

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<Budget["period"]>("MONTHLY");
  const [alertPercent, setAlertPercent] = useState(80);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(false);
    try {
      setBudgets(await repo.getBudgets(getCurrentAccountId()));
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  function beginCreate() {
    setEditorOpen(true);
    setEditing(null);
    setAmount("");
    setPeriod("MONTHLY");
    setAlertPercent(80);
  }

  function beginEdit(item: Budget) {
    setEditorOpen(true);
    setEditing(item);
    setAmount(String(item.amount));
    setPeriod(item.period);
    setAlertPercent(item.alertPercent);
  }

  async function save() {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0 || saving) return;
    setSaving(true);
    const now = nowText();
    const accountId = getCurrentAccountId();
    try {
      await repo.saveBudget({
        id: editing?.id ?? createId("budget"),
        userId: editing?.userId ?? "local-user",
        accountId,
        amount: value,
        category: "ALL",
        period,
        alertPercent: Math.max(1, Math.min(100, Math.round(alertPercent))),
        platform: null,
        scopeType: "GLOBAL",
        createdAt: editing?.createdAt ?? now,
        updatedAt: now,
      });
      setEditing(null);
      setAmount("");
      setEditorOpen(false);
      await load();
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: Budget) {
    if (!window.confirm(`确定删除${item.period === "MONTHLY" ? "月度" : "年度"}总预算吗？`)) return;
    await repo.deleteBudget(item.id);
    await load();
  }

  if (loading) return <PageSkeleton title="预算管理" cards={2} />;
  if (error) return <PageDataError title="预算管理" onRetry={() => void load()} />;

  return (
    <div className="page-stack finance-page budgets-page">
      <PageTopBar title="预算管理" />
      <section className="home-card finance-section budgets-hero">
        <div className="finance-section-head"><div><h2>总预算</h2><span>先从一个月度或年度总额开始管理</span></div><button type="button" className="settings-confirm-button" onClick={beginCreate}>新增预算</button></div>
        <div className="budget-list">
          {budgets.length ? budgets.map((item) => (
            <article className="budget-management-row" key={item.id}>
              <div><strong>{item.period === "MONTHLY" ? "月度总预算" : "年度总预算"}</strong><span>达到 {item.alertPercent}% 时提醒</span></div>
              <strong>¥ {item.amount.toFixed(2)}</strong>
              <div className="budget-management-actions"><button type="button" onClick={() => beginEdit(item)}>编辑</button><button type="button" onClick={() => void remove(item)}>删除</button></div>
            </article>
          )) : <div className="finance-empty">还没有预算，先新增一个总预算</div>}
        </div>
      </section>
      {editorOpen ? (
        <section className="home-card finance-section budget-editor-card">
          <div className="finance-section-head"><div><h2>{editing ? "编辑预算" : "新增预算"}</h2><span>分类预算和平台预算可在后续版本扩展</span></div><button type="button" onClick={() => { setEditing(null); setAmount(""); setEditorOpen(false); }}>取消</button></div>
          <div className="budget-editor-grid">
            <label><span>预算金额</span><input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ""))} placeholder="0.00" /></label>
            <label><span>周期</span><select value={period} onChange={(event) => setPeriod(event.target.value as Budget["period"])}><option value="MONTHLY">每月</option><option value="YEARLY">每年</option></select></label>
            <label><span>提醒比例 {alertPercent}%</span><input type="range" min="1" max="100" value={alertPercent} onChange={(event) => setAlertPercent(Number(event.target.value))} /></label>
          </div>
          <button type="button" className="settings-confirm-button" disabled={saving} onClick={() => void save()}>{saving ? "保存中…" : "保存预算"}</button>
        </section>
      ) : null}
    </div>
  );
}
