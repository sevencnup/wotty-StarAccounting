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
    val coroutineScope = rememberCoroutineScope()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "首页",
            style = MaterialTheme.typography.headlineMedium
        )

        Spacer(modifier = Modifier.height(16.dp))

        // 模式切换卡片
        Card(
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = "数据模式",
                    style = MaterialTheme.typography.titleMedium
                )
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = "当前: ${if (currentMode == DataMode.LOCAL) "本地模式 (JSON)" else "云端模式 (数据库)"}"
                )
                Spacer(modifier = Modifier.height(8.dp))
                Button(
                    onClick = {
                        coroutineScope.launch {
                            val newMode = if (currentMode == DataMode.LOCAL) DataMode.CLOUD else DataMode.LOCAL
                            dataModeManager.switchMode(newMode)
                        }
                    }
                ) {
                    Text(
                        if (currentMode == DataMode.LOCAL) "切换至云端模式" else "切换至本地模式"
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // 概览卡片（待完善）
        Card(
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    text = "本月概览",
                    style = MaterialTheme.typography.titleMedium
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text("总收入: ¥0.00")
                Text("总支出: ¥0.00")
                Text("结余: ¥0.00")
            }
        }
    }
}
