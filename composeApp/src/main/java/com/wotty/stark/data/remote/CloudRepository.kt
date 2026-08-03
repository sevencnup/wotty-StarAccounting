package com.wotty.stark.data.remote

import com.wotty.stark.data.model.*
import com.wotty.stark.data.repository.DataRepository
import com.wotty.stark.data.repository.ImportResult
import io.ktor.client.*
import io.ktor.client.call.*
import io.ktor.client.plugins.contentnegotiation.*
import io.ktor.client.request.*
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import kotlinx.serialization.json.Json

class CloudRepository(
    private val baseUrl: String
) : DataRepository {

    private val client = HttpClient {
        install(ContentNegotiation) {
            json(Json { ignoreUnknownKeys = true; coerceInputValues = true })
        }
    }

    suspend fun checkHealth(): Boolean {
        return runCatching {
            client.get("$baseUrl/health").status.isSuccess()
        }.getOrDefault(false)
    }

    override suspend fun getCurrentUser(): User? = client.get("$baseUrl/user/me").body()
    override suspend fun saveUser(user: User) { client.post("$baseUrl/user") { setBody(user) } }

    override suspend fun getAccounts(): List<Account> = client.get("$baseUrl/accounts").body()
    override suspend fun getAccount(id: String): Account? = client.get("$baseUrl/accounts/$id").body()
    override suspend fun saveAccount(account: Account) { client.post("$baseUrl/accounts") { setBody(account) } }
    override suspend fun deleteAccount(id: String) { client.delete("$baseUrl/accounts/$id") }

    override suspend fun getTransactions(accountId: String, page: Int, pageSize: Int): List<Transaction> =
        client.get("$baseUrl/transactions") {
            parameter("accountId", accountId)
            parameter("page", page)
            parameter("pageSize", pageSize)
        }.body()
    override suspend fun getTransaction(id: String): Transaction? = client.get("$baseUrl/transactions/$id").body()
    override suspend fun saveTransaction(t: Transaction) { client.post("$baseUrl/transactions") { setBody(t) } }
    override suspend fun deleteTransaction(id: String) { client.delete("$baseUrl/transactions/$id") }
    override suspend fun importTransactions(transactions: List<Transaction>): ImportResult =
        client.post("$baseUrl/transactions/import") { setBody(transactions) }.body()

    override suspend fun getAssets(accountId: String): List<Asset> =
        client.get("$baseUrl/assets") { parameter("accountId", accountId) }.body()
    override suspend fun saveAsset(asset: Asset) { client.post("$baseUrl/assets") { setBody(asset) } }
    override suspend fun deleteAsset(id: String) { client.delete("$baseUrl/assets/$id") }

    override suspend fun getBudgets(accountId: String): List<Budget> =
        client.get("$baseUrl/budgets") { parameter("accountId", accountId) }.body()
    override suspend fun saveBudget(budget: Budget) { client.post("$baseUrl/budgets") { setBody(budget) } }
    override suspend fun deleteBudget(id: String) { client.delete("$baseUrl/budgets/$id") }

    override suspend fun getLoans(accountId: String): List<Loan> =
        client.get("$baseUrl/loans") { parameter("accountId", accountId) }.body()
    override suspend fun saveLoan(loan: Loan) { client.post("$baseUrl/loans") { setBody(loan) } }
    override suspend fun deleteLoan(id: String) { client.delete("$baseUrl/loans/$id") }

    override suspend fun getSavingsGoals(accountId: String): List<SavingsGoal> =
        client.get("$baseUrl/savings-goals") { parameter("accountId", accountId) }.body()
    override suspend fun saveSavingsGoal(goal: SavingsGoal) { client.post("$baseUrl/savings-goals") { setBody(goal) } }
    override suspend fun deleteSavingsGoal(id: String) { client.delete("$baseUrl/savings-goals/$id") }
    override suspend fun getSavingsPlans(goalId: String): List<SavingsPlan> =
        client.get("$baseUrl/savings-plans") { parameter("goalId", goalId) }.body()
    override suspend fun saveSavingsPlan(plan: SavingsPlan) { client.post("$baseUrl/savings-plans") { setBody(plan) } }

    override suspend fun getCategoryRules(accountId: String): List<CategoryRule> =
        client.get("$baseUrl/category-rules") { parameter("accountId", accountId) }.body()
    override suspend fun saveCategoryRule(rule: CategoryRule) { client.post("$baseUrl/category-rules") { setBody(rule) } }

    override suspend fun getImportErrorLogs(accountId: String): List<ImportErrorLog> =
        client.get("$baseUrl/import-errors") { parameter("accountId", accountId) }.body()
    override suspend fun saveImportErrorLog(log: ImportErrorLog) { client.post("$baseUrl/import-errors") { setBody(log) } }

    override suspend fun getExchangeRates(): List<ExchangeRate> = client.get("$baseUrl/exchange-rates").body()

    override suspend fun getThemeConfig(userId: String): ThemeConfig? =
        client.get("$baseUrl/theme-config/$userId").body()
    override suspend fun saveThemeConfig(config: ThemeConfig) {
        client.put("$baseUrl/theme-config") { setBody(config) }
    }

    override suspend fun seedDemoData() {
        client.post("$baseUrl/sync/demo")
    }
}
