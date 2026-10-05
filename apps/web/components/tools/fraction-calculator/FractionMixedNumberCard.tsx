"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useFractionLive } from "./FractionLiveContext";
import { formatMathValue } from "@tooloralabs/tools";

/** The live result, split into whole + proper-fraction blocks — drag the whole-count stepper to
 * explore how changing the result's own numerator shifts the mixed-number split. */
export default function FractionMixedNumberCard() {
  const t = useTranslations("tools.fraction-calculator.education.mixedNumber");
  const { dims, setDim } = useFractionLive();
  const { numeratorA, denominatorA, numeratorB, denominatorB, operation } = dims;
  const valueA = numeratorA / (denominatorA || 1);
  const valueB = numeratorB / (denominatorB || 1);
  const result = operation === "add" ? valueA + valueB : operation === "subtract" ? valueA - valueB : operation === "multiply" ? valueA * valueB : valueB !== 0 ? valueA / valueB : 0;
  const denR = operation === "multiply" ? denominatorA * denominatorB : operation === "divide" ? denominatorA * numeratorB || 1 : Math.max(1, denominatorA, denominatorB);
  const numR = Math.round(result * denR);
  const whole = Math.trunc(numR / denR);
  const remNum = Math.abs(numR - whole * denR);

  function adjustWhole(delta: number) {
    const newWhole = whole + delta;
    setDim("numeratorA", newWhole * denominatorA + (operation === "add" || operation === "subtract" ? numeratorA % denominatorA : numeratorA));
  }

  return (
    <GlassIndicatorCard
      n={9}
      accent="pink"
      title={t("title")}
      subtitle={t("subtitle", { value: formatMathValue(result) })}
      visual={
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-end gap-2">
            {Array.from({ length: Math.min(6, Math.abs(whole)) }, (_, i) => (
              <div key={i} className="h-10 w-10 rounded-md" style={{ background: "#F0507A", opacity: 0.8 }} />
            ))}
            {remNum > 0 && (
              <div className="relative h-10 w-10 overflow-hidden rounded-md border-2 border-[#F0507A]">
                <div className="absolute inset-y-0 left-0 bg-[#F0507A]" style={{ width: `${(remNum / Math.max(1, denR)) * 100}%`, opacity: 0.5 }} />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => adjustWhole(-1)} className="h-7 w-7 rounded-full bg-zinc-100 text-sm font-bold dark:bg-zinc-800" aria-label={t("decrease")}>
              −
            </button>
            <button type="button" onClick={() => adjustWhole(1)} className="h-7 w-7 rounded-full bg-zinc-100 text-sm font-bold dark:bg-zinc-800" aria-label={t("increase")}>
              +
            </button>
          </div>
        </div>
      }
      table={
        <GlassTable
          columns={[
            { key: "k", label: t("colQuantity") },
            { key: "v", label: t("colValue") },
          ]}
          rows={[
            { k: t("improper"), v: `${formatMathValue(numR)}/${formatMathValue(denR)}` },
            { k: t("whole"), v: formatMathValue(whole) },
            { k: t("remainder"), v: `${formatMathValue(remNum)}/${formatMathValue(denR)}` },
            { k: t("mixed"), v: remNum === 0 ? formatMathValue(whole) : t("mixedFormat", { whole: formatMathValue(whole), num: formatMathValue(remNum), den: formatMathValue(denR) }) },
          ]}
        />
      }
    />
  );
}
