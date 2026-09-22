import type {
  Account,
  Asset,
  Budget,
  CategoryRule,
  ExchangeRate,
  ImportErrorLog,
  ImportResult,
  Loan,
  LoanRepaymentClassificationResult,
  SavingsGoal,
  SavingsPlan,
  ThemeConfig,
  Transaction,
  User,
} from "@/lib/stark/models/types";
import type { DataRepository } from "@/lib/stark/repository/DataRepository";
import { getCloudApiUrl } from "@/lib/stark/storage/local-config";
import { getCurrentAccountId } from "@/lib/stark/storage/local-config";
import { clearCloudAuth, getCloudAuthToken } from "@/lib/stark/storage/cloud-auth";
import { loanRepaymentClassificationsPath, savingsGoalsPath, savingsPlansPath, transactionsImportPath } from "@/lib/stark/repository/remote-paths";

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

type TimedValue<T> = {
  expiresAt: number;
  value: T;
};

type CachedResource = "assets" | "budgets" | "loans" | "savingsGoals" | "savingsPlans";

export type RemoteCacheUpdate = {
  resource: CachedResource;
  key: string;
  accountId?: string;
};

export const REMOTE_CACHE_UPDATED_EVENT = "stark:remote-cache-updated";

const TRANSACTION_CACHE_TTL = 20_000;
const RESOURCE_CACHE_TTL = 30_000;
const TRANSACTION_PAGE_SIZE = 500;

function sortByDateDesc<T extends { date?: string; createdAt?: string }>(items: T[]) {
  return [...items].sort((a, b) => (b.date ?? b.createdAt ?? "").localeCompare(a.date ?? a.createdAt ?? ""));
}

export class RemoteRepository implements DataRepository {
  private baseUrl: string;
  private readonly transactionMonthRequests = new Map<string, Promise<Transaction[]>>();
  private readonly transactionMonthCache = new Map<string, TimedValue<Transaction[]>>();
  private readonly transactionMonthsRequests = new Map<string, Promise<string[]>>();
  private readonly transactionMonthsCache = new Map<string, TimedValue<string[]>>();
  private readonly transactionCacheGenerations = new Map<string, number>();
  private readonly resourceCaches = new Map<CachedResource, Map<string, TimedValue<unknown>>>();
  private readonly resourceRequests = new Map<CachedResource, Map<string, Promise<unknown>>>();
  private readonly resourceGenerations = new Map<string, number>();
  private resourceCacheEpoch = 0;

  constructor(baseUrl = getCloudApiUrl()) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  clearCache() {
    this.resourceCacheEpoch += 1;
    this.transactionMonthCache.clear();
    this.transactionMonthRequests.clear();
    this.transactionMonthsCache.clear();
    this.transactionMonthsRequests.clear();
    this.transactionCacheGenerations.clear();
    this.resourceCaches.clear();
    this.resourceRequests.clear();
    this.resourceGenerations.clear();
  }

  setBaseUrl(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.clearCache();
  }

  private resourceCache(resource: CachedResource) {
    let cache = this.resourceCaches.get(resource);
    if (!cache) {
      cache = new Map();
      this.resourceCaches.set(resource, cache);
    }
    return cache;
  }

  private resourceRequestMap(resource: CachedResource) {
    let requests = this.resourceRequests.get(resource);
    if (!requests) {
      requests = new Map();
      this.resourceRequests.set(resource, requests);
    }
    return requests;
  }

  private resourceGenerationKey(resource: CachedResource, key: string) {
    return `${resource}:${key}`;
  }

  private resourceGeneration(resource: CachedResource, key: string) {
    return this.resourceGenerations.get(this.resourceGenerationKey(resource, key)) ?? 0;
  }

  private invalidateCachedResource(resource: CachedResource, key?: string) {
    const cache = this.resourceCache(resource);
    const requests = this.resourceRequestMap(resource);
    if (key !== undefined) {
      const generationKey = this.resourceGenerationKey(resource, key);
      this.resourceGenerations.set(generationKey, this.resourceGeneration(resource, key) + 1);
      cache.delete(key);
      requests.delete(key);
      return;
    }

    for (const knownKey of new Set([...cache.keys(), ...requests.keys()])) {
      const generationKey = this.resourceGenerationKey(resource, knownKey);
      this.resourceGenerations.set(generationKey, this.resourceGeneration(resource, knownKey) + 1);
    }
    cache.clear();
    requests.clear();
  }

  private notifyCachedResourceUpdate(update: RemoteCacheUpdate) {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent<RemoteCacheUpdate>(REMOTE_CACHE_UPDATED_EVENT, { detail: update }));
  }

  private refreshCachedResource<T>(resource: CachedResource, key: string, load: () => Promise<T>, accountId?: string) {
    const requests = this.resourceRequestMap(resource);
    const pending = requests.get(key) as Promise<T> | undefined;
    if (pending) return pending;

    const cache = this.resourceCache(resource);
    const previous = cache.get(key)?.value as T | undefined;
    const epoch = this.resourceCacheEpoch;
    const generation = this.resourceGeneration(resource, key);
    const request = load().then((value) => {
      if (epoch === this.resourceCacheEpoch && generation === this.resourceGeneration(resource, key)) {
        cache.set(key, { expiresAt: Date.now() + RESOURCE_CACHE_TTL, value });
        if (previous !== undefined && JSON.stringify(previous) !== JSON.stringify(value)) {
          this.notifyCachedResourceUpdate({ resource, key, accountId });
        }
      }
      return value;
    });
    const settledRequest = request.finally(() => {
      if (requests.get(key) === settledRequest) requests.delete(key);
    });
    requests.set(key, settledRequest);
    return settledRequest;
  }

  private readCachedResource<T>(resource: CachedResource, key: string, load: () => Promise<T>, accountId?: string): Promise<T> {
    const cached = this.resourceCache(resource).get(key) as TimedValue<T> | undefined;
    if (cached) {
      if (cached.expiresAt <= Date.now()) {
        void this.refreshCachedResource(resource, key, load, accountId).catch(() => undefined);
      }
      return Promise.resolve(cached.value);
    }
    return this.refreshCachedResource(resource, key, load, accountId);
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          ...(getCloudAuthToken() ? { Authorization: `Bearer ${getCloudAuthToken()}` } : {}),
          ...(init?.headers ?? {}),
        },
      });
      if (!response.ok) {
        if (response.status === 401) clearCloudAuth();
        throw new Error(`Cloud API ${response.status}: ${await response.text()}`);
      }
      if (response.status === 204) return undefined as T;
      return response.json() as Promise<T>;
    } finally {
      clearTimeout(timeout);
    }
  }

  private clearTransactionCaches(accountId: string) {
    this.transactionCacheGenerations.set(accountId, (this.transactionCacheGenerations.get(accountId) ?? 0) + 1);
    const prefix = `${accountId}:`;
    for (const key of this.transactionMonthCache.keys()) {
      if (key.startsWith(prefix)) this.transactionMonthCache.delete(key);
    }
    for (const key of this.transactionMonthRequests.keys()) {
      if (key.startsWith(prefix)) this.transactionMonthRequests.delete(key);
    }
    this.transactionMonthsCache.delete(accountId);
    this.transactionMonthsRequests.delete(accountId);
  }

  private clearEntityCaches(entityType: EntityType, accountId: string) {
    if (entityType === "assets" || entityType === "budgets" || entityType === "loans" || entityType === "savingsGoals") {
      this.invalidateCachedResource(entityType, accountId);
    }
    if (entityType === "savingsGoals" || entityType === "savingsPlans") {
      this.invalidateCachedResource("savingsPlans");
    }
  }

  private transactionCacheGeneration(accountId: string) {
    return this.transactionCacheGenerations.get(accountId) ?? 0;
  }

  private async fetchTransactionPage(accountId: string, page: number, pageSize: number, month?: string) {
    const query = new URLSearchParams({
      accountId,
      page: String(page),
      pageSize: String(pageSize),
    });
    if (month) query.set("month", month);
    return this.request<Transaction[]>(`/api/transactions?${query.toString()}`);
  }

  private async fetchAllTransactions(accountId: string, month?: string) {
    const transactions: Transaction[] = [];
    for (let page = 1; ; page += 1) {
      const batch = await this.fetchTransactionPage(accountId, page, TRANSACTION_PAGE_SIZE, month);
      transactions.push(...batch);
      if (batch.length < TRANSACTION_PAGE_SIZE) break;
    }
    return sortByDateDesc(transactions);
  }

  private save(entityType: EntityType, value: object) {
    const record = value as Record<string, unknown>;
    const accountId = record.accountId ?? getCurrentAccountId();
    const targetAccountId = String(accountId);
    this.clearTransactionCaches(targetAccountId);
    this.clearEntityCaches(entityType, targetAccountId);
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

  async getCurrentUser() {
    const user = await this.request<User>("/api/auth/me");
    return { ...user, password: "" };
  }
  async saveUser(user: User) { await this.save("users", user); }

  async getAccounts() { return await this.request<Account[]>("/api/accounts"); }
  async getAccount(id: string) { return (await this.getAccounts()).find((item) => item.id === id) ?? null; }
  async saveAccount(account: Account) { await this.save("accounts", account); }
  async deleteAccount(id: string) { await this.delete("accounts", id); }

  async getTransactions(accountId: string, page = 1, pageSize = 50) {
    const normalizedPage = Math.max(1, Math.floor(page));
    const normalizedPageSize = Math.max(1, Math.floor(pageSize));
    if (normalizedPageSize <= TRANSACTION_PAGE_SIZE) {
      return this.fetchTransactionPage(String(accountId), normalizedPage, normalizedPageSize);
    }
    const transactions = await this.fetchAllTransactions(String(accountId));
    return transactions.slice((normalizedPage - 1) * normalizedPageSize, normalizedPage * normalizedPageSize);
  }
  async getTransactionsByMonth(accountId: string, month: string) {
    const targetAccountId = String(accountId);
    const cacheKey = `${targetAccountId}:${month}`;
    const cached = this.transactionMonthCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    let request = this.transactionMonthRequests.get(cacheKey);
    if (!request) {
      const generation = this.transactionCacheGeneration(targetAccountId);
      const pending = this.fetchAllTransactions(targetAccountId, month)
        .then((transactions) => {
          if (generation === this.transactionCacheGeneration(targetAccountId)) {
            this.transactionMonthCache.set(cacheKey, { expiresAt: Date.now() + TRANSACTION_CACHE_TTL, value: transactions });
          }
          return transactions;
        });
      request = pending.finally(() => {
        if (this.transactionMonthRequests.get(cacheKey) === request) this.transactionMonthRequests.delete(cacheKey);
      });
      this.transactionMonthRequests.set(cacheKey, request);
    }
    return request;
  }
  async getTransactionsByMonths(accountId: string, months: string[]) {
    const uniqueMonths = [...new Set(months)];
    const monthlyTransactions = await Promise.all(uniqueMonths.map((month) => this.getTransactionsByMonth(accountId, month)));
    return sortByDateDesc(monthlyTransactions.flat());
  }
  async getTransactionMonths(accountId: string) {
    const targetAccountId = String(accountId);
    const cached = this.transactionMonthsCache.get(targetAccountId);
    if (cached && cached.expiresAt > Date.now()) return cached.value;

    let request = this.transactionMonthsRequests.get(targetAccountId);
    if (!request) {
      const generation = this.transactionCacheGeneration(targetAccountId);
      const pending = this.request<string[]>(`/api/transactions/months?accountId=${encodeURIComponent(targetAccountId)}`)
        .then((months) => {
          if (generation === this.transactionCacheGeneration(targetAccountId)) {
            this.transactionMonthsCache.set(targetAccountId, { expiresAt: Date.now() + TRANSACTION_CACHE_TTL, value: months });
          }
          return months;
        });
      request = pending.finally(() => {
        if (this.transactionMonthsRequests.get(targetAccountId) === request) this.transactionMonthsRequests.delete(targetAccountId);
      });
      this.transactionMonthsRequests.set(targetAccountId, request);
    }
    return request;
  }
  async getTransaction(id: string) { return await this.request<Transaction | null>(`/api/transactions/${encodeURIComponent(id)}`); }
  async saveTransaction(transaction: Transaction) { await this.save("transactions", transaction); }
  async deleteTransaction(id: string) { await this.delete("transactions", id); }
  async importTransactions(transactions: Transaction[]): Promise<ImportResult> {
    if (!transactions.length) return { imported: 0, skipped: 0, errors: 0 };
    const accountId = transactions[0].accountId;
    const result = await this.request<ImportResult>(transactionsImportPath(accountId), {
      method: "POST",
      body: JSON.stringify(transactions),
    });
    this.clearTransactionCaches(accountId);
    return result;
  }
  async applyLoanRepaymentClassifications(transactions: Transaction[]): Promise<LoanRepaymentClassificationResult> {
    if (!transactions.length) return { applied: 0, amount: 0, skipped: 0 };
    const accountId = transactions[0].accountId;
    const result = await this.request<LoanRepaymentClassificationResult>(loanRepaymentClassificationsPath(accountId), {
      method: "POST",
      body: JSON.stringify(transactions),
    });
    this.clearTransactionCaches(accountId);
    return result;
  }

  getAssets(accountId: string) {
    const targetAccountId = String(accountId);
    return this.readCachedResource(
      "assets",
      targetAccountId,
      () => this.request<Asset[]>(`/api/assets?accountId=${encodeURIComponent(targetAccountId)}`),
      targetAccountId,
    );
  }
  async saveAsset(asset: Asset) { await this.save("assets", asset); }
  async deleteAsset(id: string) { await this.delete("assets", id); }

  getBudgets(accountId: string) {
    const targetAccountId = String(accountId);
    return this.readCachedResource(
      "budgets",
      targetAccountId,
      () => this.request<Budget[]>(`/api/budgets?accountId=${encodeURIComponent(targetAccountId)}`),
      targetAccountId,
    );
  }
  async saveBudget(budget: Budget) { await this.save("budgets", budget); }
  async deleteBudget(id: string) { await this.delete("budgets", id); }

  getLoans(accountId: string) {
    const targetAccountId = String(accountId);
    return this.readCachedResource(
      "loans",
      targetAccountId,
      () => this.request<Loan[]>(`/api/loans?accountId=${encodeURIComponent(targetAccountId)}`),
      targetAccountId,
    );
  }
  async saveLoan(loan: Loan) { await this.save("loans", loan); }
  async deleteLoan(id: string) { await this.delete("loans", id); }

  getSavingsGoals(accountId: string) {
    const targetAccountId = String(accountId);
    return this.readCachedResource(
      "savingsGoals",
      targetAccountId,
      () => this.request<SavingsGoal[]>(savingsGoalsPath(targetAccountId)),
      targetAccountId,
    );
  }
  async saveSavingsGoal(goal: SavingsGoal) { await this.save("savingsGoals", goal); }
  async deleteSavingsGoal(id: string) {
    this.clearCache();
    await this.request<void>(`/api/savings-goals/${encodeURIComponent(id)}`, { method: "DELETE" });
  }
  getSavingsPlans(goalId: string) {
    return this.readCachedResource(
      "savingsPlans",
      goalId,
      () => this.request<SavingsPlan[]>(savingsPlansPath(goalId)),
    );
  }
  async getSavingsPlansByGoals(goalIds: string[]) {
    if (!goalIds.length) return [];
    return (await Promise.all(goalIds.map((goalId) => this.getSavingsPlans(goalId)))).flat();
  }
  async saveSavingsPlan(plan: SavingsPlan) { await this.save("savingsPlans", plan); }
  async deleteSavingsPlan(id: string) {
    this.clearCache();
    await this.request<void>(`/api/savings-plans/${encodeURIComponent(id)}`, { method: "DELETE" });
  }

  async getCategoryRules(accountId: string) { return await this.request<CategoryRule[]>(`/api/category-rules?accountId=${encodeURIComponent(accountId)}`); }
  async saveCategoryRule(rule: CategoryRule) { await this.save("categoryRules", rule); }
  async deleteCategoryRule(id: string, accountId?: string) { await this.delete("categoryRules", id, accountId); }
  async getImportErrorLogs(accountId: string) { return await this.request<ImportErrorLog[]>(`/api/import-errors?accountId=${encodeURIComponent(accountId)}`); }
  async saveImportErrorLog(log: ImportErrorLog) { await this.save("importErrorLogs", log); }
  async getExchangeRates() { return await this.request<ExchangeRate[]>("/api/exchange-rates"); }
  async getThemeConfig(userId: string) { return await this.request<ThemeConfig | null>(`/api/theme-config/${encodeURIComponent(userId)}`); }
  async saveThemeConfig(config: ThemeConfig) { await this.save("themeConfigs", config); }
}
