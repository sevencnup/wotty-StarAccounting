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
  导入账单: "Import bills", 微信账单: "WeChat bills", 支付宝账单: "Alipay bills",
  账单归类: "Bill classification", 转账可归入支出分类: "Transfers can be assigned to expense categories", 关键词归类: "Keyword classification", 一次匹配同名流水: "Match transactions with the same name at once", 自动规则: "Automatic rule", 账单关键词: "Bill keyword", 归入消费分类: "Assign to expense category", 已保存规则: "Saved rules", 已启用: "Enabled", 已停用: "Disabled", 未归类: "Unclassified", 全部流水: "All transactions",
  默认蓝: "Default blue", 清新绿: "Fresh green", 暖阳橙: "Warm amber", 清爽稳定的默认配色: "The clean and steady default palette", 更柔和的自然配色: "A softer nature-inspired palette", 温暖醒目的强调配色: "A warm, vivid accent palette",
  跟随系统: "System default", 简体中文: "Simplified Chinese", 英文: "English", 固定使用简体中文: "Always use Simplified Chinese", 固定使用英文: "Always use English", 使用设备的语言偏好: "Use the device language preference",
  较小: "Small", 标准: "Standard", 较大: "Large", 星会计: "Stark Accounting", 版本: "Version", 前往GitHub提交反馈: "Send feedback on GitHub", 博客主站: "Blog home", 项目宣发地址: "Project page", 开源地址: "Open-source repository",
  统计范围: "Reporting range", 选择月份: "Select month", 关闭月份选择: "Close month picker", 选择年份: "Select year", 上一年: "Previous year", 下一年: "Next year", 月份: "Month", 取消: "Cancel", 保存: "Save", 确定: "Confirm", 删除: "Delete",
  结余: "Balance", 支出: "Expense", 收入: "Income", 本月结余: "This month’s balance", 薪资周期结余: "Salary-cycle balance", 本月支出: "This month’s spending", 本月收入: "This month’s income", 自然月: "Calendar month", 发薪周期: "Salary cycle", 添加薪资收入: "Add salary income", 发薪日: "Payday", 薪资周期设置: "Salary cycle settings", 编辑目标: "Edit goal", 编辑储蓄目标: "Edit savings goal", 目标金额: "Target amount", 截止日期: "Deadline", 保存修改: "Save changes",
  财务诊断: "Financial checkup", 预算需关注: "Budget needs attention", 净资产: "Net worth", 预算余量: "Budget remaining", 待还贷款: "Loans due", 储蓄达成: "Savings progress", 结构健康: "Healthy structure", 结构稳健: "Healthy structure", 负债关注: "Liabilities need attention", 已超支: "Over budget", 无待还: "Nothing due", 近期还款: "Payment due soon", 状态良好: "All good", 计划进行中: "Plan in progress", 本月支出结构: "This month’s spending structure", 分类明细: "Category details", 财务行动建议: "Financial action plan", 节律健康: "Healthy pace", 需控制支出: "Spending needs control", 收支动态走势: "Cash-flow trend", 近5个月对比: "Last 5 months", "近 5 个月对比": "Last 5 months", "查看 ›": "View ›",
  消费分类: "Expense category", 支付账户: "Payment account", 明细备注: "Transaction details", 清空重填: "Clear and start over", 保存记账: "Save entry", 记账: "Add entry", 添加储蓄: "Add savings", 新增资产: "Add asset", 新增贷款: "Add loan", 资产名称: "Asset name", 资产类型: "Asset type", 当前余额元: "Current balance (CNY)", 保存资产: "Save asset", 贷款名称: "Loan name", 贷款总额元: "Total loan (CNY)", 剩余本金元: "Remaining principal (CNY)", 每月月供元: "Monthly payment (CNY)", 总期数: "Total installments", 每月还款日: "Monthly due day", 保存贷款: "Save loan",
  餐饮: "Food", 购物: "Shopping", 交通: "Transport", 住房: "Housing", 娱乐: "Entertainment", 医疗: "Healthcare", 日用: "Daily essentials", 服装: "Clothing", 美容: "Beauty", 宠物: "Pets", 通讯: "Communications", 运动: "Sports", 旅行: "Travel", 教育: "Education", 工资: "Salary", 奖金: "Bonus", 理财: "Investments", 转账: "Transfer", 现金: "Cash", 银行卡: "Bank card", 支付宝: "Alipay", 微信: "WeChat", 投资: "Investment", 其他: "Other", 房租水电: "Rent and utilities", 日用百货: "Daily essentials", 餐饮美食: "Food", 水电费: "Utilities", 房租: "Rent", 生活消费: "Living expenses", 交通出行: "Transport", 休闲娱乐: "Leisure", 购物消费: "Shopping", 工资收入: "Salary income", 文化休闲: "Culture and leisure", 服饰装扮: "Clothing and accessories", 商业服务: "Business services", 充值缴费: "Top-ups and bills", 美食: "Food", 百货: "General goods", 红包: "Red packet", 培训: "Training", 转账红包: "Transfer red packet", 医疗健康: "Healthcare", 教育培训: "Education and training", 退款: "Refund",
  现金流概览: "Cash-flow overview", 整体进度: "Overall progress", 日均支出: "Daily average spending", 剩余总预算: "Remaining total budget", 建议将富余资金分配至: "Consider directing the surplus to", "，建议将富余资金分配至": ", consider directing the surplus to", 剩余: "Remaining", 目标: "Goal", 已存: "Saved", 还差: "Remaining", 待执行额度: "planned amount", 离总目标还需补齐: "still needed to reach the total goal", 待处理: "pending", 已清: "Cleared", 按更新时间: "By update time", 还没有储蓄目标: "No savings goals yet", 储蓄计划: "Savings plan", "储蓄计划 ›": "Savings plan ›", 储蓄总览: "Savings overview", 本月计划: "This month’s plan", 目标缺口: "Goal gap", 当前冲刺目标: "Current focus goal", 目标组: "Goal groups", 月度节奏: "Monthly rhythm", 最近计划: "Recent plans", 总进度: "Overall progress", 完成率: "Completion rate", 活跃目标与存入进度: "Active goals and deposit progress", 计划强度与完成比例: "Plan intensity and completion", "每月计划、完成状态与实际存入": "Monthly plans, completion, and actual deposits", 最近更新的存入安排: "Recently updated deposit plans", 单月存: "Every month", 隔月存: "Every other month", 固定支出: "Fixed expense", 临时支出: "Temporary expense", 新增固定支出: "Add fixed expense", 新增临时支出: "Add temporary expense", 薪资: "Salary", 预计存: "Planned savings", 存储类型: "Deposit type", 死期: "Fixed-term deposit", 他人帮存: "Saved by others", 已完成: "Completed", 已跳过: "Skipped", 待存入: "Pending deposit", 记录储蓄: "Record savings", 记录已存: "Record deposit", 修改记录: "Edit record", 实际存入: "Actual deposit", 计划存入: "Planned deposit", 图片凭证: "Proof image", 图片凭证预览: "Proof image preview", 添加图片: "Add image", 清除图片: "Remove image", 保存记录: "Save record", "保存中…": "Saving…", 已记录: "Recorded", 未设置期限: "No deadline", 截止: "Deadline", 请选择图片文件: "Please choose an image", "图片不能超过 12MB": "Image must be 12 MB or smaller", 图片读取失败: "Could not read the image", 图片处理失败: "Could not process the image", "实际存入金额必须大于 0": "Actual deposit must be greater than 0",
  还款控制中心: "Repayment control center", 待还本金总额: "Total principal due", 已还: "Paid", 本月月供: "Monthly payments", 月供: "Monthly payment", 还款压力: "Repayment pressure", 下期到期: "Next due", 未来6个月月供趋势: "Monthly payments over the next 6 months", 按现有贷款期数推演: "Projected from current loan terms", 负债构成分析: "Liability breakdown", 各平台贷款占比: "Loan share by platform", 还款日程: "Repayment schedule", 按到期时间排序: "Sorted by due date", 贷款组合: "Loan portfolio", 全部贷款明细与还款进度: "All loans and repayment progress", 待还本金: "Principal due", 下期还款: "Next payment", 已结清: "Paid off", 已逾期: "Overdue", 临近还款: "Due soon", 还款中: "Repaying", 今天到期: "Due today", 压力可控: "Manageable", 需要关注: "Needs attention", 压力偏高: "High pressure", 暂无收入数据: "No income data", 暂无收入: "No income", 已全部结清: "All paid off", 还款日程为空: "No repayment schedule",
 资产负债全景: "Asset and liability overview", 净资产估值: "Estimated net worth", 资产总额: "Total assets", 负债总额: "Total liabilities", 资产占比: "Asset share", 负债占比: "Liability share", 流动资产: "Liquid assets", 负债率: "Debt ratio", 最大单项: "Largest holding", 安全区间: "Safe range", 负债偏高: "High debt", 分散适中: "Moderately diversified", 高度集中: "Highly concentrated", 资产配置构成: "Asset allocation", 资金分布与占比分析: "Fund distribution and share", 资产与负债明细: "Asset and liability details", 各资金账户与借贷清单: "Accounts and borrowing details", 正向资产: "Assets", 应还负债: "Liabilities", 贷款待还: "Loan principal due", 暂无配置: "No configuration", 暂无资产配置数据: "No asset allocation data", 暂无资产账户: "No asset accounts", 资产能够充足覆盖当前全部负债: "Assets comfortably cover all current liabilities", "负债高于资产，建议优先降低高息债务": "Liabilities exceed assets; prioritize reducing high-interest debt", 资产负债对比: "Asset vs. liability comparison",
  收支趋势: "Income and expense trend", 按当前筛选范围: "Within the current filters", 支出分类构成: "Expense breakdown", 金额占比: "Share of amount", 消费节律: "Spending rhythm", 每天的支出热度: "Daily spending intensity", 每日平台支出: "Daily spending by account", 按账户拆分: "By account", 消费流向图: "Spending flow", 账户到分类: "Account to category", 商家消费排行: "Top merchant spending", "消费金额前 10 名": "Top 10 by expense amount", 商家消费: "Merchant spending", 其他商家: "Other merchants", 当前筛选下暂无商家支出: "No merchant spending in the current filters", 流水明细: "Transaction details", 最高分类: "Top category", 收支类型: "Transaction type", 当前结余: "Current balance", 搜索商户或备注: "Search merchant or note", 在当前筛选结果中搜索: "Search within filtered results", 全部分类: "All categories", 全部账户: "All accounts", 全部: "All",
  未能读取数据库数据: "Could not read database data", 未能读取本地数据: "Could not read local data", 请检查后端服务和数据库连接后重试: "Check the backend service and database connection, then try again.", 请重试或检查浏览器的本地存储权限: "Try again or check the browser’s local-storage permission.", 云端服务地址: "Cloud service URL", 本地优先可连接云端的个人财务管理工具: "A local-first personal finance tool with optional cloud connectivity", 加载中: "Loading…", 保存中: "Saving", 导入中: "Importing…", 正在读取账单: "Reading bills…", 测试连接: "Test connection", 测试中: "Testing…", 应用中: "Applying…", 清除归类: "Clear classification", "微信 / 支付宝": "WeChat / Alipay",
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
  value = value.replace(/^占比 (\d+(?:\.\d+)?)%$/, "$1% share");
  value = value.replace(/^资产占比 (\d+(?:\.\d+)?)%$/, "Asset share $1%");
  value = value.replace(/^负债占比 (\d+(?:\.\d+)?)%$/, "Liability share $1%");
  value = value.replace(/^预计 (\d{4}) 年结清$/, "Estimated payoff in $1");
  value = value.replace(/^已还清 (.+)$/, "Paid off $1");
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
  value = value.replace(/^(.+?)已消耗 (\d+)%，结余处于合理区间$/, (_m, name, percent) => `${knownValues.get(name) ?? name} used ${percent}%; the remaining budget is in a healthy range`);
  value = value.replace(/^当前已加载流水中匹配 (\d+) 笔$/, "$1 matching transactions loaded");
  value = value.replace(/^已导入 (\d+) 笔，跳过 (\d+) 笔，失败 (\d+) 笔$/, "Imported $1, skipped $2, failed $3");
  value = value.replace(/^已新增(固定支出|临时支出)“(.+?)”列$/, (_m, kind, name) => `Added ${kind === "固定支出" ? "fixed expense" : "temporary expense"} column “${name}”`);
  value = value.replace(/^已保存 (\d+) 个月的储蓄计划$/, "Saved the savings plan for $1 months");
  value = value.replace(/^已删除(.+?)月份行$/, "Deleted $1 month row");
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
  return translations[value.trim()] ?? value;
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
