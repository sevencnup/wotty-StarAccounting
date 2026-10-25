import type { Asset, Loan, SavingsGoal, SavingsPlan, Transaction } from "../models/types";
import type { ShowcaseAssetDelta, ShowcaseAutoEvent } from "./showcase-monthly-cycle";

export interface ShowcaseLedgerState {
  transactions: Transaction[];
  assets: Asset[];
  loans: Loan[];
  goals: SavingsGoal[];
  plans: SavingsPlan[];
}

/** Apply only events not already present, keeping visitor changes to existing records. */
export function reconcileShowcaseEvents(state: ShowcaseLedgerState, events: ShowcaseAutoEvent[], month: string, income: number) {
  const existingTransactions = new Set(state.transactions.map((item) => item.id));
  const assets = new Map(state.assets.map((item) => [item.id, item]));
  const loans = new Map(state.loans.map((item) => [item.id, item]));
  const goals = new Map(state.goals.map((item) => [item.id, item]));
  const plans = new Map(state.plans.map((item) => [item.id, item]));
  const newTransactions: Transaction[] = [];
  const changedAssets = new Set<string>();
  const changedLoans = new Set<string>();
  const changedGoals = new Set<string>();
  const changedPlans = new Set<string>();

  function applyAssetDelta(delta: ShowcaseAssetDelta, date: string, scale = 1) {
    for (const [id, amount] of Object.entries(delta)) {
      const asset = assets.get(id);
      if (!asset || !amount) continue;
      assets.set(id, { ...asset, balance: Math.round((asset.balance + amount * scale) * 100) / 100, updatedAt: `${date} 12:00:00` });
      changedAssets.add(id);
    }
  }

  // Align the original pending November plan before its completion event.
  if (month === "2026-11" && events.some((event) => event.date <= "2026-11-15")) {
    const legacy = plans.get("showcase-plan-nov-travel");
    if (legacy?.salary === 19_680 && legacy.status === "PENDING") {
      plans.set(legacy.id, { ...legacy, salary: income });
      changedPlans.add(legacy.id);
    }
  }

  for (const event of events) {
    if (event.kind === "transaction") {
      if (existingTransactions.has(event.record.id)) continue;
      let record = event.record;
      if (event.loanId) {
        const loan = loans.get(event.loanId);
        if (!loan || loan.status === "PAID_OFF" || loan.remainingAmount <= 0) continue;
        const paid = Math.min(record.amount, loan.remainingAmount);
        record = paid === record.amount ? record : { ...record, amount: paid };
        loans.set(event.loanId, {
          ...loan,
          remainingAmount: Math.round((loan.remainingAmount - paid) * 100) / 100,
          paidPeriods: Math.min(loan.periods, loan.paidPeriods + (paid >= loan.monthlyPayment ? 1 : 0)),
          status: paid >= loan.remainingAmount ? "PAID_OFF" : "ACTIVE",
          updatedAt: `${event.date} 12:00:00`,
        });
        changedLoans.add(event.loanId);
      }
      newTransactions.push(record);
      existingTransactions.add(record.id);
      applyAssetDelta(event.assetDelta, event.date, record.amount / event.record.amount);
      continue;
    }

    if (event.kind === "plan-create") {
      if (plans.has(event.record.id)) continue;
      const goal = goals.get(event.record.goalId);
      if (!goal || goal.status !== "ACTIVE" || goal.currentAmount >= goal.targetAmount) continue;
      plans.set(event.record.id, event.record);
      changedPlans.add(event.record.id);
      continue;
    }

    const plan = plans.get(event.planId);
    const goal = goals.get(event.goalId);
    if (!plan || plan.goalId !== event.goalId || plan.status !== "PENDING" || plan.amount !== event.expectedAmount || !goal || goal.status !== "ACTIVE") continue;
    const actual = Math.min(plan.amount, Math.max(0, goal.targetAmount - goal.currentAmount));
    if (actual <= 0) continue;
    plans.set(plan.id, { ...plan, status: "COMPLETED", actualAmount: actual, actualDate: event.date, updatedAt: `${event.date} 12:00:00` });
    changedPlans.add(plan.id);
    const currentAmount = Math.round((goal.currentAmount + actual) * 100) / 100;
    goals.set(goal.id, { ...goal, currentAmount, status: currentAmount >= goal.targetAmount ? "COMPLETED" : goal.status, updatedAt: `${event.date} 12:00:00` });
    changedGoals.add(goal.id);
    applyAssetDelta({ "showcase-asset-bank": -actual }, event.date);
  }

  return {
    newTransactions,
    changedAssets: [...changedAssets].map((id) => assets.get(id)!),
    changedLoans: [...changedLoans].map((id) => loans.get(id)!),
    changedGoals: [...changedGoals].map((id) => goals.get(id)!),
    changedPlans: [...changedPlans].map((id) => plans.get(id)!),
  };
}
