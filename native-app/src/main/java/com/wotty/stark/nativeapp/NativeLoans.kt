package com.wotty.stark.nativeapp

import android.app.DatePickerDialog
import androidx.compose.foundation.Canvas as ComposeCanvas
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Payments
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.TextButton
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDate
import java.time.YearMonth
import java.time.format.DateTimeFormatter
import java.time.temporal.ChronoUnit
import java.util.UUID

private val LoanInk = Color(0xFF1F2937)
private val LoanMuted = Color(0xFF7B8798)
private val LoanBlue = Color(0xFF0869C6)
private val LoanGreen = Color(0xFF0A966B)
private val LoanRed = Color(0xFFD94D5D)
private val LoanAmber = Color(0xFFF0A329)
private val LoanLine = Color(0xFFE8EDF3)
private val LoanSurface = Color.White
private val LoanPalette = listOf(
    Color(0xFF0A966B), Color(0xFF2A78D6), Color(0xFFDF9D35),
    Color(0xFFE87962), Color(0xFF8B5CF6), Color(0xFF06B6D4),
)

private data class LoanDueInfo(val date: LocalDate, val days: Int)

private fun loanDueInfo(loan: NativeLoan, today: LocalDate = LocalDate.now()): LoanDueInfo {
    fun dateFor(month: YearMonth) = month.atDay(loan.dueDate.coerceIn(1, month.lengthOfMonth()))
    val current = YearMonth.from(today)
    var target = dateFor(current)
    if (target.isBefore(today)) target = dateFor(current.plusMonths(1))
    return LoanDueInfo(target, ChronoUnit.DAYS.between(today, target).toInt().coerceAtLeast(0))
}

private fun loanMoney(value: Double): String = BigDecimal.valueOf(value.takeIf(Double::isFinite) ?: 0.0)
    .setScale(2, RoundingMode.HALF_UP)
    .toPlainString()

private fun loanDecimal(value: Double): String = BigDecimal.valueOf(value.takeIf(Double::isFinite) ?: 0.0)
    .stripTrailingZeros()
    .toPlainString()

private fun loanPercent(value: Double): String =
    BigDecimal.valueOf(value.takeIf(Double::isFinite) ?: 0.0).setScale(1, RoundingMode.HALF_UP).toPlainString()

@Composable
internal fun NativeLoanOverviewScreen(
    modifier: Modifier,
    loans: List<NativeLoan>,
    entries: List<LedgerEntry>,
    reportingMonth: String,
    accountId: String,
    userId: String,
    connected: Boolean,
    onConnect: () -> Unit,
    onSaveLoan: suspend (NativeLoan) -> Unit,
    onDeleteLoan: suspend (NativeLoan) -> Unit,
    onSaveRepayment: suspend (NativeLoan, Double, String, String, String) -> Unit,
) {
    val activeLoans = remember(loans) {
        loans.filter { it.status != "PAID_OFF" && it.remainingAmount > 0.0 }
    }
    val total = loans.sumOf { it.totalAmount.coerceAtLeast(0.0) }
    val remaining = activeLoans.sumOf { it.remainingAmount.coerceAtLeast(0.0) }
    val repaid = (total - loans.sumOf { it.remainingAmount.coerceAtLeast(0.0) }).coerceAtLeast(0.0)
    val progress = if (total > 0.0) (repaid / total * 100.0).coerceIn(0.0, 100.0) else 0.0
    val monthly = activeLoans.sumOf { it.monthlyPayment.coerceAtLeast(0.0) }
    val income = entries.asSequence()
        .filter { it.type == EntryType.INCOME }
        .filter { entry -> entry.transactionDate.take(10).startsWith(reportingMonth) }
        .sumOf { it.amount.coerceAtLeast(0.0) }
    val pressure = if (income > 0.0) monthly / income * 100.0 else null
    val pressureLabel = when {
        pressure == null -> "暂无收入数据"
        pressure <= 25.0 -> "压力可控"
        pressure <= 40.0 -> "需要关注"
        else -> "压力偏高"
    }
    val schedule = remember(activeLoans) {
        activeLoans.sortedBy { loanDueInfo(it).date }
    }
    val forecast = remember(activeLoans) {
        (0 until 6).map { monthIndex ->
            activeLoans.sumOf { loan ->
                val remainingPeriods = (loan.periods - loan.paidPeriods).coerceAtLeast(0)
                if (monthIndex < remainingPeriods) loan.monthlyPayment.coerceAtLeast(0.0) else 0.0
            }
        }
    }
    val maxRemainingMonths = activeLoans.maxOfOrNull { (it.periods - it.paidPeriods).coerceAtLeast(0) } ?: 0
    val estimatedCompletionYear = if (maxRemainingMonths > 0) LocalDate.now().year + (maxRemainingMonths + 11) / 12 else null
    val debts = remember(activeLoans, remaining) {
        activeLoans.sortedByDescending { it.remainingAmount }.mapIndexed { index, loan ->
            LoanDebtShare(loan, if (remaining > 0.0) loan.remainingAmount / remaining * 100.0 else 0.0, LoanPalette[index % LoanPalette.size])
        }
    }

    var editorOpen by remember { mutableStateOf(false) }
    var editingLoan by remember { mutableStateOf<NativeLoan?>(null) }
    var repaymentLoan by remember { mutableStateOf<NativeLoan?>(null) }
    var deleteCandidate by remember { mutableStateOf<NativeLoan?>(null) }
    var deleteError by remember { mutableStateOf("") }
    var deleting by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    LazyColumn(
        modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 18.dp, end = 18.dp, top = 8.dp, bottom = 104.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("贷款", color = LoanInk, fontSize = 23.sp, fontWeight = FontWeight.Black)
                    Text("还款进度、月供安排与贷款管理", color = LoanMuted, fontSize = 12.sp, modifier = Modifier.padding(top = 3.dp))
                }
                TextButton(onClick = { editingLoan = null; editorOpen = true }) {
                    Icon(Icons.Default.Add, contentDescription = null, tint = LoanBlue)
                    Text("新增贷款", color = LoanBlue)
                }
            }
        }
        item {
            Card(
                shape = RoundedCornerShape(15.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF8DC)),
                border = BorderStroke(1.dp, Color(0xFFF4D78A)),
            ) {
                Column(Modifier.fillMaxWidth().padding(horizontal = 13.dp, vertical = 10.dp)) {
                    Text("规划提醒", color = Color(0xFF9A6700), fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    Text("仅用于个人资金规划，不会实际执行还款。", color = Color(0xFF785811), fontSize = 11.sp, modifier = Modifier.padding(top = 3.dp))
                }
            }
        }
        if (!connected) item { LoanConnectNotice(onConnect) }
        item {
            LoanCard(padding = 16.dp) {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("还款控制中心", color = LoanGreen, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                            Spacer(Modifier.width(8.dp))
                            LoanPill("${activeLoans.size} 笔进行中", LoanBlue)
                        }
                        Text("待还本金总额", color = LoanMuted, fontSize = 12.sp, modifier = Modifier.padding(top = 13.dp))
                        Text("¥ ${loanMoney(remaining)}", color = LoanInk, fontSize = 28.sp, fontWeight = FontWeight.Black)
                        Text("已还清 ¥ ${loanMoney(repaid)} · 整体进度 ${progress.toInt()}%", color = LoanMuted, fontSize = 11.sp, modifier = Modifier.padding(top = 3.dp))
                    }
                    LoanProgressRing(progress, Modifier.size(82.dp))
                }
            }
        }
        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                LoanMetric("本月月供", monthly, "${activeLoans.size} 笔待还款", LoanBlue, Modifier.weight(1f))
                LoanMetric(
                    "还款压力",
                    pressureLabel,
                    pressure?.let { "占收入 ${it.toInt()}%" } ?: "暂无收入",
                    when { pressure == null -> LoanMuted; pressure <= 25.0 -> LoanGreen; pressure <= 40.0 -> LoanAmber; else -> LoanRed },
                    Modifier.weight(1f),
                )
                val nearest = schedule.firstOrNull()
                LoanMetric(
                    "下期到期",
                    nearest?.let { "${loanDueInfo(it).days} 天后" } ?: "--",
                    nearest?.let { "${it.platform} · ${loanDueInfo(it).date.format(DateTimeFormatter.ofPattern("MM-dd"))}" } ?: "已全部结清",
                    LoanBlue,
                    Modifier.weight(1f),
                )
            }
        }
        item {
            LoanCard(padding = 15.dp) {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text("未来6个月月供趋势", color = LoanInk, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                        Text("按现有贷款期数推演", color = LoanMuted, fontSize = 11.sp, modifier = Modifier.padding(top = 3.dp))
                    }
                    estimatedCompletionYear?.let { LoanPill("预计 $it 年结清", LoanGreen) }
                }
                LoanForecastChart(forecast, Modifier.fillMaxWidth().padding(top = 12.dp).height(132.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    (0 until 6).forEach { index ->
                        val month = YearMonth.now().plusMonths(index.toLong())
                        Text("${month.monthValue}月", color = LoanMuted, fontSize = 10.sp)
                    }
                }
                Text("统计收入范围：$reportingMonth", color = LoanMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 8.dp))
            }
        }
        if (debts.isNotEmpty()) {
            item {
                LoanCard(padding = 15.dp) {
                    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text("负债构成分析", color = LoanInk, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                            Text("各贷款待还本金占比", color = LoanMuted, fontSize = 11.sp, modifier = Modifier.padding(top = 3.dp))
                        }
                        LoanPill("共 ${debts.size} 笔", LoanBlue)
                    }
                    Row(Modifier.fillMaxWidth().padding(top = 11.dp), verticalAlignment = Alignment.CenterVertically) {
                        LoanDonut(debts, Modifier.size(104.dp))
                        Column(Modifier.weight(1f).padding(start = 13.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                            debts.forEach { share ->
                                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                                    Box(Modifier.size(8.dp).clip(CircleShape).background(share.color))
                                    Text(share.loan.platform, color = LoanInk, fontSize = 10.5.sp, modifier = Modifier.weight(1f).padding(start = 6.dp), maxLines = 1, overflow = TextOverflow.Ellipsis)
                                    Text("${loanPercent(share.percent)}%", color = LoanMuted, fontSize = 10.sp)
                                    Text("¥ ${loanMoney(share.loan.remainingAmount)}", color = LoanInk, fontSize = 10.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(start = 6.dp))
                                }
                            }
                        }
                    }
                }
            }
        }
        item {
            LoanCard(padding = 15.dp) {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text("还款日程", color = LoanInk, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                        Text("按到期时间排序", color = LoanMuted, fontSize = 11.sp, modifier = Modifier.padding(top = 3.dp))
                    }
                    LoanPill("${schedule.size} 笔待还", LoanAmber)
                }
                if (schedule.isEmpty()) {
                    Text("还款日程为空", color = LoanMuted, fontSize = 11.sp, modifier = Modifier.fillMaxWidth().padding(vertical = 24.dp))
                } else {
                    Column(Modifier.padding(top = 9.dp)) {
                        schedule.forEachIndexed { index, loan ->
                            if (index > 0) HorizontalDivider(color = LoanLine)
                            LoanScheduleRow(loan, index)
                        }
                    }
                }
            }
        }
        item {
            Row(Modifier.fillMaxWidth().padding(top = 3.dp), verticalAlignment = Alignment.CenterVertically) {
                Text("贷款组合", color = LoanInk, fontSize = 16.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                Text("${loans.size} 笔记录", color = LoanMuted, fontSize = 11.sp)
            }
        }
        if (loans.isEmpty()) {
            item {
                LoanCard(padding = 17.dp) {
                    Text(if (connected) "暂无贷款记录" else "本地账本还没有贷款", color = LoanInk, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    Text(if (connected) "新增后会显示还款节奏和进度。" else "连接云端或在本地模式下新增贷款后，这里会显示还款安排。", color = LoanMuted, fontSize = 11.sp, modifier = Modifier.padding(top = 5.dp))
                }
            }
        } else {
            items(loans.sortedBy { it.status == "PAID_OFF" }, key = { it.id }) { loan ->
                LoanPortfolioCard(
                    loan = loan,
                    onRepay = { repaymentLoan = loan },
                    onEdit = { editingLoan = loan; editorOpen = true },
                    onDelete = { deleteCandidate = loan; deleteError = "" },
                )
            }
        }
    }

    if (editorOpen) {
        LoanEditorSheet(
            loan = editingLoan,
            accountId = accountId,
            userId = userId,
            onClose = { editorOpen = false; editingLoan = null },
            onSave = onSaveLoan,
        )
    }
    repaymentLoan?.let { loan ->
        LoanRepaymentSheet(
            loan = loan,
            onClose = { repaymentLoan = null },
            onSave = onSaveRepayment,
        )
    }
    deleteCandidate?.let { loan ->
        AlertDialog(
            onDismissRequest = { if (!deleting) { deleteCandidate = null; deleteError = "" } },
            shape = RoundedCornerShape(22.dp),
            containerColor = Color(0xFFFBFCFE),
            title = { Text("删除这笔贷款？", color = LoanInk, fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(7.dp)) {
                    Text("${loan.platform} · 待还 ¥ ${loanMoney(loan.remainingAmount)}", color = LoanMuted, fontSize = 12.sp)
                    if (deleteError.isNotBlank()) Text(deleteError, color = LoanRed, fontSize = 11.sp)
                }
            },
            dismissButton = { TextButton(enabled = !deleting, onClick = { deleteCandidate = null; deleteError = "" }) { Text("取消") } },
            confirmButton = {
                TextButton(enabled = !deleting, onClick = {
                    scope.launch {
                        deleting = true
                        deleteError = ""
                        runCatching { onDeleteLoan(loan) }
                            .onSuccess { deleteCandidate = null }
                            .onFailure { deleteError = it.message ?: "贷款删除失败，请重试" }
                        deleting = false
                    }
                }) { Text(if (deleting) "删除中…" else "删除", color = LoanRed) }
            },
        )
    }
}

private data class LoanDebtShare(val loan: NativeLoan, val percent: Double, val color: Color)

@Composable
private fun LoanCard(
    modifier: Modifier = Modifier,
    padding: androidx.compose.ui.unit.Dp = 15.dp,
    color: Color = LoanSurface,
    content: @Composable () -> Unit,
) {
    Card(
        modifier = modifier.fillMaxWidth().border(1.dp, LoanLine, RoundedCornerShape(18.dp)),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = color),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) { Column(Modifier.padding(padding)) { content() } }
}

@Composable
private fun LoanPill(text: String, color: Color) {
    Text(
        text,
        modifier = Modifier.clip(CircleShape).background(color.copy(alpha = .09f)).padding(horizontal = 9.dp, vertical = 5.dp),
        color = color,
        fontSize = 10.sp,
        fontWeight = FontWeight.SemiBold,
        maxLines = 1,
    )
}

@Composable
private fun LoanConnectNotice(onConnect: () -> Unit) {
    LoanCard(padding = 8.dp) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Text("云端未连接 · 当前数据保存在本地账本", color = LoanMuted, fontSize = 10.5.sp, modifier = Modifier.weight(1f), maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text("连接", color = LoanBlue, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.clip(RoundedCornerShape(8.dp)).clickable(onClick = onConnect).padding(horizontal = 8.dp, vertical = 6.dp))
        }
    }
}

@Composable
private fun LoanMetric(label: String, primary: Double, detail: String, color: Color, modifier: Modifier) {
    LoanMetricBase(label, "¥ ${loanMoney(primary)}", detail, color, modifier)
}

@Composable
private fun LoanMetric(label: String, primary: String, detail: String, color: Color, modifier: Modifier) {
    LoanMetricBase(label, primary, detail, color, modifier)
}

@Composable
private fun LoanMetricBase(label: String, primary: String, detail: String, color: Color, modifier: Modifier) {
    LoanCard(modifier, padding = 10.dp) {
        Text(label, color = LoanMuted, fontSize = 10.5.sp, maxLines = 1)
        Text(primary, color = color, fontSize = 12.5.sp, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.padding(top = 4.dp))
        Text(detail, color = LoanMuted, fontSize = 9.5.sp, maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.padding(top = 3.dp))
    }
}

@Composable
private fun LoanProgressRing(progress: Double, modifier: Modifier = Modifier) {
    Box(modifier, contentAlignment = Alignment.Center) {
        ComposeCanvas(Modifier.fillMaxSize()) {
            val stroke = 7.dp.toPx()
            drawArc(Color(0xFFE6EDF5), -90f, 360f, false, style = Stroke(stroke))
            drawArc(LoanGreen, -90f, (progress.coerceIn(0.0, 100.0) * 3.6).toFloat(), false, style = Stroke(stroke, cap = StrokeCap.Round))
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("${progress.toInt()}%", color = LoanInk, fontSize = 16.sp, fontWeight = FontWeight.Black)
            Text("已还", color = LoanMuted, fontSize = 10.sp)
        }
    }
}

@Composable
private fun LoanForecastChart(values: List<Double>, modifier: Modifier = Modifier) {
    ComposeCanvas(modifier) {
        val top = 10f
        val bottom = size.height - 11f
        val maxValue = (values.maxOrNull() ?: 0.0).coerceAtLeast(1.0)
        val points = values.mapIndexed { index, value ->
            val x = if (values.size <= 1) size.width / 2f else size.width * index / (values.size - 1).toFloat()
            val y = bottom - (bottom - top) * (value / maxValue).toFloat()
            Offset(x, y)
        }
        repeat(3) { index ->
            val y = top + (bottom - top) * index / 2f
            drawLine(Color(0xFFEFF3F7), Offset(0f, y), Offset(size.width, y), strokeWidth = 1.dp.toPx())
        }
        if (points.isNotEmpty()) {
            val fillPath = Path().apply {
                moveTo(points.first().x, bottom)
                lineTo(points.first().x, points.first().y)
                points.drop(1).forEach { lineTo(it.x, it.y) }
                lineTo(points.last().x, bottom)
                close()
            }
            drawPath(
                fillPath,
                brush = Brush.verticalGradient(
                    colors = listOf(Color(0x480A966B), Color.Transparent),
                    startY = top,
                    endY = bottom,
                ),
            )
            val path = Path().apply {
                moveTo(points.first().x, points.first().y)
                points.drop(1).forEach { lineTo(it.x, it.y) }
            }
            drawPath(path, LoanGreen, style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round))
            points.forEach { drawCircle(LoanGreen, radius = 3.dp.toPx(), center = it) }
        }
    }
}

@Composable
private fun LoanDonut(debts: List<LoanDebtShare>, modifier: Modifier = Modifier) {
    Box(modifier, contentAlignment = Alignment.Center) {
        ComposeCanvas(Modifier.fillMaxSize()) {
            val total = debts.sumOf { it.loan.remainingAmount }.coerceAtLeast(0.0)
            var start = -90f
            val stroke = 17.dp.toPx()
            debts.forEach { item ->
                val sweep = if (total > 0.0) (item.loan.remainingAmount / total * 360.0).toFloat() else 0f
                drawArc(item.color, start, sweep, false, style = Stroke(stroke, cap = StrokeCap.Butt))
                start += sweep
            }
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("${debts.size}", color = LoanInk, fontWeight = FontWeight.Bold, fontSize = 16.sp)
            Text("笔贷款", color = LoanMuted, fontSize = 8.sp)
        }
    }
}

@Composable
private fun LoanScheduleRow(loan: NativeLoan, index: Int) {
    val due = loanDueInfo(loan)
    val urgent = due.days <= 3
    val color = if (loan.status == "OVERDUE") LoanRed else if (urgent) LoanAmber else LoanBlue
    Row(Modifier.fillMaxWidth().padding(vertical = 10.dp), verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(25.dp).clip(CircleShape).background(color.copy(alpha = .1f)), contentAlignment = Alignment.Center) {
                        Text("${index + 1}", color = color, fontSize = 10.5.sp, fontWeight = FontWeight.Bold)
        }
        Column(Modifier.weight(1f).padding(start = 9.dp)) {
            Text(loan.platform, color = LoanInk, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text("${due.date.format(DateTimeFormatter.ofPattern("MM-dd"))} · 剩余 ${(loan.periods - loan.paidPeriods).coerceAtLeast(0)} 期", color = LoanMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 2.dp))
        }
        Column(horizontalAlignment = Alignment.End) {
            Text("¥ ${loanMoney(loan.monthlyPayment)}", color = LoanInk, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            Text(if (loan.status == "OVERDUE") "已逾期" else if (due.days == 0) "今天到期" else "${due.days} 天后", color = color, fontSize = 10.sp, modifier = Modifier.padding(top = 2.dp))
        }
    }
}

@Composable
private fun LoanPortfolioCard(
    loan: NativeLoan,
    onRepay: () -> Unit,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
) {
    val due = loanDueInfo(loan)
    val progress = if (loan.totalAmount > 0.0) ((loan.totalAmount - loan.remainingAmount) / loan.totalAmount * 100.0).coerceIn(0.0, 100.0) else 0.0
    val paid = (loan.totalAmount - loan.remainingAmount).coerceAtLeast(0.0)
    val status = when {
        loan.status == "PAID_OFF" || loan.remainingAmount <= 0.0 -> "已结清"
        loan.status == "OVERDUE" -> "已逾期"
        due.days <= 3 -> "临近还款"
        else -> "还款中"
    }
    val statusColor = when (status) { "已结清" -> LoanGreen; "已逾期" -> LoanRed; "临近还款" -> LoanAmber; else -> LoanBlue }
    LoanCard(padding = 14.dp) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(35.dp).clip(RoundedCornerShape(12.dp)).background(LoanBlue.copy(alpha = .1f)), contentAlignment = Alignment.Center) {
                Text(loan.platform.take(1), color = LoanBlue, fontSize = 15.sp, fontWeight = FontWeight.Bold)
            }
            Column(Modifier.weight(1f).padding(start = 9.dp)) {
                Text(loan.platform, color = LoanInk, fontSize = 14.sp, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(status, color = statusColor, fontSize = 10.sp, modifier = Modifier.padding(top = 3.dp))
            }
            Column(horizontalAlignment = Alignment.End) {
                Text("待还本金", color = LoanMuted, fontSize = 10.sp)
                Text("¥ ${loanMoney(loan.remainingAmount)}", color = LoanRed, fontSize = 14.sp, fontWeight = FontWeight.Bold)
            }
        }
        Row(Modifier.fillMaxWidth().padding(top = 12.dp), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("已还 ${loan.paidPeriods.coerceAtMost(loan.periods)} / ${loan.periods} 期", color = LoanMuted, fontSize = 10.sp)
            Text("下期 ${due.date.format(DateTimeFormatter.ofPattern("MM-dd"))}", color = LoanMuted, fontSize = 10.sp)
        }
        Box(Modifier.fillMaxWidth().padding(top = 7.dp).height(6.dp).clip(CircleShape).background(Color(0xFFE9EEF5))) {
            Box(Modifier.fillMaxWidth(progress.toFloat() / 100f).height(6.dp).clip(CircleShape).background(LoanGreen))
        }
        Row(Modifier.fillMaxWidth().padding(top = 7.dp), horizontalArrangement = Arrangement.SpaceBetween) {
            Text("已还 ¥ ${loanMoney(paid)} · ${progress.toInt()}%", color = LoanMuted, fontSize = 10.sp)
            Text("月供 ¥ ${loanMoney(loan.monthlyPayment)}", color = LoanBlue, fontSize = 10.sp, fontWeight = FontWeight.SemiBold)
        }
        HorizontalDivider(Modifier.padding(top = 9.dp), color = LoanLine)
        Row(Modifier.fillMaxWidth().padding(top = 4.dp), horizontalArrangement = Arrangement.End, verticalAlignment = Alignment.CenterVertically) {
            TextButton(enabled = loan.remainingAmount > 0.0, onClick = onRepay) {
                Icon(Icons.Default.Payments, contentDescription = null, tint = LoanGreen, modifier = Modifier.size(15.dp))
                Text("还款", color = LoanGreen, fontSize = 10.sp)
            }
            TextButton(onClick = onEdit) {
                Icon(Icons.Default.Edit, contentDescription = null, tint = LoanBlue, modifier = Modifier.size(15.dp))
                Text("编辑", color = LoanBlue, fontSize = 10.sp)
            }
            TextButton(onClick = onDelete) {
                Icon(Icons.Default.Delete, contentDescription = null, tint = LoanRed, modifier = Modifier.size(15.dp))
                Text("删除", color = LoanRed, fontSize = 10.sp)
            }
        }
    }
}

@OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)
@Composable
private fun LoanEditorSheet(
    loan: NativeLoan?,
    accountId: String,
    userId: String,
    onClose: () -> Unit,
    onSave: suspend (NativeLoan) -> Unit,
) {
    val scope = rememberCoroutineScope()
    var platform by remember(loan?.id) { mutableStateOf(loan?.platform.orEmpty()) }
    var totalText by remember(loan?.id) { mutableStateOf(loan?.let { loanDecimal(it.totalAmount) }.orEmpty()) }
    var remainingText by remember(loan?.id) { mutableStateOf(loan?.let { loanDecimal(it.remainingAmount) }.orEmpty()) }
    var monthlyText by remember(loan?.id) { mutableStateOf(loan?.let { loanDecimal(it.monthlyPayment) }.orEmpty()) }
    var periodsText by remember(loan?.id) { mutableStateOf(loan?.periods?.toString() ?: "12") }
    var dueDayText by remember(loan?.id) { mutableStateOf(loan?.dueDate?.toString() ?: "20") }
    var keywords by remember(loan?.id) { mutableStateOf(loan?.matchKeywords.orEmpty()) }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf("") }

    ModalBottomSheet(
        onDismissRequest = { if (!saving) onClose() },
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = Color(0xFFFBFCFE),
        dragHandle = { Box(Modifier.padding(top = 10.dp).width(36.dp).height(4.dp).clip(CircleShape).background(Color(0xFFD7DFEA))) },
    ) {
        Column(
            Modifier.fillMaxWidth().heightIn(max = 790.dp).verticalScroll(rememberScrollState())
                .navigationBarsPadding().padding(start = 20.dp, end = 20.dp, bottom = 25.dp),
            verticalArrangement = Arrangement.spacedBy(13.dp),
        ) {
            LoanSheetHeader(if (loan == null) "新增贷款" else "编辑贷款", "记录贷款条件，方便查看还款节奏。", onClose)
            LoanInput("贷款名称", platform, { platform = it }, "如：建设银行房贷 / 招行车贷")
            LoanInput("账单匹配关键词（选填）", keywords, { keywords = it }, "多个关键词用逗号分隔")
            LoanInput("贷款总额", totalText, { totalText = decimalInput(it) }, "0.00", isAmount = true)
            LoanInput("剩余本金", remainingText, { remainingText = decimalInput(it) }, "留空时等于贷款总额", isAmount = true)
            LoanInput("每月月供", monthlyText, { monthlyText = decimalInput(it) }, "0.00", isAmount = true)
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                LoanInput("总期数", periodsText, { periodsText = it.filter(Char::isDigit).take(3) }, "12", Modifier.weight(1f), isNumber = true)
                LoanInput("每月还款日", dueDayText, { dueDayText = it.filter(Char::isDigit).take(2) }, "20", Modifier.weight(1f), isNumber = true)
            }
            if (error.isNotBlank()) LoanFormError(error)
            Button(
                modifier = Modifier.fillMaxWidth().height(49.dp),
                enabled = !saving,
                colors = ButtonDefaults.buttonColors(containerColor = LoanBlue),
                shape = RoundedCornerShape(14.dp),
                onClick = {
                    val total = totalText.toDoubleOrNull()
                    val remaining = if (remainingText.isBlank()) total else remainingText.toDoubleOrNull()
                    val monthly = monthlyText.toDoubleOrNull() ?: 0.0
                    val periods = periodsText.toIntOrNull()
                    val dueDay = dueDayText.toIntOrNull()
                    error = when {
                        platform.isBlank() -> "请填写贷款名称"
                        total == null || !total.isFinite() || total <= 0.0 -> "贷款总额必须大于 0"
                        remaining == null || !remaining.isFinite() || remaining < 0.0 || remaining > total -> "剩余本金需在 0 到贷款总额之间"
                        !monthly.isFinite() || monthly < 0.0 -> "月供不能小于 0"
                        periods == null || periods !in 1..1200 -> "总期数需在 1 到 1200 之间"
                        dueDay == null || dueDay !in 1..31 -> "每月还款日需在 1 到 31 之间"
                        else -> ""
                    }
                    if (error.isNotBlank()) return@Button
                    val now = LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)
                    val timestamp = java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                    val amountLeft = remaining!!.moneyRound()
                    val model = NativeLoan(
                        id = loan?.id ?: "loan-${UUID.randomUUID()}",
                        platform = platform.trim(),
                        totalAmount = total!!.moneyRound(),
                        remainingAmount = amountLeft,
                        monthlyPayment = monthly.moneyRound(),
                        dueDate = dueDay!!,
                        status = when {
                            amountLeft <= 0.0 -> "PAID_OFF"
                            loan?.status == "OVERDUE" -> "OVERDUE"
                            else -> "ACTIVE"
                        },
                        periods = periods!!,
                        paidPeriods = (loan?.paidPeriods ?: 0).coerceIn(0, periods),
                        matchKeywords = keywords.trim().ifBlank { null },
                        userId = loan?.userId ?: userId,
                        accountId = loan?.accountId ?: accountId,
                        createdAt = loan?.createdAt ?: "$now 00:00:00",
                        updatedAt = timestamp,
                    )
                    scope.launch {
                        saving = true
                        error = ""
                        runCatching { onSave(model) }
                            .onSuccess { onClose() }
                            .onFailure { error = it.message ?: "贷款保存失败，请重试" }
                        saving = false
                    }
                },
            ) {
                Text(if (saving) "保存中…" else "保存贷款", fontWeight = FontWeight.Bold)
            }
        }
    }
}

@OptIn(androidx.compose.material3.ExperimentalMaterial3Api::class)
@Composable
private fun LoanRepaymentSheet(
    loan: NativeLoan,
    onClose: () -> Unit,
    onSave: suspend (NativeLoan, Double, String, String, String) -> Unit,
) {
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val transactionId = remember(loan.id) { "repayment-${UUID.randomUUID()}" }
    var amountText by remember(loan.id) { mutableStateOf(loanDecimal(minOf(loan.monthlyPayment.takeIf { it > 0.0 } ?: loan.remainingAmount, loan.remainingAmount))) }
    var dateText by remember(loan.id) { mutableStateOf(LocalDate.now().format(DateTimeFormatter.ISO_LOCAL_DATE)) }
    var note by remember(loan.id) { mutableStateOf("") }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf("") }

    ModalBottomSheet(
        onDismissRequest = { if (!saving) onClose() },
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = Color(0xFFFBFCFE),
        dragHandle = { Box(Modifier.padding(top = 10.dp).width(36.dp).height(4.dp).clip(CircleShape).background(Color(0xFFD7DFEA))) },
    ) {
        Column(
            Modifier.fillMaxWidth().heightIn(max = 700.dp).verticalScroll(rememberScrollState())
                .navigationBarsPadding().padding(start = 20.dp, end = 20.dp, bottom = 25.dp),
            verticalArrangement = Arrangement.spacedBy(13.dp),
        ) {
            LoanSheetHeader("记录贷款还款", "${loan.platform} · 待还本金 ¥ ${loanMoney(loan.remainingAmount)}", onClose)
            LoanInput("还款金额", amountText, { amountText = decimalInput(it) }, "0.00", isAmount = true)
            Column(verticalArrangement = Arrangement.spacedBy(7.dp)) {
                Text("实际还款日期", color = LoanInk, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Text(
                    dateText,
                    modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(13.dp)).background(Color.White)
                        .border(1.dp, LoanLine, RoundedCornerShape(13.dp)).clickable {
                            val date = runCatching { LocalDate.parse(dateText) }.getOrElse { LocalDate.now() }
                            DatePickerDialog(context, { _, year, month, day ->
                                dateText = "%04d-%02d-%02d".format(java.util.Locale.ROOT, year, month + 1, day)
                            }, date.year, date.monthValue - 1, date.dayOfMonth).show()
                        }.padding(horizontal = 14.dp, vertical = 14.dp),
                    color = LoanInk,
                    fontSize = 13.sp,
                )
            }
            LoanInput("备注", note, { note = it }, "可选")
            Text("达到月供金额时，已还期数增加 1；还款金额不会超过剩余本金。", color = LoanMuted, fontSize = 10.sp)
            if (error.isNotBlank()) LoanFormError(error)
            Button(
                modifier = Modifier.fillMaxWidth().height(49.dp),
                enabled = !saving,
                colors = ButtonDefaults.buttonColors(containerColor = LoanGreen),
                shape = RoundedCornerShape(14.dp),
                onClick = {
                    val amount = amountText.toDoubleOrNull()
                    error = when {
                        amount == null || !amount.isFinite() || amount <= 0.0 -> "请输入大于 0 的还款金额"
                        amount > loan.remainingAmount -> "还款金额不能超过剩余本金 ¥ ${loanMoney(loan.remainingAmount)}"
                        else -> ""
                    }
                    if (error.isNotBlank()) return@Button
                    scope.launch {
                        saving = true
                        error = ""
                        runCatching { onSave(loan, amount!!.moneyRound(), dateText, note.trim(), transactionId) }
                            .onSuccess { onClose() }
                            .onFailure { error = it.message ?: "还款保存失败，请重试" }
                        saving = false
                    }
                },
            ) {
                Text(if (saving) "保存中…" else "保存还款", fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun LoanSheetHeader(title: String, subtitle: String, onClose: () -> Unit) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) {
            Text(title, color = LoanInk, fontSize = 21.sp, fontWeight = FontWeight.Black)
            Text(subtitle, color = LoanMuted, fontSize = 11.sp, modifier = Modifier.padding(top = 3.dp))
        }
        IconButton(onClick = onClose) { Icon(Icons.Default.Close, contentDescription = "关闭", tint = LoanMuted) }
    }
}

@Composable
private fun LoanInput(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    modifier: Modifier = Modifier,
    isAmount: Boolean = false,
    isNumber: Boolean = false,
) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(6.dp)) {
        Text(label, color = LoanInk, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth(),
            placeholder = { Text(placeholder, fontSize = 12.sp) },
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = when { isAmount -> KeyboardType.Decimal; isNumber -> KeyboardType.Number; else -> KeyboardType.Text }),
            shape = RoundedCornerShape(13.dp),
        )
    }
}

@Composable
private fun LoanFormError(text: String) {
    Text(text, color = LoanRed, fontSize = 11.sp)
}

private fun decimalInput(value: String): String {
    var decimalSeen = false
    return buildString {
        value.forEach { char ->
            when {
                char.isDigit() -> append(char)
                char == '.' && !decimalSeen -> { append(char); decimalSeen = true }
            }
        }
    }
}

private fun Double.moneyRound(): Double = BigDecimal.valueOf(this).setScale(2, RoundingMode.HALF_UP).toDouble()
