"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";
import { formatSciValue, REAL_WORLD_SPEEDS } from "@tooloralabs/tools";

const MIN_EXP = -4;
const MAX_EXP = 9;

/** Real speeds from a snail to the speed of light, placed on one log axis -- click a mark to set
 * the live value to that exact speed (in m/s). */
export default function SpeedsLogScaleCard() {
  const t = useTranslations("tools.scientific-notation-converter.education.speedsLogScale");
  const { dims, setDim } = useScientificNotationLive();
  const derivedA = deriveEffectiveA(dims);
  const currentExponent = Math.round(derivedA.exponent);
  const clampedFrac = Math.max(0, Math.min(1, (currentExponent - MIN_EXP) / (MAX_EXP - MIN_EXP)));

  function jumpTo(value: number) {
    setDim("standardValue", value);
  }

  return (
    <GlassIndicatorCard
      n={14}
      accent="purple"
      title={t("title")}
      subtitle={t("subtitle")}
      visual={
        <div className="flex w-56 flex-col gap-2">
          <div className="relative h-8 rounded-full bg-violet-50 dark:bg-violet-900/20">
            {REAL_WORLD_SPEEDS.map((s) => {
              const exp = Math.log10(s.metersPerSecond);
              const frac = Math.max(0, Math.min(1, (exp - MIN_EXP) / (MAX_EXP - MIN_EXP)));
              return (
                <button key={s.key} type="button" onClick={() => jumpTo(s.metersPerSecond)} className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-400" style={{ left: `${frac * 100}%` }} aria-label={t(`speeds.${s.key}`)} />
              );
            })}
            <div className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8B5CF6] ring-2 ring-white dark:ring-zinc-900" style={{ left: `${clampedFrac * 100}%` }} />
          </div>
        </div>
      }
      table={
        <GlassTable
          columns={[
            { key: "name", label: t("colName") },
            { key: "speed", label: t("colSpeed") },
          ]}
          rows={REAL_WORLD_SPEEDS.map((s) => ({ name: t(`speeds.${s.key}`), speed: `${formatSciValue(s.metersPerSecond)} m/s` }))}
        />
      }
    />
  );
}
