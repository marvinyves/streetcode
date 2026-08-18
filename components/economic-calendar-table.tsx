import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { formatShortDate } from "@/lib/format-date";
import { currencyFlag } from "@/lib/currency-flag";
import type { EconomicEventRow } from "@/lib/calendar";

const HIGH_IMPORTANCE_ROW_STYLE = "border-l-4 border-l-accent bg-accent-soft";

export function EconomicCalendarTable({
  events,
  locale,
}: {
  events: EconomicEventRow[];
  locale: Locale;
}) {
  const dict = getDictionary(locale).calendar;

  const eventsByDate = new Map<string, EconomicEventRow[]>();
  for (const e of events) {
    const list = eventsByDate.get(e.date) ?? [];
    list.push(e);
    eventsByDate.set(e.date, list);
  }

  if (events.length === 0) {
    return <p className="mt-3 text-sm text-muted">{dict.economicEmpty}</p>;
  }

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-border">
      <div className="grid grid-cols-[3.5rem_2.5rem_1fr] gap-3 border-b border-border bg-surface px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted">
        <span>{dict.timeColumn}</span>
        <span>{dict.currencyColumn}</span>
        <span>{dict.eventColumn}</span>
      </div>
      <div className="divide-y divide-border">
        {Array.from(eventsByDate.entries()).map(([date, items]) => (
          <div key={date}>
            <p className="bg-surface px-4 py-1.5 text-sm font-medium text-accent">
              {formatShortDate(date, locale)}
            </p>
            <div className="divide-y divide-border">
              {items.map((e) => (
                <div
                  key={e.id}
                  className={`grid grid-cols-[3.5rem_2.5rem_1fr] items-start gap-3 px-4 py-2.5 ${
                    e.importance === "high" ? HIGH_IMPORTANCE_ROW_STYLE : ""
                  }`}
                >
                  <span className="text-sm text-muted">{e.time ?? "—"}</span>
                  <span className="flex items-center gap-1 text-sm">
                    <span aria-hidden>{currencyFlag(e.currency)}</span>
                    <span className="text-xs text-muted">{e.currency ?? ""}</span>
                  </span>
                  <div>
                    <p
                      className={`flex items-center gap-1.5 text-sm ${
                        e.importance === "high" ? "font-semibold" : "font-medium"
                      }`}
                    >
                      {e.importance === "high" && (
                        <span aria-hidden className="text-accent">
                          ★
                        </span>
                      )}
                      {e.label}
                    </p>
                    {e.detail && <p className="text-xs text-muted">{e.detail}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
