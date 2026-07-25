package com.wotty.stark.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Budget(
    val id: String = "",
    val userId: String,
    val accountId: String,
    val amount: Double,
    val category: String = "ALL",
    val period: BudgetPeriod = BudgetPeriod.MONTHLY,
    val createdAt: String = "",
    val updatedAt: String = "",
    val alertPercent: Int = 80,
    val platform: String? = null,
    val scopeType: BudgetScopeType = BudgetScopeType.GLOBAL
)

@Serializable
enum class BudgetPeriod { MONTHLY, YEARLY }

@Serializable
enum class BudgetScopeType { GLOBAL, CATEGORY, PLATFORM }
