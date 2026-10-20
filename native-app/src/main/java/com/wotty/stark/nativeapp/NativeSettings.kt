package com.wotty.stark.nativeapp

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.imePadding
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CloudSync
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Download
import androidx.compose.material.icons.filled.CloudDownload
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Label
import androidx.compose.material.icons.filled.ReceiptLong
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.ModalBottomSheet
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.TextButton
import androidx.compose.material3.rememberModalBottomSheetState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.launch
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.util.Locale
import java.util.UUID

private val SettingsInk = Color(0xFF1F2937)
private val SettingsMuted = Color(0xFF7B8798)
private val SettingsBlue = Color(0xFF0869C6)
private val SettingsGreen = Color(0xFF0A966B)
private val SettingsRed = Color(0xFFD94D5D)
private val SettingsAmber = Color(0xFFF0A329)
private val SettingsLine = Color(0xFFE8EDF3)

@Composable
internal fun NativeSettingsScreen(
    modifier: Modifier,
    apiPreferences: NativeApiPreferences,
    apiStatus: String,
    subscriptions: List<NativeSubscription>,
    categoryRules: List<NativeCategoryRule>,
    transactions: List<LedgerEntry>,
    savingsPlans: List<NativeSavingsPlan>,
    ledgerAccount: NativeLedgerAccount,
    csvExportStatus: String,
    csvImportStatus: String,
    pendingCsvImport: NativeBillImportPreview?,
    importErrors: List<NativeImportError>,
    importingCsv: Boolean,
    onOpenApi: () -> Unit,
    onSaveBalanceBaseline: suspend (Double, String) -> Unit,
    onRefresh: () -> Unit,
    onChangePassword: suspend (String, String) -> Unit,
    onLoadRegistrationStatus: suspend () -> Boolean,
    onSetRegistrationEnabled: suspend (Boolean, String) -> Boolean,
    onLogout: () -> Unit,
    onExportBills: () -> Unit,
    onPickBills: () -> Unit,
    onConfirmBillImport: suspend () -> Unit,
    onSaveSubscription: suspend (NativeSubscription) -> Unit,
    onDeleteSubscription: suspend (NativeSubscription) -> Unit,
    onSaveCategoryRule: suspend (NativeCategoryRule) -> Int,
    onToggleCategoryRule: suspend (NativeCategoryRule) -> Unit,
    onDeleteCategoryRule: suspend (NativeCategoryRule) -> Unit,
) {
    val uiPreferences = LocalNativeUiPreferences.current
    var subscriptionsOpen by remember { mutableStateOf(false) }
    var categoryRulesOpen by remember { mutableStateOf(false) }
    var csvExportOpen by remember { mutableStateOf(false) }
    var csvImportOpen by remember { mutableStateOf(false) }
    var languageOpen by remember { mutableStateOf(false) }
    var fontOpen by remember { mutableStateOf(false) }
    var accountOpen by remember { mutableStateOf(false) }
    var logoutConfirmOpen by remember { mutableStateOf(false) }
    var helpOpen by remember { mutableStateOf(false) }
    var aboutOpen by remember { mutableStateOf(false) }
    var balanceBaselineOpen by remember { mutableStateOf(false) }
    val languageLabel = when (uiPreferences.value.language) {
        NativeLanguageChoice.SYSTEM -> "跟随系统"
        NativeLanguageChoice.ZH_CN -> "简体中文"
        NativeLanguageChoice.EN_US -> "英文"
    }
    val fontLabel = when (uiPreferences.value.font) {
        NativeFontChoice.SMALL -> "较小"
        NativeFontChoice.STANDARD -> "标准"
        NativeFontChoice.LARGE -> "较大"
    }
    LazyColumn(
        modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 18.dp, end = 18.dp, top = 8.dp, bottom = 104.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item { SettingsPageHeader() }
        item {
            SettingsPanel {
                Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text(if (apiPreferences.token.isBlank()) "本地账本" else "云端账本", color = SettingsInk, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                        Text(apiStatus, color = if (apiPreferences.token.isBlank()) SettingsMuted else SettingsGreen, fontSize = 11.sp, modifier = Modifier.padding(top = 4.dp))
                        if (apiPreferences.token.isNotBlank()) {
                            Text("当前使用独立云端账本；退出后可回到本地数据。", color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 3.dp))
                            Text(apiPreferences.baseUrl, color = SettingsMuted, fontSize = 9.sp, maxLines = 1, overflow = TextOverflow.Ellipsis, modifier = Modifier.padding(top = 3.dp))
                        } else {
                            Text("数据保存在此设备；云端账本与本地账本彼此独立，不会合并。", color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 3.dp))
                        }
                    }
                    Icon(Icons.Default.CloudSync, contentDescription = null, tint = SettingsBlue, modifier = Modifier.size(22.dp))
                }
                Row(Modifier.fillMaxWidth().padding(top = 7.dp), horizontalArrangement = Arrangement.End) {
                    TextButton(onClick = onRefresh, enabled = apiPreferences.token.isNotBlank()) {
                        Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(16.dp))
                        Text("刷新数据")
                    }
                    TextButton(onClick = onOpenApi) { Text(if (apiPreferences.token.isBlank()) "连接云端" else "切换云端账户") }
                }
            }
        }
        item {
            SettingsSectionTitle("账单管理", "管理分类规则、周期支出并导入导出账单")
            SettingsMenuRow(
                title = "订阅/扣费管理",
                detail = if (subscriptions.isEmpty()) "保险、房租等固定支出 · 尚未设置" else "${subscriptions.count { it.isActive }} 项自动记账中 · 共 ${subscriptions.size} 项",
                color = SettingsGreen,
                icon = Icons.Default.ReceiptLong,
                onClick = { subscriptionsOpen = true },
            )
            SettingsMenuRow(
                title = "账单归类规则",
                detail = if (categoryRules.isEmpty()) "按关键词把转账等账单归入消费分类" else "${categoryRules.count { it.isActive }} 条启用 · 共 ${categoryRules.size} 条规则",
                color = SettingsBlue,
                icon = Icons.Default.Label,
                onClick = { categoryRulesOpen = true },
            )
            SettingsMenuRow(
                title = "导入账单",
                detail = if (importErrors.count { !it.resolved } == 0) translateNativeText("支持 CSV、XLS、XLSX · 确认后写入当前账本", uiPreferences.value.language) else "${importErrors.count { !it.resolved }} 条导入问题待处理",
                color = SettingsBlue,
                icon = Icons.Default.CloudDownload,
                onClick = { csvImportOpen = true },
            )
            SettingsMenuRow(
                title = "导出账单",
                detail = "当前账本全部流水 · UTF-8 CSV",
                color = SettingsBlue,
                icon = Icons.Default.Download,
                onClick = { csvExportOpen = true },
            )
        }
        item {
            SettingsSectionTitle("界面显示", "选择界面语言和文字大小")
            SettingsMenuRow("语言", languageLabel, SettingsBlue, Icons.Default.Info) { languageOpen = true }
            SettingsMenuRow("字体大小", fontLabel, SettingsAmber, Icons.Default.Settings) { fontOpen = true }
        }
        item {
            SettingsSectionTitle("账本余额", "设置账户余额基准，后续按真实账单累计")
            val baselineDate = ledgerAccount.openingBalanceDate?.take(10)
            val baselineDetail = if (baselineDate == null || ledgerAccount.openingBalance == null) {
                "尚未设置 · 首页结余沿用现有账本余额"
            } else {
                "基准 $baselineDate · ¥ ${"%,.2f".format(Locale.getDefault(), ledgerAccount.openingBalance)}"
            }
            SettingsMenuRow(
                "余额基准",
                baselineDetail,
                SettingsGreen,
                Icons.Default.ReceiptLong,
            ) { balanceBaselineOpen = true }
        }
        if (apiPreferences.token.isNotBlank()) {
            item {
                SettingsSectionTitle("云端账户", "管理账户安全和新用户注册")
                SettingsMenuRow("账户设置", "修改密码、管理注册", SettingsBlue, Icons.Default.Info) { accountOpen = true }
                TextButton(
                    onClick = { logoutConfirmOpen = true },
                    modifier = Modifier.fillMaxWidth().padding(top = 2.dp),
                ) { Text("退出登录", color = SettingsRed) }
            }
        }
        item {
            SettingsSectionTitle("应用信息", "纯 Kotlin · Jetpack Compose")
            SettingsMenuRow("帮助与反馈", "数据来源、账单导入和反馈渠道", SettingsBlue, Icons.Default.Info) { helpOpen = true }
            SettingsMenuRow("关于星会计", "版本 ${BuildConfig.VERSION_NAME}", SettingsAmber, Icons.Default.Settings) { aboutOpen = true }
        }
    }
    if (subscriptionsOpen) {
        NativeSubscriptionManagerSheet(
            items = subscriptions,
            onDismiss = { subscriptionsOpen = false },
            onSave = onSaveSubscription,
            onDelete = onDeleteSubscription,
        )
    }
    if (categoryRulesOpen) {
        NativeCategoryRuleManagerSheet(
            rules = categoryRules,
            transactions = transactions,
            onDismiss = { categoryRulesOpen = false },
            onSave = onSaveCategoryRule,
            onToggle = onToggleCategoryRule,
            onDelete = onDeleteCategoryRule,
        )
    }
    if (csvExportOpen) {
        NativeCsvExportSheet(
            status = csvExportStatus,
            onDismiss = { csvExportOpen = false },
            onExport = onExportBills,
        )
    }
    if (csvImportOpen) {
        NativeCsvImportSheet(
            status = csvImportStatus,
            preview = pendingCsvImport,
            importErrors = importErrors,
            importing = importingCsv,
            onDismiss = { csvImportOpen = false },
            onPick = onPickBills,
            onConfirm = onConfirmBillImport,
        )
    }
    if (languageOpen) {
        NativeLanguageSheet(
            selected = uiPreferences.value.language,
            onSelect = uiPreferences::selectLanguage,
            onDismiss = { languageOpen = false },
        )
    }
    if (fontOpen) {
        NativeFontSheet(
            selected = uiPreferences.value.font,
            onSelect = uiPreferences::selectFont,
            onDismiss = { fontOpen = false },
        )
    }
    if (accountOpen && apiPreferences.token.isNotBlank()) {
        NativeAccountSettingsSheet(
            onDismiss = { accountOpen = false },
            onChangePassword = onChangePassword,
            onLoadRegistrationStatus = onLoadRegistrationStatus,
            onSetRegistrationEnabled = onSetRegistrationEnabled,
        )
    }
    if (logoutConfirmOpen) {
        AlertDialog(
            onDismissRequest = { logoutConfirmOpen = false },
            title = { Text("退出云端账户？", fontWeight = FontWeight.Bold) },
            text = { Text("退出后继续使用本地账本，云端数据不会删除。") },
            dismissButton = { TextButton(onClick = { logoutConfirmOpen = false }) { Text("取消") } },
            confirmButton = {
                TextButton(onClick = {
                    onLogout()
                    logoutConfirmOpen = false
                    accountOpen = false
                }) { Text("退出登录", color = SettingsRed) }
            },
        )
    }
    if (helpOpen) {
        NativeHelpSheet(onDismiss = { helpOpen = false })
    }
    if (aboutOpen) {
        NativeAboutSheet(onDismiss = { aboutOpen = false })
    }
    if (balanceBaselineOpen) {
        NativeLedgerBalanceSheet(
            account = ledgerAccount,
            entries = transactions,
            savingsPlans = savingsPlans,
            onDismiss = { balanceBaselineOpen = false },
            onSave = onSaveBalanceBaseline,
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun NativeAccountSettingsSheet(
    onDismiss: () -> Unit,
    onChangePassword: suspend (String, String) -> Unit,
    onLoadRegistrationStatus: suspend () -> Boolean,
    onSetRegistrationEnabled: suspend (Boolean, String) -> Boolean,
) {
    val scope = rememberCoroutineScope()
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    var newPassword by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var passwordError by remember { mutableStateOf("") }
    var passwordMessage by remember { mutableStateOf("") }
    var passwordSubmitting by remember { mutableStateOf(false) }
    var registrationEnabled by remember { mutableStateOf(false) }
    var registrationLoading by remember { mutableStateOf(true) }
    var registrationStatusLoaded by remember { mutableStateOf(false) }
    var registrationSubmitting by remember { mutableStateOf(false) }
    var adminKey by remember { mutableStateOf("") }
    var registrationError by remember { mutableStateOf("") }
    var registrationMessage by remember { mutableStateOf("") }

    suspend fun reloadRegistrationStatus() {
        registrationLoading = true
        registrationError = ""
        try {
            registrationEnabled = onLoadRegistrationStatus()
            registrationStatusLoaded = true
        } catch (error: Exception) {
            registrationError = error.message ?: "无法读取注册状态"
            registrationStatusLoaded = false
        } finally {
            registrationLoading = false
        }
    }

    LaunchedEffect(Unit) { reloadRegistrationStatus() }

    ModalBottomSheet(onDismissRequest = onDismiss, sheetState = sheetState) {
        Column(
            Modifier.fillMaxWidth().heightIn(max = 790.dp).verticalScroll(rememberScrollState())
                .navigationBarsPadding().imePadding().padding(horizontal = 18.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("账户设置", color = SettingsInk, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    Text("管理密码和新用户注册", color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 3.dp))
                }
                TextButton(onClick = onDismiss) { Text("完成") }
            }

            SettingsPanel {
                Text("修改密码", color = SettingsInk, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Text("新密码至少需要 8 位。", color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 3.dp, bottom = 7.dp))
                OutlinedTextField(
                    value = newPassword,
                    onValueChange = { newPassword = it; passwordError = ""; passwordMessage = "" },
                    label = { Text("新密码") },
                    placeholder = { Text("请输入新密码") },
                    singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                    modifier = Modifier.fillMaxWidth(),
                )
                OutlinedTextField(
                    value = confirmPassword,
                    onValueChange = { confirmPassword = it; passwordError = ""; passwordMessage = "" },
                    label = { Text("确认新密码") },
                    placeholder = { Text("请再次输入新密码") },
                    singleLine = true,
                    visualTransformation = PasswordVisualTransformation(),
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                    modifier = Modifier.fillMaxWidth().padding(top = 7.dp),
                )
                if (passwordError.isNotBlank()) SettingsInlineMessage(passwordError, SettingsRed)
                if (passwordMessage.isNotBlank()) SettingsInlineMessage(passwordMessage, SettingsGreen)
                Button(
                    onClick = {
                        passwordError = when {
                            newPassword.isBlank() || confirmPassword.isBlank() -> "请完整填写密码信息"
                            newPassword.length < 8 -> "新密码至少需要 8 位"
                            newPassword != confirmPassword -> "两次输入的新密码不一致"
                            else -> ""
                        }
                        if (passwordError.isNotBlank()) {
                            passwordMessage = ""
                        } else {
                            scope.launch {
                                passwordSubmitting = true
                                passwordError = ""
                                passwordMessage = ""
                                try {
                                    onChangePassword(newPassword, confirmPassword)
                                    newPassword = ""
                                    confirmPassword = ""
                                    passwordMessage = "密码修改成功，请妥善保管新密码。"
                                } catch (error: Exception) {
                                    passwordError = error.message ?: "密码修改失败，请稍后重试"
                                } finally {
                                    passwordSubmitting = false
                                }
                            }
                        }
                    },
                    enabled = !passwordSubmitting,
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp).height(46.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = SettingsBlue),
                    shape = RoundedCornerShape(13.dp),
                ) {
                    Text(if (passwordSubmitting) "提交中..." else "确认修改密码", fontWeight = FontWeight.SemiBold)
                }
            }

            SettingsPanel {
                Text("新用户注册", color = SettingsInk, fontSize = 14.sp, fontWeight = FontWeight.Bold)
                Text(
                    when {
                        registrationLoading -> "正在读取注册状态..."
                        registrationEnabled -> "当前允许新用户注册。"
                        else -> "当前已关闭新用户注册。"
                    },
                    color = SettingsMuted,
                    fontSize = 10.sp,
                    modifier = Modifier.padding(top = 3.dp, bottom = 7.dp),
                )
                OutlinedTextField(
                    value = adminKey,
                    onValueChange = { adminKey = it; registrationError = ""; registrationMessage = "" },
                    label = { Text("管理员恢复密钥") },
                    placeholder = { Text("输入部署管理员恢复密钥") },
                    singleLine = true,
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password),
                    visualTransformation = PasswordVisualTransformation(),
                    modifier = Modifier.fillMaxWidth(),
                )
                Text("密钥只用于本次提交，不会保存在设备中。", color = SettingsMuted, fontSize = 9.sp, modifier = Modifier.padding(top = 5.dp))
                if (registrationError.isNotBlank()) SettingsInlineMessage(registrationError, SettingsRed)
                if (registrationMessage.isNotBlank()) SettingsInlineMessage(registrationMessage, SettingsGreen)
                if (!registrationStatusLoaded && !registrationLoading) {
                    TextButton(onClick = { scope.launch { reloadRegistrationStatus() } }, modifier = Modifier.align(Alignment.End)) {
                        Text("重试读取")
                    }
                }
                Button(
                    onClick = {
                        if (adminKey.isBlank()) {
                            registrationError = "请输入管理员恢复密钥"
                            registrationMessage = ""
                        } else {
                            scope.launch {
                                registrationSubmitting = true
                                registrationError = ""
                                registrationMessage = ""
                                val requestedState = !registrationEnabled
                                try {
                                    registrationEnabled = onSetRegistrationEnabled(requestedState, adminKey.trim())
                                    registrationMessage = if (registrationEnabled) "已开启新用户注册" else "已关闭新用户注册"
                                } catch (error: Exception) {
                                    registrationError = error.message ?: "注册设置更新失败"
                                } finally {
                                    adminKey = ""
                                    registrationSubmitting = false
                                }
                            }
                        }
                    },
                    enabled = registrationStatusLoaded && !registrationLoading && !registrationSubmitting,
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp).height(46.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = if (registrationEnabled) SettingsRed else SettingsGreen),
                    shape = RoundedCornerShape(13.dp),
                ) {
                    Text(
                        when {
                            registrationSubmitting -> "提交中..."
                            registrationEnabled -> "关闭新用户注册"
                            else -> "开启新用户注册"
                        },
                        fontWeight = FontWeight.SemiBold,
                    )
                }
            }
            Spacer(Modifier.height(6.dp))
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun NativeHelpSheet(onDismiss: () -> Unit) {
    val language = LocalNativeUiPreferences.current.value.language
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    ModalBottomSheet(onDismissRequest = onDismiss, sheetState = sheetState) {
        Column(
            Modifier.fillMaxWidth().heightIn(max = 790.dp).verticalScroll(rememberScrollState())
                .navigationBarsPadding().padding(horizontal = 18.dp),
            verticalArrangement = Arrangement.spacedBy(11.dp),
        ) {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("帮助与反馈", color = SettingsInk, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    Text("数据来源、账单导入和问题反馈", color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 3.dp))
                }
                TextButton(onClick = onDismiss) { Text("完成") }
            }
            SettingsPanel {
                Text("数据没有加载出来怎么办？", color = SettingsInk, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Text("先确认当前使用本地账本还是云端账本。云端模式下检查服务地址、网络和后端数据库，再点“刷新数据”；连接失败时不会切到本地数据。", color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 5.dp))
            }
            SettingsPanel {
                Text("账单导入支持什么格式？", color = SettingsInk, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Text(translateNativeText("支持微信、支付宝官方 CSV、XLS、XLSX 文件，以及本应用导出的 CSV 备份。Excel 工作簿读取第一个工作表。", language), color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 5.dp))
            }
            SettingsPanel {
                Text("本地和云端数据会合并吗？", color = SettingsInk, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Text("不会。本地账本保存在当前设备，云端账本由服务器保存；连接或退出云端不会把两边的账单合并。", color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 5.dp))
            }
            SettingsPanel {
                Text("Web 端和原生版有什么不同？", color = SettingsInk, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Text("纯 Kotlin 版是 Android 原生应用；Web 版可在 PC、iOS、鸿蒙等设备的浏览器中使用。不同版本的功能会逐步补齐。", color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 5.dp))
            }
            SettingsPanel {
                Text("反馈与帮助", color = SettingsInk, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                ExternalSettingsLink("国际站点端反馈", "github.com/sevencnup/wotty-StarAccounting/issues", "https://github.com/sevencnup/wotty-StarAccounting/issues")
                HorizontalDivider(color = SettingsLine)
                ExternalSettingsLink("国内站点端反馈", "sevencn.com/software/staraccounting", "https://sevencn.com/software/staraccounting")
            }
            Spacer(Modifier.height(8.dp))
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun NativeAboutSheet(onDismiss: () -> Unit) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    ModalBottomSheet(onDismissRequest = onDismiss, sheetState = sheetState) {
        Column(
            Modifier.fillMaxWidth().heightIn(max = 790.dp).verticalScroll(rememberScrollState())
                .navigationBarsPadding().padding(horizontal = 18.dp),
            verticalArrangement = Arrangement.spacedBy(11.dp),
        ) {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("关于星会计", color = SettingsInk, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    Text("纯 Kotlin · Jetpack Compose", color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 3.dp))
                }
                TextButton(onClick = onDismiss) { Text("完成") }
            }
            SettingsPanel {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(Modifier.size(48.dp).clip(RoundedCornerShape(15.dp)).background(SettingsBlue.copy(alpha = .1f)), contentAlignment = Alignment.Center) {
                        Icon(Icons.Default.Info, contentDescription = null, tint = SettingsBlue, modifier = Modifier.size(25.dp))
                    }
                    Column(Modifier.padding(start = 12.dp)) {
                        Text("星会计", color = SettingsInk, fontSize = 16.sp, fontWeight = FontWeight.Bold)
                        Text("版本 ${BuildConfig.VERSION_NAME}", color = SettingsMuted, fontSize = 11.sp, modifier = Modifier.padding(top = 3.dp))
                    }
                }
                Text("本地优先、可连接云端的个人财务管理工具。", color = SettingsMuted, fontSize = 11.sp, modifier = Modifier.padding(top = 12.dp))
                Text("原生实现：Kotlin + Jetpack Compose", color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 5.dp))
            }
            SettingsPanel {
                Text("相关网站", color = SettingsInk, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                ExternalSettingsLink("博客", "sevencn.com", "https://sevencn.com")
                HorizontalDivider(color = SettingsLine)
                ExternalSettingsLink("项目网站", "s.wotty.app", "https://s.wotty.app")
                HorizontalDivider(color = SettingsLine)
                ExternalSettingsLink("开源地址", "github.com/sevencnup/wotty-StarAccounting", "https://github.com/sevencnup/wotty-StarAccounting")
            }
            Spacer(Modifier.height(8.dp))
        }
    }
}

@Composable
private fun ExternalSettingsLink(title: String, address: String, url: String) {
    val uriHandler = LocalUriHandler.current
    Row(
        Modifier.fillMaxWidth().clip(RoundedCornerShape(10.dp))
            .clickable { runCatching { uriHandler.openUri(url) } }
            .padding(vertical = 10.dp, horizontal = 2.dp),
        verticalAlignment = Alignment.CenterVertically,
    ) {
        Column(Modifier.weight(1f)) {
            Text(title, color = SettingsBlue, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
            Text(address, color = SettingsMuted, fontSize = 9.sp, modifier = Modifier.padding(top = 2.dp))
        }
        Text("↗", color = SettingsBlue, fontSize = 16.sp, fontWeight = FontWeight.Bold)
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun NativeCsvExportSheet(
    status: String,
    onDismiss: () -> Unit,
    onExport: () -> Unit,
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    ModalBottomSheet(onDismissRequest = onDismiss, sheetState = sheetState) {
        Column(
            Modifier.fillMaxWidth().navigationBarsPadding().imePadding().padding(horizontal = 18.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("导出账单", color = SettingsInk, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    Text("将当前账本的流水保存为 CSV 文件", color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 3.dp))
                }
                TextButton(onClick = onDismiss) { Text("完成") }
            }
            SettingsPanel {
                Text("导出范围", color = SettingsInk, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                Text("包含当前账本的全部收入、支出、转账和还款流水。文件采用 UTF-8 编码，保留分类、备注归类、商户、支付方式、订单号和贷款关联信息。", color = SettingsMuted, fontSize = 11.sp, modifier = Modifier.padding(top = 6.dp))
            }
            SettingsInlineMessage(
                status,
                if (status.startsWith("已导出")) SettingsGreen else if (status.startsWith("导出失败")) SettingsRed else SettingsMuted,
            )
            Button(
                onClick = onExport,
                modifier = Modifier.fillMaxWidth().height(48.dp),
                colors = ButtonDefaults.buttonColors(containerColor = SettingsBlue),
                shape = RoundedCornerShape(14.dp),
            ) {
                Icon(Icons.Default.Download, contentDescription = null, modifier = Modifier.size(18.dp))
                Text("选择保存位置", modifier = Modifier.padding(start = 7.dp), fontWeight = FontWeight.SemiBold)
            }
            Text("取消保存面板不会改动账本；导出的文件由你选择保存位置。", color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(bottom = 18.dp))
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun NativeCsvImportSheet(
    status: String,
    preview: NativeBillImportPreview?,
    importErrors: List<NativeImportError>,
    importing: Boolean,
    onDismiss: () -> Unit,
    onPick: () -> Unit,
    onConfirm: suspend () -> Unit,
) {
    val language = LocalNativeUiPreferences.current.value.language
    val scope = rememberCoroutineScope()
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val importableCount = preview?.rows?.count { it.duplicateReason == null } ?: 0
    val duplicateCount = preview?.rows?.count { it.duplicateReason != null } ?: 0
    val statusColor = when {
        status.startsWith("导入失败") -> SettingsRed
        status.startsWith("已导入") || status.startsWith("已保存") -> SettingsGreen
        else -> SettingsMuted
    }

    ModalBottomSheet(onDismissRequest = onDismiss, sheetState = sheetState) {
        Column(
            Modifier.fillMaxWidth().heightIn(max = 790.dp).navigationBarsPadding().imePadding().padding(horizontal = 18.dp),
            verticalArrangement = Arrangement.spacedBy(11.dp),
        ) {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text("导入账单", color = SettingsInk, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    Text(translateNativeText("支持 CSV、XLS、XLSX 文件", language), color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 3.dp))
                }
                TextButton(onClick = onDismiss) { Text("完成") }
            }
            SettingsPanel {
                Text("导入前会先预览并标出重复流水。重复项会跳过；只有你确认后，账单才会写入当前账本。", color = SettingsMuted, fontSize = 11.sp)
                Button(
                    onClick = onPick,
                    enabled = !importing,
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp).height(44.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = SettingsBlue),
                    shape = RoundedCornerShape(12.dp),
                ) {
                    Icon(Icons.Default.CloudDownload, contentDescription = null, modifier = Modifier.size(17.dp))
                    Text(translateNativeText(if (preview == null) "选择账单文件" else "重新选择文件", language), modifier = Modifier.padding(start = 7.dp), fontWeight = FontWeight.SemiBold)
                }
            }
            if (preview != null) {
                SettingsPanel {
                    Text(preview.fileName, color = SettingsInk, fontSize = 12.sp, fontWeight = FontWeight.SemiBold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                    Text("来源：${preview.source.label}  ·  可导入 $importableCount 笔  ·  重复 $duplicateCount 笔  ·  异常 ${preview.issues.size} 行", color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 5.dp))
                }
                LazyColumn(
                    Modifier.fillMaxWidth().heightIn(max = 300.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    items(preview.rows.take(30), key = { "row-${it.lineNumber}" }) { row ->
                        SettingsPanel {
                            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                                Column(Modifier.weight(1f)) {
                                    Text("第 ${row.lineNumber} 行 · ${row.entry.title.ifBlank { row.entry.category }}", color = SettingsInk, fontSize = 11.sp, maxLines = 1, overflow = TextOverflow.Ellipsis)
                                    Text("${row.entry.category.substringBefore(" ·")} · ${row.entry.date.take(10)}", color = SettingsMuted, fontSize = 9.sp, modifier = Modifier.padding(top = 2.dp))
                                }
                                Column(horizontalAlignment = Alignment.End) {
                                    Text("¥${"%.2f".format(Locale.ROOT, row.entry.amount)}", color = SettingsInk, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                                    if (row.duplicateReason != null) Text("跳过：${row.duplicateReason}", color = SettingsAmber, fontSize = 8.sp)
                                }
                            }
                        }
                    }
                    if (preview.rows.size > 30) item { Text("仅预览前 30 笔，确认后会处理全部账单。", color = SettingsMuted, fontSize = 9.sp, modifier = Modifier.padding(4.dp)) }
                    items(preview.issues.take(8), key = { "issue-${it.lineNumber}-${it.message}" }) { issue ->
                        SettingsPanel {
                            Text("第 ${issue.lineNumber} 行 · ${issue.message}", color = SettingsRed, fontSize = 10.sp)
                        }
                    }
                }
            }
            if (importErrors.any { !it.resolved }) {
                SettingsPanel {
                    Text("最近导入问题", color = SettingsInk, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
                    importErrors.filterNot { it.resolved }.take(4).forEach { error ->
                        Text(
                            "${error.fileName}${if (error.lineNumber > 0) " · 第 ${error.lineNumber} 行" else ""}：${error.errorMessage}",
                            color = SettingsRed,
                            fontSize = 9.sp,
                            modifier = Modifier.padding(top = 5.dp),
                        )
                    }
                }
            }
            SettingsInlineMessage(status, statusColor)
            if (preview != null) {
                Button(
                    onClick = { scope.launch { onConfirm() } },
                    enabled = !importing,
                    modifier = Modifier.fillMaxWidth().height(48.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = SettingsGreen),
                    shape = RoundedCornerShape(14.dp),
                ) {
                    Text(
                        when {
                            importing -> "正在导入…"
                            importableCount > 0 -> "确认导入 $importableCount 笔"
                            preview.issues.isNotEmpty() -> "保存错误记录"
                            else -> "确认并跳过重复项"
                        },
                        fontWeight = FontWeight.SemiBold,
                    )
                }
            }
            Text(translateNativeText("支持 CSV、XLS、XLSX；工作簿按第一个工作表读取。确认前不会写入账本。", language), color = SettingsMuted, fontSize = 9.sp, modifier = Modifier.padding(bottom = 14.dp))
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun NativeLanguageSheet(
    selected: NativeLanguageChoice,
    onSelect: (NativeLanguageChoice) -> Unit,
    onDismiss: () -> Unit,
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val choices = listOf(
        Triple(NativeLanguageChoice.SYSTEM, "跟随系统", "使用设备的语言偏好"),
        Triple(NativeLanguageChoice.ZH_CN, "简体中文", "固定使用简体中文"),
        Triple(NativeLanguageChoice.EN_US, "英文", "固定使用英文"),
    )
    ModalBottomSheet(onDismissRequest = onDismiss, sheetState = sheetState) {
        Column(
            Modifier.fillMaxWidth().navigationBarsPadding().padding(horizontal = 18.dp, vertical = 4.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text("语言", color = SettingsInk, fontSize = 18.sp, fontWeight = FontWeight.Bold)
            Text("跟随系统会按设备当前首选语言显示。", color = SettingsMuted, fontSize = 11.sp)
            SettingsPanel {
                choices.forEachIndexed { index, (choice, title, detail) ->
                    Row(
                        Modifier.fillMaxWidth().clip(RoundedCornerShape(10.dp)).clickable { onSelect(choice) }.padding(vertical = 10.dp, horizontal = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Column(Modifier.weight(1f)) {
                            Text(title, color = SettingsInk, fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                            Text(detail, color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 3.dp))
                        }
                        Text(if (selected == choice) "✓" else "", color = SettingsBlue, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    }
                    if (index < choices.lastIndex) HorizontalDivider(color = SettingsLine)
                }
            }
            TextButton(onClick = onDismiss, modifier = Modifier.align(Alignment.End)) { Text("完成") }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun NativeFontSheet(
    selected: NativeFontChoice,
    onSelect: (NativeFontChoice) -> Unit,
    onDismiss: () -> Unit,
) {
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    val choices = listOf(
        Triple(NativeFontChoice.SMALL, "较小", 13.sp),
        Triple(NativeFontChoice.STANDARD, "标准", 16.sp),
        Triple(NativeFontChoice.LARGE, "较大", 19.sp),
    )
    ModalBottomSheet(onDismissRequest = onDismiss, sheetState = sheetState) {
        Column(
            Modifier.fillMaxWidth().navigationBarsPadding().padding(horizontal = 18.dp, vertical = 4.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
        ) {
            Text("字体大小", color = SettingsInk, fontSize = 18.sp, fontWeight = FontWeight.Bold)
            Text("设置会应用到全部页面，并与系统无障碍字号叠加。", color = SettingsMuted, fontSize = 11.sp)
            SettingsPanel {
                choices.forEachIndexed { index, (choice, title, sampleSize) ->
                    Row(
                        Modifier.fillMaxWidth().clip(RoundedCornerShape(10.dp)).clickable { onSelect(choice) }.padding(vertical = 10.dp, horizontal = 4.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Text("Aa", color = SettingsBlue, fontSize = sampleSize, fontWeight = FontWeight.Bold, modifier = Modifier.width(48.dp))
                        Text(title, color = SettingsInk, fontSize = 13.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.weight(1f))
                        Text(if (selected == choice) "✓" else "", color = SettingsBlue, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    }
                    if (index < choices.lastIndex) HorizontalDivider(color = SettingsLine)
                }
            }
            TextButton(onClick = onDismiss, modifier = Modifier.align(Alignment.End)) { Text("完成") }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun NativeSubscriptionManagerSheet(
    items: List<NativeSubscription>,
    onDismiss: () -> Unit,
    onSave: suspend (NativeSubscription) -> Unit,
    onDelete: suspend (NativeSubscription) -> Unit,
) {
    var editorOpen by remember { mutableStateOf(false) }
    var editing by remember { mutableStateOf<NativeSubscription?>(null) }
    var deleteCandidate by remember { mutableStateOf<NativeSubscription?>(null) }
    var saving by remember { mutableStateOf(false) }
    var actionError by remember { mutableStateOf("") }
    var message by remember { mutableStateOf("") }
    val scope = rememberCoroutineScope()
    val sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)
    ModalBottomSheet(onDismissRequest = onDismiss, sheetState = sheetState) {
        Column(
            Modifier.fillMaxWidth().heightIn(max = 760.dp).navigationBarsPadding().imePadding().padding(horizontal = 18.dp),
        ) {
            Row(Modifier.fillMaxWidth().padding(bottom = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(if (editorOpen) if (editing == null) "新增周期支出" else "编辑周期支出" else "订阅/扣费管理", color = SettingsInk, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    Text("按月自动记账，不会实际执行扣款", color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 3.dp))
                }
                TextButton(onClick = if (editorOpen) { { editorOpen = false; editing = null; actionError = "" } } else onDismiss) {
                    Text(if (editorOpen) "返回" else "完成")
                }
            }
            if (editorOpen) {
                NativeSubscriptionEditor(
                    subscription = editing,
                    saving = saving,
                    error = actionError,
                    message = message,
                    onSave = { updated ->
                        scope.launch {
                            saving = true
                            actionError = ""
                            message = ""
                            runCatching { onSave(updated) }
                                .onSuccess {
                                    editorOpen = false
                                    editing = null
                                    message = if (updated.isActive) "周期支出已保存" else "周期支出已停用"
                                }
                                .onFailure { actionError = it.message ?: "周期支出保存失败，请稍后重试" }
                            saving = false
                        }
                    },
                )
            } else {
                Text("应用启动或从后台恢复时会补记已到期的月份；31 日在短月份按月末入账。", color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(bottom = 10.dp))
                LazyColumn(
                    Modifier.weight(1f, fill = false).fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    contentPadding = PaddingValues(bottom = 8.dp),
                ) {
                    if (items.isEmpty()) {
                        item {
                            SettingsEmptyCard("还没有周期支出", "添加保险费、房租、还款等固定项目，系统会按月自动记账。")
                        }
                    }
                    items(items, key = { it.id }) { item ->
                        SubscriptionItemCard(
                            item = item,
                            onEdit = { editing = item; editorOpen = true; actionError = ""; message = "" },
                            onToggle = {
                                scope.launch {
                                    saving = true
                                    actionError = ""
                                    runCatching { onSave(item.copy(isActive = !item.isActive)) }
                                        .onSuccess { message = if (item.isActive) "已停用，历史流水保留" else "已启用并检查到期月份" }
                                        .onFailure { actionError = it.message ?: "状态更新失败" }
                                    saving = false
                                }
                            },
                            onDelete = { deleteCandidate = item },
                            enabled = !saving,
                        )
                    }
                    if (actionError.isNotBlank()) item { SettingsInlineMessage(actionError, SettingsRed) }
                    if (message.isNotBlank()) item { SettingsInlineMessage(message, SettingsGreen) }
                }
                Button(
                    onClick = { editing = null; editorOpen = true; actionError = ""; message = "" },
                    modifier = Modifier.fillMaxWidth().padding(top = 8.dp, bottom = 16.dp).height(47.dp),
                    shape = RoundedCornerShape(14.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = SettingsBlue),
                    enabled = !saving,
                ) { Text("新增周期支出", fontWeight = FontWeight.Bold) }
            }
        }
    }
    deleteCandidate?.let { item ->
        AlertDialog(
            onDismissRequest = { if (!saving) deleteCandidate = null },
            title = { Text("删除周期支出？") },
            text = {
                Column {
                    Text("确定删除“${item.name}”吗？已生成的历史流水会保留。")
                    if (actionError.isNotBlank()) Text(actionError, color = SettingsRed, modifier = Modifier.padding(top = 8.dp))
                }
            },
            confirmButton = {
                TextButton(enabled = !saving, onClick = {
                    scope.launch {
                        saving = true
                        actionError = ""
                        runCatching { onDelete(item) }
                            .onSuccess { deleteCandidate = null; message = "周期支出已删除，历史流水保留" }
                            .onFailure { actionError = it.message ?: "删除失败，请稍后重试" }
                        saving = false
                    }
                }) { Text("删除", color = SettingsRed) }
            },
            dismissButton = { TextButton(enabled = !saving, onClick = { deleteCandidate = null }) { Text("取消") } },
        )
    }
}

@Composable
private fun NativeSubscriptionEditor(
    subscription: NativeSubscription?,
    saving: Boolean,
    error: String,
    message: String,
    onSave: (NativeSubscription) -> Unit,
) {
    val today = remember { LocalDate.now().toString() }
    var name by remember(subscription?.id) { mutableStateOf(subscription?.name.orEmpty()) }
    var amount by remember(subscription?.id) { mutableStateOf(subscription?.amount?.toString().orEmpty()) }
    var day by remember(subscription?.id) { mutableStateOf((subscription?.billingDay ?: 1).toString()) }
    var category by remember(subscription?.id) { mutableStateOf(subscription?.category ?: "其他") }
    var platform by remember(subscription?.id) { mutableStateOf(subscription?.platform ?: "其他") }
    var paymentMethod by remember(subscription?.id) { mutableStateOf(subscription?.paymentMethod.orEmpty()) }
    var startDate by remember(subscription?.id) { mutableStateOf(subscription?.startDate?.take(10) ?: today) }
    var validation by remember { mutableStateOf("") }
    val parsedAmount = amount.toDoubleOrNull()
    val parsedDay = day.toIntOrNull()
    Column(
        Modifier.fillMaxWidth().heightIn(max = 650.dp).verticalScroll(rememberScrollState()).padding(bottom = 18.dp),
        verticalArrangement = Arrangement.spacedBy(9.dp),
    ) {
        OutlinedTextField(name, { name = it; validation = "" }, Modifier.fillMaxWidth(), label = { Text("项目名称") }, placeholder = { Text("例如：保险费、房租、会员费") }, singleLine = true)
        Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(9.dp)) {
            OutlinedTextField(amount, { amount = it.filter { char -> char.isDigit() || char == '.' }; validation = "" }, Modifier.weight(1f), label = { Text("每月金额（元）") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal), singleLine = true)
            OutlinedTextField(day, { day = it.filter(Char::isDigit).take(2); validation = "" }, Modifier.width(120.dp), label = { Text("每月记账日") }, keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number), singleLine = true)
        }
        Text("消费分类", color = SettingsMuted, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
        ChoiceChips(listOf("房租水电", "保险", "交通出行", "餐饮", "生活消费", "其他"), category) { category = it }
        OutlinedTextField(category, { category = it; validation = "" }, Modifier.fillMaxWidth(), label = { Text("分类（可自定义）") }, singleLine = true)
        Text("支付平台", color = SettingsMuted, fontSize = 11.sp, fontWeight = FontWeight.SemiBold)
        ChoiceChips(listOf("支付宝", "微信", "银行卡", "现金", "其他"), platform) { platform = it }
        OutlinedTextField(paymentMethod, { paymentMethod = it }, Modifier.fillMaxWidth(), label = { Text("支付方式（可选）") }, placeholder = { Text("例如：招商银行储蓄卡") }, singleLine = true)
        OutlinedTextField(startDate, { startDate = it.take(10); validation = "" }, Modifier.fillMaxWidth(), label = { Text("开始记账日期") }, placeholder = { Text("YYYY-MM-DD") }, singleLine = true)
        Text("日期格式：YYYY-MM-DD。已生成的历史流水不会随规则修改而改变。", color = SettingsMuted, fontSize = 10.sp)
        val currentError = validation.ifBlank { error }
        if (currentError.isNotBlank()) SettingsInlineMessage(currentError, SettingsRed)
        if (message.isNotBlank()) SettingsInlineMessage(message, SettingsGreen)
        Button(
            onClick = {
                val validDate = runCatching { LocalDate.parse(startDate) }.getOrNull()
                when {
                    name.isBlank() -> validation = "请输入项目名称"
                    parsedAmount == null || !parsedAmount.isFinite() || parsedAmount <= 0.0 -> validation = "请输入大于 0 的每月金额"
                    parsedDay == null || parsedDay !in 1..31 -> validation = "记账日请输入 1 到 31"
                    validDate == null -> validation = "请输入有效的开始日期"
                    else -> {
                        val now = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss"))
                        onSave(
                            NativeSubscription(
                                id = subscription?.id ?: "native-subscription-${UUID.randomUUID()}",
                                userId = subscription?.userId.orEmpty(),
                                accountId = subscription?.accountId.orEmpty(),
                                name = name.trim(),
                                amount = kotlin.math.round(parsedAmount * 100.0) / 100.0,
                                billingDay = parsedDay,
                                category = category.trim().ifBlank { "其他" },
                                platform = platform,
                                paymentMethod = paymentMethod.trim().takeIf(String::isNotBlank),
                                startDate = validDate.toString(),
                                isActive = subscription?.isActive ?: true,
                                createdAt = subscription?.createdAt?.ifBlank { now } ?: now,
                                updatedAt = now,
                            ),
                        )
                    }
                }
            },
            enabled = !saving,
            modifier = Modifier.fillMaxWidth().height(47.dp),
            shape = RoundedCornerShape(14.dp),
            colors = ButtonDefaults.buttonColors(containerColor = SettingsBlue),
        ) { Text(if (saving) "保存中…" else "保存周期支出", fontWeight = FontWeight.Bold) }
    }
}

@Composable
private fun ChoiceChips(options: List<String>, selected: String, onSelect: (String) -> Unit) {
    Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()), horizontalArrangement = Arrangement.spacedBy(7.dp)) {
        options.forEach { item ->
            Text(
                item,
                color = if (selected == item) SettingsBlue else SettingsMuted,
                fontSize = 10.sp,
                fontWeight = if (selected == item) FontWeight.Bold else FontWeight.Medium,
                modifier = Modifier.clip(CircleShape)
                    .background(if (selected == item) SettingsBlue.copy(alpha = .1f) else Color(0xFFF3F5F8))
                    .clickable { onSelect(item) }
                    .padding(horizontal = 11.dp, vertical = 8.dp),
            )
        }
    }
}

@Composable
private fun SubscriptionItemCard(
    item: NativeSubscription,
    onEdit: () -> Unit,
    onToggle: () -> Unit,
    onDelete: () -> Unit,
    enabled: Boolean,
) {
    Card(shape = RoundedCornerShape(15.dp), colors = CardDefaults.cardColors(containerColor = if (item.isActive) Color.White else Color(0xFFF7F8FA)), border = androidx.compose.foundation.BorderStroke(1.dp, SettingsLine)) {
        Column(Modifier.fillMaxWidth().padding(12.dp)) {
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(item.name, color = SettingsInk, fontSize = 13.sp, fontWeight = FontWeight.Bold, maxLines = 1, overflow = TextOverflow.Ellipsis)
                        Spacer(Modifier.width(7.dp))
                        SettingsBadge(if (item.isActive) "自动记账中" else "已停用", if (item.isActive) SettingsGreen else SettingsMuted)
                    }
                    Text("每月 ${item.billingDay} 日 · ${item.category} · ${item.platform}", color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 4.dp), maxLines = 1, overflow = TextOverflow.Ellipsis)
                }
                Text("¥ ${settingsMoney(item.amount)}", color = SettingsBlue, fontSize = 13.sp, fontWeight = FontWeight.Bold)
            }
            Row(Modifier.fillMaxWidth().padding(top = 7.dp), horizontalArrangement = Arrangement.End, verticalAlignment = Alignment.CenterVertically) {
                TextButton(enabled = enabled, onClick = onEdit) { Icon(Icons.Default.Edit, null, Modifier.size(14.dp)); Spacer(Modifier.width(3.dp)); Text("编辑") }
                TextButton(enabled = enabled, onClick = onToggle) { Text(if (item.isActive) "停用" else "启用", color = if (item.isActive) SettingsAmber else SettingsGreen) }
                IconButton(enabled = enabled, onClick = onDelete, modifier = Modifier.size(36.dp)) { Icon(Icons.Default.Delete, "删除周期支出", tint = SettingsRed, modifier = Modifier.size(17.dp)) }
            }
        }
    }
}

@Composable
private fun SettingsPageHeader() {
    Row(Modifier.fillMaxWidth().padding(vertical = 3.dp), verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) {
            Text("设置", color = SettingsInk, fontSize = 23.sp, fontWeight = FontWeight.Black)
            Text("账本数据、周期扣费与应用信息", color = SettingsMuted, fontSize = 12.sp, modifier = Modifier.padding(top = 3.dp))
        }
        Icon(Icons.Default.Settings, contentDescription = null, tint = SettingsBlue, modifier = Modifier.size(26.dp))
    }
}

@Composable
private fun SettingsSectionTitle(title: String, description: String) {
    Column(Modifier.padding(top = 3.dp, bottom = 2.dp)) {
        Text(title, color = SettingsInk, fontSize = 13.sp, fontWeight = FontWeight.Bold)
        Text(description, color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 2.dp))
    }
}

@Composable
private fun SettingsPanel(content: @Composable androidx.compose.foundation.layout.ColumnScope.() -> Unit) {
    Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(18.dp)).background(Color.White).border(1.dp, SettingsLine, RoundedCornerShape(18.dp)).padding(15.dp), content = content)
}

@Composable
private fun SettingsMenuRow(title: String, detail: String, color: Color, icon: androidx.compose.ui.graphics.vector.ImageVector, onClick: () -> Unit) {
    SettingsPanel {
        Row(Modifier.fillMaxWidth().clickable(onClick = onClick), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.size(36.dp).clip(RoundedCornerShape(11.dp)).background(color.copy(alpha = .1f)), contentAlignment = Alignment.Center) {
                Icon(icon, contentDescription = null, tint = color, modifier = Modifier.size(19.dp))
            }
            Column(Modifier.weight(1f).padding(start = 10.dp)) {
                Text(title, color = SettingsInk, fontSize = 12.sp, fontWeight = FontWeight.Bold)
                Text(detail, color = SettingsMuted, fontSize = 10.sp, modifier = Modifier.padding(top = 3.dp), maxLines = 1, overflow = TextOverflow.Ellipsis)
            }
            Text("›", color = SettingsMuted, fontSize = 21.sp)
        }
    }
}

@Composable
private fun SettingsEmptyCard(title: String, body: String) {
    Column(Modifier.fillMaxWidth().clip(RoundedCornerShape(14.dp)).background(Color(0xFFF7F9FC)).padding(18.dp), verticalArrangement = Arrangement.spacedBy(5.dp)) {
        Text(title, color = SettingsInk, fontSize = 12.sp, fontWeight = FontWeight.Bold)
        Text(body, color = SettingsMuted, fontSize = 10.sp)
    }
}

@Composable
private fun SettingsBadge(text: String, color: Color) {
    Text(text, color = color, fontSize = 8.sp, fontWeight = FontWeight.SemiBold, modifier = Modifier.clip(CircleShape).background(color.copy(alpha = .1f)).padding(horizontal = 7.dp, vertical = 4.dp))
}

@Composable
private fun SettingsInlineMessage(text: String, color: Color) {
    Text(text, color = color, fontSize = 10.sp, modifier = Modifier.fillMaxWidth().clip(RoundedCornerShape(10.dp)).background(color.copy(alpha = .08f)).padding(10.dp))
}

private fun settingsMoney(value: Double): String = java.math.BigDecimal.valueOf(value.takeIf(Double::isFinite) ?: 0.0)
    .setScale(2, java.math.RoundingMode.HALF_UP)
    .toPlainString()
