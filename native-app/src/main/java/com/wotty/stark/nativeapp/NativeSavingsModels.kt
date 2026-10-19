package com.wotty.stark.nativeapp

import org.json.JSONObject

internal data class NativeSavingsGoal(
    val id: String,
    val userId: String = "",
    val accountId: String = "",
    val name: String,
    val targetAmount: Double,
    val currentAmount: Double,
    val deadline: String,
    val type: String = "LONG_TERM",
    val status: String,
    val depositType: String,
    val planConfig: String? = null,
    val createdAt: String = "",
    val updatedAt: String = "",
)

internal data class NativeSavingsPlan(
    val id: String,
    val goalId: String,
    val amount: Double,
    val actualAmount: Double?,
    val status: String,
    val month: String,
    val createdAt: String = "",
    val updatedAt: String = "",
    val expenses: String? = null,
    val remark: String? = null,
    val salary: Double? = null,
    val proofImage: String? = null,
    val actualDate: String? = null,
)

internal fun parseNativeSavingsGoal(raw: String): NativeSavingsGoal? = runCatching {
    val row = JSONObject(raw)
    NativeSavingsGoal(
        id = row.optString("id"),
        userId = row.optString("userId"),
        accountId = row.optString("accountId"),
        name = row.optString("name", "储蓄计划"),
        targetAmount = row.optDouble("targetAmount", 0.0),
        currentAmount = row.optDouble("currentAmount", 0.0),
        deadline = row.optNullableString("deadline").orEmpty(),
        type = row.optString("type", "LONG_TERM"),
        status = row.optString("status", "ACTIVE"),
        depositType = row.optString("depositType", "PRIVATE"),
        planConfig = row.optNullableString("planConfig"),
        createdAt = row.optString("createdAt"),
        updatedAt = row.optString("updatedAt"),
    )
}.getOrNull()

internal fun parseNativeSavingsPlan(raw: String): NativeSavingsPlan? = runCatching {
    val row = JSONObject(raw)
    NativeSavingsPlan(
        id = row.optString("id"),
        goalId = row.optString("goalId"),
        amount = row.optDouble("amount", 0.0),
        actualAmount = row.optDoubleOrNull("actualAmount"),
        status = row.optString("status", "PENDING"),
        month = row.optString("month"),
        createdAt = row.optString("createdAt"),
        updatedAt = row.optString("updatedAt"),
        expenses = row.optNullableString("expenses"),
        remark = row.optNullableString("remark"),
        salary = row.optDoubleOrNull("salary"),
        proofImage = row.optNullableString("proofImage"),
        actualDate = row.optNullableString("actualDate"),
    )
}.getOrNull()

internal fun NativeSavingsGoal.toPayload(userIdOverride: String? = null): JSONObject = JSONObject()
    .put("id", id)
    .put("userId", userIdOverride?.takeIf(String::isNotBlank) ?: userId)
    .put("accountId", accountId)
    .put("name", name)
    .put("targetAmount", targetAmount)
    .put("currentAmount", currentAmount)
    .put("deadline", deadline.takeIf(String::isNotBlank) ?: JSONObject.NULL)
    .put("type", type)
    .put("status", status)
    .put("depositType", depositType)
    .put("planConfig", planConfig ?: JSONObject.NULL)
    .put("createdAt", createdAt)
    .put("updatedAt", updatedAt)

internal fun NativeSavingsPlan.toPayload(): JSONObject = JSONObject()
    .put("id", id)
    .put("goalId", goalId)
    .put("amount", amount)
    .put("actualAmount", actualAmount ?: JSONObject.NULL)
    .put("status", status)
    .put("month", month)
    .put("createdAt", createdAt)
    .put("updatedAt", updatedAt)
    .put("expenses", expenses ?: JSONObject.NULL)
    .put("remark", remark ?: JSONObject.NULL)
    .put("salary", salary ?: JSONObject.NULL)
    .put("proofImage", proofImage ?: JSONObject.NULL)
    .put("actualDate", actualDate ?: JSONObject.NULL)

private fun JSONObject.optDoubleOrNull(key: String): Double? =
    if (isNull(key) || !has(key)) null else optDouble(key)

private fun JSONObject.optNullableString(key: String): String? =
    if (!has(key) || isNull(key)) null else optString(key).takeUnless { it.isBlank() || it == "null" }
