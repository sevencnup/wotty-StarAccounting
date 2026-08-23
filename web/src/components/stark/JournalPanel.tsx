"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { SavingsPlanner } from "@/components/stark/SavingsPlanner";
import { nowText } from "@/lib/stark/utils/format";
import type { AssetType, Loan, Transaction, TransactionType } from "@/lib/stark/models";

const repo = new DataModeManager().getRepository();

const expenseCategories = [
  "餐饮", "购物", "交通", "住房", "娱乐", "医疗",
  "日用", "服装", "美容", "宠物", "通讯", "运动",
  "旅行", "教育", "其他",
];
const incomeCategories = ["工资", "奖金", "理财", "其他"];
const transferCategories = ["转账"];
const platforms = ["支付宝", "微信", "银行卡", "现金", "其他"];
const assetTypes: AssetType[] = ["CASH", "BANK_CARD", "ALIPAY", "WECHAT", "INVESTMENT", "OTHER"];
const assetTypeLabels: Record<AssetType, string> = {
  CASH: "现金",
  BANK_CARD: "银行卡",
  ALIPAY: "支付宝",
  WECHAT: "微信",
  INVESTMENT: "投资",
  OTHER: "其他",
};

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
  variant = "journal",
}: {
  onClose: () => void;
  onSaved?: () => void;
  mode?: "sheet" | "page";
  variant?: "journal" | "savings" | "asset" | "loan";
}) {
  const isPage = mode === "page";
  const isSavings = variant === "savings";
  const isAsset = variant === "asset";
  const isLoan = variant === "loan";
  const [visible, setVisible] = useState(false);
  const [type, setType] = useState<TransactionType>("EXPENSE");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("餐饮");
  const [platform, setPlatform] = useState("支付宝");
  const [merchant, setMerchant] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(nowText().slice(0, 16));
  const [assetName, setAssetName] = useState("");
  const [assetBalance, setAssetBalance] = useState("");
  const [assetType, setAssetType] = useState<AssetType>("ALIPAY");
  const [loanPlatform, setLoanPlatform] = useState("");
  const [loanTotalAmount, setLoanTotalAmount] = useState("");
  const [loanRemainingAmount, setLoanRemainingAmount] = useState("");
  const [loanMonthlyPayment, setLoanMonthlyPayment] = useState("");
  const [loanPeriods, setLoanPeriods] = useState("12");
  const [loanDueDay, setLoanDueDay] = useState("20");
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

  useEffect(() => {
    if (!isPage) return;
    const scrollY = window.scrollY;
    const body = document.body;
    const original = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
      overflow: body.style.overflow,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    return () => {
      body.style.position = original.position;
      body.style.top = original.top;
      body.style.width = original.width;
      body.style.overflow = original.overflow;
      window.scrollTo(0, scrollY);
    };
  }, [isPage]);

  useEffect(() => () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  function handleClose() {
    if (closingRef.current) return;
    if (isSavings) window.sessionStorage.removeItem("stark:journal-variant");
    closingRef.current = true;
    setVisible(false);
    closeTimerRef.current = setTimeout(onClose, 220);
  }

  const touchStart = useRef({ x: 0, y: 0, allowClose: false, outsidePanel: false, leftEdge: false });
  const panelRef = useRef<HTMLDivElement | null>(null);
  function handleTouchStart(e: React.TouchEvent) {
    const touch = e.touches[0];
    const panel = panelRef.current;
    const insidePanel = Boolean(panel?.contains(e.target as Node));
    const panelTop = panel?.getBoundingClientRect().top ?? 0;
    const leftEdge = touch.clientX <= 24;
    const inCloseRegion = insidePanel && touch.clientY <= panelTop + 96;
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      allowClose: isPage ? inCloseRegion && !leftEdge : insidePanel,
      outsidePanel: !insidePanel,
      leftEdge,
    };
  }
  function handleTouchMove(e: React.TouchEvent) {
    const start = touchStart.current;
    if (!isPage || (!start.outsidePanel && !start.leftEdge)) return;
    const touch = e.touches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    const isHorizontal = Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.15;
    if (isHorizontal) e.preventDefault();
  }
  function handleTouchEnd(e: React.TouchEvent) {
    const start = touchStart.current;
    if (!start.allowClose) return;
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

  async function saveAsset() {
    const value = Number(assetBalance);
    if (!Number.isFinite(value) || value === 0) return;
    const now = nowText();
    await repo.saveAsset({
      id: crypto.randomUUID(),
      userId: "local-user",
      accountId: "default",
      name: assetName.trim() || "新资产",
      type: assetType,
      balance: value,
      currency: "CNY",
      createdAt: now,
      updatedAt: now,
    });
    window.dispatchEvent(new Event("stark:asset-saved"));
    setAssetName("");
    setAssetBalance("");
    setAssetType("ALIPAY");
    onSaved?.();
    handleClose();
  }

  async function saveLoan() {
    const now = nowText();
    const total = Number(loanTotalAmount) || 0;
    await repo.saveLoan({
      id: crypto.randomUUID(),
      userId: "local-user",
      accountId: "default",
      platform: loanPlatform.trim() || "新贷款",
      totalAmount: total,
      remainingAmount: loanRemainingAmount === "" ? total : Number(loanRemainingAmount) || 0,
      periods: Math.max(1, Number(loanPeriods) || 12),
      paidPeriods: 0,
      monthlyPayment: Number(loanMonthlyPayment) || 0,
      dueDate: Math.min(31, Math.max(1, Number(loanDueDay) || 20)),
      status: "ACTIVE",
      matchKeywords: null,
      createdAt: now,
      updatedAt: now,
    });
    window.dispatchEvent(new Event("stark:loan-saved"));
    setLoanPlatform("");
    setLoanTotalAmount("");
    setLoanRemainingAmount("");
    setLoanMonthlyPayment("");
    setLoanPeriods("12");
    setLoanDueDay("20");
    onSaved?.();
    handleClose();
  }

  return (
    <div
      className={`journal-overlay ${isPage ? "page" : ""} ${visible ? "visible" : ""}`}
      onClick={handleClose}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        ref={panelRef}
        className={`journal-panel ${isPage ? "page" : ""} ${isSavings ? "savings" : ""} ${isAsset ? "asset" : ""} ${isLoan ? "loan" : ""} ${visible ? "visible" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="journal-header">
          <button type="button" className="journal-back" onClick={handleClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="journal-title">{isSavings ? "添加储蓄" : isAsset ? "新增资产" : isLoan ? "新增贷款" : "记账"}</span>
          <button type="button" className="journal-close" onClick={handleClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {isSavings ? (
          <SavingsPlanner embedded onSaved={handleClose} />
        ) : isAsset ? (
          <div className="asset-journal-form">
            <div className="journal-section">
              <h2 className="page-card-title">资产信息</h2>
              <div className="finance-form-grid">
                <label><span>资产名称</span><input value={assetName} onChange={(event) => setAssetName(event.target.value)} placeholder="如工资卡" /></label>
                <label><span>资产类型</span><select value={assetType} onChange={(event) => setAssetType(event.target.value as AssetType)}>{assetTypes.map((item) => <option key={item} value={item}>{assetTypeLabels[item]}</option>)}</select></label>
                <label className="wide"><span>当前余额</span><input inputMode="decimal" value={assetBalance} onChange={(event) => setAssetBalance(event.target.value.replace(/[^\d.-]/g, ""))} placeholder="0.00" /></label>
              </div>
            </div>
            <button type="button" className="finance-primary-action" onClick={() => void saveAsset()}>新增资产</button>
          </div>
        ) : isLoan ? (
          <div className="loan-journal-form">
            <div className="journal-section">
              <h2 className="page-card-title">贷款信息</h2>
              <div className="finance-form-grid loan-form-grid">
                <label><span>贷款名称</span><input value={loanPlatform} onChange={(event) => setLoanPlatform(event.target.value)} placeholder="如住房贷款" /></label>
                <label><span>贷款总额</span><input inputMode="decimal" value={loanTotalAmount} onChange={(event) => setLoanTotalAmount(event.target.value.replace(/[^\d.]/g, ""))} placeholder="0.00" /></label>
                <label><span>剩余本金</span><input inputMode="decimal" value={loanRemainingAmount} onChange={(event) => setLoanRemainingAmount(event.target.value.replace(/[^\d.]/g, ""))} placeholder="默认等于总额" /></label>
                <label><span>每月月供</span><input inputMode="decimal" value={loanMonthlyPayment} onChange={(event) => setLoanMonthlyPayment(event.target.value.replace(/[^\d.]/g, ""))} placeholder="0.00" /></label>
                <label><span>总期数</span><input inputMode="numeric" value={loanPeriods} onChange={(event) => setLoanPeriods(event.target.value.replace(/\D/g, ""))} /></label>
                <label><span>每月还款日</span><input inputMode="numeric" value={loanDueDay} onChange={(event) => setLoanDueDay(event.target.value.replace(/\D/g, ""))} /></label>
              </div>
            </div>
            <button type="button" className="finance-primary-action" onClick={() => void saveLoan()}>新增贷款</button>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
