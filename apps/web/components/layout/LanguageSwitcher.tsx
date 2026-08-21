"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Check, ChevronDown } from "lucide-react";
import { routing } from "@/i18n/routing";
import { localeMeta } from "@/lib/locale-meta";
import Tooltip from "./Tooltip";

export default function LanguageSwitcher() {
  const t = useTranslations("navbar");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function switchLocale(nextLocale: string) {
    setOpen(false);
    if (nextLocale === locale) return;
    router.replace(pathname, { locale: nextLocale });
    // The <html lang/dir> attributes and the per-locale font live in the true
    // root layout (app/layout.tsx), which sits above the [locale] segment
    // and therefore doesn't automatically re-render on a client-side
    // locale change. Force a server re-render so they stay in sync.
    router.refresh();
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <Tooltip label={t("switchLanguage")} hidden={open}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={t("switchLanguage")}
          aria-haspopup="menu"
          aria-expanded={open}
          className="flex h-11 items-center gap-1.5 rounded-xl border border-zinc-200 px-3 text-sm font-semibold text-zinc-600 transition hover:border-blue-200 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-blue-400 dark:hover:text-blue-400"
        >
          {locale.toUpperCase()}
          <ChevronDown size={14} className={open ? "rotate-180 transition" : "transition"} />
        </button>
      </Tooltip>

      {open && (
        <div
          role="menu"
          className="absolute end-0 top-full z-20 mt-2 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
        >
          {routing.locales.map((item) => (
            <button
              key={item}
              type="button"
              role="menuitem"
              onClick={() => switchLocale(item)}
              className="flex w-full items-center justify-between gap-2 px-3 py-2 text-start text-sm text-zinc-700 transition hover:bg-blue-50 hover:text-blue-600 dark:text-zinc-200 dark:hover:bg-blue-500/10 dark:hover:text-blue-400"
            >
              {localeMeta[item]?.nativeName ?? item.toUpperCase()}
              {item === locale && <Check size={14} />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
