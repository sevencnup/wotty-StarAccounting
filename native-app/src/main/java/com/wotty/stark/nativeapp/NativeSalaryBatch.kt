package com.wotty.stark.nativeapp

import java.time.LocalDateTime
import java.time.YearMonth
import java.time.format.DateTimeFormatter
import java.util.UUID

internal data class NativeSalaryMonthSelection(
    val selectedMonthKeys: List<String>,
    val pendingMonthKeys: List<String>,
    val skippedMonthKeys: List<String>,
)

private val nativeSalaryKeywordPattern = Regex("工资|薪资|薪酬")

internal fun isNativeSalaryIncome(entry: LedgerEntry): Boolean {
    if (entry.type != EntryType.INCOME) return false
    return nativeSalaryKeywordPattern.containsMatchIn(
        listOf(entry.category.substringBefore(" ·"), entry.merchant, entry.description)
            .filter(String::isNotBlank)
            .joinToString(" "),
    )
}

internal fun nativeSalaryMonthKey(entry: LedgerEntry): String? {
    val rawDate = entry.transactionDate.ifBlank { entry.date.take(10) }
    val rawMonth = rawDate.take(7)
    return runCatching { YearMonth.parse(rawMonth).toString() }.getOrNull()
}

internal fun nativeSalaryBatchMonthKeys(year: Int, months: Collection<Int>): List<String> {
    require(year in 2000..9999) { "补录年份需在 2000–9999 之间" }
    return months.asSequence()
        .filter { it in 1..12 }
        .distinct()
        .sorted()
        .map { YearMonth.of(year, it).toString() }
        .toList()
}

internal fun nativeExistingSalaryMonthKeys(entries: List<LedgerEntry>): Set<String> = entries.asSequence()
    .filter(::isNativeSalaryIncome)
    .mapNotNull(::nativeSalaryMonthKey)
    .toSet()

internal fun selectNativeSalaryBatchMonths(
    monthKeys: List<String>,
    existingEntries: List<LedgerEntry>,
): NativeSalaryMonthSelection = selectNativeSalaryBatchMonths(monthKeys, nativeExistingSalaryMonthKeys(existingEntries))

internal fun selectNativeSalaryBatchMonths(
    monthKeys: List<String>,
    existingSalaryMonthKeys: Set<String>,
): NativeSalaryMonthSelection {
    val normalizedKeys = monthKeys.distinct().sorted()
    return NativeSalaryMonthSelection(
        selectedMonthKeys = normalizedKeys,
        pendingMonthKeys = normalizedKeys.filterNot(existingSalaryMonthKeys::contains),
        skippedMonthKeys = normalizedKeys.filter(existingSalaryMonthKeys::contains),
    )
}

internal fun buildNativeSalaryBatchEntries(
    monthKeys: List<String>,
    amount: Double,
    payday: Int,
    platform: String,
    merchant: String,
    userId: String,
    accountId: String,
    now: String = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
): List<LedgerEntry> {
    require(amount.isFinite() && amount > 0.0) { "请输入大于 0 的每月工资金额" }
    require(payday in 1..28) { "发薪日需在 1–28 日之间" }
    val safeMerchant = merchant.trim().ifBlank { "工资补录" }
    val safePlatform = platform.trim().ifBlank { "银行卡" }
    return monthKeys.distinct().sorted().map { monthKey ->
        val month = YearMonth.parse(monthKey)
        val dateTime = month.atDay(payday).atTime(9, 0)
            .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
        val stableKey = "native-salary:$accountId:$monthKey"
        val stableId = "salary-${UUID.nameUUIDFromBytes(stableKey.toByteArray(Charsets.UTF_8))}"
        LedgerEntry(
            id = stableId,
            title = safeMerchant,
            category = "工资 · $safePlatform",
            amount = amount,
            type = EntryType.INCOME,
            dayLabel = dateTime.take(16),
            transactionDate = dateTime.take(10),
            date = dateTime,
            merchant = safeMerchant,
            description = "历史工资补录",
            platform = safePlatform,
            orderId = "salary-batch:$monthKey",
            status = "已补录",
            userId = userId,
            accountId = accountId,
            createdAt = now,
            updatedAt = now,
        )
    }
}
