package com.wotty.stark.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Loan(
    val id: String = "",
    val userId: String,
    val accountId: String,
    val platform: String,
    val totalAmount: Double,
    val remainingAmount: Double,
    val periods: Int,
    val paidPeriods: Int = 0,
    val monthlyPayment: Double,
    val dueDate: Int,
    val status: LoanStatus = LoanStatus.ACTIVE,
    val matchKeywords: String? = null,
    val createdAt: String = "",
    val updatedAt: String = ""
)

@Serializable
enum class LoanStatus { ACTIVE, PAID_OFF, OVERDUE }
