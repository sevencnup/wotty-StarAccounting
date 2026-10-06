"use client";

import { useCallback, useEffect, useId, useRef } from "react";

type HistoryEntry = {
  markerUrl: string;
};

/**
 * Gives a portal-based transient layer its own browser-history entry.
 *
 * A mobile edge-back gesture then dismisses this layer first, instead of
 * immediately reaching the page or sheet below it. The current history
 * state is preserved so parent layers can recognise that they are still open.
 */
export function useLayeredHistoryMarker(open: boolean, markerName: string, onHistoryBack: () => void) {
  const markerId = useId();
  const historyEntryRef = useRef<HistoryEntry | null>(null);
  const onHistoryBackRef = useRef(onHistoryBack);

  useEffect(() => {
    onHistoryBackRef.current = onHistoryBack;
  }, [onHistoryBack]);

  const consumeHistoryEntry = useCallback(() => {
    const ownsHistoryEntry = historyEntryRef.current !== null;
    historyEntryRef.current = null;
    if (ownsHistoryEntry) window.history.back();
  }, []);

  useEffect(() => {
    if (!open) return;

    if (!historyEntryRef.current) {
      const currentState = window.history.state;
      const nextState = currentState && typeof currentState === "object"
        ? { ...currentState, [markerName]: markerId }
        : { [markerName]: markerId };
      const markerUrl = new URL(window.location.href);
      markerUrl.hash = `${markerName}=${encodeURIComponent(markerId)}-${Date.now()}`;
      window.history.pushState(nextState, "", markerUrl.href);
      historyEntryRef.current = { markerUrl: markerUrl.href };
    }

    function dismissFromHistory() {
      const historyEntry = historyEntryRef.current;
      if (!historyEntry || window.location.href === historyEntry.markerUrl) return;
      historyEntryRef.current = null;
      onHistoryBackRef.current();
    }

    window.addEventListener("popstate", dismissFromHistory);
    window.addEventListener("hashchange", dismissFromHistory);
    return () => {
      window.removeEventListener("popstate", dismissFromHistory);
      window.removeEventListener("hashchange", dismissFromHistory);
    };
  }, [markerId, markerName, open]);

  return consumeHistoryEntry;
}
