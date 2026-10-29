export interface BudgetAllocationAmounts {
  income: number;
  expense: number;
  repayment: number;
  savings: number;
  assetTotal: number;
}

export interface BudgetAllocation extends BudgetAllocationAmounts {
  available: number;
}

export function calculateBudgetAllocation(amounts: BudgetAllocationAmounts): BudgetAllocation {
  return {
    ...amounts,
    available: amounts.income - amounts.expense - amounts.repayment - amounts.savings,
  };
}
