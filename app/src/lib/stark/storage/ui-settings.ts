export type ThemeChoice = "BLUE" | "GREEN" | "AMBER";
export type LanguageChoice = "SYSTEM" | "ZH_CN" | "EN_US";
export type FontChoice = "SMALL" | "STANDARD" | "LARGE";

export type UiSettings = {
  theme: ThemeChoice;
  language: LanguageChoice;
  font: FontChoice;
};

export const UI_SETTINGS_KEY = "wotty-stark:ui-settings";
export const defaultUiSettings: UiSettings = { theme: "BLUE", language: "ZH_CN", font: "STANDARD" };

const themes: ThemeChoice[] = ["BLUE", "GREEN", "AMBER"];
const languages: LanguageChoice[] = ["SYSTEM", "ZH_CN", "EN_US"];
const fonts: FontChoice[] = ["SMALL", "STANDARD", "LARGE"];

function includesValue<T extends string>(values: T[], value: unknown): value is T {
  return typeof value === "string" && values.includes(value as T);
}

export function parseUiSettings(raw: string | null | undefined): UiSettings {
  if (!raw) return defaultUiSettings;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return defaultUiSettings;
    const value = parsed as Partial<UiSettings>;
    return {
      theme: includesValue(themes, value.theme) ? value.theme : defaultUiSettings.theme,
      language: includesValue(languages, value.language) ? value.language : defaultUiSettings.language,
      font: includesValue(fonts, value.font) ? value.font : defaultUiSettings.font,
    };
  } catch {
    return defaultUiSettings;
  }
}

export function readUiSettings(): UiSettings {
  if (typeof window === "undefined") return defaultUiSettings;
  try {
    return parseUiSettings(window.localStorage.getItem(UI_SETTINGS_KEY));
  } catch {
    return defaultUiSettings;
  }
}

export function saveUiSettings(settings: UiSettings) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(UI_SETTINGS_KEY, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent("stark:ui-settings-changed"));
  } catch {
    // Preferences are best-effort and must not block the settings screen.
  }
}

export function applyUiSettings(settings: UiSettings) {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.appTheme = settings.theme.toLowerCase();
  document.documentElement.dataset.fontSize = settings.font.toLowerCase();
  document.documentElement.lang = settings.language === "EN_US"
    ? "en-US"
    : settings.language === "SYSTEM"
      ? (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("en") ? "en-US" : "zh-CN")
      : "zh-CN";
  window.dispatchEvent(new CustomEvent("stark:ui-settings-applied"));
}
