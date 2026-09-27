import { ReactNode } from "react";
import BackButton from "@/components/tool-ui/BackButton";

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

  if (compact) {
    return (
      <main className={`mx-auto ${maxWidthClass} px-4 py-6 lg:px-6`}>
        <div className="flex items-center gap-3">
          <BackButton href={`/categories/${categorySlug}`} label={backLabel} size={20} className="h-11 w-11" />

          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 lg:text-3xl dark:text-zinc-50">
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
