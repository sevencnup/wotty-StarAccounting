import type { Transaction } from "@/lib/stark/models";

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

export function hasRemark(tx: Transaction): boolean {
  return Boolean(tx.remarkCategory?.trim());
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