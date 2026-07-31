import type { DataMode } from "@/lib/stark/models/types";
import { getCurrentDataMode, setCurrentDataMode } from "@/lib/stark/storage/local-config";
import { LocalRepository } from "@/lib/stark/repository/LocalRepository";
import type { DataRepository } from "@/lib/stark/repository/DataRepository";
import { RemoteRepository } from "@/lib/stark/repository/RemoteRepository";

export class DataModeManager {
  private readonly localRepo = new LocalRepository();
  private readonly remoteRepo = new RemoteRepository();
  private currentMode: DataMode = "LOCAL";

  constructor() {
    if (typeof window !== "undefined") {
      this.currentMode = getCurrentDataMode() as DataMode;
    }
  }

  getRepository(): DataRepository {
    return this.currentMode === "CLOUD" ? this.remoteRepo : this.localRepo;
  }

  getLocalRepository(): DataRepository {
    return this.localRepo;
  }

  getMode(): DataMode {
    return this.currentMode;
  }

  async switchMode(mode: DataMode) {
    this.currentMode = mode;
    if (mode === "LOCAL") {
      setCurrentDataMode(mode);
      return;
    }
    setCurrentDataMode(mode);
    this.currentMode = mode;
  }
}
