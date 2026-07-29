"use client";

import { useEffect, useMemo, useState } from "react";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { nowText, formatMoney } from "@/lib/stark/utils/format";
import type { Transaction, TransactionType } from "@/lib/stark/models";

const repo = new DataModeManager().getRepository();

const expenseCategories = ["餐饮", "购物", "交通", "住房", "娱乐", "医疗", "教育", "其他"];
const incomeCategories = ["工资", "奖金", "理财", "其他"];
const transferCategories = ["转账"];
const platforms = ["支付宝", "微信", "银行卡", "现金", "其他"];

function Section(props: React.PropsWithChildren<{ title?: string }>) {
  return (
    <section style={{ background: "#fff", borderRadius: 22, padding: 16, border: "1px solid #edf1f5" }}>
      {props.title ? <div style={{ marginBottom: 12, fontWeight: 700 }}>{props.title}</div> : null}
      {props.children}
    </section>
  );
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
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ textAlign: "center", paddingTop: 4, fontSize: 22, fontWeight: 700 }}>消费</div>

      <Section>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 8 }}>
          {[
            ["EXPENSE", "支出"],
            ["INCOME", "收入"],
            ["TRANSFER", "转账"],
          ].map(([value, label]) => {
            const active = type === value;
            return (
              <button
                key={value}
                onClick={() => setType(value as TransactionType)}
                style={{
                  border: 0,
                  borderRadius: 999,
                  padding: "10px 0",
                  background: active ? "#2f7cff" : "#eef2f7",
                  color: active ? "#fff" : "#6b7280",
                  fontWeight: active ? 700 : 500,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="金额">
        <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>¥ {amount || "0.00"}</div>
        <input
          value={amount}
          onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ""))}
          placeholder="输入金额"
          style={{ width: "100%", borderRadius: 16, border: "1px solid #e5e7eb", padding: 14, background: "#f8fafc" }}
        />
      </Section>

      <Section title="分类">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 8 }}>
          {categories.map((item) => {
            const active = category === item;
            return (
              <button
                key={item}
                onClick={() => setCategory(item)}
                style={{
                  borderRadius: 16,
                  border: active ? "1px solid #2f7cff" : "1px solid #e5e7eb",
                  background: active ? "#eef4ff" : "#fff",
                  padding: "10px 6px",
                  color: active ? "#2f7cff" : "#374151",
                }}
              >
                {item}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="账户">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {platforms.map((item) => {
            const active = platform === item;
            return (
              <button
                key={item}
                onClick={() => setPlatform(item)}
                style={{
                  borderRadius: 999,
                  border: active ? "1px solid #2f7cff" : "1px solid #e5e7eb",
                  background: active ? "#eef4ff" : "#fff",
                  padding: "8px 12px",
                  color: active ? "#2f7cff" : "#6b7280",
                }}
              >
                {item}
              </button>
            );
          })}
        </div>
      </Section>

      <Section title="时间与备注">
        <div style={{ display: "grid", gap: 10 }}>
          <input value={date} onChange={(event) => setDate(event.target.value)} style={{ width: "100%", borderRadius: 16, border: "1px solid #e5e7eb", padding: 14, background: "#f8fafc" }} />
          <input value={merchant} onChange={(event) => setMerchant(event.target.value)} placeholder="商户" style={{ width: "100%", borderRadius: 16, border: "1px solid #e5e7eb", padding: 14, background: "#f8fafc" }} />
          <input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="备注" style={{ width: "100%", borderRadius: 16, border: "1px solid #e5e7eb", padding: 14, background: "#f8fafc" }} />
        </div>
      </Section>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <button onClick={() => { setAmount(""); setMerchant(""); setDescription(""); }} style={{ border: 0, borderRadius: 18, background: "#fff", padding: "14px 0", fontWeight: 700 }}>再记一笔</button>
        <button onClick={() => void saveTransaction()} style={{ border: 0, borderRadius: 18, background: "#2f7cff", color: "#fff", padding: "14px 0", fontWeight: 700 }}>保存</button>
      </div>

      <Section title="最近流水">
        <div style={{ display: "grid", gap: 10 }}>
          {transactions.map((item) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{item.category}</div>
                <div style={{ color: "#6b7280", fontSize: 12 }}>{item.merchant || item.description || item.platform}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ color: item.type === "INCOME" ? "#20b26b" : item.type === "EXPENSE" ? "#ff5d5d" : "#2f7cff", fontWeight: 700 }}>
                  {item.type === "INCOME" ? "+" : item.type === "EXPENSE" ? "-" : "±"}¥ {formatMoney(item.amount)}
                </div>
                <div style={{ color: "#6b7280", fontSize: 12 }}>{item.date}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
