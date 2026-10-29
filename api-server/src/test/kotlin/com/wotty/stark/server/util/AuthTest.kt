package com.wotty.stark.server.util

import de.mkammerer.argon2.Argon2Factory
import kotlin.test.Test
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class AuthTest {
    @Test
    fun verifiesLegacyArgon2idPasswords() {
        val argon2 = Argon2Factory.create(Argon2Factory.Argon2Types.ARGON2id)
        val hash = argon2.hash(2, 65_536, 1, "correct-password".toCharArray())

        assertTrue(PasswordHasher.verify("correct-password", hash))
        assertFalse(PasswordHasher.verify("wrong-password", hash))
    }
}
