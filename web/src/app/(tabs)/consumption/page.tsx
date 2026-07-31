"use client";

import { useEffect, useMemo, useState } from "react";
import { PageTopBar } from "@/components/stark/PageTopBar";
import { ConsumptionCharts } from "@/components/stark/ConsumptionCharts";
import { PageSkeleton } from "@/components/stark/Skeleton";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { buildHomeSummary } from "@/lib/stark/dashboard/summary";
import { formatMoney } from "@/lib/stark/utils/format";
import type { Transaction } from "@/lib/stark/models";

const repo = new DataModeManager().getRepository();

function monthKey(value: string) {
  return value.slice(0, 7);
}

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
    const currentMonth = monthKey(new Date().toISOString().slice(0, 10));
    const list = transactions.filter((item) => monthKey(item.date) === currentMonth);
    return {
      expense: list.filter((item) => item.type === "EXPENSE").reduce((sum, item) => sum + item.amount, 0),
      income: list.filter((item) => item.type === "INCOME").reduce((sum, item) => sum + item.amount, 0),
      count: list.length,
    };
  }, [transactions]);

  const platformSummary = useMemo(() => {
    const currentMonth = monthKey(new Date().toISOString().slice(0, 10));
    const list = transactions.filter((item) => monthKey(item.date) === currentMonth);
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

  if (loading) {
    return <PageSkeleton title="消费" cards={3} />;
  }

  return (
    <div className="page-stack">
      <PageTopBar title="消费" />

      <section className="home-card consumption-summary-card">
        <div className="cs-body">
          <div className="cs-card cs-left">
            <div className="page-hero-label">本月流水</div>
            <div className="page-hero-value">¥ {formatMoney(monthSummary.expense)}</div>
            <div className="page-hero-sub">收入 ¥ {formatMoney(monthSummary.income)} · 共 {monthSummary.count} 笔</div>
          </div>
          <div className="cs-right">
            <div className="cs-row cs-wechat">
              <div className="cs-row-label">微信</div>
              <div className="cs-row-value">¥ {formatMoney(platformSummary.wechat.expense)}</div>
              <div className="cs-row-sub">{platformSummary.wechat.count} 笔</div>
            </div>
            <div className="cs-row cs-alipay">
              <div className="cs-row-label">支付宝</div>
              <div className="cs-row-value">¥ {formatMoney(platformSummary.alipay.expense)}</div>
              <div className="cs-row-sub">{platformSummary.alipay.count} 笔</div>
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
