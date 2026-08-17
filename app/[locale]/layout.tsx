import { notFound } from "next/navigation";
import { isLocale, locales, getDictionary } from "@/lib/i18n/dictionaries";
import { SiteHeader } from "@/components/site-header";
import { AskBar } from "@/components/ask-bar";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = getDictionary(locale);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader locale={locale} />
      <main className="flex-1 pb-32">{children}</main>
      <footer className="border-t border-border px-4 py-8 text-center text-xs text-muted sm:px-6">
        {dict.tagline}
      </footer>
      <AskBar locale={locale} />
    </div>
  );
}
