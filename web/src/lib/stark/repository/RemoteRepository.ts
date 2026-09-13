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
import { getCloudApiUrl } from "@/lib/stark/storage/local-config";
import { getCurrentAccountId } from "@/lib/stark/storage/local-config";
import { savingsPlansPath, transactionsImportPath } from "@/lib/stark/repository/remote-paths";

type EntityType =
  | "users"
  | "accounts"
  | "transactions"
  | "assets"
  | "budgets"
  | "loans"
  | "savingsGoals"
  | "savingsPlans"
  | "categoryRules"
  | "importErrorLogs"
  | "exchangeRates"
  | "themeConfigs";

type SyncRecord = {
  id: string;
  entityType: EntityType;
  accountId?: string | null;
  userId?: string | null;
  payload: Record<string, unknown>;
  updatedAt: string;
};

function sortByDateDesc<T extends { date?: string; createdAt?: string }>(items: T[]) {
  return [...items].sort((a, b) => (b.date ?? b.createdAt ?? "").localeCompare(a.date ?? a.createdAt ?? ""));
}

export class RemoteRepository implements DataRepository {
  private readonly baseUrl: string;
  private readonly syncRequests = new Map<string, Promise<SyncRecord[]>>();
  private readonly syncCache = new Map<string, { expiresAt: number; records: SyncRecord[] }>();

  constructor(baseUrl = getCloudApiUrl()) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      });
      if (!response.ok) throw new Error(`Cloud API ${response.status}: ${await response.text()}`);
      if (response.status === 204) return undefined as T;
      return response.json() as Promise<T>;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async list(entityType: EntityType, accountId?: string) {
    const targetAccountId = accountId ?? getCurrentAccountId();
    const cached = this.syncCache.get(targetAccountId);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.records.filter((record) => record.entityType === entityType && !record.payload.__deleted).map((record) => record.payload);
    }
    let syncRequest = this.syncRequests.get(targetAccountId);
    if (!syncRequest) {
      syncRequest = this.request<SyncRecord[]>(`/api/sync?accountId=${encodeURIComponent(targetAccountId)}`)
        .then((records) => {
          this.syncCache.set(targetAccountId, { expiresAt: Date.now() + 5000, records });
          return records;
        })
        .finally(() => this.syncRequests.delete(targetAccountId));
      this.syncRequests.set(targetAccountId, syncRequest);
    }
    const records = await syncRequest;
    return records.filter((record) => record.entityType === entityType && !record.payload.__deleted).map((record) => record.payload);
  }

  private save(entityType: EntityType, value: object) {
    const record = value as Record<string, unknown>;
    const accountId = record.accountId ?? getCurrentAccountId();
    this.syncCache.delete(String(accountId));
    return this.request<void>("/api/sync", {
      method: "POST",
      body: JSON.stringify({
        id: record.id,
        entityType,
        accountId: record.accountId ?? null,
        userId: record.userId ?? null,
        payload: value,
        updatedAt: record.updatedAt ?? new Date().toISOString(),
      }),
    });
  }

  private delete(entityType: EntityType, id: string, accountId?: string) {
    const targetAccountId = accountId ?? getCurrentAccountId();
    return this.save(entityType, { id, accountId: targetAccountId, __deleted: true, updatedAt: new Date().toISOString() });
  }

  async getCurrentUser() { return (await this.list("users")).find((item) => item.id === "local-user") as User | undefined ?? null; }
  async saveUser(user: User) { await this.save("users", user); }

  async getAccounts() { return await this.list("accounts") as unknown as Account[]; }
  async getAccount(id: string) { return (await this.getAccounts()).find((item) => item.id === id) ?? null; }
  async saveAccount(account: Account) { await this.save("accounts", account); }
  async deleteAccount(id: string) { await this.delete("accounts", id); }

  async getTransactions(accountId: string, page = 1, pageSize = 50) {
    const records = sortByDateDesc(await this.list("transactions", accountId) as unknown as Transaction[]);
    return records.slice((page - 1) * pageSize, page * pageSize);
  }
  async getTransactionsByMonth(accountId: string, month: string) {
    const pageSize = 500;
    const transactions: Transaction[] = [];
    for (let page = 1; ; page += 1) {
      const batch = await this.request<Transaction[]>(
        `/api/transactions?accountId=${encodeURIComponent(accountId)}&month=${encodeURIComponent(month)}&page=${page}&pageSize=${pageSize}`,
      );
      transactions.push(...batch);
      if (batch.length < pageSize) break;
    }
    return transactions;
  }
  async getTransactionsByMonths(accountId: string, months: string[]) {
    const monthSet = new Set(months);
    return sortByDateDesc((await this.list("transactions", accountId) as unknown as Transaction[])
      .filter((transaction) => monthSet.has(transaction.date.slice(0, 7))));
  }
  async getTransaction(id: string) { return (await this.list("transactions")).find((item) => item.id === id) as Transaction | undefined ?? null; }
  async saveTransaction(transaction: Transaction) { await this.save("transactions", transaction); }
  async deleteTransaction(id: string) { await this.delete("transactions", id); }
  async importTransactions(transactions: Transaction[]): Promise<ImportResult> {
    if (!transactions.length) return { imported: 0, skipped: 0, errors: 0 };
    const accountId = transactions[0].accountId;
    return this.request<ImportResult>(transactionsImportPath(accountId), {
      method: "POST",
      body: JSON.stringify(transactions),
    });
  }

  async getAssets(accountId: string) {
    return await this.list("assets", accountId) as unknown as Asset[];
  }
  async saveAsset(asset: Asset) { await this.save("assets", asset); }
  async deleteAsset(id: string) { await this.delete("assets", id); }

  async getBudgets(accountId: string) {
    return await this.list("budgets", accountId) as unknown as Budget[];
  }
  async saveBudget(budget: Budget) { await this.save("budgets", budget); }
  async deleteBudget(id: string) { await this.delete("budgets", id); }

  async getLoans(accountId: string) {
    return await this.list("loans", accountId) as unknown as Loan[];
  }
  async saveLoan(loan: Loan) { await this.save("loans", loan); }
  async deleteLoan(id: string) { await this.delete("loans", id); }

  async getSavingsGoals(accountId: string) {
    return await this.list("savingsGoals", accountId) as unknown as SavingsGoal[];
  }
  async saveSavingsGoal(goal: SavingsGoal) { await this.save("savingsGoals", goal); }
  async deleteSavingsGoal(id: string) { await this.delete("savingsGoals", id); }
  async getSavingsPlans(goalId: string) {
    return await this.request<SavingsPlan[]>(savingsPlansPath(goalId));
  }
  async getSavingsPlansByGoals(goalIds: string[]) {
    if (!goalIds.length) return [];
    const goalSet = new Set(goalIds);
    return (await this.list("savingsPlans") as unknown as SavingsPlan[]).filter((plan) => goalSet.has(plan.goalId));
  }
  async saveSavingsPlan(plan: SavingsPlan) { await this.save("savingsPlans", plan); }
  async deleteSavingsPlan(id: string) {
    this.syncCache.clear();
    await this.request<void>(`/api/savings-plans/${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  async getCategoryRules(accountId: string) { return await this.list("categoryRules", accountId) as unknown as CategoryRule[]; }
  async saveCategoryRule(rule: CategoryRule) { await this.save("categoryRules", rule); }
  async deleteCategoryRule(id: string, accountId?: string) { await this.delete("categoryRules", id, accountId); }
  async getImportErrorLogs(accountId: string) { return await this.list("importErrorLogs", accountId) as unknown as ImportErrorLog[]; }
  async saveImportErrorLog(log: ImportErrorLog) { await this.save("importErrorLogs", log); }
  async getExchangeRates() { return await this.list("exchangeRates") as unknown as ExchangeRate[]; }
  async getThemeConfig(userId: string) { return (await this.list("themeConfigs")).find((item) => item.userId === userId) as ThemeConfig | undefined ?? null; }
  async saveThemeConfig(config: ThemeConfig) { await this.save("themeConfigs", config); }
}
