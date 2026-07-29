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

export interface DataRepository {
  getCurrentUser(): Promise<User | null>;
  saveUser(user: User): Promise<void>;

  getAccounts(): Promise<Account[]>;
  getAccount(id: string): Promise<Account | null>;
  saveAccount(account: Account): Promise<void>;
  deleteAccount(id: string): Promise<void>;

  getTransactions(accountId: string, page?: number, pageSize?: number): Promise<Transaction[]>;
  getTransaction(id: string): Promise<Transaction | null>;
  saveTransaction(transaction: Transaction): Promise<void>;
  deleteTransaction(id: string): Promise<void>;
  importTransactions(transactions: Transaction[]): Promise<ImportResult>;

  getAssets(accountId: string): Promise<Asset[]>;
  saveAsset(asset: Asset): Promise<void>;
  deleteAsset(id: string): Promise<void>;

  getBudgets(accountId: string): Promise<Budget[]>;
  saveBudget(budget: Budget): Promise<void>;
  deleteBudget(id: string): Promise<void>;

  getLoans(accountId: string): Promise<Loan[]>;
  saveLoan(loan: Loan): Promise<void>;
  deleteLoan(id: string): Promise<void>;

  getSavingsGoals(accountId: string): Promise<SavingsGoal[]>;
  saveSavingsGoal(goal: SavingsGoal): Promise<void>;
  deleteSavingsGoal(id: string): Promise<void>;
  getSavingsPlans(goalId: string): Promise<SavingsPlan[]>;
  saveSavingsPlan(plan: SavingsPlan): Promise<void>;

  getCategoryRules(accountId: string): Promise<CategoryRule[]>;
  saveCategoryRule(rule: CategoryRule): Promise<void>;

  getImportErrorLogs(accountId: string): Promise<ImportErrorLog[]>;
  saveImportErrorLog(log: ImportErrorLog): Promise<void>;

  getExchangeRates(): Promise<ExchangeRate[]>;

  getThemeConfig(userId: string): Promise<ThemeConfig | null>;
  saveThemeConfig(config: ThemeConfig): Promise<void>;
}
