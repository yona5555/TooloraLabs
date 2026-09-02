import { useTranslations } from "next-intl";
import SearchBar from "./SearchBar";
import HeroBackground from "./HeroBackground";
import HeroMathDoodles from "./HeroMathDoodles";
import HeroCategories from "./HeroCategories";
import ScientificCalculatorWidget from "@/components/tools/scientific-calculator/ScientificCalculatorWidget";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden">
      <HeroBackground />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 py-16 text-center">
        {/* HeroMathDoodles is absolutely positioned against THIS wrapper, so its inset-0 spans the
            full hero without reaching past this section's own padding into whatever comes next on
            the homepage. Every direct content child below is given its own "relative z-10" so it
            paints above the doodle layer. */}
        <HeroMathDoodles />
        <div className="relative z-10 w-full">
          <div className="mx-auto grid w-full max-w-6xl items-stretch gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <div className="min-w-0">
              <ScientificCalculatorWidget />
            </div>
            <div className="flex min-w-0 flex-col gap-4">
              <SearchBar placeholder={t("searchPlaceholder")} searchLabel={t("search")} />
              <HeroCategories />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
