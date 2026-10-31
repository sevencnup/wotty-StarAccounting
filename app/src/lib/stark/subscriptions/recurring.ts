import type { DataRepository } from "@/lib/stark/repository/DataRepository";
import type { Subscription, Transaction, User } from "@/lib/stark/models";
import { nowText } from "@/lib/stark/utils/format";

function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function parseDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 0, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export function subscriptionDueDate(subscription: Subscription, year: number, month: number) {
  const day = Math.max(1, Math.min(31, Math.round(subscription.billingDay)));
  return new Date(year, month - 1, Math.min(day, daysInMonth(year, month)), 12, 0, 0, 0);
}

export function subscriptionTransactionId(subscriptionId: string, year: number, month: number) {
  return `subscription-${subscriptionId}-${monthKey(year, month)}`;
}

function monthDistance(start: Date, end: Date) {
  return (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth();
}

function dateText(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`;
}

export function buildSubscriptionTransaction(
  subscription: Subscription,
  user: User,
  dueDate: Date,
  generatedAt = nowText(),
): Transaction {
  const month = monthKey(dueDate.getFullYear(), dueDate.getMonth() + 1);
  return {
    id: subscriptionTransactionId(subscription.id, dueDate.getFullYear(), dueDate.getMonth() + 1),
    userId: user.id,
    accountId: subscription.accountId,
    amount: subscription.amount,
    type: "EXPENSE",
    category: subscription.category || "其他",
    platform: subscription.platform || "其他",
    merchant: subscription.name,
    // A recurring charge is due for the whole billing day. Its ledger date
    // must not fall in the future until noon while the expense is already shown.
    date: `${dateText(dueDate).slice(0, 10)} 00:00:00`,
    description: `周期支出自动记账 · ${subscription.name}`,
    orderId: `subscription:${subscription.id}:${month}`,
    paymentMethod: subscription.paymentMethod || null,
    status: "SUCCESS",
    loanId: null,
    remarkCategory: null,
    createdAt: generatedAt,
    updatedAt: generatedAt,
  };
}

/**
 * 为当前账本补记所有已经到期的启用订阅。确定性 ID 让重复触发变得幂等，
 * 因此应用启动、后台恢复和设置页打开都可以安全调用。
 */
export async function syncDueSubscriptionTransactions(
  repository: DataRepository,
  accountId: string,
  user: User,
  subscriptions: Subscription[],
  currentDate = new Date(),
) {
  const candidates: Transaction[] = [];
  const currentDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 23, 59, 59, 999);

  for (const subscription of subscriptions) {
    if (!subscription.isActive || subscription.accountId !== accountId || subscription.amount <= 0) continue;
    const start = parseDate(subscription.startDate);
    if (!start) continue;
    const months = Math.max(0, monthDistance(new Date(start.getFullYear(), start.getMonth(), 1), new Date(currentDay.getFullYear(), currentDay.getMonth(), 1)));
    for (let offset = 0; offset <= months; offset += 1) {
      const target = new Date(start.getFullYear(), start.getMonth() + offset, 1);
      const dueDate = subscriptionDueDate(subscription, target.getFullYear(), target.getMonth() + 1);
      if (dueDate < start || dueDate > currentDay) continue;
      candidates.push(buildSubscriptionTransaction(subscription, user, dueDate));
    }
  }

  if (!candidates.length) return 0;
  const existing = await repository.getTransactions(accountId, 1, 100_000);
  const existingIds = new Set(existing.map((item) => item.id));
  const existingOrderIds = new Set(existing.map((item) => item.orderId).filter((item): item is string => Boolean(item)));
  let created = 0;
  for (const transaction of candidates) {
    if (existingIds.has(transaction.id) || (transaction.orderId ? existingOrderIds.has(transaction.orderId) : false)) continue;
    await repository.saveTransaction(transaction);
    existingIds.add(transaction.id);
    if (transaction.orderId) existingOrderIds.add(transaction.orderId);
    created += 1;
  }
  return created;
}
