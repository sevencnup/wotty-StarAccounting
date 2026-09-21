package com.wotty.stark.server.util

import java.util.Base64
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNull
import kotlin.test.assertNotEquals
import kotlin.test.assertFailsWith

class TransactionFieldCipherTest {
    private val key = ByteArray(32) { it.toByte() }

    @Test
    fun `encrypts and decrypts a transaction field without storing plaintext`() {
        val cipher = TransactionFieldCipher.fromKeyBytes(key)
        val original = "杭州西湖边咖啡店 · 周末消费"

        val encrypted = cipher.encryptForStorage(original)

        requireNotNull(encrypted)
        assertFalse(encrypted.contains(original))
        assertEquals(original, cipher.decryptForResponse(encrypted))
    }

    @Test
    fun `uses a new nonce for every encryption`() {
        val cipher = TransactionFieldCipher.fromKeyBytes(key)

        val first = cipher.encryptForStorage("同一商户")
        val second = cipher.encryptForStorage("同一商户")

        assertNotEquals(first, second)
    }

    @Test
    fun `does not encrypt an already migrated value again`() {
        val cipher = TransactionFieldCipher.fromKeyBytes(key)
        val encrypted = cipher.encryptForStorage("历史商户")

        assertEquals(encrypted, cipher.migrateStoredValue(encrypted))
    }

    @Test
    fun `keeps plain values when encryption is not configured`() {
        val cipher = TransactionFieldCipher.fromEnvironment(emptyMap())

        assertFalse(cipher.isEnabled)
        assertEquals("旧交易描述", cipher.encryptForStorage("旧交易描述"))
        assertEquals("旧交易描述", cipher.decryptForResponse("旧交易描述"))
        assertNull(cipher.encryptForStorage(null))
    }

    @Test
    fun `rejects an invalid environment key without exposing its value`() {
        val secret = "not-a-valid-encryption-key"

        val error = assertFailsWith<IllegalStateException> {
            TransactionFieldCipher.fromEnvironment(mapOf("DATA_ENCRYPTION_KEY" to secret))
        }

        assertFalse(error.message.orEmpty().contains(secret))
    }

    @Test
    fun `loads a valid base64 environment key`() {
        val encoded = Base64.getEncoder().encodeToString(key)
        val cipher = TransactionFieldCipher.fromEnvironment(mapOf("DATA_ENCRYPTION_KEY" to encoded))

        assertEquals("交易说明", cipher.decryptForResponse(cipher.encryptForStorage("交易说明")))
    }

    @Test
    fun `rejects ciphertext encrypted with a different key`() {
        val encrypted = TransactionFieldCipher.fromKeyBytes(key).encryptForStorage("敏感商户")
        val anotherKey = ByteArray(32) { (it + 1).toByte() }

        assertFailsWith<IllegalStateException> {
            TransactionFieldCipher.fromKeyBytes(anotherKey).decryptForResponse(encrypted)
        }
    }
}
