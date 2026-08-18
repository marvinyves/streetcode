const CURRENCY_FLAGS: Record<string, string> = {
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
  JPY: "🇯🇵",
  AUD: "🇦🇺",
  CAD: "🇨🇦",
  CHF: "🇨🇭",
  CNY: "🇨🇳",
  NZD: "🇳🇿",
};

export function currencyFlag(currency: string | null): string {
  if (!currency) return "";
  return CURRENCY_FLAGS[currency] ?? "";
}
