import { useTranslations } from "next-intl";
import { formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import SectionCard from "@/components/tool-ui/SectionCard";

type AgePlanetaryAgeProps = {
  totalDays: number;
  digitStyle: DigitStyle;
};

/** Real sidereal orbital periods in Earth days (NASA Planetary Fact Sheet). */
const PLANETS = [
  { key: "mercury", orbitDays: 87.969 },
  { key: "venus", orbitDays: 224.701 },
  { key: "mars", orbitDays: 686.98 },
  { key: "jupiter", orbitDays: 4332.589 },
] as const;

export default function AgePlanetaryAge({ totalDays, digitStyle }: AgePlanetaryAgeProps) {
  const t = useTranslations("tools.age-calculator.aboveFold");
  const fmt = (n: number, opts: Intl.NumberFormatOptions) => formatLocalizedNumber(n, digitStyle, opts);

  return (
    <SectionCard title={t("planetaryAgeTitle")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("planetaryAgeIntro")}</p>

      <dl className="mt-4 grid grid-cols-2 gap-3">
        {PLANETS.map(({ key, orbitDays }) => {
          const planetaryAge = totalDays / orbitDays;
          const isPastFirstYear = planetaryAge >= 1;

          return (
            <div key={key} className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/60">
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">{t(`planetaryAgePlanets.${key}`)}</dt>
              <dd dir="ltr" className="mt-1 font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                {isPastFirstYear
                  ? t("planetaryAgeValue", { years: fmt(planetaryAge, { maximumFractionDigits: 1 }) })
                  : t("planetaryAgeFirstYear", { percent: fmt(planetaryAge * 100, { maximumFractionDigits: 0 }) })}
              </dd>
            </div>
          );
        })}
      </dl>

      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t("planetaryAgeNote")}</p>
    </SectionCard>
  );
}
