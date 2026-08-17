import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { defaultLocale, isLocale } from "@/lib/i18n/dictionaries";

export default async function RootPage() {
  const headerList = await headers();
  const acceptLanguage = headerList.get("accept-language") ?? "";
  const preferred = acceptLanguage.split(",")[0]?.split("-")[0];
  const locale = preferred && isLocale(preferred) ? preferred : defaultLocale;
  redirect(`/${locale}`);
}
