"use client";

import { useEffect, useState } from "react";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { formatMoney, nowText } from "@/lib/stark/utils/format";
import type { Loan } from "@/lib/stark/models";

const repo = new DataModeManager().getRepository();

function Card(props: React.PropsWithChildren<{ title?: string }>) {
  return <section style={{ background: "#fff", borderRadius: 22, padding: 16, border: "1px solid #edf1f5" }}>{props.title ? <div style={{ marginBottom: 12, fontWeight: 700 }}>{props.title}</div> : null}{props.children}</section>;
}

export default function LoansPage() {
  const [list, setList] = useState<Loan[]>([]);
  const [platform, setPlatform] = useState("");
  const [totalAmount, setTotalAmount] = useState("");
  const [remainingAmount, setRemainingAmount] = useState("");
  const [monthlyPayment, setMonthlyPayment] = useState("");

  const reload = () => void repo.getLoans("default").then(setList);

  useEffect(() => {
    reload();
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

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ textAlign: "center", paddingTop: 4, fontSize: 22, fontWeight: 700 }}>贷款</div>
      <Card>
        <div style={{ background: "linear-gradient(135deg,#4c7fff,#8db0ff)", color: "#fff", borderRadius: 22, padding: 18 }}>
          <div style={{ fontSize: 14, opacity: 0.92 }}>剩余贷款</div>
          <div style={{ marginTop: 8, fontSize: 30, fontWeight: 700 }}>¥ {formatMoney(list.reduce((sum, item) => sum + item.remainingAmount, 0))}</div>
        </div>
      </Card>
      <Card title="新增贷款">
        <div style={{ display: "grid", gap: 10 }}>
          <input value={platform} onChange={(event) => setPlatform(event.target.value)} placeholder="贷款平台" style={{ width: "100%", borderRadius: 16, border: "1px solid #e5e7eb", padding: 14, background: "#f8fafc" }} />
          <input value={totalAmount} onChange={(event) => setTotalAmount(event.target.value.replace(/[^\d.]/g, ""))} placeholder="总金额" style={{ width: "100%", borderRadius: 16, border: "1px solid #e5e7eb", padding: 14, background: "#f8fafc" }} />
          <input value={remainingAmount} onChange={(event) => setRemainingAmount(event.target.value.replace(/[^\d.]/g, ""))} placeholder="剩余金额" style={{ width: "100%", borderRadius: 16, border: "1px solid #e5e7eb", padding: 14, background: "#f8fafc" }} />
          <input value={monthlyPayment} onChange={(event) => setMonthlyPayment(event.target.value.replace(/[^\d.]/g, ""))} placeholder="月供" style={{ width: "100%", borderRadius: 16, border: "1px solid #e5e7eb", padding: 14, background: "#f8fafc" }} />
          <button onClick={() => void saveLoan()} style={{ border: 0, borderRadius: 18, background: "#2f7cff", color: "#fff", padding: "14px 0", fontWeight: 700 }}>保存贷款</button>
        </div>
      </Card>
      <Card title="贷款列表">
        <div style={{ display: "grid", gap: 10 }}>
          {list.map((item) => {
            const percent = item.totalAmount > 0 ? Math.min(100, ((item.totalAmount - item.remainingAmount) / item.totalAmount) * 100) : 0;
            return (
              <div key={item.id} style={{ borderRadius: 18, background: "#f8fafc", padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <strong>{item.platform}</strong>
                  <span style={{ color: "#ff9f43", fontWeight: 700 }}>{percent.toFixed(0)}%</span>
                </div>
                <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 8 }}>剩余 ¥ {formatMoney(item.remainingAmount)} / 总额 ¥ {formatMoney(item.totalAmount)}</div>
                <div style={{ height: 8, borderRadius: 999, background: "#e5edfb", overflow: "hidden" }}>
                  <div style={{ width: `${percent}%`, height: "100%", background: "linear-gradient(90deg,#ffb24c,#ff8f3d)" }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
