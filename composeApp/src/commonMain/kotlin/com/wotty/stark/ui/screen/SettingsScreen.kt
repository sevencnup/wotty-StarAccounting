package com.wotty.stark.ui.screen

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.wotty.stark.data.model.DataMode
import com.wotty.stark.data.repository.DataModeManager

@Composable
fun SettingsScreen(dataModeManager: DataModeManager) {
    val currentMode by dataModeManager.currentMode.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "设置",
            style = MaterialTheme.typography.headlineMedium
        )

        Spacer(modifier = Modifier.height(16.dp))

        Card(
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text("数据存储模式", style = MaterialTheme.typography.titleMedium)
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = when (currentMode) {
                        DataMode.LOCAL -> "📍 本地模式 - 数据存储在设备 JSON 文件中"
                        DataMode.CLOUD -> "☁️ 云端模式 - 数据存储在 MySQL 数据库"
                    }
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Card(
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text("关于", style = MaterialTheme.typography.titleMedium)
                Spacer(modifier = Modifier.height(8.dp))
                Text("星记账 v1.0.0")
                Text("KMP + Compose Multiplatform")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        Card(
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text("导入账单", style = MaterialTheme.typography.titleMedium)
                Spacer(modifier = Modifier.height(8.dp))
                Text("支持导入微信/支付宝 CSV 账单")
                Spacer(modifier = Modifier.height(8.dp))
                Button(
                    onClick = { /* TODO: 导入功能 */ },
                    enabled = false
                ) {
                    Text("导入（待实现）")
                }
            }
        }
    }
}
