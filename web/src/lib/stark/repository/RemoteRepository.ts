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
import { selectTransactionsForImport } from "@/lib/stark/repository/transaction-import";
import { savingsPlansPath } from "@/lib/stark/repository/remote-paths";

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
    const targetAccountId = accountId ?? "default";
    let syncRequest = this.syncRequests.get(targetAccountId);
    if (!syncRequest) {
      syncRequest = this.request<SyncRecord[]>(`/api/sync?accountId=${encodeURIComponent(targetAccountId)}`)
        .finally(() => this.syncRequests.delete(targetAccountId));
      this.syncRequests.set(targetAccountId, syncRequest);
    }
    const records = await syncRequest;
    return records.filter((record) => record.entityType === entityType && !record.payload.__deleted).map((record) => record.payload);
  }

  private save(entityType: EntityType, value: object) {
    const record = value as Record<string, unknown>;
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

  private delete(entityType: EntityType, id: string, accountId = "default") {
    return this.save(entityType, { id, accountId, __deleted: true, updatedAt: new Date().toISOString() });
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
  async getTransaction(id: string) { return (await this.list("transactions")).find((item) => item.id === id) as Transaction | undefined ?? null; }
  async saveTransaction(transaction: Transaction) { await this.save("transactions", transaction); }
  async deleteTransaction(id: string) { await this.delete("transactions", id); }
  async importTransactions(transactions: Transaction[]): Promise<ImportResult> {
    if (!transactions.length) return { imported: 0, skipped: 0, errors: 0 };

    const existing = await this.list("transactions", transactions[0].accountId) as unknown as Transaction[];
    const { pending, skipped } = selectTransactionsForImport(transactions, existing);
    const results = await Promise.allSettled(pending.map((transaction) => this.saveTransaction(transaction)));

    return {
      imported: results.filter((result) => result.status === "fulfilled").length,
      skipped,
      errors: results.filter((result) => result.status === "rejected").length,
    };
  }

  async getAssets(accountId: string) {
    return await this.request<Asset[]>(`/api/assets?accountId=${encodeURIComponent(accountId)}`);
  }
  async saveAsset(asset: Asset) { await this.save("assets", asset); }
  async deleteAsset(id: string) { await this.delete("assets", id); }

  async getBudgets(accountId: string) {
    return await this.request<Budget[]>(`/api/budgets?accountId=${encodeURIComponent(accountId)}`);
  }
  async saveBudget(budget: Budget) { await this.save("budgets", budget); }
  async deleteBudget(id: string) { await this.delete("budgets", id); }

  async getLoans(accountId: string) {
    return await this.request<Loan[]>(`/api/loans?accountId=${encodeURIComponent(accountId)}`);
  }
  async saveLoan(loan: Loan) { await this.save("loans", loan); }
  async deleteLoan(id: string) { await this.delete("loans", id); }

  async getSavingsGoals(accountId: string) {
    return await this.request<SavingsGoal[]>(`/api/savings-goals?accountId=${encodeURIComponent(accountId)}`);
  }
  async saveSavingsGoal(goal: SavingsGoal) { await this.save("savingsGoals", goal); }
  async deleteSavingsGoal(id: string) { await this.delete("savingsGoals", id); }
  async getSavingsPlans(goalId: string) {
    return await this.request<SavingsPlan[]>(savingsPlansPath(goalId));
  }
  async saveSavingsPlan(plan: SavingsPlan) { await this.save("savingsPlans", plan); }

  async getCategoryRules(accountId: string) { return await this.list("categoryRules", accountId) as unknown as CategoryRule[]; }
  async saveCategoryRule(rule: CategoryRule) { await this.save("categoryRules", rule); }
  async getImportErrorLogs(accountId: string) { return await this.list("importErrorLogs", accountId) as unknown as ImportErrorLog[]; }
  async saveImportErrorLog(log: ImportErrorLog) { await this.save("importErrorLogs", log); }
  async getExchangeRates() { return await this.list("exchangeRates") as unknown as ExchangeRate[]; }
  async getThemeConfig(userId: string) { return (await this.list("themeConfigs")).find((item) => item.userId === userId) as ThemeConfig | undefined ?? null; }
  async saveThemeConfig(config: ThemeConfig) { await this.save("themeConfigs", config); }
}
