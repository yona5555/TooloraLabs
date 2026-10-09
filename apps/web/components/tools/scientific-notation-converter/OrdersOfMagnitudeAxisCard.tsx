"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";
import { formatSciValue, ORDERS_OF_MAGNITUDE } from "@tooloralabs/tools";

const MIN_EXP = -35;
const MAX_EXP = 27;

/** Real physical length scales from the Planck length to the observable universe, on one log
 * axis -- click a mark to set the live exponent to that scale. */
export default function OrdersOfMagnitudeAxisCard() {
  const t = useTranslations("tools.scientific-notation-converter.education.ordersOfMagnitudeAxis");
  const { dims, setDim } = useScientificNotationLive();
  const derivedA = deriveEffectiveA(dims);
  const currentExponent = Math.round(derivedA.exponent);
  const clampedFrac = Math.max(0, Math.min(1, (currentExponent - MIN_EXP) / (MAX_EXP - MIN_EXP)));
  const nearest = ORDERS_OF_MAGNITUDE.reduce((best, m) => (Math.abs(m.exponentMeters - currentExponent) < Math.abs(best.exponentMeters - currentExponent) ? m : best));

  function jumpTo(exponent: number) {
    if (dims.operation === "toScientific") {
      setDim("standardValue", Math.round(derivedA.coefficient * 10 ** exponent * 100) / 100);
    } else {
      setDim("exponentA", exponent);
    }
  }

  return (
    <GlassIndicatorCard
      n={16}
      accent="mint"
      title={t("title")}
      subtitle={t("subtitle", { name: t(`scales.${nearest.key}`) })}
      visual={
        <div className="flex w-56 flex-col gap-2">
          <div className="relative h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20">
            {ORDERS_OF_MAGNITUDE.map((m) => {
              const frac = Math.max(0, Math.min(1, (m.exponentMeters - MIN_EXP) / (MAX_EXP - MIN_EXP)));
              return (
                <button key={m.key} type="button" onClick={() => jumpTo(m.exponentMeters)} className="absolute top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-400" style={{ left: `${frac * 100}%` }} aria-label={t(`scales.${m.key}`)} />
              );
            })}
            <div className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1FC89C] ring-2 ring-white dark:ring-zinc-900" style={{ left: `${clampedFrac * 100}%` }} />
          </div>
        </div>
      }
      table={
        <GlassTable
          columns={[
            { key: "name", label: t("colScale") },
            { key: "exp", label: t("colExponent") },
          ]}
          rows={ORDERS_OF_MAGNITUDE.map((m) => ({ name: t(`scales.${m.key}`), exp: `10^${formatSciValue(m.exponentMeters)} m` }))}
        />
      }
    />
  );
}
