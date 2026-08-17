import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, getDictionary } from "@/lib/i18n/dictionaries";
import { getAllBriefDates } from "@/lib/briefs";
import { formatShortDate } from "@/lib/format-date";

export const revalidate = 300;

export default async function ArchivePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale).archive;
  const briefs = await getAllBriefDates();

  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">
        {dict.heading}
      </h1>
      <p className="mt-2 text-muted">{dict.subheading}</p>

      {briefs.length === 0 ? (
        <p className="mt-10 text-muted">{dict.empty}</p>
      ) : (
        <ul className="mt-8 divide-y divide-border rounded-xl border border-border">
          {briefs.map((brief) => (
            <li key={brief.date}>
              <Link
                href={`/${locale}/archive/${brief.date}`}
                className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-accent-soft"
              >
                <span className="font-medium">
                  {formatShortDate(brief.date, locale)}
                </span>
                <span className="truncate text-sm text-muted">
                  {brief.brief_en
                    .split("\n")
                    .find((l) => l.trim())
                    ?.replace(/^[-•]\s*/, "")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
