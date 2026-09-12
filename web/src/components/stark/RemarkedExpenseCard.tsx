"use client";

import { useMemo } from "react";
import { buildRemarkedExpenseSummary } from "@/lib/stark/dashboard/remark-summary";
import { categoryIconSrc } from "@/lib/stark/utils/category-icon";
import { formatMoney } from "@/lib/stark/utils/format";
import { formatCount, translateValue, type AppLocale } from "@/lib/stark/i18n";
import type { Transaction } from "@/lib/stark/models";

function transactionTimeLabel(date: string) {
  const parsed = new Date(date);
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");
  return `${month}-${day}`;
}

function sourceLabel(type: Transaction["type"], locale: AppLocale) {
  if (type === "TRANSFER") return locale === "en-US" ? "Transfer recategorized" : "转账归类";
  if (type === "REPAYMENT") return locale === "en-US" ? "Repayment recategorized" : "还款归类";
  return locale === "en-US" ? "Expense recategorized" : "支出归类";
}

export function RemarkedExpenseCard({ transactions, locale }: { transactions: Transaction[]; locale: AppLocale }) {
  const summary = useMemo(() => buildRemarkedExpenseSummary(transactions), [transactions]);
  if (!summary.count) return null;

  return (
    <section className="remark-consumption-card" aria-label={locale === "en-US" ? "Categorized bill spending" : "账单归类消费"}>
      <header className="remark-consumption-head">
        <div>
          <span>{locale === "en-US" ? "Categorized bills" : "已归类账单"}</span>
          <h2>{locale === "en-US" ? "Categorized bill spending" : "账单归类消费"}</h2>
        </div>
        <div className="remark-consumption-total">
          <strong>¥ {formatMoney(summary.amount)}</strong>
          <small>{formatCount(summary.count, "transactions", locale)}</small>
        </div>
      </header>

      <div className="remark-consumption-categories" aria-label={locale === "en-US" ? "Categorized spending categories" : "归类消费分类"}>
        {summary.categories.map((item) => (
          <span key={item.category}>
            {translateValue(item.category, locale)}
            <em>¥ {formatMoney(item.amount)}</em>
          </span>
        ))}
      </div>

      <div className="remark-consumption-list">
        {summary.transactions.map((item) => (
          <div key={item.id} className="remark-consumption-row">
            <span className="remark-consumption-icon"><img src={categoryIconSrc({ ...item, category: item.remarkCategory || item.category })} alt="" /></span>
            <span className="remark-consumption-copy">
              <strong>{translateValue(item.remarkCategory || item.category, locale)}</strong>
              <small>{item.merchant || item.description || translateValue(item.platform, locale)}</small>
            </span>
            <span className="remark-consumption-origin">{sourceLabel(item.type, locale)}</span>
            <time>{transactionTimeLabel(item.date)}</time>
            <strong className="remark-consumption-amount">-¥ {formatMoney(item.amount)}</strong>
          </div>
        ))}
      </div>
    </section>
  );
}
