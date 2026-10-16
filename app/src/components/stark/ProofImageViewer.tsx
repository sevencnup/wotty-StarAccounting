"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useLayeredHistoryMarker } from "@/components/stark/useLayeredHistoryMarker";

export function ProofImageViewer({ src, onClose }: { src: string; onClose: () => void }) {
  const consumeHistory = useLayeredHistoryMarker(true, "starkProofImage", onClose);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.stopImmediatePropagation();
      consumeHistory();
      onClose();
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [consumeHistory, onClose]);

  return createPortal(
    <div className="proof-image-viewer" role="dialog" aria-modal="true" aria-label="查看图片凭证" onClick={(event) => { event.stopPropagation(); consumeHistory(); onClose(); }}>
      <button type="button" className="proof-image-viewer-close" aria-label="关闭图片预览" onClick={(event) => { event.stopPropagation(); consumeHistory(); onClose(); }}>×</button>
      <img src={src} alt="储蓄图片凭证大图" onClick={(event) => event.stopPropagation()} />
    </div>,
    document.body,
  );
}
