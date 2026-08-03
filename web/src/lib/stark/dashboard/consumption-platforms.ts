export const CONSUMPTION_PLATFORMS = ["微信", "支付宝", "银行卡", "现金", "其他"] as const;
const DEFAULT_REPORTING_MONTH_DATE = new Date(2026, 0, 1);

type PlatformTransaction = {
  amount: number;
  date: string;
  platform?: string | null;
  type: string;
};

function normalizePlatform(platform?: string | null) {
  const value = platform || "其他";
  return CONSUMPTION_PLATFORMS.includes(value as (typeof CONSUMPTION_PLATFORMS)[number])
    ? value
    : "其他";
}

export function buildDailyPlatformData(transactions: PlatformTransaction[], now = DEFAULT_REPORTING_MONTH_DATE) {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `${now.getFullYear()}-${month}`;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const expenses = transactions.filter((transaction) =>
    transaction.date.startsWith(prefix) && transaction.type === "EXPENSE"
  );
  const platformSet = new Set(expenses.map((transaction) => normalizePlatform(transaction.platform)));
  const activePlatforms = CONSUMPTION_PLATFORMS.filter((platform) => platformSet.has(platform));
  if (!activePlatforms.length) activePlatforms.push("其他");

  const platformDaily: Record<string, number[]> = Object.fromEntries(
    activePlatforms.map((platform) => [platform, new Array(daysInMonth).fill(0)]),
  );

  expenses.forEach((transaction) => {
    const day = Number.parseInt(transaction.date.slice(8, 10), 10) - 1;
    if (!Number.isInteger(day) || day < 0 || day >= daysInMonth) return;
    platformDaily[normalizePlatform(transaction.platform)][day] += transaction.amount;
  });

  return {
    activePlatforms,
    days: Array.from({ length: daysInMonth }, (_, index) => String(index + 1)),
    platformDaily,
  };
}
