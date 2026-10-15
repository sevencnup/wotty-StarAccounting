"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLayeredHistoryMarker } from "@/components/stark/useLayeredHistoryMarker";

type ConfirmOptions = {
  message: string;
  title?: string;
  confirmLabel?: string;
};

type ConfirmRequest = ConfirmOptions & { resolve: (confirmed: boolean) => void };

const ConfirmContext = createContext<((options: ConfirmOptions) => Promise<boolean>) | null>(null);

export function useConfirmDialog() {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error("useConfirmDialog must be used inside ConfirmDialogProvider");
  return confirm;
}

export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);
  const requestRef = useRef<ConfirmRequest | null>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const acceptRef = useRef<HTMLButtonElement>(null);

  const settle = useCallback((confirmed: boolean) => {
    const current = requestRef.current;
    if (!current) return;
    requestRef.current = null;
    setRequest(null);
    current.resolve(confirmed);
  }, []);
  const consumeHistoryEntry = useLayeredHistoryMarker(Boolean(request), "starkConfirmDialog", () => settle(false));
  const close = useCallback((confirmed: boolean) => {
    consumeHistoryEntry();
    settle(confirmed);
  }, [consumeHistoryEntry, settle]);

  const confirm = useCallback((options: ConfirmOptions) => new Promise<boolean>((resolve) => {
    if (requestRef.current) {
      resolve(false);
      return;
    }
    const next = { ...options, resolve };
    requestRef.current = next;
    setRequest(next);
  }), []);

  useEffect(() => {
    if (!request) return;
    cancelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        close(false);
      } else if (event.key === "Tab") {
        if (event.shiftKey && document.activeElement === cancelRef.current) {
          event.preventDefault();
          acceptRef.current?.focus();
        } else if (!event.shiftKey && document.activeElement === acceptRef.current) {
          event.preventDefault();
          cancelRef.current?.focus();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [close, request]);

  useEffect(() => () => {
    requestRef.current?.resolve(false);
    requestRef.current = null;
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {request && typeof document !== "undefined" ? createPortal(
        <div className="stark-confirm-overlay" onClick={() => close(false)}>
          <section className="stark-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="stark-confirm-title" aria-describedby="stark-confirm-message" onClick={(event) => event.stopPropagation()}>
            <span className="stark-confirm-icon" aria-hidden="true">!</span>
            <h2 id="stark-confirm-title">{request.title ?? "确认删除"}</h2>
            <p id="stark-confirm-message">{request.message}</p>
            <div className="stark-confirm-actions">
              <button ref={cancelRef} type="button" onClick={() => close(false)}>取消</button>
              <button ref={acceptRef} type="button" className="danger" onClick={() => close(true)}>{request.confirmLabel ?? "删除"}</button>
            </div>
          </section>
        </div>,
        document.body,
      ) : null}
    </ConfirmContext.Provider>
  );
}
