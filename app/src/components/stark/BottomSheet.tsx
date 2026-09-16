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
