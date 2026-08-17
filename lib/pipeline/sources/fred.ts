const FRED_SERIES = [
  { id: "CPIAUCSL", label: "CPI (all urban consumers, index)" },
  { id: "FEDFUNDS", label: "Effective federal funds rate (%)" },
  { id: "UNRATE", label: "Unemployment rate (%)" },
] as const;

export type FredSeriesResult = {
  id: string;
  label: string;
  date: string;
  value: string;
};

async function fetchSeries(
  seriesId: string,
  label: string,
  apiKey: string,
): Promise<FredSeriesResult | null> {
  const url = new URL("https://api.stlouisfed.org/fred/series/observations");
  url.searchParams.set("series_id", seriesId);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("file_type", "json");
  url.searchParams.set("sort_order", "desc");
  url.searchParams.set("limit", "1");

  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const obs = data.observations?.[0];
  if (!obs || obs.value === ".") return null;

  return { id: seriesId, label, date: obs.date, value: obs.value };
}

export async function fetchFredData(): Promise<FredSeriesResult[]> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    console.warn("[fred] FRED_API_KEY not set, skipping.");
    return [];
  }

  const results = await Promise.allSettled(
    FRED_SERIES.map((s) => fetchSeries(s.id, s.label, apiKey)),
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<FredSeriesResult | null> =>
        r.status === "fulfilled",
    )
    .map((r) => r.value)
    .filter((v): v is FredSeriesResult => v !== null);
}

const FRED_RELEASES = [
  { id: 10, label: "CPI release" },
  { id: 50, label: "Employment Situation (jobs report)" },
] as const;

export type FredReleaseDate = {
  date: string;
  label: string;
};

async function fetchReleaseDates(
  releaseId: number,
  label: string,
  fromDate: string,
  toDate: string,
  apiKey: string,
): Promise<FredReleaseDate[]> {
  const url = new URL("https://api.stlouisfed.org/fred/release/dates");
  url.searchParams.set("release_id", String(releaseId));
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("file_type", "json");
  url.searchParams.set("realtime_start", fromDate);
  url.searchParams.set("realtime_end", toDate);
  url.searchParams.set("include_release_dates_with_no_data", "true");

  const res = await fetch(url);
  if (!res.ok) return [];
  const data = await res.json();
  const dates = (data.release_dates ?? []) as Array<{ date: string }>;
  return dates
    .filter((d) => d.date >= fromDate && d.date <= toDate)
    .map((d) => ({ date: d.date, label }));
}

/**
 * Free-tier fallback for the economic calendar: FRED's own release-date
 * schedule for the two highest-signal recurring releases. Used when a
 * fuller economic calendar (e.g. Finnhub's, which needs a paid plan) isn't
 * available — see fetchFinnhubEconomicCalendar.
 */
export async function fetchFredReleaseCalendar(
  fromDate: string,
  toDate: string,
): Promise<FredReleaseDate[]> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    console.warn("[fred] FRED_API_KEY not set, skipping release calendar.");
    return [];
  }

  const results = await Promise.allSettled(
    FRED_RELEASES.map((r) =>
      fetchReleaseDates(r.id, r.label, fromDate, toDate, apiKey),
    ),
  );

  return results
    .filter(
      (r): r is PromiseFulfilledResult<FredReleaseDate[]> =>
        r.status === "fulfilled",
    )
    .flatMap((r) => r.value);
}
