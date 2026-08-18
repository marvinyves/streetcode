import Link from "next/link";
import { isLocale, getDictionary } from "@/lib/i18n/dictionaries";
import { notFound } from "next/navigation";
import { getLatestBrief } from "@/lib/briefs";
import { getEarningsForWeek, getEconomicEventsForWeek, getLatestHeatMap } from "@/lib/calendar";
import { fetchRedditSentiment } from "@/lib/pipeline/sources/reddit";
import { BriefContent } from "@/components/brief-content";

export const revalidate = 300;

export default async function TodayPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale).today;
  const [brief, weekEarnings, weekEconomic, heatmap, redditPosts] = await Promise.all([
    getLatestBrief(),
    getEarningsForWeek(),
    getEconomicEventsForWeek(),
    getLatestHeatMap(),
    fetchRedditSentiment(),
  ]);

  if (!brief) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-24 text-center sm:px-6">
        <p className="text-muted">{dict.empty}</p>
      </div>
    );
  }

  return (
    <>
      <BriefContent
        brief={brief}
        locale={locale}
        weekEarnings={weekEarnings}
        weekEconomic={weekEconomic}
        redditPosts={redditPosts}
        heatmap={heatmap}
      />

      <div className="mx-auto w-full max-w-2xl px-4 pb-8 sm:px-6">
        <Link
          href={`/${locale}/archive`}
          className="text-sm font-medium text-accent hover:underline"
        >
          {dict.readArchive} →
        </Link>
      </div>
    </>
  );
}
