import type { SavingsGoalDepositType } from "@/lib/stark/models";

export const SAVINGS_DEPOSIT_TYPE_OPTIONS: Array<{ value: SavingsGoalDepositType; label: string }> = [
  { value: "PRIVATE", label: "死期" },
  { value: "CASH", label: "现金" },
  { value: "HELP_DEPOSIT", label: "他人帮存" },
];

export function normalizeSavingsDepositType(value?: SavingsGoalDepositType | null): SavingsGoalDepositType {
  if (value === "FIXED_TERM") return "PRIVATE";
  if (value === "HELP_DEPOSIT" || value === "PRIVATE" || value === "CASH") return value;
  return "CASH";
}

export function savingsDepositTypeLabel(value?: SavingsGoalDepositType | null) {
  return SAVINGS_DEPOSIT_TYPE_OPTIONS.find((item) => item.value === normalizeSavingsDepositType(value))?.label ?? "现金";
}
