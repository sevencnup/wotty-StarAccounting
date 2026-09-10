"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { SavingsPlanner } from "@/components/stark/SavingsPlanner";
import { nowText } from "@/lib/stark/utils/format";
import { createId } from "@/lib/stark/utils/id";
import { clearNewEntryDraft, readNewEntryDraft, saveNewEntryDraft, type NewEntryDraftKind } from "@/lib/stark/storage/new-entry-drafts";
import { recordSavingsPlanDeposit } from "@/lib/stark/savings/planner";
import type { AssetType, SavingsGoal, SavingsPlan, TransactionType } from "@/lib/stark/models";

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

type JournalDraft = {
  type: TransactionType;
  amount: string;
  category: string;
  platform: string;
  merchant: string;
  description: string;
  date: string;
};

type AssetDraft = {
  assetName: string;
  assetBalance: string;
  assetType: AssetType;
};

type LoanDraft = {
  loanPlatform: string;
  loanTotalAmount: string;
  loanRemainingAmount: string;
  loanMonthlyPayment: string;
  loanPeriods: string;
  loanDueDay: string;
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
  preset,
  savingsGoalId,
  savingsPlan,
  savingsGoal,
}: {
  onClose: () => void;
  onSaved?: () => void;
  mode?: "sheet" | "page";
  variant?: "journal" | "savings" | "savings-record" | "asset" | "loan";
  preset?: { type: TransactionType; category: string };
  savingsGoalId?: string;
  savingsPlan?: SavingsPlan;
  savingsGoal?: SavingsGoal;
}) {
  const isPage = mode === "page";
  const isSavings = variant === "savings";
  const isSavingsRecord = variant === "savings-record";
  const isEditingSavings = isSavings && Boolean(savingsGoalId);
  const isAsset = variant === "asset";
  const isLoan = variant === "loan";
  const draftKind: NewEntryDraftKind = isSavings ? "savings" : isAsset ? "asset" : isLoan ? "loan" : preset?.type === "INCOME" && preset.category === "工资" ? "salary" : "journal";
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
  const [recordedAmount, setRecordedAmount] = useState("");
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [recordSaving, setRecordSaving] = useState(false);
  const [recordNotice, setRecordNotice] = useState("");
  const proofImageInputRef = useRef<HTMLInputElement | null>(null);
  const closingRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const draftSubmittedRef = useRef(false);

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
    if (!preset || variant !== "journal") return;
    setType(preset.type);
    setCategory(preset.category);
  }, [preset, variant]);

  useEffect(() => {
    setDraftReady(false);
    draftSubmittedRef.current = false;
    if (draftKind === "asset") {
      const draft = readNewEntryDraft<AssetDraft>(draftKind);
      if (draft) {
        setAssetName(draft.assetName);
        setAssetBalance(draft.assetBalance);
        setAssetType(draft.assetType);
      }
    } else if (draftKind === "loan") {
      const draft = readNewEntryDraft<LoanDraft>(draftKind);
      if (draft) {
        setLoanPlatform(draft.loanPlatform);
        setLoanTotalAmount(draft.loanTotalAmount);
        setLoanRemainingAmount(draft.loanRemainingAmount);
        setLoanMonthlyPayment(draft.loanMonthlyPayment);
        setLoanPeriods(draft.loanPeriods);
        setLoanDueDay(draft.loanDueDay);
      }
    } else if (draftKind === "journal" || draftKind === "salary") {
      const draft = readNewEntryDraft<JournalDraft>(draftKind);
      if (draft) {
        setType(draft.type);
        setAmount(draft.amount);
        setCategory(draft.category);
        setPlatform(draft.platform);
        setMerchant(draft.merchant);
        setDescription(draft.description);
        setDate(draft.date);
      }
    }
    setDraftReady(true);
  }, [draftKind]);

  useEffect(() => {
    if (!isSavingsRecord || !savingsPlan) return;
    setRecordedAmount(String(savingsPlan.actualAmount ?? savingsPlan.amount ?? ""));
    setProofImage(savingsPlan.proofImage ?? null);
    setRecordNotice("");
  }, [isSavingsRecord, savingsPlan]);

  useEffect(() => {
    if (!draftReady || isSavings || isSavingsRecord || draftSubmittedRef.current) return;
    if (draftKind === "asset") {
      saveNewEntryDraft(draftKind, { assetName, assetBalance, assetType } satisfies AssetDraft);
    } else if (draftKind === "loan") {
      saveNewEntryDraft(draftKind, { loanPlatform, loanTotalAmount, loanRemainingAmount, loanMonthlyPayment, loanPeriods, loanDueDay } satisfies LoanDraft);
    } else {
      saveNewEntryDraft(draftKind, { type, amount, category, platform, merchant, description, date } satisfies JournalDraft);
    }
  }, [assetBalance, assetName, assetType, date, description, draftKind, draftReady, isSavings, loanDueDay, loanMonthlyPayment, loanPeriods, loanPlatform, loanRemainingAmount, loanTotalAmount, amount, category, merchant, platform, type]);

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
    // 只有在顶部 50px 标题拖拽区域才允许横滑返回，防止子模块左右滑动误触
    const inTopHeaderRegion = insidePanel && touch.clientY <= panelTop + 50;
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      allowClose: inTopHeaderRegion,
      outsidePanel: !insidePanel,
      leftEdge: touch.clientX <= 20,
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
      id: createId("transaction"),
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
    draftSubmittedRef.current = true;
    clearNewEntryDraft(draftKind);
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
      id: createId("asset"),
      userId: "local-user",
      accountId: "default",
      name: assetName.trim() || "新资产",
      type: assetType,
      balance: value,
      currency: "CNY",
      createdAt: now,
      updatedAt: now,
    });
    draftSubmittedRef.current = true;
    clearNewEntryDraft(draftKind);
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
      id: createId("loan"),
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
    draftSubmittedRef.current = true;
    clearNewEntryDraft(draftKind);
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

  async function compressProofImage(file: File) {
    if (!file.type.startsWith("image/")) throw new Error("请选择图片文件");
    if (file.size > 12 * 1024 * 1024) throw new Error("图片不能超过 12MB");
    const source = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("图片读取失败"));
      reader.readAsDataURL(file);
    });
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("图片读取失败"));
      element.src = source;
    });
    const maxWidth = 720;
    const scale = Math.min(1, maxWidth / image.width);
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.width * scale));
    canvas.height = Math.max(1, Math.round(image.height * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("图片处理失败");
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.62);
  }

  async function saveSavingsRecord() {
    if (!savingsPlan || !savingsGoal || recordSaving) return;
    const value = Number(recordedAmount);
    if (!Number.isFinite(value) || value <= 0) {
      setRecordNotice("实际存入金额必须大于 0");
      return;
    }
    setRecordSaving(true);
    setRecordNotice("");
    try {
      const now = nowText();
      const result = recordSavingsPlanDeposit(savingsPlan, savingsGoal, value, proofImage, now);
      await repo.saveSavingsGoal(result.goal);
      await repo.saveSavingsPlan(result.plan);
      onSaved?.();
      handleClose();
    } catch (error) {
      setRecordNotice(error instanceof Error ? error.message : "保存失败，请稍后重试");
    } finally {
      setRecordSaving(false);
    }
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
        className={`journal-panel modern-journal-shell ${isPage ? "page" : ""} ${isSavings ? "savings" : ""} ${isSavingsRecord ? "savings-record" : ""} ${isAsset ? "asset" : ""} ${isLoan ? "loan" : ""} ${visible ? "visible" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题栏 */}
        <div className="journal-header modern-journal-header">
          <button type="button" className="journal-back-btn" onClick={handleClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="journal-header-title">{isSavings ? isEditingSavings ? "编辑储蓄目标" : "添加储蓄" : isSavingsRecord ? "记录储蓄" : isAsset ? "新增资产" : isLoan ? "新增贷款" : "记一笔"}</span>
          <button type="button" className="journal-close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        {isSavings ? (
          <SavingsPlanner embedded onSaved={handleClose} savingsGoalId={savingsGoalId} />
        ) : isSavingsRecord ? (
          <div className="savings-record-form">
            <div className="savings-record-context">
              <span>{savingsGoal?.name || "储蓄目标"}</span>
              <strong>{savingsPlan?.month || ""}</strong>
              <small>计划存入 ¥ {savingsPlan?.amount ?? 0}</small>
            </div>
            <label className="modern-form-group">
              <span>实际存入</span>
              <div className="modern-amount-box">
                <span className="cur-sym">¥</span>
                <input
                  className="modern-amount-field"
                  inputMode="decimal"
                  value={recordedAmount}
                  onChange={(event) => setRecordedAmount(event.target.value.replace(/[^0-9.]/g, ""))}
                  placeholder="0.00"
                />
              </div>
            </label>
            <div className="modern-form-group">
              <span>图片凭证</span>
              <input
                ref={proofImageInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  void compressProofImage(file).then(setProofImage).catch((error: unknown) => setRecordNotice(error instanceof Error ? error.message : "图片处理失败"));
                  event.target.value = "";
                }}
              />
              {proofImage ? (
                <div className="savings-proof-preview">
                  <img src={proofImage} alt="图片凭证预览" />
                  <button type="button" onClick={() => setProofImage(null)}>清除图片</button>
                </div>
              ) : (
                <button type="button" className="savings-proof-picker" onClick={() => proofImageInputRef.current?.click()}>
                  <span>＋</span>
                  添加图片
                </button>
              )}
            </div>
            {recordNotice ? <p className="savings-record-notice">{recordNotice}</p> : null}
            <button type="button" className="modern-primary-submit" disabled={recordSaving} onClick={() => void saveSavingsRecord()}>
              {recordSaving ? "保存中…" : "保存记录"}
            </button>
          </div>
        ) : isAsset ? (
          <div className="modern-form-wrapper">
            <div className="modern-form-card">
              <div className="modern-form-group">
                <label>资产名称</label>
                <input
                  value={assetName}
                  onChange={(event) => setAssetName(event.target.value)}
                  placeholder="如：招行工资卡 / 微信零钱"
                  className="modern-form-input"
                />
              </div>

              <div className="modern-form-group">
                <label>资产类型</label>
                <div className="modern-select-pill-grid">
                  {assetTypes.map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`select-pill ${assetType === item ? "active" : ""}`}
                      onClick={() => setAssetType(item)}
                    >
                      {assetTypeLabels[item]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="modern-form-group">
                <label>当前余额 (元)</label>
                <div className="modern-amount-box">
                  <span className="cur-sym">¥</span>
                  <input
                    inputMode="decimal"
                    value={assetBalance}
                    onChange={(event) => setAssetBalance(event.target.value.replace(/[^\d.-]/g, ""))}
                    placeholder="0.00"
                    className="modern-amount-field"
                  />
                </div>
              </div>
            </div>
            <button type="button" className="modern-primary-submit" onClick={() => void saveAsset()}>
              保存资产
            </button>
          </div>
        ) : isLoan ? (
          <div className="modern-form-wrapper">
            <div className="modern-form-card">
              <div className="modern-form-group">
                <label>贷款名称</label>
                <input
                  value={loanPlatform}
                  onChange={(event) => setLoanPlatform(event.target.value)}
                  placeholder="如：建设银行房贷 / 招行车贷"
                  className="modern-form-input"
                />
              </div>

              <div className="modern-form-grid-2">
                <div className="modern-form-group">
                  <label>贷款总额 (元)</label>
                  <input
                    inputMode="decimal"
                    value={loanTotalAmount}
                    onChange={(event) => setLoanTotalAmount(event.target.value.replace(/[^\d.]/g, ""))}
                    placeholder="0.00"
                    className="modern-form-input"
                  />
                </div>
                <div className="modern-form-group">
                  <label>剩余本金 (元)</label>
                  <input
                    inputMode="decimal"
                    value={loanRemainingAmount}
                    onChange={(event) => setLoanRemainingAmount(event.target.value.replace(/[^\d.]/g, ""))}
                    placeholder="默认等于总额"
                    className="modern-form-input"
                  />
                </div>
              </div>

              <div className="modern-form-grid-3">
                <div className="modern-form-group">
                  <label>每月月供 (元)</label>
                  <input
                    inputMode="decimal"
                    value={loanMonthlyPayment}
                    onChange={(event) => setLoanMonthlyPayment(event.target.value.replace(/[^\d.]/g, ""))}
                    placeholder="0.00"
                    className="modern-form-input"
                  />
                </div>
                <div className="modern-form-group">
                  <label>总期数</label>
                  <input
                    inputMode="numeric"
                    value={loanPeriods}
                    onChange={(event) => setLoanPeriods(event.target.value.replace(/\D/g, ""))}
                    className="modern-form-input"
                  />
                </div>
                <div className="modern-form-group">
                  <label>每月还款日</label>
                  <input
                    inputMode="numeric"
                    value={loanDueDay}
                    onChange={(event) => setLoanDueDay(event.target.value.replace(/\D/g, ""))}
                    className="modern-form-input"
                  />
                </div>
              </div>
            </div>
            <button type="button" className="modern-primary-submit" onClick={() => void saveLoan()}>
              保存贷款
            </button>
          </div>
        ) : (
          <div className="modern-journal-flow">
            {/* 顶栏类型切换 */}
            <div className="modern-type-switch">
              {[
                ["EXPENSE", "支出"],
                ["INCOME", "收入"],
                ["TRANSFER", "转账"],
              ].map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setType(val as TransactionType)}
                  className={`type-tab ${type === val ? "active" : ""}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* 大字号计算器式金额大屏 */}
            <div className="modern-amount-hero">
              <span className="currency-label">¥</span>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ""))}
                placeholder="0.00"
                className="amount-huge-input"
              />
              {amount ? (
                <button type="button" className="amount-clear-btn" onClick={() => setAmount("")}>
                  ×
                </button>
              ) : null}
            </div>

            {/* 精致分类网格 */}
            <div className="modern-section-block">
              <span className="section-mini-title">消费分类</span>
              <div className="modern-category-matrix">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setCategory(item)}
                    className={`category-tile ${category === item ? "active" : ""}`}
                  >
                    <div className="tile-icon-box">
                      <img src={`/category-icons/${categoryIcons[item] || "qita"}.png`} alt="" className="tile-icon" />
                    </div>
                    <span className="tile-label">{item}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 支付账户选择 */}
            <div className="modern-section-block">
              <span className="section-mini-title">支付账户</span>
              <div className="modern-pill-row">
                {platforms.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setPlatform(item)}
                    className={`account-pill ${platform === item ? "active" : ""}`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* 补充信息：日期、商户、备注 */}
            <div className="modern-section-block">
              <span className="section-mini-title">明细备注</span>
              <div className="modern-meta-grid">
                <input
                  type="datetime-local"
                  className="meta-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <input
                  type="text"
                  className="meta-input"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  placeholder="商户名称 (选填)"
                />
                <input
                  type="text"
                  className="meta-input span-2"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="添加消费备注..."
                />
              </div>
            </div>

            {/* 底部行动操作 */}
            <div className="modern-action-bar">
              <button
                type="button"
                className="action-sub-btn"
                onClick={() => {
                  setAmount("");
                  setMerchant("");
                  setDescription("");
                }}
              >
                清空重填
              </button>
              <button
                type="button"
                className="action-main-btn"
                onClick={() => void saveTransaction()}
                disabled={!amount || Number(amount) <= 0}
              >
                保存记账
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
