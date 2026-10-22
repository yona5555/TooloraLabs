import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import ShareButton from "./ShareButton";
import ToolsDropdown from "./ToolsDropdown";

export default function Navbar() {
  const t = useTranslations("navbar");

  return (
    <header id="site-navbar" className="sticky top-0 z-50 border-b border-blue-200/70 bg-blue-100/80 backdrop-blur-xl dark:border-blue-500/30 dark:bg-blue-950/60">
      <div className="relative mx-auto flex h-18 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.svg"
            alt="TooloraLabs"
            className="h-9 w-auto dark:hidden"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo-full-dark.svg"
            alt="TooloraLabs"
            className="hidden h-9 w-auto dark:block"
          />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
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

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ShareButton />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
