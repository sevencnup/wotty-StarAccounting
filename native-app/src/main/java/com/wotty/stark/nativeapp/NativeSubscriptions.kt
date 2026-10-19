package com.wotty.stark.nativeapp

import org.json.JSONObject
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.YearMonth
import java.time.format.DateTimeFormatter

internal data class NativeSubscription(
    val id: String,
    val userId: String,
    val accountId: String,
    val name: String,
    val amount: Double,
    val billingDay: Int,
    val category: String,
    val platform: String,
    val paymentMethod: String? = null,
    val startDate: String,
    val isActive: Boolean,
    val createdAt: String,
    val updatedAt: String,
)

internal fun JSONObject.toNativeSubscription(accountIdFallback: String = ""): NativeSubscription = NativeSubscription(
    id = optString("id"),
    userId = optString("userId"),
    accountId = optString("accountId").ifBlank { accountIdFallback },
    name = optString("name", "周期支出").ifBlank { "周期支出" },
    amount = optDouble("amount", 0.0).takeIf(Double::isFinite) ?: 0.0,
    billingDay = optInt("billingDay", 1).coerceIn(1, 31),
    category = optString("category", "其他").ifBlank { "其他" },
    platform = optString("platform", "其他").ifBlank { "其他" },
    paymentMethod = optString("paymentMethod").takeIf(String::isNotBlank),
    startDate = optString("startDate"),
    isActive = optBoolean("isActive", true),
    createdAt = optString("createdAt"),
    updatedAt = optString("updatedAt"),
)

internal fun NativeSubscription.toPayload(): JSONObject = JSONObject()
    .put("id", id)
    .put("userId", userId)
    .put("accountId", accountId)
    .put("name", name)
    .put("amount", amount)
    .put("billingDay", billingDay)
    .put("category", category)
    .put("platform", platform)
    .put("paymentMethod", paymentMethod ?: JSONObject.NULL)
    .put("startDate", startDate)
    .put("isActive", isActive)
    .put("createdAt", createdAt)
    .put("updatedAt", updatedAt)

internal fun buildDueSubscriptionEntries(
    subscriptions: List<NativeSubscription>,
    existing: List<LedgerEntry>,
    accountId: String,
    userId: String,
    today: LocalDate = LocalDate.now(),
    generatedAt: String = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
): List<LedgerEntry> {
    val existingIds = existing.mapTo(mutableSetOf()) { it.id }
    val existingOrders = existing.mapNotNullTo(mutableSetOf()) { it.orderId }
    val candidates = mutableListOf<LedgerEntry>()
    val currentMonth = YearMonth.from(today)

    subscriptions.asSequence()
        .filter { it.isActive && it.accountId == accountId && it.amount > 0.0 && it.amount.isFinite() }
        .forEach { subscription ->
            val startDate = runCatching { LocalDate.parse(subscription.startDate.take(10)) }.getOrNull() ?: return@forEach
            val startMonth = YearMonth.from(startDate)
            var month = startMonth
            while (!month.isAfter(currentMonth)) {
                val dueDate = month.atDay(subscription.billingDay.coerceIn(1, month.lengthOfMonth()))
                val orderId = "subscription:${subscription.id}:${month}"
                val transactionId = "subscription-${subscription.id}-${month}"
                if (!dueDate.isBefore(startDate) && !dueDate.isAfter(today) && transactionId !in existingIds && orderId !in existingOrders) {
                    val dateText = dueDate.atTime(12, 0).format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                    candidates += LedgerEntry(
                        id = transactionId,
                        title = subscription.name,
                        category = "${subscription.category} · ${subscription.platform}",
                        amount = java.math.BigDecimal.valueOf(subscription.amount)
                            .setScale(2, java.math.RoundingMode.HALF_UP)
                            .toDouble(),
                        type = EntryType.EXPENSE,
                        dayLabel = dueDate.toString(),
                        transactionDate = dueDate.toString(),
                        date = dateText,
                        merchant = subscription.name,
                        description = "周期支出自动记账 · ${subscription.name}",
                        platform = subscription.platform,
                        orderId = orderId,
                        paymentMethod = subscription.paymentMethod,
                        status = "SUCCESS",
                        userId = userId,
                        accountId = accountId,
                        createdAt = generatedAt,
                        updatedAt = generatedAt,
                    )
                    existingIds += transactionId
                    existingOrders += orderId
                }
                month = month.plusMonths(1)
            }
        }
    return candidates.sortedByDescending { it.date }
}
