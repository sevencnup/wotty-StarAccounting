package com.wotty.stark.nativeapp

import androidx.compose.foundation.Canvas
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
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Savings
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
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
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.UUID

internal data class NativeAsset(
    val id: String,
    val name: String,
    val type: String,
    val balance: Double,
    val currency: String = "CNY",
    val userId: String = "",
    val accountId: String = "",
    val createdAt: String = "",
    val updatedAt: String = "",
)

internal fun JSONObject.toNativeAsset(accountIdFallback: String = ""): NativeAsset = NativeAsset(
    id = optString("id"),
    name = optString("name", "未命名资产").ifBlank { "未命名资产" },
    type = optString("type", "OTHER").ifBlank { "OTHER" },
    balance = optDouble("balance", 0.0).takeIf(Double::isFinite) ?: 0.0,
    currency = optString("currency", "CNY").ifBlank { "CNY" },
    userId = optString("userId"),
    accountId = optString("accountId").ifBlank { accountIdFallback },
    createdAt = optString("createdAt"),
    updatedAt = optString("updatedAt"),
)

internal fun NativeAsset.toPayload(): JSONObject = JSONObject()
    .put("id", id)
    .put("userId", userId)
    .put("accountId", accountId)
    .put("name", name)
    .put("type", type)
    .put("balance", balance)
    .put("currency", currency)
    .put("createdAt", createdAt)
    .put("updatedAt", updatedAt)

internal data class NativeAssetGroup(
    val key: String,
    val label: String,
    val short: String,
    val color: Color,
    val amount: Double,
)

internal data class NativeAssetOverview(
    val positiveAssets: List<NativeAsset>,
    val negativeAssets: List<NativeAsset>,
    val savingsTotal: Double,
    val loanTotal: Double,
    val assetTotal: Double,
    val liabilityTotal: Double,
    val netWorth: Double,
    val liquid: Double,
    val liquidity: Double,
    val debtRatio: Double,
    val concentration: Double,
    val assetShare: Double,
    val groups: List<NativeAssetGroup>,
)

private data class NativeAssetTypeStyle(
    val type: String,
    val label: String,
    val short: String,
    val color: Color,
)

private val nativeAssetTypes = listOf(
    NativeAssetTypeStyle("CASH", "现金", "现", Color(0xFFE9A23B)),
    NativeAssetTypeStyle("BANK_CARD", "银行卡", "卡", Color(0xFF397FE8)),
    NativeAssetTypeStyle("ALIPAY", "支付宝", "支", Color(0xFF2E91EE)),
    NativeAssetTypeStyle("WECHAT", "微信", "微", Color(0xFF25A96F)),
    NativeAssetTypeStyle("INVESTMENT", "投资", "投", Color(0xFFE27662)),
    NativeAssetTypeStyle("OTHER", "其他", "其", Color(0xFF8996AA)),
)

internal fun nativeAssetOverview(
    assets: List<NativeAsset>,
    savingsGoals: List<NativeSavingsGoal>,
    loans: List<NativeLoan>,
    fallbackBalance: Double = 0.0,
): NativeAssetOverview {
    val positive = assets.filter { it.balance >= 0.0 }
    val negative = assets.filter { it.balance < 0.0 }
    val savingsTotal = savingsGoals.sumOf { it.currentAmount.coerceAtLeast(0.0) }
    val loanTotal = loans.asSequence()
        .filter { it.status != "PAID_OFF" }
        .sumOf { it.remainingAmount.coerceAtLeast(0.0) }
    val fallback = if (assets.isEmpty()) fallbackBalance.coerceAtLeast(0.0) else 0.0
    val positiveTotal = positive.sumOf { it.balance }
    val assetTotal = positiveTotal + fallback + savingsTotal
    val liabilityTotal = negative.sumOf { kotlin.math.abs(it.balance) } + loanTotal
    val liquid = positive.asSequence()
        .filter { it.type in setOf("CASH", "BANK_CARD", "ALIPAY", "WECHAT") }
        .sumOf { it.balance } + fallback
    val maxHolding = maxOf(
        savingsTotal,
        fallback,
        positive.maxOfOrNull { it.balance } ?: 0.0,
    )
    val debtRatio = when {
        assetTotal > 0.0 -> liabilityTotal / assetTotal * 100.0
        liabilityTotal > 0.0 -> 100.0
        else -> 0.0
    }
    val groups = nativeAssetTypes.mapNotNull { style ->
        val amount = positive.asSequence().filter { it.type == style.type }.sumOf { it.balance }
        amount.takeIf { it > 0.0 }?.let { NativeAssetGroup(style.type, style.label, style.short, style.color, it) }
    }.toMutableList()
    if (fallback > 0.0) {
        groups += NativeAssetGroup("LEDGER_BALANCE", "账本余额", "账", Color(0xFF6C91C7), fallback)
    }
    if (savingsTotal > 0.0) {
        groups += NativeAssetGroup("SAVINGS", "储蓄计划", "储", Color(0xFF0A966B), savingsTotal)
    }
    return NativeAssetOverview(
        positiveAssets = positive,
        negativeAssets = negative,
        savingsTotal = savingsTotal,
        loanTotal = loanTotal,
        assetTotal = assetTotal,
        liabilityTotal = liabilityTotal,
        netWorth = assetTotal - liabilityTotal,
        liquid = liquid,
        liquidity = if (assetTotal > 0.0) liquid / assetTotal * 100.0 else 0.0,
        debtRatio = debtRatio,
        concentration = if (assetTotal > 0.0) maxHolding / assetTotal * 100.0 else 0.0,
        assetShare = if (assetTotal + liabilityTotal > 0.0) assetTotal / (assetTotal + liabilityTotal) * 100.0 else 100.0,
        groups = groups,
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun NativeAssetsOverviewScreen(
    modifier: Modifier,
    assets: List<NativeAsset>,
    savingsGoals: List<NativeSavingsGoal>,
    loans: List<NativeLoan>,
    fallbackBalance: Double,
    connected: Boolean,
    onConnect: () -> Unit,
    onOpenSavings: () -> Unit,
    onOpenLoans: () -> Unit,
    onSaveAsset: suspend (NativeAsset) -> Unit,
    onDeleteAsset: suspend (NativeAsset) -> Unit,
) {
    val overview = remember(assets, savingsGoals, loans, fallbackBalance) {
        nativeAssetOverview(assets, savingsGoals, loans, fallbackBalance)
    }
    var editorOpen by remember { mutableStateOf(false) }
    var editingAsset by remember { mutableStateOf<NativeAsset?>(null) }
    var deleteCandidate by remember { mutableStateOf<NativeAsset?>(null) }
    var deleteError by remember { mutableStateOf("") }
    var deleting by remember { mutableStateOf(false) }
    val scope = rememberCoroutineScope()

    LazyColumn(
        modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 18.dp, end = 18.dp, top = 8.dp, bottom = 104.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        item {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("资产", color = AssetInk, fontSize = 23.sp, fontWeight = FontWeight.Black)
                    Text("净资产、资金分布与关联负债", color = AssetMuted, fontSize = 12.sp, modifier = Modifier.padding(top = 3.dp))
                }
                TextButton(onClick = { editingAsset = null; editorOpen = true }) {
                    Icon(Icons.Default.Add, contentDescription = null, tint = AssetBlue)
                    Text("新增资产", color = AssetBlue)
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
                    Text("余额仅用于个人资金规划，需要根据实际情况更新。", color = Color(0xFF785811), fontSize = 11.sp, modifier = Modifier.padding(top = 3.dp))
                }
            }
        }
        item {
            AssetCard(padding = 8.dp) {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        if (connected) "云端账本 · 已连接" else "云端未连接 · 当前数据保存在本地账本",
                        color = AssetMuted,
                        fontSize = 10.5.sp,
                        modifier = Modifier.weight(1f),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                    if (!connected) {
                        Text("连接", color = AssetBlue, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.clip(RoundedCornerShape(8.dp)).clickable(onClick = onConnect).padding(horizontal = 8.dp, vertical = 6.dp))
                    }
                }
            }
        }
        item {
            AssetCard(padding = 16.dp) {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Text("资产负债全景", color = AssetGreen, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                    AssetPill(if (overview.netWorth >= 0.0) "结构稳健" else "负债关注", if (overview.netWorth >= 0.0) AssetGreen else AssetRed)
                }
                Text("净资产估值", color = AssetMuted, fontSize = 12.sp, modifier = Modifier.padding(top = 13.dp))
                Text("¥ ${assetMoney(overview.netWorth)}", color = if (overview.netWorth >= 0.0) AssetGreen else AssetRed, fontSize = 29.sp, lineHeight = 33.sp, fontWeight = FontWeight.Black, maxLines = 1)
                Text(
                    if (overview.netWorth >= 0.0) "资产能够充足覆盖当前全部负债" else "负债高于资产，建议优先降低高息债务",
                    color = AssetMuted,
                    fontSize = 11.sp,
                    modifier = Modifier.padding(top = 3.dp),
                )
                Row(Modifier.fillMaxWidth().padding(top = 12.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    AssetAmountTile("资产总额", overview.assetTotal, AssetGreen, Modifier.weight(1f))
                    AssetAmountTile("负债总额", overview.liabilityTotal, AssetRed, Modifier.weight(1f))
                }
                Canvas(Modifier.fillMaxWidth().padding(top = 14.dp).height(9.dp)) {
                    val assetWidth = size.width * (overview.assetShare / 100.0).toFloat().coerceIn(0f, 1f)
                    drawRoundRect(color = Color(0xFFE65E6E), size = size, cornerRadius = androidx.compose.ui.geometry.CornerRadius(size.height / 2f))
                    if (assetWidth > 0f) {
                        drawRoundRect(color = AssetGreen, size = androidx.compose.ui.geometry.Size(assetWidth, size.height), cornerRadius = androidx.compose.ui.geometry.CornerRadius(size.height / 2f))
                    }
                }
                Row(Modifier.fillMaxWidth().padding(top = 5.dp), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("资产占比 ${overview.assetShare.toInt()}%", color = AssetMuted, fontSize = 10.sp)
                    Text("负债占比 ${(100.0 - overview.assetShare).toInt()}%", color = AssetMuted, fontSize = 10.sp)
                }
            }
        }
        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                AssetMetric("流动资产", "¥ ${assetMoney(overview.liquid)}", "占比 ${overview.liquidity.toInt()}%", AssetBlue, Modifier.weight(1f))
                AssetMetric(
                    "负债率",
                    "${assetPercent(overview.debtRatio)}%",
                    if (overview.debtRatio <= 40.0) "安全区间" else "负债偏高",
                    when { overview.debtRatio <= 40.0 -> AssetGreen; overview.debtRatio <= 60.0 -> AssetAmber; else -> AssetRed },
                    Modifier.weight(1f),
                )
                AssetMetric("最大单项", "${assetPercent(overview.concentration)}%", if (overview.concentration <= 50.0) "分散适中" else "高度集中", AssetAmber, Modifier.weight(1f))
            }
        }
        item {
            AssetCard {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text("资产配置构成", color = AssetInk, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                        Text("资金分布与占比分析", color = AssetMuted, fontSize = 11.sp, modifier = Modifier.padding(top = 3.dp))
                    }
                    AssetPill("${overview.groups.size} 类配置", AssetBlue)
                }
                if (overview.groups.isEmpty()) {
                    Text("暂无资产配置数据", color = AssetMuted, fontSize = 12.sp, modifier = Modifier.fillMaxWidth().padding(vertical = 16.dp), textAlign = androidx.compose.ui.text.style.TextAlign.Center)
                } else {
                    Column(Modifier.fillMaxWidth().padding(top = 8.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        AssetDonut(overview.groups, Modifier.size(112.dp))
                        Column(Modifier.fillMaxWidth().padding(top = 9.dp), verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            overview.groups.forEach { group ->
                                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                                    Box(Modifier.size(8.dp).clip(CircleShape).background(group.color))
                                    Text(group.label, color = AssetInk, fontSize = 12.sp, modifier = Modifier.weight(1f).padding(start = 6.dp), maxLines = 1, overflow = TextOverflow.Ellipsis)
                                    Text("${assetPercent(if (overview.assetTotal > 0.0) group.amount / overview.assetTotal * 100.0 else 0.0)}%", color = AssetMuted, fontSize = 11.sp)
                                    Text("¥ ${assetMoney(group.amount)}", color = AssetInk, fontSize = 11.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.padding(start = 7.dp))
                                }
                            }
                        }
                    }
                }
            }
        }
        item {
            AssetCard {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text("资产与负债明细", color = AssetInk, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                        Text("各资金账户与借贷清单", color = AssetMuted, fontSize = 11.sp, modifier = Modifier.padding(top = 3.dp))
                    }
                    AssetPill("${assets.size + (if (savingsGoals.isNotEmpty()) 1 else 0) + (if (loans.isNotEmpty()) 1 else 0)} 项关联", AssetBlue)
                }
                Spacer(Modifier.height(10.dp))
                AssetLedgerGroup(
                    title = "正向资产",
                    amount = overview.assetTotal,
                    color = AssetGreen,
                    surface = Color(0xFFF5FAF7),
                ) {
                    if (overview.positiveAssets.isEmpty() && overview.savingsTotal <= 0.0 && assets.isEmpty() && fallbackBalance > 0.0) {
                        AssetLedgerRow("账本余额", "本地余额", "¥ ${assetMoney(fallbackBalance)}", AssetBlue)
                    }
                    overview.positiveAssets.forEach { item ->
                        val style = nativeAssetTypes.firstOrNull { it.type == item.type } ?: nativeAssetTypes.last()
                        AssetEntityRow(
                            title = item.name,
                            subtitle = style.label,
                            amount = "${assetCurrency(item.currency)} ${assetMoney(item.balance)}",
                            color = style.color,
                            short = style.short,
                            onEdit = { editingAsset = item; editorOpen = true },
                            onDelete = { deleteCandidate = item; deleteError = "" },
                        )
                    }
                    if (overview.savingsTotal > 0.0) {
                        AssetLedgerRow("储蓄计划", "${savingsGoals.size} 个目标计划", "¥ ${assetMoney(overview.savingsTotal)}", AssetGreen, Icons.Default.Savings, onClick = onOpenSavings)
                    }
                    if (overview.positiveAssets.isEmpty() && overview.savingsTotal <= 0.0 && !(assets.isEmpty() && fallbackBalance > 0.0)) {
                        AssetEmpty("暂无资产账户")
                    }
                }
                Spacer(Modifier.height(12.dp))
                AssetLedgerGroup("应还负债", overview.liabilityTotal, AssetRed, Color(0xFFFEF7F6)) {
                    overview.negativeAssets.forEach { item ->
                        val style = nativeAssetTypes.firstOrNull { it.type == item.type } ?: nativeAssetTypes.last()
                        AssetEntityRow(
                            title = item.name,
                            subtitle = "${style.label} · 负余额",
                            amount = "¥ ${assetMoney(kotlin.math.abs(item.balance))}",
                            color = AssetRed,
                            short = style.short,
                            isLiability = true,
                            onEdit = { editingAsset = item; editorOpen = true },
                            onDelete = { deleteCandidate = item; deleteError = "" },
                        )
                    }
                    val activeLoans = loans.filter { it.status != "PAID_OFF" && it.remainingAmount > 0.0 }
                    if (activeLoans.isNotEmpty()) {
                        AssetLedgerRow("贷款待还", "${activeLoans.size} 笔进行中", "¥ ${assetMoney(overview.loanTotal)}", AssetRed, onClick = onOpenLoans)
                    }
                    if (overview.negativeAssets.isEmpty() && overview.loanTotal <= 0.0) AssetEmpty("暂无负债，表现优秀")
                }
            }
        }
    }

    if (editorOpen) {
        NativeAssetEditorSheet(
            asset = editingAsset,
            onDismiss = { editorOpen = false; editingAsset = null },
            onSave = onSaveAsset,
        )
    }
    deleteCandidate?.let { item ->
        AlertDialog(
            onDismissRequest = { if (!deleting) deleteCandidate = null },
            title = { Text("删除资产？") },
            text = {
                Column {
                    Text("确定删除“${item.name}”吗？")
                    if (deleteError.isNotBlank()) Text(deleteError, color = AssetRed, modifier = Modifier.padding(top = 8.dp))
                }
            },
            confirmButton = {
                TextButton(enabled = !deleting, onClick = {
                    scope.launch {
                        deleting = true
                        runCatching { onDeleteAsset(item) }
                            .onSuccess { deleteCandidate = null; deleteError = "" }
                            .onFailure { deleteError = it.message ?: "删除资产失败，请稍后重试" }
                        deleting = false
                    }
                }) { Text(if (deleting) "删除中…" else "删除", color = AssetRed) }
            },
            dismissButton = {
                TextButton(enabled = !deleting, onClick = { deleteCandidate = null }) { Text("取消") }
            },
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun NativeAssetEditorSheet(
    asset: NativeAsset?,
    onDismiss: () -> Unit,
    onSave: suspend (NativeAsset) -> Unit,
) {
    var name by remember(asset?.id) { mutableStateOf(asset?.name.orEmpty()) }
    var type by remember(asset?.id) { mutableStateOf(asset?.type?.takeIf { value -> nativeAssetTypes.any { it.type == value } } ?: "ALIPAY") }
    var amount by remember(asset?.id) { mutableStateOf(asset?.balance?.let { assetMoney(kotlin.math.abs(it)) }.orEmpty()) }
    var isLiability by remember(asset?.id) { mutableStateOf((asset?.balance ?: 0.0) < 0.0) }
    var saving by remember { mutableStateOf(false) }
    var error by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val parsedAmount = amount.toDoubleOrNull()
    val canSave = name.isNotBlank() && parsedAmount != null && parsedAmount.isFinite() && parsedAmount > 0.0 && !saving

    ModalBottomSheet(onDismissRequest = onDismiss, sheetState = sheetState) {
        Column(
            Modifier.fillMaxWidth().navigationBarsPadding().imePadding().verticalScroll(rememberScrollState()).padding(horizontal = 20.dp, vertical = 10.dp),
            verticalArrangement = Arrangement.spacedBy(13.dp),
        ) {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(if (asset == null) "新增资产" else "编辑资产", color = AssetInk, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    Text("手动维护账户余额，不会生成账单流水", color = AssetMuted, fontSize = 11.sp, modifier = Modifier.padding(top = 3.dp))
                }
                IconButton(onClick = onDismiss) { Icon(Icons.Default.Close, contentDescription = "关闭") }
            }
            OutlinedTextField(
                value = name,
                onValueChange = { name = it; error = "" },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("资产名称") },
                placeholder = { Text("如：招行工资卡、微信零钱") },
                singleLine = true,
            )
            Text("资产类型", color = AssetMuted, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                nativeAssetTypes.chunked(3).forEach { row ->
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        row.forEach { style ->
                            Button(
                                onClick = { type = style.type },
                                modifier = Modifier.weight(1f),
                                contentPadding = PaddingValues(horizontal = 4.dp, vertical = 8.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (type == style.type) style.color.copy(alpha = .14f) else Color(0xFFF4F6F9),
                                    contentColor = if (type == style.type) style.color else AssetMuted,
                                ),
                                shape = RoundedCornerShape(12.dp),
                            ) { Text(style.label, fontSize = 11.sp, maxLines = 1) }
                        }
                        repeat(3 - row.size) { Spacer(Modifier.weight(1f)) }
                    }
                }
            }
            Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(13.dp)).background(Color(0xFFF4F6F9)).padding(4.dp)) {
                listOf(false to "资产余额", true to "负债余额").forEach { (liability, label) ->
                    val selected = isLiability == liability
                    Text(
                        label,
                        color = if (selected) if (liability) AssetRed else AssetGreen else AssetMuted,
                        fontSize = 12.sp,
                        fontWeight = if (selected) FontWeight.Bold else FontWeight.Medium,
                        modifier = Modifier.weight(1f).clip(RoundedCornerShape(10.dp))
                            .background(if (selected) Color.White else Color.Transparent)
                            .clickable { isLiability = liability }
                            .padding(vertical = 10.dp),
                        textAlign = androidx.compose.ui.text.style.TextAlign.Center,
                    )
                }
            }
            OutlinedTextField(
                value = amount,
                onValueChange = { input ->
                    amount = input.filter { it.isDigit() || it == '.' }.let { value ->
                        val dot = value.indexOf('.')
                        if (dot < 0) value else value.take(dot + 1) + value.substring(dot + 1).replace(".", "")
                    }
                    error = ""
                },
                modifier = Modifier.fillMaxWidth(),
                label = { Text(if (isLiability) "负债余额（元）" else "当前余额（元）") },
                leadingIcon = { Text("¥", color = AssetMuted) },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                singleLine = true,
            )
            if (isLiability) Text("负债余额会以负数保存，并计入资产页的负债总额。", color = AssetRed, fontSize = 11.sp)
            if (error.isNotBlank()) Text(error, color = AssetRed, fontSize = 12.sp)
            Button(
                onClick = {
                    val value = parsedAmount ?: return@Button
                    scope.launch {
                        saving = true
                        error = ""
                        val now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                        val record = NativeAsset(
                            id = asset?.id ?: "native-asset-${UUID.randomUUID()}",
                            name = name.trim(),
                            type = type,
                            balance = if (isLiability) -value else value,
                            currency = asset?.currency?.ifBlank { "CNY" } ?: "CNY",
                            userId = asset?.userId.orEmpty(),
                            accountId = asset?.accountId.orEmpty(),
                            createdAt = asset?.createdAt?.ifBlank { now } ?: now,
                            updatedAt = now,
                        )
                        runCatching { onSave(record) }
                            .onSuccess { onDismiss() }
                            .onFailure { error = it.message ?: "资产保存失败，请检查数据源后重试" }
                        saving = false
                    }
                },
                enabled = canSave,
                modifier = Modifier.fillMaxWidth().height(48.dp),
                shape = RoundedCornerShape(14.dp),
                colors = ButtonDefaults.buttonColors(containerColor = AssetBlue),
            ) { Text(if (saving) "保存中…" else "保存资产", fontWeight = FontWeight.Bold) }
            Spacer(Modifier.height(8.dp))
        }
    }
}

@Composable
private fun AssetCard(
    modifier: Modifier = Modifier,
    padding: androidx.compose.ui.unit.Dp = 15.dp,
    color: Color = Color.White,
    content: @Composable androidx.compose.foundation.layout.ColumnScope.() -> Unit,
) {
    Column(
        modifier.fillMaxWidth().clip(RoundedCornerShape(20.dp)).background(color)
            .border(1.dp, AssetLine, RoundedCornerShape(20.dp)).padding(padding),
        content = content,
    )
}

@Composable
private fun AssetPill(text: String, color: Color) {
    Text(
        text,
        color = color,
        fontSize = 10.sp,
        fontWeight = FontWeight.SemiBold,
        modifier = Modifier.clip(CircleShape).background(color.copy(alpha = .1f)).padding(horizontal = 8.dp, vertical = 5.dp),
    )
}

@Composable
private fun AssetDonut(groups: List<NativeAssetGroup>, modifier: Modifier = Modifier) {
    Box(modifier, contentAlignment = Alignment.Center) {
        Canvas(Modifier.fillMaxSize().padding(4.dp)) {
            val total = groups.sumOf { it.amount }.takeIf { it > 0.0 } ?: 1.0
            var start = -90f
            groups.forEach { group ->
                val sweep = (group.amount / total * 360.0).toFloat()
                drawArc(group.color, start, sweep, false, style = Stroke(width = 14.dp.toPx(), cap = StrokeCap.Butt))
                start += sweep
            }
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("资产", color = AssetMuted, fontSize = 10.sp)
            Text("${groups.size}类", color = AssetInk, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        }
    }
}

@Composable
private fun AssetAmountTile(title: String, amount: Double, color: Color, modifier: Modifier = Modifier) {
    Column(modifier.clip(RoundedCornerShape(13.dp)).background(color.copy(alpha = .08f)).padding(10.dp)) {
        Text(title, color = AssetMuted, fontSize = 10.5.sp)
        Text("¥ ${assetMoney(amount)}", color = color, fontSize = 14.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 4.dp), maxLines = 1)
    }
}

@Composable
private fun AssetMetric(title: String, value: String, note: String, color: Color, modifier: Modifier = Modifier) {
    Column(modifier.clip(RoundedCornerShape(15.dp)).background(Color.White).border(1.dp, AssetLine, RoundedCornerShape(15.dp)).padding(10.dp)) {
        Text(title, color = AssetMuted, fontSize = 10.5.sp, maxLines = 1)
        Text(value, color = color, fontSize = 12.5.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 4.dp), maxLines = 1, overflow = TextOverflow.Ellipsis)
        Text(note, color = AssetMuted, fontSize = 9.5.sp, modifier = Modifier.padding(top = 3.dp), maxLines = 1, overflow = TextOverflow.Ellipsis)
    }
}

@Composable
private fun AssetLedgerGroup(title: String, amount: Double, color: Color, surface: Color, content: @Composable () -> Unit) {
    Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(surface).border(1.dp, AssetLine.copy(alpha = .65f), RoundedCornerShape(16.dp)).padding(11.dp)) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Text(title, color = color, fontSize = 11.sp, fontWeight = FontWeight.Bold, modifier = Modifier.clip(CircleShape).background(color.copy(alpha = .1f)).padding(horizontal = 8.dp, vertical = 4.dp))
            Spacer(Modifier.weight(1f))
            Text("¥ ${assetMoney(amount)}", color = color, fontSize = 14.sp, fontWeight = FontWeight.Bold)
        }
        Column(Modifier.padding(top = 6.dp)) { content() }
    }
}

@Composable
private fun AssetEntityRow(
    title: String,
    subtitle: String,
    amount: String,
    color: Color,
    short: String,
    isLiability: Boolean = false,
    onEdit: () -> Unit,
    onDelete: () -> Unit,
) {
    Row(Modifier.fillMaxWidth().padding(vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(30.dp).clip(CircleShape).background(color.copy(alpha = .12f)), contentAlignment = Alignment.Center) {
            Text(short, color = color, fontSize = 11.sp, fontWeight = FontWeight.Bold)
        }
        Column(Modifier.weight(1f).padding(start = 9.dp)) {
            Text(title, color = AssetInk, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text(subtitle, color = AssetMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 2.dp), maxLines = 1)
        }
        Text(amount, color = if (isLiability) AssetRed else AssetInk, fontSize = 11.sp, fontWeight = FontWeight.Bold, maxLines = 1)
        IconButton(onClick = onEdit, modifier = Modifier.size(34.dp)) { Icon(Icons.Default.Edit, contentDescription = "编辑$title", tint = AssetBlue, modifier = Modifier.size(16.dp)) }
        IconButton(onClick = onDelete, modifier = Modifier.size(34.dp)) { Icon(Icons.Default.Delete, contentDescription = "删除$title", tint = AssetRed, modifier = Modifier.size(16.dp)) }
    }
}

@Composable
private fun AssetLedgerRow(
    title: String,
    subtitle: String,
    amount: String,
    color: Color,
    icon: androidx.compose.ui.graphics.vector.ImageVector? = null,
    onClick: (() -> Unit)? = null,
) {
    Row(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)).then(if (onClick != null) Modifier.clickable(onClick = onClick) else Modifier).padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(Modifier.size(30.dp).clip(CircleShape).background(color.copy(alpha = .12f)), contentAlignment = Alignment.Center) {
            if (icon != null) Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(15.dp)) else Text("·", color = color, fontWeight = FontWeight.Bold)
        }
        Column(Modifier.weight(1f).padding(start = 9.dp)) {
            Text(title, color = AssetInk, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            Text(subtitle, color = AssetMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 2.dp))
        }
        Text(amount, color = color, fontSize = 11.sp, fontWeight = FontWeight.Bold)
        if (onClick != null) Icon(Icons.Default.ArrowForward, contentDescription = "查看$title", tint = AssetMuted, modifier = Modifier.padding(start = 5.dp).size(14.dp))
    }
}

@Composable
private fun AssetEmpty(text: String) {
    Text(text, color = AssetMuted, fontSize = 11.sp, modifier = Modifier.padding(vertical = 12.dp))
}

private fun assetTypeLabel(type: String): String = nativeAssetTypes.firstOrNull { it.type == type }?.label ?: "其他资产"

private fun assetCurrency(currency: String): String = when (currency.uppercase()) {
    "CNY" -> "¥"
    "USD" -> "$"
    "EUR" -> "€"
    "JPY" -> "¥"
    else -> currency.uppercase()
}

private fun assetMoney(value: Double): String = BigDecimal.valueOf(value.takeIf(Double::isFinite) ?: 0.0)
    .setScale(2, RoundingMode.HALF_UP)
    .toPlainString()

private fun assetPercent(value: Double): String = BigDecimal.valueOf(value.takeIf(Double::isFinite) ?: 0.0)
    .setScale(1, RoundingMode.HALF_UP)
    .stripTrailingZeros()
    .toPlainString()

private val AssetInk = Color(0xFF1F2937)
private val AssetMuted = Color(0xFF7B8798)
private val AssetBlue = Color(0xFF0869C6)
private val AssetGreen = Color(0xFF0A966B)
private val AssetRed = Color(0xFFD94D5D)
private val AssetAmber = Color(0xFFF0A329)
private val AssetLine = Color(0xFFE8EDF3)
