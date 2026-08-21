import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function Footer() {
  const t = useTranslations("footer");

  const links = [
    { href: "/embed-tools", label: t("embedTools") },
    { href: "/compare/financial-calculators", label: t("compareCalculators") },
    { href: "/privacy", label: t("privacy") },
    { href: "/terms", label: t("terms") },
    { href: "/affiliate-disclosure", label: t("affiliateDisclosure") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];

  return (
    <footer className="border-t border-blue-200/70 bg-white/80 backdrop-blur-xl dark:border-blue-500/30 dark:bg-zinc-950/80">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-10 sm:flex-row">
        <div className="flex flex-col items-center gap-3 sm:items-start">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="TooloraLabs" className="h-8 w-auto dark:hidden" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo-full-dark.svg"
            alt="TooloraLabs"
            className="hidden h-8 w-auto dark:block"
          />
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-600 transition hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
