package com.wotty.stark.server.route

import io.ktor.http.*
import io.ktor.server.response.*
import io.ktor.server.request.*
import io.ktor.server.routing.*
import com.wotty.stark.server.util.DatabaseFactory
import com.wotty.stark.server.util.SyncRecordRow
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.JsonElement
import kotlinx.datetime.Clock

@Serializable
data class AppVersionResponse(
    val versionCode: Int,
    val versionName: String,
    val apkUrl: String? = null,
    val changelog: String? = null,
    val forceUpdate: Boolean = false
)

fun Routing.appRoutes() {
    get("/api/health") {
        call.respond(mapOf("status" to "ok"))
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
    // POST /api/user - 创建/保存用户
}

fun Routing.accountRoutes() {
    // GET /api/accounts - 获取账本列表
    // GET /api/accounts/{id} - 获取单个账本
    // POST /api/accounts - 创建/更新账本
    // DELETE /api/accounts/{id} - 删除账本
}

fun Routing.transactionRoutes() {
    // GET /api/transactions?accountId=&page=&pageSize= - 分页查询交易
    // GET /api/transactions/{id} - 获取单笔交易
    // POST /api/transactions - 创建交易
    // PUT /api/transactions/{id} - 更新交易
    // DELETE /api/transactions/{id} - 删除交易
    // POST /api/transactions/import - 批量导入
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
            DemoSeedRecord(
                id = "goal-travel",
                entityType = "savingsGoals",
                accountId = "default",
                userId = "local-user",
                payload = """{"id":"goal-travel","userId":"local-user","accountId":"default","name":"旅行基金","targetAmount":30000,"currentAmount":9200,"deadline":"2026-12-31","type":"LONG_TERM","status":"ACTIVE","depositType":"CASH","planConfig":null,"createdAt":"$now","updatedAt":"$now"}""",
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
    // GET /api/assets?accountId= - 资产列表
    // POST /api/assets - 创建/更新资产
    // DELETE /api/assets/{id} - 删除资产
}

fun Routing.budgetRoutes() {
    // GET /api/budgets?accountId= - 预算列表
    // POST /api/budgets - 创建/更新预算
    // DELETE /api/budgets/{id} - 删除预算
}

fun Routing.loanRoutes() {
    // GET /api/loans?accountId= - 贷款列表
    // POST /api/loans - 创建/更新贷款
    // DELETE /api/loans/{id} - 删除贷款
}

fun Routing.savingsRoutes() {
    // GET /api/savings-goals?accountId= - 储蓄目标列表
    // POST /api/savings-goals - 创建/更新储蓄目标
    // DELETE /api/savings-goals/{id} - 删除储蓄目标
    // GET /api/savings-plans?goalId= - 储蓄计划列表
    // POST /api/savings-plans - 创建/更新储蓄计划
}

fun Routing.categoryRuleRoutes() {
    // GET /api/category-rules?accountId= - 分类规则列表
    // POST /api/category-rules - 创建/更新分类规则
}

fun Routing.importErrorRoutes() {
    // GET /api/import-errors?accountId= - 导入错误列表
    // POST /api/import-errors - 创建导入错误
}

fun Routing.exchangeRateRoutes() {
    // GET /api/exchange-rates - 汇率列表
}

fun Routing.themeConfigRoutes() {
    // GET /api/theme-config/{userId} - 获取主题配置
    // PUT /api/theme-config - 更新主题配置
}
