"use client";
import { useTranslations } from "next-intl";
import { BookOpen } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import Tooltip from "./Tooltip";
import { HEADER_ICON_BUTTON_PHONE } from "./headerButton";

/** Phone-only icon link to /docs; on desktop the nav's "Docs" link covers it. */
export default function DocsHeaderButton() {
  const t = useTranslations("navbar");
  const pathname = usePathname();
  const active = pathname === "/docs" || pathname.startsWith("/docs/");

  return (
    <div className="md:hidden">
      <Tooltip label={t("docsButton")}>
        <Link
          href="/docs"
          aria-label={t("docsButton")}
          aria-current={active ? "page" : undefined}
          className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${HEADER_ICON_BUTTON_PHONE} ${
            active
              ? "border-blue-300 bg-blue-50 text-blue-600 dark:border-blue-400 dark:bg-blue-500/15 dark:text-blue-400"
              : "border-zinc-200 text-zinc-600 hover:border-blue-200 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-blue-400 dark:hover:text-blue-400"
          }`}
        >
          <BookOpen size={18} />
        </Link>
      </Tooltip>
    </div>
  );
}
