export const CURRENT_APP_VERSION_CODE = 156;
export const CURRENT_APP_VERSION_NAME = "0.7.2-dev.1";
export const APP_UPDATE_BASE_URL = "https://star7.sevencn.com";

export type AppVersionInfo = {
  versionCode: number;
  versionName: string;
  apkUrl?: string | null;
  changelog?: string | null;
  forceUpdate?: boolean;
  edition?: "web" | "ktweb";
};

export function hasNewerAppVersion(currentVersionCode: number, latest: AppVersionInfo) {
  return Number.isFinite(latest.versionCode) && latest.versionCode > currentVersionCode;
}

export function appVersionEndpoint(baseUrl: string, edition?: AppVersionInfo["edition"]) {
  const endpoint = baseUrl.replace(/\/$/, "") + "/api/app/version";
  return edition ? `${endpoint}?edition=${encodeURIComponent(edition)}` : endpoint;
}
