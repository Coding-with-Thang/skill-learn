/**
 * i18n utilities for database-stored localized content.
 * Use with JSON columns (e.g. titleJson: { en: "...", fr: "..." }) to resolve
 * the correct string for the user's locale.
 */

export type LocalizedString = Record<string, string>;

/** Supported locales in the app. Order matters for fallback. */
export const SUPPORTED_LOCALES = ["en", "fr"] as const;
export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

const DEFAULT_LOCALE: SupportedLocale = "en";

/**
 * Resolve a localized value to a string for the given locale.
 * Handles: JSON object { en, fr }, plain string (legacy), or null/undefined.
 *
 * @param value - JSON map (e.g. { en: "...", fr: "..." }), plain string, or null
 * @param locale - User's locale (e.g. "en", "fr")
 * @param fallbackLocale - Fallback when locale key is missing (default: "en")
 * @returns Resolved string, or empty string if nothing found
 */
export function getLocalized(
  value: LocalizedString | string | null | undefined,
  locale: string,
  fallbackLocale: string = DEFAULT_LOCALE
): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  const loc = String(locale).toLowerCase();
  const fallback = String(fallbackLocale).toLowerCase();
  return (
    value[loc] ??
    value[fallback] ??
    value[DEFAULT_LOCALE] ??
    (Object.values(value)[0] as string) ??
    ""
  );
}

/**
 * Normalize locale to a supported value. Unknown locales default to "en".
 */
export function normalizeLocale(locale: string | undefined | null): SupportedLocale {
  if (!locale || typeof locale !== "string") return DEFAULT_LOCALE;
  const lower = locale.toLowerCase();
  return SUPPORTED_LOCALES.includes(lower as SupportedLocale)
    ? (lower as SupportedLocale)
    : DEFAULT_LOCALE;
}
