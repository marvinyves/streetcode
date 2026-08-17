import type { Locale } from "@/lib/i18n/dictionaries";

/** Per-stock sector, keyed by the English strings used in STOCK_UNIVERSE. */
const SECTOR_LABELS_SV: Record<string, string> = {
  Technology: "Teknik",
  "Communication Services": "Kommunikation",
  "Consumer Cyclical": "Sällanköpsvaror",
  Healthcare: "Hälsovård",
  Financial: "Finans",
  Industrials: "Industri",
  "Consumer Defensive": "Dagligvaror",
  Energy: "Energi",
  Utilities: "Kraftförsörjning",
  "Real Estate": "Fastigheter",
  "Basic Materials": "Material",
};

/** Sector ETF ticker (stable across snapshots) → Swedish label, for heat_map_snapshots.sectors. */
const SECTOR_ETF_LABELS_SV: Record<string, string> = {
  XLK: "Teknik",
  XLF: "Finans",
  XLE: "Energi",
  XLV: "Hälsovård",
  XLY: "Sällanköpsvaror",
  XLP: "Dagligvaror",
  XLI: "Industri",
  XLB: "Material",
  XLRE: "Fastigheter",
  XLU: "Kraftförsörjning",
  XLC: "Kommunikation",
};

export function sectorLabel(sector: string, locale: Locale): string {
  if (locale !== "sv") return sector;
  return SECTOR_LABELS_SV[sector] ?? sector;
}

export function sectorEtfLabel(symbol: string, fallback: string, locale: Locale): string {
  if (locale !== "sv") return fallback;
  return SECTOR_ETF_LABELS_SV[symbol] ?? fallback;
}
