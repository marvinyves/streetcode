import { STOCK_UNIVERSE } from "./stock-universe";

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

export type StockPerformance = {
  symbol: string;
  sector: string;
  marketCapB: number;
  changePercent: number;
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Per-stock quotes for the treemap heat map (STOCK_UNIVERSE). Finnhub's free
 * tier caps at ~60 req/min, so this batches with a pause between chunks
 * rather than firing all requests at once.
 */
export async function fetchStockHeatMapQuotes(): Promise<StockPerformance[]> {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) {
    console.warn("[heatmap] FINNHUB_API_KEY not set, skipping stock treemap.");
    return [];
  }

  const CHUNK_SIZE = 25;
  const CHUNK_DELAY_MS = 1200;
  const out: StockPerformance[] = [];

  for (let i = 0; i < STOCK_UNIVERSE.length; i += CHUNK_SIZE) {
    const chunk = STOCK_UNIVERSE.slice(i, i + CHUNK_SIZE);
    const results = await Promise.allSettled(
      chunk.map(async (s): Promise<StockPerformance> => {
        const data = await fetchQuote(s.symbol, token);
        return {
          symbol: s.symbol,
          sector: s.sector,
          marketCapB: s.marketCapB,
          changePercent: data.dp,
        };
      }),
    );

    for (const r of results) {
      if (r.status === "fulfilled" && typeof r.value.changePercent === "number" && !Number.isNaN(r.value.changePercent)) {
        out.push(r.value);
      }
    }

    if (i + CHUNK_SIZE < STOCK_UNIVERSE.length) {
      await sleep(CHUNK_DELAY_MS);
    }
  }

  return out;
}
