import { ReactNode } from "react";
import BackButton from "@/components/tool-ui/BackButton";
import { categoryHref } from "@/data/categories";
import PhoneLayoutScript from "./PhoneLayoutScript";
import SvgLabelScale from "./SvgLabelScale";

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
  /** APPROVED PHONE STANDARD: the labeled back button's text below 768px ("Back"). */
  backText: string;
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
  backText,
}: ToolPageLayoutProps) {
  const maxWidthClass = contentWidth === "wide" ? "max-w-6xl" : "max-w-5xl";

  if (compact) {
    return (
      <main data-phone-cards="" data-phone-markets={categorySlug === "financial-markets" ? "" : undefined} data-bg-cat={categorySlug} suppressHydrationWarning className={`mx-auto ${maxWidthClass} px-4 py-6 lg:px-6`}>
        <div className="flex items-center gap-3">
          <BackButton href={categoryHref(categorySlug)} label={backLabel} size={20} className="h-11 w-11" phoneText={backText} />

          <h1 data-fit data-fit-oneline className={`min-w-0 max-md:truncate text-2xl font-extrabold tracking-tight text-zinc-900 lg:text-3xl dark:text-zinc-50`}>
            {title}
          </h1>
        </div>

        {/* APPROVED PHONE STANDARD rule 2: the two top mini cards (filled by PhoneMiniMirror, phone only). */}
        <div data-phone-mini="" className="mt-3 grid h-[88px] grid-cols-2 gap-2 md:hidden">
          <div data-phone-mini-slot="0" className="min-w-0" />
          <div data-phone-mini-slot="1" className="min-w-0" />
        </div>

        <div data-phone-flow="" className="mt-4">{children}</div>
        <PhoneLayoutScript />
        <SvgLabelScale />
      </main>
    );
  }

  return (
    <main data-phone-cards="" data-phone-markets={categorySlug === "financial-markets" ? "" : undefined} data-bg-cat={categorySlug} suppressHydrationWarning className={`mx-auto ${maxWidthClass} px-4 py-10 sm:px-6 lg:py-20`}>
      <span className="block w-fit rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
        {category}
      </span>

      <div className="mt-4 flex items-center gap-3 lg:mt-6">
        <BackButton href={categoryHref(categorySlug)} label={backLabel} size={22} className="h-12 w-12" phoneText={backText} />
        <h1 className="min-w-0 max-md:truncate text-3xl font-extrabold tracking-tight text-zinc-900 lg:text-5xl dark:text-zinc-50">
          {title}
        </h1>
      </div>

      {/* APPROVED PHONE STANDARD rule 2: the two top mini cards (filled by PhoneMiniMirror, phone only). */}
      <div data-phone-mini="" className="mt-3 grid h-[88px] grid-cols-2 gap-2 md:hidden">
        <div data-phone-mini-slot="0" className="min-w-0" />
        <div data-phone-mini-slot="1" className="min-w-0" />
      </div>

      <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-600 lg:mt-6 lg:text-lg lg:leading-8 dark:text-zinc-300">
        {description}
      </p>

      <div data-phone-flow="" className="mt-8 lg:mt-12">
        {children}
      </div>
      <PhoneLayoutScript />
      <SvgLabelScale />
    </main>
  );
}
