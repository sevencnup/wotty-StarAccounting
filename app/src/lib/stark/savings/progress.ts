import type { SavingsGoal, SavingsPlan } from "../models/types";
import { clampPercent } from "../utils/format";
import { savingsPlanRecordedAmount } from "./planner";

/** Use the same recorded savings and target amounts throughout the app. */
export function summarizeSavingsProgress(goals: readonly SavingsGoal[], plans: readonly SavingsPlan[]) {
  const completedAmount = plans.reduce((sum, plan) => sum + savingsPlanRecordedAmount(plan), 0);
  const savedAmount = goals.length
    ? goals.reduce((sum, goal) => sum + savingsGoalRecordedAmount(goal, plans), 0)
    : completedAmount;
  const plannedTotal = plans.reduce((sum, plan) => sum + plan.amount, 0);
  const target = goals.reduce((sum, goal) => sum + goal.targetAmount, 0) || plannedTotal;

  return {
    savedAmount,
    target,
    percent: target > 0 ? clampPercent((savedAmount / target) * 100) : 0,
  };
}

/** Reconcile a goal's stored amount with completed plan records without double counting. */
export function summarizeSavingsGoalProgress(goal: SavingsGoal, plans: readonly SavingsPlan[]) {
  const completedAmount = plans
    .filter((plan) => plan.goalId === goal.id)
    .reduce((sum, plan) => sum + savingsPlanRecordedAmount(plan), 0);
  const savedAmount = Math.max(goal.currentAmount, completedAmount);
  const target = goal.targetAmount;

  return {
    savedAmount,
    target,
    percent: target > 0 ? clampPercent((savedAmount / target) * 100) : 0,
  };
}

function savingsGoalRecordedAmount(goal: SavingsGoal, plans: readonly SavingsPlan[]) {
  return summarizeSavingsGoalProgress(goal, plans).savedAmount;
}
