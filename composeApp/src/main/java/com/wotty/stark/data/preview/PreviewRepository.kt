package com.wotty.stark.data.preview

import com.wotty.stark.data.model.Account
import com.wotty.stark.data.model.Asset
import com.wotty.stark.data.model.AssetType
import com.wotty.stark.data.model.Budget
import com.wotty.stark.data.model.BudgetScopeType
import com.wotty.stark.data.model.CategoryRule
import com.wotty.stark.data.model.ExchangeRate
import com.wotty.stark.data.model.ImportErrorLog
import com.wotty.stark.data.model.Loan
import com.wotty.stark.data.model.LoanStatus
import com.wotty.stark.data.model.SavingsGoal
import com.wotty.stark.data.model.SavingsGoalDepositType
import com.wotty.stark.data.model.SavingsGoalType
import com.wotty.stark.data.model.SavingsPlan
import com.wotty.stark.data.model.ThemeConfig
import com.wotty.stark.data.model.Transaction
import com.wotty.stark.data.model.TransactionType
import com.wotty.stark.data.model.User
import com.wotty.stark.data.repository.DataRepository
import com.wotty.stark.data.repository.ImportResult

object PreviewRepository : DataRepository {

    private const val USER_ID = "preview-user"
    private const val ACCOUNT_ID = "default"
    private const val NOW = "2026-07-30 20:30"

    private val previewUser = User(
        id = USER_ID,
        email = "preview@wotty.local",
        password = "preview",
        name = "预览用户",
        defaultAccountId = ACCOUNT_ID,
        createdAt = NOW,
        updatedAt = NOW
    )

    private val previewAccounts = listOf(
        Account(
            id = ACCOUNT_ID,
            name = "家庭账本",
            ownerId = USER_ID,
            createdAt = NOW,
            updatedAt = NOW
        )
    )

    private val previewTransactions = listOf(
        Transaction(
            id = "tx-1",
            userId = USER_ID,
            accountId = ACCOUNT_ID,
            amount = 28.0,
            type = TransactionType.EXPENSE,
            category = "餐饮",
            platform = "支付宝",
            merchant = "麦当劳",
            date = "2026-07-30 12:10",
            description = "午餐",
            createdAt = NOW,
            updatedAt = NOW
        ),
        Transaction(
            id = "tx-2",
            userId = USER_ID,
            accountId = ACCOUNT_ID,
            amount = 5200.0,
            type = TransactionType.INCOME,
            category = "工资",
            platform = "银行卡",
            merchant = "公司发薪",
            date = "2026-07-29 09:00",
            description = "七月工资",
            createdAt = NOW,
            updatedAt = NOW
        ),
        Transaction(
            id = "tx-3",
            userId = USER_ID,
            accountId = ACCOUNT_ID,
            amount = 76.5,
            type = TransactionType.EXPENSE,
            category = "交通",
            platform = "微信",
            merchant = "滴滴出行",
            date = "2026-07-28 08:40",
            description = "通勤",
            createdAt = NOW,
            updatedAt = NOW
        ),
        Transaction(
            id = "tx-4",
            userId = USER_ID,
            accountId = ACCOUNT_ID,
            amount = 199.0,
            type = TransactionType.EXPENSE,
            category = "购物",
            platform = "支付宝",
            merchant = "优衣库",
            date = "2026-07-27 21:15",
            description = "夏装",
            createdAt = NOW,
            updatedAt = NOW
        ),
        Transaction(
            id = "tx-5",
            userId = USER_ID,
            accountId = ACCOUNT_ID,
            amount = 800.0,
            type = TransactionType.TRANSFER,
            category = "转账",
            platform = "银行卡",
            merchant = "转入储蓄",
            date = "2026-07-25 19:20",
            description = "月度储蓄",
            createdAt = NOW,
            updatedAt = NOW
        )
    )

    private val previewAssets = listOf(
        Asset(
            id = "asset-1",
            userId = USER_ID,
            accountId = ACCOUNT_ID,
            name = "招商银行卡",
            type = AssetType.BANK_CARD,
            balance = 16890.0,
            createdAt = NOW,
            updatedAt = NOW
        ),
        Asset(
            id = "asset-2",
            userId = USER_ID,
            accountId = ACCOUNT_ID,
            name = "支付宝",
            type = AssetType.ALIPAY,
            balance = 2580.0,
            createdAt = NOW,
            updatedAt = NOW
        ),
        Asset(
            id = "asset-3",
            userId = USER_ID,
            accountId = ACCOUNT_ID,
            name = "微信零钱",
            type = AssetType.WECHAT,
            balance = 886.0,
            createdAt = NOW,
            updatedAt = NOW
        )
    )

    private val previewBudgets = listOf(
        Budget(
            id = "budget-1",
            userId = USER_ID,
            accountId = ACCOUNT_ID,
            amount = 6000.0,
            category = "ALL",
            alertPercent = 80,
            scopeType = BudgetScopeType.GLOBAL,
            createdAt = NOW,
            updatedAt = NOW
        )
    )

    private val previewLoans = listOf(
        Loan(
            id = "loan-1",
            userId = USER_ID,
            accountId = ACCOUNT_ID,
            platform = "招商银行",
            totalAmount = 120000.0,
            remainingAmount = 86500.0,
            periods = 36,
            paidPeriods = 10,
            monthlyPayment = 3560.0,
            dueDate = 8,
            status = LoanStatus.ACTIVE,
            createdAt = NOW,
            updatedAt = NOW
        ),
        Loan(
            id = "loan-2",
            userId = USER_ID,
            accountId = ACCOUNT_ID,
            platform = "花呗",
            totalAmount = 16000.0,
            remainingAmount = 4200.0,
            periods = 12,
            paidPeriods = 8,
            monthlyPayment = 980.0,
            dueDate = 12,
            status = LoanStatus.ACTIVE,
            createdAt = NOW,
            updatedAt = NOW
        )
    )

    private val previewSavingsGoals = listOf(
        SavingsGoal(
            id = "saving-1",
            userId = USER_ID,
            accountId = ACCOUNT_ID,
            name = "旅游基金",
            targetAmount = 20000.0,
            currentAmount = 8600.0,
            deadline = "2026-12-31",
            type = SavingsGoalType.LONG_TERM,
            depositType = SavingsGoalDepositType.CASH,
            createdAt = NOW,
            updatedAt = NOW
        ),
        SavingsGoal(
            id = "saving-2",
            userId = USER_ID,
            accountId = ACCOUNT_ID,
            name = "年终备用金",
            targetAmount = 12000.0,
            currentAmount = 4600.0,
            deadline = "2026-11-30",
            type = SavingsGoalType.YEARLY,
            depositType = SavingsGoalDepositType.FIXED_TERM,
            createdAt = NOW,
            updatedAt = NOW
        )
    )

    override suspend fun getCurrentUser(): User = previewUser

    override suspend fun saveUser(user: User) = Unit

    override suspend fun getAccounts(): List<Account> = previewAccounts

    override suspend fun getAccount(id: String): Account? = previewAccounts.find { it.id == id }

    override suspend fun saveAccount(account: Account) = Unit

    override suspend fun deleteAccount(id: String) = Unit

    override suspend fun getTransactions(accountId: String, page: Int, pageSize: Int): List<Transaction> {
        val sorted = previewTransactions
            .filter { it.accountId == accountId }
            .sortedByDescending { it.date }
        return sorted.drop((page - 1) * pageSize).take(pageSize)
    }

    override suspend fun getTransaction(id: String): Transaction? = previewTransactions.find { it.id == id }

    override suspend fun saveTransaction(transaction: Transaction) = Unit

    override suspend fun deleteTransaction(id: String) = Unit

    override suspend fun importTransactions(transactions: List<Transaction>): ImportResult {
        return ImportResult(imported = transactions.size)
    }

    override suspend fun getAssets(accountId: String): List<Asset> =
        previewAssets.filter { it.accountId == accountId }

    override suspend fun saveAsset(asset: Asset) = Unit

    override suspend fun deleteAsset(id: String) = Unit

    override suspend fun getBudgets(accountId: String): List<Budget> =
        previewBudgets.filter { it.accountId == accountId }

    override suspend fun saveBudget(budget: Budget) = Unit

    override suspend fun deleteBudget(id: String) = Unit

    override suspend fun getLoans(accountId: String): List<Loan> =
        previewLoans.filter { it.accountId == accountId }

    override suspend fun saveLoan(loan: Loan) = Unit

    override suspend fun deleteLoan(id: String) = Unit

    override suspend fun getSavingsGoals(accountId: String): List<SavingsGoal> =
        previewSavingsGoals.filter { it.accountId == accountId }

    override suspend fun saveSavingsGoal(goal: SavingsGoal) = Unit

    override suspend fun deleteSavingsGoal(id: String) = Unit

    override suspend fun getSavingsPlans(goalId: String): List<SavingsPlan> = emptyList()

    override suspend fun saveSavingsPlan(plan: SavingsPlan) = Unit

    override suspend fun getCategoryRules(accountId: String): List<CategoryRule> = emptyList()

    override suspend fun saveCategoryRule(rule: CategoryRule) = Unit

    override suspend fun getImportErrorLogs(accountId: String): List<ImportErrorLog> = emptyList()

    override suspend fun saveImportErrorLog(log: ImportErrorLog) = Unit

    override suspend fun getExchangeRates(): List<ExchangeRate> = emptyList()

    override suspend fun getThemeConfig(userId: String): ThemeConfig? = null

    override suspend fun saveThemeConfig(config: ThemeConfig) = Unit

    override suspend fun seedDemoData() = Unit
}
