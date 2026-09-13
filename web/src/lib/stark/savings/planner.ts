import type { SavingsGoal, SavingsPlan } from "../models/types";

export type SavingsFrequency = "MONTHLY" | "ALTERNATE";

export const PREVIOUS_BALANCE_COLUMN = "上月结余";

export function selectSavingsGoal<T extends { id: string }>(goals: readonly T[], goalId?: string) {
  if (goalId) return goals.find((goal) => goal.id === goalId) ?? null;
  return goals[0] ?? null;
}

export function isLegacySavingsArrayIndexColumn(column: string) {
  return /^\d+$/.test(column.trim());
}

export function sanitizeSavingsExpenseColumns(columns: readonly unknown[]) {
  return Array.from(new Set(
    columns
      .filter((column): column is string => typeof column === "string")
      .map((column) => column.trim())
      .filter((column) => column && !isLegacySavingsArrayIndexColumn(column)),
  ));
}

export function parseSavingsJsonObject(raw?: string | null): Record<string, unknown> {
  if (!raw) return {};
  let value: unknown = raw;
  for (let depth = 0; depth < 2 && typeof value === "string"; depth += 1) {
    try {
      value = JSON.parse(value);
    } catch {
      return {};
    }
  }
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function parseSavingsExpenses(raw?: string | null): Record<string, string> {
  return Object.fromEntries(
    Object.entries(parseSavingsJsonObject(raw))
      .filter(([key]) => !isLegacySavingsArrayIndexColumn(key))
      .map(([key, value]) => [key.trim(), String(Number(value) || "")]),
  );
}

export type SavingsRowValues = {
  salary: number | string | null | undefined;
  previousBalance?: number | string | null | undefined;
  expenses: Record<string, number | string | null | undefined>;
  expected: number | string | null | undefined;
};

function amountOf(value: number | string | null | undefined) {
  const amount = typeof value === "number" ? value : Number(value || 0);
  return Number.isFinite(amount) ? amount : 0;
}

export function buildSavingsMonths(year: number, frequency: SavingsFrequency) {
  return Array.from({ length: 12 }, (_, index) => index + 1)
    .filter((month) => frequency === "MONTHLY" || month % 2 === 1)
    .map((month) => `${year}-${String(month).padStart(2, "0")}`);
}

function currentSavingsMonthKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function removeSavingsMonth(months: readonly string[], month: string) {
  if (months.length <= 1) return [...months];
  return months.filter((item) => item !== month);
}

export function resolveSavingsMonths(
  year: number,
  frequency: SavingsFrequency,
  configuredMonths?: readonly string[],
  persistedPlans?: readonly Pick<SavingsPlan, "month" | "amount" | "salary" | "actualAmount" | "status" | "expenses" | "proofImage">[],
  currentMonth = currentSavingsMonthKey(),
) {
  const generated = buildSavingsMonths(year, frequency);
  const supportedMonths = new Set(generated);
  const selectSupportedMonths = (months?: readonly string[]) => {
    const selectedMonths = new Set((months ?? []).filter((month) => supportedMonths.has(month)));
    return generated.filter((month) => selectedMonths.has(month));
  };

  const hasContent = (plan: Pick<SavingsPlan, "amount" | "salary" | "actualAmount" | "status" | "expenses" | "proofImage">) => (
    Number(plan.amount) !== 0
    || Number(plan.salary) !== 0
    || Number(plan.actualAmount) !== 0
    || plan.status === "COMPLETED"
    || Boolean(plan.proofImage)
    || Object.values(parseSavingsExpenses(plan.expenses)).some((value) => Number(value) !== 0)
  );

  const persisted = selectSupportedMonths(
    persistedPlans
      ?.filter((plan) => plan.month >= currentMonth || hasContent(plan))
      .map((plan) => plan.month),
  );
  if (persisted.length) return persisted;

  const configured = selectSupportedMonths(configuredMonths);
  return configured.length ? configured : generated;
}

export function shouldSyncSavingsExpense(
  month: string,
  firstMonth: string | undefined,
  column: string,
  temporaryColumns: readonly string[],
) {
  return month === firstMonth && !temporaryColumns.includes(column);
}

export function validateSavingsExpenseColumn(name: string, columns: readonly string[]) {
  const normalizedName = name.trim();
  if (!normalizedName) return "请先输入支出名称";
  if (normalizedName === PREVIOUS_BALANCE_COLUMN) return "上月结余是专用列，请使用专用按钮";
  if (columns.includes(normalizedName)) return "列已存在，请换一个名称";
  return null;
}

export function calculateSavingsRow(values: SavingsRowValues) {
  const salary = amountOf(values.salary);
  const previousBalance = amountOf(values.previousBalance);
  const expenseTotal = Object.values(values.expenses).reduce<number>((sum, value) => sum + amountOf(value), 0);
  const expected = amountOf(values.expected);
  return {
    previousBalance,
    expenseTotal,
    available: salary + previousBalance - expenseTotal,
    remaining: salary + previousBalance - expenseTotal - expected,
  };
}

export function savingsPlanRecordedAmount(plan: Pick<SavingsPlan, "amount" | "status" | "actualAmount">) {
  if (plan.status !== "COMPLETED") return 0;
  const actualAmount = Number(plan.actualAmount);
  return plan.actualAmount !== null && plan.actualAmount !== undefined && Number.isFinite(actualAmount) && actualAmount >= 0
    ? actualAmount
    : plan.amount;
}

export function recordSavingsPlanDeposit(
  plan: SavingsPlan,
  goal: SavingsGoal,
  actualAmount: number,
  proofImage: string | null,
  updatedAt: string,
  actualDate = updatedAt,
) {
  if (!Number.isFinite(actualAmount) || actualAmount <= 0) {
    throw new Error("实际存入金额必须大于 0");
  }
  const previousRecordedAmount = savingsPlanRecordedAmount(plan);
  return {
    plan: {
      ...plan,
      status: "COMPLETED",
      actualAmount,
      proofImage,
      actualDate,
      updatedAt,
    } satisfies SavingsPlan,
    goal: {
      ...goal,
      currentAmount: Math.max(0, goal.currentAmount - previousRecordedAmount + actualAmount),
      updatedAt,
    } satisfies SavingsGoal,
  };
}
