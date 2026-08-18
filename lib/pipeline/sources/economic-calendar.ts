export type EconomicCalendarEvent = {
  date: string;
  time: string | null;
  currency: string;
  label: string;
  detail: string | null;
  importance: "high" | "medium" | "low" | null;
};

const IMPACT_MAP: Record<string, "high" | "medium" | "low"> = {
  High: "high",
  Medium: "medium",
  Low: "low",
};

/**
 * US-only releases for this US-focused market brief — everything else
 * (AUD/NZD/CNY/CAD/EUR/GBP/JPY) is dropped as noise.
 */
const MAJOR_CURRENCIES = new Set(["USD"]);

type FfEvent = {
  title: string;
  country: string;
  date: string;
  impact: string;
  forecast: string;
  previous: string;
};

function formatDetail(forecast: string, previous: string): string | null {
  const parts: string[] = [];
  if (forecast) parts.push(`Forecast: ${forecast}`);
  if (previous) parts.push(`Previous: ${previous}`);
  return parts.length ? parts.join(", ") : null;
}

/**
 * Free, no-key multi-currency economic calendar feed (ForexFactory's public
 * "this week" JSON). Covers the current calendar week (Sun–Sat) only — no
 * next-week endpoint is available on this mirror, so requests near the end
 * of the week may miss a day or two at the tail of a 7-day lookahead.
 * Used ahead of Finnhub's economic calendar, which needs a paid plan.
 */
export async function fetchEconomicCalendar(
  fromDate: string,
  toDate: string,
): Promise<EconomicCalendarEvent[]> {
  try {
    const res = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json");
    if (!res.ok) throw new Error(`ForexFactory calendar feed failed: ${res.status}`);
    const items = (await res.json()) as FfEvent[];

    return items
      .filter((e) => e.country && e.title && MAJOR_CURRENCIES.has(e.country))
      .map((e): EconomicCalendarEvent | null => {
        const d = new Date(e.date);
        if (Number.isNaN(d.getTime())) return null;
        return {
          date: d.toISOString().slice(0, 10),
          time: d.toISOString().slice(11, 16),
          currency: e.country,
          label: e.title,
          detail: formatDetail(e.forecast, e.previous),
          importance: IMPACT_MAP[e.impact] ?? null,
        };
      })
      .filter((e): e is EconomicCalendarEvent => e !== null)
      .filter((e) => e.importance !== "low")
      .filter((e) => e.date >= fromDate && e.date <= toDate)
      .sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")));
  } catch (err) {
    console.warn("[economic-calendar] ForexFactory feed fetch failed:", err);
    return [];
  }
}
