package com.wotty.stark.data.model

import kotlinx.serialization.Serializable

@Serializable
data class SavingsGoal(
    val id: String = "",
    val userId: String,
    val accountId: String,
    val name: String,
    val targetAmount: Double,
    val currentAmount: Double = 0.0,
    val deadline: String? = null,
    val type: SavingsGoalType = SavingsGoalType.LONG_TERM,
    val status: SavingsGoalStatus = SavingsGoalStatus.ACTIVE,
    val depositType: SavingsGoalDepositType = SavingsGoalDepositType.CASH,
    val planConfig: String? = null,
    val createdAt: String = "",
    val updatedAt: String = ""
)

@Serializable
data class SavingsPlan(
    val id: String = "",
    val goalId: String,
    val amount: Double,
    val status: SavingsPlanStatus = SavingsPlanStatus.PENDING,
    val month: String,
    val createdAt: String = "",
    val updatedAt: String = "",
    val expenses: String? = null,
    val remark: String? = null,
    val salary: Double? = 0.0,
    val proofImage: String? = null
)

@Serializable
enum class SavingsGoalType { MONTHLY, YEARLY, LONG_TERM, BI_MONTHLY_ODD, BI_MONTHLY_EVEN }

@Serializable
enum class SavingsGoalStatus { ACTIVE, COMPLETED, ARCHIVED }

@Serializable
enum class SavingsPlanStatus { PENDING, COMPLETED, SKIPPED }

@Serializable
enum class SavingsGoalDepositType { CASH, FIXED_TERM, HELP_DEPOSIT }
