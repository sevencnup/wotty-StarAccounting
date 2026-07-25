package com.wotty.stark.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.wotty.stark.data.repository.DataModeManager
import com.wotty.stark.ui.screen.DashboardScreen
import com.wotty.stark.ui.screen.SettingsScreen
import com.wotty.stark.ui.theme.StarTheme

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun App(dataModeManager: DataModeManager) {
    StarTheme {
        var selectedTab by remember { mutableIntStateOf(0) }
        val currentMode by dataModeManager.currentMode.collectAsState()

        val tabs = listOf("首页", "记账", "报表", "设置")
        val icons = listOf("📊", "💳", "📈", "⚙️")

        Scaffold(
            topBar = {
                TopAppBar(
                    title = { Text("星记账") },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer,
                        titleContentColor = MaterialTheme.colorScheme.onPrimaryContainer
                    )
                )
            },
            bottomBar = {
                NavigationBar {
                    tabs.forEachIndexed { index, title ->
                        NavigationBarItem(
                            selected = selectedTab == index,
                            onClick = { selectedTab = index },
                            icon = { Text(icons[index]) },
                            label = { Text(title) }
                        )
                    }
                }
            }
        ) { padding ->
            Box(Modifier.padding(padding)) {
                when (selectedTab) {
                    0 -> DashboardScreen(dataModeManager)
                    1 -> TransactionScreen(dataModeManager)
                    2 -> Text("报表（待实现）", Modifier.padding(16.dp))
                    3 -> SettingsScreen(dataModeManager)
                }
            }
        }
    }
}

@Composable
private fun TransactionScreen(dataModeManager: DataModeManager) {
    Text("记账页面（待实现）", Modifier.padding(16.dp))
}
