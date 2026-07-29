import type {
  Account,
  Asset,
  Budget,
  CategoryRule,
  ExchangeRate,
  ImportErrorLog,
  ImportResult,
  Loan,
  SavingsGoal,
  SavingsPlan,
  ThemeConfig,
  Transaction,
  User,
} from "@/lib/stark/models/types";
import type { DataRepository } from "@/lib/stark/repository/DataRepository";
import { deleteRecord, getAllRecords, getRecord, putManyRecords, putRecord } from "@/lib/stark/storage/indexeddb";
import { getCurrentAccountId, getSeededFlag, setCurrentAccountId, setSeededFlag } from "@/lib/stark/storage/local-config";
import { nowText } from "@/lib/stark/utils/format";

function uuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sortByDateDesc<T extends { date?: string; createdAt?: string }>(items: T[]) {
  return [...items].sort((a, b) => {
    const aValue = a.date ?? a.createdAt ?? "";
    const bValue = b.date ?? b.createdAt ?? "";
    return bValue.localeCompare(aValue);
  });
}

function defaultUser(): User {
  const now = nowText();
  return {
    id: "local-user",
    email: "local@wotty.stark",
    password: "",
    name: "本地用户",
    defaultAccountId: "default",
    role: "USER",
    createdAt: now,
    updatedAt: now,
  };
}

function defaultAccount(): Account {
  const now = nowText();
  return {
    id: "default",
    name: "默认账本",
    ownerId: "local-user",
    createdAt: now,
    updatedAt: now,
  };
}

function seedTransactions(now: string): Transaction[] {
  const month = now.slice(0, 7);
  return [
    {
      id: uuid(),
      userId: "local-user",
      accountId: "default",
      amount: 8888,
      type: "INCOME",
      category: "工资",
      platform: "银行卡",
      merchant: "公司发薪",
      date: `${month}-01 09:30:00`,
      description: "本月工资",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      userId: "local-user",
      accountId: "default",
      amount: 68,
      type: "EXPENSE",
      category: "餐饮",
      platform: "支付宝",
      merchant: "午餐",
      date: `${month}-05 12:20:00`,
      description: "工作日午餐",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      userId: "local-user",
      accountId: "default",
      amount: 199,
      type: "EXPENSE",
      category: "购物",
      platform: "微信",
      merchant: "日用品",
      date: `${month}-12 20:15:00`,
      description: "居家补货",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      userId: "local-user",
      accountId: "default",
      amount: 3200,
      type: "TRANSFER",
      category: "转账",
      platform: "银行卡",
      merchant: "转入储蓄",
      date: `${month}-15 21:00:00`,
      description: "给储蓄计划转入",
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function seedAssets(now: string): Asset[] {
  return [
    {
      id: uuid(),
      userId: "local-user",
      accountId: "default",
      name: "支付宝",
      type: "ALIPAY",
      balance: 2356.5,
      currency: "CNY",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      userId: "local-user",
      accountId: "default",
      name: "微信钱包",
      type: "WECHAT",
      balance: 860.2,
      currency: "CNY",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuid(),
      userId: "local-user",
      accountId: "default",
      name: "工资卡",
      type: "BANK_CARD",
      balance: 82911.19,
      currency: "CNY",
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function seedBudgets(now: string): Budget[] {
  return [
    {
      id: uuid(),
      userId: "local-user",
      accountId: "default",
      amount: 5000,
      category: "ALL",
      period: "MONTHLY",
      alertPercent: 80,
      platform: null,
      scopeType: "GLOBAL",
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function seedLoans(now: string): Loan[] {
  return [
    {
      id: uuid(),
      userId: "local-user",
      accountId: "default",
      platform: "房贷",
      totalAmount: 480000,
      remainingAmount: 356000,
      periods: 240,
      paidPeriods: 62,
      monthlyPayment: 3200,
      dueDate: 20,
      status: "ACTIVE",
      matchKeywords: null,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function seedSavingsGoals(now: string): SavingsGoal[] {
  return [
    {
      id: uuid(),
      userId: "local-user",
      accountId: "default",
      name: "旅游基金",
      targetAmount: 30000,
      currentAmount: 18600,
      deadline: `${new Date().getFullYear()}-12-31`,
      type: "LONG_TERM",
      status: "ACTIVE",
      depositType: "CASH",
      planConfig: null,
      createdAt: now,
      updatedAt: now,
    },
  ];
}

export class LocalRepository implements DataRepository {
  private seeded: Promise<void> | null = null;

  private async ensureSeeded() {
    if (!this.seeded) {
      this.seeded = this.seed();
    }
    return this.seeded;
  }

  private async seed() {
    if (getSeededFlag()) return;

    const now = nowText();
    await putRecord("users", defaultUser());
    await putRecord("accounts", defaultAccount());
    await putManyRecords("transactions", seedTransactions(now));
    await putManyRecords("assets", seedAssets(now));
    await putManyRecords("budgets", seedBudgets(now));
    await putManyRecords("loans", seedLoans(now));
    await putManyRecords("savingsGoals", seedSavingsGoals(now));
    setCurrentAccountId("default");
    setSeededFlag();
  }

  async getCurrentUser() {
    await this.ensureSeeded();
    return (await getRecord<User>("users", "local-user")) ?? null;
  }

  async saveUser(user: User) {
    await this.ensureSeeded();
    await putRecord("users", user);
  }

  async getAccounts() {
    await this.ensureSeeded();
    return getAllRecords<Account>("accounts");
  }

  async getAccount(id: string) {
    await this.ensureSeeded();
    return (await getRecord<Account>("accounts", id)) ?? null;
  }

  async saveAccount(account: Account) {
    await this.ensureSeeded();
    await putRecord("accounts", account);
  }

  async deleteAccount(id: string) {
    await this.ensureSeeded();
    await deleteRecord("accounts", id);
  }

  async getTransactions(accountId: string, page = 1, pageSize = 50) {
    await this.ensureSeeded();
    const targetAccountId = accountId || getCurrentAccountId();
    const all = sortByDateDesc(
      (await getAllRecords<Transaction>("transactions")).filter((item) => item.accountId === targetAccountId),
    );
    return all.slice((page - 1) * pageSize, page * pageSize);
  }

  async getTransaction(id: string) {
    await this.ensureSeeded();
    return (await getRecord<Transaction>("transactions", id)) ?? null;
  }

  async saveTransaction(transaction: Transaction) {
    await this.ensureSeeded();
    await putRecord("transactions", transaction);
  }

  async deleteTransaction(id: string) {
    await this.ensureSeeded();
    await deleteRecord("transactions", id);
  }

  async importTransactions(transactions: Transaction[]): Promise<ImportResult> {
    await this.ensureSeeded();
    const existing = await getAllRecords<Transaction>("transactions");
    const orderIdSet = new Set(existing.map((item) => item.orderId).filter(Boolean));
    const next = transactions.filter((item) => !item.orderId || !orderIdSet.has(item.orderId));
    await putManyRecords("transactions", next);
    return {
      imported: next.length,
      skipped: transactions.length - next.length,
      errors: 0,
    };
  }

  async getAssets(accountId: string) {
    await this.ensureSeeded();
    const targetAccountId = accountId || getCurrentAccountId();
    return (await getAllRecords<Asset>("assets")).filter((item) => item.accountId === targetAccountId);
  }

  async saveAsset(asset: Asset) {
    await this.ensureSeeded();
    await putRecord("assets", asset);
  }

  async deleteAsset(id: string) {
    await this.ensureSeeded();
    await deleteRecord("assets", id);
  }

  async getBudgets(accountId: string) {
    await this.ensureSeeded();
    const targetAccountId = accountId || getCurrentAccountId();
    return (await getAllRecords<Budget>("budgets")).filter((item) => item.accountId === targetAccountId);
  }

  async saveBudget(budget: Budget) {
    await this.ensureSeeded();
    await putRecord("budgets", budget);
  }

  async deleteBudget(id: string) {
    await this.ensureSeeded();
    await deleteRecord("budgets", id);
  }

  async getLoans(accountId: string) {
    await this.ensureSeeded();
    const targetAccountId = accountId || getCurrentAccountId();
    return (await getAllRecords<Loan>("loans")).filter((item) => item.accountId === targetAccountId);
  }

  async saveLoan(loan: Loan) {
    await this.ensureSeeded();
    await putRecord("loans", loan);
  }

  async deleteLoan(id: string) {
    await this.ensureSeeded();
    await deleteRecord("loans", id);
  }

  async getSavingsGoals(accountId: string) {
    await this.ensureSeeded();
    const targetAccountId = accountId || getCurrentAccountId();
    return (await getAllRecords<SavingsGoal>("savingsGoals")).filter((item) => item.accountId === targetAccountId);
  }

  async saveSavingsGoal(goal: SavingsGoal) {
    await this.ensureSeeded();
    await putRecord("savingsGoals", goal);
  }

  async deleteSavingsGoal(id: string) {
    await this.ensureSeeded();
    await deleteRecord("savingsGoals", id);
  }

  async getSavingsPlans(goalId: string) {
    await this.ensureSeeded();
    return (await getAllRecords<SavingsPlan>("savingsPlans")).filter((item) => item.goalId === goalId);
  }

  async saveSavingsPlan(plan: SavingsPlan) {
    await this.ensureSeeded();
    await putRecord("savingsPlans", plan);
  }

  async getCategoryRules(accountId: string) {
    await this.ensureSeeded();
    return (await getAllRecords<CategoryRule>("categoryRules")).filter((item) => item.accountId === accountId);
  }

  async saveCategoryRule(rule: CategoryRule) {
    await this.ensureSeeded();
    await putRecord("categoryRules", rule);
  }

  async getImportErrorLogs(accountId: string) {
    await this.ensureSeeded();
    return (await getAllRecords<ImportErrorLog>("importErrorLogs")).filter((item) => item.accountId === accountId);
  }

  async saveImportErrorLog(log: ImportErrorLog) {
    await this.ensureSeeded();
    await putRecord("importErrorLogs", log);
  }

  async getExchangeRates() {
    await this.ensureSeeded();
    return getAllRecords<ExchangeRate>("exchangeRates");
  }

  async getThemeConfig(userId: string) {
    await this.ensureSeeded();
    const configs = await getAllRecords<ThemeConfig>("themeConfigs");
    return configs.find((item) => item.userId === userId) ?? null;
  }

  async saveThemeConfig(config: ThemeConfig) {
    await this.ensureSeeded();
    await putRecord("themeConfigs", config);
  }
}
