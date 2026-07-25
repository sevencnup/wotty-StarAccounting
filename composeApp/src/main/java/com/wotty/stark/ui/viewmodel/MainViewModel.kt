package com.wotty.stark.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wotty.stark.data.model.*
import com.wotty.stark.data.repository.DataModeManager
import com.wotty.stark.data.repository.DataRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class TransactionUiState(
    val transactions: List<Transaction> = emptyList(),
    val currentType: TransactionType = TransactionType.EXPENSE,
    val amount: String = "",
    val category: String = "餐饮",
    val platform: String = "支付宝",
    val merchant: String = "",
    val description: String = "",
    val date: String = "",
    val isLoading: Boolean = false
)

class MainViewModel(
    private val dataModeManager: DataModeManager
) : ViewModel() {

    private val _state = MutableStateFlow(TransactionUiState())
    val state: StateFlow<TransactionUiState> = _state.asStateFlow()

    private val repo: DataRepository get() = dataModeManager.getRepository()

    val currentMode = dataModeManager.currentMode

    private fun now() = kotlinx.datetime.Clock.System.now().toString().substringBefore("T")

    init {
        loadTransactions()
        _state.value = _state.value.copy(date = now())
    }

    private fun loadTransactions() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)
            try {
                val txs = repo.getTransactions(accountId = "", page = 1, pageSize = 20)
                _state.value = _state.value.copy(transactions = txs, isLoading = false)
            } catch (e: Exception) {
                _state.value = _state.value.copy(isLoading = false)
            }
        }
    }

    fun setType(type: TransactionType) {
        _state.value = _state.value.copy(currentType = type)
    }

    fun setAmount(amount: String) {
        if (amount.length <= 12) _state.value = _state.value.copy(amount = amount)
    }

    fun setCategory(category: String) {
        _state.value = _state.value.copy(category = category)
    }

    fun setPlatform(platform: String) {
        _state.value = _state.value.copy(platform = platform)
    }

    fun setMerchant(merchant: String) {
        _state.value = _state.value.copy(merchant = merchant)
    }

    fun setDescription(desc: String) {
        _state.value = _state.value.copy(description = desc)
    }

    fun setDate(date: String) {
        _state.value = _state.value.copy(date = date)
    }

    fun saveTransaction() {
        val s = _state.value
        val amount = s.amount.toDoubleOrNull() ?: return

        viewModelScope.launch {
            try {
                val tx = Transaction(
                    id = java.util.UUID.randomUUID().toString(),
                    userId = "local",
                    accountId = "default",
                    amount = amount,
                    type = s.currentType,
                    category = s.category,
                    platform = s.platform,
                    merchant = s.merchant.ifBlank { null },
                    date = s.date,
                    description = s.description.ifBlank { null }
                )
                repo.saveTransaction(tx)
                _state.value = _state.value.copy(
                    amount = "", merchant = "", description = "",
                    date = now(), category = "餐饮"
                )
                loadTransactions()
            } catch (_: Exception) {}
        }
    }

    fun switchMode() {
        viewModelScope.launch {
            val new = if (currentMode.value == DataMode.LOCAL) DataMode.CLOUD else DataMode.LOCAL
            dataModeManager.switchMode(new)
            loadTransactions()
        }
    }
}

val CATEGORIES = listOf(
    "餐饮", "交通", "购物", "娱乐", "住房", "通讯",
    "医疗", "教育", "服饰", "日用品", "转账", "其他"
)

val PLATFORMS = listOf(
    "支付宝", "微信", "银行卡", "现金", "其他"
)
