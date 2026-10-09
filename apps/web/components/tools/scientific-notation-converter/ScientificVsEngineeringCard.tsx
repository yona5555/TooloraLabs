"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";
import { formatSciValue, engineeringOf } from "@tooloralabs/tools";

/** Scientific notation allows any exponent; engineering notation only allows multiples of three
 * (matching SI prefixes). Drag the exponent ladder to see the engineering form jump to the next
 * multiple of three. */
export default function ScientificVsEngineeringCard() {
  const t = useTranslations("tools.scientific-notation-converter.education.scientificVsEngineering");
  const { dims, setDim } = useScientificNotationLive();
  const derivedA = deriveEffectiveA(dims);
  const eng = engineeringOf(derivedA.coefficient, derivedA.exponent);

  function jumpTo(exponent: number) {
    if (dims.operation === "toScientific") {
      setDim("standardValue", Math.round(derivedA.coefficient * 10 ** exponent * 100) / 100);
    } else {
      setDim("exponentA", exponent);
    }
  }

  return (
    <GlassIndicatorCard
      n={9}
      accent="purple"
      title={t("title")}
      subtitle={t("subtitle")}
      visual={
        <div className="flex w-56 flex-col gap-2">
          <div className="relative h-7 rounded-md bg-zinc-100 dark:bg-zinc-800">
            {Array.from({ length: 11 }, (_, i) => i - 5).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => jumpTo(eng.exponent + m * 3)}
                className="absolute top-0 h-full w-[9%] -translate-x-1/2 rounded-sm"
                style={{ left: `${((m + 5) / 10) * 100}%`, background: m === 0 ? "#8B5CF6" : "transparent" }}
                aria-label={t("jumpAria", { exponent: eng.exponent + m * 3 })}
              />
            ))}
          </div>
          <div dir="ltr" className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="rounded-lg bg-indigo-50 px-2 py-1.5 font-mono font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
              {formatSciValue(derivedA.coefficient)}×10^{formatSciValue(Math.round(derivedA.exponent))}
            </div>
            <div className="rounded-lg bg-violet-50 px-2 py-1.5 font-mono font-semibold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
              {formatSciValue(eng.coefficient)}×10^{formatSciValue(eng.exponent)}
            </div>
          </div>
        </div>
      }
      table={
        <GlassTable
          columns={[
            { key: "k", label: t("colForm") },
            { key: "v", label: t("colValue") },
          ]}
          rows={[
            { k: t("scientific"), v: `${formatSciValue(derivedA.coefficient)}×10^${formatSciValue(Math.round(derivedA.exponent))}` },
            { k: t("engineering"), v: `${formatSciValue(eng.coefficient)}×10^${formatSciValue(eng.exponent)}` },
            { k: t("exponentMod3"), v: formatSciValue(((Math.round(derivedA.exponent) % 3) + 3) % 3) },
          ]}
        />
      }
    />
  );
}
