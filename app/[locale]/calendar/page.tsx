import { notFound } from "next/navigation";
import { isLocale, getDictionary } from "@/lib/i18n/dictionaries";
import { getEconomicEventsForWeek, getEarningsForWeek } from "@/lib/calendar";
import { formatShortDate } from "@/lib/format-date";
import { EconomicCalendarTable } from "@/components/economic-calendar-table";

export const revalidate = 300;

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
        <EconomicCalendarTable events={economic} locale={locale} />
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
