import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { LocaleToggle } from "@/components/locale-toggle";

export function SiteHeader({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-6 py-4">
        <Link
          href={`/${locale}`}
          className="flex items-baseline gap-2 font-semibold tracking-tight"
        >
          <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
          {dict.siteName}
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href={`/${locale}`}
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            {dict.nav.today}
          </Link>
          <Link
            href={`/${locale}/archive`}
            className="text-sm text-muted transition-colors hover:text-foreground"
          >
            {dict.nav.archive}
          </Link>
          <LocaleToggle locale={locale} />
        </nav>
      </div>
    </header>
  );
}
