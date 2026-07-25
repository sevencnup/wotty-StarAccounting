package com.wotty.stark.data.repository

import com.wotty.stark.data.model.*

/**
 * 统一数据仓库接口 - 所有 ViewModel 只依赖此接口
 * 无论本地还是云端模式，对外暴露相同的方法
 */
interface DataRepository {
    // ========== 用户 ==========
    suspend fun getCurrentUser(): User?
    suspend fun saveUser(user: User)

    // ========== 账本 ==========
    suspend fun getAccounts(): List<Account>
    suspend fun getAccount(id: String): Account?
    suspend fun saveAccount(account: Account)
    suspend fun deleteAccount(id: String)

    // ========== 交易流水 ==========
    suspend fun getTransactions(accountId: String, page: Int = 1, pageSize: Int = 50): List<Transaction>
    suspend fun getTransaction(id: String): Transaction?
    suspend fun saveTransaction(transaction: Transaction)
    suspend fun updateTransaction(transaction: Transaction)
    suspend fun deleteTransaction(id: String)
    suspend fun importTransactions(transactions: List<Transaction>): ImportResult

    // ========== 资产账户 ==========
    suspend fun getAssets(accountId: String): List<Asset>
    suspend fun saveAsset(asset: Asset)
    suspend fun deleteAsset(id: String)

    // ========== 预算 ==========
    suspend fun getBudgets(accountId: String): List<Budget>
    suspend fun saveBudget(budget: Budget)
    suspend fun deleteBudget(id: String)

    // ========== 贷款 ==========
    suspend fun getLoans(accountId: String): List<Loan>
    suspend fun saveLoan(loan: Loan)
    suspend fun deleteLoan(id: String)

    // ========== 储蓄目标 ==========
    suspend fun getSavingsGoals(accountId: String): List<SavingsGoal>
    suspend fun saveSavingsGoal(goal: SavingsGoal)
    suspend fun deleteSavingsGoal(id: String)
    suspend fun getSavingsPlans(goalId: String): List<SavingsPlan>
    suspend fun saveSavingsPlan(plan: SavingsPlan)

    // ========== 分类规则 ==========
    suspend fun getCategoryRules(accountId: String): List<CategoryRule>
    suspend fun saveCategoryRule(rule: CategoryRule)

    // ========== 导入错误 ==========
    suspend fun getImportErrorLogs(accountId: String): List<ImportErrorLog>
    suspend fun saveImportErrorLog(log: ImportErrorLog)

    // ========== 汇率 ==========
    suspend fun getExchangeRates(): List<ExchangeRate>

    // ========== 主题 ==========
    suspend fun getThemeConfig(userId: String): ThemeConfig?
    suspend fun saveThemeConfig(config: ThemeConfig)
}

/**
 * 批量导入结果
 */
data class ImportResult(
    val imported: Int = 0,
    val skipped: Int = 0,
    val errors: Int = 0
)
