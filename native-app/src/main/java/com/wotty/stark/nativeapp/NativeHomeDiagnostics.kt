package com.wotty.stark.nativeapp

import java.time.LocalDate
import java.time.LocalDateTime
import java.time.YearMonth
import java.time.format.DateTimeFormatter
import kotlin.math.roundToInt

internal data class NativeHomeBudgetAlert(
    val id: String,
    val title: String,
    val spent: Double,
    val budget: Double,
    val percent: Double,
    val tone: String,
)

internal data class NativeHomeInsight(
    val id: String,
    val title: String,
    val detail: String,
    val tone: String,
)

internal data class NativeHomeDashboardSummary(
    val income: Double,
    val expense: Double,
    val balance: Double,
    val budgetAlerts: List<NativeHomeBudgetAlert>,
    val insights: List<NativeHomeInsight>,
    val savingProgressPercent: Double,
    val nextLoanDueDays: Int?,
    val reportingPeriod: String,
)

private data class NativeHomeDateRange(val start: LocalDate, val endExclusive: LocalDate)

internal fun buildNativeHomeDashboardSummary(
    entries: List<LedgerEntry>,
    budgets: List<NativeBudget>,
    loans: List<NativeLoan>,
    savingsGoals: List<NativeSavingsGoal>,
    savingsPlans: List<NativeSavingsPlan>,
    reportingPeriod: String,
    today: LocalDate = LocalDate.now(),
): NativeHomeDashboardSummary {
    val currentRange = nativeHomeReportingRange(reportingPeriod)
    val previousKey = if (reportingPeriod.length == 4) {
        (reportingPeriod.toIntOrNull()?.minus(1) ?: today.year - 1).toString()
    } else {
        runCatching { YearMonth.parse(reportingPeriod).minusMonths(1).toString() }
            .getOrDefault(YearMonth.from(today).minusMonths(1).toString())
    }
    val previousRange = nativeHomeReportingRange(previousKey)
    val currentEntries = entries.filter { nativeHomeContains(currentRange, it.transactionDate.ifBlank { it.date }) }
    val previousEntries = entries.filter { nativeHomeContains(previousRange, it.transactionDate.ifBlank { it.date }) }
    val income = currentEntries.asSequence().filter { it.type == EntryType.INCOME }.sumOf(LedgerEntry::amount)
    val expenseEntries = currentEntries.filter { it.type == EntryType.EXPENSE }
    val expense = expenseEntries.sumOf(LedgerEntry::amount)
    val repayment = currentEntries.asSequence().filter { it.type == EntryType.REPAYMENT }.sumOf(LedgerEntry::amount)
    val savings = savingsPlans.asSequence()
        .filter { it.status == "COMPLETED" }
        .filter { plan -> nativeHomeContains(currentRange, plan.actualDate ?: plan.updatedAt) }
        .sumOf { plan -> (plan.actualAmount ?: plan.amount).takeIf(Double::isFinite) ?: 0.0 }
    val balance = income - expense - repayment - savings

    val budgetAlerts = budgets.map { budget ->
        val spent = calculateNativeBudgetSpent(entries, budget, reportingPeriod, expense)
        val percent = if (budget.amount > 0.0) (spent / budget.amount * 100.0).coerceIn(0.0, 100.0) else 0.0
        val title = when (budget.scopeType) {
            "GLOBAL" -> if (budget.period == "YEARLY") "年度总预算" else "本月总预算"
            "PLATFORM" -> "${budget.platform ?: "平台"}预算"
            else -> "${normalizeNativeHomeCategory(budget.category)}预算"
        }
        val tone = when {
            percent >= 100.0 -> "danger"
            percent >= budget.alertPercent -> "warn"
            else -> "safe"
        }
        NativeHomeBudgetAlert(budget.id, title, spent, budget.amount, percent, tone)
    }.sortedByDescending(NativeHomeBudgetAlert::percent).take(3)

    val insights = mutableListOf<NativeHomeInsight>()
    if (expenseEntries.isNotEmpty()) {
        val topCategory = expenseEntries
            .groupBy { normalizeNativeHomeCategory(it.category.substringBefore(" ·")) }
            .mapValues { (_, rows) -> rows.sumOf(LedgerEntry::amount) }
            .maxByOrNull { it.value }
        if (topCategory != null) {
            insights += NativeHomeInsight(
                id = "insight-top-category",
                title = "${topCategory.key}是本月最大支出项",
                detail = "已支出 ¥ ${topCategory.value.roundToInt()}，占总支出约 ${(topCategory.value / maxOf(expense, 1.0) * 100.0).roundToInt()}%",
                tone = "info",
            )
        }
    }

    val previousExpense = previousEntries.asSequence()
        .filter { it.type == EntryType.EXPENSE }
        .sumOf(LedgerEntry::amount)
    if (previousExpense > 0.0) {
        val change = (((expense - previousExpense) / previousExpense) * 100.0).roundToInt()
        insights += NativeHomeInsight(
            id = "insight-month-compare",
            title = if (change >= 0) "本月支出高于上月" else "本月支出低于上月",
            detail = "${if (change >= 0) "较上月增加" else "较上月下降"} ${kotlin.math.abs(change)}%，建议关注高频消费分类",
            tone = if (change >= 20) "warn" else "info",
        )
    }

    val riskyBudget = budgetAlerts.firstOrNull { it.tone != "safe" }
    if (riskyBudget != null) {
        insights += NativeHomeInsight(
            id = "insight-budget-alert",
            title = "${riskyBudget.title}接近上限",
            detail = "当前已使用 ${riskyBudget.percent.roundToInt()}%，${if (riskyBudget.tone == "danger") "已超过预算线" else "建议控制后续支出"}",
            tone = if (riskyBudget.tone == "danger") "danger" else "warn",
        )
    }

    val largeExpense = expenseEntries
        .sortedByDescending(LedgerEntry::amount)
        .firstOrNull { it.amount >= maxOf(500.0, expense * 0.12) }
    if (largeExpense != null) {
        val category = normalizeNativeHomeCategory(largeExpense.category)
        insights.add(
            index = 0,
            element = NativeHomeInsight(
                id = "insight-large-expense",
                title = "${category}出现大额支出",
                detail = "${largeExpense.merchant.trim().ifBlank { category }}支出 ¥ ${largeExpense.amount.roundToInt()}，记录时间 ${nativeHomeReadableDate(largeExpense.date, today)}",
                tone = if (largeExpense.amount >= maxOf(1200.0, expense * 0.2)) "danger" else "warn",
            ),
        )
    }

    val completedAmount = savingsPlans.sumOf(::nativeHomeRecordedDeposit)
    val savedAmount = if (savingsGoals.isNotEmpty()) {
        savingsGoals.sumOf { goal ->
            val goalRecorded = savingsPlans.asSequence()
                .filter { it.goalId == goal.id }
                .sumOf(::nativeHomeRecordedDeposit)
            maxOf(goal.currentAmount, goalRecorded)
        }
    } else {
        completedAmount
    }
    val goalTarget = savingsGoals.sumOf(NativeSavingsGoal::targetAmount)
    val plannedTarget = savingsPlans.sumOf { it.amount.takeIf(Double::isFinite) ?: 0.0 }
    val savingsTarget = if (goalTarget != 0.0) goalTarget else plannedTarget
    val savingsPercent = if (savingsTarget > 0.0) (savedAmount / savingsTarget * 100.0).coerceIn(0.0, 100.0) else 0.0

    val nextLoanDueDays = loans.asSequence()
        .filter { it.status != "PAID_OFF" && it.remainingAmount > 0.0 }
        .map { loan ->
            val currentMonth = YearMonth.from(today)
            fun dueDate(month: YearMonth) = month.atDay(loan.dueDate.coerceIn(1, month.lengthOfMonth()))
            val currentDue = dueDate(currentMonth)
            val due = if (currentDue.isBefore(today)) dueDate(currentMonth.plusMonths(1)) else currentDue
            java.time.temporal.ChronoUnit.DAYS.between(today, due).toInt().coerceAtLeast(0)
        }
        .minOrNull()

    return NativeHomeDashboardSummary(
        income = income,
        expense = expense,
        balance = balance,
        budgetAlerts = budgetAlerts,
        insights = insights.take(3),
        savingProgressPercent = savingsPercent,
        nextLoanDueDays = nextLoanDueDays,
        reportingPeriod = reportingPeriod,
    )
}

private fun nativeHomeReportingRange(period: String): NativeHomeDateRange {
    if (period.length == 4) {
        val year = period.toIntOrNull() ?: LocalDate.now().year
        val start = LocalDate.of(year, 1, 1)
        return NativeHomeDateRange(start, start.plusYears(1))
    }
    val month = runCatching { YearMonth.parse(period) }.getOrElse { YearMonth.now() }
    return NativeHomeDateRange(month.atDay(1), month.plusMonths(1).atDay(1))
}

private fun nativeHomeContains(range: NativeHomeDateRange, rawDate: String): Boolean {
    val date = runCatching { LocalDate.parse(rawDate.take(10)) }.getOrNull() ?: return false
    return date >= range.start && date < range.endExclusive
}

private fun nativeHomeRecordedDeposit(plan: NativeSavingsPlan): Double {
    if (plan.status != "COMPLETED") return 0.0
    return (plan.actualAmount ?: plan.amount).takeIf(Double::isFinite)?.coerceAtLeast(0.0) ?: 0.0
}

private fun normalizeNativeHomeCategory(category: String): String = when {
    category.contains("生活") -> "生活消费"
    category.contains("交") || category.contains("车") -> "交通出行"
    category.contains("餐") || category.contains("饮") -> "餐饮美食"
    category.contains("娱") -> "休闲娱乐"
    category.contains("购") -> "购物消费"
    category.contains("工") -> "工资收入"
    else -> category.ifBlank { "其他" }
}

private fun nativeHomeReadableDate(rawDate: String, today: LocalDate): String {
    val normalized = rawDate.replace(' ', 'T')
    val date = runCatching { LocalDateTime.parse(normalized).toLocalDate() }
        .getOrElse { runCatching { LocalDate.parse(rawDate.take(10)) }.getOrNull() }
        ?: return rawDate
    val time = rawDate.takeIf { it.length >= 16 }?.substring(11, 16) ?: "00:00"
    return when {
        date == today -> "今天 $time"
        date == today.minusDays(1) -> "昨天 $time"
        else -> date.format(DateTimeFormatter.ofPattern("MM-dd")) + " $time"
    }
}
