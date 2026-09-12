"use client";

import { useMemo } from "react";
import { buildRemarkedExpenseSummary } from "@/lib/stark/dashboard/remark-summary";
import { formatMoney } from "@/lib/stark/utils/format";
import { translateValue, type AppLocale } from "@/lib/stark/i18n";
import type { Transaction } from "@/lib/stark/models";

export function RemarkedExpenseCard({ transactions, locale }: { transactions: Transaction[]; locale: AppLocale }) {
  const summary = useMemo(() => buildRemarkedExpenseSummary(transactions), [transactions]);
  if (!summary.count) return null;

  return (
    <section className="remark-consumption-card" aria-label={locale === "en-US" ? "Categorized bill spending" : "账单归类消费"}>
      <header className="remark-consumption-head">
        <div>
          <h2>{locale === "en-US" ? "Categorized bill spending" : "账单归类消费"}</h2>
        </div>
        <div className="remark-consumption-total">
          <strong>¥ {formatMoney(summary.amount)}</strong>
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
    </section>
  );
}
