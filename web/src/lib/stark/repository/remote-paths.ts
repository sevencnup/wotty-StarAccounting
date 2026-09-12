export function savingsPlansPath(goalId: string) {
  return `/api/savings-plans?goalId=${encodeURIComponent(goalId)}`;
}

export function transactionsImportPath(accountId: string) {
  return `/api/transactions/import?accountId=${encodeURIComponent(accountId)}`;
}
