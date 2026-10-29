import type { Transaction } from "@/lib/stark/models";

export type MerchantRankingItem = {
  merchant: string;
  amount: number;
  count: number;
};

const UNKNOWN_MERCHANT = "其他商家";

/** 汇总支出流水中的商家金额，并返回金额最高的前 N 名。 */
export function buildMerchantRanking(transactions: Transaction[], limit = 10): MerchantRankingItem[] {
  const totals = new Map<string, MerchantRankingItem>();

  for (const transaction of transactions) {
    if (transaction.type !== "EXPENSE" || transaction.amount <= 0) continue;
    const merchant = transaction.merchant?.trim() || UNKNOWN_MERCHANT;
    const previous = totals.get(merchant);
    if (previous) {
      previous.amount += transaction.amount;
      previous.count += 1;
    } else {
      totals.set(merchant, { merchant, amount: transaction.amount, count: 1 });
    }
  }

  const safeLimit = Number.isFinite(limit) ? Math.max(0, Math.floor(limit)) : 10;
  return [...totals.values()]
    .sort((a, b) => b.amount - a.amount || b.count - a.count || a.merchant.localeCompare(b.merchant, "zh-CN"))
    .slice(0, safeLimit);
}
