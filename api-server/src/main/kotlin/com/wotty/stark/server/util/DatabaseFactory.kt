package com.wotty.stark.server.util

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.jetbrains.exposed.sql.Database

object DatabaseFactory {
    private val dataSource by lazy {
        val config = HikariConfig().apply {
            jdbcUrl = System.getenv("DATABASE_URL") ?: error("DATABASE_URL environment variable not set")
            driverClassName = "com.mysql.cj.jdbc.Driver"
            username = System.getenv("DB_USER") ?: "root"
            password = System.getenv("DB_PASSWORD") ?: error("DB_PASSWORD environment variable not set")
            maximumPoolSize = 10
            minimumIdle = 5
            idleTimeout = 30000
            maxLifetime = 600000
            connectionTimeout = 30000
        }
        HikariDataSource(config)
    }

    fun init() {
        Database.connect(dataSource)
    }
}
