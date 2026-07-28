package com.wotty.stark.ui

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wotty.stark.R
import com.wotty.stark.data.repository.DataModeManager
import com.wotty.stark.ui.screen.*
import com.wotty.stark.ui.theme.StarTheme
import com.wotty.stark.ui.viewmodel.MainViewModel
import kotlinx.coroutines.launch

private data class NavItem(val label: String, val iconResId: Int)

private val NAV_ITEMS = listOf(
    NavItem("首页", R.drawable.shouye),
    NavItem("消费", R.drawable.xiaofei),
    NavItem("资产", R.drawable.zichan),
    NavItem("储蓄", R.drawable.chuxv),
    NavItem("贷款", R.drawable.daikuan),
    NavItem("账户", R.drawable.zhanghu)
)

private val TAB_WIDTH = 72.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun App(dataModeManager: DataModeManager) {
    val viewModel = remember { MainViewModel(dataModeManager) }
    val density = LocalDensity.current
    val coroutineScope = rememberCoroutineScope()
    var selectedTab by remember { mutableIntStateOf(0) }

    val dashboardListState = rememberLazyListState()
    val transactionScrollState = rememberScrollState()

    val scrollToTop: () -> Unit = {
        coroutineScope.launch {
            when (selectedTab) {
                0 -> dashboardListState.animateScrollToItem(0)
                1 -> transactionScrollState.animateScrollTo(0)
            }
        }
    }

    StarTheme {
        Scaffold(
            containerColor = Color(0xFFF2F2F2),
            topBar = {
                Surface(color = Color.White, shadowElevation = 2.dp) {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .statusBarsPadding()
                            .padding(vertical = 10.dp)
                            .clickable(
                                interactionSource = remember { MutableInteractionSource() },
                                indication = null,
                                onClick = scrollToTop
                            ),
                        contentAlignment = Alignment.CenterStart
                    ) {
                        Text(
                            text = "星会计",
                            color = Color(0xFF1A1A1A),
                            fontWeight = FontWeight.Medium,
                            fontSize = 18.sp,
                            modifier = Modifier.padding(start = 16.dp)
                        )
                    }
                }
            },
            bottomBar = {
                Surface(
                    color = Color.White,
                    shadowElevation = 8.dp,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    BoxWithConstraints {
                        val visibleCount = (maxWidth / TAB_WIDTH).toInt()
                        val scrollState = rememberScrollState()

                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .horizontalScroll(scrollState)
                                .height(76.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            NAV_ITEMS.forEachIndexed { index, item ->
                                val isSelected = selectedTab == index
                                Box(
                                    modifier = Modifier
                                        .widthIn(min = 64.dp, max = 80.dp)
                                        .clickable(
                                            interactionSource = remember { MutableInteractionSource() },
                                            indication = null,
                                            onClick = { selectedTab = index }
                                        ),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                        Icon(
                                            painter = painterResource(id = item.iconResId),
                                            contentDescription = item.label,
                                            modifier = Modifier.size(24.dp),
                                            tint = if (isSelected) MaterialTheme.colorScheme.primary else Color.Unspecified
                                        )
                                        Spacer(Modifier.height(2.dp))
                                        Text(
                                            item.label,
                                            style = MaterialTheme.typography.labelSmall,
                                            color = if (isSelected) MaterialTheme.colorScheme.primary
                                                    else Color(0xFF999999)
                                        )
                                        if (isSelected) {
                                            Spacer(Modifier.height(2.dp))
                                            Box(
                                                modifier = Modifier
                                                    .size(4.dp)
                                                    .background(
                                                        color = MaterialTheme.colorScheme.primary,
                                                        shape = CircleShape
                                                    )
                                            )
                                        }
                                    }
                                }
                            }
                        }

                        LaunchedEffect(selectedTab) {
                            if (visibleCount < NAV_ITEMS.size && selectedTab >= visibleCount) {
                                val targetDp = TAB_WIDTH * ((selectedTab - visibleCount + 1).toFloat())
                                val targetPx = with(density) { targetDp.toPx().toInt() }
                                scrollState.animateScrollTo(
                                    targetPx.coerceIn(0, scrollState.maxValue)
                                )
                            } else {
                                scrollState.animateScrollTo(0)
                            }
                        }
                    }
                }
            }
        ) { padding ->
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(padding)
                    .background(Color(0xFFF2F2F2))
            ) {
                AnimatedContent(
                    targetState = selectedTab,
                    transitionSpec = {
                        fadeIn(animationSpec = tween(350)) togetherWith fadeOut(animationSpec = tween(150))
                    },
                    label = "screen_transition"
                ) { tab ->
                    when (tab) {
                        0 -> DashboardScreen(viewModel, dashboardListState)
                        1 -> TransactionScreen(viewModel, transactionScrollState)
                        2 -> PlaceholderScreen("资产")
                        3 -> PlaceholderScreen("储蓄")
                        4 -> PlaceholderScreen("贷款")
                        5 -> SettingsScreen(viewModel)
                    }
                }
            }
        }
    }
}

@Composable
private fun PlaceholderScreen(title: String) {
    Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
        Text("$title 页面（待实现）", color = Color(0xFF999999))
    }
}
