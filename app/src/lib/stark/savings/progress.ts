import type { SavingsGoal, SavingsPlan } from "../models/types";
import { clampPercent } from "../utils/format";
import { savingsPlanRecordedAmount } from "./planner";

/** Use the same recorded savings and target amounts throughout the app. */
export function summarizeSavingsProgress(goals: readonly SavingsGoal[], plans: readonly SavingsPlan[]) {
  const recordedSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
  const completedAmount = plans.reduce((sum, plan) => sum + savingsPlanRecordedAmount(plan), 0);
  const savedAmount = Math.max(recordedSaved, completedAmount);
  const plannedTotal = plans.reduce((sum, plan) => sum + plan.amount, 0);
  const target = goals.reduce((sum, goal) => sum + goal.targetAmount, 0) || plannedTotal;

  return {
    savedAmount,
    target,
    percent: target > 0 ? clampPercent((savedAmount / target) * 100) : 0,
  };
}
