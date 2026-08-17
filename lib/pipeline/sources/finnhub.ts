const QUOTE_PROXIES = [
  { symbol: "SPY", label: "S&P 500 (SPY)" },
  { symbol: "QQQ", label: "Nasdaq 100 (QQQ)" },
  { symbol: "DIA", label: "Dow Jones (DIA)" },
  { symbol: "GLD", label: "Gold (GLD)" },
  { symbol: "USO", label: "Oil (USO)" },
  { symbol: "UUP", label: "US Dollar Index (UUP)" },
] as const;

export type FinnhubQuote = {
  label: string;
  symbol: string;
  current: number;
  changePercent: number;
};

export type FinnhubEarning = {
  symbol: string;
  date: string;
  hour: string | null;
};

export type FinnhubNews = {
  headline: string;
  summary: string;
  url: string;
  source: string;
};

async function finnhubGet(path: string, token: string) {
  const url = new URL(`https://finnhub.io/api/v1${path}`);
  url.searchParams.set("token", token);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Finnhub ${path} failed: ${res.status}`);
  return res.json();
}

export async function fetchFinnhubQuotes(): Promise<FinnhubQuote[]> {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) {
    console.warn("[finnhub] FINNHUB_API_KEY not set, skipping quotes.");
    return [];
  }

  const results = await Promise.allSettled(
    QUOTE_PROXIES.map(async (p): Promise<FinnhubQuote> => {
      const data = await finnhubGet(`/quote?symbol=${p.symbol}`, token);
      return {
        label: p.label,
        symbol: p.symbol,
        current: data.c,
        changePercent: data.dp,
      };
    }),
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<FinnhubQuote> =>
        r.status === "fulfilled",
    )
    .map((r) => r.value)
    .filter((q) => typeof q.current === "number" && q.current !== 0);
}

export async function fetchFinnhubEarnings(
  fromDate: string,
  toDate: string,
): Promise<FinnhubEarning[]> {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) {
    console.warn("[finnhub] FINNHUB_API_KEY not set, skipping earnings.");
    return [];
  }

  try {
    const data = await finnhubGet(
      `/calendar/earnings?from=${fromDate}&to=${toDate}`,
      token,
    );
    const items = (data.earningsCalendar ?? []) as Array<{
      symbol: string;
      date: string;
      hour: string;
    }>;
    return items.slice(0, 15).map((e) => ({
      symbol: e.symbol,
      date: e.date,
      hour: e.hour || null,
    }));
  } catch (err) {
    console.warn("[finnhub] earnings fetch failed:", err);
    return [];
  }
}

/**
 * Uncapped earnings list for a date range, for storing as calendar records
 * (as opposed to fetchFinnhubEarnings, which truncates for brief context).
 */
export async function fetchFinnhubEarningsFull(
  fromDate: string,
  toDate: string,
): Promise<FinnhubEarning[]> {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) {
    console.warn("[finnhub] FINNHUB_API_KEY not set, skipping earnings calendar.");
    return [];
  }

  try {
    const data = await finnhubGet(
      `/calendar/earnings?from=${fromDate}&to=${toDate}`,
      token,
    );
    const items = (data.earningsCalendar ?? []) as Array<{
      symbol: string;
      date: string;
      hour: string;
    }>;
    return items.map((e) => ({
      symbol: e.symbol,
      date: e.date,
      hour: e.hour || null,
    }));
  } catch (err) {
    console.warn("[finnhub] earnings calendar fetch failed:", err);
    return [];
  }
}

export type EconomicEvent = {
  date: string;
  label: string;
  detail: string | null;
  importance: string | null;
};

const IMPORTANCE_MAP: Record<number, string> = { 0: "low", 1: "medium", 2: "high" };

/**
 * Best-effort — Finnhub's economic calendar endpoint is limited on the free
 * tier and may return nothing. Never blocks the pipeline if unavailable.
 */
export async function fetchFinnhubEconomicCalendar(
  fromDate: string,
  toDate: string,
): Promise<EconomicEvent[]> {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) {
    console.warn("[finnhub] FINNHUB_API_KEY not set, skipping economic calendar.");
    return [];
  }

  try {
    const data = await finnhubGet(
      `/calendar/economic?from=${fromDate}&to=${toDate}`,
      token,
    );
    const items = (data.economicCalendar ?? []) as Array<{
      event: string;
      country: string;
      time: string;
      impact: number;
      actual?: number;
      estimate?: number;
      prev?: number;
    }>;
    return items
      .filter((e) => e.country === "US")
      .map((e) => ({
        date: e.time.slice(0, 10),
        label: e.event,
        detail:
          e.estimate !== undefined || e.prev !== undefined
            ? `Estimate: ${e.estimate ?? "n/a"}, Previous: ${e.prev ?? "n/a"}`
            : null,
        importance: IMPORTANCE_MAP[e.impact] ?? null,
      }));
  } catch (err) {
    console.warn("[finnhub] economic calendar fetch failed (often needs a paid Finnhub plan):", err);
    return [];
  }
}

export async function fetchFinnhubNews(): Promise<FinnhubNews[]> {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) {
    console.warn("[finnhub] FINNHUB_API_KEY not set, skipping news.");
    return [];
  }

  try {
    const data = await finnhubGet("/news?category=general", token);
    const items = data as Array<{
      headline: string;
      summary: string;
      url: string;
      source: string;
    }>;
    return items.slice(0, 10).map((n) => ({
      headline: n.headline,
      summary: n.summary,
      url: n.url,
      source: n.source,
    }));
  } catch (err) {
    console.warn("[finnhub] news fetch failed:", err);
    return [];
  }
}
