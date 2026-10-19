package com.wotty.stark.nativeapp

import android.os.Bundle
import android.os.Build
import android.content.Context
import android.graphics.Typeface
import android.net.Uri
import android.provider.OpenableColumns
import android.util.Base64
import android.view.View
import java.io.ByteArrayOutputStream
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
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
import androidx.compose.foundation.layout.heightIn
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
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Edit
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
import androidx.compose.material3.TextButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableDoubleStateOf
import androidx.compose.runtime.mutableStateListOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.rotate
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
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.time.YearMonth
import java.util.Locale
import java.util.UUID
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

internal enum class EntryType(val label: String, val color: Color) {
    EXPENSE("支出", Red),
    INCOME("收入", Green),
    TRANSFER("转账", Amber),
    REPAYMENT("还款", Red),
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

internal data class LedgerEntry(
    val id: String,
    val title: String,
    val category: String,
    val amount: Double,
    val type: EntryType,
    val dayLabel: String,
    val transactionDate: String = LocalDate.now().toString(),
    val date: String = transactionDate,
    val merchant: String = "",
    val description: String = "",
    val platform: String = "现金",
    val orderId: String? = null,
    val paymentMethod: String? = null,
    val status: String? = null,
    val loanId: String? = null,
    val remarkCategory: String? = null,
    val userId: String = "",
    val accountId: String = "",
    val createdAt: String = "",
    val updatedAt: String = "",
)

private fun LedgerEntry.isRepayment(): Boolean =
    type == EntryType.REPAYMENT || (type == EntryType.EXPENSE && (category.contains("还款") || title.contains("还款") || title.contains("贷款")))

private fun LedgerEntry.analysisType(): EntryType =
    if (!remarkCategory.isNullOrBlank()) EntryType.EXPENSE else type

private fun LedgerEntry.analysisCategory(): String =
    remarkCategory?.trim()?.takeIf(String::isNotEmpty) ?: category.substringBefore(" ·")

private fun LedgerEntry.balanceChange(): Double = when (analysisType()) {
    EntryType.INCOME -> amount
    EntryType.EXPENSE, EntryType.REPAYMENT -> -amount
    EntryType.TRANSFER -> 0.0
}

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

internal data class NativeApiPreferences(
    val baseUrl: String,
    val token: String,
    val accountId: String,
    val userId: String,
)

private data class NativeRemoteSnapshot(
    val entries: List<LedgerEntry>,
    val actualBalance: Double?,
)

private const val NATIVE_EMULATOR_API_BASE_URL = "http://10.0.2.2:12367"

private fun isNativeAndroidEmulator(): Boolean =
    Build.FINGERPRINT.startsWith("generic", ignoreCase = true) ||
        Build.MODEL.contains("Emulator", ignoreCase = true) ||
        Build.HARDWARE.contains("goldfish", ignoreCase = true) ||
        Build.HARDWARE.contains("ranchu", ignoreCase = true)

private fun defaultNativeApiBaseUrl(): String =
    if (isNativeAndroidEmulator()) NATIVE_EMULATOR_API_BASE_URL else ""

private data class NativeBudget(val amount: Double, val category: String, val period: String)
internal data class NativeLoan(
    val id: String,
    val platform: String,
    val totalAmount: Double,
    val remainingAmount: Double,
    val monthlyPayment: Double,
    val dueDate: Int,
    val status: String,
    val periods: Int = 12,
    val paidPeriods: Int = 0,
    val matchKeywords: String? = null,
    val userId: String = "",
    val accountId: String = "",
    val createdAt: String = "",
    val updatedAt: String = "",
)

private fun JSONObject.toNativeLoan(accountIdFallback: String = ""): NativeLoan = NativeLoan(
    id = optString("id"),
    platform = optString("platform", "贷款").ifBlank { "贷款" },
    totalAmount = optDouble("totalAmount", 0.0).takeIf(Double::isFinite) ?: 0.0,
    remainingAmount = optDouble("remainingAmount", 0.0).takeIf(Double::isFinite) ?: 0.0,
    monthlyPayment = optDouble("monthlyPayment", 0.0).takeIf(Double::isFinite) ?: 0.0,
    dueDate = optInt("dueDate", 20).coerceIn(1, 31),
    status = optString("status", "ACTIVE").ifBlank { "ACTIVE" },
    periods = optInt("periods", 12).coerceAtLeast(1),
    paidPeriods = optInt("paidPeriods", 0).coerceAtLeast(0),
    matchKeywords = if (isNull("matchKeywords")) null else optString("matchKeywords").takeIf { it.isNotBlank() && it != "null" },
    userId = optString("userId"),
    accountId = optString("accountId").ifBlank { accountIdFallback },
    createdAt = optString("createdAt"),
    updatedAt = optString("updatedAt"),
)

private fun NativeLoan.toPayload(): JSONObject = JSONObject()
    .put("id", id)
    .put("userId", userId)
    .put("accountId", accountId)
    .put("platform", platform)
    .put("totalAmount", totalAmount)
    .put("remainingAmount", remainingAmount)
    .put("periods", periods)
    .put("paidPeriods", paidPeriods)
    .put("monthlyPayment", monthlyPayment)
    .put("dueDate", dueDate)
    .put("status", status)
    .put("matchKeywords", matchKeywords ?: JSONObject.NULL)
    .put("createdAt", createdAt)
    .put("updatedAt", updatedAt)
private class NativeLedgerStore(context: Context) {
    private val preferences = context.getSharedPreferences("native-ledger", Context.MODE_PRIVATE)
    private val database = NativeEntityDatabase(context.applicationContext)

    fun load(scope: String = "LOCAL", accountId: String = "local"): NativeLedgerSnapshot {
        val cacheKey = "entries_${scope}_$accountId"
        val balanceKey = "actualBalance_${scope}_$accountId"
        val persisted = database.readAll(scope, accountId, "transactions")
        val legacyJson = if (scope == "LOCAL") {
            preferences.getString(cacheKey, null) ?: preferences.getString("entries", null)
        } else {
            preferences.getString(cacheKey, null)
        }
        val entries = when {
            persisted.isNotEmpty() -> persisted.mapNotNull(::parseEntry)
            legacyJson != null -> parseEntryArray(legacyJson).also { migrated ->
                if (migrated.isNotEmpty()) {
                    database.replaceAll(scope, accountId, "transactions", migrated.map(::storedEntry))
                }
            }
            scope == "LOCAL" -> sampleEntries()
            else -> emptyList()
        }
        val storedBalance = preferences.getString(balanceKey, null)
            ?: if (scope == "LOCAL") preferences.getString("actualBalance", "916.35") else "0"
        return NativeLedgerSnapshot(storedBalance?.toDoubleOrNull() ?: 0.0, entries)
    }

    fun save(scope: String, accountId: String, actualBalance: Double, entries: List<LedgerEntry>) {
        val rows = JSONArray()
        entries.forEach { rows.put(entryJson(it)) }
        database.replaceAll(scope, accountId, "transactions", entries.map(::storedEntry))
        val editor = preferences.edit()
            .putString("actualBalance_${scope}_$accountId", actualBalance.toString())
            .putString("entries_${scope}_$accountId", rows.toString())
        if (scope == "LOCAL") {
            editor.putString("actualBalance", actualBalance.toString())
                .putString("entries", rows.toString())
        }
        editor.apply()
    }

    fun loadAssets(scope: String, accountId: String): List<NativeAsset> =
        database.readAll(scope, accountId, "assets").mapNotNull { raw ->
            runCatching { JSONObject(raw).toNativeAsset(accountId) }.getOrNull()
        }

    fun saveAssetsState(scope: String, accountId: String, assets: List<NativeAsset>) {
        database.replaceAll(scope, accountId, "assets", assets.map { asset ->
            NativeStoredEntity(asset.id, asset.toPayload().toString(), asset.updatedAt)
        })
    }

    fun saveAsset(scope: String, accountId: String, asset: NativeAsset) {
        database.upsert(scope, accountId, "assets", NativeStoredEntity(asset.id, asset.toPayload().toString(), asset.updatedAt))
    }

    fun deleteAsset(scope: String, accountId: String, assetId: String) {
        database.delete(scope, accountId, "assets", assetId)
    }

    fun loadSubscriptions(scope: String, accountId: String): List<NativeSubscription> =
        database.readAll(scope, accountId, "subscriptions").mapNotNull { raw ->
            runCatching { JSONObject(raw).toNativeSubscription(accountId) }.getOrNull()
        }

    fun saveSubscriptionsState(scope: String, accountId: String, subscriptions: List<NativeSubscription>) {
        database.replaceAll(scope, accountId, "subscriptions", subscriptions.map { subscription ->
            NativeStoredEntity(subscription.id, subscription.toPayload().toString(), subscription.updatedAt)
        })
    }

    fun saveSubscription(scope: String, accountId: String, subscription: NativeSubscription) {
        database.upsert(scope, accountId, "subscriptions", NativeStoredEntity(subscription.id, subscription.toPayload().toString(), subscription.updatedAt))
    }

    fun deleteSubscription(scope: String, accountId: String, subscriptionId: String) {
        database.delete(scope, accountId, "subscriptions", subscriptionId)
    }

    fun loadCategoryRules(scope: String, accountId: String): List<NativeCategoryRule> =
        database.readAll(scope, accountId, "categoryRules").mapNotNull { raw ->
            runCatching { JSONObject(raw).toNativeCategoryRule(accountId) }.getOrNull()
        }

    fun saveCategoryRulesState(scope: String, accountId: String, rules: List<NativeCategoryRule>) {
        database.replaceAll(scope, accountId, "categoryRules", rules.map { rule ->
            NativeStoredEntity(rule.id, rule.toPayload().toString(), rule.updatedAt)
        })
    }

    fun saveCategoryRule(scope: String, accountId: String, rule: NativeCategoryRule) {
        database.upsert(scope, accountId, "categoryRules", NativeStoredEntity(rule.id, rule.toPayload().toString(), rule.updatedAt))
    }

    fun deleteCategoryRule(scope: String, accountId: String, ruleId: String) {
        database.delete(scope, accountId, "categoryRules", ruleId)
    }

    fun loadLoans(scope: String, accountId: String): List<NativeLoan> =
        database.readAll(scope, accountId, "loans").mapNotNull { raw ->
            runCatching { JSONObject(raw).toNativeLoan(accountId) }.getOrNull()
        }

    fun saveLoansState(scope: String, accountId: String, loans: List<NativeLoan>) {
        database.replaceAll(scope, accountId, "loans", loans.map { NativeStoredEntity(it.id, it.toPayload().toString(), it.updatedAt) })
    }

    fun saveLoan(scope: String, accountId: String, loan: NativeLoan) {
        database.upsert(scope, accountId, "loans", NativeStoredEntity(loan.id, loan.toPayload().toString(), loan.updatedAt))
    }

    fun deleteLoan(scope: String, accountId: String, loanId: String) {
        database.delete(scope, accountId, "loans", loanId)
    }

    fun saveLoanRepayment(scope: String, accountId: String, loan: NativeLoan, entry: LedgerEntry) {
        database.upsertEntities(
            scope,
            accountId,
            listOf(
                "loans" to NativeStoredEntity(loan.id, loan.toPayload().toString(), loan.updatedAt),
                "transactions" to storedEntry(entry),
            ),
        )
    }

    fun saveImportedLedgerBatch(
        scope: String,
        accountId: String,
        actualBalance: Double,
        allEntries: List<LedgerEntry>,
        importedEntries: List<LedgerEntry>,
        updatedLoans: List<NativeLoan>,
    ) {
        val records = buildList {
            importedEntries.forEach { add("transactions" to storedEntry(it)) }
            updatedLoans.forEach { loan ->
                add("loans" to NativeStoredEntity(loan.id, loan.toPayload().toString(), loan.updatedAt))
            }
        }
        database.upsertEntities(scope, accountId, records)
        val rows = JSONArray().apply { allEntries.forEach { put(entryJson(it)) } }
        val editor = preferences.edit()
            .putString("actualBalance_${scope}_$accountId", actualBalance.toString())
            .putString("entries_${scope}_$accountId", rows.toString())
        if (scope == "LOCAL") {
            editor.putString("actualBalance", actualBalance.toString())
                .putString("entries", rows.toString())
        }
        editor.apply()
    }

    fun loadImportErrors(scope: String, accountId: String): List<NativeImportError> =
        database.readAll(scope, accountId, "importErrorLogs").mapNotNull { raw ->
            runCatching { JSONObject(raw).toNativeImportError(accountId) }.getOrNull()
        }.sortedByDescending(NativeImportError::createdAt)

    fun saveImportError(scope: String, accountId: String, error: NativeImportError) {
        database.upsert(scope, accountId, "importErrorLogs", NativeStoredEntity(error.id, error.toPayload().toString(), error.createdAt))
    }

    fun loadSavingsGoals(scope: String, accountId: String): List<NativeSavingsGoal> =
        database.readAll(scope, accountId, "savingsGoals").mapNotNull(::parseNativeSavingsGoal)

    fun loadSavingsPlans(scope: String, accountId: String): List<NativeSavingsPlan> =
        database.readAll(scope, accountId, "savingsPlans").mapNotNull(::parseNativeSavingsPlan)

    fun saveSavingsState(scope: String, accountId: String, goals: List<NativeSavingsGoal>, plans: List<NativeSavingsPlan>) {
        database.replaceAll(scope, accountId, "savingsGoals", goals.map { goal ->
            NativeStoredEntity(goal.id, goal.toPayload().toString(), goal.updatedAt)
        })
        database.replaceAll(scope, accountId, "savingsPlans", plans.map { plan ->
            NativeStoredEntity(plan.id, plan.toPayload().toString(), plan.updatedAt)
        })
    }

    fun saveSavingsGoal(scope: String, accountId: String, goal: NativeSavingsGoal) {
        database.upsert(scope, accountId, "savingsGoals", NativeStoredEntity(goal.id, goal.toPayload().toString(), goal.updatedAt))
    }

    fun saveSavingsPlan(scope: String, accountId: String, plan: NativeSavingsPlan) {
        database.upsert(scope, accountId, "savingsPlans", NativeStoredEntity(plan.id, plan.toPayload().toString(), plan.updatedAt))
    }

    fun deleteSavingsPlan(scope: String, accountId: String, planId: String) {
        database.delete(scope, accountId, "savingsPlans", planId)
    }

    fun deleteSavingsGoal(scope: String, accountId: String, goalId: String) {
        database.readAll(scope, accountId, "savingsPlans")
            .mapNotNull(::parseNativeSavingsPlan)
            .filter { it.goalId == goalId }
            .forEach { database.delete(scope, accountId, "savingsPlans", it.id) }
        database.delete(scope, accountId, "savingsGoals", goalId)
    }

    private fun parseEntryArray(raw: String): List<LedgerEntry> = runCatching {
        val rows = JSONArray(raw)
        List(rows.length()) { index -> parseEntry(rows.getJSONObject(index).toString()) }
            .filterNotNull()
    }.getOrDefault(emptyList())

    private fun parseEntry(raw: String): LedgerEntry? = runCatching {
        val item = JSONObject(raw)
        val oldCategory = item.optString("category", "未分类")
        val platform = item.optString("platform").ifBlank {
            oldCategory.substringAfter(" ·", "现金").ifBlank { "现金" }
        }
        val category = item.optString("categoryName").ifBlank {
            oldCategory.substringBefore(" ·").ifBlank { "未分类" }
        }
        val transactionDate = item.optString("transactionDate").ifBlank {
            item.optString("date", LocalDate.now().toString()).take(10)
        }
        val merchant = item.optString("merchant")
        val description = item.optString("description").ifBlank { item.optString("title") }
        LedgerEntry(
            id = item.optString("id").ifBlank { "legacy-${System.nanoTime()}" },
            title = item.optString("title").ifBlank { merchant.ifBlank { description.ifBlank { category } } },
            category = "$category · $platform",
            amount = item.optDouble("amount", 0.0),
            type = runCatching { EntryType.valueOf(item.optString("type", "EXPENSE")) }.getOrDefault(EntryType.EXPENSE),
            dayLabel = item.optString("dayLabel").ifBlank { transactionDate },
            transactionDate = transactionDate,
            date = item.optString("date").ifBlank { transactionDate },
            merchant = merchant,
            description = description,
            platform = platform,
            orderId = item.optString("orderId").takeIf(String::isNotBlank),
            paymentMethod = item.optString("paymentMethod").takeIf(String::isNotBlank),
            status = item.optString("status").takeIf(String::isNotBlank),
            loanId = item.optString("loanId").takeIf(String::isNotBlank),
            remarkCategory = item.optString("remarkCategory").takeIf(String::isNotBlank),
            userId = item.optString("userId"),
            accountId = item.optString("accountId"),
            createdAt = item.optString("createdAt"),
            updatedAt = item.optString("updatedAt"),
        )
    }.getOrNull()

    private fun storedEntry(entry: LedgerEntry) = NativeStoredEntity(
        id = entry.id,
        payload = entryJson(entry).toString(),
        updatedAt = entry.updatedAt.ifBlank { entry.date },
    )

    private fun entryJson(entry: LedgerEntry) = JSONObject()
        .put("id", entry.id)
        .put("title", entry.title)
        .put("category", entry.category.substringBefore(" ·"))
        .put("categoryName", entry.category.substringBefore(" ·"))
        .put("platform", entry.platform.ifBlank { entry.category.substringAfter(" ·", "现金") })
        .put("amount", entry.amount)
        .put("type", entry.type.name)
        .put("dayLabel", entry.dayLabel)
        .put("transactionDate", entry.transactionDate)
        .put("date", entry.date)
        .put("merchant", entry.merchant)
        .put("description", entry.description)
        .put("orderId", entry.orderId)
        .put("paymentMethod", entry.paymentMethod)
        .put("status", entry.status)
        .put("loanId", entry.loanId)
        .put("remarkCategory", entry.remarkCategory)
        .put("userId", entry.userId)
        .put("accountId", entry.accountId)
        .put("createdAt", entry.createdAt)
        .put("updatedAt", entry.updatedAt)

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

    fun loadApiPreferences(): NativeApiPreferences {
        val savedBaseUrl = preferences.getString("apiBaseUrl", null)?.trim().orEmpty()
        val baseUrl = when {
            savedBaseUrl.isBlank() -> defaultNativeApiBaseUrl()
            savedBaseUrl.trimEnd('/').equals(NATIVE_EMULATOR_API_BASE_URL, ignoreCase = true) && !isNativeAndroidEmulator() -> ""
            else -> savedBaseUrl
        }
        return NativeApiPreferences(
            baseUrl = baseUrl,
            token = preferences.getString("apiToken", "") ?: "",
            accountId = preferences.getString("apiAccountId", "") ?: "",
            userId = preferences.getString("apiUserId", "") ?: "",
        )
    }

    fun saveApiPreferences(baseUrl: String, token: String, accountId: String, userId: String) {
        preferences.edit()
            .putString("apiBaseUrl", baseUrl.trim().trimEnd('/'))
            .putString("apiToken", token.trim())
            .putString("apiAccountId", accountId.trim())
            .putString("apiUserId", userId.trim())
            .apply()
    }

    fun clearApiPreferences() {
        preferences.edit().remove("apiToken").remove("apiAccountId").remove("apiUserId").apply()
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

    suspend fun changePassword(config: NativeApiPreferences, newPassword: String, confirmPassword: String) {
        authorizedAccountRequest(
            config = config,
            path = "/api/auth/password",
            method = "POST",
            payload = JSONObject().put("newPassword", newPassword).put("confirmPassword", confirmPassword),
        )
    }

    suspend fun loadRegistrationStatus(config: NativeApiPreferences): Boolean {
        val payload = authorizedAccountRequest(config, "/api/auth/registration", method = "GET")
        if (!payload.has("registrationEnabled")) throw IllegalStateException("服务器没有返回注册状态")
        return payload.getBoolean("registrationEnabled")
    }

    suspend fun setRegistrationEnabled(config: NativeApiPreferences, enabled: Boolean, adminKey: String): Boolean {
        val payload = authorizedAccountRequest(
            config = config,
            path = "/api/auth/registration",
            method = "POST",
            payload = JSONObject().put("registrationEnabled", enabled).put("adminKey", adminKey),
        )
        if (!payload.has("registrationEnabled")) throw IllegalStateException("服务器没有返回注册状态")
        return payload.getBoolean("registrationEnabled")
    }

    private suspend fun authorizedAccountRequest(
        config: NativeApiPreferences,
        path: String,
        method: String,
        payload: JSONObject? = null,
    ): JSONObject = withContext(Dispatchers.IO) {
        require(config.token.isNotBlank()) { "请先登录云端账户" }
        val builder = Request.Builder()
            .url(config.baseUrl.trimEnd('/') + path)
            .header("Authorization", "Bearer ${config.token}")
        if (method == "GET") {
            builder.get()
        } else {
            val body = (payload ?: JSONObject()).toString().toRequestBody("application/json".toMediaType())
            builder.post(body)
        }
        client.newCall(builder.build()).execute().use { response ->
            val raw = response.body?.string().orEmpty()
            val result = runCatching { JSONObject(raw) }.getOrDefault(JSONObject())
            if (!response.isSuccessful) {
                throw IllegalStateException(result.optString("error").ifBlank { "云端请求失败（${response.code}）" })
            }
            result
        }
    }

    suspend fun loadSnapshot(config: NativeApiPreferences): NativeRemoteSnapshot = withContext(Dispatchers.IO) {
        require(config.token.isNotBlank()) { "请先登录云端账户" }
        require(config.accountId.isNotBlank()) { "云端账户没有可用账本" }
        val accountQuery = java.net.URLEncoder.encode(config.accountId, "UTF-8")
        val allRows = mutableListOf<JSONObject>()
        var page = 1
        while (true) {
            val request = Request.Builder()
                .url(config.baseUrl.trimEnd('/') + "/api/transactions?accountId=$accountQuery&page=$page&pageSize=500")
                .header("Authorization", "Bearer ${config.token}")
                .get()
                .build()
            val pageRows = client.newCall(request).execute().use { response ->
                val raw = response.body?.string().orEmpty()
                if (!response.isSuccessful) throw IllegalStateException(JSONObject(raw).optString("error", "云端流水读取失败"))
                JSONArray(raw)
            }
            for (index in 0 until pageRows.length()) pageRows.optJSONObject(index)?.let(allRows::add)
            if (pageRows.length() < 500) break
            page += 1
        }
        val entries = allRows.map { row ->
            val type = runCatching { EntryType.valueOf(row.optString("type", "EXPENSE")) }.getOrDefault(EntryType.EXPENSE)
            val rawDate = row.optString("date", LocalDate.now().toString())
            val date = rawDate.take(10)
            val category = row.optString("category", "未分类")
            val platform = row.optString("platform", "云端")
            val merchant = row.optString("merchant")
            val description = row.optString("description")
            LedgerEntry(
                id = row.optString("id"),
                title = merchant.ifBlank { description.ifBlank { category } },
                category = "$category · $platform",
                amount = row.optDouble("amount", 0.0),
                type = type,
                dayLabel = date,
                transactionDate = date,
                date = rawDate,
                merchant = merchant,
                description = description,
                platform = platform,
                orderId = row.optString("orderId").takeIf(String::isNotBlank),
                paymentMethod = row.optString("paymentMethod").takeIf(String::isNotBlank),
                status = row.optString("status").takeIf(String::isNotBlank),
                loanId = row.optString("loanId").takeIf(String::isNotBlank),
                remarkCategory = row.optString("remarkCategory").takeIf(String::isNotBlank),
                userId = row.optString("userId"),
                accountId = row.optString("accountId"),
                createdAt = row.optString("createdAt"),
                updatedAt = row.optString("updatedAt"),
            )
        }
        NativeRemoteSnapshot(entries = entries, actualBalance = null)
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
                add(row.toNativeAsset(config.accountId))
            }
        }
    }

    suspend fun saveAsset(config: NativeApiPreferences, asset: NativeAsset) {
        postJson(config, "/api/assets", asset.toPayload(), "资产数据保存失败")
    }

    suspend fun deleteAsset(config: NativeApiPreferences, id: String) {
        deleteJson(config, "/api/assets/" + java.net.URLEncoder.encode(id, "UTF-8"), "资产")
    }

    suspend fun loadSubscriptions(config: NativeApiPreferences): List<NativeSubscription> = withContext(Dispatchers.IO) {
        val rows = getJsonArray(config, "/api/subscriptions?accountId=" + java.net.URLEncoder.encode(config.accountId, "UTF-8"))
        buildList {
            for (index in 0 until rows.length()) rows.optJSONObject(index)?.let { add(it.toNativeSubscription(config.accountId)) }
        }
    }

    suspend fun saveSubscription(config: NativeApiPreferences, subscription: NativeSubscription) {
        postJson(config, "/api/subscriptions", subscription.toPayload(), "周期支出保存失败")
    }

    suspend fun deleteSubscription(config: NativeApiPreferences, id: String) {
        deleteJson(config, "/api/subscriptions/" + java.net.URLEncoder.encode(id, "UTF-8"), "周期支出")
    }

    suspend fun loadCategoryRules(config: NativeApiPreferences): List<NativeCategoryRule> = withContext(Dispatchers.IO) {
        val rows = getJsonArray(config, "/api/category-rules?accountId=" + java.net.URLEncoder.encode(config.accountId, "UTF-8"))
        buildList {
            for (index in 0 until rows.length()) rows.optJSONObject(index)?.let { add(it.toNativeCategoryRule(config.accountId)) }
        }
    }

    suspend fun saveCategoryRule(config: NativeApiPreferences, rule: NativeCategoryRule) {
        postJson(config, "/api/category-rules", rule.toPayload(), "归类规则保存失败")
    }

    suspend fun loadImportErrors(config: NativeApiPreferences): List<NativeImportError> = withContext(Dispatchers.IO) {
        val rows = getJsonArray(config, "/api/import-errors?accountId=" + java.net.URLEncoder.encode(config.accountId, "UTF-8"))
        buildList {
            for (index in 0 until rows.length()) rows.optJSONObject(index)?.let { add(it.toNativeImportError(config.accountId)) }
        }.sortedByDescending(NativeImportError::createdAt)
    }

    suspend fun saveImportError(config: NativeApiPreferences, error: NativeImportError) {
        postJson(config, "/api/import-errors", error.toPayload(), "导入错误记录保存失败")
    }

    suspend fun deleteCategoryRule(config: NativeApiPreferences, id: String) {
        deleteJson(config, "/api/category-rules/" + java.net.URLEncoder.encode(id, "UTF-8"), "归类规则")
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
                add(it.toNativeLoan(config.accountId))
            }
        }
    }

    suspend fun saveLoan(config: NativeApiPreferences, loan: NativeLoan) {
        postJson(config, "/api/loans", loan.toPayload(), "贷款数据保存失败")
    }

    suspend fun deleteLoan(config: NativeApiPreferences, id: String) {
        deleteJson(config, "/api/loans/" + java.net.URLEncoder.encode(id, "UTF-8"), "贷款")
    }

    suspend fun loadSavingsGoals(config: NativeApiPreferences): List<NativeSavingsGoal> = withContext(Dispatchers.IO) {
        val rows = getJsonArray(config, "/api/savings-goals?accountId=" + java.net.URLEncoder.encode(config.accountId, "UTF-8"))
        buildList {
            for (i in 0 until rows.length()) rows.optJSONObject(i)?.let { parseNativeSavingsGoal(it.toString())?.let(::add) }
        }
    }

    suspend fun loadSavingsPlans(config: NativeApiPreferences, goalIds: List<String>): List<NativeSavingsPlan> {
        val result = mutableListOf<NativeSavingsPlan>()
        for (goalId in goalIds) {
            val rows = getJsonArray(config, "/api/savings-plans?goalId=" + java.net.URLEncoder.encode(goalId, "UTF-8"))
            for (index in 0 until rows.length()) {
                val row = rows.optJSONObject(index) ?: continue
                parseNativeSavingsPlan(row.toString())?.let { result += it.copy(goalId = it.goalId.ifBlank { goalId }) }
            }
        }
        return result
    }

    suspend fun saveSavingsGoal(config: NativeApiPreferences, goal: NativeSavingsGoal) {
        postJson(config, "/api/savings-goals", goal.toPayload(config.userId), "储蓄目标保存失败")
    }

    suspend fun saveSavingsPlan(config: NativeApiPreferences, plan: NativeSavingsPlan) {
        postJson(config, "/api/savings-plans", plan.toPayload(), "储蓄计划保存失败")
    }

    suspend fun deleteSavingsGoal(config: NativeApiPreferences, id: String) {
        deleteJson(config, "/api/savings-goals/" + java.net.URLEncoder.encode(id, "UTF-8"), "储蓄目标")
    }

    suspend fun deleteSavingsPlan(config: NativeApiPreferences, id: String) {
        deleteJson(config, "/api/savings-plans/" + java.net.URLEncoder.encode(id, "UTF-8"), "储蓄计划")
    }

    private suspend fun deleteJson(config: NativeApiPreferences, path: String, label: String) = withContext(Dispatchers.IO) {
        val request = Request.Builder()
            .url(config.baseUrl.trimEnd('/') + path)
            .header("Authorization", "Bearer ${config.token}")
            .delete()
            .build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                val raw = response.body?.string().orEmpty()
                throw IllegalStateException(runCatching { JSONObject(raw).optString("error") }.getOrNull().orEmpty().ifBlank { "${label}删除失败" })
            }
        }
    }

    private suspend fun postJson(config: NativeApiPreferences, path: String, payload: JSONObject, fallbackMessage: String = "云端数据保存失败") = withContext(Dispatchers.IO) {
        val request = Request.Builder()
            .url(config.baseUrl.trimEnd('/') + path)
            .header("Authorization", "Bearer ${config.token}")
            .post(payload.toString().toRequestBody("application/json".toMediaType()))
            .build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                val raw = response.body?.string().orEmpty()
                throw IllegalStateException(runCatching { JSONObject(raw).optString("error") }.getOrNull().orEmpty().ifBlank { fallbackMessage })
            }
        }
    }

    suspend fun saveEntry(config: NativeApiPreferences, entry: LedgerEntry) = withContext(Dispatchers.IO) {
        val payload = transactionPayload(config, entry)
        postTransactionPayload(config, payload)
    }

    suspend fun importTransactions(config: NativeApiPreferences, entries: List<LedgerEntry>): NativeBillImportResult = withContext(Dispatchers.IO) {
        require(config.token.isNotBlank()) { "请先连接云端账本" }
        require(config.accountId.isNotBlank()) { "云端账户没有可用账本" }
        val items = JSONArray().apply { entries.forEach { put(transactionPayload(config, it)) } }
        val account = java.net.URLEncoder.encode(config.accountId, "UTF-8")
        val request = Request.Builder()
            .url(config.baseUrl.trimEnd('/') + "/api/transactions/import?accountId=$account")
            .header("Authorization", "Bearer ${config.token}")
            .post(items.toString().toRequestBody("application/json".toMediaType()))
            .build()
        client.newCall(request).execute().use { response ->
            val raw = response.body?.string().orEmpty()
            if (!response.isSuccessful) {
                throw IllegalStateException(runCatching { JSONObject(raw).optString("error") }.getOrNull().orEmpty().ifBlank { "云端账单导入失败" })
            }
            val result = JSONObject(raw)
            val failed = result.optJSONArray("failedRows") ?: JSONArray()
            NativeBillImportResult(
                imported = result.optInt("imported"),
                skipped = result.optInt("skipped"),
                errors = result.optInt("errors"),
                failedRows = buildList {
                    for (index in 0 until failed.length()) {
                        val row = failed.optJSONObject(index) ?: continue
                        add(
                            NativeImportFailedRow(
                                lineNumber = row.optInt("lineNumber"),
                                rawData = row.optString("rawData"),
                                errorMessage = row.optString("errorMessage", "账单保存失败"),
                                errorType = row.optString("errorType", "IMPORT"),
                            ),
                        )
                    }
                },
                loanRepayments = result.optInt("loanRepayments"),
                loanRepaymentAmount = result.optDouble("loanRepaymentAmount"),
            )
        }
    }

    suspend fun saveLoanRepayment(config: NativeApiPreferences, entry: LedgerEntry) = withContext(Dispatchers.IO) {
        val loanId = entry.loanId?.takeIf(String::isNotBlank)
            ?: throw IllegalArgumentException("还款记录缺少关联贷款")
        val existing = getTransaction(config, entry.id)
        if (existing != null && !existing.isNull("id")) {
            val linkedLoanId = existing.optString("loanId").takeIf(String::isNotBlank)
            if (linkedLoanId == loanId) return@withContext
            if (linkedLoanId != null) throw IllegalStateException("这笔流水已关联到其他贷款")
            if (existing.optString("type") != EntryType.REPAYMENT.name) throw IllegalStateException("还款流水编号已被其他账单占用")
        } else {
            postTransactionPayload(config, transactionPayload(config, entry.copy(loanId = null)))
        }

        val path = "/api/transactions/loan-repayments?accountId=" + java.net.URLEncoder.encode(config.accountId, "UTF-8")
        val payload = JSONArray().put(transactionPayload(config, entry))
        val request = Request.Builder()
            .url(config.baseUrl.trimEnd('/') + path)
            .header("Authorization", "Bearer ${config.token}")
            .post(payload.toString().toRequestBody("application/json".toMediaType()))
            .build()
        client.newCall(request).execute().use { response ->
            val raw = response.body?.string().orEmpty()
            if (!response.isSuccessful) {
                throw IllegalStateException(runCatching { JSONObject(raw).optString("error") }.getOrNull().orEmpty().ifBlank { "贷款还款关联失败" })
            }
            val applied = runCatching { JSONObject(raw).optInt("applied") }.getOrDefault(0)
            if (applied > 0) return@use
        }

        val verified = getTransaction(config, entry.id)
        if (verified?.optString("loanId") != loanId) throw IllegalStateException("贷款未更新，请检查连接后重试")
    }

    private suspend fun getTransaction(config: NativeApiPreferences, id: String): JSONObject? = withContext(Dispatchers.IO) {
        val request = Request.Builder()
            .url(config.baseUrl.trimEnd('/') + "/api/transactions/" + java.net.URLEncoder.encode(id, "UTF-8"))
            .header("Authorization", "Bearer ${config.token}")
            .get()
            .build()
        client.newCall(request).execute().use { response ->
            val raw = response.body?.string().orEmpty()
            if (!response.isSuccessful) throw IllegalStateException(runCatching { JSONObject(raw).optString("error") }.getOrNull().orEmpty().ifBlank { "还款记录读取失败" })
            if (raw.isBlank() || raw == "null") null else JSONObject(raw)
        }
    }

    private suspend fun postTransactionPayload(config: NativeApiPreferences, payload: JSONObject) = withContext(Dispatchers.IO) {
        val request = Request.Builder()
            .url(config.baseUrl.trimEnd('/') + "/api/transactions")
            .header("Authorization", "Bearer ${config.token}")
            .post(payload.toString().toRequestBody("application/json".toMediaType()))
            .build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                val raw = response.body?.string().orEmpty()
                throw IllegalStateException(runCatching { JSONObject(raw).optString("error") }.getOrNull().orEmpty().ifBlank { "云端流水保存失败" })
            }
        }
    }

    private fun transactionPayload(config: NativeApiPreferences, entry: LedgerEntry): JSONObject {
        val now = java.time.LocalDateTime.now().toString().replace('T', ' ')
        val rawDate = entry.date.ifBlank { entry.transactionDate }.let { value ->
            if (value.length == 10) "$value 12:00:00" else value
        }
        return JSONObject()
            .put("id", entry.id)
            .put("userId", entry.userId.ifBlank { config.userId })
            .put("accountId", entry.accountId.ifBlank { config.accountId })
            .put("amount", entry.amount)
            .put("type", entry.type.name)
            .put("category", entry.category.substringBefore(" ·"))
            .put("platform", entry.platform.ifBlank { entry.category.substringAfter(" ·", "现金") })
            .put("merchant", entry.merchant.ifBlank { JSONObject.NULL })
            .put("date", rawDate)
            .put("description", entry.description.ifBlank { JSONObject.NULL })
            .put("orderId", entry.orderId ?: JSONObject.NULL)
            .put("paymentMethod", entry.paymentMethod ?: JSONObject.NULL)
            .put("status", entry.status ?: JSONObject.NULL)
            .put("loanId", entry.loanId ?: JSONObject.NULL)
            .put("remarkCategory", entry.remarkCategory ?: JSONObject.NULL)
            .put("createdAt", entry.createdAt.ifBlank { now })
            .put("updatedAt", now)
    }

    suspend fun deleteEntry(config: NativeApiPreferences, entryId: String) = withContext(Dispatchers.IO) {
        val request = Request.Builder()
            .url(config.baseUrl.trimEnd('/') + "/api/transactions/" + java.net.URLEncoder.encode(entryId, "UTF-8"))
            .header("Authorization", "Bearer ${config.token}")
            .delete()
            .build()
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                val raw = response.body?.string().orEmpty()
                throw IllegalStateException(runCatching { JSONObject(raw).optString("error") }.getOrNull().orEmpty().ifBlank { "云端流水删除失败" })
            }
        }
    }
}

private fun sampleEntries(): List<LedgerEntry> {
    val today = LocalDate.now()
    return listOf(
        LedgerEntry("demo-1", "工资入账", "工资收入 · 银行卡", 6917.18, EntryType.INCOME, "今天 09:01", today.toString(), merchant = "工资入账", platform = "银行卡"),
        LedgerEntry("demo-2", "午餐", "餐饮美食 · 微信", 28.00, EntryType.EXPENSE, "今天 12:26", today.toString(), merchant = "午餐", platform = "微信"),
        LedgerEntry("demo-3", "地铁出行", "交通出行 · 支付宝", 4.00, EntryType.EXPENSE, "昨天 18:32", today.minusDays(1).toString(), merchant = "地铁出行", platform = "支付宝"),
        LedgerEntry("demo-4", "超市采购", "生活消费 · 微信", 86.50, EntryType.EXPENSE, "昨天 17:06", today.minusDays(1).toString(), merchant = "超市采购", platform = "微信"),
    )
}

private val moneyFormat = DecimalFormat("#,##0.00")

@Composable
private fun StarkNativeTheme(content: @Composable () -> Unit) {
    val context = LocalContext.current
    val preferences = remember(context) { NativeUiPreferences(context) }
    val settings = preferences.value
    val selectedFont = settings.font
    val baseDensity = androidx.compose.ui.platform.LocalDensity.current
    val localizedContext = remember(context, settings.language) { nativeLocalizedContext(context, settings.language) }
    SideEffect { applyNativeProcessLocale(settings.language) }
    CompositionLocalProvider(
        LocalNativeUiPreferences provides preferences,
        androidx.compose.ui.platform.LocalDensity provides nativeFontDensity(baseDensity, selectedFont),
        androidx.compose.ui.platform.LocalContext provides localizedContext,
    ) {
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
            // Match the Web app's medium system face while retaining each component's hierarchy.
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
}

@Composable
private fun StarkNativeApp() {
    var selectedTab by remember { mutableStateOf(RootTab.HOME) }
    var entrySheetOpen by remember { mutableStateOf(false) }
    var editingEntry by remember { mutableStateOf<LedgerEntry?>(null) }
    var deleteCandidate by remember { mutableStateOf<LedgerEntry?>(null) }
    var deleteError by remember { mutableStateOf("") }
    var deletingEntry by remember { mutableStateOf(false) }
    var homeOverlay by remember { mutableStateOf<HomeOverlay?>(null) }
    var recordingSavingsPlan by remember { mutableStateOf<NativeSavingsPlan?>(null) }
    var savingsEditorOpen by remember { mutableStateOf(false) }
    var savingsEditorGoal by remember { mutableStateOf<NativeSavingsGoal?>(null) }
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
    val snapshot = remember { ledgerStore.load("LOCAL", "local") }
    var actualBalance by remember { mutableDoubleStateOf(snapshot.actualBalance) }
    val entries = remember { mutableStateListOf<LedgerEntry>().also { it.addAll(snapshot.entries) } }
    var refreshVersion by remember { mutableStateOf(0) }
    var remoteAssets by remember {
        mutableStateOf(
            ledgerStore.loadAssets(
                if (apiPreferences.token.isBlank()) "LOCAL" else "CLOUD",
                apiPreferences.accountId.ifBlank { "local" },
            ),
        )
    }
    var remoteBudgets by remember { mutableStateOf<List<NativeBudget>>(emptyList()) }
    var remoteLoans by remember { mutableStateOf<List<NativeLoan>>(emptyList()) }
    var remoteSavings by remember { mutableStateOf<List<NativeSavingsGoal>>(emptyList()) }
    var remoteSavingsPlans by remember { mutableStateOf<List<NativeSavingsPlan>>(emptyList()) }
    var remoteSubscriptions by remember {
        mutableStateOf(
            ledgerStore.loadSubscriptions(
                if (apiPreferences.token.isBlank()) "LOCAL" else "CLOUD",
                apiPreferences.accountId.ifBlank { "local" },
            ),
        )
    }
    var remoteCategoryRules by remember {
        mutableStateOf(
            ledgerStore.loadCategoryRules(
                if (apiPreferences.token.isBlank()) "LOCAL" else "CLOUD",
                apiPreferences.accountId.ifBlank { "local" },
            ),
        )
    }
    var remoteImportErrors by remember {
        mutableStateOf(
            ledgerStore.loadImportErrors(
                if (apiPreferences.token.isBlank()) "LOCAL" else "CLOUD",
                apiPreferences.accountId.ifBlank { "local" },
            ),
        )
    }
    var csvExportStatus by remember { mutableStateOf("导出当前账本全部流水为 UTF-8 CSV") }
    var exportingCsv by remember { mutableStateOf(false) }
    var csvImportStatus by remember { mutableStateOf("选择 CSV 后先预览，再确认导入") }
    var pendingCsvImport by remember { mutableStateOf<NativeBillImportPreview?>(null) }
    var importingCsv by remember { mutableStateOf(false) }
    val csvExportLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.CreateDocument("text/csv"),
    ) { uri ->
        if (uri == null) {
            csvExportStatus = "已取消导出，账本数据未更改"
            exportingCsv = false
        } else {
            exportingCsv = true
            coroutineScope.launch {
                val exportEntries = entries.toList()
                csvExportStatus = "正在导出 ${exportEntries.size} 笔账单…"
                runCatching {
                    val csv = serializeNativeTransactionsToCsv(exportEntries)
                    withContext(Dispatchers.IO) {
                        val output = context.contentResolver.openOutputStream(uri, "wt")
                            ?: throw IllegalStateException("无法打开选择的保存位置")
                        output.use { stream ->
                            stream.write(byteArrayOf(0xEF.toByte(), 0xBB.toByte(), 0xBF.toByte()))
                            stream.write(csv.toByteArray(Charsets.UTF_8))
                        }
                    }
                    csvExportStatus = "已导出 ${exportEntries.size} 笔账单"
                }.onFailure { error ->
                    csvExportStatus = "导出失败：${error.message ?: "请检查保存位置后重试"}"
                }
                exportingCsv = false
            }
        }
    }
    val csvImportLauncher = rememberLauncherForActivityResult(
        ActivityResultContracts.OpenDocument(),
    ) { uri ->
        if (uri == null) {
            csvImportStatus = "已取消选择文件，账本数据未更改"
        } else {
            importingCsv = true
            csvImportStatus = "正在读取账单…"
            coroutineScope.launch {
                runCatching {
                    val fileName = withContext(Dispatchers.IO) {
                        context.contentResolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { cursor ->
                            if (cursor.moveToFirst()) cursor.getString(cursor.getColumnIndexOrThrow(OpenableColumns.DISPLAY_NAME)) else null
                        } ?: "账单.csv"
                    }
                    require(fileName.endsWith(".csv", ignoreCase = true)) { "目前只支持 CSV 文件，请先将 XLS/XLSX 另存为 CSV" }
                    val content = withContext(Dispatchers.IO) {
                        context.contentResolver.openInputStream(uri)?.bufferedReader(Charsets.UTF_8)?.use { it.readText() }
                            ?: throw IllegalStateException("无法读取所选文件")
                    }
                    val accountId = apiPreferences.accountId.ifBlank { "local" }
                    val userId = apiPreferences.userId.ifBlank { "local-user" }
                    val parsed = withContext(Dispatchers.Default) {
                        parseNativeBillCsv(content, fileName, accountId, userId)
                    }
                    pendingCsvImport = markNativeBillDuplicates(parsed, entries.toList())
                    csvImportStatus = if (parsed.rows.isEmpty() && parsed.issues.isNotEmpty()) {
                        "未识别到可导入流水，请检查文件格式"
                    } else {
                        "已读取 ${parsed.fileName}：识别 ${parsed.source.label}账单，可导入 ${parsed.rows.size} 笔"
                    }
                }.onFailure { error ->
                    csvImportStatus = "导入失败：${error.message ?: "无法读取文件，请检查 CSV 格式"}"
                }
                importingCsv = false
            }
        }
    }

    val lifecycleContext = LocalContext.current as? ComponentActivity
    DisposableEffect(lifecycleContext) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) refreshVersion += 1
        }
        lifecycleContext?.lifecycle?.addObserver(observer)
        onDispose { lifecycleContext?.lifecycle?.removeObserver(observer) }
    }

    LaunchedEffect(apiPreferences.token, apiPreferences.baseUrl, apiPreferences.accountId, refreshVersion) {
        val scope = if (apiPreferences.token.isBlank()) "LOCAL" else "CLOUD"
        val accountId = apiPreferences.accountId.ifBlank { "local" }
        val cached = ledgerStore.load(scope, accountId)
        entries.clear()
        entries.addAll(cached.entries)
        actualBalance = cached.actualBalance
        remoteAssets = ledgerStore.loadAssets(scope, accountId)
        remoteLoans = ledgerStore.loadLoans(scope, accountId)
        remoteSubscriptions = ledgerStore.loadSubscriptions(scope, accountId)
        remoteCategoryRules = ledgerStore.loadCategoryRules(scope, accountId)
        val cachedImportErrors = ledgerStore.loadImportErrors(scope, accountId)
        remoteImportErrors = cachedImportErrors
        if (apiPreferences.token.isBlank()) {
            remoteBudgets = emptyList()
            remoteSavings = ledgerStore.loadSavingsGoals(scope, accountId)
            remoteSavingsPlans = ledgerStore.loadSavingsPlans(scope, accountId)
            val dueEntries = buildDueSubscriptionEntries(remoteSubscriptions, entries.toList(), accountId, apiPreferences.userId.ifBlank { "local-user" })
            if (dueEntries.isNotEmpty()) {
                val nextEntries = (dueEntries + entries.toList()).sortedByDescending { it.date }
                actualBalance -= dueEntries.sumOf { it.amount }
                entries.clear()
                entries.addAll(nextEntries)
                ledgerStore.save(scope, accountId, actualBalance, nextEntries)
            }
            apiStatus = "未连接云端"
            return@LaunchedEffect
        }
        remoteSavings = ledgerStore.loadSavingsGoals(scope, accountId)
        remoteSavingsPlans = ledgerStore.loadSavingsPlans(scope, accountId)
        apiStatus = "正在同步…"
        runCatching {
            val remote = apiClient.loadSnapshot(apiPreferences)
            val assets = apiClient.loadAssets(apiPreferences)
            val balance = apiClient.loadBalance(apiPreferences)
            val budgets = apiClient.loadBudgets(apiPreferences)
            val loans = apiClient.loadLoans(apiPreferences)
            val savings = apiClient.loadSavingsGoals(apiPreferences)
            val savingsPlans = apiClient.loadSavingsPlans(apiPreferences, savings.map { it.id })
            val subscriptions = apiClient.loadSubscriptions(apiPreferences)
            val categoryRules = apiClient.loadCategoryRules(apiPreferences)
            val importErrors = apiClient.loadImportErrors(apiPreferences)
            val dueEntries = buildDueSubscriptionEntries(
                subscriptions,
                remote.entries,
                accountId,
                apiPreferences.userId.ifBlank { "local-user" },
            )
            dueEntries.forEach { apiClient.saveEntry(apiPreferences, it) }
            val synchronizedEntries = (dueEntries + remote.entries).distinctBy { it.id }.sortedByDescending { it.date }
            entries.clear()
            entries.addAll(synchronizedEntries)
            remoteAssets = assets
            if (balance != null) actualBalance = balance
            ledgerStore.save(scope, accountId, actualBalance, synchronizedEntries)
            ledgerStore.saveAssetsState(scope, accountId, assets)
            remoteBudgets = budgets
            remoteLoans = loans
            ledgerStore.saveLoansState(scope, accountId, loans)
            remoteSavings = savings
            remoteSavingsPlans = savingsPlans
            ledgerStore.saveSavingsState(scope, accountId, savings, savingsPlans)
            remoteSubscriptions = subscriptions
            ledgerStore.saveSubscriptionsState(scope, accountId, subscriptions)
            remoteCategoryRules = categoryRules
            ledgerStore.saveCategoryRulesState(scope, accountId, categoryRules)
            val mergedImportErrors = (importErrors + cachedImportErrors.filter { local -> importErrors.none { it.id == local.id } })
                .sortedByDescending(NativeImportError::createdAt)
            remoteImportErrors = mergedImportErrors
            mergedImportErrors.forEach { ledgerStore.saveImportError(scope, accountId, it) }
            apiStatus = "已同步 ${synchronizedEntries.size} 笔${if (dueEntries.isNotEmpty()) " · 自动记账 ${dueEntries.size} 笔" else ""}"
        }.onFailure { error ->
            apiStatus = if (cached.entries.isNotEmpty()) {
                "同步失败，显示本机缓存：${error.message ?: "请重试"}"
            } else {
                error.message ?: "云端同步失败"
            }
        }
    }

    suspend fun persistImportError(error: NativeImportError) {
        val scope = if (apiPreferences.token.isBlank()) "LOCAL" else "CLOUD"
        val accountId = apiPreferences.accountId.ifBlank { "local" }
        ledgerStore.saveImportError(scope, accountId, error)
        if (apiPreferences.token.isNotBlank()) {
            runCatching { apiClient.saveImportError(apiPreferences, error) }
        }
        remoteImportErrors = (listOf(error) + remoteImportErrors.filterNot { it.id == error.id })
            .sortedByDescending(NativeImportError::createdAt)
    }

    suspend fun resolveImportErrors(fileName: String) {
        val scope = if (apiPreferences.token.isBlank()) "LOCAL" else "CLOUD"
        val accountId = apiPreferences.accountId.ifBlank { "local" }
        val resolved = remoteImportErrors.filter { it.fileName == fileName && !it.resolved }.map { it.copy(resolved = true) }
        resolved.forEach { error ->
            ledgerStore.saveImportError(scope, accountId, error)
            if (apiPreferences.token.isNotBlank()) runCatching { apiClient.saveImportError(apiPreferences, error) }
        }
        if (resolved.isNotEmpty()) {
            val byId = resolved.associateBy(NativeImportError::id)
            remoteImportErrors = remoteImportErrors.map { byId[it.id] ?: it }
        }
    }

    suspend fun confirmCsvImport() {
        val preview = pendingCsvImport ?: return
        if (importingCsv) return
        importingCsv = true
        csvImportStatus = "正在导入 ${preview.rows.count { it.duplicateReason == null }} 笔${preview.source.label}账单…"
        try {
            val scope = if (apiPreferences.token.isBlank()) "LOCAL" else "CLOUD"
            val accountId = apiPreferences.accountId.ifBlank { "local" }
            val duplicateCount = preview.rows.count { it.duplicateReason != null }
            val candidates = preview.rows.filter { it.duplicateReason == null }
            val categorizedEntries = applyNativeImportRules(candidates.map { it.entry }, remoteCategoryRules)
            val preparedRows = candidates.zip(categorizedEntries).map { (row, entry) ->
                val matchedLoan = matchNativeLoanRepayment(entry, remoteLoans)
                val linked = if (matchedLoan == null) entry else entry.copy(
                    type = EntryType.REPAYMENT,
                    category = "还款 · ${entry.platform}",
                    loanId = matchedLoan.id,
                )
                row.copy(entry = linked, duplicateReason = null)
            }
            var result = NativeBillImportResult(imported = 0, skipped = duplicateCount, errors = 0)
            var failedPreviewRows = emptyList<NativeBillImportItem>()
            val errorLogs = mutableListOf<NativeImportError>()
            val now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))

            if (apiPreferences.token.isNotBlank()) {
                if (preparedRows.isNotEmpty()) {
                    val remoteResult = apiClient.importTransactions(apiPreferences, preparedRows.map { it.entry })
                    result = remoteResult.copy(skipped = remoteResult.skipped + duplicateCount)
                    remoteResult.failedRows.forEach { failure ->
                        val row = preparedRows.getOrNull(failure.lineNumber - 1)
                        if (row != null) failedPreviewRows = failedPreviewRows + row
                        errorLogs += NativeImportError(
                            id = "import-error-${UUID.randomUUID()}",
                            userId = apiPreferences.userId.ifBlank { "local-user" },
                            accountId = accountId,
                            fileName = preview.fileName,
                            lineNumber = row?.lineNumber ?: failure.lineNumber,
                            rawData = failure.rawData.ifBlank { row?.rawData.orEmpty() },
                            errorMessage = failure.errorMessage,
                            errorType = failure.errorType,
                            resolved = false,
                            createdAt = now,
                        )
                    }
                    if (remoteResult.errors > remoteResult.failedRows.size) {
                        errorLogs += NativeImportError(
                            id = "import-error-${UUID.randomUUID()}", userId = apiPreferences.userId.ifBlank { "local-user" },
                            accountId = accountId, fileName = preview.fileName, lineNumber = 0,
                            rawData = "", errorMessage = "${remoteResult.errors - remoteResult.failedRows.size} 笔账单导入失败，服务端未返回逐行原因",
                            errorType = "IMPORT", resolved = false, createdAt = now,
                        )
                    }
                }
            } else if (preparedRows.isNotEmpty()) {
                val existingIds = entries.mapTo(mutableSetOf()) { it.id }
                val existingOrders = entries.mapNotNullTo(mutableSetOf()) { it.orderId?.takeIf(String::isNotBlank) }
                val nextEntries = entries.toList().toMutableList()
                val nextLoans = remoteLoans.toMutableList()
                val touchedLoanIds = mutableSetOf<String>()
                val importedEntries = mutableListOf<LedgerEntry>()
                var skipped = duplicateCount
                var failed = 0
                var loanRepayments = 0
                var loanAmount = 0.0
                val retryRows = mutableListOf<NativeBillImportItem>()

                preparedRows.forEach { row ->
                    val entry = row.entry
                    val duplicateReason = when {
                        entry.id in existingIds -> "流水 ID 已存在"
                        !entry.orderId.isNullOrBlank() && entry.orderId in existingOrders -> "订单号已存在"
                        else -> null
                    }
                    if (duplicateReason != null) {
                        skipped += 1
                        return@forEach
                    }
                    val linkedLoanIndex = if (entry.type == EntryType.REPAYMENT && !entry.loanId.isNullOrBlank()) {
                        nextLoans.indexOfFirst { it.id == entry.loanId }
                    } else {
                        -1
                    }
                    if (entry.type == EntryType.REPAYMENT && !entry.loanId.isNullOrBlank() && linkedLoanIndex < 0) {
                        failed += 1
                        retryRows += row
                        errorLogs += NativeImportError(
                            id = "import-error-${UUID.randomUUID()}", userId = apiPreferences.userId.ifBlank { "local-user" },
                            accountId = accountId, fileName = preview.fileName, lineNumber = row.lineNumber,
                            rawData = row.rawData, errorMessage = "关联贷款不存在，账单没有写入", errorType = "IMPORT",
                            resolved = false, createdAt = now,
                        )
                        return@forEach
                    }
                    if (linkedLoanIndex >= 0) {
                        val loan = nextLoans[linkedLoanIndex]
                        val amount = java.math.BigDecimal.valueOf(entry.amount)
                        val remaining = java.math.BigDecimal.valueOf(loan.remainingAmount.coerceAtLeast(0.0))
                        val reduced = amount.min(remaining)
                        val nextRemaining = remaining.subtract(reduced).max(java.math.BigDecimal.ZERO)
                            .setScale(2, java.math.RoundingMode.HALF_UP).toDouble()
                        val paidPeriods = if (loan.monthlyPayment > 0.0 && entry.amount >= loan.monthlyPayment) {
                            (loan.paidPeriods + 1).coerceAtMost(loan.periods)
                        } else loan.paidPeriods
                        nextLoans[linkedLoanIndex] = loan.copy(
                            remainingAmount = nextRemaining,
                            paidPeriods = paidPeriods,
                            status = if (nextRemaining <= 0.0) "PAID_OFF" else loan.status,
                            updatedAt = now,
                        )
                        touchedLoanIds += loan.id
                        if (reduced > java.math.BigDecimal.ZERO) {
                            loanRepayments += 1
                            loanAmount += reduced.toDouble()
                        }
                    }
                    existingIds += entry.id
                    entry.orderId?.takeIf(String::isNotBlank)?.let(existingOrders::add)
                    nextEntries.add(0, entry)
                    importedEntries += entry
                }
                val updatedLoans = nextLoans.filter { it.id in touchedLoanIds }
                ledgerStore.saveImportedLedgerBatch(scope, accountId, actualBalance, nextEntries, importedEntries, updatedLoans)
                entries.clear()
                entries.addAll(nextEntries)
                remoteLoans = nextLoans
                failedPreviewRows = retryRows
                result = NativeBillImportResult(
                    imported = importedEntries.size,
                    skipped = skipped,
                    errors = failed,
                    failedRows = retryRows.map { row ->
                        NativeImportFailedRow(row.lineNumber, row.rawData, "关联贷款不存在，账单没有写入", "IMPORT")
                    },
                    loanRepayments = loanRepayments,
                    loanRepaymentAmount = loanAmount,
                )
            }

            preview.issues.forEach { issue ->
                errorLogs += NativeImportError(
                    id = "import-error-${UUID.randomUUID()}",
                    userId = apiPreferences.userId.ifBlank { "local-user" },
                    accountId = accountId,
                    fileName = preview.fileName,
                    lineNumber = issue.lineNumber,
                    rawData = issue.rawData,
                    errorMessage = issue.message,
                    errorType = issue.errorType,
                    resolved = false,
                    createdAt = now,
                )
            }

            if (failedPreviewRows.isEmpty() && preview.issues.isEmpty()) {
                resolveImportErrors(preview.fileName)
            }
            errorLogs.forEach { persistImportError(it) }
            val errorCount = result.errors + preview.issues.size
            val repaymentSummary = if (result.loanRepayments > 0) {
                "，自动关联 ${result.loanRepayments} 笔还款（¥${"%.2f".format(Locale.ROOT, result.loanRepaymentAmount)}）"
            } else ""
            csvImportStatus = "已导入 ${result.imported} 笔，跳过 ${result.skipped} 笔，失败 $errorCount 行$repaymentSummary" +
                if (failedPreviewRows.isNotEmpty()) "；失败账单已保留，可再次确认重试" else ""
            pendingCsvImport = if (failedPreviewRows.isNotEmpty()) {
                preview.copy(rows = failedPreviewRows, issues = emptyList())
            } else {
                null
            }
            if (result.imported > 0) refreshVersion += 1
        } catch (error: Throwable) {
            csvImportStatus = "导入失败：${error.message ?: "账单未完成写入，请检查连接后重试"}"
        } finally {
            importingCsv = false
        }
    }

    Scaffold(
        containerColor = Canvas,
        bottomBar = {
            NativeBottomBar(
                selectedTab = selectedTab,
                onTabSelected = { selectedTab = it },
                onAddEntry = { editingEntry = null; entrySheetOpen = true },
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
                    remoteAssets = remoteAssets,
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
                    onEditEntry = { editingEntry = it; entrySheetOpen = true },
                    onDeleteEntry = { deleteCandidate = it; deleteError = "" },
                )
                RootTab.SAVINGS -> SavingsOverviewScreen(
                    modifier = Modifier.padding(insets),
                    goals = remoteSavings,
                    plans = remoteSavingsPlans,
                    connected = apiPreferences.token.isNotBlank(),
                    onConnect = { homeOverlay = HomeOverlay.API },
                    onRecordPlan = { recordingSavingsPlan = it },
                    onNewGoal = { savingsEditorGoal = null; savingsEditorOpen = true },
                    onEditGoal = { goal -> savingsEditorGoal = goal; savingsEditorOpen = true },
                )
                RootTab.LOANS -> NativeLoanOverviewScreen(
                    modifier = Modifier.padding(insets),
                    loans = remoteLoans,
                    entries = entries,
                    reportingMonth = selectedMonth,
                    accountId = apiPreferences.accountId.ifBlank { "local" },
                    userId = apiPreferences.userId.ifBlank { "local-user" },
                    connected = apiPreferences.token.isNotBlank(),
                    onConnect = { homeOverlay = HomeOverlay.API },
                    onSaveLoan = { loan ->
                        val scope = if (apiPreferences.token.isBlank()) "LOCAL" else "CLOUD"
                        val accountId = apiPreferences.accountId.ifBlank { "local" }
                        val now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                        val updated = loan.copy(
                            userId = apiPreferences.userId.ifBlank { loan.userId.ifBlank { "local-user" } },
                            accountId = accountId,
                            createdAt = loan.createdAt.ifBlank { now },
                            updatedAt = now,
                        )
                        if (apiPreferences.token.isNotBlank()) apiClient.saveLoan(apiPreferences, updated)
                        ledgerStore.saveLoan(scope, accountId, updated)
                        remoteLoans = remoteLoans.filterNot { it.id == updated.id } + updated
                        apiStatus = if (apiPreferences.token.isBlank()) "本地贷款已保存" else "云端贷款已保存"
                        refreshVersion += 1
                    },
                    onDeleteLoan = { loan ->
                        val scope = if (apiPreferences.token.isBlank()) "LOCAL" else "CLOUD"
                        val accountId = apiPreferences.accountId.ifBlank { "local" }
                        if (apiPreferences.token.isNotBlank()) apiClient.deleteLoan(apiPreferences, loan.id)
                        ledgerStore.deleteLoan(scope, accountId, loan.id)
                        remoteLoans = remoteLoans.filterNot { it.id == loan.id }
                        apiStatus = if (apiPreferences.token.isBlank()) "本地贷款已删除" else "云端贷款已删除"
                        refreshVersion += 1
                    },
                    onSaveRepayment = { loan, amount, date, note, transactionId ->
                        val scope = if (apiPreferences.token.isBlank()) "LOCAL" else "CLOUD"
                        val accountId = apiPreferences.accountId.ifBlank { "local" }
                        val now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                        val paidAmount = (amount.coerceAtMost(loan.remainingAmount) * 100.0).toLong() / 100.0
                        val remaining = ((loan.remainingAmount - paidAmount).coerceAtLeast(0.0) * 100.0).toLong() / 100.0
                        val reachedInstallment = loan.monthlyPayment > 0.0 && paidAmount >= loan.monthlyPayment
                        val updatedLoan = loan.copy(
                            remainingAmount = remaining,
                            paidPeriods = (loan.paidPeriods + if (reachedInstallment) 1 else 0).coerceAtMost(loan.periods),
                            status = if (remaining <= 0.0) "PAID_OFF" else if (loan.status == "PAID_OFF") "ACTIVE" else loan.status,
                            updatedAt = now,
                        )
                        val transactionDate = "$date 12:00:00"
                        val repayment = LedgerEntry(
                            id = transactionId,
                            title = loan.platform,
                            category = "还款 · ${loan.platform}",
                            amount = paidAmount,
                            type = EntryType.REPAYMENT,
                            dayLabel = date,
                            transactionDate = date,
                            date = transactionDate,
                            merchant = loan.platform,
                            description = note,
                            platform = loan.platform,
                            status = "COMPLETED",
                            loanId = loan.id,
                            userId = loan.userId.ifBlank { apiPreferences.userId.ifBlank { "local-user" } },
                            accountId = accountId,
                            createdAt = now,
                            updatedAt = now,
                        )
                        if (apiPreferences.token.isNotBlank()) apiClient.saveLoanRepayment(apiPreferences, repayment)
                        ledgerStore.saveLoanRepayment(scope, accountId, updatedLoan, repayment)
                        entries.removeAll { it.id == repayment.id }
                        entries.add(0, repayment)
                        remoteLoans = remoteLoans.filterNot { it.id == updatedLoan.id } + updatedLoan
                        apiStatus = if (apiPreferences.token.isBlank()) "本地还款已记录" else "云端还款已记录"
                        refreshVersion += 1
                    },
                )
                RootTab.ASSETS -> NativeAssetsOverviewScreen(
                    modifier = Modifier.padding(insets),
                    assets = remoteAssets,
                    savingsGoals = remoteSavings,
                    loans = remoteLoans,
                    fallbackBalance = actualBalance,
                    connected = apiPreferences.token.isNotBlank(),
                    onConnect = { homeOverlay = HomeOverlay.API },
                    onOpenSavings = { selectedTab = RootTab.SAVINGS },
                    onOpenLoans = { selectedTab = RootTab.LOANS },
                    onSaveAsset = { asset ->
                        val scope = if (apiPreferences.token.isBlank()) "LOCAL" else "CLOUD"
                        val accountId = apiPreferences.accountId.ifBlank { "local" }
                        val now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                        val updated = asset.copy(
                            userId = apiPreferences.userId.ifBlank { asset.userId.ifBlank { "local-user" } },
                            accountId = accountId,
                            createdAt = asset.createdAt.ifBlank { now },
                            updatedAt = now,
                        )
                        if (apiPreferences.token.isNotBlank()) apiClient.saveAsset(apiPreferences, updated)
                        ledgerStore.saveAsset(scope, accountId, updated)
                        remoteAssets = remoteAssets.filterNot { it.id == updated.id } + updated
                        apiStatus = if (apiPreferences.token.isBlank()) "本地资产已保存" else "云端资产已保存"
                        refreshVersion += 1
                    },
                    onDeleteAsset = { asset ->
                        val scope = if (apiPreferences.token.isBlank()) "LOCAL" else "CLOUD"
                        val accountId = apiPreferences.accountId.ifBlank { "local" }
                        if (apiPreferences.token.isNotBlank()) apiClient.deleteAsset(apiPreferences, asset.id)
                        ledgerStore.deleteAsset(scope, accountId, asset.id)
                        remoteAssets = remoteAssets.filterNot { it.id == asset.id }
                        apiStatus = if (apiPreferences.token.isBlank()) "本地资产已删除" else "云端资产已删除"
                        refreshVersion += 1
                    },
                )
                RootTab.SETTINGS -> NativeSettingsScreen(
                    modifier = Modifier.padding(insets),
                    apiPreferences = apiPreferences,
                    apiStatus = apiStatus,
                    subscriptions = remoteSubscriptions,
                    categoryRules = remoteCategoryRules,
                    transactions = entries.toList(),
                    csvExportStatus = csvExportStatus,
                    csvImportStatus = csvImportStatus,
                    pendingCsvImport = pendingCsvImport,
                    importErrors = remoteImportErrors,
                    importingCsv = importingCsv,
                    onOpenApi = { homeOverlay = HomeOverlay.API },
                    onRefresh = { refreshVersion += 1 },
                    onChangePassword = { newPassword, confirmPassword ->
                        apiClient.changePassword(apiPreferences, newPassword, confirmPassword)
                    },
                    onLoadRegistrationStatus = { apiClient.loadRegistrationStatus(apiPreferences) },
                    onSetRegistrationEnabled = { enabled, adminKey ->
                        apiClient.setRegistrationEnabled(apiPreferences, enabled, adminKey)
                    },
                    onLogout = {
                        ledgerStore.clearApiPreferences()
                        apiPreferences = apiPreferences.copy(token = "", accountId = "", userId = "")
                        apiStatus = "未连接云端"
                        refreshVersion += 1
                    },
                    onExportBills = {
                        if (exportingCsv) {
                            csvExportStatus = "正在导出账单…"
                        } else {
                            csvExportStatus = "正在选择保存位置…"
                            val date = LocalDate.now().format(DateTimeFormatter.ISO_DATE)
                            csvExportLauncher.launch("star-accounting-bills-$date.csv")
                        }
                    },
                    onPickBills = {
                        csvImportStatus = "正在选择账单文件…"
                        csvImportLauncher.launch(arrayOf("text/*", "text/csv", "application/csv", "application/vnd.ms-excel"))
                    },
                    onConfirmBillImport = ::confirmCsvImport,
                    onSaveSubscription = { subscription ->
                        val scope = if (apiPreferences.token.isBlank()) "LOCAL" else "CLOUD"
                        val accountId = apiPreferences.accountId.ifBlank { "local" }
                        val now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                        val updated = subscription.copy(
                            userId = apiPreferences.userId.ifBlank { subscription.userId.ifBlank { "local-user" } },
                            accountId = accountId,
                            createdAt = subscription.createdAt.ifBlank { now },
                            updatedAt = now,
                        )
                        if (apiPreferences.token.isNotBlank()) apiClient.saveSubscription(apiPreferences, updated)
                        ledgerStore.saveSubscription(scope, accountId, updated)
                        remoteSubscriptions = remoteSubscriptions.filterNot { it.id == updated.id } + updated
                        apiStatus = if (apiPreferences.token.isBlank()) "本地周期支出已保存" else "云端周期支出已保存"
                        refreshVersion += 1
                    },
                    onDeleteSubscription = { subscription ->
                        val scope = if (apiPreferences.token.isBlank()) "LOCAL" else "CLOUD"
                        val accountId = apiPreferences.accountId.ifBlank { "local" }
                        if (apiPreferences.token.isNotBlank()) apiClient.deleteSubscription(apiPreferences, subscription.id)
                        ledgerStore.deleteSubscription(scope, accountId, subscription.id)
                        remoteSubscriptions = remoteSubscriptions.filterNot { it.id == subscription.id }
                        apiStatus = if (apiPreferences.token.isBlank()) "本地周期支出已删除" else "云端周期支出已删除"
                        refreshVersion += 1
                    },
                    onSaveCategoryRule = { rule ->
                        val scope = if (apiPreferences.token.isBlank()) "LOCAL" else "CLOUD"
                        val accountId = apiPreferences.accountId.ifBlank { "local" }
                        val now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                        val updated = rule.copy(
                            userId = apiPreferences.userId.ifBlank { rule.userId.ifBlank { "local-user" } },
                            accountId = accountId,
                            createdAt = rule.createdAt.ifBlank { now },
                            updatedAt = now,
                        )
                        if (apiPreferences.token.isNotBlank()) apiClient.saveCategoryRule(apiPreferences, updated)
                        val categorized = applyNativeCategoryRule(entries.toList(), updated, now)
                        val changed = categorized.filterIndexed { index, entry ->
                            entry.remarkCategory != entries.getOrNull(index)?.remarkCategory
                        }
                        if (apiPreferences.token.isNotBlank()) changed.forEach { apiClient.saveEntry(apiPreferences, it) }
                        ledgerStore.saveCategoryRule(scope, accountId, updated)
                        if (changed.isNotEmpty()) {
                            entries.clear()
                            entries.addAll(categorized)
                            ledgerStore.save(scope, accountId, actualBalance, categorized)
                        }
                        remoteCategoryRules = remoteCategoryRules.filterNot { it.id == updated.id } + updated
                        apiStatus = if (apiPreferences.token.isBlank()) "本地归类规则已保存" else "云端归类规则已保存"
                        refreshVersion += 1
                        changed.size
                    },
                    onToggleCategoryRule = { rule ->
                        val scope = if (apiPreferences.token.isBlank()) "LOCAL" else "CLOUD"
                        val accountId = apiPreferences.accountId.ifBlank { "local" }
                        val updated = rule.copy(
                            updatedAt = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
                        )
                        if (apiPreferences.token.isNotBlank()) apiClient.saveCategoryRule(apiPreferences, updated)
                        ledgerStore.saveCategoryRule(scope, accountId, updated)
                        remoteCategoryRules = remoteCategoryRules.map { if (it.id == updated.id) updated else it }
                        apiStatus = if (apiPreferences.token.isBlank()) "本地归类规则状态已更新" else "云端归类规则状态已更新"
                        refreshVersion += 1
                    },
                    onDeleteCategoryRule = { rule ->
                        val scope = if (apiPreferences.token.isBlank()) "LOCAL" else "CLOUD"
                        val accountId = apiPreferences.accountId.ifBlank { "local" }
                        if (apiPreferences.token.isNotBlank()) apiClient.deleteCategoryRule(apiPreferences, rule.id)
                        ledgerStore.deleteCategoryRule(scope, accountId, rule.id)
                        remoteCategoryRules = remoteCategoryRules.filterNot { it.id == rule.id }
                        apiStatus = if (apiPreferences.token.isBlank()) "本地归类规则已删除" else "云端归类规则已删除"
                        refreshVersion += 1
                    },
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

    if (deleteCandidate != null) {
        AlertDialog(
            onDismissRequest = { if (!deletingEntry) { deleteCandidate = null; deleteError = "" } },
            shape = RoundedCornerShape(24.dp),
            containerColor = Color(0xFFFBFCFE),
            title = { Text("删除这笔流水？", fontWeight = FontWeight.Bold) },
            text = {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Text("${deleteCandidate?.title} · ¥${moneyFormat.format(deleteCandidate?.amount ?: 0.0)}", color = Muted)
                    if (deleteError.isNotBlank()) Text(deleteError, color = Red, fontSize = 12.sp)
                }
            },
            dismissButton = {
                TextButton(enabled = !deletingEntry, onClick = { deleteCandidate = null; deleteError = "" }) { Text("取消") }
            },
            confirmButton = {
                TextButton(enabled = !deletingEntry, onClick = {
                    val target = deleteCandidate ?: return@TextButton
                    deletingEntry = true
                    coroutineScope.launch {
                        try {
                            if (apiPreferences.token.isNotBlank()) apiClient.deleteEntry(apiPreferences, target.id)
                            entries.removeAll { it.id == target.id }
                            actualBalance -= target.balanceChange()
                            val dataScope = if (apiPreferences.token.isBlank()) "LOCAL" else "CLOUD"
                            ledgerStore.save(dataScope, apiPreferences.accountId.ifBlank { "local" }, actualBalance, entries)
                            if (apiPreferences.token.isNotBlank()) apiStatus = "已删除流水"
                            deleteCandidate = null
                            deleteError = ""
                        } catch (error: Throwable) {
                            deleteError = error.message ?: "删除失败，请检查网络后重试"
                        } finally {
                            deletingEntry = false
                        }
                    }
                }) { Text(if (deletingEntry) "删除中…" else "删除", color = Red) }
            },
        )
    }

    if (entrySheetOpen) {
        QuickEntrySheet(
            existing = editingEntry,
            existingEntries = entries.toList(),
            salaryPaydayDefault = salaryDay,
            salaryUserId = apiPreferences.userId.ifBlank { "local-user" },
            salaryAccountId = apiPreferences.accountId.ifBlank { "local" },
            onClose = { entrySheetOpen = false; editingEntry = null },
            onSave = { entry ->
                val oldEntry = entries.firstOrNull { it.id == entry.id }
                val saved = entry.copy(
                    userId = entry.userId.ifBlank { apiPreferences.userId.ifBlank { "local-user" } },
                    accountId = entry.accountId.ifBlank { apiPreferences.accountId.ifBlank { "local" } },
                )
                if (apiPreferences.token.isNotBlank()) apiClient.saveEntry(apiPreferences, saved)
                val existingIndex = entries.indexOfFirst { it.id == saved.id }
                if (existingIndex >= 0) entries[existingIndex] = saved else entries.add(0, saved)
                actualBalance += saved.balanceChange() - (oldEntry?.balanceChange() ?: 0.0)
                val dataScope = if (apiPreferences.token.isBlank()) "LOCAL" else "CLOUD"
                val scopeAccountId = apiPreferences.accountId.ifBlank { "local" }
                ledgerStore.save(dataScope, scopeAccountId, actualBalance, entries)
                if (apiPreferences.token.isNotBlank()) apiStatus = "已保存流水"
            },
            onSaveSalaryBatch = { candidates ->
                val dataScope = if (apiPreferences.token.isBlank()) "LOCAL" else "CLOUD"
                val scopeAccountId = apiPreferences.accountId.ifBlank { "local" }
                val monthSelection = selectNativeSalaryBatchMonths(
                    candidates.mapNotNull(::nativeSalaryMonthKey),
                    entries.toList(),
                )
                val existingIds = entries.mapTo(mutableSetOf(), LedgerEntry::id)
                val existingOrders = entries.mapNotNullTo(mutableSetOf()) { it.orderId?.takeIf(String::isNotBlank) }
                val candidateByMonth = candidates.associateBy { nativeSalaryMonthKey(it) }
                val uniqueEntries = monthSelection.pendingMonthKeys.mapNotNull(candidateByMonth::get).filter { candidate ->
                    val duplicate = candidate.id in existingIds || (!candidate.orderId.isNullOrBlank() && candidate.orderId in existingOrders)
                    if (!duplicate) {
                        existingIds += candidate.id
                        candidate.orderId?.takeIf(String::isNotBlank)?.let(existingOrders::add)
                    }
                    !duplicate
                }
                val skippedCount = monthSelection.selectedMonthKeys.size - uniqueEntries.size

                if (apiPreferences.token.isNotBlank()) {
                    val remoteResult = if (uniqueEntries.isEmpty()) {
                        NativeBillImportResult(imported = 0, skipped = 0, errors = 0)
                    } else {
                        apiClient.importTransactions(apiPreferences, uniqueEntries)
                    }
                    refreshVersion += 1
                    remoteResult.copy(skipped = remoteResult.skipped + skippedCount)
                } else {
                    if (uniqueEntries.isNotEmpty()) {
                        val nextEntries = (uniqueEntries + entries.toList()).distinctBy(LedgerEntry::id).sortedByDescending(LedgerEntry::date)
                        val nextBalance = actualBalance + uniqueEntries.sumOf(LedgerEntry::balanceChange)
                        ledgerStore.saveImportedLedgerBatch(
                            dataScope,
                            scopeAccountId,
                            nextBalance,
                            nextEntries,
                            uniqueEntries,
                            emptyList(),
                        )
                        entries.clear()
                        entries.addAll(nextEntries)
                        actualBalance = nextBalance
                    }
                    NativeBillImportResult(imported = uniqueEntries.size, skipped = skippedCount, errors = 0)
                }
            },
        )
    }

    recordingSavingsPlan?.let { plan ->
        val goal = remoteSavings.firstOrNull { it.id == plan.goalId }
        if (goal != null) {
            SavingsRecordSheet(
                plan = plan,
                goal = goal,
                onClose = { recordingSavingsPlan = null },
                onSave = { updatedPlan, updatedGoal ->
                    val dataScope = if (apiPreferences.token.isBlank()) "LOCAL" else "CLOUD"
                    val scopeAccountId = apiPreferences.accountId.ifBlank { "local" }
                    if (apiPreferences.token.isNotBlank()) {
                        apiClient.saveSavingsGoal(apiPreferences, updatedGoal)
                        apiClient.saveSavingsPlan(apiPreferences, updatedPlan)
                    }
                    ledgerStore.saveSavingsGoal(dataScope, scopeAccountId, updatedGoal)
                    ledgerStore.saveSavingsPlan(dataScope, scopeAccountId, updatedPlan)
                    remoteSavings = remoteSavings.map { if (it.id == updatedGoal.id) updatedGoal else it }
                    remoteSavingsPlans = remoteSavingsPlans.map { if (it.id == updatedPlan.id) updatedPlan else it }
                    if (apiPreferences.token.isNotBlank()) apiStatus = "已记录实际存入"
                    recordingSavingsPlan = null
                },
            )
        }
    }

    if (savingsEditorOpen) {
        NativeSavingsEditorSheet(
            goal = savingsEditorGoal,
            goals = remoteSavings,
            allPlans = remoteSavingsPlans,
            accountId = apiPreferences.accountId.ifBlank { "local" },
            userId = apiPreferences.userId,
            onClose = { savingsEditorOpen = false; savingsEditorGoal = null },
            onSave = { changes ->
                val dataScope = if (apiPreferences.token.isBlank()) "LOCAL" else "CLOUD"
                val scopeAccountId = apiPreferences.accountId.ifBlank { "local" }
                val updatedGoal = changes.goal.copy(
                    userId = apiPreferences.userId.ifBlank { changes.goal.userId },
                    accountId = scopeAccountId,
                )
                if (apiPreferences.token.isNotBlank()) {
                    apiClient.saveSavingsGoal(apiPreferences, updatedGoal)
                    changes.planIdsToDelete.forEach { apiClient.deleteSavingsPlan(apiPreferences, it) }
                    changes.plansToSave.forEach { apiClient.saveSavingsPlan(apiPreferences, it) }
                }
                ledgerStore.saveSavingsGoal(dataScope, scopeAccountId, updatedGoal)
                changes.planIdsToDelete.forEach { ledgerStore.deleteSavingsPlan(dataScope, scopeAccountId, it) }
                changes.plansToSave.forEach { ledgerStore.saveSavingsPlan(dataScope, scopeAccountId, it) }
                remoteSavings = remoteSavings.filterNot { it.id == updatedGoal.id } + updatedGoal
                val changedIds = changes.planIdsToDelete.toSet() + changes.plansToSave.map { it.id }
                remoteSavingsPlans = remoteSavingsPlans.filterNot { it.id in changedIds } + changes.plansToSave
                if (apiPreferences.token.isNotBlank()) apiStatus = "已保存储蓄计划"
            },
            onDelete = { goalId ->
                val dataScope = if (apiPreferences.token.isBlank()) "LOCAL" else "CLOUD"
                val scopeAccountId = apiPreferences.accountId.ifBlank { "local" }
                if (apiPreferences.token.isNotBlank()) apiClient.deleteSavingsGoal(apiPreferences, goalId)
                ledgerStore.deleteSavingsGoal(dataScope, scopeAccountId, goalId)
                remoteSavings = remoteSavings.filterNot { it.id == goalId }
                remoteSavingsPlans = remoteSavingsPlans.filterNot { it.goalId == goalId }
                if (apiPreferences.token.isNotBlank()) apiStatus = "已删除储蓄目标"
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
    remoteAssets: List<NativeAsset>,
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
    val savingsPlanPeriod = nativeSavingsPlanPeriod(selectedMonth, salaryDay)
    val savingsPlanAllocation = remember(remoteSavings, remoteSavingsPlans, savingsPlanPeriod) {
        summarizeNativeSavingsPlanAllocation(remoteSavings, remoteSavingsPlans, savingsPlanPeriod)
    }
    val matchingEntries = entries.toList()
    val matchedSavingsExpenses = remember(savingsPlanAllocation.expenseItems, matchingEntries, savingsPlanPeriod, salaryDay) {
        matchNativeSavingsPlanExpensesWithBills(savingsPlanAllocation.expenseItems, matchingEntries, savingsPlanPeriod, salaryDay)
    }
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
        item {
            WebReplicaBudgetCard(
                income = income,
                expense = expense,
                repayment = repayment,
                savings = savings,
                actualBalance = actualBalance,
                monthlyBudget = monthlyBudget,
                remoteBudgets = remoteBudgets,
                monthLabel = monthLabel,
                savingsPlanAllocation = savingsPlanAllocation,
                matchedSavingsExpenses = matchedSavingsExpenses,
                onManageBudget = { onOpenOverlay(HomeOverlay.BUDGET) },
                onOpenSavings = { onSelectTab(RootTab.SAVINGS) },
            )
        }
        item { WebReplicaDiagnosticBanner(income, expense, monthlyBudget, remoteBudgets) { onOpenOverlay(HomeOverlay.DIAGNOSTIC) } }
        item { WebReplicaCompass(income, expense, actualBalance, monthlyBudget, remoteAssets, remoteLoans, remoteSavings, remoteSavingsPlans, onOpenOverlay, onSelectTab) }
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
    val language = LocalNativeUiPreferences.current.value.language
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
                drawText(translateNativeText(segment.label, language), lineEnd.x + if (lineEnd.x >= center.x) 3.dp.toPx() else -3.dp.toPx(), lineEnd.y + 3.dp.toPx(), paint)
            } }
            startAngle += sweep
        }
        drawCircle(Color.White, radius = baseRadius * .84f, center = center)
    }
}

@Composable
private fun NativeCashflowChart(incomes: List<Double>, expenses: List<Double>, labels: List<String>, modifier: Modifier = Modifier) {
    val language = LocalNativeUiPreferences.current.value.language
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
                drawText(translateNativeText(label, language), groupStart + groupWidth / 2f, size.height - 5.dp.toPx(), paint)
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
private fun WebReplicaBudgetCard(
    income: Double,
    expense: Double,
    repayment: Double,
    savings: Double,
    actualBalance: Double,
    monthlyBudget: Double,
    remoteBudgets: List<NativeBudget>,
    monthLabel: String,
    savingsPlanAllocation: NativeSavingsPlanAllocation,
    matchedSavingsExpenses: List<NativeSavingsExpenseMatch>,
    onManageBudget: () -> Unit,
    onOpenSavings: () -> Unit,
) {
    var planExpanded by remember { mutableStateOf(false) }
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
        if (savingsPlanAllocation.planCount > 0) {
            HorizontalDivider(Modifier.padding(vertical = 11.dp), color = Line)
            val periodLabel = if (savingsPlanAllocation.period.matches(Regex("\\d{4}"))) {
                "${savingsPlanAllocation.period} 年度计划"
            } else {
                "${savingsPlanAllocation.period} 储蓄计划"
            }
            val statusParts = buildList {
                if (savingsPlanAllocation.completedPlanCount > 0 || savingsPlanAllocation.recordedDeposit > 0.0) {
                    add("已存 ¥ ${moneyFormat.format(savingsPlanAllocation.recordedDeposit)} · ${savingsPlanAllocation.completedPlanCount} 项已完成")
                }
                if (savingsPlanAllocation.pendingPlanCount > 0 || savingsPlanAllocation.pendingDeposit > 0.0) {
                    add("待存 ¥ ${moneyFormat.format(savingsPlanAllocation.pendingDeposit)} · ${savingsPlanAllocation.pendingPlanCount} 项待存")
                }
                if (savingsPlanAllocation.skippedPlanCount > 0) add("${savingsPlanAllocation.skippedPlanCount} 项已跳过")
                if (isEmpty()) add("预计存 ¥ ${moneyFormat.format(savingsPlanAllocation.plannedDeposit)}")
            }
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Column(
                    Modifier.weight(1f).clip(RoundedCornerShape(10.dp)).clickable { planExpanded = !planExpanded }.padding(vertical = 3.dp),
                ) {
                    Text("储蓄计划安排", color = Ink, fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                    Text(
                        "$periodLabel · ${statusParts.joinToString(" · ")}",
                        color = Color(0xFF7B8CA3),
                        fontSize = 9.sp,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                    )
                }
                Text(
                    "储蓄计划  ›",
                    modifier = Modifier.clip(RoundedCornerShape(8.dp)).clickable(onClick = onOpenSavings).padding(horizontal = 5.dp, vertical = 7.dp),
                    color = Blue,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.SemiBold,
                )
                Icon(
                    Icons.Default.KeyboardArrowDown,
                    contentDescription = if (planExpanded) "收起储蓄计划" else "展开储蓄计划",
                    tint = Color(0xFF64748B),
                    modifier = Modifier.size(18.dp).rotate(if (planExpanded) 180f else 0f).clickable { planExpanded = !planExpanded },
                )
            }
            AnimatedVisibility(visible = planExpanded) {
                Column(verticalArrangement = Arrangement.spacedBy(9.dp)) {
                    Text("计划表金额仅供参考，不参与上方实际分配计算", color = Color(0xFF8492A7), fontSize = 9.sp)
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(7.dp)) {
                        SavingsPlanMetric("固定支出", savingsPlanAllocation.fixedExpense, Modifier.weight(1f), Color(0xFF667085))
                        SavingsPlanMetric("临时支出", savingsPlanAllocation.temporaryExpense, Modifier.weight(1f), Amber)
                        SavingsPlanMetric("预计存入", savingsPlanAllocation.plannedDeposit, Modifier.weight(1f), Green)
                    }
                    if (savingsPlanAllocation.expenseItems.isNotEmpty()) {
                        Text("计划支出明细", color = Ink, fontSize = 10.sp, fontWeight = FontWeight.SemiBold)
                        matchedSavingsExpenses.forEachIndexed { index, match ->
                            if (index > 0) HorizontalDivider(color = Color(0xFFF0F3F7))
                            SavingsPlanExpenseMatchRow(match)
                        }
                    }
                    if (savingsPlanAllocation.plannedSalary > 0.0 || savingsPlanAllocation.previousBalance > 0.0) {
                        val remaining = savingsPlanAllocation.projectedRemaining
                        Text(
                            "计划工资 ¥ ${moneyFormat.format(savingsPlanAllocation.plannedSalary)} · 上月结余 ¥ ${moneyFormat.format(savingsPlanAllocation.previousBalance)}" +
                                (remaining?.let { " · 预计余款 ¥ ${moneyFormat.format(it)}" } ?: ""),
                            color = Color(0xFF8492A7),
                            fontSize = 9.sp,
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun SavingsPlanMetric(label: String, value: Double, modifier: Modifier, color: Color) {
    Column(
        modifier.clip(RoundedCornerShape(10.dp)).background(Color(0xFFF6F8FB)).padding(horizontal = 8.dp, vertical = 7.dp),
        verticalArrangement = Arrangement.spacedBy(2.dp),
    ) {
        Text(label, color = Color(0xFF64748B), fontSize = 9.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
        Text("¥ ${moneyFormat.format(value)}", color = color, fontSize = 11.sp, fontWeight = FontWeight.Bold, maxLines = 1)
    }
}

@Composable
private fun SavingsPlanExpenseMatchRow(match: NativeSavingsExpenseMatch) {
    val statusColor = when (match.status) {
        NativeSavingsExpenseMatchStatus.MATCHED -> Green
        NativeSavingsExpenseMatchStatus.PARTIAL -> Amber
        NativeSavingsExpenseMatchStatus.OVER -> Red
        NativeSavingsExpenseMatchStatus.UNMATCHED -> if (match.item.kind == NativeSavingsExpenseKind.TEMPORARY) Amber else Color(0xFF94A3B8)
    }
    val statusLabel = when (match.status) {
        NativeSavingsExpenseMatchStatus.MATCHED -> "已达计划"
        NativeSavingsExpenseMatchStatus.PARTIAL -> "部分记账"
        NativeSavingsExpenseMatchStatus.OVER -> "超出计划"
        NativeSavingsExpenseMatchStatus.UNMATCHED -> if (match.item.kind == NativeSavingsExpenseKind.TEMPORARY) "临时" else "固定"
    }
    val marker = when (match.status) {
        NativeSavingsExpenseMatchStatus.MATCHED -> "✓"
        NativeSavingsExpenseMatchStatus.OVER -> "!"
        NativeSavingsExpenseMatchStatus.PARTIAL -> "·"
        NativeSavingsExpenseMatchStatus.UNMATCHED -> ""
    }
    Row(Modifier.fillMaxWidth().padding(vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
        Row(Modifier.weight(1f), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(18.dp).clip(CircleShape).background(statusColor.copy(alpha = 0.13f)), contentAlignment = Alignment.Center) {
                if (marker.isNotEmpty()) Text(marker, color = statusColor, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                else Box(Modifier.size(6.dp).clip(CircleShape).background(statusColor))
            }
            Spacer(Modifier.width(6.dp))
            Column(Modifier.weight(1f)) {
                Text(match.item.name, color = Ink, fontSize = 10.sp, fontWeight = FontWeight.Medium, maxLines = 1, overflow = TextOverflow.Ellipsis)
                Text(statusLabel, color = statusColor, fontSize = 8.sp, maxLines = 1)
            }
        }
        Column(horizontalAlignment = Alignment.End) {
            Text("¥ ${moneyFormat.format(match.item.amount)}", color = Ink, fontSize = 10.sp, fontWeight = FontWeight.SemiBold)
            if (match.matchedTransactionCount > 0) {
                Text(
                    "账单合计 ¥ ${moneyFormat.format(match.matchedAmount)} · ${match.matchedTransactionCount} 笔",
                    color = statusColor,
                    fontSize = 8.sp,
                    maxLines = 1,
                )
            }
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
private fun WebReplicaCompass(income: Double, expense: Double, actualBalance: Double, monthlyBudget: Double, remoteAssets: List<NativeAsset>, remoteLoans: List<NativeLoan>, remoteSavings: List<NativeSavingsGoal>, remoteSavingsPlans: List<NativeSavingsPlan>, onOpenOverlay: (HomeOverlay) -> Unit, onSelectTab: (RootTab) -> Unit) {
    val netWorth = nativeAssetOverview(remoteAssets, remoteSavings, remoteLoans, actualBalance).netWorth
    val base = if (monthlyBudget > 0) monthlyBudget else income
    val usedPercent = if (base > 0) (expense / base * 100).toInt().coerceIn(0, 100) else 0
    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
            CompassTile("净资产", "¥ " + moneyFormat.format(netWorth), "资产减去关联负债", Green, Icons.Default.CheckCircle, Modifier.weight(1f)) { onSelectTab(RootTab.ASSETS) }
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
private fun LedgerRow(
    entry: LedgerEntry,
    showActions: Boolean = false,
    onEdit: (LedgerEntry) -> Unit = {},
    onDelete: (LedgerEntry) -> Unit = {},
) {
    val effectiveType = entry.analysisType()
    val (icon, iconTone) = when {
        effectiveType == EntryType.INCOME -> Icons.Default.Payments to Green
        entry.isRepayment() -> Icons.Default.ArrowDownward to Amber
        effectiveType == EntryType.TRANSFER -> Icons.AutoMirrored.Filled.Notes to Blue
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
            Text("${entry.analysisCategory()} · ${entry.platform} · ${entry.dayLabel}", color = Muted, fontSize = 11.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
        }
        Text(
            text = when (effectiveType) {
                EntryType.INCOME -> "+¥${moneyFormat.format(entry.amount)}"
                EntryType.TRANSFER -> "↔¥${moneyFormat.format(entry.amount)}"
                else -> "-¥${moneyFormat.format(entry.amount)}"
            },
            color = when (effectiveType) {
                EntryType.INCOME -> Green
                EntryType.TRANSFER -> Blue
                else -> Ink
            },
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold,
        )
        if (showActions) {
            IconButton(onClick = { onEdit(entry) }) {
                Icon(Icons.Default.Edit, contentDescription = "编辑流水", tint = Blue, modifier = Modifier.size(18.dp))
            }
            IconButton(onClick = { onDelete(entry) }) {
                Icon(Icons.Default.Delete, contentDescription = "删除流水", tint = Red, modifier = Modifier.size(18.dp))
            }
        }
    }
}

@Composable
private fun ConsumptionScreen(
    modifier: Modifier,
    entries: List<LedgerEntry>,
    month: String,
    onMonthClick: () -> Unit,
    onSearch: () -> Unit,
    onEditEntry: (LedgerEntry) -> Unit,
    onDeleteEntry: (LedgerEntry) -> Unit,
) {
    var selectedType by remember { mutableStateOf("全部") }
    var selectedCategory by remember { mutableStateOf<String?>(null) }
    var selectedAccount by remember { mutableStateOf("全部账户") }
    var query by remember { mutableStateOf("") }
    LaunchedEffect(month) {
        selectedType = "全部"
        selectedCategory = null
        selectedAccount = "全部账户"
        query = ""
    }
    val selectedYear = month.toIntOrNull()?.takeIf { month.length == 4 }
    val monthValue = runCatching { YearMonth.parse(month) }.getOrElse { YearMonth.now() }
    val periodLabel = if (selectedYear != null) "${selectedYear}年全年" else "${monthValue.year}年${monthValue.monthValue}月"
    val monthEntries = entries.filter { it.transactionDate.startsWith(month) }
    val expenseEntries = monthEntries.filter { it.analysisType() == EntryType.EXPENSE }
    val incomeEntries = monthEntries.filter { it.analysisType() == EntryType.INCOME }
    val accountOptions = listOf("全部账户") + monthEntries.map { normalizeConsumptionPlatform(it.platform) }.distinct().sorted()
    val visibleEntries = when (selectedType) {
        "支出" -> monthEntries.filter { it.analysisType() == EntryType.EXPENSE }
        "收入" -> monthEntries.filter { it.analysisType() == EntryType.INCOME }
        else -> monthEntries
    }.let { rows -> if (selectedCategory == null) rows else rows.filter { it.analysisCategory() == selectedCategory } }
        .let { rows -> if (selectedAccount == "全部账户") rows else rows.filter { normalizeConsumptionPlatform(it.platform) == selectedAccount } }
        .let { rows ->
            if (query.isBlank()) rows else rows.filter { entry ->
                listOf(entry.title, entry.merchant, entry.description, entry.analysisCategory(), entry.platform)
                    .any { it.contains(query.trim(), ignoreCase = true) }
            }
        }
        .sortedByDescending { it.date }
    val analysisEntries = visibleEntries.filter { it.analysisType() == EntryType.EXPENSE || it.analysisType() == EntryType.INCOME }
    val categoryType = if (selectedType == "收入") EntryType.INCOME else EntryType.EXPENSE
    val categoryEntries = analysisEntries.filter { it.analysisType() == categoryType }
    val categories = categoryEntries.groupBy { it.analysisCategory() }
        .mapValues { (_, rows) -> rows.sumOf { it.amount } }
        .toList()
        .sortedByDescending { it.second }
    val expenseTotal = expenseEntries.sumOf { it.amount }
    val incomeTotal = incomeEntries.sumOf { it.amount }
    val trendMonths = if (selectedYear != null) {
        (1..12).map { LocalDate.of(selectedYear, it, 1) }
    } else {
        (1..monthValue.lengthOfMonth()).map { day -> monthValue.atDay(day) }
    }
    val trendIncome = trendMonths.map { date ->
        analysisEntries.asSequence().filter { it.analysisType() == EntryType.INCOME }
            .filter { entry -> if (selectedYear != null) entry.transactionDate.startsWith("${date.year}-%02d".format(date.monthValue)) else entry.transactionDate == date.toString() }
            .sumOf { it.amount }
    }
    val trendExpense = trendMonths.map { date ->
        analysisEntries.asSequence().filter { it.analysisType() == EntryType.EXPENSE }
            .filter { entry -> if (selectedYear != null) entry.transactionDate.startsWith("${date.year}-%02d".format(date.monthValue)) else entry.transactionDate == date.toString() }
            .sumOf { it.amount }
    }
    val trendLabels = trendMonths.mapIndexed { index, date ->
        val dayLabel = index == 0 || date.dayOfMonth % 5 == 0 ||
            (index == trendMonths.lastIndex && date.dayOfMonth % 5 >= 2)
        if (selectedYear != null) "${date.monthValue}月" else if (dayLabel) "${date.dayOfMonth}日" else ""
    }
    val platformType = if (selectedType == "收入") EntryType.INCOME else EntryType.EXPENSE
    val platformTotals = analysisEntries.filter { it.analysisType() == platformType }
        .groupBy { normalizeConsumptionPlatform(it.platform) }
        .mapValues { (_, rows) -> rows.sumOf { it.amount } }
        .toList()
        .sortedByDescending { it.second }
    val flowEdges = analysisEntries.filter { it.analysisType() == platformType }
        .groupBy { normalizeConsumptionPlatform(it.platform) to it.analysisCategory() }
        .map { (key, rows) -> ConsumptionFlowEdge(key.first, key.second, rows.sumOf { it.amount }, rows.size) }
        .sortedByDescending { it.amount }
        .take(10)
    val merchantTotals = analysisEntries.filter { it.analysisType() == platformType }
        .groupBy { it.merchant.trim().ifBlank { "其他商家" } }
        .map { (name, rows) -> name to rows.sumOf { it.amount } }
        .sortedByDescending { it.second }
        .take(10)

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
                    Text("按月份或全年查看收支与账单", color = Muted, fontSize = 12.sp)
                }
                IconButton(onClick = onSearch) { Icon(Icons.Default.Search, contentDescription = "搜索账单", tint = Ink) }
            }
        }
        item {
            androidx.compose.material3.OutlinedTextField(
                value = query,
                onValueChange = { query = it },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                placeholder = { Text("搜索商户、分类或备注") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = Muted) },
                shape = RoundedCornerShape(15.dp),
            )
        }
        item {
            Row(
                Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.SpaceBetween,
            ) {
                FilterChip(periodLabel, selected = true, onClick = onMonthClick)
                Text("${monthEntries.size} 笔账单", color = Muted, fontSize = 12.sp)
            }
        }
        item {
            WebReplicaCard(padding = 16.dp, radius = 20.dp) {
                Text("${periodLabel}支出", color = Muted, fontSize = 12.sp, fontWeight = FontWeight.Medium)
                Spacer(Modifier.height(4.dp))
                Text("¥ ${moneyFormat.format(expenseTotal)}", color = Ink, fontSize = 28.sp, fontWeight = FontWeight.Black)
                Spacer(Modifier.height(13.dp))
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    SummaryAmountCard("收入", incomeTotal, Green, Modifier.weight(1f))
                    SummaryAmountCard("支出笔数", expenseEntries.size.toDouble(), Blue, Modifier.weight(1f), integer = true)
                }
            }
        }
        item { ConsumptionTrendCard(trendIncome, trendExpense, trendLabels, periodLabel) }
        item {
            WebReplicaCard(padding = 15.dp, radius = 18.dp) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column {
                        Text(if (selectedType == "收入") "收入来源构成" else "支出分类构成", color = Ink, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                        Text("${categories.size} 个分类 · 点击筛选账单", color = Muted, fontSize = 11.sp)
                    }
                    if (selectedCategory != null) TextButton(onClick = { selectedCategory = null }) { Text("清除筛选") }
                }
                Spacer(Modifier.height(8.dp))
                if (categories.isNotEmpty()) {
                    EChartsExpenseRoseChart(categories, categories.sumOf { it.second })
                }
                if (categories.isEmpty()) {
                    Text("当前范围没有${if (selectedType == "收入") "收入" else "支出"}记录", color = Muted, fontSize = 12.sp, modifier = Modifier.padding(vertical = 8.dp))
                } else {
                    categories.take(8).forEach { (name, amount) ->
                        CategoryAmountRow(
                            name = name,
                            amount = amount,
                            total = categories.sumOf { it.second },
                            selected = selectedCategory == name,
                            onClick = { selectedCategory = if (selectedCategory == name) null else name },
                        )
                    }
                }
            }
        }
        item { ConsumptionRhythmCard(analysisEntries, month, selectedType == "收入") }
        if (platformTotals.isNotEmpty()) {
            item {
                WebReplicaCard(padding = 15.dp, radius = 18.dp) {
                    Text(if (selectedType == "收入") "账户收入拆分" else "账户支出拆分", color = Ink, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                    Text("按支付账户汇总当前${if (selectedYear != null) "年度" else "月份"}", color = Muted, fontSize = 11.sp, modifier = Modifier.padding(top = 3.dp, bottom = 9.dp))
                    platformTotals.forEach { (account, amount) ->
                        CategoryAmountRow(
                            name = account,
                            amount = amount,
                            total = platformTotals.sumOf { it.second },
                            selected = selectedAccount == account,
                            onClick = { selectedAccount = if (selectedAccount == account) "全部账户" else account },
                        )
                    }
                }
            }
        }
        if (flowEdges.isNotEmpty()) {
            item {
                ConsumptionFlowCard(
                    edges = flowEdges,
                    flowTypeLabel = if (selectedType == "收入") "收入" else "支出",
                    selectedAccount = selectedAccount,
                    selectedCategory = selectedCategory,
                    onPlatformClick = { platform -> selectedAccount = if (selectedAccount == platform) "全部账户" else platform },
                    onCategoryClick = { category -> selectedCategory = if (selectedCategory == category) null else category },
                )
            }
        }
        if (merchantTotals.isNotEmpty()) {
            item {
                WebReplicaCard(padding = 15.dp, radius = 18.dp) {
                    Text(if (selectedType == "收入") "收入来源排行" else "商家消费排行", color = Ink, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                    Text("金额最高的前 ${merchantTotals.size} 项", color = Muted, fontSize = 11.sp, modifier = Modifier.padding(top = 3.dp, bottom = 8.dp))
                    val merchantTotal = merchantTotals.sumOf { it.second }
                    merchantTotals.forEachIndexed { index, (merchant, amount) ->
                        CategoryAmountRow(
                            name = "${index + 1}. $merchant",
                            amount = amount,
                            total = merchantTotal,
                            selected = false,
                            onClick = { query = merchant.takeUnless { it == "其他商家" }.orEmpty() },
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
        item {
            Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                accountOptions.forEach { account ->
                    FilterChip(account, selectedAccount == account) { selectedAccount = account }
                }
            }
        }
        if (visibleEntries.isEmpty()) {
            item {
                WebReplicaCard(padding = 22.dp) {
                    Text(if (selectedCategory != null) "这个分类没有匹配账单" else "当前范围还没有账单", color = Ink, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                    Text("记一笔后，收支和分类统计会显示在这里。", color = Muted, fontSize = 12.sp, modifier = Modifier.padding(top = 5.dp))
                }
            }
        } else {
            item {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Text("账单明细", color = Ink, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                    Text("${visibleEntries.size} 笔", color = Muted, fontSize = 11.sp)
                }
            }
            items(visibleEntries, key = { it.id }) { entry ->
                LedgerRow(entry, showActions = true, onEdit = onEditEntry, onDelete = onDeleteEntry)
            }
        }
    }
}

private fun normalizeConsumptionPlatform(value: String): String {
    val platform = value.trim()
    return when {
        platform == "微信" || platform.contains("微信") -> "微信"
        platform == "支付宝" || platform.contains("支付宝") -> "支付宝"
        platform == "银行卡" || Regex("银行|信用卡|储蓄卡").containsMatchIn(platform) -> "银行卡"
        platform == "现金" || platform.contains("现金") -> "现金"
        platform.isBlank() || platform == "其他" -> "其他"
        else -> "其他"
    }
}

@Composable
private fun ConsumptionTrendCard(income: List<Double>, expense: List<Double>, labels: List<String>, periodLabel: String) {
    WebReplicaCard(padding = 14.dp, radius = 20.dp) {
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
            Column {
                Text("收支趋势", color = Ink, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                Text("$periodLabel · 按当前筛选范围", color = Muted, fontSize = 11.sp, modifier = Modifier.padding(top = 3.dp))
            }
            Row(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                TrendLegend("收入", Color(0xFF2A78D6))
                TrendLegend("支出", Color(0xFFEB6834))
            }
        }
        Spacer(Modifier.height(10.dp))
        EChartsCashflowTrend(income, expense, labels)
    }
}

@Composable
private fun ConsumptionRhythmCard(entries: List<LedgerEntry>, period: String, incomeMode: Boolean) {
    val selectedYear = period.toIntOrNull()?.takeIf { period.length == 4 }
    val targetType = if (incomeMode) EntryType.INCOME else EntryType.EXPENSE
    val matchingEntries = entries.filter { it.analysisType() == targetType }
    val cellColors = listOf(Color(0xFFF1F5F9), Color(0xFFDDEBFA), Color(0xFFACCEF2), Color(0xFF74A9E4), Color(0xFF397BC8))

    WebReplicaCard(padding = 15.dp, radius = 18.dp) {
        Text(if (incomeMode) "收入节律" else "消费节律", color = Ink, fontSize = 15.sp, fontWeight = FontWeight.Bold)
        Text(if (selectedYear != null) "每月${if (incomeMode) "收入" else "支出"}热度" else "每天${if (incomeMode) "收入" else "支出"}热度", color = Muted, fontSize = 11.sp, modifier = Modifier.padding(top = 3.dp, bottom = 10.dp))
        if (selectedYear != null) {
            val monthly = (1..12).map { monthNumber ->
                val prefix = "%04d-%02d".format(selectedYear, monthNumber)
                monthNumber to matchingEntries.filter { it.transactionDate.startsWith(prefix) }.sumOf { it.amount }
            }
            val maximum = monthly.maxOfOrNull { it.second }?.coerceAtLeast(1.0) ?: 1.0
            monthly.chunked(3).forEach { row ->
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(7.dp)) {
                    row.forEach { (monthNumber, amount) ->
                        val level = if (amount <= 0.0) 0 else ((amount / maximum) * 4).toInt().coerceIn(1, 4)
                        Column(
                            Modifier.weight(1f).height(54.dp).clip(RoundedCornerShape(10.dp)).background(cellColors[level]).padding(horizontal = 7.dp, vertical = 6.dp),
                            verticalArrangement = Arrangement.SpaceBetween,
                        ) {
                            Text("${monthNumber}月", color = Ink, fontSize = 10.sp, fontWeight = FontWeight.SemiBold)
                            Text(if (amount == 0.0) "—" else "¥${compactMoney(amount)}", color = if (level >= 3) Color.White else Muted, fontSize = 9.sp, maxLines = 1, overflow = TextOverflow.Clip)
                        }
                    }
                    repeat(3 - row.size) { Spacer(Modifier.weight(1f)) }
                }
                Spacer(Modifier.height(7.dp))
            }
        } else {
            val monthValue = runCatching { YearMonth.parse(period) }.getOrElse { YearMonth.now() }
            val days = (1..monthValue.lengthOfMonth()).map { day ->
                val key = monthValue.atDay(day).toString()
                day to matchingEntries.filter { it.transactionDate == key }.sumOf { it.amount }
            }
            val maximum = days.maxOfOrNull { it.second }?.coerceAtLeast(1.0) ?: 1.0
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                listOf("一", "二", "三", "四", "五", "六", "日").forEach { weekday ->
                    Text(weekday, Modifier.weight(1f), color = Muted, fontSize = 10.sp, textAlign = TextAlign.Center)
                }
            }
            val leading = monthValue.atDay(1).dayOfWeek.value - 1
            val cells = buildList<Pair<Int?, Double>> {
                repeat(leading) { add(null to 0.0) }
                addAll(days.map { it.first to it.second })
                repeat((7 - size % 7) % 7) { add(null to 0.0) }
            }
            cells.chunked(7).forEach { week ->
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    week.forEach { (day, amount) ->
                        if (day == null) {
                            Spacer(Modifier.weight(1f).height(35.dp))
                        } else {
                            val level = if (amount <= 0.0) 0 else ((amount / maximum) * 4).toInt().coerceIn(1, 4)
                            Column(
                                Modifier.weight(1f).height(35.dp).clip(RoundedCornerShape(7.dp)).background(cellColors[level]).padding(horizontal = 3.dp, vertical = 3.dp),
                                verticalArrangement = Arrangement.SpaceBetween,
                            ) {
                                Text(day.toString(), color = if (level >= 3) Color.White else Ink, fontSize = 9.sp, lineHeight = 10.sp)
                                if (amount > 0.0) Text(compactMoney(amount), color = if (level >= 3) Color.White else Muted, fontSize = 7.sp, maxLines = 1)
                            }
                        }
                    }
                }
                Spacer(Modifier.height(4.dp))
            }
        }
    }
}

private fun compactMoney(amount: Double): String = when {
    amount >= 10000 -> "${(amount / 10000).let { String.format("%.1f", it).trimEnd('0').trimEnd('.') }}万"
    amount >= 1000 -> "${(amount / 1000).let { String.format("%.1f", it).trimEnd('0').trimEnd('.') }}k"
    else -> amount.toLong().toString()
}

private data class ConsumptionFlowEdge(
    val platform: String,
    val category: String,
    val amount: Double,
    val count: Int,
)

@Composable
private fun ConsumptionFlowCard(
    edges: List<ConsumptionFlowEdge>,
    flowTypeLabel: String,
    selectedAccount: String,
    selectedCategory: String?,
    onPlatformClick: (String) -> Unit,
    onCategoryClick: (String) -> Unit,
) {
    val total = edges.sumOf { it.amount }.coerceAtLeast(.01)
    val platformColors = mapOf(
        "微信" to Color(0xFF10A66A),
        "支付宝" to Color(0xFF2A78D6),
        "银行卡" to Color(0xFF008300),
        "现金" to Color(0xFFEDA100),
        "其他" to Color(0xFF7164B8),
    )
    WebReplicaCard(padding = 15.dp, radius = 18.dp) {
        Text(if (flowTypeLabel == "收入") "收入流向" else "消费流向", color = Ink, fontSize = 15.sp, fontWeight = FontWeight.Bold)
        Text("账户 → 分类 · 按${flowTypeLabel}金额关联，点击两端筛选", color = Muted, fontSize = 11.sp, modifier = Modifier.padding(top = 3.dp, bottom = 10.dp))
        edges.forEach { edge ->
            val color = platformColors[edge.platform] ?: Blue
            val fraction = (edge.amount / total).toFloat().coerceIn(0f, 1f)
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Text(
                    edge.platform,
                    modifier = Modifier.widthIn(min = 52.dp, max = 92.dp).clip(RoundedCornerShape(8.dp))
                        .background(if (selectedAccount == edge.platform) color.copy(alpha = .16f) else color.copy(alpha = .08f))
                        .clickable { onPlatformClick(edge.platform) }
                        .padding(horizontal = 7.dp, vertical = 6.dp),
                    color = color,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                Text("  →  ", color = Muted, fontSize = 12.sp)
                Text(
                    edge.category,
                    modifier = Modifier.weight(1f).clip(RoundedCornerShape(8.dp))
                        .background(if (selectedCategory == edge.category) SoftBlue else Color(0xFFF4F7FB))
                        .clickable { onCategoryClick(edge.category) }
                        .padding(horizontal = 7.dp, vertical = 6.dp),
                    color = Ink,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                )
                Spacer(Modifier.width(8.dp))
                Column(horizontalAlignment = Alignment.End) {
                    Text("¥ ${moneyFormat.format(edge.amount)}", color = Ink, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                    Text("${edge.count} 笔", color = Muted, fontSize = 9.sp)
                }
            }
            Spacer(Modifier.height(5.dp))
            Box(Modifier.fillMaxWidth().height(4.dp).clip(CircleShape).background(Line)) {
                Box(Modifier.fillMaxWidth(fraction).height(4.dp).clip(CircleShape).background(color.copy(alpha = .8f)))
            }
            Spacer(Modifier.height(9.dp))
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
private fun SavingsOverviewScreen(
    modifier: Modifier,
    goals: List<NativeSavingsGoal>,
    plans: List<NativeSavingsPlan>,
    connected: Boolean,
    onConnect: () -> Unit,
    onRecordPlan: (NativeSavingsPlan) -> Unit,
    onNewGoal: () -> Unit,
    onEditGoal: (NativeSavingsGoal) -> Unit,
) {
    var previewProofImage by remember { mutableStateOf<String?>(null) }
    val activeGoals = goals.filter { it.status == "ACTIVE" }
    val displayGoals = (activeGoals.ifEmpty { goals }).take(4)
    val target = goals.sumOf { savingsGoalTarget(it, plans) }
    val saved = goals.sumOf { savingsGoalSaved(it, plans) }
    val progress = if (target <= 0.0) 0.0 else (saved / target * 100).coerceIn(0.0, 100.0)
    val currentMonth = YearMonth.now().toString()
    val currentMonthPlans = plans.filter { it.month == currentMonth }
    val currentMonthSaved = currentMonthPlans.sumOf(::savingsPlanRecordedAmount)
    val currentMonthPlanned = currentMonthPlans.sumOf { it.amount.coerceAtLeast(0.0) }
    val completedPlans = plans.count { it.status == "COMPLETED" }
    val pendingPlans = plans.count { it.status == "PENDING" }
    val skippedPlans = plans.count { it.status == "SKIPPED" }
    val pendingAmount = plans.filter { it.status == "PENDING" }.sumOf { it.amount.coerceAtLeast(0.0) }
    val completionRate = if (plans.isEmpty()) 0.0 else completedPlans.toDouble() / plans.size * 100
    val remainingTarget = (target - saved).coerceAtLeast(0.0)
    val plansByYear = plans.groupBy { plan ->
        plan.month.takeIf { it.matches(Regex("\\d{4}-(0[1-9]|1[0-2])")) }?.take(4) ?: "未设置"
    }.entries.sortedWith(compareByDescending { it.key.toIntOrNull() ?: -1 })
    LazyColumn(modifier.fillMaxSize(), contentPadding = PaddingValues(start = 18.dp, end = 18.dp, top = 8.dp, bottom = 104.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
        item { NativePageHeader("储蓄计划", "目标、累计存入与完成进度") }
        item {
            Text(
                "＋ 新建储蓄目标",
                modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(Blue)
                    .clickable(onClick = onNewGoal).padding(vertical = 13.dp),
                color = Color.White,
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                textAlign = TextAlign.Center,
            )
        }
        item {
            WebReplicaCard(padding = 13.dp, radius = 16.dp) {
                Text("规划提醒", color = Amber, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Text("本页面用于安排储蓄计划和记录实际存入，不会实际转移资金。", color = Muted, fontSize = 11.sp, modifier = Modifier.padding(top = 4.dp))
            }
        }
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
        item {
            WebReplicaCard(padding = 15.dp, radius = 18.dp) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                    Column {
                        Text("本月计划", color = Ink, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                        Text(currentMonth, color = Muted, fontSize = 11.sp, modifier = Modifier.padding(top = 3.dp))
                    }
                    Text("已存 ¥ ${moneyFormat.format(currentMonthSaved)}", color = Green, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
                Spacer(Modifier.height(9.dp))
                Box(Modifier.fillMaxWidth().height(6.dp).clip(CircleShape).background(Line)) {
                    val fraction = if (currentMonthPlanned <= 0.0) 0f else (currentMonthSaved / currentMonthPlanned).toFloat().coerceIn(0f, 1f)
                    Box(Modifier.fillMaxWidth(fraction).height(6.dp).clip(CircleShape).background(Green))
                }
                Text("计划 ¥ ${moneyFormat.format(currentMonthPlanned)}", color = Muted, fontSize = 11.sp, modifier = Modifier.padding(top = 7.dp))
            }
        }
        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                WebReplicaCard(modifier = Modifier.weight(1f), padding = 11.dp, radius = 15.dp) {
                    Text("目标缺口", color = Muted, fontSize = 10.sp)
                    Text("¥ ${moneyFormat.format(remainingTarget)}", color = Amber, fontSize = 13.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                }
                WebReplicaCard(modifier = Modifier.weight(1f), padding = 11.dp, radius = 15.dp) {
                    Text("待存金额", color = Muted, fontSize = 10.sp)
                    Text("¥ ${moneyFormat.format(pendingAmount)}", color = Blue, fontSize = 13.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                }
                WebReplicaCard(modifier = Modifier.weight(1f), padding = 11.dp, radius = 15.dp) {
                    Text("计划完成率", color = Muted, fontSize = 10.sp)
                    Text("${percentLabel(completionRate)}%", color = Green, fontSize = 13.sp, fontWeight = FontWeight.Bold, maxLines = 1)
                    Text("$completedPlans 已完成 · $pendingPlans 待存${if (skippedPlans > 0) " · $skippedPlans 跳过" else ""}", color = Muted, fontSize = 8.sp, maxLines = 1)
                }
            }
        }
        if (!connected) item {
            CloudConnectNotice("本地目标仅保存在本机；登录后查看当前云端账本", onConnect)
        }
        if (displayGoals.isEmpty()) {
            item {
                EmptyPageCard(
                    title = if (connected) "还没有活跃储蓄目标" else "尚无本地储蓄目标",
                    detail = "创建目标后，可安排单月或隔月计划并记录实际存入。",
                )
            }
        } else {
            item { Text("目标组", color = Ink, fontSize = 16.sp, fontWeight = FontWeight.Bold) }
            items(displayGoals, key = { it.id }) { goal ->
                val goalTarget = savingsGoalTarget(goal, plans)
                val goalSaved = savingsGoalSaved(goal, plans)
                val goalProgress = if (goalTarget <= 0.0) 0.0 else (goalSaved / goalTarget * 100).coerceIn(0.0, 100.0)
                WebReplicaCard(modifier = Modifier.clickable { onEditGoal(goal) }, padding = 15.dp, radius = 17.dp) {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Column(Modifier.weight(1f)) {
                            Text(goal.name, color = Ink, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                            Text("${depositTypeLabel(goal.depositType)}${goal.deadline.takeIf { it.isNotBlank() }?.let { " · 截止 $it" }.orEmpty()}", color = Muted, fontSize = 11.sp)
                        }
                        Column(horizontalAlignment = Alignment.End) {
                            Text("${percentLabel(goalProgress)}%", color = Green, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                            Text("编辑计划 ›", color = Blue, fontSize = 10.sp)
                        }
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
        item { Text("月度计划", color = Ink, fontSize = 16.sp, fontWeight = FontWeight.Bold) }
        if (plans.isEmpty()) {
            item {
                EmptyPageCard(
                    title = "暂无月度计划",
                    detail = "创建月度计划后，可在这里记录实际存入金额和凭证。",
                )
            }
        } else {
            plansByYear.forEach { (year, yearPlans) ->
                item {
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                        Text(if (year == "未设置") year else "$year 年", color = Ink, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                        Text("${yearPlans.size} 项计划", color = Muted, fontSize = 10.sp)
                    }
                }
                items(yearPlans.sortedByDescending { it.month }, key = { it.id }) { plan ->
                    val goal = goals.firstOrNull { it.id == plan.goalId }
                    val recordedAmount = savingsPlanRecordedAmount(plan)
                    WebReplicaCard(padding = 14.dp, radius = 16.dp) {
                        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                            Column(Modifier.weight(1f)) {
                                Text(goal?.name ?: "储蓄计划", color = Ink, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                                Text("${plan.month} · ${savingsPlanStatusLabel(plan.status)}", color = Muted, fontSize = 11.sp, modifier = Modifier.padding(top = 3.dp))
                            }
                            Text(if (plan.status == "COMPLETED") "+¥ ${moneyFormat.format(recordedAmount)}" else "计划 ¥ ${moneyFormat.format(plan.amount)}", color = if (plan.status == "COMPLETED") Green else Blue, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                        Spacer(Modifier.height(9.dp))
                        Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.SpaceBetween) {
                            Text("已存 ¥ ${moneyFormat.format(recordedAmount)} / ¥ ${moneyFormat.format(plan.amount)}", color = Muted, fontSize = 10.sp)
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                if (!plan.proofImage.isNullOrBlank()) {
                                    TextButton(onClick = { previewProofImage = plan.proofImage }) { Text("查看凭证", fontSize = 11.sp) }
                                }
                                TextButton(onClick = { onRecordPlan(plan) }, enabled = goal != null) {
                                    Text(if (plan.status == "COMPLETED") "修改记录" else "实际存入", fontSize = 11.sp)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    previewProofImage?.let { proof -> NativeProofImageViewer(proof, onDismiss = { previewProofImage = null }) }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun SavingsRecordSheet(
    plan: NativeSavingsPlan,
    goal: NativeSavingsGoal,
    onClose: () -> Unit,
    onSave: suspend (NativeSavingsPlan, NativeSavingsGoal) -> Unit,
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    var amountText by remember(plan.id) { mutableStateOf((plan.actualAmount ?: plan.amount).takeIf { it > 0.0 }?.toString().orEmpty()) }
    var recordedDate by remember(plan.id) {
        mutableStateOf((plan.actualDate ?: plan.updatedAt).take(16).ifBlank {
            java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
        })
    }
    var proofImage by remember(plan.id) { mutableStateOf(plan.proofImage) }
    var previewProof by remember { mutableStateOf<String?>(null) }
    var loadingProof by remember { mutableStateOf(false) }
    var saving by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }
    val imagePicker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        if (uri != null) coroutineScope.launch {
            loadingProof = true
            errorMessage = ""
            runCatching { withContext(Dispatchers.IO) { compressSavingsProofImage(context, uri) } }
                .onSuccess { proofImage = it }
                .onFailure { errorMessage = it.message ?: "图片处理失败" }
            loadingProof = false
        }
    }
    val parsedDateTime = runCatching {
        java.time.LocalDateTime.parse(recordedDate, DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm"))
    }.getOrElse { java.time.LocalDateTime.now() }
    val amount = amountText.toDoubleOrNull() ?: 0.0

    ModalBottomSheet(
        onDismissRequest = onClose,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
        containerColor = Color(0xFFFBFCFE),
        dragHandle = { Box(Modifier.padding(top = 10.dp).width(36.dp).height(4.dp).clip(CircleShape).background(Color(0xFFD7DFEA))) },
    ) {
        Column(
            Modifier.fillMaxWidth().heightIn(max = 760.dp).verticalScroll(rememberScrollState())
                .navigationBarsPadding().padding(start = 22.dp, end = 22.dp, bottom = 30.dp),
            verticalArrangement = Arrangement.spacedBy(13.dp),
        ) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Column {
                    Text(if (plan.status == "COMPLETED") "修改实际存入" else "记录实际存入", color = Ink, fontWeight = FontWeight.Black, fontSize = 22.sp)
                    Text("${goal.name} · ${plan.month}", color = Muted, fontSize = 12.sp)
                }
                IconButton(onClick = onClose) { Icon(Icons.Default.Close, contentDescription = "关闭", tint = Muted) }
            }
            WebReplicaCard(padding = 13.dp, radius = 15.dp) {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("计划金额", color = Muted, fontSize = 11.sp)
                    Text("¥ ${moneyFormat.format(plan.amount)}", color = Ink, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                }
            }
            NativeInput(
                label = "实际存入金额",
                value = amountText,
                onValueChange = { amountText = it.filter { char -> char.isDigit() || char == '.' } },
                placeholder = "0.00",
                isAmount = true,
            )
            Column {
                Text("实际存入日期", color = Ink, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                TextButton(onClick = {
                    android.app.DatePickerDialog(
                        context,
                        { _, year, month, day ->
                            val time = recordedDate.substringAfter(' ', "12:00")
                            recordedDate = "%04d-%02d-%02d %s".format(java.util.Locale.ROOT, year, month + 1, day, time)
                        },
                        parsedDateTime.year,
                        parsedDateTime.monthValue - 1,
                        parsedDateTime.dayOfMonth,
                    ).show()
                }) { Text(recordedDate) }
                TextButton(onClick = {
                    android.app.TimePickerDialog(
                        context,
                        { _, hour, minute ->
                            val date = recordedDate.substringBefore(' ')
                            recordedDate = "$date %02d:%02d".format(java.util.Locale.ROOT, hour, minute)
                        },
                        parsedDateTime.hour,
                        parsedDateTime.minute,
                        true,
                    ).show()
                }) { Text("调整时间") }
            }
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text("图片凭证", color = Ink, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                if (!proofImage.isNullOrBlank()) {
                    val bitmap = remember(proofImage) { decodeSavingsProofImage(proofImage.orEmpty()) }
                    if (bitmap != null) {
                        Image(
                            bitmap = bitmap.asImageBitmap(),
                            contentDescription = "储蓄凭证预览",
                            modifier = Modifier.fillMaxWidth().height(180.dp).clip(RoundedCornerShape(14.dp)).clickable { previewProof = proofImage },
                            contentScale = ContentScale.Crop,
                        )
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        TextButton(onClick = { previewProof = proofImage }) { Text("查看大图") }
                        TextButton(onClick = { proofImage = null }) { Text("清除图片", color = Red) }
                    }
                } else {
                    TextButton(onClick = { imagePicker.launch("image/*") }, enabled = !loadingProof) {
                        Text(if (loadingProof) "正在处理图片…" else "＋ 添加图片凭证")
                    }
                }
            }
            if (errorMessage.isNotBlank()) Text(errorMessage, color = Red, fontSize = 12.sp)
            Text(
                if (saving) "保存中…" else if (amount > 0) "保存实际存入 ¥ ${moneyFormat.format(amount)}" else "请输入大于 0 的金额",
                modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp))
                    .background(if (amount > 0 && !saving && !loadingProof) Green else Color(0xFFCCD5E2))
                    .clickable(enabled = amount > 0 && !saving && !loadingProof) {
                        val now = java.time.LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                        val previousRecorded = savingsPlanRecordedAmount(plan)
                        val nextPlan = plan.copy(
                            status = "COMPLETED",
                            actualAmount = amount,
                            actualDate = if (recordedDate.length == 16) "$recordedDate:00" else recordedDate,
                            proofImage = proofImage,
                            updatedAt = now,
                        )
                        val nextGoal = goal.copy(
                            currentAmount = (goal.currentAmount - previousRecorded + amount).coerceAtLeast(0.0),
                            updatedAt = now,
                        )
                        saving = true
                        errorMessage = ""
                        coroutineScope.launch {
                            try {
                                onSave(nextPlan, nextGoal)
                                onClose()
                            } catch (error: Throwable) {
                                errorMessage = error.message ?: "保存失败，请检查网络后重试"
                            } finally {
                                saving = false
                            }
                        }
                    }
                    .padding(vertical = 15.dp),
                textAlign = TextAlign.Center,
                color = Color.White,
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
            )
        }
    }
    previewProof?.let { proof -> NativeProofImageViewer(proof, onDismiss = { previewProof = null }) }
}

private fun compressSavingsProofImage(context: Context, uri: Uri): String {
    val originalLength = context.contentResolver.openAssetFileDescriptor(uri, "r")?.use { it.length }
    require(originalLength == null || originalLength <= 12L * 1024 * 1024) { "图片不能超过 12MB" }
    val bounds = BitmapFactory.Options().apply { inJustDecodeBounds = true }
    context.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, bounds) }
    require(bounds.outWidth > 0 && bounds.outHeight > 0) { "图片读取失败" }
    var sampleSize = 1
    while (maxOf(bounds.outWidth, bounds.outHeight) / sampleSize > 1440) sampleSize *= 2
    val options = BitmapFactory.Options().apply { inSampleSize = sampleSize }
    val decoded = context.contentResolver.openInputStream(uri)?.use { BitmapFactory.decodeStream(it, null, options) }
        ?: throw IllegalArgumentException("图片读取失败")
    val scale = minOf(1f, 720f / decoded.width)
    val scaled = if (scale < 1f) android.graphics.Bitmap.createScaledBitmap(
        decoded,
        (decoded.width * scale).toInt().coerceAtLeast(1),
        (decoded.height * scale).toInt().coerceAtLeast(1),
        true,
    ) else decoded
    val bytes = ByteArrayOutputStream().use { output ->
        scaled.compress(android.graphics.Bitmap.CompressFormat.JPEG, 62, output)
        output.toByteArray()
    }
    if (scaled !== decoded) scaled.recycle()
    decoded.recycle()
    return "data:image/jpeg;base64," + Base64.encodeToString(bytes, Base64.NO_WRAP)
}

private fun decodeSavingsProofImage(source: String): android.graphics.Bitmap? = runCatching {
    val encoded = source.substringAfter("base64,", source)
    val bytes = Base64.decode(encoded, Base64.DEFAULT)
    BitmapFactory.decodeByteArray(bytes, 0, bytes.size)
}.getOrNull()

@Composable
private fun NativeProofImageViewer(source: String, onDismiss: () -> Unit) {
    val bitmap = remember(source) { decodeSavingsProofImage(source) }
    Dialog(onDismissRequest = onDismiss, properties = DialogProperties(usePlatformDefaultWidth = false)) {
        Column(
            Modifier.fillMaxSize().background(Color.Black.copy(alpha = .96f)).clickable { onDismiss() }
                .padding(18.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            if (bitmap != null) {
                Image(bitmap.asImageBitmap(), contentDescription = "图片凭证大图", modifier = Modifier.fillMaxWidth().weight(1f), contentScale = ContentScale.Fit)
            } else {
                Text("图片无法读取", color = Color.White)
            }
            TextButton(onClick = onDismiss) { Text("关闭", color = Color.White) }
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

private fun savingsPlanStatusLabel(value: String): String = when (value) {
    "COMPLETED" -> "已完成"
    "SKIPPED" -> "已跳过"
    else -> "待存入"
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
    var logoutConfirmOpen by remember { mutableStateOf(false) }
    AlertDialog(
        onDismissRequest = onDismiss,
        shape = RoundedCornerShape(26.dp),
        containerColor = Color(0xFFFBFCFE),
        title = { Text(if (preferences.token.isBlank()) "连接云端账户" else "切换云端账户", fontWeight = FontWeight.Bold) },
        text = {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                Text(
                    if (preferences.token.isBlank()) "登录后会切换到服务器单独保存的云端账本；本地账本不会改变。"
                    else "登录其他账户会切换到该账户独立的云端账本；本地账本不会改变。",
                    color = Muted,
                    fontSize = 12.sp,
                    lineHeight = 18.sp,
                )
                OutlinedTextField(
                    value = baseUrl,
                    onValueChange = { baseUrl = it },
                    label = { Text("API 地址") },
                    placeholder = { Text("输入云端 API 服务地址") },
                    supportingText = { Text("请输入手机当前网络可以访问的后端地址。") },
                    singleLine = true,
                    modifier = Modifier.fillMaxWidth(),
                )
                OutlinedTextField(value = email, onValueChange = { email = it }, label = { Text("邮箱") }, singleLine = true, modifier = Modifier.fillMaxWidth())
                OutlinedTextField(value = password, onValueChange = { password = it }, label = { Text("密码") }, singleLine = true, modifier = Modifier.fillMaxWidth(), keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password))
                Text(status, color = if (status.startsWith("已同步")) Green else Muted, fontSize = 11.sp)
            }
        },
        dismissButton = {
            Row {
                if (preferences.token.isNotBlank()) TextButton(onClick = { logoutConfirmOpen = true }) { Text("退出云端", color = Red) }
                TextButton(onClick = onDismiss) { Text("取消") }
            }
        },
        confirmButton = {
            TextButton(onClick = { if (baseUrl.isNotBlank() && email.isNotBlank() && password.isNotBlank()) onLogin(baseUrl, email, password) }) { Text("登录并同步") }
        },
    )
    if (logoutConfirmOpen) {
        AlertDialog(
            onDismissRequest = { logoutConfirmOpen = false },
            shape = RoundedCornerShape(24.dp),
            containerColor = Color(0xFFFBFCFE),
            title = { Text("退出云端账户？", fontWeight = FontWeight.Bold) },
            text = { Text("退出后继续使用本地账本，云端数据不会删除。") },
            dismissButton = { TextButton(onClick = { logoutConfirmOpen = false }) { Text("取消") } },
            confirmButton = {
                TextButton(onClick = {
                    logoutConfirmOpen = false
                    onLogout()
                }) { Text("退出云端", color = Red) }
            },
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun QuickEntrySheet(
    existing: LedgerEntry?,
    existingEntries: List<LedgerEntry>,
    salaryPaydayDefault: Int,
    salaryUserId: String,
    salaryAccountId: String,
    onClose: () -> Unit,
    onSave: suspend (LedgerEntry) -> Unit,
    onSaveSalaryBatch: suspend (List<LedgerEntry>) -> NativeBillImportResult,
) {
    val context = LocalContext.current
    val coroutineScope = rememberCoroutineScope()
    var type by remember(existing?.id) { mutableStateOf(existing?.type?.takeUnless { it == EntryType.REPAYMENT } ?: EntryType.EXPENSE) }
    var ordinaryType by remember(existing?.id) { mutableStateOf(existing?.type?.takeUnless { it == EntryType.REPAYMENT } ?: EntryType.EXPENSE) }
    var ordinaryCategory by remember(existing?.id) { mutableStateOf(existing?.category?.substringBefore(" ·") ?: "餐饮") }
    var entryMode by remember(existing?.id) { mutableStateOf("NORMAL") }
    var salaryEntryMode by remember(existing?.id) { mutableStateOf("SINGLE") }
    var merchant by remember(existing?.id) { mutableStateOf(existing?.merchant.orEmpty()) }
    var description by remember(existing?.id) { mutableStateOf(existing?.description.orEmpty()) }
    var amountText by remember(existing?.id) { mutableStateOf(existing?.amount?.toString().orEmpty()) }
    var category by remember(existing?.id) { mutableStateOf(existing?.category?.substringBefore(" ·") ?: "餐饮") }
    var platform by remember(existing?.id) { mutableStateOf(existing?.platform ?: "支付宝") }
    var selectedDate by remember(existing?.id) { mutableStateOf(existing?.transactionDate ?: LocalDate.now().toString()) }
    var selectedTime by remember(existing?.id) { mutableStateOf(existing?.date?.substringAfter(" ")?.take(5)?.takeIf(String::isNotBlank) ?: "12:00") }
    var salaryYearText by remember(existing?.id) { mutableStateOf(LocalDate.now().year.toString()) }
    var salaryMonths by remember(existing?.id) { mutableStateOf(setOf(LocalDate.now().monthValue)) }
    var salaryPaydayText by remember(existing?.id, salaryPaydayDefault) { mutableStateOf(salaryPaydayDefault.coerceIn(1, 28).toString()) }
    var saving by remember { mutableStateOf(false) }
    var saveError by remember { mutableStateOf("") }
    var batchStatus by remember { mutableStateOf("") }
    var batchFailedRows by remember { mutableStateOf(emptyList<NativeImportFailedRow>()) }
    var batchHasError by remember { mutableStateOf(false) }
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val categories = when (type) {
        EntryType.INCOME -> listOf("工资", "奖金", "兼职", "经营收入", "报销", "退款", "租金", "利息分红", "补贴", "二手转卖", "理财", "其他")
        EntryType.TRANSFER -> listOf("转账")
        else -> listOf("餐饮", "外卖", "买菜", "购物", "交通", "公交地铁", "打车", "住房", "房租", "水费", "电费", "燃气", "网费", "日用", "医疗", "教育", "娱乐", "会员订阅", "保险", "还款", "其他")
    }
    val dateParts = runCatching { LocalDate.parse(selectedDate) }.getOrElse { LocalDate.now() }
    val salaryYear = salaryYearText.toIntOrNull()?.takeIf { it in 2000..9999 }
    val selectedSalaryMonthKeys = salaryYear?.let { year ->
        runCatching { nativeSalaryBatchMonthKeys(year, salaryMonths.toList()) }.getOrDefault(emptyList())
    }.orEmpty()
    val existingSalaryMonthKeys = nativeExistingSalaryMonthKeys(existingEntries)
    val salaryMonthSelection = selectNativeSalaryBatchMonths(selectedSalaryMonthKeys, existingSalaryMonthKeys)
    val isSalaryMode = existing == null && entryMode == "SALARY"
    val isBatchMode = isSalaryMode && salaryEntryMode == "BATCH"
    val amount = amountText.toDoubleOrNull() ?: 0.0
    val payday = salaryPaydayText.toIntOrNull()

    ModalBottomSheet(
        onDismissRequest = onClose,
        sheetState = sheetState,
        containerColor = Color(0xFFFBFCFE),
        dragHandle = { Box(Modifier.padding(top = 10.dp).width(36.dp).height(4.dp).clip(CircleShape).background(Color(0xFFD7DFEA))) },
    ) {
        Column(
            Modifier.fillMaxWidth()
                .heightIn(max = 760.dp)
                .verticalScroll(rememberScrollState())
                .padding(start = 22.dp, end = 22.dp, bottom = 32.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp),
        ) {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Column {
                    Text(if (isBatchMode) "历史工资补录" else if (existing == null) "记一笔" else "编辑流水", color = Ink, fontWeight = FontWeight.Black, fontSize = 23.sp)
                    Text(if (isSalaryMode) "填写工资金额、入账账户和发薪时间" else "填写金额、分类、账户和发生时间", color = Muted, fontSize = 11.sp)
                }
                IconButton(onClick = onClose) { Icon(Icons.Default.Close, contentDescription = "关闭", tint = Muted) }
            }
            if (existing == null) {
                Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(Color(0xFFEAF0F7)).padding(4.dp)) {
                    listOf("NORMAL" to "普通记账", "SALARY" to "工资收入").forEach { (mode, label) ->
                        val selected = entryMode == mode
                        Text(
                            label,
                            modifier = Modifier.weight(1f).clip(RoundedCornerShape(14.dp)).background(if (selected) Color.White else Color.Transparent).clickable {
                                if (entryMode != mode) {
                                    entryMode = mode
                                    batchStatus = ""
                                    batchFailedRows = emptyList()
                                    batchHasError = false
                                    saveError = ""
                                    if (mode == "SALARY") {
                                        ordinaryType = type
                                        ordinaryCategory = category
                                        type = EntryType.INCOME
                                        category = "工资"
                                        selectedTime = "09:00"
                                    } else {
                                        type = ordinaryType
                                        category = ordinaryCategory
                                    }
                                }
                            }.padding(vertical = 12.dp),
                            textAlign = TextAlign.Center,
                            color = if (selected) Blue else Muted,
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                        )
                    }
                }
            }
            if (isSalaryMode) {
                Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp)).background(Color(0xFFEAF0F7)).padding(4.dp)) {
                    listOf("SINGLE" to "单月录入", "BATCH" to "批量补录").forEach { (mode, label) ->
                        val selected = salaryEntryMode == mode
                        Text(
                            label,
                            modifier = Modifier.weight(1f).clip(RoundedCornerShape(12.dp)).background(if (selected) Color.White else Color.Transparent).clickable {
                                salaryEntryMode = mode
                                saveError = ""
                                batchStatus = ""
                                batchFailedRows = emptyList()
                                batchHasError = false
                            }.padding(vertical = 10.dp),
                            textAlign = TextAlign.Center,
                            color = if (selected) Green else Muted,
                            fontWeight = FontWeight.Bold,
                            fontSize = 13.sp,
                        )
                    }
                }
            }
            if (isBatchMode) {
                Text("选择年份和月份后，将按同一金额生成工资收入；已存在工资的月份会自动跳过。", color = Muted, fontSize = 11.sp)
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text("补录年份", color = Ink, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        OutlinedTextField(
                            value = salaryYearText,
                            onValueChange = { salaryYearText = it.filter(Char::isDigit).take(4); batchStatus = ""; batchFailedRows = emptyList(); batchHasError = false },
                            placeholder = { Text("2000–9999") },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp),
                        )
                    }
                    Row(Modifier.weight(1f), horizontalArrangement = Arrangement.End) {
                        TextButton(onClick = { salaryMonths = (1..12).toSet(); batchStatus = ""; batchFailedRows = emptyList(); batchHasError = false }) { Text("全选") }
                        TextButton(onClick = { salaryMonths = emptySet(); batchStatus = ""; batchFailedRows = emptyList(); batchHasError = false }) { Text("清空") }
                    }
                }
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    (1..12).toList().chunked(4).forEach { monthRow ->
                        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                            monthRow.forEach { month ->
                                val monthKey = salaryYear?.let { runCatching { YearMonth.of(it, month).toString() }.getOrNull() }
                                val alreadyRecorded = monthKey != null && monthKey in existingSalaryMonthKeys
                                val selected = month in salaryMonths
                                Column(
                                    Modifier.weight(1f).heightIn(min = 46.dp).clip(RoundedCornerShape(12.dp))
                                        .background(if (selected) SoftBlue else Color.White)
                                        .clickable {
                                            salaryMonths = if (selected) salaryMonths - month else salaryMonths + month
                                            batchStatus = ""
                                            batchFailedRows = emptyList()
                                            batchHasError = false
                                        }.padding(vertical = 6.dp),
                                    horizontalAlignment = Alignment.CenterHorizontally,
                                    verticalArrangement = Arrangement.Center,
                                ) {
                                    Text("${month}月", color = if (selected) Blue else Ink, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                    if (alreadyRecorded) Text("已入账", color = Muted, fontSize = 8.sp, maxLines = 1)
                                }
                            }
                        }
                    }
                }
                Text(
                    when {
                        salaryYear == null -> "年份需填写 2000–9999。"
                        selectedSalaryMonthKeys.isEmpty() -> "请选择要补录的月份。"
                        salaryMonthSelection.skippedMonthKeys.size == selectedSalaryMonthKeys.size -> "所选 ${selectedSalaryMonthKeys.size} 个月都已有工资收入，未重复新增。"
                        else -> "已选择 ${selectedSalaryMonthKeys.size} 个月，确认后将先检查是否已有工资记录。"
                    },
                    color = Muted,
                    fontSize = 11.sp,
                )
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(10.dp), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text("每月工资（元）", color = Ink, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        OutlinedTextField(
                            value = amountText,
                            onValueChange = { amountText = it.filter { char -> char.isDigit() || char == '.' }; batchStatus = ""; batchFailedRows = emptyList(); batchHasError = false },
                            placeholder = { Text("0.00") },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp),
                        )
                    }
                    Column(Modifier.weight(1f)) {
                        Text("发薪日", color = Ink, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        OutlinedTextField(
                            value = salaryPaydayText,
                            onValueChange = { salaryPaydayText = it.filter(Char::isDigit).take(2); batchStatus = ""; batchFailedRows = emptyList(); batchHasError = false },
                            placeholder = { Text("1–28") },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(14.dp),
                        )
                    }
                }
                Text("入账账户", color = Ink, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                ChoiceRow(listOf("支付宝", "微信", "银行卡", "现金", "其他"), platform, onSelect = { platform = it })
                NativeInput(label = "发薪单位（选填）", value = merchant, onValueChange = { merchant = it }, placeholder = "未填写则标记为工资补录")
                if (saveError.isNotBlank()) Text(saveError, color = Red, fontSize = 12.sp)
                if (batchStatus.isNotBlank()) Text(batchStatus, color = if (batchHasError) Red else Green, fontSize = 12.sp)
                batchFailedRows.take(3).forEach { failed ->
                    Text("第 ${failed.lineNumber} 笔失败：${failed.errorMessage}", color = Red, fontSize = 10.sp)
                }
            } else {
                if (isSalaryMode) {
                    Text("工资收入 · 工资分类", color = Green, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                } else {
                    Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(Color(0xFFEAF0F7)).padding(4.dp)) {
                        EntryType.entries.filter { it != EntryType.REPAYMENT }.forEach { item ->
                            val selected = item == type
                            Text(
                                item.label,
                                modifier = Modifier.weight(1f).clip(RoundedCornerShape(14.dp)).background(if (selected) Color.White else Color.Transparent).clickable {
                                    type = item
                                    ordinaryType = item
                                    category = when (item) {
                                        EntryType.INCOME -> "工资"
                                        EntryType.TRANSFER -> "转账"
                                        else -> "餐饮"
                                    }
                                    ordinaryCategory = category
                                }.padding(vertical = 12.dp),
                                textAlign = TextAlign.Center,
                                color = if (selected) item.color else Muted,
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                            )
                        }
                    }
                }
                NativeInput(label = "商户 / 名称", value = merchant, onValueChange = { merchant = it }, placeholder = "例如：便利店、公司工资")
                NativeInput(label = "金额", value = amountText, onValueChange = { amountText = it.filter { char -> char.isDigit() || char == '.' } }, placeholder = "0.00", isAmount = true)
                if (isSalaryMode) {
                    Text("工资", modifier = Modifier.clip(RoundedCornerShape(12.dp)).background(Color(0xFFE8F7EF)).padding(horizontal = 12.dp, vertical = 8.dp), color = Green, fontSize = 11.sp, fontWeight = FontWeight.Bold)
                } else {
                    Text("分类", color = Ink, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                    ChoiceRow(categories, category, onSelect = { category = it })
                }
                Text("账户 / 平台", color = Ink, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                ChoiceRow(listOf("支付宝", "微信", "银行卡", "现金", "其他"), platform, onSelect = { platform = it })
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(9.dp)) {
                    Column(Modifier.weight(1f)) {
                        Text("日期", color = Ink, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        TextButton(onClick = {
                            android.app.DatePickerDialog(
                                context,
                                { _, year, month, day -> selectedDate = LocalDate.of(year, month + 1, day).toString() },
                                dateParts.year,
                                dateParts.monthValue - 1,
                                dateParts.dayOfMonth,
                            ).show()
                        }) { Text(selectedDate) }
                    }
                    Column(Modifier.weight(1f)) {
                        Text("時間", color = Ink, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        TextButton(onClick = {
                            val hour = selectedTime.substringBefore(":").toIntOrNull() ?: 12
                            val minute = selectedTime.substringAfter(":", "00").toIntOrNull() ?: 0
                            android.app.TimePickerDialog(
                                context,
                                { _, chosenHour, chosenMinute -> selectedTime = "%02d:%02d".format(chosenHour, chosenMinute) },
                                hour,
                                minute,
                                true,
                            ).show()
                        }) { Text(selectedTime) }
                    }
                }
                NativeInput(label = "备注", value = description, onValueChange = { description = it }, placeholder = "可选")
                if (saveError.isNotBlank()) Text(saveError, color = Red, fontSize = 12.sp)
            }
            Text(
                text = when {
                    saving -> "保存中…"
                    isBatchMode && selectedSalaryMonthKeys.isNotEmpty() && amount > 0 && payday != null -> "确认补录 ${selectedSalaryMonthKeys.size} 个月工资"
                    isBatchMode -> "请输入工资金额并选择月份"
                    amount > 0 -> "${if (existing == null) "保存" else "保存修改"} ¥ ${moneyFormat.format(amount)}"
                    else -> "请输入金额"
                },
                modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(16.dp))
                    .background(if ((!isBatchMode && amount > 0 || isBatchMode && amount > 0 && selectedSalaryMonthKeys.isNotEmpty() && payday != null) && !saving) if (isSalaryMode) Green else type.color else Color(0xFFCCD5E2))
                    .clickable(enabled = !saving && if (isBatchMode) amount > 0 && selectedSalaryMonthKeys.isNotEmpty() && payday != null else amount > 0) {
                        if (isBatchMode) {
                            val safeYear = salaryYear
                            if (safeYear == null) {
                                saveError = "年份需填写 2000–9999。"
                                return@clickable
                            }
                            if (salaryMonths.isEmpty()) {
                                saveError = "请选择要补录的月份。"
                                return@clickable
                            }
                            if (amount <= 0.0 || !amount.isFinite()) {
                                saveError = "请输入大于 0 的每月工资金额"
                                return@clickable
                            }
                            if (payday == null || payday !in 1..28) {
                                saveError = "发薪日需在 1–28 日之间"
                                return@clickable
                            }
                            val monthKeys = nativeSalaryBatchMonthKeys(safeYear, salaryMonths)
                            val candidates = buildNativeSalaryBatchEntries(
                                monthKeys = monthKeys,
                                amount = amount,
                                payday = payday,
                                platform = platform,
                                merchant = merchant,
                                userId = salaryUserId,
                                accountId = salaryAccountId,
                            )
                            coroutineScope.launch {
                                saving = true
                                saveError = ""
                                batchStatus = "正在补录 ${candidates.size} 笔工资收入..."
                                batchFailedRows = emptyList()
                                batchHasError = false
                                try {
                                    val result = onSaveSalaryBatch(candidates)
                                    batchStatus = buildString {
                                        append("已补录 ${result.imported} 笔")
                                        if (result.skipped > 0) append("，跳过 ${result.skipped} 个已有工资月份")
                                        if (result.errors > 0) append("，失败 ${result.errors} 笔")
                                        append("。")
                                    }
                                    batchFailedRows = result.failedRows
                                    batchHasError = result.errors > 0
                                } catch (error: Throwable) {
                                    batchStatus = ""
                                    saveError = "批量补录失败：${error.message ?: "请检查连接后重试"}"
                                    batchHasError = true
                                } finally {
                                    saving = false
                                }
                            }
                            return@clickable
                        }
                        val now = java.time.LocalDateTime.now().toString().replace('T', ' ')
                        val dateTime = "$selectedDate $selectedTime:00"
                        val entry = LedgerEntry(
                            id = existing?.id ?: "native-${java.util.UUID.randomUUID()}",
                            title = merchant.ifBlank { description.ifBlank { category } },
                            category = "${if (isSalaryMode) "工资" else category} · $platform",
                            amount = amount,
                            type = type,
                            dayLabel = dateTime.take(16),
                            transactionDate = selectedDate,
                            date = dateTime,
                            merchant = merchant.trim(),
                            description = description.trim(),
                            platform = platform,
                            orderId = existing?.orderId,
                            paymentMethod = existing?.paymentMethod,
                            status = existing?.status,
                            loanId = existing?.loanId,
                            remarkCategory = existing?.remarkCategory,
                            userId = existing?.userId.orEmpty(),
                            accountId = existing?.accountId.orEmpty(),
                            createdAt = existing?.createdAt?.ifBlank { now } ?: now,
                            updatedAt = now,
                        )
                        coroutineScope.launch {
                            saving = true
                            saveError = ""
                            try {
                                onSave(entry)
                                onClose()
                            } catch (error: Throwable) {
                                saveError = error.message ?: "保存失败，请检查网络后重试"
                            } finally {
                                saving = false
                            }
                        }
                    }
                    .padding(vertical = 16.dp),
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
