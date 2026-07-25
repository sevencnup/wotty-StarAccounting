package com.wotty.stark.data.local

import android.content.Context
import kotlinx.serialization.KSerializer
import kotlinx.serialization.json.Json
import kotlinx.serialization.serializer
import java.io.File

/**
 * Android 平台文件读写实现
 * 使用 Context.filesDir/data/ 目录存储 JSON 文件
 */
actual class PlatformFileHelper(context: Context) {

    private val json = Json {
        ignoreUnknownKeys = true
        prettyPrint = true
        coerceInputValues = true
    }

    private val dataDir = File(context.filesDir, "data").also { it.mkdirs() }

    actual suspend fun <T> readJsonFile(filename: String, serializer: KSerializer<T>): T? {
        val file = File(dataDir, filename)
        if (!file.exists()) return null
        return json.decodeFromString(serializer, file.readText())
    }

    actual suspend fun <T> writeJsonFile(filename: String, data: T, serializer: KSerializer<T>) {
        val file = File(dataDir, filename)
        file.parentFile?.mkdirs()
        file.writeText(json.encodeToString(serializer, data))
    }

    @Suppress("UNCHECKED_CAST")
    actual suspend fun <T> readListJsonFile(filename: String, serializer: KSerializer<T>): List<T> {
        val file = File(dataDir, filename)
        if (!file.exists()) return emptyList()
        // 使用 ListSerializer 包装
        val listSerializer = kotlinx.serialization.builtins.ListSerializer(serializer)
        return json.decodeFromString(listSerializer, file.readText())
    }

    actual suspend fun <T> writeListJsonFile(filename: String, data: List<T>, serializer: KSerializer<T>) {
        val file = File(dataDir, filename)
        file.parentFile?.mkdirs()
        val listSerializer = kotlinx.serialization.builtins.ListSerializer(serializer)
        file.writeText(json.encodeToString(listSerializer, data))
    }
}
