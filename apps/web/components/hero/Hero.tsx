import HeroBackground from "./HeroBackground";
import CategorySidebar from "@/components/home/CategorySidebar";
import HomeCalculator from "@/components/home/calculator/HomeCalculator";
import HomeCalculatorDocs from "@/components/home/HomeCalculatorDocs";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <HeroBackground />
      {/* Unlike the rest of the site's sections, this content area is intentionally full-bleed (no
          mx-auto max-w-* / px-* wrapper) — the category sidebar and calculator column together fill
          the page edge to edge at every width, with the two columns stretched to the same height via
          the flex row's default cross-axis stretch (no fixed height needed on either side).

          The center column gets its own subtle page-background fill (distinct from the calculator
          and docs cards' own white/zinc-900) plus a small uniform gutter, so the calculator and docs
          sections read as independent elevated cards with real depth rather than flush, flat panels
          — while the gutter itself stays inside this full-bleed row, never opening a true empty
          margin at the row's own left/right edges (the sidebar still touches those). */}
      <div className="relative z-10 flex min-h-[640px] w-full flex-col border-y border-zinc-200 lg:flex-row dark:border-zinc-800">
        <CategorySidebar />
        <div className="flex min-w-0 flex-1 flex-col gap-4 bg-zinc-100 p-3 dark:bg-zinc-950 sm:p-4">
          <HomeCalculator />
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <HomeCalculatorDocs />
          </div>
        </div>
      </div>
    </section>
  );
}
