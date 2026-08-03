package com.wotty.stark.data.repository

import com.wotty.stark.data.model.*

/**
 * 统一数据仓库接口 - 所有 ViewModel 只依赖此接口
 */
interface DataRepository {
    suspend fun getCurrentUser(): User?
    suspend fun saveUser(user: User)

    suspend fun getAccounts(): List<Account>
    suspend fun getAccount(id: String): Account?
    suspend fun saveAccount(account: Account)
    suspend fun deleteAccount(id: String)

    suspend fun getTransactions(accountId: String, page: Int = 1, pageSize: Int = 50): List<Transaction>
    suspend fun getTransaction(id: String): Transaction?
    suspend fun saveTransaction(transaction: Transaction)
    suspend fun deleteTransaction(id: String)
    suspend fun importTransactions(transactions: List<Transaction>): ImportResult

    suspend fun getAssets(accountId: String): List<Asset>
    suspend fun saveAsset(asset: Asset)
    suspend fun deleteAsset(id: String)

    suspend fun getBudgets(accountId: String): List<Budget>
    suspend fun saveBudget(budget: Budget)
    suspend fun deleteBudget(id: String)

    suspend fun getLoans(accountId: String): List<Loan>
    suspend fun saveLoan(loan: Loan)
    suspend fun deleteLoan(id: String)

    suspend fun getSavingsGoals(accountId: String): List<SavingsGoal>
    suspend fun saveSavingsGoal(goal: SavingsGoal)
    suspend fun deleteSavingsGoal(id: String)
    suspend fun getSavingsPlans(goalId: String): List<SavingsPlan>
    suspend fun saveSavingsPlan(plan: SavingsPlan)

    suspend fun getCategoryRules(accountId: String): List<CategoryRule>
    suspend fun saveCategoryRule(rule: CategoryRule)

    suspend fun getImportErrorLogs(accountId: String): List<ImportErrorLog>
    suspend fun saveImportErrorLog(log: ImportErrorLog)

    suspend fun getExchangeRates(): List<ExchangeRate>

    suspend fun getThemeConfig(userId: String): ThemeConfig?
    suspend fun saveThemeConfig(config: ThemeConfig)

    /** 首次使用无数据时，种入一套当月演示数据 */
    suspend fun seedDemoData()
}

data class ImportResult(
    val imported: Int = 0,
    val skipped: Int = 0,
    val errors: Int = 0
)
