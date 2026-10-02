package com.wotty.stark.nativeapp

import android.os.Bundle
import android.content.Context
import android.graphics.Typeface
import android.view.View
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
import androidx.compose.foundation.Image
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
import androidx.compose.foundation.layout.fillMaxHeight
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
import androidx.compose.material.icons.filled.AutoGraph
import androidx.compose.material.icons.filled.Category
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.TrendingDown
import androidx.compose.material.icons.filled.TrendingUp
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.FabPosition
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.font.FontFamily
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
import java.time.YearMonth
import android.graphics.BitmapFactory

class MainActivity : ComponentActivity() {
    @Suppress("DEPRECATION")
    private fun hideNavigationHandle() {
        window.navigationBarColor = android.graphics.Color.WHITE
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
            window.isNavigationBarContrastEnforced = false
        }
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_HIDE_NAVIGATION or
                View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY or
                View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
            )
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
            window.insetsController?.let { controller ->
                controller.hide(android.view.WindowInsets.Type.navigationBars())
                controller.systemBarsBehavior = android.view.WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            }
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        hideNavigationHandle()
        window.decorView.setOnSystemUiVisibilityChangeListener { hideNavigationHandle() }
        setContent {
            StarkNativeTheme {
                StarkNativeApp()
            }
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) hideNavigationHandle()
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
private val StarkFontFamily = FontFamily(Typeface.create("sans-serif-medium", Typeface.NORMAL))

private enum class RootTab(val label: String, val iconResource: Int) {
    HOME("首页", R.drawable.nav_home),
    CONSUMPTION("消费", R.drawable.nav_consumption),
    SAVINGS("储蓄", R.drawable.nav_savings),
    LOANS("贷款", R.drawable.nav_loan),
    ASSETS("资产", R.drawable.nav_assets),
    SETTINGS("设置", R.drawable.nav_settings),
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

private enum class BalancePeriod(val label: String) {
    MONTH("自然月"),
    SALARY("发薪周期"),
}

private enum class HomeOverlay {
    MONTH,
    SALARY_DAY,
    SEARCH,
    BUDGET,
    DIAGNOSTIC,
    CATEGORIES,
}

private data class LedgerEntry(
    val id: Long,
    val title: String,
    val category: String,
    val amount: Double,
    val type: EntryType,
    val dayLabel: String,
    val transactionDate: String = LocalDate.now().toString(),
)

private data class NativeLedgerSnapshot(
    val actualBalance: Double,
    val entries: List<LedgerEntry>,
)

private data class NativeHomePreferences(
    val selectedMonth: String,
    val salaryDay: Int,
    val monthlyBudget: Double,
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
                    transactionDate = item.optString("transactionDate", LocalDate.now().toString()),
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
                    .put("dayLabel", entry.dayLabel)
                    .put("transactionDate", entry.transactionDate),
            )
        }
        preferences.edit()
            .putString("actualBalance", actualBalance.toString())
            .putString("entries", rows.toString())
            .apply()
    }

    fun loadHomePreferences(): NativeHomePreferences {
        return NativeHomePreferences(
            selectedMonth = preferences.getString("selectedMonth", YearMonth.now().toString()) ?: YearMonth.now().toString(),
            salaryDay = (preferences.getInt("salaryDay", 15)).coerceIn(1, 28),
            monthlyBudget = preferences.getString("monthlyBudget", "0")?.toDoubleOrNull()?.coerceAtLeast(0.0) ?: 0.0,
        )
    }

    fun saveHomePreferences(selectedMonth: String, salaryDay: Int, monthlyBudget: Double) {
        preferences.edit()
            .putString("selectedMonth", selectedMonth)
            .putInt("salaryDay", salaryDay.coerceIn(1, 28))
            .putString("monthlyBudget", monthlyBudget.coerceAtLeast(0.0).toString())
            .apply()
    }
}

private fun sampleEntries(): List<LedgerEntry> {
    val today = LocalDate.now()
    return listOf(
        LedgerEntry(1, "工资入账", "工资收入 · 银行卡", 6917.18, EntryType.INCOME, "今天 09:01", today.toString()),
        LedgerEntry(2, "午餐", "餐饮美食 · 微信", 28.00, EntryType.EXPENSE, "今天 12:26", today.toString()),
        LedgerEntry(3, "地铁出行", "交通出行 · 支付宝", 4.00, EntryType.EXPENSE, "昨天 18:32", today.minusDays(1).toString()),
        LedgerEntry(4, "超市采购", "生活消费 · 微信", 86.50, EntryType.EXPENSE, "昨天 17:06", today.minusDays(1).toString()),
    )
}

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
        // Web uses Microsoft YaHei UI around 400/500. Use Android's medium
        // system face as the device-safe counterpart rather than the thin
        // generic `sans` fallback Compose selected before.
        CompositionLocalProvider(
            androidx.compose.material3.LocalTextStyle provides androidx.compose.material3.LocalTextStyle.current.copy(
                fontFamily = StarkFontFamily,
                fontWeight = FontWeight.Normal,
                lineHeight = TextUnit.Unspecified,
            ),
        ) {
            content()
        }
    }
}

@Composable
private fun StarkNativeApp() {
    var selectedTab by remember { mutableStateOf(RootTab.HOME) }
    var entrySheetOpen by remember { mutableStateOf(false) }
    var homeOverlay by remember { mutableStateOf<HomeOverlay?>(null) }
    val context = androidx.compose.ui.platform.LocalContext.current
    val ledgerStore = remember { NativeLedgerStore(context.applicationContext) }
    val homePreferences = remember { ledgerStore.loadHomePreferences() }
    var selectedMonth by remember { mutableStateOf(homePreferences.selectedMonth) }
    var salaryDay by remember { mutableStateOf(homePreferences.salaryDay) }
    var monthlyBudget by remember { mutableDoubleStateOf(homePreferences.monthlyBudget) }
    val snapshot = remember { ledgerStore.load() }
    var actualBalance by remember { mutableDoubleStateOf(snapshot.actualBalance) }
    val entries = remember { mutableStateListOf<LedgerEntry>().also { it.addAll(snapshot.entries) } }

    Scaffold(
        containerColor = Canvas,
        floatingActionButtonPosition = FabPosition.Center,
        floatingActionButton = {
            androidx.compose.material3.ExtendedFloatingActionButton(
                onClick = { entrySheetOpen = true },
                icon = { Icon(Icons.Default.Add, contentDescription = null, modifier = Modifier.size(20.dp)) },
                text = { Text("记账", fontSize = 15.sp, fontWeight = FontWeight.Bold) },
                containerColor = Color.White,
                contentColor = Blue,
                elevation = androidx.compose.material3.FloatingActionButtonDefaults.elevation(defaultElevation = 3.dp),
            )
        },
        bottomBar = {
            NativeBottomBar(
                selectedTab = selectedTab,
                onTabSelected = { selectedTab = it },
            )
        },
    ) { insets ->
        AnimatedContent(
            targetState = selectedTab,
            label = "Native tab switch",
        ) { tab ->
            when (tab) {
                RootTab.HOME -> HomeScreen(
                    modifier = Modifier.padding(insets),
                    entries = entries,
                    actualBalance = actualBalance,
                    selectedMonth = selectedMonth,
                    salaryDay = salaryDay,
                    monthlyBudget = monthlyBudget,
                    onSalaryDayClick = { homeOverlay = HomeOverlay.SALARY_DAY },
                    onOpenOverlay = { homeOverlay = it },
                    onSelectTab = { selectedTab = it },
                )
                RootTab.CONSUMPTION, RootTab.ASSETS -> JournalScreen(Modifier.padding(insets), entries)
                else -> PlaceholderScreen(Modifier.padding(insets), tab)
            }
        }
    }

    when (homeOverlay) {
        HomeOverlay.MONTH -> MonthPickerDialog(
            selectedMonth = selectedMonth,
            onSelect = {
                selectedMonth = it
                ledgerStore.saveHomePreferences(it, salaryDay, monthlyBudget)
                homeOverlay = null
            },
            onDismiss = { homeOverlay = null },
        )
        HomeOverlay.SALARY_DAY -> SalaryDayPickerDialog(
            selectedDay = salaryDay,
            onSelect = {
                salaryDay = it
                ledgerStore.saveHomePreferences(selectedMonth, it, monthlyBudget)
                homeOverlay = null
            },
            onDismiss = { homeOverlay = null },
        )
        HomeOverlay.SEARCH -> TransactionSearchDialog(entries, onDismiss = { homeOverlay = null })
        HomeOverlay.BUDGET -> HomeSummaryDialog(
            title = "本月资金分配",
            description = "预算管理",
            income = entries.filter { it.type == EntryType.INCOME && it.transactionDate.startsWith(selectedMonth) }.sumOf { it.amount },
            expense = entries.filter { it.type == EntryType.EXPENSE && it.transactionDate.startsWith(selectedMonth) }.sumOf { it.amount },
            budget = monthlyBudget,
            onBudgetChange = {
                monthlyBudget = it
                ledgerStore.saveHomePreferences(selectedMonth, salaryDay, it)
            },
            onDismiss = { homeOverlay = null },
            onOpenTransactions = { homeOverlay = null; selectedTab = RootTab.CONSUMPTION },
        )
        HomeOverlay.DIAGNOSTIC -> HomeSummaryDialog(
            title = "财务诊断",
            description = "本期收支概览",
            income = entries.filter { it.type == EntryType.INCOME && it.transactionDate.startsWith(selectedMonth) }.sumOf { it.amount },
            expense = entries.filter { it.type == EntryType.EXPENSE && it.transactionDate.startsWith(selectedMonth) }.sumOf { it.amount },
            budget = monthlyBudget,
            onBudgetChange = null,
            onDismiss = { homeOverlay = null },
            onOpenTransactions = { homeOverlay = null; selectedTab = RootTab.CONSUMPTION },
        )
        HomeOverlay.CATEGORIES -> ExpenseCategoriesDialog(
            entries = entries.filter { it.type == EntryType.EXPENSE && it.transactionDate.startsWith(selectedMonth) },
            onDismiss = { homeOverlay = null },
        )
        null -> Unit
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
) {
    Surface(
        color = Color.White,
        shadowElevation = 8.dp,
        modifier = Modifier.fillMaxWidth(),
    ) {
        Row(
            modifier = Modifier.fillMaxWidth().height(62.dp).padding(horizontal = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceAround,
        ) {
            RootTab.entries.forEach { tab ->
                val active = selectedTab == tab
                Box(
                    modifier = Modifier.weight(1f).fillMaxHeight().clip(RoundedCornerShape(12.dp)).clickable { onTabSelected(tab) },
                    contentAlignment = Alignment.Center,
                ) {
                    WebNavIcon(
                        resourceId = tab.iconResource,
                        contentDescription = tab.label,
                        active = active,
                        modifier = Modifier.size(27.dp),
                    )
                }
            }
        }
    }
}

@Composable
private fun WebNavIcon(resourceId: Int, contentDescription: String, active: Boolean, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val bitmap = remember(resourceId) {
        BitmapFactory.decodeResource(context.resources, resourceId).asImageBitmap()
    }
    Image(
        bitmap = bitmap,
        contentDescription = contentDescription,
        modifier = modifier.alpha(if (active) 1f else .48f),
    )
}

@Composable
private fun HomeScreen(
    modifier: Modifier,
    entries: List<LedgerEntry>,
    actualBalance: Double,
    selectedMonth: String,
    salaryDay: Int,
    monthlyBudget: Double,
    onSalaryDayClick: () -> Unit,
    onOpenOverlay: (HomeOverlay) -> Unit,
    onSelectTab: (RootTab) -> Unit,
) {
    var metric by remember { mutableStateOf(HomeMetric.EXPENSE) }
    var balancePeriod by remember { mutableStateOf(BalancePeriod.MONTH) }
    val month = runCatching { YearMonth.parse(selectedMonth) }.getOrElse { YearMonth.now() }
    val periodEntries = entries.filter { entry ->
        val date = runCatching { LocalDate.parse(entry.transactionDate) }.getOrNull()
        date != null && if (metric == HomeMetric.BALANCE && balancePeriod == BalancePeriod.SALARY) {
            date >= month.atDay(salaryDay) && date < month.atDay(salaryDay).plusMonths(1)
        } else {
            date.year == month.year && date.monthValue == month.monthValue
        }
    }
    val income = periodEntries.filter { it.type == EntryType.INCOME }.sumOf { it.amount }
    val expense = periodEntries.filter { it.type == EntryType.EXPENSE }.sumOf { it.amount }
    val value = when (metric) {
        HomeMetric.BALANCE -> actualBalance
        HomeMetric.EXPENSE -> expense
        HomeMetric.INCOME -> income
    }
    val monthLabel = "${month.year}年${month.monthValue}月"
    val label = when (metric) {
        HomeMetric.BALANCE -> "账户当前结余"
        HomeMetric.EXPENSE -> if (balancePeriod == BalancePeriod.SALARY) "本期支出" else "本月支出"
        HomeMetric.INCOME -> if (balancePeriod == BalancePeriod.SALARY) "本期收入" else "本月收入"
    }

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 12.dp, end = 12.dp, top = 0.dp, bottom = 76.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        item { WebReplicaHeader(onSearch = { onOpenOverlay(HomeOverlay.SEARCH) }) }
        item {
            WebReplicaMetricControl(
                metric = metric,
                monthLabel = monthLabel,
                onMonthClick = { onOpenOverlay(HomeOverlay.MONTH) },
                onMetricChange = { metric = it },
            )
            Spacer(Modifier.height(11.dp))
            WebReplicaHero(
                metric = metric,
                period = balancePeriod,
                label = label,
                value = value,
                count = periodEntries.size,
                monthLabel = monthLabel,
                salaryDay = salaryDay,
                onPeriodChange = { balancePeriod = it },
                onSalaryDayClick = onSalaryDayClick,
                onDetails = { onSelectTab(RootTab.CONSUMPTION) },
            )
        }
        item { WebReplicaBudgetCard(income, expense, actualBalance, monthlyBudget, monthLabel) { onOpenOverlay(HomeOverlay.BUDGET) } }
        item { WebReplicaDiagnosticBanner(income, expense) { onOpenOverlay(HomeOverlay.DIAGNOSTIC) } }
        item { WebReplicaCompass(income, expense, actualBalance, onOpenOverlay, onSelectTab) }
        item { WebReplicaExpenseStructure(periodEntries, monthLabel) { onOpenOverlay(HomeOverlay.CATEGORIES) } }
        item { WebReplicaAdvisoryCard(income, expense) }
        item { WebReplicaCashflowTrend(entries) }
        item { WebReplicaRecentTransactions(periodEntries.take(3), onAll = { onSelectTab(RootTab.CONSUMPTION) }) }
    }
}

@Composable
private fun WebReplicaExpenseStructure(entries: List<LedgerEntry>, monthLabel: String, onCategoryDetails: () -> Unit) {
    val expenses = entries.filter { it.type == EntryType.EXPENSE }
    val categories = expenses
        .groupBy { it.category.substringBefore(" ·") }
        .map { (category, rows) -> category to rows.sumOf { it.amount } }
        .sortedByDescending { it.second }
    val total = expenses.sumOf { it.amount }
    WebReplicaCard(padding = 14.dp) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column {
                Text("${monthLabel}支出结构", color = Color(0xFF0F172A), fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                Text("共 ${categories.size} 个分类", color = Color(0xFF94A3B8), fontSize = 10.sp)
            }
            Text("分类明细  ›", modifier = Modifier.clip(RoundedCornerShape(8.dp)).clickable { onCategoryDetails() }.padding(6.dp), color = Blue, fontSize = 11.sp, fontWeight = FontWeight.Medium)
        }
        Spacer(Modifier.height(10.dp))
        if (categories.isEmpty()) {
            Text("本月暂无支出记录", modifier = Modifier.fillMaxWidth().padding(vertical = 25.dp), color = Color(0xFF94A3B8), fontSize = 12.sp, textAlign = TextAlign.Center)
        } else {
            EChartsExpenseRoseChart(categories, total)
        }
    }
}

@Composable
private fun WebReplicaAdvisoryCard(income: Double, expense: Double) {
    val dailyExpense = expense / 31
    val healthy = income >= expense
    WebReplicaCard(padding = 14.dp) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Icon(Icons.Default.Lightbulb, contentDescription = null, tint = Blue, modifier = Modifier.size(16.dp))
                Spacer(Modifier.width(6.dp))
                Text("财务行动建议", color = Color(0xFF0F172A), fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
            }
            Text(
                if (healthy) "节律健康" else "需控制支出",
                modifier = Modifier.clip(CircleShape).background(Color(0xFFE0F2FE)).padding(horizontal = 7.dp, vertical = 3.dp),
                color = Blue,
                fontSize = 10.sp,
                fontWeight = FontWeight.SemiBold,
            )
        }
        Spacer(Modifier.height(10.dp))
        AdvisoryRow("1", "当前日均支出 ¥ ${moneyFormat.format(dailyExpense)}，若保持当前速率，预计月底可结余 ¥ ${moneyFormat.format((income - expense).coerceAtLeast(0.0))}。")
        Spacer(Modifier.height(8.dp))
        AdvisoryRow("2", "剩余总预算 ¥ ${moneyFormat.format((income - expense).coerceAtLeast(0.0))}，建议将富余资金分配至储蓄计划。")
    }
}

@Composable
private fun AdvisoryRow(index: String, text: String) {
    Row(verticalAlignment = Alignment.Top) {
        Text(
            index,
            modifier = Modifier.size(16.dp).clip(CircleShape).background(Blue).padding(top = 1.dp),
            color = Color.White,
            fontSize = 10.sp,
            fontWeight = FontWeight.SemiBold,
            textAlign = TextAlign.Center,
        )
        Spacer(Modifier.width(8.dp))
        Text(text, color = Color(0xFF475569), fontSize = 11.sp, lineHeight = 16.sp)
    }
}

@Composable
private fun WebReplicaCashflowTrend(entries: List<LedgerEntry>) {
    val income = entries.filter { it.type == EntryType.INCOME }.sumOf { it.amount }
    val expense = entries.filter { it.type == EntryType.EXPENSE }.sumOf { it.amount }
    WebReplicaCard(padding = 14.dp) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column {
                Text("收支动态走势", color = Color(0xFF0F172A), fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                Text("近 5 个月对比", color = Color(0xFF94A3B8), fontSize = 10.sp)
            }
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                TrendLegend("收入", Color(0xFF38BDF8))
                TrendLegend("支出", Color(0xFFFB7185))
            }
        }
        Spacer(Modifier.height(8.dp))
        EChartsCashflowTrend(income, expense)
    }
}

@Composable
private fun TrendLegend(label: String, color: Color) {
    Row(verticalAlignment = Alignment.CenterVertically) {
        Box(Modifier.size(7.dp).clip(CircleShape).background(color))
        Spacer(Modifier.width(4.dp))
        Text(label, color = Color(0xFF64748B), fontSize = 10.sp)
    }
}

@Composable
private fun EChartsExpenseRoseChart(categories: List<Pair<String, Double>>, total: Double) {
    val colors = listOf(Color(0xFF0EA5E9), Color(0xFF10B981), Color(0xFFF59E0B), Color(0xFFFB7185), Color(0xFF8B5CF6))
    val data = categories.take(5).mapIndexed { index, (name, amount) ->
        RoseChartSegment(name, amount, colors[index])
    }
    Box(Modifier.fillMaxWidth().height(198.dp)) {
        NativeRoseChart(data, Modifier.fillMaxSize())
        Text(
            "¥ ${moneyFormat.format(total)}",
            modifier = Modifier.align(Alignment.Center),
            color = Ink,
            fontSize = 13.sp,
            fontWeight = FontWeight.Bold,
        )
    }
}

@Composable
private fun EChartsCashflowTrend(income: Double, expense: Double) {
    NativeCashflowChart(
        incomes = listOf(0.0, 0.0, 0.0, 0.0, income),
        expenses = listOf(0.0, 0.0, 0.0, 0.0, expense),
        labels = listOf("9月", "10月", "11月", "12月", "1月"),
        modifier = Modifier.fillMaxWidth().height(124.dp),
    )
}

private data class RoseChartSegment(val label: String, val value: Double, val color: Color)

@Composable
private fun NativeRoseChart(data: List<RoseChartSegment>, modifier: Modifier = Modifier) {
    androidx.compose.foundation.Canvas(modifier = modifier) {
        val total = data.sumOf { it.value }.coerceAtLeast(0.01)
        val center = Offset(size.width / 2f, size.height / 2f)
        val baseRadius = size.minDimension * .14f
        val maxRadius = size.minDimension * .38f
        var startAngle = -90f
        data.forEach { segment ->
            val sweep = ((segment.value / total) * 360f).toFloat().coerceAtLeast(7f)
            val radius = baseRadius + ((segment.value / data.maxOf { it.value }.coerceAtLeast(.01)) * (maxRadius - baseRadius)).toFloat()
            drawArc(
                color = segment.color,
                startAngle = startAngle + 2f,
                sweepAngle = (sweep - 4f).coerceAtLeast(3f),
                useCenter = true,
                topLeft = Offset(center.x - radius, center.y - radius),
                size = Size(radius * 2f, radius * 2f),
            )
            val middle = Math.toRadians((startAngle + sweep / 2f).toDouble())
            val lineStart = Offset(
                center.x + kotlin.math.cos(middle).toFloat() * (radius + 3.dp.toPx()),
                center.y + kotlin.math.sin(middle).toFloat() * (radius + 3.dp.toPx()),
            )
            val lineEnd = Offset(
                center.x + kotlin.math.cos(middle).toFloat() * (radius + 17.dp.toPx()),
                center.y + kotlin.math.sin(middle).toFloat() * (radius + 17.dp.toPx()),
            )
            drawLine(segment.color, lineStart, lineEnd, strokeWidth = 1.dp.toPx(), cap = StrokeCap.Round)
            drawIntoCanvas { canvas -> canvas.nativeCanvas.apply {
                val paint = android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG).apply {
                    color = segment.color.toAndroidColorInt()
                    textSize = 10.sp.toPx()
                    typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
                    textAlign = if (lineEnd.x >= center.x) android.graphics.Paint.Align.LEFT else android.graphics.Paint.Align.RIGHT
                }
                drawText(segment.label, lineEnd.x + if (lineEnd.x >= center.x) 3.dp.toPx() else -3.dp.toPx(), lineEnd.y + 3.dp.toPx(), paint)
            } }
            startAngle += sweep
        }
        drawCircle(Color.White, radius = baseRadius * .84f, center = center)
    }
}

@Composable
private fun NativeCashflowChart(incomes: List<Double>, expenses: List<Double>, labels: List<String>, modifier: Modifier = Modifier) {
    androidx.compose.foundation.Canvas(modifier = modifier) {
        val left = 6.dp.toPx()
        val right = size.width - 5.dp.toPx()
        val top = 7.dp.toPx()
        val baseline = size.height - 22.dp.toPx()
        val max = (incomes + expenses).maxOrNull()?.coerceAtLeast(1.0) ?: 1.0
        drawLine(Color(0xFFE8EEF5), Offset(left, baseline), Offset(right, baseline), strokeWidth = 1.dp.toPx())
        val groupWidth = (right - left) / labels.size
        labels.forEachIndexed { index, label ->
            val groupStart = left + groupWidth * index
            val incomeHeight = (((baseline - top) * incomes[index] / max).toFloat())
            val expenseHeight = (((baseline - top) * expenses[index] / max).toFloat())
            val barWidth = (groupWidth * .25f).coerceAtMost(16.dp.toPx())
            val incomeLeft = groupStart + groupWidth * .21f
            val expenseLeft = groupStart + groupWidth * .54f
            if (incomeHeight > 0f) drawRoundRect(Color(0xFF0060C0), Offset(incomeLeft, baseline - incomeHeight), Size(barWidth, incomeHeight), CornerRadius(3.dp.toPx(), 3.dp.toPx()))
            if (expenseHeight > 0f) drawRoundRect(Color(0xFFF43F5E), Offset(expenseLeft, baseline - expenseHeight), Size(barWidth, expenseHeight), CornerRadius(3.dp.toPx(), 3.dp.toPx()))
            drawIntoCanvas { canvas -> canvas.nativeCanvas.apply {
                val paint = android.graphics.Paint(android.graphics.Paint.ANTI_ALIAS_FLAG).apply {
                    color = Color(0xFF94A3B8).toAndroidColorInt()
                    textSize = 10.sp.toPx()
                    typeface = Typeface.create("sans-serif-medium", Typeface.NORMAL)
                    textAlign = android.graphics.Paint.Align.CENTER
                }
                drawText(label, groupStart + groupWidth / 2f, size.height - 5.dp.toPx(), paint)
            } }
        }
    }
}

private fun Color.toAndroidColorInt(): Int = android.graphics.Color.argb(
    (alpha * 255).toInt(),
    (red * 255).toInt(),
    (green * 255).toInt(),
    (blue * 255).toInt(),
)

@Composable
private fun WebReplicaRecentTransactions(entries: List<LedgerEntry>, onAll: () -> Unit) {
    WebReplicaCard {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Text("最近流水", color = Ink, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
            Text("全部账单  ›", modifier = Modifier.clickable { onAll() }.padding(4.dp), color = Blue, fontSize = 11.sp, fontWeight = FontWeight.Medium)
        }
        Spacer(Modifier.height(7.dp))
        entries.take(3).forEach { LedgerRow(it) }
    }
}

@Composable
private fun WebReplicaHeader(onSearch: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth().height(34.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Spacer(Modifier.size(38.dp))
        Text("首页", color = Color(0xFF101827), fontSize = 18.sp, fontWeight = FontWeight.Medium)
        IconButton(onClick = onSearch) { Icon(Icons.Default.Search, contentDescription = "搜索", tint = Color(0xFF101827), modifier = Modifier.size(22.dp)) }
    }
}

@Composable
private fun WebReplicaMetricControl(metric: HomeMetric, monthLabel: String, onMonthClick: () -> Unit, onMetricChange: (HomeMetric) -> Unit) {
    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.clip(RoundedCornerShape(8.dp)).clickable(onClick = onMonthClick).padding(vertical = 8.dp, horizontal = 4.dp)) {
            Text(monthLabel, color = Ink, fontSize = 15.sp, fontWeight = FontWeight.SemiBold)
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
private fun WebReplicaHero(metric: HomeMetric, period: BalancePeriod, label: String, value: Double, count: Int, monthLabel: String, salaryDay: Int, onPeriodChange: (BalancePeriod) -> Unit, onSalaryDayClick: () -> Unit, onDetails: () -> Unit) {
    WebReplicaCard(padding = 0.dp) {
        Box(Modifier.fillMaxWidth().height(146.dp).padding(horizontal = 18.dp, vertical = 16.dp)) {
            Text(monthLabel.substringAfter("年"), modifier = Modifier.align(Alignment.TopEnd).offset(y = (-8).dp).alpha(.06f), color = Blue, fontSize = 72.sp, fontWeight = FontWeight.Black)
            Column(Modifier.align(Alignment.TopStart)) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text(label, color = Color(0xFF64748B), fontSize = 13.sp, fontWeight = FontWeight.Medium)
                    if (metric == HomeMetric.BALANCE) {
                        Row(Modifier.clip(CircleShape).background(Color(0xFFF1F5F9)).padding(2.dp)) {
                            BalancePeriod.entries.forEach { option ->
                                Text(option.label, modifier = Modifier.clip(CircleShape).background(if (period == option) Color.White else Color.Transparent).clickable { onPeriodChange(option) }.padding(horizontal = 8.dp, vertical = 4.dp), color = if (period == option) Blue else Muted, fontSize = 9.sp, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                }
                Spacer(Modifier.height(5.dp))
                Text("¥ " + moneyFormat.format(value), color = Color(0xFF0F172A), fontSize = 32.sp, fontWeight = FontWeight.Bold)
                Spacer(Modifier.height(7.dp))
                Text("共 " + count + " 笔记账", color = Color(0xFF94A3B8), fontSize = 11.sp)
                Spacer(Modifier.height(3.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(12.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text(if (metric == HomeMetric.EXPENSE) "查看明细分析  ›" else "查看明细  ›", modifier = Modifier.clickable(onClick = onDetails), color = Blue, fontSize = 11.sp, fontWeight = FontWeight.Medium)
                    if (metric == HomeMetric.BALANCE && period == BalancePeriod.SALARY) {
                        Text("发薪日 " + salaryDay + " 号 ›", modifier = Modifier.clickable(onClick = onSalaryDayClick), color = Blue, fontSize = 10.sp, fontWeight = FontWeight.Medium)
                    }
                }
            }
        }
    }
}

@Composable
private fun WebReplicaBudgetCard(income: Double, expense: Double, actualBalance: Double, monthlyBudget: Double, monthLabel: String, onManageBudget: () -> Unit) {
    val available = if (monthlyBudget > 0.0) monthlyBudget - expense else income - expense
    WebReplicaCard {
        Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(10.dp)).clickable(onClick = onManageBudget).padding(vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(28.dp).clip(RoundedCornerShape(8.dp)).background(Color(0xFFE2F3FF)), contentAlignment = Alignment.Center) {
                Icon(Icons.Default.PieChart, contentDescription = null, tint = Color(0xFF0EA5E9), modifier = Modifier.size(17.dp))
            }
            Spacer(Modifier.width(8.dp))
            Column(Modifier.weight(1f)) {
                Text(monthLabel + "资金分配", color = Ink, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
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
            Text("¥ " + moneyFormat.format(actualBalance), color = Green, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
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
private fun WebReplicaDiagnosticBanner(income: Double, expense: Double, onOpen: () -> Unit) {
    val warning = expense > income && income > 0
    WebReplicaCard(modifier = Modifier.clickable(onClick = onOpen), padding = 12.dp) {
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
private fun WebReplicaCompass(income: Double, expense: Double, actualBalance: Double, onOpenOverlay: (HomeOverlay) -> Unit, onSelectTab: (RootTab) -> Unit) {
    val netWorth = actualBalance
    val usedPercent = if (income > 0) (expense / income * 100).toInt().coerceIn(0, 100) else 0
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            CompassTile("净资产", "¥ " + moneyFormat.format(netWorth), "账户当前余额", Green, Icons.Default.CheckCircle, Modifier.weight(1f)) { onSelectTab(RootTab.ASSETS) }
            CompassTile("预算余量", (100 - usedPercent).toString() + "%", "已用 " + usedPercent + "%", Blue, Icons.Default.PieChart, Modifier.weight(1f)) { onOpenOverlay(HomeOverlay.BUDGET) }
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            CompassTile("待还贷款", "查看贷款", "贷款账户", Red, Icons.Default.AccountBalanceWallet, Modifier.weight(1f)) { onSelectTab(RootTab.LOANS) }
            CompassTile("储蓄达成", "查看储蓄", "储蓄计划", Amber, Icons.Default.Savings, Modifier.weight(1f)) { onSelectTab(RootTab.SAVINGS) }
        }
    }
}

@Composable
private fun CompassTile(label: String, value: String, badge: String, color: Color, icon: ImageVector, modifier: Modifier, onClick: () -> Unit) {
    WebReplicaCard(modifier = modifier.clickable(onClick = onClick), padding = 12.dp) {
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
            WebNavIcon(tab.iconResource, tab.label, active = true, modifier = Modifier.size(32.dp))
        }
        Spacer(Modifier.height(18.dp))
        Text(tab.label, color = Ink, fontWeight = FontWeight.Black, fontSize = 22.sp)
        Spacer(Modifier.height(7.dp))
        Text("该模块已接入原生导航。下一步会把 Web 端的数据模型和操作逐项迁移到这里。", color = Muted, fontSize = 13.sp, textAlign = TextAlign.Center, lineHeight = 20.sp)
    }
}

@Composable
private fun MonthPickerDialog(
    selectedMonth: String,
    onSelect: (String) -> Unit,
    onDismiss: () -> Unit,
) {
    val current = runCatching { YearMonth.parse(selectedMonth) }.getOrElse { YearMonth.now() }
    val options = (-5..5).map { current.plusMonths(it.toLong()) }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("选择月份", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                options.forEach { month ->
                    val key = month.toString()
                    Text(
                        "${month.year}年${month.monthValue}月",
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(10.dp))
                            .background(if (key == selectedMonth) SoftBlue else Color.Transparent)
                            .clickable { onSelect(key) }
                            .padding(horizontal = 14.dp, vertical = 11.dp),
                        color = if (key == selectedMonth) Blue else Ink,
                        fontWeight = if (key == selectedMonth) FontWeight.Bold else FontWeight.Normal,
                    )
                }
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text("取消") } },
    )
}

@Composable
private fun SalaryDayPickerDialog(
    selectedDay: Int,
    onSelect: (Int) -> Unit,
    onDismiss: () -> Unit,
) {
    var dayText by remember(selectedDay) { mutableStateOf(selectedDay.toString()) }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("发薪日设置", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("按每月固定日期划分薪资周期（1～28号）。账户当前结余不会因切换周期而改变。", color = Muted, fontSize = 12.sp, lineHeight = 18.sp)
                OutlinedTextField(
                    value = dayText,
                    onValueChange = { dayText = it.filter(Char::isDigit).take(2) },
                    label = { Text("发薪日") },
                    suffix = { Text("号") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                )
            }
        },
        dismissButton = { TextButton(onClick = onDismiss) { Text("取消") } },
        confirmButton = {
            TextButton(onClick = {
                onSelect((dayText.toIntOrNull() ?: selectedDay).coerceIn(1, 28))
            }) { Text("保存") }
        },
    )
}

@Composable
private fun TransactionSearchDialog(entries: List<LedgerEntry>, onDismiss: () -> Unit) {
    var query by remember { mutableStateOf("") }
    val results = entries.filter {
        query.isBlank() || it.title.contains(query, ignoreCase = true) || it.category.contains(query, ignoreCase = true)
    }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("搜索流水", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedTextField(
                    value = query,
                    onValueChange = { query = it },
                    label = { Text("关键词") },
                    placeholder = { Text("备注或分类") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
                if (results.isEmpty()) {
                    Text("没有找到匹配流水", color = Muted, fontSize = 12.sp, modifier = Modifier.padding(vertical = 8.dp))
                } else {
                    results.take(4).forEach { entry ->
                        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                            Text(entry.title, modifier = Modifier.weight(1f), color = Ink, fontSize = 13.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                            Text(if (entry.type == EntryType.INCOME) "+${moneyFormat.format(entry.amount)}" else "-${moneyFormat.format(entry.amount)}", color = if (entry.type == EntryType.INCOME) Green else Red, fontSize = 12.sp)
                        }
                    }
                }
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text("完成") } },
    )
}

@Composable
private fun HomeSummaryDialog(
    title: String,
    description: String,
    income: Double,
    expense: Double,
    budget: Double,
    onBudgetChange: ((Double) -> Unit)?,
    onDismiss: () -> Unit,
    onOpenTransactions: () -> Unit,
) {
    var budgetText by remember(budget) { mutableStateOf(if (budget > 0) moneyFormat.format(budget) else "") }
    val net = income - expense
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text(title, fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(description, color = Muted, fontSize = 12.sp)
                SummaryMetric("收入", income, Green)
                SummaryMetric("支出", expense, Red)
                SummaryMetric("净变动", net, if (net >= 0) Blue else Red)
                if (onBudgetChange != null) {
                    OutlinedTextField(
                        value = budgetText,
                        onValueChange = { budgetText = it.filter { char -> char.isDigit() || char == '.' } },
                        label = { Text("月预算") },
                        prefix = { Text("¥ ") },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                    )
                }
            }
        },
        dismissButton = {
            TextButton(onClick = onOpenTransactions) { Text("查看账单") }
        },
        confirmButton = {
            TextButton(onClick = {
                onBudgetChange?.invoke(budgetText.toDoubleOrNull() ?: 0.0)
                onDismiss()
            }) { Text("关闭") }
        },
    )
}

@Composable
private fun SummaryMetric(label: String, value: Double, color: Color) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        Text(label, color = Muted, fontSize = 12.sp)
        Text("¥ ${moneyFormat.format(value)}", color = color, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun ExpenseCategoriesDialog(entries: List<LedgerEntry>, onDismiss: () -> Unit) {
    val categories = entries.groupBy { it.category.substringBefore(" ·") }.mapValues { (_, rows) -> rows.sumOf { it.amount } }.toList().sortedByDescending { it.second }
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("分类明细", fontWeight = FontWeight.Bold) },
        text = {
            if (categories.isEmpty()) {
                Text("本月暂无支出记录", color = Muted)
            } else {
                Column(verticalArrangement = Arrangement.spacedBy(9.dp)) {
                    categories.forEach { (category, amount) -> SummaryMetric(category, amount, Ink) }
                }
            }
        },
        confirmButton = { TextButton(onClick = onDismiss) { Text("完成") } },
    )
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
