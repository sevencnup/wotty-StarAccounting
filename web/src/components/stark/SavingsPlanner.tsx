"use client";

import { useEffect, useMemo, useState } from "react";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { buildSavingsMonths, calculateSavingsRow, type SavingsFrequency } from "@/lib/stark/savings/planner";
import { formatMoney, nowText } from "@/lib/stark/utils/format";
import type { SavingsGoal, SavingsPlan } from "@/lib/stark/models";

const repo = new DataModeManager().getRepository();
const DEFAULT_COLUMNS = ["房租", "水电", "其他", "购物"];

type PlannerRow = {
  id?: string;
  createdAt?: string;
  salary: string;
  expected: string;
  expenses: Record<string, string>;
};

type PlanConfig = {
  frequency?: SavingsFrequency;
  columns?: string[];
};

function parseConfig(raw?: string | null): PlanConfig {
  if (!raw) return {};
  try {
    return JSON.parse(raw) as PlanConfig;
  } catch {
    return {};
  }
}

function parseExpenses(raw?: string | null) {
  if (!raw) return {};
  try {
    const values = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(Object.entries(values).map(([key, value]) => [key, String(Number(value) || "")]));
  } catch {
    return {};
  }
}

function monthLabel(month: string) {
  return `${Number(month.slice(5, 7))}月`;
}

function createDefaultGoal(year: number): SavingsGoal {
  const now = nowText();
  return {
    id: crypto.randomUUID(),
    userId: "local-user",
    accountId: "default",
    name: `${year} 年度储蓄`,
    targetAmount: 0,
    currentAmount: 0,
    deadline: `${year}-12-31`,
    type: "LONG_TERM",
    status: "ACTIVE",
    depositType: "CASH",
    planConfig: null,
    createdAt: now,
    updatedAt: now,
  };
}

export function SavingsPlanner({
  onSaved,
  embedded = false,
}: {
  onSaved?: () => void;
  embedded?: boolean;
}) {
  const year = new Date().getFullYear();
  const [goal, setGoal] = useState<SavingsGoal | null>(null);
  const [frequency, setFrequency] = useState<SavingsFrequency>("MONTHLY");
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [rows, setRows] = useState<Record<string, PlannerRow>>({});
  const [newColumn, setNewColumn] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");

  const months = useMemo(() => buildSavingsMonths(year, frequency), [frequency, year]);

  useEffect(() => {
    void loadPlanner();
  }, []);

  async function saveGoalWithFallback(nextGoal: SavingsGoal) {
    try {
      await repo.saveSavingsGoal(nextGoal);
    } catch {
      // The planner should stay usable even when both cloud and IndexedDB writes fail.
    }
  }

  async function savePlanWithFallback(plan: SavingsPlan) {
    try {
      await repo.saveSavingsPlan(plan);
    } catch {
      // Saving the rest of the batch should continue if one target is unavailable.
    }
  }

  async function loadPlanner() {
    try {
      const goals = await repo.getSavingsGoals("default");
      const activeGoal = goals[0] ?? createDefaultGoal(year);
      if (!goals.length) void saveGoalWithFallback(activeGoal);

      const config = parseConfig(activeGoal.planConfig);
      const plans = await repo.getSavingsPlans(activeGoal.id);
      const hydratedRows: Record<string, PlannerRow> = {};
      const expenseColumns = new Set(config.columns?.length ? config.columns : DEFAULT_COLUMNS);

      plans.forEach((plan) => {
        const expenses = parseExpenses(plan.expenses);
        Object.keys(expenses).forEach((column) => expenseColumns.add(column));
        hydratedRows[plan.month] = {
          id: plan.id,
          createdAt: plan.createdAt,
          salary: plan.salary ? String(plan.salary) : "",
          expected: plan.amount ? String(plan.amount) : "",
          expenses,
        };
      });

      setGoal(activeGoal);
      setFrequency(config.frequency ?? "MONTHLY");
      setColumns([...expenseColumns]);
      setRows(hydratedRows);
    } catch {
      setGoal(createDefaultGoal(year));
      setFrequency("MONTHLY");
      setColumns(DEFAULT_COLUMNS);
      setRows({});
      setNotice("储蓄计划已进入本地编辑模式");
    } finally {
      setLoading(false);
    }
  }

  function rowFor(month: string): PlannerRow {
    return rows[month] ?? { salary: "", expected: "", expenses: {} };
  }

  function updateRow(month: string, updater: (row: PlannerRow) => PlannerRow) {
    setRows((current) => ({ ...current, [month]: updater(current[month] ?? { salary: "", expected: "", expenses: {} }) }));
    setNotice("");
  }

  function updateField(month: string, field: "salary" | "expected", value: string) {
    setRows((current) => {
      if (month !== months[0]) {
        const row = current[month] ?? { salary: "", expected: "", expenses: {} };
        return { ...current, [month]: { ...row, [field]: value } };
      }
      return months.reduce((next, item) => {
        const row = current[item] ?? { salary: "", expected: "", expenses: {} };
        next[item] = { ...row, [field]: value };
        return next;
      }, { ...current } as Record<string, PlannerRow>);
    });
    setNotice("");
  }

  function updateExpense(month: string, column: string, value: string) {
    setRows((current) => {
      if (month !== months[0]) {
        const row = current[month] ?? { salary: "", expected: "", expenses: {} };
        return { ...current, [month]: { ...row, expenses: { ...row.expenses, [column]: value } } };
      }
      return months.reduce((next, item) => {
        const row = current[item] ?? { salary: "", expected: "", expenses: {} };
        next[item] = { ...row, expenses: { ...row.expenses, [column]: value } };
        return next;
      }, { ...current } as Record<string, PlannerRow>);
    });
    setNotice("");
  }

  function addExpenseColumn() {
    const name = newColumn.trim();
    if (!name || columns.includes(name)) return;
    setColumns((current) => [...current, name]);
    setNewColumn("");
    setNotice(`已新增“${name}”列`);
  }

  function removeExpenseColumn(name: string) {
    setColumns((current) => current.filter((column) => column !== name));
    setRows((current) => Object.fromEntries(Object.entries(current).map(([month, row]) => {
      const expenses = { ...row.expenses };
      delete expenses[name];
      return [month, { ...row, expenses }];
    })));
  }

  async function savePlans() {
    if (!goal || saving) return;
    setSaving(true);
    try {
      const now = nowText();
      const nextGoal = {
        ...goal,
        planConfig: JSON.stringify({ frequency, columns }),
        updatedAt: now,
      };
      await saveGoalWithFallback(nextGoal);

      await Promise.all(months.map((month) => {
        const row = rowFor(month);
        const plan: SavingsPlan = {
          id: row.id ?? `plan-${goal.id}-${month}`,
          goalId: goal.id,
          amount: Number(row.expected) || 0,
          status: "PENDING",
          month,
          salary: Number(row.salary) || 0,
          expenses: JSON.stringify(Object.fromEntries(columns.map((column) => [column, Number(row.expenses[column]) || 0]))),
          remark: frequency === "MONTHLY" ? "单月存模式" : "隔月存模式",
          proofImage: null,
          createdAt: row.createdAt ?? now,
          updatedAt: now,
        };
        return savePlanWithFallback(plan);
      }));

      setGoal(nextGoal);
      setNotice(`已保存 ${months.length} 个月的储蓄计划`);
      onSaved?.();
    } catch {
      setNotice("保存失败，请稍后重试");
    } finally {
      setSaving(false);
    }
  }

  const totals = useMemo(() => months.reduce((result, month) => {
    const row = rowFor(month);
    const calculated = calculateSavingsRow({ salary: row.salary, expenses: row.expenses, expected: row.expected });
    result.salary += Number(row.salary) || 0;
    result.expected += Number(row.expected) || 0;
    result.remaining += calculated.remaining;
    return result;
  }, { salary: 0, expected: 0, remaining: 0 }), [months, rows]);

  if (loading) {
    return <div className="savings-planner-loading">储蓄计划加载中...</div>;
  }

  return (
    <div className={`savings-planner-shell ${embedded ? "embedded" : ""}`}>
      {!embedded ? (
        <section className="home-card savings-plan-hero">
          <div>
            <div className="page-hero-label">{year} 年预计存</div>
            <div className="page-hero-value">¥ {formatMoney(totals.expected)}</div>
          </div>
          <div className="savings-hero-meta">
            <span>计划薪资 <strong>¥ {formatMoney(totals.salary)}</strong></span>
            <span>预计剩余 <strong className={totals.remaining < 0 ? "negative" : ""}>¥ {formatMoney(totals.remaining)}</strong></span>
          </div>
        </section>
      ) : null}

      <section className={`home-card savings-plan-card ${embedded ? "embedded" : ""}`}>
        {embedded ? (
          <div className="savings-panel-summary">
            <div>
              <span>{year} 年预计存</span>
              <strong>¥ {formatMoney(totals.expected)}</strong>
            </div>
            <div>
              <span>预计剩余</span>
              <strong className={totals.remaining < 0 ? "negative" : ""}>¥ {formatMoney(totals.remaining)}</strong>
            </div>
          </div>
        ) : null}

        <div className="savings-plan-toolbar">
          <div className="savings-mode-switch" role="tablist" aria-label="储蓄频率">
            <button type="button" className={frequency === "MONTHLY" ? "active" : ""} onClick={() => setFrequency("MONTHLY")}>单月存</button>
            <button type="button" className={frequency === "ALTERNATE" ? "active" : ""} onClick={() => setFrequency("ALTERNATE")}>隔月存</button>
          </div>
          <span className="savings-mode-copy">{frequency === "MONTHLY" ? "每个月都存，共 12 行" : "隔一个月存，共 6 行"}</span>
        </div>

        <div className="savings-column-adder">
          <input value={newColumn} onChange={(event) => setNewColumn(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addExpenseColumn()} placeholder="新增支出列，如交通" />
          <button type="button" onClick={addExpenseColumn}>新增列</button>
        </div>

        <div className="savings-table-scroll">
          <table className="savings-plan-table">
            <thead>
              <tr>
                <th className="month-column">月份</th>
                <th className="salary-column">薪资</th>
                {columns.map((column) => (
                  <th key={column}>
                    <span>{column}</span>
                    <button type="button" onClick={() => removeExpenseColumn(column)} aria-label={`删除${column}列`}>×</button>
                  </th>
                ))}
                <th className="expected-column">预计存</th>
                <th className="remaining-column">剩余</th>
              </tr>
            </thead>
            <tbody>
              {months.map((month) => {
                const row = rowFor(month);
                const calculated = calculateSavingsRow({ salary: row.salary, expenses: row.expenses, expected: row.expected });
                return (
                  <tr key={month}>
                    <th className="month-column">{monthLabel(month)}</th>
                    <td className="salary-column"><input inputMode="decimal" value={row.salary} onChange={(event) => updateField(month, "salary", event.target.value.replace(/[^\d.]/g, ""))} aria-label={`${monthLabel(month)}薪资`} placeholder="0" /></td>
                    {columns.map((column) => (
                      <td key={column}><input inputMode="decimal" value={row.expenses[column] ?? ""} onChange={(event) => updateExpense(month, column, event.target.value.replace(/[^\d.]/g, ""))} aria-label={`${monthLabel(month)}${column}`} placeholder="0" /></td>
                    ))}
                    <td className="expected-column"><input inputMode="decimal" value={row.expected} onChange={(event) => updateField(month, "expected", event.target.value.replace(/[^\d.]/g, ""))} aria-label={`${monthLabel(month)}预计存`} placeholder="可不填" /></td>
                    <td className={`remaining-column savings-remaining ${calculated.remaining < 0 ? "negative" : ""}`}>¥{formatMoney(calculated.remaining)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="savings-plan-footer">
          <span>{notice || "预计存不填时，扣除支出后的金额全部计入剩余"}</span>
          <button type="button" className="primary-button" disabled={saving} onClick={() => void savePlans()}>{saving ? "保存中" : "保存计划"}</button>
        </div>
      </section>
    </div>
  );
}
