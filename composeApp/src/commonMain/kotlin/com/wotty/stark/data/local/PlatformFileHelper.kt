package com.wotty.stark.data.local

import kotlinx.serialization.KSerializer

/**
 * 平台文件读写辅助类（expect）
 * Android: 使用 Context.filesDir
 * iOS: 使用 NSFileManager + NSDocumentDirectory
 */
expect class PlatformFileHelper {
    suspend fun <T> readJsonFile(filename: String, serializer: KSerializer<T>): T?
    suspend fun <T> writeJsonFile(filename: String, data: T, serializer: KSerializer<T>)
    suspend fun <T> readListJsonFile(filename: String, serializer: KSerializer<T>): List<T>
    suspend fun <T> writeListJsonFile(filename: String, data: List<T>, serializer: KSerializer<T>)
}
