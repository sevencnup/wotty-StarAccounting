package com.wotty.stark.server.util

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse

class DatabaseSettingsTest {
    @Test
    fun loadsSettingsFromEnvironment() {
        val settings = loadDatabaseSettings(
            mapOf(
                "DATABASE_URL" to "jdbc:mysql://env-host:3306/env_db",
                "DB_USER" to "env-user",
                "DB_PASSWORD" to "env-secret",
            ),
        )

        assertEquals("jdbc:mysql://env-host:3306/env_db", settings.jdbcUrl)
        assertEquals("env-user", settings.username)
        assertEquals("env-secret", settings.password)
    }

    @Test
    fun blankEnvironmentValuesAreTreatedAsMissing() {
        val error = assertFailsWith<IllegalStateException> {
            loadDatabaseSettings(
                mapOf(
                    "DATABASE_URL" to " ",
                    "DB_USER" to "",
                    "DB_PASSWORD" to "  ",
                ),
            )
        }

        assertEquals("Missing database setting: DATABASE_URL", error.message)
    }

    @Test
    fun defaultsDatabaseUserToRoot() {
        val settings = loadDatabaseSettings(
            mapOf(
                "DATABASE_URL" to "jdbc:mysql://localhost:3306/star_accounting",
                "DB_PASSWORD" to "secret",
            ),
        )

        assertEquals("root", settings.username)
    }

    @Test
    fun reportsMissingRequiredSettingWithoutExposingPassword() {
        val password = "do-not-leak-this"
        val error = assertFailsWith<IllegalStateException> {
            loadDatabaseSettings(mapOf("DB_PASSWORD" to password))
        }

        assertEquals("Missing database setting: DATABASE_URL", error.message)
        assertFalse(error.stackTraceToString().contains(password))
    }

    @Test
    fun reportsMissingPasswordWithoutExposingJdbcUrl() {
        val jdbcUrl = "jdbc:mysql://private-host:3306/private_db"
        val error = assertFailsWith<IllegalStateException> {
            loadDatabaseSettings(mapOf("DATABASE_URL" to jdbcUrl))
        }

        assertEquals("Missing database setting: DB_PASSWORD", error.message)
        assertFalse(error.stackTraceToString().contains(jdbcUrl))
    }
}
