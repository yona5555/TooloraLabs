"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useFractionLive } from "./FractionLiveContext";
import { formatMathValue, lcm } from "@tooloralabs/tools";

function Stack({ filled, total, color }: { filled: number; total: number; color: string }) {
  return (
    <div className="flex flex-col-reverse gap-0.5">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="h-4 w-7 rounded-sm" style={{ background: i < filled ? color : "#E5E7F5" }} />
      ))}
    </div>
  );
}

/** A and B rescaled to their LCD so every cell represents the same-size piece — drag the shared
 * denominator stepper to see both stacks rebuild from the real scaled numerators. */
export default function FractionCommonGridCard() {
  const t = useTranslations("tools.fraction-calculator.education.commonGrid");
  const { dims, setDim } = useFractionLive();
  const { numeratorA, denominatorA, numeratorB, denominatorB } = dims;
  const lcd = lcm(denominatorA, denominatorB);
  const scaledA = Math.round(numeratorA * (lcd / (denominatorA || 1)));
  const scaledB = Math.round(numeratorB * (lcd / (denominatorB || 1)));

  function nudgeDenominator(delta: number) {
    const newDenA = Math.max(1, denominatorA + delta);
    setDim("denominatorA", newDenA);
  }

  return (
    <GlassIndicatorCard
      n={3}
      accent="pink"
      title={t("title")}
      subtitle={t("subtitle")}
      visual={
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-end gap-3">
            <Stack filled={scaledA} total={lcd} color="#5B6EF5" />
            <Stack filled={scaledB} total={lcd} color="#F0507A" />
            <Stack filled={Math.min(lcd, scaledA + scaledB)} total={lcd} color="#1FC89C" />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => nudgeDenominator(-1)} className="h-6 w-6 rounded-full bg-zinc-100 text-xs font-bold dark:bg-zinc-800">
              −
            </button>
            <span className="text-[10px] font-semibold text-zinc-500">{t("denomAHint", { den: formatMathValue(denominatorA) })}</span>
            <button type="button" onClick={() => nudgeDenominator(1)} className="h-6 w-6 rounded-full bg-zinc-100 text-xs font-bold dark:bg-zinc-800">
              +
            </button>
          </div>
        </div>
      }
      table={
        <GlassTable
          columns={[
            { key: "step", label: t("colStep") },
            { key: "form", label: t("colForm") },
            { key: "value", label: t("colValue") },
          ]}
          rows={[
            { step: "LCD", form: `lcm(${formatMathValue(denominatorA)},${formatMathValue(denominatorB)})`, value: formatMathValue(lcd) },
            { step: "A", form: `${formatMathValue(numeratorA)}×${formatMathValue(lcd / (denominatorA || 1))}`, value: `${formatMathValue(scaledA)}/${formatMathValue(lcd)}` },
            { step: "B", form: `${formatMathValue(numeratorB)}×${formatMathValue(lcd / (denominatorB || 1))}`, value: `${formatMathValue(scaledB)}/${formatMathValue(lcd)}` },
          ]}
        />
      }
    />
  );
}
