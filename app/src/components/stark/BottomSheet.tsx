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
  const historyEntryRef = useRef<{ markerUrl: string } | null>(null);
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
    const ownsHistoryEntry = historyEntryRef.current !== null;
    historyEntryRef.current = null;
    onCloseRef.current();
    if (ownsHistoryEntry) window.history.back();
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Give the sheet a distinct hash entry. Some WebViews coalesce same-URL
    // state entries, while a hash entry is retained and consumed first by an
    // edge-back gesture before the underlying page can be reached.
    if (!historyEntryRef.current) {
      const currentState = window.history.state;
      const nextState = currentState && typeof currentState === "object"
        ? { ...currentState, starkBottomSheet: true }
        : { starkBottomSheet: true };
      const markerUrl = new URL(window.location.href);
      markerUrl.hash = "stark-bottom-sheet=" + encodeURIComponent(titleId) + "-" + Date.now();
      window.history.pushState(nextState, "", markerUrl.href);
      historyEntryRef.current = { markerUrl: markerUrl.href };
    }

    const closeFromHistory = () => {
      if (!historyEntryRef.current) return;
      historyEntryRef.current = null;
      if (closingRef.current) return;
      closingRef.current = true;
      onCloseRef.current();
    };

    window.addEventListener("popstate", closeFromHistory);
    window.addEventListener("hashchange", closeFromHistory);
    return () => {
      window.removeEventListener("popstate", closeFromHistory);
      window.removeEventListener("hashchange", closeFromHistory);
    };
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
