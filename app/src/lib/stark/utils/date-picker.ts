export type DatePickerMode = "date" | "datetime";

export type DatePickerValue = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

export type DatePickerCalendarDay = DatePickerValue & {
  key: string;
  inCurrentMonth: boolean;
};

const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})(?:$|[T\s])/;
const DATETIME_PATTERN = /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::\d{2})?$/;

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function validDate(year: number, month: number, day: number) {
  return Number.isInteger(year)
    && Number.isInteger(month)
    && Number.isInteger(day)
    && month >= 1
    && month <= 12
    && day >= 1
    && day <= daysInDatePickerMonth(year, month);
}

function validTime(hour: number, minute: number) {
  return Number.isInteger(hour)
    && Number.isInteger(minute)
    && hour >= 0
    && hour <= 23
    && minute >= 0
    && minute <= 59;
}

export function daysInDatePickerMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export function todayDatePickerValue(): DatePickerValue {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
    hour: now.getHours(),
    minute: now.getMinutes(),
  };
}

export function parseDatePickerValue(value: string | null | undefined, mode: DatePickerMode): DatePickerValue | null {
  const source = value?.trim() ?? "";
  const match = (mode === "datetime" ? DATETIME_PATTERN : DATE_PATTERN).exec(source);
  if (!match) return null;
  const [, yearValue, monthValue, dayValue, hourValue, minuteValue] = match;
  const year = Number(yearValue);
  const month = Number(monthValue);
  const day = Number(dayValue);
  const hour = mode === "datetime" ? Number(hourValue) : 0;
  const minute = mode === "datetime" ? Number(minuteValue) : 0;
  return validDate(year, month, day) && validTime(hour, minute)
    ? { year, month, day, hour, minute }
    : null;
}

export function formatDatePickerValue(value: DatePickerValue, mode: DatePickerMode) {
  const date = `${value.year}-${pad(value.month)}-${pad(value.day)}`;
  return mode === "datetime" ? `${date}T${pad(value.hour)}:${pad(value.minute)}` : date;
}

export function datePickerDisplayLabel(value: DatePickerValue | null, mode: DatePickerMode, emptyLabel = "选择日期") {
  if (!value) return emptyLabel;
  const date = `${value.year}年${value.month}月${value.day}日`;
  return mode === "datetime" ? `${date} ${pad(value.hour)}:${pad(value.minute)}` : date;
}

export function datePickerMonthGrid(year: number, month: number): DatePickerCalendarDay[] {
  const firstWeekday = (new Date(year, month - 1, 1).getDay() + 6) % 7;
  // Always render six full weeks. Besides matching familiar calendar layouts,
  // this keeps the picker height stable when switching between short and long
  // months.
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(year, month - 1, index - firstWeekday + 1);
    const dateYear = date.getFullYear();
    const dateMonth = date.getMonth() + 1;
    const day = date.getDate();
    return {
      year: dateYear,
      month: dateMonth,
      day,
      hour: 0,
      minute: 0,
      key: `${dateYear}-${pad(dateMonth)}-${pad(day)}`,
      inCurrentMonth: dateMonth === month,
    };
  });
}

export function shiftDatePickerMonth(year: number, month: number, offset: number) {
  const date = new Date(year, month - 1 + offset, 1);
  return { year: date.getFullYear(), month: date.getMonth() + 1 };
}
