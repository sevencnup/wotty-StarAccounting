package com.wotty.stark.nativeapp

import android.app.DatePickerDialog
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Remove
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import org.json.JSONArray
import org.json.JSONObject
import java.text.DecimalFormat
import java.time.LocalDate
import java.time.YearMonth
import java.util.UUID

internal data class NativeSavingsChangeSet(
    val goal: NativeSavingsGoal,
    val plansToSave: List<NativeSavingsPlan>,
    val planIdsToDelete: List<String>,
)

private data class SavingsPlannerRow(
    val salary: String = "",
    val previousBalance: String = "",
    val expected: String = "",
    val expenses: Map<String, String> = emptyMap(),
)

private data class SavingsEditorSeed(
    val year: Int,
    val frequency: String,
    val name: String,
    val targetAmount: String,
    val deadline: String,
    val depositType: String,
    val columns: List<String>,
    val temporaryColumns: List<String>,
    val previousBalanceEnabled: Boolean,
    val monthsByKey: Map<String, List<String>>,
    val rows: Map<String, SavingsPlannerRow>,
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun NativeSavingsEditorSheet(
    goal: NativeSavingsGoal?,
    goals: List<NativeSavingsGoal>,
    allPlans: List<NativeSavingsPlan>,
    accountId: String,
    userId: String,
    onClose: () -> Unit,
    onSave: suspend (NativeSavingsChangeSet) -> Unit,
    onDelete: suspend (String) -> Unit,
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    val seed = remember(goal?.id, goal?.planConfig, allPlans) {
        buildSavingsEditorSeed(goal, allPlans, LocalDate.now().year)
    }
    var year by remember(goal?.id) { mutableStateOf(seed.year) }
    var goalName by remember(goal?.id) { mutableStateOf(seed.name) }
    var targetAmount by remember(goal?.id) { mutableStateOf(seed.targetAmount) }
    var deadline by remember(goal?.id) { mutableStateOf(seed.deadline) }
    var depositType by remember(goal?.id) { mutableStateOf(seed.depositType) }
    var frequency by remember(goal?.id) { mutableStateOf(seed.frequency) }
    var columns by remember(goal?.id) { mutableStateOf(seed.columns) }
    var temporaryColumns by remember(goal?.id) { mutableStateOf(seed.temporaryColumns) }
    var previousBalanceEnabled by remember(goal?.id) { mutableStateOf(seed.previousBalanceEnabled) }
    var monthsByKey by remember(goal?.id) { mutableStateOf(seed.monthsByKey) }
    var rows by remember(goal?.id) { mutableStateOf(seed.rows) }
    var editFuture by remember(goal?.id) { mutableStateOf(true) }
    var newColumn by remember(goal?.id) { mutableStateOf("") }
    var expandedMonths by remember(goal?.id) { mutableStateOf(setOf<String>()) }
    var saving by remember { mutableStateOf(false) }
    var deleting by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    var notice by remember { mutableStateOf("") }
    var showHistory by remember { mutableStateOf(false) }
    var showMonthsToAdd by remember { mutableStateOf(false) }
    var showDeleteConfirmation by remember { mutableStateOf(false) }

    val monthKey = savingsMonthKey(year, frequency)
    val supportedMonths = buildSavingsMonthsNative(year, frequency)
    val currentMonths = monthsByKey[monthKey] ?: supportedMonths
    val totals = currentMonths.fold(Triple(0.0, 0.0, 0.0)) { total, month ->
        val row = rows[savingsRowKey(frequency, month)] ?: SavingsPlannerRow()
        val salary = row.salary.toDoubleOrNull() ?: 0.0
        val expenses = row.expenses.values.sumOf { it.toDoubleOrNull() ?: 0.0 }
        val previous = if (previousBalanceEnabled) row.previousBalance.toDoubleOrNull() ?: 0.0 else 0.0
        Triple(total.first + salary, total.second + (row.expected.toDoubleOrNull() ?: 0.0), total.third + salary + previous - expenses - (row.expected.toDoubleOrNull() ?: 0.0))
    }
    val historicalGoals = goals.filter { it.id != goal?.id }

    fun updateField(month: String, field: String, value: String) {
        val index = currentMonths.indexOf(month)
        val targets = if (editFuture && index >= 0 && field != "previousBalance") currentMonths.drop(index) else listOf(month)
        val updatedRows = rows.toMutableMap()
        targets.forEach { targetMonth ->
            val key = savingsRowKey(frequency, targetMonth)
            val previous = updatedRows[key] ?: SavingsPlannerRow()
            updatedRows[key] = when (field) {
                "salary" -> previous.copy(salary = value)
                "expected" -> previous.copy(expected = value)
                "previousBalance" -> previous.copy(previousBalance = value)
                else -> previous
            }
        }
        rows = updatedRows
        notice = ""
    }

    fun updateExpense(month: String, column: String, value: String) {
        val index = currentMonths.indexOf(month)
        val targets = if (editFuture && column !in temporaryColumns && index >= 0) currentMonths.drop(index) else listOf(month)
        val updatedRows = rows.toMutableMap()
        targets.forEach { targetMonth ->
            val key = savingsRowKey(frequency, targetMonth)
            val previous = updatedRows[key] ?: SavingsPlannerRow()
            updatedRows[key] = previous.copy(expenses = previous.expenses + (column to value))
        }
        rows = updatedRows
        notice = ""
    }

    fun selectHistoryTemplate(templateGoal: NativeSavingsGoal) {
        val source = buildSavingsEditorSeed(templateGoal, allPlans, LocalDate.now().year)
        val nextRows = mutableMapOf<String, SavingsPlannerRow>()
        val nextMonths = monthsByKey.toMutableMap()
        listOf("MONTHLY", "ALTERNATE").forEach { mode ->
            val sourceMonths = source.monthsByKey[savingsMonthKey(source.year, mode)] ?: buildSavingsMonthsNative(source.year, mode)
            val targetMonths = remapMonthsToYear(sourceMonths, year, mode)
            nextMonths[savingsMonthKey(year, mode)] = targetMonths
            sourceMonths.forEach { sourceMonth ->
                val targetMonth = targetMonths.firstOrNull { it.takeLast(2) == sourceMonth.takeLast(2) }
                if (targetMonth != null) {
                    source.rows[savingsRowKey(mode, sourceMonth)]?.let { nextRows[savingsRowKey(mode, targetMonth)] = it }
                }
            }
        }
        rows = nextRows
        monthsByKey = nextMonths
        frequency = source.frequency
        columns = source.columns
        temporaryColumns = source.temporaryColumns
        previousBalanceEnabled = source.previousBalanceEnabled
        depositType = source.depositType
        showHistory = false
        notice = "已导入“${templateGoal.name}”的计划模板；实际存入记录不会复制"
    }

    ModalBottomSheet(
        onDismissRequest = onClose,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = SavingsCanvas,
        dragHandle = { Box(Modifier.padding(top = 10.dp).size(width = 36.dp, height = 4.dp).clip(CircleShape).background(Color(0xFFD7DFEA))) },
    ) {
        Column(
            Modifier.fillMaxWidth().fillMaxHeight(0.92f).verticalScroll(rememberScrollState())
                .navigationBarsPadding().padding(start = 18.dp, end = 18.dp, bottom = 24.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                Column(Modifier.weight(1f)) {
                    Text(if (goal == null) "新建储蓄目标" else "编辑储蓄目标", color = SavingsInk, fontWeight = FontWeight.Black, fontSize = 22.sp)
                    Text("设置目标，再安排每月存入和支出", color = SavingsMuted, fontSize = 12.sp, modifier = Modifier.padding(top = 3.dp))
                }
                IconButton(onClick = onClose) { Icon(Icons.Default.Close, contentDescription = "关闭", tint = SavingsMuted) }
            }

            SavingsEditorCard {
                SavingsEditorInput("储蓄名称", goalName, { goalName = it.take(24) }, "例如：年度储蓄", false)
                SavingsEditorInput("目标金额", targetAmount, { targetAmount = sanitizeSavingsAmount(it) }, "如 30000", true)
                Column(verticalArrangement = Arrangement.spacedBy(5.dp)) {
                    Text("截止日期", color = SavingsInk, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    TextButton(onClick = {
                        val selected = runCatching { LocalDate.parse(deadline) }.getOrElse { LocalDate.of(year, 12, 31) }
                        DatePickerDialog(context, { _, selectedYear, selectedMonth, day ->
                            deadline = "%04d-%02d-%02d".format(java.util.Locale.ROOT, selectedYear, selectedMonth + 1, day)
                        }, selected.year, selected.monthValue - 1, selected.dayOfMonth).show()
                    }) { Text(deadline.ifBlank { "不设置期限" }, color = SavingsBlue, fontWeight = FontWeight.SemiBold) }
                }
                Column(verticalArrangement = Arrangement.spacedBy(7.dp)) {
                    Text("存储类型", color = SavingsInk, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    SavingsChoiceRow(
                        options = listOf("死期" to "PRIVATE", "现金" to "CASH", "他人帮存" to "HELP_DEPOSIT"),
                        selected = depositType,
                        onSelect = { depositType = it },
                    )
                }
            }

            if (goal == null && historicalGoals.isNotEmpty()) {
                SavingsEditorCard {
                    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                        Column(Modifier.weight(1f)) {
                            Text("导入历史模板", color = SavingsInk, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                            Text("复用支出列、频率和月度金额", color = SavingsMuted, fontSize = 11.sp, modifier = Modifier.padding(top = 3.dp))
                        }
                        TextButton(onClick = { showHistory = true }) { Text("选择") }
                    }
                }
            }

            SavingsEditorCard {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                    Column {
                        Text("年度计划", color = SavingsInk, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                        Text("工资、支出和预计存入", color = SavingsMuted, fontSize = 11.sp, modifier = Modifier.padding(top = 3.dp))
                    }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        TextButton(onClick = { year = (year - 1).coerceAtLeast(2000) }) { Text("‹") }
                        Text("$year 年", color = SavingsInk, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                        TextButton(onClick = { year = (year + 1).coerceAtMost(9999) }) { Text("›") }
                    }
                }
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    SavingsSummaryPill("计划薪资", totals.first, Modifier.weight(1f))
                    SavingsSummaryPill("预计存入", totals.second, Modifier.weight(1f))
                    SavingsSummaryPill("预计剩余", totals.third, Modifier.weight(1f))
                }
            }

            SavingsEditorCard {
                Text("储蓄频率", color = SavingsInk, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                SavingsChoiceRow(
                    options = listOf("单月存" to "MONTHLY", "隔月存" to "ALTERNATE"),
                    selected = frequency,
                    onSelect = { frequency = it },
                )
                Text("金额修改范围", color = SavingsInk, fontSize = 12.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 3.dp))
                SavingsChoiceRow(
                    options = listOf("本月及以后" to "future", "仅本月" to "month"),
                    selected = if (editFuture) "future" else "month",
                    onSelect = { editFuture = it == "future" },
                )
                Text("工资、预计存和固定支出可从当前月份向后同步；临时支出和上月结余只改本月。", color = SavingsMuted, fontSize = 10.sp)
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("支出项目", color = SavingsInk, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    TextButton(onClick = { previousBalanceEnabled = !previousBalanceEnabled }) {
                        Text(if (previousBalanceEnabled) "移除上月结余" else "添加上月结余", fontSize = 11.sp)
                    }
                }
                if (columns.isNotEmpty()) {
                    Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(7.dp)) {
                        columns.forEach { column ->
                            val temporary = column in temporaryColumns
                            Row(
                                Modifier.clip(RoundedCornerShape(12.dp)).background(if (temporary) Color(0xFFFFF4E5) else Color(0xFFF0F5FA))
                                    .clickable {
                                        columns = columns - column
                                        temporaryColumns = temporaryColumns - column
                                        rows = rows.mapValues { (_, row) -> row.copy(expenses = row.expenses - column) }
                                    }.padding(horizontal = 10.dp, vertical = 7.dp),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Text(column + if (temporary) " · 临时" else "", color = if (temporary) Color(0xFFAA6A08) else SavingsMuted, fontSize = 10.sp)
                                Spacer(Modifier.width(4.dp))
                                Icon(Icons.Default.Close, contentDescription = "删除$column", tint = SavingsMuted, modifier = Modifier.size(13.dp))
                            }
                        }
                    }
                }
                SavingsEditorInput("新支出名称", newColumn, { newColumn = it.take(16) }, "输入支出名称", false)
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    SavingsEditorAction("新增固定支出", Modifier.weight(1f)) {
                        addSavingsExpenseColumn(newColumn, columns, temporary = false, onError = { notice = it }) { added ->
                            columns = columns + added
                            newColumn = ""
                            notice = "已新增固定支出“$added”"
                        }
                    }
                    SavingsEditorAction("新增临时支出", Modifier.weight(1f)) {
                        addSavingsExpenseColumn(newColumn, columns, temporary = true, onError = { notice = it }) { added ->
                            columns = columns + added
                            temporaryColumns = temporaryColumns + added
                            newColumn = ""
                            notice = "已新增临时支出“$added”"
                        }
                    }
                }
            }

            SavingsEditorCard {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                    Column(Modifier.weight(1f)) {
                        Text("计划月份 · ${currentMonths.size} 个月", color = SavingsInk, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                        Text("隔月存默认安排奇数月，可按需要增删月份", color = SavingsMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 3.dp))
                    }
                    val hasRemovedMonths = supportedMonths.any { it !in currentMonths }
                    TextButton(enabled = hasRemovedMonths, onClick = { showMonthsToAdd = true }) {
                        Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(16.dp)); Text("添加月份")
                    }
                }
            }

            currentMonths.forEachIndexed { index, month ->
                val key = savingsRowKey(frequency, month)
                val row = rows[key] ?: SavingsPlannerRow()
                val expanded = month in expandedMonths
                val previousBalance = if (previousBalanceEnabled) row.previousBalance.toDoubleOrNull() ?: 0.0 else 0.0
                val expenseTotal = row.expenses.values.sumOf { it.toDoubleOrNull() ?: 0.0 }
                val remaining = (row.salary.toDoubleOrNull() ?: 0.0) + previousBalance - expenseTotal - (row.expected.toDoubleOrNull() ?: 0.0)
                SavingsEditorCard {
                    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                        Column(Modifier.weight(1f).clickable {
                            expandedMonths = if (expanded) expandedMonths - month else expandedMonths + month
                        }) {
                            Text("${month.substringAfter('-')} 月", color = SavingsInk, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                            Text("薪资 ¥${savingsMoney(row.salary)} · 预计存 ¥${savingsMoney(row.expected)}", color = SavingsMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 3.dp))
                        }
                        Text("剩余 ¥${savingsMoney(remaining.toString())}", color = if (remaining < 0) SavingsRed else SavingsGreen, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        IconButton(onClick = {
                            if (currentMonths.size <= 1) notice = "至少保留一个月份"
                            else {
                                monthsByKey = monthsByKey + (monthKey to currentMonths.filterNot { it == month })
                                expandedMonths = expandedMonths - month
                            }
                        }) { Icon(Icons.Default.Remove, contentDescription = "移除${month.substringAfter('-')}月", tint = SavingsMuted) }
                    }
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        SavingsEditorInput("薪资", row.salary, { updateField(month, "salary", sanitizeSavingsAmount(it)) }, "0", true, Modifier.weight(1f))
                        SavingsEditorInput("预计存", row.expected, { updateField(month, "expected", sanitizeSavingsAmount(it)) }, "0", true, Modifier.weight(1f))
                    }
                    if (expanded) {
                        if (previousBalanceEnabled) {
                            SavingsEditorInput("上月结余", row.previousBalance, { updateField(month, "previousBalance", sanitizeSavingsAmount(it)) }, "0", true)
                        }
                        columns.chunked(2).forEach { pair ->
                            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                pair.forEach { column ->
                                    SavingsEditorInput(
                                        column + if (column in temporaryColumns) " · 临时" else "",
                                        row.expenses[column].orEmpty(),
                                        { updateExpense(month, column, sanitizeSavingsAmount(it)) },
                                        "0",
                                        true,
                                        Modifier.weight(1f),
                                    )
                                }
                                if (pair.size == 1) Spacer(Modifier.weight(1f))
                            }
                        }
                    }
                    TextButton(onClick = {
                        expandedMonths = if (expanded) expandedMonths - month else expandedMonths + month
                    }) { Text(if (expanded) "收起支出明细" else "编辑支出明细", fontSize = 11.sp) }
                }
            }

            if (errorMessage.isNotBlank()) Text(errorMessage, color = SavingsRed, fontSize = 12.sp)
            if (notice.isNotBlank()) Text(notice, color = SavingsMuted, fontSize = 11.sp)
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
                if (goal != null) {
                    TextButton(enabled = !saving && !deleting, onClick = { showDeleteConfirmation = true }) {
                        Icon(Icons.Default.Delete, contentDescription = null, tint = SavingsRed, modifier = Modifier.size(16.dp))
                        Text("删除目标", color = SavingsRed, fontSize = 12.sp)
                    }
                }
                Spacer(Modifier.weight(1f))
                TextButton(enabled = !saving && !deleting, onClick = onClose) { Text("取消") }
                TextButton(
                    enabled = !saving && !deleting,
                    onClick = {
                        if (goalName.isBlank()) {
                            errorMessage = "请填写储蓄名称"
                            return@TextButton
                        }
                        if (currentMonths.isEmpty()) {
                            errorMessage = "请至少保留一个计划月份"
                            return@TextButton
                        }
                        val now = java.time.LocalDateTime.now().toString().replace('T', ' ')
                        val goalId = goal?.id ?: "native-savings-${UUID.randomUUID()}"
                        val config = runCatching { JSONObject(goal?.planConfig.orEmpty().ifBlank { "{}" }) }.getOrElse { JSONObject() }
                        config.put("frequency", frequency)
                            .put("columns", JSONArray(columns))
                            .put("fixedColumns", JSONArray(columns.filterNot { it in temporaryColumns }))
                            .put("temporaryColumns", JSONArray(temporaryColumns))
                            .put("previousBalance", previousBalanceEnabled)
                            .put("monthsByFrequency", putJsonMonths(config.optJSONObject("monthsByFrequency"), frequency, currentMonths))
                            .put("monthsByYear", putJsonYearMonths(config.optJSONObject("monthsByYear"), year, frequency, currentMonths, monthsByKey))
                        val nextGoal = NativeSavingsGoal(
                            id = goalId,
                            userId = userId.ifBlank { goal?.userId.orEmpty() },
                            accountId = accountId.ifBlank { goal?.accountId.orEmpty() },
                            name = goalName.trim(),
                            targetAmount = targetAmount.toDoubleOrNull() ?: 0.0,
                            currentAmount = goal?.currentAmount ?: 0.0,
                            deadline = deadline,
                            type = goal?.type ?: "LONG_TERM",
                            status = goal?.status ?: "ACTIVE",
                            depositType = depositType,
                            planConfig = config.toString(),
                            createdAt = goal?.createdAt?.ifBlank { now } ?: now,
                            updatedAt = now,
                        )
                        val scopedPlans = allPlans.filter { it.goalId == goalId && it.month.startsWith("$year-") && planBelongsToFrequency(it, frequency, seed.frequency) }
                        val scopedByMonth = scopedPlans.associateBy { it.month }
                        val nextPlans = currentMonths.map { planMonth ->
                            val old = scopedByMonth[planMonth]
                            val row = rows[savingsRowKey(frequency, planMonth)] ?: SavingsPlannerRow()
                            val expenses = JSONObject()
                            columns.forEach { column -> expenses.put(column, row.expenses[column]?.toDoubleOrNull() ?: 0.0) }
                            if (previousBalanceEnabled) expenses.put("上月结余", row.previousBalance.toDoubleOrNull() ?: 0.0)
                            NativeSavingsPlan(
                                id = old?.id ?: "plan-$goalId-$frequency-$planMonth",
                                goalId = goalId,
                                amount = row.expected.toDoubleOrNull() ?: 0.0,
                                actualAmount = old?.actualAmount,
                                status = old?.status ?: "PENDING",
                                month = planMonth,
                                createdAt = old?.createdAt?.ifBlank { now } ?: now,
                                updatedAt = now,
                                expenses = expenses.toString(),
                                remark = if (frequency == "ALTERNATE") "隔月存模式" else "单月存模式",
                                salary = row.salary.toDoubleOrNull() ?: 0.0,
                                proofImage = old?.proofImage,
                                actualDate = old?.actualDate,
                            )
                        }
                        val selectedMonths = currentMonths.toSet()
                        val deletedIds = scopedPlans.filter { it.month !in selectedMonths }.map { it.id }
                        saving = true
                        errorMessage = ""
                        coroutineScope.launch {
                            try {
                                onSave(NativeSavingsChangeSet(nextGoal, nextPlans, deletedIds))
                                onClose()
                            } catch (error: Throwable) {
                                errorMessage = error.message ?: "保存失败，请检查网络后重试"
                            } finally {
                                saving = false
                            }
                        }
                    },
                    shape = RoundedCornerShape(14.dp),
                    contentPadding = PaddingValues(horizontal = 17.dp, vertical = 10.dp),
                ) { Text(if (saving) "保存中…" else if (goal == null) "创建目标和计划" else "保存修改", color = SavingsGreen, fontWeight = FontWeight.Bold) }
            }
        }
    }

    if (showHistory) {
        AlertDialog(
            onDismissRequest = { showHistory = false },
            title = { Text("选择历史计划") },
            text = {
                Column(Modifier.height(360.dp).verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(7.dp)) {
                    Text("仅导入计划结构和月度金额，不会复制目标名、已存金额或完成状态。", color = SavingsMuted, fontSize = 11.sp)
                    historicalGoals.forEach { historical ->
                        TextButton(onClick = { selectHistoryTemplate(historical) }, modifier = Modifier.fillMaxWidth()) {
                            Column(Modifier.fillMaxWidth()) {
                                Text(historical.name, color = SavingsInk, fontWeight = FontWeight.Bold)
                                Text("${savingsDepositTypeLabelNative(historical.depositType)} · ${historicalPlanCount(historical.id, allPlans)} 条月度计划", color = SavingsMuted, fontSize = 10.sp)
                            }
                        }
                    }
                }
            },
            confirmButton = { TextButton(onClick = { showHistory = false }) { Text("关闭") } },
        )
    }

    if (showMonthsToAdd) {
        val removedMonths = supportedMonths.filterNot { it in currentMonths }
        AlertDialog(
            onDismissRequest = { showMonthsToAdd = false },
            title = { Text("选择要添加的月份") },
            text = {
                Column(Modifier.height(300.dp).verticalScroll(rememberScrollState()), verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    removedMonths.forEach { month ->
                        TextButton(onClick = {
                            val next = (currentMonths + month).sorted()
                            monthsByKey = monthsByKey + (monthKey to next)
                            showMonthsToAdd = false
                            notice = "已添加${month.substringAfter('-')}月"
                        }, modifier = Modifier.fillMaxWidth()) { Text("${month.substringAfter('-')} 月") }
                    }
                }
            },
            confirmButton = { TextButton(onClick = { showMonthsToAdd = false }) { Text("关闭") } },
        )
    }

    if (showDeleteConfirmation && goal != null) {
        AlertDialog(
            onDismissRequest = { if (!deleting) showDeleteConfirmation = false },
            title = { Text("删除储蓄目标？") },
            text = { Text("“${goal.name}”及其 ${allPlans.count { it.goalId == goal.id }} 条月度计划都会删除，此操作无法恢复。") },
            dismissButton = { TextButton(enabled = !deleting, onClick = { showDeleteConfirmation = false }) { Text("取消") } },
            confirmButton = {
                TextButton(enabled = !deleting, onClick = {
                    deleting = true
                    errorMessage = ""
                    coroutineScope.launch {
                        try {
                            onDelete(goal.id)
                            showDeleteConfirmation = false
                            onClose()
                        } catch (error: Throwable) {
                            errorMessage = error.message ?: "删除失败，请稍后重试"
                        } finally {
                            deleting = false
                        }
                    }
                }) { Text(if (deleting) "删除中…" else "删除目标", color = SavingsRed) }
            },
        )
    }
}

private fun buildSavingsEditorSeed(
    goal: NativeSavingsGoal?,
    allPlans: List<NativeSavingsPlan>,
    fallbackYear: Int,
    forceYear: Boolean = false,
): SavingsEditorSeed {
    val goalPlans = goal?.let { item -> allPlans.filter { it.goalId == item.id } }.orEmpty()
    val config = runCatching { JSONObject(goal?.planConfig.orEmpty().ifBlank { "{}" }) }.getOrElse { JSONObject() }
    val legacyFrequency = config.optString("frequency", "MONTHLY").takeIf { it == "ALTERNATE" } ?: "MONTHLY"
    val persistedYears = goalPlans.mapNotNull { it.month.takeIf { value -> value.matches(Regex("\\d{4}-\\d{2}")) }?.take(4)?.toIntOrNull() }.distinct().sorted()
    val configuredYears = config.optJSONObject("monthsByYear")?.keys()?.asSequence()?.mapNotNull(String::toIntOrNull)?.toList().orEmpty()
    val allYears = (persistedYears + configuredYears).distinct().sorted()
    val selectedYear = when {
        forceYear -> fallbackYear
        fallbackYear in allYears -> fallbackYear
        allYears.any { it > fallbackYear } -> allYears.first { it > fallbackYear }
        allYears.isNotEmpty() -> allYears.last()
        else -> fallbackYear
    }
    val frequency = legacyFrequency
    val columns = linkedSetOf<String>()
    readJsonStringArray(config.optJSONArray("columns")).forEach { if (it != "上月结余") columns += it }
    goalPlans.forEach { plan ->
        parseSavingsExpensesNative(plan.expenses).keys.filter { it != "上月结余" && it.isNotBlank() }.forEach { columns += it }
    }
    if (columns.isEmpty()) columns.addAll(listOf("房租", "水电", "其他", "购物"))
    val temporaryColumns = readJsonStringArray(config.optJSONArray("temporaryColumns")).filter { it in columns }
    val previousBalanceEnabled = config.optBoolean("previousBalance", goalPlans.any { "上月结余" in parseSavingsExpensesNative(it.expenses) })
    val rows = mutableMapOf<String, SavingsPlannerRow>()
    goalPlans.forEach { plan ->
        val mode = planFrequency(plan, legacyFrequency)
        val expenses = parseSavingsExpensesNative(plan.expenses)
        rows[savingsRowKey(mode, plan.month)] = SavingsPlannerRow(
            salary = plan.salary?.takeIf { it != 0.0 }?.let(::savingsNumberText).orEmpty(),
            previousBalance = expenses["上月结余"]?.takeIf { it != 0.0 }?.let(::savingsNumberText).orEmpty(),
            expected = plan.amount.takeIf { it != 0.0 }?.let(::savingsNumberText).orEmpty(),
            expenses = expenses.filterKeys { it != "上月结余" }.mapValues { (_, amount) -> amount.takeIf { it != 0.0 }?.let(::savingsNumberText).orEmpty() },
        )
    }
    val monthsByKey = mutableMapOf<String, List<String>>()
    val monthsByYear = config.optJSONObject("monthsByYear")
    val monthsByFrequency = config.optJSONObject("monthsByFrequency")
    allYears.plus(selectedYear).distinct().forEach { planYear ->
        listOf("MONTHLY", "ALTERNATE").forEach { mode ->
            val supported = buildSavingsMonthsNative(planYear, mode)
            val yearConfigured = monthsByYear?.optJSONObject(planYear.toString())?.optJSONArray(mode)
            val frequencyConfigured = monthsByFrequency?.optJSONArray(mode)
            val legacyConfigured = if (config.optString("frequency", "MONTHLY") == mode) config.optJSONArray("months") else null
            val configured = when {
                yearConfigured != null -> readJsonStringArray(yearConfigured)
                frequencyConfigured != null && planYear == selectedYear -> readJsonStringArray(frequencyConfigured)
                legacyConfigured != null && planYear == selectedYear -> readJsonStringArray(legacyConfigured)
                else -> emptyList()
            }.filter { it in supported }
            val persisted = goalPlans.filter { it.month.startsWith("$planYear-") && planFrequency(it, legacyFrequency) == mode }.map { it.month }.filter { it in supported }.distinct().sorted()
            val fallback = if (persisted.isNotEmpty()) persisted else supported
            monthsByKey[savingsMonthKey(planYear, mode)] = configured.ifEmpty { fallback }
        }
    }
    return SavingsEditorSeed(
        year = selectedYear,
        frequency = frequency,
        name = goal?.name?.ifBlank { "${selectedYear} 年度储蓄" } ?: "${selectedYear} 年度储蓄",
        targetAmount = goal?.targetAmount?.takeIf { it != 0.0 }?.let(::savingsNumberText).orEmpty(),
        deadline = goal?.deadline.orEmpty(),
        depositType = normalizeNativeDepositType(goal?.depositType),
        columns = columns.toList(),
        temporaryColumns = temporaryColumns,
        previousBalanceEnabled = previousBalanceEnabled,
        monthsByKey = monthsByKey,
        rows = rows,
    )
}

private fun buildSavingsMonthsNative(year: Int, frequency: String): List<String> = (1..12)
    .filter { frequency != "ALTERNATE" || it % 2 == 1 }
    .map { month -> "%04d-%02d".format(java.util.Locale.ROOT, year, month) }

private fun remapMonthsToYear(months: List<String>, year: Int, frequency: String): List<String> {
    val selectedMonths = months.mapNotNull { it.takeLast(2).toIntOrNull() }.toSet()
    val supported = buildSavingsMonthsNative(year, frequency)
    return supported.filter { it.takeLast(2).toIntOrNull() in selectedMonths }.ifEmpty { supported }
}

private fun savingsMonthKey(year: Int, frequency: String) = "$year|$frequency"
private fun savingsRowKey(frequency: String, month: String) = "$frequency|$month"

private fun planFrequency(plan: NativeSavingsPlan, legacyFrequency: String): String = when (plan.remark) {
    "单月存模式" -> "MONTHLY"
    "隔月存模式" -> "ALTERNATE"
    else -> legacyFrequency
}

private fun planBelongsToFrequency(plan: NativeSavingsPlan, frequency: String, legacyFrequency: String) = planFrequency(plan, legacyFrequency) == frequency

private fun parseSavingsExpensesNative(raw: String?): Map<String, Double> = runCatching {
    val json = JSONObject(raw.orEmpty())
    json.keys().asSequence().filterNot { it.matches(Regex("\\d+")) }.mapNotNull { key ->
        val amount = json.optDouble(key, 0.0)
        key.trim().takeIf(String::isNotBlank)?.let { it to amount }
    }.toMap()
}.getOrDefault(emptyMap())

private fun readJsonStringArray(value: JSONArray?): List<String> = value?.let { array ->
    (0 until array.length()).mapNotNull { index -> array.optString(index).takeIf { it.isNotBlank() && it != "null" } }
}.orEmpty()

private fun putJsonMonths(existing: JSONObject?, frequency: String, months: List<String>): JSONObject = JSONObject(existing?.toString().orEmpty().ifBlank { "{}" }).put(frequency, JSONArray(months))

private fun putJsonYearMonths(
    existing: JSONObject?,
    year: Int,
    frequency: String,
    months: List<String>,
    state: Map<String, List<String>>,
): JSONObject {
    val allYears = JSONObject(existing?.toString().orEmpty().ifBlank { "{}" })
    val current = JSONObject(allYears.optJSONObject(year.toString())?.toString().orEmpty().ifBlank { "{}" })
    val otherFrequency = if (frequency == "MONTHLY") "ALTERNATE" else "MONTHLY"
    val otherMonths = state[savingsMonthKey(year, otherFrequency)] ?: buildSavingsMonthsNative(year, otherFrequency)
    current.put(frequency, JSONArray(months)).put(otherFrequency, JSONArray(otherMonths))
    allYears.put(year.toString(), current)
    return allYears
}

private fun addSavingsExpenseColumn(
    rawName: String,
    columns: List<String>,
    temporary: Boolean,
    onError: (String) -> Unit,
    onAdd: (String) -> Unit,
) {
    val name = rawName.trim()
    when {
        name.isBlank() -> onError("请先输入支出名称")
        name == "上月结余" -> onError("上月结余是专用项目")
        name in columns -> onError("该支出名称已存在")
        else -> onAdd(name)
    }
}

private fun normalizeNativeDepositType(value: String?): String = when (value) {
    "PRIVATE", "FIXED_TERM" -> "PRIVATE"
    "HELP_DEPOSIT" -> "HELP_DEPOSIT"
    else -> "CASH"
}

private fun savingsDepositTypeLabelNative(value: String) = when (normalizeNativeDepositType(value)) {
    "PRIVATE" -> "死期"
    "HELP_DEPOSIT" -> "他人帮存"
    else -> "现金"
}

private fun historicalPlanCount(goalId: String, plans: List<NativeSavingsPlan>) = plans.count { it.goalId == goalId }

private fun sanitizeSavingsAmount(value: String): String {
    val result = StringBuilder()
    var decimalPointSeen = false
    value.forEach { char ->
        when {
            char.isDigit() -> result.append(char)
            char == '.' && !decimalPointSeen -> { result.append(char); decimalPointSeen = true }
        }
    }
    return result.toString()
}

private fun savingsNumberText(value: Double) = if (value % 1.0 == 0.0) value.toLong().toString() else value.toString()
private fun savingsMoney(value: String) = runCatching { DecimalFormat("#,##0.##").format(value.toDoubleOrNull() ?: 0.0) }.getOrDefault("0")

@Composable
private fun SavingsEditorCard(content: @Composable ColumnScope.() -> Unit) {
    Card(
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Column(Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp), content = content)
    }
}

@Composable
private fun SavingsEditorInput(
    label: String,
    value: String,
    onValueChange: (String) -> Unit,
    placeholder: String,
    isAmount: Boolean,
    modifier: Modifier = Modifier,
) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(label, color = SavingsInk, fontSize = 10.sp, fontWeight = FontWeight.SemiBold)
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            placeholder = { Text(placeholder, fontSize = 12.sp) },
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = if (isAmount) KeyboardType.Decimal else KeyboardType.Text),
            textStyle = MaterialTheme.typography.bodyMedium.copy(fontSize = 13.sp),
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
        )
    }
}

@Composable
private fun SavingsChoiceRow(options: List<Pair<String, String>>, selected: String, onSelect: (String) -> Unit) {
    Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(7.dp)) {
        options.forEach { (label, value) ->
            Text(
                label,
                modifier = Modifier.clip(RoundedCornerShape(12.dp)).background(if (selected == value) Color(0xFFE9F3FF) else Color(0xFFF4F7FA))
                    .clickable { onSelect(value) }.padding(horizontal = 12.dp, vertical = 8.dp),
                color = if (selected == value) SavingsBlue else SavingsMuted,
                fontSize = 11.sp,
                fontWeight = FontWeight.Bold,
            )
        }
    }
}

@Composable
private fun SavingsSummaryPill(label: String, amount: Double, modifier: Modifier = Modifier) {
    Column(modifier.clip(RoundedCornerShape(12.dp)).background(Color(0xFFF5F8FB)).padding(horizontal = 8.dp, vertical = 9.dp)) {
        Text(label, color = SavingsMuted, fontSize = 9.sp)
        Text("¥${DecimalFormat("#,##0.##").format(amount)}", color = if (amount < 0) SavingsRed else SavingsInk, fontSize = 10.sp, fontWeight = FontWeight.Bold, maxLines = 1)
    }
}

@Composable
private fun SavingsEditorAction(label: String, modifier: Modifier = Modifier, onClick: () -> Unit) {
    TextButton(onClick = onClick, modifier = modifier, shape = RoundedCornerShape(12.dp)) { Text(label, fontSize = 11.sp) }
}

private val SavingsCanvas = Color(0xFFFBFCFE)
private val SavingsInk = Color(0xFF1F2A37)
private val SavingsMuted = Color(0xFF7A8796)
private val SavingsBlue = Color(0xFF3977C5)
private val SavingsGreen = Color(0xFF0D8A5F)
private val SavingsRed = Color(0xFFCE4850)
