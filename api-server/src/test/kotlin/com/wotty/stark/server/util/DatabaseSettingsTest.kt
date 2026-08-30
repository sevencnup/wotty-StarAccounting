package com.wotty.stark.server.util

import java.nio.file.Files
import java.nio.file.Path
import kotlin.io.path.createDirectories
import kotlin.io.path.writeText
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith
import kotlin.test.assertFalse

class DatabaseSettingsTest {
    @Test
    fun `loads settings from user home`() {
        val home = configHome(
            """
            DATABASE_URL=jdbc:mysql://localhost:3306/star_accounting
            DB_USER=accounting
            DB_PASSWORD=secret
            """.trimIndent(),
        )

        val settings = loadDatabaseSettings(emptyMap(), home)

        assertEquals("jdbc:mysql://localhost:3306/star_accounting", settings.jdbcUrl)
        assertEquals("accounting", settings.username)
        assertEquals("secret", settings.password)
    }

    @Test
    fun `environment overrides user home settings`() {
        val home = configHome(
            """
            DATABASE_URL=jdbc:mysql://file-host:3306/file_db
            DB_USER=file-user
            DB_PASSWORD=file-secret
            """.trimIndent(),
        )

        val settings = loadDatabaseSettings(
            mapOf(
                "DATABASE_URL" to "jdbc:mysql://env-host:3306/env_db",
                "DB_USER" to "env-user",
                "DB_PASSWORD" to "env-secret",
            ),
            home,
        )

        assertEquals("jdbc:mysql://env-host:3306/env_db", settings.jdbcUrl)
        assertEquals("env-user", settings.username)
        assertEquals("env-secret", settings.password)
    }

    @Test
    fun `blank environment values fall back to user home`() {
        val home = configHome(
            """
            DATABASE_URL=jdbc:mysql://file-host:3306/file_db
            DB_USER=file-user
            DB_PASSWORD=file-secret
            """.trimIndent(),
        )

        val settings = loadDatabaseSettings(
            mapOf(
                "DATABASE_URL" to " ",
                "DB_USER" to "",
                "DB_PASSWORD" to "  ",
            ),
            home,
        )

        assertEquals("jdbc:mysql://file-host:3306/file_db", settings.jdbcUrl)
        assertEquals("file-user", settings.username)
        assertEquals("file-secret", settings.password)
    }

    @Test
    fun `defaults database user to root`() {
        val home = configHome(
            """
            DATABASE_URL=jdbc:mysql://localhost:3306/star_accounting
            DB_PASSWORD=secret
            """.trimIndent(),
        )

        assertEquals("root", loadDatabaseSettings(emptyMap(), home).username)
    }

    @Test
    fun `reports missing required setting without exposing password`() {
        val password = "do-not-leak-this"
        val error = assertFailsWith<IllegalStateException> {
            loadDatabaseSettings(mapOf("DB_PASSWORD" to password), emptyHome())
        }

        assertEquals("Missing database setting: DATABASE_URL", error.message)
        assertFalse(error.stackTraceToString().contains(password))
    }

    @Test
    fun `reports missing password without exposing jdbc url`() {
        val jdbcUrl = "jdbc:mysql://private-host:3306/private_db"
        val error = assertFailsWith<IllegalStateException> {
            loadDatabaseSettings(mapOf("DATABASE_URL" to jdbcUrl), emptyHome())
        }

        assertEquals("Missing database setting: DB_PASSWORD", error.message)
        assertFalse(error.stackTraceToString().contains(jdbcUrl))
    }

    private fun configHome(content: String): Path {
        val home = emptyHome()
        home.resolve(".wotty-stark").createDirectories()
            .resolve("db.properties")
            .writeText(content)
        return home
    }

    private fun emptyHome(): Path = Files.createTempDirectory("wotty-stark-db-settings-")
}
