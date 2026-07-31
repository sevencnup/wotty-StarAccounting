export type SavingsFrequency = "MONTHLY" | "ALTERNATE";

export type SavingsRowValues = {
  salary: number | string | null | undefined;
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

export function calculateSavingsRow(values: SavingsRowValues) {
  const salary = amountOf(values.salary);
  const expenseTotal = Object.values(values.expenses).reduce<number>((sum, value) => sum + amountOf(value), 0);
  const expected = amountOf(values.expected);
  return {
    expenseTotal,
    available: salary - expenseTotal,
    remaining: salary - expenseTotal - expected,
  };
}
