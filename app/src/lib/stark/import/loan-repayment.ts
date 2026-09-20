import type { Loan, Transaction } from "@/lib/stark/models";

type LoanMatchCandidate = {
  loan: Loan;
  score: number;
};

const repaymentPattern = /还款|偿还|还贷|信用卡(?:账单|还款)|贷款(?:账单|还款)/;

function normalize(value: string | null | undefined) {
  return (value ?? "").toLocaleLowerCase().replace(/[\s\-_/\\.,，。:：;；()（）【】\[\]{}]/g, "");
}

function matchTerms(loan: Loan) {
  return [loan.platform, ...(loan.matchKeywords ?? "").split(/[,，;；\n|]/)]
    .map((value) => normalize(value))
    .filter((value) => value.length >= 2);
}

function billText(transaction: Transaction) {
  return [
    transaction.category,
    transaction.merchant,
    transaction.description,
    transaction.paymentMethod,
    transaction.remarkCategory,
  ].filter(Boolean).join(" ");
}

/**
 * 账单必须同时明确是还款，且能唯一命中一笔未结清贷款，才允许自动关联。
 * 匹配关键词可用逗号、分号或换行分隔，用于区分同一银行的多笔贷款。
 */
export function findLoanForBillRepayment(transaction: Transaction, loans: Loan[]) {
  if (transaction.loanId || transaction.type === "INCOME") return null;
  const rawText = billText(transaction);
  if (!repaymentPattern.test(rawText)) return null;
  const hasExplicitRepaymentRemark = repaymentPattern.test(transaction.remarkCategory ?? "");
  if (transaction.type === "TRANSFER" && !hasExplicitRepaymentRemark) return null;

  const normalizedText = normalize(rawText);
  const candidates: LoanMatchCandidate[] = loans.flatMap((loan) => {
    if (loan.status === "PAID_OFF" || loan.remainingAmount <= 0) return [];
    const score = Math.max(0, ...matchTerms(loan).filter((term) => normalizedText.includes(term)).map((term) => term.length));
    return score > 0 ? [{ loan, score }] : [];
  });

  if (!candidates.length) return null;
  const highestScore = Math.max(...candidates.map((candidate) => candidate.score));
  const bestMatches = candidates.filter((candidate) => candidate.score === highestScore);
  return bestMatches.length === 1 ? bestMatches[0].loan : null;
}

export function matchImportedLoanRepayments(transactions: Transaction[], loans: Loan[]) {
  let matchedCount = 0;
  let matchedAmount = 0;
  const matchedTransactions = transactions.map((transaction) => {
    const loan = findLoanForBillRepayment(transaction, loans);
    if (!loan) return transaction;
    matchedCount += 1;
    matchedAmount += transaction.amount;
    return {
      ...transaction,
      type: "REPAYMENT" as const,
      category: "还款",
      loanId: loan.id,
    };
  });

  return { transactions: matchedTransactions, matchedCount, matchedAmount };
}
