package com.wotty.stark.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.wotty.stark.data.model.DataMode
import com.wotty.stark.data.repository.DataModeManager
import kotlinx.coroutines.launch

@Composable
fun DashboardScreen(dataModeManager: DataModeManager) {
    val currentMode by dataModeManager.currentMode.collectAsState()
    val scope = rememberCoroutineScope()

    Column(Modifier.fillMaxSize().padding(16.dp)) {

        // 模式切换卡片
        Card(Modifier.fillMaxWidth()) {
            Column(Modifier.padding(16.dp)) {
                Text("数据模式", style = MaterialTheme.typography.titleMedium)
                Spacer(Modifier.height(8.dp))
                Text(if (currentMode == DataMode.LOCAL) "📍 本地模式 (JSON)" else "☁️ 云端模式 (数据库)")
                Spacer(Modifier.height(8.dp))
                Button(onClick = {
                    scope.launch {
                        val new = if (currentMode == DataMode.LOCAL) DataMode.CLOUD else DataMode.LOCAL
                        dataModeManager.switchMode(new)
                    }
                }) {
                    Text(if (currentMode == DataMode.LOCAL) "切换至云端模式" else "切换至本地模式")
                }
            }
        }

        Spacer(Modifier.height(16.dp))

        // 本月概览
        Card(Modifier.fillMaxWidth()) {
            Column(Modifier.padding(16.dp)) {
                Text("本月概览", style = MaterialTheme.typography.titleMedium)
                Spacer(Modifier.height(12.dp))
                Text("总收入: ¥0.00", style = MaterialTheme.typography.bodyLarge)
                Text("总支出: ¥0.00", style = MaterialTheme.typography.bodyLarge)
                Text("结余: ¥0.00", style = MaterialTheme.typography.bodyLarge)
            }
        }

        Spacer(Modifier.height(16.dp))

        // 最近交易列表占位
        Card(Modifier.fillMaxWidth()) {
            Column(Modifier.padding(16.dp)) {
                Text("最近交易", style = MaterialTheme.typography.titleMedium)
                Spacer(Modifier.height(8.dp))
                Text("暂无交易记录", color = MaterialTheme.colorScheme.onSurfaceVariant)
            }
        }
    }
}
