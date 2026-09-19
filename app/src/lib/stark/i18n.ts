import { useEffect, useState } from "react";
import type { LanguageChoice } from "@/lib/stark/storage/ui-settings";

export type AppLocale = "zh-CN" | "en-US";

const translations: Record<string, string> = {
  "上月结余": "Previous balance", "可选": "Optional", "添加上月结余": "Add previous balance", "移除上月结余": "Remove previous balance", "删除月份行": "Delete month row", "至少保留一个月份行": "Keep at least one month row", "上月结余是专用列，请使用专用按钮": "Previous balance is a dedicated column. Use its button.",
  "wotty stark 网页版 app 端": "wotty stark web app",
  首页: "Home", 消费: "Spending", 储蓄: "Savings", 贷款: "Loans", 资产: "Assets", 账户: "Account",
  消费分析: "Spending analysis", 帮助与反馈: "Help and feedback", 关于: "About", 主题: "Theme", 语言: "Language", 字体大小: "Font size", 切换模式: "Data mode",
  搜索: "Search", 查看: "View", 查看明细分析: "View details", 检查数据源设置: "Check data source settings", 重新加载: "Reload",
  本地模式: "Local mode", 云端模式: "Cloud mode", 数据保存在当前设备: "Data is stored on this device", 连接MySQL后端服务: "Connect to the MySQL backend",
  导入账单: "Import bills", 导出账单: "Export bills", 导出全部账单: "Export all bills", CSV文件: "CSV file", "CSV 文件": "CSV file", "正在导出...": "Exporting…", 微信账单: "WeChat bills", 支付宝账单: "Alipay bills",
  账单归类: "Bill classification", 转账可归入支出分类: "Transfers can be assigned to expense categories", 关键词归类: "Keyword classification", 一次匹配同名流水: "Match transactions with the same name at once", 自动规则: "Automatic rule", 账单关键词: "Bill keyword", 归入消费分类: "Assign to expense category", 已保存规则: "Saved rules", 已启用: "Enabled", 已停用: "Disabled", 未归类: "Unclassified", 全部流水: "All transactions",
  默认蓝: "Default blue", 清新绿: "Fresh green", 暖阳橙: "Warm amber", 清爽稳定的默认配色: "The clean and steady default palette", 更柔和的自然配色: "A softer nature-inspired palette", 温暖醒目的强调配色: "A warm, vivid accent palette",
  跟随系统: "System default", 简体中文: "Simplified Chinese", 英文: "English", 固定使用简体中文: "Always use Simplified Chinese", 固定使用英文: "Always use English", 使用设备的语言偏好: "Use the device language preference",
  较小: "Small", 标准: "Standard", 较大: "Large", 星会计: "Stark Accounting", 版本: "Version", 前往GitHub提交反馈: "Send feedback on GitHub", 国际站点端反馈: "International site feedback", 国内站点端反馈: "Mainland China site feedback", 博客: "Blog", 项目网站: "Project website", 开源地址: "Open-source repository",
  统计范围: "Reporting range", 选择月份: "Select month", 关闭月份选择: "Close month picker", 选择年份: "Select year", 上一年: "Previous year", 下一年: "Next year", 月份: "Month", 取消: "Cancel", 保存: "Save", 确定: "Confirm", 删除: "Delete",
  结余: "Balance", 支出: "Expense", 收入: "Income", 本月结余: "This month’s balance", 薪资周期结余: "Salary-cycle balance", 本月支出: "This month’s spending", 本月收入: "This month’s income", 自然月: "Calendar month", 发薪周期: "Salary cycle", 添加薪资收入: "Add salary income", 发薪日: "Payday", 薪资周期设置: "Salary cycle settings", 编辑目标: "Edit goal", 编辑储蓄目标: "Edit savings goal", 目标金额: "Target amount", 截止日期: "Deadline", 保存修改: "Save changes",
  财务诊断: "Financial checkup", 预算需关注: "Budget needs attention", 净资产: "Net worth", 预算余量: "Budget remaining", 待还贷款: "Loans due", 储蓄达成: "Savings progress", 本月资金分配: "Monthly allocation", 全年资金分配: "Annual allocation", 可支配预算: "Available budget", 结构健康: "Healthy structure", 结构稳健: "Healthy structure", 负债关注: "Liabilities need attention", 已超支: "Over budget", 无待还: "Nothing due", 近期还款: "Payment due soon", 状态良好: "All good", 计划进行中: "Plan in progress", 全年支出: "Annual spending", 本月支出结构: "This month’s spending structure", 全年支出结构: "Annual spending structure", 分类明细: "Category details", 财务行动建议: "Financial action plan", 节律健康: "Healthy pace", 需控制支出: "Spending needs control", 收支动态走势: "Cash-flow trend", 近5个月对比: "Last 5 months", "近 5 个月对比": "Last 5 months", 预算管理: "Manage budget", "收入扣除实际消费、还款和储蓄后的安排金额": "Income after actual spending, repayments, and savings", 资产存量: "Asset balance", "余额单独展示，不重复计入本月扣减": "Shown separately; not deducted again", 剩余: "Remaining", "查看 ›": "View ›",
  消费分类: "Expense category", 支付账户: "Payment account", 明细备注: "Transaction details", 清空重填: "Clear and start over", 保存记账: "Save entry", 记账: "Add entry", 添加储蓄: "Add savings", 新增资产: "Add asset", 新增贷款: "Add loan", 资产名称: "Asset name", 资产类型: "Asset type", 当前余额元: "Current balance (CNY)", 保存资产: "Save asset", 贷款名称: "Loan name", 贷款总额元: "Total loan (CNY)", 剩余本金元: "Remaining principal (CNY)", 每月月供元: "Monthly payment (CNY)", 总期数: "Total installments", 每月还款日: "Monthly due day", 保存贷款: "Save loan",
  餐饮: "Food", 购物: "Shopping", 交通: "Transport", 住房: "Housing", 娱乐: "Entertainment", 医疗: "Healthcare", 日用: "Daily essentials", 服装: "Clothing", 美容: "Beauty", 宠物: "Pets", 通讯: "Communications", 运动: "Sports", 旅行: "Travel", 教育: "Education", 工资: "Salary", 奖金: "Bonus", 理财: "Investments", 转账: "Transfer", 现金: "Cash", 银行卡: "Bank card", 支付宝: "Alipay", 微信: "WeChat", 投资: "Investment", 其他: "Other", 房租水电: "Rent and utilities", 日用百货: "Daily essentials", 餐饮美食: "Food", 水电费: "Utilities", 房租: "Rent", 生活消费: "Living expenses", 交通出行: "Transport", 休闲娱乐: "Leisure", 购物消费: "Shopping", 工资收入: "Salary income", 文化休闲: "Culture and leisure", 服饰装扮: "Clothing and accessories", 商业服务: "Business services", 充值缴费: "Top-ups and bills", 美食: "Food", 百货: "General goods", 红包: "Red packet", 培训: "Training", 转账红包: "Transfer red packet", 医疗健康: "Healthcare", 教育培训: "Education and training", 退款: "Refund",
  投资理财: "Investments", 保险: "Insurance", 充电: "Charging", 出行: "Transport", 打印: "Printing", 电费: "Electricity", 电子产品: "Electronics", 工具: "Tools", 户外: "Outdoors", 个人护理: "Personal care", 家具: "Furniture", 家电: "Appliances", 家政: "Housekeeping", 酒类: "Alcohol", 加油: "Fuel", 理发: "Haircut", 礼物: "Gifts", 旅游: "Travel", 门诊: "Clinic", 汽车保养: "Car maintenance", 清洁: "Cleaning", 清洁优化: "Cleaning", 燃气: "Gas", 日常清洁: "Daily cleaning", 肉类: "Meat", 生活用品: "Household supplies", 水产: "Seafood", 水费: "Water", 水果: "Fruit", 糖果: "Candy", 甜品: "Desserts", 停车费: "Parking", 体育: "Sports", 图书: "Books", 玩具: "Toys", 闲食: "Snacks", 下午茶: "Afternoon tea", 鞋类: "Shoes", 烟草: "Tobacco", 药品: "Medicine", 影音: "Audio and video", 饮品: "Drinks", 花圃: "Garden", 装修: "Renovation", 网费: "Internet", 维修: "Repairs", 物业费: "Property fee",
  设置: "Settings", 账户对账: "Account reconciliation", 核对实际余额与账面余额: "Compare actual and recorded balances", 检查更新: "Check for updates", "检查 App 版本": "Check app version", 每月平台支出: "Monthly spending by account", 每月的支出热度: "Monthly spending intensity",
  全年: "Full year", 全年结余: "Annual balance", 全年收入: "Annual income", 月收入: "Monthly income", 月消费: "Monthly spending", 还款: "Repayment", 收支: "Cash flow", 发薪周期资金明细: "Salary-cycle cash-flow details", 全年按月对比: "Monthly comparison for the year", 可继续安排: "Available to allocate", 已超出收入: "Exceeds income", 本月暂无支出记录: "No spending recorded this month", 普通记账: "Standard entry", 单月录入: "Single-month entry", 批量补录: "Batch backfill", 历史工资补录: "Historical salary backfill", 补录年份: "Backfill year", 全选: "Select all", 清空: "Clear", "每月工资（元）": "Monthly salary (CNY)", 入账账户: "Receiving account", "发薪单位（选填）": "Payer (optional)", "商户名称 (选填)": "Merchant name (optional)", "商户名称（选填）": "Merchant name (optional)", "添加消费备注...": "Add spending note...", "每月月供 (元)": "Monthly payment (CNY)", 日: "day",
  现金流概览: "Cash-flow overview", 整体进度: "Overall progress", 日均支出: "Daily average spending", 剩余总预算: "Remaining total budget", 建议将富余资金分配至: "Consider directing the surplus to", "，建议将富余资金分配至": ", consider directing the surplus to", 目标: "Goal", 已存: "Saved", 还差: "Remaining", 待执行额度: "planned amount", 离总目标还需补齐: "still needed to reach the total goal", 待处理: "pending", 已清: "Cleared", 按更新时间: "By update time", 还没有储蓄目标: "No savings goals yet", 储蓄计划: "Savings plan", "储蓄计划 ›": "Savings plan ›", 储蓄总览: "Savings overview", 本月计划: "This month’s plan", 目标缺口: "Goal gap", 当前冲刺目标: "Current focus goal", 目标组: "Goal groups", 月度节奏: "Monthly rhythm", 最近计划: "Recent plans", 总进度: "Overall progress", 完成率: "Completion rate", 活跃目标与存入进度: "Active goals and deposit progress", 计划强度与完成比例: "Plan intensity and completion", "每月计划、完成状态与实际存入": "Monthly plans, completion, and actual deposits", 最近更新的存入安排: "Recently updated deposit plans", 单月存: "Every month", 隔月存: "Every other month", 固定支出: "Fixed expense", 临时支出: "Temporary expense", 新增固定支出: "Add fixed expense", 新增临时支出: "Add temporary expense", 薪资: "Salary", 预计存: "Planned savings", 存储类型: "Deposit type", 死期: "Fixed-term deposit", 他人帮存: "Saved by others", 已完成: "Completed", 已跳过: "Skipped", 待存入: "Pending deposit", 记录储蓄: "Record savings", 记录已存: "Record deposit", 修改记录: "Edit record", 实际存入: "Actual deposit", 计划存入: "Planned deposit", 图片凭证: "Proof image", 图片凭证预览: "Proof image preview", 添加图片: "Add image", 清除图片: "Remove image", 保存记录: "Save record", "保存中…": "Saving…", 已记录: "Recorded", 未设置期限: "No deadline", 截止: "Deadline", 请选择图片文件: "Please choose an image", "图片不能超过 12MB": "Image must be 12 MB or smaller", 图片读取失败: "Could not read the image", 图片处理失败: "Could not process the image", "实际存入金额必须大于 0": "Actual deposit must be greater than 0",
  还款控制中心: "Repayment control center", 待还本金总额: "Total principal due", 已还: "Paid", 本月月供: "Monthly payments", 月供: "Monthly payment", 还款压力: "Repayment pressure", 下期到期: "Next due", 未来6个月月供趋势: "Monthly payments over the next 6 months", 按现有贷款期数推演: "Projected from current loan terms", 负债构成分析: "Liability breakdown", 各平台贷款占比: "Loan share by platform", 还款日程: "Repayment schedule", 按到期时间排序: "Sorted by due date", 贷款组合: "Loan portfolio", 全部贷款明细与还款进度: "All loans and repayment progress", 待还本金: "Principal due", 下期还款: "Next payment", 已结清: "Paid off", 已逾期: "Overdue", 临近还款: "Due soon", 还款中: "Repaying", 今天到期: "Due today", 压力可控: "Manageable", 需要关注: "Needs attention", 压力偏高: "High pressure", 暂无收入数据: "No income data", 暂无收入: "No income", 已全部结清: "All paid off", 还款日程为空: "No repayment schedule",
 资产负债全景: "Asset and liability overview", 净资产估值: "Estimated net worth", 资产总额: "Total assets", 负债总额: "Total liabilities", 资产占比: "Asset share", 负债占比: "Liability share", 流动资产: "Liquid assets", 负债率: "Debt ratio", 最大单项: "Largest holding", 安全区间: "Safe range", 负债偏高: "High debt", 分散适中: "Moderately diversified", 高度集中: "Highly concentrated", 资产配置构成: "Asset allocation", 资金分布与占比分析: "Fund distribution and share", 资产与负债明细: "Asset and liability details", 各资金账户与借贷清单: "Accounts and borrowing details", 正向资产: "Assets", 应还负债: "Liabilities", 贷款待还: "Loan principal due", 暂无配置: "No configuration", 暂无资产配置数据: "No asset allocation data", 暂无资产账户: "No asset accounts", 资产能够充足覆盖当前全部负债: "Assets comfortably cover all current liabilities", "负债高于资产，建议优先降低高息债务": "Liabilities exceed assets; prioritize reducing high-interest debt", 资产负债对比: "Asset vs. liability comparison",
  收支趋势: "Income and expense trend", 按当前筛选范围: "Within the current filters", 支出分类构成: "Expense breakdown", 金额占比: "Share of amount", 消费节律: "Spending rhythm", 每天的支出热度: "Daily spending intensity", 每日平台支出: "Daily spending by account", 按账户拆分: "By account", 消费流向图: "Spending flow", 账户到分类: "Account to category", 商家消费排行: "Top merchant spending", "消费金额前 10 名": "Top 10 by expense amount", 商家消费: "Merchant spending", 其他商家: "Other merchants", 当前筛选下暂无商家支出: "No merchant spending in the current filters", 流水明细: "Transaction details", 最高分类: "Top category", 收支类型: "Transaction type", 当前结余: "Current balance", 搜索商户或备注: "Search merchant or note", 在当前筛选结果中搜索: "Search within filtered results", 全部分类: "All categories", 全部账户: "All accounts", 全部: "All",
  未能读取数据库数据: "Could not read database data", 未能读取本地数据: "Could not read local data", 请检查后端服务和数据库连接后重试: "Check the backend service and database connection, then try again.", 请重试或检查浏览器的本地存储权限: "Try again or check the browser’s local-storage permission.", 云端服务地址: "Cloud service URL", 本地优先可连接云端的个人财务管理工具: "A local-first personal finance tool with optional cloud connectivity", 加载中: "Loading…", 保存中: "Saving", 导入中: "Importing…", 正在读取账单: "Reading bills…", 正在导出: "Exporting…", "导出当前账本的全部流水，不会修改本地或云端数据。CSV 文件包含日期、类型、分类、备注归类、商户、平台、金额、支付方式、状态和订单号等字段。": "Exports all transactions in the current account without changing local or cloud data. The CSV includes date, type, category, remark category, merchant, platform, amount, payment method, status, and order ID.", "账单会导出为 CSV 文件，可用 Excel 或 WPS 打开": "Bills will be exported as a CSV file that opens in Excel or WPS", "文件使用 UTF-8 编码并兼容 Excel / WPS；导出范围仅限当前账本。": "The file uses UTF-8 and works with Excel / WPS; only the current account is exported.", "正在整理当前账本的账单...": "Preparing the current account’s bills…", "目前暂时只开发安卓客户端，Web 端适用于 PC、iOS、鸿蒙等设备。": "For now, only the Android client is being developed; the Web version works on PCs, iOS, HarmonyOS, and other devices.", 测试连接: "Test connection", 测试中: "Testing…", 应用中: "Applying…", 清除归类: "Clear classification", "微信 / 支付宝": "WeChat / Alipay",
  "请先测试云端服务是否可连接": "Test the cloud service connection first", "支持微信、支付宝官方导出的 CSV / Excel 账单": "Supports CSV / Excel bills exported by WeChat or Alipay", "正在测试连接...": "Testing connection…", "后端服务可访问，但数据库尚未连接": "The backend is reachable, but the database is not connected", "连接成功，可以切换到云端模式": "Connected. You can switch to cloud mode", "连接失败，请检查地址、后端服务和网络权限": "Connection failed. Check the URL, backend service, and network permissions", "请先测试当前云端地址，连接成功后才能确定": "Test the current cloud URL successfully before confirming", "请输入邮箱和密码": "Enter an email and password", "登录失败，请检查云端服务": "Login failed. Check the cloud service", "正在读取账单...": "Reading bills…", "重新选择账单文件": "Choose the bill file again", "选择账单文件": "Choose bill file", "导入中...": "Importing…", "测试中...": "Testing…", "提交中...": "Submitting…", "登录并切换云端": "Log in and switch to cloud mode", "注册并切换云端": "Register and switch to cloud mode", "退出云端账户": "Sign out of cloud account", "连接 MySQL 后端服务": "Connect to the MySQL backend", "当前账户：": "Current account: ", "请输入密码": "Enter your password", "例如：小明": "For example: Alex", "昵称（可选）": "Nickname (optional)", "邮箱": "Email", "密码（至少 8 位）": "Password (at least 8 characters)", "微信支付 CSV / Excel 格式": "WeChat Pay CSV / Excel format", "支付宝交易记录 CSV / Excel": "Alipay transaction-record CSV / Excel", "最近导入问题": "Recent import issues", "已解决": "Resolved", "清爽、稳定的默认配色": "A clean, steady default palette", "本地模式将数据保存在当前设备；云端模式只读取后端数据库，连接失败时不会混用本地数据。": "Local mode stores data on this device; cloud mode only reads the backend database and never falls back to local data when disconnected.", "云端模式需要账户登录。账户只用于隔离不同用户的账本数据，不会接触本地模式的数据。": "Cloud mode requires an account. It keeps each user’s ledger separate and does not touch local-mode data.", "忘记密码时可在部署管理员提供的数据库中重置账户；密码不会以明文保存。": "If you forget your password, ask the deployment administrator to reset the account in the database; passwords are never stored in plain text.", "支持微信、支付宝官方导出的 CSV / XLS / XLSX 文件；选择后会自动识别平台，确认导入前不会写入数据。": "Official WeChat and Alipay CSV, XLS, and XLSX files are supported. The platform is detected automatically; nothing is written until you confirm.", "相关网站": "Related websites", "数据没有加载出来怎么办？": "What should I do if data does not load?", "先在切换模式中确认当前数据源，云端模式还需要后端服务可访问。": "First confirm the data source in Data mode; cloud mode also requires a reachable backend.", "账单导入支持什么格式？": "Which bill formats are supported?", "支持微信和支付宝官方导出的 CSV、XLS、XLSX 文件。": "Official WeChat and Alipay CSV, XLS, and XLSX files are supported.", "Web 端和 App 有何不同？": "How are the Web and App versions different?",
  "本月现金流平稳，无超支或临近违约风险": "Monthly cash flow is steady, with no overspending or near-term default risk", "预算分配构成": "Budget allocation breakdown", "选择首页统计月份": "Select the home reporting period", "本月当前已超支": "This month is currently over budget", "本月当前结余": "Current monthly balance", "本月总预算": "Total monthly budget", "本月支出低于上月": "Spending is below last month", "本月支出高于上月": "Spending is above last month",
  "当前筛选支出": "Spending in selected period", "筛选期收入": "Selected-period income", "消费账户": "Spending account", "选择消费统计月份": "Select spending period", "选择消费分类": "Select expense category", "选择消费账户": "Select spending account", "展开深入分析": "Show deep analysis", "收起深入分析": "Hide deep analysis", "暂无支出": "No spending", "确定删除这笔流水吗？": "Delete this transaction?", "记一笔": "Add entry", "编辑流水": "Edit transaction", "餐饮消费": "Food spending",
  "薪资录入方式": "Salary entry method", "记录贷款还款": "Record loan repayment", "保存还款": "Save repayment", "编辑资产": "Edit asset", "编辑贷款": "Edit loan", "新资产": "New asset", "新贷款": "New loan", "保存中...": "Saving…", "保存失败，请稍后重试": "Save failed. Try again later.", "正在处理...": "Processing…", "生成中...": "Generating…", "读取中": "Reading…", "应用中...": "Applying…", "已添加": "Added", "已到期": "Due",
  "请输入大于 0 的预算金额": "Enter a budget amount greater than 0", "保存失败，请检查当前数据源后重试": "Save failed. Check the current data source and try again", "删除失败，请检查当前数据源后重试": "Delete failed. Check the current data source and try again", "总预算": "Total budget", "先从一个月度或年度总额开始管理": "Start by managing a monthly or annual total", "新增预算": "Add budget", "月度总预算": "Monthly total budget", "年度总预算": "Annual total budget", "编辑预算": "Edit budget", "分类预算和平台预算可在后续版本扩展": "Category and account budgets can be added in a later version", "还没有预算，先新增一个总预算": "No budgets yet. Add a total budget first", "预算金额": "Budget amount", "周期": "Period", "每月": "Every month", "每年": "Every year", "保存预算": "Save budget", "余额校正": "Balance reconciliation", "选择对账范围": "Choose reconciliation scope", "默认汇总本月全部收支，也可按支付账户查看": "Summarize this month’s cash flow by default, or view it by payment account", "对账月份": "Reconciliation month", "本月收入支出": "This month’s income and spending", "本月还款": "This month’s repayment", "现有实际余额": "Current actual balance", "输入当前银行卡 / 钱包余额": "Enter the current bank-card / wallet balance", "校正原因（可选）": "Reconciliation reason (optional)", "对账结果": "Reconciliation result", "等待输入实际余额": "Waiting for the actual balance", "账目一致": "Accounts match", "存在差异": "Difference found", "差异": "Difference", "输入实际余额后校正": "Enter the actual balance to reconcile", "无需校正": "No reconciliation needed", "账单读取失败，请关闭后重试。": "Could not read bills. Close this sheet and try again.", "本月账单结余与现有实际余额一致，不需要生成校正。": "This month’s bill balance matches the actual balance; no reconciliation entry is needed.", "先输入现有实际余额，系统会自动计算差异。": "Enter the actual balance first; the system will calculate the difference.", "校正流水生成失败，请检查当前数据源后重试。": "Could not create the reconciliation entry. Check the current data source and try again.", "生成余额校正流水": "Create reconciliation entry", "校正流水会记在本月最后一天。选择“全部”时，校正会归入“其他”；转账暂不计入本月收支，避免重复计算。": "The reconciliation entry is dated on the last day of this month. With “All” selected, it is assigned to “Other”; transfers are excluded to avoid double counting.",
  "版本检查": "Version check", "版本检查失败": "Version check failed", "已是最新版本": "Already up to date", "浏览器版不提供 APK 更新检查，请在 Android App 中使用。": "APK update checks are not available in the browser. Use the Android app.", "正在检查更新…": "Checking for updates…", "正在连接版本服务，请稍候。": "Connecting to the version service…", "知道了": "Got it", "发现新版本": "New version available", "当前版本": "Current version", "有新的 App 版本可用。": "A new app version is available.", "服务器尚未配置 APK 下载地址，请稍后再试。": "The server has not configured an APK download URL. Try again later.", "稍后": "Later", "下载更新": "Download update",
  "输入或选择分类，如：房租水电": "Enter or choose a category, e.g. rent and utilities", "保存并应用": "Save and apply", "输入账单里的名称或关键词，例如：房东": "Enter a bill name or keyword, e.g. landlord", "账单加载失败，请稍后重试": "Could not load bills. Try again later.", "正在匹配并应用流水...": "Matching and applying transactions…", "规则保存失败，请检查当前数据源是否可用": "Could not save the rule. Check that the current data source is available.", "给转账等账单指定消费分类，归类后将按该分类计入消费支出的统计与分析。": "Assign expense categories to transfers and similar bills; categorized entries are included in spending analysis.", "输入账单里的名称或关键词，可直接查看匹配流水": "Enter a bill name or keyword to preview matching transactions", "例如：房东、张三、某某物业": "For example: landlord, Alex, or a property manager", "会匹配交易对方、商品说明、备注、平台、支付方式和订单号": "Matches the counterparty, product details, notes, platform, payment method, and order ID", "也可以输入自定义分类": "You can also enter a custom category", "示例：输入“房东”后归入“房租水电”": "Example: enter “landlord” to assign “rent and utilities”", "归入": "Assign to", "加载更多": "Load more", "当前账本没有匹配的非收入流水": "No matching non-income transactions in the current ledger",
  "单月存模式": "Single-month mode", "隔月存模式": "Alternate-month mode", "无法读取该储蓄目标": "Could not read this savings goal", "未找到该储蓄目标": "Savings goal not found", "计划薪资": "Planned salary", "预计剩余": "Projected remaining", "储蓄名称": "Savings name", "如 30000": "For example, 30000", "计划年份": "Plan year", "选择要添加的月份": "Select a month to add", "月份已完整": "All months are included", "添加月份": "Add month", "储蓄频率": "Savings frequency", "输入支出名称，如交通 / 临时医疗": "Enter an expense name, e.g. transport / temporary medical", "临时": "Temporary", "正在加载储蓄目标...": "Loading savings goal…", "正在同步已有计划...": "Syncing the existing plan…", "保存计划": "Save plan", "当前计划": "Current plan", "实际存入日期": "Actual deposit date", "备注": "Note", "实际还款日期": "Actual repayment date", "如：招行工资卡 / 微信零钱": "For example: salary card / WeChat balance", "当前余额 (元)": "Current balance (CNY)", "如：建设银行房贷 / 招行车贷": "For example: bank mortgage / car loan", "贷款总额 (元)": "Total loan (CNY)", "剩余本金 (元)": "Remaining principal (CNY)", "默认等于总额": "Defaults to the total", "还款金额 (元)": "Repayment amount (CNY)", "记账类型": "Entry type", "选择年份和月份后，将按同一金额生成工资收入；已存在工资的月份会自动跳过。": "Choose the year and months to create salary entries with the same amount; months that already have salary income are skipped.", "未填写则标记为工资补录": "Leave blank to mark as salary backfill", "请选择要补录的月份。": "Select the months to backfill",
  "主导航": "Main navigation", "无贷款": "No loans",
  "云端数据加载失败，请检查后端服务和数据库连接后重试。": "Cloud data could not be loaded. Check the backend service and database connection, then try again.", "储蓄关键指标": "Key savings metrics", "储蓄目标": "Savings goal", "切换云端模式前请先登录": "Log in before switching to cloud mode", "列已存在，请换一个名称": "This column already exists. Choose another name", "工资补录": "Salary backfill", "已超过预算线": "Over the budget limit", "建议控制后续支出": "Consider controlling later spending", "平台": "Account", "归类消费分类": "Categorized spending categories", "暂时无法连接版本服务，请稍后重试。": "Could not connect to the version service. Try again later.", "例如：遗漏一笔现金消费、手续费": "For example: a missed cash expense or service fee", "修改实际存入记录": "Edit actual deposit record", "账本总额校正": "Ledger total reconciliation", "贷款还款进度": "Loan repayment progress", "转账归类": "Transfer categorized", "较上月下降": "down from last month", "较上月增加": "up from last month", "请至少选择一个补录月份": "Select at least one month to backfill", "请输入大于 0 的每月工资金额": "Enter a monthly salary greater than 0", "正在读取...": "Reading…", "补录中...": "Backfilling…", "请先输入支出名称": "Enter an expense name first", "水电": "Utilities", "默认账本": "Default ledger", "本地用户": "Local user", "今天": "Today", "进行中": "In progress", "应还": "Due", "记录实际存入": "Record actual deposit",
};

const knownValues = new Map(Object.entries(translations));
const textRecords = new WeakMap<Text, { original: string; translated: string }>();
const elementRecords = new WeakMap<Element, { original: string; translated: string }>();
const attributeRecords = new WeakMap<Element, Map<string, { original: string; translated: string }>>();

function preserveWhitespace(source: string, translated: string) {
  const leading = source.match(/^\s*/)?.[0] ?? "";
  const trailing = source.match(/\s*$/)?.[0] ?? "";
  return `${leading}${translated.trim()}${trailing}`;
}

function translateDynamic(source: string) {
  let value = source;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  value = value.replace(/^(\d{4})年全年$/, "$1 full year");
  value = value.replace(/^(\d{4})年月份$/, "$1 months");
  value = value.replace(/^(\d{4})年$/, "$1");
  value = value.replace(/^(\d{4})年(\d{1,2})月$/, (_m, year, month) => `${months[Number(month) - 1] ?? month} ${year}`);
  value = value.replace(/^(\d{4})年(\d{1,2})月 · (.+)$/, (_m, year, month, suffix) => `${months[Number(month) - 1] ?? month} ${year} · ${translateText(suffix, "en-US")}`);
  value = value.replace(/^(\d{4})-(\d{2})$/, (_m, year, month) => `${months[Number(month) - 1] ?? month} ${year}`);
  value = value.replace(/^(\d+)年年度储蓄$/, "$1 annual savings");
  value = value.replace(/^(\d{4}) 年度储蓄$/, "$1 annual savings");
  value = value.replace(/^(\d{4}) 年度储蓄 · Remaining ¥ (.+)$/, "$1 annual savings · Remaining ¥ $2");
  value = value.replace(/^(\d{4}) 年度储蓄 · 还差 ¥ (.+)$/, "$1 annual savings · Remaining ¥ $2");
  value = value.replace(/^(\d{4})-\d{2} 待执行额度$/, "$1 planned amount");
  value = value.replace(/^(\d+)年预计存$/, "$1 planned savings");
  value = value.replace(/^(\d+)月$/, (_m, month) => months[Number(month) - 1] ?? `${month} month`);
  value = value.replace(/^(\d+)月薪资$/, "$1 salary");
  value = value.replace(/^(\d+)月预计存$/, "$1 planned savings");
  value = value.replace(/^(\d+)月上月结余$/, "$1 previous balance");
  value = value.replace(/^共 (\d+) 笔记账$/, "$1 entries");
  value = value.replace(/^(\d+) 笔筛选结果 · 显示最近 (\d+) 笔$/, "$1 filtered results · showing the latest $2");
  value = value.replace(/^(\d+) 笔流水$/, "$1 transactions");
  value = value.replace(/^(\d+) 笔$/, "$1 transactions");
  value = value.replace(/^(\d+) 笔进行中$/, "$1 active");
  value = value.replace(/^(\d+) 笔记录$/, "$1 records");
  value = value.replace(/^全$/, "All");
  value = value.replace(/^(\d+) 项关联$/, "$1 linked items");
  value = value.replace(/^(\d+) 笔待还款$/, "$1 payments due");
  value = value.replace(/^(\d+) 笔待还$/, "$1 due");
  value = value.replace(/^(\d+) 个目标计划$/, "$1 goal plans");
  value = value.replace(/^(\d+) 个目标$/, "$1 goals");
  value = value.replace(/^(\d+) 个分类$/, "$1 categories");
  value = value.replace(/^(\d+) 个账户$/, "$1 accounts");
  value = value.replace(/^(\d+) 个关联$/, "$1 linked items");
  value = value.replace(/^(\d+) 类配置$/, "$1 allocation types");
  value = value.replace(/^(\d+) 条$/, "$1 rules");
  value = value.replace(/^已还 (\d+) \/ (\d+) 期$/, "Paid $1 / $2 installments");
  value = value.replace(/^剩余 (\d+) 期$/, "$1 installments remaining");
  value = value.replace(/^占收入 (\d+)%$/, "$1% of income");
  value = value.replace(/^已用 (\d+)%$/, "$1% used");
  value = value.replace(/^已分配 ¥ (.+)$/, "Allocated ¥ $1");
  value = value.replace(/^占比 (\d+(?:\.\d+)?)%$/, "$1% share");
  value = value.replace(/^资产占比 (\d+(?:\.\d+)?)%$/, "Asset share $1%");
  value = value.replace(/^负债占比 (\d+(?:\.\d+)?)%$/, "Liability share $1%");
  value = value.replace(/^预计 (\d{4}) 年结清$/, "Estimated payoff in $1");
  value = value.replace(/^已还清 (.+)$/, "Paid off $1");
  value = value.replace(/^发薪日 (\d+) 号 ›$/, "Payday $1 ›");
  value = value.replace(/^已还 ¥ (.+) \((\d+)%\)$/, "Paid ¥ $1 ($2%)");
  value = value.replace(/^月供 ¥ (.+)$/, "Monthly payment ¥ $1");
  value = value.replace(/^下期还款 (.+)$/, "Next payment $1");
  value = value.replace(/^(\d+) 天后$/, "in $1 days");
  value = value.replace(/^(.+?) · (\d+) 天后$/, "$1 · in $2 days");
  value = value.replace(/^(.+?) · 剩余 (\d+) 期$/, "$1 · $2 installments remaining");
  value = value.replace(/^已存 ¥ (.+)$/, "Saved ¥ $1");
  value = value.replace(/^还差 ¥ (.+)$/, "Remaining ¥ $1");
  value = value.replace(/^目标 ¥ (.+)$/, "Target ¥ $1");
  value = value.replace(/^剩余 ¥ (.+)$/, "Remaining ¥ $1");
  value = value.replace(/^(.+?) · 剩余 (\d+) 期$/, "$1 · $2 installments remaining");
  value = value.replace(/^(.+?) · (\d+) 笔流水$/, "$1 · $2 transactions");
  value = value.replace(/^(.+?) · (\d+) 笔进行中$/, "$1 · $2 active");
  value = value.replace(/^(.+?) · (\d+) 笔待还$/, "$1 · $2 due");
  value = value.replace(/^(.+?) · (\d+) 个目标计划$/, "$1 · $2 goal plans");
  value = value.replace(/^(.+?) · (\d+) 个目标$/, "$1 · $2 goals");
  value = value.replace(/^(.+?) · (\d+) 期$/, "$1 · $2 installments");
  value = value.replace(/^(.+?)支出 ¥ ([\d,.]+)，记录时间 (.+)$/, (_m, name, amount, date) => `${knownValues.get(name) ?? name} spending ¥ ${amount}, recorded ${date}`);
  value = value.replace(/^(.+?)支出 ¥ ([\d,.]+)，占总支出约 (\d+)%$/, (_m, name, amount, percent) => `${knownValues.get(name) ?? name} spending ¥ ${amount}, about ${percent}% of total spending`);
  value = value.replace(/^(.+?)是本月最大支出项$/, (_m, name) => `${translateText(name, "en-US")} is this month’s largest expense`);
  value = value.replace(/^当前已使用 (\d+)%[，,](.+)$/, (_m, percent, detail) => `Currently ${percent}% used; ${translateText(detail, "en-US")}`);
  value = value.replace(/^(.+?)接近上限$/, (_m, name) => `${translateText(name, "en-US")} is near its limit`);
  value = value.replace(/^(.+?)出现大额支出$/, (_m, name) => `${translateText(name, "en-US")} has a large expense`);
  value = value.replace(/^较上月(增加|下降) (\d+)%[，,]建议关注高频消费分类$/, (_m, direction, percent) => `${direction === "增加" ? "Up" : "Down"} ${percent}% from last month; watch high-frequency spending categories`);
  value = value.replace(/^(.+?)已消耗 (\d+)%，结余处于合理区间$/, (_m, name, percent) => `${knownValues.get(name) ?? name} used ${percent}%; the remaining budget is in a healthy range`);
  value = value.replace(/^当前已加载流水中匹配 (\d+) 笔$/, "$1 matching transactions loaded");
  value = value.replace(/^已导入 (\d+) 笔，跳过 (\d+) 笔，失败 (\d+) 笔$/, "Imported $1, skipped $2, failed $3");
  value = value.replace(/^已导入 (\d+) 笔，跳过 (\d+) 笔，失败 (\d+) 笔，失败行可再次确认导入$/, "Imported $1, skipped $2, failed $3; failed rows can be confirmed again");
  value = value.replace(/^已导出 (\d+) 笔账单，文件已开始下载$/, "Exported $1 bills; the download has started");
  value = value.replace(/^导出账单失败[：:](.*)$/, (_m, detail) => `Bill export failed: ${detail}`);
  value = value.replace(/^已识别 (.+)：(.+)账单，共 (\d+) 笔。确认后才会导入。$/, "Recognized $1: $2 bills, $3 transactions. Confirm to import.");
  value = value.replace(/^读取账单失败(.*)。请确认文件未损坏且为 CSV \/ XLS \/ XLSX 格式。$/, "Could not read bills$1. Confirm the file is intact and uses CSV / XLS / XLSX format.");
  value = value.replace(/^正在导入 (\d+) 笔(.+)账单\.\.\.$/, "Importing $1 $2 bills…");
  value = value.replace(/^账单导入失败(.*)$/, (_m, detail) => `Bill import failed${detail}`);
  value = value.replace(/^第 (\d+) 行$/, "line $1");
  value = value.replace(/^当前账户：(.+)$/, "Current account: $1");
  value = value.replace(/^已新增(固定支出|临时支出)“(.+?)”列$/, (_m, kind, name) => `Added ${kind === "固定支出" ? "fixed expense" : "temporary expense"} column “${name}”`);
  value = value.replace(/^已保存 (\d+) 个月的储蓄计划$/, "Saved the savings plan for $1 months");
  value = value.replace(/^已删除(.+?)月份行$/, "Deleted $1 month row");
  value = value.replace(/^已添加(.+?)月份行$/, "Added $1 month row");
  value = value.replace(/^(\d+) 年预计存$/, "$1 planned savings");
  value = value.replace(/^(\d+) 年$/, "$1");
  value = value.replace(/^共 (\d+) 个分类$/, "$1 categories");
  value = value.replace(/^共 (\d+) 个账户$/, "$1 accounts");
  value = value.replace(/^共 (\d+) 项关联$/, "$1 linked items");
  value = value.replace(/^共 (\d+) 个目标$/, "$1 goals");
  value = value.replace(/^共 (\d+) 个目标计划$/, "$1 goal plans");
  value = value.replace(/^(.+?) · 还差 ¥ (.+)$/, (_m, name, amount) => `${translateText(name, "en-US")} · Remaining ¥ ${amount}`);
  value = value.replace(/^(\d+) 已完成 · (\d+) 待处理$/, "$1 completed · $2 pending");
  value = value.replace(/^整体进度 (\d+)%$/, "Overall progress $1%");
  value = value.replace(/^(.+?) · 整体进度 (\d+)%$/, "$1 · Overall progress $2%");
  value = value.replace(/^(.+?)，若保持当前速率，预计月底可结余 ¥(.+?)。$/, "$1. At this pace, the projected month-end balance is ¥$2.");
  value = value.replace(/^当前日均支出 ¥(.+?)，若保持当前速率，预计月底可结余 ¥(.+?)。$/, "Daily spending is currently ¥$1. At this pace, the projected month-end balance is ¥$2.");
  value = value.replace(/^剩余总预算 ¥(.+?)，建议将富余资金分配至(.+?) ›$/, "Remaining total budget ¥$1. Consider directing the surplus to $2 ›");
  value = value.replace(/^剩余总预算 ¥(.+?)，建议将富余资金分配至$/, "Remaining total budget ¥$1. Consider directing the surplus to");
  value = value.replace(/^(.+?)占比$/, "$1 share");
  value = value.replace(/^(.+?) · (\d+)% 占比$/, (_m, name, percent) => `${name} · ${percent}% share`);
  value = value.replace(/^(.+?) · (\d{2}-\d{2})$/, (_m, name, date) => `${name} · ${date}`);
  value = value.replace(/^(.+?) · (\d+) 个账户$/, "$1 · $2 accounts");
  value = value.replace(/^(.+?) · (\d+) 项关联$/, "$1 · $2 linked items");
  value = value.replace(/^(.+?) · (\d+) 个分类$/, "$1 · $2 categories");
  value = value.replace(/^已还清 ¥ (.+?) · 整体进度 (\d+)%$/, "Paid off ¥ $1 · Overall progress $2%");
  value = value.replace(/^(.+?) · (\d+) 条$/, "$1 · $2 rules");
  value = value.replace(/^(.+?) · (\d+) 笔记录$/, "$1 · $2 records");
  value = value.replace(/^(.+?) · (\d+) 个月的储蓄计划$/, "$1 · savings plan for $2 months");
  value = value.replace(/^储蓄计划已进入本地编辑模式$/, "Savings plan is now in local editing mode");
  value = value.replace(/^保存失败，请稍后重试$/, "Save failed. Try again later.");
  value = value.replace(/^正在同步已有计划\.\.\.$/, "Syncing the existing plan…");
  value = value.replace(/^当前筛选下暂无流水$/, "No transactions match the current filters");
  value = value.replace(/^当前没有可归类的转账账单$/, "There are no transfer bills to classify");
  value = value.replace(/^暂无储蓄记录$/, "No savings records yet");
  value = value.replace(/^暂无储蓄目标$/, "No savings goals yet");
  value = value.replace(/^暂无贷款，新增后会显示还款节奏$/, "No loans yet. Add one to see the repayment rhythm.");
  value = value.replace(/^暂无资产账户$/, "No asset accounts yet");
  value = value.replace(/^暂无资产配置数据$/, "No asset allocation data yet");
  value = value.replace(/^暂无负债，表现优秀$/, "No liabilities. Great work.");
  value = value.replace(/^请选择(.+?)官方导出的 CSV \/ Excel 账单$/, "Choose the official $1 CSV / Excel bill file");
  value = value.replace(/^请选择(.+?)账单文件$/, "Choose the $1 bill file");
  value = value.replace(/^当前选择的是(.+?)，但文件看起来是(.+?)账单$/, "You selected $1, but the file appears to be a $2 bill");
  value = value.replace(/^没有识别到有效(.+?)流水，请检查 CSV\/Excel 文件格式$/, "No valid $1 transactions were found. Check the CSV/Excel format.");
  value = value.replace(/^(.+?) · (待存入|已完成|已跳过)$/, (_m, name, status) => `${name} · ${knownValues.get(status) ?? status}`);
  value = value.replace(/^达到 (\d+)% 时提醒$/, "Alert at $1%");
  value = value.replace(/^确定删除(月度|年度)总预算吗？$/, (_m, period) => `Delete the ${period === "月度" ? "monthly" : "annual"} total budget?`);
  value = value.replace(/^已生成 (收入|支出)校正流水 ¥ (.+)，账面余额已同步。$/, (_m, type, amount) => `Created a ${type === "收入" ? "income" : "expense"} reconciliation entry for ¥ ${amount}; the recorded balance is synced.`);
  value = value.replace(/^现有实际余额比本月账单结余(多|少) ¥ (.+)。$/, (_m, direction, amount) => `The actual balance is ¥ ${amount} ${direction === "多" ? "above" : "below"} this month’s bill balance.`);
  value = value.replace(/^已应用到 (\d+) 笔流水，后续导入同名账单也会自动归类$/, "$1 transactions updated; future bills with the same name will be categorized automatically");
  value = value.replace(/^当前账本匹配 (\d+) 笔，已在下方显示$/, "$1 matching transactions are shown below");
  value = value.replace(/^加载更多（还有 (\d+) 笔）$/, "Load more ($1 remaining)");
  value = value.replace(/^删除(.+)规则$/, "Delete $1 rule");
  value = value.replace(/^删除(.+)列$/, "Delete $1 column");
  value = value.replace(/^确定删除“(.+)”规则吗？已归类的流水不会被清除。$/, "Delete the “$1” rule? Categorized transactions will not be cleared.");
  value = value.replace(/^正在生成余额校正流水\.\.\.$/, "Creating a reconciliation entry…");
  value = value.replace(/^(\d+) 笔纳入计算$/, "$1 transactions included");
  value = value.replace(/^已选择 (\d+) 个月，确认后将先检查是否已有工资记录。$/, "$1 months selected; existing salary records will be checked before confirming.");
  value = value.replace(/^所选 (\d+) 个月都已有工资收入，未重复新增。$/, "All selected $1 months already have salary income; nothing was duplicated.");
  value = value.replace(/^正在检查已导入的工资记录\.\.\.$/, "Checking imported salary records…");
  value = value.replace(/^正在补录 (\d+) 笔工资收入\.\.\.$/, "Backfilling $1 salary entries…");
  value = value.replace(/^已补录 (\d+) 笔(，跳过 (\d+) 个已有工资月份)?(，失败 (\d+) 笔)?。$/, (_m, imported, skippedText, skipped, failedText, failed) => `Backfilled ${imported} salary entries${skipped ? `, skipped ${skipped} existing months` : ""}${failed ? `, failed ${failed}` : ""}.`);
  value = value.replace(/^批量补录失败(.*)$/, (_m, detail) => `Batch salary backfill failed${detail}`);
  value = value.replace(/^请至少选择一个补录月份$/, "Select at least one month to backfill");
  value = value.replace(/^请输入大于 0 的每月工资金额$/, "Enter a monthly salary greater than 0");
  value = value.replace(/^确认补录 (\d+) 个月工资$/, "Confirm backfill for $1 months of salary");
  value = value.replace(/^发薪日 (\d+) 日$/, "Payday $1");
  value = value.replace(/^关闭(.+)$/, (_m, title) => `Close ${translateText(title, "en-US")}`);
  value = value.replace(/^当前 App 版本为 (.+)。$/, "The current app version is $1.");
  value = value.replace(/^当前版本 (.+)，有新的 App 版本可用。$/, "Current version $1; a new app version is available.");
  value = value.replace(/^星会计 (.+)$/, "Stark Accounting $1");
  return value;
}

export function resolveLocale(language: LanguageChoice): AppLocale {
  if (language === "EN_US") return "en-US";
  if (language === "SYSTEM") return typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("en") ? "en-US" : "zh-CN";
  return "zh-CN";
}

export function translateText(source: string, locale: AppLocale) {
  if (locale === "zh-CN") return source;
  const trimmed = source.trim();
  return preserveWhitespace(source, translations[trimmed] ?? translateDynamic(trimmed));
}

export function translateValue(value: string | null | undefined, locale: AppLocale) {
  if (!value || locale === "zh-CN") return value ?? "";
  const trimmed = value.trim();
  const translated = translations[trimmed] ?? translateDynamic(trimmed);
  return preserveWhitespace(value, translated);
}

export function formatCount(count: number, noun: "entries" | "transactions" | "rules" | "goals" | "accounts" | "categories", locale: AppLocale) {
  if (locale === "zh-CN") {
    const labels = { entries: "笔记账", transactions: "笔流水", rules: "条", goals: "个目标", accounts: "个账户", categories: "个分类" };
    return `${count} ${labels[noun]}`;
  }
  const labels = { entries: "entries", transactions: "transactions", rules: "rules", goals: "goals", accounts: "accounts", categories: "categories" };
  return `${count} ${labels[noun]}`;
}

export function formatMonthLabel(month: string, locale: AppLocale) {
  const value = Number(month.slice(5, 7));
  if (!Number.isFinite(value)) return month;
  return locale === "zh-CN" ? `${value}月` : new Intl.DateTimeFormat("en-US", { month: "short" }).format(new Date(2024, value - 1, 1));
}

export function useAppLocale() {
  const [locale, setLocale] = useState<AppLocale>(() => (typeof document !== "undefined" && document.documentElement.lang === "en-US" ? "en-US" : "zh-CN"));
  useEffect(() => {
    const refresh = () => setLocale(document.documentElement.lang === "en-US" ? "en-US" : "zh-CN");
    refresh();
    window.addEventListener("stark:ui-settings-changed", refresh);
    window.addEventListener("stark:ui-settings-applied", refresh);
    return () => {
      window.removeEventListener("stark:ui-settings-changed", refresh);
      window.removeEventListener("stark:ui-settings-applied", refresh);
    };
  }, []);
  return locale;
}

export function translateDocument(root: ParentNode, locale: AppLocale) {
  const elements = root instanceof Element ? [root, ...Array.from(root.querySelectorAll("*"))] : Array.from(root.querySelectorAll("*"));
  const leafElements = new Set<Element>();
  for (const element of elements) {
    if (element.children.length === 0 && element.textContent?.trim()) {
      leafElements.add(element);
      const current = element.textContent;
      const previous = elementRecords.get(element);
      const original = previous && (current === previous.translated || current === previous.original) ? previous.original : current;
      const translated = locale === "zh-CN" ? original : translateText(original, locale);
      elementRecords.set(element, { original, translated });
      if (current !== translated) element.textContent = translated;
    }
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode() as Text | null;
  while (node) {
    const parent = node.parentElement;
    if (parent && !leafElements.has(parent) && !["SCRIPT", "STYLE", "NOSCRIPT"].includes(parent.tagName)) {
      const current = node.nodeValue ?? "";
      const previous = textRecords.get(node);
      const original = previous && (current === previous.translated || current === previous.original) ? previous.original : current;
      const translated = locale === "zh-CN" ? original : translateText(original, locale);
      textRecords.set(node, { original, translated });
      if (current !== translated) node.nodeValue = translated;
    }
    node = walker.nextNode() as Text | null;
  }

  for (const element of elements) {
    let records = attributeRecords.get(element);
    if (!records) {
      records = new Map();
      attributeRecords.set(element, records);
    }
    for (const name of ["aria-label", "title", "placeholder", "alt"]) {
      const current = element.getAttribute(name);
      if (current === null) continue;
      const previous = records.get(name);
      const original = previous && (current === previous.translated || current === previous.original) ? previous.original : current;
      const translated = locale === "zh-CN" ? original : translateText(original, locale);
      records.set(name, { original, translated });
      if (current !== translated) element.setAttribute(name, translated);
    }
  }
}
