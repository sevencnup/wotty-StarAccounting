package com.wotty.stark.nativeapp

import org.json.JSONArray
import org.json.JSONObject
import java.time.LocalDate
import java.time.YearMonth
import java.util.Locale
import kotlin.math.roundToLong

internal enum class NativeSavingsExpenseKind {
    FIXED,
    TEMPORARY,
}

internal data class NativeSavingsExpenseItem(
    val name: String,
    val kind: NativeSavingsExpenseKind,
    val amount: Double,
)

internal enum class NativeSavingsExpenseMatchStatus {
    UNMATCHED,
    PARTIAL,
    MATCHED,
    OVER,
}

internal data class NativeSavingsExpenseMatch(
    val item: NativeSavingsExpenseItem,
    val matchedAmount: Double,
    val matchedTransactionCount: Int,
    val status: NativeSavingsExpenseMatchStatus,
)

internal data class NativeSavingsPlanAllocation(
    val period: String,
    val planCount: Int,
    val fixedExpense: Double,
    val temporaryExpense: Double,
    val plannedDeposit: Double,
    val recordedDeposit: Double,
    val pendingDeposit: Double,
    val completedPlanCount: Int,
    val pendingPlanCount: Int,
    val skippedPlanCount: Int,
    val plannedSalary: Double,
    val previousBalance: Double,
    val projectedRemaining: Double?,
    val expenseItems: List<NativeSavingsExpenseItem>,
)

private const val NATIVE_PREVIOUS_BALANCE_COLUMN = "上月结余"

/** Resolve the plan row month using the same payday rollover as the web summary. */
internal fun nativeSavingsPlanPeriod(
    reportingMonth: String,
    salaryDay: Int,
    referenceDate: LocalDate = LocalDate.now(),
): String {
    if (reportingMonth.matches(Regex("\\d{4}"))) return reportingMonth
    val selected = runCatching { YearMonth.parse(reportingMonth) }.getOrElse { YearMonth.from(referenceDate) }
    val day = salaryDay.coerceIn(1, 28)
    val isCurrentMonth = selected.year == referenceDate.year && selected.monthValue == referenceDate.monthValue
    return if (isCurrentMonth && referenceDate.dayOfMonth < day) selected.minusMonths(1).toString() else selected.toString()
}

internal fun summarizeNativeSavingsPlanAllocation(
    goals: List<NativeSavingsGoal>,
    plans: List<NativeSavingsPlan>,
    period: String,
): NativeSavingsPlanAllocation {
    val annual = period.matches(Regex("\\d{4}"))
    val goalsById = goals.associateBy { it.id }
    val configs = goals.associate { it.id to parseNativeSavingsJson(it.planConfig) }
    val selectedPlans = linkedMapOf<String, NativeSavingsPlan>()

    plans.sortedBy { it.updatedAt }.forEach { plan ->
        if (if (annual) !plan.month.startsWith("$period-") else plan.month != period) return@forEach
        val goal = goalsById[plan.goalId] ?: return@forEach
        val config = configs[goal.id] ?: JSONObject()
        val frequency = config.optString("frequency").takeIf { it == "MONTHLY" || it == "ALTERNATE" }
        val planFrequency = nativeSavingsPlanFrequency(plan)
        if (frequency != null && planFrequency != null && frequency != planFrequency) return@forEach

        val key = "${plan.goalId}:${plan.month}"
        val selected = selectedPlans[key]
        if (frequency != null && nativeSavingsPlanFrequency(selected) == frequency && planFrequency == null) return@forEach
        selectedPlans[key] = plan
    }

    val expenseItems = linkedMapOf<String, NativeSavingsExpenseItem>()
    val nonemptyRows = mutableListOf<NativeSavingsPlan>()
    var fixedExpense = 0.0
    var temporaryExpense = 0.0
    var plannedDeposit = 0.0
    var recordedDeposit = 0.0
    var pendingDeposit = 0.0
    var completedPlanCount = 0
    var pendingPlanCount = 0
    var skippedPlanCount = 0
    var plannedSalary = 0.0
    var previousBalance = 0.0

    selectedPlans.values.forEach { plan ->
        val config = configs[plan.goalId] ?: JSONObject()
        val temporaryColumns = config.optStringArray("temporaryColumns")
        val expenses = parseNativeSavingsExpenses(plan.expenses)
            .filterValues { it > 0.0 }
            .filterKeys { it != NATIVE_PREVIOUS_BALANCE_COLUMN }
        val salary = positiveNativePlanAmount(plan.salary)
        val balance = positiveNativePlanAmount(parseNativeSavingsExpenses(plan.expenses)[NATIVE_PREVIOUS_BALANCE_COLUMN])
        val deposit = positiveNativePlanAmount(plan.amount)
        val actualDeposit = nativeSavingsPlanRecordedAmount(plan)

        expenses.forEach { (name, amount) ->
            val kind = if (name in temporaryColumns) NativeSavingsExpenseKind.TEMPORARY else NativeSavingsExpenseKind.FIXED
            if (kind == NativeSavingsExpenseKind.TEMPORARY) temporaryExpense += amount else fixedExpense += amount
            val key = "$kind:$name"
            val current = expenseItems[key]
            expenseItems[key] = NativeSavingsExpenseItem(name, kind, (current?.amount ?: 0.0) + amount)
        }

        if (salary == 0.0 && balance == 0.0 && deposit == 0.0 && actualDeposit == 0.0 && expenses.isEmpty()) return@forEach
        nonemptyRows += plan
        plannedSalary += salary
        previousBalance += balance
        plannedDeposit += deposit
        when (plan.status) {
            "COMPLETED" -> {
                recordedDeposit += actualDeposit
                completedPlanCount += 1
            }
            "PENDING" -> {
                pendingDeposit += deposit
                pendingPlanCount += 1
            }
            "SKIPPED" -> skippedPlanCount += 1
        }
    }

    val projectedRemaining = if (!annual && nonemptyRows.size == 1) {
        val row = nonemptyRows.single()
        val rowExpenses = parseNativeSavingsExpenses(row.expenses)
            .filterKeys { it != NATIVE_PREVIOUS_BALANCE_COLUMN }
            .values.sumOf(::positiveNativePlanAmount)
        positiveNativePlanAmount(row.salary)
            + positiveNativePlanAmount(parseNativeSavingsExpenses(row.expenses)[NATIVE_PREVIOUS_BALANCE_COLUMN])
            - rowExpenses
            - positiveNativePlanAmount(row.amount)
    } else null

    return NativeSavingsPlanAllocation(
        period = period,
        planCount = nonemptyRows.size,
        fixedExpense = fixedExpense,
        temporaryExpense = temporaryExpense,
        plannedDeposit = plannedDeposit,
        recordedDeposit = recordedDeposit,
        pendingDeposit = pendingDeposit,
        completedPlanCount = completedPlanCount,
        pendingPlanCount = pendingPlanCount,
        skippedPlanCount = skippedPlanCount,
        plannedSalary = plannedSalary,
        previousBalance = previousBalance,
        projectedRemaining = projectedRemaining,
        expenseItems = expenseItems.values.sortedWith(compareByDescending<NativeSavingsExpenseItem> { it.amount }.thenBy { it.name }),
    )
}

internal fun matchNativeSavingsPlanExpensesWithBills(
    items: List<NativeSavingsExpenseItem>,
    entries: List<LedgerEntry>,
    reportingPeriod: String,
    salaryDay: Int,
): List<NativeSavingsExpenseMatch> {
    val annual = reportingPeriod.matches(Regex("\\d{4}"))
    val cycleStart = if (annual) null else runCatching {
        YearMonth.parse(reportingPeriod).atDay(salaryDay.coerceIn(1, 28))
    }.getOrNull()
    val cycleEnd = cycleStart?.plusMonths(1)
    val periodExpenses = entries.filter { entry ->
        val classifiedType = if (!entry.remarkCategory.isNullOrBlank()) EntryType.EXPENSE else entry.type
        if (classifiedType != EntryType.EXPENSE) return@filter false
        val date = runCatching { LocalDate.parse(entry.transactionDate.take(10)) }.getOrNull() ?: return@filter false
        if (annual) {
            date.year.toString() == reportingPeriod
        } else {
            cycleStart != null && cycleEnd != null && date >= cycleStart && date < cycleEnd
        }
    }

    return items.map { item ->
        val keywords = nativeSavingsExpenseKeywords(item.name)
        val matches = periodExpenses.filter { entry ->
            val searchText = nativeTransactionSearchText(entry)
            keywords.any { keyword ->
                val normalized = normalizeNativeSavingsKeyword(keyword)
                normalized.isNotEmpty() && searchText.contains(normalized)
            }
        }
        val matchedCents = matches.sumOf { (it.amount * 100.0).roundToLong() }
        val plannedCents = (item.amount * 100.0).roundToLong()
        val status = when {
            matches.isEmpty() -> NativeSavingsExpenseMatchStatus.UNMATCHED
            matchedCents < plannedCents -> NativeSavingsExpenseMatchStatus.PARTIAL
            matchedCents > plannedCents -> NativeSavingsExpenseMatchStatus.OVER
            else -> NativeSavingsExpenseMatchStatus.MATCHED
        }
        NativeSavingsExpenseMatch(item, matchedCents / 100.0, matches.size, status)
    }
}

private fun nativeSavingsPlanFrequency(plan: NativeSavingsPlan?): String? = when (plan?.remark) {
    "单月存模式" -> "MONTHLY"
    "隔月存模式" -> "ALTERNATE"
    else -> null
}

private fun savingsPlanRecordedAmount(plan: NativeSavingsPlan): Double =
    if (plan.status != "COMPLETED") 0.0
    else (plan.actualAmount?.takeIf { it.isFinite() && it >= 0.0 } ?: plan.amount).coerceAtLeast(0.0)

private fun nativeSavingsPlanRecordedAmount(plan: NativeSavingsPlan): Double = savingsPlanRecordedAmount(plan)

private fun positiveNativePlanAmount(value: Double?): Double = value?.takeIf { it.isFinite() && it > 0.0 } ?: 0.0

private fun JSONObject.optStringArray(key: String): Set<String> {
    val array: JSONArray = optJSONArray(key) ?: return emptySet()
    return (0 until array.length()).mapNotNull { index ->
        array.optString(index).trim().takeIf(String::isNotEmpty)
    }.toSet()
}

private fun parseNativeSavingsJson(raw: String?): JSONObject = runCatching {
    JSONObject(raw?.takeIf(String::isNotBlank) ?: "{}")
}.getOrElse { JSONObject() }

private fun parseNativeSavingsExpenses(raw: String?): Map<String, Double> = runCatching {
    val json = JSONObject(raw?.takeIf(String::isNotBlank) ?: "{}")
    json.keys().asSequence()
        .filterNot { it.matches(Regex("\\d+")) }
        .mapNotNull { key ->
            val name = key.trim()
            name.takeIf(String::isNotEmpty)?.let { it to json.optDouble(key, 0.0).takeIf(Double::isFinite).orZero() }
        }
        .toMap()
}.getOrDefault(emptyMap())

private fun Double?.orZero(): Double = this ?: 0.0

private fun nativeSavingsExpenseKeywords(name: String): List<String> = when (name.trim().replace(Regex("\\s+"), "")) {
    "水电", "水电费" -> listOf("水电", "水电费", "水费", "电费")
    else -> listOf(name)
}

private fun normalizeNativeSavingsKeyword(value: String?): String =
    value.orEmpty().trim().replace(Regex("\\s+"), "").lowercase(Locale.ROOT)

private fun nativeTransactionSearchText(entry: LedgerEntry): String = listOf(
    entry.merchant,
    entry.description,
    entry.platform,
    entry.paymentMethod,
    entry.category,
    entry.orderId,
).filterNotNull()
    .filter { it.isNotBlank() }
    .joinToString(" ") { normalizeNativeSavingsKeyword(it) }
