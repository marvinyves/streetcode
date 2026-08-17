const SECTOR_ETFS = [
  { symbol: "XLK", label: "Technology" },
  { symbol: "XLF", label: "Financials" },
  { symbol: "XLE", label: "Energy" },
  { symbol: "XLV", label: "Health Care" },
  { symbol: "XLY", label: "Consumer Discretionary" },
  { symbol: "XLP", label: "Consumer Staples" },
  { symbol: "XLI", label: "Industrials" },
  { symbol: "XLB", label: "Materials" },
  { symbol: "XLRE", label: "Real Estate" },
  { symbol: "XLU", label: "Utilities" },
  { symbol: "XLC", label: "Communication Services" },
] as const;

export type SectorPerformance = {
  symbol: string;
  label: string;
  changePercent: number;
};

async function fetchQuote(symbol: string, token: string) {
  const url = new URL("https://finnhub.io/api/v1/quote");
  url.searchParams.set("symbol", symbol);
  url.searchParams.set("token", token);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Finnhub quote ${symbol} failed: ${res.status}`);
  return res.json();
}

/**
 * S&P 500 sector heat map, approximated via SPDR Select Sector ETF daily
 * performance (free-tier-friendly proxy). Configurable universe — see
 * SECTOR_ETFS above.
 */
export async function fetchSectorHeatMap(): Promise<SectorPerformance[]> {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) {
    console.warn("[heatmap] FINNHUB_API_KEY not set, skipping.");
    return [];
  }

  const results = await Promise.allSettled(
    SECTOR_ETFS.map(async (s): Promise<SectorPerformance> => {
      const data = await fetchQuote(s.symbol, token);
      return { symbol: s.symbol, label: s.label, changePercent: data.dp };
    }),
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<SectorPerformance> =>
        r.status === "fulfilled",
    )
    .map((r) => r.value)
    .filter((s) => typeof s.changePercent === "number" && !Number.isNaN(s.changePercent));
}
