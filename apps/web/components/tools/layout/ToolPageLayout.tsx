import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
import BackButton from "@/components/tool-ui/BackButton";
import { Link } from "@/i18n/navigation";

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
}: ToolPageLayoutProps) {
  const maxWidthClass = contentWidth === "wide" ? "max-w-6xl" : "max-w-5xl";

  if (compact) {
    return (
      <main className={`mx-auto ${maxWidthClass} px-4 py-6 lg:px-6`}>
        <div className="flex items-center gap-3">
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

        <div className="mt-4">{children}</div>
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
