package com.wotty.stark.nativeapp

import java.time.LocalDate
import java.time.YearMonth

internal data class NativeSalaryCycleRange(
    val startInclusive: LocalDate,
    val endExclusive: LocalDate,
    val label: String,
)

internal data class NativeSalaryCycleAllocation(
    val range: NativeSalaryCycleRange,
    val income: Double,
    val expense: Double,
    val repayment: Double,
    val savings: Double,
) {
    val available: Double
        get() = income - expense - repayment - savings
}

/** Uses the same payday rollover as the Web dashboard for a selected reporting month. */
internal fun nativeSalaryCycleRange(
    reportingPeriod: String,
    salaryDay: Int,
    referenceDate: LocalDate = LocalDate.now(),
): NativeSalaryCycleRange {
    val year = reportingPeriod.toIntOrNull()?.takeIf { reportingPeriod.length == 4 }
    if (year != null) {
        val start = LocalDate.of(year, 1, 1)
        val end = start.plusYears(1)
        return NativeSalaryCycleRange(start, end, "${start} 至 ${end.minusDays(1)}")
    }

    val selectedMonth = runCatching { YearMonth.parse(reportingPeriod) }
        .getOrElse { YearMonth.from(referenceDate) }
    val day = salaryDay.coerceIn(1, 28)
    val cycleMonth = if (selectedMonth == YearMonth.from(referenceDate) && referenceDate.dayOfMonth < day) {
        selectedMonth.minusMonths(1)
    } else {
        selectedMonth
    }
    val start = cycleMonth.atDay(day)
    val end = start.plusMonths(1)
    return NativeSalaryCycleRange(start, end, "${start} 至 ${end.minusDays(1)}")
}

internal fun calculateNativeSalaryCycleAllocation(
    entries: List<LedgerEntry>,
    savingsPlans: List<NativeSavingsPlan>,
    reportingPeriod: String,
    salaryDay: Int,
    referenceDate: LocalDate = LocalDate.now(),
): NativeSalaryCycleAllocation {
    val range = nativeSalaryCycleRange(reportingPeriod, salaryDay, referenceDate)
    fun contains(value: String): Boolean {
        val date = runCatching { LocalDate.parse(value.take(10)) }.getOrNull() ?: return false
        return date >= range.startInclusive && date < range.endExclusive
    }

    val transactions = entries.filter { entry ->
        contains(entry.transactionDate.ifBlank { entry.date })
    }
    val income = transactions.asSequence()
        .filter { it.type == EntryType.INCOME }
        .sumOf(LedgerEntry::amount)
    val expense = transactions.asSequence()
        .filter { it.type == EntryType.EXPENSE }
        .sumOf(LedgerEntry::amount)
    val repayment = transactions.asSequence()
        .filter { it.type == EntryType.REPAYMENT }
        .sumOf(LedgerEntry::amount)
    val savings = savingsPlans.asSequence()
        .filter { it.status == "COMPLETED" }
        .filter { contains(it.actualDate?.takeIf(String::isNotBlank) ?: it.updatedAt) }
        .sumOf { plan ->
            (plan.actualAmount?.takeIf { it.isFinite() && it >= 0.0 } ?: plan.amount).coerceAtLeast(0.0)
        }

    return NativeSalaryCycleAllocation(range, income, expense, repayment, savings)
}
