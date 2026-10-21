import type { Asset, Budget, Loan, SavingsGoal, SavingsPlan, Transaction } from "@/lib/stark/models";
import { SHOWCASE_DEMO_MODE } from "@/lib/stark/runtime";
import { getRecord, putRecord } from "@/lib/stark/storage/indexeddb";
import { newEntryDraftKey } from "@/lib/stark/storage/new-entry-drafts";
import { getSeededFlag, setSalaryDay, setSelectedReportMonth, setSeededFlag } from "@/lib/stark/storage/local-config";

const ACCOUNT_ID = "default";
const USER_ID = "local-user";
const CREATED_AT = "2026-10-01 09:00:00";

type ExpenseSample = { day: number; amount: number; category: string; merchant: string; platform: string };

const monthlyExpenses: Record<string, ExpenseSample[]> = {
  "2026-10": [
    { day: 15, amount: 88.5, category: "餐饮", merchant: "巷口咖啡", platform: "微信" },
    { day: 15, amount: 180, category: "日用", merchant: "盒马鲜生", platform: "支付宝" },
    { day: 15, amount: 328, category: "餐饮", merchant: "江南小馆", platform: "支付宝" },
    { day: 15, amount: 146.5, category: "交通", merchant: "滴滴出行", platform: "支付宝" },
    { day: 16, amount: 820, category: "住房", merchant: "物业及水电", platform: "银行卡" },
    { day: 16, amount: 360.5, category: "日用", merchant: "日常采购", platform: "微信" },
    { day: 16, amount: 1200, category: "购物", merchant: "秋季外套", platform: "支付宝" },
    { day: 17, amount: 680, category: "交通", merchant: "周末自驾", platform: "银行卡" },
    { day: 17, amount: 530, category: "医疗", merchant: "家庭药箱", platform: "微信" },
    { day: 17, amount: 450, category: "娱乐", merchant: "电影与演出", platform: "支付宝" },
    { day: 18, amount: 200, category: "餐饮", merchant: "周末早午餐", platform: "微信" },
    { day: 18, amount: 437, category: "购物", merchant: "家居收纳", platform: "支付宝" },
  ],
  "2026-09": [
    { day: 3, amount: 320, category: "餐饮", merchant: "月初聚餐", platform: "微信" },
    { day: 6, amount: 780, category: "购物", merchant: "生活用品", platform: "支付宝" },
    { day: 9, amount: 460, category: "交通", merchant: "通勤交通", platform: "银行卡" },
    { day: 12, amount: 880, category: "住房", merchant: "水电物业", platform: "银行卡" },
    { day: 15, amount: 520, category: "餐饮", merchant: "日常餐饮", platform: "微信" },
    { day: 19, amount: 1050, category: "购物", merchant: "换季衣物", platform: "支付宝" },
    { day: 24, amount: 610, category: "娱乐", merchant: "周末出游", platform: "微信" },
    { day: 28, amount: 340, category: "交通", merchant: "公共交通", platform: "银行卡" },
  ],
  "2026-08": [
    { day: 2, amount: 420, category: "餐饮", merchant: "家庭聚餐", platform: "微信" },
    { day: 5, amount: 1280, category: "购物", merchant: "夏日补给", platform: "支付宝" },
    { day: 9, amount: 730, category: "交通", merchant: "周末短途", platform: "银行卡" },
    { day: 13, amount: 940, category: "住房", merchant: "房屋维护", platform: "银行卡" },
    { day: 17, amount: 680, category: "餐饮", merchant: "日常餐饮", platform: "微信" },
    { day: 21, amount: 1020, category: "购物", merchant: "电子配件", platform: "支付宝" },
    { day: 24, amount: 760, category: "娱乐", merchant: "旅行门票", platform: "微信" },
    { day: 29, amount: 410, category: "日用", merchant: "居家采购", platform: "支付宝" },
  ],
};

const monthlyFlow = {
  "2026-10": { income: 30_000, repayments: [5_200, 3_300] },
  "2026-09": { income: 11_800, repayments: [450] },
  "2026-08": { income: 13_400, repayments: [700] },
} as const;

function makeTransaction(
  id: string,
  month: string,
  day: number,
  amount: number,
  type: Transaction["type"],
  category: string,
  merchant: string,
  platform: string,
  loanId?: string,
): Transaction {
  const date = `${month}-${String(day).padStart(2, "0")}`;
  return {
    id,
    userId: USER_ID,
    accountId: ACCOUNT_ID,
    amount,
    type,
    category,
    platform,
    merchant,
    date: `${date} ${type === "INCOME" ? "09:00:00" : "12:00:00"}`,
    description: type === "REPAYMENT" ? "按月自动还款" : null,
    orderId: id,
    paymentMethod: platform,
    status: "已完成",
    loanId: loanId ?? null,
    createdAt: `${date} 12:00:00`,
    updatedAt: `${date} 12:00:00`,
  };
}

function buildTransactions() {
  const transactions: Transaction[] = [];
  for (const [month, flow] of Object.entries(monthlyFlow)) {
    transactions.push(makeTransaction(`showcase-salary-${month}`, month, 15, flow.income, "INCOME", "工资", "星会计科技", "银行卡"));
    monthlyExpenses[month]?.forEach((expense, index) => {
      transactions.push(makeTransaction(
        `showcase-expense-${month}-${index + 1}`,
        month,
        expense.day,
        expense.amount,
        "EXPENSE",
        expense.category,
        expense.merchant,
        expense.platform,
      ));
    });
    flow.repayments.forEach((amount, index) => {
      const loanId = month === "2026-10" ? index === 0 ? "showcase-loan-home" : "showcase-loan-car" : undefined;
      transactions.push(makeTransaction(
        `showcase-repayment-${month}-${index + 1}`,
        month,
        15 + index,
        amount,
        "REPAYMENT",
        index === 0 ? "住房贷款" : "汽车贷款",
        index === 0 ? "住房贷款月供" : "汽车贷款月供",
        "银行卡",
        loanId,
      ));
    });
  }
  return transactions;
}

const assets: Asset[] = [
  { id: "showcase-asset-bank", userId: USER_ID, accountId: ACCOUNT_ID, name: "招商银行", type: "BANK_CARD", balance: 54_500, currency: "CNY", createdAt: CREATED_AT, updatedAt: CREATED_AT },
  { id: "showcase-asset-wechat", userId: USER_ID, accountId: ACCOUNT_ID, name: "微信零钱", type: "WECHAT", balance: 8_300, currency: "CNY", createdAt: CREATED_AT, updatedAt: CREATED_AT },
  { id: "showcase-asset-alipay", userId: USER_ID, accountId: ACCOUNT_ID, name: "支付宝余额", type: "ALIPAY", balance: 8_897.7, currency: "CNY", createdAt: CREATED_AT, updatedAt: CREATED_AT },
];

const budgets: Budget[] = [
  { id: "showcase-budget-total", userId: USER_ID, accountId: ACCOUNT_ID, amount: 12_000, category: "全部分类", period: "MONTHLY", alertPercent: 80, scopeType: "GLOBAL", createdAt: CREATED_AT, updatedAt: CREATED_AT },
  { id: "showcase-budget-food", userId: USER_ID, accountId: ACCOUNT_ID, amount: 3_000, category: "餐饮", period: "MONTHLY", alertPercent: 80, scopeType: "CATEGORY", createdAt: CREATED_AT, updatedAt: CREATED_AT },
  { id: "showcase-budget-shopping", userId: USER_ID, accountId: ACCOUNT_ID, amount: 2_500, category: "购物", period: "MONTHLY", alertPercent: 80, scopeType: "CATEGORY", createdAt: CREATED_AT, updatedAt: CREATED_AT },
];

const loans: Loan[] = [
  { id: "showcase-loan-home", userId: USER_ID, accountId: ACCOUNT_ID, platform: "住房贷款", totalAmount: 500_000, remainingAmount: 320_000, periods: 240, paidPeriods: 86, monthlyPayment: 5_200, dueDate: 15, status: "ACTIVE", matchKeywords: "房贷,住房贷款", createdAt: CREATED_AT, updatedAt: CREATED_AT },
  { id: "showcase-loan-car", userId: USER_ID, accountId: ACCOUNT_ID, platform: "汽车贷款", totalAmount: 140_000, remainingAmount: 65_000, periods: 48, paidPeriods: 26, monthlyPayment: 3_300, dueDate: 20, status: "ACTIVE", matchKeywords: "车贷,汽车贷款", createdAt: CREATED_AT, updatedAt: CREATED_AT },
];

const savingsGoals: SavingsGoal[] = [
  { id: "showcase-goal-home", userId: USER_ID, accountId: ACCOUNT_ID, name: "新家首付", targetAmount: 50_000, currentAmount: 18_600, deadline: "2027-06-30", type: "LONG_TERM", status: "ACTIVE", depositType: "PRIVATE", planConfig: JSON.stringify({ frequency: "MONTHLY", columns: ["房租", "水电", "网费", "通勤", "会员订阅", "其他"], fixedColumns: ["房租", "水电", "网费", "通勤", "会员订阅", "其他"] }), createdAt: CREATED_AT, updatedAt: CREATED_AT },
  { id: "showcase-goal-travel", userId: USER_ID, accountId: ACCOUNT_ID, name: "年度旅行", targetAmount: 8_000, currentAmount: 3_200, deadline: "2026-12-31", type: "YEARLY", status: "ACTIVE", depositType: "CASH", createdAt: CREATED_AT, updatedAt: CREATED_AT },
  { id: "showcase-goal-reserve", userId: USER_ID, accountId: ACCOUNT_ID, name: "紧急备用金", targetAmount: 20_000, currentAmount: 15_400, type: "LONG_TERM", status: "ACTIVE", depositType: "FIXED_TERM", createdAt: CREATED_AT, updatedAt: CREATED_AT },
];

const savingsPlans: SavingsPlan[] = [
  { id: "showcase-plan-oct-home", goalId: "showcase-goal-home", month: "2026-10", amount: 2_500, actualAmount: 2_500, status: "COMPLETED", actualDate: "2026-10-15", salary: 30_000, expenses: JSON.stringify({ 房租: 4_200, 水电: 460, 网费: 120, 通勤: 600, 会员订阅: 88 }), remark: "单月存模式", createdAt: CREATED_AT, updatedAt: "2026-10-15 13:00:00" },
  { id: "showcase-plan-sep-reserve", goalId: "showcase-goal-reserve", month: "2026-09", amount: 1_200, actualAmount: 1_200, status: "COMPLETED", actualDate: "2026-09-15", salary: 11_800, expenses: JSON.stringify({ 房租: 4_200, 水电: 430, 网费: 120, 通勤: 560, 会员订阅: 88 }), remark: "单月存模式", createdAt: CREATED_AT, updatedAt: "2026-09-15 13:00:00" },
  { id: "showcase-plan-aug-home", goalId: "showcase-goal-home", month: "2026-08", amount: 2_000, actualAmount: 2_000, status: "COMPLETED", actualDate: "2026-08-15", salary: 13_400, expenses: JSON.stringify({ 房租: 4_200, 水电: 510, 网费: 120, 通勤: 580, 会员订阅: 88 }), remark: "单月存模式", createdAt: CREATED_AT, updatedAt: "2026-08-15 13:00:00" },
  { id: "showcase-plan-nov-travel", goalId: "showcase-goal-travel", month: "2026-11", amount: 800, actualAmount: 0, status: "PENDING", salary: 30_000, expenses: JSON.stringify({ 房租: 4_200, 水电: 480, 网费: 120, 通勤: 600, 会员订阅: 88 }), remark: "单月存模式", createdAt: CREATED_AT, updatedAt: CREATED_AT },
];

const PLANNER_EXAMPLE_VERSION_KEY = "wotty:showcase:planner-example-v1";
const PLANNER_SALARY_VERSION_KEY = "wotty:showcase:planner-salary-v2";
const NEW_EXAMPLE_COLUMNS = ["网费", "通勤", "会员订阅"];

async function seedSavingsPlannerSalaries() {
  try {
    if (window.localStorage.getItem(PLANNER_SALARY_VERSION_KEY) === "1") return;
  } catch {
    // IndexedDB can still be updated when localStorage is unavailable.
  }

  for (const sample of savingsPlans) {
    const existing = await getRecord<SavingsPlan>("savingsPlans", sample.id);
    if (existing && !Number(existing.salary) && existing.amount === sample.amount) {
      await putRecord("savingsPlans", { ...existing, salary: sample.salary });
    }
  }

  for (const goalId of new Set(savingsPlans.map((plan) => plan.goalId))) {
    const key = newEntryDraftKey("savings", goalId);
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const draft = JSON.parse(raw) as {
        rows?: Record<string, { salary?: string }>;
        rowsByFrequency?: Partial<Record<"MONTHLY" | "ALTERNATE", Record<string, { salary?: string }>>>;
      };
      let changed = false;
      for (const sample of savingsPlans.filter((plan) => plan.goalId === goalId)) {
        for (const rows of [draft.rows, draft.rowsByFrequency?.MONTHLY]) {
          const row = rows?.[sample.month];
          if (!row || Number(row.salary) > 0) continue;
          row.salary = String(sample.salary);
          changed = true;
        }
      }
      if (changed) window.localStorage.setItem(key, JSON.stringify(draft));
    } catch {
      // A malformed draft must not block the demo ledger.
    }
  }
  try { window.localStorage.setItem(PLANNER_SALARY_VERSION_KEY, "1"); } catch { /* Best effort. */ }
}

async function seedSavingsPlannerExamples() {
  try {
    if (window.localStorage.getItem(PLANNER_EXAMPLE_VERSION_KEY) === "1") return;
  } catch {
    // The demo can still update IndexedDB when localStorage is unavailable.
  }
  for (const sample of savingsPlans) {
    const existing = await getRecord<SavingsPlan>("savingsPlans", sample.id);
    // Fill the original empty showcase rows, preserving any plan a visitor edited.
    const originalEmptyPlan = existing
      && (!existing.expenses || Object.values(JSON.parse(existing.expenses) as Record<string, unknown>).every((value) => !Number(value)))
      && !existing.salary && existing.amount === sample.amount && !existing.remark;
    if (!existing || originalEmptyPlan) {
      const goal = await getRecord<SavingsGoal>("savingsGoals", sample.goalId);
      if (goal && !goal.planConfig) {
        const columns = ["房租", "水电", "其他", ...NEW_EXAMPLE_COLUMNS];
        await putRecord("savingsGoals", { ...goal, planConfig: JSON.stringify({ columns, fixedColumns: columns, frequency: "MONTHLY" }) });
      }
      await putRecord("savingsPlans", { ...sample, actualAmount: existing?.actualAmount ?? sample.actualAmount, status: existing?.status ?? sample.status });
    }
  }
  try { window.localStorage.setItem(PLANNER_EXAMPLE_VERSION_KEY, "1"); } catch { /* IndexedDB remains the source of truth. */ }
}

/** Seed one disposable, persistent ledger for the static marketing-site build. */
export async function seedShowcaseDemoData() {
  if (!SHOWCASE_DEMO_MODE) return;

  if (getSeededFlag()) {
    await seedSavingsPlannerExamples();
    await seedSavingsPlannerSalaries();
    return;
  }

  const transactions = buildTransactions();
  await Promise.all([
    ...transactions.map((record) => putRecord("transactions", record)),
    ...assets.map((record) => putRecord("assets", record)),
    ...budgets.map((record) => putRecord("budgets", record)),
    ...loans.map((record) => putRecord("loans", record)),
    ...savingsGoals.map((record) => putRecord("savingsGoals", record)),
    ...savingsPlans.map((record) => putRecord("savingsPlans", record)),
  ]);
  setSelectedReportMonth("2026-10");
  setSalaryDay(15);
  setSeededFlag();
  try { window.localStorage.setItem(PLANNER_EXAMPLE_VERSION_KEY, "1"); } catch { /* IndexedDB remains the source of truth. */ }
  try { window.localStorage.setItem(PLANNER_SALARY_VERSION_KEY, "1"); } catch { /* Best effort. */ }
}
