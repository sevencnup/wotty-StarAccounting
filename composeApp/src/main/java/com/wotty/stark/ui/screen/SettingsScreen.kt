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

    Column(Modifier.fillMaxSize().padding(16.dp)) {
        Text("设置", style = MaterialTheme.typography.headlineMedium)
        Spacer(Modifier.height(16.dp))

        Card(Modifier.fillMaxWidth()) {
            Column(Modifier.padding(16.dp)) {
                Text("数据存储", style = MaterialTheme.typography.titleMedium)
                Spacer(Modifier.height(8.dp))
                Text(when (currentMode) {
                    DataMode.LOCAL -> "📍 本地模式 - 数据存储在设备 JSON 文件中"
                    DataMode.CLOUD -> "☁️ 云端模式 - 数据存储在 MySQL 数据库"
                })
            }
        }

        Spacer(Modifier.height(16.dp))

        Card(Modifier.fillMaxWidth()) {
            Column(Modifier.padding(16.dp)) {
                Text("导入账单", style = MaterialTheme.typography.titleMedium)
                Spacer(Modifier.height(8.dp))
                Text("支持导入微信/支付宝 CSV 账单")
                Spacer(Modifier.height(8.dp))
                Button(onClick = { /* TODO */ }) {
                    Text("导入（待实现）")
                }
            }
        }

        Spacer(Modifier.height(16.dp))

        Card(Modifier.fillMaxWidth()) {
            Column(Modifier.padding(16.dp)) {
                Text("关于", style = MaterialTheme.typography.titleMedium)
                Spacer(Modifier.height(8.dp))
                Text("星记账 v1.0.0")
                Text("Kotlin + Jetpack Compose")
            }
        }
    }
}
