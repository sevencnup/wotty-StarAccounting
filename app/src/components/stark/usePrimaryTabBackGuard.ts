"use client";

import { useEffect, useRef } from "react";
import { hasActiveLayerHistoryMarker } from "@/lib/stark/navigation/layered-history";
import { shouldRestorePrimaryTabAfterHistoryBack } from "@/lib/stark/navigation/routes";

const RESTORE_GUARD_TIMEOUT_MS = 300;

/**
 * Old Android WebViews can still traverse a pre-existing tab entry even when
 * a tab switch now uses history.replace(). Catch that traversal before Next
 * restores the old route, while leaving route pages and open layers alone.
 */
export function usePrimaryTabBackGuard(pathname: string) {
  const currentPathnameRef = useRef(pathname);
  const restoringRef = useRef(false);
  const restoreTimerRef = useRef<number | null>(null);

  // Keep the page we rendered as the reference point until a popstate event
  // either restores it or is allowed to navigate elsewhere.
  currentPathnameRef.current = pathname;

  useEffect(() => {
    function clearRestoreGuard() {
      restoringRef.current = false;
      if (restoreTimerRef.current !== null) {
        window.clearTimeout(restoreTimerRef.current);
        restoreTimerRef.current = null;
      }
    }

    function handlePopState(event: PopStateEvent) {
      if (restoringRef.current) {
        clearRestoreGuard();
        currentPathnameRef.current = window.location.pathname;
        return;
      }

      const restoredPathname = window.location.pathname;
      if (!shouldRestorePrimaryTabAfterHistoryBack(
        currentPathnameRef.current,
        restoredPathname,
        hasActiveLayerHistoryMarker(),
      )) {
        currentPathnameRef.current = restoredPathname;
        return;
      }

      // Next handles popstate on a non-capturing listener. Stop this stale
      // tab traversal, then move forward to the current tab history entry.
      event.stopImmediatePropagation();
      restoringRef.current = true;
      window.history.go(1);
      restoreTimerRef.current = window.setTimeout(() => {
        restoringRef.current = false;
        restoreTimerRef.current = null;
      }, RESTORE_GUARD_TIMEOUT_MS);
    }

    window.addEventListener("popstate", handlePopState, true);
    return () => {
      window.removeEventListener("popstate", handlePopState, true);
      if (restoreTimerRef.current !== null) window.clearTimeout(restoreTimerRef.current);
    };
  }, []);
}
