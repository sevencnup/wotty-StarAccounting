package com.wotty.stark.data.local

import com.wotty.stark.data.model.*
import com.wotty.stark.data.repository.DataRepository
import com.wotty.stark.data.repository.ImportResult
import kotlinx.serialization.json.Json

/**
 * 模式1：本地 JSON 文件存储
 * 数据保存在 App 内部存储，通过 PlatformFileHelper 实现跨平台文件读写
 */
class LocalFileRepository(private val fileHelper: PlatformFileHelper) : DataRepository {

    private val json = Json {
        ignoreUnknownKeys = true
        prettyPrint = true
        coerceInputValues = true
    }

    // ====== 文件名常量 ======
    private val FILE_USER = "user.json"
    private val FILE_ACCOUNT = "account.json"
    private val FILE_ACCOUNT_MEMBER = "account_member.json"
    private val FILE_ASSET = "asset.json"
    private val FILE_BUDGET = "budget.json"
    private val FILE_LOAN = "loan.json"
    private val FILE_SAVINGS_GOAL = "savingsgoal.json"
    private val FILE_SAVINGS_PLAN = "savingsplan.json"
    private val FILE_CATEGORY_RULE = "category_rules.json"
    private val FILE_IMPORT_ERROR = "importerrorlog.json"
    private val FILE_EXCHANGE_RATE = "exchangerate.json"
    private val FILE_THEME = "themeconfig.json"

    private fun transactionFileName(month: String? = null): String =
        if (month != null) "transaction_${month}.json" else "transaction.json"

    // ========== 用户 ==========
    override suspend fun getCurrentUser(): User? =
        fileHelper.readJsonFile(FILE_USER, User.serializer())

    override suspend fun saveUser(user: User) =
        fileHelper.writeJsonFile(FILE_USER, user, User.serializer())

    // ========== 账本 ==========
    override suspend fun getAccounts(): List<Account> =
        fileHelper.readListJsonFile(FILE_ACCOUNT, Account.serializer())

    override suspend fun getAccount(id: String): Account? =
        getAccounts().find { it.id == id }

    override suspend fun saveAccount(account: Account) {
        val list = getAccounts().toMutableList()
        val idx = list.indexOfFirst { it.id == account.id }
        if (idx >= 0) list[idx] = account else list.add(account)
        fileHelper.writeListJsonFile(FILE_ACCOUNT, list, Account.serializer())
    }

    override suspend fun deleteAccount(id: String) {
        val list = getAccounts().filter { it.id != id }
        fileHelper.writeListJsonFile(FILE_ACCOUNT, list, Account.serializer())
    }

    // ========== 交易流水 ==========
    override suspend fun getTransactions(accountId: String, page: Int, pageSize: Int): List<Transaction> {
        val all = fileHelper.readListJsonFile(transactionFileName(), Transaction.serializer())
            .filter { it.accountId == accountId }
            .sortedByDescending { it.date }
        return all.drop((page - 1) * pageSize).take(pageSize)
    }

    override suspend fun getTransaction(id: String): Transaction? =
        fileHelper.readListJsonFile(transactionFileName(), Transaction.serializer()).find { it.id == id }

    override suspend fun saveTransaction(transaction: Transaction) {
        val list = fileHelper.readListJsonFile(transactionFileName(), Transaction.serializer()).toMutableList()
        val idx = list.indexOfFirst { it.id == transaction.id }
        if (idx >= 0) list[idx] = transaction else list.add(transaction)
        fileHelper.writeListJsonFile(transactionFileName(), list, Transaction.serializer())
    }

    override suspend fun updateTransaction(transaction: Transaction) = saveTransaction(transaction)

    override suspend fun deleteTransaction(id: String) {
        val list = fileHelper.readListJsonFile(transactionFileName(), Transaction.serializer()).filter { it.id != id }
        fileHelper.writeListJsonFile(transactionFileName(), list, Transaction.serializer())
    }

    override suspend fun importTransactions(transactions: List<Transaction>): ImportResult {
        val existing = fileHelper.readListJsonFile(transactionFileName(), Transaction.serializer()).toMutableList()
        var imported = 0
        var skipped = 0
        transactions.forEach { t ->
            val dup = if (t.orderId != null) existing.any { it.orderId == t.orderId } else false
            if (dup) skipped++ else {
                existing.add(t)
                imported++
            }
        }
        fileHelper.writeListJsonFile(transactionFileName(), existing, Transaction.serializer())
        return ImportResult(imported = imported, skipped = skipped)
    }

    // ========== 资产 ==========
    override suspend fun getAssets(accountId: String): List<Asset> =
        fileHelper.readListJsonFile(FILE_ASSET, Asset.serializer()).filter { it.accountId == accountId }

    override suspend fun saveAsset(asset: Asset) {
        val list = fileHelper.readListJsonFile(FILE_ASSET, Asset.serializer()).toMutableList()
        val idx = list.indexOfFirst { it.id == asset.id }
        if (idx >= 0) list[idx] = asset else list.add(asset)
        fileHelper.writeListJsonFile(FILE_ASSET, list, Asset.serializer())
    }

    override suspend fun deleteAsset(id: String) {
        val list = fileHelper.readListJsonFile(FILE_ASSET, Asset.serializer()).filter { it.id != id }
        fileHelper.writeListJsonFile(FILE_ASSET, list, Asset.serializer())
    }

    // ========== 预算 ==========
    override suspend fun getBudgets(accountId: String): List<Budget> =
        fileHelper.readListJsonFile(FILE_BUDGET, Budget.serializer()).filter { it.accountId == accountId }

    override suspend fun saveBudget(budget: Budget) {
        val list = fileHelper.readListJsonFile(FILE_BUDGET, Budget.serializer()).toMutableList()
        val idx = list.indexOfFirst { it.id == budget.id }
        if (idx >= 0) list[idx] = budget else list.add(budget)
        fileHelper.writeListJsonFile(FILE_BUDGET, list, Budget.serializer())
    }

    override suspend fun deleteBudget(id: String) {
        val list = fileHelper.readListJsonFile(FILE_BUDGET, Budget.serializer()).filter { it.id != id }
        fileHelper.writeListJsonFile(FILE_BUDGET, list, Budget.serializer())
    }

    // ========== 贷款 ==========
    override suspend fun getLoans(accountId: String): List<Loan> =
        fileHelper.readListJsonFile(FILE_LOAN, Loan.serializer()).filter { it.accountId == accountId }

    override suspend fun saveLoan(loan: Loan) {
        val list = fileHelper.readListJsonFile(FILE_LOAN, Loan.serializer()).toMutableList()
        val idx = list.indexOfFirst { it.id == loan.id }
        if (idx >= 0) list[idx] = loan else list.add(loan)
        fileHelper.writeListJsonFile(FILE_LOAN, list, Loan.serializer())
    }

    override suspend fun deleteLoan(id: String) {
        val list = fileHelper.readListJsonFile(FILE_LOAN, Loan.serializer()).filter { it.id != id }
        fileHelper.writeListJsonFile(FILE_LOAN, list, Loan.serializer())
    }

    // ========== 储蓄 ==========
    override suspend fun getSavingsGoals(accountId: String): List<SavingsGoal> =
        fileHelper.readListJsonFile(FILE_SAVINGS_GOAL, SavingsGoal.serializer()).filter { it.accountId == accountId }

    override suspend fun saveSavingsGoal(goal: SavingsGoal) {
        val list = fileHelper.readListJsonFile(FILE_SAVINGS_GOAL, SavingsGoal.serializer()).toMutableList()
        val idx = list.indexOfFirst { it.id == goal.id }
        if (idx >= 0) list[idx] = goal else list.add(goal)
        fileHelper.writeListJsonFile(FILE_SAVINGS_GOAL, list, SavingsGoal.serializer())
    }

    override suspend fun deleteSavingsGoal(id: String) {
        val list = fileHelper.readListJsonFile(FILE_SAVINGS_GOAL, SavingsGoal.serializer()).filter { it.id != id }
        fileHelper.writeListJsonFile(FILE_SAVINGS_GOAL, list, SavingsGoal.serializer())
    }

    override suspend fun getSavingsPlans(goalId: String): List<SavingsPlan> =
        fileHelper.readListJsonFile(FILE_SAVINGS_PLAN, SavingsPlan.serializer()).filter { it.goalId == goalId }

    override suspend fun saveSavingsPlan(plan: SavingsPlan) {
        val list = fileHelper.readListJsonFile(FILE_SAVINGS_PLAN, SavingsPlan.serializer()).toMutableList()
        val idx = list.indexOfFirst { it.id == plan.id }
        if (idx >= 0) list[idx] = plan else list.add(plan)
        fileHelper.writeListJsonFile(FILE_SAVINGS_PLAN, list, SavingsPlan.serializer())
    }

    // ========== 分类规则 ==========
    override suspend fun getCategoryRules(accountId: String): List<CategoryRule> =
        fileHelper.readListJsonFile(FILE_CATEGORY_RULE, CategoryRule.serializer()).filter { it.accountId == accountId }

    override suspend fun saveCategoryRule(rule: CategoryRule) {
        val list = fileHelper.readListJsonFile(FILE_CATEGORY_RULE, CategoryRule.serializer()).toMutableList()
        val idx = list.indexOfFirst { it.id == rule.id }
        if (idx >= 0) list[idx] = rule else list.add(rule)
        fileHelper.writeListJsonFile(FILE_CATEGORY_RULE, list, CategoryRule.serializer())
    }

    // ========== 导入错误 ==========
    override suspend fun getImportErrorLogs(accountId: String): List<ImportErrorLog> =
        fileHelper.readListJsonFile(FILE_IMPORT_ERROR, ImportErrorLog.serializer()).filter { it.accountId == accountId }

    override suspend fun saveImportErrorLog(log: ImportErrorLog) {
        val list = fileHelper.readListJsonFile(FILE_IMPORT_ERROR, ImportErrorLog.serializer()).toMutableList()
        list.add(log)
        fileHelper.writeListJsonFile(FILE_IMPORT_ERROR, list, ImportErrorLog.serializer())
    }

    // ========== 汇率 ==========
    override suspend fun getExchangeRates(): List<ExchangeRate> =
        fileHelper.readListJsonFile(FILE_EXCHANGE_RATE, ExchangeRate.serializer())

    // ========== 主题 ==========
    override suspend fun getThemeConfig(userId: String): ThemeConfig? =
        fileHelper.readListJsonFile(FILE_THEME, ThemeConfig.serializer()).firstOrNull { it.userId == userId }

    override suspend fun saveThemeConfig(config: ThemeConfig) {
        val list = fileHelper.readListJsonFile(FILE_THEME, ThemeConfig.serializer()).toMutableList()
        val idx = list.indexOfFirst { it.id == config.id }
        if (idx >= 0) list[idx] = config else list.add(config)
        fileHelper.writeListJsonFile(FILE_THEME, list, ThemeConfig.serializer())
    }
}
