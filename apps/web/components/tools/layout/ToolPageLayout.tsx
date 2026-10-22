import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import BackButton from "@/components/tool-ui/BackButton";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/layout/LanguageSwitcher";
import ShareButton from "@/components/layout/ShareButton";
import ThemeToggle from "@/components/layout/ThemeToggle";

type ToolPageLayoutProps = {
  category: string;
  categorySlug: string;
  backLabel: string;
  title: string;
  description: string;
  children?: ReactNode;
  /** "wide" gives the page room for a 3-column above-the-fold layout. Opt-in per tool. */
  contentWidth?: "default" | "wide";
  /** Tightens the header so a 3-column layout can clear the fold. Opt-in per tool. */
  compact?: boolean;
  /**
   * Opt-in (2026-10-22, surface-area-calculator pilot only — every other `compact` tool is
   * unaffected since this defaults to false): below 768px, the back button becomes a small square
   * (instead of the shared `BackButton`'s circular shape, which this can't override by className
   * alone since both set `border-radius`) and the title clips to one line with an ellipsis instead
   * of wrapping. md and up render exactly as the existing `compact` header.
   */
  mobileCompact?: boolean;
  /**
   * Opt-in (owner-approved 2026-10-23, surface-area-calculator pilot only — every other `compact`
   * tool is unaffected since this defaults to false): below 768px, the global sticky Navbar (logo
   * + language/share/theme controls, normally its own ~73px bar above this header) is hidden via
   * `globals.css` (`[data-merge-mobile-header]`) and replaced by one 48px bar here that carries the
   * back arrow, the tool title, and those same three controls. md and up render the Navbar and this
   * header exactly as before — nothing here touches that breakpoint.
   */
  mergeMobileHeader?: boolean;
};

export default function ToolPageLayout({
  category,
  categorySlug,
  backLabel,
  title,
  description,
  children,
  contentWidth = "default",
  compact = false,
  mobileCompact = false,
  mergeMobileHeader = false,
}: ToolPageLayoutProps) {
  const maxWidthClass = contentWidth === "wide" ? "max-w-6xl" : "max-w-5xl";

  if (compact) {
    return (
      <main
        data-merge-mobile-header={mergeMobileHeader ? "" : undefined}
        className={`mx-auto ${maxWidthClass} px-4 py-6 lg:px-6`}
      >
        {mergeMobileHeader && (
          <div className="-mx-4 -mt-6 flex h-12 items-center gap-2 border-b border-blue-200/70 bg-blue-100/80 px-3 md:hidden dark:border-blue-500/30 dark:bg-blue-950/60">
            <Link
              href={`/categories/${categorySlug}`}
              aria-label={backLabel}
              title={backLabel}
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/60 hover:text-blue-600 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-blue-400"
            >
              <ArrowLeft size={18} className="rtl:rotate-180" />
            </Link>
            <h1 data-fit className="min-w-0 flex-1 truncate text-base font-bold text-zinc-900 dark:text-zinc-50">
              {title}
            </h1>
            <div className="flex shrink-0 items-center gap-1">
              <LanguageSwitcher />
              <ShareButton />
              <ThemeToggle />
            </div>
          </div>
        )}

        <div className={`flex items-center gap-3 ${mergeMobileHeader ? "max-md:hidden" : ""}`}>
          {mobileCompact ? (
            <Link
              href={`/categories/${categorySlug}`}
              aria-label={backLabel}
              title={backLabel}
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-zinc-100 hover:text-blue-600 md:rounded-full dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
            >
              <ArrowLeft size={20} className="rtl:rotate-180" />
            </Link>
          ) : (
            <BackButton href={`/categories/${categorySlug}`} label={backLabel} size={20} className="h-11 w-11" />
          )}

          <h1
            data-fit
            className={`min-w-0 text-2xl font-extrabold tracking-tight text-zinc-900 lg:text-3xl dark:text-zinc-50 ${mobileCompact ? "max-md:truncate" : ""}`}
          >
            {title}
          </h1>
        </div>

        <div className={mergeMobileHeader ? "mt-4 max-md:mt-3" : "mt-4"}>{children}</div>
      </main>
    );
  }

  return (
    <main className={`mx-auto ${maxWidthClass} px-4 py-10 sm:px-6 lg:py-20`}>
      <span className="block w-fit rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
        {category}
      </span>

      <div className="mt-4 flex items-center gap-3 lg:mt-6">
        <BackButton href={`/categories/${categorySlug}`} label={backLabel} size={22} className="h-12 w-12" />
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 lg:text-5xl dark:text-zinc-50">
          {title}
        </h1>
      </div>

      <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-600 lg:mt-6 lg:text-lg lg:leading-8 dark:text-zinc-300">
        {description}
      </p>

      <div className="mt-8 lg:mt-12">
        {children}
      </div>
    </main>
  );
}
