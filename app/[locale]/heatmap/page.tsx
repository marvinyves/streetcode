import { notFound } from "next/navigation";
import { isLocale, getDictionary } from "@/lib/i18n/dictionaries";
import { getLatestHeatMap } from "@/lib/calendar";
import { formatShortDate } from "@/lib/format-date";

export const revalidate = 300;

function cellStyle(changePercent: number): { background: string; color: string } {
  const clamped = Math.max(-3, Math.min(3, changePercent));
  const intensity = Math.abs(clamped) / 3;

  if (changePercent >= 0) {
    return {
      background: `rgba(22, 163, 74, ${0.12 + intensity * 0.55})`,
      color: intensity > 0.55 ? "#ffffff" : "#15803d",
    };
  }
  return {
    background: `rgba(220, 38, 38, ${0.12 + intensity * 0.55})`,
    color: intensity > 0.55 ? "#ffffff" : "#b91c1c",
  };
}

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
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">{dict.heading}</h1>
      <p className="mt-2 text-muted">{dict.subheading}</p>

      {!snapshot || snapshot.sectors.length === 0 ? (
        <p className="mt-10 text-muted">{dict.empty}</p>
      ) : (
        <>
          <p className="mt-6 text-sm text-muted">
            {dict.asOf} {formatShortDate(snapshot.date, locale)}
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {snapshot.sectors
              .slice()
              .sort((a, b) => b.changePercent - a.changePercent)
              .map((sector) => {
                const style = cellStyle(sector.changePercent);
                return (
                  <div
                    key={sector.symbol}
                    className="flex flex-col justify-between rounded-xl p-4"
                    style={{ backgroundColor: style.background }}
                  >
                    <span
                      className="text-sm font-medium"
                      style={{ color: style.color }}
                    >
                      {sector.label}
                    </span>
                    <span
                      className="mt-3 text-2xl font-semibold tabular-nums"
                      style={{ color: style.color }}
                    >
                      {sector.changePercent >= 0 ? "+" : ""}
                      {sector.changePercent.toFixed(2)}%
                    </span>
                    <span
                      className="mt-1 text-xs opacity-80"
                      style={{ color: style.color }}
                    >
                      {sector.symbol}
                    </span>
                  </div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}
