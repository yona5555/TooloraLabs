"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useScientificNotationLive, deriveEffectiveA } from "./ScientificNotationLiveContext";
import { formatSciValue } from "@tooloralabs/tools";

/** The valid [1,10) coefficient zone as a bar -- drag along it to move the live coefficient
 * directly, writing back to the real shared fields for whichever mode is active. */
export default function CoefficientZoneCard() {
  const t = useTranslations("tools.scientific-notation-converter.education.coefficientZone");
  const { dims, setDim } = useScientificNotationLive();
  const derivedA = deriveEffectiveA(dims);
  const frac = Math.max(0, Math.min(1, (derivedA.coefficient - 1) / 9));

  function commitCoefficient(newCoefficient: number) {
    const c = Math.max(1, Math.min(9.9, Math.round(newCoefficient * 10) / 10));
    if (dims.operation === "toScientific") {
      setDim("standardValue", Math.round(c * 10 ** Math.round(derivedA.exponent) * 100) / 100);
    } else {
      setDim("coefficientA", c);
    }
  }

  function handlePointer(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const f = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    commitCoefficient(1 + f * 9);
  }

  return (
    <GlassIndicatorCard
      n={3}
      accent="pink"
      title={t("title")}
      subtitle={t("subtitle")}
      visual={
        <div className="flex w-56 flex-col gap-2">
          <div
            className="relative h-8 touch-none rounded-full bg-gradient-to-r from-rose-100 to-rose-200 dark:from-rose-900/30 dark:to-rose-800/30"
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); handlePointer(e); }}
            onPointerMove={(e) => e.buttons === 1 && handlePointer(e)}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((m) => (
              <div key={m} className="absolute top-0 h-full w-px bg-white/60" style={{ left: `${((m - 1) / 9) * 100}%` }} />
            ))}
            <div className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#F0507A] ring-2 ring-white dark:ring-zinc-900" style={{ left: `${frac * 100}%` }} />
          </div>
          <p className="text-center text-[11px] text-zinc-500">1 ≤ c &lt; 10</p>
        </div>
      }
      table={
        <GlassTable
          columns={[
            { key: "k", label: t("colQuantity") },
            { key: "v", label: t("colValue") },
          ]}
          rows={[
            { k: t("coefficient"), v: formatSciValue(derivedA.coefficient) },
            { k: t("distanceFromOne"), v: formatSciValue(derivedA.coefficient - 1) },
            { k: t("distanceFromTen"), v: formatSciValue(10 - derivedA.coefficient) },
          ]}
        />
      }
    />
  );
}
