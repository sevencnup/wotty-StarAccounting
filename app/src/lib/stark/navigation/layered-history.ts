export type LayerHistoryEntry = {
  markerUrl: string;
};

const ACTIVE_LAYER_HISTORY_MARKERS_KEY = "__wottyStarkActiveLayerHistoryMarkers";

type LayerHistoryGlobal = typeof globalThis & {
  __wottyStarkActiveLayerHistoryMarkers?: Set<string>;
};

function activeLayerHistoryMarkers() {
  const scope = globalThis as LayerHistoryGlobal;
  if (!scope[ACTIVE_LAYER_HISTORY_MARKERS_KEY]) {
    scope[ACTIVE_LAYER_HISTORY_MARKERS_KEY] = new Set<string>();
  }
  return scope[ACTIVE_LAYER_HISTORY_MARKERS_KEY];
}

export function setLayerHistoryMarkerActive(markerId: string, active: boolean) {
  const markers = activeLayerHistoryMarkers();
  if (active) {
    markers.add(markerId);
  } else {
    markers.delete(markerId);
  }
}

export function hasActiveLayerHistoryMarker() {
  return activeLayerHistoryMarkers().size > 0;
}

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
