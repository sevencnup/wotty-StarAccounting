"use client";

import { useEffect, useMemo, useState } from "react";
import type { Transaction } from "@/lib/stark/models";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { getCurrentAccountId } from "@/lib/stark/storage/local-config";
import { nowText } from "@/lib/stark/utils/format";
import { createId } from "@/lib/stark/utils/id";

const repository = new DataModeManager().getRepository();
const platforms = ["支付宝", "微信", "银行卡", "现金", "其他"] as const;
type ReconciliationPlatform = (typeof platforms)[number];

function currentMonthText() {
  return new Date().toISOString().slice(0, 7);
}

function monthEndDate(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  return `${year}-${String(monthNumber).padStart(2, "0")}-${String(new Date(year, monthNumber, 0).getDate()).padStart(2, "0")}`;
}

function moneyValue(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function calculateLedgerBalance(transactions: Transaction[], platform: string, month: string, openingBalance: number) {
  return transactions
    .filter((item) => item.platform.trim() === platform && item.date.slice(0, 7) === month)
    .reduce((balance, item) => {
      if (item.type === "INCOME") return balance + item.amount;
      if (item.type === "EXPENSE" || item.type === "REPAYMENT") return balance - item.amount;
      return balance;
    }, openingBalance);
}

async function loadAllTransactions(accountId: string) {
  const all: Transaction[] = [];
  const pageSize = 500;
  for (let page = 1; page <= 1000; page += 1) {
    const batch = await repository.getTransactions(accountId, page, pageSize);
    all.push(...batch);
    if (batch.length < pageSize) break;
  }
  return all;
}

export function AccountReconciliationSheet({ onTransactionSaved }: { onTransactionSaved?: () => void }) {
  const [platform, setPlatform] = useState<ReconciliationPlatform>("支付宝");
  const [reconciliationMonth, setReconciliationMonth] = useState(currentMonthText);
  const [openingBalance, setOpeningBalance] = useState("0");
  const [actualBalance, setActualBalance] = useState("");
  const [reason, setReason] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    void loadAllTransactions(getCurrentAccountId())
      .then((items) => {
        if (!active) return;
        setTransactions(items);
        setLoadError(false);
      })
      .catch(() => {
        if (active) setLoadError(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const opening = moneyValue(openingBalance);
  const actual = Number(actualBalance);
  const hasActual = actualBalance.trim() !== "" && Number.isFinite(actual);
  const ledgerBalance = useMemo(
    () => calculateLedgerBalance(transactions, platform, reconciliationMonth, opening),
    [transactions, platform, reconciliationMonth, opening],
  );
  const difference = hasActual ? actual - ledgerBalance : 0;
  const matchedTransactions = useMemo(
    () => transactions.filter((item) => item.platform.trim() === platform && item.date.slice(0, 7) === reconciliationMonth),
    [transactions, platform, reconciliationMonth],
  );
  const needsCorrection = hasActual && Math.abs(difference) >= 0.005;

  async function createCorrection() {
    if (!needsCorrection || saving) return;
    setSaving(true);
    setMessage("正在生成余额校正流水...");
    const now = nowText();
    const accountId = getCurrentAccountId();
    const correction: Transaction = {
      id: createId("reconciliation"),
      userId: "local-user",
      accountId,
      amount: Math.abs(difference),
      type: difference > 0 ? "INCOME" : "EXPENSE",
      category: "余额校正",
      platform,
      merchant: "余额校正",
      date: `${monthEndDate(reconciliationMonth)}T23:59:59`,
      description: reason.trim() ? `余额对账：${reason.trim()}` : "余额对账校正",
      orderId: null,
      paymentMethod: null,
      status: "COMPLETED",
      loanId: null,
      remarkCategory: null,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await repository.saveTransaction(correction);
      setTransactions((current) => [correction, ...current]);
      setMessage(`已生成 ${difference > 0 ? "收入" : "支出"}校正流水 ¥ ${Math.abs(difference).toFixed(2)}，账面余额已同步。`);
      window.dispatchEvent(new Event("stark:transaction-saved"));
      onTransactionSaved?.();
    } catch {
      setMessage("校正流水生成失败，请检查当前数据源后重试。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="account-reconciliation-sheet">
      <p className="settings-sheet-note">按月核对指定资金账户：月初余额加上本月流水，和月末实际余额比较。差额只会生成一笔可追溯的“余额校正”流水，不会修改原账单。</p>

      <section className="reconciliation-section">
        <div className="reconciliation-section-heading">
          <div><strong>选择资金账户</strong><small>按账单中的支付账户统计</small></div>
          <span>{loading ? "读取中" : `${matchedTransactions.length} 笔纳入计算`}</span>
        </div>
        <div className="reconciliation-platforms">
          {platforms.map((item) => (
            <button key={item} type="button" className={platform === item ? "active" : ""} onClick={() => { setPlatform(item); setMessage(""); }}>
              {item}
            </button>
          ))}
        </div>
      </section>

      <section className="reconciliation-section reconciliation-fields">
        <label><span>对账月份</span><input type="month" value={reconciliationMonth} onChange={(event) => { setReconciliationMonth(event.target.value); setMessage(""); }} /></label>
        <label><span>本月月初余额</span><div className="reconciliation-money-input"><b>¥</b><input inputMode="decimal" value={openingBalance} onChange={(event) => setOpeningBalance(event.target.value.replace(/[^0-9.-]/g, ""))} placeholder="上月月末实际余额" /></div></label>
        <label><span>本月月末实际余额</span><div className="reconciliation-money-input actual"><b>¥</b><input inputMode="decimal" value={actualBalance} onChange={(event) => { setActualBalance(event.target.value.replace(/[^0-9.-]/g, "")); setMessage(""); }} placeholder="输入银行卡 / 钱包中的月末余额" /></div></label>
        <label><span>校正原因（可选）</span><input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="例如：遗漏一笔现金消费、手续费" /></label>
      </section>

      <section className="reconciliation-result">
        <div className="reconciliation-result-heading"><strong>对账结果</strong><span className={hasActual ? (Math.abs(difference) < 0.005 ? "matched" : "unmatched") : "pending"}>{!hasActual ? "等待输入实际余额" : Math.abs(difference) < 0.005 ? "账目一致" : "存在差异"}</span></div>
        <div className="reconciliation-result-grid">
          <div><span>月末账面余额</span><strong>¥ {ledgerBalance.toFixed(2)}</strong></div>
          <div><span>月末实际余额</span><strong>{hasActual ? `¥ ${actual.toFixed(2)}` : "—"}</strong></div>
          <div className={hasActual && Math.abs(difference) >= 0.005 ? (difference > 0 ? "positive" : "negative") : ""}><span>差异</span><strong>{hasActual ? `${difference > 0 ? "+" : ""}¥ ${difference.toFixed(2)}` : "—"}</strong></div>
        </div>
        <p>{loadError ? "账单读取失败，请关闭后重试。" : hasActual && Math.abs(difference) < 0.005 ? "本月流水与月末实际余额一致，不需要生成校正。" : hasActual ? `月末实际余额比账面${difference > 0 ? "多" : "少"} ¥ ${Math.abs(difference).toFixed(2)}。` : "先输入本月月末实际余额，系统会自动计算差异。"}</p>
      </section>

      {message ? <div className={`reconciliation-message${message.startsWith("已生成") ? " success" : ""}`}>{message}</div> : null}
      <button type="button" className="settings-sheet-primary reconciliation-submit" disabled={!needsCorrection || saving || loading || loadError} onClick={() => void createCorrection()}>
        {saving ? "生成中..." : needsCorrection ? "生成余额校正流水" : hasActual ? "无需校正" : "输入实际余额后校正"}
      </button>
      <p className="settings-sheet-tip">校正流水会记在本月最后一天。转账暂不计入余额，避免同一笔资金在账户之间重复计算。</p>
    </div>
  );
}
