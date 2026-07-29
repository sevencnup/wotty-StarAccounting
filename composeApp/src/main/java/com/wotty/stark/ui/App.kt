package com.wotty.stark.ui

import androidx.compose.animation.AnimatedContent
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.togetherWith
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wotty.stark.R
import com.wotty.stark.data.repository.DataModeManager
import com.wotty.stark.ui.screen.*
import com.wotty.stark.ui.theme.StarTheme
import com.wotty.stark.ui.viewmodel.MainViewModel
import kotlinx.coroutines.launch

private data class NavItem(val label: String, val iconResId: Int?, val isPrimary: Boolean = false)

private val NAV_ITEMS = listOf(
    NavItem("首页", R.drawable.shouye),
    NavItem("消费", R.drawable.xiaofei),
    NavItem("储蓄", R.drawable.chuxv),
    NavItem("贷款", R.drawable.daikuan),
    NavItem("账户", R.drawable.zhanghu)
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun App(dataModeManager: DataModeManager) {
    val viewModel = remember { MainViewModel(dataModeManager) }
    val coroutineScope = rememberCoroutineScope()
    var selectedTab by remember { mutableIntStateOf(0) }

    val dashboardScrollState = rememberScrollState()
    val transactionScrollState = rememberScrollState()
    val savingsListState = rememberLazyListState()
    val loanListState = rememberLazyListState()

    val scrollToTop: () -> Unit = {
        coroutineScope.launch {
            when (selectedTab) {
                0 -> dashboardScrollState.animateScrollTo(0)
                1 -> transactionScrollState.animateScrollTo(0)
                2 -> savingsListState.animateScrollToItem(0)
                3 -> loanListState.animateScrollToItem(0)
            }
        }
    }

    StarTheme {
        Scaffold(
            containerColor = Color(0xFFF2F2F2),
            contentWindowInsets = WindowInsets(0, 0, 0, 0),
            topBar = {},
            bottomBar = {
                Surface(
                    color = Color.White,
                    shadowElevation = 14.dp,
                    shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .navigationBarsPadding()
                            .height(78.dp)
                            .padding(horizontal = 10.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        NAV_ITEMS.forEachIndexed { index, item ->
                            BottomNavItem(
                                item = item,
                                selected = selectedTab == index,
                                onClick = { selectedTab = index },
                                modifier = Modifier.weight(1f)
                            )
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
                        0 -> DashboardScreen(viewModel, dashboardScrollState)
                        1 -> BillScreen(
                            viewModel = viewModel,
                            scrollState = transactionScrollState,
                            onAddClick = { }
                        )
                        2 -> SavingsScreen(viewModel, savingsListState)
                        3 -> LoanScreen(viewModel, loanListState)
                        4 -> AccountOverviewScreen(viewModel)
                    }
                }
            }
        }
    }
}

@Composable
private fun BottomNavItem(
    item: NavItem,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val activeColor = Color(0xFF2678FF)
    val inactiveColor = Color(0xFFADB7C4)

    Box(
        modifier = modifier
            .fillMaxHeight()
            .clickable(
                interactionSource = remember { MutableInteractionSource() },
                indication = null,
                onClick = onClick
            ),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center,
            modifier = Modifier.fillMaxWidth()
        ) {
            if (item.isPrimary) {
                Box(
                    modifier = Modifier
                        .size(46.dp)
                        .background(activeColor, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "+",
                        color = Color.White,
                        fontSize = 34.sp,
                        lineHeight = 34.sp,
                        fontWeight = FontWeight.Light,
                        textAlign = TextAlign.Center
                    )
                }
                Spacer(Modifier.height(3.dp))
                Text(
                    text = item.label,
                    color = activeColor,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.SemiBold
                )
            } else {
                Icon(
                    painter = painterResource(id = item.iconResId ?: R.drawable.shouye),
                    contentDescription = item.label,
                    modifier = Modifier.size(24.dp),
                    tint = if (selected) activeColor else inactiveColor
                )
                Spacer(Modifier.height(4.dp))
                Text(
                    item.label,
                    fontSize = 11.sp,
                    fontWeight = if (selected) FontWeight.SemiBold else FontWeight.Medium,
                    color = if (selected) activeColor else inactiveColor
                )
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
