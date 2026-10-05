"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useFractionLive } from "./FractionLiveContext";
import { formatMathValue, multiplesUntil, lcm } from "@tooloralabs/tools";

/** Two real multiples ladders climbing side by side until they meet — the first shared rung is
 * the LCD. Drag either denominator's stepper to watch both ladders, and the meeting point, change. */
export default function FractionLcdLadderCard() {
  const t = useTranslations("tools.fraction-calculator.education.lcdLadder");
  const { dims, setDim } = useFractionLive();
  const { denominatorA, denominatorB } = dims;
  const lcdValue = lcm(Math.max(1, Math.round(denominatorA)), Math.max(1, Math.round(denominatorB)));
  const laddersA = multiplesUntil(Math.max(1, Math.round(denominatorA)), lcdValue, 6);
  const laddersB = multiplesUntil(Math.max(1, Math.round(denominatorB)), lcdValue, 6);

  function adjust(which: "A" | "B", delta: number) {
    const key = which === "A" ? "denominatorA" : "denominatorB";
    const current = which === "A" ? denominatorA : denominatorB;
    setDim(key, Math.max(1, Math.round(current) + delta));
  }

  return (
    <GlassIndicatorCard
      n={10}
      accent="cyan"
      title={t("title")}
      subtitle={t("subtitle", { lcd: formatMathValue(lcdValue) })}
      visual={
        <div className="flex w-56 flex-col gap-3">
          {[
            { label: "A", rungs: laddersA, color: "#5B6EF5", which: "A" as const },
            { label: "B", rungs: laddersB, color: "#2FB6E0", which: "B" as const },
          ].map(({ label, rungs, color, which }) => (
            <div key={label} className="flex items-center gap-2">
              <button type="button" onClick={() => adjust(which, -1)} className="h-5 w-5 shrink-0 rounded-full bg-zinc-100 text-xs font-bold dark:bg-zinc-800" aria-label={t("decrease", { label })}>
                −
              </button>
              <div className="flex flex-1 flex-wrap gap-1">
                {rungs.map((m) => (
                  <span
                    key={m}
                    className="rounded px-1.5 py-0.5 text-[10px] font-bold text-white"
                    style={{ background: m === lcdValue ? "#1FC89C" : color, opacity: m === lcdValue ? 1 : 0.55 }}
                  >
                    {formatMathValue(m)}
                  </span>
                ))}
              </div>
              <button type="button" onClick={() => adjust(which, 1)} className="h-5 w-5 shrink-0 rounded-full bg-zinc-100 text-xs font-bold dark:bg-zinc-800" aria-label={t("increase", { label })}>
                +
              </button>
            </div>
          ))}
        </div>
      }
      table={
        <GlassTable
          columns={[
            { key: "k", label: t("colQuantity") },
            { key: "v", label: t("colValue") },
          ]}
          rows={[
            { k: t("denA"), v: formatMathValue(denominatorA) },
            { k: t("denB"), v: formatMathValue(denominatorB) },
            { k: t("lcd"), v: formatMathValue(lcdValue) },
            { k: t("product"), v: formatMathValue(denominatorA * denominatorB) },
          ]}
        />
      }
    />
  );
}
