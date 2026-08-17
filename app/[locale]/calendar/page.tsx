import { notFound } from "next/navigation";
import { isLocale, getDictionary } from "@/lib/i18n/dictionaries";
import { getEconomicEventsForWeek, getEarningsForWeek } from "@/lib/calendar";
import { formatShortDate } from "@/lib/format-date";

export const revalidate = 300;

const IMPORTANCE_STYLES: Record<string, string> = {
  high: "bg-accent text-white",
  medium: "bg-accent-soft text-accent",
  low: "bg-border text-muted",
};

export default async function CalendarPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale).calendar;
  const [economic, earnings] = await Promise.all([
    getEconomicEventsForWeek(),
    getEarningsForWeek(),
  ]);

  const earningsByDate = new Map<string, typeof earnings>();
  for (const e of earnings) {
    const list = earningsByDate.get(e.date) ?? [];
    list.push(e);
    earningsByDate.set(e.date, list);
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{dict.heading}</h1>
      <p className="mt-2 text-muted">{dict.subheading}</p>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          {dict.economicHeading}
        </h2>
        {economic.length === 0 ? (
          <p className="mt-3 text-sm text-muted">{dict.economicEmpty}</p>
        ) : (
          <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
            {economic.map((e) => (
              <li key={e.id} className="flex items-start justify-between gap-4 px-4 py-3">
                <div>
                  <p className="font-medium">{e.label}</p>
                  {e.detail && <p className="text-sm text-muted">{e.detail}</p>}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-sm text-muted">
                    {formatShortDate(e.date, locale)}
                  </span>
                  {e.importance && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        IMPORTANCE_STYLES[e.importance] ?? "bg-border text-muted"
                      }`}
                    >
                      {e.importance}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          {dict.earningsHeading}
        </h2>
        {earnings.length === 0 ? (
          <p className="mt-3 text-sm text-muted">{dict.earningsEmpty}</p>
        ) : (
          <div className="mt-4 space-y-4">
            {Array.from(earningsByDate.entries()).map(([date, items]) => (
              <div key={date}>
                <p className="text-sm font-medium text-accent">
                  {formatShortDate(date, locale)}
                </p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {items.map((item) => (
                    <li
                      key={item.id}
                      className="rounded-lg border border-border bg-surface px-2.5 py-1 text-sm"
                      title={
                        item.hour === "bmo"
                          ? dict.beforeOpen
                          : item.hour === "amc"
                            ? dict.afterClose
                            : undefined
                      }
                    >
                      {item.symbol}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
