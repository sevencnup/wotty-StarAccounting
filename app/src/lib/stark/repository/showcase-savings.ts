import type { SavingsGoal, SavingsPlan } from "../models/types";

const CREATED_AT = "2026-10-01 09:00:00";

function historicalPlan(id: string, goalId: string, month: string, amount: number, day: number): SavingsPlan {
  const date = `${month}-${String(day).padStart(2, "0")}`;
  return {
    id, goalId, month, amount, actualAmount: amount, status: "COMPLETED", actualDate: date,
    salary: 0, expenses: "{}", remark: "单月存模式",
    createdAt: `${date} 09:00:00`, updatedAt: `${date} 12:00:00`,
  };
}

export const showcaseHistoricalSavingsPlans: SavingsPlan[] = [
  historicalPlan("showcase-plan-may-home", "showcase-goal-home", "2026-05", 14_100, 15),
  historicalPlan("showcase-plan-jun-travel", "showcase-goal-travel", "2026-06", 3_200, 20),
  historicalPlan("showcase-plan-jul-reserve", "showcase-goal-reserve", "2026-07", 14_200, 12),
];

export const showcaseSavingsPlans: SavingsPlan[] = [
  ...showcaseHistoricalSavingsPlans,
  { id: "showcase-plan-oct-home", goalId: "showcase-goal-home", month: "2026-10", amount: 6_000, actualAmount: 6_000, status: "COMPLETED", actualDate: "2026-10-15", salary: 19_680, expenses: JSON.stringify({ 房租: 4_200, 水电: 460, 网费: 120, 通勤: 600, 会员订阅: 88 }), remark: "单月存模式", createdAt: CREATED_AT, updatedAt: "2026-10-15 13:00:00" },
  { id: "showcase-plan-oct-travel", goalId: "showcase-goal-travel", month: "2026-10", amount: 1_000, actualAmount: 1_000, status: "COMPLETED", actualDate: "2026-10-16", salary: 0, expenses: "{}", remark: "单月存模式", createdAt: CREATED_AT, updatedAt: "2026-10-16 13:00:00" },
  { id: "showcase-plan-sep-reserve", goalId: "showcase-goal-reserve", month: "2026-09", amount: 1_200, actualAmount: 1_200, status: "COMPLETED", actualDate: "2026-09-15", salary: 11_800, expenses: JSON.stringify({ 房租: 4_200, 水电: 430, 网费: 120, 通勤: 560, 会员订阅: 88 }), remark: "单月存模式", createdAt: CREATED_AT, updatedAt: "2026-09-15 13:00:00" },
  { id: "showcase-plan-aug-home", goalId: "showcase-goal-home", month: "2026-08", amount: 2_000, actualAmount: 2_000, status: "COMPLETED", actualDate: "2026-08-15", salary: 13_400, expenses: JSON.stringify({ 房租: 4_200, 水电: 510, 网费: 120, 通勤: 580, 会员订阅: 88 }), remark: "单月存模式", createdAt: CREATED_AT, updatedAt: "2026-08-15 13:00:00" },
  { id: "showcase-plan-nov-travel", goalId: "showcase-goal-travel", month: "2026-11", amount: 800, actualAmount: 0, status: "PENDING", salary: 19_680, expenses: JSON.stringify({ 房租: 4_200, 水电: 480, 网费: 120, 通勤: 600, 会员订阅: 88 }), remark: "单月存模式", createdAt: CREATED_AT, updatedAt: CREATED_AT },
];

function completedAmount(plans: readonly SavingsPlan[], goalId: string) {
  return plans.reduce((sum, plan) => {
    if (plan.goalId !== goalId || plan.status !== "COMPLETED") return sum;
    const actual = Number(plan.actualAmount);
    return sum + (plan.actualAmount !== null && plan.actualAmount !== undefined && Number.isFinite(actual) && actual >= 0
      ? actual
      : plan.amount);
  }, 0);
}

const goalTemplates: Omit<SavingsGoal, "currentAmount">[] = [
  { id: "showcase-goal-home", userId: "local-user", accountId: "default", name: "新家首付", targetAmount: 50_000, deadline: "2027-06-30", type: "LONG_TERM", status: "ACTIVE", depositType: "PRIVATE", planConfig: JSON.stringify({ frequency: "MONTHLY", columns: ["房租", "水电", "网费", "通勤", "会员订阅", "其他"], fixedColumns: ["房租", "水电", "网费", "通勤", "会员订阅", "其他"] }), createdAt: CREATED_AT, updatedAt: CREATED_AT },
  { id: "showcase-goal-travel", userId: "local-user", accountId: "default", name: "年度旅行", targetAmount: 8_000, deadline: "2026-12-31", type: "YEARLY", status: "ACTIVE", depositType: "CASH", createdAt: CREATED_AT, updatedAt: CREATED_AT },
  { id: "showcase-goal-reserve", userId: "local-user", accountId: "default", name: "紧急备用金", targetAmount: 20_000, type: "LONG_TERM", status: "ACTIVE", depositType: "FIXED_TERM", createdAt: CREATED_AT, updatedAt: CREATED_AT },
];

export const showcaseSavingsGoals: SavingsGoal[] = goalTemplates.map((goal) => ({
  ...goal,
  currentAmount: completedAmount(showcaseSavingsPlans, goal.id),
}));

/** Fill only a recognizable missing demo history; never rewrite a visitor's records. */
export function missingShowcaseSavingsHistory(goals: readonly SavingsGoal[], plans: readonly SavingsPlan[]) {
  return showcaseHistoricalSavingsPlans.filter((sample) => {
    if (plans.some((plan) => plan.id === sample.id)) return false;
    const goal = goals.find((item) => item.id === sample.goalId);
    if (!goal) return false;
    const missingCents = Math.round((goal.currentAmount - completedAmount(plans, goal.id)) * 100);
    return missingCents === Math.round(sample.amount * 100);
  });
}
