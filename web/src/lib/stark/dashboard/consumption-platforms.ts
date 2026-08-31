export const CONSUMPTION_PLATFORMS = ["微信", "支付宝", "银行卡", "现金", "其他"] as const;
const DEFAULT_REPORTING_MONTH_DATE = new Date(2026, 0, 1);

type PlatformTransaction = {
  amount: number;
  category?: string | null;
  date: string;
  platform?: string | null;
  type: string;
};

export function normalizeConsumptionPlatform(platform?: string | null) {
  const value = platform?.trim() || "其他";
  if (value === "微信" || value.includes("微信")) return "微信";
  if (value === "支付宝" || value.includes("支付宝")) return "支付宝";
  return CONSUMPTION_PLATFORMS.includes(value as (typeof CONSUMPTION_PLATFORMS)[number])
    ? value
    : "其他";
}

export function buildPlatformCategoryFlow(transactions: PlatformTransaction[]) {
  const flow: Record<string, Record<string, number>> = {};
  transactions
    .filter((transaction) => transaction.type === "EXPENSE")
    .forEach((transaction) => {
      const platform = normalizeConsumptionPlatform(transaction.platform);
      const category = transaction.category?.trim() || "其他";
      if (!flow[platform]) flow[platform] = {};
      flow[platform][category] = (flow[platform][category] ?? 0) + transaction.amount;
    });

  return {
    flow,
    activePlatforms: CONSUMPTION_PLATFORMS.filter((platform) => flow[platform] && Object.keys(flow[platform]).length > 0),
  };
}

export function buildDailyPlatformData(transactions: PlatformTransaction[], now = DEFAULT_REPORTING_MONTH_DATE) {
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `${now.getFullYear()}-${month}`;
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const expenses = transactions.filter((transaction) =>
    transaction.date.startsWith(prefix) && transaction.type === "EXPENSE"
  );
  const platformSet = new Set(expenses.map((transaction) => normalizeConsumptionPlatform(transaction.platform)));
  const activePlatforms = CONSUMPTION_PLATFORMS.filter((platform) => platformSet.has(platform));
  if (!activePlatforms.length) activePlatforms.push("其他");

  const platformDaily: Record<string, number[]> = Object.fromEntries(
    activePlatforms.map((platform) => [platform, new Array(daysInMonth).fill(0)]),
  );

  expenses.forEach((transaction) => {
    const day = Number.parseInt(transaction.date.slice(8, 10), 10) - 1;
    if (!Number.isInteger(day) || day < 0 || day >= daysInMonth) return;
    platformDaily[normalizeConsumptionPlatform(transaction.platform)][day] += transaction.amount;
  });

  return {
    activePlatforms,
    days: Array.from({ length: daysInMonth }, (_, index) => String(index + 1)),
    platformDaily,
  };
}
