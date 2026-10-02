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
import androidx.compose.foundation.layout.ColumnScope
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
import androidx.compose.foundation.layout.offset
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
import androidx.compose.material.icons.filled.CreditCard
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.KeyboardArrowDown
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
import androidx.compose.runtime.CompositionLocalProvider
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
import androidx.compose.ui.unit.TextUnit
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
    CONSUMPTION("消费", Icons.Default.CreditCard),
    SAVINGS("储蓄", Icons.Default.Savings),
    LOANS("贷款", Icons.Default.Payments),
    ASSETS("资产", Icons.Default.PieChart),
    SETTINGS("设置", Icons.Default.Settings),
}

private enum class EntryType(val label: String, val color: Color) {
    EXPENSE("支出", Red),
    INCOME("收入", Green),
}

private enum class HomeMetric(val label: String) {
    BALANCE("结余"),
    EXPENSE("支出"),
    INCOME("收入"),
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
    ) {
        // CSS text has a content-sized line box. Material's 24sp default line
        // height made small Web-replica labels consume a full native row.
        CompositionLocalProvider(androidx.compose.material3.LocalTextStyle provides androidx.compose.material3.LocalTextStyle.current.copy(lineHeight = TextUnit.Unspecified)) {
            content()
        }
    }
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
            NativeBottomBar(
                selectedTab = selectedTab,
                onTabSelected = { selectedTab = it },
                onQuickEntry = { entrySheetOpen = true },
            )
        },
    ) { insets ->
        AnimatedContent(
            targetState = selectedTab,
            label = "Native tab switch",
        ) { tab ->
            when (tab) {
                RootTab.HOME -> HomeScreen(Modifier.padding(insets), entries, actualBalance)
                RootTab.ASSETS -> JournalScreen(Modifier.padding(insets), entries)
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
private fun NativeBottomBar(
    selectedTab: RootTab,
    onTabSelected: (RootTab) -> Unit,
    onQuickEntry: () -> Unit,
) {
    Surface(
        color = Color.White,
        shadowElevation = 0.dp,
        modifier = Modifier.fillMaxWidth().navigationBarsPadding(),
    ) {
        Box(Modifier.fillMaxWidth().height(55.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth().height(55.dp).padding(horizontal = 6.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceAround,
            ) {
                RootTab.entries.forEach { tab ->
                    val active = selectedTab == tab
                    Box(
                        modifier = Modifier.weight(1f).clip(RoundedCornerShape(12.dp)).clickable { onTabSelected(tab) }.padding(vertical = 12.dp),
                        contentAlignment = Alignment.Center,
                    ) {
                        Icon(
                            tab.icon,
                            contentDescription = tab.label,
                            tint = if (active) Color(0xFF202A39) else Color(0xFFA8AAAD),
                            modifier = Modifier.size(26.dp),
                        )
                    }
                }
            }
            Row(
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .offset(y = (-28).dp)
                    .clip(RoundedCornerShape(28.dp))
                    .background(Color.White)
                    .clickable(onClick = onQuickEntry)
                    .padding(horizontal = 15.dp, vertical = 9.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Box(Modifier.size(29.dp).clip(CircleShape).background(Blue), contentAlignment = Alignment.Center) {
                    Icon(Icons.Default.Add, contentDescription = null, tint = Color.White, modifier = Modifier.size(19.dp))
                }
                Text("记账", color = Blue, fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun HomeScreen(modifier: Modifier, entries: List<LedgerEntry>, actualBalance: Double) {
    var metric by remember { mutableStateOf(HomeMetric.EXPENSE) }
    val income = entries.filter { it.type == EntryType.INCOME }.sumOf { it.amount }
    val expense = entries.filter { it.type == EntryType.EXPENSE }.sumOf { it.amount }
    val value = when (metric) {
        HomeMetric.BALANCE -> actualBalance
        HomeMetric.EXPENSE -> expense
        HomeMetric.INCOME -> income
    }
    val label = when (metric) {
        HomeMetric.BALANCE -> "当前结余"
        HomeMetric.EXPENSE -> "本月支出"
        HomeMetric.INCOME -> "本月收入"
    }

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 12.dp, end = 12.dp, top = 0.dp, bottom = 76.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        item { WebReplicaHeader() }
        item {
            WebReplicaMetricControl(metric = metric, onMetricChange = { metric = it })
            Spacer(Modifier.height(11.dp))
            WebReplicaHero(metric = metric, label = label, value = value, count = entries.size)
        }
        item { WebReplicaBudgetCard(income, expense) }
        item { WebReplicaDiagnosticBanner(income, expense) }
        item { WebReplicaCompass(income, expense) }
        item {
            WebReplicaCard {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text("最近流水", color = Ink, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                    Text("全部账单  ›", color = Blue, fontSize = 11.sp, fontWeight = FontWeight.Medium)
                }
                Spacer(Modifier.height(7.dp))
                entries.take(3).forEach { LedgerRow(it) }
            }
        }
    }
}

@Composable
private fun WebReplicaHeader() {
    Row(
        modifier = Modifier.fillMaxWidth().height(34.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Spacer(Modifier.size(38.dp))
        Text("首页", color = Color(0xFF101827), fontSize = 18.sp, fontWeight = FontWeight.Medium)
        IconButton(onClick = {}) { Icon(Icons.Default.Search, contentDescription = "搜索", tint = Color(0xFF101827), modifier = Modifier.size(22.dp)) }
    }
}

@Composable
private fun WebReplicaMetricControl(metric: HomeMetric, onMetricChange: (HomeMetric) -> Unit) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.clickable { }) {
            Text("2026年1月", color = Ink, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.width(4.dp))
            Icon(Icons.Default.KeyboardArrowDown, contentDescription = "选择月份", tint = Ink, modifier = Modifier.size(16.dp))
        }
        Row(
            modifier = Modifier.clip(RoundedCornerShape(28.dp)).background(Color(0xFFF1F5F9)).padding(2.5.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            HomeMetric.entries.forEach { item ->
                val active = item == metric
                Text(
                    item.label,
                    modifier = Modifier
                        .clip(RoundedCornerShape(22.dp))
                        .background(if (active) Color.White else Color.Transparent)
                        .clickable { onMetricChange(item) }
                        .padding(horizontal = 10.dp, vertical = 6.dp),
                    color = if (active) Blue else Color(0xFF718096),
                    fontSize = 11.sp,
                    fontWeight = if (active) FontWeight.SemiBold else FontWeight.Medium,
                )
            }
        }
    }
}

@Composable
private fun WebReplicaHero(metric: HomeMetric, label: String, value: Double, count: Int) {
    WebReplicaCard(padding = 0.dp) {
        Box(Modifier.fillMaxWidth().height(146.dp).padding(horizontal = 18.dp, vertical = 16.dp)) {
            Text("1月", modifier = Modifier.align(Alignment.TopEnd).offset(y = (-8).dp).alpha(.06f), color = Blue, fontSize = 72.sp, fontWeight = FontWeight.Black)
            Column(Modifier.align(Alignment.TopStart)) {
                Text(label, color = Color(0xFF64748B), fontSize = 13.sp, fontWeight = FontWeight.Medium)
                Spacer(Modifier.height(8.dp))
                Text("¥ ${moneyFormat.format(value)}", color = Color(0xFF0F172A), fontSize = 32.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(13.dp))
                Text("共 $count 笔记账", color = Color(0xFF94A3B8), fontSize = 11.sp)
                Spacer(Modifier.height(3.dp))
                Text(if (metric == HomeMetric.EXPENSE) "查看明细分析  ›" else "查看明细  ›", color = Blue, fontSize = 11.sp, fontWeight = FontWeight.Medium)
            }
        }
    }
}

@Composable
private fun WebReplicaBudgetCard(income: Double, expense: Double) {
    val available = income - expense
    WebReplicaCard {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(28.dp).clip(RoundedCornerShape(8.dp)).background(Color(0xFFE2F3FF)), contentAlignment = Alignment.Center) {
                Icon(Icons.Default.PieChart, contentDescription = null, tint = Color(0xFF0EA5E9), modifier = Modifier.size(17.dp))
            }
            Spacer(Modifier.width(8.dp))
            Column(Modifier.weight(1f)) {
                Text("本月资金分配", color = Ink, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                Text("收入扣除实际消费、还款和储蓄后的安排金额", color = Color(0xFF7B8CA3), fontSize = 10.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
            Text("预算管理  ›", color = Blue, fontSize = 10.sp, fontWeight = FontWeight.SemiBold)
        }
        Spacer(Modifier.height(16.dp))
        Row(Modifier.fillMaxWidth()) {
            BudgetAmount("可支配预算", available, "可继续安排 ¥ ${moneyFormat.format(available)}", Modifier.weight(1f))
            Box(Modifier.width(1.dp).height(64.dp).background(Line))
            BudgetAmount("收入", income, "已分配 ¥ ${moneyFormat.format(expense)}", Modifier.weight(1f).padding(start = 14.dp))
        }
        Spacer(Modifier.height(15.dp))
        Box(Modifier.fillMaxWidth().height(7.dp).clip(CircleShape).background(Color(0xFFEAF0F7))) {
            if (income > 0) Box(Modifier.fillMaxWidth((expense / income).toFloat().coerceIn(0f, 1f)).height(7.dp).background(Color(0xFF0EA5E9)))
        }
        Spacer(Modifier.height(14.dp))
        Row(Modifier.fillMaxWidth()) {
            BudgetSegment("消费", expense, Color(0xFF0EA5E9), Modifier.weight(1f))
            BudgetSegment("还款", 0.0, Color(0xFFF59E0B), Modifier.weight(1f))
        }
        Spacer(Modifier.height(13.dp))
        Row(Modifier.fillMaxWidth()) {
            BudgetSegment("储蓄", 0.0, Color(0xFF10B981), Modifier.weight(1f))
            BudgetSegment("剩余", available, Blue, Modifier.weight(1f), blueValue = true)
        }
        HorizontalDivider(Modifier.padding(vertical = 15.dp), color = Line)
        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("资产存量", color = Color(0xFF64748B), fontSize = 10.sp)
            Spacer(Modifier.width(6.dp))
            Text("¥ ${moneyFormat.format(available.coerceAtLeast(0.0))}", color = Green, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.weight(1f))
            Text("余额单独展示，不重复计入本月扣减", color = Color(0xFF8492A7), fontSize = 9.sp)
        }
    }
}

@Composable
private fun BudgetAmount(label: String, value: Double, caption: String, modifier: Modifier) {
    Column(modifier) {
        Text(label, color = Color(0xFF64748B), fontSize = 10.sp)
        Spacer(Modifier.height(3.dp))
        Text("¥ ${moneyFormat.format(value)}", color = Ink, fontSize = 17.sp, fontWeight = FontWeight.Bold)
        Spacer(Modifier.height(2.dp))
        Text(caption, color = Color(0xFF8D9CAF), fontSize = 10.sp, maxLines = 1)
    }
}

@Composable
private fun BudgetSegment(label: String, value: Double, color: Color, modifier: Modifier, blueValue: Boolean = false) {
    Column(modifier) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(6.dp).clip(CircleShape).background(color))
            Spacer(Modifier.width(4.dp))
            Text(label, color = Color(0xFF64748B), fontSize = 10.sp)
        }
        Spacer(Modifier.height(3.dp))
        Text("¥ ${moneyFormat.format(value)}", color = if (blueValue) Blue else Ink, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun WebReplicaDiagnosticBanner(income: Double, expense: Double) {
    val warning = expense > income && income > 0
    WebReplicaCard(padding = 12.dp) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(26.dp).clip(RoundedCornerShape(7.dp)).background(Color(0xFFEAF6FF)), contentAlignment = Alignment.Center) {
                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Blue, modifier = Modifier.size(16.dp))
            }
            Spacer(Modifier.width(9.dp))
            Column(Modifier.weight(1f)) {
                Text("财务诊断", color = Ink, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                Text(if (warning) "本月支出偏高，建议关注预算" else "本月现金流平稳，无超支或临近违约风险", color = Color(0xFF64748B), fontSize = 11.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
            Text("查看  ›", color = Blue, fontSize = 11.sp, fontWeight = FontWeight.Medium)
        }
    }
}

@Composable
private fun WebReplicaCompass(income: Double, expense: Double) {
    val netWorth = income - expense
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            CompassTile("净资产", "¥ ${moneyFormat.format(netWorth)}", "结构健康", Green, Icons.Default.CheckCircle, Modifier.weight(1f))
            CompassTile("预算余量", "100%", "已用 0%", Blue, Icons.Default.PieChart, Modifier.weight(1f))
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            CompassTile("待还贷款", "无待还", "状态良好", Red, Icons.Default.AccountBalanceWallet, Modifier.weight(1f))
            CompassTile("储蓄达成", "0%", "计划进行中", Amber, Icons.Default.Savings, Modifier.weight(1f))
        }
    }
}

@Composable
private fun CompassTile(label: String, value: String, badge: String, color: Color, icon: ImageVector, modifier: Modifier) {
    WebReplicaCard(modifier = modifier, padding = 12.dp) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(22.dp).clip(RoundedCornerShape(6.dp)).background(color.copy(alpha = .11f)), contentAlignment = Alignment.Center) {
                Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(14.dp))
            }
            Spacer(Modifier.width(6.dp))
            Text(label, color = Color(0xFF64748B), fontSize = 11.sp, fontWeight = FontWeight.Medium)
        }
        Spacer(Modifier.height(7.dp))
        Text(value, color = Ink, fontSize = 17.sp, fontWeight = FontWeight.SemiBold, maxLines = 1)
        Spacer(Modifier.height(4.dp))
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
            Text(badge, color = color, fontSize = 10.sp, fontWeight = FontWeight.Medium)
            Text("›", color = Color(0xFF9AA7B8), fontSize = 16.sp)
        }
    }
}

@Composable
private fun WebReplicaCard(modifier: Modifier = Modifier, padding: Dp = 16.dp, content: @Composable ColumnScope.() -> Unit) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
    ) {
        Column(Modifier.padding(padding), content = content)
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
