import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { formatBriefDate, formatShortDate } from "@/lib/format-date";
import type { Brief } from "@/lib/supabase/client";
import type { EarningsEventRow, EconomicEventRow, HeatMapSnapshot } from "@/lib/calendar";
import { UNIVERSE_BY_SYMBOL, rankEarnings } from "@/lib/earnings";
import { normalizeBulletText } from "@/lib/normalize-bullets";
import { StockTreemap } from "@/components/stock-treemap";
import { StockHeatmapList } from "@/components/stock-heatmap-list";
import { HeatmapLegend } from "@/components/heatmap-legend";
import { EconomicCalendarTable } from "@/components/economic-calendar-table";

const MAX_OTHER_PER_DAY = 10;

const IMPORTANCE_STYLES: Record<string, string> = {
  high: "bg-accent text-white",
  medium: "bg-accent-soft text-accent",
  low: "bg-border text-muted",
};

function renderBody(text: string) {
  return normalizeBulletText(text)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, i) => {
      const isBullet = line.startsWith("-") || line.startsWith("•");
      const content = isBullet ? line.replace(/^[-•]\s*/, "") : line;
      return isBullet ? (
        <li key={i} className="pl-1 marker:text-accent">
          {content}
        </li>
      ) : (
        <p key={i}>{content}</p>
      );
    });
}

export function BriefContent({
  brief,
  locale,
  heading,
  weekEarnings,
  weekEconomic,
  heatmap,
}: {
  brief: Brief;
  locale: Locale;
  heading?: string;
  weekEarnings?: EarningsEventRow[];
  weekEconomic?: EconomicEventRow[];
  heatmap?: HeatMapSnapshot | null;
}) {
  const dict = getDictionary(locale).today;
  const calendarDict = getDictionary(locale).calendar;
  const heatmapDict = getDictionary(locale).heatmap;

  const earningsByDate = new Map<string, EarningsEventRow[]>();
  for (const e of weekEarnings ?? []) {
    const list = earningsByDate.get(e.date) ?? [];
    list.push(e);
    earningsByDate.set(e.date, list);
  }
  const bodyText = locale === "sv" && brief.brief_sv ? brief.brief_sv : brief.brief_en;
  const bodyLines = renderBody(bodyText);
  const hasBullets = bodyLines.some((el) => el.type === "li");

  const overnightText =
    locale === "sv" && brief.overnight_sv ? brief.overnight_sv : brief.overnight_en;
  const overnightLines = overnightText ? renderBody(overnightText) : null;
  const overnightHasBullets = overnightLines?.some((el) => el.type === "li");

  const keyEvents =
    locale === "sv" && brief.key_events_sv.length > 0
      ? brief.key_events_sv
      : brief.key_events;
  const lookingAhead =
    locale === "sv" && brief.looking_ahead_sv.length > 0
      ? brief.looking_ahead_sv
      : brief.looking_ahead;

  return (
    <article className="mx-auto w-full max-w-2xl px-4 py-10 sm:px-6 sm:py-12">
      <p className="text-sm font-medium text-accent">
        {formatBriefDate(brief.date, locale)}
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
        {heading ?? dict.heading}
      </h1>

      {overnightLines && (
        <section className="mt-8 rounded-xl border border-border bg-panel px-5 py-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {dict.overnight}
          </h2>
          {overnightHasBullets ? (
            <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-relaxed marker:text-accent">
              {overnightLines}
            </ul>
          ) : (
            <div className="mt-3 space-y-2 text-[15px] leading-relaxed">
              {overnightLines}
            </div>
          )}
        </section>
      )}

      <section className="mt-8 rounded-xl border-2 border-accent px-5 py-5">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">
          {dict.marketUpdates}
        </h2>
        {hasBullets ? (
          <ul className="mt-3 list-disc space-y-4 pl-5 text-[17px] leading-relaxed marker:text-accent">
            {bodyLines}
          </ul>
        ) : (
          <div className="mt-3 space-y-4 text-[17px] leading-relaxed">
            {bodyLines}
          </div>
        )}
      </section>

      {keyEvents.length > 0 && (
        <section className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {dict.keyEvents}
          </h2>
          <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
            {keyEvents.map((event, i) => (
              <li key={i} className="flex flex-col gap-0.5 px-4 py-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium uppercase tracking-wide text-accent">
                    {event.type}
                  </span>
                  {event.importance && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        IMPORTANCE_STYLES[event.importance] ?? "bg-border text-muted"
                      }`}
                    >
                      {event.importance}
                    </span>
                  )}
                </div>
                <span className="font-medium">{event.label}</span>
                {event.detail && (
                  <span className="text-sm text-muted">{event.detail}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {brief.sentiment_notes && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {dict.sentiment}
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-foreground/90">
            {brief.sentiment_notes}
          </p>
        </section>
      )}

      {weekEconomic && weekEconomic.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {calendarDict.economicHeading}
          </h2>
          <EconomicCalendarTable events={weekEconomic} locale={locale} />
        </section>
      )}

      {earningsByDate.size > 0 && (
        <section className="mt-10 rounded-xl border border-success/20 bg-success-soft px-5 py-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-success">
            {dict.weekEarnings}
          </h2>
          <div className="mt-4 space-y-4">
            {Array.from(earningsByDate.entries()).map(([date, items]) => {
              const ranked = rankEarnings(items);
              const known = ranked.filter((item) => UNIVERSE_BY_SYMBOL.has(item.symbol));
              const other = ranked.filter((item) => !UNIVERSE_BY_SYMBOL.has(item.symbol));
              const shownOther = other.slice(0, MAX_OTHER_PER_DAY);
              const extra = other.length - shownOther.length;
              return (
                <div key={date}>
                  <span className="text-xs font-medium uppercase tracking-wide text-success">
                    {formatShortDate(date, locale)}
                  </span>
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {known.map((item) => (
                      <li
                        key={item.id}
                        className="rounded-lg border border-success/20 bg-surface px-2.5 py-1 text-sm"
                        title={
                          item.hour === "bmo"
                            ? calendarDict.beforeOpen
                            : item.hour === "amc"
                              ? calendarDict.afterClose
                              : undefined
                        }
                      >
                        <span className="font-medium">{item.symbol}</span>
                        <span className="text-muted">
                          {" "}
                          · {UNIVERSE_BY_SYMBOL.get(item.symbol)!.name}
                        </span>
                      </li>
                    ))}
                    {shownOther.map((item) => (
                      <li
                        key={item.id}
                        className="rounded-md px-2 py-1 text-xs text-muted"
                        title={
                          item.hour === "bmo"
                            ? calendarDict.beforeOpen
                            : item.hour === "amc"
                              ? calendarDict.afterClose
                              : undefined
                        }
                      >
                        {item.symbol}
                      </li>
                    ))}
                    {extra > 0 && (
                      <li className="flex items-center px-1 text-xs text-muted">
                        +{extra}
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {heatmap && heatmap.stocks.length > 0 && (
        <section className="mt-10">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
              {heatmapDict.heading}
            </h2>
            <span className="whitespace-nowrap text-xs text-muted">
              {heatmapDict.asOf} {formatShortDate(heatmap.date, locale)}
            </span>
          </div>
          <div className="mt-3">
            <div className="sm:hidden">
              <StockHeatmapList stocks={heatmap.stocks} locale={locale} />
            </div>
            <div className="hidden sm:block">
              <StockTreemap stocks={heatmap.stocks} locale={locale} />
            </div>
            <HeatmapLegend caption={heatmapDict.legendCaption} />
          </div>
          <Link
            href={`/${locale}/heatmap`}
            className="mt-3 inline-block text-sm font-medium text-accent hover:underline"
          >
            {heatmapDict.viewFull} →
          </Link>
        </section>
      )}

      {lookingAhead.length > 0 && (
        <section className="mt-10 rounded-xl border border-accent/20 bg-accent-soft px-5 py-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-accent">
            {dict.lookingAhead}
          </h2>
          <ul className="mt-4 space-y-3">
            {lookingAhead.map((item, i) => (
              <li key={i} className="flex flex-col gap-0.5">
                <span className="text-xs font-medium uppercase tracking-wide text-accent">
                  {item.type}
                </span>
                <span className="font-medium">{item.label}</span>
                {item.detail && (
                  <span className="text-sm text-muted">{item.detail}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {brief.sources.length > 0 && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {dict.sources}
          </h2>
          <ul className="mt-3 space-y-1 text-sm">
            {brief.sources.map((source, i) => (
              <li key={i}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline"
                >
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
