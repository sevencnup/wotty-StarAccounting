package com.wotty.stark.nativeapp

import java.math.BigDecimal
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.OffsetDateTime
import java.time.format.DateTimeFormatter
import java.util.Locale
import java.util.UUID

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

internal enum class NativeBillImportSource(val label: String) {
    WECHAT("微信"),
    ALIPAY("支付宝"),
    STARK("本应用导出"),
}

internal data class NativeBillImportItem(
    val lineNumber: Int,
    val rawData: String,
    val entry: LedgerEntry,
    val duplicateReason: String? = null,
)

internal data class NativeBillImportIssue(
    val lineNumber: Int,
    val rawData: String,
    val message: String,
    val errorType: String = "PARSE",
)

internal data class NativeBillImportPreview(
    val fileName: String,
    val source: NativeBillImportSource,
    val rows: List<NativeBillImportItem>,
    val issues: List<NativeBillImportIssue>,
)

internal data class NativeImportFailedRow(
    val lineNumber: Int,
    val rawData: String,
    val errorMessage: String,
    val errorType: String,
)

internal data class NativeBillImportResult(
    val imported: Int,
    val skipped: Int,
    val errors: Int,
    val failedRows: List<NativeImportFailedRow> = emptyList(),
    val loanRepayments: Int = 0,
    val loanRepaymentAmount: Double = 0.0,
)

internal data class NativeImportError(
    val id: String,
    val userId: String,
    val accountId: String,
    val fileName: String,
    val lineNumber: Int,
    val rawData: String,
    val errorMessage: String,
    val errorType: String,
    val resolved: Boolean,
    val createdAt: String,
)

internal fun NativeImportError.toPayload(): org.json.JSONObject = org.json.JSONObject()
    .put("id", id)
    .put("userId", userId)
    .put("accountId", accountId)
    .put("fileName", fileName)
    .put("lineNumber", lineNumber)
    .put("rawData", rawData)
    .put("errorMessage", errorMessage)
    .put("errorType", errorType)
    .put("resolved", resolved)
    .put("createdAt", createdAt)

internal fun org.json.JSONObject.toNativeImportError(accountIdFallback: String = ""): NativeImportError = NativeImportError(
    id = optString("id"),
    userId = optString("userId"),
    accountId = optString("accountId").ifBlank { accountIdFallback },
    fileName = optString("fileName"),
    lineNumber = optInt("lineNumber"),
    rawData = optString("rawData"),
    errorMessage = optString("errorMessage"),
    errorType = optString("errorType", "IMPORT"),
    resolved = optBoolean("resolved"),
    createdAt = optString("createdAt"),
)

private data class NativeCsvRecord(val cells: List<String>, val lineNumber: Int, val rawData: String)
private data class NativeCsvParseResult(val records: List<NativeCsvRecord>, val issues: List<NativeBillImportIssue>)

private fun parseNativeCsvRecords(content: String): NativeCsvParseResult {
    val records = mutableListOf<NativeCsvRecord>()
    val issues = mutableListOf<NativeBillImportIssue>()
    var cells = mutableListOf<String>()
    val cell = StringBuilder()
    var quoted = false
    var physicalLine = 1
    var recordStartLine = 1
    var recordStartIndex = 0
    var index = 0

    fun finishRecord(endExclusive: Int) {
        cells += cell.toString().trim()
        if (cells.any(String::isNotBlank)) {
            records += NativeCsvRecord(cells.toList(), recordStartLine, content.substring(recordStartIndex, endExclusive))
        }
        cells = mutableListOf()
        cell.setLength(0)
    }

    while (index < content.length) {
        val char = content[index]
        when {
            char == '"' && quoted && content.getOrNull(index + 1) == '"' -> {
                cell.append('"')
                index += 1
            }
            char == '"' -> quoted = !quoted
            char == ',' && !quoted -> {
                cells += cell.toString().trim()
                cell.setLength(0)
            }
            (char == '\n' || char == '\r') && !quoted -> {
                if (char == '\r' && content.getOrNull(index + 1) == '\n') index += 1
                finishRecord(index + 1)
                physicalLine += 1
                recordStartLine = physicalLine
                recordStartIndex = index + 1
            }
            else -> {
                cell.append(char)
                if (char == '\n' || char == '\r' && content.getOrNull(index + 1) != '\n') physicalLine += 1
            }
        }
        index += 1
    }

    if (quoted) {
        issues += NativeBillImportIssue(
            lineNumber = recordStartLine,
            rawData = content.substring(recordStartIndex),
            message = "CSV 引号没有闭合",
        )
    } else if (recordStartIndex < content.length || cell.isNotEmpty() || cells.isNotEmpty()) {
        finishRecord(content.length)
    }
    return NativeCsvParseResult(records, issues)
}

private fun normalizeNativeHeader(value: String): String = value
    .removePrefix("\uFEFF")
    .filterNot { it.isWhitespace() || it == '\'' || it == '"' || it == '「' || it == '」' || it == '『' || it == '』' }

private fun nativeHeaderIndex(headers: List<String>, candidates: List<String>): Int {
    val normalized = headers.map(::normalizeNativeHeader)
    val names = candidates.map(::normalizeNativeHeader)
    val exact = normalized.indexOfFirst { it in names }
    if (exact >= 0) return exact
    return normalized.indexOfFirst { header -> names.any(header::contains) }
}

private fun nativeCell(record: NativeCsvRecord, headers: List<String>, candidates: List<String>): String {
    val index = nativeHeaderIndex(headers, candidates)
    return record.cells.getOrNull(index)?.trim().orEmpty()
}

private fun parseNativeAmount(value: String): Double? {
    val amount = value.trim().replace(Regex("[¥￥,，\\s]"), "").toBigDecimalOrNull() ?: return null
    if (amount.signum() == 0) return null
    return amount.abs().toDouble().takeIf(Double::isFinite)
}

private fun parseNativeDate(value: String): String? {
    val raw = value.trim().replace('T', ' ')
    val pattern = Regex("^(\\d{2,4})[-/.年](\\d{1,2})[-/.月](\\d{1,2})日?(?:\\s+(\\d{1,2}):(\\d{1,2})(?::(\\d{1,2}))?)?$")
    val match = pattern.matchEntire(raw)
    if (match != null) {
        val yearText = match.groupValues[1]
        val year = yearText.toIntOrNull() ?: return null
        val resolvedYear = if (yearText.length == 2) 2000 + year else year
        return runCatching {
            LocalDate.of(resolvedYear, match.groupValues[2].toInt(), match.groupValues[3].toInt())
                .atTime(match.groupValues[4].ifBlank { "0" }.toInt(), match.groupValues[5].ifBlank { "0" }.toInt(), match.groupValues[6].ifBlank { "0" }.toInt())
                .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
        }.getOrNull()
    }
    return runCatching {
        OffsetDateTime.parse(value.trim()).toLocalDateTime().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
    }.getOrNull() ?: runCatching {
        LocalDateTime.parse(raw, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss", Locale.ROOT))
            .format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
    }.getOrNull()
}

private fun nativeTypeLabel(value: String, category: String): EntryType {
    val normalized = value.trim().uppercase(Locale.ROOT)
    when (normalized) {
        "收入", "INCOME" -> return EntryType.INCOME
        "支出", "EXPENSE" -> return EntryType.EXPENSE
        "转账", "TRANSFER" -> return EntryType.TRANSFER
        "还款", "REPAYMENT" -> return EntryType.REPAYMENT
    }
    val combined = "$value$category"
    return when {
        Regex("转账|转出|转账红包").containsMatchIn(combined) -> EntryType.TRANSFER
        Regex("收入|收款|入账|转入").containsMatchIn(value) -> EntryType.INCOME
        else -> EntryType.EXPENSE
    }
}

private fun nativeSourceFor(headers: List<String>, fileName: String): NativeBillImportSource {
    val normalized = headers.map(::normalizeNativeHeader).toSet()
    if (listOf("流水ID", "日期", "类型", "平台", "金额").all { normalizeNativeHeader(it) in normalized }) {
        return NativeBillImportSource.STARK
    }
    val source = (fileName + headers.joinToString(",")).lowercase(Locale.ROOT)
    return if ("支付宝" in source || normalized.any { it.contains("交易创建时间") || it.contains("交易号") }) {
        NativeBillImportSource.ALIPAY
    } else {
        NativeBillImportSource.WECHAT
    }
}

internal fun parseNativeBillCsv(
    content: String,
    fileName: String,
    accountId: String,
    userId: String,
): NativeBillImportPreview {
    val withoutBom = content.removePrefix("\uFEFF")
    val parsed = parseNativeCsvRecords(withoutBom)
    val headerIndex = parsed.records.indexOfFirst { row ->
        val headers = row.cells
        val stark = listOf("流水ID", "日期", "类型", "平台", "金额").all { marker ->
            nativeHeaderIndex(headers, listOf(marker)) >= 0
        }
        stark || (
            nativeHeaderIndex(headers, listOf("交易时间", "交易日期", "支付时间", "交易创建时间", "付款时间")) >= 0 &&
                nativeHeaderIndex(headers, listOf("金额", "金额(元)", "金额（元）", "交易金额")) >= 0
            )
    }
    if (headerIndex < 0) {
        val issue = NativeBillImportIssue(1, withoutBom.lineSequence().firstOrNull().orEmpty(), "无法识别账单表头，请选择微信、支付宝或本应用导出的 CSV")
        return NativeBillImportPreview(fileName, nativeSourceFor(emptyList(), fileName), emptyList(), parsed.issues + issue)
    }

    val header = parsed.records[headerIndex]
    val headers = header.cells
    val source = nativeSourceFor(headers, fileName)
    val rows = mutableListOf<NativeBillImportItem>()
    val issues = parsed.issues.toMutableList()
    val now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))

    parsed.records.drop(headerIndex + 1).forEach { record ->
        val amountNames = listOf("金额", "金额(元)", "金额（元）", "金额/元", "交易金额")
        val dateNames = listOf("日期", "交易时间", "交易日期", "支付时间", "交易创建时间", "付款时间", "交易修改时间")
        val amountText = nativeCell(record, headers, amountNames)
        val dateText = nativeCell(record, headers, dateNames)
        val amount = parseNativeAmount(amountText)
        val date = parseNativeDate(dateText)
        if (amount == null || date == null) {
            issues += NativeBillImportIssue(
                lineNumber = record.lineNumber,
                rawData = record.rawData,
                message = when {
                    amount == null && date == null -> "金额或日期无效"
                    amount == null -> "金额无效或为零"
                    else -> "日期格式无法识别"
                },
            )
            return@forEach
        }

        val direction = nativeCell(record, headers, listOf("收/支", "收支", "收入/支出", "资金状态"))
        val categoryText = nativeCell(record, headers, listOf("分类", "交易分类", "交易类型", "支付类型", "类型"))
        val type = nativeTypeLabel(
            if (source == NativeBillImportSource.STARK) nativeCell(record, headers, listOf("类型")) else direction,
            categoryText,
        )
        val category = if (source == NativeBillImportSource.STARK) {
            categoryText.ifBlank { if (type == EntryType.INCOME) "收入" else if (type == EntryType.TRANSFER) "转账" else "其他" }
        } else {
            categoryText.ifBlank { when (type) { EntryType.INCOME -> "收入"; EntryType.TRANSFER -> "转账"; EntryType.REPAYMENT -> "还款"; EntryType.EXPENSE -> "其他" } }
        }
        val merchant = nativeCell(record, headers, listOf("商户", "交易对方", "商户名称", "收款方", "交易方", "对方名称", "对方账号"))
        val goods = nativeCell(record, headers, listOf("商品", "商品说明", "商品名称", "商品描述", "交易内容"))
        val remark = nativeCell(record, headers, listOf("备注", "附加信息"))
        val description = if (source == NativeBillImportSource.STARK) {
            nativeCell(record, headers, listOf("说明"))
        } else {
            listOf(goods, remark).filter(String::isNotBlank).joinToString(" - ")
        }
        val platform = if (source == NativeBillImportSource.STARK) {
            nativeCell(record, headers, listOf("平台")).ifBlank { "其他" }
        } else {
            source.label
        }
        val transactionId = if (source == NativeBillImportSource.STARK) nativeCell(record, headers, listOf("流水ID")) else ""
        val transactionDate = date.take(10)
        val entry = LedgerEntry(
            id = transactionId.ifBlank { UUID.randomUUID().toString() },
            title = merchant.ifBlank { description.ifBlank { category } },
            category = "$category · $platform",
            amount = amount,
            type = type,
            dayLabel = transactionDate,
            transactionDate = transactionDate,
            date = date,
            merchant = merchant,
            description = description,
            platform = platform,
            orderId = nativeCell(record, headers, listOf("订单号", "交易单号", "交易订单号", "商户单号", "商家订单号", "交易号")).takeIf(String::isNotBlank),
            paymentMethod = nativeCell(record, headers, listOf("支付方式", "付款方式", "收/付款方式")).takeIf(String::isNotBlank),
            status = nativeCell(record, headers, listOf("状态", "当前状态", "交易状态")).takeIf(String::isNotBlank),
            loanId = if (source == NativeBillImportSource.STARK) nativeCell(record, headers, listOf("贷款ID")).takeIf(String::isNotBlank) else null,
            remarkCategory = nativeCell(record, headers, listOf("备注归类")).takeIf(String::isNotBlank),
            userId = userId,
            accountId = accountId,
            createdAt = now,
            updatedAt = now,
        )
        rows += NativeBillImportItem(record.lineNumber, record.rawData, entry)
    }

    return NativeBillImportPreview(fileName, source, rows, issues)
}

internal fun markNativeBillDuplicates(
    preview: NativeBillImportPreview,
    existingEntries: List<LedgerEntry>,
): NativeBillImportPreview {
    val seenIds = existingEntries.mapTo(mutableSetOf()) { it.id }
    val seenOrders = existingEntries.mapNotNullTo(mutableSetOf()) { it.orderId?.takeIf(String::isNotBlank) }
    val marked = preview.rows.map { row ->
        val reason = when {
            row.entry.id in seenIds -> "流水 ID 已存在"
            !row.entry.orderId.isNullOrBlank() && row.entry.orderId in seenOrders -> "订单号已存在"
            else -> null
        }
        if (reason == null) {
            seenIds += row.entry.id
            row.entry.orderId?.takeIf(String::isNotBlank)?.let(seenOrders::add)
        }
        row.copy(duplicateReason = reason)
    }
    return preview.copy(rows = marked)
}

private fun normalizeLoanText(value: String): String = value.lowercase(Locale.ROOT)
    .filterNot { it.isWhitespace() || it in "-_/\\.,，。:：;；()（）【】[]{}" }

internal fun matchNativeLoanRepayment(entry: LedgerEntry, loans: List<NativeLoan>): NativeLoan? {
    if (entry.loanId != null || entry.type == EntryType.INCOME) return null
    val repaymentPattern = Regex("还款|偿还|还贷|信用卡(?:账单|还款)|贷款(?:账单|还款)")
    val rawText = listOf(entry.category, entry.merchant, entry.description, entry.paymentMethod, entry.remarkCategory)
        .filterNotNull().joinToString(" ")
    if (!repaymentPattern.containsMatchIn(rawText)) return null
    if (entry.type == EntryType.TRANSFER && !repaymentPattern.containsMatchIn(entry.remarkCategory.orEmpty())) return null
    val normalizedText = normalizeLoanText(rawText)
    val candidates = loans.mapNotNull { loan ->
        if (loan.status == "PAID_OFF" || loan.remainingAmount <= 0.0) return@mapNotNull null
        val terms = (listOf(loan.platform) + loan.matchKeywords.orEmpty().split(Regex("[,，;；\\n|]")))
            .map(::normalizeLoanText).filter { it.length >= 2 }
        val score = terms.filter(normalizedText::contains).maxOfOrNull(String::length) ?: return@mapNotNull null
        loan to score
    }
    val bestScore = candidates.maxOfOrNull { it.second } ?: return null
    val best = candidates.filter { it.second == bestScore }
    return best.singleOrNull()?.first
}

internal fun applyNativeImportRules(
    entries: List<LedgerEntry>,
    rules: List<NativeCategoryRule>,
): List<LedgerEntry> = entries.map { original ->
    rules.filter(NativeCategoryRule::isActive).fold(original) { current, rule ->
        if (nativeCategoryRuleMatches(current, rule)) current.copy(remarkCategory = rule.category.trim()) else current
    }
}
