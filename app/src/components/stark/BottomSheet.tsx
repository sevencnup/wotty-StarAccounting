"use client";

import { useCallback, useEffect, useId, useRef, useState, type PropsWithChildren } from "react";
import { createPortal } from "react-dom";

type BottomSheetProps = PropsWithChildren<{
  title: string;
  onClose: () => void;
  className?: string;
  overlayClassName?: string;
  bodyClassName?: string;
}>;

export function BottomSheet({ children, title, onClose, className = "", overlayClassName = "", bodyClassName = "" }: BottomSheetProps) {
  const titleId = useId();
  const [mounted, setMounted] = useState(false);
  const historyEntryRef = useRef(false);
  const closingRef = useRef(false);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const requestClose = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    const ownsHistoryEntry = historyEntryRef.current;
    historyEntryRef.current = false;
    onCloseRef.current();
    if (ownsHistoryEntry) window.history.back();
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Reserve a same-URL history entry for this sheet. Browser edge-swipe
    // back gestures consume this entry first and therefore only close the
    // sheet instead of navigating the underlying tab.
    if (!historyEntryRef.current) {
      const currentState = window.history.state;
      const nextState = currentState && typeof currentState === "object"
        ? { ...currentState, starkBottomSheet: true }
        : { starkBottomSheet: true };
      window.history.pushState(nextState, "", window.location.href);
      historyEntryRef.current = true;
    }

    const handlePopState = () => {
      if (!historyEntryRef.current) return;
      historyEntryRef.current = false;
      if (closingRef.current) return;
      closingRef.current = true;
      onCloseRef.current();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [mounted]);

  useEffect(() => {
    const scrollY = window.scrollY;
    const body = document.body;
    const html = document.documentElement;
    const original = {
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyWidth: body.style.width,
      bodyOverflow: body.style.overflow,
      bodyOverscrollBehavior: body.style.overscrollBehavior,
      htmlOverflow: html.style.overflow,
      htmlOverscrollBehavior: html.style.overscrollBehavior,
    };

    body.style.position = "fixed";
    body.style.top = "-" + scrollY + "px";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    body.style.overscrollBehavior = "none";
    html.style.overflow = "hidden";
    html.style.overscrollBehavior = "none";

    return () => {
      body.style.position = original.bodyPosition;
      body.style.top = original.bodyTop;
      body.style.width = original.bodyWidth;
      body.style.overflow = original.bodyOverflow;
      body.style.overscrollBehavior = original.bodyOverscrollBehavior;
      html.style.overflow = original.htmlOverflow;
      html.style.overscrollBehavior = original.htmlOverscrollBehavior;
      window.scrollTo(0, scrollY);
    };
  }, []);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") requestClose();
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [requestClose]);

  if (!mounted) return null;

  return createPortal(
    <div className={`bottom-sheet-overlay ${overlayClassName}`.trim()} onClick={requestClose}>
      <section className={`bottom-sheet ${className}`.trim()} role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(event) => event.stopPropagation()}>
        <div className="bottom-sheet-handle" aria-hidden="true" />
        <header className="bottom-sheet-header">
          <span aria-hidden="true" />
          <strong id={titleId}>{title}</strong>
          <button type="button" aria-label={`关闭${title}`} onClick={requestClose}>×</button>
        </header>
        <div className={`bottom-sheet-body ${bodyClassName}`.trim()}>{children}</div>
      </section>
    </div>
    , document.body,
  );
}
