package com.wotty.stark.data.local

import kotlinx.serialization.KSerializer
import kotlinx.serialization.json.Json
import platform.Foundation.*

/**
 * iOS 平台文件读写实现
 * 使用 NSDocumentDirectory 存储 JSON 文件
 */
actual class PlatformFileHelper {

    private val json = Json {
        ignoreUnknownKeys = true
        prettyPrint = true
        coerceInputValues = true
    }

    private val documentsDir: String
        get() {
            val paths = NSSearchPathForDirectoriesInDomains(
                NSDocumentDirectory, NSUserDomainMask, true
            )
            return (paths.first() as String) + "/data"
        }

    private fun filePath(filename: String): String = "$documentsDir/$filename"

    actual suspend fun <T> readJsonFile(filename: String, serializer: KSerializer<T>): T? {
        val path = filePath(filename)
        if (!NSFileManager.defaultManager.fileExistsAtPath(path)) return null
        val content = NSString.stringWithContentsOfFile(path, NSUTF8StringEncoding, null)
            ?: return null
        return json.decodeFromString(serializer, content as String)
    }

    actual suspend fun <T> writeJsonFile(filename: String, data: T, serializer: KSerializer<T>) {
        val path = filePath(filename)
        val dir = (path as NSString).stringByDeletingLastPathComponent
        NSFileManager.defaultManager.createDirectoryAtPath(dir, true, null, null)
        val content = json.encodeToString(serializer, data)
        (content as NSString).writeToFile(path, true, NSUTF8StringEncoding, null)
    }

    @Suppress("UNCHECKED_CAST")
    actual suspend fun <T> readListJsonFile(filename: String, serializer: KSerializer<T>): List<T> {
        val path = filePath(filename)
        if (!NSFileManager.defaultManager.fileExistsAtPath(path)) return emptyList()
        val content = NSString.stringWithContentsOfFile(path, NSUTF8StringEncoding, null)
            ?: return emptyList()
        val listSerializer = kotlinx.serialization.builtins.ListSerializer(serializer)
        return json.decodeFromString(listSerializer, content as String)
    }

    actual suspend fun <T> writeListJsonFile(filename: String, data: List<T>, serializer: KSerializer<T>) {
        val path = filePath(filename)
        val dir = (path as NSString).stringByDeletingLastPathComponent
        NSFileManager.defaultManager.createDirectoryAtPath(dir, true, null, null)
        val listSerializer = kotlinx.serialization.builtins.ListSerializer(serializer)
        val content = json.encodeToString(listSerializer, data)
        (content as NSString).writeToFile(path, true, NSUTF8StringEncoding, null)
    }
}
