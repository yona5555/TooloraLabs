import { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";
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
}: ToolPageLayoutProps) {
  const maxWidthClass = contentWidth === "wide" ? "max-w-6xl" : "max-w-5xl";

  return (
    <main className={`mx-auto ${maxWidthClass} px-6 ${compact ? "py-10" : "py-20"}`}>
      <Link
        href={`/categories/${categorySlug}`}
        aria-label={backLabel}
        title={compact ? backLabel : undefined}
        className="inline-flex items-center gap-2 text-sm font-medium text-zinc-500 transition hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
      >
        <ArrowLeft size={16} />
        {!compact && backLabel}
      </Link>

      <span className={`${compact ? "mt-3" : "mt-6"} block w-fit rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400`}>
        {category}
      </span>

      <h1
        className={
          compact
            ? "mt-3 text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50"
            : "mt-6 text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50"
        }
      >
        {title}
      </h1>

      <p
        className={
          compact
            ? "mt-2 max-w-3xl text-zinc-600 dark:text-zinc-300"
            : "mt-6 max-w-3xl text-lg leading-8 text-zinc-600 dark:text-zinc-300"
        }
      >
        {description}
      </p>

      <div className={compact ? "mt-6" : "mt-12"}>
        {children}
      </div>
    </main>
  );
}
