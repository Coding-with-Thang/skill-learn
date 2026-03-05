import { type NextRequest } from "next/server";
import { normalizeLocale } from "@skill-learn/lib/utils/i18nDb";

/**
 * Extract locale from API request.
 * Checks, in order: query param ?locale=, header x-locale, header accept-language.
 * Defaults to "en" if none found.
 */
export function getLocaleFromRequest(request: NextRequest): string {
  const url = new URL(request.url);
  const queryLocale = url.searchParams.get("locale");
  if (queryLocale) return normalizeLocale(queryLocale);

  const headerLocale = request.headers.get("x-locale");
  if (headerLocale) return normalizeLocale(headerLocale);

  const acceptLang = request.headers.get("accept-language");
  if (acceptLang) {
    const first = acceptLang.split(",")[0]?.split("-")[0]?.trim();
    if (first) return normalizeLocale(first);
  }

  return normalizeLocale(undefined);
}
