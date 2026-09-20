"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;
const MONTHS = Array.from({ length: 12 }, (_, index) => index + 1);

function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
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
  const visibleYearRef = useRef(selectedYear);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const selectedMonthRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const years = useMemo(
    () => Array.from({ length: MAX_YEAR - MIN_YEAR + 1 }, (_, index) => MIN_YEAR + index),
    [],
  );

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
    setOpen(true);
  }

  function closePicker() {
    setOpen(false);
    window.requestAnimationFrame(() => triggerRef.current?.focus());
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
                    <strong id={titleId}>选择月份</strong>
                  </div>
                  <button type="button" aria-label="关闭月份选择" onClick={closePicker}>
                    ×
                  </button>
                </div>

                <div className="reporting-year-picker">
                  <button
                    type="button"
                    aria-label="上一年"
                    disabled={visibleYear <= MIN_YEAR}
                    onClick={() => updateVisibleYear(Math.max(MIN_YEAR, visibleYearRef.current - 1))}
                  >
                    ‹
                  </button>
                  <select
                    value={visibleYear}
                    aria-label="选择年份"
                    onChange={(event) => updateVisibleYear(Number(event.target.value))}
                  >
                    {years.map((year) => (
                      <option key={year} value={year}>
                        {year}年
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    aria-label="下一年"
                    disabled={visibleYear >= MAX_YEAR}
                    onClick={() => updateVisibleYear(Math.min(MAX_YEAR, visibleYearRef.current + 1))}
                  >
                    ›
                  </button>
                </div>

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
