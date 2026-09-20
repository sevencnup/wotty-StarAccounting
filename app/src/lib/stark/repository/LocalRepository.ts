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
import { deleteRecord, getAllRecords, getRecord, putManyRecords, putRecord, type StoreName } from "@/lib/stark/storage/indexeddb";
import { getCurrentAccountId } from "@/lib/stark/storage/local-config";
import { nowText } from "@/lib/stark/utils/format";
import { isLocalDemoSavingsGoal, LOCAL_DEMO_RECORD_IDS } from "@/lib/stark/repository/local-demo-data";
import { selectTransactionsForImport } from "@/lib/stark/repository/transaction-import";

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
    openingBalance: 0,
    openingBalanceDate: null,
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
    const existingAccount = await getRecord<Account>("accounts", "default");
    if (!existingAccount) {
      await putRecord("accounts", defaultAccount());
    } else if (existingAccount.openingBalance === undefined || existingAccount.openingBalanceDate === undefined) {
      await putRecord("accounts", {
        ...existingAccount,
        openingBalance: existingAccount.openingBalance ?? 0,
        openingBalanceDate: existingAccount.openingBalanceDate ?? null,
      });
    }
    await this.removeLegacyDemoRecords();
  }

  private async removeLegacyDemoRecords() {
    const fixedDemoDeletes = Object.entries(LOCAL_DEMO_RECORD_IDS).flatMap(([storeName, ids]) => (
      ids.map((id) => deleteRecord(storeName as StoreName, id))
    ));
    const savingsPlans = await getAllRecords<SavingsPlan>("savingsPlans");
    const relatedDemoPlanDeletes = savingsPlans
      .filter((plan) => isLocalDemoSavingsGoal(plan.goalId))
      .map((plan) => deleteRecord("savingsPlans", plan.id));

    await Promise.all([...fixedDemoDeletes, ...relatedDemoPlanDeletes]);
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

  async getTransactionsByMonth(accountId: string, month: string) {
    await this.ensureSeeded();
    const targetAccountId = accountId || getCurrentAccountId();
    return sortByDateDesc(
      (await getAllRecords<Transaction>("transactions")).filter(
        (item) => item.accountId === targetAccountId && item.date.slice(0, 7) === month,
      ),
    );
  }

  async getTransactionsByMonths(accountId: string, months: string[]) {
    await this.ensureSeeded();
    const targetAccountId = accountId || getCurrentAccountId();
    const monthSet = new Set(months);
    return sortByDateDesc(
      (await getAllRecords<Transaction>("transactions")).filter(
        (item) => item.accountId === targetAccountId && monthSet.has(item.date.slice(0, 7)),
      ),
    );
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
    const accountId = transactions[0]?.accountId ?? getCurrentAccountId();
    const existing = (await getAllRecords<Transaction>("transactions"))
      .filter((transaction) => transaction.accountId === accountId);
    const { pending, skipped } = selectTransactionsForImport(transactions, existing);
    await putManyRecords("transactions", pending);
    return {
      imported: pending.length,
      skipped,
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

  async getSavingsPlansByGoals(goalIds: string[]) {
    await this.ensureSeeded();
    const goalSet = new Set(goalIds);
    return (await getAllRecords<SavingsPlan>("savingsPlans")).filter((item) => goalSet.has(item.goalId));
  }

  async saveSavingsPlan(plan: SavingsPlan) {
    await this.ensureSeeded();
    await putRecord("savingsPlans", plan);
  }

  async deleteSavingsPlan(id: string) {
    await this.ensureSeeded();
    await deleteRecord("savingsPlans", id);
  }

  async getCategoryRules(accountId: string) {
    await this.ensureSeeded();
    return (await getAllRecords<CategoryRule>("categoryRules")).filter((item) => item.accountId === accountId);
  }

  async saveCategoryRule(rule: CategoryRule) {
    await this.ensureSeeded();
    await putRecord("categoryRules", rule);
  }

  async deleteCategoryRule(id: string) {
    await this.ensureSeeded();
    await deleteRecord("categoryRules", id);
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
