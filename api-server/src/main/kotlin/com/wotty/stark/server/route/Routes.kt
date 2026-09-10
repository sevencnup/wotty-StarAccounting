package com.wotty.stark.server.route

import io.ktor.http.*
import io.ktor.server.response.*
import io.ktor.server.request.*
import io.ktor.server.routing.*
import com.wotty.stark.server.util.DatabaseFactory
import com.wotty.stark.server.util.SyncRecordRow
import com.wotty.stark.server.util.reportingMonthRange
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.JsonArray
import kotlinx.serialization.json.JsonNull
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.JsonPrimitive
import kotlinx.serialization.json.contentOrNull
import kotlinx.serialization.json.jsonObject
import kotlinx.datetime.Clock

private fun JsonObject.jsonText(key: String): String? = (this[key] as? JsonPrimitive)?.contentOrNull

@Serializable
data class AppVersionResponse(
    val versionCode: Int,
    val versionName: String,
    val apkUrl: String? = null,
    val changelog: String? = null,
    val forceUpdate: Boolean = false
)

@Serializable
data class HealthResponse(val status: String, val db: Boolean)

fun Routing.appRoutes() {
    get("/api/health") {
        call.respond(HealthResponse(status = "ok", db = DatabaseFactory.isReady()))
    }

    get("/api/app/version") {
        call.respond(
            AppVersionResponse(
                versionCode = System.getenv("APP_VERSION_CODE")?.toIntOrNull() ?: 1,
                versionName = System.getenv("APP_VERSION_NAME") ?: "0.0.1",
                apkUrl = System.getenv("APP_APK_URL"),
                changelog = System.getenv("APP_CHANGELOG"),
                forceUpdate = System.getenv("APP_FORCE_UPDATE")?.equals("true", ignoreCase = true) == true
            )
        )
    }
}

fun Routing.userRoutes() {
    // GET /api/user/me - 获取当前用户
    get("/api/user/me") {
        call.respond(DatabaseFactory.listUsersRest().firstOrNull() ?: JsonNull)
    }

    // POST /api/user - 创建/保存用户
    post("/api/user") {
        val payload = call.receive<JsonElement>().jsonObject
        DatabaseFactory.upsertEntityPayload("users", payload)
        call.respond(HttpStatusCode.NoContent)
    }
}

fun Routing.accountRoutes() {
    // GET /api/accounts - 账本列表
    get("/api/accounts") {
        call.respond(DatabaseFactory.listAccountsRest())
    }

    // GET /api/accounts/{id} - 单个账本
    get("/api/accounts/{id}") {
        call.respond(DatabaseFactory.getAccountRest(call.parameters["id"] ?: "") ?: JsonNull)
    }

    // POST /api/accounts - 创建/更新账本
    post("/api/accounts") {
        val payload = call.receive<JsonElement>().jsonObject
        DatabaseFactory.upsertEntityPayload("accounts", payload)
        call.respond(HttpStatusCode.NoContent)
    }

    // DELETE /api/accounts/{id} - 删除账本
    delete("/api/accounts/{id}") {
        DatabaseFactory.deleteEntity("accounts", call.parameters["id"] ?: "")
        call.respond(HttpStatusCode.NoContent)
    }
}

fun Routing.transactionRoutes() {
    // GET /api/transactions?accountId=&month=&page=&pageSize= - 分页查询交易
    get("/api/transactions") {
        val accountId = call.request.queryParameters["accountId"] ?: "default"
        val month = call.request.queryParameters["month"]
        if (month != null && runCatching { reportingMonthRange(month) }.isFailure) {
            call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Invalid month; expected YYYY-MM"))
            return@get
        }
        val page = (call.request.queryParameters["page"]?.toIntOrNull() ?: 1).coerceAtLeast(1)
        val pageSize = (call.request.queryParameters["pageSize"]?.toIntOrNull() ?: 50).coerceIn(1, 500)
        call.respond(DatabaseFactory.listTransactionsRest(accountId, page, pageSize, month))
    }

    // GET /api/transactions/{id} - 单笔交易
    get("/api/transactions/{id}") {
        call.respond(DatabaseFactory.getTransactionRest(call.parameters["id"] ?: "") ?: JsonNull)
    }

    // POST /api/transactions - 创建/更新交易
    post("/api/transactions") {
        val payload = call.receive<JsonElement>().jsonObject
        DatabaseFactory.upsertEntityPayload("transactions", payload)
        call.respond(HttpStatusCode.NoContent)
    }

    // POST /api/transactions/import - 批量导入（按 orderId 去重）
    post("/api/transactions/import") {
        val items = call.receive<JsonArray>()
        val accountId = call.request.queryParameters["accountId"] ?: "default"
        val existing = DatabaseFactory.listTransactionOrderIds(accountId).toMutableSet()
        var imported = 0
        var skipped = 0
        var errors = 0
        items.forEach { element ->
            runCatching {
                val payload = element.jsonObject
                val orderId = payload.jsonText("orderId")
                if (!orderId.isNullOrBlank() && orderId in existing) {
                    skipped++
                } else {
                    DatabaseFactory.upsertEntityPayload("transactions", payload)
                    if (!orderId.isNullOrBlank()) existing.add(orderId)
                    imported++
                }
            }.onFailure { errors++ }
        }
        call.respond(mapOf("imported" to imported, "skipped" to skipped, "errors" to errors))
    }

    // DELETE /api/transactions/{id} - 删除交易
    delete("/api/transactions/{id}") {
        DatabaseFactory.deleteEntity("transactions", call.parameters["id"] ?: "")
        call.respond(HttpStatusCode.NoContent)
    }
}

@Serializable
data class SyncRecordResponse(
    val id: String,
    val entityType: String,
    val accountId: String? = null,
    val userId: String? = null,
    val payload: JsonElement,
    val updatedAt: String,
)

@Serializable
data class SyncRecordRequest(
    val id: String,
    val entityType: String,
    val accountId: String? = null,
    val userId: String? = null,
    val payload: JsonElement,
    val updatedAt: String,
)

private data class DemoSeedRecord(
    val id: String,
    val entityType: String,
    val accountId: String?,
    val userId: String?,
    val payload: String,
)

@Serializable
private data class DemoSeedResponse(
    val status: String,
    val seeded: Int,
)

fun Routing.syncRoutes() {
    get("/api/sync") {
        val accountId = call.request.queryParameters["accountId"] ?: "default"
        call.respond(
            DatabaseFactory.listRecords(accountId).map { row ->
                SyncRecordResponse(
                    id = row.id,
                    entityType = row.entityType,
                    accountId = row.accountId,
                    userId = row.userId,
                    payload = kotlinx.serialization.json.Json.parseToJsonElement(row.payload),
                    updatedAt = row.updatedAt,
                )
            },
        )
    }

    post("/api/sync") {
        val request = call.receive<SyncRecordRequest>()
        DatabaseFactory.upsertRecord(
            SyncRecordRow(
                id = request.id,
                entityType = request.entityType,
                accountId = request.accountId,
                userId = request.userId,
                payload = request.payload.toString(),
                updatedAt = request.updatedAt,
            ),
        )
        call.respond(HttpStatusCode.NoContent)
    }

    post("/api/sync/demo") {
        val now = Clock.System.now().toString().replace("T", " ").replace("Z", "")
        val month = now.substring(0, 7)
        val demoRecords = listOf(
            DemoSeedRecord(
                id = "local-user",
                entityType = "users",
                accountId = "default",
                userId = "local-user",
                payload = """{"id":"local-user","email":"cloud@wotty.stark","password":"","name":"云端演示用户","defaultAccountId":"default","role":"USER","createdAt":"$now","updatedAt":"$now"}""",
            ),
            DemoSeedRecord(
                id = "default",
                entityType = "accounts",
                accountId = "default",
                userId = "local-user",
                payload = """{"id":"default","name":"云端默认账本","ownerId":"local-user","createdAt":"$now","updatedAt":"$now"}""",
            ),
            DemoSeedRecord(
                id = "txn-salary",
                entityType = "transactions",
                accountId = "default",
                userId = "local-user",
                payload = """{"id":"txn-salary","userId":"local-user","accountId":"default","amount":12800,"type":"INCOME","category":"工资","platform":"银行卡","merchant":"公司发薪","date":"${month}-15 09:00:00","description":"月中发薪","createdAt":"$now","updatedAt":"$now"}""",
            ),
            DemoSeedRecord(
                id = "txn-food",
                entityType = "transactions",
                accountId = "default",
                userId = "local-user",
                payload = """{"id":"txn-food","userId":"local-user","accountId":"default","amount":86,"type":"EXPENSE","category":"餐饮","platform":"支付宝","merchant":"午餐","date":"${month}-16 12:15:00","description":"工作餐","createdAt":"$now","updatedAt":"$now"}""",
            ),
            DemoSeedRecord(
                id = "txn-shop",
                entityType = "transactions",
                accountId = "default",
                userId = "local-user",
                payload = """{"id":"txn-shop","userId":"local-user","accountId":"default","amount":268,"type":"EXPENSE","category":"购物","platform":"微信","merchant":"日用品","date":"${month}-18 20:10:00","description":"家庭采购","createdAt":"$now","updatedAt":"$now"}""",
            ),
            DemoSeedRecord(
                id = "asset-bank",
                entityType = "assets",
                accountId = "default",
                userId = "local-user",
                payload = """{"id":"asset-bank","userId":"local-user","accountId":"default","name":"工资卡","type":"BANK_CARD","balance":48216.4,"currency":"CNY","createdAt":"$now","updatedAt":"$now"}""",
            ),
            DemoSeedRecord(
                id = "asset-wechat",
                entityType = "assets",
                accountId = "default",
                userId = "local-user",
                payload = """{"id":"asset-wechat","userId":"local-user","accountId":"default","name":"微信钱包","type":"WECHAT","balance":1260.5,"currency":"CNY","createdAt":"$now","updatedAt":"$now"}""",
            ),
            DemoSeedRecord(
                id = "budget-global",
                entityType = "budgets",
                accountId = "default",
                userId = "local-user",
                payload = """{"id":"budget-global","userId":"local-user","accountId":"default","amount":6000,"category":"ALL","period":"MONTHLY","alertPercent":80,"platform":null,"scopeType":"GLOBAL","createdAt":"$now","updatedAt":"$now"}""",
            ),
            DemoSeedRecord(
                id = "loan-home",
                entityType = "loans",
                accountId = "default",
                userId = "local-user",
                payload = """{"id":"loan-home","userId":"local-user","accountId":"default","platform":"房贷","totalAmount":480000,"remainingAmount":352000,"periods":240,"paidPeriods":64,"monthlyPayment":3200,"dueDate":20,"status":"ACTIVE","matchKeywords":null,"createdAt":"$now","updatedAt":"$now"}""",
            ),
        )

        demoRecords.forEach { item ->
            DatabaseFactory.upsertRecord(
                SyncRecordRow(
                    id = item.id,
                    entityType = item.entityType,
                    accountId = item.accountId,
                    userId = item.userId,
                    payload = item.payload,
                    updatedAt = now,
                ),
            )
        }
        call.respond(DemoSeedResponse(status = "ok", seeded = demoRecords.size))
    }
}

fun Routing.assetRoutes() {
    get("/api/assets") {
        val accountId = call.request.queryParameters["accountId"] ?: "default"
        call.respond(DatabaseFactory.listAssetsRest(accountId))
    }
    post("/api/assets") {
        val payload = call.receive<JsonElement>().jsonObject
        DatabaseFactory.upsertEntityPayload("assets", payload)
        call.respond(HttpStatusCode.NoContent)
    }
    delete("/api/assets/{id}") {
        DatabaseFactory.deleteEntity("assets", call.parameters["id"] ?: "")
        call.respond(HttpStatusCode.NoContent)
    }
}

fun Routing.budgetRoutes() {
    get("/api/budgets") {
        val accountId = call.request.queryParameters["accountId"] ?: "default"
        call.respond(DatabaseFactory.listBudgetsRest(accountId))
    }
    post("/api/budgets") {
        val payload = call.receive<JsonElement>().jsonObject
        DatabaseFactory.upsertEntityPayload("budgets", payload)
        call.respond(HttpStatusCode.NoContent)
    }
    delete("/api/budgets/{id}") {
        DatabaseFactory.deleteEntity("budgets", call.parameters["id"] ?: "")
        call.respond(HttpStatusCode.NoContent)
    }
}

fun Routing.loanRoutes() {
    get("/api/loans") {
        val accountId = call.request.queryParameters["accountId"] ?: "default"
        call.respond(DatabaseFactory.listLoansRest(accountId))
    }
    post("/api/loans") {
        val payload = call.receive<JsonElement>().jsonObject
        DatabaseFactory.upsertEntityPayload("loans", payload)
        call.respond(HttpStatusCode.NoContent)
    }
    delete("/api/loans/{id}") {
        DatabaseFactory.deleteEntity("loans", call.parameters["id"] ?: "")
        call.respond(HttpStatusCode.NoContent)
    }
}

fun Routing.savingsRoutes() {
    get("/api/savings-goals") {
        val accountId = call.request.queryParameters["accountId"] ?: "default"
        call.respond(DatabaseFactory.listSavingsGoalsRest(accountId))
    }
    post("/api/savings-goals") {
        val payload = call.receive<JsonElement>().jsonObject
        DatabaseFactory.upsertEntityPayload("savingsGoals", payload)
        call.respond(HttpStatusCode.NoContent)
    }
    delete("/api/savings-goals/{id}") {
        DatabaseFactory.deleteEntity("savingsGoals", call.parameters["id"] ?: "")
        call.respond(HttpStatusCode.NoContent)
    }
    get("/api/savings-plans") {
        val goalId = call.request.queryParameters["goalId"] ?: ""
        call.respond(DatabaseFactory.listSavingsPlansRest(goalId))
    }
    post("/api/savings-plans") {
        val payload = call.receive<JsonElement>().jsonObject
        DatabaseFactory.upsertEntityPayload("savingsPlans", payload)
        call.respond(HttpStatusCode.NoContent)
    }
}

fun Routing.categoryRuleRoutes() {
    get("/api/category-rules") {
        val accountId = call.request.queryParameters["accountId"] ?: "default"
        call.respond(DatabaseFactory.listCategoryRulesRest(accountId))
    }
    post("/api/category-rules") {
        val payload = call.receive<JsonElement>().jsonObject
        DatabaseFactory.upsertEntityPayload("categoryRules", payload)
        call.respond(HttpStatusCode.NoContent)
    }
}

fun Routing.importErrorRoutes() {
    get("/api/import-errors") {
        val accountId = call.request.queryParameters["accountId"] ?: "default"
        call.respond(DatabaseFactory.listImportErrorLogsRest(accountId))
    }
    post("/api/import-errors") {
        val payload = call.receive<JsonElement>().jsonObject
        DatabaseFactory.upsertEntityPayload("importErrorLogs", payload)
        call.respond(HttpStatusCode.NoContent)
    }
}

fun Routing.exchangeRateRoutes() {
    get("/api/exchange-rates") {
        call.respond(DatabaseFactory.listExchangeRatesRest())
    }
}

fun Routing.themeConfigRoutes() {
    get("/api/theme-config/{userId}") {
        call.respond(DatabaseFactory.getThemeConfigRest(call.parameters["userId"] ?: "") ?: JsonNull)
    }
    put("/api/theme-config") {
        val payload = call.receive<JsonElement>().jsonObject
        DatabaseFactory.upsertEntityPayload("themeConfigs", payload)
        call.respond(HttpStatusCode.NoContent)
    }
}
