import type { SavingsPlan } from "../models";

export interface RecentSavingsPlanGroup {
  year: string;
  plans: SavingsPlan[];
}

function planMonthValue(plan: SavingsPlan) {
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(plan.month);
  if (!match) return Number.MAX_SAFE_INTEGER;
  return Number(match[1]) * 12 + Number(match[2]);
}

function planYear(plan: SavingsPlan) {
  return /^(\d{4})-(0[1-9]|1[0-2])$/.exec(plan.month)?.[1] ?? "未设置";
}

/** Keeps the schedule chronological instead of treating it as an activity feed. */
export function groupRecentSavingsPlans(plans: readonly SavingsPlan[], limit = 8): RecentSavingsPlanGroup[] {
  const chronological = [...plans]
    .sort((left, right) => (
      planMonthValue(left) - planMonthValue(right)
      || left.month.localeCompare(right.month)
      || left.id.localeCompare(right.id)
    ))
    .slice(-limit);
  const groups = new Map<string, SavingsPlan[]>();

  for (const plan of chronological) {
    const year = planYear(plan);
    const group = groups.get(year);
    if (group) group.push(plan);
    else groups.set(year, [plan]);
  }

  return [...groups.entries()].map(([year, groupedPlans]) => ({ year, plans: groupedPlans }));
}
