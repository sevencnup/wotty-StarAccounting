package com.wotty.stark.nativeapp

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
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
import androidx.compose.foundation.layout.imePadding
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
import androidx.compose.material.icons.filled.CloudSync
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
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
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.UUID

private val SettingsInk = Color(0xFF1F2937)
private val SettingsMuted = Color(0xFF7B8798)
private val SettingsBlue = Color(0xFF0869C6)
private val SettingsGreen = Color(0xFF0A966B)
private val SettingsRed = Color(0xFFD94D5D)
private val SettingsAmber = Color(0xFFF0A329)
private val SettingsLine = Color(0xFFE8EDF3)

@Composable
internal fun NativeSettingsScreen(
    modifier: Modifier,
    apiPreferences: NativeApiPreferences,
    apiStatus: String,
    subscriptions: List<NativeSubscription>,
    onOpenApi: () -> Unit,
    onRefresh: () -> Unit,
    onSaveSubscription: suspend (NativeSubscription) -> Unit,
    onDeleteSubscription: suspend (NativeSubscription) -> Unit,
) {
    var subscriptionsOpen by remember { mutableStateOf(false) }
    var helpOpen by remember { mutableStateOf(false) }
    var aboutOpen by remember { mutableStateOf(false) }
    LazyColumn(
        modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 18.dp, end = 18.dp, top = 8.dp, bottom = 104.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item { SettingsPageHeader() }
        item {
            SettingsPanel {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text(if (apiPreferences.token.isBlank()) "本地账本" else "云端账本", color = SettingsInk, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                        Text(apiStatus, color = if (apiPreferences.token.isBlank()) SettingsMuted else SettingsGreen, fontSize = 11.sp, modifier = Modifier.padding(top = 4.dp))
                        if (apiPreferences.token.isNotBlank()) {
                            Text(apiPreferences.baseUrl, color = SettingsMuted, fontSize = 9.sp, maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.padding(top = 3.dp))
                        } else {
                            Text("数据保存在此设备；连接云端后使用独立云端账本。", color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 3.dp))
                        }
                    }
                    Icon(Icons.Default.CloudSync, contentDescription = null, tint = SettingsBlue, modifier = Modifier.size(22.dp))
                }
                Row(Modifier.fillMaxWidth().padding(top = 7.dp), horizontalArrangement = Arrangement.End) {
                    TextButton(onClick = onRefresh, enabled = apiPreferences.token.isNotBlank()) {
                        Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                        Text("刷新数据")
                    }
                    TextButton(onClick = onOpenApi) { Text(if (apiPreferences.token.isBlank()) "连接云端" else "账号设置") }
                }
            }
        }
        item {
            SettingsSectionTitle("账单管理", "周期支出按规则自动写入当前账本")
            SettingsMenuRow(
                title = "订阅/扣费管理",
                detail = if (subscriptions.isEmpty()) "保险、房租等固定支出 · 尚未设置" else "${subscriptions.count { it.isActive }} 项自动记账中 · 共 ${subscriptions.size} 项",
                color = SettingsGreen,
                icon = Icons.Default.ReceiptLong,
                onClick = { subscriptionsOpen = true },
            )
        }
        item {
            SettingsSectionTitle("应用信息", "纯 Kotlin · Jetpack Compose")
            SettingsMenuRow("帮助与反馈", "数据同步和周期支出的说明", SettingsBlue, Icons.Default.Info) { helpOpen = true }
            SettingsMenuRow("关于星会计", "版本 ${BuildConfig.VERSION_NAME}", SettingsAmber, Icons.Default.Settings) { aboutOpen = true }
        }
    }
    if (subscriptionsOpen) {
        NativeSubscriptionManagerSheet(
            items = subscriptions,
            onDismiss = { subscriptionsOpen = false },
            onSave = onSaveSubscription,
            onDelete = onDeleteSubscription,
        )
    }
    if (helpOpen) {
        AlertDialog(
            onDismissRequest = { helpOpen = false },
            title = { Text("帮助与反馈") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                    Text("云端同步失败时，请检查服务地址和网络后点“刷新数据”。")
                    Text("订阅/扣费管理会按设定日期补记流水；同一订阅、同一月份只生成一笔。")
                    Text("自动记录只用于个人账目规划，不会实际扣款。")
                }
            },
            confirmButton = { TextButton(onClick = { helpOpen = false }) { Text("知道了") } },
        )
    }
    if (aboutOpen) {
        AlertDialog(
            onDismissRequest = { aboutOpen = false },
            title = { Text("星会计") },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(7.dp)) {
                    Text("版本 ${BuildConfig.VERSION_NAME}")
                    Text("本地优先、可连接云端的个人财务管理工具。")
                    Text("原生实现：Kotlin + Jetpack Compose")
                }
            },
            confirmButton = { TextButton(onClick = { aboutOpen = false }) { Text("关闭") } },
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun NativeSubscriptionManagerSheet(
    items: List<NativeSubscription>,
    onDismiss: () -> Unit,
    onSave: suspend (NativeSubscription) -> Unit,
    onDelete: suspend (NativeSubscription) -> Unit,
) {
    var editorOpen by remember { mutableStateOf(false) }
    var editing by remember { mutableStateOf<NativeSubscription?>(null) }
    var deleteCandidate by remember { mutableStateOf<NativeSubscription?>(null) }
    var saving by remember { mutableStateOf(false) }
    var actionError by remember { mutableStateOf("") }
    var message by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    ModalBottomSheet(onDismissRequest = onDismiss, sheetState = sheetState) {
        Column(
            Modifier.fillMaxWidth().heightIn(max = 760.dp).navigationBarsPadding().imePadding().padding(horizontal = 18.dp),
        ) {
            Row(Modifier.fillMaxWidth().padding(bottom = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(if (editorOpen) if (editing == null) "新增周期支出" else "编辑周期支出" else "订阅/扣费管理", color = SettingsInk, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    Text("按月自动记账，不会实际执行扣款", color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 3.dp))
                }
                TextButton(onClick = if (editorOpen) { { editorOpen = false; editing = null; actionError = "" } } else onDismiss) {
                    Text(if (editorOpen) "返回" else "完成")
                }
            }
            if (editorOpen) {
                NativeSubscriptionEditor(
                    subscription = editing,
                    saving = saving,
                    error = actionError,
                    message = message,
                    onSave = { updated ->
                        scope.launch {
                            saving = true
                            actionError = ""
                            message = ""
                            runCatching { onSave(updated) }
                                .onSuccess {
                                    editorOpen = false
                                    editing = null
                                    message = if (updated.isActive) "周期支出已保存" else "周期支出已停用"
                                }
                                .onFailure { actionError = it.message ?: "周期支出保存失败，请稍后重试" }
                            saving = false
                        }
                    },
                )
            } else {
                Text("应用启动或从后台恢复时会补记已到期的月份；31 日在短月份按月末入账。", color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(bottom = 10.dp))
                LazyColumn(
                    Modifier.weight(1f, fill = false).fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    contentPadding = PaddingValues(bottom = 8.dp),
                ) {
                    if (items.isEmpty()) {
                        item {
                            SettingsEmptyCard("还没有周期支出", "添加保险费、房租、还款等固定项目，系统会按月自动记账。")
                        }
                    }
                    items(items, key = { it.id }) { item ->
                        SubscriptionItemCard(
                            item = item,
                            onEdit = { editing = item; editorOpen = true; actionError = ""; message = "" },
                            onToggle = {
                                scope.launch {
                                    saving = true
                                    actionError = ""
                                    runCatching { onSave(item.copy(isActive = !item.isActive)) }
                                        .onSuccess { message = if (item.isActive) "已停用，历史流水保留" else "已启用并检查到期月份" }
                                        .onFailure { actionError = it.message ?: "状态更新失败" }
                                    saving = false
                                }
                            },
                            onDelete = { deleteCandidate = item },
                            enabled = !saving,
                        )
                    }
                    if (actionError.isNotBlank()) item { SettingsInlineMessage(actionError, SettingsRed) }
                    if (message.isNotBlank()) item { SettingsInlineMessage(message, SettingsGreen) }
                }
                Button(
                    onClick = { editing = null; editorOpen = true; actionError = ""; message = "" },
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp, bottom = 16.dp).height(47.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = SettingsBlue),
                    enabled = !saving,
                ) { Text("新增周期支出", fontWeight = FontWeight.Bold) }
            }
        }
    }
    deleteCandidate?.let { item ->
        AlertDialog(
            onDismissRequest = { if (!saving) deleteCandidate = null },
            title = { Text("删除周期支出？") },
            text = {
                Column {
                    Text("确定删除“${item.name}”吗？已生成的历史流水会保留。")
                    if (actionError.isNotBlank()) Text(actionError, color = SettingsRed, modifier = Modifier.padding(top = 8.dp))
                }
            },
            confirmButton = {
                TextButton(enabled = !saving, onClick = {
                    scope.launch {
                        saving = true
                        actionError = ""
                        runCatching { onDelete(item) }
                            .onSuccess { deleteCandidate = null; message = "周期支出已删除，历史流水保留" }
                            .onFailure { actionError = it.message ?: "删除失败，请稍后重试" }
                        saving = false
                    }
                }) { Text("删除", color = SettingsRed) }
            },
            dismissButton = { TextButton(enabled = !saving, onClick = { deleteCandidate = null }) { Text("取消") } },
        )
    }
}

@Composable
private fun NativeSubscriptionEditor(
    subscription: NativeSubscription?,
    saving: Boolean,
    error: String,
    message: String,
    onSave: (NativeSubscription) -> Unit,
) {
    val today = remember { LocalDate.now().toString() }
    var name by remember(subscription?.id) { mutableStateOf(subscription?.name.orEmpty()) }
    var amount by remember(subscription?.id) { mutableStateOf(subscription?.amount?.toString().orEmpty()) }
    var day by remember(subscription?.id) { mutableStateOf((subscription?.billingDay ?: 1).toString()) }
    var category by remember(subscription?.id) { mutableStateOf(subscription?.category ?: "其他") }
    var platform by remember(subscription?.id) { mutableStateOf(subscription?.platform ?: "其他") }
    var paymentMethod by remember(subscription?.id) { mutableStateOf(subscription?.paymentMethod.orEmpty()) }
    var startDate by remember(subscription?.id) { mutableStateOf(subscription?.startDate?.take(10) ?: today) }
    var validation by remember { mutableStateOf("") }
    val parsedAmount = amount.toDoubleOrNull()
    val parsedDay = day.toIntOrNull()
    Column(
        Modifier.fillMaxWidth().heightIn(max = 650.dp).verticalScroll(rememberScrollState()).padding(bottom = 18.dp),
        verticalArrangement = Arrangement.spacedBy(9.dp),
    ) {
        OutlinedTextField(name, { name = it; validation = "" }, Modifier.fillMaxWidth(), label = { Text("项目名称") }, placeholder = { Text("例如：保险费、房租、会员费") }, singleLine = true)
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(9.dp)) {
            OutlinedTextField(amount, { amount = it.filter { char -> char.isDigit() || char == '.' }; validation = "" }, Modifier.weight(1f), label = { Text("每月金额（元）") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal), singleLine = true)
            OutlinedTextField(day, { day = it.filter(Char::isDigit).take(2); validation = "" }, Modifier.width(120.dp), label = { Text("每月记账日") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), singleLine = true)
        }
        Text("消费分类", color = SettingsMuted, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
        ChoiceChips(listOf("房租水电", "保险", "交通出行", "餐饮", "生活消费", "其他"), category) { category = it }
        OutlinedTextField(category, { category = it; validation = "" }, Modifier.fillMaxWidth(), label = { Text("分类（可自定义）") }, singleLine = true)
        Text("支付平台", color = SettingsMuted, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
        ChoiceChips(listOf("支付宝", "微信", "银行卡", "现金", "其他"), platform) { platform = it }
        OutlinedTextField(paymentMethod, { paymentMethod = it }, Modifier.fillMaxWidth(), label = { Text("支付方式（可选）") }, placeholder = { Text("例如：招商银行储蓄卡") }, singleLine = true)
        OutlinedTextField(startDate, { startDate = it.take(10); validation = "" }, Modifier.fillMaxWidth(), label = { Text("开始记账日期") }, placeholder = { Text("YYYY-MM-DD") }, singleLine = true)
        Text("日期格式：YYYY-MM-DD。已生成的历史流水不会随规则修改而改变。", color = SettingsMuted, fontSize = 10.sp)
        val currentError = validation.ifBlank { error }
        if (currentError.isNotBlank()) SettingsInlineMessage(currentError, SettingsRed)
        if (message.isNotBlank()) SettingsInlineMessage(message, SettingsGreen)
        Button(
            onClick = {
                val validDate = runCatching { LocalDate.parse(startDate) }.getOrNull()
                when {
                    name.isBlank() -> validation = "请输入项目名称"
                    parsedAmount == null || !parsedAmount.isFinite() || parsedAmount <= 0.0 -> validation = "请输入大于 0 的每月金额"
                    parsedDay == null || parsedDay !in 1..31 -> validation = "记账日请输入 1 到 31"
                    validDate == null -> validation = "请输入有效的开始日期"
                    else -> {
                        val now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                        onSave(
                            NativeSubscription(
                                id = subscription?.id ?: "native-subscription-${UUID.randomUUID()}",
                                userId = subscription?.userId.orEmpty(),
                                accountId = subscription?.accountId.orEmpty(),
                                name = name.trim(),
                                amount = kotlin.math.round(parsedAmount * 100.0) / 100.0,
                                billingDay = parsedDay,
                                category = category.trim().ifBlank { "其他" },
                                platform = platform,
                                paymentMethod = paymentMethod.trim().takeIf(String::isNotBlank),
                                startDate = validDate.toString(),
                                isActive = subscription?.isActive ?: true,
                                createdAt = subscription?.createdAt?.ifBlank { now } ?: now,
                                updatedAt = now,
                            ),
                        )
                    }
                }
            },
            enabled = !saving,
            modifier = Modifier.fillMaxWidth().height(47.dp),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(containerColor = SettingsBlue),
        ) { Text(if (saving) "保存中…" else "保存周期支出", fontWeight = FontWeight.Bold) }
    }
}

@Composable
private fun ChoiceChips(options: List<String>, selected: String, onSelect: (String) -> Unit) {
    Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(7.dp)) {
        options.forEach { item ->
            Text(
                item,
                color = if (selected == item) SettingsBlue else SettingsMuted,
                fontSize = 10.sp,
                fontWeight = if (selected == item) FontWeight.Bold else FontWeight.Medium,
                modifier = Modifier.clip(CircleShape)
                    .background(if (selected == item) SettingsBlue.copy(alpha = .1f) else Color(0xFFF3F5F8))
                    .clickable { onSelect(item) }
                    .padding(horizontal = 11.dp, vertical = 8.dp),
            )
        }
    }
}

@Composable
private fun SubscriptionItemCard(
    item: NativeSubscription,
    onEdit: () -> Unit,
    onToggle: () -> Unit,
    onDelete: () -> Unit,
    enabled: Boolean,
) {
    Card(shape = RoundedCornerShape(15.dp), colors = CardDefaults.cardColors(containerColor = if (item.isActive) Color.White else Color(0xFFF7F8FA)), border = androidx.compose.foundation.BorderStroke(1.dp, SettingsLine)) {
        Column(Modifier.fillMaxWidth().padding(12.dp)) {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(item.name, color = SettingsInk, fontSize = 13.sp, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                        Spacer(Modifier.width(7.dp))
                        SettingsBadge(if (item.isActive) "自动记账中" else "已停用", if (item.isActive) SettingsGreen else SettingsMuted)
                    }
                    Text("每月 ${item.billingDay} 日 · ${item.category} · ${item.platform}", color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 4.dp), maxLines = 1, overflow = TextOverflow.Ellipsis)
                }
                Text("¥ ${settingsMoney(item.amount)}", color = SettingsBlue, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            }
            Row(Modifier.fillMaxWidth().padding(top = 7.dp), horizontalArrangement = Arrangement.End, verticalAlignment = Alignment.CenterVertically) {
                TextButton(enabled = enabled, onClick = onEdit) { Icon(Icons.Default.Edit, null, Modifier.size(14.dp)); Spacer(Modifier.width(3.dp)); Text("编辑") }
                TextButton(enabled = enabled, onClick = onToggle) { Text(if (item.isActive) "停用" else "启用", color = if (item.isActive) SettingsAmber else SettingsGreen) }
                IconButton(enabled = enabled, onClick = onDelete, modifier = Modifier.size(36.dp)) { Icon(Icons.Default.Delete, "删除周期支出", tint = SettingsRed, modifier = Modifier.size(17.dp)) }
            }
        }
    }
}

@Composable
private fun SettingsPageHeader() {
    Row(Modifier.fillMaxWidth().padding(vertical = 3.dp), verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) {
            Text("设置", color = SettingsInk, fontSize = 23.sp, fontWeight = FontWeight.Black)
            Text("账本数据、周期扣费与应用信息", color = SettingsMuted, fontSize = 12.sp, modifier = Modifier.padding(top = 3.dp))
        }
        Icon(Icons.Default.Settings, contentDescription = null, tint = SettingsBlue, modifier = Modifier.size(26.dp))
    }
}

@Composable
private fun SettingsSectionTitle(title: String, description: String) {
    Column(Modifier.padding(top = 3.dp, bottom = 2.dp)) {
        Text(title, color = SettingsInk, fontSize = 13.sp, fontWeight = FontWeight.Bold)
        Text(description, color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 2.dp))
    }
}

@Composable
private fun SettingsPanel(content: @Composable androidx.compose.foundation.layout.ColumnScope.() -> Unit) {
    Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(Color.White).border(1.dp, SettingsLine, RoundedCornerShape(18.dp)).padding(15.dp), content = content)
}

@Composable
private fun SettingsMenuRow(title: String, detail: String, color: Color, icon: androidx.compose.ui.graphics.vector.ImageVector, onClick: () -> Unit) {
    SettingsPanel {
        Row(Modifier.fillMaxWidth().clickable(onClick = onClick), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(36.dp).clip(RoundedCornerShape(11.dp)).background(color.copy(alpha = .1f)), contentAlignment = Alignment.Center) {
                Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(19.dp))
            }
            Column(Modifier.weight(1f).padding(start = 10.dp)) {
                Text(title, color = SettingsInk, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Text(detail, color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 3.dp), maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
            Text("›", color = SettingsMuted, fontSize = 21.sp)
        }
    }
}

@Composable
private fun SettingsEmptyCard(title: String, body: String) {
    Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(Color(0xFFF7F9FC)).padding(18.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
        Text(title, color = SettingsInk, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        Text(body, color = SettingsMuted, fontSize = 10.sp)
    }
}

@Composable
private fun SettingsBadge(text: String, color: Color) {
    Text(text, color = color, fontSize = 8.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.clip(CircleShape).background(color.copy(alpha = .1f)).padding(horizontal = 7.dp, vertical = 4.dp))
}

@Composable
private fun SettingsInlineMessage(text: String, color: Color) {
    Text(text, color = color, fontSize = 10.sp, modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(10.dp)).background(color.copy(alpha = .08f)).padding(10.dp))
}

private fun settingsMoney(value: Double): String = java.math.BigDecimal.valueOf(value.takeIf(Double::isFinite) ?: 0.0)
    .setScale(2, java.math.RoundingMode.HALF_UP)
    .toPlainString()
