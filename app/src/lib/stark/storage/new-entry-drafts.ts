export type NewEntryDraftKind = "journal" | "salary" | "savings" | "asset" | "loan";

const DRAFT_PREFIX = "wotty-stark:new-entry-draft:";

export function newEntryDraftKey(kind: NewEntryDraftKind, scope?: string) {
  return DRAFT_PREFIX + kind + (scope ? `:${scope}` : "");
}

export function parseNewEntryDraft<T>(raw: string | null | undefined): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function readNewEntryDraft<T>(kind: NewEntryDraftKind, scope?: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    return parseNewEntryDraft<T>(window.localStorage.getItem(newEntryDraftKey(kind, scope)));
  } catch {
    return null;
  }
}

export function saveNewEntryDraft<T>(kind: NewEntryDraftKind, value: T, scope?: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(newEntryDraftKey(kind, scope), JSON.stringify(value));
  } catch {
    // Drafts are best-effort and must never block form interaction.
  }
}

export function clearNewEntryDraft(kind: NewEntryDraftKind, scope?: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(newEntryDraftKey(kind, scope));
  } catch {
    // Ignore storage failures while completing a successful submission.
  }
}
