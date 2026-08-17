import { heatColor, heatTextColor } from "@/lib/heatmap-colors";
import { formatPercent } from "@/lib/format-percent";
import { sectorLabel } from "@/lib/sector-labels";
import type { StockPerformance } from "@/lib/calendar";
import type { Locale } from "@/lib/i18n/dictionaries";

/**
 * Mobile-first alternative to the treemap: a treemap has no legible way to
 * fit ~50 tiles in a 350px-wide viewport, so on small screens we show
 * sector-grouped, sorted stock chips instead — same data, scannable at any
 * width. See StockTreemap for the tablet/desktop view.
 */
export function StockHeatmapList({
  stocks,
  locale,
}: {
  stocks: StockPerformance[];
  locale: Locale;
}) {
  const bySector = new Map<string, StockPerformance[]>();
  for (const s of stocks) {
    const list = bySector.get(s.sector) ?? [];
    list.push(s);
    bySector.set(s.sector, list);
  }

  const sectors = Array.from(bySector.entries())
    .map(([sector, items]) => ({
      sector,
      avg: items.reduce((sum, s) => sum + s.changePercent, 0) / items.length,
      items: items.slice().sort((a, b) => b.changePercent - a.changePercent),
    }))
    .sort((a, b) => b.avg - a.avg);

  return (
    <div className="space-y-3">
      {sectors.map((s) => (
        <div key={s.sector} className="rounded-xl border border-border">
          <div className="flex items-center justify-between border-b border-border px-3 py-2.5">
            <span className="text-sm font-medium">{sectorLabel(s.sector, locale)}</span>
            <span
              className="text-sm font-semibold tabular-nums"
              style={{ color: heatTextColor(s.avg) }}
            >
              {formatPercent(s.avg, locale)}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 p-3">
            {s.items.map((stock) => {
              const style = heatColor(stock.changePercent);
              return (
                <span
                  key={stock.symbol}
                  className="rounded-md px-2 py-1.5 text-xs font-medium tabular-nums"
                  style={{ backgroundColor: style.background, color: style.color }}
                >
                  {stock.symbol} {formatPercent(stock.changePercent, locale, 1)}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
