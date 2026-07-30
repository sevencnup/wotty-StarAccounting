package com.wotty.stark.ui.screen

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.ScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ReceiptLong
import androidx.compose.material.icons.outlined.AccountBalance
import androidx.compose.material.icons.outlined.AccountBalanceWallet
import androidx.compose.material.icons.outlined.Fastfood
import androidx.compose.material.icons.outlined.KeyboardArrowDown
import androidx.compose.material.icons.outlined.LocalAtm
import androidx.compose.material.icons.outlined.Savings
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material.icons.outlined.ShoppingBag
import androidx.compose.material.icons.outlined.SportsEsports
import androidx.compose.material.icons.outlined.Storefront
import androidx.compose.material.icons.outlined.Train
import androidx.compose.material.icons.outlined.Visibility
import androidx.compose.material.icons.outlined.Workspaces
import androidx.compose.material.icons.rounded.ChevronRight
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wotty.stark.data.model.Asset
import com.wotty.stark.data.model.Budget
import com.wotty.stark.data.model.Loan
import com.wotty.stark.data.model.SavingsGoal
import com.wotty.stark.data.model.Transaction
import com.wotty.stark.data.model.TransactionType
import com.wotty.stark.ui.components.EChartView
import com.wotty.stark.ui.viewmodel.MainViewModel
import kotlinx.serialization.json.add
import kotlinx.serialization.json.buildJsonArray
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlinx.datetime.Clock
import kotlinx.datetime.LocalDate
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import kotlin.math.absoluteValue
import kotlin.math.roundToInt

private val HomeBg = Color(0xFFEEF5FF)
private val HomeCardBg = Color.White
private val HomeText = Color(0xFF11182D)
private val HomeSubtle = Color(0xFF65718A)
private val HomeBlue = Color(0xFF3D86FF)
private val HomeOrange = Color(0xFFFF7A32)
private val HomeDeltaUp = Color(0xFFFF6848)
private val HomeDeltaDown = Color(0xFF67CAA9)
private val HomeGreen = Color(0xFF63C7A8)
private val HomeProgressTrack = Color(0xFFEAF0F7)
private val HomeLoanTrack = Color(0xFFE8EFF8)
private val HomeLoanRowBg = Color(0xFFF7FAFF)
private val HomeLoanRowBorder = Color(0xFFE8EEF7)
private val HomeRecentPositive = Color(0xFFFF4D2F)
private val HomeDetailBorder = Color(0xFF9FC4FF)
private val HomeDetailText = Color(0xFF3485FF)

private val HeroGradient = listOf(Color(0xFF3F86FF), Color(0xFF5DA0FF), Color(0xFF4D8CF7))
private val HeroStackGradient = listOf(Color(0xFF4E8FF8), Color(0xFF67A3FF), Color(0xFF7DB0FF))
private val LoanTrackGradient = listOf(Color(0xFF73D2B3), Color(0xFF58BF9F))

private val RatioPalette = listOf(
    Color(0xFF2A78D6),
    Color(0xFFEB6834),
    Color(0xFF1BAF7A),
    Color(0xFFEDA100),
    Color(0xFFE87BA4)
)

private data class HomeSummary(
    val expense: Double,
    val income: Double,
    val expenseChange: Int,
    val incomeChange: Int,
    val trend: TrendBundle,
    val ratios: List<ExpenseRatio>,
    val savingProgress: ProgressSummary,
    val loanProgress: ProgressSummary,
    val netWorth: Double,
    val assetTotal: Double,
    val liabilityTotal: Double,
    val totalSavings: Double,
    val savingsDelta: Double,
    val loanTotal: Double,
    val loanDelta: Double,
    val loanItems: List<LoanMini>,
    val recent: List<RecentRow>
)

private data class TrendBundle(
    val labels: List<String>,
    val expense: List<Double>,
    val income: List<Double>
)

private data class ExpenseRatio(
    val name: String,
    val amount: Double,
    val percent: Int,
    val color: Color
)

private data class ProgressSummary(
    val title: String,
    val current: Double,
    val total: Double,
    val percent: Int
)

private data class RecentRow(
    val title: String,
    val subtitle: String,
    val amount: Double,
    val time: String,
    val positive: Boolean,
    val icon: ImageVector,
    val bubbleColor: Color,
    val iconColor: Color
)

private data class LoanMini(
    val platform: String,
    val total: Double,
    val remaining: Double,
    val periods: Int,
    val paidPeriods: Int,
    val monthly: Double,
    val dueLabel: String
)

@Composable
fun DashboardScreen(viewModel: MainViewModel, scrollState: ScrollState) {
    val state by viewModel.state.collectAsState()
    val summary = remember(
        state.transactions,
        state.assets,
        state.loans,
        state.savingsGoals,
        state.budgets
    ) {
        buildHomeSummary(
            transactions = state.transactions,
            assets = state.assets,
            loans = state.loans,
            goals = state.savingsGoals,
            budgets = state.budgets
        )
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(HomeBg)
    ) {
        Column(
            modifier = Modifier
                .verticalScroll(scrollState)
                .statusBarsPadding()
                .padding(start = 12.dp, end = 12.dp, top = 0.dp, bottom = 84.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            HomeTopBar()
            HeroStack(summary)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                RatioCard(summary, Modifier.weight(1f))
                ProgressCard(summary, Modifier.weight(1f))
            }
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                SummaryCard("资产汇总", summary.assetTotal, 8.6, Modifier.weight(1f))
                SummaryCard("储蓄汇总", summary.totalSavings, 5.4, Modifier.weight(1f))
            }
            LoanSummaryCard(summary)
            RecentTransactionsCard(summary.recent)
        }
    }
}

@Composable
private fun HomeTopBar() {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Spacer(Modifier.weight(1f))
        Text("首页", color = HomeText, fontSize = 18.sp, fontWeight = FontWeight.Medium)
        Spacer(Modifier.weight(1f))
        Row(
            modifier = Modifier,
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier.size(26.dp),
                contentAlignment = Alignment.Center
            ) {
                Icon(Icons.Outlined.Search, null, tint = HomeText, modifier = Modifier.size(19.dp))
            }
        }
    }
}

@Composable
private fun HeroStack(summary: HomeSummary) {
    Box(
        modifier = Modifier.fillMaxWidth()
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(190.dp)
                .padding(bottom = 26.dp)
                .background(
                    brush = Brush.verticalGradient(HeroStackGradient),
                    shape = RoundedCornerShape(14.dp)
                )
        )
        Column(
            modifier = Modifier.padding(bottom = 10.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            MonthlySummaryCard(summary)
            TrendCard(summary.trend)
        }
    }
}

@Composable
private fun MonthlySummaryCard(summary: HomeSummary) {
    val now = Clock.System.now().toLocalDateTime(TimeZone.currentSystemDefault())
    val monthLabel = "${now.year}年${now.monthNumber}月"

    Box(
        modifier = Modifier
            .fillMaxWidth()
            .background(
                brush = Brush.linearGradient(HeroGradient),
                shape = RoundedCornerShape(13.dp)
            )
            .padding(horizontal = 16.dp, vertical = 14.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    Text("本月收支汇总", color = Color.White, fontSize = 16.sp, fontWeight = FontWeight.Medium)
                    Icon(Icons.Outlined.Visibility, null, tint = Color.White, modifier = Modifier.size(20.dp))
                }
                Spacer(Modifier.weight(1f))
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(2.dp)) {
                    Text(monthLabel, color = Color.White, fontSize = 13.sp)
                    Icon(Icons.Outlined.KeyboardArrowDown, null, tint = Color.White, modifier = Modifier.size(15.dp))
                }
            }
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Column(Modifier.weight(1f)) {
                    Text("总收入", color = Color.White.copy(alpha = 0.92f), fontSize = 12.sp)
                    Spacer(Modifier.height(6.dp))
                    Text("¥ ${formatMoney(summary.income)}", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Medium)
                    DeltaLine(summary.incomeChange, onDark = true)
                }
                Box(
                    modifier = Modifier
                        .width(1.dp)
                        .height(48.dp)
                        .background(Color.White.copy(alpha = 0.32f))
                )
                Column(Modifier.weight(1f)) {
                    Text("总支出", color = Color.White.copy(alpha = 0.92f), fontSize = 12.sp)
                    Spacer(Modifier.height(6.dp))
                    Text("¥ ${formatMoney(summary.expense)}", color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Medium)
                    DeltaLine(summary.expenseChange * -1, onDark = true)
                }
            }
        }
    }
}

@Composable
private fun DeltaLine(value: Int, onDark: Boolean = false) {
    val positive = value >= 0
    val valueColor = if (positive) HomeDeltaUp else HomeDeltaDown
    val baseColor = if (onDark) Color.White.copy(alpha = 0.92f) else HomeSubtle
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp),
        modifier = Modifier.padding(top = 7.dp)
    ) {
        Text("较上月", color = baseColor, fontSize = 11.sp)
        Text(
            "${if (positive) "+" else ""}${value}%",
            color = valueColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.Medium
        )
        Text(if (positive) "↗" else "↓", color = valueColor, fontSize = 12.sp)
    }
}

@Composable
private fun TrendCard(trend: TrendBundle) {
    WhiteCard(shape = RoundedCornerShape(topStart = 14.dp, topEnd = 14.dp, bottomStart = 12.dp, bottomEnd = 12.dp)) {
        Column(modifier = Modifier.padding(start = 14.dp, end = 14.dp, top = 12.dp, bottom = 6.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Text("本月收支趋势", color = HomeText, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                Spacer(Modifier.weight(1f))
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                    TrendLegendItem(HomeBlue, "收入")
                    TrendLegendItem(HomeOrange, "支出")
                }
            }
            TrendChart(trend)
        }
    }
}

@Composable
private fun TrendLegendItem(color: Color, label: String) {
    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(5.dp)) {
        Box(modifier = Modifier.size(width = 15.dp, height = 4.dp).background(color, RoundedCornerShape(999.dp)))
        Text(label, color = HomeText, fontSize = 11.sp)
    }
}

@Composable
private fun TrendChart(trend: TrendBundle) {
    val optionJson = remember(trend) { buildTrendOptionJson(trend) }
    EChartView(
        optionJson = optionJson,
        modifier = Modifier
            .fillMaxWidth()
            .height(128.dp)
    )
}

@Composable
private fun RatioCard(summary: HomeSummary, modifier: Modifier = Modifier) {
    WhiteCard(modifier) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Text("收支类型占比", color = HomeText, fontSize = 13.sp, fontWeight = FontWeight.Medium)
            Box(modifier = Modifier.fillMaxWidth(), contentAlignment = Alignment.Center) {
                DonutChart(summary.ratios, Modifier.size(116.dp))
            }
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                summary.ratios.forEach { ratio ->
                    RatioRow(ratio)
                }
            }
        }
    }
}

@Composable
private fun DonutChart(ratios: List<ExpenseRatio>, modifier: Modifier = Modifier) {
    val optionJson = remember(ratios) { buildRatioOptionJson(ratios) }
    EChartView(optionJson = optionJson, modifier = modifier)
}

@Composable
private fun RatioRow(ratio: ExpenseRatio) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(7.dp)
    ) {
        Box(
            modifier = Modifier
                .size(10.dp)
                .background(ratio.color, CircleShape)
        )
        Text(
            ratio.name,
            color = Color(0xFF5C6880),
            fontSize = 12.sp,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            modifier = Modifier.weight(1f)
        )
        Text("${ratio.percent}%", color = HomeText, fontSize = 12.sp, fontWeight = FontWeight.Medium)
    }
}

@Composable
private fun ProgressCard(summary: HomeSummary, modifier: Modifier = Modifier) {
    WhiteCard(modifier) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(13.dp)
        ) {
            ProgressRow(summary.savingProgress, HomeBlue, Icons.Outlined.Savings)
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(1.dp)
                    .background(Color(0xFF6F84A6).copy(alpha = 0.18f))
            )
            ProgressRow(summary.loanProgress, HomeGreen, Icons.Outlined.AccountBalance)
        }
    }
}

@Composable
private fun ProgressRow(progress: ProgressSummary, color: Color, icon: ImageVector) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        Row(modifier = Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
            Text(progress.title, color = HomeText, fontSize = 13.sp, fontWeight = FontWeight.Medium, modifier = Modifier.weight(1f))
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .background(color.copy(alpha = 0.12f), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(icon, null, tint = color, modifier = Modifier.size(17.dp))
            }
        }
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(
                "¥ ${formatMoney(progress.current)}",
                color = HomeText,
                fontSize = 14.sp,
                fontWeight = FontWeight.Medium
            )
            Text(
                "¥ ${formatMoney(progress.total)}",
                color = Color(0xFF6F7C9B),
                fontSize = 12.sp
            )
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .height(8.dp)
                    .background(HomeProgressTrack, RoundedCornerShape(999.dp))
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth((progress.percent / 100f).coerceIn(0.04f, 1f))
                        .height(8.dp)
                        .background(color, RoundedCornerShape(999.dp))
                )
            }
            Text("${progress.percent}%", color = color, fontSize = 13.sp, fontWeight = FontWeight.Medium)
        }
    }
}

@Composable
private fun SummaryCard(title: String, value: Double, delta: Double, modifier: Modifier = Modifier) {
    WhiteCard(modifier) {
        Column(modifier = Modifier.padding(14.dp)) {
            Text(title, color = HomeText, fontSize = 13.sp, fontWeight = FontWeight.Medium)
            Spacer(Modifier.height(6.dp))
            Text("¥ ${formatMoney(value)}", color = HomeText, fontSize = 19.sp, fontWeight = FontWeight.Medium)
            DeltaLine(delta.roundToInt(), onDark = false)
        }
    }
}

@Composable
private fun LoanSummaryCard(summary: HomeSummary) {
    WhiteCard {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.Top
            ) {
                Column(Modifier.weight(1f)) {
                    Text("贷款已还款汇总", color = HomeText, fontSize = 13.sp, fontWeight = FontWeight.Medium)
                    Spacer(Modifier.height(6.dp))
                    Text("¥ ${formatMoney(summary.loanProgress.current)}", color = HomeText, fontSize = 19.sp, fontWeight = FontWeight.Medium)
                    DeltaLine(summary.loanDelta.roundToInt(), onDark = false)
                }
                Surface(
                    shape = RoundedCornerShape(999.dp),
                    color = Color.White,
                    border = androidx.compose.foundation.BorderStroke(1.dp, HomeDetailBorder),
                    modifier = Modifier.height(29.dp)
                ) {
                    Row(
                        modifier = Modifier.padding(horizontal = 10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(2.dp)
                    ) {
                        Text("查看详情", color = HomeDetailText, fontSize = 12.sp)
                        Icon(Icons.Rounded.ChevronRight, null, tint = HomeDetailText, modifier = Modifier.size(14.dp))
                    }
                }
            }
            LoanMiniList(summary.loanItems)
        }
    }
}

@Composable
private fun LoanMiniList(loans: List<LoanMini>) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (loans.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .background(HomeLoanRowBg, RoundedCornerShape(10.dp))
                    .border(1.dp, HomeLoanRowBorder, RoundedCornerShape(10.dp))
                    .padding(10.dp),
                contentAlignment = Alignment.Center
            ) {
                Text("暂无贷款数据", color = HomeSubtle, fontSize = 11.sp, modifier = Modifier.padding(vertical = 10.dp))
            }
        } else {
            loans.forEach { loan -> LoanMiniRow(loan) }
        }
    }
}

@Composable
private fun LoanMiniRow(loan: LoanMini) {
    val percent = if (loan.total > 0) ((loan.total - loan.remaining) / loan.total * 100).coerceIn(0.0, 100.0) else 0.0
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(HomeLoanRowBg, RoundedCornerShape(10.dp))
            .border(1.dp, HomeLoanRowBorder, RoundedCornerShape(10.dp))
            .padding(10.dp),
        verticalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(loan.platform, color = HomeText, fontSize = 12.sp, fontWeight = FontWeight.Medium, modifier = Modifier.weight(1f))
            Text("${percent.roundToInt()}%", color = Color(0xFF59B995), fontSize = 11.sp, fontWeight = FontWeight.Medium)
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("剩余 ¥ ${formatMoney(loan.remaining)}", color = HomeSubtle, fontSize = 11.sp, modifier = Modifier.weight(1f))
            Text("总额 ¥ ${formatMoney(loan.total)}", color = HomeSubtle, fontSize = 11.sp)
        }
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(7.dp)
                .background(HomeLoanTrack, RoundedCornerShape(999.dp))
        ) {
            Box(
                modifier = Modifier
                    .fillMaxWidth((percent / 100.0).toFloat().coerceIn(0.04f, 1f))
                    .height(7.dp)
                    .background(
                        brush = Brush.linearGradient(LoanTrackGradient),
                        shape = RoundedCornerShape(999.dp)
                    )
            )
        }
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text("已还 ${loan.paidPeriods}/${loan.periods} 期", color = HomeSubtle, fontSize = 11.sp, modifier = Modifier.weight(1f))
            Text("下期 ${loan.dueLabel} 还 ¥ ${formatMoney(loan.monthly)}", color = HomeSubtle, fontSize = 11.sp)
        }
    }
}

@Composable
private fun RecentTransactionsCard(recent: List<RecentRow>) {
    WhiteCard {
        Column(modifier = Modifier.padding(horizontal = 14.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth().padding(vertical = 14.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text("最近交易", color = HomeText, fontSize = 13.sp, fontWeight = FontWeight.Medium, modifier = Modifier.weight(1f))
                Text("全部", color = Color(0xFF65718A), fontSize = 11.sp)
                Icon(Icons.Rounded.ChevronRight, null, tint = Color(0xFF65718A), modifier = Modifier.size(14.dp))
            }
            recent.forEachIndexed { index, row ->
                if (index > 0) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(1.dp)
                            .background(Color(0xFF6F84A6).copy(alpha = 0.16f))
                    )
                }
                RecentTransactionRow(row)
            }
            Spacer(Modifier.height(10.dp))
        }
    }
}

@Composable
private fun RecentTransactionRow(row: RecentRow) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 10.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Box(
            modifier = Modifier
                .size(30.dp)
                .background(row.bubbleColor, RoundedCornerShape(9.dp)),
            contentAlignment = Alignment.Center
        ) {
            Icon(row.icon, null, tint = row.iconColor, modifier = Modifier.size(18.dp))
        }
        Column(
            modifier = Modifier.weight(1f),
            verticalArrangement = Arrangement.spacedBy(2.dp)
        ) {
            Text(
                row.title,
                color = HomeText,
                fontSize = 12.sp,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            Text(row.subtitle, color = Color(0xFF65718A), fontSize = 11.sp)
        }
        Text(
            row.time,
            color = Color(0xFF65718A),
            fontSize = 11.sp,
            modifier = Modifier.width(68.dp)
        )
        Text(
            text = if (row.positive) "+¥ ${formatMoney(row.amount)}" else "-¥ ${formatMoney(row.amount)}",
            color = if (row.positive) HomeRecentPositive else HomeText,
            fontSize = 12.sp,
            fontWeight = FontWeight.Normal,
            modifier = Modifier.width(84.dp)
        )
    }
}

@Composable
private fun WhiteCard(
    modifier: Modifier = Modifier,
    shape: RoundedCornerShape = RoundedCornerShape(12.dp),
    content: @Composable () -> Unit
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .shadow(14.dp, shape, clip = false),
        shape = shape,
        colors = CardDefaults.cardColors(containerColor = HomeCardBg),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0x247B94B8))
    ) {
        content()
    }
}

private fun demoLoans(): List<LoanMini> = listOf(
    LoanMini("房贷", 100000.0, 71500.0, 360, 75, 5600.0, "06-20"),
    LoanMini("车贷", 80000.0, 27000.0, 36, 18, 2200.0, "05-20")
)

private fun buildHomeSummary(
    transactions: List<Transaction>,
    assets: List<Asset>,
    loans: List<Loan>,
    goals: List<SavingsGoal>,
    budgets: List<Budget>
): HomeSummary {
    val today = Clock.System.now().toLocalDateTime(TimeZone.currentSystemDefault()).date
    val currentMonth = transactions.filter { it.isInMonth(today.year, today.monthNumber) }
    val previousMonthDate = previousMonth(today)
    val previousMonthRows = transactions.filter { it.isInMonth(previousMonthDate.year, previousMonthDate.monthNumber) }

    val hasTransactionData = currentMonth.isNotEmpty()
    val hasAssetData = assets.isNotEmpty() || loans.isNotEmpty() || goals.isNotEmpty()

    if (!hasTransactionData && !hasAssetData) {
        return demoSummary()
    }

    val expense = currentMonth.filter { it.type == TransactionType.EXPENSE }.sumOf { it.amount }
    val income = currentMonth.filter { it.type == TransactionType.INCOME }.sumOf { it.amount }
    val previousExpense = previousMonthRows.filter { it.type == TransactionType.EXPENSE }.sumOf { it.amount }
    val previousIncome = previousMonthRows.filter { it.type == TransactionType.INCOME }.sumOf { it.amount }

    val positiveAssets = assets.filter { it.balance > 0 }.sumOf { it.balance }
    val liabilityAssets = assets.filter { it.balance < 0 }.sumOf { -it.balance }
    val totalSavings = goals.sumOf { it.currentAmount }
    val totalSavingsTarget = goals.maxOfOrNull { it.targetAmount } ?: budgets.firstOrNull { it.category == "ALL" }?.amount ?: 30000.0
    val loanTotal = loans.sumOf { it.totalAmount }.takeIf { it > 0 } ?: 100000.0
    val loanRemaining = loans.sumOf { it.remainingAmount }
    val repaidLoan = (loanTotal - loanRemaining).coerceAtLeast(0.0)
    val totalLiability = liabilityAssets + loanRemaining
    val assetTotal = positiveAssets + totalSavings
    val netWorth = assetTotal - totalLiability
    val monthNet = income - expense
    val loanDelta = loans.sumOf { it.monthlyPayment }.takeIf { it > 0 } ?: -2000.0

    return HomeSummary(
        expense = expense,
        income = income,
        expenseChange = comparePercent(expense, previousExpense),
        incomeChange = comparePercent(income, previousIncome),
        trend = if (hasTransactionData) buildTrendBundle(currentMonth) else demoTrend(),
        ratios = if (hasTransactionData) buildExpenseRatios(currentMonth) else demoRatios(),
        savingProgress = ProgressSummary(
            title = "储蓄计划",
            current = totalSavings,
            total = totalSavingsTarget.coerceAtLeast(totalSavings),
            percent = percentOf(totalSavings, totalSavingsTarget.coerceAtLeast(totalSavings))
        ),
        loanProgress = ProgressSummary(
            title = "贷款还款进度",
            current = repaidLoan,
            total = loanTotal,
            percent = percentOf(repaidLoan, loanTotal)
        ),
        netWorth = netWorth,
        assetTotal = assetTotal,
        liabilityTotal = totalLiability,
        totalSavings = totalSavings,
        savingsDelta = monthNet,
        loanTotal = loanTotal,
        loanDelta = loanDelta,
        loanItems = if (loans.isNotEmpty()) loans.map { it.toLoanMini() } else emptyList(),
        recent = if (transactions.isNotEmpty()) buildRecentRows(transactions) else demoRecentRows()
    )
}

private fun buildTrendBundle(transactions: List<Transaction>): TrendBundle {
    val labels = listOf("1", "5", "10", "15", "20", "25", "30")
    val ranges = listOf(1..4, 5..9, 10..14, 15..19, 20..24, 25..29, 30..31)

    return TrendBundle(
        labels = labels,
        expense = ranges.map { range ->
            transactions.filter { it.type == TransactionType.EXPENSE && it.dayOfMonthOrNull() in range }.sumOf { it.amount }.absoluteValue
        },
        income = ranges.map { range ->
            transactions.filter { it.type == TransactionType.INCOME && it.dayOfMonthOrNull() in range }.sumOf { it.amount }
        }
    )
}

private fun buildExpenseRatios(transactions: List<Transaction>): List<ExpenseRatio> {
    val rows = transactions
        .filter { it.type == TransactionType.EXPENSE }
        .groupBy { normalizeCategory(it.category) }
        .mapValues { (_, values) -> values.sumOf { it.amount } }
        .toList()
        .sortedByDescending { it.second }
        .take(5)

    val total = rows.sumOf { it.second }.coerceAtLeast(1.0)
    return rows.mapIndexed { index, (name, amount) ->
        val i = index.coerceAtMost(RatioPalette.lastIndex)
        ExpenseRatio(
            name = name,
            amount = amount,
            percent = ((amount / total) * 100).roundToInt(),
            color = RatioPalette[i]
        )
    }.ifEmpty { demoRatios() }
}

private fun buildRecentRows(transactions: List<Transaction>): List<RecentRow> {
    return transactions.sortedByDescending { it.date }.take(4).map { transaction ->
        val positive = transaction.type == TransactionType.INCOME
        val icon = when {
            positive -> Icons.Outlined.LocalAtm
            transaction.category.contains("餐") || transaction.category.contains("饮") -> Icons.Outlined.Fastfood
            transaction.category.contains("交") || transaction.category.contains("车") -> Icons.Outlined.Train
            transaction.category.contains("购") -> Icons.Outlined.Storefront
            transaction.category.contains("娱") -> Icons.Outlined.SportsEsports
            else -> Icons.AutoMirrored.Outlined.ReceiptLong
        }
        val bubbleColor = when {
            positive -> Color(0xFFE4F4EC)
            transaction.category.contains("餐") || transaction.category.contains("饮") -> Color(0xFFFCE5E7)
            transaction.category.contains("交") || transaction.category.contains("车") -> Color(0xFFF9EADF)
            transaction.category.contains("购") -> Color(0xFFE7EFFC)
            else -> Color(0xFFEDE7F9)
        }
        val iconColor = when {
            positive -> Color(0xFF0CA30C)
            transaction.category.contains("餐") || transaction.category.contains("饮") -> Color(0xFFE34948)
            transaction.category.contains("交") || transaction.category.contains("车") -> Color(0xFFEB6834)
            transaction.category.contains("购") -> Color(0xFF2A78D6)
            else -> Color(0xFF4A3AA7)
        }
        RecentRow(
            title = transaction.merchant?.ifBlank { transaction.category } ?: transaction.category,
            subtitle = normalizeCategory(transaction.category),
            amount = transaction.amount,
            time = readableDateLabel(transaction.date),
            positive = positive,
            icon = icon,
            bubbleColor = bubbleColor,
            iconColor = iconColor
        )
    }
}

private fun demoSummary(): HomeSummary {
    return HomeSummary(
        expense = 8888.0,
        income = 8888.0,
        expenseChange = 18,
        incomeChange = -5,
        trend = demoTrend(),
        ratios = demoRatios(),
        savingProgress = ProgressSummary("储蓄计划", 20000.0, 30000.0, 67),
        loanProgress = ProgressSummary("贷款还款进度", 28500.0, 100000.0, 29),
        netWorth = 86127.89,
        assetTotal = 126127.89,
        liabilityTotal = 40000.0,
        totalSavings = 28600.0,
        savingsDelta = 2300.0,
        loanTotal = 356000.0,
        loanDelta = -2000.0,
        loanItems = demoLoans(),
        recent = demoRecentRows()
    )
}

private fun demoTrend(): TrendBundle {
    return TrendBundle(
        labels = listOf("1", "5", "10", "15", "20", "25", "30"),
        expense = listOf(1100.0, 1650.0, 1820.0, 1320.0, 1710.0, 1440.0, 1960.0),
        income = listOf(1780.0, 1240.0, 1160.0, 1880.0, 1720.0, 2360.0, 2140.0)
    )
}

private fun demoRatios(): List<ExpenseRatio> {
    return listOf(
        ExpenseRatio("生活消费", 1122.0, 30, RatioPalette[0]),
        ExpenseRatio("交通出行", 748.0, 20, RatioPalette[1]),
        ExpenseRatio("餐饮美食", 673.0, 18, RatioPalette[2]),
        ExpenseRatio("休闲娱乐", 561.0, 15, RatioPalette[3]),
        ExpenseRatio("其他", 636.0, 17, RatioPalette[4])
    )
}

private fun demoRecentRows(): List<RecentRow> {
    return listOf(
        RecentRow("星巴克咖啡", "餐饮", 36.0, "今天 08:30", false, Icons.Outlined.Fastfood, Color(0xFFFCE5E7), Color(0xFFE34948)),
        RecentRow("地铁出行", "交通", 4.0, "今天 07:45", false, Icons.Outlined.Train, Color(0xFFF9EADF), Color(0xFFEB6834)),
        RecentRow("工资收入", "工资", 8790.0, "昨天 18:00", true, Icons.Outlined.LocalAtm, Color(0xFFE4F4EC), Color(0xFF0CA30C)),
        RecentRow("超市购物", "购物", 128.5, "昨天 18:00", false, Icons.Outlined.Storefront, Color(0xFFE7EFFC), Color(0xFF2A78D6))
    )
}

private fun normalizeCategory(category: String): String = when {
    category.contains("生活") -> "生活消费"
    category.contains("交") || category.contains("车") -> "交通出行"
    category.contains("餐") || category.contains("饮") -> "餐饮美食"
    category.contains("娱") -> "休闲娱乐"
    category.contains("购") -> "购物消费"
    else -> category
}

private fun comparePercent(current: Double, previous: Double): Int {
    if (previous == 0.0) return if (current > 0) 100 else 0
    return (((current - previous) / previous) * 100).roundToInt()
}

private fun percentOf(current: Double, total: Double): Int {
    if (total <= 0.0) return 0
    return ((current / total) * 100).roundToInt().coerceIn(0, 100)
}

private fun previousMonth(date: LocalDate): LocalDate {
    return if (date.monthNumber == 1) LocalDate(date.year - 1, 12, 1) else LocalDate(date.year, date.monthNumber - 1, 1)
}

private fun Transaction.isInMonth(year: Int, month: Int): Boolean {
    val parsed = parseDate(this.date) ?: return false
    return parsed.year == year && parsed.monthNumber == month
}

private fun Transaction.dayOfMonthOrNull(): Int? = parseDate(this.date)?.dayOfMonth

private fun parseDate(raw: String): LocalDate? = runCatching { LocalDate.parse(raw.take(10)) }.getOrNull()

private fun readableDateLabel(raw: String): String {
    val date = raw.take(10)
    val time = raw.drop(11).take(5).ifBlank { "08:30" }
    return if (date == todayString()) "今天 $time" else "昨天 $time"
}

private fun todayString(): String = Clock.System.now().toLocalDateTime(TimeZone.currentSystemDefault()).date.toString()

private fun formatMoney(value: Double): String = String.format("%,.2f", value)

private fun Loan.toLoanMini(): LoanMini {
    val dueDay = dueDate.coerceIn(1, 31)
    return LoanMini(
        platform = platform.ifBlank { "贷款" },
        total = totalAmount,
        remaining = remainingAmount,
        periods = periods,
        paidPeriods = paidPeriods,
        monthly = monthlyPayment,
        dueLabel = nextDueDateLabel(dueDay)
    )
}

private fun nextDueDateLabel(dueDay: Int): String {
    val now = Clock.System.now().toLocalDateTime(TimeZone.currentSystemDefault()).date
    val nextMonth = if (dueDay >= now.dayOfMonth) {
        now.monthNumber
    } else if (now.monthNumber == 12) {
        1
    } else {
        now.monthNumber + 1
    }
    return String.format("%02d-%02d", nextMonth, dueDay)
}

private fun hexColor(color: Color): String {
    val r = (color.red * 255).roundToInt()
    val g = (color.green * 255).roundToInt()
    val b = (color.blue * 255).roundToInt()
    return String.format("#%02x%02x%02x", r, g, b)
}

private fun buildTrendOptionJson(trend: TrendBundle): String = buildJsonObject {
    put("animationDuration", 450)
    put("grid", buildJsonObject {
        put("left", 26)
        put("right", 10)
        put("top", 16)
        put("bottom", 24)
    })
    put("tooltip", buildJsonObject {
        put("trigger", "axis")
        put("_fmt", "money")
        put("backgroundColor", "rgba(19,27,48,0.92)")
        put("borderWidth", 0)
        put("textStyle", buildJsonObject {
            put("color", "#ffffff")
            put("fontSize", 12)
        })
        put("axisPointer", buildJsonObject {
            put("type", "line")
            put("lineStyle", buildJsonObject { put("color", "rgba(61,134,255,0.28)") })
        })
    })
    put("xAxis", buildJsonObject {
        put("type", "category")
        put("boundaryGap", false)
        put("data", buildJsonArray { trend.labels.forEach { add(it) } })
        put("axisLine", buildJsonObject { put("lineStyle", buildJsonObject { put("color", "#e1e8f2") }) })
        put("axisTick", buildJsonObject { put("show", false) })
        put("axisLabel", buildJsonObject { put("color", "#74819a"); put("fontSize", 10); put("margin", 8) })
    })
    val maxRaw = maxOf(trend.expense.maxOrNull() ?: 0.0, trend.income.maxOrNull() ?: 0.0, 8000.0)
    val maxValue = kotlin.math.ceil(maxRaw / 2000.0) * 2000
    put("yAxis", buildJsonObject {
        put("type", "value")
        put("min", 0)
        put("max", maxValue.toInt())
        put("splitNumber", 4)
        put("splitLine", buildJsonObject { put("show", false) })
        put("axisLine", buildJsonObject { put("show", false) })
        put("axisTick", buildJsonObject { put("show", false) })
        put("axisLabel", buildJsonObject {
            put("color", "#74819a")
            put("fontSize", 10)
            put("_fmt", "k")
        })
    })
    put("series", buildJsonArray {
        add(buildJsonObject {
            put("name", "收入")
            put("type", "line")
            put("smooth", true)
            put("symbol", "circle")
            put("symbolSize", 6)
            put("data", buildJsonArray { trend.income.forEach { add(it) } })
            put("lineStyle", buildJsonObject { put("width", 2); put("color", hexColor(HomeBlue)) })
            put("itemStyle", buildJsonObject {
                put("color", hexColor(HomeBlue))
                put("borderColor", "#ffffff")
                put("borderWidth", 1.2)
            })
        })
        add(buildJsonObject {
            put("name", "支出")
            put("type", "line")
            put("smooth", true)
            put("symbol", "circle")
            put("symbolSize", 6)
            put("data", buildJsonArray { trend.expense.forEach { add(it) } })
            put("lineStyle", buildJsonObject { put("width", 2); put("color", hexColor(HomeOrange)) })
            put("itemStyle", buildJsonObject {
                put("color", hexColor(HomeOrange))
                put("borderColor", "#ffffff")
                put("borderWidth", 1.2)
            })
        })
    })
}.toString()

private fun buildRatioOptionJson(ratios: List<ExpenseRatio>): String = buildJsonObject {
    put("animationDuration", 450)
    put("tooltip", buildJsonObject {
        put("trigger", "item")
        put("confine", true)
        put("_fmt", "ratio")
        put("backgroundColor", "rgba(19,27,48,0.92)")
        put("borderWidth", 0)
        put("textStyle", buildJsonObject { put("color", "#ffffff"); put("fontSize", 12) })
    })
    put("series", buildJsonArray {
        add(buildJsonObject {
            put("type", "pie")
            put("radius", buildJsonArray { add("56%"); add("78%") })
            put("center", buildJsonArray { add("50%"); add("52%") })
            put("avoidLabelOverlap", true)
            put("label", buildJsonObject { put("show", false) })
            put("labelLine", buildJsonObject { put("show", false) })
            put("emphasis", buildJsonObject { put("scale", false) })
            put("itemStyle", buildJsonObject { put("borderColor", "#ffffff"); put("borderWidth", 2) })
            put("data", buildJsonArray {
                ratios.forEach { r ->
                    add(buildJsonObject {
                        put("name", r.name)
                        put("value", r.amount)
                        put("itemStyle", buildJsonObject { put("color", hexColor(r.color)) })
                    })
                }
            })
        })
    })
}.toString()
