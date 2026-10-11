export const TAB_NAVIGATION_TIMEOUT_MS = 4_000;

type NavigationEnvironment = {
  now: () => number;
  schedule: (callback: () => void, delay: number) => number;
  cancel: (timer: number) => void;
  canRecover: () => boolean;
  replace: (target: string) => void;
  replaceDocument: (target: string) => void;
  onPendingChange: (target: string | null) => void;
};

function routePath(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

/** Tracks a user navigation until React commits the selected route. */
export function createTabNavigation(environment: NavigationEnvironment) {
  let pending: { target: string; deadline: number } | null = null;
  let timer: number | null = null;
  let disposed = false;
  let replacingDocument = false;

  function clearTimer() {
    if (timer !== null) environment.cancel(timer);
    timer = null;
  }

  function replaceDocument(target: string) {
    clearTimer();
    pending = null;
    replacingDocument = true;
    environment.replaceDocument(target);
  }

  function checkProgress() {
    clearTimer();
    if (disposed || !pending || replacingDocument || !environment.canRecover()) return;
    const remaining = pending.deadline - environment.now();
    if (remaining <= 0) {
      replaceDocument(pending.target);
    } else {
      timer = environment.schedule(checkProgress, remaining);
    }
  }

  return {
    select(target: string, committedPathname: string) {
      if (disposed || replacingDocument) return;

      if (routePath(target) === routePath(committedPathname)) {
        // A Link to the current route is normally a no-op. While a different
        // transition is suspended, explicitly cancel it by restoring this page.
        if (pending) {
          pending = { target, deadline: environment.now() };
          environment.onPendingChange(target);
          checkProgress();
        }
        return;
      }

      if (pending?.target === target) {
        // Repeated taps must not postpone the recovery deadline indefinitely.
        checkProgress();
        return;
      }

      pending = { target, deadline: environment.now() + TAB_NAVIGATION_TIMEOUT_MS };
      environment.onPendingChange(target);
      // Arm outside React's transition. An effect triggered by pending state
      // might itself wait for the same suspended router we're trying to recover.
      checkProgress();
      try {
        environment.replace(target);
      } catch {
        pending = { target, deadline: environment.now() };
        checkProgress();
      }
    },
    committed(pathname: string) {
      if (!pending || routePath(pathname) !== routePath(pending.target)) return;
      clearTimer();
      pending = null;
      environment.onPendingChange(null);
    },
    resume: checkProgress,
    dispose() {
      disposed = true;
      pending = null;
      clearTimer();
    },
  };
}
