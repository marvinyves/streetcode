import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale, getDictionary } from "@/lib/i18n/dictionaries";
import { getBriefByDate } from "@/lib/briefs";
import { BriefContent } from "@/components/brief-content";

export const revalidate = 300;

export default async function ArchiveDatePage({
  params,
}: {
  params: Promise<{ locale: string; date: string }>;
}) {
  const { locale, date } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale).archive;
  const brief = await getBriefByDate(date);

  if (!brief) notFound();

  return (
    <>
      <BriefContent brief={brief} locale={locale} heading={dict.entryHeading} />
      <div className="mx-auto w-full max-w-2xl px-4 pb-8 sm:px-6">
        <Link
          href={`/${locale}/archive`}
          className="text-sm font-medium text-accent hover:underline"
        >
          ← {dict.heading}
        </Link>
      </div>
    </>
  );
}
