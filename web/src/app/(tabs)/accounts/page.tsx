"use client";

import { useEffect, useMemo, useState } from "react";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { formatMoney, nowText } from "@/lib/stark/utils/format";
import type { Asset, AssetType } from "@/lib/stark/models";

const repo = new DataModeManager().getRepository();
const assetTypes: AssetType[] = ["CASH", "BANK_CARD", "ALIPAY", "WECHAT", "INVESTMENT", "OTHER"];

function Card(props: React.PropsWithChildren<{ title?: string }>) {
  return <section style={{ background: "#fff", borderRadius: 22, padding: 16, border: "1px solid #edf1f5" }}>{props.title ? <div style={{ marginBottom: 12, fontWeight: 700 }}>{props.title}</div> : null}{props.children}</section>;
}

export default function AccountsPage() {
  const [list, setList] = useState<Asset[]>([]);
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [type, setType] = useState<AssetType>("ALIPAY");

  const total = useMemo(() => list.reduce((sum, item) => sum + item.balance, 0), [list]);

  const reload = () => void repo.getAssets("default").then(setList);

  useEffect(() => {
    reload();
  }, []);

  async function saveAsset() {
    const now = nowText();
    await repo.saveAsset({
      id: crypto.randomUUID(),
      userId: "local-user",
      accountId: "default",
      name: name || "新账户",
      type,
      balance: Number(balance) || 0,
      currency: "CNY",
      createdAt: now,
      updatedAt: now,
    });
    setName("");
    setBalance("");
    setType("ALIPAY");
    reload();
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ textAlign: "center", paddingTop: 4, fontSize: 22, fontWeight: 700 }}>账户</div>
      <Card>
        <div style={{ background: "linear-gradient(135deg,#2f7cff,#6ba8ff)", color: "#fff", borderRadius: 22, padding: 18 }}>
          <div style={{ fontSize: 14, opacity: 0.92 }}>账户总资产</div>
          <div style={{ marginTop: 8, fontSize: 30, fontWeight: 700 }}>¥ {formatMoney(total)}</div>
        </div>
      </Card>
      <Card title="新增账户">
        <div style={{ display: "grid", gap: 10 }}>
          <input value={name} onChange={(event) => setName(event.target.value)} placeholder="账户名称" style={{ width: "100%", borderRadius: 16, border: "1px solid #e5e7eb", padding: 14, background: "#f8fafc" }} />
          <select value={type} onChange={(event) => setType(event.target.value as AssetType)} style={{ width: "100%", borderRadius: 16, border: "1px solid #e5e7eb", padding: 14, background: "#f8fafc" }}>
            {assetTypes.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
          <input value={balance} onChange={(event) => setBalance(event.target.value.replace(/[^\d.]/g, ""))} placeholder="余额" style={{ width: "100%", borderRadius: 16, border: "1px solid #e5e7eb", padding: 14, background: "#f8fafc" }} />
          <button onClick={() => void saveAsset()} style={{ border: 0, borderRadius: 18, background: "#2f7cff", color: "#fff", padding: "14px 0", fontWeight: 700 }}>保存账户</button>
        </div>
      </Card>
      <Card title="资产账户">
        <div style={{ display: "grid", gap: 10 }}>
          {list.map((item) => (
            <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: 18, background: "#f8fafc", padding: 14 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                <div style={{ color: "#6b7280", fontSize: 12 }}>{item.type}</div>
              </div>
              <div style={{ color: "#2f7cff", fontWeight: 700 }}>¥ {formatMoney(item.balance)}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
