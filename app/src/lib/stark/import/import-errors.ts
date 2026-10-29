import type { ImportErrorLog, ImportFailedRow, Transaction } from "../models/types";

function createImportErrorId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") return `import-error-${crypto.randomUUID()}`;
  return `import-error-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function buildImportErrorLogs(
  rows: readonly ImportFailedRow[],
  context: { fileName: string; accountId: string; userId?: string; createdAt: string },
): ImportErrorLog[] {
  return rows.map((row) => ({
    id: createImportErrorId(),
    userId: context.userId ?? "local-user",
    accountId: context.accountId,
    fileName: context.fileName,
    lineNumber: row.lineNumber,
    rawData: row.rawData,
    errorMessage: row.errorMessage,
    errorType: row.errorType,
    resolved: false,
    createdAt: context.createdAt,
  }));
}

export function selectFailedImportTransactions(
  transactions: readonly Transaction[],
  rows: readonly ImportFailedRow[] | undefined,
) {
  if (!rows?.length) return [];
  return rows
    .map((row) => transactions[row.lineNumber - 1])
    .filter((transaction): transaction is Transaction => Boolean(transaction));
}
