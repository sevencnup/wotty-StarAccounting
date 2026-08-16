import type { Asset, Budget, Loan, SavingsGoal, Transaction } from "@/lib/stark/models";
import { REPORTING_MONTH_KEY, clampPercent, monthKey, reportingMonthDate, reportingMonthEndDate } from "@/lib/stark/utils/format";

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

export interface HomeBudgetAlert {
  id: string;
  title: string;
  spent: number;
  budget: number;
  percent: number;
  tone: "safe" | "warn" | "danger";
}

export interface HomeTaskItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  tone: "neutral" | "warn" | "danger";
}

export interface HomeForecast {
  projectedIncome: number;
  projectedExpense: number;
  projectedBalance: number;
  monthBalance: number;
  salaryCycleBalance: number;
  salaryCycleStartLabel: string;
  salaryDay: number;
  daysLeft: number;
  statusLabel: string;
}

export interface HomeInsight {
  id: string;
  title: string;
  detail: string;
  tone: "info" | "warn" | "danger";
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
  budgetAlerts: HomeBudgetAlert[];
  tasks: HomeTaskItem[];
  forecast: HomeForecast;
  insights: HomeInsight[];
  recent: HomeRecentItem[];
}

const RATIO_PALETTE = [
  { color: "#2a78d6", badgeColor: "#e7effc" },
  { color: "#eb6834", badgeColor: "#f9eadf" },
  { color: "#0d8a5f", badgeColor: "#e4f4ec" },
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
  const now = reportingMonthDate();
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

function daysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function formatMonthDay(date: Date) {
  return `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function daysUntil(date: Date) {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  return Math.round((target - start) / 86400000);
}

function nextDueDate(dueDay: number) {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), dueDay);
  if (date.getDate() < now.getDate()) {
    return new Date(now.getFullYear(), now.getMonth() + 1, dueDay);
  }
  return date;
}

function currentSalaryCycleStart(salaryDay: number) {
  const now = reportingMonthEndDate();
  if (now.getDate() >= salaryDay) {
    return new Date(now.getFullYear(), now.getMonth(), salaryDay);
  }
  return new Date(now.getFullYear(), now.getMonth() - 1, salaryDay);
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

  const list = [...rows.entries()].sort((a, b) => b[1] - a[1]);
  if (!list.length) return [];

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
  if (!transactions.length) return [];
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

function buildBudgetAlerts(transactions: Transaction[], budgets: Budget[], totalExpense: number): HomeBudgetAlert[] {
  if (!budgets.length) return [];

  const expenseTransactions = transactions.filter((item) => item.type === "EXPENSE");
  return budgets
    .map((budget) => {
      const spent = budget.scopeType === "GLOBAL"
        ? totalExpense
        : budget.scopeType === "PLATFORM"
          ? expenseTransactions.filter((item) => item.platform === budget.platform).reduce((sum, item) => sum + item.amount, 0)
          : expenseTransactions
              .filter((item) => normalizeCategory(item.category) === normalizeCategory(budget.category))
              .reduce((sum, item) => sum + item.amount, 0);
      const percent = clampPercent(budget.amount > 0 ? (spent / budget.amount) * 100 : 0);
      const title = budget.scopeType === "GLOBAL"
        ? "本月总预算"
        : budget.scopeType === "PLATFORM"
          ? `${budget.platform || "平台"}预算`
          : `${normalizeCategory(budget.category)}预算`;
      const tone = percent >= 100 ? "danger" : percent >= budget.alertPercent ? "warn" : "safe";
      return {
        id: budget.id,
        title,
        spent,
        budget: budget.amount,
        percent,
        tone,
      } satisfies HomeBudgetAlert;
    })
    .sort((a, b) => b.percent - a.percent)
    .slice(0, 3);
}

function buildTasks(loans: Loan[], savingsGoals: SavingsGoal[]): HomeTaskItem[] {
  const loanTasks = loans
    .filter((loan) => loan.status !== "PAID_OFF")
    .map((loan) => {
      const due = nextDueDate(loan.dueDate);
      const inDays = daysUntil(due);
      return {
        id: `loan-${loan.id}`,
        title: `${loan.platform || "贷款"}还款`,
        subtitle: `${formatMonthDay(due)} 前还款 ¥ ${Math.round(loan.monthlyPayment)}`,
        badge: inDays <= 0 ? "今天" : `${inDays}天后`,
        tone: inDays <= 1 ? "danger" : inDays <= 3 ? "warn" : "neutral",
      } satisfies HomeTaskItem;
    });

  const savingsTasks = savingsGoals
    .filter((goal) => goal.status === "ACTIVE")
    .map((goal) => {
      const due = goal.deadline ? parseDate(goal.deadline) : null;
      const inDays = due ? daysUntil(due) : 7;
      return {
        id: `saving-${goal.id}`,
        title: `${goal.name}储蓄`,
        subtitle: due ? `${formatMonthDay(due)} 前补足 ¥ ${Math.max(goal.targetAmount - goal.currentAmount, 0)}` : `继续累计 ¥ ${Math.max(goal.targetAmount - goal.currentAmount, 0)}`,
        badge: due ? (inDays <= 0 ? "已到期" : `${inDays}天后`) : "进行中",
        tone: due && inDays <= 1 ? "danger" : due && inDays <= 5 ? "warn" : "neutral",
      } satisfies HomeTaskItem;
    });

  const tasks = [...loanTasks, ...savingsTasks].sort((a, b) => {
    const rank = { danger: 0, warn: 1, neutral: 2 } as const;
    return rank[a.tone] - rank[b.tone];
  });

  return tasks.slice(0, 4);
}

function buildForecast(_transactions: Transaction[], income: number, expense: number, salaryDay: number): HomeForecast {
  const monthBalance = income - expense;
  const cycleStart = currentSalaryCycleStart(salaryDay);
  const salaryCycleTransactions = _transactions.filter((item) => {
    const date = parseDate(item.date);
    return !!date && date >= cycleStart;
  });
  const salaryCycleIncome = salaryCycleTransactions
    .filter((item) => item.type === "INCOME")
    .reduce((sum, item) => sum + item.amount, 0);
  const salaryCycleExpense = salaryCycleTransactions
    .filter((item) => item.type === "EXPENSE")
    .reduce((sum, item) => sum + item.amount, 0);
  const salaryCycleBalance = salaryCycleIncome - salaryCycleExpense;
  return {
    projectedIncome: income,
    projectedExpense: expense,
    projectedBalance: monthBalance,
    monthBalance,
    salaryCycleBalance,
    salaryCycleStartLabel: formatMonthDay(cycleStart),
    salaryDay,
    daysLeft: 0,
    statusLabel: monthBalance >= 0 ? "本月当前结余" : "本月当前已超支",
  };
}

function buildInsights(currentTransactions: Transaction[], previousTransactions: Transaction[], totalExpense: number, budgetAlerts: HomeBudgetAlert[]): HomeInsight[] {
  const insights: HomeInsight[] = [];
  const currentExpense = currentTransactions.filter((item) => item.type === "EXPENSE");
  const previousExpense = previousTransactions.filter((item) => item.type === "EXPENSE").reduce((sum, item) => sum + item.amount, 0);

  if (currentExpense.length) {
    const topCategory = [...currentExpense.reduce((map, item) => {
      const key = normalizeCategory(item.category);
      map.set(key, (map.get(key) ?? 0) + item.amount);
      return map;
    }, new Map<string, number>()).entries()].sort((a, b) => b[1] - a[1])[0];
    if (topCategory) {
      insights.push({
        id: "insight-top-category",
        title: `${topCategory[0]}是本月最大支出项`,
        detail: `已支出 ¥ ${Math.round(topCategory[1])}，占总支出约 ${Math.round((topCategory[1] / Math.max(totalExpense, 1)) * 100)}%`,
        tone: "info",
      });
    }
  }

  if (previousExpense > 0) {
    const change = comparePercent(totalExpense, previousExpense);
    insights.push({
      id: "insight-month-compare",
      title: change >= 0 ? "本月支出高于上月" : "本月支出低于上月",
      detail: `${change >= 0 ? "较上月增加" : "较上月下降"} ${Math.abs(change)}%，建议关注高频消费分类`,
      tone: change >= 20 ? "warn" : "info",
    });
  }

  const riskyBudget = budgetAlerts.find((item) => item.tone !== "safe");
  if (riskyBudget) {
    insights.push({
      id: "insight-budget-alert",
      title: `${riskyBudget.title}接近上限`,
      detail: `当前已使用 ${Math.round(riskyBudget.percent)}%，${riskyBudget.tone === "danger" ? "已超过预算线" : "建议控制后续支出"}`,
      tone: riskyBudget.tone === "danger" ? "danger" : "warn",
    });
  }

  const largeExpense = [...currentExpense]
    .sort((a, b) => b.amount - a.amount)
    .find((item) => item.amount >= Math.max(500, totalExpense * 0.12));
  if (largeExpense) {
    const label = normalizeCategory(largeExpense.category);
    insights.unshift({
      id: "insight-large-expense",
      title: `${label}出现大额支出`,
      detail: `${largeExpense.merchant?.trim() || label}支出 ¥ ${Math.round(largeExpense.amount)}，记录时间 ${readableDateLabel(largeExpense.date)}`,
      tone: largeExpense.amount >= Math.max(1200, totalExpense * 0.2) ? "danger" : "warn",
    });
  }

  return insights.slice(0, 3);
}

export function buildHomeSummary(input: {
  transactions: Transaction[];
  assets: Asset[];
  budgets: Budget[];
  loans: Loan[];
  savingsGoals: SavingsGoal[];
  salaryDay?: number;
}) {
  const currentMonth = REPORTING_MONTH_KEY;
  const salaryDay = Math.max(1, Math.min(28, Math.round(input.salaryDay ?? 15)));
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

  const budgetAlerts = buildBudgetAlerts(currentMonthTransactions, input.budgets, expense);

  return {
    expense,
    income,
    expenseChange: previousExpense > 0 ? comparePercent(expense, previousExpense) : 0,
    incomeChange: previousIncome > 0 ? comparePercent(income, previousIncome) : 0,
    trend: buildTrend(currentMonthTransactions),
    ratios: buildRatios(currentMonthTransactions),
    savingProgress: {
      title: "储蓄计划",
      current: totalSavings,
      total: Math.max(totalSavingsTarget, totalSavings, 0),
      percent: clampPercent(totalSavingsTarget > 0 ? (totalSavings / totalSavingsTarget) * 100 : 0),
    },
    loanProgress: {
      title: "贷款还款进度",
      current: loanRepaid,
      total: Math.max(loanAll, loanRepaid, 0),
      percent: clampPercent(loanAll > 0 ? (loanRepaid / loanAll) * 100 : 0),
    },
    netWorth: assetTotal - liabilityTotal,
    assetTotal,
    liabilityTotal,
    totalSavings,
    savingsDelta: income - expense,
    loanTotal,
    loanDelta: input.loans.reduce((sum, item) => sum + item.monthlyPayment, 0),
    budgetAlerts,
    tasks: buildTasks(input.loans, input.savingsGoals),
    forecast: buildForecast(currentMonthTransactions, income, expense, salaryDay),
    insights: buildInsights(currentMonthTransactions, previousMonthTransactions, expense, budgetAlerts),
    recent: buildRecent(input.transactions),
  } satisfies HomeSummary;
}
