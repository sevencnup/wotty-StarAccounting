package com.wotty.stark.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import com.wotty.stark.data.model.DataMode
import com.wotty.stark.data.repository.DataModeManager
import com.wotty.stark.ui.screen.DashboardScreen
import com.wotty.stark.ui.screen.SettingsScreen
import com.wotty.stark.ui.theme.StarAccountingTheme

/**
 * App 根组件
 * 管理底部导航和页面切换
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun App(dataModeManager: DataModeManager) {
    StarAccountingTheme {
        var selectedTab by remember { mutableStateOf(0) }
        val currentMode by dataModeManager.currentMode.collectAsState()

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
                    NavigationBarItem(
                        selected = selectedTab == 0,
                        onClick = { selectedTab = 0 },
                        icon = { Text("📊") },
                        label = { Text("首页") }
                    )
                    NavigationBarItem(
                        selected = selectedTab == 1,
                        onClick = { selectedTab = 1 },
                        icon = { Text("💳") },
                        label = { Text("记账") }
                    )
                    NavigationBarItem(
                        selected = selectedTab == 2,
                        onClick = { selectedTab = 2 },
                        icon = { Text("📈") },
                        label = { Text("报表") }
                    )
                    NavigationBarItem(
                        selected = selectedTab == 3,
                        onClick = { selectedTab = 3 },
                        icon = { Text("⚙️") },
                        label = { Text("设置") }
                    )
                }
            }
        ) { paddingValues ->
            Box(modifier = Modifier.padding(paddingValues)) {
                when (selectedTab) {
                    0 -> DashboardScreen(dataModeManager)
                    1 -> Text("记账页面（待实现）", modifier = Modifier.padding(16.dp))
                    2 -> Text("报表页面（待实现）", modifier = Modifier.padding(16.dp))
                    3 -> SettingsScreen(dataModeManager)
                }
            }
        }
    }
}
