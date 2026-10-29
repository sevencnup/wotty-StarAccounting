package com.wotty.stark.server.route

import com.wotty.stark.server.util.AccountAdminKey
import com.wotty.stark.server.util.AuthTokens
import com.wotty.stark.server.util.DatabaseFactory
import com.wotty.stark.server.util.PasswordHasher
import com.wotty.stark.server.util.RegistrationDisabledException
import io.ktor.http.HttpStatusCode
import io.ktor.server.auth.authenticate
import io.ktor.server.auth.principal
import io.ktor.server.auth.jwt.JWTPrincipal
import io.ktor.server.request.receive
import io.ktor.server.response.respond
import io.ktor.server.routing.Routing
import io.ktor.server.routing.get
import io.ktor.server.routing.post
import kotlinx.serialization.Serializable

@Serializable
data class AuthCredentials(
    val email: String,
    val password: String,
    val name: String? = null,
)

@Serializable
data class PasswordResetRequest(
    val newPassword: String,
    val confirmPassword: String,
)

@Serializable
data class PasswordRecoveryRequest(
    val email: String,
    val newPassword: String,
    val confirmPassword: String,
    val adminKey: String,
)

@Serializable
data class RegistrationStatusResponse(val registrationEnabled: Boolean)

@Serializable
data class RegistrationSettingRequest(
    val registrationEnabled: Boolean,
    val adminKey: String,
)

@Serializable
data class AuthUserResponse(
    val id: String,
    val email: String,
    val name: String? = null,
    val defaultAccountId: String? = null,
    val role: String,
    val createdAt: String,
    val updatedAt: String,
)

@Serializable
data class AuthResponse(val token: String, val user: AuthUserResponse)

@Serializable
data class AuthError(val error: String)

private fun com.wotty.stark.server.util.AuthUser.toResponse() = AuthUserResponse(
    id = id,
    email = email,
    name = name,
    defaultAccountId = defaultAccountId,
    role = role,
    createdAt = createdAt.toString().replace('T', ' '),
    updatedAt = updatedAt.toString().replace('T', ' '),
)

private fun normalizeEmail(value: String): String = value.trim().lowercase()

private fun validCredentials(credentials: AuthCredentials): String? {
    val email = normalizeEmail(credentials.email)
    if (!Regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$").matches(email)) return "请输入有效的邮箱地址"
    if (credentials.password.length < 8) return "密码至少需要 8 位"
    return null
}

private fun validNewPassword(newPassword: String, confirmPassword: String): String? {
    if (newPassword.length < 8) return "新密码至少需要 8 位"
    if (newPassword != confirmPassword) return "两次输入的新密码不一致"
    return null
}

private object PasswordRecoveryAttempts {
    private const val ATTEMPT_LIMIT = 5
    private const val WINDOW_MILLIS = 10L * 60L * 1000L
    private val timestampsByEmail = mutableMapOf<String, ArrayDeque<Long>>()

    fun allow(email: String): Boolean = synchronized(this) {
        val now = System.currentTimeMillis()
        val timestamps = timestampsByEmail.getOrPut(email) { ArrayDeque() }
        while (timestamps.isNotEmpty() && timestamps.first() <= now - WINDOW_MILLIS) {
            timestamps.removeFirst()
        }
        if (timestamps.size >= ATTEMPT_LIMIT) return false
        timestamps.addLast(now)
        if (timestampsByEmail.size > 1024) timestampsByEmail.clear()
        true
    }
}

private suspend fun io.ktor.server.application.ApplicationCall.requireAccountAdminKey(candidate: String): Boolean {
    if (!AccountAdminKey.isConfigured()) {
        respond(HttpStatusCode.ServiceUnavailable, AuthError("服务器尚未配置账户管理员恢复密钥"))
        return false
    }
    if (!AccountAdminKey.matches(candidate)) {
        respond(HttpStatusCode.Forbidden, AuthError("管理员恢复密钥无效"))
        return false
    }
    return true
}

fun Routing.authRoutes() {
    get("/api/auth/registration") {
        call.respond(RegistrationStatusResponse(DatabaseFactory.isRegistrationEnabled()))
    }

    post("/api/auth/register") {
        if (!DatabaseFactory.isRegistrationEnabled()) {
            call.respond(HttpStatusCode.Forbidden, AuthError("当前服务器已关闭新用户注册"))
            return@post
        }
        val credentials = call.receive<AuthCredentials>()
        validCredentials(credentials)?.let {
            call.respond(HttpStatusCode.BadRequest, AuthError(it))
            return@post
        }
        val email = normalizeEmail(credentials.email)
        if (DatabaseFactory.findUserByEmail(email) != null) {
            call.respond(HttpStatusCode.Conflict, AuthError("该邮箱已经注册，请直接登录"))
            return@post
        }
        val user = try {
            DatabaseFactory.registerUser(email, PasswordHasher.hash(credentials.password), credentials.name)
        } catch (_: RegistrationDisabledException) {
            call.respond(HttpStatusCode.Forbidden, AuthError("当前服务器已关闭新用户注册"))
            return@post
        } catch (error: Throwable) {
            call.respond(HttpStatusCode.InternalServerError, AuthError(error.message ?: "注册失败"))
            return@post
        }
        call.respond(AuthResponse(token = AuthTokens.issue(user.id), user = user.toResponse()))
    }

    post("/api/auth/login") {
        val credentials = call.receive<AuthCredentials>()
        val email = normalizeEmail(credentials.email)
        val user = DatabaseFactory.findUserByEmail(email)
        if (user == null || !PasswordHasher.verify(credentials.password, user.password)) {
            call.respond(HttpStatusCode.Unauthorized, AuthError("邮箱或密码错误"))
            return@post
        }
        if (!user.password.startsWith("pbkdf2-sha256$")) {
            DatabaseFactory.updatePassword(user.id, PasswordHasher.hash(credentials.password))
        }
        val refreshed = DatabaseFactory.findUserById(user.id) ?: user
        call.respond(AuthResponse(token = AuthTokens.issue(refreshed.id), user = refreshed.toResponse()))
    }

    post("/api/auth/password/recover") {
        val request = call.receive<PasswordRecoveryRequest>()
        val email = normalizeEmail(request.email)
        if (!Regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$").matches(email)) {
            call.respond(HttpStatusCode.BadRequest, AuthError("请输入有效的邮箱地址"))
            return@post
        }
        validNewPassword(request.newPassword, request.confirmPassword)?.let {
            call.respond(HttpStatusCode.BadRequest, AuthError(it))
            return@post
        }
        if (!PasswordRecoveryAttempts.allow(email)) {
            call.respond(HttpStatusCode.TooManyRequests, AuthError("尝试次数过多，请 10 分钟后再试"))
            return@post
        }
        if (!call.requireAccountAdminKey(request.adminKey)) return@post

        DatabaseFactory.findUserByEmail(email)?.let { user ->
            DatabaseFactory.updatePassword(user.id, PasswordHasher.hash(request.newPassword))
        }
        // Keep the same result for a missing address so this API does not reveal registered emails.
        call.respond(mapOf("message" to "若该邮箱已注册，密码已重置，请使用新密码登录"))
    }

    authenticate("auth-jwt") {
        post("/api/auth/registration") {
            val request = call.receive<RegistrationSettingRequest>()
            if (!call.requireAccountAdminKey(request.adminKey)) return@post
            DatabaseFactory.setRegistrationEnabled(request.registrationEnabled)
            call.respond(RegistrationStatusResponse(request.registrationEnabled))
        }

        post("/api/auth/password") {
            val userId = call.principal<JWTPrincipal>()?.payload?.getClaim("userId")?.asString()
            val user = userId?.let(DatabaseFactory::findUserById)
            if (user == null) {
                call.respond(HttpStatusCode.Unauthorized, AuthError("登录已失效，请重新登录"))
                return@post
            }

            val request = call.receive<PasswordResetRequest>()
            validNewPassword(request.newPassword, request.confirmPassword)?.let {
                call.respond(HttpStatusCode.BadRequest, AuthError(it))
                return@post
            }

            DatabaseFactory.updatePassword(user.id, PasswordHasher.hash(request.newPassword))
            call.respond(mapOf("message" to "密码修改成功"))
        }

        get("/api/auth/me") {
            val userId = call.principal<JWTPrincipal>()?.payload?.getClaim("userId")?.asString()
            val user = userId?.let(DatabaseFactory::findUserById)
            if (user == null) {
                call.respond(HttpStatusCode.Unauthorized, AuthError("登录已失效，请重新登录"))
            } else {
                call.respond(user.toResponse())
            }
        }

        post("/api/auth/logout") {
            // JWT is stateless; the client removes its token. This endpoint keeps the client flow explicit.
            call.respond(HttpStatusCode.NoContent)
        }
    }
}
