package com.wotty.stark.server.util

import com.zaxxer.hikari.HikariConfig
import com.zaxxer.hikari.HikariDataSource
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.SchemaUtils
import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.insert
import org.jetbrains.exposed.sql.selectAll
import org.jetbrains.exposed.sql.transactions.transaction
import org.jetbrains.exposed.sql.update
import org.jetbrains.exposed.sql.or

object SyncRecords : Table("sync_records") {
    val id = varchar("id", 191)
    val entityType = varchar("entity_type", 64)
    val accountId = varchar("account_id", 191).nullable()
    val userId = varchar("user_id", 191).nullable()
    val payload = text("payload")
    val updatedAt = varchar("updated_at", 64)

    override val primaryKey = PrimaryKey(id)
}

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
        transaction { SchemaUtils.createMissingTablesAndColumns(SyncRecords) }
    }

    fun listRecords(accountId: String): List<SyncRecordRow> = transaction {
        SyncRecords.selectAll()
            .where { (SyncRecords.accountId eq accountId) or SyncRecords.accountId.isNull() }
            .map {
                SyncRecordRow(
                    id = it[SyncRecords.id],
                    entityType = it[SyncRecords.entityType],
                    accountId = it[SyncRecords.accountId],
                    userId = it[SyncRecords.userId],
                    payload = it[SyncRecords.payload],
                    updatedAt = it[SyncRecords.updatedAt],
                )
            }
    }

    fun upsertRecord(record: SyncRecordRow) {
        transaction {
            val updated = SyncRecords.update({ SyncRecords.id eq record.id }) {
                it[entityType] = record.entityType
                it[accountId] = record.accountId
                it[userId] = record.userId
                it[payload] = record.payload
                it[updatedAt] = record.updatedAt
            }
            if (updated == 0) {
                SyncRecords.insert {
                    it[id] = record.id
                    it[entityType] = record.entityType
                    it[accountId] = record.accountId
                    it[userId] = record.userId
                    it[payload] = record.payload
                    it[updatedAt] = record.updatedAt
                }
            }
        }
    }
}

data class SyncRecordRow(
    val id: String,
    val entityType: String,
    val accountId: String?,
    val userId: String?,
    val payload: String,
    val updatedAt: String,
)
