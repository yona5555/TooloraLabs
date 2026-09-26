import HeroBackground from "./HeroBackground";
import CategorySidebar from "@/components/home/CategorySidebar";
import HomeCalculator from "@/components/home/calculator/HomeCalculator";
import HomeCalculatorDocs from "@/components/home/HomeCalculatorDocs";

export default function Hero() {
  return (
    // No overflow-hidden here: it would silently disable position:sticky for
    // every descendant (the category sidebar and the docs section's "On
    // This Page" TOC both rely on it), since sticky is computed against the
    // nearest ancestor that clips overflow. HeroBackground already clips its
    // own decorative blobs via its own wrapper, so the section itself never
    // needed this in the first place.
    <section className="relative">
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
          {/* No overflow-hidden here either — this card holds the docs section's own sticky "On
              This Page" TOC, and everything inside is already padded well clear of the rounded
              corners (HomeCalculatorDocs starts at p-4+), so clipping was never load-bearing. */}
          <div className="rounded-2xl border border-zinc-200 bg-white shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
            <HomeCalculatorDocs />
          </div>
        </div>
      </div>
    </section>
  );
}
