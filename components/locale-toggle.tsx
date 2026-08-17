"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n/dictionaries";

export function LocaleToggle({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const rest = pathname.split("/").slice(2).join("/");

  return (
    <div className="flex items-center gap-1 rounded-full border border-border bg-surface p-1 text-xs font-medium">
      {locales.map((l) => {
        const href = `/${l}${rest ? `/${rest}` : ""}`;
        const active = l === locale;
        return (
          <Link
            key={l}
            href={href}
            className={`rounded-full px-2.5 py-1 transition-colors ${
              active
                ? "bg-accent text-white"
                : "text-muted hover:text-foreground"
            }`}
          >
            {l.toUpperCase()}
          </Link>
        );
      })}
    </div>
  );
}
