import { useTranslations } from "next-intl";
import SearchBar from "./SearchBar";
import Stats from "./Stats";
import HeroBackground from "./HeroBackground";
import HeroMathDoodles from "./HeroMathDoodles";
import HeroCategories from "./HeroCategories";
import ScientificCalculatorWidget from "@/components/tools/scientific-calculator/ScientificCalculatorWidget";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden">
      <HeroBackground />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 pt-16 pb-20 text-center">
        {/* HeroMathDoodles is absolutely positioned against THIS wrapper, so its inset-0 spans the
            full hero — title through the stats row — without reaching past this section's own
            padding into whatever comes next on the homepage. Every direct content child below is
            given its own "relative z-10" so it paints above the doodle layer. */}
        <HeroMathDoodles />
        <div className="relative z-10 w-full">
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl dark:text-zinc-50">
            {t("titleLine1")} <span className="text-blue-600 dark:text-blue-400">{t("titleLine2")}</span>
          </h1>

          <div className="mx-auto mt-10 grid w-full max-w-6xl items-stretch gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
            <div className="min-w-0">
              <ScientificCalculatorWidget />
            </div>
            <div className="flex min-w-0 flex-col gap-4">
              <SearchBar placeholder={t("searchPlaceholder")} searchLabel={t("search")} />
              <HeroCategories />
            </div>
          </div>
        </div>

        <div className="relative z-10 mt-10 w-full max-w-6xl">
          <Stats />
        </div>
      </div>
    </section>
  );
}
