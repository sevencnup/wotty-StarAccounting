"use client";

import { useEffect, useMemo, useState } from "react";
import type { Account, Transaction } from "@/lib/stark/models";
import { calculateLedgerCashflow } from "@/lib/stark/ledger/balance";
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

export function AccountReconciliationSheet() {
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
        // Default to today; the oldest imported transaction is not a reliable
        // opening date when historical statements may be incomplete.
        setOpeningDate((current) => current || currentAccount?.openingBalanceDate?.slice(0, 10) || todayDate());
        setActualBalance((current) => current || (currentAccount?.openingBalanceDate ? String(currentAccount.openingBalance ?? "") : ""));
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
  const projectedBalance = hasActual ? actual + cashflow.net : bookBalance;
  const inferredOpeningBalance = actual;

  async function saveOpeningBalance() {
    if (!hasActual || !openingDate || saving || !account) return;
    setSaving(true);
    setMessage("正在保存余额基准...");
    const updatedAccount: Account = {
      ...account,
      openingBalance: inferredOpeningBalance,
      openingBalanceDate: `${openingDate}T00:00:00`,
      updatedAt: nowText(),
    };

    try {
      await repository.saveAccount(updatedAccount);
      setAccount(updatedAccount);
      setMessage(`已保存余额基准 ¥ ${inferredOpeningBalance.toFixed(2)}，系统将从 ${openingDate} 起按后续真实流水累计。${reason.trim() ? `（${reason.trim()}）` : ""}`);
      window.dispatchEvent(new Event("stark:account-saved"));
    } catch {
      setMessage("余额基准保存失败，请检查当前数据源后重试。");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="account-reconciliation-sheet">
      <p className="settings-sheet-note">若历史账单不完整，可在一个你确认无误的时点保存实际余额。它是余额基准，不会新增或伪造收入、支出流水；首页只从该时点之后的真实流水继续累计。</p>

      <section className="reconciliation-section">
        <div className="reconciliation-section-heading">
          <div><strong>余额基准日期</strong><small>基准日期当天 00:00 起的流水会继续累计；转账不会改变整个账本余额</small></div>
          <span>{loading ? "读取中" : `${cashflow.count} 笔纳入计算`}</span>
        </div>
      </section>

      <section className="reconciliation-section reconciliation-fields">
        <label><span>余额基准日期</span><input type="date" value={openingDate} onChange={(event) => { setOpeningDate(event.target.value); setMessage(""); }} /></label>
        <label><span>该日 00:00 的实际余额</span><div className="reconciliation-money-input actual"><b>¥</b><input inputMode="decimal" value={actualBalance} onChange={(event) => { setActualBalance(event.target.value.replace(/[^0-9.-]/g, "")); setMessage(""); }} placeholder="例如：发工资前的账户余额" /></div></label>
        <label><span>说明（可选）</span><input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="例如：9 月 15 日发工资前余额" /></label>
      </section>

      <section className="reconciliation-cashflow" aria-label="累计账本流水">
        <div><span>累计收入</span><strong>+¥ {cashflow.income.toFixed(2)}</strong></div>
        <div><span>累计支出</span><strong>-¥ {cashflow.expense.toFixed(2)}</strong></div>
        <div><span>累计还款</span><strong>-¥ {cashflow.repayment.toFixed(2)}</strong></div>
      </section>

      <section className="reconciliation-result">
        <div className="reconciliation-result-heading"><strong>余额基准</strong><span className={hasActual ? "matched" : "pending"}>{!hasActual ? "等待输入实际余额" : "可保存为基准"}</span></div>
        <div className="reconciliation-result-grid">
          <div><span>已保存基准</span><strong>{storedOpeningDate ? `¥ ${storedOpeningBalance.toFixed(2)}` : "—"}</strong></div>
          <div><span>基准后净变动</span><strong>{cashflow.net < 0 ? "-" : ""}¥ {Math.abs(cashflow.net).toFixed(2)}</strong></div>
          <div><span>预计当前余额</span><strong>¥ {projectedBalance.toFixed(2)}</strong></div>
          <div><span>本次输入基准</span><strong>{hasActual ? `¥ ${actual.toFixed(2)}` : "—"}</strong></div>
          <div><span>累计记账笔数</span><strong>{cashflow.count}</strong></div>
        </div>
        <p>{loadError ? "账单读取失败，请关闭后重试。" : hasActual ? `保存后将把 ¥ ${actual.toFixed(2)} 作为 ${openingDate} 00:00 的余额基准。早于该日期的流水不再用于反推余额，之后的真实流水仍会全部累计。` : "输入一个已确认日期的实际余额后，可作为后续余额计算基准。"}</p>
      </section>

      {message ? <div className={`reconciliation-message${message.startsWith("已保存") ? " success" : ""}`}>{message}</div> : null}
      <button type="button" className="settings-sheet-primary reconciliation-submit" disabled={!hasActual || !openingDate || saving || loading || loadError || !account} onClick={() => void saveOpeningBalance()}>
        {saving ? "保存中..." : hasActual ? "保存余额基准" : "输入实际余额后保存"}
      </button>
      <p className="settings-sheet-tip">保存不会生成“余额校正”收入或支出流水。以后新增工资、消费、还款和实际储蓄，都会在该余额基准上继续累计。</p>
    </div>
  );
}
