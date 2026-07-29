"use client";

import { useEffect, useState } from "react";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { formatMoney, nowText } from "@/lib/stark/utils/format";
import type { SavingsGoal } from "@/lib/stark/models";

const repo = new DataModeManager().getRepository();

function Card(props: React.PropsWithChildren<{ title?: string }>) {
  return <section style={{ background: "#fff", borderRadius: 22, padding: 16, border: "1px solid #edf1f5" }}>{props.title ? <div style={{ marginBottom: 12, fontWeight: 700 }}>{props.title}</div> : null}{props.children}</section>;
}

export default function SavingsPage() {
  const [list, setList] = useState<SavingsGoal[]>([]);
  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  const reload = () => void repo.getSavingsGoals("default").then(setList);

  useEffect(() => {
    reload();
  }, []);

  async function saveGoal() {
    const now = nowText();
    await repo.saveSavingsGoal({
      id: crypto.randomUUID(),
      userId: "local-user",
      accountId: "default",
      name: name || "新储蓄计划",
      targetAmount: Number(targetAmount) || 0,
      currentAmount: Number(currentAmount) || 0,
      deadline: deadline || null,
      type: "LONG_TERM",
      status: "ACTIVE",
      depositType: "CASH",
      planConfig: null,
      createdAt: now,
      updatedAt: now,
    });
    setName("");
    setTargetAmount("");
    setCurrentAmount("");
    setDeadline("");
    reload();
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ textAlign: "center", paddingTop: 4, fontSize: 22, fontWeight: 700 }}>储蓄</div>
      <Card>
        <div style={{ background: "linear-gradient(135deg,#2f7cff,#7aa8ff)", color: "#fff", borderRadius: 22, padding: 18 }}>
          <div style={{ fontSize: 14, opacity: 0.92 }}>总储蓄</div>
          <div style={{ marginTop: 8, fontSize: 30, fontWeight: 700 }}>¥ {formatMoney(list.reduce((sum, item) => sum + item.currentAmount, 0))}</div>
        </div>
      </Card>
      <Card title="新建计划">
        <div style={{ display: "grid", gap: 10 }}>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="计划名称" style={{ width: "100%", borderRadius: 16, border: "1px solid #e5e7eb", padding: 14, background: "#f8fafc" }} />
          <input value={targetAmount} onChange={(event) => setTargetAmount(event.target.value.replace(/[^\d.]/g, ""))} placeholder="目标金额" style={{ width: "100%", borderRadius: 16, border: "1px solid #e5e7eb", padding: 14, background: "#f8fafc" }} />
          <input value={currentAmount} onChange={(event) => setCurrentAmount(event.target.value.replace(/[^\d.]/g, ""))} placeholder="当前金额" style={{ width: "100%", borderRadius: 16, border: "1px solid #e5e7eb", padding: 14, background: "#f8fafc" }} />
          <input value={deadline} onChange={(event) => setDeadline(event.target.value)} placeholder="截止日期 2026-12-31" style={{ width: "100%", borderRadius: 16, border: "1px solid #e5e7eb", padding: 14, background: "#f8fafc" }} />
          <button onClick={() => void saveGoal()} style={{ border: 0, borderRadius: 18, background: "#2f7cff", color: "#fff", padding: "14px 0", fontWeight: 700 }}>保存计划</button>
        </div>
      </Card>
      <Card title="储蓄计划">
        <div style={{ display: "grid", gap: 10 }}>
          {list.map((item) => {
            const percent = item.targetAmount > 0 ? Math.min(100, (item.currentAmount / item.targetAmount) * 100) : 0;
            return (
              <div key={item.id} style={{ borderRadius: 18, background: "#f8fafc", padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <strong>{item.name}</strong>
                  <span style={{ color: "#2f7cff", fontWeight: 700 }}>{percent.toFixed(0)}%</span>
                </div>
                <div style={{ color: "#6b7280", fontSize: 13, marginBottom: 8 }}>已存 ¥ {formatMoney(item.currentAmount)} / 目标 ¥ {formatMoney(item.targetAmount)}</div>
                <div style={{ height: 8, borderRadius: 999, background: "#e5edfb", overflow: "hidden" }}>
                  <div style={{ width: `${percent}%`, height: "100%", background: "linear-gradient(90deg,#2f7cff,#7aa8ff)" }} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
