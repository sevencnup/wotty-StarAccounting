package com.wotty.stark.ui.screen

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.wotty.stark.data.model.TransactionType
import com.wotty.stark.ui.viewmodel.CATEGORIES
import com.wotty.stark.ui.viewmodel.MainViewModel
import com.wotty.stark.ui.viewmodel.PLATFORMS

@Composable
fun TransactionScreen(viewModel: MainViewModel) {
    val state by viewModel.state.collectAsState()

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(16.dp)
    ) {
        // 收支切换
        Row(
            Modifier.fillMaxWidth().padding(bottom = 16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            listOf(TransactionType.EXPENSE to "支出", TransactionType.INCOME to "收入").forEach { (type, label) ->
                FilterChip(
                    selected = state.currentType == type,
                    onClick = { viewModel.setType(type) },
                    label = { Text(label) },
                    modifier = Modifier.weight(1f),
                    colors = FilterChipDefaults.filterChipColors(
                        selectedContainerColor = if (type == TransactionType.EXPENSE)
                            Color(0xFFE53935).copy(alpha = 0.2f)
                        else Color(0xFF43A047).copy(alpha = 0.2f)
                    )
                )
            }
        }

        // 金额输入
        OutlinedTextField(
            value = state.amount,
            onValueChange = { viewModel.setAmount(it) },
            label = { Text("金额") },
            leadingIcon = { Text("¥") },
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
            singleLine = true,
            modifier = Modifier.fillMaxWidth(),
            textStyle = LocalTextStyle.current.copy(fontSize = 28.sp, fontWeight = FontWeight.Bold)
        )

        Spacer(Modifier.height(16.dp))

        // 日期
        OutlinedTextField(
            value = state.date.take(10),
            onValueChange = { viewModel.setDate(it) },
            label = { Text("日期") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(16.dp))

        // 分类选择
        Text("分类", style = MaterialTheme.typography.titleSmall)
        Spacer(Modifier.height(8.dp))
        LazyVerticalGrid(
            columns = GridCells.Fixed(4),
            modifier = Modifier.height(180.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            items(CATEGORIES) { cat ->
                CategoryChip(
                    label = cat,
                    selected = state.category == cat,
                    onClick = { viewModel.setCategory(cat) }
                )
            }
        }

        Spacer(Modifier.height(16.dp))

        // 平台选择
        Text("支付方式", style = MaterialTheme.typography.titleSmall)
        Spacer(Modifier.height(8.dp))
        LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            items(PLATFORMS) { platform ->
                FilterChip(
                    selected = state.platform == platform,
                    onClick = { viewModel.setPlatform(platform) },
                    label = { Text(platform) }
                )
            }
        }

        Spacer(Modifier.height(12.dp))

        // 商户名
        OutlinedTextField(
            value = state.merchant,
            onValueChange = { viewModel.setMerchant(it) },
            label = { Text("商户（选填）") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(12.dp))

        // 备注
        OutlinedTextField(
            value = state.description,
            onValueChange = { viewModel.setDescription(it) },
            label = { Text("备注（选填）") },
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        Spacer(Modifier.height(24.dp))

        // 保存按钮
        Button(
            onClick = { viewModel.saveTransaction() },
            modifier = Modifier.fillMaxWidth().height(50.dp),
            enabled = state.amount.toDoubleOrNull() != null
        ) {
            Text("保存", fontSize = 18.sp)
        }

        Spacer(Modifier.height(16.dp))
    }
}

@Composable
private fun CategoryChip(label: String, selected: Boolean, onClick: () -> Unit) {
    Surface(
        modifier = Modifier
            .aspectRatio(1.2f)
            .clickable { onClick() },
        shape = RoundedCornerShape(12.dp),
        color = if (selected) MaterialTheme.colorScheme.primaryContainer
        else MaterialTheme.colorScheme.surfaceVariant,
        tonalElevation = if (selected) 4.dp else 1.dp
    ) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text(
                label,
                fontSize = 14.sp,
                fontWeight = if (selected) FontWeight.Bold else FontWeight.Normal,
                color = if (selected) MaterialTheme.colorScheme.onPrimaryContainer
                else MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}
