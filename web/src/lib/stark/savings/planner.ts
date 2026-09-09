export type SavingsFrequency = "MONTHLY" | "ALTERNATE";

export const PREVIOUS_BALANCE_COLUMN = "上月结余";

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

export function removeSavingsMonth(months: readonly string[], month: string) {
  if (months.length <= 1) return [...months];
  return months.filter((item) => item !== month);
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
