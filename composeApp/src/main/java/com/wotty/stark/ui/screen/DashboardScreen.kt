package com.wotty.stark.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.wotty.stark.data.model.DataMode
import com.wotty.stark.ui.viewmodel.MainViewModel

@Composable
fun DashboardScreen(viewModel: MainViewModel) {
    val state by viewModel.state.collectAsState()
    val currentMode by viewModel.currentMode.collectAsState()

    Column(Modifier.fillMaxSize()) {
        // 模式切换栏
        Card(Modifier.fillMaxWidth().padding(8.dp)) {
            Row(
                Modifier.padding(8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    if (currentMode == DataMode.LOCAL) "📍 本地" else "☁️ 云端",
                    modifier = Modifier.weight(1f)
                )
                TextButton(onClick = { viewModel.switchMode() }) {
                    Text(if (currentMode == DataMode.LOCAL) "切换至云端" else "切换至本地")
                }
            }
        }

        // 本月概览
        Card(Modifier.fillMaxWidth().padding(horizontal = 8.dp)) {
            Column(Modifier.padding(16.dp)) {
                Text("本月概览", style = MaterialTheme.typography.titleMedium)
                Spacer(Modifier.height(8.dp))
                Text("总收入: ¥0.00", style = MaterialTheme.typography.bodyLarge)
                Text("总支出: ¥0.00", style = MaterialTheme.typography.bodyLarge)
                Text("结余: ¥0.00", style = MaterialTheme.typography.bodyLarge)
            }
        }

        Spacer(Modifier.height(8.dp))

        // 最近交易列表
        Text("最近交易", style = MaterialTheme.typography.titleMedium, modifier = Modifier.padding(horizontal = 12.dp))
        Spacer(Modifier.height(4.dp))

        if (state.transactions.isEmpty()) {
            Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                Text("暂无交易记录", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        } else {
            LazyColumn(modifier = Modifier.fillMaxSize()) {
                items(state.transactions) { tx ->
                    Card(Modifier.fillMaxWidth().padding(horizontal = 8.dp, vertical = 2.dp)) {
                        Row(Modifier.padding(12.dp), verticalAlignment = Alignment.CenterVertically) {
                            Column(Modifier.weight(1f)) {
                                Text(tx.category, fontWeight = FontWeight.Medium)
                                Text(tx.description ?: tx.merchant ?: "", style = MaterialTheme.typography.bodySmall)
                                Text(tx.date.take(10), style = MaterialTheme.typography.labelSmall)
                            }
                            Text(
                                "${if (tx.type.name == "INCOME") "+" else "-"}¥${String.format("%.2f", tx.amount)}",
                                color = if (tx.type.name == "INCOME") Color(0xFF43A047) else Color(0xFFE53935),
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }
            }
        }
    }
}
