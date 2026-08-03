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
import { getCurrentAccountId } from "@/lib/stark/storage/local-config";
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

export class LocalRepository implements DataRepository {
  private seeded: Promise<void> | null = null;

  private async ensureSeeded() {
    if (!this.seeded) {
      this.seeded = this.seed();
    }
    return this.seeded;
  }

  private async seed() {
    const now = nowText();
    await putRecord("users", defaultUser());
    await putRecord("accounts", defaultAccount());
    await this.seedDemoRecordsIfEmpty(now);
  }

  /** 首次使用且没有任何业务数据时，种入一套当月演示数据 */
  private async seedDemoRecordsIfEmpty(now: string) {
    const [txns, assets, budgets, loans, goals] = await Promise.all([
      getAllRecords<Transaction>("transactions"),
      getAllRecords<Asset>("assets"),
      getAllRecords<Budget>("budgets"),
      getAllRecords<Loan>("loans"),
      getAllRecords<SavingsGoal>("savingsGoals"),
    ]);
    if (txns.length || assets.length || budgets.length || loans.length || goals.length) return;

    const month = now.slice(0, 7);
    await putManyRecords("transactions", [
      { id: "txn-demo-salary", userId: "local-user", accountId: "default", amount: 12800, type: "INCOME", category: "工资", platform: "银行卡", merchant: "公司发薪", date: `${month}-15 09:00:00`, description: "月中发薪", createdAt: now, updatedAt: now },
      { id: "txn-demo-food", userId: "local-user", accountId: "default", amount: 86, type: "EXPENSE", category: "餐饮", platform: "支付宝", merchant: "午餐", date: `${month}-16 12:15:00`, description: "工作餐", createdAt: now, updatedAt: now },
      { id: "txn-demo-shop", userId: "local-user", accountId: "default", amount: 268, type: "EXPENSE", category: "购物", platform: "微信", merchant: "日用品", date: `${month}-18 20:10:00`, description: "家庭采购", createdAt: now, updatedAt: now },
      { id: "txn-demo-traffic", userId: "local-user", accountId: "default", amount: 48, type: "EXPENSE", category: "交通", platform: "支付宝", merchant: "地铁公交", date: `${month}-19 08:30:00`, description: "通勤", createdAt: now, updatedAt: now },
      { id: "txn-demo-entertain", userId: "local-user", accountId: "default", amount: 156, type: "EXPENSE", category: "娱乐", platform: "微信", merchant: "电影票", date: `${month}-20 20:40:00`, description: "周末观影", createdAt: now, updatedAt: now },
    ]);
    await putManyRecords("assets", [
      { id: "asset-demo-bank", userId: "local-user", accountId: "default", name: "工资卡", type: "BANK_CARD", balance: 48216.4, currency: "CNY", createdAt: now, updatedAt: now },
      { id: "asset-demo-wechat", userId: "local-user", accountId: "default", name: "微信钱包", type: "WECHAT", balance: 1260.5, currency: "CNY", createdAt: now, updatedAt: now },
      { id: "asset-demo-alipay", userId: "local-user", accountId: "default", name: "支付宝余额", type: "ALIPAY", balance: 3180, currency: "CNY", createdAt: now, updatedAt: now },
    ]);
    await putManyRecords("budgets", [
      { id: "budget-demo-global", userId: "local-user", accountId: "default", amount: 6000, category: "ALL", period: "MONTHLY", alertPercent: 80, platform: null, scopeType: "GLOBAL", createdAt: now, updatedAt: now },
      { id: "budget-demo-food", userId: "local-user", accountId: "default", amount: 1500, category: "餐饮", period: "MONTHLY", alertPercent: 80, platform: null, scopeType: "CATEGORY", createdAt: now, updatedAt: now },
    ]);
    await putManyRecords("loans", [
      { id: "loan-demo-home", userId: "local-user", accountId: "default", platform: "房贷", totalAmount: 480000, remainingAmount: 352000, periods: 240, paidPeriods: 64, monthlyPayment: 3200, dueDate: 20, status: "ACTIVE", matchKeywords: null, createdAt: now, updatedAt: now },
      { id: "loan-demo-car", userId: "local-user", accountId: "default", platform: "车贷", totalAmount: 80000, remainingAmount: 27000, periods: 36, paidPeriods: 18, monthlyPayment: 2200, dueDate: 10, status: "ACTIVE", matchKeywords: null, createdAt: now, updatedAt: now },
    ]);
    await putManyRecords("savingsGoals", [
      { id: "goal-demo-travel", userId: "local-user", accountId: "default", name: "旅行基金", targetAmount: 30000, currentAmount: 9200, deadline: "2026-12-31", type: "LONG_TERM", status: "ACTIVE", depositType: "CASH", planConfig: null, createdAt: now, updatedAt: now },
      { id: "goal-demo-emergency", userId: "local-user", accountId: "default", name: "应急储备", targetAmount: 20000, currentAmount: 6800, deadline: "2027-06-30", type: "LONG_TERM", status: "ACTIVE", depositType: "CASH", planConfig: null, createdAt: now, updatedAt: now },
    ]);
    await putManyRecords("savingsPlans", [
      { id: "plan-demo-travel-1", goalId: "goal-demo-travel", amount: 2000, status: "PENDING", month, createdAt: now, updatedAt: now },
    ]);
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
