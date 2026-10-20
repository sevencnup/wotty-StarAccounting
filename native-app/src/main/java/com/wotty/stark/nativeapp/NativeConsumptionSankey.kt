package com.wotty.stark.nativeapp

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.platform.LocalDensity
import kotlin.math.max
import kotlin.math.min

internal data class NativeConsumptionFlowEdge(
    val platform: String,
    val category: String,
    val amount: Double,
    val count: Int,
)

private data class SankeyNodeLayout(
    val key: String,
    val amount: Double,
    val top: Float,
    val height: Float,
    val color: Color,
)

private data class SankeyLinkLayout(
    val fromY: Float,
    val toY: Float,
    val width: Float,
    val fromColor: Color,
    val toColor: Color,
)

private val SankeyInk = Color(0xFF1F2937)
private val SankeyMuted = Color(0xFF7B8798)
private val SankeyLine = Color(0xFFE8EDF3)
private val SankeyPlatforms = listOf("微信", "支付宝", "银行卡", "现金", "其他")
private val SankeyPlatformColors = mapOf(
    "微信" to Color(0xFF1BAF7A),
    "支付宝" to Color(0xFF2A78D6),
    "银行卡" to Color(0xFF008300),
    "现金" to Color(0xFFEDA100),
    "其他" to Color(0xFF4A3AA7),
)

@Composable
internal fun NativeConsumptionSankeyCard(
    edges: List<NativeConsumptionFlowEdge>,
    flowTypeLabel: String,
    selectedAccount: String,
    selectedCategory: String?,
    onPlatformClick: (String) -> Unit,
    onCategoryClick: (String) -> Unit,
) {
    val positiveEdges = remember(edges) { edges.filter { it.amount > 0.0 && it.amount.isFinite() } }
    val categoryTotals = remember(positiveEdges) {
        positiveEdges.groupBy(NativeConsumptionFlowEdge::category)
            .mapValues { (_, rows) -> rows.sumOf(NativeConsumptionFlowEdge::amount) }
            .entries.sortedByDescending(Map.Entry<String, Double>::value)
            .take(15)
    }
    val visibleCategories = categoryTotals.map { it.key }.toSet()
    val chartEdges = remember(positiveEdges, visibleCategories) { positiveEdges.filter { it.category in visibleCategories } }
    val totalAmount = chartEdges.sumOf(NativeConsumptionFlowEdge::amount)
    val platforms = remember(chartEdges) {
        SankeyPlatforms.filter { platform -> chartEdges.any { it.platform == platform } } +
            chartEdges.map(NativeConsumptionFlowEdge::platform).distinct().filterNot(SankeyPlatforms::contains)
    }
    val categories = categoryTotals.filter { it.key in visibleCategories }
    val chartHeight = maxOf(270.dp, (categories.size * 18 + (categories.size - 1).coerceAtLeast(0) * 8).dp)

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Column(Modifier.padding(15.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(if (flowTypeLabel == "收入") "收入流向图" else "消费流向图", color = SankeyInk, fontSize = 15.sp, fontWeight = FontWeight.Bold)
            Text("账户 → 分类 · 线宽代表金额 · 点击节点筛选", color = SankeyMuted, fontSize = 11.sp)
            if (chartEdges.isEmpty()) {
                Text("当前筛选下暂无${flowTypeLabel}流向", color = SankeyMuted, fontSize = 12.sp, modifier = Modifier.padding(vertical = 25.dp))
            } else {
                Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                    Text("${platforms.size} 个账户", color = SankeyMuted, fontSize = 10.sp)
                    Text("${categories.size} 个分类 · ¥ ${String.format("%,.2f", totalAmount)}", color = SankeyMuted, fontSize = 10.sp)
                }
                BoxWithConstraints(Modifier.fillMaxWidth().height(chartHeight)) {
                    val density = LocalDensity.current
                    val widthPx = with(density) { maxWidth.toPx() }
                    val heightPx = with(density) { chartHeight.toPx() }
                    val labelHeight = with(density) { 18.dp.toPx() }
                    val leftLabelWidth = with(density) { 62.dp.toPx() }
                    val rightLabelWidth = with(density) { 80.dp.toPx() }
                    val nodeWidth = with(density) { 10.dp.toPx() }
                    val gap = with(density) { 8.dp.toPx() }
                    val amountTotal = chartEdges.sumOf(NativeConsumptionFlowEdge::amount).coerceAtLeast(.01)
                    val platformSums = platforms.associateWith { platform -> chartEdges.filter { it.platform == platform }.sumOf(NativeConsumptionFlowEdge::amount) }
                    val categorySums = categories.associate { it.key to it.value }
                    val platformSpace = (heightPx - gap * (platforms.size - 1).coerceAtLeast(0)).coerceAtLeast(0f)
                    val categorySpace = (heightPx - gap * (categories.size - 1).coerceAtLeast(0)).coerceAtLeast(0f)
                    val scale = min(platformSpace, categorySpace) / amountTotal.toFloat()

                    fun nodes(keys: List<String>, totals: Map<String, Double>, colors: (String) -> Color): List<SankeyNodeLayout> {
                        val usedHeight = totals.values.sumOf { it }.toFloat() * scale + gap * (keys.size - 1).coerceAtLeast(0)
                        var cursor = (heightPx - usedHeight).coerceAtLeast(0f) / 2f
                        return keys.map { key ->
                            val nodeHeight = (totals[key] ?: 0.0).toFloat() * scale
                            SankeyNodeLayout(key, totals[key] ?: 0.0, cursor, nodeHeight, colors(key)).also {
                                cursor += nodeHeight + gap
                            }
                        }
                    }

                    val platformNodes = nodes(platforms, platformSums) { SankeyPlatformColors[it] ?: SankeyPlatformColors.getValue("其他") }
                    val categoryNodes = nodes(categories.map { it.key }, categorySums) { sankeyCategoryColor(it) }
                    val platformByKey = platformNodes.associateBy(SankeyNodeLayout::key)
                    val categoryByKey = categoryNodes.associateBy(SankeyNodeLayout::key)
                    val sourceOffsets = mutableMapOf<String, Float>()
                    val targetOffsets = mutableMapOf<String, Float>()
                    val links = chartEdges.mapNotNull { edge ->
                        val source = platformByKey[edge.platform] ?: return@mapNotNull null
                        val target = categoryByKey[edge.category] ?: return@mapNotNull null
                        val flowHeight = edge.amount.toFloat() * scale
                        val fromY = source.top + (sourceOffsets[edge.platform] ?: 0f) + flowHeight / 2f
                        val toY = target.top + (targetOffsets[edge.category] ?: 0f) + flowHeight / 2f
                        sourceOffsets[edge.platform] = (sourceOffsets[edge.platform] ?: 0f) + flowHeight
                        targetOffsets[edge.category] = (targetOffsets[edge.category] ?: 0f) + flowHeight
                        SankeyLinkLayout(fromY, toY, max(flowHeight, with(density) { 1.dp.toPx() }), source.color, target.color)
                    }
                    val leftNodeX = leftLabelWidth
                    val rightNodeX = widthPx - rightLabelWidth - nodeWidth
                    val curveStartX = leftNodeX + nodeWidth
                    val curveEndX = rightNodeX
                    val leftLabelDp = 62.dp
                    val rightLabelDp = 80.dp

                    androidx.compose.foundation.Canvas(Modifier.fillMaxSize()) {
                        links.forEach { link ->
                            val path = Path().apply {
                                moveTo(curveStartX, link.fromY)
                                val controlX = curveStartX + (curveEndX - curveStartX) * .48f
                                cubicTo(controlX, link.fromY, controlX, link.toY, curveEndX, link.toY)
                            }
                            drawPath(
                                path = path,
                                brush = Brush.horizontalGradient(
                                    colors = listOf(link.fromColor.copy(alpha = .32f), link.toColor.copy(alpha = .24f)),
                                    startX = curveStartX,
                                    endX = curveEndX,
                                ),
                                style = Stroke(width = link.width, cap = StrokeCap.Round),
                            )
                        }
                        platformNodes.forEach { node ->
                            drawRoundRect(
                                color = node.color,
                                topLeft = androidx.compose.ui.geometry.Offset(leftNodeX, node.top),
                                size = androidx.compose.ui.geometry.Size(nodeWidth, node.height.coerceAtLeast(with(density) { 2.dp.toPx() })),
                                cornerRadius = androidx.compose.ui.geometry.CornerRadius(nodeWidth / 2f),
                            )
                        }
                        categoryNodes.forEach { node ->
                            drawRoundRect(
                                color = node.color,
                                topLeft = androidx.compose.ui.geometry.Offset(rightNodeX, node.top),
                                size = androidx.compose.ui.geometry.Size(nodeWidth, node.height.coerceAtLeast(with(density) { 2.dp.toPx() })),
                                cornerRadius = androidx.compose.ui.geometry.CornerRadius(nodeWidth / 2f),
                            )
                        }
                    }

                    fun visibleLabelNodes(nodes: List<SankeyNodeLayout>): List<SankeyNodeLayout> {
                        var lastBottom = Float.NEGATIVE_INFINITY
                        return nodes.filter { node ->
                            val center = node.top + node.height / 2f
                            val top = (center - labelHeight / 2f).coerceAtLeast(0f)
                            if (top < lastBottom + with(density) { 2.dp.toPx() }) false
                            else {
                                lastBottom = top + labelHeight
                                true
                            }
                        }
                    }

                    visibleLabelNodes(platformNodes).forEach { node ->
                        val y = with(density) { (node.top + node.height / 2f - labelHeight / 2f).coerceAtLeast(0f).toDp() }
                        Text(
                            node.key,
                            modifier = Modifier.offset(y = y).width(leftLabelDp).height(18.dp)
                                .clip(RoundedCornerShape(6.dp))
                                .background(if (selectedAccount == node.key) node.color.copy(alpha = .15f) else Color.Transparent)
                                .clickable { onPlatformClick(node.key) },
                            color = node.color,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.SemiBold,
                            textAlign = TextAlign.End,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                    }
                    visibleLabelNodes(categoryNodes).forEach { node ->
                        val y = with(density) { (node.top + node.height / 2f - labelHeight / 2f).coerceAtLeast(0f).toDp() }
                        Text(
                            node.key,
                            modifier = Modifier.offset(x = maxWidth - rightLabelDp, y = y).width(rightLabelDp).height(18.dp)
                                .clip(RoundedCornerShape(6.dp))
                                .background(if (selectedCategory == node.key) Color(0xFFE6F1FF) else Color.Transparent)
                                .clickable { onCategoryClick(node.key) },
                            color = SankeyInk,
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Medium,
                            textAlign = TextAlign.Start,
                            maxLines = 1,
                            overflow = TextOverflow.Ellipsis,
                        )
                    }
                }
            }
        }
    }
}

private fun sankeyCategoryColor(category: String): Color = when {
    "餐" in category -> Color(0xFFFF7A32)
    "购" in category -> Color(0xFFFF4D6A)
    "交" in category -> Color(0xFF57B3FF)
    "住房" in category || "房" in category -> Color(0xFF7C5CFC)
    "娱" in category -> Color(0xFFFF9F43)
    "医疗" in category || "健康" in category -> Color(0xFFFF5C8A)
    "日用" in category -> Color(0xFF0D8A5F)
    "服装" in category -> Color(0xFFB37FEB)
    "通讯" in category -> Color(0xFF597EF7)
    "运动" in category -> Color(0xFF36CFC9)
    "旅行" in category -> Color(0xFF9254DE)
    "教育" in category -> Color(0xFF40A9FF)
    else -> Color(0xFFBFBFBF)
}
