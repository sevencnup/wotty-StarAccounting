import type { DataMode } from "@/lib/stark/models/types";
import { getCurrentDataMode, setCurrentDataMode } from "@/lib/stark/storage/local-config";
import { LocalRepository } from "@/lib/stark/repository/LocalRepository";
import type { DataRepository } from "@/lib/stark/repository/DataRepository";
import { RemoteRepository } from "@/lib/stark/repository/RemoteRepository";
import { selectDataRepository } from "@/lib/stark/repository/data-mode";
import { getCloudAuthToken } from "@/lib/stark/storage/cloud-auth";

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
    return selectDataRepository<DataRepository>(this.currentMode, this.remoteRepo, this.localRepo);
  }

  getLocalRepository(): DataRepository {
    return this.localRepo;
  }

  getMode(): DataMode {
    return this.currentMode;
  }

  setCloudApiUrl(url: string) {
    this.remoteRepo.setBaseUrl(url);
  }

  async switchMode(mode: DataMode) {
    if (mode === "CLOUD" && !getCloudAuthToken()) {
      throw new Error("切换云端模式前请先登录");
    }
    this.remoteRepo.clearCache();
    this.currentMode = mode;
    setCurrentDataMode(mode);
  }
}
