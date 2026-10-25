export const CURRENT_APP_VERSION_CODE = 163;
export const CURRENT_APP_VERSION_NAME = "0.8.0-beta.1";
export const APP_UPDATE_URL = "https://s.wotty.app/version.json";

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
