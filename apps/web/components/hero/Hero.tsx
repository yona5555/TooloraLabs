import HeroBackground from "./HeroBackground";
import HeroMathDoodles from "./HeroMathDoodles";
import CategorySidebar from "@/components/home/CategorySidebar";
import HomeCalculator from "@/components/home/calculator/HomeCalculator";

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <HeroBackground />
      {/* HeroMathDoodles is absolutely positioned against THIS wrapper, so its inset-0 spans the
          full hero without reaching past this section's own padding into whatever comes next on
          the homepage. Every direct content child below is given its own "relative z-10" so it
          paints above the doodle layer.

          Unlike the rest of the site's sections, this content area is intentionally full-bleed
          (no mx-auto max-w-* / px-* wrapper) — the category sidebar and calculator are meant to
          fill the page edge to edge, with the two columns stretched to the same height via the
          flex row's default cross-axis stretch (no fixed height needed on either side). */}
      <HeroMathDoodles />
      <div className="relative z-10 flex min-h-[640px] w-full flex-col border-y border-zinc-200 lg:flex-row dark:border-zinc-800">
        <CategorySidebar />
        <HomeCalculator />
      </div>
    </section>
  );
}
