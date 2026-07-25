package com.wotty.stark.ui

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.wotty.stark.data.repository.DataModeManager
import com.wotty.stark.ui.screen.DashboardScreen
import com.wotty.stark.ui.screen.SettingsScreen
import com.wotty.stark.ui.screen.TransactionScreen
import com.wotty.stark.ui.theme.StarTheme
import com.wotty.stark.ui.viewmodel.MainViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun App(dataModeManager: DataModeManager) {
    val viewModel = remember { MainViewModel(dataModeManager) }

    StarTheme {
        var selectedTab by remember { mutableIntStateOf(0) }

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
                    val tabs = listOf("首页" to "📊", "记账" to "💳", "报表" to "📈", "设置" to "⚙️")
                    tabs.forEachIndexed { index, (title, icon) ->
                        NavigationBarItem(
                            selected = selectedTab == index,
                            onClick = { selectedTab = index },
                            icon = { Text(icon) },
                            label = { Text(title) }
                        )
                    }
                }
            }
        ) { padding ->
            Box(Modifier.padding(padding)) {
                when (selectedTab) {
                    0 -> DashboardScreen(viewModel)
                    1 -> TransactionScreen(viewModel)
                    2 -> ReportsScreen()
                    3 -> SettingsScreen(viewModel)
                }
            }
        }
    }
}

@Composable
private fun ReportsScreen() {
    Text("报表页面（待实现）", Modifier.padding(16.dp))
}
