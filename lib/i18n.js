/**
 * Resolve a localized string or passthrough plain strings.
 * @param {string | { en?: string, ta?: string } | null | undefined} value
 * @param {"en" | "ta"} locale
 */
export function t(value, locale = "en") {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value[locale] || value.en || value.ta || "";
}

export const LOCALES = [
  { id: "en", label: "EN", nativeLabel: "English" },
  { id: "ta", label: "தமிழ்", nativeLabel: "தமிழ்" },
];

export const DEFAULT_LOCALE = "en";
export const LOCALE_STORAGE_KEY = "wedding-invite-locale";
