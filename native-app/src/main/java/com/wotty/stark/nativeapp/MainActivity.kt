package com.wotty.stark.nativeapp

import android.os.Bundle
import android.content.Context
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateDpAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Notes
import androidx.compose.material.icons.filled.AccountBalanceWallet
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.ArrowDownward
import androidx.compose.material.icons.filled.ArrowUpward
import androidx.compose.material.icons.filled.BarChart
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.MoreHoriz
import androidx.compose.material.icons.filled.Payments
import androidx.compose.material.icons.filled.PieChart
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Savings
import androidx.compose.material.icons.filled.TrendingDown
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.drawBehind
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.json.JSONArray
import org.json.JSONObject
import java.text.DecimalFormat
import java.time.LocalDate
import java.time.format.DateTimeFormatter

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            StarkNativeTheme {
                StarkNativeApp()
            }
        }
    }
}

private val Ink = Color(0xFF16243B)
private val Muted = Color(0xFF708098)
private val Canvas = Color(0xFFF6F8FC)
private val Blue = Color(0xFF0869C6)
private val DeepBlue = Color(0xFF034F9F)
private val SoftBlue = Color(0xFFE6F1FF)
private val Green = Color(0xFF0A966B)
private val Red = Color(0xFFD94D5D)
private val Amber = Color(0xFFF0A329)
private val Line = Color(0xFFE5EBF3)

private enum class RootTab(val label: String, val icon: ImageVector) {
    HOME("首页", Icons.Default.Home),
    CONSUMPTION("消费", Icons.Default.PieChart),
    SAVINGS("储蓄", Icons.Default.Savings),
    ASSETS("资产", Icons.Default.AccountBalanceWallet),
    JOURNAL("账单", Icons.AutoMirrored.Filled.Notes),
    SETTINGS("设置", Icons.Default.Settings),
}

private enum class EntryType(val label: String, val color: Color) {
    EXPENSE("支出", Red),
    INCOME("收入", Green),
}

private data class LedgerEntry(
    val id: Long,
    val title: String,
    val category: String,
    val amount: Double,
    val type: EntryType,
    val dayLabel: String,
)

private data class NativeLedgerSnapshot(
    val actualBalance: Double,
    val entries: List<LedgerEntry>,
)

private class NativeLedgerStore(context: Context) {
    private val preferences = context.getSharedPreferences("native-ledger", Context.MODE_PRIVATE)

    fun load(): NativeLedgerSnapshot {
        val storedEntries = preferences.getString("entries", null) ?: return NativeLedgerSnapshot(916.35, sampleEntries())
        return runCatching {
            val rows = JSONArray(storedEntries)
            val entries = List(rows.length()) { index ->
                val item = rows.getJSONObject(index)
                LedgerEntry(
                    id = item.getLong("id"),
                    title = item.getString("title"),
                    category = item.getString("category"),
                    amount = item.getDouble("amount"),
                    type = EntryType.valueOf(item.getString("type")),
                    dayLabel = item.getString("dayLabel"),
                )
            }
            NativeLedgerSnapshot(preferences.getString("actualBalance", "916.35")?.toDoubleOrNull() ?: 916.35, entries)
        }.getOrElse { NativeLedgerSnapshot(916.35, sampleEntries()) }
    }

    fun save(actualBalance: Double, entries: List<LedgerEntry>) {
        val rows = JSONArray()
        entries.forEach { entry ->
            rows.put(
                JSONObject()
                    .put("id", entry.id)
                    .put("title", entry.title)
                    .put("category", entry.category)
                    .put("amount", entry.amount)
                    .put("type", entry.type.name)
                    .put("dayLabel", entry.dayLabel),
            )
        }
        preferences.edit()
            .putString("actualBalance", actualBalance.toString())
            .putString("entries", rows.toString())
            .apply()
    }
}

private fun sampleEntries() = listOf(
    LedgerEntry(1, "工资入账", "工资收入 · 银行卡", 6917.18, EntryType.INCOME, "今天 09:01"),
    LedgerEntry(2, "午餐", "餐饮美食 · 微信", 28.00, EntryType.EXPENSE, "今天 12:26"),
    LedgerEntry(3, "地铁出行", "交通出行 · 支付宝", 4.00, EntryType.EXPENSE, "昨天 18:32"),
    LedgerEntry(4, "超市采购", "生活消费 · 微信", 86.50, EntryType.EXPENSE, "昨天 17:06"),
)

private val moneyFormat = DecimalFormat("#,##0.00")

@Composable
private fun StarkNativeTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = MaterialTheme.colorScheme.copy(
            primary = Blue,
            secondary = Green,
            background = Canvas,
            surface = Color.White,
            onBackground = Ink,
            onSurface = Ink,
        ),
        content = content,
    )
}

@Composable
private fun StarkNativeApp() {
    var selectedTab by remember { mutableStateOf(RootTab.HOME) }
    var entrySheetOpen by remember { mutableStateOf(false) }
    val context = androidx.compose.ui.platform.LocalContext.current
    val ledgerStore = remember { NativeLedgerStore(context.applicationContext) }
    val snapshot = remember { ledgerStore.load() }
    var actualBalance by remember { mutableDoubleStateOf(snapshot.actualBalance) }
    val entries = remember { mutableStateListOf<LedgerEntry>().also { it.addAll(snapshot.entries) } }

    Scaffold(
        containerColor = Canvas,
        bottomBar = {
            NativeBottomBar(selectedTab = selectedTab, onTabSelected = { selectedTab = it })
        },
        floatingActionButton = {
            if (selectedTab != RootTab.SETTINGS) {
                EntryFab(onClick = { entrySheetOpen = true })
            }
        },
    ) { insets ->
        AnimatedContent(
            targetState = selectedTab,
            label = "Native tab switch",
        ) { tab ->
            when (tab) {
                RootTab.HOME -> HomeScreen(Modifier.padding(insets), entries, actualBalance)
                RootTab.JOURNAL -> JournalScreen(Modifier.padding(insets), entries)
                else -> PlaceholderScreen(Modifier.padding(insets), tab)
            }
        }
    }

    if (entrySheetOpen) {
        QuickEntrySheet(
            onClose = { entrySheetOpen = false },
            onSave = { title, amount, type ->
                entries.add(
                    0,
                    LedgerEntry(
                        id = System.nanoTime(),
                        title = title.ifBlank { if (type == EntryType.INCOME) "新增收入" else "新增支出" },
                        category = if (type == EntryType.INCOME) "手动记录 · 现金" else "日常消费 · 现金",
                        amount = amount,
                        type = type,
                        dayLabel = "刚刚",
                    ),
                )
                actualBalance += if (type == EntryType.INCOME) amount else -amount
                ledgerStore.save(actualBalance, entries)
                entrySheetOpen = false
            },
        )
    }
}

@Composable
private fun NativeBottomBar(selectedTab: RootTab, onTabSelected: (RootTab) -> Unit) {
    Surface(
        color = Color.White,
        shadowElevation = 14.dp,
        modifier = Modifier.fillMaxWidth().navigationBarsPadding(),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().height(68.dp).padding(horizontal = 7.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceAround,
        ) {
            RootTab.entries.forEach { tab ->
                val active = selectedTab == tab
                Column(
                    modifier = Modifier
                        .weight(1f)
                        .clip(RoundedCornerShape(14.dp))
                        .clickable { onTabSelected(tab) }
                        .padding(vertical = 7.dp),
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(2.dp),
                ) {
                    Icon(
                        tab.icon,
                        contentDescription = tab.label,
                        tint = if (active) Blue else Color(0xFF93A0B4),
                        modifier = Modifier.size(21.dp),
                    )
                    Text(
                        tab.label,
                        color = if (active) Blue else Color(0xFF8390A4),
                        fontSize = 10.sp,
                        fontWeight = if (active) FontWeight.Bold else FontWeight.Medium,
                    )
                }
            }
        }
    }
}

@Composable
private fun EntryFab(onClick: () -> Unit) {
    Box(
        modifier = Modifier
            .size(56.dp)
            .clip(CircleShape)
            .background(Brush.linearGradient(listOf(Blue, DeepBlue)))
            .clickable(onClick = onClick),
        contentAlignment = Alignment.Center,
    ) {
        Icon(Icons.Default.Add, contentDescription = "新增记账", tint = Color.White, modifier = Modifier.size(28.dp))
    }
}

@Composable
private fun HomeScreen(modifier: Modifier, entries: List<LedgerEntry>, actualBalance: Double) {
    val income = entries.filter { it.type == EntryType.INCOME }.sumOf { it.amount }
    val expense = entries.filter { it.type == EntryType.EXPENSE }.sumOf { it.amount }
    val dateLabel = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy年MM月"))

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 18.dp, end = 18.dp, top = 12.dp, bottom = 108.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth().statusBarsPadding().padding(top = 3.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Column {
                    Text("星会计", color = Ink, fontSize = 23.sp, fontWeight = FontWeight.Black)
                    Text("原生版 · 本地账本", color = Muted, fontSize = 12.sp)
                }
                IconButton(onClick = {}) {
                    Icon(Icons.Default.Search, contentDescription = "搜索", tint = Ink)
                }
            }
        }
        item {
            FinanceHero(dateLabel = dateLabel, balance = actualBalance, income = income, expense = expense)
        }
        item {
            BalanceInsightCard(income = income, expense = expense)
        }
        item {
            SectionHeader("本月资金分配", "明细")
            AllocationCard(income = income, expense = expense)
        }
        item {
            SectionHeader("最近流水", "全部账单")
        }
        items(entries.take(4), key = { it.id }) { entry ->
            LedgerRow(entry)
        }
    }
}

@Composable
private fun FinanceHero(dateLabel: String, balance: Double, income: Double, expense: Double) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(28.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
    ) {
        Column(
            modifier = Modifier
                .background(
                    Brush.linearGradient(
                        colors = listOf(DeepBlue, Blue, Color(0xFF1591D5)),
                        start = Offset.Zero,
                        end = Offset(1000f, 900f),
                    ),
                )
                .padding(21.dp),
        ) {
            Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Column {
                    Text(dateLabel, color = Color.White.copy(alpha = .76f), fontSize = 12.sp)
                    Spacer(Modifier.height(5.dp))
                    Text("当前实际结余", color = Color.White.copy(alpha = .9f), fontSize = 14.sp, fontWeight = FontWeight.Medium)
                }
                Row(
                    modifier = Modifier.clip(RoundedCornerShape(20.dp)).background(Color.White.copy(alpha = .16f)).padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                ) {
                    Icon(Icons.Default.CalendarMonth, contentDescription = null, tint = Color.White, modifier = Modifier.size(14.dp))
                    Spacer(Modifier.width(4.dp))
                    Text("自然月", color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
            Spacer(Modifier.height(12.dp))
            Text("¥ ${moneyFormat.format(balance)}", color = Color.White, fontSize = 35.sp, fontWeight = FontWeight.Black)
            Spacer(Modifier.height(19.dp))
            Row(Modifier.fillMaxWidth()) {
                HeroMetric("收入", income, Green, Modifier.weight(1f))
                HeroMetric("支出", expense, Color(0xFFFFD0D5), Modifier.weight(1f))
                HeroMetric("本期净变动", income - expense, Color.White, Modifier.weight(1.18f))
            }
        }
    }
}

@Composable
private fun HeroMetric(label: String, value: Double, accent: Color, modifier: Modifier) {
    Column(modifier) {
        Text(label, color = Color.White.copy(alpha = .68f), fontSize = 11.sp)
        Spacer(Modifier.height(4.dp))
        Text("¥ ${moneyFormat.format(value)}", color = accent, fontSize = 14.sp, fontWeight = FontWeight.Bold, maxLines = 1)
    }
}

@Composable
private fun BalanceInsightCard(income: Double, expense: Double) {
    val healthy = income >= expense
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(if (healthy) Color(0xFFE8F7F1) else Color(0xFFFFEEF0))
            .padding(14.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(Modifier.size(37.dp).clip(CircleShape).background(if (healthy) Color(0xFFCBEEDC) else Color(0xFFFFD6DB)), contentAlignment = Alignment.Center) {
            Icon(if (healthy) Icons.Default.TrendingUp else Icons.Default.TrendingDown, contentDescription = null, tint = if (healthy) Green else Red, modifier = Modifier.size(20.dp))
        }
        Spacer(Modifier.width(11.dp))
        Column(Modifier.weight(1f)) {
            Text(if (healthy) "现金流状态良好" else "本期支出需要关注", color = Ink, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            Text(if (healthy) "已记录收入大于支出，继续保持。" else "建议优先检查大额和高频消费。", color = Muted, fontSize = 11.sp)
        }
        Icon(Icons.Default.MoreHoriz, contentDescription = null, tint = Muted)
    }
}

@Composable
private fun SectionHeader(title: String, action: String) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
        Text(title, color = Ink, fontSize = 17.sp, fontWeight = FontWeight.ExtraBold)
        Text(action, color = Blue, fontSize = 12.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun AllocationCard(income: Double, expense: Double) {
    val safeIncome = income.coerceAtLeast(1.0)
    val expenseRatio = (expense / safeIncome).toFloat().coerceIn(0f, 1f)
    val savingsRatio = (1f - expenseRatio).coerceAtLeast(0f)
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                AllocationRing(expenseRatio, savingsRatio)
                Spacer(Modifier.width(18.dp))
                Column(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(9.dp)) {
                    AllocationLegend("日常支出", expense, Red)
                    AllocationLegend("可支配结余", (income - expense).coerceAtLeast(0.0), Green)
                    AllocationLegend("计划储蓄", 0.0, Blue)
                }
            }
            HorizontalDivider(color = Line)
            Text("每一笔记录都会即时刷新首页结余，不受统计周期切换影响。", color = Muted, fontSize = 11.sp)
        }
    }
}

@Composable
private fun AllocationRing(expenseRatio: Float, savingsRatio: Float) {
    Box(
        modifier = Modifier
            .size(100.dp)
            .drawBehind {
                val stroke = 12.dp.toPx()
                val inset = stroke / 2
                drawArc(Color(0xFFEAF0F6), 0f, 360f, false, Offset(inset, inset), Size(size.width - stroke, size.height - stroke), style = Stroke(stroke, cap = StrokeCap.Round))
                drawArc(Red, -90f, 360f * expenseRatio, false, Offset(inset, inset), Size(size.width - stroke, size.height - stroke), style = Stroke(stroke, cap = StrokeCap.Round))
                drawArc(Green, -90f + 360f * expenseRatio + 7f, 360f * savingsRatio.coerceAtMost(.95f), false, Offset(inset, inset), Size(size.width - stroke, size.height - stroke), style = Stroke(stroke, cap = StrokeCap.Round))
            },
        contentAlignment = Alignment.Center,
    ) {
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text("本月", color = Muted, fontSize = 10.sp)
            Text("分配", color = Ink, fontSize = 14.sp, fontWeight = FontWeight.Black)
        }
    }
}

@Composable
private fun AllocationLegend(label: String, amount: Double, color: Color) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(8.dp).clip(CircleShape).background(color))
        Spacer(Modifier.width(7.dp))
        Text(label, modifier = Modifier.weight(1f), color = Muted, fontSize = 12.sp)
        Text("¥${moneyFormat.format(amount)}", color = Ink, fontSize = 12.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun LedgerRow(entry: LedgerEntry) {
    val (icon, iconTone) = when {
        entry.type == EntryType.INCOME -> Icons.Default.Payments to Green
        entry.category.contains("交通") -> Icons.Default.TrendingDown to Amber
        entry.category.contains("生活") -> Icons.Default.AccountBalanceWallet to Blue
        else -> Icons.Default.Payments to Red
    }
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(18.dp))
            .background(Color.White)
            .padding(13.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(
            Modifier.size(42.dp).clip(RoundedCornerShape(14.dp)).background(iconTone.copy(alpha = .14f)),
            contentAlignment = Alignment.Center,
        ) {
            Icon(icon, contentDescription = null, tint = iconTone, modifier = Modifier.size(20.dp))
        }
        Spacer(Modifier.width(11.dp))
        Column(Modifier.weight(1f)) {
            Text(entry.title, color = Ink, fontSize = 14.sp, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
            Text("${entry.category} · ${entry.dayLabel}", color = Muted, fontSize = 11.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
        Text(
            text = if (entry.type == EntryType.INCOME) "+¥${moneyFormat.format(entry.amount)}" else "-¥${moneyFormat.format(entry.amount)}",
            color = if (entry.type == EntryType.INCOME) Green else Ink,
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
        )
    }
}

@Composable
private fun JournalScreen(modifier: Modifier, entries: List<LedgerEntry>) {
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 18.dp, end = 18.dp, top = 12.dp, bottom = 104.dp),
        verticalArrangement = Arrangement.spacedBy(11.dp),
    ) {
        item {
            Row(Modifier.fillMaxWidth().statusBarsPadding(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                Column {
                    Text("全部账单", color = Ink, fontSize = 23.sp, fontWeight = FontWeight.Black)
                    Text("本地原生账本 · ${entries.size} 笔", color = Muted, fontSize = 12.sp)
                }
                IconButton(onClick = {}) { Icon(Icons.Default.Search, contentDescription = "搜索", tint = Ink) }
            }
        }
        item {
            Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip("全部", true)
                FilterChip("支出", false)
                FilterChip("收入", false)
                FilterChip("本月", false)
            }
        }
        items(entries, key = { it.id }) { LedgerRow(it) }
    }
}

@Composable
private fun FilterChip(label: String, selected: Boolean) {
    Text(
        label,
        modifier = Modifier.clip(RoundedCornerShape(18.dp)).background(if (selected) SoftBlue else Color.White).padding(horizontal = 14.dp, vertical = 8.dp),
        color = if (selected) Blue else Muted,
        fontSize = 12.sp,
        fontWeight = FontWeight.Bold,
    )
}

@Composable
private fun PlaceholderScreen(modifier: Modifier, tab: RootTab) {
    Column(
        modifier = modifier.fillMaxSize().padding(horizontal = 24.dp).statusBarsPadding(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center,
    ) {
        Box(Modifier.size(68.dp).clip(CircleShape).background(SoftBlue), contentAlignment = Alignment.Center) {
            Icon(tab.icon, contentDescription = null, tint = Blue, modifier = Modifier.size(32.dp))
        }
        Spacer(Modifier.height(18.dp))
        Text(tab.label, color = Ink, fontWeight = FontWeight.Black, fontSize = 22.sp)
        Spacer(Modifier.height(7.dp))
        Text("该模块已接入原生导航。下一步会把 Web 端的数据模型和操作逐项迁移到这里。", color = Muted, fontSize = 13.sp, textAlign = TextAlign.Center, lineHeight = 20.sp)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun QuickEntrySheet(onClose: () -> Unit, onSave: (String, Double, EntryType) -> Unit) {
    var type by remember { mutableStateOf(EntryType.EXPENSE) }
    var title by remember { mutableStateOf("") }
    var amountText by remember { mutableStateOf("") }
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    ModalBottomSheet(
        onDismissRequest = onClose,
        sheetState = sheetState,
        containerColor = Color.White,
        dragHandle = { Box(Modifier.padding(top = 10.dp).width(36.dp).height(4.dp).clip(CircleShape).background(Color(0xFFD7DFEA))) },
    ) {
        Column(Modifier.fillMaxWidth().padding(start = 22.dp, end = 22.dp, bottom = 32.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("快速记一笔", color = Ink, fontWeight = FontWeight.Black, fontSize = 21.sp)
                IconButton(onClick = onClose) { Icon(Icons.Default.Close, contentDescription = "关闭", tint = Muted) }
            }
            Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(Canvas).padding(4.dp)) {
                EntryType.entries.forEach { item ->
                    val selected = item == type
                    Text(
                        item.label,
                        modifier = Modifier.weight(1f).clip(RoundedCornerShape(10.dp)).background(if (selected) Color.White else Color.Transparent).clickable { type = item }.padding(vertical = 10.dp),
                        textAlign = TextAlign.Center,
                        color = if (selected) item.color else Muted,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                    )
                }
            }
            NativeInput(label = "备注", value = title, onValueChange = { title = it }, placeholder = "例如：晚餐、工资")
            NativeInput(label = "金额", value = amountText, onValueChange = { amountText = it.filter { char -> char.isDigit() || char == '.' } }, placeholder = "0.00", isAmount = true)
            val amount = amountText.toDoubleOrNull() ?: 0.0
            Text(
                text = if (amount > 0) "保存 ¥ ${moneyFormat.format(amount)}" else "请输入金额",
                modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(if (amount > 0) type.color else Color(0xFFCCD5E2)).clickable(enabled = amount > 0) { onSave(title, amount, type) }.padding(vertical = 15.dp),
                textAlign = TextAlign.Center,
                color = Color.White,
                fontWeight = FontWeight.Black,
                fontSize = 15.sp,
            )
        }
    }
}

@Composable
private fun NativeInput(label: String, value: String, onValueChange: (String) -> Unit, placeholder: String, isAmount: Boolean = false) {
    Column(verticalArrangement = Arrangement.spacedBy(7.dp)) {
        Text(label, color = Ink, fontSize = 13.sp, fontWeight = FontWeight.Bold)
        androidx.compose.material3.OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            placeholder = { Text(placeholder) },
            singleLine = true,
            keyboardOptions = KeyboardOptions(keyboardType = if (isAmount) KeyboardType.Decimal else KeyboardType.Text),
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(14.dp),
        )
    }
}
