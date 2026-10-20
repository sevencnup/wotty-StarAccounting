package com.wotty.stark.nativeapp

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

internal data class NativeConsumptionFlowEdge(
    val platform: String,
    val category: String,
    val amount: Double,
    val count: Int,
)

@Composable
internal fun NativeConsumptionSankeyCard(
    edges: List<NativeConsumptionFlowEdge>,
    flowTypeLabel: String,
    selectedAccount: String,
    selectedCategory: String?,
    onPlatformClick: (String) -> Unit,
    onCategoryClick: (String?) -> Unit,
) {
    val visibleEdges = remember(edges) { edges.filter { it.amount > 0.0 && it.amount.isFinite() } }
    val categories = remember(visibleEdges) {
        visibleEdges.groupBy(NativeConsumptionFlowEdge::category)
            .mapValues { (_, rows) -> rows.sumOf(NativeConsumptionFlowEdge::amount) }
            .entries.sortedByDescending(Map.Entry<String, Double>::value)
    }
    val chartEdges = remember(visibleEdges, categories) { visibleEdges.filter { edge -> categories.any { it.key == edge.category } } }
    val chartOption = remember(chartEdges) { NativeEChartOptions.sankey(chartEdges) }
    val totalAmount = chartEdges.sumOf(NativeConsumptionFlowEdge::amount)
    val platforms = chartEdges.map(NativeConsumptionFlowEdge::platform).distinct().size

    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(18.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 0.dp),
    ) {
        Column(Modifier.padding(15.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(if (flowTypeLabel == "收入") "收入流向图" else "消费流向图", color = Color(0xFF11182D), fontSize = 15.sp, fontWeight = FontWeight.Bold)
            Text("账户 → 分类 · 线宽代表金额 · 点击节点筛选", color = Color(0xFF7B8798), fontSize = 11.sp)
            if (chartEdges.isEmpty()) {
                Text("当前筛选下暂无${flowTypeLabel}流向", color = Color(0xFF7B8798), fontSize = 12.sp, modifier = Modifier.padding(vertical = 25.dp))
            } else {
                Text("$platforms 个账户 · ${categories.size} 个分类 · ¥ ${String.format(java.util.Locale.US, "%,.2f", totalAmount)}", color = Color(0xFF7B8798), fontSize = 10.sp)
                Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()).padding(top = 2.dp)) {
                    NativeEChart(
                        option = chartOption,
                        modifier = Modifier.width(720.dp).height(260.dp),
                        onDataClick = { event ->
                            when {
                                event.name.startsWith("account::") -> {
                                    val platform = event.name.removePrefix("account::")
                                    onPlatformClick(platform.takeUnless { selectedAccount == it } ?: "全部账户")
                                }
                                event.name.startsWith("category::") -> {
                                    val category = event.name.removePrefix("category::")
                                    onCategoryClick(category.takeUnless { selectedCategory == it })
                                }
                            }
                        },
                    )
                }
            }
        }
    }
}
