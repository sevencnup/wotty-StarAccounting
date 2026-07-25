package com.wotty.stark.data.model

import kotlinx.serialization.Serializable

/**
 * 数据模式枚举
 */
@Serializable
enum class DataMode {
    LOCAL,  // 本地 JSON 存储
    CLOUD   // 云端数据库
}
