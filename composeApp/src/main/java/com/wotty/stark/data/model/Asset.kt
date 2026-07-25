package com.wotty.stark.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Asset(
    val id: String = "",
    val userId: String,
    val accountId: String,
    val name: String,
    val type: AssetType,
    val balance: Double = 0.0,
    val currency: String = "CNY",
    val createdAt: String = "",
    val updatedAt: String = ""
)

@Serializable
enum class AssetType {
    CASH, BANK_CARD, ALIPAY, WECHAT, INVESTMENT, OTHER
}
