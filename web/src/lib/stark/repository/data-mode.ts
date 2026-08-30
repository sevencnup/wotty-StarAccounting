import type { DataMode } from "@/lib/stark/models/types";

export function selectDataRepository<T>(mode: DataMode, remoteRepository: T, localRepository: T): T {
  return mode === "CLOUD" ? remoteRepository : localRepository;
}
