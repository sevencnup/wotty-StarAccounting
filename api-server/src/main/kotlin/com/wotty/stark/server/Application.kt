package com.wotty.stark.server

import com.wotty.stark.server.route.*
import com.wotty.stark.server.util.DatabaseFactory
import io.ktor.http.*
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.application.*
import io.ktor.server.plugins.contentnegotiation.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.plugins.statuspages.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.json.Json

fun main() {
    io.ktor.server.netty.EngineMain.main(arrayOf("-config=application.conf"))
}

fun Application.module() {
    // JSON 序列化配置
    install(ContentNegotiation) {
        json(Json {
            ignoreUnknownKeys = true
            prettyPrint = false
            coerceInputValues = true
        })
    }

    // CORS
    install(CORS) {
        allowMethod(HttpMethod.Options)
        allowMethod(HttpMethod.Get)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Put)
        allowMethod(HttpMethod.Delete)
        anyHost()
        allowHeader("Content-Type")
        allowHeader("Authorization")
    }

    // 错误处理
    install(StatusPages) {
        exception<Throwable> { call, cause ->
            call.application.environment.log.error("Request failed: ${call.request.httpMethod.value} ${call.request.path()}", cause)
            call.respondText(
                """{"error": "${cause.message?.replace("\"", "\\\"") ?: "Unknown error"}"}""",
                ContentType.Application.Json,
                HttpStatusCode.InternalServerError
            )
        }
    }

    // 注册路由
    routing {
        appRoutes()
        userRoutes()
        accountRoutes()
        transactionRoutes()
        assetRoutes()
        budgetRoutes()
        loanRoutes()
        savingsRoutes()
        categoryRuleRoutes()
        importErrorRoutes()
        exchangeRateRoutes()
        themeConfigRoutes()
        syncRoutes()
    }

    // 数据库依赖的路由后续需要真实实现；这里先避免因环境变量缺失导致健康检查和版本接口不可用。
    runCatching { DatabaseFactory.init() }
        .onFailure { cause ->
            environment.log.warn("Database initialization skipped: ${cause.message}")
        }
}
