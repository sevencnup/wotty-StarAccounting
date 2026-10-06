"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  datePickerDisplayLabel,
  datePickerMonthGrid,
  daysInDatePickerMonth,
  formatDatePickerValue,
  parseDatePickerValue,
  shiftDatePickerMonth,
  todayDatePickerValue,
  type DatePickerCalendarDay,
  type DatePickerMode,
  type DatePickerValue,
} from "@/lib/stark/utils/date-picker";

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;
const YEAR_PAGE_SIZE = 12;
const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];
const HOURS = Array.from({ length: 24 }, (_, hour) => hour);
const MINUTES = Array.from({ length: 60 }, (_, minute) => minute);

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function clampYearPageStart(value: number) {
  return Math.max(MIN_YEAR, Math.min(MAX_YEAR - YEAR_PAGE_SIZE + 1, value));
}

function calendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="5" width="17" height="15" rx="3" />
      <path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17M8 13h.01M12 13h.01M16 13h.01M8 16.5h.01M12 16.5h.01" />
    </svg>
  );
}

function chevronIcon(direction: "left" | "right" | "down") {
  const points = direction === "left" ? "14 6 8 12 14 18" : direction === "right" ? "10 6 16 12 10 18" : "6 9 12 15 18 9";
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points={points} />
    </svg>
  );
}

function sameDate(left: DatePickerValue | null, right: Pick<DatePickerCalendarDay, "year" | "month" | "day">) {
  return Boolean(left && left.year === right.year && left.month === right.month && left.day === right.day);
}

function currentValueForView(view: { year: number; month: number }, source?: DatePickerValue | null) {
  const today = todayDatePickerValue();
  return {
    year: view.year,
    month: view.month,
    day: Math.min(source?.day ?? today.day, daysInDatePickerMonth(view.year, view.month)),
    hour: source?.hour ?? today.hour,
    minute: source?.minute ?? today.minute,
  } satisfies DatePickerValue;
}

export function DateTimePicker({
  value,
  onChange,
  mode = "date",
  ariaLabel,
  className = "",
  placeholder,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  mode?: DatePickerMode;
  ariaLabel: string;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const parsedValue = parseDatePickerValue(value, mode);
  const now = todayDatePickerValue();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<DatePickerValue | null>(null);
  const [visibleYear, setVisibleYear] = useState(parsedValue?.year ?? now.year);
  const [visibleMonth, setVisibleMonth] = useState(parsedValue?.month ?? now.month);
  const [yearMenuOpen, setYearMenuOpen] = useState(false);
  const [yearMenuStart, setYearMenuStart] = useState(() => clampYearPageStart((parsedValue?.year ?? now.year) - 5));
  const triggerRef = useRef<HTMLButtonElement>(null);
  const focusDayRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const yearMenuId = useId();
  const calendarDays = useMemo(() => datePickerMonthGrid(visibleYear, visibleMonth), [visibleMonth, visibleYear]);
  const triggerLabel = datePickerDisplayLabel(parsedValue, mode, placeholder ?? (mode === "datetime" ? "选择日期和时间" : "选择日期"));
  const currentDay = todayDatePickerValue();
  const selectedTime = draft ?? currentValueForView({ year: visibleYear, month: visibleMonth }, parsedValue);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => focusDayRef.current?.focus());
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      closePicker();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function openPicker() {
    const selected = parseDatePickerValue(value, mode);
    const initial = selected ?? todayDatePickerValue();
    setDraft(selected);
    setVisibleYear(initial.year);
    setVisibleMonth(initial.month);
    setYearMenuStart(clampYearPageStart(initial.year - 5));
    setYearMenuOpen(false);
    setOpen(true);
  }

  function closePicker() {
    setOpen(false);
    setYearMenuOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function moveMonth(offset: number) {
    const next = shiftDatePickerMonth(visibleYear, visibleMonth, offset);
    if (next.year < MIN_YEAR || next.year > MAX_YEAR) return;
    setVisibleYear(next.year);
    setVisibleMonth(next.month);
    setYearMenuOpen(false);
  }

  function selectDay(day: DatePickerCalendarDay) {
    setDraft((current) => ({
      ...currentValueForView({ year: day.year, month: day.month }, current ?? parsedValue),
      year: day.year,
      month: day.month,
      day: day.day,
    }));
    if (!day.inCurrentMonth) {
      setVisibleYear(day.year);
      setVisibleMonth(day.month);
    }
  }

  function updateTime(part: "hour" | "minute", nextValue: number) {
    setDraft((current) => ({
      ...(current ?? currentValueForView({ year: visibleYear, month: visibleMonth }, parsedValue)),
      [part]: nextValue,
    }));
  }

  function toggleYearMenu() {
    setYearMenuOpen((current) => {
      if (!current) setYearMenuStart(clampYearPageStart(visibleYear - 5));
      return !current;
    });
  }

  function selectYear(year: number) {
    setVisibleYear(year);
    setVisibleMonth((month) => Math.min(month, 12));
    setYearMenuOpen(false);
  }

  function selectToday() {
    const today = todayDatePickerValue();
    setDraft(today);
    setVisibleYear(today.year);
    setVisibleMonth(today.month);
    setYearMenuOpen(false);
  }

  function confirmSelection() {
    if (!draft) return;
    onChange(formatDatePickerValue(draft, mode));
    closePicker();
  }

  function clearSelection() {
    if (!value) return;
    onChange("");
    closePicker();
  }

  const canMoveBackward = visibleYear > MIN_YEAR || visibleMonth > 1;
  const canMoveForward = visibleYear < MAX_YEAR || visibleMonth < 12;
  const yearOptions = Array.from({ length: YEAR_PAGE_SIZE }, (_, index) => yearMenuStart + index).filter((year) => year <= MAX_YEAR);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={`stark-date-picker-trigger ${className} ${parsedValue ? "" : "is-empty"}`.trim()}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        disabled={disabled}
        onClick={openPicker}
      >
        <span className="stark-date-picker-trigger-icon">{calendarIcon()}</span>
        <span className="stark-date-picker-trigger-label">{triggerLabel}</span>
        <span className="stark-date-picker-trigger-chevron">{chevronIcon("down")}</span>
      </button>

      {open && typeof document !== "undefined" ? createPortal(
        <div
          className="stark-date-picker-backdrop"
          onClick={(event) => {
            if (event.target === event.currentTarget) closePicker();
            event.stopPropagation();
          }}
          onTouchStart={(event) => event.stopPropagation()}
          onTouchMove={(event) => event.stopPropagation()}
          onTouchEnd={(event) => event.stopPropagation()}
        >
          <section className="stark-date-picker-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(event) => event.stopPropagation()}>
            <header className="stark-date-picker-header">
              <div>
                <span>{mode === "datetime" ? "日期与时间" : "日期"}</span>
                <strong id={titleId}>{draft ? datePickerDisplayLabel(draft, mode) : "请选择日期"}</strong>
              </div>
              <button type="button" className="stark-date-picker-close" aria-label="关闭日期选择" onClick={closePicker}>×</button>
            </header>

            <div className="stark-date-picker-navigation">
              <button type="button" aria-label="上一个月" disabled={!canMoveBackward} onClick={() => moveMonth(-1)}>{chevronIcon("left")}</button>
              <button
                type="button"
                className="stark-date-picker-month-title"
                aria-expanded={yearMenuOpen}
                aria-controls={yearMenuId}
                onClick={toggleYearMenu}
              >
                {visibleYear} 年 {visibleMonth} 月 {chevronIcon("down")}
              </button>
              <button type="button" aria-label="下一个月" disabled={!canMoveForward} onClick={() => moveMonth(1)}>{chevronIcon("right")}</button>
            </div>

            {yearMenuOpen ? (
              <section id={yearMenuId} className="stark-date-picker-year-menu" aria-label="选择年份">
                <div className="stark-date-picker-year-menu-head">
                  <button type="button" aria-label="更早年份" disabled={yearMenuStart <= MIN_YEAR} onClick={() => setYearMenuStart((year) => clampYearPageStart(year - YEAR_PAGE_SIZE))}>{chevronIcon("left")}</button>
                  <strong>{yearMenuStart} - {yearOptions.at(-1)} 年</strong>
                  <button type="button" aria-label="更晚年份" disabled={yearOptions.at(-1) === MAX_YEAR} onClick={() => setYearMenuStart((year) => clampYearPageStart(year + YEAR_PAGE_SIZE))}>{chevronIcon("right")}</button>
                </div>
                <div className="stark-date-picker-year-grid">
                  {yearOptions.map((year) => (
                    <button key={year} type="button" className={year === visibleYear ? "selected" : ""} aria-pressed={year === visibleYear} onClick={() => selectYear(year)}>{year}年</button>
                  ))}
                </div>
              </section>
            ) : null}

            <div className="stark-date-picker-weekdays" aria-hidden="true">
              {WEEKDAYS.map((weekday) => <span key={weekday}>{weekday}</span>)}
            </div>
            <div className="stark-date-picker-day-grid" role="grid" aria-label={`${visibleYear}年${visibleMonth}月`}>
              {calendarDays.map((day) => {
                const selected = sameDate(draft, day);
                const isToday = sameDate(currentDay, day);
                const outOfRange = day.year < MIN_YEAR || day.year > MAX_YEAR;
                const shouldFocus = !outOfRange && (selected || (!draft && isToday && day.inCurrentMonth));
                return (
                  <button
                    key={day.key}
                    ref={shouldFocus ? focusDayRef : undefined}
                    type="button"
                    role="gridcell"
                    className={`${selected ? "selected " : ""}${isToday ? "today " : ""}${day.inCurrentMonth ? "" : "outside"}`.trim()}
                    aria-selected={selected}
                    aria-label={`${day.year}年${day.month}月${day.day}日${isToday ? "，今天" : ""}`}
                    disabled={outOfRange}
                    onClick={() => selectDay(day)}
                  >
                    {day.day}
                  </button>
                );
              })}
            </div>

            {mode === "datetime" ? (
              <section className="stark-date-picker-time" aria-label="选择时间">
                <span>时间</span>
                <div>
                  <select aria-label="小时" value={selectedTime.hour} onChange={(event) => updateTime("hour", Number(event.target.value))}>
                    {HOURS.map((hour) => <option key={hour} value={hour}>{pad(hour)} 时</option>)}
                  </select>
                  <i>:</i>
                  <select aria-label="分钟" value={selectedTime.minute} onChange={(event) => updateTime("minute", Number(event.target.value))}>
                    {MINUTES.map((minute) => <option key={minute} value={minute}>{pad(minute)} 分</option>)}
                  </select>
                </div>
              </section>
            ) : null}

            <footer className="stark-date-picker-actions">
              <button type="button" className="clear" disabled={!value} onClick={clearSelection}>清除</button>
              <button type="button" className="today" onClick={selectToday}>今天</button>
              <button type="button" className="confirm" disabled={!draft} onClick={confirmSelection}>确定</button>
            </footer>
          </section>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
