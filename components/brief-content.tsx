import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { formatBriefDate } from "@/lib/format-date";
import type { Brief } from "@/lib/supabase/client";

function renderBody(text: string) {
  return text
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
}: {
  brief: Brief;
  locale: Locale;
  heading?: string;
}) {
  const dict = getDictionary(locale).today;
  const bodyText = locale === "sv" && brief.brief_sv ? brief.brief_sv : brief.brief_en;
  const bodyLines = renderBody(bodyText);
  const hasBullets = bodyLines.some((el) => el.type === "li");

  return (
    <article className="mx-auto w-full max-w-2xl px-6 py-12">
      <p className="text-sm font-medium text-accent">
        {formatBriefDate(brief.date, locale)}
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        {heading ?? dict.heading}
      </h1>

      {hasBullets ? (
        <ul className="mt-8 list-disc space-y-4 pl-5 text-[17px] leading-relaxed marker:text-accent">
          {bodyLines}
        </ul>
      ) : (
        <div className="mt-8 space-y-4 text-[17px] leading-relaxed">
          {bodyLines}
        </div>
      )}

      {brief.key_events.length > 0 && (
        <section className="mt-12">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
            {dict.keyEvents}
          </h2>
          <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
            {brief.key_events.map((event, i) => (
              <li key={i} className="flex flex-col gap-0.5 px-4 py-3">
                <span className="text-xs font-medium uppercase tracking-wide text-accent">
                  {event.type}
                </span>
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
