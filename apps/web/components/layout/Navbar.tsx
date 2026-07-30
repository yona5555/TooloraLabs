import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const t = useTranslations("navbar");

  const links = [
    { href: "/", label: t("home"), external: false },
    { href: "#popular-tools", label: t("tools"), external: true },
    { href: "#categories", label: t("categories"), external: true },
    { href: "/categories/ai-tools", label: t("aiTools"), external: false },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/70 bg-white/80 backdrop-blur-xl dark:border-zinc-800/70 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
            T
          </div>
          <div className="leading-tight">
            <div className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
              TooloraLabs
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">{t("tagline")}</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {links.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-zinc-600 transition hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm font-medium text-zinc-600 transition hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <ThemeToggle />
          <button className="hidden rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-blue-200 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-200 dark:hover:border-blue-400 dark:hover:text-blue-400 md:block">
            {t("signIn")}
          </button>
        </div>
      </div>
    </header>
  );
}
