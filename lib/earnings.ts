import type { EarningsEventRow } from "@/lib/calendar";
import type { RedditPost } from "@/lib/pipeline/sources/reddit";
import { STOCK_UNIVERSE } from "@/lib/pipeline/sources/stock-universe";

export const UNIVERSE_BY_SYMBOL = new Map(STOCK_UNIVERSE.map((s) => [s.symbol, s]));

export function groupEarningsByDate(
  items: EarningsEventRow[],
): Map<string, EarningsEventRow[]> {
  const map = new Map<string, EarningsEventRow[]>();
  for (const e of items) {
    const list = map.get(e.date) ?? [];
    list.push(e);
    map.set(e.date, list);
  }
  return map;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Tickers from `symbols` that show up (as a distinct, optionally
 * $-prefixed token) in this week's top Reddit post titles — a free,
 * no-API-key proxy for "retail is anticipating this one" beyond just
 * market cap (there's no accessible "most anticipated" data feed —
 * Earnings Whispers has no public API, and Finnhub's earnings calendar
 * only returns symbol/date/hour, no name or significance signal).
 */
export function buzzySymbols(symbols: string[], posts: RedditPost[]): Set<string> {
  const buzzy = new Set<string>();
  const candidates = Array.from(new Set(symbols)).filter((s) => s.length >= 2);
  for (const symbol of candidates) {
    const re = new RegExp(`\\$?\\b${escapeRegExp(symbol)}\\b`);
    if (posts.some((p) => re.test(p.title))) buzzy.add(symbol);
  }
  return buzzy;
}

export type EarningsTier = "large-cap" | "buzz" | "other";
export type TieredEarningsEvent = EarningsEventRow & { tier: EarningsTier; name?: string };

const TIER_RANK: Record<EarningsTier, number> = { "large-cap": 0, buzz: 1, other: 2 };

export function tierEarnings(
  items: EarningsEventRow[],
  buzzy: Set<string>,
): TieredEarningsEvent[] {
  return items
    .map((item): TieredEarningsEvent => {
      const universe = UNIVERSE_BY_SYMBOL.get(item.symbol);
      if (universe) return { ...item, tier: "large-cap", name: universe.name };
      if (buzzy.has(item.symbol)) return { ...item, tier: "buzz" };
      return { ...item, tier: "other" };
    })
    .sort((a, b) => {
      if (TIER_RANK[a.tier] !== TIER_RANK[b.tier]) return TIER_RANK[a.tier] - TIER_RANK[b.tier];
      if (a.tier === "large-cap") {
        return (
          (UNIVERSE_BY_SYMBOL.get(b.symbol)?.marketCapB ?? 0) -
          (UNIVERSE_BY_SYMBOL.get(a.symbol)?.marketCapB ?? 0)
        );
      }
      return a.symbol.localeCompare(b.symbol);
    });
}

/** This week's earnings, grouped by date, each tagged large-cap / buzz / other and ranked within its tier. */
export function anticipatedEarningsByDate(
  items: EarningsEventRow[],
  redditPosts: RedditPost[],
): Map<string, TieredEarningsEvent[]> {
  const otherSymbols = items
    .filter((i) => !UNIVERSE_BY_SYMBOL.has(i.symbol))
    .map((i) => i.symbol);
  const buzzy = buzzySymbols(otherSymbols, redditPosts);

  const byDate = groupEarningsByDate(items);
  const result = new Map<string, TieredEarningsEvent[]>();
  for (const [date, dayItems] of byDate) {
    result.set(date, tierEarnings(dayItems, buzzy));
  }
  return result;
}

export type TimeSlot = "bmo" | "amc" | "unspecified";

function slotOf(item: EarningsEventRow): TimeSlot {
  if (item.hour === "bmo") return "bmo";
  if (item.hour === "amc") return "amc";
  return "unspecified";
}

/** Splits a day's earnings into Before Open / After Close / unspecified-time groups. */
export function groupByTimeSlot<T extends EarningsEventRow>(items: T[]): Record<TimeSlot, T[]> {
  const result: Record<TimeSlot, T[]> = { bmo: [], amc: [], unspecified: [] };
  for (const item of items) {
    result[slotOf(item)].push(item);
  }
  return result;
}
