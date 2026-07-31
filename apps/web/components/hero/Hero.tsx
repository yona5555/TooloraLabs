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
        <span className="rounded-full border border-blue-200 bg-blue-50 px-5 py-2 text-sm font-medium text-blue-600 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-400">
          {t("badge")}
        </span>
        <h1 className="mt-8 max-w-5xl text-6xl font-extrabold leading-tight tracking-tight text-zinc-900 dark:text-zinc-50">
          {t("titleLine1")}
          <br />
          <span className="text-blue-600 dark:text-blue-400">{t("titleLine2")}</span>
        </h1>
        <p className="mt-8 max-w-3xl text-xl leading-8 text-zinc-600 dark:text-zinc-300">
          {t("subtitle")}
        </p>

        <div className="mt-12 grid w-full max-w-6xl items-start gap-8 lg:grid-cols-2">
          <ScientificCalculator />
          <SearchBar placeholder={t("searchPlaceholder")} searchLabel={t("search")} />
        </div>

        <Stats />
      </div>
    </section>
  );
}
