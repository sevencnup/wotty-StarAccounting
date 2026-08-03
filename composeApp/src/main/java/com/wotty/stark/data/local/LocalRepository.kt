package com.wotty.stark.data.local

import android.content.Context
import com.wotty.stark.data.model.*
import com.wotty.stark.data.repository.DataRepository
import com.wotty.stark.data.repository.ImportResult
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.json.Json
import java.io.File

/**
 * 模式1：本地 JSON 文件存储
 */
class LocalRepository(context: Context) : DataRepository {

    private val json = Json {
        ignoreUnknownKeys = true
        prettyPrint = true
        coerceInputValues = true
    }

    private val dataDir = File(context.filesDir, "data").also { it.mkdirs() }

    private inline fun <reified T> readJson(filename: String, serializer: kotlinx.serialization.KSerializer<T>): T? {
        val file = File(dataDir, filename)
        if (!file.exists()) return null
        return json.decodeFromString(serializer, file.readText())
    }

    private inline fun <reified T> writeJson(filename: String, data: T, serializer: kotlinx.serialization.KSerializer<T>) {
        File(dataDir, filename).writeText(json.encodeToString(serializer, data))
    }

    private inline fun <reified T> readListJson(filename: String, serializer: kotlinx.serialization.KSerializer<T>): List<T> {
        val file = File(dataDir, filename)
        if (!file.exists()) return emptyList()
        return json.decodeFromString(ListSerializer(serializer), file.readText())
    }

    private inline fun <reified T> writeListJson(filename: String, data: List<T>, serializer: kotlinx.serialization.KSerializer<T>) {
        File(dataDir, filename).writeText(json.encodeToString(ListSerializer(serializer), data))
    }

    override suspend fun getCurrentUser(): User? = readJson("user.json", User.serializer())
    override suspend fun saveUser(user: User) = writeJson("user.json", user, User.serializer())

    override suspend fun getAccounts(): List<Account> = readListJson("account.json", Account.serializer())
    override suspend fun getAccount(id: String): Account? = getAccounts().find { it.id == id }
    override suspend fun saveAccount(account: Account) {
        val list = getAccounts().toMutableList()
        val idx = list.indexOfFirst { it.id == account.id }
        if (idx >= 0) list[idx] = account else list.add(account)
        writeListJson("account.json", list, Account.serializer())
    }
    override suspend fun deleteAccount(id: String) {
        writeListJson("account.json", getAccounts().filter { it.id != id }, Account.serializer())
    }

    override suspend fun getTransactions(accountId: String, page: Int, pageSize: Int): List<Transaction> {
        val all = readListJson("transaction.json", Transaction.serializer())
            .filter { it.accountId == accountId }
            .sortedByDescending { it.date }
        return all.drop((page - 1) * pageSize).take(pageSize)
    }
    override suspend fun getTransaction(id: String): Transaction? =
        readListJson("transaction.json", Transaction.serializer()).find { it.id == id }
    override suspend fun saveTransaction(transaction: Transaction) {
        val list = readListJson("transaction.json", Transaction.serializer()).toMutableList()
        val idx = list.indexOfFirst { it.id == transaction.id }
        if (idx >= 0) list[idx] = transaction else list.add(transaction)
        writeListJson("transaction.json", list, Transaction.serializer())
    }
    override suspend fun deleteTransaction(id: String) {
        writeListJson("transaction.json",
            readListJson("transaction.json", Transaction.serializer()).filter { it.id != id },
            Transaction.serializer())
    }
    override suspend fun importTransactions(transactions: List<Transaction>): ImportResult {
        val existing = readListJson("transaction.json", Transaction.serializer()).toMutableList()
        var imported = 0; var skipped = 0
        transactions.forEach { t ->
            val dup = t.orderId != null && existing.any { it.orderId == t.orderId }
            if (dup) skipped++ else { existing.add(t); imported++ }
        }
        writeListJson("transaction.json", existing, Transaction.serializer())
        return ImportResult(imported = imported, skipped = skipped)
    }

    override suspend fun getAssets(accountId: String): List<Asset> =
        readListJson("asset.json", Asset.serializer()).filter { it.accountId == accountId }
    override suspend fun saveAsset(asset: Asset) {
        val list = readListJson("asset.json", Asset.serializer()).toMutableList()
        val idx = list.indexOfFirst { it.id == asset.id }
        if (idx >= 0) list[idx] = asset else list.add(asset)
        writeListJson("asset.json", list, Asset.serializer())
    }
    override suspend fun deleteAsset(id: String) {
        writeListJson("asset.json", readListJson("asset.json", Asset.serializer()).filter { it.id != id }, Asset.serializer())
    }

    override suspend fun getBudgets(accountId: String): List<Budget> =
        readListJson("budget.json", Budget.serializer()).filter { it.accountId == accountId }
    override suspend fun saveBudget(budget: Budget) {
        val list = readListJson("budget.json", Budget.serializer()).toMutableList()
        val idx = list.indexOfFirst { it.id == budget.id }
        if (idx >= 0) list[idx] = budget else list.add(budget)
        writeListJson("budget.json", list, Budget.serializer())
    }
    override suspend fun deleteBudget(id: String) {
        writeListJson("budget.json", readListJson("budget.json", Budget.serializer()).filter { it.id != id }, Budget.serializer())
    }

    override suspend fun getLoans(accountId: String): List<Loan> =
        readListJson("loan.json", Loan.serializer()).filter { it.accountId == accountId }
    override suspend fun saveLoan(loan: Loan) {
        val list = readListJson("loan.json", Loan.serializer()).toMutableList()
        val idx = list.indexOfFirst { it.id == loan.id }
        if (idx >= 0) list[idx] = loan else list.add(loan)
        writeListJson("loan.json", list, Loan.serializer())
    }
    override suspend fun deleteLoan(id: String) {
        writeListJson("loan.json", readListJson("loan.json", Loan.serializer()).filter { it.id != id }, Loan.serializer())
    }

    override suspend fun getSavingsGoals(accountId: String): List<SavingsGoal> =
        readListJson("savingsgoal.json", SavingsGoal.serializer()).filter { it.accountId == accountId }
    override suspend fun saveSavingsGoal(goal: SavingsGoal) {
        val list = readListJson("savingsgoal.json", SavingsGoal.serializer()).toMutableList()
        val idx = list.indexOfFirst { it.id == goal.id }
        if (idx >= 0) list[idx] = goal else list.add(goal)
        writeListJson("savingsgoal.json", list, SavingsGoal.serializer())
    }
    override suspend fun deleteSavingsGoal(id: String) {
        writeListJson("savingsgoal.json", readListJson("savingsgoal.json", SavingsGoal.serializer()).filter { it.id != id }, SavingsGoal.serializer())
    }
    override suspend fun getSavingsPlans(goalId: String): List<SavingsPlan> =
        readListJson("savingsplan.json", SavingsPlan.serializer()).filter { it.goalId == goalId }
    override suspend fun saveSavingsPlan(plan: SavingsPlan) {
        val list = readListJson("savingsplan.json", SavingsPlan.serializer()).toMutableList()
        val idx = list.indexOfFirst { it.id == plan.id }
        if (idx >= 0) list[idx] = plan else list.add(plan)
        writeListJson("savingsplan.json", list, SavingsPlan.serializer())
    }

    override suspend fun getCategoryRules(accountId: String): List<CategoryRule> =
        readListJson("category_rules.json", CategoryRule.serializer()).filter { it.accountId == accountId }
    override suspend fun saveCategoryRule(rule: CategoryRule) {
        val list = readListJson("category_rules.json", CategoryRule.serializer()).toMutableList()
        val idx = list.indexOfFirst { it.id == rule.id }
        if (idx >= 0) list[idx] = rule else list.add(rule)
        writeListJson("category_rules.json", list, CategoryRule.serializer())
    }

    override suspend fun getImportErrorLogs(accountId: String): List<ImportErrorLog> =
        readListJson("importerrorlog.json", ImportErrorLog.serializer()).filter { it.accountId == accountId }
    override suspend fun saveImportErrorLog(log: ImportErrorLog) {
        val list = readListJson("importerrorlog.json", ImportErrorLog.serializer()).toMutableList()
        list.add(log)
        writeListJson("importerrorlog.json", list, ImportErrorLog.serializer())
    }

    override suspend fun getExchangeRates(): List<ExchangeRate> =
        readListJson("exchangerate.json", ExchangeRate.serializer())

    override suspend fun getThemeConfig(userId: String): ThemeConfig? =
        readListJson("themeconfig.json", ThemeConfig.serializer()).firstOrNull { it.userId == userId }
    override suspend fun saveThemeConfig(config: ThemeConfig) {
        val list = readListJson("themeconfig.json", ThemeConfig.serializer()).toMutableList()
        val idx = list.indexOfFirst { it.id == config.id }
        if (idx >= 0) list[idx] = config else list.add(config)
        writeListJson("themeconfig.json", list, ThemeConfig.serializer())
    }

    override suspend fun seedDemoData() {
        val now = java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
        val month = now.take(7)
        val txns = listOf(
            Transaction("txn-demo-salary", "local", "default", 12800.0, TransactionType.INCOME, "工资", "银行卡", "公司发薪", "${month}-15 09:00:00", "月中发薪", createdAt = now, updatedAt = now),
            Transaction("txn-demo-food", "local", "default", 86.0, TransactionType.EXPENSE, "餐饮", "支付宝", "午餐", "${month}-16 12:15:00", "工作餐", createdAt = now, updatedAt = now),
            Transaction("txn-demo-shop", "local", "default", 268.0, TransactionType.EXPENSE, "购物", "微信", "日用品", "${month}-18 20:10:00", "家庭采购", createdAt = now, updatedAt = now),
            Transaction("txn-demo-traffic", "local", "default", 48.0, TransactionType.EXPENSE, "交通", "支付宝", "地铁公交", "${month}-19 08:30:00", "通勤", createdAt = now, updatedAt = now),
            Transaction("txn-demo-entertain", "local", "default", 156.0, TransactionType.EXPENSE, "娱乐", "微信", "电影票", "${month}-20 20:40:00", "周末观影", createdAt = now, updatedAt = now)
        )
        val assets = listOf(
            Asset("asset-demo-bank", "local", "default", "工资卡", AssetType.BANK_CARD, 48216.4, createdAt = now, updatedAt = now),
            Asset("asset-demo-wechat", "local", "default", "微信钱包", AssetType.WECHAT, 1260.5, createdAt = now, updatedAt = now),
            Asset("asset-demo-alipay", "local", "default", "支付宝余额", AssetType.ALIPAY, 3180.0, createdAt = now, updatedAt = now)
        )
        val budgets = listOf(
            Budget("budget-demo-global", "local", "default", 6000.0, "ALL", alertPercent = 80, scopeType = BudgetScopeType.GLOBAL, createdAt = now, updatedAt = now),
            Budget("budget-demo-food", "local", "default", 1500.0, "餐饮", alertPercent = 80, scopeType = BudgetScopeType.CATEGORY, createdAt = now, updatedAt = now)
        )
        val loans = listOf(
            Loan("loan-demo-home", "local", "default", "房贷", 480000.0, 352000.0, 240, 64, 3200.0, 20, createdAt = now, updatedAt = now),
            Loan("loan-demo-car", "local", "default", "车贷", 80000.0, 27000.0, 36, 18, 2200.0, 10, createdAt = now, updatedAt = now)
        )
        val goals = listOf(
            SavingsGoal("goal-demo-travel", "local", "default", "旅行基金", 30000.0, 9200.0, "2026-12-31", SavingsGoalType.LONG_TERM, SavingsGoalStatus.ACTIVE, SavingsGoalDepositType.CASH, createdAt = now, updatedAt = now),
            SavingsGoal("goal-demo-emergency", "local", "default", "应急储备", 20000.0, 6800.0, "2027-06-30", SavingsGoalType.LONG_TERM, SavingsGoalStatus.ACTIVE, SavingsGoalDepositType.CASH, createdAt = now, updatedAt = now)
        )
        val plans = listOf(
            SavingsPlan("plan-demo-travel-1", "goal-demo-travel", 2000.0, SavingsPlanStatus.PENDING, month, createdAt = now, updatedAt = now)
        )
        txns.forEach { saveTransaction(it) }
        assets.forEach { saveAsset(it) }
        budgets.forEach { saveBudget(it) }
        loans.forEach { saveLoan(it) }
        goals.forEach { saveSavingsGoal(it) }
        plans.forEach { saveSavingsPlan(it) }
    }
}
