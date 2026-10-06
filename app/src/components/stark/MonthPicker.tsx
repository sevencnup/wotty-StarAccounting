"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;
const YEAR_PAGE_SIZE = 12;
const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function selectedRangeLabel(year: number, month: number | null) {
  return month === null ? `${year} 年全年` : `${year} 年 ${month} 月`;
}

function clampYearPageStart(year: number) {
  return Math.max(MIN_YEAR, Math.min(MAX_YEAR - YEAR_PAGE_SIZE + 1, year));
}

export function MonthPicker({
  value,
  onChange,
  ariaLabel,
  triggerClassName,
  availableMonths,
  children,
}: {
  value: string;
  onChange: (month: string) => void;
  ariaLabel: string;
  triggerClassName: string;
  availableMonths?: ReadonlySet<string>;
  children: ReactNode;
}) {
  const selectedYear = Number(value.slice(0, 4));
  const selectedMonth = value.length === 7 ? Number(value.slice(5, 7)) : null;
  const [open, setOpen] = useState(false);
  const [visibleYear, setVisibleYear] = useState(selectedYear);
  const [yearMenuOpen, setYearMenuOpen] = useState(false);
  const [yearMenuStart, setYearMenuStart] = useState(() => clampYearPageStart(selectedYear - 5));
  const visibleYearRef = useRef(selectedYear);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedMonthRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const yearMenuId = useId();
  const currentRange = selectedRangeLabel(selectedYear, selectedMonth);
  const yearOptions = Array.from({ length: YEAR_PAGE_SIZE }, (_, index) => yearMenuStart + index)
    .filter((year) => year <= MAX_YEAR);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = window.requestAnimationFrame(() => {
      selectedMonthRef.current?.focus();
    });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        window.requestAnimationFrame(() => triggerRef.current?.focus());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.cancelAnimationFrame(focusFrame);
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  function updateVisibleYear(year: number) {
    visibleYearRef.current = year;
    setVisibleYear(year);
  }

  function openPicker() {
    updateVisibleYear(selectedYear);
    setYearMenuStart(clampYearPageStart(selectedYear - 5));
    setYearMenuOpen(false);
    setOpen(true);
  }

  function closePicker() {
    setYearMenuOpen(false);
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function moveYear(offset: number) {
    const nextYear = Math.max(MIN_YEAR, Math.min(MAX_YEAR, visibleYearRef.current + offset));
    updateVisibleYear(nextYear);
    setYearMenuOpen(false);
  }

  function toggleYearMenu() {
    setYearMenuOpen((current) => {
      if (!current) setYearMenuStart(clampYearPageStart(visibleYearRef.current - 5));
      return !current;
    });
  }

  function selectVisibleYear(year: number) {
    updateVisibleYear(year);
    setYearMenuOpen(false);
  }

  function selectMonth(month: number) {
    if (availableMonths && !availableMonths.has(monthKey(visibleYearRef.current, month))) return;
    setOpen(false);
    onChange(monthKey(visibleYearRef.current, month));
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  function selectYear() {
    if (availableMonths && !MONTHS.some((month) => availableMonths.has(monthKey(visibleYearRef.current, month)))) return;
    setOpen(false);
    onChange(String(visibleYearRef.current));
    window.requestAnimationFrame(() => triggerRef.current?.focus());
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={triggerClassName}
        aria-label={ariaLabel}
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={openPicker}
      >
        {children}
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <div
              className="reporting-month-picker-backdrop"
              onClick={(event) => {
                if (event.target === event.currentTarget) closePicker();
              }}
            >
              <section
                className="reporting-month-picker-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
              >
                <div className="reporting-month-picker-head">
                  <div>
                    <span>统计范围</span>
                    <strong id={titleId}>选择日期</strong>
                  </div>
                  <button type="button" aria-label="关闭月份选择" onClick={closePicker}>
                    ×
                  </button>
                </div>

                <div className="reporting-month-picker-current" aria-live="polite">
                  <span className="reporting-month-picker-current-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3.5" y="5" width="17" height="15" rx="3" />
                      <path d="M7.5 3.5v3M16.5 3.5v3M3.5 9.5h17M8 13h.01M12 13h.01M16 13h.01M8 16.5h.01M12 16.5h.01" />
                    </svg>
                  </span>
                  <span>
                    <small>当前统计范围</small>
                    <strong>{currentRange}</strong>
                  </span>
                </div>

                <div className="reporting-year-picker">
                  <button
                    type="button"
                    aria-label="上一年"
                    disabled={visibleYear <= MIN_YEAR}
                    onClick={() => moveYear(-1)}
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="reporting-year-value"
                    aria-label="选择年份"
                    aria-expanded={yearMenuOpen}
                    aria-controls={yearMenuId}
                    onClick={toggleYearMenu}
                  >
                    {visibleYear}年 <span aria-hidden="true">⌄</span>
                  </button>
                  <button
                    type="button"
                    aria-label="下一年"
                    disabled={visibleYear >= MAX_YEAR}
                    onClick={() => moveYear(1)}
                  >
                    ›
                  </button>
                </div>

                {yearMenuOpen ? (
                  <section id={yearMenuId} className="reporting-year-menu" aria-label="选择年份">
                    <div className="reporting-year-menu-head">
                      <button type="button" aria-label="更早年份" disabled={yearMenuStart <= MIN_YEAR} onClick={() => setYearMenuStart((year) => clampYearPageStart(year - YEAR_PAGE_SIZE))}>‹</button>
                      <strong>{yearMenuStart} - {yearOptions.at(-1)} 年</strong>
                      <button type="button" aria-label="更晚年份" disabled={yearOptions.at(-1) === MAX_YEAR} onClick={() => setYearMenuStart((year) => clampYearPageStart(year + YEAR_PAGE_SIZE))}>›</button>
                    </div>
                    <div className="reporting-year-menu-grid" role="listbox" aria-label="年份列表">
                      {yearOptions.map((year) => (
                        <button key={year} type="button" role="option" className={year === visibleYear ? "selected" : ""} aria-selected={year === visibleYear} onClick={() => selectVisibleYear(year)}>{year}年</button>
                      ))}
                    </div>
                  </section>
                ) : null}

                <button
                  type="button"
                  className={`${selectedMonth === null && visibleYear === selectedYear ? "reporting-year-option selected" : "reporting-year-option"}${availableMonths && !MONTHS.some((month) => availableMonths.has(monthKey(visibleYear, month))) ? " unavailable" : ""}`}
                  aria-pressed={selectedMonth === null && visibleYear === selectedYear}
                  disabled={Boolean(availableMonths && !MONTHS.some((month) => availableMonths.has(monthKey(visibleYear, month))))}
                  onClick={selectYear}
                >
                  全年
                </button>

                <div className="reporting-month-grid" role="grid" aria-label={`${visibleYear}年月份`}>
                  {MONTHS.map((month) => {
                    const selected = visibleYear === selectedYear && month === selectedMonth;
                    const available = !availableMonths || availableMonths.has(monthKey(visibleYear, month));
                    return (
                      <button
                        key={month}
                        ref={selected && available ? selectedMonthRef : undefined}
                        type="button"
                        role="gridcell"
                        className={`${selected ? "selected" : ""}${available ? "" : " unavailable"}`}
                        aria-selected={selected}
                        aria-disabled={!available}
                        disabled={!available}
                        title={available ? undefined : "暂无账单"}
                        onClick={() => selectMonth(month)}
                      >
                        {month}月
                      </button>
                    );
                  })}
                </div>

                <button type="button" className="reporting-month-picker-cancel" onClick={closePicker}>
                  取消
                </button>
              </section>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
