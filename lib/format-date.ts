import type { Locale } from "@/lib/i18n/dictionaries";

const intlLocale: Record<Locale, string> = {
  en: "en-US",
  sv: "sv-SE",
};

export function formatBriefDate(dateStr: string, locale: Locale) {
  const date = new Date(`${dateStr}T00:00:00Z`);
  return new Intl.DateTimeFormat(intlLocale[locale], {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatShortDate(dateStr: string, locale: Locale) {
  const date = new Date(`${dateStr}T00:00:00Z`);
  return new Intl.DateTimeFormat(intlLocale[locale], {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
