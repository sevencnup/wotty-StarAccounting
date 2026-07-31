"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { nowText } from "@/lib/stark/utils/format";
import type { Transaction, TransactionType } from "@/lib/stark/models";

const repo = new DataModeManager().getRepository();

const expenseCategories = [
  "餐饮", "购物", "交通", "住房", "娱乐", "医疗",
  "日用", "服装", "美容", "宠物", "通讯", "运动",
  "旅行", "教育", "其他",
];
const incomeCategories = ["工资", "奖金", "理财", "其他"];
const transferCategories = ["转账"];
const platforms = ["支付宝", "微信", "银行卡", "现金", "其他"];

const categoryIcons: Record<string, string> = {
  "餐饮": "canyin", "购物": "gouwu", "交通": "jiaotong", "住房": "zhufang",
  "娱乐": "yule", "医疗": "yiliao", "日用": "riyong", "服装": "fuzhuang",
  "美容": "meirong", "宠物": "chongwu", "通讯": "tongxun", "运动": "yundong",
  "旅行": "lvxing", "教育": "jiaoyu", "其他": "qita",
  "工资": "jiaoyi", "奖金": "jiaoyi", "理财": "jiaoyi",
};

export function JournalPanel({
  onClose,
  onSaved,
  mode = "sheet",
}: {
  onClose: () => void;
  onSaved?: () => void;
  mode?: "sheet" | "page";
}) {
  const isPage = mode === "page";
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("餐饮");
  const [platform, setPlatform] = useState("支付宝");
  const [merchant, setMerchant] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(nowText().slice(0, 16));
  const closingRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const categories = useMemo((): string[] => {
    if (type === "INCOME") return incomeCategories;
    if (type === "TRANSFER") return transferCategories;
    return expenseCategories;
  }, [type]);

  useEffect(() => {
    if (type === "TRANSFER") setCategory("转账");
    if (type !== "TRANSFER" && category === "转账") setCategory(type === "INCOME" ? "工资" : "餐饮");
    if (type === "INCOME" && !incomeCategories.includes(category)) setCategory("工资");
    if (type === "EXPENSE" && !expenseCategories.includes(category)) setCategory("餐饮");
  }, [type, category]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  function handleClose() {
    if (closingRef.current) return;
    closingRef.current = true;
    setVisible(false);
    closeTimerRef.current = setTimeout(onClose, 220);
  }

  const touchStart = useRef({ x: 0, y: 0, allow: false });
  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0];
    const panelTop = (e.currentTarget as HTMLDivElement).getBoundingClientRect().top;
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      allow: isPage ? touch.clientY <= panelTop + 96 : true,
    };
  }
  function handleTouchEnd(e: React.TouchEvent) {
    const start = touchStart.current;
    if (!start.allow) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const isHorizontal = Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.25;
    if (isHorizontal) handleClose();
  }

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
    onSaved?.();
    handleClose();
  }

  return (
    <div className={`journal-overlay ${isPage ? "page" : ""} ${visible ? "visible" : ""}`} onClick={handleClose}>
      <div className={`journal-panel ${isPage ? "page" : ""} ${visible ? "visible" : ""}`} onClick={(e) => e.stopPropagation()} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <div className="journal-header">
          <button type="button" className="journal-back" onClick={handleClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="journal-title">记账</span>
          <button type="button" className="journal-close" onClick={handleClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

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

        <div className="journal-section">
          <h2 className="page-card-title">金额</h2>
          <div className="amount-display">¥ {amount || "0.00"}</div>
          <input className="app-input" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ""))} placeholder="输入金额" />
        </div>

        <div className="journal-section">
          <h2 className="page-card-title">分类</h2>
          <div className="category-grid category-grid-with-icons">
            {categories.map((item) => (
              <button key={item} type="button" onClick={() => setCategory(item)} className={category === item ? "category-button active" : "category-button"}>
                <img src={`/category-icons/${categoryIcons[item] || "qita"}.png`} alt="" className="category-icon" />
                <span>{item}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="journal-section">
          <h2 className="page-card-title">账户</h2>
          <div className="pill-group">
            {platforms.map((item) => (
              <button key={item} type="button" onClick={() => setPlatform(item)} className={platform === item ? "pill-button active" : "pill-button"}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="journal-section">
          <h2 className="page-card-title">时间与备注</h2>
          <div className="app-field-grid">
            <input className="app-input" value={date} onChange={(event) => setDate(event.target.value)} />
            <input className="app-input" value={merchant} onChange={(event) => setMerchant(event.target.value)} placeholder="商户" />
            <input className="app-input" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="备注" />
          </div>
        </div>

        <div className="action-grid">
          <button type="button" className="secondary-button" onClick={() => { setAmount(""); setMerchant(""); setDescription(""); }}>
            再记一笔
          </button>
          <button type="button" className="primary-button" onClick={() => void saveTransaction()}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
