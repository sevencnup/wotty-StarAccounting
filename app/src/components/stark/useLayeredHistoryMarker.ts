"use client";

import { useCallback, useEffect, useId, useRef } from "react";
import {
  createLayerHistoryState,
  createLayerMarkerUrl,
  releaseLayerHistoryEntry,
  shouldDismissLayerFromHistory,
  type LayerHistoryEntry,
} from "@/lib/stark/navigation/layered-history";

/**
 * Gives a portal-based transient layer its own browser-history entry.
 *
 * A mobile edge-back gesture then dismisses this layer first, instead of
 * immediately reaching the page or sheet below it. The current history
 * state is preserved so parent layers can recognise that they are still open.
 */
export function useLayeredHistoryMarker(open: boolean, markerName: string, onHistoryBack: () => void | false) {
  const markerId = useId();
  const historyEntryRef = useRef<LayerHistoryEntry | null>(null);
  const markerSequenceRef = useRef(0);
  const onHistoryBackRef = useRef(onHistoryBack);

  useEffect(() => {
    onHistoryBackRef.current = onHistoryBack;
  }, [onHistoryBack]);

  const consumeHistoryEntry = useCallback(() => {
    const release = releaseLayerHistoryEntry(historyEntryRef.current);
    historyEntryRef.current = release.entry;
    if (release.shouldGoBack) window.history.back();
  }, []);

  const pushHistoryEntry = useCallback(() => {
    if (historyEntryRef.current) return;
    markerSequenceRef.current += 1;
    const markerUrl = createLayerMarkerUrl(
      window.location.href,
      markerName,
      markerId,
      `${Date.now()}-${markerSequenceRef.current}`,
    );
    window.history.pushState(createLayerHistoryState(window.history.state, markerName, markerId), "", markerUrl);
    historyEntryRef.current = { markerUrl };
  }, [markerId, markerName]);

  useEffect(() => {
    if (!open) return;

    pushHistoryEntry();

    function dismissFromHistory() {
      const historyEntry = historyEntryRef.current;
      if (!shouldDismissLayerFromHistory(historyEntry, window.location.href)) return;
      historyEntryRef.current = null;
      if (onHistoryBackRef.current() === false) pushHistoryEntry();
    }

    window.addEventListener("popstate", dismissFromHistory);
    window.addEventListener("hashchange", dismissFromHistory);
    return () => {
      window.removeEventListener("popstate", dismissFromHistory);
      window.removeEventListener("hashchange", dismissFromHistory);
    };
  }, [open, pushHistoryEntry]);

  return consumeHistoryEntry;
}
