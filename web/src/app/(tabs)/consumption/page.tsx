"use client";

import { useEffect, useMemo, useState } from "react";
import { PageTopBar } from "@/components/stark/PageTopBar";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { nowText, formatMoney } from "@/lib/stark/utils/format";
import type { Transaction, TransactionType } from "@/lib/stark/models";

const repo = new DataModeManager().getRepository();

const expenseCategories = ["餐饮", "购物", "交通", "住房", "娱乐", "医疗", "教育", "其他"];
const incomeCategories = ["工资", "奖金", "理财", "其他"];
const transferCategories = ["转账"];
const platforms = ["支付宝", "微信", "银行卡", "现金", "其他"];

function monthKey(value: string) {
  return value.slice(0, 7);
}

export default function ConsumptionPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("餐饮");
  const [platform, setPlatform] = useState("支付宝");
  const [merchant, setMerchant] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(nowText().slice(0, 16));

  const categories = useMemo(() => {
    if (type === "INCOME") return incomeCategories;
    if (type === "TRANSFER") return transferCategories;
    return expenseCategories;
  }, [type]);

  const monthSummary = useMemo(() => {
    const currentMonth = monthKey(nowText());
    const list = transactions.filter((item) => monthKey(item.date) === currentMonth);
    return {
      expense: list.filter((item) => item.type === "EXPENSE").reduce((sum, item) => sum + item.amount, 0),
      income: list.filter((item) => item.type === "INCOME").reduce((sum, item) => sum + item.amount, 0),
      count: list.length,
    };
  }, [transactions]);

  const reload = () => {
    void repo.getTransactions("default", 1, 200).then(setTransactions);
  };

  useEffect(() => {
    reload();
  }, []);

  useEffect(() => {
    if (type === "TRANSFER") setCategory("转账");
    if (type !== "TRANSFER" && category === "转账") setCategory(type === "INCOME" ? "工资" : "餐饮");
    if (type === "INCOME" && !incomeCategories.includes(category)) setCategory("工资");
    if (type === "EXPENSE" && !expenseCategories.includes(category)) setCategory("餐饮");
  }, [type, category]);

  async function saveTransaction() {
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0) return;
    const now = nowText();
    await repo.saveTransaction({
      id: crypto.randomUUID(),
      userId: "local-user",
      accountId: "default",
      amount: value,
      type,
      category,
      platform,
      merchant: merchant || null,
      date: date.length === 16 ? `${date}:00` : date,
      description: description || null,
      orderId: null,
      paymentMethod: null,
      status: null,
      loanId: null,
      createdAt: now,
      updatedAt: now,
    });
    setAmount("");
    setMerchant("");
    setDescription("");
    setDate(nowText().slice(0, 16));
    if (type !== "TRANSFER") setCategory(type === "INCOME" ? "工资" : "餐饮");
    reload();
  }

  return (
    <div className="page-stack">
      <PageTopBar title="消费" />

      <section className="home-card page-hero">
        <div className="page-hero-label">本月流水</div>
        <div className="page-hero-value">¥ {formatMoney(monthSummary.expense)}</div>
        <div className="page-hero-sub">收入 ¥ {formatMoney(monthSummary.income)} · 共 {monthSummary.count} 笔</div>
      </section>

      <section className="home-card page-card">
        <div className="segment-group">
          {[
            ["EXPENSE", "支出"],
            ["INCOME", "收入"],
            ["TRANSFER", "转账"],
          ].map(([value, label]) => (
            <button key={value} type="button" onClick={() => setType(value as TransactionType)} className={type === value ? "segment-button active" : "segment-button"}>
              {label}
            </button>
          ))}
        </div>
      </section>

      <section className="home-card page-card">
        <h2 className="page-card-title">金额</h2>
        <div className="amount-display">¥ {amount || "0.00"}</div>
        <input className="app-input" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ""))} placeholder="输入金额" />
      </section>

      <section className="home-card page-card">
        <h2 className="page-card-title">分类</h2>
        <div className="category-grid">
          {categories.map((item) => (
            <button key={item} type="button" onClick={() => setCategory(item)} className={category === item ? "category-button active" : "category-button"}>
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="home-card page-card">
        <h2 className="page-card-title">账户</h2>
        <div className="pill-group">
          {platforms.map((item) => (
            <button key={item} type="button" onClick={() => setPlatform(item)} className={platform === item ? "pill-button active" : "pill-button"}>
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="home-card page-card">
        <h2 className="page-card-title">时间与备注</h2>
        <div className="app-field-grid">
          <input className="app-input" value={date} onChange={(event) => setDate(event.target.value)} />
          <input className="app-input" value={merchant} onChange={(event) => setMerchant(event.target.value)} placeholder="商户" />
          <input className="app-input" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="备注" />
        </div>
      </section>

      <div className="action-grid">
        <button type="button" className="secondary-button" onClick={() => { setAmount(""); setMerchant(""); setDescription(""); }}>
          再记一笔
        </button>
        <button type="button" className="primary-button" onClick={() => void saveTransaction()}>
          保存
        </button>
      </div>

      <section className="home-card page-card">
        <h2 className="page-card-title">最近流水</h2>
        <div className="app-list">
          {transactions.map((item) => (
            <div key={item.id} className="app-list-row">
              <div className="app-list-main">
                <div className="app-list-title">{item.category}</div>
                <div className="app-list-subtitle">{item.merchant || item.description || item.platform}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className={item.type === "INCOME" ? "app-list-value positive" : item.type === "EXPENSE" ? "app-list-value negative" : "app-list-value"}>
                  {item.type === "INCOME" ? "+" : item.type === "EXPENSE" ? "-" : "±"}¥ {formatMoney(item.amount)}
                </div>
                <div className="app-list-subtitle">{item.date}</div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
