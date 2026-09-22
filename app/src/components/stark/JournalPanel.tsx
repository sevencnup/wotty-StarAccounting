"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import dynamic from "next/dynamic";
import { DataModeManager } from "@/lib/stark/repository/DataModeManager";
import { nowText } from "@/lib/stark/utils/format";
import { createId } from "@/lib/stark/utils/id";
import { clearNewEntryDraft, readNewEntryDraft, saveNewEntryDraft, type NewEntryDraftKind } from "@/lib/stark/storage/new-entry-drafts";
import { getCurrentAccountId } from "@/lib/stark/storage/local-config";
import { recordSavingsPlanDeposit } from "@/lib/stark/savings/planner";
import { buildSalaryBatchTransactions, SALARY_BATCH_MONTHS, salaryBatchMonthKeys, selectSalaryBatchMonths } from "@/lib/stark/journal/salary-batch";
import type { Asset, AssetType, Loan, SavingsGoal, SavingsPlan, Transaction, TransactionType } from "@/lib/stark/models";
import { categoryIconSrcForCategory, expenseCategoryOptions } from "@/lib/stark/utils/category-icon";

const SavingsPlanner = dynamic(
  () => import("@/components/stark/SavingsPlanner").then((module) => module.SavingsPlanner),
  { ssr: false },
);

const repo = new DataModeManager().getRepository();

const expenseCategories = expenseCategoryOptions;
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
  loanMatchKeywords: string;
  loanTotalAmount: string;
  loanRemainingAmount: string;
  loanMonthlyPayment: string;
  loanPeriods: string;
  loanDueDay: string;
};

type KeyboardViewport = {
  height: number;
  offsetTop: number;
};

export type JournalPanelProps = {
  onClose: () => void;
  onSaved?: () => void;
  mode?: "sheet" | "page";
  variant?: "journal" | "savings" | "savings-record" | "asset" | "loan" | "repayment";
  preset?: { type: TransactionType; category: string };
  savingsGoalId?: string;
  savingsPlan?: SavingsPlan;
  savingsGoal?: SavingsGoal;
  transaction?: Transaction;
  asset?: Asset;
  loan?: Loan;
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
  transaction,
  asset,
  loan,
}: JournalPanelProps) {
  const isPage = mode === "page";
  const isSavings = variant === "savings";
  const isSavingsRecord = variant === "savings-record";
  const isEditingSavings = isSavings && Boolean(savingsGoalId);
  const isAsset = variant === "asset";
  const isLoan = variant === "loan";
  const isRepayment = variant === "repayment";
  const isEditingTransaction = Boolean(transaction);
  const isEditingAsset = isAsset && Boolean(asset);
  const isEditingLoan = isLoan && Boolean(loan);
  const isEditingEntity = isEditingTransaction || isEditingAsset || isEditingLoan || isRepayment;
  const isSalaryPreset = variant === "journal" && preset?.type === "INCOME" && preset.category === "工资";
  const draftKind: NewEntryDraftKind = isSavings ? "savings" : isAsset ? "asset" : isLoan ? "loan" : isSalaryPreset ? "salary" : "journal";
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
  const [loanMatchKeywords, setLoanMatchKeywords] = useState("");
  const [loanTotalAmount, setLoanTotalAmount] = useState("");
  const [loanRemainingAmount, setLoanRemainingAmount] = useState("");
  const [loanMonthlyPayment, setLoanMonthlyPayment] = useState("");
  const [loanPeriods, setLoanPeriods] = useState("12");
  const [loanDueDay, setLoanDueDay] = useState("20");
  const [recordedAmount, setRecordedAmount] = useState("");
  const [recordedDate, setRecordedDate] = useState(nowText().slice(0, 16));
  const [proofImage, setProofImage] = useState<string | null>(null);
  const [recordSaving, setRecordSaving] = useState(false);
  const [recordNotice, setRecordNotice] = useState("");
  const [salaryEntryMode, setSalaryEntryMode] = useState<"single" | "batch">("single");
  const [salaryEntryOpen, setSalaryEntryOpen] = useState(isSalaryPreset);
  const [batchYear, setBatchYear] = useState(String(new Date().getFullYear()));
  const [batchMonths, setBatchMonths] = useState<number[]>([]);
  const [batchAmount, setBatchAmount] = useState("");
  const [batchPayday, setBatchPayday] = useState("15");
  const [batchMerchant, setBatchMerchant] = useState("");
  const [batchSaving, setBatchSaving] = useState(false);
  const [batchNotice, setBatchNotice] = useState("");
  const proofImageInputRef = useRef<HTMLInputElement | null>(null);
  const closingRef = useRef(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [draftReady, setDraftReady] = useState(false);
  const draftSubmittedRef = useRef(false);
  const [keyboardViewport, setKeyboardViewport] = useState<KeyboardViewport | null>(null);

  const categories = useMemo((): string[] => {
    if (type === "INCOME") return incomeCategories;
    if (type === "TRANSFER") return transferCategories;
    return expenseCategories;
  }, [type]);

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(String(transaction.amount));
      setCategory(transaction.category);
      setPlatform(transaction.platform);
      setMerchant(transaction.merchant ?? "");
      setDescription(transaction.description ?? "");
      setDate(transaction.date.slice(0, 16));
    }
    if (asset) {
      setAssetName(asset.name);
      setAssetBalance(String(asset.balance));
      setAssetType(asset.type);
    }
    if (loan) {
      setLoanPlatform(loan.platform);
      setLoanMatchKeywords(loan.matchKeywords ?? "");
      setLoanTotalAmount(String(loan.totalAmount));
      setLoanRemainingAmount(String(loan.remainingAmount));
      setLoanMonthlyPayment(String(loan.monthlyPayment));
      setLoanPeriods(String(loan.periods));
      setLoanDueDay(String(loan.dueDate));
    }
    if (isRepayment && loan) {
      setType("REPAYMENT");
      setCategory("还款");
      setPlatform(loan.platform);
      setAmount(String(loan.monthlyPayment || ""));
      setDate(nowText().slice(0, 16));
    }
  }, [asset, isRepayment, loan, transaction]);

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
    if (isEditingEntity) {
      setDraftReady(true);
      return;
    }
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
        setLoanMatchKeywords(draft.loanMatchKeywords ?? "");
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
  }, [draftKind, isEditingEntity]);

  useEffect(() => {
    if (!isSavingsRecord || !savingsPlan) return;
    setRecordedAmount(String(savingsPlan.actualAmount ?? savingsPlan.amount ?? ""));
    setRecordedDate((savingsPlan.actualDate ?? savingsPlan.updatedAt ?? nowText()).slice(0, 16));
    setProofImage(savingsPlan.proofImage ?? null);
    setRecordNotice("");
  }, [isSavingsRecord, savingsPlan]);

  useEffect(() => {
    if (!draftReady || isSavings || isSavingsRecord || isEditingEntity || draftSubmittedRef.current) return;
    if (draftKind === "asset") {
      saveNewEntryDraft(draftKind, { assetName, assetBalance, assetType } satisfies AssetDraft);
    } else if (draftKind === "loan") {
      saveNewEntryDraft(draftKind, { loanPlatform, loanMatchKeywords, loanTotalAmount, loanRemainingAmount, loanMonthlyPayment, loanPeriods, loanDueDay } satisfies LoanDraft);
    } else {
      saveNewEntryDraft(draftKind, { type, amount, category, platform, merchant, description, date } satisfies JournalDraft);
    }
  }, [assetBalance, assetName, assetType, date, description, draftKind, draftReady, isEditingEntity, isSavings, loanDueDay, loanMatchKeywords, loanMonthlyPayment, loanPeriods, loanPlatform, loanRemainingAmount, loanTotalAmount, amount, category, merchant, platform, type]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isPage || !isSavings || !window.visualViewport) return;
    const viewport = window.visualViewport;
    const updateKeyboardViewport = () => {
      const keyboardOpen = viewport.height < window.innerHeight - 120;
      setKeyboardViewport(keyboardOpen
        ? { height: Math.round(viewport.height), offsetTop: Math.round(viewport.offsetTop) }
        : null);
    };
    updateKeyboardViewport();
    viewport.addEventListener("resize", updateKeyboardViewport);
    viewport.addEventListener("scroll", updateKeyboardViewport);
    return () => {
      viewport.removeEventListener("resize", updateKeyboardViewport);
      viewport.removeEventListener("scroll", updateKeyboardViewport);
    };
  }, [isPage, isSavings]);

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

  const keyboardViewportStyle: CSSProperties | undefined = keyboardViewport
    ? { height: `${keyboardViewport.height}px`, top: `${keyboardViewport.offsetTop}px`, bottom: "auto" }
    : undefined;

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
      id: transaction?.id ?? createId("transaction"),
      userId: transaction?.userId ?? "local-user",
      accountId: transaction?.accountId ?? getCurrentAccountId(),
      amount: value,
      type,
      category,
      platform,
      merchant: merchant || null,
      date: date.length === 16 ? `${date}:00` : date,
      description: description || null,
      orderId: transaction?.orderId ?? null,
      paymentMethod: transaction?.paymentMethod ?? null,
      status: transaction?.status ?? null,
      loanId: transaction?.loanId ?? null,
      remarkCategory: transaction?.remarkCategory ?? null,
      createdAt: transaction?.createdAt ?? now,
      updatedAt: now,
    });
    draftSubmittedRef.current = true;
    clearNewEntryDraft(draftKind);
    setAmount("");
    setMerchant("");
    setDescription("");
    setDate(nowText().slice(0, 16));
    if (type !== "TRANSFER") setCategory(type === "INCOME" ? "工资" : "餐饮");
    window.dispatchEvent(new Event("stark:transaction-saved"));
    onSaved?.();
    handleClose();
  }

  async function saveRepayment() {
    if (!loan) return;
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0 || loan.remainingAmount <= 0) return;
    const now = nowText();
    const paidInstallment = loan.monthlyPayment > 0 && value >= loan.monthlyPayment;
    const remainingAmount = Math.max(0, loan.remainingAmount - value);
    await repo.saveTransaction({
      id: createId("repayment"),
      userId: loan.userId,
      accountId: loan.accountId,
      amount: Math.min(value, loan.remainingAmount),
      type: "REPAYMENT",
      category: "还款",
      platform: loan.platform,
      merchant: loan.platform,
      date: date.length === 16 ? `${date}:00` : date,
      description: description || null,
      orderId: null,
      paymentMethod: null,
      status: "COMPLETED",
      loanId: loan.id,
      remarkCategory: null,
      createdAt: now,
      updatedAt: now,
    });
    await repo.saveLoan({
      ...loan,
      remainingAmount,
      paidPeriods: Math.min(loan.periods, loan.paidPeriods + (paidInstallment ? 1 : 0)),
      status: remainingAmount <= 0 ? "PAID_OFF" : loan.status === "PAID_OFF" ? "ACTIVE" : loan.status,
      updatedAt: now,
    });
    window.dispatchEvent(new Event("stark:transaction-saved"));
    window.dispatchEvent(new Event("stark:loan-saved"));
    onSaved?.();
    handleClose();
  }

  function toggleBatchMonth(month: number) {
    setBatchMonths((current) => current.includes(month)
      ? current.filter((item) => item !== month)
      : [...current, month].sort((left, right) => left - right));
  }

  async function saveSalaryBatch() {
    if (batchSaving) return;
    const amountValue = Number(batchAmount);
    const monthKeys = salaryBatchMonthKeys(Number(batchYear), batchMonths);
    if (!monthKeys.length) {
      setBatchNotice("请至少选择一个补录月份");
      return;
    }
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      setBatchNotice("请输入大于 0 的每月工资金额");
      return;
    }

    setBatchSaving(true);
    setBatchNotice("正在检查已导入的工资记录...");
    try {
      const monthTransactions = await repo.getTransactionsByMonths(getCurrentAccountId(), monthKeys);
      const { pendingMonthKeys, skippedMonthKeys } = selectSalaryBatchMonths(
        monthKeys,
        monthTransactions as Transaction[],
      );
      if (!pendingMonthKeys.length) {
        setBatchNotice(`所选 ${monthKeys.length} 个月都已有工资收入，未重复新增。`);
        return;
      }

      const now = nowText();
      const transactions = buildSalaryBatchTransactions({
        monthKeys: pendingMonthKeys,
        amount: amountValue,
        platform,
        payday: Number(batchPayday),
        merchant: batchMerchant,
        accountId: getCurrentAccountId(),
        now,
        createTransactionId: () => createId("salary-batch"),
      });
      setBatchNotice(`正在补录 ${transactions.length} 笔工资收入...`);
      const result = await repo.importTransactions(transactions);
      const skipped = skippedMonthKeys.length + result.skipped;
      setBatchNotice(`已补录 ${result.imported} 笔${skipped ? `，跳过 ${skipped} 个已有工资月份` : ""}${result.errors ? `，失败 ${result.errors} 笔` : ""}。`);
      if (result.imported) window.dispatchEvent(new Event("stark:transaction-saved"));
    } catch (error) {
      setBatchNotice(`批量补录失败${error instanceof Error && error.message ? `：${error.message}` : "，请稍后重试"}`);
    } finally {
      setBatchSaving(false);
    }
  }

  async function saveAsset() {
    const value = Number(assetBalance);
    if (!Number.isFinite(value) || value === 0) return;
    const now = nowText();
    await repo.saveAsset({
      id: asset?.id ?? createId("asset"),
      userId: asset?.userId ?? "local-user",
      accountId: asset?.accountId ?? getCurrentAccountId(),
      name: assetName.trim() || "新资产",
      type: assetType,
      balance: value,
      currency: "CNY",
      createdAt: asset?.createdAt ?? now,
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
      id: loan?.id ?? createId("loan"),
      userId: loan?.userId ?? "local-user",
      accountId: loan?.accountId ?? getCurrentAccountId(),
      platform: loanPlatform.trim() || "新贷款",
      totalAmount: total,
      remainingAmount: loanRemainingAmount === "" ? total : Number(loanRemainingAmount) || 0,
      periods: Math.max(1, Number(loanPeriods) || 12),
      paidPeriods: loan?.paidPeriods ?? 0,
      monthlyPayment: Number(loanMonthlyPayment) || 0,
      dueDate: Math.min(31, Math.max(1, Number(loanDueDay) || 20)),
      status: loan?.status ?? "ACTIVE",
      matchKeywords: loanMatchKeywords.trim() || null,
      createdAt: loan?.createdAt ?? now,
      updatedAt: now,
    });
    draftSubmittedRef.current = true;
    clearNewEntryDraft(draftKind);
    window.dispatchEvent(new Event("stark:loan-saved"));
    setLoanPlatform("");
    setLoanMatchKeywords("");
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
      const result = recordSavingsPlanDeposit(savingsPlan, savingsGoal, value, proofImage, now, recordedDate.length === 16 ? `${recordedDate}:00` : recordedDate);
      await repo.saveSavingsGoal(result.goal);
      await repo.saveSavingsPlan(result.plan);
      window.dispatchEvent(new Event("stark:savings-saved"));
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
      className={`journal-overlay ${isPage ? "page" : ""} ${keyboardViewport ? "keyboard-open" : ""} ${visible ? "visible" : ""}`}
      style={keyboardViewportStyle}
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
        <div className="journal-sheet-handle" aria-hidden="true" />
        <div className="journal-header modern-journal-header">
          <button type="button" className="journal-back-btn" onClick={handleClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="journal-header-title">{isSavings ? isEditingSavings ? "编辑储蓄目标" : "添加储蓄" : isSavingsRecord ? "记录储蓄" : isAsset ? (isEditingAsset ? "编辑资产" : "新增资产") : isLoan ? (isEditingLoan ? "编辑贷款" : "新增贷款") : isRepayment ? "记录贷款还款" : (isEditingTransaction ? "编辑流水" : "记一笔")}</span>
          <button type="button" className="journal-close-btn" onClick={handleClose}>
            ×
          </button>
        </div>

        {isSavings ? (
          <SavingsPlanner key={savingsGoalId ?? "new-savings-goal"} embedded onSaved={onSaved ?? handleClose} savingsGoalId={savingsGoalId} />
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
            <label className="modern-form-group">
              <span>实际存入日期</span>
              <input type="datetime-local" className="modern-form-input" value={recordedDate} onChange={(event) => setRecordedDate(event.target.value)} />
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
              <div className="modern-form-group">
                <label>账单匹配关键词（选填）</label>
                <input
                  value={loanMatchKeywords}
                  onChange={(event) => setLoanMatchKeywords(event.target.value)}
                  placeholder="如：招行信用卡 1234；多个关键词用逗号分隔"
                  className="modern-form-input"
                />
                <small className="modern-form-tip">导入账单时，需同时命中还款字样和贷款名称/关键词才会自动冲销。</small>
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
        ) : isRepayment ? (
          <div className="modern-form-wrapper">
            <div className="modern-form-card">
              <div className="modern-form-group"><label>还款金额 (元)</label><div className="modern-amount-box"><span className="cur-sym">¥</span><input inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value.replace(/[^\d.]/g, ""))} placeholder="0.00" className="modern-amount-field" /></div></div>
              <div className="modern-form-group"><label>实际还款日期</label><input type="datetime-local" className="modern-form-input" value={date} onChange={(event) => setDate(event.target.value)} /></div>
              <div className="modern-form-group"><label>备注</label><input value={description} onChange={(event) => setDescription(event.target.value)} placeholder="可选" className="modern-form-input" /></div>
            </div>
            <button type="button" className="modern-primary-submit" disabled={!amount || Number(amount) <= 0} onClick={() => void saveRepayment()}>保存还款</button>
          </div>
        ) : (
          <div className="modern-journal-flow">
            {!isSalaryPreset || salaryEntryOpen ? (
              <div className="journal-entry-kind-switch" aria-label="记账类型">
                <button
                  type="button"
                  className={!salaryEntryOpen ? "active" : ""}
                  onClick={() => {
                    setSalaryEntryOpen(false);
                    setType("EXPENSE");
                    setCategory("餐饮");
                  }}
                >
                  普通记账
                </button>
                <button
                  type="button"
                  className={salaryEntryOpen ? "active" : ""}
                  onClick={() => {
                    setSalaryEntryOpen(true);
                    setType("INCOME");
                    setCategory("工资");
                  }}
                >
                  添加薪资收入
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="journal-salary-entry-trigger"
                onClick={() => {
                  setSalaryEntryOpen(true);
                  setType("INCOME");
                  setCategory("工资");
                }}
              >
                ＋ 添加薪资收入
              </button>
            )}

            {salaryEntryOpen ? (
              <div className="salary-entry-mode-switch" aria-label="薪资录入方式">
                <button type="button" className={salaryEntryMode === "single" ? "active" : ""} onClick={() => setSalaryEntryMode("single")}>单月录入</button>
                <button type="button" className={salaryEntryMode === "batch" ? "active" : ""} onClick={() => setSalaryEntryMode("batch")}>批量补录</button>
              </div>
            ) : null}

            {!salaryEntryOpen || salaryEntryMode === "single" ? <>
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
                      <img src={categoryIconSrcForCategory(item, type)} alt="" className="tile-icon" />
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
                  placeholder="商户名称（选填）"
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
            </> : (
              <div className="salary-batch-workbench">
                <div className="salary-batch-intro">
                  <span>历史工资补录</span>
                  <p>选择年份和月份后，将按同一金额生成工资收入；已存在工资的月份会自动跳过。</p>
                </div>

                <label className="salary-batch-year-field">
                  <span>补录年份</span>
                  <input type="number" min={2000} max={9999} inputMode="numeric" value={batchYear} onChange={(event) => setBatchYear(event.target.value.replace(/\D/g, "").slice(0, 4))} />
                </label>

                <div className="salary-batch-months-section">
                  <div className="salary-batch-section-head">
                    <span>选择月份</span>
                    <div>
                      <button type="button" onClick={() => setBatchMonths(SALARY_BATCH_MONTHS)}>全选</button>
                      <button type="button" onClick={() => setBatchMonths([])}>清空</button>
                    </div>
                  </div>
                  <div className="salary-batch-month-grid">
                    {SALARY_BATCH_MONTHS.map((month) => (
                      <button key={month} type="button" className={batchMonths.includes(month) ? "active" : ""} onClick={() => toggleBatchMonth(month)} aria-pressed={batchMonths.includes(month)}>
                        {month}月
                      </button>
                    ))}
                  </div>
                </div>

                <div className="salary-batch-fields">
                  <label>
                    <span>每月工资（元）</span>
                    <div className="modern-amount-box">
                      <span className="cur-sym">¥</span>
                      <input inputMode="decimal" value={batchAmount} onChange={(event) => setBatchAmount(event.target.value.replace(/[^0-9.]/g, ""))} placeholder="0.00" />
                    </div>
                  </label>
                  <label>
                    <span>发薪日</span>
                    <div className="salary-batch-payday">
                      <input type="number" min={1} max={28} inputMode="numeric" value={batchPayday} onChange={(event) => setBatchPayday(event.target.value.replace(/\D/g, "").slice(0, 2))} />
                      <em>日</em>
                    </div>
                  </label>
                </div>

                <div className="modern-section-block">
                  <span className="section-mini-title">入账账户</span>
                  <div className="modern-pill-row">
                    {platforms.map((item) => (
                      <button key={item} type="button" onClick={() => setPlatform(item)} className={`account-pill ${platform === item ? "active" : ""}`}>{item}</button>
                    ))}
                  </div>
                </div>

                <label className="salary-batch-merchant-field">
                  <span>发薪单位（选填）</span>
                  <input value={batchMerchant} onChange={(event) => setBatchMerchant(event.target.value)} placeholder="未填写则标记为工资补录" />
                </label>

                <p className={`salary-batch-notice ${batchNotice.startsWith("已补录") ? "success" : ""}`} role="status">
                  {batchNotice || (batchMonths.length ? `已选择 ${batchMonths.length} 个月，确认后将先检查是否已有工资记录。` : "请选择要补录的月份。")}
                </p>
                <button type="button" className="salary-batch-submit" disabled={batchSaving || !batchMonths.length || !batchAmount || Number(batchAmount) <= 0} onClick={() => void saveSalaryBatch()}>
                  {batchSaving ? "补录中..." : `确认补录 ${batchMonths.length} 个月工资`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
