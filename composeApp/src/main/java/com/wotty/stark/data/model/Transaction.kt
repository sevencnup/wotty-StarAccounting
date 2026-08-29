package com.wotty.stark.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Transaction(
    val id: String = "",
    val userId: String,
    val accountId: String,
    val amount: Double,
    val type: TransactionType,
    val category: String,
    val platform: String,
    val merchant: String? = null,
    val date: String,
    val description: String? = null,
    val orderId: String? = null,
    val paymentMethod: String? = null,
    val status: String? = null,
    val loanId: String? = null,
    /** 备注归类（预留，Web 端已启用）：给转账等账单手动指定的消费分类 */
    val remarkCategory: String? = null,
    val createdAt: String = "",
    val updatedAt: String = ""
)

@Serializable
enum class TransactionType {
    INCOME, EXPENSE, TRANSFER, REPAYMENT
}
