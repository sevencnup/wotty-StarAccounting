"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { buildSavingsMonths, calculateSavingsRow, PREVIOUS_BALANCE_COLUMN, removeSavingsMonth, shouldSyncSavingsExpense, validateSavingsExpenseColumn, type SavingsFrequency } from "@/lib/stark/savings/planner";
import { formatMoney, nowText } from "@/lib/stark/utils/format";
import { createId } from "@/lib/stark/utils/id";
import { clearNewEntryDraft, readNewEntryDraft, saveNewEntryDraft } from "@/lib/stark/storage/new-entry-drafts";
import type { SavingsGoal, SavingsGoalDepositType, SavingsPlan } from "@/lib/stark/models";

const repo = new DataModeManager().getRepository();
const DEFAULT_COLUMNS = ["房租", "水电", "其他", "购物"];
const SAVINGS_PLAN_REMARKS: Record<SavingsFrequency, string> = {
  MONTHLY: "单月存模式",
  ALTERNATE: "隔月存模式",
};
const DEPOSIT_TYPE_OPTIONS: Array<{ value: SavingsGoalDepositType; label: string }> = [
  { value: "PRIVATE", label: "死期" },
  { value: "CASH", label: "现金" },
  { value: "HELP_DEPOSIT", label: "他人帮存" },
];

type PlannerRow = {
  id?: string;
  createdAt?: string;
  salary: string;
  previousBalance: string;
  expected: string;
  expenses: Record<string, string>;
};

type PlanConfig = {
  frequency?: SavingsFrequency;
  columns?: string[];
  fixedColumns?: string[];
  temporaryColumns?: string[];
  previousBalance?: boolean;
  months?: string[];
  monthsByFrequency?: Partial<Record<SavingsFrequency, string[]>>;
};

type SavingsDraft = {
  goalName: string;
  depositType: SavingsGoalDepositType;
  frequency: SavingsFrequency;
  columns: string[];
  temporaryColumns: string[];
  previousBalanceEnabled: boolean;
  monthsByFrequency: Record<SavingsFrequency, string[]>;
  rows?: Record<string, PlannerRow>;
  rowsByFrequency?: Partial<Record<SavingsFrequency, Record<string, PlannerRow>>>;
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

function planRemark(frequency: SavingsFrequency) {
  return SAVINGS_PLAN_REMARKS[frequency];
}

function belongsToFrequency(plan: SavingsPlan, frequency: SavingsFrequency, legacyFrequency: SavingsFrequency) {
  if (plan.remark === planRemark(frequency)) return true;
  if (plan.remark === planRemark(frequency === "MONTHLY" ? "ALTERNATE" : "MONTHLY")) return false;
  return legacyFrequency === frequency;
}

function defaultMonthsByFrequency(year: number): Record<SavingsFrequency, string[]> {
  return {
    MONTHLY: buildSavingsMonths(year, "MONTHLY"),
    ALTERNATE: buildSavingsMonths(year, "ALTERNATE"),
  };
}

function normalizeMonths(year: number, frequency: SavingsFrequency, value?: string[]) {
  const generated = buildSavingsMonths(year, frequency);
  const selected = Array.isArray(value) ? value.filter((month) => generated.includes(month)) : generated;
  return selected.length ? selected : generated;
}

function emptyPlannerRow(): PlannerRow {
  return { salary: "", previousBalance: "", expected: "", expenses: {} };
}

function normalizePlannerRow(row?: Partial<PlannerRow> | null): PlannerRow {
  const expenses = row?.expenses ?? {};
  return {
    id: row?.id,
    createdAt: row?.createdAt,
    salary: String(row?.salary ?? ""),
    previousBalance: String(row?.previousBalance ?? expenses[PREVIOUS_BALANCE_COLUMN] ?? ""),
    expected: String(row?.expected ?? ""),
    expenses: Object.fromEntries(Object.entries(expenses)
      .filter(([column]) => column !== PREVIOUS_BALANCE_COLUMN)
      .map(([column, value]) => [column, String(value ?? "")])),
  };
}

function defaultMonthsForConfig(year: number, config: PlanConfig): Record<SavingsFrequency, string[]> {
  return {
    MONTHLY: normalizeMonths(year, "MONTHLY", config.monthsByFrequency?.MONTHLY ?? (config.frequency === "MONTHLY" ? config.months : undefined)),
    ALTERNATE: normalizeMonths(year, "ALTERNATE", config.monthsByFrequency?.ALTERNATE ?? (config.frequency === "ALTERNATE" ? config.months : undefined)),
  };
}

function monthLabel(month: string) {
  return `${Number(month.slice(5, 7))}月`;
}

function normalizeDepositType(value?: SavingsGoalDepositType | null): SavingsGoalDepositType {
  if (value === "FIXED_TERM") return "PRIVATE";
  if (value === "HELP_DEPOSIT" || value === "PRIVATE" || value === "CASH") return value;
  return "CASH";
}

function depositTypeLabel(value?: SavingsGoalDepositType | null) {
  return DEPOSIT_TYPE_OPTIONS.find((item) => item.value === normalizeDepositType(value))?.label ?? "现金";
}

function createDefaultGoal(year: number): SavingsGoal {
  const now = nowText();
  return {
    id: createId("savings-goal"),
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
  const [goal, setGoal] = useState<SavingsGoal>(() => createDefaultGoal(year));
  const [goalName, setGoalName] = useState(() => `${year} 年度储蓄`);
  const [depositType, setDepositType] = useState<SavingsGoalDepositType>("CASH");
  const [frequency, setFrequency] = useState<SavingsFrequency>("MONTHLY");
  const [columns, setColumns] = useState(DEFAULT_COLUMNS);
  const [temporaryColumns, setTemporaryColumns] = useState<string[]>([]);
  const [previousBalanceEnabled, setPreviousBalanceEnabled] = useState(false);
  const [monthsByFrequency, setMonthsByFrequency] = useState<Record<SavingsFrequency, string[]>>(() => defaultMonthsByFrequency(year));
  const [rowsByFrequency, setRowsByFrequency] = useState<Record<SavingsFrequency, Record<string, PlannerRow>>>({ MONTHLY: {}, ALTERNATE: {} });
  const [newColumn, setNewColumn] = useState("");
  const [hydrating, setHydrating] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  const loadStartedRef = useRef(false);
  const columnInputRef = useRef<HTMLInputElement | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const draftSubmittedRef = useRef(false);
  const persistedPlansRef = useRef<SavingsPlan[]>([]);

  const months = monthsByFrequency[frequency];

  useEffect(() => {
    if (loadStartedRef.current) return;
    loadStartedRef.current = true;
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
      const activeGoal = goals[0] ?? goal;
      if (!goals.length) void saveGoalWithFallback(activeGoal);

      const config = parseConfig(activeGoal.planConfig);
      const plans = await repo.getSavingsPlans(activeGoal.id);
      persistedPlansRef.current = plans;
      const draft = readNewEntryDraft<SavingsDraft>("savings");
      const legacyFrequency = config.frequency ?? "MONTHLY";
      const initialFrequency = draft?.frequency ?? legacyFrequency;
      const hydratedRowsByFrequency: Record<SavingsFrequency, Record<string, PlannerRow>> = { MONTHLY: {}, ALTERNATE: {} };
      const configuredColumns = (config.columns?.length ? config.columns : DEFAULT_COLUMNS).filter((column) => column !== PREVIOUS_BALANCE_COLUMN);
      const fixedColumns = (config.fixedColumns?.length ? config.fixedColumns : configuredColumns).filter((column) => column !== PREVIOUS_BALANCE_COLUMN);
      const configuredTemporaryColumns = (config.temporaryColumns ?? []).filter((column) => column !== PREVIOUS_BALANCE_COLUMN);
      const expenseColumns = new Set([...fixedColumns, ...configuredTemporaryColumns]);

      (['MONTHLY', 'ALTERNATE'] as SavingsFrequency[]).forEach((mode) => {
        plans.filter((plan) => belongsToFrequency(plan, mode, legacyFrequency)).forEach((plan) => {
          const expenses = parseExpenses(plan.expenses);
          Object.keys(expenses).filter((column) => column !== PREVIOUS_BALANCE_COLUMN).forEach((column) => expenseColumns.add(column));
          hydratedRowsByFrequency[mode][plan.month] = {
            id: plan.id,
            createdAt: plan.createdAt,
            salary: plan.salary ? String(plan.salary) : "",
            previousBalance: expenses[PREVIOUS_BALANCE_COLUMN] ?? "",
            expected: plan.amount ? String(plan.amount) : "",
            expenses: Object.fromEntries(Object.entries(expenses).filter(([column]) => column !== PREVIOUS_BALANCE_COLUMN)),
          };
        });
      });

      const draftColumns = (Array.isArray(draft?.columns) && draft.columns.length ? draft.columns : [...expenseColumns])
        .filter((column) => column !== PREVIOUS_BALANCE_COLUMN);
      const draftTemporaryColumns = Array.isArray(draft?.temporaryColumns)
        ? draft.temporaryColumns.filter((column) => draftColumns.includes(column))
        : configuredTemporaryColumns.filter((column) => expenseColumns.has(column));
      const configuredMonths = defaultMonthsForConfig(year, config);
      const draftMonths = draft?.monthsByFrequency;
      setGoal(activeGoal);
      setGoalName(draft?.goalName ?? activeGoal.name ?? "");
      setDepositType(normalizeDepositType(draft?.depositType ?? activeGoal.depositType));
      setFrequency(initialFrequency);
      setColumns(draftColumns);
      setTemporaryColumns(draftTemporaryColumns);
      setPreviousBalanceEnabled(draft?.previousBalanceEnabled ?? config.previousBalance ?? plans.some((plan) => PREVIOUS_BALANCE_COLUMN in parseExpenses(plan.expenses)));
      setMonthsByFrequency({
        MONTHLY: normalizeMonths(year, "MONTHLY", draftMonths?.MONTHLY ?? configuredMonths.MONTHLY),
        ALTERNATE: normalizeMonths(year, "ALTERNATE", draftMonths?.ALTERNATE ?? configuredMonths.ALTERNATE),
      });
      const hydratedRows = Object.fromEntries((['MONTHLY', 'ALTERNATE'] as SavingsFrequency[]).map((mode) => [
        mode,
        Object.fromEntries(Object.entries(hydratedRowsByFrequency[mode]).map(([month, row]) => [month, normalizePlannerRow(row)])),
      ])) as Record<SavingsFrequency, Record<string, PlannerRow>>;
      const nextRowsByFrequency = draft?.rowsByFrequency
        ? Object.fromEntries((['MONTHLY', 'ALTERNATE'] as SavingsFrequency[]).map((mode) => [
          mode,
          {
            ...hydratedRows[mode],
            ...Object.fromEntries(Object.entries(draft.rowsByFrequency?.[mode] ?? {}).map(([month, row]) => [month, normalizePlannerRow(row)])),
          },
        ])) as Record<SavingsFrequency, Record<string, PlannerRow>>
        : { ...hydratedRows, [initialFrequency]: Object.fromEntries(Object.entries(draft?.rows ?? hydratedRows[initialFrequency]).map(([month, row]) => [month, normalizePlannerRow(row)])) };
      setRowsByFrequency(nextRowsByFrequency);
    } catch {
      const fallbackGoal = createDefaultGoal(year);
      const draft = readNewEntryDraft<SavingsDraft>("savings");
      setGoal(fallbackGoal);
      setGoalName(draft?.goalName ?? fallbackGoal.name);
      setDepositType(normalizeDepositType(draft?.depositType ?? fallbackGoal.depositType));
      setFrequency(draft?.frequency ?? "MONTHLY");
      setColumns((draft?.columns?.length ? draft.columns : DEFAULT_COLUMNS).filter((column) => column !== PREVIOUS_BALANCE_COLUMN));
      setTemporaryColumns((draft?.temporaryColumns ?? []).filter((column) => column !== PREVIOUS_BALANCE_COLUMN));
      setPreviousBalanceEnabled(draft?.previousBalanceEnabled ?? false);
      setMonthsByFrequency({
        MONTHLY: normalizeMonths(year, "MONTHLY", draft?.monthsByFrequency?.MONTHLY),
        ALTERNATE: normalizeMonths(year, "ALTERNATE", draft?.monthsByFrequency?.ALTERNATE),
      });
      const legacyRows = Object.fromEntries(Object.entries(draft?.rows ?? {}).map(([month, row]) => [month, normalizePlannerRow(row)]));
      const nextRowsByFrequency = draft?.rowsByFrequency
        ? Object.fromEntries((['MONTHLY', 'ALTERNATE'] as SavingsFrequency[]).map((mode) => [
          mode,
          Object.fromEntries(Object.entries(draft.rowsByFrequency?.[mode] ?? {}).map(([month, row]) => [month, normalizePlannerRow(row)])),
        ])) as Record<SavingsFrequency, Record<string, PlannerRow>>
        : { MONTHLY: {}, ALTERNATE: {}, [draft?.frequency ?? 'MONTHLY']: legacyRows } as Record<SavingsFrequency, Record<string, PlannerRow>>;
      setRowsByFrequency(nextRowsByFrequency);
      setNotice("储蓄计划已进入本地编辑模式");
    } finally {
      setDraftReady(true);
      setHydrating(false);
    }
  }

  useEffect(() => {
    if (!draftReady || draftSubmittedRef.current) return;
    saveNewEntryDraft<SavingsDraft>("savings", {
      goalName,
      depositType,
      frequency,
      columns,
      temporaryColumns,
      previousBalanceEnabled,
      monthsByFrequency,
      rowsByFrequency,
    });
  }, [columns, depositType, draftReady, frequency, goalName, monthsByFrequency, previousBalanceEnabled, rowsByFrequency, temporaryColumns]);

  function rowFor(month: string): PlannerRow {
    return rowsByFrequency[frequency][month] ?? emptyPlannerRow();
  }

  function updateRow(month: string, updater: (row: PlannerRow) => PlannerRow) {
    setRowsByFrequency((current) => ({
      ...current,
      [frequency]: { ...current[frequency], [month]: updater(current[frequency][month] ?? emptyPlannerRow()) },
    }));
    setNotice("");
  }

  function updateField(month: string, field: "salary" | "previousBalance" | "expected", value: string) {
    setRowsByFrequency((current) => {
      const currentRows = current[frequency];
      if (field === "previousBalance") {
        return { ...current, [frequency]: { ...currentRows, [month]: { ...(currentRows[month] ?? emptyPlannerRow()), previousBalance: value } } };
      }
      if (month !== months[0]) {
        const row = currentRows[month] ?? emptyPlannerRow();
        return { ...current, [frequency]: { ...currentRows, [month]: { ...row, [field]: value } } };
      }
      const nextRows = months.reduce((next, item) => {
        const row = currentRows[item] ?? emptyPlannerRow();
        next[item] = { ...row, [field]: value };
        return next;
      }, { ...currentRows });
      return { ...current, [frequency]: nextRows };
    });
    setNotice("");
  }

  function removeMonth(month: string) {
    setMonthsByFrequency((current) => {
      const currentMonths = current[frequency];
      if (currentMonths.length <= 1) {
        setNotice("至少保留一个月份行");
        return current;
      }
      setNotice(`已删除${monthLabel(month)}月份行`);
      return { ...current, [frequency]: removeSavingsMonth(currentMonths, month) };
    });
  }

  function togglePreviousBalance() {
    setPreviousBalanceEnabled((current) => !current);
    setNotice("");
  }

  function updateExpense(month: string, column: string, value: string) {
    setRowsByFrequency((current) => {
      if (!shouldSyncSavingsExpense(month, months[0], column, temporaryColumns)) {
        const row = current[frequency][month] ?? emptyPlannerRow();
        return { ...current, [frequency]: { ...current[frequency], [month]: { ...row, expenses: { ...row.expenses, [column]: value } } } };
      }
      const nextRows = months.reduce((next, item) => {
        const row = current[frequency][item] ?? emptyPlannerRow();
        next[item] = { ...row, expenses: { ...row.expenses, [column]: value } };
        return next;
      }, { ...current[frequency] });
      return { ...current, [frequency]: nextRows };
    });
    setNotice("");
  }

  function addExpenseColumn(mode: "FIXED" | "TEMPORARY") {
    const name = newColumn.trim();
    const validationNotice = validateSavingsExpenseColumn(name, columns);
    if (validationNotice) {
      setNotice(validationNotice);
      columnInputRef.current?.focus();
      return;
    }
    setColumns((current) => [...current, name]);
    if (mode === "TEMPORARY") setTemporaryColumns((current) => [...current, name]);
    setNewColumn("");
    setNotice(`已新增${mode === "TEMPORARY" ? "临时支出" : "固定支出"}“${name}”列`);
  }

  function removeExpenseColumn(name: string) {
    setColumns((current) => current.filter((column) => column !== name));
    setTemporaryColumns((current) => current.filter((column) => column !== name));
    setRowsByFrequency((current) => Object.fromEntries(
      Object.entries(current).map(([mode, modeRows]) => [mode, Object.fromEntries(Object.entries(modeRows).map(([month, row]) => {
        const expenses = { ...row.expenses };
        delete expenses[name];
        return [month, { ...row, expenses }];
      }))]),
    ) as Record<SavingsFrequency, Record<string, PlannerRow>>);
  }

  async function savePlans() {
    if (saving) return;
    setSaving(true);
    try {
      const now = nowText();
      const nextGoal = {
        ...goal,
        name: goalName.trim() || `${year} 年度储蓄`,
        depositType: normalizeDepositType(depositType),
        planConfig: JSON.stringify({
          frequency,
          columns,
          fixedColumns: columns.filter((column) => !temporaryColumns.includes(column)),
          temporaryColumns,
          previousBalance: previousBalanceEnabled,
          monthsByFrequency,
        }),
        updatedAt: now,
      };
      await saveGoalWithFallback(nextGoal);

      const legacyFrequency = parseConfig(goal.planConfig).frequency ?? "MONTHLY";
      const currentModePlans = persistedPlansRef.current.filter((plan) => belongsToFrequency(plan, frequency, legacyFrequency));
      const otherModePlans = persistedPlansRef.current.filter((plan) => !belongsToFrequency(plan, frequency, legacyFrequency));
      const plansToDelete = currentModePlans.filter((plan) => !months.includes(plan.month));
      await Promise.all(plansToDelete.map((plan) => repo.deleteSavingsPlan(plan.id).catch(() => undefined)));

      const nextPlans = months.map((month) => {
        const row = rowFor(month);
        const expenses = Object.fromEntries(columns.map((column) => [column, Number(row.expenses[column]) || 0]));
        if (previousBalanceEnabled) expenses[PREVIOUS_BALANCE_COLUMN] = Number(row.previousBalance) || 0;
        const previousPlan = currentModePlans.find((plan) => plan.id === row.id)
          ?? currentModePlans.find((plan) => plan.month === month);
        const plan: SavingsPlan = {
          id: previousPlan?.id ?? ("plan-" + goal.id + "-" + frequency + "-" + month),
          goalId: goal.id,
          amount: Number(row.expected) || 0,
          status: previousPlan?.status ?? "PENDING",
          month,
          salary: Number(row.salary) || 0,
          expenses: JSON.stringify(expenses),
          remark: planRemark(frequency),
          proofImage: previousPlan?.proofImage ?? null,
          createdAt: row.createdAt ?? previousPlan?.createdAt ?? now,
          updatedAt: now,
        };
        return plan;
      });
      await Promise.all(nextPlans.map((plan) => savePlanWithFallback(plan)));
      persistedPlansRef.current = [...otherModePlans, ...nextPlans];

      setGoal(nextGoal);
      draftSubmittedRef.current = true;
      clearNewEntryDraft("savings");
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
    const calculated = calculateSavingsRow({
      salary: row.salary,
      previousBalance: previousBalanceEnabled ? row.previousBalance : "",
      expenses: row.expenses,
      expected: row.expected,
    });
    result.salary += Number(row.salary) || 0;
    result.expected += Number(row.expected) || 0;
    result.remaining += calculated.remaining;
    return result;
  }, { salary: 0, expected: 0, remaining: 0 }), [months, previousBalanceEnabled, rowsByFrequency]);



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

        <div className="savings-goal-editor">
          <label className="savings-goal-field">
            <span>储蓄名称</span>
            <input
              value={goalName}
              onChange={(event) => setGoalName(event.target.value)}
              maxLength={24}
            />
          </label>
          <div className="savings-goal-field">
            <span>存储类型</span>
            <div className="savings-deposit-switch" role="tablist" aria-label="存储类型">
              {DEPOSIT_TYPE_OPTIONS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  className={depositType === item.value ? "active" : ""}
                  onClick={() => setDepositType(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="savings-plan-toolbar">
          <div className="savings-mode-switch" role="tablist" aria-label="储蓄频率">
            <button type="button" className={frequency === "MONTHLY" ? "active" : ""} onClick={() => setFrequency("MONTHLY")}>单月存</button>
            <button type="button" className={frequency === "ALTERNATE" ? "active" : ""} onClick={() => setFrequency("ALTERNATE")}>隔月存</button>
          </div>
        </div>

        <div className="savings-column-adder">
          <input ref={columnInputRef} value={newColumn} onChange={(event) => setNewColumn(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addExpenseColumn("FIXED")} placeholder="输入支出名称，如交通 / 临时医疗" />
          <button type="button" className="fixed-expense-column-button" onClick={() => addExpenseColumn("FIXED")}>新增固定支出</button>
          <button type="button" className="temporary-expense-column-button" onClick={() => addExpenseColumn("TEMPORARY")}>新增临时支出</button>
          <button type="button" className={"previous-balance-column-button" + (previousBalanceEnabled ? " active" : "")} onClick={togglePreviousBalance}>
            {previousBalanceEnabled ? "移除上月结余" : "添加上月结余"}
          </button>
        </div>

        <div className="savings-table-scroll">
          <table className="savings-plan-table">
            <thead>
              <tr>
                <th className="month-column">月份</th>
                <th className="salary-column">薪资</th>
                {previousBalanceEnabled ? <th className="previous-balance-column"><span>{PREVIOUS_BALANCE_COLUMN}</span><small>可选</small></th> : null}
                {columns.map((column) => (
                  <th key={column} className={temporaryColumns.includes(column) ? "temporary-expense-column" : "fixed-expense-column"}>
                    <span>{column}</span>
                    {temporaryColumns.includes(column) ? <small>临时</small> : null}
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
                const calculated = calculateSavingsRow({
                  salary: row.salary,
                  previousBalance: previousBalanceEnabled ? row.previousBalance : "",
                  expenses: row.expenses,
                  expected: row.expected,
                });
                return (
                  <tr key={month}>
                    <th className="month-column">
                      <span>{monthLabel(month)}</span>
                      <button type="button" className="month-remove-button" onClick={() => removeMonth(month)} aria-label="删除月份行" title="删除月份行">×</button>
                    </th>
                    <td className="salary-column"><input inputMode="decimal" value={row.salary} onChange={(event) => updateField(month, "salary", event.target.value.replace(/[^\d.]/g, ""))} aria-label={`${monthLabel(month)}薪资`} placeholder="0" /></td>
                    {previousBalanceEnabled ? <td className="previous-balance-column"><input inputMode="decimal" value={row.previousBalance} onChange={(event) => updateField(month, "previousBalance", event.target.value.replace(/[^\d.]/g, ""))} aria-label={`${monthLabel(month)}${PREVIOUS_BALANCE_COLUMN}`} placeholder="0" /></td> : null}
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
          <span style={notice === "请先输入支出名称" || notice === "列已存在，请换一个名称" ? { fontSize: 9 } : undefined}>{notice || (hydrating ? "正在同步已有计划..." : "")}</span>
          <button type="button" className="primary-button" disabled={saving} onClick={() => void savePlans()}>{saving ? "保存中" : "保存计划"}</button>
        </div>
      </section>
    </div>
  );
}

export { depositTypeLabel };
