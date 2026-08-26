import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import ToolsDropdown from "./ToolsDropdown";

export default function Navbar() {
  const t = useTranslations("navbar");

  return (
    <header className="sticky top-0 z-50 border-b border-blue-200/70 bg-blue-100/80 backdrop-blur-xl dark:border-blue-500/30 dark:bg-blue-950/60">
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
            className="text-sm font-medium text-zinc-600 transition hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400"
          >
            {t("home")}
          </Link>
          <Link
            href="/tools"
            className="text-sm font-medium text-zinc-600 transition hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400"
          >
            {t("tools")}
          </Link>
          <Link
            href="/categories"
            className="text-sm font-medium text-zinc-600 transition hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400"
          >
            {t("categories")}
          </Link>
          <ToolsDropdown />
          <Link
            href="/coming-soon"
            className="text-sm font-medium text-zinc-600 transition hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400"
          >
            {t("comingSoon")}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
