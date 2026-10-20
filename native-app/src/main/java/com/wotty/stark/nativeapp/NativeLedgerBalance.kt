package com.wotty.stark.nativeapp

import android.app.DatePickerDialog
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
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Event
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Surface
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

internal data class NativeLedgerAccount(
    val id: String,
    val name: String,
    val ownerId: String,
    val openingBalance: Double? = null,
    val openingBalanceDate: String? = null,
    val createdAt: String = "",
    val updatedAt: String = "",
)

internal data class NativeLedgerCashflow(
    val income: Double,
    val expense: Double,
    val repayment: Double,
    val savings: Double,
    val count: Int,
) {
    val net: Double get() = income - expense - repayment - savings
}

internal fun JSONObject.toNativeLedgerAccount(
    accountIdFallback: String = "local",
    ownerIdFallback: String = "local-user",
): NativeLedgerAccount = NativeLedgerAccount(
    id = optString("id").ifBlank { accountIdFallback },
    name = optString("name").ifBlank { if (accountIdFallback == "local") "本地账本" else "云端账本" },
    ownerId = optString("ownerId").ifBlank { ownerIdFallback },
    openingBalance = if (!has("openingBalance") || isNull("openingBalance")) null else optDouble("openingBalance").takeIf(Double::isFinite),
    openingBalanceDate = optString("openingBalanceDate").takeIf { it.isNotBlank() && it != "null" }?.take(10),
    createdAt = optString("createdAt"),
    updatedAt = optString("updatedAt"),
)

internal fun NativeLedgerAccount.toPayload(): JSONObject = JSONObject()
    .put("id", id)
    .put("name", name)
    .put("ownerId", ownerId)
    .put("openingBalance", openingBalance ?: JSONObject.NULL)
    .put("openingBalanceDate", openingBalanceDate?.let { "${it.take(10)}T00:00:00" } ?: JSONObject.NULL)
    .put("createdAt", createdAt)
    .put("updatedAt", updatedAt)

internal fun calculateNativeLedgerCashflow(
    entries: List<LedgerEntry>,
    savingsPlans: List<NativeSavingsPlan>,
    startDate: String,
    throughDate: LocalDate = LocalDate.now(),
): NativeLedgerCashflow {
    val start = runCatching { LocalDate.parse(startDate.take(10)) }.getOrNull()
        ?: return NativeLedgerCashflow(0.0, 0.0, 0.0, 0.0, 0)
    val scoped = entries.filter { entry ->
        val date = runCatching { LocalDate.parse(entry.transactionDate.take(10)) }.getOrNull()
        date != null && date >= start && date <= throughDate
    }
    val income = scoped.filter { it.type == EntryType.INCOME }.sumOf(LedgerEntry::amount)
    val expense = scoped.filter { it.type == EntryType.EXPENSE }.sumOf(LedgerEntry::amount)
    val repayment = scoped.filter { it.type == EntryType.REPAYMENT }.sumOf(LedgerEntry::amount)
    val savings = savingsPlans.sumOf { plan ->
        if (plan.status != "COMPLETED") return@sumOf 0.0
        val actualDate = plan.actualDate?.take(10)
            ?: plan.updatedAt.take(10).takeIf { it.matches(Regex("\\d{4}-\\d{2}-\\d{2}")) }
            ?: return@sumOf 0.0
        val date = runCatching { LocalDate.parse(actualDate) }.getOrNull() ?: return@sumOf 0.0
        if (date < start || date > throughDate) return@sumOf 0.0
        (plan.actualAmount?.takeIf { it.isFinite() && it >= 0.0 } ?: plan.amount).coerceAtLeast(0.0)
    }
    return NativeLedgerCashflow(income, expense, repayment, savings, scoped.size)
}

internal fun calculateNativeLedgerBalance(
    account: NativeLedgerAccount,
    entries: List<LedgerEntry>,
    savingsPlans: List<NativeSavingsPlan>,
    throughDate: LocalDate = LocalDate.now(),
): Double? {
    val openingBalance = account.openingBalance?.takeIf(Double::isFinite) ?: return null
    val openingDate = account.openingBalanceDate?.takeIf(String::isNotBlank) ?: return null
    val date = runCatching { LocalDate.parse(openingDate.take(10)) }.getOrNull() ?: return null
    if (date > throughDate) return null
    return openingBalance + calculateNativeLedgerCashflow(entries, savingsPlans, openingDate, throughDate).net
}

private val LedgerBalanceInk = Color(0xFF1F2937)
private val LedgerBalanceMuted = Color(0xFF7B8798)
private val LedgerBalanceBlue = Color(0xFF0869C6)
private val LedgerBalanceGreen = Color(0xFF0A966B)
private val LedgerBalanceRed = Color(0xFFD94D5D)
private val LedgerBalanceLine = Color(0xFFE8EDF3)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun NativeLedgerBalanceSheet(
    account: NativeLedgerAccount,
    entries: List<LedgerEntry>,
    savingsPlans: List<NativeSavingsPlan>,
    onDismiss: () -> Unit,
    onSave: suspend (Double, String) -> Unit,
) {
    val language = LocalNativeUiPreferences.current.value.language
    val context = LocalContext.current
    val scope = rememberCoroutineScope()
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    var openingDate by remember(account.openingBalanceDate) {
        mutableStateOf(account.openingBalanceDate?.take(10) ?: LocalDate.now().toString())
    }
    var amountText by remember(account.openingBalance, account.openingBalanceDate) {
        mutableStateOf(account.openingBalance?.takeIf { account.openingBalanceDate != null }?.let { "%.2f".format(Locale.US, it) }.orEmpty())
    }
    var saving by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    var statusMessage by remember { mutableStateOf("") }

    val amount = amountText.trim().toDoubleOrNull()?.takeIf(Double::isFinite)
    val cashflow = remember(entries, savingsPlans, openingDate) {
        calculateNativeLedgerCashflow(entries, savingsPlans, openingDate)
    }
    val projectedBalance = amount?.plus(cashflow.net)
    val storedDate = account.openingBalanceDate?.take(10).orEmpty()
    val storedAmount = account.openingBalance.takeIf { storedDate.isNotBlank() }

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
            verticalArrangement = Arrangement.spacedBy(13.dp),
        ) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(translateNativeText("余额基准", language), color = LedgerBalanceInk, fontSize = 21.sp, fontWeight = FontWeight.Bold)
                    Text(translateNativeText("设置已确认余额的日期和金额", language), color = LedgerBalanceMuted, fontSize = 11.sp, modifier = Modifier.padding(top = 3.dp))
                }
                IconButton(onClick = onDismiss, enabled = !saving, modifier = Modifier.size(38.dp)) {
                    Icon(Icons.Default.Close, contentDescription = translateNativeText("关闭", language), tint = LedgerBalanceMuted)
                }
            }

            Surface(color = Color.White, shape = RoundedCornerShape(16.dp), border = androidx.compose.foundation.BorderStroke(1.dp, LedgerBalanceLine)) {
                Column(Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(9.dp)) {
                    Text(translateNativeText("余额基准日期", language), color = LedgerBalanceInk, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        onClick = {
                            val current = runCatching { LocalDate.parse(openingDate) }.getOrElse { LocalDate.now() }
                            DatePickerDialog(context, { _, year, month, day ->
                                openingDate = LocalDate.of(year, month + 1, day).toString()
                                amountText = if (openingDate == storedDate) storedAmount?.let { "%.2f".format(Locale.US, it) }.orEmpty() else ""
                                errorMessage = ""
                                statusMessage = ""
                            }, current.year, current.monthValue - 1, current.dayOfMonth).apply {
                                datePicker.maxDate = System.currentTimeMillis()
                            }.show()
                        },
                        color = Color(0xFFF7F9FC),
                        shape = RoundedCornerShape(12.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, LedgerBalanceLine),
                    ) {
                        Row(Modifier.padding(horizontal = 13.dp, vertical = 13.dp), verticalAlignment = Alignment.CenterVertically) {
                            Icon(Icons.Default.Event, contentDescription = null, tint = LedgerBalanceBlue, modifier = Modifier.size(18.dp))
                            Spacer(Modifier.width(9.dp))
                            Text(openingDate, color = LedgerBalanceInk, fontSize = 13.sp, modifier = Modifier.weight(1f))
                            Text(translateNativeText("选择日期", language), color = LedgerBalanceBlue, fontSize = 11.sp)
                        }
                    }
                    Text(translateNativeText("该日期 00:00 的实际余额；日期当天的流水会计入", language), color = LedgerBalanceMuted, fontSize = 10.sp)
                    OutlinedTextField(
                        value = amountText,
                        onValueChange = { value ->
                            amountText = value.filterIndexed { index, char -> char.isDigit() || char == '.' || (char == '-' && index == 0) }
                            errorMessage = ""
                            statusMessage = ""
                        },
                        modifier = Modifier.fillMaxWidth(),
                        label = { Text(translateNativeText("实际余额", language)) },
                        prefix = { Text("¥ ") },
                        placeholder = { Text(translateNativeText("输入该日已确认的余额", language)) },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    )
                }
            }

            Surface(color = Color.White, shape = RoundedCornerShape(16.dp), border = androidx.compose.foundation.BorderStroke(1.dp, LedgerBalanceLine)) {
                Column(Modifier.fillMaxWidth().padding(14.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text(translateNativeText("基准日期起的累计变动", language), color = LedgerBalanceInk, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                    LedgerBalanceValueRow(translateNativeText("累计收入", language), cashflow.income, positive = true)
                    LedgerBalanceValueRow(translateNativeText("累计支出", language), cashflow.expense, positive = false)
                    LedgerBalanceValueRow(translateNativeText("累计还款", language), cashflow.repayment, positive = false)
                    LedgerBalanceValueRow(translateNativeText("已存储蓄", language), cashflow.savings, positive = false)
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text(translateNativeText("纳入流水", language), color = LedgerBalanceMuted, fontSize = 11.sp)
                        Text(translateNativeText("${cashflow.count} 笔", language), color = LedgerBalanceInk, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                    }
                    androidx.compose.material3.HorizontalDivider(color = LedgerBalanceLine)
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Text(translateNativeText("预计当前余额", language), color = LedgerBalanceInk, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        Text(projectedBalance?.let { "¥ ${"%,.2f".format(Locale.getDefault(), it)}" } ?: "—", color = if ((projectedBalance ?: 0.0) >= 0.0) LedgerBalanceGreen else LedgerBalanceRed, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }

            Text(
                translateNativeText("保存只设置账本余额基准，不会新增校正收入或支出。转账不改变账本总余额。", language),
                color = LedgerBalanceMuted,
                fontSize = 10.sp,
            )
            if (errorMessage.isNotBlank()) Text(translateNativeText(errorMessage, language), color = LedgerBalanceRed, fontSize = 11.sp)
            if (statusMessage.isNotBlank()) Text(translateNativeText(statusMessage, language), color = LedgerBalanceGreen, fontSize = 11.sp)
            Button(
                onClick = {
                    val parsedDate = runCatching { LocalDate.parse(openingDate) }.getOrNull()
                    when {
                        parsedDate == null -> errorMessage = "请选择有效的余额基准日期"
                        parsedDate > LocalDate.now() -> errorMessage = "余额基准日期不能晚于今天"
                        amount == null -> errorMessage = "请输入有效的实际余额"
                        else -> scope.launch {
                            saving = true
                            errorMessage = ""
                            statusMessage = ""
                            try {
                                onSave(amount, openingDate)
                                statusMessage = "余额基准已保存"
                            } catch (error: Exception) {
                                errorMessage = error.message ?: "余额基准保存失败，请检查数据源后重试"
                            } finally {
                                saving = false
                            }
                        }
                    }
                },
                enabled = !saving && amount != null,
                modifier = Modifier.fillMaxWidth().height(48.dp),
                shape = RoundedCornerShape(13.dp),
                colors = ButtonDefaults.buttonColors(containerColor = LedgerBalanceBlue),
            ) {
                Text(if (saving) translateNativeText("保存中…", language) else translateNativeText("保存余额基准", language), fontWeight = FontWeight.SemiBold)
            }
            TextButton(onClick = onDismiss, enabled = !saving, modifier = Modifier.fillMaxWidth()) {
                Text(translateNativeText("完成", language), color = LedgerBalanceMuted)
            }
        }
    }
}

@Composable
private fun LedgerBalanceValueRow(label: String, amount: Double, positive: Boolean) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, color = LedgerBalanceMuted, fontSize = 11.sp)
        Text(
            (if (positive) "+" else "−") + "¥ ${"%,.2f".format(Locale.getDefault(), amount)}",
            color = if (positive) LedgerBalanceGreen else LedgerBalanceInk,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium,
        )
    }
}
