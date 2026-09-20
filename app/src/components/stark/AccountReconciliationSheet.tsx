"use client";

import { useEffect, useMemo, useState } from "react";
import type { Account, Transaction } from "@/lib/stark/models";
import { calculateLedgerCashflow, calculateOpeningBalanceForActual, earliestTransactionDate } from "@/lib/stark/ledger/balance";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { getCurrentAccountId } from "@/lib/stark/storage/local-config";
import { nowText } from "@/lib/stark/utils/format";

const repository = new DataModeManager().getRepository();

function todayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
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
  const [openingDate, setOpeningDate] = useState("");
  const [actualBalance, setActualBalance] = useState("");
  const [reason, setReason] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    const accountId = getCurrentAccountId();
    void Promise.all([loadAllTransactions(accountId), repository.getAccount(accountId)])
      .then(([items, currentAccount]) => {
        if (!active) return;
        setTransactions(items);
        setAccount(currentAccount);
        setOpeningDate((current) => current || currentAccount?.openingBalanceDate?.slice(0, 10) || earliestTransactionDate(items) || todayDate());
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

  const actual = Number(actualBalance);
  const hasActual = actualBalance.trim() !== "" && Number.isFinite(actual);
  const storedOpeningDate = account?.openingBalanceDate?.slice(0, 10) ?? "";
  const storedOpeningBalance = storedOpeningDate && storedOpeningDate === openingDate
    ? Number(account?.openingBalance ?? 0)
    : 0;
  const cashflow = useMemo(
    () => calculateLedgerCashflow(transactions, openingDate || null),
    [openingDate, transactions],
  );
  const bookBalance = storedOpeningBalance + cashflow.net;
  const difference = hasActual ? actual - bookBalance : 0;
  const needsCorrection = hasActual && Math.abs(difference) >= 0.005;
  const inferredOpeningBalance = hasActual
    ? calculateOpeningBalanceForActual(actual, transactions, openingDate || null)
    : 0;

  async function saveOpeningBalance() {
    if (!hasActual || !openingDate || saving || !account) return;
    setSaving(true);
    setMessage("正在保存期初余额...");
    const updatedAccount: Account = {
      ...account,
      openingBalance: inferredOpeningBalance,
      openingBalanceDate: `${openingDate}T00:00:00`,
      updatedAt: nowText(),
    };

    try {
      await repository.saveAccount(updatedAccount);
      setAccount(updatedAccount);
      setMessage(`已保存期初余额 ¥ ${inferredOpeningBalance.toFixed(2)}，账本余额已与实际余额对齐。${reason.trim() ? `（${reason.trim()}）` : ""}`);
      window.dispatchEvent(new Event("stark:account-saved"));
      onTransactionSaved?.();
    } catch {
      setMessage("期初余额保存失败，请检查当前数据源后重试。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="account-reconciliation-sheet">
      <p className="settings-sheet-note">首页的“本月结余”只表示当月收支净额；这里按期初余额加累计流水计算当前账本余额，再与银行卡、钱包和现金的实际总余额对账。</p>

      <section className="reconciliation-section">
        <div className="reconciliation-section-heading">
          <div><strong>账本累计范围</strong><small>期初日期当天的流水会计入累计变动，转账不会改变整个账本余额</small></div>
          <span>{loading ? "读取中" : `${cashflow.count} 笔纳入计算`}</span>
        </div>
      </section>

      <section className="reconciliation-section reconciliation-fields">
        <label><span>期初日期</span><input type="date" value={openingDate} onChange={(event) => { setOpeningDate(event.target.value); setMessage(""); }} /></label>
        <label><span>现有实际余额</span><div className="reconciliation-money-input actual"><b>¥</b><input inputMode="decimal" value={actualBalance} onChange={(event) => { setActualBalance(event.target.value.replace(/[^0-9.-]/g, "")); setMessage(""); }} placeholder="输入银行卡 / 钱包 / 现金合计" /></div></label>
        <label><span>对账说明（可选）</span><input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="例如：从旧账本迁移后首次对账" /></label>
      </section>

      <section className="reconciliation-cashflow" aria-label="累计账本流水">
        <div><span>累计收入</span><strong>+¥ {cashflow.income.toFixed(2)}</strong></div>
        <div><span>累计支出</span><strong>-¥ {cashflow.expense.toFixed(2)}</strong></div>
        <div><span>累计还款</span><strong>-¥ {cashflow.repayment.toFixed(2)}</strong></div>
      </section>

      <section className="reconciliation-result">
        <div className="reconciliation-result-heading"><strong>对账结果</strong><span className={hasActual ? (Math.abs(difference) < 0.005 ? "matched" : "unmatched") : "pending"}>{!hasActual ? "等待输入实际余额" : Math.abs(difference) < 0.005 ? "账目一致" : "需要调整期初余额"}</span></div>
        <div className="reconciliation-result-grid">
          <div><span>当前期初余额</span><strong>¥ {storedOpeningBalance.toFixed(2)}</strong></div>
          <div><span>累计净变动</span><strong>{cashflow.net < 0 ? "-" : ""}¥ {Math.abs(cashflow.net).toFixed(2)}</strong></div>
          <div><span>当前账面余额</span><strong>¥ {bookBalance.toFixed(2)}</strong></div>
          <div><span>现有实际余额</span><strong>{hasActual ? `¥ ${actual.toFixed(2)}` : "—"}</strong></div>
          <div className={hasActual && Math.abs(difference) >= 0.005 ? (difference > 0 ? "positive" : "negative") : ""}><span>差异</span><strong>{hasActual ? `${difference > 0 ? "+" : ""}¥ ${difference.toFixed(2)}` : "—"}</strong></div>
        </div>
        <p>{loadError ? "账单读取失败，请关闭后重试。" : hasActual && Math.abs(difference) < 0.005 ? "账本余额与实际余额一致，不需要调整。" : hasActual ? `实际余额比当前账面余额${difference > 0 ? "多" : "少"} ¥ ${Math.abs(difference).toFixed(2)}；保存后会调整期初余额，不会新增一笔收入或支出。` : "输入实际余额后，系统会反推期初余额。"}</p>
      </section>

      {message ? <div className={`reconciliation-message${message.startsWith("已保存") ? " success" : ""}`}>{message}</div> : null}
      <button type="button" className="settings-sheet-primary reconciliation-submit" disabled={!hasActual || !openingDate || saving || loading || loadError || !account} onClick={() => void saveOpeningBalance()}>
        {saving ? "保存中..." : needsCorrection ? "保存期初余额并完成对账" : hasActual ? "保存当前对账结果" : "输入实际余额后对账"}
      </button>
      <p className="settings-sheet-tip">对账不会生成“余额校正”收入/支出流水。保存的是账本期初余额；以后新增工资、额外收入和支出，会在此基础上继续累计。</p>
    </div>
  );
}
