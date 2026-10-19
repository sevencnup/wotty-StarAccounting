package com.wotty.stark.nativeapp

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper

/**
 * Private on-device storage shared by the native pages.
 * Each JSON payload keeps the complete Web entity shape while indexed columns
 * isolate local data from each cloud account's offline cache.
 */
internal class NativeEntityDatabase(context: Context) :
    SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    override fun onCreate(db: SQLiteDatabase) {
        db.execSQL(
            """CREATE TABLE $TABLE_ENTITIES (
                data_scope TEXT NOT NULL,
                account_id TEXT NOT NULL,
                entity_type TEXT NOT NULL,
                entity_id TEXT NOT NULL,
                payload TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                PRIMARY KEY (data_scope, account_id, entity_type, entity_id)
            )""".trimIndent(),
        )
        db.execSQL(
            "CREATE INDEX native_entities_lookup ON $TABLE_ENTITIES(data_scope, account_id, entity_type)",
        )
    }

    override fun onUpgrade(db: SQLiteDatabase, oldVersion: Int, newVersion: Int) {
        // Keep data in place; future schema changes must add explicit migrations.
    }

    fun readAll(scope: String, accountId: String, entityType: String): List<String> {
        val values = mutableListOf<String>()
        readableDatabase.query(
            TABLE_ENTITIES,
            arrayOf("payload"),
            "data_scope = ? AND account_id = ? AND entity_type = ?",
            arrayOf(scope, accountId, entityType),
            null,
            null,
            "updated_at DESC",
        ).use { cursor ->
            val payloadColumn = cursor.getColumnIndexOrThrow("payload")
            while (cursor.moveToNext()) values += cursor.getString(payloadColumn)
        }
        return values
    }

    fun replaceAll(scope: String, accountId: String, entityType: String, records: List<NativeStoredEntity>) {
        writableDatabase.beginTransaction()
        try {
            writableDatabase.delete(
                TABLE_ENTITIES,
                "data_scope = ? AND account_id = ? AND entity_type = ?",
                arrayOf(scope, accountId, entityType),
            )
            records.forEach { record -> write(writableDatabase, scope, accountId, entityType, record) }
            writableDatabase.setTransactionSuccessful()
        } finally {
            writableDatabase.endTransaction()
        }
    }

    fun upsert(scope: String, accountId: String, entityType: String, record: NativeStoredEntity) {
        write(writableDatabase, scope, accountId, entityType, record)
    }

    fun delete(scope: String, accountId: String, entityType: String, entityId: String) {
        writableDatabase.delete(
            TABLE_ENTITIES,
            "data_scope = ? AND account_id = ? AND entity_type = ? AND entity_id = ?",
            arrayOf(scope, accountId, entityType, entityId),
        )
    }

    private fun write(
        db: SQLiteDatabase,
        scope: String,
        accountId: String,
        entityType: String,
        record: NativeStoredEntity,
    ) {
        val values = ContentValues().apply {
            put("data_scope", scope)
            put("account_id", accountId)
            put("entity_type", entityType)
            put("entity_id", record.id)
            put("payload", record.payload)
            put("updated_at", record.updatedAt)
        }
        db.insertWithOnConflict(TABLE_ENTITIES, null, values, SQLiteDatabase.CONFLICT_REPLACE)
    }

    private companion object {
        const val DATABASE_NAME = "stark-native-ledger.db"
        const val DATABASE_VERSION = 1
        const val TABLE_ENTITIES = "native_entities"
    }
}

internal data class NativeStoredEntity(
    val id: String,
    val payload: String,
    val updatedAt: String,
)
