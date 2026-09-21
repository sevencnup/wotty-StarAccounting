package com.wotty.stark.server.util

import java.nio.charset.StandardCharsets
import java.security.SecureRandom
import java.util.Base64
import javax.crypto.Cipher
import javax.crypto.spec.GCMParameterSpec
import javax.crypto.spec.SecretKeySpec

private const val DATA_ENCRYPTION_KEY = "DATA_ENCRYPTION_KEY"
private const val ENCRYPTED_VALUE_PREFIX = "enc:v1:"
private const val AES_KEY_BYTES = 32
private const val GCM_NONCE_BYTES = 12
private const val GCM_TAG_BITS = 128

/**
 * Encrypts selected transaction fields before they reach MySQL. The key is only
 * available to the API process, so clients never receive it.
 */
internal class TransactionFieldCipher private constructor(
    private val key: SecretKeySpec?,
) {
    val isEnabled: Boolean get() = key != null

    fun encryptForStorage(value: String?): String? {
        if (value == null || key == null) return value
        val nonce = ByteArray(GCM_NONCE_BYTES)
        random.nextBytes(nonce)
        val cipher = Cipher.getInstance("AES/GCM/NoPadding")
        cipher.init(Cipher.ENCRYPT_MODE, key, GCMParameterSpec(GCM_TAG_BITS, nonce))
        val encrypted = cipher.doFinal(value.toByteArray(StandardCharsets.UTF_8))
        val payload = ByteArray(nonce.size + encrypted.size)
        nonce.copyInto(payload)
        encrypted.copyInto(payload, destinationOffset = nonce.size)
        return ENCRYPTED_VALUE_PREFIX + Base64.getUrlEncoder().withoutPadding().encodeToString(payload)
    }

    fun decryptForResponse(value: String?): String? {
        if (value == null || !value.startsWith(ENCRYPTED_VALUE_PREFIX)) return value
        val activeKey = key ?: throw IllegalStateException(
            "Found encrypted transaction data but $DATA_ENCRYPTION_KEY is not configured",
        )
        val encoded = value.removePrefix(ENCRYPTED_VALUE_PREFIX)
        val payload = runCatching { Base64.getUrlDecoder().decode(encoded) }
            .getOrElse { throw IllegalStateException("Encrypted transaction data is invalid", it) }
        if (payload.size <= GCM_NONCE_BYTES) throw IllegalStateException("Encrypted transaction data is invalid")

        return try {
            val nonce = payload.copyOfRange(0, GCM_NONCE_BYTES)
            val ciphertext = payload.copyOfRange(GCM_NONCE_BYTES, payload.size)
            val cipher = Cipher.getInstance("AES/GCM/NoPadding")
            cipher.init(Cipher.DECRYPT_MODE, activeKey, GCMParameterSpec(GCM_TAG_BITS, nonce))
            String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8)
        } catch (error: Exception) {
            throw IllegalStateException(
                "Unable to decrypt transaction data; confirm $DATA_ENCRYPTION_KEY has not changed",
                error,
            )
        }
    }

    /** Encrypts legacy plain text and validates previously encrypted values. */
    fun migrateStoredValue(value: String?): String? = when {
        value == null -> null
        !value.startsWith(ENCRYPTED_VALUE_PREFIX) -> encryptForStorage(value)
        else -> {
            decryptForResponse(value)
            value
        }
    }

    companion object {
        private val random = SecureRandom()

        fun fromEnvironment(environment: Map<String, String> = System.getenv()): TransactionFieldCipher {
            val configured = environment[DATA_ENCRYPTION_KEY]?.trim()
            if (configured.isNullOrEmpty()) return TransactionFieldCipher(null)
            val decoded = runCatching { Base64.getDecoder().decode(configured) }
                .getOrElse {
                    throw IllegalStateException("$DATA_ENCRYPTION_KEY must be a Base64-encoded 32-byte key", it)
                }
            require(decoded.size == AES_KEY_BYTES) {
                "$DATA_ENCRYPTION_KEY must decode to exactly $AES_KEY_BYTES bytes"
            }
            return TransactionFieldCipher(SecretKeySpec(decoded, "AES"))
        }

        internal fun fromKeyBytes(key: ByteArray): TransactionFieldCipher {
            require(key.size == AES_KEY_BYTES) { "Encryption key must be $AES_KEY_BYTES bytes" }
            return TransactionFieldCipher(SecretKeySpec(key.copyOf(), "AES"))
        }
    }
}
