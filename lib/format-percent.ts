import type { Locale } from "@/lib/i18n/dictionaries";

/** Signed percent string with a locale-appropriate decimal separator (Swedish uses a comma). */
export function formatPercent(value: number, locale: Locale, decimals = 2): string {
  const sign = value >= 0 ? "+" : "";
  const formatted = value.toFixed(decimals);
  return `${sign}${locale === "sv" ? formatted.replace(".", ",") : formatted}%`;
}
