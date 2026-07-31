import { useTranslations } from "next-intl";
import SearchBar from "./SearchBar";
import Stats from "./Stats";
import HeroBackground from "./HeroBackground";
import ScientificCalculator from "@/components/tools/scientific-calculator/ScientificCalculator";

export default function Hero() {
  const t = useTranslations("hero");

  return (
    <section className="relative overflow-hidden">
      <HeroBackground />
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center px-6 pt-24 pb-20 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl dark:text-zinc-50">
          {t("titleLine1")} <span className="text-blue-600 dark:text-blue-400">{t("titleLine2")}</span>
        </h1>

        <div className="mt-16 grid w-full max-w-6xl items-start gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="min-w-0">
            <ScientificCalculator />
          </div>
          <div className="flex min-w-0 flex-col gap-8">
            <SearchBar placeholder={t("searchPlaceholder")} searchLabel={t("search")} />
            <Stats />
          </div>
        </div>
      </div>
    </section>
  );
}
