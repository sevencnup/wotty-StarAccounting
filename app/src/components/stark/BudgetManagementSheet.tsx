"use client";

import { useEffect, useState } from "react";
import type { Budget } from "@/lib/stark/models";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { getCurrentAccountId } from "@/lib/stark/storage/local-config";
import { nowText } from "@/lib/stark/utils/format";
import { createId } from "@/lib/stark/utils/id";
import { BottomSheet } from "@/components/stark/BottomSheet";

const manager = new DataModeManager();

type BudgetManagementSheetProps = {
  budgets: Budget[];
  onBudgetsChange: (budgets: Budget[]) => void;
  onClose: () => void;
  historyMode?: "marker" | "route";
};

export function BudgetManagementSheet({ budgets: initialBudgets, onBudgetsChange, onClose, historyMode = "marker" }: BudgetManagementSheetProps) {
  const [budgets, setBudgets] = useState(initialBudgets);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [period, setPeriod] = useState<Budget["period"]>("MONTHLY");
  const [alertPercent, setAlertPercent] = useState(80);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setBudgets(initialBudgets);
  }, [initialBudgets]);

  function closeEditor() {
    setEditing(null);
    setAmount("");
    setEditorOpen(false);
    setMessage("");
  }

  function beginCreate() {
    setEditing(null);
    setAmount("");
    setPeriod("MONTHLY");
    setAlertPercent(80);
    setMessage("");
    setEditorOpen(true);
  }

  function beginEdit(item: Budget) {
    setEditing(item);
    setAmount(String(item.amount));
    setPeriod(item.period);
    setAlertPercent(item.alertPercent);
    setMessage("");
    setEditorOpen(true);
  }

  async function save() {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) {
      setMessage("请输入大于 0 的预算金额");
      return;
    }
    if (saving) return;

    setSaving(true);
    setMessage("");
    const timestamp = nowText();
    const savedBudget: Budget = {
      id: editing?.id ?? createId("budget"),
      userId: editing?.userId ?? "local-user",
      accountId: editing?.accountId ?? getCurrentAccountId(),
      amount: value,
      category: "ALL",
      period,
      alertPercent: Math.max(1, Math.min(100, Math.round(alertPercent))),
      platform: null,
      scopeType: "GLOBAL",
      createdAt: editing?.createdAt ?? timestamp,
      updatedAt: timestamp,
    };

    try {
      await manager.getRepository().saveBudget(savedBudget);
      const nextBudgets = [savedBudget, ...budgets.filter((item) => item.id !== savedBudget.id)];
      setBudgets(nextBudgets);
      onBudgetsChange(nextBudgets);
      closeEditor();
    } catch {
      setMessage("保存失败，请检查当前数据源后重试");
    } finally {
      setSaving(false);
    }
  }

  async function remove(item: Budget) {
    if (!window.confirm(`确定删除${item.period === "MONTHLY" ? "月度" : "年度"}总预算吗？`)) return;
    setMessage("");
    try {
      await manager.getRepository().deleteBudget(item.id);
      const nextBudgets = budgets.filter((budget) => budget.id !== item.id);
      setBudgets(nextBudgets);
      onBudgetsChange(nextBudgets);
      if (editing?.id === item.id) closeEditor();
    } catch {
      setMessage("删除失败，请检查当前数据源后重试");
    }
  }

  return (
    <BottomSheet title="预算管理" onClose={onClose} historyMode={historyMode} className="budget-management-sheet">
          <section className="budget-management-overview">
            <div className="budget-management-overview-head">
              <div><strong>总预算</strong><span>先从一个月度或年度总额开始管理</span></div>
              <button type="button" className="settings-confirm-button" onClick={beginCreate}>新增预算</button>
            </div>

            <div className="budget-management-list">
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
            <section className="budget-management-editor">
              <div className="budget-management-editor-head">
                <div><strong>{editing ? "编辑预算" : "新增预算"}</strong><span>分类预算和平台预算可在后续版本扩展</span></div>
                <button type="button" onClick={closeEditor}>取消</button>
              </div>
              <div className="budget-editor-grid">
                <label><span>预算金额</span><input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ""))} placeholder="0.00" /></label>
                <label><span>周期</span><select value={period} onChange={(event) => setPeriod(event.target.value as Budget["period"])}><option value="MONTHLY">每月</option><option value="YEARLY">每年</option></select></label>
                <label className="budget-editor-alert"><span>提醒比例 {alertPercent}%</span><input type="range" min="1" max="100" value={alertPercent} style={{ "--budget-progress": `${alertPercent}%` } as React.CSSProperties} onChange={(event) => setAlertPercent(Number(event.target.value))} /></label>
              </div>
              {message ? <p className="budget-management-message" role="alert">{message}</p> : null}
              <button type="button" className="settings-confirm-button budget-management-save" disabled={saving} onClick={() => void save()}>{saving ? "保存中…" : "保存预算"}</button>
            </section>
          ) : message ? <p className="budget-management-message" role="alert">{message}</p> : null}
    </BottomSheet>
  );
}
