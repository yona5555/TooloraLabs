"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useFractionCardState } from "./useFractionCardState";
import { formatMathValue, lcm } from "@tooloralabs/tools";

/** §38: a continuous proportional ribbon, never a stack of equal-size cells -- height is a plain
 * percentage fill, with a faint tick line at every whole unit for texture only (not a filled
 * cell). */
function Ribbon({ filled, total, color, label }: { filled: number; total: number; color: string; label: string }) {
  const pct = total > 0 ? Math.max(0, Math.min(100, (filled / total) * 100)) : 0;
  const tickEvery = total > 0 ? 100 / total : 100;
  return (
    <div className="flex h-full flex-1 flex-col items-center gap-1.5">
      <div
        className="relative h-36 w-full overflow-hidden rounded-md"
        style={{
          background: `var(--glass-track)`,
          backgroundImage: `repeating-linear-gradient(to top, color-mix(in oklab, var(--glass-border) 70%, transparent) 0, color-mix(in oklab, var(--glass-border) 70%, transparent) 1px, transparent 1px, transparent ${tickEvery}%)`,
        }}
      >
        <div className="absolute inset-x-0 bottom-0 rounded-md transition-[height] duration-300 ease-out" style={{ height: `${pct}%`, background: color }} />
      </div>
      <span className="text-[10px] font-semibold" style={{ color: "var(--glass-muted)" }}>
        {label}
      </span>
    </div>
  );
}

/** A and B rescaled to their LCD and shown as continuous proportional ribbons (never equal cells,
 * §38) so every ribbon's fill height is the real scaled fraction -- drag the shared denominator
 * stepper to see both ribbons rebuild from the real scaled numerators. */
export default function FractionCommonGridCard() {
  const t = useTranslations("tools.fraction-calculator.education.commonGrid");
  const { dims, setDim } = useFractionCardState();
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
        <div className="flex w-full flex-col items-center gap-2">
          <div className="flex h-36 w-full items-stretch gap-3">
            <Ribbon filled={scaledA} total={lcd} color="var(--glass-accent-1-strong)" label="A" />
            <Ribbon filled={scaledB} total={lcd} color="var(--glass-accent-2-strong)" label="B" />
            <Ribbon filled={Math.min(lcd, scaledA + scaledB)} total={lcd} color="var(--glass-accent-3-strong)" label={t("combinedLabel")} />
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => nudgeDenominator(-1)} className="h-6 w-6 rounded-full text-xs font-bold" style={{ background: "var(--glass-track)", color: "var(--glass-title)" }}>
              −
            </button>
            <span className="text-[10px] font-semibold" style={{ color: "var(--glass-muted)" }}>
              {t("denomAHint", { den: formatMathValue(denominatorA) })}
            </span>
            <button type="button" onClick={() => nudgeDenominator(1)} className="h-6 w-6 rounded-full text-xs font-bold" style={{ background: "var(--glass-track)", color: "var(--glass-title)" }}>
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
            { step: "B", form: `${formatMathValue(numeratorB)}×${formatMathValue(lcd / (denominatorB || 1))}`, value: `${formatMathValue(scaledB)}/${formatMathValue(lcd)}`, isKeyResult: true },
          ]}
        />
      }
    />
  );
}
