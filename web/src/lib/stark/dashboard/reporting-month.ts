type DatedTransaction = { date: string };

const REPORTING_MONTH_PATTERN = /^(\d{4})-(0[1-9]|1[0-2])$/;

function previousMonthKey(month: string) {
  const [year, monthNumber] = month.split("-").map(Number);
  const previous = new Date(year, monthNumber - 2, 1);
  return `${previous.getFullYear()}-${String(previous.getMonth() + 1).padStart(2, "0")}`;
}

export function splitReportingMonthTransactions<T extends DatedTransaction>(transactions: T[], reportingMonth: string) {
  const previousMonth = previousMonthKey(reportingMonth);
  return {
    current: transactions.filter((item) => item.date.slice(0, 7) === reportingMonth),
    previous: transactions.filter((item) => item.date.slice(0, 7) === previousMonth),
  };
}

export function buildReportingMonthTrendRanges(reportingMonth: string) {
  const match = REPORTING_MONTH_PATTERN.exec(reportingMonth);
  if (!match) {
    throw new Error(`Invalid reporting month: ${reportingMonth}`);
  }

  const year = Number(match[1]);
  const monthNumber = Number(match[2]);
  const daysInMonth = new Date(year, monthNumber, 0).getDate();
  const starts = [1, 5, 10, 15, 20, 25, 30].filter(
    (day) => day <= daysInMonth,
  );

  return starts.map((start, index) => ({
    label: String(start),
    start,
    end: Math.min(starts[index + 1] ? starts[index + 1] - 1 : daysInMonth, daysInMonth),
  }));
}
