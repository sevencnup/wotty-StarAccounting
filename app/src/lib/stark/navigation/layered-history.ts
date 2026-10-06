export type LayerHistoryEntry = {
  markerUrl: string;
};

export function createLayerHistoryState(currentState: unknown, markerName: string, markerId: string) {
  const parentState = currentState && typeof currentState === "object" && !Array.isArray(currentState)
    ? currentState as Record<string, unknown>
    : {};
  return { ...parentState, [markerName]: markerId };
}

export function createLayerMarkerUrl(currentUrl: string, markerName: string, markerId: string, timestamp: string | number) {
  const markerUrl = new URL(currentUrl);
  markerUrl.hash = `${encodeURIComponent(markerName)}=${encodeURIComponent(markerId)}-${timestamp}`;
  return markerUrl.href;
}

export function shouldDismissLayerFromHistory(entry: LayerHistoryEntry | null, currentUrl: string) {
  return Boolean(entry && entry.markerUrl !== currentUrl);
}

export function releaseLayerHistoryEntry(entry: LayerHistoryEntry | null) {
  return {
    entry: null,
    shouldGoBack: entry !== null,
  } satisfies { entry: null; shouldGoBack: boolean };
}
