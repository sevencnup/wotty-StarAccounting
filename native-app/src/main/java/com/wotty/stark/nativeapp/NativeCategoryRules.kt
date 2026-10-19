package com.wotty.stark.nativeapp

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
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
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Switch
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
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.util.Locale
import java.util.UUID

private val RuleInk = Color(0xFF1F2937)
private val RuleMuted = Color(0xFF7B8798)
private val RuleBlue = Color(0xFF0869C6)
private val RuleGreen = Color(0xFF0A966B)
private val RuleRed = Color(0xFFD94D5D)
private val RuleLine = Color(0xFFE8EDF3)

internal data class NativeCategoryRule(
    val id: String,
    val userId: String,
    val accountId: String,
    val name: String?,
    val merchant: String,
    val merchantKey: String,
    val category: String,
    val description: String?,
    val isActive: Boolean,
    val createdAt: String,
    val updatedAt: String,
)

internal fun JSONObject.toNativeCategoryRule(accountIdFallback: String = ""): NativeCategoryRule = NativeCategoryRule(
    id = optString("id"),
    userId = optString("userId"),
    accountId = optString("accountId").ifBlank { accountIdFallback },
    name = optString("name").takeIf(String::isNotBlank),
    merchant = optString("merchant"),
    merchantKey = optString("merchantKey"),
    category = optString("category", "其他").ifBlank { "其他" },
    description = optString("description").takeIf(String::isNotBlank),
    isActive = optBoolean("isActive", true),
    createdAt = optString("createdAt"),
    updatedAt = optString("updatedAt"),
)

internal fun NativeCategoryRule.toPayload(): JSONObject = JSONObject()
    .put("id", id)
    .put("userId", userId)
    .put("accountId", accountId)
    .put("name", name ?: JSONObject.NULL)
    .put("merchant", merchant)
    .put("merchantKey", merchantKey)
    .put("category", category)
    .put("description", description ?: JSONObject.NULL)
    .put("isActive", isActive)
    .put("createdAt", createdAt)
    .put("updatedAt", updatedAt)

internal fun normalizeNativeRuleKeyword(value: String): String =
    value.trim().filterNot(Char::isWhitespace).lowercase(Locale.ROOT)

internal fun nativeCategoryRuleKeyword(rule: NativeCategoryRule): String =
    rule.merchantKey.trim().ifBlank { rule.merchant.trim() }

internal fun nativeCategoryRuleMatches(entry: LedgerEntry, rule: NativeCategoryRule): Boolean {
    if (!rule.isActive || entry.type == EntryType.INCOME) return false
    val keyword = normalizeNativeRuleKeyword(nativeCategoryRuleKeyword(rule))
    if (keyword.isBlank()) return false
    val searchText = listOf(
        entry.merchant,
        entry.description,
        entry.platform,
        entry.paymentMethod,
        entry.category,
        entry.orderId,
    ).filterNotNull()
        .map(::normalizeNativeRuleKeyword)
        .joinToString(" ")
    return searchText.contains(keyword)
}

internal fun applyNativeCategoryRule(
    entries: List<LedgerEntry>,
    rule: NativeCategoryRule,
    updatedAt: String = rule.updatedAt,
): List<LedgerEntry> = entries.map { entry ->
    if (nativeCategoryRuleMatches(entry, rule) && entry.remarkCategory != rule.category.trim()) {
        entry.copy(remarkCategory = rule.category.trim(), updatedAt = updatedAt)
    } else {
        entry
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun NativeCategoryRuleManagerSheet(
    rules: List<NativeCategoryRule>,
    transactions: List<LedgerEntry>,
    onDismiss: () -> Unit,
    onSave: suspend (NativeCategoryRule) -> Int,
    onToggle: suspend (NativeCategoryRule) -> Unit,
    onDelete: suspend (NativeCategoryRule) -> Unit,
) {
    var keyword by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("房租水电") }
    var editing by remember { mutableStateOf<NativeCategoryRule?>(null) }
    var saving by remember { mutableStateOf(false) }
    var busyRuleId by remember { mutableStateOf<String?>(null) }
    var deleteCandidate by remember { mutableStateOf<NativeCategoryRule?>(null) }
    var message by remember { mutableStateOf("输入关键词可预览命中的流水") }
    var error by remember { mutableStateOf("") }
    val coroutineScope = rememberCoroutineScope()
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val normalizedKeyword = normalizeNativeRuleKeyword(keyword)
    val previewMatches = remember(transactions, normalizedKeyword) {
        if (normalizedKeyword.isBlank()) emptyList()
        else transactions.filter { entry ->
            entry.type != EntryType.INCOME && nativeCategoryRuleMatches(
                entry,
                NativeCategoryRule("preview", "", "", keyword, keyword, keyword, category, null, true, "", ""),
            )
        }
    }
    val sortedRules = remember(rules) { rules.sortedByDescending { it.updatedAt } }
    val suggestions = listOf("房租水电", "餐饮", "购物", "交通", "住房", "娱乐", "医疗", "日用", "通讯", "其他")

    ModalBottomSheet(onDismissRequest = onDismiss, sheetState = sheetState) {
        Column(
            Modifier.fillMaxWidth()
                .heightIn(max = 790.dp)
                .navigationBarsPadding()
                .imePadding()
                .padding(horizontal = 18.dp),
        ) {
            Row(Modifier.fillMaxWidth().padding(bottom = 10.dp), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("账单归类规则", color = RuleInk, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    Text("给转账或账单关键词指定消费分类", color = RuleMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 3.dp))
                }
                TextButton(onClick = onDismiss) { Text("完成") }
            }

            OutlinedTextField(
                value = keyword,
                onValueChange = { keyword = it; error = ""; message = "输入关键词可预览命中的流水" },
                modifier = Modifier.fillMaxWidth(),
                label = { Text("账单关键词") },
                placeholder = { Text("例如：房东、物业、某某保险") },
                keyboardOptions = KeyboardOptions(capitalization = KeyboardCapitalization.Sentences),
                singleLine = true,
            )
            Text("匹配商户、说明、平台、支付方式、分类和订单号；收入不参与归类。", color = RuleMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 3.dp))
            Row(
                Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()).padding(top = 9.dp),
                horizontalArrangement = Arrangement.spacedBy(7.dp),
            ) {
                suggestions.forEach { suggestion ->
                    val selected = category == suggestion
                    Text(
                        suggestion,
                        color = if (selected) RuleBlue else RuleMuted,
                        fontSize = 10.sp,
                        modifier = Modifier.clip(RoundedCornerShape(20.dp))
                            .background(if (selected) Color(0xFFE6F1FF) else Color(0xFFF3F6FA))
                            .clickable { category = suggestion; error = "" }
                            .padding(horizontal = 10.dp, vertical = 7.dp),
                    )
                }
            }
            OutlinedTextField(
                value = category,
                onValueChange = { category = it; error = "" },
                modifier = Modifier.fillMaxWidth().padding(top = 7.dp),
                label = { Text("归入消费分类") },
                singleLine = true,
            )
            Box(
                Modifier.fillMaxWidth().padding(top = 9.dp).clip(RoundedCornerShape(13.dp))
                    .background(Color(0xFFF3F7FC)).padding(horizontal = 12.dp, vertical = 10.dp),
            ) {
                Column {
                    Text(
                        if (normalizedKeyword.isBlank()) "输入关键词预览匹配结果"
                        else "找到 ${previewMatches.size} 笔非收入流水",
                        color = RuleBlue,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                    )
                    previewMatches.take(3).forEach { entry ->
                        Text(
                            "${entry.merchant.ifBlank { entry.title }} · ${entry.amount.moneyText()} · ${entry.transactionDate}",
                            color = RuleMuted,
                            fontSize = 10.sp,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                            modifier = Modifier.padding(top = 4.dp),
                        )
                    }
                    if (previewMatches.size > 3) Text("还有 ${previewMatches.size - 3} 笔", color = RuleMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 4.dp))
                }
            }
            if (error.isNotBlank()) Text(error, color = RuleRed, fontSize = 11.sp, modifier = Modifier.padding(top = 7.dp))
            else if (message.isNotBlank()) Text(message, color = if (message.startsWith("已")) RuleGreen else RuleMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 7.dp))
            Row(Modifier.fillMaxWidth().padding(top = 5.dp, bottom = 11.dp), horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                Button(
                    onClick = {
                        val normalized = normalizedKeyword
                        when {
                            normalized.isBlank() -> error = "请输入账单关键词"
                            category.isBlank() -> error = "请输入消费分类"
                            saving -> Unit
                            else -> {
                                val existingSameKeyword = rules.firstOrNull {
                                    normalizeNativeRuleKeyword(nativeCategoryRuleKeyword(it)) == normalized
                                }
                                val current = editing ?: existingSameKeyword
                                val timestamp = java.time.LocalDateTime.now().toString().replace('T', ' ').take(19)
                                val rule = NativeCategoryRule(
                                    id = current?.id ?: "native-category-rule-${UUID.randomUUID()}",
                                    userId = current?.userId.orEmpty(),
                                    accountId = current?.accountId.orEmpty(),
                                    name = keyword.trim(),
                                    merchant = keyword.trim(),
                                    merchantKey = keyword.trim(),
                                    category = category.trim(),
                                    description = "关键词：${keyword.trim()}",
                                    isActive = true,
                                    createdAt = current?.createdAt.orEmpty().ifBlank { timestamp },
                                    updatedAt = timestamp,
                                )
                                saving = true
                                error = ""
                                coroutineScope.launch {
                                    runCatching { onSave(rule) }
                                        .onSuccess { changedCount ->
                                            message = "规则已保存，已应用到 $changedCount 笔流水"
                                            editing = null
                                            keyword = ""
                                        }
                                        .onFailure { error = it.message ?: "规则保存失败，请重试" }
                                    saving = false
                                }
                            }
                        }
                    },
                    modifier = Modifier.weight(1f),
                    enabled = !saving,
                    colors = ButtonDefaults.buttonColors(containerColor = RuleBlue),
                    contentPadding = PaddingValues(vertical = 10.dp),
                ) {
                    Icon(Icons.Default.ReceiptLong, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(Modifier.width(6.dp))
                    Text(if (saving) "保存中…" else if (editing == null) "保存并应用" else "保存修改", fontSize = 12.sp)
                }
                if (editing != null) {
                    TextButton(onClick = { editing = null; keyword = ""; category = "房租水电"; error = "" }) {
                        Text("取消编辑")
                    }
                }
            }
            Row(Modifier.fillMaxWidth().padding(bottom = 7.dp), verticalAlignment = Alignment.CenterVertically) {
                Text("已保存规则", color = RuleInk, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.width(6.dp))
                Text("${rules.size} 项", color = RuleMuted, fontSize = 10.sp)
            }
            if (sortedRules.isEmpty()) {
                Text("还没有归类规则。保存关键词后，历史流水会立即归类。", color = RuleMuted, fontSize = 11.sp, modifier = Modifier.padding(bottom = 18.dp))
            } else {
                LazyColumn(
                    Modifier.fillMaxWidth().weight(1f, fill = false).heightIn(max = 300.dp),
                    contentPadding = PaddingValues(bottom = 20.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                ) {
                    items(sortedRules, key = NativeCategoryRule::id) { rule ->
                        val matchedCount = remember(transactions, rule) { transactions.count { nativeCategoryRuleMatches(it, rule.copy(isActive = true)) } }
                        CategoryRuleRow(
                            rule = rule,
                            matchCount = matchedCount,
                            busy = busyRuleId == rule.id,
                            onEdit = {
                                editing = rule
                                keyword = nativeCategoryRuleKeyword(rule)
                                category = rule.category
                                error = ""
                                message = "修改后会重新应用到匹配流水"
                            },
                            onToggle = {
                                if (busyRuleId == null) {
                                    busyRuleId = rule.id
                                    coroutineScope.launch {
                                        runCatching { onToggle(rule.copy(isActive = !rule.isActive)) }
                                            .onSuccess { message = if (rule.isActive) "规则已停用，既有归类保留" else "规则已启用" }
                                            .onFailure { error = it.message ?: "规则状态保存失败" }
                                        busyRuleId = null
                                    }
                                }
                            },
                            onDelete = { deleteCandidate = rule },
                        )
                    }
                }
            }
        }
    }

    deleteCandidate?.let { rule ->
        AlertDialog(
            onDismissRequest = { deleteCandidate = null },
            title = { Text("删除归类规则？") },
            text = { Text("确定删除“${nativeCategoryRuleKeyword(rule)}”规则吗？已归类的流水会保留现有分类。") },
            confirmButton = {
                TextButton(
                    onClick = {
                        deleteCandidate = null
                        if (busyRuleId == null) {
                            busyRuleId = rule.id
                            coroutineScope.launch {
                                runCatching { onDelete(rule) }
                                    .onSuccess { message = "规则已删除，已归类流水保持不变" }
                                    .onFailure { error = it.message ?: "规则删除失败" }
                                busyRuleId = null
                            }
                        }
                    },
                ) { Text("删除", color = RuleRed) }
            },
            dismissButton = { TextButton(onClick = { deleteCandidate = null }) { Text("取消") } },
        )
    }
}

@Composable
private fun CategoryRuleRow(
    rule: NativeCategoryRule,
    matchCount: Int,
    busy: Boolean,
    onEdit: () -> Unit,
    onToggle: () -> Unit,
    onDelete: () -> Unit,
) {
    Row(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(Color.White)
            .padding(start = 12.dp, end = 8.dp, top = 10.dp, bottom = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(nativeCategoryRuleKeyword(rule), color = RuleInk, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(
                    if (rule.isActive) "启用" else "停用",
                    color = if (rule.isActive) RuleGreen else RuleMuted,
                    fontSize = 9.sp,
                    modifier = Modifier.padding(start = 6.dp).clip(CircleShape)
                        .background(if (rule.isActive) Color(0xFFE5F6EF) else Color(0xFFF0F2F5))
                        .padding(horizontal = 6.dp, vertical = 3.dp),
                )
            }
            Text("归入 ${rule.category} · 当前命中 $matchCount 笔", color = RuleMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 3.dp))
        }
        IconButton(onClick = onEdit, enabled = !busy, modifier = Modifier.size(34.dp)) {
            Icon(Icons.Default.Edit, contentDescription = "编辑规则", tint = RuleBlue, modifier = Modifier.size(17.dp))
        }
        Switch(checked = rule.isActive, onCheckedChange = { onToggle() }, enabled = !busy, modifier = Modifier.padding(horizontal = 1.dp))
        IconButton(onClick = onDelete, enabled = !busy, modifier = Modifier.size(34.dp)) {
            Icon(Icons.Default.Delete, contentDescription = "删除规则", tint = RuleRed, modifier = Modifier.size(17.dp))
        }
    }
}

private fun Double.moneyText(): String = "¥ " + String.format(Locale.CHINA, "%.2f", this)
