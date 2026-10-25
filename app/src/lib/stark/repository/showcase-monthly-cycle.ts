import type { SavingsPlan, Transaction } from "../models/types";

export const SHOWCASE_AUTO_START_MONTH = "2026-10";

const USER_ID = "local-user";
const ACCOUNT_ID = "default";
const BANK_ID = "showcase-asset-bank";
const WECHAT_ID = "showcase-asset-wechat";
const ALIPAY_ID = "showcase-asset-alipay";
const HOME_LOAN_ID = "showcase-loan-home";
const CAR_LOAN_ID = "showcase-loan-car";
const HOME_GOAL_ID = "showcase-goal-home";

export type ShowcaseAssetDelta = Partial<Record<typeof BANK_ID | typeof WECHAT_ID | typeof ALIPAY_ID, number>>;

export type ShowcaseAutoEvent =
  | { kind: "transaction"; date: string; record: Transaction; assetDelta: ShowcaseAssetDelta; loanId?: string }
  | { kind: "plan-create"; date: string; record: SavingsPlan }
  | { kind: "plan-complete"; date: string; planId: string; goalId: string; expectedAmount: number };

function seededRandom(month: string) {
  let state = 2166136261;
  for (const char of `star-accounting-showcase:${month}`) {
    state = Math.imul(state ^ char.charCodeAt(0), 16777619);
  }
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function randomInteger(random: () => number, min: number, max: number) {
  return min + Math.floor(random() * (max - min + 1));
}

function dateOf(month: string, day: number) {
  return `${month}-${String(day).padStart(2, "0")}`;
}

function transaction(id: string, date: string, amount: number, type: Transaction["type"], category: string, merchant: string, platform: string, loanId?: string): Transaction {
  const timestamp = `${date} ${type === "INCOME" ? "09:00:00" : "12:00:00"}`;
  return {
    id,
    userId: USER_ID,
    accountId: ACCOUNT_ID,
    amount,
    type,
    category,
    platform,
    merchant,
    date: timestamp,
    description: type === "REPAYMENT" ? "演示账本按月还款" : null,
    orderId: id,
    paymentMethod: platform,
    status: "已完成",
    loanId: loanId ?? null,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function expenseEvent(month: string, label: string, day: number, amount: number, category: string, merchant: string, platform: string): ShowcaseAutoEvent {
  const date = dateOf(month, day);
  const id = `showcase-auto-expense-${month}-${label}`;
  const assetId = platform === "微信" ? WECHAT_ID : platform === "支付宝" ? ALIPAY_ID : BANK_ID;
  return { kind: "transaction", date, record: transaction(id, date, amount, "EXPENSE", category, merchant, platform), assetDelta: { [assetId]: -amount } };
}

function transferEvent(month: string, target: "wechat" | "alipay", amount: number): ShowcaseAutoEvent {
  const date = dateOf(month, 1);
  const assetId = target === "wechat" ? WECHAT_ID : ALIPAY_ID;
  const merchant = target === "wechat" ? "微信零钱充值" : "支付宝余额充值";
  return {
    kind: "transaction",
    date,
    record: transaction(`showcase-auto-transfer-${month}-${target}`, date, amount, "TRANSFER", "账户划转", merchant, "银行卡"),
    assetDelta: { [BANK_ID]: -amount, [assetId]: amount },
  };
}

const variableExpenses = [
  { day: 2, category: "餐饮", merchant: "工作日午餐", platform: "微信", min: 45, max: 135 },
  { day: 4, category: "日用", merchant: "社区超市", platform: "支付宝", min: 100, max: 310 },
  { day: 5, category: "餐饮", merchant: "周末聚餐", platform: "微信", min: 160, max: 430 },
  { day: 7, category: "交通", merchant: "网约车", platform: "支付宝", min: 40, max: 150 },
  { day: 9, category: "餐饮", merchant: "咖啡与简餐", platform: "微信", min: 60, max: 175 },
  { day: 11, category: "购物", merchant: "生活好物", platform: "支付宝", min: 180, max: 750 },
  { day: 13, category: "日用", merchant: "家庭采购", platform: "微信", min: 110, max: 360 },
  { day: 14, category: "餐饮", merchant: "朋友聚餐", platform: "支付宝", min: 130, max: 420 },
  { day: 17, category: "娱乐", merchant: "电影与演出", platform: "微信", min: 75, max: 280 },
  { day: 19, category: "餐饮", merchant: "下班晚餐", platform: "支付宝", min: 45, max: 145 },
  { day: 21, category: "购物", merchant: "衣物与家居", platform: "支付宝", min: 190, max: 680 },
  { day: 23, category: "日用", merchant: "日常补给", platform: "微信", min: 90, max: 330 },
  { day: 25, category: "餐饮", merchant: "周末早午餐", platform: "微信", min: 85, max: 260 },
  { day: 28, category: "交通", merchant: "出行交通", platform: "支付宝", min: 70, max: 290 },
] as const;

/** The recipe is pure: the same calendar month always produces the same sample records. */
export function buildShowcaseMonth(month: string): { income: number; events: ShowcaseAutoEvent[] } {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error(`Invalid showcase month: ${month}`);
  const random = seededRandom(month);
  const income = randomInteger(random, 10_000, 20_000);
  const events: ShowcaseAutoEvent[] = [];

  if (month === SHOWCASE_AUTO_START_MONTH) {
    // The original October ledger already has its salary, loans and deposits.
    for (const [index, sample] of variableExpenses.entries()) {
      if (sample.day <= 18) continue;
      events.push(expenseEvent(month, String(index + 1), sample.day, randomInteger(random, sample.min, sample.max), sample.category, sample.merchant, sample.platform));
    }
    return { income: 19_680, events };
  }

  events.push(transferEvent(month, "wechat", 1_500));
  events.push(transferEvent(month, "alipay", 1_500));
  const utilities = month === "2026-11" ? 480 : randomInteger(random, 350, 580);
  const commute = month === "2026-11" ? 600 : randomInteger(random, 420, 680);
  events.push(expenseEvent(month, "rent", 3, 4_200, "住房", "每月房租", "银行卡"));
  events.push(expenseEvent(month, "utilities", 8, utilities, "住房", "水电物业", "银行卡"));
  events.push(expenseEvent(month, "internet", 10, 120, "日用", "家庭宽带", "银行卡"));
  events.push(expenseEvent(month, "commute", 12, commute, "交通", "月度通勤", "银行卡"));
  events.push(expenseEvent(month, "membership", 12, 88, "娱乐", "会员订阅", "支付宝"));
  for (const [index, sample] of variableExpenses.entries()) {
    events.push(expenseEvent(month, String(index + 1), sample.day, randomInteger(random, sample.min, sample.max), sample.category, sample.merchant, sample.platform));
  }

  const salaryDate = dateOf(month, 15);
  events.push({
    kind: "transaction",
    date: salaryDate,
    record: transaction(`showcase-auto-salary-${month}`, salaryDate, income, "INCOME", "工资", "星会计科技", "银行卡"),
    assetDelta: { [BANK_ID]: income },
  });
  for (const [slug, day, amount, loanId, category] of [
    ["home", 15, 2_100, HOME_LOAN_ID, "住房贷款"],
    ["car", 20, 900, CAR_LOAN_ID, "汽车贷款"],
  ] as const) {
    const date = dateOf(month, day);
    events.push({
      kind: "transaction",
      date,
      record: transaction(`showcase-auto-repayment-${month}-${slug}`, date, amount, "REPAYMENT", category, `${category}月供`, "银行卡", loanId),
      assetDelta: { [BANK_ID]: -amount },
      loanId,
    });
  }

  const planAmount = randomInteger(random, 800, 1_400);
  const planId = `showcase-auto-plan-${month}-home`;
  const createdAt = `${dateOf(month, 1)} 09:00:00`;
  events.push({
    kind: "plan-create",
    date: dateOf(month, 1),
    record: {
      id: planId,
      goalId: HOME_GOAL_ID,
      month,
      amount: planAmount,
      actualAmount: 0,
      status: "PENDING",
      salary: income,
      expenses: JSON.stringify({ 房租: 4_200, 水电: utilities, 网费: 120, 通勤: commute, 会员订阅: 88 }),
      remark: "单月存模式",
      createdAt,
      updatedAt: createdAt,
    },
  });
  events.push({ kind: "plan-complete", date: dateOf(month, 20), planId, goalId: HOME_GOAL_ID, expectedAmount: planAmount });
  if (month === "2026-11") {
    events.push({ kind: "plan-complete", date: dateOf(month, 20), planId: "showcase-plan-nov-travel", goalId: "showcase-goal-travel", expectedAmount: 800 });
  }
  events.sort((a, b) => a.date.localeCompare(b.date));
  return { income, events };
}
