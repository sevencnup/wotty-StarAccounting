export function savingsPlansPath(goalId: string) {
  return `/api/savings-plans?goalId=${encodeURIComponent(goalId)}`;
}
