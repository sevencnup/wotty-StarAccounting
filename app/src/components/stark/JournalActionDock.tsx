"use client";

import { createContext, useContext, type PropsWithChildren } from "react";
import { createPortal } from "react-dom";

// Undefined means a standalone form; null means the panel's footer is mounting.
export const JournalActionTargetContext = createContext<HTMLElement | null | undefined>(undefined);

export function JournalActionDock({ children, className = "" }: PropsWithChildren<{ className?: string }>) {
  const target = useContext(JournalActionTargetContext);
  const actions = <div className={`journal-action-dock ${className}`.trim()}>{children}</div>;

  if (target === undefined) return actions;
  return target ? createPortal(actions, target) : null;
}
