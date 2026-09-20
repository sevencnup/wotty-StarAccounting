package com.wotty.stark.server.route

import com.wotty.stark.server.util.AuthTokens
import com.wotty.stark.server.util.DatabaseFactory
import com.wotty.stark.server.util.PasswordHasher
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
    val currentPassword: String,
    val newPassword: String,
    val confirmPassword: String,
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

fun Routing.authRoutes() {
    post("/api/auth/register") {
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
        val user = runCatching {
            DatabaseFactory.registerUser(email, PasswordHasher.hash(credentials.password), credentials.name)
        }.getOrElse {
            call.respond(HttpStatusCode.InternalServerError, AuthError(it.message ?: "注册失败"))
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

    authenticate("auth-jwt") {
        post("/api/auth/password") {
            val userId = call.principal<JWTPrincipal>()?.payload?.getClaim("userId")?.asString()
            val user = userId?.let(DatabaseFactory::findUserById)
            if (user == null) {
                call.respond(HttpStatusCode.Unauthorized, AuthError("登录已失效，请重新登录"))
                return@post
            }

            val request = call.receive<PasswordResetRequest>()
            if (request.newPassword.length < 8) {
                call.respond(HttpStatusCode.BadRequest, AuthError("新密码至少需要 8 位"))
                return@post
            }
            if (request.newPassword != request.confirmPassword) {
                call.respond(HttpStatusCode.BadRequest, AuthError("两次输入的新密码不一致"))
                return@post
            }
            if (request.currentPassword == request.newPassword) {
                call.respond(HttpStatusCode.BadRequest, AuthError("新密码不能与当前密码相同"))
                return@post
            }
            if (!PasswordHasher.verify(request.currentPassword, user.password)) {
                call.respond(HttpStatusCode.Unauthorized, AuthError("当前密码错误"))
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
