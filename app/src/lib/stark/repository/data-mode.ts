import type { DataMode } from "@/lib/stark/models/types";

export function selectDataRepository<T>(mode: DataMode, remoteRepository: T, localRepository: T): T {
  return mode === "CLOUD" ? remoteRepository : localRepository;
}

/**
 * Keep a long-lived repository reference safe across App mode switches.
 * Next.js can evaluate and cache a tab module while local mode is active;
 * resolving the target on every method access prevents that module from
 * continuing to read the old repository after switching to cloud mode.
 */
export function createModeAwareRepository<T extends object>(resolveRepository: () => T): T {
  return new Proxy({} as T, {
    get(_target, property) {
      const repository = resolveRepository();
      const value = Reflect.get(repository, property);
      return typeof value === "function" ? value.bind(repository) : value;
    },
  });
}
