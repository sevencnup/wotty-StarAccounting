"use client";

import { useEffect, useMemo, useState } from "react";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { formatMoney, nowText } from "@/lib/stark/utils/format";
import { categoryIconSrc } from "@/lib/stark/utils/category-icon";
import { hasRemark, REMARK_SUGGESTIONS } from "@/lib/stark/dashboard/remark";
import type { Transaction } from "@/lib/stark/models";

const repo = new DataModeManager().getRepository();

type RemarkFilter = "TRANSFER" | "ALL";

function timeLabel(dateStr: string) {
  const d = new Date(dateStr);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

function amountText(tx: Transaction) {
  const sign = tx.type === "INCOME" ? "+¥ " : tx.type === "EXPENSE" ? "-¥ " : "±¥ ";
  return `${sign}${formatMoney(tx.amount)}`;
}

function RemarkCategoryEditor({
  initial,
  suggestions,
  onSave,
  onCancel,
}: {
  initial: string;
  suggestions: string[];
  onSave: (value: string) => void;
  onCancel: () => void;
}) {
  const [value, setValue] = useState(initial);

  return (
    <div className="remark-category-editor">
      <div className="remark-category-chips">
        {suggestions.map((item) => (
          <button key={item} type="button" className={value === item ? "active" : ""} onClick={() => setValue(item)}>
            {item}
          </button>
        ))}
      </div>
      <input
        className="remark-category-input"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="输入或选择分类，如：房租水电"
      />
      <div className="remark-category-actions">
        {initial ? <button type="button" className="remark-btn-clear" onClick={() => onSave("")}>清除归类</button> : <span />}
        <div>
          <button type="button" className="remark-btn-cancel" onClick={onCancel}>取消</button>
          <button type="button" className="remark-btn-save" disabled={!value.trim()} onClick={() => onSave(value)}>保存</button>
        </div>
      </div>
    </div>
  );
}

export function BillRemarkSheet() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RemarkFilter>("TRANSFER");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    void repo.getTransactions("default", 1, 200).then((data) => {
      setTransactions(data);
      setLoading(false);
    });
  }, []);

  const billList = useMemo(
    () => transactions.filter((item) => (filter === "ALL" ? item.type !== "INCOME" : item.type === "TRANSFER")),
    [filter, transactions],
  );
  const transferCount = useMemo(() => transactions.filter((item) => item.type === "TRANSFER").length, [transactions]);
  const allCount = useMemo(() => transactions.filter((item) => item.type !== "INCOME").length, [transactions]);
  const suggestions = useMemo(() => {
    const present = new Set(transactions.map((item) => item.remarkCategory || item.category).filter(Boolean));
    return [...new Set([...REMARK_SUGGESTIONS, ...present])].slice(0, 24);
  }, [transactions]);

  function toggleRow(id: string) {
    setExpandedId((current) => (current === id ? null : id));
  }

  async function saveRemark(tx: Transaction, value: string) {
    const trimmed = value.trim();
    const updated: Transaction = { ...tx, remarkCategory: trimmed || null, updatedAt: nowText() };
    await repo.saveTransaction(updated);
    setTransactions((prev) => prev.map((item) => (item.id === tx.id ? updated : item)));
    setExpandedId(null);
    window.dispatchEvent(new Event("stark:transaction-saved"));
  }

  return (
    <div className="bill-remark-sheet">
      <p className="settings-sheet-note">给转账等账单指定消费分类，归类后将按该分类计入消费支出的统计与分析。</p>
      <div className="bill-remark-filter">
        <button type="button" className={filter === "TRANSFER" ? "active" : ""} onClick={() => { setFilter("TRANSFER"); setExpandedId(null); }}>
          转账 <em>{transferCount}</em>
        </button>
        <button type="button" className={filter === "ALL" ? "active" : ""} onClick={() => { setFilter("ALL"); setExpandedId(null); }}>
          全部流水 <em>{allCount}</em>
        </button>
      </div>

      {loading ? (
        <div className="bill-remark-empty">加载中…</div>
      ) : billList.length ? (
        <div className="bill-remark-list">
          {billList.map((item) => {
            const remark = hasRemark(item);
            const expanded = expandedId === item.id;
            return (
              <div key={item.id} className={`bill-remark-row ${expanded ? "expanded" : ""}`}>
                <button type="button" className="bill-remark-row-main" onClick={() => toggleRow(item.id)}>
                  <span className="recent-icon"><img src={categoryIconSrc(item)} alt="" /></span>
                  <span className="bill-remark-info">
                    <strong>{item.category}</strong>
                    <small>{item.merchant || item.description || item.platform} · {timeLabel(item.date)}</small>
                  </span>
                  <span className={`bill-remark-amount ${item.type === "INCOME" ? "income" : item.type === "EXPENSE" ? "expense" : "transfer"}`}>{amountText(item)}</span>
                  <span className={`bill-remark-chip ${remark ? "set" : ""}`}>{remark ? item.remarkCategory : "未归类"}</span>
                </button>
                {expanded ? (
                  <RemarkCategoryEditor
                    initial={item.remarkCategory || ""}
                    suggestions={suggestions}
                    onSave={(value) => void saveRemark(item, value)}
                    onCancel={() => toggleRow(item.id)}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bill-remark-empty">当前没有可归类的转账账单</div>
      )}
    </div>
  );
}