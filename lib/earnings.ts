import type { EarningsEventRow } from "@/lib/calendar";
import { STOCK_UNIVERSE } from "@/lib/pipeline/sources/stock-universe";

export const UNIVERSE_BY_SYMBOL = new Map(STOCK_UNIVERSE.map((s) => [s.symbol, s]));

/** Known large-caps first (by market cap), then the alphabetical long tail. */
export function rankEarnings(items: EarningsEventRow[]): EarningsEventRow[] {
  return items.slice().sort((a, b) => {
    const capA = UNIVERSE_BY_SYMBOL.get(a.symbol)?.marketCapB ?? -1;
    const capB = UNIVERSE_BY_SYMBOL.get(b.symbol)?.marketCapB ?? -1;
    if (capA !== capB) return capB - capA;
    return a.symbol.localeCompare(b.symbol);
  });
}

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

export type NamedEarningsEvent = EarningsEventRow & { name: string };

/** Large-cap-only earnings, grouped by date, ranked by market cap, with company names attached. */
export function largeCapEarningsByDate(
  items: EarningsEventRow[],
): Map<string, NamedEarningsEvent[]> {
  const byDate = groupEarningsByDate(items);
  const result = new Map<string, NamedEarningsEvent[]>();
  for (const [date, dayItems] of byDate) {
    const known = rankEarnings(dayItems).filter((item) => UNIVERSE_BY_SYMBOL.has(item.symbol));
    if (known.length > 0) {
      result.set(
        date,
        known.map((item) => ({ ...item, name: UNIVERSE_BY_SYMBOL.get(item.symbol)!.name })),
      );
    }
  }
  return result;
}
