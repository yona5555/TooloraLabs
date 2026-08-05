"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Languages } from "lucide-react";
import { routing } from "@/i18n/routing";

export default function LanguageSwitcher() {
  const t = useTranslations("navbar");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const nextLocale = routing.locales.find((item) => item !== locale) ?? locale;

  function switchLocale() {
    router.replace(pathname, { locale: nextLocale });
    // The <html lang/dir> attributes and the Arabic font live in the true
    // root layout (app/layout.tsx), which sits above the [locale] segment
    // and therefore doesn't automatically re-render on a client-side
    // locale change. Force a server re-render so they stay in sync.
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      aria-label={t("switchLanguage")}
      className="flex h-11 items-center gap-1.5 rounded-xl border border-zinc-200 px-3 text-sm font-semibold text-zinc-600 transition hover:border-blue-200 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-blue-400 dark:hover:text-blue-400"
    >
      <Languages size={16} />
      {nextLocale.toUpperCase()}
    </button>
  );
}
