export type DataMode = "LOCAL" | "CLOUD";

export type TransactionType = "INCOME" | "EXPENSE" | "TRANSFER" | "REPAYMENT";

export interface Transaction {
  id: string;
  userId: string;
  accountId: string;
  amount: number;
  type: TransactionType;
  category: string;
  platform: string;
  merchant?: string | null;
  date: string;
  description?: string | null;
  orderId?: string | null;
  paymentMethod?: string | null;
  status?: string | null;
  loanId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AssetType = "CASH" | "BANK_CARD" | "ALIPAY" | "WECHAT" | "INVESTMENT" | "OTHER";

export interface Asset {
  id: string;
  userId: string;
  accountId: string;
  name: string;
  type: AssetType;
  balance: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export type BudgetPeriod = "MONTHLY" | "YEARLY";
export type BudgetScopeType = "GLOBAL" | "CATEGORY" | "PLATFORM";

export interface Budget {
  id: string;
  userId: string;
  accountId: string;
  amount: number;
  category: string;
  period: BudgetPeriod;
  alertPercent: number;
  platform?: string | null;
  scopeType: BudgetScopeType;
  createdAt: string;
  updatedAt: string;
}

export type LoanStatus = "ACTIVE" | "PAID_OFF" | "OVERDUE";

export interface Loan {
  id: string;
  userId: string;
  accountId: string;
  platform: string;
  totalAmount: number;
  remainingAmount: number;
  periods: number;
  paidPeriods: number;
  monthlyPayment: number;
  dueDate: number;
  status: LoanStatus;
  matchKeywords?: string | null;
  createdAt: string;
  updatedAt: string;
}

export type SavingsGoalType = "MONTHLY" | "YEARLY" | "LONG_TERM" | "BI_MONTHLY_ODD" | "BI_MONTHLY_EVEN";
export type SavingsGoalStatus = "ACTIVE" | "COMPLETED" | "ARCHIVED";
export type SavingsPlanStatus = "PENDING" | "COMPLETED" | "SKIPPED";
export type SavingsGoalDepositType = "CASH" | "FIXED_TERM" | "HELP_DEPOSIT";

export interface SavingsGoal {
  id: string;
  userId: string;
  accountId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string | null;
  type: SavingsGoalType;
  status: SavingsGoalStatus;
  depositType: SavingsGoalDepositType;
  planConfig?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsPlan {
  id: string;
  goalId: string;
  amount: number;
  status: SavingsPlanStatus;
  month: string;
  createdAt: string;
  updatedAt: string;
  expenses?: string | null;
  remark?: string | null;
  salary?: number | null;
  proofImage?: string | null;
}

export type AccountRole = "OWNER" | "ADMIN" | "MEMBER";

export interface Account {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccountMember {
  id: string;
  accountId: string;
  userId: string;
  role: AccountRole;
  nickname?: string | null;
  canViewOwn: boolean;
  canManageOwn: boolean;
  canViewAll: boolean;
  canManageAll: boolean;
  joinedAt: string;
}

export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string;
  email: string;
  password: string;
  name?: string | null;
  defaultAccountId?: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRate {
  id: string;
  from: string;
  to: string;
  rate: number;
  updatedAt: string;
}

export interface CategoryRule {
  id: string;
  userId: string;
  accountId: string;
  name?: string | null;
  merchant: string;
  merchantKey: string;
  category: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ImportErrorLog {
  id: string;
  userId: string;
  accountId: string;
  fileName: string;
  lineNumber: number;
  rawData: string;
  errorMessage: string;
  errorType: string;
  resolved: boolean;
  createdAt: string;
}

export interface ThemeConfig {
  id: string;
  userId: string;
  accountId?: string | null;
  themeId: string;
  primaryColor?: string | null;
  radius?: number | null;
  isDarkMode: boolean;
  chartStyle?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: number;
}
