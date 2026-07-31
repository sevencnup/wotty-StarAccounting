package com.wotty.stark.server.util

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.boolean
import kotlinx.serialization.json.booleanOrNull
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.doubleOrNull
import kotlinx.serialization.json.int
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.ResultRow
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.inList
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.javatime.datetime
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.statements.UpdateBuilder
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter

private val json = Json { ignoreUnknownKeys = true }
private val dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")

object Users : Table("user") {
    val id = varchar("id", 191)
    val email = varchar("email", 191).uniqueIndex("User_email_key")
    val password = varchar("password", 191)
    val name = varchar("name", 191).nullable()
    val defaultAccountId = varchar("defaultAccountId", 191).nullable()
    val createdAt = datetime("createdAt")
    val updatedAt = datetime("updatedAt")
    val role = varchar("role", 191)

    override val primaryKey = PrimaryKey(id)
}

object Accounts : Table("account") {
    val id = varchar("id", 191)
    val name = varchar("name", 191)
    val ownerId = varchar("ownerId", 191).index("Account_ownerId_idx")
    val createdAt = datetime("createdAt")
    val updatedAt = datetime("updatedAt")

    override val primaryKey = PrimaryKey(id)
}

object Assets : Table("asset") {
    val id = varchar("id", 191)
    val userId = varchar("userId", 191)
    val accountId = varchar("accountId", 191).index("Asset_accountId_idx")
    val name = varchar("name", 191)
    val type = varchar("type", 191)
    val balance = decimal("balance", 65, 30)
    val currency = varchar("currency", 191)
    val createdAt = datetime("createdAt")
    val updatedAt = datetime("updatedAt")

    override val primaryKey = PrimaryKey(id)
}

object Budgets : Table("budget") {
    val id = varchar("id", 191)
    val userId = varchar("userId", 191)
    val accountId = varchar("accountId", 191).index("Budget_accountId_idx")
    val amount = decimal("amount", 65, 30)
    val category = varchar("category", 191)
    val period = varchar("period", 32)
    val createdAt = datetime("createdAt")
    val updatedAt = datetime("updatedAt")
    val alertPercent = integer("alertPercent")
    val platform = varchar("platform", 191).nullable()
    val scopeType = varchar("scopeType", 32)

    override val primaryKey = PrimaryKey(id)
}

object ExchangeRates : Table("exchangerate") {
    val id = varchar("id", 191)
    val from = varchar("from", 191)
    val to = varchar("to", 191)
    val rate = decimal("rate", 65, 30)
    val updatedAt = datetime("updatedAt")

    override val primaryKey = PrimaryKey(id)
}

object ImportErrorLogs : Table("importerrorlog") {
    val id = varchar("id", 191)
    val userId = varchar("userId", 191)
    val accountId = varchar("accountId", 191).index("ImportErrorLog_accountId_idx")
    val fileName = varchar("fileName", 191)
    val lineNumber = integer("lineNumber")
    val rawData = text("rawData")
    val errorMessage = text("errorMessage")
    val errorType = varchar("errorType", 191)
    val resolved = bool("resolved")
    val createdAt = datetime("createdAt")

    override val primaryKey = PrimaryKey(id)
}

object Loans : Table("loan") {
    val id = varchar("id", 191)
    val userId = varchar("userId", 191)
    val accountId = varchar("accountId", 191).index("Loan_accountId_idx")
    val platform = varchar("platform", 191)
    val totalAmount = decimal("totalAmount", 65, 30)
    val remainingAmount = decimal("remainingAmount", 65, 30)
    val periods = integer("periods")
    val paidPeriods = integer("paidPeriods")
    val monthlyPayment = decimal("monthlyPayment", 65, 30)
    val dueDate = integer("dueDate")
    val status = varchar("status", 32)
    val matchKeywords = text("matchKeywords").nullable()
    val createdAt = datetime("createdAt")
    val updatedAt = datetime("updatedAt")

    override val primaryKey = PrimaryKey(id)
}

object SavingsGoals : Table("savingsgoal") {
    val id = varchar("id", 191)
    val userId = varchar("userId", 191)
    val accountId = varchar("accountId", 191).index("SavingsGoal_accountId_idx")
    val name = varchar("name", 191)
    val targetAmount = decimal("targetAmount", 65, 30)
    val currentAmount = decimal("currentAmount", 65, 30)
    val deadline = datetime("deadline").nullable()
    val type = varchar("type", 64)
    val status = varchar("status", 32)
    val createdAt = datetime("createdAt")
    val updatedAt = datetime("updatedAt")
    val depositType = varchar("depositType", 32)
    val planConfig = text("planConfig").nullable()

    override val primaryKey = PrimaryKey(id)
}

object SavingsPlans : Table("savingsplan") {
    val id = varchar("id", 191)
    val goalId = varchar("goalId", 191).index("SavingsPlan_goalId_idx")
    val amount = decimal("amount", 65, 30)
    val status = varchar("status", 32)
    val month = varchar("month", 191)
    val createdAt = datetime("createdAt")
    val updatedAt = datetime("updatedAt")
    val expenses = text("expenses").nullable()
    val remark = varchar("remark", 191).nullable()
    val salary = decimal("salary", 65, 30).nullable()
    val proofImage = text("proofImage").nullable()

    override val primaryKey = PrimaryKey(id)
}

object ThemeConfigs : Table("themeconfig") {
    val id = varchar("id", 191)
    val userId = varchar("userId", 191).uniqueIndex("ThemeConfig_userId_key")
    val accountId = varchar("accountId", 191).nullable()
    val themeId = varchar("themeId", 191)
    val primaryColor = varchar("primaryColor", 191).nullable()
    val radius = double("radius").nullable()
    val isDarkMode = bool("isDarkMode")
    val chartStyle = text("chartStyle").nullable()
    val createdAt = datetime("createdAt")
    val updatedAt = datetime("updatedAt")

    override val primaryKey = PrimaryKey(id)
}

object Transactions : Table("transaction") {
    val id = varchar("id", 191)
    val userId = varchar("userId", 191)
    val accountId = varchar("accountId", 191).index("Transaction_accountId_idx")
    val amount = decimal("amount", 65, 30)
    val type = varchar("type", 32)
    val category = varchar("category", 191)
    val platform = varchar("platform", 191)
    val merchant = varchar("merchant", 191).nullable()
    val date = datetime("date")
    val description = varchar("description", 191).nullable()
    val orderId = varchar("orderId", 191).nullable()
    val paymentMethod = varchar("paymentMethod", 191).nullable()
    val status = varchar("status", 191).nullable()
    val loanId = varchar("loanId", 191).nullable()
    val createdAt = datetime("createdAt")
    val updatedAt = datetime("updatedAt")

    override val primaryKey = PrimaryKey(id)
}

object TransactionCategoryRules : Table("transactioncategoryrule") {
    val id = varchar("id", 191)
    val userId = varchar("userId", 191)
    val accountId = varchar("accountId", 191).index("TransactionCategoryRule_accountId_idx")
    val name = varchar("name", 191).nullable()
    val merchant = varchar("merchant", 191)
    val merchantKey = varchar("merchantKey", 191)
    val category = varchar("category", 191)
    val description = varchar("description", 191).nullable()
    val isActive = bool("isActive")
    val createdAt = datetime("createdAt")
    val updatedAt = datetime("updatedAt")

    override val primaryKey = PrimaryKey(id)
}

data class SyncRecordRow(
    val id: String,
    val entityType: String,
    val accountId: String?,
    val userId: String?,
    val payload: String,
    val updatedAt: String,
)

object DatabaseFactory {
    private val dataSource by lazy {
        val config = HikariConfig().apply {
            jdbcUrl = System.getenv("DATABASE_URL") ?: error("DATABASE_URL environment variable not set")
            driverClassName = "com.mysql.cj.jdbc.Driver"
            username = System.getenv("DB_USER") ?: "root"
            password = System.getenv("DB_PASSWORD") ?: error("DB_PASSWORD environment variable not set")
            maximumPoolSize = 10
            minimumIdle = 5
            idleTimeout = 30000
            maxLifetime = 600000
            connectionTimeout = 30000
        }
        HikariDataSource(config)
    }

    fun init() {
        Database.connect(dataSource)
        transaction {
            SchemaUtils.createMissingTablesAndColumns(
                Users,
                Accounts,
                Assets,
                Budgets,
                ExchangeRates,
                ImportErrorLogs,
                Loans,
                SavingsGoals,
                SavingsPlans,
                ThemeConfigs,
                Transactions,
                TransactionCategoryRules,
            )
        }
    }

    fun listRecords(accountId: String): List<SyncRecordRow> = transaction {
        buildList {
            addAll(Users.selectAll().map { it.toUserRecord() })
            addAll(Accounts.selectAll().where { Accounts.id eq accountId }.map { it.toAccountRecord() })
            addAll(Transactions.selectAll().where { Transactions.accountId eq accountId }.map { it.toTransactionRecord() })
            addAll(Assets.selectAll().where { Assets.accountId eq accountId }.map { it.toAssetRecord() })
            addAll(Budgets.selectAll().where { Budgets.accountId eq accountId }.map { it.toBudgetRecord() })
            addAll(Loans.selectAll().where { Loans.accountId eq accountId }.map { it.toLoanRecord() })
            addAll(SavingsGoals.selectAll().where { SavingsGoals.accountId eq accountId }.map { it.toSavingsGoalRecord() })
            val goalIds = SavingsGoals.selectAll().where { SavingsGoals.accountId eq accountId }.map { it[SavingsGoals.id] }
            if (goalIds.isNotEmpty()) {
                addAll(SavingsPlans.selectAll().where { SavingsPlans.goalId inList goalIds }.map { it.toSavingsPlanRecord() })
            }
            addAll(TransactionCategoryRules.selectAll().where { TransactionCategoryRules.accountId eq accountId }.map { it.toCategoryRuleRecord() })
            addAll(ImportErrorLogs.selectAll().where { ImportErrorLogs.accountId eq accountId }.map { it.toImportErrorLogRecord() })
            addAll(ExchangeRates.selectAll().map { it.toExchangeRateRecord() })
            addAll(ThemeConfigs.selectAll().where { ThemeConfigs.accountId eq accountId }.map { it.toThemeConfigRecord() })
            addAll(ThemeConfigs.selectAll().where { ThemeConfigs.accountId.isNull() }.map { it.toThemeConfigRecord() })
        }
    }

    fun upsertRecord(record: SyncRecordRow) {
        val payload = json.parseToJsonElement(record.payload).jsonObject
        if (payload["__deleted"]?.jsonPrimitive?.booleanOrNull == true) {
            deleteRecord(record.entityType, record.id)
            return
        }
        transaction {
            when (record.entityType) {
                "users" -> upsertUser(payload)
                "accounts" -> upsertAccount(payload)
                "transactions" -> upsertTransaction(payload)
                "assets" -> upsertAsset(payload)
                "budgets" -> upsertBudget(payload)
                "loans" -> upsertLoan(payload)
                "savingsGoals" -> upsertSavingsGoal(payload)
                "savingsPlans" -> upsertSavingsPlan(payload)
                "categoryRules" -> upsertCategoryRule(payload)
                "importErrorLogs" -> upsertImportErrorLog(payload)
                "exchangeRates" -> upsertExchangeRate(payload)
                "themeConfigs" -> upsertThemeConfig(payload)
            }
        }
    }

    private fun deleteRecord(entityType: String, id: String) = transaction {
        when (entityType) {
            "users" -> Users.deleteWhere { Users.id eq id }
            "accounts" -> Accounts.deleteWhere { Accounts.id eq id }
            "transactions" -> Transactions.deleteWhere { Transactions.id eq id }
            "assets" -> Assets.deleteWhere { Assets.id eq id }
            "budgets" -> Budgets.deleteWhere { Budgets.id eq id }
            "loans" -> Loans.deleteWhere { Loans.id eq id }
            "savingsGoals" -> SavingsGoals.deleteWhere { SavingsGoals.id eq id }
            "savingsPlans" -> SavingsPlans.deleteWhere { SavingsPlans.id eq id }
            "categoryRules" -> TransactionCategoryRules.deleteWhere { TransactionCategoryRules.id eq id }
            "importErrorLogs" -> ImportErrorLogs.deleteWhere { ImportErrorLogs.id eq id }
            "exchangeRates" -> ExchangeRates.deleteWhere { ExchangeRates.id eq id }
            "themeConfigs" -> ThemeConfigs.deleteWhere { ThemeConfigs.id eq id }
        }
    }
}

private fun ResultRow.toUserRecord() = SyncRecordRow(
    id = this[Users.id],
    entityType = "users",
    accountId = this[Users.defaultAccountId],
    userId = this[Users.id],
    payload = jsonObject(
        "id" to this[Users.id],
        "email" to this[Users.email],
        "password" to this[Users.password],
        "name" to this[Users.name],
        "defaultAccountId" to this[Users.defaultAccountId],
        "role" to this[Users.role],
        "createdAt" to formatDateTime(this[Users.createdAt]),
        "updatedAt" to formatDateTime(this[Users.updatedAt]),
    ),
    updatedAt = formatDateTime(this[Users.updatedAt]),
)

private fun ResultRow.toAccountRecord() = SyncRecordRow(
    id = this[Accounts.id],
    entityType = "accounts",
    accountId = this[Accounts.id],
    userId = this[Accounts.ownerId],
    payload = jsonObject(
        "id" to this[Accounts.id],
        "name" to this[Accounts.name],
        "ownerId" to this[Accounts.ownerId],
        "createdAt" to formatDateTime(this[Accounts.createdAt]),
        "updatedAt" to formatDateTime(this[Accounts.updatedAt]),
    ),
    updatedAt = formatDateTime(this[Accounts.updatedAt]),
)

private fun ResultRow.toTransactionRecord() = SyncRecordRow(
    id = this[Transactions.id],
    entityType = "transactions",
    accountId = this[Transactions.accountId],
    userId = this[Transactions.userId],
    payload = jsonObject(
        "id" to this[Transactions.id],
        "userId" to this[Transactions.userId],
        "accountId" to this[Transactions.accountId],
        "amount" to this[Transactions.amount].toDouble(),
        "type" to this[Transactions.type],
        "category" to this[Transactions.category],
        "platform" to this[Transactions.platform],
        "merchant" to this[Transactions.merchant],
        "date" to formatDateTime(this[Transactions.date]),
        "description" to this[Transactions.description],
        "orderId" to this[Transactions.orderId],
        "paymentMethod" to this[Transactions.paymentMethod],
        "status" to this[Transactions.status],
        "loanId" to this[Transactions.loanId],
        "createdAt" to formatDateTime(this[Transactions.createdAt]),
        "updatedAt" to formatDateTime(this[Transactions.updatedAt]),
    ),
    updatedAt = formatDateTime(this[Transactions.updatedAt]),
)

private fun ResultRow.toAssetRecord() = SyncRecordRow(
    id = this[Assets.id],
    entityType = "assets",
    accountId = this[Assets.accountId],
    userId = this[Assets.userId],
    payload = jsonObject(
        "id" to this[Assets.id],
        "userId" to this[Assets.userId],
        "accountId" to this[Assets.accountId],
        "name" to this[Assets.name],
        "type" to this[Assets.type],
        "balance" to this[Assets.balance].toDouble(),
        "currency" to this[Assets.currency],
        "createdAt" to formatDateTime(this[Assets.createdAt]),
        "updatedAt" to formatDateTime(this[Assets.updatedAt]),
    ),
    updatedAt = formatDateTime(this[Assets.updatedAt]),
)

private fun ResultRow.toBudgetRecord() = SyncRecordRow(
    id = this[Budgets.id],
    entityType = "budgets",
    accountId = this[Budgets.accountId],
    userId = this[Budgets.userId],
    payload = jsonObject(
        "id" to this[Budgets.id],
        "userId" to this[Budgets.userId],
        "accountId" to this[Budgets.accountId],
        "amount" to this[Budgets.amount].toDouble(),
        "category" to this[Budgets.category],
        "period" to this[Budgets.period],
        "alertPercent" to this[Budgets.alertPercent],
        "platform" to this[Budgets.platform],
        "scopeType" to this[Budgets.scopeType],
        "createdAt" to formatDateTime(this[Budgets.createdAt]),
        "updatedAt" to formatDateTime(this[Budgets.updatedAt]),
    ),
    updatedAt = formatDateTime(this[Budgets.updatedAt]),
)

private fun ResultRow.toLoanRecord() = SyncRecordRow(
    id = this[Loans.id],
    entityType = "loans",
    accountId = this[Loans.accountId],
    userId = this[Loans.userId],
    payload = jsonObject(
        "id" to this[Loans.id],
        "userId" to this[Loans.userId],
        "accountId" to this[Loans.accountId],
        "platform" to this[Loans.platform],
        "totalAmount" to this[Loans.totalAmount].toDouble(),
        "remainingAmount" to this[Loans.remainingAmount].toDouble(),
        "periods" to this[Loans.periods],
        "paidPeriods" to this[Loans.paidPeriods],
        "monthlyPayment" to this[Loans.monthlyPayment].toDouble(),
        "dueDate" to this[Loans.dueDate],
        "status" to this[Loans.status],
        "matchKeywords" to this[Loans.matchKeywords],
        "createdAt" to formatDateTime(this[Loans.createdAt]),
        "updatedAt" to formatDateTime(this[Loans.updatedAt]),
    ),
    updatedAt = formatDateTime(this[Loans.updatedAt]),
)

private fun ResultRow.toSavingsGoalRecord() = SyncRecordRow(
    id = this[SavingsGoals.id],
    entityType = "savingsGoals",
    accountId = this[SavingsGoals.accountId],
    userId = this[SavingsGoals.userId],
    payload = jsonObject(
        "id" to this[SavingsGoals.id],
        "userId" to this[SavingsGoals.userId],
        "accountId" to this[SavingsGoals.accountId],
        "name" to this[SavingsGoals.name],
        "targetAmount" to this[SavingsGoals.targetAmount].toDouble(),
        "currentAmount" to this[SavingsGoals.currentAmount].toDouble(),
        "deadline" to this[SavingsGoals.deadline]?.let(::formatDateTime),
        "type" to this[SavingsGoals.type],
        "status" to this[SavingsGoals.status],
        "depositType" to this[SavingsGoals.depositType],
        "planConfig" to this[SavingsGoals.planConfig],
        "createdAt" to formatDateTime(this[SavingsGoals.createdAt]),
        "updatedAt" to formatDateTime(this[SavingsGoals.updatedAt]),
    ),
    updatedAt = formatDateTime(this[SavingsGoals.updatedAt]),
)

private fun ResultRow.toSavingsPlanRecord() = SyncRecordRow(
    id = this[SavingsPlans.id],
    entityType = "savingsPlans",
    accountId = null,
    userId = null,
    payload = jsonObject(
        "id" to this[SavingsPlans.id],
        "goalId" to this[SavingsPlans.goalId],
        "amount" to this[SavingsPlans.amount].toDouble(),
        "status" to this[SavingsPlans.status],
        "month" to this[SavingsPlans.month],
        "createdAt" to formatDateTime(this[SavingsPlans.createdAt]),
        "updatedAt" to formatDateTime(this[SavingsPlans.updatedAt]),
        "expenses" to this[SavingsPlans.expenses],
        "remark" to this[SavingsPlans.remark],
        "salary" to this[SavingsPlans.salary]?.toDouble(),
        "proofImage" to this[SavingsPlans.proofImage],
    ),
    updatedAt = formatDateTime(this[SavingsPlans.updatedAt]),
)

private fun ResultRow.toCategoryRuleRecord() = SyncRecordRow(
    id = this[TransactionCategoryRules.id],
    entityType = "categoryRules",
    accountId = this[TransactionCategoryRules.accountId],
    userId = this[TransactionCategoryRules.userId],
    payload = jsonObject(
        "id" to this[TransactionCategoryRules.id],
        "userId" to this[TransactionCategoryRules.userId],
        "accountId" to this[TransactionCategoryRules.accountId],
        "name" to this[TransactionCategoryRules.name],
        "merchant" to this[TransactionCategoryRules.merchant],
        "merchantKey" to this[TransactionCategoryRules.merchantKey],
        "category" to this[TransactionCategoryRules.category],
        "description" to this[TransactionCategoryRules.description],
        "isActive" to this[TransactionCategoryRules.isActive],
        "createdAt" to formatDateTime(this[TransactionCategoryRules.createdAt]),
        "updatedAt" to formatDateTime(this[TransactionCategoryRules.updatedAt]),
    ),
    updatedAt = formatDateTime(this[TransactionCategoryRules.updatedAt]),
)

private fun ResultRow.toImportErrorLogRecord() = SyncRecordRow(
    id = this[ImportErrorLogs.id],
    entityType = "importErrorLogs",
    accountId = this[ImportErrorLogs.accountId],
    userId = this[ImportErrorLogs.userId],
    payload = jsonObject(
        "id" to this[ImportErrorLogs.id],
        "userId" to this[ImportErrorLogs.userId],
        "accountId" to this[ImportErrorLogs.accountId],
        "fileName" to this[ImportErrorLogs.fileName],
        "lineNumber" to this[ImportErrorLogs.lineNumber],
        "rawData" to this[ImportErrorLogs.rawData],
        "errorMessage" to this[ImportErrorLogs.errorMessage],
        "errorType" to this[ImportErrorLogs.errorType],
        "resolved" to this[ImportErrorLogs.resolved],
        "createdAt" to formatDateTime(this[ImportErrorLogs.createdAt]),
    ),
    updatedAt = formatDateTime(this[ImportErrorLogs.createdAt]),
)

private fun ResultRow.toExchangeRateRecord() = SyncRecordRow(
    id = this[ExchangeRates.id],
    entityType = "exchangeRates",
    accountId = null,
    userId = null,
    payload = jsonObject(
        "id" to this[ExchangeRates.id],
        "from" to this[ExchangeRates.from],
        "to" to this[ExchangeRates.to],
        "rate" to this[ExchangeRates.rate].toDouble(),
        "updatedAt" to formatDateTime(this[ExchangeRates.updatedAt]),
    ),
    updatedAt = formatDateTime(this[ExchangeRates.updatedAt]),
)

private fun ResultRow.toThemeConfigRecord() = SyncRecordRow(
    id = this[ThemeConfigs.id],
    entityType = "themeConfigs",
    accountId = this[ThemeConfigs.accountId],
    userId = this[ThemeConfigs.userId],
    payload = jsonObject(
        "id" to this[ThemeConfigs.id],
        "userId" to this[ThemeConfigs.userId],
        "accountId" to this[ThemeConfigs.accountId],
        "themeId" to this[ThemeConfigs.themeId],
        "primaryColor" to this[ThemeConfigs.primaryColor],
        "radius" to this[ThemeConfigs.radius],
        "isDarkMode" to this[ThemeConfigs.isDarkMode],
        "chartStyle" to this[ThemeConfigs.chartStyle],
        "createdAt" to formatDateTime(this[ThemeConfigs.createdAt]),
        "updatedAt" to formatDateTime(this[ThemeConfigs.updatedAt]),
    ),
    updatedAt = formatDateTime(this[ThemeConfigs.updatedAt]),
)

private fun upsertUser(payload: JsonObject) = upsertById(Users, Users.id, payload.getString("id")) { row ->
        row[Users.email] = payload.getString("email")
        row[Users.password] = payload.getString("password")
        row[Users.name] = payload.getNullableString("name")
        row[Users.defaultAccountId] = payload.getNullableString("defaultAccountId")
        row[Users.role] = payload.getString("role")
        row[Users.createdAt] = payload.getDateTime("createdAt")
        row[Users.updatedAt] = payload.getDateTime("updatedAt")
    }

private fun upsertAccount(payload: JsonObject) = upsertById(Accounts, Accounts.id, payload.getString("id")) { row ->
        row[Accounts.name] = payload.getString("name")
        row[Accounts.ownerId] = payload.getString("ownerId")
        row[Accounts.createdAt] = payload.getDateTime("createdAt")
        row[Accounts.updatedAt] = payload.getDateTime("updatedAt")
    }

private fun upsertTransaction(payload: JsonObject) = upsertById(Transactions, Transactions.id, payload.getString("id")) { row ->
        row[Transactions.userId] = payload.getString("userId")
        row[Transactions.accountId] = payload.getString("accountId")
        row[Transactions.amount] = payload.getDecimal("amount")
        row[Transactions.type] = payload.getString("type")
        row[Transactions.category] = payload.getString("category")
        row[Transactions.platform] = payload.getString("platform")
        row[Transactions.merchant] = payload.getNullableString("merchant")
        row[Transactions.date] = payload.getDateTime("date")
        row[Transactions.description] = payload.getNullableString("description")
        row[Transactions.orderId] = payload.getNullableString("orderId")
        row[Transactions.paymentMethod] = payload.getNullableString("paymentMethod")
        row[Transactions.status] = payload.getNullableString("status")
        row[Transactions.loanId] = payload.getNullableString("loanId")
        row[Transactions.createdAt] = payload.getDateTime("createdAt")
        row[Transactions.updatedAt] = payload.getDateTime("updatedAt")
    }

private fun upsertAsset(payload: JsonObject) = upsertById(Assets, Assets.id, payload.getString("id")) { row ->
        row[Assets.userId] = payload.getString("userId")
        row[Assets.accountId] = payload.getString("accountId")
        row[Assets.name] = payload.getString("name")
        row[Assets.type] = payload.getString("type")
        row[Assets.balance] = payload.getDecimal("balance")
        row[Assets.currency] = payload.getString("currency")
        row[Assets.createdAt] = payload.getDateTime("createdAt")
        row[Assets.updatedAt] = payload.getDateTime("updatedAt")
    }

private fun upsertBudget(payload: JsonObject) = upsertById(Budgets, Budgets.id, payload.getString("id")) { row ->
        row[Budgets.userId] = payload.getString("userId")
        row[Budgets.accountId] = payload.getString("accountId")
        row[Budgets.amount] = payload.getDecimal("amount")
        row[Budgets.category] = payload.getString("category")
        row[Budgets.period] = payload.getString("period")
        row[Budgets.createdAt] = payload.getDateTime("createdAt")
        row[Budgets.updatedAt] = payload.getDateTime("updatedAt")
        row[Budgets.alertPercent] = payload.getInt("alertPercent")
        row[Budgets.platform] = payload.getNullableString("platform")
        row[Budgets.scopeType] = payload.getString("scopeType")
    }

private fun upsertLoan(payload: JsonObject) = upsertById(Loans, Loans.id, payload.getString("id")) { row ->
        row[Loans.userId] = payload.getString("userId")
        row[Loans.accountId] = payload.getString("accountId")
        row[Loans.platform] = payload.getString("platform")
        row[Loans.totalAmount] = payload.getDecimal("totalAmount")
        row[Loans.remainingAmount] = payload.getDecimal("remainingAmount")
        row[Loans.periods] = payload.getInt("periods")
        row[Loans.paidPeriods] = payload.getInt("paidPeriods")
        row[Loans.monthlyPayment] = payload.getDecimal("monthlyPayment")
        row[Loans.dueDate] = payload.getInt("dueDate")
        row[Loans.status] = payload.getString("status")
        row[Loans.matchKeywords] = payload.getRawNullable("matchKeywords")
        row[Loans.createdAt] = payload.getDateTime("createdAt")
        row[Loans.updatedAt] = payload.getDateTime("updatedAt")
    }

private fun upsertSavingsGoal(payload: JsonObject) = upsertById(SavingsGoals, SavingsGoals.id, payload.getString("id")) { row ->
        row[SavingsGoals.userId] = payload.getString("userId")
        row[SavingsGoals.accountId] = payload.getString("accountId")
        row[SavingsGoals.name] = payload.getString("name")
        row[SavingsGoals.targetAmount] = payload.getDecimal("targetAmount")
        row[SavingsGoals.currentAmount] = payload.getDecimal("currentAmount")
        row[SavingsGoals.deadline] = payload.getNullableDateTime("deadline")
        row[SavingsGoals.type] = payload.getString("type")
        row[SavingsGoals.status] = payload.getString("status")
        row[SavingsGoals.depositType] = payload.getString("depositType")
        row[SavingsGoals.planConfig] = payload.getRawNullable("planConfig")
        row[SavingsGoals.createdAt] = payload.getDateTime("createdAt")
        row[SavingsGoals.updatedAt] = payload.getDateTime("updatedAt")
    }

private fun upsertSavingsPlan(payload: JsonObject) = upsertById(SavingsPlans, SavingsPlans.id, payload.getString("id")) { row ->
        row[SavingsPlans.goalId] = payload.getString("goalId")
        row[SavingsPlans.amount] = payload.getDecimal("amount")
        row[SavingsPlans.status] = payload.getString("status")
        row[SavingsPlans.month] = payload.getString("month")
        row[SavingsPlans.createdAt] = payload.getDateTime("createdAt")
        row[SavingsPlans.updatedAt] = payload.getDateTime("updatedAt")
        row[SavingsPlans.expenses] = payload.getRawNullable("expenses")
        row[SavingsPlans.remark] = payload.getNullableString("remark")
        row[SavingsPlans.salary] = payload.getNullableDecimal("salary")
        row[SavingsPlans.proofImage] = payload.getNullableString("proofImage")
    }

private fun upsertCategoryRule(payload: JsonObject) = upsertById(TransactionCategoryRules, TransactionCategoryRules.id, payload.getString("id")) { row ->
        row[TransactionCategoryRules.userId] = payload.getString("userId")
        row[TransactionCategoryRules.accountId] = payload.getString("accountId")
        row[TransactionCategoryRules.name] = payload.getNullableString("name")
        row[TransactionCategoryRules.merchant] = payload.getString("merchant")
        row[TransactionCategoryRules.merchantKey] = payload.getString("merchantKey")
        row[TransactionCategoryRules.category] = payload.getString("category")
        row[TransactionCategoryRules.description] = payload.getNullableString("description")
        row[TransactionCategoryRules.isActive] = payload.getBoolean("isActive")
        row[TransactionCategoryRules.createdAt] = payload.getDateTime("createdAt")
        row[TransactionCategoryRules.updatedAt] = payload.getDateTime("updatedAt")
    }

private fun upsertImportErrorLog(payload: JsonObject) = upsertById(ImportErrorLogs, ImportErrorLogs.id, payload.getString("id")) { row ->
        row[ImportErrorLogs.userId] = payload.getString("userId")
        row[ImportErrorLogs.accountId] = payload.getString("accountId")
        row[ImportErrorLogs.fileName] = payload.getString("fileName")
        row[ImportErrorLogs.lineNumber] = payload.getInt("lineNumber")
        row[ImportErrorLogs.rawData] = payload.getString("rawData")
        row[ImportErrorLogs.errorMessage] = payload.getString("errorMessage")
        row[ImportErrorLogs.errorType] = payload.getString("errorType")
        row[ImportErrorLogs.resolved] = payload.getBoolean("resolved")
        row[ImportErrorLogs.createdAt] = payload.getDateTime("createdAt")
    }

private fun upsertExchangeRate(payload: JsonObject) = upsertById(ExchangeRates, ExchangeRates.id, payload.getString("id")) { row ->
        row[ExchangeRates.from] = payload.getString("from")
        row[ExchangeRates.to] = payload.getString("to")
        row[ExchangeRates.rate] = payload.getDecimal("rate")
        row[ExchangeRates.updatedAt] = payload.getDateTime("updatedAt")
    }

private fun upsertThemeConfig(payload: JsonObject) = upsertById(ThemeConfigs, ThemeConfigs.id, payload.getString("id")) { row ->
        row[ThemeConfigs.userId] = payload.getString("userId")
        row[ThemeConfigs.accountId] = payload.getNullableString("accountId")
        row[ThemeConfigs.themeId] = payload.getString("themeId")
        row[ThemeConfigs.primaryColor] = payload.getNullableString("primaryColor")
        row[ThemeConfigs.radius] = payload.getNullableDouble("radius")
        row[ThemeConfigs.isDarkMode] = payload.getBoolean("isDarkMode")
        row[ThemeConfigs.chartStyle] = payload.getRawNullable("chartStyle")
        row[ThemeConfigs.createdAt] = payload.getDateTime("createdAt")
        row[ThemeConfigs.updatedAt] = payload.getDateTime("updatedAt")
    }

private fun <T : Table> upsertById(table: T, idColumn: org.jetbrains.exposed.sql.Column<String>, id: String, setter: (UpdateBuilder<*>) -> Unit) {
    val updated = table.update({ idColumn eq id }) { stmt -> setter(stmt) }
    if (updated == 0) {
        table.insert { stmt ->
            stmt[idColumn] = id
            setter(stmt)
        }
    }
}

private fun jsonObject(vararg entries: Pair<String, Any?>): String {
    val content = buildMap {
        entries.forEach { (key, value) ->
            put(
                key,
                when (value) {
                    null -> JsonNull
                    is Boolean -> JsonPrimitive(value)
                    is Int -> JsonPrimitive(value)
                    is Long -> JsonPrimitive(value)
                    is Double -> JsonPrimitive(value)
                    is Float -> JsonPrimitive(value)
                    is BigDecimal -> JsonPrimitive(value)
                    else -> JsonPrimitive(value.toString())
                },
            )
        }
    }
    return JsonObject(content).toString()
}

private fun JsonObject.getString(key: String) = getValue(key).jsonPrimitive.content
private fun JsonObject.getNullableString(key: String) = this[key]?.jsonPrimitive?.contentOrNull
private fun JsonObject.getBoolean(key: String) = getValue(key).jsonPrimitive.boolean
private fun JsonObject.getInt(key: String) = getValue(key).jsonPrimitive.int
private fun JsonObject.getDecimal(key: String) = getValue(key).jsonPrimitive.content.toBigDecimal()
private fun JsonObject.getNullableDecimal(key: String) = this[key]?.jsonPrimitive?.contentOrNull?.toBigDecimalOrNull()
private fun JsonObject.getNullableDouble(key: String) = this[key]?.jsonPrimitive?.doubleOrNull
private fun JsonObject.getRawNullable(key: String) = this[key]?.takeUnless { it is JsonNull }?.toString()
private fun JsonObject.getDateTime(key: String) = parseDateTime(getString(key))
private fun JsonObject.getNullableDateTime(key: String) = getNullableString(key)?.let { parseDateTime(it) }

private fun parseDateTime(value: String): LocalDateTime {
    val normalized = value.trim().removeSuffix("Z").replace("T", " ")
    return when (normalized.length) {
        10 -> LocalDate.parse(normalized).atStartOfDay()
        in 19..Int.MAX_VALUE -> LocalDateTime.parse(normalized.substring(0, 19), dateTimeFormatter)
        else -> error("Unsupported datetime format: $value")
    }
}

private fun formatDateTime(value: LocalDateTime) = value.format(dateTimeFormatter)
