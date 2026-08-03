package com.wotty.stark.ui.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.wotty.stark.data.model.Account
import com.wotty.stark.data.model.Asset
import com.wotty.stark.data.model.Budget
import com.wotty.stark.data.model.DataMode
import com.wotty.stark.data.model.Loan
import com.wotty.stark.data.model.SavingsGoal
import com.wotty.stark.data.model.Transaction
import com.wotty.stark.data.model.TransactionType
import com.wotty.stark.data.repository.DataModeManager
import com.wotty.stark.data.repository.DataRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.datetime.TimeZone
import kotlinx.datetime.toLocalDateTime

data class TransactionUiState(
    val transactions: List<Transaction> = emptyList(),
    val assets: List<Asset> = emptyList(),
    val loans: List<Loan> = emptyList(),
    val savingsGoals: List<SavingsGoal> = emptyList(),
    val accounts: List<Account> = emptyList(),
    val budgets: List<Budget> = emptyList(),
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
    private val dataModeManager: DataModeManager,
    private val repositoryOverride: DataRepository? = null
) : ViewModel() {

    private val _state = MutableStateFlow(TransactionUiState())
    val state: StateFlow<TransactionUiState> = _state.asStateFlow()

    private val _settingsMessage = MutableStateFlow<String?>(null)
    val settingsMessage: StateFlow<String?> = _settingsMessage.asStateFlow()

    private val repo: DataRepository get() = repositoryOverride ?: dataModeManager.getRepository()

    val currentMode = dataModeManager.currentMode
    val cloudBaseUrl = dataModeManager.cloudBaseUrl

    private fun now() = kotlinx.datetime.Clock.System.now()
        .toLocalDateTime(TimeZone.currentSystemDefault())
        .let { dateTime ->
            val month = dateTime.monthNumber.toString().padStart(2, '0')
            val day = dateTime.dayOfMonth.toString().padStart(2, '0')
            val hour = dateTime.hour.toString().padStart(2, '0')
            val minute = dateTime.minute.toString().padStart(2, '0')
            "${dateTime.year}-$month-$day $hour:$minute"
        }

    init {
        _state.value = _state.value.copy(date = now())
        refreshData()
    }

    fun refreshData() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)

            val transactions = runCatching {
                repo.getTransactions(accountId = "default", page = 1, pageSize = 200)
            }.getOrDefault(emptyList())

            val assets = runCatching {
                repo.getAssets(accountId = "default")
            }.getOrDefault(emptyList())

            val budgets = runCatching {
                repo.getBudgets(accountId = "default")
            }.getOrDefault(emptyList())

            val loans = runCatching {
                repo.getLoans(accountId = "default")
            }.getOrDefault(emptyList())

            val savingsGoals = runCatching {
                repo.getSavingsGoals(accountId = "default")
            }.getOrDefault(emptyList())

            val accounts = runCatching {
                repo.getAccounts()
            }.getOrDefault(emptyList())

            if (transactions.isEmpty() && assets.isEmpty() && loans.isEmpty() && savingsGoals.isEmpty()) {
                runCatching { repo.seedDemoData() }
                val seededTransactions = runCatching {
                    repo.getTransactions(accountId = "default", page = 1, pageSize = 200)
                }.getOrDefault(emptyList())
                val seededAssets = runCatching {
                    repo.getAssets(accountId = "default")
                }.getOrDefault(emptyList())
                val seededBudgets = runCatching {
                    repo.getBudgets(accountId = "default")
                }.getOrDefault(emptyList())
                val seededLoans = runCatching {
                    repo.getLoans(accountId = "default")
                }.getOrDefault(emptyList())
                val seededGoals = runCatching {
                    repo.getSavingsGoals(accountId = "default")
                }.getOrDefault(emptyList())

                _state.value = _state.value.copy(
                    transactions = seededTransactions,
                    assets = seededAssets,
                    budgets = seededBudgets,
                    loans = seededLoans,
                    savingsGoals = seededGoals,
                    accounts = accounts,
                    isLoading = false
                )
            } else {
                _state.value = _state.value.copy(
                    transactions = transactions,
                    assets = assets,
                    budgets = budgets,
                    loans = loans,
                    savingsGoals = savingsGoals,
                    accounts = accounts,
                    isLoading = false
                )
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
                    amount = "",
                    merchant = "",
                    description = "",
                    date = now(),
                    category = "餐饮"
                )
                refreshData()
            } catch (_: Exception) {
            }
        }
    }

    fun setMode(mode: DataMode) {
        viewModelScope.launch {
            if (mode == DataMode.CLOUD && !dataModeManager.testCloudConnection()) {
                _settingsMessage.value = "无法连接云端，请检查域名和服务状态"
                return@launch
            }
            dataModeManager.switchMode(mode)
            _settingsMessage.value = if (mode == DataMode.CLOUD) "已切换到云端模式" else "已切换到本地模式"
            refreshData()
        }
    }

    fun saveCloudBaseUrl(rawUrl: String) {
        viewModelScope.launch {
            if (!dataModeManager.testCloudConnection(rawUrl)) {
                _settingsMessage.value = "连接失败，请确认域名可访问且后端已启动"
                return@launch
            }
            dataModeManager.setCloudBaseUrl(rawUrl)
            _settingsMessage.value = "云端地址已保存"
        }
    }

    fun clearSettingsMessage() {
        _settingsMessage.value = null
    }
}

val CATEGORIES = listOf(
    "餐饮", "交通", "购物", "娱乐", "住房", "通讯",
    "医疗", "教育", "服饰", "日用品", "转账", "其他"
)

val PLATFORMS = listOf(
    "支付宝", "微信", "银行卡", "现金", "其他"
)
