import type { DataMode } from "@/lib/stark/models/types";
import { getCurrentDataMode, setCurrentDataMode } from "@/lib/stark/storage/local-config";
import { LocalRepository } from "@/lib/stark/repository/LocalRepository";
import type { DataRepository } from "@/lib/stark/repository/DataRepository";
import { RemoteRepository } from "@/lib/stark/repository/RemoteRepository";

function withTimeout<T>(promise: Promise<T>, ms = 1500): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Cloud repository timeout")), ms);
    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

class FallbackRepository implements DataRepository {
  constructor(
    private readonly remoteRepo: DataRepository,
    private readonly localRepo: DataRepository,
  ) {}

  private async read<T>(remoteCall: () => Promise<T>, localCall: () => Promise<T>, fallback: T) {
    try {
      return await withTimeout(remoteCall());
    } catch {
      try {
        return await withTimeout(localCall(), 1000);
      } catch {
        return fallback;
      }
    }
  }

  getCurrentUser() { return this.read(() => this.remoteRepo.getCurrentUser(), () => this.localRepo.getCurrentUser(), null); }
  saveUser(user: Parameters<DataRepository["saveUser"]>[0]) { return this.remoteRepo.saveUser(user); }

  getAccounts() { return this.read(() => this.remoteRepo.getAccounts(), () => this.localRepo.getAccounts(), []); }
  getAccount(id: string) { return this.read(() => this.remoteRepo.getAccount(id), () => this.localRepo.getAccount(id), null); }
  saveAccount(account: Parameters<DataRepository["saveAccount"]>[0]) { return this.remoteRepo.saveAccount(account); }
  deleteAccount(id: string) { return this.remoteRepo.deleteAccount(id); }

  getTransactions(accountId: string, page?: number, pageSize?: number) { return this.read(() => this.remoteRepo.getTransactions(accountId, page, pageSize), () => this.localRepo.getTransactions(accountId, page, pageSize), []); }
  getTransaction(id: string) { return this.read(() => this.remoteRepo.getTransaction(id), () => this.localRepo.getTransaction(id), null); }
  saveTransaction(transaction: Parameters<DataRepository["saveTransaction"]>[0]) { return this.remoteRepo.saveTransaction(transaction); }
  deleteTransaction(id: string) { return this.remoteRepo.deleteTransaction(id); }
  importTransactions(transactions: Parameters<DataRepository["importTransactions"]>[0]) { return this.remoteRepo.importTransactions(transactions); }

  getAssets(accountId: string) { return this.read(() => this.remoteRepo.getAssets(accountId), () => this.localRepo.getAssets(accountId), []); }
  saveAsset(asset: Parameters<DataRepository["saveAsset"]>[0]) { return this.remoteRepo.saveAsset(asset); }
  deleteAsset(id: string) { return this.remoteRepo.deleteAsset(id); }

  getBudgets(accountId: string) { return this.read(() => this.remoteRepo.getBudgets(accountId), () => this.localRepo.getBudgets(accountId), []); }
  saveBudget(budget: Parameters<DataRepository["saveBudget"]>[0]) { return this.remoteRepo.saveBudget(budget); }
  deleteBudget(id: string) { return this.remoteRepo.deleteBudget(id); }

  getLoans(accountId: string) { return this.read(() => this.remoteRepo.getLoans(accountId), () => this.localRepo.getLoans(accountId), []); }
  saveLoan(loan: Parameters<DataRepository["saveLoan"]>[0]) { return this.remoteRepo.saveLoan(loan); }
  deleteLoan(id: string) { return this.remoteRepo.deleteLoan(id); }

  getSavingsGoals(accountId: string) { return this.read(() => this.remoteRepo.getSavingsGoals(accountId), () => this.localRepo.getSavingsGoals(accountId), []); }
  saveSavingsGoal(goal: Parameters<DataRepository["saveSavingsGoal"]>[0]) { return this.remoteRepo.saveSavingsGoal(goal); }
  deleteSavingsGoal(id: string) { return this.remoteRepo.deleteSavingsGoal(id); }
  getSavingsPlans(goalId: string) { return this.read(() => this.remoteRepo.getSavingsPlans(goalId), () => this.localRepo.getSavingsPlans(goalId), []); }
  saveSavingsPlan(plan: Parameters<DataRepository["saveSavingsPlan"]>[0]) { return this.remoteRepo.saveSavingsPlan(plan); }

  getCategoryRules(accountId: string) { return this.read(() => this.remoteRepo.getCategoryRules(accountId), () => this.localRepo.getCategoryRules(accountId), []); }
  saveCategoryRule(rule: Parameters<DataRepository["saveCategoryRule"]>[0]) { return this.remoteRepo.saveCategoryRule(rule); }

  getImportErrorLogs(accountId: string) { return this.read(() => this.remoteRepo.getImportErrorLogs(accountId), () => this.localRepo.getImportErrorLogs(accountId), []); }
  saveImportErrorLog(log: Parameters<DataRepository["saveImportErrorLog"]>[0]) { return this.remoteRepo.saveImportErrorLog(log); }

  getExchangeRates() { return this.read(() => this.remoteRepo.getExchangeRates(), () => this.localRepo.getExchangeRates(), []); }

  getThemeConfig(userId: string) { return this.read(() => this.remoteRepo.getThemeConfig(userId), () => this.localRepo.getThemeConfig(userId), null); }
  saveThemeConfig(config: Parameters<DataRepository["saveThemeConfig"]>[0]) { return this.remoteRepo.saveThemeConfig(config); }
}

export class DataModeManager {
  private readonly localRepo = new LocalRepository();
  private readonly remoteRepo = new RemoteRepository();
  private readonly fallbackRepo = new FallbackRepository(this.remoteRepo, this.localRepo);
  private currentMode: DataMode = "CLOUD";

  constructor() {
    if (typeof window !== "undefined") {
      this.currentMode = "CLOUD";
      setCurrentDataMode("CLOUD");
    }
  }

  getRepository(): DataRepository {
    return this.currentMode === "CLOUD" ? this.fallbackRepo : this.localRepo;
  }

  getLocalRepository(): DataRepository {
    return this.localRepo;
  }

  getMode(): DataMode {
    return this.currentMode;
  }

  async switchMode(mode: DataMode) {
    this.currentMode = mode;
    if (mode === "LOCAL") {
      setCurrentDataMode(mode);
      return;
    }
    setCurrentDataMode(mode);
    this.currentMode = mode;
  }
}
