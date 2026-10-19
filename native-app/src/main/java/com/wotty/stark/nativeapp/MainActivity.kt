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
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.Image
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ColumnScope
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.RowScope
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
import androidx.compose.material.icons.filled.CloudDownload
import androidx.compose.material.icons.filled.CloudSync
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
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.rememberCoroutineScope
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
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import org.json.JSONArray
import org.json.JSONObject
import java.text.DecimalFormat
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.YearMonth
import android.graphics.BitmapFactory
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {
    @Suppress("DEPRECATION")
    private fun configureSystemBars() {
        // Keep Android's navigation gesture handle visible. The app draws edge-to-edge
        // behind it, while the bottom bar reserves the safe area for its touch targets.
        window.navigationBarColor = android.graphics.Color.TRANSPARENT
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.Q) {
            window.isNavigationBarContrastEnforced = false
        }
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.R) {
            window.setDecorFitsSystemWindows(false)
            // DecorView may not be attached during onCreate; defer controller access
            // until the window is attached to avoid a startup NPE on some Android 15 ROMs.
            window.decorView.post {
                window.insetsController?.let { controller ->
                    controller.show(android.view.WindowInsets.Type.navigationBars())
                    controller.setSystemBarsAppearance(
                        android.view.WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS or
                            android.view.WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS,
                        android.view.WindowInsetsController.APPEARANCE_LIGHT_STATUS_BARS or
                            android.view.WindowInsetsController.APPEARANCE_LIGHT_NAVIGATION_BARS,
                    )
                }
            }
        } else {
            window.decorView.systemUiVisibility = (
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE or
                    View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION or
                    View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN or
                    View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR or
                    View.SYSTEM_UI_FLAG_LIGHT_NAVIGATION_BAR
                )
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        configureSystemBars()
        setContent {
            StarkNativeTheme {
                StarkNativeApp()
            }
        }
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) configureSystemBars()
    }
}

private val Ink = Color(0xFF1F2937)
private val Muted = Color(0xFF7B8798)
private val Canvas = Color(0xFFF5F7FB)
private val Blue = Color(0xFF0869C6)
private val DeepBlue = Color(0xFF034F9F)
private val SoftBlue = Color(0xFFE6F1FF)
private val Green = Color(0xFF0A966B)
private val Red = Color(0xFFD94D5D)
private val Amber = Color(0xFFF0A329)
private val Line = Color(0xFFE8EDF3)
private val StarkFontFamily = FontFamily(Typeface.create("sans-serif", Typeface.NORMAL))

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
    API,
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

private fun LedgerEntry.isRepayment(): Boolean =
    type == EntryType.EXPENSE && (category.contains("还款") || title.contains("还款") || title.contains("贷款"))

private fun LedgerEntry.isSavings(): Boolean =
    type == EntryType.EXPENSE && (category.contains("储蓄") || category.contains("存款") || title.contains("储蓄") || title.contains("存款"))

private data class NativeLedgerSnapshot(
    val actualBalance: Double,
    val entries: List<LedgerEntry>,
)

private data class NativeHomePreferences(
    val selectedMonth: String,
    val salaryDay: Int,
    val monthlyBudget: Double,
)

private data class NativeApiPreferences(
    val baseUrl: String,
    val token: String,
    val accountId: String,
    val userId: String,
)

private data class NativeRemoteSnapshot(
    val entries: List<LedgerEntry>,
    val actualBalance: Double?,
)

private data class NativeBudget(val amount: Double, val category: String, val period: String)
private data class NativeAsset(val id: String, val name: String, val type: String, val balance: Double, val currency: String)
private data class NativeLoan(
    val id: String,
    val platform: String,
    val totalAmount: Double,
    val remainingAmount: Double,
    val monthlyPayment: Double,
    val dueDate: Int,
    val status: String,
)
private data class NativeSavingsGoal(
    val id: String,
    val name: String,
    val targetAmount: Double,
    val currentAmount: Double,
    val deadline: String,
    val depositType: String,
    val status: String,
)
private data class NativeSavingsPlan(
    val id: String,
    val goalId: String,
    val amount: Double,
    val actualAmount: Double?,
    val status: String,
    val month: String,
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

    fun loadApiPreferences(): NativeApiPreferences = NativeApiPreferences(
        baseUrl = preferences.getString("apiBaseUrl", "http://10.0.2.2:12367") ?: "http://10.0.2.2:12367",
        token = preferences.getString("apiToken", "") ?: "",
        accountId = preferences.getString("apiAccountId", "") ?: "",
        userId = preferences.getString("apiUserId", "") ?: "",
    )

    fun saveApiPreferences(baseUrl: String, token: String, accountId: String, userId: String) {
        preferences.edit()
            .putString("apiBaseUrl", baseUrl.trim().trimEnd('/'))
            .putString("apiToken", token.trim())
            .putString("apiAccountId", accountId.trim())
            .putString("apiUserId", userId.trim())
            .apply()
    }

    fun clearApiPreferences() {
        preferences.edit().remove("apiToken").remove("apiAccountId").apply()
    }
}

private class NativeApiClient {
    private val client = OkHttpClient.Builder().build()

    suspend fun login(baseUrl: String, email: String, password: String): NativeApiPreferences = withContext(Dispatchers.IO) {
        val body = JSONObject().put("email", email.trim()).put("password", password).toString()
        val request = Request.Builder()
            .url(baseUrl.trim().trimEnd('/') + "/api/auth/login")
            .post(body.toRequestBody("application/json".toMediaType()))
            .build()
        client.newCall(request).execute().use { response ->
            val payload = JSONObject(response.body?.string().orEmpty())
            if (!response.isSuccessful) throw IllegalStateException(payload.optString("error", "云端登录失败"))
            val user = payload.optJSONObject("user") ?: JSONObject()
            NativeApiPreferences(
                baseUrl = baseUrl.trim().trimEnd('/'),
                token = payload.getString("token"),
                accountId = user.optString("defaultAccountId", ""),
                userId = user.optString("id", ""),
            )
        }
    }

    suspend fun loadSnapshot(config: NativeApiPreferences): NativeRemoteSnapshot = withContext(Dispatchers.IO) {
        require(config.token.isNotBlank()) { "请先登录云端账户" }
        require(config.accountId.isNotBlank()) { "云端账户没有可用账本" }
        val request = Request.Builder()
            .url(config.baseUrl.trimEnd('/') + "/api/transactions?accountId=" + java.net.URLEncoder.encode(config.accountId, "UTF-8") + "&page=1&pageSize=500")
            .header("Authorization", "Bearer ${config.token}")
            .get()
            .build()
        client.newCall(request).execute().use { response ->
            val raw = response.body?.string().orEmpty()
            if (!response.isSuccessful) throw IllegalStateException(JSONObject(raw).optString("error", "云端流水读取失败"))
            val rows = JSONArray(raw)
            val entries = buildList {
                for (index in 0 until rows.length()) {
                    val row = rows.optJSONObject(index) ?: continue
                    val type = runCatching { EntryType.valueOf(row.optString("type", "EXPENSE")) }.getOrDefault(EntryType.EXPENSE)
                    val date = row.optString("date", LocalDate.now().toString()).take(10)
                    add(
                        LedgerEntry(
                            id = row.optString("id").hashCode().toLong(),
                            title = row.optString("merchant").ifBlank { row.optString("description").ifBlank { row.optString("category", "未命名流水") } },
                            category = row.optString("category", "未分类") + " · " + row.optString("platform", "云端"),
                            amount = row.optDouble("amount", 0.0),
                            type = type,
                            dayLabel = date,
                            transactionDate = date,
                        ),
                    )
                }
            }
            NativeRemoteSnapshot(entries = entries, actualBalance = null)
        }
    }

    suspend fun loadBalance(config: NativeApiPreferences): Double? = withContext(Dispatchers.IO) {
        val request = Request.Builder()
            .url(config.baseUrl.trimEnd('/') + "/api/assets?accountId=" + java.net.URLEncoder.encode(config.accountId, "UTF-8"))
            .header("Authorization", "Bearer ${config.token}")
            .get()
            .build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) return@withContext null
            val rows = JSONArray(response.body?.string().orEmpty())
            var total = 0.0
            for (index in 0 until rows.length()) total += rows.optJSONObject(index)?.optDouble("balance", 0.0) ?: 0.0
            total
        }
    }

    suspend fun loadAssets(config: NativeApiPreferences): List<NativeAsset> {
        val rows = getJsonArray(config, "/api/assets?accountId=" + java.net.URLEncoder.encode(config.accountId, "UTF-8"))
        return buildList {
            for (index in 0 until rows.length()) {
                val row = rows.optJSONObject(index) ?: continue
                add(
                    NativeAsset(
                        id = row.optString("id"),
                        name = row.optString("name", "未命名资产"),
                        type = row.optString("type", "OTHER"),
                        balance = row.optDouble("balance", 0.0),
                        currency = row.optString("currency", "CNY"),
                    ),
                )
            }
        }
    }

    private suspend fun getJsonArray(config: NativeApiPreferences, path: String): JSONArray = withContext(Dispatchers.IO) {
        val request = Request.Builder()
            .url(config.baseUrl.trimEnd('/') + path)
            .header("Authorization", "Bearer ${config.token}")
            .get()
            .build()
        client.newCall(request).execute().use { response ->
            val raw = response.body?.string().orEmpty()
            if (!response.isSuccessful) throw IllegalStateException(JSONObject(raw).optString("error", "云端数据读取失败"))
            JSONArray(raw)
        }
    }

    suspend fun loadBudgets(config: NativeApiPreferences): List<NativeBudget> = withContext(Dispatchers.IO) {
        val rows = getJsonArray(config, "/api/budgets?accountId=" + java.net.URLEncoder.encode(config.accountId, "UTF-8"))
        buildList { for (i in 0 until rows.length()) rows.optJSONObject(i)?.let { add(NativeBudget(it.optDouble("amount"), it.optString("category", "全局预算"), it.optString("period", "MONTHLY"))) } }
    }

    suspend fun loadLoans(config: NativeApiPreferences): List<NativeLoan> = withContext(Dispatchers.IO) {
        val rows = getJsonArray(config, "/api/loans?accountId=" + java.net.URLEncoder.encode(config.accountId, "UTF-8"))
        buildList {
            for (i in 0 until rows.length()) rows.optJSONObject(i)?.let {
                add(
                    NativeLoan(
                        id = it.optString("id"),
                        platform = it.optString("platform", "贷款"),
                        totalAmount = it.optDouble("totalAmount"),
                        remainingAmount = it.optDouble("remainingAmount"),
                        monthlyPayment = it.optDouble("monthlyPayment"),
                        dueDate = it.optInt("dueDate"),
                        status = it.optString("status", "ACTIVE"),
                    ),
                )
            }
        }
    }

    suspend fun loadSavingsGoals(config: NativeApiPreferences): List<NativeSavingsGoal> = withContext(Dispatchers.IO) {
        val rows = getJsonArray(config, "/api/savings-goals?accountId=" + java.net.URLEncoder.encode(config.accountId, "UTF-8"))
        buildList {
            for (i in 0 until rows.length()) rows.optJSONObject(i)?.let {
                add(
                    NativeSavingsGoal(
                        id = it.optString("id"),
                        name = it.optString("name", "储蓄计划"),
                        targetAmount = it.optDouble("targetAmount"),
                        currentAmount = it.optDouble("currentAmount"),
                        deadline = it.optString("deadline"),
                        depositType = it.optString("depositType", "PRIVATE"),
                        status = it.optString("status", "ACTIVE"),
                    ),
                )
            }
        }
    }

    suspend fun loadSavingsPlans(config: NativeApiPreferences, goalIds: List<String>): List<NativeSavingsPlan> {
        val result = mutableListOf<NativeSavingsPlan>()
        for (goalId in goalIds) {
            val rows = getJsonArray(config, "/api/savings-plans?goalId=" + java.net.URLEncoder.encode(goalId, "UTF-8"))
            for (index in 0 until rows.length()) {
                val row = rows.optJSONObject(index) ?: continue
                result += NativeSavingsPlan(
                    id = row.optString("id"),
                    goalId = row.optString("goalId", goalId),
                    amount = row.optDouble("amount", 0.0),
                    actualAmount = if (row.isNull("actualAmount")) null else row.optDouble("actualAmount"),
                    status = row.optString("status", "PENDING"),
                    month = row.optString("month"),
                )
            }
        }
        return result
    }

    suspend fun saveEntry(config: NativeApiPreferences, entry: LedgerEntry): Boolean = withContext(Dispatchers.IO) {
        val now = java.time.LocalDateTime.now().toString().replace('T', ' ')
        val payload = JSONObject()
            .put("id", "native-${entry.id}")
            .put("userId", config.userId)
            .put("accountId", config.accountId)
            .put("amount", entry.amount)
            .put("type", entry.type.name)
            .put("category", entry.category.substringBefore(" ·"))
            .put("platform", entry.category.substringAfter(" ·", "现金"))
            .put("merchant", entry.title)
            .put("date", "${entry.transactionDate} 12:00:00")
            .put("description", entry.title)
            .put("createdAt", now)
            .put("updatedAt", now)
        val request = Request.Builder()
            .url(config.baseUrl.trimEnd('/') + "/api/transactions")
            .header("Authorization", "Bearer ${config.token}")
            .post(payload.toString().toRequestBody("application/json".toMediaType()))
            .build()
        client.newCall(request).execute().use { it.isSuccessful }
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
        // Web uses Microsoft YaHei UI around 400/500. Android's medium
        // system face keeps Chinese glyphs from falling into an overly thin
        // fallback while the individual home styles still control hierarchy.
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
    val apiClient = remember { NativeApiClient() }
    val coroutineScope = rememberCoroutineScope()
    var apiPreferences by remember { mutableStateOf(ledgerStore.loadApiPreferences()) }
    var apiStatus by remember { mutableStateOf(if (apiPreferences.token.isBlank()) "未连接云端" else "正在同步…") }
    val homePreferences = remember { ledgerStore.loadHomePreferences() }
    var selectedMonth by remember { mutableStateOf(homePreferences.selectedMonth) }
    var salaryDay by remember { mutableStateOf(homePreferences.salaryDay) }
    var monthlyBudget by remember { mutableDoubleStateOf(homePreferences.monthlyBudget) }
    val snapshot = remember { ledgerStore.load() }
    var actualBalance by remember { mutableDoubleStateOf(snapshot.actualBalance) }
    val entries = remember { mutableStateListOf<LedgerEntry>().also { it.addAll(snapshot.entries) } }
    var refreshVersion by remember { mutableStateOf(0) }
    var remoteAssets by remember { mutableStateOf<List<NativeAsset>>(emptyList()) }
    var remoteBudgets by remember { mutableStateOf<List<NativeBudget>>(emptyList()) }
    var remoteLoans by remember { mutableStateOf<List<NativeLoan>>(emptyList()) }
    var remoteSavings by remember { mutableStateOf<List<NativeSavingsGoal>>(emptyList()) }
    var remoteSavingsPlans by remember { mutableStateOf<List<NativeSavingsPlan>>(emptyList()) }

    LaunchedEffect(apiPreferences.token, apiPreferences.baseUrl, apiPreferences.accountId, refreshVersion) {
        if (apiPreferences.token.isBlank()) {
            remoteAssets = emptyList()
            remoteBudgets = emptyList()
            remoteLoans = emptyList()
            remoteSavings = emptyList()
            remoteSavingsPlans = emptyList()
            apiStatus = "未连接云端"
            return@LaunchedEffect
        }
        apiStatus = "正在同步…"
        runCatching {
            val remote = apiClient.loadSnapshot(apiPreferences)
            val assets = apiClient.loadAssets(apiPreferences)
            val balance = apiClient.loadBalance(apiPreferences)
            val budgets = apiClient.loadBudgets(apiPreferences)
            val loans = apiClient.loadLoans(apiPreferences)
            val savings = apiClient.loadSavingsGoals(apiPreferences)
            val savingsPlans = apiClient.loadSavingsPlans(apiPreferences, savings.map { it.id })
            entries.clear()
            entries.addAll(remote.entries)
            remoteAssets = assets
            if (balance != null) actualBalance = balance
            remoteBudgets = budgets
            remoteLoans = loans
            remoteSavings = savings
            remoteSavingsPlans = savingsPlans
            apiStatus = "已同步 ${remote.entries.size} 笔"
        }.onFailure { error ->
            apiStatus = error.message ?: "云端同步失败"
        }
    }

    Scaffold(
        containerColor = Canvas,
        bottomBar = {
            NativeBottomBar(
                selectedTab = selectedTab,
                onTabSelected = { selectedTab = it },
                onAddEntry = { entrySheetOpen = true },
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
                    remoteBudgets = remoteBudgets,
                    remoteLoans = remoteLoans,
                    remoteSavings = remoteSavings,
                    remoteSavingsPlans = remoteSavingsPlans,
                    onSalaryDayClick = { homeOverlay = HomeOverlay.SALARY_DAY },
                    onOpenOverlay = { homeOverlay = it },
                    onSelectTab = { selectedTab = it },
                    apiStatus = apiStatus,
                )
                RootTab.CONSUMPTION -> ConsumptionScreen(
                    modifier = Modifier.padding(insets),
                    entries = entries,
                    month = selectedMonth,
                    onMonthClick = { homeOverlay = HomeOverlay.MONTH },
                    onSearch = { homeOverlay = HomeOverlay.SEARCH },
                )
                RootTab.SAVINGS -> SavingsOverviewScreen(
                    modifier = Modifier.padding(insets),
                    goals = remoteSavings,
                    plans = remoteSavingsPlans,
                    connected = apiPreferences.token.isNotBlank(),
                    onConnect = { homeOverlay = HomeOverlay.API },
                )
                RootTab.LOANS -> LoansOverviewScreen(
                    modifier = Modifier.padding(insets),
                    loans = remoteLoans,
                    connected = apiPreferences.token.isNotBlank(),
                    onConnect = { homeOverlay = HomeOverlay.API },
                )
                RootTab.ASSETS -> AssetsOverviewScreen(
                    modifier = Modifier.padding(insets),
                    assets = remoteAssets,
                    balance = actualBalance,
                    connected = apiPreferences.token.isNotBlank(),
                    onConnect = { homeOverlay = HomeOverlay.API },
                )
                RootTab.SETTINGS -> NativeSettingsScreen(
                    modifier = Modifier.padding(insets),
                    apiPreferences = apiPreferences,
                    apiStatus = apiStatus,
                    onOpenApi = { homeOverlay = HomeOverlay.API },
                    onRefresh = { refreshVersion += 1 },
                )
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
        HomeOverlay.API -> ApiLoginDialog(
            preferences = apiPreferences,
            status = apiStatus,
            onDismiss = { homeOverlay = null },
            onLogout = {
                ledgerStore.clearApiPreferences()
                apiPreferences = apiPreferences.copy(token = "", accountId = "", userId = "")
                apiStatus = "未连接云端"
                homeOverlay = null
            },
            onLogin = { baseUrl, email, password ->
                coroutineScope.launch {
                    runCatching { apiClient.login(baseUrl, email, password) }.onSuccess { config ->
                        ledgerStore.saveApiPreferences(config.baseUrl, config.token, config.accountId, config.userId)
                        apiPreferences = config
                        apiStatus = "正在同步…"
                        homeOverlay = null
                    }.onFailure { apiStatus = it.message ?: "登录失败" }
                }
            },
        )
        null -> Unit
    }

    if (entrySheetOpen) {
        QuickEntrySheet(
            onClose = { entrySheetOpen = false },
            onSave = { title, amount, type, category, platform ->
                entries.add(
                    0,
                    LedgerEntry(
                        id = System.nanoTime(),
                        title = title.ifBlank { if (type == EntryType.INCOME) "新增收入" else "新增支出" },
                        category = "$category · $platform",
                        amount = amount,
                        type = type,
                        dayLabel = "刚刚",
                    ),
                )
                actualBalance += if (type == EntryType.INCOME) amount else -amount
                ledgerStore.save(actualBalance, entries)
                if (apiPreferences.token.isNotBlank()) {
                    val saved = entries.firstOrNull()
                    if (saved != null) {
                        coroutineScope.launch {
                            runCatching { apiClient.saveEntry(apiPreferences, saved) }
                                .onFailure { apiStatus = "本地已保存，云端同步失败" }
                        }
                    }
                }
                entrySheetOpen = false
            },
        )
    }
}

@Composable
private fun NativeBottomBar(
    selectedTab: RootTab,
    onTabSelected: (RootTab) -> Unit,
    onAddEntry: () -> Unit,
) {
    // Keep the visible icon row at the Web height; the gesture safe-area is a separate white strip.
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color.White),
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(49.dp)
                .padding(horizontal = 4.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceAround,
        ) {
            RootTab.entries.take(3).forEach { tab ->
                NativeBottomTab(tab, selectedTab, onTabSelected)
            }
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxHeight()
                    .clip(RoundedCornerShape(14.dp))
                    .clickable(onClick = onAddEntry),
                contentAlignment = Alignment.Center,
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                    Icon(Icons.Default.Add, contentDescription = "记账", tint = Blue, modifier = Modifier.size(20.dp))
                    Text("记账", color = Blue, fontSize = 8.sp, fontWeight = FontWeight.Medium)
                }
            }
            RootTab.entries.drop(3).forEach { tab ->
                NativeBottomTab(tab, selectedTab, onTabSelected)
            }
        }
        // Pure white behind Android's visible gesture handle.
        Spacer(Modifier.fillMaxWidth().navigationBarsPadding())
    }
}

@Composable
private fun RowScope.NativeBottomTab(
    tab: RootTab,
    selectedTab: RootTab,
    onTabSelected: (RootTab) -> Unit,
) {
    val active = selectedTab == tab
    Box(
        modifier = Modifier
            .weight(1f)
            .fillMaxHeight()
            .clip(RoundedCornerShape(12.dp))
            .clickable { onTabSelected(tab) },
        contentAlignment = Alignment.Center,
    ) {
        WebNavIcon(
            resourceId = tab.iconResource,
            contentDescription = tab.label,
            active = active,
            modifier = Modifier.size(24.dp),
        )
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
    remoteBudgets: List<NativeBudget>,
    remoteLoans: List<NativeLoan>,
    remoteSavings: List<NativeSavingsGoal>,
    remoteSavingsPlans: List<NativeSavingsPlan>,
    onSalaryDayClick: () -> Unit,
    onOpenOverlay: (HomeOverlay) -> Unit,
    onSelectTab: (RootTab) -> Unit,
    apiStatus: String,
) {
    var metric by remember { mutableStateOf(HomeMetric.EXPENSE) }
    var balancePeriod by remember { mutableStateOf(BalancePeriod.MONTH) }
    val month = runCatching { YearMonth.parse(selectedMonth) }.getOrElse { YearMonth.now() }
    val selectedYear = selectedMonth.toIntOrNull()?.takeIf { selectedMonth.length == 4 }
    val periodEntries = entries.filter { entry ->
        val date = runCatching { LocalDate.parse(entry.transactionDate) }.getOrNull()
        date != null && if (selectedYear != null) {
            date.year == selectedYear
        } else if (metric == HomeMetric.BALANCE && balancePeriod == BalancePeriod.SALARY) {
            date >= month.atDay(salaryDay) && date < month.atDay(salaryDay).plusMonths(1)
        } else {
            date.year == month.year && date.monthValue == month.monthValue
        }
    }
    val income = periodEntries.filter { it.type == EntryType.INCOME }.sumOf { it.amount }
    val expense = periodEntries.filter { it.type == EntryType.EXPENSE }.sumOf { it.amount }
    val repayment = periodEntries.filter { it.isRepayment() }.sumOf { it.amount }
    val savings = periodEntries.filter { it.isSavings() }.sumOf { it.amount }
    val value = when (metric) {
        HomeMetric.BALANCE -> actualBalance
        HomeMetric.EXPENSE -> expense
        HomeMetric.INCOME -> income
    }
    val monthLabel = if (selectedYear != null) "${selectedYear}年" else "${month.year}年${month.monthValue}月"
    val label = when (metric) {
        HomeMetric.BALANCE -> "当前结余"
        HomeMetric.EXPENSE -> if (balancePeriod == BalancePeriod.SALARY) "本期支出" else "本月支出"
        HomeMetric.INCOME -> if (balancePeriod == BalancePeriod.SALARY) "本期收入" else "本月收入"
    }

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 8.dp, end = 8.dp, top = 0.dp, bottom = 70.dp),
        verticalArrangement = Arrangement.spacedBy(7.dp),
    ) {
        item { WebReplicaHeader(onSearch = { onOpenOverlay(HomeOverlay.SEARCH) }, onApi = { onOpenOverlay(HomeOverlay.API) }, apiStatus = apiStatus) }
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
        item { WebReplicaBudgetCard(income, expense, repayment, savings, actualBalance, monthlyBudget, remoteBudgets, monthLabel) { onOpenOverlay(HomeOverlay.BUDGET) } }
        item { WebReplicaDiagnosticBanner(income, expense, monthlyBudget, remoteBudgets) { onOpenOverlay(HomeOverlay.DIAGNOSTIC) } }
        item { WebReplicaCompass(income, expense, actualBalance, monthlyBudget, remoteLoans, remoteSavings, remoteSavingsPlans, onOpenOverlay, onSelectTab) }
        item { WebReplicaExpenseStructure(periodEntries, monthLabel) { onOpenOverlay(HomeOverlay.CATEGORIES) } }
        item { WebReplicaAdvisoryCard(income, expense, monthlyBudget, month) }
        item { WebReplicaCashflowTrend(entries, month, selectedYear) }
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
private fun WebReplicaAdvisoryCard(income: Double, expense: Double, monthlyBudget: Double, month: YearMonth) {
    val dailyExpense = expense / month.lengthOfMonth().toDouble()
    val healthy = income >= expense
    val remainingBudget = (if (monthlyBudget > 0) monthlyBudget else income) - expense
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
        AdvisoryRow("2", "剩余总预算 ¥ ${moneyFormat.format(remainingBudget.coerceAtLeast(0.0))}，建议将富余资金分配至储蓄计划。")
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
private fun WebReplicaCashflowTrend(entries: List<LedgerEntry>, selectedMonth: YearMonth, selectedYear: Int? = null) {
    val monthly = if (selectedYear != null) (1..12).map { YearMonth.of(selectedYear, it) } else (-4..0).map { selectedMonth.plusMonths(it.toLong()) }
    val monthlyValues = monthly.map { month ->
        val rows = entries.filter { runCatching { LocalDate.parse(it.transactionDate) }.getOrNull()?.let { date -> date.year == month.year && date.monthValue == month.monthValue } == true }
        rows.filter { it.type == EntryType.INCOME }.sumOf { it.amount } to rows.filter { it.type == EntryType.EXPENSE }.sumOf { it.amount }
    }
    WebReplicaCard(padding = 14.dp, radius = 22.dp) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column {
                Text("收支动态走势", color = Color(0xFF0F172A), fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
        Text("${monthly.first().monthValue}月-${monthly.last().monthValue}月真实流水", color = Color(0xFF94A3B8), fontSize = 10.sp)
            }
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                TrendLegend("收入", Color(0xFF38BDF8))
                TrendLegend("支出", Color(0xFFFB7185))
            }
        }
        Spacer(Modifier.height(8.dp))
        EChartsCashflowTrend(monthlyValues.map { it.first }, monthlyValues.map { it.second }, monthly.map { "${it.monthValue}月" })
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
    val visible = categories.take(4).toMutableList()
    val other = categories.drop(4).sumOf { it.second }
    if (other > 0) visible += "其他" to other
    val data = visible.mapIndexed { index, (name, amount) ->
        RoseChartSegment(name, amount, colors[index % colors.size])
    }
            Box(Modifier.fillMaxWidth().height(190.dp)) {
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
private fun EChartsCashflowTrend(incomes: List<Double>, expenses: List<Double>, labels: List<String>) {
    NativeCashflowChart(
        incomes = incomes,
        expenses = expenses,
        labels = labels,
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
private fun WebReplicaHeader(onSearch: () -> Unit, onApi: () -> Unit, apiStatus: String) {
    Row(
        modifier = Modifier.fillMaxWidth().height(30.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        Spacer(Modifier.size(26.dp))
        Text("首页", color = Color(0xFF101827), fontSize = 17.sp, fontWeight = FontWeight.Normal)
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
    WebReplicaCard(padding = 0.dp, radius = 20.dp) {
        Box(Modifier.fillMaxWidth().height(136.dp).padding(horizontal = 18.dp, vertical = 14.dp)) {
            Text(monthLabel.substringBefore("年").substringAfterLast("年"), modifier = Modifier.align(Alignment.TopEnd).offset(y = (-8).dp).alpha(.06f), color = Blue, fontSize = 72.sp, fontWeight = FontWeight.Black)
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
                Text("¥ " + moneyFormat.format(value), color = Color(0xFF0F172A), fontSize = 30.sp, fontWeight = FontWeight.SemiBold)
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
private fun WebReplicaBudgetCard(income: Double, expense: Double, repayment: Double, savings: Double, actualBalance: Double, monthlyBudget: Double, remoteBudgets: List<NativeBudget>, monthLabel: String, onManageBudget: () -> Unit) {
    val allocationIncome = if (monthlyBudget > 0.0) monthlyBudget else income
    val configuredBudget = remoteBudgets.filter { it.period == "MONTHLY" }.sumOf { it.amount }
    val allocationBase = if (configuredBudget > 0.0) configuredBudget else allocationIncome
    val allocated = expense + repayment + savings
    val available = allocationBase - allocated
    WebReplicaCard {
        Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(10.dp)).clickable(onClick = onManageBudget).padding(vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(28.dp).clip(RoundedCornerShape(8.dp)).background(Color(0xFFE2F3FF)), contentAlignment = Alignment.Center) {
                Icon(Icons.Default.Category, contentDescription = null, tint = Color(0xFF0060C0), modifier = Modifier.size(17.dp))
            }
            Spacer(Modifier.width(8.dp))
            Column(Modifier.weight(1f)) {
                Text(monthLabel + "资金分配", color = Ink, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                Text("收入扣除实际消费、还款和储蓄后的安排金额", color = Color(0xFF7B8CA3), fontSize = 9.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
            Text("预算管理  ›", color = Blue, fontSize = 10.sp, fontWeight = FontWeight.SemiBold)
        }
        Spacer(Modifier.height(12.dp))
        Row(Modifier.fillMaxWidth()) {
            BudgetAmount("可支配预算", available, "可继续安排 ¥ ${moneyFormat.format(available)}", Modifier.weight(1f))
            Box(Modifier.width(1.dp).height(64.dp).background(Line))
            BudgetAmount("收入", allocationBase, "已分配 ¥ ${moneyFormat.format(allocated)}", Modifier.weight(1f).padding(start = 14.dp))
        }
        Spacer(Modifier.height(11.dp))
        Box(Modifier.fillMaxWidth().height(7.dp).clip(CircleShape).background(Color(0xFFEAF0F7))) {
            if (allocationBase > 0) {
                Row(Modifier.fillMaxWidth().height(7.dp)) {
                    val denominator = allocationBase.coerceAtLeast(0.01)
                    if (expense > 0) Box(Modifier.fillMaxWidth((expense / denominator).toFloat().coerceIn(0f, 1f)).height(7.dp).background(Color(0xFF0EA5E9)))
                }
            }
        }
        Spacer(Modifier.height(10.dp))
        Row(Modifier.fillMaxWidth()) {
            BudgetSegment("消费", expense, Color(0xFF0EA5E9), Modifier.weight(1f))
            BudgetSegment("还款", repayment, Color(0xFFF59E0B), Modifier.weight(1f))
        }
        Spacer(Modifier.height(9.dp))
        Row(Modifier.fillMaxWidth()) {
            BudgetSegment("储蓄", savings, Color(0xFF10B981), Modifier.weight(1f))
            BudgetSegment("剩余", available, Blue, Modifier.weight(1f), blueValue = true)
        }
        HorizontalDivider(Modifier.padding(vertical = 11.dp), color = Line)
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
        Text("¥ ${moneyFormat.format(value)}", color = Ink, fontSize = 16.sp, fontWeight = FontWeight.SemiBold)
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
        Text("¥ ${moneyFormat.format(value)}", color = if (blueValue) Blue else Ink, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
    }
}

@Composable
private fun WebReplicaDiagnosticBanner(income: Double, expense: Double, monthlyBudget: Double, remoteBudgets: List<NativeBudget>, onOpen: () -> Unit) {
    val configuredBudget = remoteBudgets.filter { it.period == "MONTHLY" }.sumOf { it.amount }
    val warning = expense > income && income > 0
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(14.dp))
            .background(Color.White)
            .clickable(onClick = onOpen)
            .padding(horizontal = 14.dp, vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Box(Modifier.size(26.dp).clip(RoundedCornerShape(7.dp)).background(Color(0xFFEAF6FF)), contentAlignment = Alignment.Center) {
            Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Blue, modifier = Modifier.size(16.dp))
        }
        Spacer(Modifier.width(9.dp))
        Column(Modifier.weight(1f)) {
                Text("财务诊断", color = Ink, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                Text(if (warning || (monthlyBudget > 0 && expense > monthlyBudget) || (configuredBudget > 0 && expense > configuredBudget)) "本月支出偏高，建议关注预算" else "本月现金流平稳，无超支或临近违约风险", color = Color(0xFF64748B), fontSize = 10.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
        Text("查看  ›", color = Blue, fontSize = 11.sp, fontWeight = FontWeight.Medium)
    }
}

@Composable
private fun WebReplicaCompass(income: Double, expense: Double, actualBalance: Double, monthlyBudget: Double, remoteLoans: List<NativeLoan>, remoteSavings: List<NativeSavingsGoal>, remoteSavingsPlans: List<NativeSavingsPlan>, onOpenOverlay: (HomeOverlay) -> Unit, onSelectTab: (RootTab) -> Unit) {
    val netWorth = actualBalance
    val base = if (monthlyBudget > 0) monthlyBudget else income
    val usedPercent = if (base > 0) (expense / base * 100).toInt().coerceIn(0, 100) else 0
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            CompassTile("净资产", "¥ " + moneyFormat.format(netWorth), "账户当前余额", Green, Icons.Default.CheckCircle, Modifier.weight(1f)) { onSelectTab(RootTab.ASSETS) }
            CompassTile("预算余量", (100 - usedPercent).toString() + "%", "已用 " + usedPercent + "%", Blue, Icons.Default.PieChart, Modifier.weight(1f)) { onOpenOverlay(HomeOverlay.BUDGET) }
        }
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            val loan = remoteLoans.filter { it.status == "ACTIVE" }.sumOf { it.remainingAmount }
            val activeGoals = remoteSavings.filter { it.status == "ACTIVE" }
            val savingsTarget = activeGoals.sumOf { savingsGoalTarget(it, remoteSavingsPlans) }
            val savingsCurrent = activeGoals.sumOf { savingsGoalSaved(it, remoteSavingsPlans) }
            val savingsPercent = if (savingsTarget > 0) (savingsCurrent / savingsTarget * 100).coerceIn(0.0, 100.0) else 0.0
            CompassTile("待还贷款", if (loan > 0) "¥ ${moneyFormat.format(loan)}" else "无待还", if (loan > 0) "近期还款" else "状态良好", Red, Icons.Default.AccountBalanceWallet, Modifier.weight(1f)) { onSelectTab(RootTab.LOANS) }
            CompassTile("储蓄达成", "${percentLabel(savingsPercent)}%", if (remoteSavings.isEmpty()) "暂无计划" else "计划进行中", Amber, Icons.Default.Savings, Modifier.weight(1f)) { onSelectTab(RootTab.SAVINGS) }
        }
    }
}

@Composable
private fun CompassTile(label: String, value: String, badge: String, color: Color, icon: ImageVector, modifier: Modifier, onClick: () -> Unit) {
    WebReplicaCard(modifier = modifier.clickable(onClick = onClick), padding = 12.dp, radius = 16.dp) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(22.dp).clip(RoundedCornerShape(6.dp)).background(color.copy(alpha = .11f)), contentAlignment = Alignment.Center) {
                Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(14.dp))
            }
            Spacer(Modifier.width(6.dp))
            Text(label, color = Color(0xFF64748B), fontSize = 11.sp, fontWeight = FontWeight.Medium)
        }
        Spacer(Modifier.height(7.dp))
        Text(value, color = Ink, fontSize = 16.sp, fontWeight = FontWeight.SemiBold, maxLines = 1)
        Spacer(Modifier.height(4.dp))
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween, modifier = Modifier.fillMaxWidth()) {
            Text(badge, color = color, fontSize = 10.sp, fontWeight = FontWeight.Medium)
            Text("›", color = Color(0xFF9AA7B8), fontSize = 16.sp)
        }
    }
}

@Composable
private fun WebReplicaCard(modifier: Modifier = Modifier, padding: Dp = 13.dp, radius: Dp = 18.dp, content: @Composable ColumnScope.() -> Unit) {
    Card(
        modifier = modifier,
        shape = RoundedCornerShape(radius),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        border = BorderStroke(1.dp, Color(0xFFE7EDF3)),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
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
private fun ConsumptionScreen(
    modifier: Modifier,
    entries: List<LedgerEntry>,
    month: String,
    onMonthClick: () -> Unit,
    onSearch: () -> Unit,
) {
    var selectedType by remember { mutableStateOf("全部") }
    var selectedCategory by remember { mutableStateOf<String?>(null) }
    val monthEntries = entries.filter { it.transactionDate.startsWith(month) }
    val expenseEntries = monthEntries.filter { it.type == EntryType.EXPENSE }
    val incomeEntries = monthEntries.filter { it.type == EntryType.INCOME }
    val visibleEntries = when (selectedType) {
        "支出" -> monthEntries.filter { it.type == EntryType.EXPENSE }
        "收入" -> monthEntries.filter { it.type == EntryType.INCOME }
        else -> monthEntries
    }.let { rows -> if (selectedCategory == null) rows else rows.filter { it.category.substringBefore(" ·") == selectedCategory } }
    val categories = expenseEntries.groupBy { it.category.substringBefore(" ·") }
        .mapValues { (_, rows) -> rows.sumOf { it.amount } }
        .toList()
        .sortedByDescending { it.second }
    val expenseTotal = expenseEntries.sumOf { it.amount }
    val incomeTotal = incomeEntries.sumOf { it.amount }

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 18.dp, end = 18.dp, top = 8.dp, bottom = 104.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            Row(
                Modifier.fillMaxWidth().statusBarsPadding(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                Column {
                    Text("消费分析", color = Ink, fontSize = 23.sp, fontWeight = FontWeight.Black)
                    Text("按月份查看收支与账单", color = Muted, fontSize = 12.sp)
                }
                IconButton(onClick = onSearch) { Icon(Icons.Default.Search, contentDescription = "搜索账单", tint = Ink) }
            }
        }
        item {
            Row(
                Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                FilterChip(month, selected = true, onClick = onMonthClick)
                Text("${monthEntries.size} 笔账单", color = Muted, fontSize = 12.sp)
            }
        }
        item {
            WebReplicaCard(padding = 16.dp, radius = 20.dp) {
                Text("本月支出", color = Muted, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                Spacer(Modifier.height(4.dp))
                Text("¥ ${moneyFormat.format(expenseTotal)}", color = Ink, fontSize = 28.sp, fontWeight = FontWeight.Black)
                Spacer(Modifier.height(13.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    SummaryAmountCard("收入", incomeTotal, Green, Modifier.weight(1f))
                    SummaryAmountCard("支出笔数", expenseEntries.size.toDouble(), Blue, Modifier.weight(1f), integer = true)
                }
            }
        }
        item {
            WebReplicaCard(padding = 15.dp, radius = 18.dp) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column {
                        Text("支出分类", color = Ink, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                        Text("点击分类筛选账单", color = Muted, fontSize = 11.sp)
                    }
                    if (selectedCategory != null) TextButton(onClick = { selectedCategory = null }) { Text("清除筛选") }
                }
                Spacer(Modifier.height(8.dp))
                if (categories.isEmpty()) {
                    Text("这个月还没有支出记录", color = Muted, fontSize = 12.sp, modifier = Modifier.padding(vertical = 8.dp))
                } else {
                    categories.take(6).forEach { (name, amount) ->
                        CategoryAmountRow(
                            name = name,
                            amount = amount,
                            total = expenseTotal,
                            selected = selectedCategory == name,
                            onClick = { selectedCategory = if (selectedCategory == name) null else name },
                        )
                    }
                }
            }
        }
        item {
            Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("全部", "支出", "收入").forEach { option ->
                    FilterChip(option, selectedType == option) { selectedType = option }
                }
                if (selectedCategory != null) FilterChip(selectedCategory!!, true) { selectedCategory = null }
            }
        }
        if (visibleEntries.isEmpty()) {
            item {
                WebReplicaCard(padding = 22.dp) {
                    Text(if (selectedCategory != null) "这个分类没有匹配账单" else "这个月还没有账单", color = Ink, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    Text("记一笔后，收支和分类统计会显示在这里。", color = Muted, fontSize = 12.sp, modifier = Modifier.padding(top = 5.dp))
                }
            }
        } else {
            item {
                Text("账单明细", color = Ink, fontSize = 16.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 2.dp))
            }
            items(visibleEntries, key = { it.id }) { LedgerRow(it) }
        }
    }
}

@Composable
private fun SummaryAmountCard(label: String, value: Double, color: Color, modifier: Modifier, integer: Boolean = false) {
    Column(modifier.clip(RoundedCornerShape(13.dp)).background(color.copy(alpha = .07f)).padding(horizontal = 11.dp, vertical = 10.dp)) {
        Text(label, color = Muted, fontSize = 11.sp)
        Text(if (integer) "${value.toInt()} 笔" else "¥ ${moneyFormat.format(value)}", color = color, fontSize = 15.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun CategoryAmountRow(name: String, amount: Double, total: Double, selected: Boolean, onClick: () -> Unit) {
    val fraction = if (total <= 0.0) 0f else (amount / total).toFloat().coerceIn(0f, 1f)
    Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(10.dp)).clickable(onClick = onClick).background(if (selected) SoftBlue else Color.Transparent).padding(horizontal = 8.dp, vertical = 7.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
            Text(name, color = if (selected) Blue else Ink, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
            Text("¥ ${moneyFormat.format(amount)}  ${if (total > 0.0) "${(fraction * 100).toInt()}%" else ""}", color = Muted, fontSize = 11.sp)
        }
        Spacer(Modifier.height(5.dp))
        Box(Modifier.fillMaxWidth().height(5.dp).clip(CircleShape).background(Line)) {
            Box(Modifier.fillMaxWidth(fraction).height(5.dp).clip(CircleShape).background(if (selected) Blue else SoftBlue))
        }
    }
}

@Composable
private fun FilterChip(label: String, selected: Boolean, onClick: () -> Unit) {
    Text(
        label,
        modifier = Modifier.clip(RoundedCornerShape(18.dp)).background(if (selected) SoftBlue else Color.White)
            .clickable(onClick = onClick).padding(horizontal = 14.dp, vertical = 8.dp),
        color = if (selected) Blue else Muted,
        fontSize = 12.sp,
        fontWeight = FontWeight.Bold,
    )
}

@Composable
private fun SavingsOverviewScreen(modifier: Modifier, goals: List<NativeSavingsGoal>, plans: List<NativeSavingsPlan>, connected: Boolean, onConnect: () -> Unit) {
    val activeGoals = goals.filter { it.status == "ACTIVE" }
    val target = activeGoals.sumOf { savingsGoalTarget(it, plans) }
    val saved = activeGoals.sumOf { savingsGoalSaved(it, plans) }
    val progress = if (target <= 0.0) 0.0 else (saved / target * 100).coerceIn(0.0, 100.0)
    LazyColumn(modifier.fillMaxSize(), contentPadding = PaddingValues(start = 18.dp, end = 18.dp, top = 8.dp, bottom = 104.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { NativePageHeader("储蓄计划", "目标、累计存入与完成进度") }
        item {
            WebReplicaCard(padding = 17.dp, radius = 20.dp) {
                Text("累计存入", color = Muted, fontSize = 12.sp)
                Text("¥ ${moneyFormat.format(saved)}", color = Ink, fontSize = 27.sp, fontWeight = FontWeight.Black)
                Spacer(Modifier.height(12.dp))
                Box(Modifier.fillMaxWidth().height(7.dp).clip(CircleShape).background(Line)) {
                    Box(Modifier.fillMaxWidth((progress / 100).toFloat()).height(7.dp).clip(CircleShape).background(Green))
                }
                Spacer(Modifier.height(7.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("目标 ¥ ${moneyFormat.format(target)}", color = Muted, fontSize = 11.sp)
                    Text("${percentLabel(progress)}%", color = Green, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
        if (!connected) item { CloudConnectNotice("连接云端账本后查看储蓄目标", onConnect) }
        if (activeGoals.isEmpty()) {
            item {
                EmptyPageCard(
                    title = if (connected) "还没有活跃储蓄目标" else "尚无本地储蓄目标",
                    detail = "目标组和每月计划的原生编辑与存入记录正在接入。",
                )
            }
        } else {
            item { Text("目标组", color = Ink, fontSize = 16.sp, fontWeight = FontWeight.Bold) }
            items(activeGoals, key = { it.id }) { goal ->
                val goalTarget = savingsGoalTarget(goal, plans)
                val goalSaved = savingsGoalSaved(goal, plans)
                val goalProgress = if (goalTarget <= 0.0) 0.0 else (goalSaved / goalTarget * 100).coerceIn(0.0, 100.0)
                WebReplicaCard(padding = 15.dp, radius = 17.dp) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(goal.name, color = Ink, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                            Text("${depositTypeLabel(goal.depositType)}${goal.deadline.takeIf { it.isNotBlank() }?.let { " · 截止 $it" }.orEmpty()}", color = Muted, fontSize = 11.sp)
                        }
                        Text("${percentLabel(goalProgress)}%", color = Green, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }
                    Spacer(Modifier.height(10.dp))
                    Box(Modifier.fillMaxWidth().height(6.dp).clip(CircleShape).background(Line)) {
                        Box(Modifier.fillMaxWidth((goalProgress / 100).toFloat()).height(6.dp).clip(CircleShape).background(Green))
                    }
                    Spacer(Modifier.height(8.dp))
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("已存 ¥ ${moneyFormat.format(goalSaved)}", color = Muted, fontSize = 11.sp)
                        Text("目标 ¥ ${moneyFormat.format(goalTarget)}", color = Muted, fontSize = 11.sp)
                    }
                }
            }
        }
    }
}

@Composable
private fun LoansOverviewScreen(modifier: Modifier, loans: List<NativeLoan>, connected: Boolean, onConnect: () -> Unit) {
    val activeLoans = loans.filter { it.status == "ACTIVE" }
    val remaining = activeLoans.sumOf { it.remainingAmount }
    val monthly = activeLoans.sumOf { it.monthlyPayment }
    LazyColumn(modifier.fillMaxSize(), contentPadding = PaddingValues(start = 18.dp, end = 18.dp, top = 8.dp, bottom = 104.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { NativePageHeader("贷款管理", "待还余额、月供与还款日期") }
        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                OverviewMetricCard("待还总额", remaining, Modifier.weight(1f), Red)
                OverviewMetricCard("每月月供", monthly, Modifier.weight(1f), Blue)
            }
        }
        if (!connected) item { CloudConnectNotice("连接云端账本后查看贷款", onConnect) }
        if (activeLoans.isEmpty()) {
            item { EmptyPageCard(if (connected) "还没有进行中的贷款" else "尚无本地贷款", "贷款新增、编辑和还款登记正在接入原生页面。") }
        } else {
            item { Text("贷款明细", color = Ink, fontSize = 16.sp, fontWeight = FontWeight.Bold) }
            items(activeLoans, key = { it.id }) { loan ->
                WebReplicaCard(padding = 15.dp, radius = 17.dp) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(loan.platform, color = Ink, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                            Text(if (loan.dueDate > 0) "每月 ${loan.dueDate} 日还款" else "还款日期未设置", color = Muted, fontSize = 11.sp)
                        }
                        Text("剩余 ¥ ${moneyFormat.format(loan.remainingAmount)}", color = Red, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    }
                    HorizontalDivider(Modifier.padding(vertical = 10.dp), color = Line)
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                        Text("原始金额 ¥ ${moneyFormat.format(loan.totalAmount)}", color = Muted, fontSize = 11.sp)
                        Text("月供 ¥ ${moneyFormat.format(loan.monthlyPayment)}", color = Blue, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
}

@Composable
private fun AssetsOverviewScreen(modifier: Modifier, assets: List<NativeAsset>, balance: Double, connected: Boolean, onConnect: () -> Unit) {
    val total = assets.sumOf { it.balance }
    LazyColumn(modifier.fillMaxSize(), contentPadding = PaddingValues(start = 18.dp, end = 18.dp, top = 8.dp, bottom = 104.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { NativePageHeader("资产总览", "账户余额与资金配置") }
        item {
            WebReplicaCard(padding = 17.dp, radius = 20.dp) {
                Text("资产总额", color = Muted, fontSize = 12.sp)
                Text("¥ ${moneyFormat.format(if (assets.isEmpty()) balance else total)}", color = Ink, fontSize = 27.sp, fontWeight = FontWeight.Black)
                Text(if (connected) "${assets.size} 个资产账户" else "当前显示设备上的账本余额", color = Muted, fontSize = 11.sp, modifier = Modifier.padding(top = 4.dp))
            }
        }
        if (!connected) item { CloudConnectNotice("连接云端账本后同步资产账户", onConnect) }
        if (assets.isEmpty()) {
            item { EmptyPageCard(if (connected) "还没有资产账户" else "资产明细尚未接入本地账本", "资产新增、编辑和余额校正正在接入原生页面。") }
        } else {
            item { Text("资产账户", color = Ink, fontSize = 16.sp, fontWeight = FontWeight.Bold) }
            items(assets, key = { it.id }) { asset ->
                WebReplicaCard(padding = 14.dp, radius = 16.dp) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(asset.name, color = Ink, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                            Text(assetTypeLabel(asset.type), color = Muted, fontSize = 11.sp)
                        }
                        Text("${currencySymbol(asset.currency)} ${moneyFormat.format(asset.balance)}", color = Blue, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
private fun NativeSettingsScreen(
    modifier: Modifier,
    apiPreferences: NativeApiPreferences,
    apiStatus: String,
    onOpenApi: () -> Unit,
    onRefresh: () -> Unit,
) {
    LazyColumn(modifier.fillMaxSize(), contentPadding = PaddingValues(start = 18.dp, end = 18.dp, top = 8.dp, bottom = 104.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { NativePageHeader("设置", "账本连接与应用信息") }
        item {
            WebReplicaCard(padding = 15.dp, radius = 18.dp) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text("云端账本", color = Ink, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                        Text(apiStatus, color = if (apiPreferences.token.isBlank()) Muted else Green, fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp))
                        if (apiPreferences.token.isNotBlank()) {
                            Text(apiPreferences.baseUrl, color = Muted, fontSize = 10.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                        }
                    }
                    Icon(Icons.Default.CloudSync, contentDescription = null, tint = Blue, modifier = Modifier.size(22.dp))
                }
                Row(Modifier.fillMaxWidth().padding(top = 8.dp), horizontalArrangement = Arrangement.End) {
                    TextButton(onClick = onRefresh, enabled = apiPreferences.token.isNotBlank()) { Text("刷新数据") }
                    TextButton(onClick = onOpenApi) { Text(if (apiPreferences.token.isBlank()) "连接账本" else "账号设置") }
                }
            }
        }
        item {
            WebReplicaCard(padding = 15.dp, radius = 18.dp) {
                Text("纯 KT 原生版", color = Ink, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Text("Kotlin + Jetpack Compose · ${BuildConfig.VERSION_NAME}", color = Muted, fontSize = 11.sp, modifier = Modifier.padding(top = 5.dp))
                Text("本地账本和更多设置项正在逐步接入。", color = Muted, fontSize = 11.sp, modifier = Modifier.padding(top = 3.dp))
            }
        }
    }
}

@Composable
private fun NativePageHeader(title: String, subtitle: String) {
    Column(Modifier.fillMaxWidth().statusBarsPadding().padding(bottom = 3.dp)) {
        Text(title, color = Ink, fontSize = 23.sp, fontWeight = FontWeight.Black)
        Text(subtitle, color = Muted, fontSize = 12.sp, modifier = Modifier.padding(top = 3.dp))
    }
}

@Composable
private fun OverviewMetricCard(label: String, amount: Double, modifier: Modifier, color: Color) {
    WebReplicaCard(modifier = modifier, padding = 13.dp, radius = 17.dp) {
        Text(label, color = Muted, fontSize = 11.sp)
        Text("¥ ${moneyFormat.format(amount)}", color = color, fontSize = 16.sp, fontWeight = FontWeight.Bold, maxLines = 1)
    }
}

@Composable
private fun CloudConnectNotice(text: String, onConnect: () -> Unit) {
    WebReplicaCard(padding = 14.dp, radius = 16.dp) {
        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
            Text(text, color = Muted, fontSize = 11.sp, modifier = Modifier.weight(1f))
            TextButton(onClick = onConnect) { Text("连接") }
        }
    }
}

@Composable
private fun EmptyPageCard(title: String, detail: String) {
    WebReplicaCard(padding = 18.dp, radius = 16.dp) {
        Text(title, color = Ink, fontSize = 14.sp, fontWeight = FontWeight.Bold)
        Text(detail, color = Muted, fontSize = 11.sp, modifier = Modifier.padding(top = 5.dp))
    }
}

private fun depositTypeLabel(value: String): String = when (value) {
    "CASH" -> "现金储蓄"
    "HELP_DEPOSIT" -> "代存"
    "FIXED_TERM" -> "定期存款"
    else -> "个人储蓄"
}

private fun assetTypeLabel(value: String): String = when (value) {
    "CASH" -> "现金"
    "BANK_CARD" -> "银行卡"
    "ALIPAY" -> "支付宝"
    "WECHAT" -> "微信"
    "INVESTMENT" -> "投资"
    else -> "其他资产"
}

private fun currencySymbol(value: String): String = when (value.uppercase()) {
    "CNY" -> "¥"
    "USD" -> "$"
    "EUR" -> "€"
    "JPY" -> "¥"
    else -> value.uppercase()
}

private fun savingsPlanRecordedAmount(plan: NativeSavingsPlan): Double {
    if (plan.status != "COMPLETED") return 0.0
    return (plan.actualAmount ?: plan.amount).coerceAtLeast(0.0)
}

private fun savingsGoalSaved(goal: NativeSavingsGoal, plans: List<NativeSavingsPlan>): Double {
    val recorded = plans.asSequence().filter { it.goalId == goal.id }.sumOf(::savingsPlanRecordedAmount)
    return maxOf(goal.currentAmount, recorded)
}

private fun savingsGoalTarget(goal: NativeSavingsGoal, plans: List<NativeSavingsPlan>): Double {
    if (goal.targetAmount > 0.0) return goal.targetAmount
    return plans.asSequence().filter { it.goalId == goal.id }.sumOf { it.amount.coerceAtLeast(0.0) }
}

private fun percentLabel(value: Double): String =
    value.toBigDecimal().setScale(2, java.math.RoundingMode.HALF_UP).stripTrailingZeros().toPlainString()

@Composable
private fun MonthPickerDialog(
    selectedMonth: String,
    onSelect: (String) -> Unit,
    onDismiss: () -> Unit,
) {
    val selectedYearValue = selectedMonth.toIntOrNull()?.takeIf { selectedMonth.length == 4 }
    val selected = if (selectedYearValue != null) {
        YearMonth.of(selectedYearValue, 1)
    } else {
        runCatching { YearMonth.parse(selectedMonth) }.getOrElse { YearMonth.now() }
    }
    var visibleYear by remember(selected.year) { mutableStateOf(selected.year) }
    val months = (1..12).toList()

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false),
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0x590F172A))
                .clickable(onClick = onDismiss),
            contentAlignment = Alignment.BottomCenter,
        ) {
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .widthIn(max = 430.dp)
                    .padding(horizontal = 12.dp, vertical = 20.dp)
                    .clickable { /* consume taps inside the sheet */ },
                shape = RoundedCornerShape(24.dp),
                color = Color(0xFFFAFCFF),
                shadowElevation = 8.dp,
            ) {
                Column(Modifier.padding(horizontal = 18.dp, vertical = 16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.Top,
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        Column {
                            Text("统计范围", color = Muted, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                            Spacer(Modifier.height(2.dp))
                            Text("选择月份", color = Ink, fontSize = 22.sp, fontWeight = FontWeight.Black)
                        }
                        IconButton(onClick = onDismiss, modifier = Modifier.size(34.dp)) {
                            Icon(Icons.Default.Close, contentDescription = "关闭月份选择", tint = Muted)
                        }
                    }

                    Spacer(Modifier.height(14.dp))
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(14.dp))
                            .background(Color(0xFFF1F5F9))
                            .padding(horizontal = 4.dp, vertical = 3.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween,
                    ) {
                        IconButton(
                            onClick = { visibleYear = (visibleYear - 1).coerceAtLeast(1900) },
                            enabled = visibleYear > 1900,
                            modifier = Modifier.size(38.dp),
                        ) {
                            Text("‹", color = if (visibleYear > 1900) Ink else Muted, fontSize = 25.sp, textAlign = TextAlign.Center)
                        }
                        Text(visibleYear.toString() + "年", color = Ink, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                        IconButton(
                            onClick = { visibleYear = (visibleYear + 1).coerceAtMost(2100) },
                            enabled = visibleYear < 2100,
                            modifier = Modifier.size(38.dp),
                        ) {
                            Text("›", color = if (visibleYear < 2100) Ink else Muted, fontSize = 25.sp, textAlign = TextAlign.Center)
                        }
                    }

                    Spacer(Modifier.height(10.dp))
                    val selectedYear = selectedYearValue == visibleYear
                    Text(
                        "全年",
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(12.dp))
                            .background(if (selectedYear) Blue else Color(0xFFF1F5F9))
                            .clickable { onSelect(visibleYear.toString()) }
                            .padding(vertical = 11.dp),
                        color = if (selectedYear) Color.White else Ink,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.SemiBold,
                        textAlign = TextAlign.Center,
                    )

                    Spacer(Modifier.height(10.dp))
                    months.chunked(4).forEach { rowMonths ->
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                        ) {
                            rowMonths.forEach { month ->
                                val key = "%04d-%02d".format(visibleYear, month)
                                val isSelected = key == selectedMonth
                                Text(
                                    month.toString() + "月",
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(if (isSelected) Blue else Color(0xFFF1F5F9))
                                        .clickable { onSelect(key) }
                                        .padding(vertical = 12.dp),
                                    color = if (isSelected) Color.White else Ink,
                                    fontSize = 13.sp,
                                    fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Medium,
                                    textAlign = TextAlign.Center,
                                )
                            }
                        }
                        Spacer(Modifier.height(8.dp))
                    }

                    TextButton(
                        onClick = onDismiss,
                        modifier = Modifier.fillMaxWidth(),
                    ) {
                        Text("取消", color = Blue, fontSize = 14.sp, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }
    }
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
        shape = RoundedCornerShape(26.dp),
        containerColor = Color(0xFFFBFCFE),
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
        shape = RoundedCornerShape(26.dp),
        containerColor = Color(0xFFFBFCFE),
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
        shape = RoundedCornerShape(26.dp),
        containerColor = Color(0xFFFBFCFE),
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
        shape = RoundedCornerShape(26.dp),
        containerColor = Color(0xFFFBFCFE),
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

@Composable
private fun ApiLoginDialog(
    preferences: NativeApiPreferences,
    status: String,
    onDismiss: () -> Unit,
    onLogout: () -> Unit,
    onLogin: (String, String, String) -> Unit,
) {
    var baseUrl by remember(preferences.baseUrl) { mutableStateOf(preferences.baseUrl) }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    AlertDialog(
        onDismissRequest = onDismiss,
        shape = RoundedCornerShape(26.dp),
        containerColor = Color(0xFFFBFCFE),
        title = { Text("云端数据", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text("接入 API 后，首页会读取云端真实流水和账户资产。", color = Muted, fontSize = 12.sp, lineHeight = 18.sp)
                OutlinedTextField(value = baseUrl, onValueChange = { baseUrl = it }, label = { Text("API 地址") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("邮箱") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = password, onValueChange = { password = it }, label = { Text("密码") }, singleLine = true, modifier = Modifier.fillMaxWidth(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password))
                Text(status, color = if (status.startsWith("已同步")) Green else Muted, fontSize = 11.sp)
            }
        },
        dismissButton = {
            Row {
                if (preferences.token.isNotBlank()) TextButton(onClick = onLogout) { Text("退出云端", color = Red) }
                TextButton(onClick = onDismiss) { Text("取消") }
            }
        },
        confirmButton = {
            TextButton(onClick = { if (baseUrl.isNotBlank() && email.isNotBlank() && password.isNotBlank()) onLogin(baseUrl, email, password) }) { Text("登录并同步") }
        },
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun QuickEntrySheet(onClose: () -> Unit, onSave: (String, Double, EntryType, String, String) -> Unit) {
    var type by remember { mutableStateOf(EntryType.EXPENSE) }
    var title by remember { mutableStateOf("") }
    var amountText by remember { mutableStateOf("") }
    var category by remember { mutableStateOf("日常消费") }
    var platform by remember { mutableStateOf("现金") }
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)

    ModalBottomSheet(
        onDismissRequest = onClose,
        sheetState = sheetState,
        containerColor = Color(0xFFFBFCFE),
        dragHandle = { Box(Modifier.padding(top = 10.dp).width(36.dp).height(4.dp).clip(CircleShape).background(Color(0xFFD7DFEA))) },
    ) {
        Column(Modifier.fillMaxWidth().padding(start = 22.dp, end = 22.dp, bottom = 32.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Column {
                    Text("记一笔", color = Ink, fontWeight = FontWeight.Black, fontSize = 23.sp)
                    Text("记录真实的收入或支出，保存后立即更新余额", color = Muted, fontSize = 11.sp)
                }
                IconButton(onClick = onClose) { Icon(Icons.Default.Close, contentDescription = "关闭", tint = Muted) }
            }
            Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(Color(0xFFEAF0F7)).padding(4.dp)) {
                EntryType.entries.forEach { item ->
                    val selected = item == type
                    Text(
                        item.label,
                        modifier = Modifier.weight(1f).clip(RoundedCornerShape(14.dp)).background(if (selected) Color.White else Color.Transparent).clickable { type = item }.padding(vertical = 12.dp),
                        textAlign = TextAlign.Center,
                        color = if (selected) item.color else Muted,
                        fontWeight = FontWeight.Bold,
                        fontSize = 14.sp,
                    )
                }
            }
            NativeInput(label = "备注", value = title, onValueChange = { title = it }, placeholder = "例如：晚餐、工资")
            NativeInput(label = "金额", value = amountText, onValueChange = { amountText = it.filter { char -> char.isDigit() || char == '.' } }, placeholder = "0.00", isAmount = true)
            Text("分类", color = Ink, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            ChoiceRow(listOf("日常消费", "餐饮美食", "交通出行", "购物消费", "工资收入"), category) { category = it }
            Text("账户 / 平台", color = Ink, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            ChoiceRow(listOf("现金", "银行卡", "微信", "支付宝"), platform) { platform = it }
            val amount = amountText.toDoubleOrNull() ?: 0.0
            Text(
                text = if (amount > 0) "保存 ¥ ${moneyFormat.format(amount)}" else "请输入金额",
                modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(if (amount > 0) type.color else Color(0xFFCCD5E2)).clickable(enabled = amount > 0) { onSave(title, amount, type, if (type == EntryType.INCOME) "工资收入" else category, platform) }.padding(vertical = 16.dp),
                textAlign = TextAlign.Center,
                color = Color.White,
                fontWeight = FontWeight.Black,
                fontSize = 15.sp,
            )
        }
    }
}

@Composable
private fun ChoiceRow(options: List<String>, selected: String, onSelect: (String) -> Unit) {
    Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        options.forEach { option ->
            Text(
                option,
                modifier = Modifier
                    .clip(RoundedCornerShape(12.dp))
                    .background(if (selected == option) SoftBlue else Color.White)
                    .clickable { onSelect(option) }
                    .padding(horizontal = 12.dp, vertical = 9.dp),
                color = if (selected == option) Blue else Muted,
                fontSize = 11.sp,
                fontWeight = if (selected == option) FontWeight.Bold else FontWeight.Medium,
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
