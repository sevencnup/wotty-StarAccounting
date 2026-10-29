import type { Asset, Budget, Loan, SavingsGoal, SavingsPlan, Transaction } from "@/lib/stark/models";
import { SHOWCASE_DEMO_MODE } from "@/lib/stark/runtime";
import { getAllRecords, getRecord, putRecord } from "@/lib/stark/storage/indexeddb";
import { newEntryDraftKey } from "@/lib/stark/storage/new-entry-drafts";
import { getSeededFlag, setSalaryDay, setSeededFlag } from "@/lib/stark/storage/local-config";
import { advanceShowcaseMonthlyDemo } from "./showcase-monthly-seed";
import { missingShowcaseSavingsHistory, showcaseHistoricalSavingsPlans, showcaseSavingsGoals as savingsGoals, showcaseSavingsPlans as savingsPlans } from "./showcase-savings";

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
  "2026-10": { income: 19_680, repayments: [2_100, 900] },
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
  { id: "showcase-loan-home", userId: USER_ID, accountId: ACCOUNT_ID, platform: "住房贷款", totalAmount: 500_000, remainingAmount: 320_000, periods: 240, paidPeriods: 86, monthlyPayment: 2_100, dueDate: 15, status: "ACTIVE", matchKeywords: "房贷,住房贷款", createdAt: CREATED_AT, updatedAt: CREATED_AT },
  { id: "showcase-loan-car", userId: USER_ID, accountId: ACCOUNT_ID, platform: "汽车贷款", totalAmount: 140_000, remainingAmount: 65_000, periods: 48, paidPeriods: 26, monthlyPayment: 900, dueDate: 20, status: "ACTIVE", matchKeywords: "车贷,汽车贷款", createdAt: CREATED_AT, updatedAt: CREATED_AT },
];

const PLANNER_EXAMPLE_VERSION_KEY = "wotty:showcase:planner-example-v1";
const PLANNER_SALARY_VERSION_KEY = "wotty:showcase:planner-salary-v2";
const PLANNER_SAVING_VERSION_KEY = "wotty:showcase:planner-saving-v3";
const REALISTIC_EXAMPLE_VERSION_KEY = "wotty:showcase:realistic-income-v4";
const NOVEMBER_SALARY_VERSION_KEY = "wotty:showcase:november-salary-v5";
const SAVINGS_HISTORY_VERSION_KEY = "wotty:showcase:savings-history-v6";
const NEW_EXAMPLE_COLUMNS = ["网费", "通勤", "会员订阅"];

async function seedSavingsHistoryExample() {
  try {
    if (window.localStorage.getItem(SAVINGS_HISTORY_VERSION_KEY) === "1") return;
  } catch { /* Continue with the isolated demo database. */ }
  const [goals, plans] = await Promise.all([
    getAllRecords<SavingsGoal>("savingsGoals"),
    getAllRecords<SavingsPlan>("savingsPlans"),
  ]);
  for (const plan of missingShowcaseSavingsHistory(goals, plans)) {
    await putRecord("savingsPlans", plan);
  }
  try { window.localStorage.setItem(SAVINGS_HISTORY_VERSION_KEY, "1"); } catch { /* Best effort. */ }
}

async function seedImprovedSavingExample() {
  try {
    if (window.localStorage.getItem(PLANNER_SAVING_VERSION_KEY) === "1") return;
  } catch {
    // IndexedDB can still be updated when localStorage is unavailable.
  }
  const planId = "showcase-plan-oct-home";
  const existing = await getRecord<SavingsPlan>("savingsPlans", planId);
  const goal = await getRecord<SavingsGoal>("savingsGoals", "showcase-goal-home");
  // Migrate only the unchanged example row; never overwrite a visitor's plan.
  if (existing?.amount === 2_500 && existing.actualAmount === 2_500 && existing.status === "COMPLETED") {
    await putRecord("savingsPlans", { ...existing, amount: 6_000, actualAmount: 6_000 });
    if (goal?.currentAmount === 18_600) await putRecord("savingsGoals", { ...goal, currentAmount: 22_100 });
    try {
      const key = newEntryDraftKey("savings", "showcase-goal-home");
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const draft = JSON.parse(raw) as { rows?: Record<string, { expected?: string }>; rowsByFrequency?: { MONTHLY?: Record<string, { expected?: string }> } };
        let changed = false;
        for (const row of [draft.rows?.["2026-10"], draft.rowsByFrequency?.MONTHLY?.["2026-10"]]) {
          if (row?.expected === "2500") { row.expected = "6000"; changed = true; }
        }
        if (changed) window.localStorage.setItem(key, JSON.stringify(draft));
      }
    } catch { /* Ignore malformed or unavailable drafts. */ }
  }
  try { window.localStorage.setItem(PLANNER_SAVING_VERSION_KEY, "1"); } catch { /* Best effort. */ }
}

async function seedRealisticIncomeExample() {
  try {
    if (window.localStorage.getItem(REALISTIC_EXAMPLE_VERSION_KEY) === "1") return;
  } catch { /* Continue with IndexedDB. */ }

  const salary = await getRecord<Transaction>("transactions", "showcase-salary-2026-10");
  if (salary?.amount === 30_000) await putRecord("transactions", { ...salary, amount: 19_680 });

  for (const [id, oldAmount, newAmount] of [
    ["showcase-repayment-2026-10-1", 5_200, 2_100],
    ["showcase-repayment-2026-10-2", 3_300, 900],
  ] as const) {
    const transaction = await getRecord<Transaction>("transactions", id);
    if (transaction?.amount === oldAmount) await putRecord("transactions", { ...transaction, amount: newAmount });
  }
  for (const [id, oldPayment, newPayment] of [
    ["showcase-loan-home", 5_200, 2_100],
    ["showcase-loan-car", 3_300, 900],
  ] as const) {
    const loan = await getRecord<Loan>("loans", id);
    if (loan?.monthlyPayment === oldPayment) await putRecord("loans", { ...loan, monthlyPayment: newPayment });
  }

  const homePlan = await getRecord<SavingsPlan>("savingsPlans", "showcase-plan-oct-home");
  if (homePlan?.salary === 30_000) await putRecord("savingsPlans", { ...homePlan, salary: 19_680 });

  const travelGoal = await getRecord<SavingsGoal>("savingsGoals", "showcase-goal-travel");
  const travelPlan = await getRecord<SavingsPlan>("savingsPlans", "showcase-plan-oct-travel");
  if (travelGoal?.currentAmount === 3_200 && !travelPlan) {
    const sample = savingsPlans.find((plan) => plan.id === "showcase-plan-oct-travel");
    if (sample) await putRecord("savingsPlans", sample);
    await putRecord("savingsGoals", { ...travelGoal, currentAmount: 4_200 });
  }

  for (const [goalId, month] of [["showcase-goal-home", "2026-10"], ["showcase-goal-travel", "2026-11"]] as const) {
    const key = newEntryDraftKey("savings", goalId);
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const draft = JSON.parse(raw) as { rows?: Record<string, { salary?: string }>; rowsByFrequency?: { MONTHLY?: Record<string, { salary?: string }> } };
      let changed = false;
      for (const row of [draft.rows?.[month], draft.rowsByFrequency?.MONTHLY?.[month]]) {
        if (row?.salary === "30000") { row.salary = "19680"; changed = true; }
      }
      if (changed) window.localStorage.setItem(key, JSON.stringify(draft));
    } catch { /* Keep visitor drafts untouched if unavailable. */ }
  }
  try { window.localStorage.setItem(REALISTIC_EXAMPLE_VERSION_KEY, "1"); } catch { /* Best effort. */ }
}

async function seedNovemberSalaryExample() {
  try {
    if (window.localStorage.getItem(NOVEMBER_SALARY_VERSION_KEY) === "1") return;
  } catch { /* Continue with IndexedDB. */ }

  const plan = await getRecord<SavingsPlan>("savingsPlans", "showcase-plan-nov-travel");
  if (plan?.salary === 30_000) await putRecord("savingsPlans", { ...plan, salary: 19_680 });

  try {
    const key = newEntryDraftKey("savings", "showcase-goal-travel");
    const raw = window.localStorage.getItem(key);
    if (raw) {
      const draft = JSON.parse(raw) as { rows?: Record<string, { salary?: string }>; rowsByFrequency?: { MONTHLY?: Record<string, { salary?: string }> } };
      let changed = false;
      for (const row of [draft.rows?.["2026-11"], draft.rowsByFrequency?.MONTHLY?.["2026-11"]]) {
        if (row?.salary === "30000") { row.salary = "19680"; changed = true; }
      }
      if (changed) window.localStorage.setItem(key, JSON.stringify(draft));
    }
    window.localStorage.setItem(NOVEMBER_SALARY_VERSION_KEY, "1");
  } catch { /* Keep visitor drafts untouched if unavailable. */ }
}

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
    // Historical deposits have a separate balance-checked migration.
    if (showcaseHistoricalSavingsPlans.some((history) => history.id === sample.id)) continue;
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
    await seedImprovedSavingExample();
    await seedRealisticIncomeExample();
    await seedNovemberSalaryExample();
    await seedSavingsHistoryExample();
    await advanceShowcaseMonthlyDemo();
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
  setSalaryDay(15);
  setSeededFlag();
  try { window.localStorage.setItem(PLANNER_EXAMPLE_VERSION_KEY, "1"); } catch { /* IndexedDB remains the source of truth. */ }
  try { window.localStorage.setItem(PLANNER_SALARY_VERSION_KEY, "1"); } catch { /* Best effort. */ }
  try { window.localStorage.setItem(PLANNER_SAVING_VERSION_KEY, "1"); } catch { /* Best effort. */ }
  try { window.localStorage.setItem(REALISTIC_EXAMPLE_VERSION_KEY, "1"); } catch { /* Best effort. */ }
  try { window.localStorage.setItem(NOVEMBER_SALARY_VERSION_KEY, "1"); } catch { /* Best effort. */ }
  try { window.localStorage.setItem(SAVINGS_HISTORY_VERSION_KEY, "1"); } catch { /* Best effort. */ }
  await advanceShowcaseMonthlyDemo();
}
