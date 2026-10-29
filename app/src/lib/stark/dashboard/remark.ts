import type { CategoryRule, Transaction } from "@/lib/stark/models";

/**
 * 备注归类：给转账等账单手动指定一个消费分类（如「房租水电」）。
 * 归类后的账单在消费统计里按对应分类计为一笔支出（type 视作 EXPENSE）。
 */

export const REMARK_SUGGESTIONS = [
  "房租水电",
  "餐饮",
  "购物",
  "交通",
  "住房",
  "娱乐",
  "医疗",
  "日用",
  "服装",
  "美容",
  "宠物",
  "通讯",
  "运动",
  "旅行",
  "教育",
  "其他",
];

export type RemarkTransactionFilter = "TRANSFER" | "ALL";

export type RemarkTransactionSearchIndexEntry = {
  transaction: Transaction;
  searchText: string;
  isIncome: boolean;
  isTransfer: boolean;
};

export function hasRemark(tx: Transaction): boolean {
  return Boolean(tx.remarkCategory?.trim());
}

function normalizeKeyword(value: string | null | undefined) {
  return (value ?? "").trim().replace(/\s+/g, "").toLowerCase();
}

/** 用于规则匹配的流水文本，覆盖微信/支付宝常见的交易对象、商品和备注字段。 */
export function transactionSearchText(tx: Transaction): string {
  return [
    tx.merchant,
    tx.description,
    tx.platform,
    tx.paymentMethod,
    tx.category,
    tx.orderId,
  ]
    .filter((value): value is string => Boolean(value?.trim()))
    .map(normalizeKeyword)
    .join(" ");
}

/** 预先规范化账单文本，避免每次输入关键词都重复拼接和清洗全部流水。 */
export function buildRemarkTransactionSearchIndex(transactions: Transaction[]): RemarkTransactionSearchIndexEntry[] {
  return transactions.map((transaction) => ({
    transaction,
    searchText: transactionSearchText(transaction),
    isIncome: transaction.type === "INCOME",
    isTransfer: transaction.type === "TRANSFER",
  }));
}

export function matchesCategoryKeyword(tx: Transaction, keyword: string): boolean {
  const normalizedKeyword = normalizeKeyword(keyword);
  return tx.type !== "INCOME" && Boolean(normalizedKeyword) && transactionSearchText(tx).includes(normalizedKeyword);
}

/**
 * 账单归类面板的可见流水：输入关键词时直接展示所有命中的非收入流水；
 * 未搜索时才使用「转账 / 全部流水」筛选。
 */
export function filterRemarkTransactions(
  transactions: Transaction[],
  keyword: string,
  filter: RemarkTransactionFilter,
): Transaction[] {
  return filterRemarkTransactionIndex(buildRemarkTransactionSearchIndex(transactions), keyword, filter);
}

export function filterRemarkTransactionIndex(
  index: RemarkTransactionSearchIndexEntry[],
  keyword: string,
  filter: RemarkTransactionFilter,
): Transaction[] {
  const normalizedKeyword = normalizeKeyword(keyword);
  return index
    .filter((entry) => {
      if (normalizedKeyword) return !entry.isIncome && entry.searchText.includes(normalizedKeyword);
      return filter === "ALL" ? !entry.isIncome : entry.isTransfer;
    })
    .map((entry) => entry.transaction);
}

export function matchesCategoryRule(tx: Transaction, rule: CategoryRule): boolean {
  if (!rule.isActive) return false;
  return matchesCategoryKeyword(tx, rule.merchantKey || rule.merchant);
}

/** 将规则应用到匹配流水；收入不参与消费归类。 */
export function applyCategoryRule(transactions: Transaction[], rule: CategoryRule): Transaction[] {
  return transactions.map((tx) =>
    matchesCategoryRule(tx, rule)
      ? { ...tx, remarkCategory: rule.category.trim() || null }
      : tx,
  );
}

export function applyCategoryRules(transactions: Transaction[], rules: CategoryRule[]): Transaction[] {
  return rules.filter((rule) => rule.isActive).reduce(applyCategoryRule, transactions);
}

/** 分析用有效类型：有备注归类时按 EXPENSE 统计。 */
export function effectiveType(tx: Transaction): Transaction["type"] {
  return hasRemark(tx) ? "EXPENSE" : tx.type;
}

/** 分析用有效分类：有备注归类时用备注分类。 */
export function effectiveCategory(tx: Transaction): string {
  return hasRemark(tx) ? (tx.remarkCategory as string).trim() : tx.category;
}

/** 归一化投影：返回可安全喂给 buildHomeSummary / 图表 的交易副本。 */
export function toAnalysisTransaction(tx: Transaction): Transaction {
  if (!hasRemark(tx)) return tx;
  return { ...tx, type: "EXPENSE", category: (tx.remarkCategory as string).trim() };
}

export function toAnalysisTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.map(toAnalysisTransaction);
}
