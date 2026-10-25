const SHOWCASE_STORAGE_PREFIXES = ["wotty-stark:showcase:", "wotty:showcase:", "showcase:"];

/** Remove only browser keys owned by the disposable showcase, never normal app or site data. */
export function clearShowcaseStorage(storage: Storage) {
  const keys = Array.from({ length: storage.length }, (_, index) => storage.key(index))
    .filter((key): key is string => key !== null && SHOWCASE_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix)));
  for (const key of keys) storage.removeItem(key);
}
