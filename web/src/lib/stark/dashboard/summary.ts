import type { Asset, Budget, Loan, SavingsGoal, Transaction } from "@/lib/stark/models";
import { clampPercent, monthKey } from "@/lib/stark/utils/format";

export interface HomeTrend {
  labels: string[];
  expense: number[];
  income: number[];
}

export interface HomeRatio {
  name: string;
  amount: number;
  percent: number;
  color: string;
  badgeColor: string;
  badgeLabel: string;
}

export interface HomeProgress {
  title: string;
  current: number;
  total: number;
  percent: number;
}

export interface HomeRecentItem {
  id: string;
  title: string;
  subtitle: string;
  amount: number;
  positive: boolean;
  time: string;
  badgeLabel: string;
  badgeColor: string;
  badgeBg: string;
}

export interface HomeSummary {
  expense: number;
  income: number;
  expenseChange: number;
  incomeChange: number;
  trend: HomeTrend;
  ratios: HomeRatio[];
  savingProgress: HomeProgress;
  loanProgress: HomeProgress;
  netWorth: number;
  assetTotal: number;
  liabilityTotal: number;
  totalSavings: number;
  savingsDelta: number;
  loanTotal: number;
  loanDelta: number;
  recent: HomeRecentItem[];
}

const RATIO_PALETTE = [
  { color: "#2a78d6", badgeColor: "#e7effc" },
  { color: "#eb6834", badgeColor: "#f9eadf" },
  { color: "#1baf7a", badgeColor: "#e4f4ec" },
  { color: "#eda100", badgeColor: "#fbf0d7" },
  { color: "#e87ba4", badgeColor: "#f8e3eb" },
] as const;

function parseDate(raw: string) {
  const normalized = raw.includes("T") ? raw : raw.replace(" ", "T");
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? null : date;
}

function comparePercent(current: number, previous: number) {
  if (previous <= 0) return current > 0 ? 0 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function previousMonthParts() {
  const now = new Date();
  const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  return { year: previous.getFullYear(), month: previous.getMonth() };
}

function isInMonth(raw: string, year: number, month: number) {
  const date = parseDate(raw);
  return !!date && date.getFullYear() === year && date.getMonth() === month;
}

function normalizeCategory(category: string) {
  if (category.includes("生活")) return "生活消费";
  if (category.includes("交") || category.includes("车")) return "交通出行";
  if (category.includes("餐") || category.includes("饮")) return "餐饮美食";
  if (category.includes("娱")) return "休闲娱乐";
  if (category.includes("购")) return "购物消费";
  if (category.includes("工")) return "工资收入";
  return category || "其他";
}

function readableDateLabel(raw: string) {
  const date = parseDate(raw);
  if (!date) return raw;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const diff = Math.round((today - target) / 86400000);
  const time = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  if (diff === 0) return `今天 ${time}`;
  if (diff === 1) return `昨天 ${time}`;
  return `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${time}`;
}

function buildTrend(transactions: Transaction[]) {
  const labels = ["1", "5", "10", "15", "20", "25", "30"];
  const ranges = [
    [1, 4],
    [5, 9],
    [10, 14],
    [15, 19],
    [20, 24],
    [25, 29],
    [30, 31],
  ] as const;

  return {
    labels,
    expense: ranges.map(([start, end]) =>
      transactions
        .filter((item) => item.type === "EXPENSE")
        .filter((item) => {
          const day = parseDate(item.date)?.getDate();
          return day !== undefined && day >= start && day <= end;
        })
        .reduce((sum, item) => sum + item.amount, 0),
    ),
    income: ranges.map(([start, end]) =>
      transactions
        .filter((item) => item.type === "INCOME")
        .filter((item) => {
          const day = parseDate(item.date)?.getDate();
          return day !== undefined && day >= start && day <= end;
        })
        .reduce((sum, item) => sum + item.amount, 0),
    ),
  } satisfies HomeTrend;
}

function buildRatios(transactions: Transaction[]) {
  const rows = transactions
    .filter((item) => item.type === "EXPENSE")
    .reduce((map, item) => {
      const key = normalizeCategory(item.category);
      map.set(key, (map.get(key) ?? 0) + item.amount);
      return map;
    }, new Map<string, number>());

  const list = [...rows.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (!list.length) return demoRatios();

  const total = list.reduce((sum, [, amount]) => sum + amount, 0) || 1;
  return list.map(([name, amount], index) => {
    const palette = RATIO_PALETTE[index] ?? RATIO_PALETTE[RATIO_PALETTE.length - 1];
    return {
      name,
      amount,
      percent: Math.round((amount / total) * 100),
      color: palette.color,
      badgeColor: palette.badgeColor,
      badgeLabel: name.slice(0, 1),
    } satisfies HomeRatio;
  });
}

function buildRecent(transactions: Transaction[]) {
  if (!transactions.length) return demoRecent();
  return [...transactions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4)
    .map((item) => {
      const category = normalizeCategory(item.category);
      if (item.type === "INCOME") {
        return {
          id: item.id,
          title: item.merchant?.trim() || "工资收入",
          subtitle: category,
          amount: item.amount,
          positive: true,
          time: readableDateLabel(item.date),
          badgeLabel: "薪",
          badgeColor: "#0ca30c",
          badgeBg: "#e4f4ec",
        } satisfies HomeRecentItem;
      }
      if (category.includes("餐")) {
        return {
          id: item.id,
          title: item.merchant?.trim() || "餐饮消费",
          subtitle: category,
          amount: item.amount,
          positive: false,
          time: readableDateLabel(item.date),
          badgeLabel: "餐",
          badgeColor: "#e34948",
          badgeBg: "#fce5e7",
        } satisfies HomeRecentItem;
      }
      if (category.includes("交")) {
        return {
          id: item.id,
          title: item.merchant?.trim() || "交通出行",
          subtitle: category,
          amount: item.amount,
          positive: false,
          time: readableDateLabel(item.date),
          badgeLabel: "交",
          badgeColor: "#eb6834",
          badgeBg: "#f9eadf",
        } satisfies HomeRecentItem;
      }
      if (category.includes("购")) {
        return {
          id: item.id,
          title: item.merchant?.trim() || "购物消费",
          subtitle: category,
          amount: item.amount,
          positive: false,
          time: readableDateLabel(item.date),
          badgeLabel: "购",
          badgeColor: "#2a78d6",
          badgeBg: "#e7effc",
        } satisfies HomeRecentItem;
      }
      return {
        id: item.id,
        title: item.merchant?.trim() || category,
        subtitle: category,
        amount: item.amount,
        positive: false,
        time: readableDateLabel(item.date),
        badgeLabel: category.slice(0, 1),
        badgeColor: "#4a3aa7",
        badgeBg: "#ede7f9",
      } satisfies HomeRecentItem;
    });
}

function demoTrend(): HomeTrend {
  return {
    labels: ["1", "5", "10", "15", "20", "25", "30"],
    expense: [1100, 1650, 1820, 1320, 1710, 1440, 1960],
    income: [1780, 1240, 1160, 1880, 1720, 2360, 2140],
  };
}

function demoRatios(): HomeRatio[] {
  return [
    { name: "生活消费", amount: 1122, percent: 30, color: "#2a78d6", badgeColor: "#e7effc", badgeLabel: "生" },
    { name: "交通出行", amount: 748, percent: 20, color: "#eb6834", badgeColor: "#f9eadf", badgeLabel: "交" },
    { name: "餐饮美食", amount: 673, percent: 18, color: "#1baf7a", badgeColor: "#e4f4ec", badgeLabel: "餐" },
    { name: "休闲娱乐", amount: 561, percent: 15, color: "#eda100", badgeColor: "#fbf0d7", badgeLabel: "娱" },
    { name: "其他", amount: 636, percent: 17, color: "#e87ba4", badgeColor: "#f8e3eb", badgeLabel: "其" },
  ];
}

function demoRecent(): HomeRecentItem[] {
  return [
    { id: "demo-1", title: "星巴克咖啡", subtitle: "餐饮", amount: 36, positive: false, time: "今天 08:30", badgeLabel: "餐", badgeColor: "#e34948", badgeBg: "#fce5e7" },
    { id: "demo-2", title: "地铁出行", subtitle: "交通", amount: 4, positive: false, time: "今天 07:45", badgeLabel: "交", badgeColor: "#eb6834", badgeBg: "#f9eadf" },
    { id: "demo-3", title: "工资收入", subtitle: "工资", amount: 8790, positive: true, time: "昨天 18:00", badgeLabel: "薪", badgeColor: "#0ca30c", badgeBg: "#e4f4ec" },
    { id: "demo-4", title: "超市购物", subtitle: "购物", amount: 128.5, positive: false, time: "昨天 18:00", badgeLabel: "购", badgeColor: "#2a78d6", badgeBg: "#e7effc" },
  ];
}

export function buildHomeSummary(input: {
  transactions: Transaction[];
  assets: Asset[];
  budgets: Budget[];
  loans: Loan[];
  savingsGoals: SavingsGoal[];
}) {
  const now = new Date();
  const currentMonth = monthKey(now.toISOString().slice(0, 10));
  const currentMonthTransactions = input.transactions.filter((item) => monthKey(item.date) === currentMonth);
  const previous = previousMonthParts();
  const previousMonthTransactions = input.transactions.filter((item) => isInMonth(item.date, previous.year, previous.month));

  const income = currentMonthTransactions.filter((item) => item.type === "INCOME").reduce((sum, item) => sum + item.amount, 0);
  const expense = currentMonthTransactions.filter((item) => item.type === "EXPENSE").reduce((sum, item) => sum + item.amount, 0);
  const previousIncome = previousMonthTransactions.filter((item) => item.type === "INCOME").reduce((sum, item) => sum + item.amount, 0);
  const previousExpense = previousMonthTransactions.filter((item) => item.type === "EXPENSE").reduce((sum, item) => sum + item.amount, 0);

  const totalSavings = input.savingsGoals.reduce((sum, item) => sum + item.currentAmount, 0);
  const totalSavingsTarget = input.savingsGoals.reduce((sum, item) => sum + item.targetAmount, 0);
  const loanTotal = input.loans.reduce((sum, item) => sum + item.remainingAmount, 0);
  const loanAll = input.loans.reduce((sum, item) => sum + item.totalAmount, 0);
  const loanRepaid = Math.max(loanAll - loanTotal, 0);
  const assetTotal = input.assets.reduce((sum, item) => sum + item.balance, 0) + totalSavings;
  const liabilityTotal = loanTotal;
  const budgetAmount = input.budgets.reduce((sum, item) => sum + item.amount, 0);

  const hasTransactionData = currentMonthTransactions.length >= 4;
  const hasAssetData = input.assets.length > 0 || input.loans.length > 0 || input.savingsGoals.length > 0;

  if (!hasTransactionData && !hasAssetData) {
    return {
      expense: 8888,
      income: 8888,
      expenseChange: 18,
      incomeChange: -5,
      trend: demoTrend(),
      ratios: demoRatios(),
      savingProgress: { title: "储蓄计划", current: 20000, total: 30000, percent: 67 },
      loanProgress: { title: "贷款还款进度", current: 28500, total: 100000, percent: 29 },
      netWorth: 86127.89,
      assetTotal: 126127.89,
      liabilityTotal: 40000,
      totalSavings: 28600,
      savingsDelta: 2300,
      loanTotal: 356000,
      loanDelta: -2000,
      recent: demoRecent(),
    } satisfies HomeSummary;
  }

  return {
    expense,
    income,
    expenseChange: previousExpense > 0 ? comparePercent(expense, previousExpense) : 18,
    incomeChange: previousIncome > 0 ? comparePercent(income, previousIncome) : -5,
    trend: currentMonthTransactions.length >= 4 ? buildTrend(currentMonthTransactions) : demoTrend(),
    ratios: buildRatios(currentMonthTransactions),
    savingProgress: {
      title: "储蓄计划",
      current: totalSavings,
      total: Math.max(totalSavingsTarget, totalSavings || 30000),
      percent: clampPercent(totalSavingsTarget > 0 ? (totalSavings / totalSavingsTarget) * 100 : 67),
    },
    loanProgress: {
      title: "贷款还款进度",
      current: loanRepaid,
      total: Math.max(loanAll, loanRepaid || 100000),
      percent: clampPercent(loanAll > 0 ? (loanRepaid / loanAll) * 100 : 29),
    },
    netWorth: assetTotal - liabilityTotal,
    assetTotal,
    liabilityTotal,
    totalSavings,
    savingsDelta: income - expense,
    loanTotal,
    loanDelta: input.loans.reduce((sum, item) => sum + item.monthlyPayment, 0) || -2000,
    recent: buildRecent(input.transactions),
  } satisfies HomeSummary;
}
