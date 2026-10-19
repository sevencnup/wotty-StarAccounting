package com.wotty.stark.nativeapp

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Slider
import androidx.compose.material3.Surface
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.Locale
import java.util.UUID
import kotlin.math.roundToInt

private val BudgetInk = Color(0xFF1F2937)
private val BudgetMuted = Color(0xFF7B8798)
private val BudgetBlue = Color(0xFF0869C6)
private val BudgetGreen = Color(0xFF0A966B)
private val BudgetRed = Color(0xFFD94D5D)
private val BudgetLine = Color(0xFFE8EDF3)

internal data class NativeBudget(
    val id: String,
    val userId: String,
    val accountId: String,
    val amount: Double,
    val category: String = "ALL",
    val period: String = "MONTHLY",
    val alertPercent: Int = 80,
    val platform: String? = null,
    val scopeType: String = "GLOBAL",
    val createdAt: String,
    val updatedAt: String,
)

internal fun JSONObject.toNativeBudget(accountIdFallback: String = ""): NativeBudget = NativeBudget(
    id = optString("id"),
    userId = optString("userId"),
    accountId = optString("accountId").ifBlank { accountIdFallback },
    amount = optDouble("amount", 0.0).takeIf(Double::isFinite) ?: 0.0,
    category = optString("category", "ALL").ifBlank { "ALL" },
    period = optString("period", "MONTHLY").takeIf { it == "YEARLY" } ?: "MONTHLY",
    alertPercent = optInt("alertPercent", 80).coerceIn(1, 100),
    platform = optString("platform").takeIf(String::isNotBlank),
    scopeType = optString("scopeType", "GLOBAL").ifBlank { "GLOBAL" },
    createdAt = optString("createdAt"),
    updatedAt = optString("updatedAt"),
)

internal fun NativeBudget.toPayload(): JSONObject = JSONObject()
    .put("id", id)
    .put("userId", userId)
    .put("accountId", accountId)
    .put("amount", amount)
    .put("category", category)
    .put("period", period)
    .put("alertPercent", alertPercent.coerceIn(1, 100))
    .put("platform", platform ?: JSONObject.NULL)
    .put("scopeType", scopeType)
    .put("createdAt", createdAt)
    .put("updatedAt", updatedAt)

internal fun newNativeBudget(
    id: String = "budget-${UUID.randomUUID()}",
    userId: String,
    accountId: String,
    amount: Double,
    period: String = "MONTHLY",
    alertPercent: Int = 80,
    createdAt: String = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
    updatedAt: String = createdAt,
): NativeBudget = NativeBudget(
    id = id,
    userId = userId,
    accountId = accountId,
    amount = amount,
    category = "ALL",
    period = if (period == "YEARLY") "YEARLY" else "MONTHLY",
    alertPercent = alertPercent.coerceIn(1, 100),
    platform = null,
    scopeType = "GLOBAL",
    createdAt = createdAt,
    updatedAt = updatedAt,
)

internal fun calculateNativeBudgetSpent(
    entries: List<LedgerEntry>,
    budget: NativeBudget,
    reportingMonth: String,
    monthlyExpense: Double,
): Double {
    val year = reportingMonth.take(4)
    val periodEntries = entries.filter { entry ->
        if (entry.type != EntryType.EXPENSE) return@filter false
        val date = entry.transactionDate.ifBlank { entry.date.take(10) }
        if (budget.period == "YEARLY") date.startsWith(year) else date.startsWith(reportingMonth.take(7))
    }
    if (budget.scopeType == "GLOBAL") return if (budget.period == "MONTHLY") monthlyExpense else periodEntries.sumOf(LedgerEntry::amount)
    if (budget.scopeType == "PLATFORM") {
        return periodEntries.filter { it.platform == budget.platform }.sumOf(LedgerEntry::amount)
    }
    fun normalize(category: String): String = when {
        "生活" in category -> "生活消费"
        "交" in category || "车" in category -> "交通出行"
        "餐" in category || "饮" in category -> "餐饮美食"
        "娱" in category -> "休闲娱乐"
        "购" in category -> "购物消费"
        "工" in category -> "工资收入"
        else -> category.ifBlank { "其他" }
    }
    return periodEntries.filter { normalize(it.category.substringBefore(" ·")) == normalize(budget.category) }
        .sumOf(LedgerEntry::amount)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun NativeBudgetManagementSheet(
    budgets: List<NativeBudget>,
    accountId: String,
    userId: String,
    onDismiss: () -> Unit,
    onSave: suspend (NativeBudget) -> Unit,
    onDelete: suspend (NativeBudget) -> Unit,
) {
    val coroutineScope = rememberCoroutineScope()
    val language = LocalNativeUiPreferences.current.value.language
    var rows by remember { mutableStateOf(budgets.sortedByDescending(NativeBudget::updatedAt)) }
    var editing by remember { mutableStateOf<NativeBudget?>(null) }
    var editorOpen by remember { mutableStateOf(false) }
    var amountText by remember { mutableStateOf("") }
    var period by remember { mutableStateOf("MONTHLY") }
    var alertPercent by remember { mutableStateOf(80f) }
    var saving by remember { mutableStateOf(false) }
    var busyId by remember { mutableStateOf<String?>(null) }
    var errorMessage by remember { mutableStateOf("") }
    var statusMessage by remember { mutableStateOf("") }
    var deleteCandidate by remember { mutableStateOf<NativeBudget?>(null) }
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    LaunchedEffect(budgets) { rows = budgets.sortedByDescending(NativeBudget::updatedAt) }

    fun beginCreate() {
        editing = null
        amountText = ""
        period = "MONTHLY"
        alertPercent = 80f
        errorMessage = ""
        statusMessage = ""
        editorOpen = true
    }

    fun beginEdit(budget: NativeBudget) {
        editing = budget
        amountText = budget.amount.toString()
        period = budget.period
        alertPercent = budget.alertPercent.toFloat()
        errorMessage = ""
        statusMessage = ""
        editorOpen = true
    }

    fun saveBudget() {
        val amount = amountText.toDoubleOrNull()
        if (amount == null || !amount.isFinite() || amount <= 0.0) {
            errorMessage = "请输入大于 0 的预算金额"
            return
        }
        if (saving) return
        val now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
        val saved = newNativeBudget(
            id = editing?.id ?: "budget-${UUID.randomUUID()}",
            userId = editing?.userId?.ifBlank { userId } ?: userId,
            accountId = editing?.accountId?.ifBlank { accountId } ?: accountId,
            amount = amount,
            period = period,
            alertPercent = alertPercent.roundToInt().coerceIn(1, 100),
            createdAt = editing?.createdAt?.ifBlank { now } ?: now,
            updatedAt = now,
        )
        coroutineScope.launch {
            saving = true
            errorMessage = ""
            try {
                onSave(saved)
                rows = (listOf(saved) + rows.filterNot { it.id == saved.id }).sortedByDescending(NativeBudget::updatedAt)
                editorOpen = false
                editing = null
                statusMessage = "预算已保存"
            } catch (error: Throwable) {
                errorMessage = "保存失败，请检查当前数据源后重试"
            } finally {
                saving = false
            }
        }
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = sheetState,
        containerColor = Color(0xFFFBFCFE),
        dragHandle = null,
        modifier = Modifier.fillMaxHeight(.94f),
    ) {
        Column(
            Modifier.fillMaxWidth().weight(1f, fill = false).statusBarsPadding().imePadding().navigationBarsPadding()
                .verticalScroll(rememberScrollState()).padding(horizontal = 20.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(15.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("预算管理", color = BudgetInk, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                    Text("管理当前账本的月度和年度总预算", color = BudgetMuted, fontSize = 12.sp, modifier = Modifier.padding(top = 3.dp))
                }
                TextButton(onClick = ::beginCreate, enabled = !saving && busyId == null) {
                    Icon(Icons.Default.Add, contentDescription = null, tint = BudgetBlue, modifier = Modifier.size(18.dp))
                    Spacer(Modifier.width(3.dp))
                    Text("新增预算", color = BudgetBlue, fontWeight = FontWeight.SemiBold)
                }
                IconButton(onClick = onDismiss, enabled = !saving && busyId == null, modifier = Modifier.size(38.dp)) {
                    Icon(Icons.Default.Close, contentDescription = translateNativeText("关闭预算管理", language), tint = BudgetMuted)
                }
            }

            if (rows.isEmpty()) {
                Surface(
                    color = Color.White,
                    shape = RoundedCornerShape(18.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, BudgetLine),
                ) {
                    Column(Modifier.fillMaxWidth().padding(vertical = 28.dp, horizontal = 18.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("还没有预算，先新增一个总预算", color = BudgetMuted, fontSize = 13.sp)
                    }
                }
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(9.dp)) {
                    rows.forEach { budget ->
                        Surface(
                            color = Color.White,
                            shape = RoundedCornerShape(16.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, BudgetLine),
                        ) {
                            Row(
                                Modifier.fillMaxWidth().padding(horizontal = 14.dp, vertical = 12.dp),
                                verticalAlignment = Alignment.CenterVertically,
                            ) {
                                Column(Modifier.weight(1f)) {
                                    Text(if (budget.period == "YEARLY") "年度总预算" else "月度总预算", color = BudgetInk, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                                    Text("达到 ${budget.alertPercent}% 时提醒", color = BudgetMuted, fontSize = 11.sp, modifier = Modifier.padding(top = 3.dp))
                                }
                                Text("¥ ${String.format(Locale.CHINA, "%,.2f", budget.amount)}", color = BudgetInk, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                                Spacer(Modifier.width(5.dp))
                                IconButton(onClick = { beginEdit(budget) }, enabled = !saving && busyId == null, modifier = Modifier.size(36.dp)) {
                                    Icon(Icons.Default.Edit, contentDescription = translateNativeText("编辑预算", language), tint = BudgetBlue, modifier = Modifier.size(18.dp))
                                }
                                IconButton(onClick = { deleteCandidate = budget }, enabled = !saving && busyId == null, modifier = Modifier.size(36.dp)) {
                                    Icon(Icons.Default.Delete, contentDescription = translateNativeText("删除预算", language), tint = BudgetRed, modifier = Modifier.size(18.dp))
                                }
                            }
                        }
                    }
                }
            }

            if (statusMessage.isNotBlank()) Text(statusMessage, color = BudgetGreen, fontSize = 12.sp)

            if (editorOpen) {
                Surface(
                    color = Color.White,
                    shape = RoundedCornerShape(18.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, BudgetLine),
                ) {
                    Column(Modifier.fillMaxWidth().padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text(if (editing == null) "新增预算" else "编辑预算", color = BudgetInk, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                Text("总预算按月或按年统计", color = BudgetMuted, fontSize = 11.sp, modifier = Modifier.padding(top = 2.dp))
                            }
                            TextButton(onClick = { editorOpen = false; editing = null; errorMessage = "" }, enabled = !saving) { Text("取消") }
                        }
                        OutlinedTextField(
                            value = amountText,
                            onValueChange = { value ->
                                val filtered = value.filter { it.isDigit() || it == '.' }
                                if (filtered.count { it == '.' } <= 1) amountText = filtered
                            },
                            modifier = Modifier.fillMaxWidth(),
                            label = { Text("预算金额") },
                            placeholder = { Text("0.00") },
                            prefix = { Text("¥ ") },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                        )
                        Text("周期", color = BudgetInk, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(13.dp)).background(Color(0xFFF1F5F9)).padding(4.dp)) {
                            listOf("MONTHLY" to "每月", "YEARLY" to "每年").forEach { (key, label) ->
                                val selected = period == key
                                Surface(
                                    color = if (selected) Color.White else Color.Transparent,
                                    shape = RoundedCornerShape(10.dp),
                                    modifier = Modifier.weight(1f).clickable(enabled = !saving) { period = key },
                                ) {
                                    Text(label, color = if (selected) BudgetBlue else BudgetMuted, fontSize = 13.sp, fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Normal, modifier = Modifier.padding(vertical = 10.dp), textAlign = androidx.compose.ui.text.style.TextAlign.Center)
                                }
                            }
                        }
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text("提醒比例 ${alertPercent.roundToInt()}%", color = BudgetInk, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                            Text("达到后关注支出", color = BudgetMuted, fontSize = 10.sp)
                        }
                        Slider(
                            value = alertPercent,
                            onValueChange = { alertPercent = it.coerceIn(1f, 100f) },
                            valueRange = 1f..100f,
                            enabled = !saving,
                        )
                        if (errorMessage.isNotBlank()) Text(errorMessage, color = BudgetRed, fontSize = 12.sp)
                        androidx.compose.material3.Button(
                            onClick = ::saveBudget,
                            enabled = !saving,
                            modifier = Modifier.fillMaxWidth().height(48.dp),
                            shape = RoundedCornerShape(14.dp),
                            colors = androidx.compose.material3.ButtonDefaults.buttonColors(containerColor = BudgetGreen),
                        ) { Text(if (saving) "保存中..." else "保存预算", color = Color.White, fontWeight = FontWeight.SemiBold) }
                    }
                }
            } else if (errorMessage.isNotBlank()) {
                Text(errorMessage, color = BudgetRed, fontSize = 12.sp)
            }
        }
    }

    deleteCandidate?.let { candidate ->
        AlertDialog(
            onDismissRequest = { if (busyId == null) deleteCandidate = null },
            title = { Text("删除预算", fontWeight = FontWeight.Bold) },
            text = { Text("确定删除${if (candidate.period == "YEARLY") "年度" else "月度"}总预算吗？") },
            confirmButton = {
                TextButton(
                    enabled = busyId == null,
                    onClick = {
                        coroutineScope.launch {
                            busyId = candidate.id
                            errorMessage = ""
                            try {
                                onDelete(candidate)
                                rows = rows.filterNot { it.id == candidate.id }
                                statusMessage = "预算已删除"
                                deleteCandidate = null
                            } catch (error: Throwable) {
                                errorMessage = "删除失败，请检查当前数据源后重试"
                            } finally {
                                busyId = null
                            }
                        }
                    },
                ) { Text(if (busyId == candidate.id) "删除中..." else "删除", color = BudgetRed) }
            },
            dismissButton = { TextButton(onClick = { deleteCandidate = null }, enabled = busyId == null) { Text("取消") } },
            shape = RoundedCornerShape(22.dp),
            containerColor = Color.White,
        )
    }
}
