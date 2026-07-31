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
