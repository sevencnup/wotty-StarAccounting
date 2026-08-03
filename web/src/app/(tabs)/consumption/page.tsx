"use client";

import { useEffect, useMemo, useState } from "react";
import { PageTopBar } from "@/components/stark/PageTopBar";
import { ConsumptionCharts } from "@/components/stark/ConsumptionCharts";
import { PageSkeleton } from "@/components/stark/Skeleton";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { buildHomeSummary } from "@/lib/stark/dashboard/summary";
import { REPORTING_MONTH_KEY, formatMoney, monthKey, reportingMonthLabel } from "@/lib/stark/utils/format";
import type { Transaction } from "@/lib/stark/models";

const repo = new DataModeManager().getRepository();

function categoryIconSrc(item: Transaction) {
  const text = `${item.merchant || ""}${item.description || ""}${item.category}`;
  if (item.type === "INCOME") return "/category-icons/jiaoyi.png";
  if (text.includes("餐") || text.includes("咖啡")) return "/category-icons/canyin.png";
  if (text.includes("交") || text.includes("地铁")) return "/category-icons/jiaotong.png";
  if (text.includes("购") || text.includes("超市")) return "/category-icons/gouwu.png";
  if (text.includes("娱") || text.includes("电影")) return "/category-icons/yule.png";
  if (text.includes("生活") || text.includes("日用")) return "/category-icons/riyong.png";
  if (text.includes("医")) return "/category-icons/yiliao.png";
  if (text.includes("住")) return "/category-icons/zhufang.png";
  if (text.includes("旅")) return "/category-icons/lvxing.png";
  if (text.includes("美")) return "/category-icons/meirong.png";
  if (text.includes("宠")) return "/category-icons/chongwu.png";
  if (text.includes("服")) return "/category-icons/fuzhuang.png";
  if (text.includes("通")) return "/category-icons/tongxun.png";
  if (text.includes("运")) return "/category-icons/yundong.png";
  if (text.includes("教")) return "/category-icons/jiaoyu.png";
  return "/category-icons/qita.png";
}

function recentTimeLabel(dateStr: string) {
  const d = new Date(dateStr);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${mm}-${dd} ${hh}:${mi}`;
}

export default function ConsumptionPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void repo.getTransactions("default", 1, 200).then((data) => {
      setTransactions(data);
      setLoading(false);
    });
  }, []);

  const monthSummary = useMemo(() => {
    const list = transactions.filter((item) => monthKey(item.date) === REPORTING_MONTH_KEY);
    return {
      expense: list.filter((item) => item.type === "EXPENSE").reduce((sum, item) => sum + item.amount, 0),
      income: list.filter((item) => item.type === "INCOME").reduce((sum, item) => sum + item.amount, 0),
      count: list.length,
    };
  }, [transactions]);

  const platformSummary = useMemo(() => {
    const list = transactions.filter((item) => monthKey(item.date) === REPORTING_MONTH_KEY);
    const wechat = list.filter((item) => item.platform === "微信");
    const alipay = list.filter((item) => item.platform === "支付宝");
    const calc = (items: Transaction[]) => ({
      expense: items.filter((i) => i.type === "EXPENSE").reduce((s, i) => s + i.amount, 0),
      income: items.filter((i) => i.type === "INCOME").reduce((s, i) => s + i.amount, 0),
      count: items.length,
    });
    return { wechat: calc(wechat), alipay: calc(alipay) };
  }, [transactions]);

  const charts = useMemo(
    () => buildHomeSummary({ transactions, assets: [], budgets: [], loans: [], savingsGoals: [] }),
    [transactions],
  );

  const monthBalance = monthSummary.income - monthSummary.expense;

  if (loading) {
    return <PageSkeleton title="消费" cards={3} />;
  }

  return (
    <div className="page-stack consumption-page">
      <PageTopBar title="消费" />

      <section className="consumption-identity-hero">
        <div className="consumption-identity-head">
          <div>
            <span>{reportingMonthLabel()} · 消费脉搏</span>
            <h2>本月消费</h2>
          </div>
          <strong>{monthSummary.count} 笔流水</strong>
        </div>
        <div className="consumption-identity-main">
          <div className="consumption-total">
            <span>总支出</span>
            <strong>¥ {formatMoney(monthSummary.expense)}</strong>
            <p>
              本月收入 ¥ {formatMoney(monthSummary.income)}
              <em className={monthBalance >= 0 ? "positive" : "negative"}>
                结余 {monthBalance >= 0 ? "+" : "-"}¥ {formatMoney(Math.abs(monthBalance))}
              </em>
            </p>
          </div>
          <div className="consumption-channel-list">
            <div className="consumption-channel wechat">
              <span><i />微信支付</span>
              <strong>¥ {formatMoney(platformSummary.wechat.expense)}</strong>
              <small>{platformSummary.wechat.count} 笔</small>
            </div>
            <div className="consumption-channel alipay">
              <span><i />支付宝</span>
              <strong>¥ {formatMoney(platformSummary.alipay.expense)}</strong>
              <small>{platformSummary.alipay.count} 笔</small>
            </div>
          </div>
        </div>
      </section>

      <ConsumptionCharts trend={charts.trend} ratios={charts.ratios} transactions={transactions} />

      <section className="recent-card">
        <div className="recent-head">
          <h2>最近流水</h2>
        </div>
        <div className="recent-list">
          {transactions.map((item) => (
            <div key={item.id} className="recent-row">
              <span className="recent-icon">
                <img src={categoryIconSrc(item)} alt={item.category} />
              </span>
              <strong className="recent-title">{item.category}</strong>
              <span className="recent-category">{item.merchant || item.description || item.platform}</span>
              <span className="recent-time">{recentTimeLabel(item.date)}</span>
              <strong className={`recent-amount ${item.type === "INCOME" ? "income" : item.type === "EXPENSE" ? "expense" : "transfer"}`}>
                {item.type === "INCOME" ? "+¥ " : item.type === "EXPENSE" ? "-¥ " : "±¥ "}
                {formatMoney(item.amount)}
              </strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
