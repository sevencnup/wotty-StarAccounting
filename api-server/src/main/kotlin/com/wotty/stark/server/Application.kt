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

    // 数据库缺失时保留健康检查与版本接口可用，但给出醒目的告警，避免"接口全 500 却误以为后端正常"
    runCatching { DatabaseFactory.init() }
        .onFailure { cause ->
            val log = environment.log
            log.error("==================================================================")
            log.error("数据库未连接！所有数据接口将返回 500，仅 /api/health、/api/app/version 可用")
            log.error("请在启动时设置环境变量：")
            log.error("  DATABASE_URL=jdbc:mysql://<host>:3306/<db>   DB_USER=<user>   DB_PASSWORD=<密码>")
            log.error("原因：${cause.message}")
            log.error("==================================================================")
        }
}
