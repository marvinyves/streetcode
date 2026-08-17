"use client";

import { useState } from "react";
import Link from "next/link";
import { getDictionary, type Locale } from "@/lib/i18n/dictionaries";
import { LocaleToggle } from "@/components/locale-toggle";

export function SiteHeader({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const dict = getDictionary(locale);

  const links = [
    { href: `/${locale}`, label: dict.nav.today },
    { href: `/${locale}/archive`, label: dict.nav.archive },
    { href: `/${locale}/calendar`, label: dict.nav.calendar },
    { href: `/${locale}/heatmap`, label: dict.nav.heatmap },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-3xl">
        <div className="flex items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4">
          <Link
            href={`/${locale}`}
            className="flex items-baseline gap-2 font-semibold tracking-tight"
            onClick={() => setOpen(false)}
          >
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden />
            {dict.siteName}
          </Link>

          <nav className="hidden items-center gap-4 sm:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="whitespace-nowrap text-sm text-muted transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
            <LocaleToggle locale={locale} />
          </nav>

          <div className="flex items-center gap-1.5 sm:hidden">
            <LocaleToggle locale={locale} />
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-label={open ? dict.nav.closeMenu : dict.nav.openMenu}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-foreground transition-colors active:bg-accent-soft"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
              >
                {open ? (
                  <path d="M5 5l10 10M15 5L5 15" />
                ) : (
                  <path d="M3 5.5h14M3 10h14M3 14.5h14" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {open && (
          <nav className="flex flex-col border-t border-border sm:hidden">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-border px-4 py-3.5 text-base text-foreground last:border-0"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}
