import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Wordmark from "./Wordmark";
import { SiteLogoCopy } from "./SiteLogo";

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
    <footer data-site-bar="" className="border-t border-blue-200/70 bg-blue-100/80 backdrop-blur-xl dark:border-blue-500/30 dark:bg-blue-950/60">
      <div className="mx-auto flex max-w-7xl flex-col items-stretch justify-between gap-6 px-6 py-10 max-md:gap-3 md:flex-row md:items-center">
        {/* Phone: rows sit 24px apart text-to-text (gap-6 here; gap-3 + the 44px links' own 12px
            padding below). The wordmark is English, so it stays at the left edge on every locale
            (self-end is the left in RTL); the copyright and links follow the page direction. */}
        <div className="flex flex-col items-start gap-3 max-md:gap-6">
          <SiteLogoCopy className="h-8 w-auto max-md:hidden" />
          <Wordmark className="text-[15px] leading-5 md:hidden rtl:self-end" />
          <p className="text-start text-sm text-zinc-500 dark:text-zinc-400">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
        </div>

        <nav aria-label={t("footerNav")} className="flex flex-wrap items-center justify-start gap-6 max-md:gap-y-0 md:justify-center">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-zinc-600 transition max-md:inline-flex max-md:min-h-11 max-md:items-center hover:text-blue-600 dark:text-zinc-300 dark:hover:text-blue-400"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
