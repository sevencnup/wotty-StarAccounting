export const CURRENT_APP_VERSION_CODE = 116;
export const CURRENT_APP_VERSION_NAME = "0.0.116";
export const APP_UPDATE_BASE_URL = "https://StarAccounting.wotty.app";

export type AppVersionInfo = {
  versionCode: number;
  versionName: string;
  apkUrl?: string | null;
  changelog?: string | null;
  forceUpdate?: boolean;
};

export function hasNewerAppVersion(currentVersionCode: number, latest: AppVersionInfo) {
  return Number.isFinite(latest.versionCode) && latest.versionCode > currentVersionCode;
}

export function appVersionEndpoint(baseUrl: string) {
  return baseUrl.replace(/\/$/, "") + "/api/app/version";
}
