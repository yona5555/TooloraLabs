import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import ShareButton from "./ShareButton";
import ToolsDropdown from "./ToolsDropdown";
import DocsHeaderButton from "./DocsHeaderButton";
import Wordmark from "./Wordmark";
import { SiteLogo } from "./SiteLogo";

export default function Navbar() {
  const t = useTranslations("navbar");

  return (
    <header data-site-bar="" className="sticky top-0 z-50 border-b border-blue-200/70 bg-blue-100/80 backdrop-blur-xl dark:border-blue-500/30 dark:bg-blue-950/60">
      <div className="relative mx-auto flex h-18 max-w-7xl items-center justify-between gap-2 px-3 md:px-6">
        <Link href="/" aria-label={t("logoLabel")} className="flex min-w-0 items-center">
          <SiteLogo className="h-9 w-auto max-md:hidden" />
          <Wordmark className="text-[15px] md:hidden" />
        </Link>

        <nav aria-label={t("mainNav")} className="hidden items-center gap-8 lg:flex">
          <Link
            href="/"
            data-bp-nav="black"
            data-bp-link="home"
            className="text-sm font-medium"
          >
            {t("home")}
          </Link>
          <Link
            href="/categories"
            data-bp-nav="teal"
            data-bp-link="categories"
            className="text-sm font-medium"
          >
            {t("categories")}
          </Link>
          <Link
            href="/tools"
            data-bp-nav="navy"
            data-bp-link="tools"
            className="text-sm font-medium"
          >
            {t("tools")}
          </Link>
          <Link
            href="/docs"
            data-bp-nav="black"
            data-bp-link="docs"
            className="text-sm font-medium"
          >
            {t("docs")}
          </Link>
          <ToolsDropdown />
          <Link
            href="/coming-soon"
            data-bp-nav="violet"
            data-bp-link="coming-soon"
            className="text-sm font-medium"
          >
            {t("comingSoon")}
          </Link>
        </nav>

        {/* Phones read Docs, theme, share, language from the start side; DOM order is kept for desktop. */}
        <div className="flex shrink-0 items-center gap-2 max-md:flex-row-reverse md:gap-3">
          <LanguageSwitcher />
          <ShareButton />
          <ThemeToggle />
          <DocsHeaderButton />
        </div>
      </div>
    </header>
  );
}
