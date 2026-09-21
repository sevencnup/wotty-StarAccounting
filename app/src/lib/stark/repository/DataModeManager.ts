import type { DataMode } from "@/lib/stark/models/types";
import { getCurrentDataMode, setCurrentDataMode } from "@/lib/stark/storage/local-config";
import { LocalRepository } from "@/lib/stark/repository/LocalRepository";
import type { DataRepository } from "@/lib/stark/repository/DataRepository";
import { RemoteRepository } from "@/lib/stark/repository/RemoteRepository";
import { selectDataRepository } from "@/lib/stark/repository/data-mode";
import { getCloudAuthToken } from "@/lib/stark/storage/cloud-auth";

// 页面切换会创建新的 DataModeManager。仓库本身保持共享，才能复用短期
// 云端缓存和并发请求，避免每个标签页重复拉取同一份账本数据。
const sharedLocalRepo = new LocalRepository();
const sharedRemoteRepo = new RemoteRepository();

export class DataModeManager {
  private readonly localRepo = sharedLocalRepo;
  private readonly remoteRepo = sharedRemoteRepo;
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
