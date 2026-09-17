"use client";

import { useEffect, useId, useState, type PropsWithChildren } from "react";
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

  useEffect(() => {
    setMounted(true);
  }, []);

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
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [onClose]);

  if (!mounted) return null;

  return createPortal(
    <div className={`bottom-sheet-overlay ${overlayClassName}`.trim()} onClick={onClose}>
      <section className={`bottom-sheet ${className}`.trim()} role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={(event) => event.stopPropagation()}>
        <div className="bottom-sheet-handle" aria-hidden="true" />
        <header className="bottom-sheet-header">
          <span aria-hidden="true" />
          <strong id={titleId}>{title}</strong>
          <button type="button" aria-label={`关闭${title}`} onClick={onClose}>×</button>
        </header>
        <div className={`bottom-sheet-body ${bodyClassName}`.trim()}>{children}</div>
      </section>
    </div>
    , document.body,
  );
}
