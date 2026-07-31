"use client";

import { useEffect, useMemo, useState } from "react";
import { PageTopBar } from "@/components/stark/PageTopBar";
import { PageSkeleton } from "@/components/stark/Skeleton";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { formatMoney, nowText } from "@/lib/stark/utils/format";
import type { Loan } from "@/lib/stark/models";

const repo = new DataModeManager().getRepository();

function nextDueDateLabel(dueDay: number) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const targetMonth = dueDay >= now.getDate() ? month : month + 1;
  const targetDate = new Date(year, targetMonth, dueDay);
  const mm = String(targetDate.getMonth() + 1).padStart(2, "0");
  const dd = String(targetDate.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

export default function LoansPage() {
  const [list, setList] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [platform, setPlatform] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [remainingAmount, setRemainingAmount] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");

  const summary = useMemo(() => ({
    remaining: list.reduce((sum, item) => sum + item.remainingAmount, 0),
    monthly: list.reduce((sum, item) => sum + item.monthlyPayment, 0),
    active: list.length,
  }), [list]);

  const reload = () => void repo.getLoans("default").then(setList);

  useEffect(() => {
    void repo.getLoans("default").then((data) => {
      setList(data);
      setLoading(false);
    });
  }, []);

  async function saveLoan() {
    const now = nowText();
    await repo.saveLoan({
      id: crypto.randomUUID(),
      userId: "local-user",
      accountId: "default",
      platform: platform || "新贷款",
      totalAmount: Number(totalAmount) || 0,
      remainingAmount: Number(remainingAmount) || 0,
      periods: 12,
      paidPeriods: 0,
      monthlyPayment: Number(monthlyPayment) || 0,
      dueDate: 20,
      status: "ACTIVE",
      matchKeywords: null,
      createdAt: now,
      updatedAt: now,
    });
    setPlatform("");
    setTotalAmount("");
    setRemainingAmount("");
    setMonthlyPayment("");
    reload();
  }

  if (loading) {
    return <PageSkeleton title="贷款" cards={3} />;
  }

  return (
    <div className="page-stack">
      <PageTopBar title="贷款" />

      <section className="home-card page-hero">
        <div className="page-hero-label">剩余贷款</div>
        <div className="page-hero-value">¥ {formatMoney(summary.remaining)}</div>
        <div className="page-hero-sub">月供 ¥ {formatMoney(summary.monthly)} · 共 {summary.active} 笔贷款</div>
      </section>

      <section className="home-card page-card">
        <h2 className="page-card-title">新增贷款</h2>
        <div className="app-field-grid">
          <input className="app-input" value={platform} onChange={(event) => setPlatform(event.target.value)} placeholder="贷款平台" />
          <input className="app-input" value={totalAmount} onChange={(event) => setTotalAmount(event.target.value.replace(/[^\d.]/g, ""))} placeholder="总金额" />
          <input className="app-input" value={remainingAmount} onChange={(event) => setRemainingAmount(event.target.value.replace(/[^\d.]/g, ""))} placeholder="剩余金额" />
          <input className="app-input" value={monthlyPayment} onChange={(event) => setMonthlyPayment(event.target.value.replace(/[^\d.]/g, ""))} placeholder="月供" />
          <button type="button" className="primary-button" onClick={() => void saveLoan()}>保存贷款</button>
        </div>
      </section>

      <section className="home-card page-card">
        <h2 className="page-card-title">贷款列表</h2>
        <div className="app-list">
          {list.map((item) => {
            const percent = item.totalAmount > 0 ? Math.min(100, ((item.totalAmount - item.remainingAmount) / item.totalAmount) * 100) : 0;
            return (
              <div key={item.id} className="app-list-row" style={{ display: "block" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <div className="app-list-main">
                    <div className="app-list-title">{item.platform}</div>
                    <div className="app-list-subtitle">
                      剩余 ¥ {formatMoney(item.remainingAmount)} / 总额 ¥ {formatMoney(item.totalAmount)}
                    </div>
                  </div>
                  <div className="app-list-value" style={{ color: "#59b995" }}>{Math.round(percent)}%</div>
                </div>
                <div className="mini-progress">
                  <span style={{ width: `${Math.max(4, Math.min(percent, 100))}%`, background: "linear-gradient(90deg,#73d2b3,#58bf9f)" }} />
                </div>
                <div className="app-list-subtitle" style={{ marginTop: 7 }}>
                  已还 {item.paidPeriods}/{item.periods} 期 · 下期 {nextDueDateLabel(item.dueDate)} 还 ¥ {formatMoney(item.monthlyPayment)}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
