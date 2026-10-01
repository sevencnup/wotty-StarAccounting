package com.wotty.stark.server.util

import com.auth0.jwt.JWT
import com.auth0.jwt.JWTVerifier
import com.auth0.jwt.algorithms.Algorithm
import java.security.MessageDigest
import java.security.SecureRandom
import java.util.Base64
import de.mkammerer.argon2.Argon2Factory
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec

private const val DEFAULT_JWT_SECRET = "wotty-stark-development-secret-change-me"
private const val JWT_ISSUER = "wotty-stark-api"
private const val JWT_AUDIENCE = "wotty-stark-client"
private const val TOKEN_LIFETIME_SECONDS = 60L * 60L * 24L * 30L
private const val PBKDF2_ITERATIONS = 120_000
private const val PBKDF2_KEY_BITS = 256
private const val MIN_ACCOUNT_ADMIN_KEY_LENGTH = 12

object AuthTokens {
    private val secret: String
        get() = System.getenv("JWT_SECRET")?.trim()?.takeIf { it.length >= 32 } ?: DEFAULT_JWT_SECRET

    fun verifier(): JWTVerifier = JWT
        .require(Algorithm.HMAC256(secret))
        .withIssuer(JWT_ISSUER)
        .withAudience(JWT_AUDIENCE)
        .build()

    fun issue(userId: String): String {
        val now = System.currentTimeMillis()
        return JWT.create()
            .withIssuer(JWT_ISSUER)
            .withAudience(JWT_AUDIENCE)
            .withSubject(userId)
            .withClaim("userId", userId)
            .withIssuedAt(java.util.Date(now))
            .withExpiresAt(java.util.Date(now + TOKEN_LIFETIME_SECONDS * 1000L))
            .sign(Algorithm.HMAC256(secret))
    }
}

/** Deployment-owned secret for account recovery and registration control. */
object AccountAdminKey {
    private fun configuredValue(): String? = System.getenv("ACCOUNT_ADMIN_KEY")
        ?.trim()
        ?.takeIf { it.length >= MIN_ACCOUNT_ADMIN_KEY_LENGTH }

    fun isConfigured(): Boolean = configuredValue() != null

    fun matches(candidate: String): Boolean {
        val configured = configuredValue() ?: return false
        return MessageDigest.isEqual(
            configured.toByteArray(Charsets.UTF_8),
            candidate.trim().toByteArray(Charsets.UTF_8),
        )
    }
}

/** PBKDF2 is available in the JDK and avoids storing user passwords in plain text. */
object PasswordHasher {
    private val random = SecureRandom()
    private val legacyArgon2 = Argon2Factory.create(Argon2Factory.Argon2Types.ARGON2id)

    fun hash(password: String): String {
        require(password.length >= 8) { "Password must contain at least 8 characters" }
        val salt = ByteArray(16)
        random.nextBytes(salt)
        val digest = derive(password, salt, PBKDF2_ITERATIONS)
        return listOf(
            "pbkdf2-sha256",
            PBKDF2_ITERATIONS,
            Base64.getUrlEncoder().withoutPadding().encodeToString(salt),
            Base64.getUrlEncoder().withoutPadding().encodeToString(digest),
        ).joinToString("$")
    }

    fun verify(password: String, stored: String): Boolean {
        if (stored.startsWith("pbkdf2-sha256$")) {
            val parts = stored.split('$')
            if (parts.size != 4) return false
            val iterations = parts[1].toIntOrNull() ?: return false
            val salt = runCatching { Base64.getUrlDecoder().decode(parts[2]) }.getOrNull() ?: return false
            val expected = runCatching { Base64.getUrlDecoder().decode(parts[3]) }.getOrNull() ?: return false
            val actual = derive(password, salt, iterations)
            return MessageDigest.isEqual(actual, expected)
        }
        // Users created by the previous Node/Prisma service use Argon2id. Keep
        // those accounts compatible; AuthRoutes upgrades a successful login to
        // the current PBKDF2 format immediately afterwards.
        if (stored.startsWith("\$argon2id\$")) {
            return runCatching { legacyArgon2.verify(stored, password.toCharArray()) }.getOrDefault(false)
        }
        // Existing development databases may contain a legacy plain-text password.
        // A successful login is upgraded to PBKDF2 by the login route.
        return stored == password
    }

    private fun derive(password: String, salt: ByteArray, iterations: Int): ByteArray {
        val spec = PBEKeySpec(password.toCharArray(), salt, iterations, PBKDF2_KEY_BITS)
        return try {
            SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).encoded
        } finally {
            spec.clearPassword()
        }
    }
}
