"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useFractionCardState } from "./useFractionCardState";
import { formatMathValue } from "@tooloralabs/tools";

/** The live result, split into whole + proper-fraction blocks, drawn as ONE continuous ribbon
 * divided by hairline separators into whole units plus a partial remainder segment (§38 -- never
 * a row of separate h-20×w-20 squares). Drag the whole-count stepper to explore how changing the
 * result's own numerator shifts the mixed-number split.
 *
 * Seeded with its OWN 3/4 + 1 (= 7/4 = 1¾) rather than the tool's default 5/6: 5/6 is proper
 * (whole part 0), which gives this card nothing to split -- §37 lets an indicator pick its own
 * starting values when the default example doesn't exercise what it's meant to show. */
export default function FractionMixedNumberCard() {
  const t = useTranslations("tools.fraction-calculator.education.mixedNumber");
  const { dims, setDim } = useFractionCardState({ numeratorA: 3, denominatorA: 4, numeratorB: 1, denominatorB: 1 });
  const { numeratorA, denominatorA, numeratorB, denominatorB, operation } = dims;
  const valueA = numeratorA / (denominatorA || 1);
  const valueB = numeratorB / (denominatorB || 1);
  const result = operation === "add" ? valueA + valueB : operation === "subtract" ? valueA - valueB : operation === "multiply" ? valueA * valueB : valueB !== 0 ? valueA / valueB : 0;
  const denR = operation === "multiply" ? denominatorA * denominatorB : operation === "divide" ? denominatorA * numeratorB || 1 : Math.max(1, denominatorA, denominatorB);
  const numR = Math.round(result * denR);
  const whole = Math.trunc(numR / denR);
  const remNum = Math.abs(numR - whole * denR);
  const totalUnits = Math.max(1, Math.abs(whole) + (remNum > 0 ? 1 : 0));

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
        <div className="flex w-full flex-col items-center justify-center gap-4">
          <div className="flex h-16 w-full max-w-[280px] overflow-hidden rounded-lg" style={{ border: "2px solid var(--glass-accent-2-strong)" }}>
            {Array.from({ length: Math.max(0, Math.abs(whole)) }, (_, i) => (
              <div
                key={i}
                className="h-full flex-1"
                style={{
                  background: "var(--glass-accent-2-strong)",
                  opacity: 0.85,
                  borderInlineStart: i === 0 ? "none" : "1px solid color-mix(in oklab, var(--color-white) 45%, transparent)",
                }}
              />
            ))}
            {remNum > 0 && (
              <div className="relative h-full flex-1" style={{ borderInlineStart: whole !== 0 ? "1px solid color-mix(in oklab, var(--color-white) 45%, transparent)" : "none" }}>
                <div className="absolute inset-y-0 start-0" style={{ width: `${(remNum / Math.max(1, denR)) * 100}%`, background: "var(--glass-accent-2-strong)", opacity: 0.5 }} />
              </div>
            )}
            {totalUnits === 0 && <div className="h-full flex-1" style={{ background: "var(--glass-track)" }} />}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => adjustWhole(-1)} className="h-9 w-9 rounded-full text-base font-bold" style={{ background: "var(--glass-track)", color: "var(--glass-title)" }} aria-label={t("decrease")}>
              −
            </button>
            <button type="button" onClick={() => adjustWhole(1)} className="h-9 w-9 rounded-full text-base font-bold" style={{ background: "var(--glass-track)", color: "var(--glass-title)" }} aria-label={t("increase")}>
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
            { k: t("mixed"), v: remNum === 0 ? formatMathValue(whole) : t("mixedFormat", { whole: formatMathValue(whole), num: formatMathValue(remNum), den: formatMathValue(denR) }), isKeyResult: true },
          ]}
        />
      }
    />
  );
}
