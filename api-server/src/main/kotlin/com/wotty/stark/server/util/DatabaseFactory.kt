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
import org.jetbrains.exposed.sql.SortOrder
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.Transaction
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.greaterEq
import org.jetbrains.exposed.sql.SqlExpressionBuilder.inList
import org.jetbrains.exposed.sql.SqlExpressionBuilder.inSubQuery
import org.jetbrains.exposed.sql.SqlExpressionBuilder.less
import org.jetbrains.exposed.sql.deleteWhere
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.javatime.datetime
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.statements.UpdateBuilder
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import kotlinx.datetime.Clock
import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.UUID

private val json = Json { ignoreUnknownKeys = true }
private val dateTimeFormatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")
private const val REGISTRATION_ENABLED_SETTING = "registration-enabled"

internal data class DatabaseSettings(
    val jdbcUrl: String,
    val username: String,
    val password: String,
)

internal data class ReportingMonthRange(
    val start: LocalDateTime,
    val endExclusive: LocalDateTime,
)

class AccessDeniedException(message: String = "You do not have access to this resource") : RuntimeException(message)
class RegistrationDisabledException : RuntimeException("Registration is disabled")

data class AuthUser(
    val id: String,
    val email: String,
    val password: String,
    val name: String?,
    val defaultAccountId: String?,
    val role: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
)

internal fun reportingMonthRange(month: String): ReportingMonthRange {
    require(Regex("^\\d{4}-(0[1-9]|1[0-2])$").matches(month)) { "Invalid reporting month" }
    val start = LocalDate.parse("$month-01").atStartOfDay()
    return ReportingMonthRange(start = start, endExclusive = start.plusMonths(1))
}

internal fun loadDatabaseSettings(
    environment: Map<String, String> = System.getenv(),
): DatabaseSettings {
    fun value(key: String): String? = environment[key]?.trim()?.takeIf(String::isNotEmpty)

    return DatabaseSettings(
        jdbcUrl = value("DATABASE_URL") ?: error("Missing database setting: DATABASE_URL"),
        username = value("DB_USER") ?: "root",
        password = value("DB_PASSWORD") ?: error("Missing database setting: DB_PASSWORD"),
    )
}

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

/** Small persisted flags for authentication behaviour. */
object AuthSettings : Table("authsetting") {
    val settingKey = varchar("settingKey", 64)
    val settingValue = varchar("settingValue", 64)
    val updatedAt = datetime("updatedAt")

    override val primaryKey = PrimaryKey(settingKey)
}

object Accounts : Table("account") {
    val id = varchar("id", 191)
    val name = varchar("name", 191)
    val ownerId = varchar("ownerId", 191).index("Account_ownerId_idx")
    // Nullable so existing account tables can be upgraded without a data rewrite.
    val openingBalance = decimal("openingBalance", 65, 30).nullable()
    val openingBalanceDate = datetime("openingBalanceDate").nullable()
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
    val actualAmount = decimal("actualAmount", 65, 30).nullable()
    val actualDate = datetime("actualDate").nullable()

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
    val merchant = text("merchant").nullable()
    val date = datetime("date")
    val description = text("description").nullable()
    val orderId = varchar("orderId", 191).nullable()
    val paymentMethod = varchar("paymentMethod", 191).nullable()
    val status = varchar("status", 191).nullable()
    val loanId = varchar("loanId", 191).nullable()
    val remarkCategory = varchar("remarkCategory", 191).nullable()
    val createdAt = datetime("createdAt")
    val updatedAt = datetime("updatedAt")

    init {
        // Monthly reports filter by both the selected account and date range.
        index("Transaction_accountId_date_idx", false, accountId, date)
    }

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

data class TransactionImportFailure(
    val lineNumber: Int,
    val rawData: String,
    val errorMessage: String,
    val errorType: String,
)

data class TransactionImportResult(
    val imported: Int,
    val skipped: Int,
    val errors: Int,
    val failedRows: List<TransactionImportFailure>,
    val loanRepayments: Int,
    val loanRepaymentAmount: Double,
)

data class LoanRepaymentClassificationResult(
    val applied: Int,
    val amount: Double,
    val skipped: Int,
)

object DatabaseFactory {
    private fun environmentInt(name: String, default: Int, minimum: Int, maximum: Int): Int =
        System.getenv(name)?.toIntOrNull()?.coerceIn(minimum, maximum) ?: default

    private val dataSource by lazy {
        val settings = loadDatabaseSettings()
        val maximumPoolSize = environmentInt("DB_POOL_MAX_SIZE", default = 10, minimum = 1, maximum = 50)
        val minimumIdle = environmentInt("DB_POOL_MIN_IDLE", default = 1, minimum = 0, maximum = maximumPoolSize)
        val config = HikariConfig().apply {
            jdbcUrl = settings.jdbcUrl
            driverClassName = "com.mysql.cj.jdbc.Driver"
            username = settings.username
            password = settings.password
            // 统一 UTF-8，避免中文/emoji 写入被错编成乱码
            jdbcUrl = jdbcUrl.let { url -> if (url.contains("?")) url else "$url?useUnicode=true&characterEncoding=UTF-8" }
            this.maximumPoolSize = maximumPoolSize
            // API 启动时只需一个连接；Hikari 会按请求逐步扩容，避免一次性建立空闲连接。
            this.minimumIdle = minimumIdle
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
                AuthSettings,
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
            removeLegacySavingsDemoRecords()
        }
    }

    fun findUserById(id: String): AuthUser? = transaction {
        Users.selectAll().where { Users.id eq id }.firstOrNull()?.toAuthUser()
    }

    fun findUserByEmail(email: String): AuthUser? = transaction {
        Users.selectAll().where { Users.email eq email }.firstOrNull()?.toAuthUser()
    }

    fun isRegistrationEnabled(): Boolean = transaction {
        isRegistrationEnabledInTransaction()
    }

    fun setRegistrationEnabled(enabled: Boolean) = transaction {
        val now = LocalDateTime.now()
        val updated = AuthSettings.update({ AuthSettings.settingKey eq REGISTRATION_ENABLED_SETTING }) {
            it[AuthSettings.settingValue] = enabled.toString()
            it[AuthSettings.updatedAt] = now
        }
        if (updated == 0) {
            AuthSettings.insert {
                it[AuthSettings.settingKey] = REGISTRATION_ENABLED_SETTING
                it[AuthSettings.settingValue] = enabled.toString()
                it[AuthSettings.updatedAt] = now
            }
        }
    }

    fun registerUser(email: String, passwordHash: String, name: String?): AuthUser = transaction {
        if (!isRegistrationEnabledInTransaction()) throw RegistrationDisabledException()
        if (Users.selectAll().where { Users.email eq email }.count() > 0) {
            error("An account with this email already exists")
        }
        val now = LocalDateTime.now()
        val id = "user-${UUID.randomUUID()}"
        val accountId = "account-${UUID.randomUUID()}"

        Users.insert {
            it[Users.id] = id
            it[Users.email] = email
            it[Users.password] = passwordHash
            it[Users.name] = name?.trim()?.takeIf(String::isNotBlank)
            it[Users.defaultAccountId] = accountId
            it[Users.role] = "USER"
            it[Users.createdAt] = now
            it[Users.updatedAt] = now
        }

        Accounts.insert {
            it[Accounts.id] = accountId
            it[Accounts.name] = "默认账本"
            it[Accounts.ownerId] = id
            it[Accounts.openingBalance] = BigDecimal.ZERO
            it[Accounts.createdAt] = now
            it[Accounts.updatedAt] = now
        }
        findUserByIdInTransaction(id) ?: error("Failed to create user")
    }

    private fun isRegistrationEnabledInTransaction(): Boolean = AuthSettings
        .selectAll()
        .where { AuthSettings.settingKey eq REGISTRATION_ENABLED_SETTING }
        .firstOrNull()
        ?.get(AuthSettings.settingValue)
        ?.equals("false", ignoreCase = true) != true

    fun updatePassword(userId: String, passwordHash: String) = transaction {
        Users.update({ Users.id eq userId }) {
            it[Users.password] = passwordHash
            it[Users.updatedAt] = LocalDateTime.now()
        }
    }

    fun accountBelongsToUser(userId: String, accountId: String): Boolean = transaction {
        Accounts.selectAll().where { (Accounts.id eq accountId) and (Accounts.ownerId eq userId) }.count() > 0
    }

    fun entityBelongsToUser(userId: String, entityType: String, id: String): Boolean = transaction {
        when (entityType) {
            "users" -> Users.selectAll().where { (Users.id eq id) and (Users.id eq userId) }.count() > 0
            "accounts" -> Accounts.selectAll().where { (Accounts.id eq id) and (Accounts.ownerId eq userId) }.count() > 0
            "transactions" -> Transactions.selectAll().where { (Transactions.id eq id) and (Transactions.accountId inSubQuery ownedAccountIds(userId)) }.count() > 0
            "assets" -> Assets.selectAll().where { (Assets.id eq id) and (Assets.accountId inSubQuery ownedAccountIds(userId)) }.count() > 0
            "budgets" -> Budgets.selectAll().where { (Budgets.id eq id) and (Budgets.accountId inSubQuery ownedAccountIds(userId)) }.count() > 0
            "loans" -> Loans.selectAll().where { (Loans.id eq id) and (Loans.accountId inSubQuery ownedAccountIds(userId)) }.count() > 0
            "savingsGoals" -> SavingsGoals.selectAll().where { (SavingsGoals.id eq id) and (SavingsGoals.accountId inSubQuery ownedAccountIds(userId)) }.count() > 0
            "savingsPlans" -> SavingsPlans.selectAll().where {
                (SavingsPlans.id eq id) and (SavingsPlans.goalId inSubQuery ownedGoalIds(userId))
            }.count() > 0
            "categoryRules" -> TransactionCategoryRules.selectAll().where { (TransactionCategoryRules.id eq id) and (TransactionCategoryRules.accountId inSubQuery ownedAccountIds(userId)) }.count() > 0
            "importErrorLogs" -> ImportErrorLogs.selectAll().where { (ImportErrorLogs.id eq id) and (ImportErrorLogs.accountId inSubQuery ownedAccountIds(userId)) }.count() > 0
            "themeConfigs" -> ThemeConfigs.selectAll().where { (ThemeConfigs.id eq id) and (ThemeConfigs.userId eq userId) }.count() > 0
            else -> false
        }
    }

    private fun ownedAccountIds(userId: String) = Accounts
        .select(Accounts.id)
        .where { Accounts.ownerId eq userId }

    private fun ownedGoalIds(userId: String) = SavingsGoals
        .select(SavingsGoals.id)
        .where { SavingsGoals.accountId inSubQuery ownedAccountIds(userId) }

    private fun entityBelongsToUserInTransaction(userId: String, entityType: String, id: String): Boolean = when (entityType) {
        "users" -> Users.selectAll().where { (Users.id eq id) and (Users.id eq userId) }.count() > 0
        "accounts" -> Accounts.selectAll().where { (Accounts.id eq id) and (Accounts.ownerId eq userId) }.count() > 0
        "transactions" -> Transactions.selectAll().where { (Transactions.id eq id) and (Transactions.accountId inSubQuery ownedAccountIds(userId)) }.count() > 0
        "assets" -> Assets.selectAll().where { (Assets.id eq id) and (Assets.accountId inSubQuery ownedAccountIds(userId)) }.count() > 0
        "budgets" -> Budgets.selectAll().where { (Budgets.id eq id) and (Budgets.accountId inSubQuery ownedAccountIds(userId)) }.count() > 0
        "loans" -> Loans.selectAll().where { (Loans.id eq id) and (Loans.accountId inSubQuery ownedAccountIds(userId)) }.count() > 0
        "savingsGoals" -> SavingsGoals.selectAll().where { (SavingsGoals.id eq id) and (SavingsGoals.accountId inSubQuery ownedAccountIds(userId)) }.count() > 0
        "savingsPlans" -> SavingsPlans.selectAll().where { (SavingsPlans.id eq id) and (SavingsPlans.goalId inSubQuery ownedGoalIds(userId)) }.count() > 0
        "categoryRules" -> TransactionCategoryRules.selectAll().where { (TransactionCategoryRules.id eq id) and (TransactionCategoryRules.accountId inSubQuery ownedAccountIds(userId)) }.count() > 0
        "importErrorLogs" -> ImportErrorLogs.selectAll().where { (ImportErrorLogs.id eq id) and (ImportErrorLogs.accountId inSubQuery ownedAccountIds(userId)) }.count() > 0
        "themeConfigs" -> ThemeConfigs.selectAll().where { (ThemeConfigs.id eq id) and (ThemeConfigs.userId eq userId) }.count() > 0
        else -> false
    }

    private fun assertPayloadAccess(userId: String, entityType: String, payload: JsonObject) {
        val id = payload.getNullableString("id") ?: throw AccessDeniedException("Missing entity id")
        val exists = entityBelongsToUserInTransaction(userId, entityType, id)
        if (!exists && entityExistsInTransaction(entityType, id)) {
            throw AccessDeniedException()
        }
        when (entityType) {
            "users" -> if (id != userId) throw AccessDeniedException()
            "accounts" -> {
                val ownerId = payload.getNullableString("ownerId")
                if (!exists && ownerId != userId) throw AccessDeniedException()
            }
            "savingsPlans" -> {
                val goalId = payload.getNullableString("goalId")
        if (goalId == null || (!exists && SavingsGoals.selectAll().where {
                        (SavingsGoals.id eq goalId) and (SavingsGoals.accountId inSubQuery ownedAccountIds(userId))
                    }.count() == 0L)) throw AccessDeniedException()
            }
            "themeConfigs" -> if (payload.getNullableString("userId") != userId && !exists) throw AccessDeniedException()
            "exchangeRates" -> throw AccessDeniedException()
            else -> {
                val accountId = payload.getNullableString("accountId")
                if (accountId == null || (!exists && Accounts.selectAll().where {
                        (Accounts.id eq accountId) and (Accounts.ownerId eq userId)
                    }.count() == 0L)) throw AccessDeniedException()
            }
        }
    }

    private fun entityExistsInTransaction(entityType: String, id: String): Boolean = when (entityType) {
        "users" -> Users.selectAll().where { Users.id eq id }.count() > 0
        "accounts" -> Accounts.selectAll().where { Accounts.id eq id }.count() > 0
        "transactions" -> Transactions.selectAll().where { Transactions.id eq id }.count() > 0
        "assets" -> Assets.selectAll().where { Assets.id eq id }.count() > 0
        "budgets" -> Budgets.selectAll().where { Budgets.id eq id }.count() > 0
        "loans" -> Loans.selectAll().where { Loans.id eq id }.count() > 0
        "savingsGoals" -> SavingsGoals.selectAll().where { SavingsGoals.id eq id }.count() > 0
        "savingsPlans" -> SavingsPlans.selectAll().where { SavingsPlans.id eq id }.count() > 0
        "categoryRules" -> TransactionCategoryRules.selectAll().where { TransactionCategoryRules.id eq id }.count() > 0
        "importErrorLogs" -> ImportErrorLogs.selectAll().where { ImportErrorLogs.id eq id }.count() > 0
        "themeConfigs" -> ThemeConfigs.selectAll().where { ThemeConfigs.id eq id }.count() > 0
        else -> false
    }

    private fun findUserByIdInTransaction(id: String): AuthUser? = Users.selectAll()
        .where { Users.id eq id }
        .firstOrNull()
        ?.toAuthUser()

    private fun removeLegacySavingsDemoRecords() {
        val legacyGoalIds = listOf("goal-travel", "goal-emergency", "goal-demo-travel", "goal-demo-emergency")
        SavingsPlans.deleteWhere { SavingsPlans.goalId inList legacyGoalIds }
        SavingsGoals.deleteWhere { SavingsGoals.id inList legacyGoalIds }
    }

    /** 数据库是否已连接并可用（供健康检查诊断，未配 DATABASE_URL 时为 false） */
    fun isReady(): Boolean = runCatching { transaction { exec("SELECT 1") } }.isSuccess

    fun listRecords(accountId: String, userId: String): List<SyncRecordRow> = transaction {
        val ownsAccount = Accounts.selectAll().where { (Accounts.id eq accountId) and (Accounts.ownerId eq userId) }.count() > 0
        if (!ownsAccount) return@transaction emptyList()
        buildList {
            addAll(Users.selectAll().where { Users.id eq userId }.map { it.toUserRecord() })
            addAll(Accounts.selectAll().where { Accounts.id eq accountId }.map { it.toAccountRecord() })
            addAll(Transactions.selectAll().where { Transactions.accountId eq accountId }.map { it.toTransactionRecord() })
            addAll(Assets.selectAll().where { Assets.accountId eq accountId }.map { it.toAssetRecord() })
            addAll(Budgets.selectAll().where { Budgets.accountId eq accountId }.map { it.toBudgetRecord() })
            addAll(Loans.selectAll().where { Loans.accountId eq accountId }.map { it.toLoanRecord() })
            val savingsGoalRows = SavingsGoals.selectAll().where { SavingsGoals.accountId eq accountId }.toList()
            addAll(savingsGoalRows.map { it.toSavingsGoalRecord() })
            val goalIds = savingsGoalRows.map { it[SavingsGoals.id] }
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

    fun upsertRecord(record: SyncRecordRow, currentUserId: String? = null) {
        val payload = json.parseToJsonElement(record.payload).jsonObject
        if (payload["__deleted"]?.jsonPrimitive?.booleanOrNull == true) {
            deleteEntity(record.entityType, record.id, currentUserId)
            return
        }
        transaction {
            if (currentUserId != null) assertPayloadAccess(currentUserId, record.entityType, payload)
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

    fun deleteEntity(entityType: String, id: String, currentUserId: String? = null) = transaction {
        if (currentUserId != null && !entityBelongsToUserInTransaction(currentUserId, entityType, id)) {
            throw AccessDeniedException()
        }
        when (entityType) {
            "users" -> Users.deleteWhere { Users.id eq id }
            "accounts" -> Accounts.deleteWhere { Accounts.id eq id }
            "transactions" -> Transactions.deleteWhere { Transactions.id eq id }
            "assets" -> Assets.deleteWhere { Assets.id eq id }
            "budgets" -> Budgets.deleteWhere { Budgets.id eq id }
            "loans" -> Loans.deleteWhere { Loans.id eq id }
            "savingsGoals" -> {
                SavingsPlans.deleteWhere { SavingsPlans.goalId eq id }
                SavingsGoals.deleteWhere { SavingsGoals.id eq id }
            }
            "savingsPlans" -> SavingsPlans.deleteWhere { SavingsPlans.id eq id }
            "categoryRules" -> TransactionCategoryRules.deleteWhere { TransactionCategoryRules.id eq id }
            "importErrorLogs" -> ImportErrorLogs.deleteWhere { ImportErrorLogs.id eq id }
            "exchangeRates" -> ExchangeRates.deleteWhere { ExchangeRates.id eq id }
            "themeConfigs" -> ThemeConfigs.deleteWhere { ThemeConfigs.id eq id }
        }
    }

    // —— REST 接口辅助：写/删走通用记录，读复用 toXRecord 序列化 ——
    private fun SyncRecordRow.toPayloadJson(): JsonObject = json.parseToJsonElement(payload).jsonObject

    fun upsertEntityPayload(entityType: String, payload: JsonObject, currentUserId: String? = null) {
        val normalizedPayload = if (currentUserId == null) payload else normalizePayloadForUser(entityType, payload, currentUserId)
        val updatedAt = payload.getNullableString("updatedAt")
            ?: payload.getNullableString("createdAt")
            ?: Clock.System.now().toString().replace("T", " ").replace("Z", "")
        upsertRecord(
            SyncRecordRow(
                id = normalizedPayload.getString("id"),
                entityType = entityType,
                accountId = normalizedPayload.getNullableString("accountId"),
                userId = normalizedPayload.getNullableString("userId"),
                payload = normalizedPayload.toString(),
                updatedAt = updatedAt,
            ),
            currentUserId = currentUserId,
        )
    }

    private fun normalizePayloadForUser(entityType: String, payload: JsonObject, userId: String): JsonObject {
        val values = payload.toMutableMap()
        when (entityType) {
            "accounts" -> values["ownerId"] = JsonPrimitive(userId)
            "users", "themeConfigs" -> values["userId"] = JsonPrimitive(userId)
            "transactions", "assets", "budgets", "loans", "savingsGoals", "categoryRules", "importErrorLogs" -> {
                values["userId"] = JsonPrimitive(userId)
            }
        }
        return JsonObject(values)
    }

    /**
     * 导入流水与贷款冲销必须在同一事务完成：只有本次真正新增的关联还款，才会减少贷款余额。
     */
    fun importTransactionsAndApplyLoanRepayments(
        items: List<JsonObject>,
        accountId: String,
        userId: String,
    ): TransactionImportResult = transaction {
        val existingOrderIds = Transactions.selectAll()
            .where { Transactions.accountId eq accountId }
            .mapNotNull { it[Transactions.orderId] }
            .toMutableSet()
        var imported = 0
        var skipped = 0
        var errors = 0
        var loanRepayments = 0
        var loanRepaymentAmount = BigDecimal.ZERO
        val failures = mutableListOf<TransactionImportFailure>()

        items.forEachIndexed { index, payload ->
            runCatching {
                val orderId = payload.getNullableString("orderId")
                if (!orderId.isNullOrBlank() && orderId in existingOrderIds) {
                    skipped += 1
                } else {
                    val normalizedValues = payload.toMutableMap()
                    normalizedValues["accountId"] = JsonPrimitive(accountId)
                    normalizedValues["userId"] = JsonPrimitive(userId)
                    val normalizedPayload = JsonObject(normalizedValues)
                    validateImportedLoanRepayment(normalizedPayload, accountId, userId)
                    upsertTransaction(normalizedPayload)
                    val repaymentAmount = applyImportedLoanRepayment(normalizedPayload, accountId, userId)
                    if (!orderId.isNullOrBlank()) existingOrderIds += orderId
                    imported += 1
                    if (repaymentAmount > BigDecimal.ZERO) {
                        loanRepayments += 1
                        loanRepaymentAmount += repaymentAmount
                    }
                }
            }.onFailure { cause ->
                errors += 1
                failures += TransactionImportFailure(
                    lineNumber = index + 1,
                    rawData = payload.toString(),
                    errorMessage = cause.message ?: "无法保存该行",
                    errorType = "IMPORT",
                )
            }
        }
        TransactionImportResult(
            imported = imported,
            skipped = skipped,
            errors = errors,
            failedRows = failures,
            loanRepayments = loanRepayments,
            loanRepaymentAmount = loanRepaymentAmount.toDouble(),
        )
    }

    /**
     * 将已存在且未关联贷款的账单更新为还款流水，并在同一事务内冲销对应贷款。
     */
    fun applyLoanRepaymentClassifications(
        items: List<JsonObject>,
        accountId: String,
        userId: String,
    ): LoanRepaymentClassificationResult = transaction {
        var applied = 0
        var amount = BigDecimal.ZERO
        var skipped = 0
        items.forEach { payload ->
            val transactionId = payload.getNullableString("id")
            val loanId = payload.getNullableString("loanId")
            if (transactionId.isNullOrBlank() || loanId.isNullOrBlank() || payload.getNullableString("type") != "REPAYMENT") {
                skipped += 1
                return@forEach
            }
            val current = Transactions.selectAll().where {
                (Transactions.id eq transactionId) and (Transactions.accountId eq accountId) and (Transactions.userId eq userId)
            }.firstOrNull()
            if (current == null || current[Transactions.loanId] != null) {
                skipped += 1
                return@forEach
            }
            val loan = Loans.selectAll().where {
                (Loans.id eq loanId) and (Loans.accountId eq accountId) and (Loans.userId eq userId)
            }.firstOrNull()
            if (loan == null || loan[Loans.status] == "PAID_OFF" || loan[Loans.remainingAmount] <= BigDecimal.ZERO) {
                skipped += 1
                return@forEach
            }

            val normalizedValues = payload.toMutableMap()
            normalizedValues["accountId"] = JsonPrimitive(accountId)
            normalizedValues["userId"] = JsonPrimitive(userId)
            val normalizedPayload = JsonObject(normalizedValues)
            validateImportedLoanRepayment(normalizedPayload, accountId, userId)
            upsertTransaction(normalizedPayload)
            val repaymentAmount = applyImportedLoanRepayment(normalizedPayload, accountId, userId)
            if (repaymentAmount > BigDecimal.ZERO) {
                applied += 1
                amount += repaymentAmount
            } else {
                skipped += 1
            }
        }
        LoanRepaymentClassificationResult(applied, amount.toDouble(), skipped)
    }

    fun listUsersRest(userId: String): List<JsonObject> = transaction {
        Users.selectAll().where { Users.id eq userId }.map { it.toUserRecord().toPayloadJson() }
    }

    fun listAccountsRest(userId: String): List<JsonObject> = transaction {
        Accounts.selectAll().where { Accounts.ownerId eq userId }.map { it.toAccountRecord().toPayloadJson() }
    }

    fun getAccountRest(id: String, userId: String): JsonObject? = transaction {
        Accounts.selectAll().where { (Accounts.id eq id) and (Accounts.ownerId eq userId) }.firstOrNull()?.toAccountRecord()?.toPayloadJson()
    }

    fun listTransactionsRest(accountId: String, page: Int, pageSize: Int, month: String? = null): List<JsonObject> = transaction {
        val query = Transactions.selectAll().where {
            if (month == null) {
                Transactions.accountId eq accountId
            } else {
                val range = reportingMonthRange(month)
                (Transactions.accountId eq accountId) and
                    (Transactions.date greaterEq range.start) and
                    (Transactions.date less range.endExclusive)
            }
        }
        query
            .orderBy(
                Transactions.date to SortOrder.DESC,
                Transactions.id to SortOrder.DESC,
            )
            .limit(pageSize.coerceAtLeast(1))
            .offset((page - 1).coerceAtLeast(0).toLong() * pageSize)
            .map { it.toTransactionRecord().toPayloadJson() }
    }

    fun listTransactionMonthsRest(accountId: String): List<String> = transaction {
        Transactions.select(Transactions.date)
            .where { Transactions.accountId eq accountId }
            .map { formatDateTime(it[Transactions.date]).take(7) }
            .distinct()
            .sortedDescending()
    }

    fun getTransactionRest(id: String, userId: String): JsonObject? = transaction {
        Transactions.selectAll().where { (Transactions.id eq id) and (Transactions.accountId inSubQuery ownedAccountIds(userId)) }.firstOrNull()?.toTransactionRecord()?.toPayloadJson()
    }

    fun listAssetsRest(accountId: String): List<JsonObject> = transaction {
        Assets.selectAll().where { Assets.accountId eq accountId }.map { it.toAssetRecord().toPayloadJson() }
    }

    fun listBudgetsRest(accountId: String): List<JsonObject> = transaction {
        Budgets.selectAll().where { Budgets.accountId eq accountId }.map { it.toBudgetRecord().toPayloadJson() }
    }

    fun listLoansRest(accountId: String): List<JsonObject> = transaction {
        Loans.selectAll().where { Loans.accountId eq accountId }.map { it.toLoanRecord().toPayloadJson() }
    }

    fun listSavingsGoalsRest(accountId: String): List<JsonObject> = transaction {
        SavingsGoals.selectAll().where { SavingsGoals.accountId eq accountId }.map { it.toSavingsGoalRecord().toPayloadJson() }
    }

    fun listSavingsPlansRest(goalId: String, userId: String): List<JsonObject> = transaction {
        SavingsPlans.selectAll().where {
            (SavingsPlans.goalId eq goalId) and (SavingsPlans.goalId inSubQuery ownedGoalIds(userId))
        }.map { it.toSavingsPlanRecord().toPayloadJson() }
    }

    fun listCategoryRulesRest(accountId: String): List<JsonObject> = transaction {
        TransactionCategoryRules.selectAll().where { TransactionCategoryRules.accountId eq accountId }.map { it.toCategoryRuleRecord().toPayloadJson() }
    }

    fun listImportErrorLogsRest(accountId: String): List<JsonObject> = transaction {
        ImportErrorLogs.selectAll().where { ImportErrorLogs.accountId eq accountId }.map { it.toImportErrorLogRecord().toPayloadJson() }
    }

    fun listExchangeRatesRest(): List<JsonObject> = transaction {
        ExchangeRates.selectAll().map { it.toExchangeRateRecord().toPayloadJson() }
    }

    fun getThemeConfigRest(userId: String): JsonObject? = transaction {
        ThemeConfigs.selectAll().where { ThemeConfigs.userId eq userId }.firstOrNull()?.toThemeConfigRecord()?.toPayloadJson()
    }
}

private fun ResultRow.toAuthUser() = AuthUser(
    id = this[Users.id],
    email = this[Users.email],
    password = this[Users.password],
    name = this[Users.name],
    defaultAccountId = this[Users.defaultAccountId],
    role = this[Users.role],
    createdAt = this[Users.createdAt],
    updatedAt = this[Users.updatedAt],
)

private fun ResultRow.toUserRecord() = SyncRecordRow(
    id = this[Users.id],
    entityType = "users",
    accountId = this[Users.defaultAccountId],
    userId = this[Users.id],
    payload = jsonObject(
        "id" to this[Users.id],
        "email" to this[Users.email],
        // Password hashes must never be sent through the sync API.
        "password" to "",
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
        "openingBalance" to this[Accounts.openingBalance],
        "openingBalanceDate" to this[Accounts.openingBalanceDate]?.let(::formatDateTime),
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
        "remarkCategory" to this[Transactions.remarkCategory],
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
        "actualAmount" to this[SavingsPlans.actualAmount]?.toDouble(),
        "actualDate" to this[SavingsPlans.actualDate]?.let(::formatDateTime),
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
        row[Accounts.openingBalance] = payload.getNullableDecimal("openingBalance")
        row[Accounts.openingBalanceDate] = payload.getNullableDateTime("openingBalanceDate")
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
        row[Transactions.remarkCategory] = payload.getNullableString("remarkCategory")
        row[Transactions.createdAt] = payload.getDateTime("createdAt")
        row[Transactions.updatedAt] = payload.getDateTime("updatedAt")
}

private fun validateImportedLoanRepayment(payload: JsonObject, accountId: String, userId: String) {
    if (payload.getString("type") != "REPAYMENT") return
    val loanId = payload.getNullableString("loanId") ?: return
    require(payload.getDecimal("amount") > BigDecimal.ZERO) { "还款金额必须大于 0" }
    val belongsToCurrentUser = Loans.selectAll().where {
        (Loans.id eq loanId) and (Loans.accountId eq accountId) and (Loans.userId eq userId)
    }.count() > 0
    require(belongsToCurrentUser) { "关联贷款不存在或无权访问" }
}

/** 在当前数据库事务内更新一笔已关联贷款的还款；非关联流水返回 0。 */
private fun applyImportedLoanRepayment(payload: JsonObject, accountId: String, userId: String): BigDecimal {
    if (payload.getString("type") != "REPAYMENT") return BigDecimal.ZERO
    val loanId = payload.getNullableString("loanId") ?: return BigDecimal.ZERO
    val loan = Loans.selectAll().where {
        (Loans.id eq loanId) and (Loans.accountId eq accountId) and (Loans.userId eq userId)
    }.firstOrNull() ?: throw IllegalArgumentException("关联贷款不存在或无权访问")
    val amount = payload.getDecimal("amount")
    if (amount <= BigDecimal.ZERO) return BigDecimal.ZERO
    val remainingAmount = loan[Loans.remainingAmount]
    if (remainingAmount <= BigDecimal.ZERO || loan[Loans.status] == "PAID_OFF") return BigDecimal.ZERO
    val reducedAmount = amount.min(remainingAmount)
    val monthlyPayment = loan[Loans.monthlyPayment]
    val paidPeriods = if (monthlyPayment > BigDecimal.ZERO && amount >= monthlyPayment) {
        minOf(loan[Loans.periods], loan[Loans.paidPeriods] + 1)
    } else {
        loan[Loans.paidPeriods]
    }
    val nextRemainingAmount = remainingAmount - reducedAmount
    Loans.update({ Loans.id eq loanId }) { row ->
        row[Loans.remainingAmount] = nextRemainingAmount
        row[Loans.paidPeriods] = paidPeriods
        row[Loans.status] = if (nextRemainingAmount <= BigDecimal.ZERO) "PAID_OFF" else loan[Loans.status]
        row[Loans.updatedAt] = payload.getDateTime("updatedAt")
    }
    return reducedAmount
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
        row[SavingsPlans.actualAmount] = payload.getNullableDecimal("actualAmount")
        row[SavingsPlans.actualDate] = payload.getNullableDateTime("actualDate")
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
internal fun rawJsonStorageValue(value: JsonElement?): String? = value
    ?.takeUnless { it is JsonNull }
    ?.let { element -> (element as? JsonPrimitive)?.contentOrNull ?: element.toString() }

private fun JsonObject.getRawNullable(key: String) = rawJsonStorageValue(this[key])
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
