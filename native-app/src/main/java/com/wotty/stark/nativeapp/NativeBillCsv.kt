package com.wotty.stark.nativeapp

import java.math.BigDecimal

private val nativeBillCsvHeaders = listOf(
    "流水ID",
    "日期",
    "类型",
    "分类",
    "备注归类",
    "商户",
    "平台",
    "金额",
    "支付方式",
    "状态",
    "订单号",
    "说明",
    "贷款ID",
)

internal fun serializeNativeTransactionsToCsv(entries: List<LedgerEntry>): String {
    val rows = buildList {
        add(nativeBillCsvHeaders)
        entries.forEach { entry ->
            val categoryAndPlatform = entry.category.split(" ·", limit = 2)
            val type = when (entry.type) {
                EntryType.INCOME -> "收入"
                EntryType.EXPENSE -> "支出"
                EntryType.TRANSFER -> "转账"
                EntryType.REPAYMENT -> "还款"
            }
            val amount = if (entry.amount.isFinite()) {
                BigDecimal.valueOf(entry.amount).stripTrailingZeros().toPlainString()
            } else {
                "0"
            }
            add(
                listOf(
                    entry.id,
                    entry.date,
                    type,
                    categoryAndPlatform.firstOrNull().orEmpty(),
                    entry.remarkCategory.orEmpty(),
                    entry.merchant,
                    entry.platform.ifBlank { categoryAndPlatform.getOrElse(1) { "" }.trim() },
                    amount,
                    entry.paymentMethod.orEmpty(),
                    entry.status.orEmpty(),
                    entry.orderId.orEmpty(),
                    entry.description,
                    entry.loanId.orEmpty(),
                ),
            )
        }
    }
    return rows.joinToString(separator = "\r\n") { row -> row.joinToString(",", transform = ::escapeCsvCell) } + "\r\n"
}

private fun escapeCsvCell(value: String): String {
    if (value.none { it == ',' || it == '"' || it == '\r' || it == '\n' }) return value
    return "\"${value.replace("\"", "\"\"")}\""
}
