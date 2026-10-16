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
  Subscription,
  ThemeConfig,
  Transaction,
  User,
} from "@/lib/stark/models/types";
import type { DataRepository } from "@/lib/stark/repository/DataRepository";
import { getCloudApiUrl } from "@/lib/stark/storage/local-config";
import { getCurrentAccountId } from "@/lib/stark/storage/local-config";
import { clearCloudAuth, getCloudAuthToken, getCloudAuthUser } from "@/lib/stark/storage/cloud-auth";
import { loanRepaymentClassificationsPath, savingsGoalsPath, savingsPlansPath, transactionsImportPath } from "@/lib/stark/repository/remote-paths";
import { deletePersistentRemoteCache, readPersistentRemoteCache, synchronizePersistentRemoteCacheSchema, writePersistentRemoteCache } from "@/lib/stark/repository/persistent-remote-cache";

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
  | "themeConfigs"
  | "subscriptions";

type TimedValue<T> = {
  expiresAt: number;
  value: T;
};

type CachedResource = "accounts" | "assets" | "budgets" | "loans" | "savingsGoals" | "savingsPlans" | "subscriptions" | "categoryRules" | "importErrorLogs" | "exchangeRates" | "themeConfigs";

export type RemoteCacheUpdate = {
  resource: CachedResource | "transactions" | "transactionMonths";
  key: string;
  accountId?: string;
};

export const REMOTE_CACHE_UPDATED_EVENT = "stark:remote-cache-updated";

const TRANSACTION_CACHE_TTL = 60_000;
const RESOURCE_CACHE_TTL = 60_000;
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
  private readonly transactionUpdateTimers = new Map<string, number>();
  private activeCacheScope: string | null | undefined;
  private schemaCheckScope: string | null = null;
  private schemaCheckAt = 0;
  private schemaCheckRequest: Promise<void> | null = null;

  constructor(baseUrl = getCloudApiUrl()) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  clearCache() {
    this.resourceCacheEpoch += 1;
    for (const timer of this.transactionUpdateTimers.values()) window.clearTimeout(timer);
    this.transactionUpdateTimers.clear();
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
    const normalized = baseUrl.replace(/\/$/, "");
    if (normalized === this.baseUrl) return;
    this.baseUrl = normalized;
    this.clearCache();
  }

  private persistentScope() {
    if (!getCloudAuthToken()) return null;
    const userId = getCloudAuthUser()?.id;
    return userId ? `${this.baseUrl}\u0000${userId}` : null;
  }

  private ensureCacheScope() {
    const scope = this.persistentScope();
    if (scope !== this.activeCacheScope) {
      this.activeCacheScope = scope;
      this.clearCache();
    }
    return scope;
  }

  private async readPersisted<T>(resource: string, key: string) {
    const scope = this.persistentScope();
    if (!scope) return undefined;
    try {
      return await readPersistentRemoteCache<T>(scope, resource, key);
    } catch {
      return undefined;
    }
  }

  private persist<T>(resource: string, key: string, value: T) {
    const scope = this.persistentScope();
    if (scope) void writePersistentRemoteCache(scope, resource, key, value).catch(() => undefined);
  }

  private async deletePersisted(resource: string, keyPrefix = "") {
    const scope = this.persistentScope();
    if (scope) await deletePersistentRemoteCache(scope, resource, keyPrefix).catch(() => undefined);
  }

  private async ensureRemoteSchemaVersion() {
    const scope = this.ensureCacheScope();
    if (!scope) return;
    if (this.schemaCheckScope === scope && Date.now() - this.schemaCheckAt < 60_000) return;
    if (this.schemaCheckRequest) return this.schemaCheckRequest;

    const request = this.request<{ schemaVersion?: unknown }>("/api/schema", undefined, 1200)
      .then(async (response) => {
        if (typeof response.schemaVersion !== "string" || !response.schemaVersion) return;
        if (this.persistentScope() !== scope) return;
        const changed = await synchronizePersistentRemoteCacheSchema(scope, response.schemaVersion);
        if (this.persistentScope() !== scope) return;
        if (changed) {
          this.clearCache();
          this.activeCacheScope = scope;
        }
        this.schemaCheckScope = scope;
        this.schemaCheckAt = Date.now();
      })
      .catch(() => {
        // Older servers and offline launches keep using their persisted cache.
        if (this.persistentScope() === scope) {
          this.schemaCheckScope = scope;
          this.schemaCheckAt = Date.now();
        }
      });
    this.schemaCheckRequest = request;
    try {
      await request;
    } finally {
      if (this.schemaCheckRequest === request) this.schemaCheckRequest = null;
    }
  }

  private notifyTransactionUpdate(accountId: string) {
    if (typeof window === "undefined") return;
    const previous = this.transactionUpdateTimers.get(accountId);
    if (previous !== undefined) window.clearTimeout(previous);
    const timer = window.setTimeout(() => {
      this.transactionUpdateTimers.delete(accountId);
      this.notifyCachedResourceUpdate({ resource: "transactions", key: accountId, accountId });
    }, 150);
    this.transactionUpdateTimers.set(accountId, timer);
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
    this.ensureCacheScope();
    const requests = this.resourceRequestMap(resource);
    const pending = requests.get(key) as Promise<T> | undefined;
    if (pending) return pending;

    const cache = this.resourceCache(resource);
    const previous = cache.get(key)?.value as T | undefined;
    const epoch = this.resourceCacheEpoch;
    const generation = this.resourceGeneration(resource, key);
    const request = load().then((value) => {
      this.ensureCacheScope();
      if (epoch === this.resourceCacheEpoch && generation === this.resourceGeneration(resource, key)) {
        cache.set(key, { expiresAt: Date.now() + RESOURCE_CACHE_TTL, value });
        this.persist(resource, key, value);
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

  private async readCachedResource<T>(resource: CachedResource, key: string, load: () => Promise<T>, accountId?: string): Promise<T> {
    this.ensureCacheScope();
    await this.ensureRemoteSchemaVersion();
    const cached = this.resourceCache(resource).get(key) as TimedValue<T> | undefined;
    if (cached) {
      if (cached.expiresAt <= Date.now()) {
        void this.refreshCachedResource(resource, key, load, accountId).catch(() => undefined);
      }
      return cached.value;
    }
    const epoch = this.resourceCacheEpoch;
    const generation = this.resourceGeneration(resource, key);
    const persisted = await this.readPersisted<T>(resource, key);
    this.ensureCacheScope();
    if (persisted && epoch === this.resourceCacheEpoch && generation === this.resourceGeneration(resource, key)) {
      this.resourceCache(resource).set(key, { expiresAt: persisted.savedAt + RESOURCE_CACHE_TTL, value: persisted.value });
      void this.refreshCachedResource(resource, key, load, accountId).catch(() => undefined);
      return persisted.value;
    }
    return this.refreshCachedResource(resource, key, load, accountId);
  }

  private async request<T>(path: string, init?: RequestInit, timeoutMs = 10000): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
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
      // 必须等待响应体读取完成后再离开 try，否则 finally 会提前清掉
      // 超时定时器；网络连接只返回了响应头但响应体卡住时就会无限等待。
      return await response.json() as T;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async clearTransactionCaches(accountId: string) {
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
    await Promise.all([
      this.deletePersisted("transactionMonth", `${accountId}:`),
      this.deletePersisted("transactionMonths", accountId),
    ]);
  }

  private async clearEntityCaches(entityType: EntityType, accountId: string) {
    const accountResources: CachedResource[] = ["assets", "budgets", "loans", "savingsGoals", "subscriptions", "categoryRules", "importErrorLogs"];
    if (accountResources.includes(entityType as CachedResource)) {
      this.invalidateCachedResource(entityType as CachedResource, accountId);
      await this.deletePersisted(entityType, accountId);
    }
    if (entityType === "accounts") {
      this.invalidateCachedResource("accounts", "all");
      await this.deletePersisted("accounts", "all");
    }
    if (entityType === "savingsGoals" || entityType === "savingsPlans") {
      this.invalidateCachedResource("savingsPlans");
      await this.deletePersisted("savingsPlans");
    }
    if (entityType === "exchangeRates" || entityType === "themeConfigs") {
      this.invalidateCachedResource(entityType);
      await this.deletePersisted(entityType);
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

  private async save(entityType: EntityType, value: object) {
    const record = value as Record<string, unknown>;
    const accountId = record.accountId ?? getCurrentAccountId();
    const targetAccountId = String(accountId);
    await this.request<void>("/api/sync", {
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
    // Requests started while the write was in flight may have cached the old
    // rows. Invalidate after the server confirms the write, before UI refresh.
    await Promise.all([
      entityType === "transactions" ? this.clearTransactionCaches(targetAccountId) : Promise.resolve(),
      this.clearEntityCaches(entityType, targetAccountId),
    ]);
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

  getAccounts() {
    return this.readCachedResource("accounts", "all", () => this.request<Account[]>("/api/accounts"));
  }
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

  private refreshTransactionMonth(accountId: string, month: string) {
    this.ensureCacheScope();
    const cacheKey = `${accountId}:${month}`;
    const existing = this.transactionMonthRequests.get(cacheKey);
    if (existing) return existing;
    const generation = this.transactionCacheGeneration(accountId);
    const epoch = this.resourceCacheEpoch;
    const previous = this.transactionMonthCache.get(cacheKey)?.value;
    const pending = this.fetchAllTransactions(accountId, month)
      .then((transactions) => {
        this.ensureCacheScope();
        if (epoch === this.resourceCacheEpoch && generation === this.transactionCacheGeneration(accountId)) {
          this.transactionMonthCache.set(cacheKey, { expiresAt: Date.now() + TRANSACTION_CACHE_TTL, value: transactions });
          this.persist("transactionMonth", cacheKey, transactions);
          if (previous && JSON.stringify(previous) !== JSON.stringify(transactions)) this.notifyTransactionUpdate(accountId);
        }
        return transactions;
      });
    const settled = pending.finally(() => {
      if (this.transactionMonthRequests.get(cacheKey) === settled) this.transactionMonthRequests.delete(cacheKey);
    });
    this.transactionMonthRequests.set(cacheKey, settled);
    return settled;
  }

  async getTransactionsByMonth(accountId: string, month: string) {
    this.ensureCacheScope();
    await this.ensureRemoteSchemaVersion();
    const targetAccountId = String(accountId);
    const cacheKey = `${targetAccountId}:${month}`;
    const cached = this.transactionMonthCache.get(cacheKey);
    if (cached) {
      if (cached.expiresAt <= Date.now()) void this.refreshTransactionMonth(targetAccountId, month).catch(() => undefined);
      return cached.value;
    }
    const generation = this.transactionCacheGeneration(targetAccountId);
    const epoch = this.resourceCacheEpoch;
    const persisted = await this.readPersisted<Transaction[]>("transactionMonth", cacheKey);
    this.ensureCacheScope();
    if (persisted && epoch === this.resourceCacheEpoch && generation === this.transactionCacheGeneration(targetAccountId)) {
      this.transactionMonthCache.set(cacheKey, { expiresAt: persisted.savedAt + TRANSACTION_CACHE_TTL, value: persisted.value });
      void this.refreshTransactionMonth(targetAccountId, month).catch(() => undefined);
      return persisted.value;
    }
    return this.refreshTransactionMonth(targetAccountId, month);
  }
  async getTransactionsByMonths(accountId: string, months: string[]) {
    const uniqueMonths = [...new Set(months)];
    const monthlyTransactions = await Promise.all(uniqueMonths.map((month) => this.getTransactionsByMonth(accountId, month)));
    return sortByDateDesc(monthlyTransactions.flat());
  }
  async getTransactionMonths(accountId: string) {
    this.ensureCacheScope();
    await this.ensureRemoteSchemaVersion();
    const targetAccountId = String(accountId);
    const cached = this.transactionMonthsCache.get(targetAccountId);
    if (cached) {
      if (cached.expiresAt <= Date.now()) void this.refreshTransactionMonths(targetAccountId).catch(() => undefined);
      return cached.value;
    }
    const generation = this.transactionCacheGeneration(targetAccountId);
    const epoch = this.resourceCacheEpoch;
    const persisted = await this.readPersisted<string[]>("transactionMonths", targetAccountId);
    this.ensureCacheScope();
    if (persisted && epoch === this.resourceCacheEpoch && generation === this.transactionCacheGeneration(targetAccountId)) {
      this.transactionMonthsCache.set(targetAccountId, { expiresAt: persisted.savedAt + TRANSACTION_CACHE_TTL, value: persisted.value });
      void this.refreshTransactionMonths(targetAccountId).catch(() => undefined);
      return persisted.value;
    }
    return this.refreshTransactionMonths(targetAccountId);
  }

  private refreshTransactionMonths(accountId: string) {
    this.ensureCacheScope();
    const existing = this.transactionMonthsRequests.get(accountId);
    if (existing) return existing;
    const generation = this.transactionCacheGeneration(accountId);
    const epoch = this.resourceCacheEpoch;
    const previous = this.transactionMonthsCache.get(accountId)?.value;
    const pending = this.request<string[]>(`/api/transactions/months?accountId=${encodeURIComponent(accountId)}`)
      .then((months) => {
        this.ensureCacheScope();
        if (epoch === this.resourceCacheEpoch && generation === this.transactionCacheGeneration(accountId)) {
          this.transactionMonthsCache.set(accountId, { expiresAt: Date.now() + TRANSACTION_CACHE_TTL, value: months });
          this.persist("transactionMonths", accountId, months);
          if (previous && JSON.stringify(previous) !== JSON.stringify(months)) {
            this.notifyCachedResourceUpdate({ resource: "transactionMonths", key: accountId, accountId });
          }
        }
        return months;
      });
    const settled = pending.finally(() => {
      if (this.transactionMonthsRequests.get(accountId) === settled) this.transactionMonthsRequests.delete(accountId);
    });
    this.transactionMonthsRequests.set(accountId, settled);
    return settled;
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
    await this.clearTransactionCaches(accountId);
    return result;
  }
  async applyLoanRepaymentClassifications(transactions: Transaction[]): Promise<LoanRepaymentClassificationResult> {
    if (!transactions.length) return { applied: 0, amount: 0, skipped: 0 };
    const accountId = transactions[0].accountId;
    const result = await this.request<LoanRepaymentClassificationResult>(loanRepaymentClassificationsPath(accountId), {
      method: "POST",
      body: JSON.stringify(transactions),
    });
    await this.clearTransactionCaches(accountId);
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
    await this.request<void>(`/api/savings-goals/${encodeURIComponent(id)}`, { method: "DELETE" });
    this.invalidateCachedResource("savingsGoals");
    this.invalidateCachedResource("savingsPlans");
    await Promise.all([this.deletePersisted("savingsGoals"), this.deletePersisted("savingsPlans")]);
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
    await this.request<void>(`/api/savings-plans/${encodeURIComponent(id)}`, { method: "DELETE" });
    this.invalidateCachedResource("savingsPlans");
    await this.deletePersisted("savingsPlans");
  }

  getCategoryRules(accountId: string) {
    return this.readCachedResource("categoryRules", accountId, () => this.request<CategoryRule[]>(`/api/category-rules?accountId=${encodeURIComponent(accountId)}`), accountId);
  }
  async saveCategoryRule(rule: CategoryRule) { await this.save("categoryRules", rule); }
  async deleteCategoryRule(id: string, accountId?: string) { await this.delete("categoryRules", id, accountId); }
  getSubscriptions(accountId: string) {
    const targetAccountId = String(accountId);
    return this.readCachedResource(
      "subscriptions",
      targetAccountId,
      () => this.request<Subscription[]>(`/api/subscriptions?accountId=${encodeURIComponent(targetAccountId)}`),
      targetAccountId,
    );
  }
  async saveSubscription(subscription: Subscription) { await this.save("subscriptions", subscription); }
  async deleteSubscription(id: string, accountId?: string) { await this.delete("subscriptions", id, accountId); }
  getImportErrorLogs(accountId: string) {
    return this.readCachedResource("importErrorLogs", accountId, () => this.request<ImportErrorLog[]>(`/api/import-errors?accountId=${encodeURIComponent(accountId)}`), accountId);
  }
  async saveImportErrorLog(log: ImportErrorLog) { await this.save("importErrorLogs", log); }
  getExchangeRates() {
    return this.readCachedResource("exchangeRates", "all", () => this.request<ExchangeRate[]>("/api/exchange-rates"));
  }
  getThemeConfig(userId: string) {
    return this.readCachedResource("themeConfigs", userId, () => this.request<ThemeConfig | null>(`/api/theme-config/${encodeURIComponent(userId)}`));
  }
  async saveThemeConfig(config: ThemeConfig) { await this.save("themeConfigs", config); }
}
