package com.wotty.stark.ui.screen

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AccountBalanceWallet
import androidx.compose.material.icons.outlined.Apartment
import androidx.compose.material.icons.outlined.DirectionsBus
import androidx.compose.material.icons.outlined.Fastfood
import androidx.compose.material.icons.outlined.Visibility
import androidx.compose.material.icons.rounded.ChevronRight
import androidx.compose.material.icons.rounded.KeyboardArrowDown
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.DropdownMenu
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Fill
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wotty.stark.data.model.Transaction
import com.wotty.stark.data.model.TransactionType
import com.wotty.stark.ui.viewmodel.MainViewModel
import kotlinx.datetime.Clock
import kotlinx.datetime.LocalDate
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime
import kotlin.math.max
import kotlin.math.roundToInt

private val HomeBlue = Color(0xFF2F7BFF)
private val HomeBlueDark = Color(0xFF1D63E8)
private val HomeBlueLight = Color(0xFF5EA5FF)
private val HomeYellow = Color(0xFFF6D66D)
private val HomeTextDark = Color(0xFF1F2430)
private val HomeTextMuted = Color(0xFF9CA3AF)
private val HomeSurface = Color(0xFFFFFFFF)
private val HomeBg = Color(0xFFF4F7FB)
private val IncomeBlue = Color(0xFF4A86FF)
private val ExpenseRed = Color(0xFFEE7B74)
private val TrendLineBlue = Color(0xFF3A82FF)
private val TrendFillBlue = Color(0x263A82FF)
private val CategoryOrange = Color(0xFFFF9A3D)
private val CategoryGreen = Color(0xFF57C785)

private data class MonthlySummary(
    val expense: Double,
    val income: Double,
    val budget: Double,
    val budgetRemaining: Double,
    val percentUsed: Float
)

private data class CategoryRank(
    val name: String,
    val amount: Double,
    val share: Float,
    val color: Color,
    val iconBg: Color,
    val icon: @Composable () -> Unit
)

private data class TrendPoint(
    val label: String,
    val amount: Double
)

@Composable
fun DashboardScreen(viewModel: MainViewModel, listState: LazyListState) {
    val state by viewModel.state.collectAsState()
    val allTransactions = state.transactions
    val monthTransactions = remember(allTransactions) { allTransactions.filter { it.isInCurrentMonth() } }
    val summary = remember(monthTransactions) { buildMonthlySummary(monthTransactions) }
    val trendPoints = remember(monthTransactions) { buildTrendPoints(monthTransactions) }
    val categoryRanks = remember(monthTransactions) { buildCategoryRanks(monthTransactions) }

    LazyColumn(
        state = listState,
        modifier = Modifier
            .fillMaxSize()
            .background(HomeBg)
            .statusBarsPadding(),
        contentPadding = PaddingValues(horizontal = 18.dp, vertical = 18.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            HomeHeader()
        }

        item {
            MonthlyExpenseHero(summary)
        }

        item {
            IncomeExpenseStats(summary)
        }

        item {
            TrendSection(trendPoints)
        }

        item {
            CategoryRankingSection(categoryRanks)
        }

        item {
            Spacer(Modifier.height(8.dp))
        }
    }
}

@Composable
private fun HomeHeader() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(top = 4.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = "首页",
            color = HomeTextDark,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold
        )
        Spacer(Modifier.width(8.dp))
        Icon(
            imageVector = Icons.Outlined.Visibility,
            contentDescription = null,
            tint = Color(0xFF656D78),
            modifier = Modifier.size(20.dp)
        )
        Spacer(Modifier.weight(1f))
        Row(horizontalArrangement = Arrangement.spacedBy(14.dp)) {
            Icon(
                imageVector = Icons.Outlined.Visibility,
                contentDescription = null,
                tint = Color(0xFF656D78),
                modifier = Modifier.size(20.dp)
            )
            TopActionIcon(showDot = true)
            TopActionIcon(showDot = true)
        }
    }
}

@Composable
private fun TopActionIcon(showDot: Boolean = false) {
    Box(contentAlignment = Alignment.TopEnd) {
        Box(
            modifier = Modifier
                .size(22.dp)
                .background(Color(0xFFF1F4F8), RoundedCornerShape(6.dp)),
            contentAlignment = Alignment.Center
        ) {
            Box(
                modifier = Modifier
                    .size(10.dp)
                    .background(Color(0xFF656D78), RoundedCornerShape(2.dp))
            )
        }
        if (showDot) {
            Box(
                modifier = Modifier
                    .size(7.dp)
                    .background(Color(0xFFFF6B57), CircleShape)
            )
        }
    }
}

@Composable
private fun MonthlyExpenseHero(summary: MonthlySummary) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(
                elevation = 16.dp,
                shape = RoundedCornerShape(22.dp),
                clip = false
            ),
        shape = RoundedCornerShape(22.dp),
        colors = CardDefaults.cardColors(containerColor = Color.Transparent),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(162.dp)
                .background(
                    brush = Brush.linearGradient(listOf(HomeBlueLight, HomeBlueDark)),
                    shape = RoundedCornerShape(22.dp)
                )
                .padding(horizontal = 18.dp, vertical = 18.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "本月支出(元)",
                            color = Color.White.copy(alpha = 0.92f),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Medium
                        )
                        Spacer(Modifier.width(6.dp))
                        Icon(
                            imageVector = Icons.Outlined.Visibility,
                            contentDescription = null,
                            tint = Color.White.copy(alpha = 0.7f),
                            modifier = Modifier.size(14.dp)
                        )
                    }
                    Text(
                        text = formatAmount(summary.expense),
                        color = Color.White,
                        fontSize = 34.sp,
                        lineHeight = 40.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "预算剩余：${formatAmount(summary.budgetRemaining)}",
                        color = Color.White.copy(alpha = 0.82f),
                        fontSize = 15.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }

                Column(
                    horizontalAlignment = Alignment.End,
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .background(Color.White.copy(alpha = 0.16f), RoundedCornerShape(999.dp))
                            .padding(horizontal = 10.dp, vertical = 5.dp)
                    ) {
                        Text(
                            text = "预算",
                            color = Color.White.copy(alpha = 0.92f),
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                    BudgetRing(summary.percentUsed)
                }
            }
        }
    }
}

@Composable
private fun BudgetRing(percentUsed: Float) {
    Box(
        modifier = Modifier.size(104.dp),
        contentAlignment = Alignment.Center
    ) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            val stroke = Stroke(width = 13.dp.toPx(), cap = StrokeCap.Round)
            val arcSize = Size(size.width - 12.dp.toPx(), size.height - 12.dp.toPx())
            val topLeft = Offset(6.dp.toPx(), 6.dp.toPx())

            drawArc(
                color = Color.White.copy(alpha = 0.14f),
                startAngle = -90f,
                sweepAngle = 360f,
                useCenter = false,
                topLeft = topLeft,
                size = arcSize,
                style = stroke
            )
            drawArc(
                color = Color(0xFF79B8FF).copy(alpha = 0.38f),
                startAngle = -90f,
                sweepAngle = 360f * (1f - percentUsed.coerceIn(0f, 1f)),
                useCenter = false,
                topLeft = topLeft,
                size = arcSize,
                style = stroke
            )
            drawArc(
                color = HomeYellow,
                startAngle = 110f,
                sweepAngle = 250f * percentUsed.coerceIn(0f, 1f),
                useCenter = false,
                topLeft = topLeft,
                size = arcSize,
                style = stroke
            )
        }
        Text(
            text = "${(percentUsed * 100).roundToInt()}%",
            color = Color.White,
            fontSize = 20.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
private fun IncomeExpenseStats(summary: MonthlySummary) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(10.dp, RoundedCornerShape(20.dp), clip = false),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = HomeSurface),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 18.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "本月收支统计",
                    color = HomeTextDark,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1f)
                )
                Icon(
                    imageVector = Icons.Rounded.ChevronRight,
                    contentDescription = null,
                    tint = Color(0xFFD2D7DE),
                    modifier = Modifier.size(20.dp)
                )
            }
            Spacer(Modifier.height(18.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "收入(元)",
                        color = IncomeBlue,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(Modifier.height(8.dp))
                    Text(
                        text = formatAmount(summary.income),
                        color = HomeTextDark,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Box(
                    modifier = Modifier
                        .width(1.dp)
                        .height(48.dp)
                        .background(Color(0xFFF0F3F8))
                )
                Spacer(Modifier.width(24.dp))
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = "支出(元)",
                        color = ExpenseRed,
                        fontSize = 15.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(Modifier.height(8.dp))
                    Text(
                        text = formatAmount(summary.expense),
                        color = HomeTextDark,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}

@Composable
private fun TrendSection(points: List<TrendPoint>) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(10.dp, RoundedCornerShape(20.dp), clip = false),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = HomeSurface),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 18.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "收支趋势",
                    color = HomeTextDark,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1f)
                )
                Box(
                    modifier = Modifier
                        .background(Color(0xFFF5F7FA), RoundedCornerShape(12.dp))
                        .padding(horizontal = 10.dp, vertical = 6.dp)
                ) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(
                            text = "本月",
                            color = Color(0xFF626C78),
                            fontSize = 14.sp,
                            fontWeight = FontWeight.SemiBold
                        )
                        Spacer(Modifier.width(2.dp))
                        Icon(
                            imageVector = Icons.Rounded.KeyboardArrowDown,
                            contentDescription = null,
                            tint = Color(0xFF626C78),
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
            Spacer(Modifier.height(18.dp))
            TrendChart(points)
        }
    }
}

@Composable
private fun TrendChart(points: List<TrendPoint>) {
    if (points.isEmpty()) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .height(156.dp),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "本月暂无支出数据",
                color = HomeTextMuted,
                fontSize = 14.sp
            )
        }
        return
    }

    val maxAmount = max(points.maxOf { it.amount }, 1.0)

    Column {
        Canvas(
            modifier = Modifier
                .fillMaxWidth()
                .height(132.dp)
        ) {
            val leftPad = 10.dp.toPx()
            val rightPad = 10.dp.toPx()
            val topPad = 10.dp.toPx()
            val bottomPad = 18.dp.toPx()
            val chartW = size.width - leftPad - rightPad
            val chartH = size.height - topPad - bottomPad
            val stepX = if (points.size > 1) chartW / (points.size - 1) else 0f

            fun pointAt(index: Int): Offset {
                val value = points[index].amount
                val x = leftPad + index * stepX
                val y = topPad + chartH - ((value / maxAmount).toFloat() * chartH * 0.88f)
                return Offset(x, y)
            }

            for (i in 0..3) {
                val y = topPad + chartH * i / 3f
                drawLine(
                    color = Color(0xFFF0F2F6),
                    start = Offset(leftPad, y),
                    end = Offset(size.width - rightPad, y),
                    strokeWidth = 1.dp.toPx()
                )
            }

            val linePath = Path()
            val fillPath = Path()
            val first = pointAt(0)
            linePath.moveTo(first.x, first.y)
            fillPath.moveTo(first.x, topPad + chartH)
            fillPath.lineTo(first.x, first.y)

            for (i in 1 until points.size) {
                val previous = pointAt(i - 1)
                val current = pointAt(i)
                val midX = (previous.x + current.x) / 2f
                linePath.cubicTo(midX, previous.y, midX, current.y, current.x, current.y)
                fillPath.cubicTo(midX, previous.y, midX, current.y, current.x, current.y)
            }

            val last = pointAt(points.lastIndex)
            fillPath.lineTo(last.x, topPad + chartH)
            fillPath.close()

            drawPath(
                path = fillPath,
                brush = Brush.verticalGradient(
                    colors = listOf(TrendFillBlue, Color.Transparent),
                    startY = topPad,
                    endY = topPad + chartH
                ),
                style = Fill
            )

            drawPath(
                path = linePath,
                color = TrendLineBlue,
                style = Stroke(width = 3.dp.toPx(), cap = StrokeCap.Round)
            )

            points.forEachIndexed { index, _ ->
                val point = pointAt(index)
                drawCircle(
                    color = TrendLineBlue.copy(alpha = 0.18f),
                    radius = 7.dp.toPx(),
                    center = point
                )
                drawCircle(
                    color = TrendLineBlue,
                    radius = 3.5.dp.toPx(),
                    center = point
                )
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            points.forEach {
                Text(
                    text = it.label,
                    color = Color(0xFFC0C6D1),
                    fontSize = 12.sp,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.weight(1f)
                )
            }
        }
    }
}

@Composable
private fun CategoryRankingSection(ranks: List<CategoryRank>) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .shadow(10.dp, RoundedCornerShape(20.dp), clip = false),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = HomeSurface),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
    ) {
        Column(modifier = Modifier.padding(horizontal = 16.dp, vertical = 18.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "支出分类排行",
                    color = HomeTextDark,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1f)
                )
                Text(
                    text = "查看更多",
                    color = HomeTextMuted,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )
            }
            Spacer(Modifier.height(10.dp))

            if (ranks.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(120.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "本月暂无支出记录",
                        color = HomeTextMuted,
                        fontSize = 14.sp
                    )
                }
            } else {
                ranks.forEachIndexed { index, item ->
                    if (index > 0) {
                        HorizontalDivider(color = Color(0xFFF5F6F8), thickness = 1.dp)
                    }
                    CategoryRankRow(item)
                }
            }
        }
    }
}

@Composable
private fun CategoryRankRow(item: CategoryRank) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 14.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(46.dp)
                .background(item.iconBg, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            item.icon()
        }
        Spacer(Modifier.width(12.dp))

        Column(modifier = Modifier.weight(1f)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = item.name,
                    color = HomeTextDark,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1f)
                )
                Text(
                    text = percentText(item.share),
                    color = HomeTextMuted,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )
                Spacer(Modifier.width(10.dp))
                Text(
                    text = formatAmount(item.amount),
                    color = Color(0xFF2F3640),
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            Spacer(Modifier.height(10.dp))
            Box(
                modifier = Modifier
                    .fillMaxWidth(0.72f)
                    .height(8.dp)
                    .background(Color(0xFFF2F4F8), RoundedCornerShape(999.dp))
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth(item.share.coerceIn(0.08f, 1f))
                        .height(8.dp)
                        .background(item.color, RoundedCornerShape(999.dp))
                )
            }
        }
    }
}

private fun buildMonthlySummary(transactions: List<Transaction>): MonthlySummary {
    val income = transactions.filter { it.type == TransactionType.INCOME }.sumOf { it.amount }
    val expense = transactions.filter { it.type == TransactionType.EXPENSE }.sumOf { it.amount }
    val budget = if (income > 0.0) income else max(expense * 1.5, 3000.0)
    val remaining = (budget - expense).coerceAtLeast(0.0)
    val percent = if (budget > 0) (expense / budget).toFloat().coerceIn(0f, 1f) else 0f
    return MonthlySummary(
        expense = expense,
        income = income,
        budget = budget,
        budgetRemaining = remaining,
        percentUsed = percent
    )
}

private fun buildTrendPoints(transactions: List<Transaction>): List<TrendPoint> {
    val expenses = transactions.filter { it.type == TransactionType.EXPENSE }
    if (expenses.isEmpty()) return emptyList()

    val grouped = expenses.groupBy { it.date.take(10) }
    val orderedDates = grouped.keys.sorted()
    val sampleDates = if (orderedDates.size <= 5) orderedDates else listOf(
        orderedDates.first(),
        orderedDates[(orderedDates.lastIndex * 0.25f).roundToInt()],
        orderedDates[(orderedDates.lastIndex * 0.5f).roundToInt()],
        orderedDates[(orderedDates.lastIndex * 0.75f).roundToInt()],
        orderedDates.last()
    ).distinct()

    return sampleDates.map { date ->
        TrendPoint(
            label = date.substring(5).replace("-", "/"),
            amount = grouped[date].orEmpty().sumOf { it.amount }
        )
    }
}

private fun buildCategoryRanks(transactions: List<Transaction>): List<CategoryRank> {
    val categorySums = transactions
        .filter { it.type == TransactionType.EXPENSE }
        .groupBy { it.category }
        .mapValues { (_, list) -> list.sumOf { it.amount } }
        .toList()
        .sortedByDescending { it.second }
        .take(3)

    val total = categorySums.sumOf { it.second }
    if (total <= 0.0) return emptyList()

    return categorySums.mapIndexed { index, (name, amount) ->
        val share = (amount / total).toFloat()
        when (index) {
            0 -> CategoryRank(
                name = name,
                amount = amount,
                share = share,
                color = HomeBlue,
                iconBg = Color(0xFFE8F1FF),
                icon = {
                    Icon(
                        imageVector = categoryIcon(name, index),
                        contentDescription = null,
                        tint = HomeBlue,
                        modifier = Modifier.size(22.dp)
                    )
                }
            )
            1 -> CategoryRank(
                name = name,
                amount = amount,
                share = share,
                color = CategoryOrange,
                iconBg = Color(0xFFFFF1E2),
                icon = {
                    Icon(
                        imageVector = categoryIcon(name, index),
                        contentDescription = null,
                        tint = CategoryOrange,
                        modifier = Modifier.size(22.dp)
                    )
                }
            )
            else -> CategoryRank(
                name = name,
                amount = amount,
                share = share,
                color = CategoryGreen,
                iconBg = Color(0xFFE8F7EE),
                icon = {
                    Icon(
                        imageVector = categoryIcon(name, index),
                        contentDescription = null,
                        tint = CategoryGreen,
                        modifier = Modifier.size(22.dp)
                    )
                }
            )
        }
    }
}

private fun categoryIcon(name: String, index: Int) = when {
    name.contains("住") || name.contains("房") -> Icons.Outlined.Apartment
    name.contains("餐") || name.contains("饮") -> Icons.Outlined.Fastfood
    name.contains("交") || name.contains("车") -> Icons.Outlined.DirectionsBus
    else -> if (index == 0) Icons.Outlined.AccountBalanceWallet else Icons.Outlined.Fastfood
}

private fun Transaction.isInCurrentMonth(): Boolean {
    val today = Clock.System.now().toLocalDateTime(TimeZone.currentSystemDefault()).date
    val transactionDate = parseDate(date) ?: return false
    return transactionDate.year == today.year && transactionDate.monthNumber == today.monthNumber
}

private fun parseDate(raw: String): LocalDate? {
    val normalized = raw.take(10)
    return runCatching { LocalDate.parse(normalized) }.getOrNull()
}

private fun percentText(value: Float): String {
    val percent = value * 100f
    return if (percent % 1f == 0f) "${percent.roundToInt()}%" else String.format("%.1f%%", percent)
}

private fun formatAmount(amount: Double): String {
    return if (amount == amount.toLong().toDouble()) {
        String.format("%,.0f", amount)
    } else {
        String.format("%,.2f", amount)
    }
}
