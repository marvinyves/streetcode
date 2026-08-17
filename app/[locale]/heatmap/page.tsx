import { notFound } from "next/navigation";
import { isLocale, getDictionary } from "@/lib/i18n/dictionaries";
import { getLatestHeatMap } from "@/lib/calendar";
import { formatShortDate } from "@/lib/format-date";
import { StockTreemap } from "@/components/stock-treemap";
import { StockHeatmapList } from "@/components/stock-heatmap-list";
import { HeatmapLegend } from "@/components/heatmap-legend";
import { heatColor } from "@/lib/heatmap-colors";

export const revalidate = 300;

export default async function HeatMapPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale).heatmap;
  const snapshot = await getLatestHeatMap();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{dict.heading}</h1>
      <p className="mt-2 text-muted">{dict.subheading}</p>

      {!snapshot || (snapshot.stocks.length === 0 && snapshot.sectors.length === 0) ? (
        <p className="mt-10 text-muted">{dict.empty}</p>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted">
            {dict.asOf} {formatShortDate(snapshot.date, locale)}
          </p>

          {snapshot.stocks.length > 0 && (
            <div className="mt-4">
              <div className="sm:hidden">
                <StockHeatmapList stocks={snapshot.stocks} />
              </div>
              <div className="hidden sm:block">
                <StockTreemap stocks={snapshot.stocks} />
              </div>
              <HeatmapLegend caption={dict.legendCaption} />
            </div>
          )}

          {snapshot.sectors.length > 0 && (
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {snapshot.sectors
                .slice()
                .sort((a, b) => b.changePercent - a.changePercent)
                .map((sector) => {
                  const style = heatColor(sector.changePercent, 3);
                  return (
                    <div
                      key={sector.symbol}
                      className="flex flex-col justify-between rounded-lg p-3"
                      style={{ backgroundColor: style.background }}
                    >
                      <span className="text-xs font-medium" style={{ color: style.color }}>
                        {sector.label}
                      </span>
                      <span
                        className="mt-2 text-lg font-semibold tabular-nums"
                        style={{ color: style.color }}
                      >
                        {sector.changePercent >= 0 ? "+" : ""}
                        {sector.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  );
                })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
