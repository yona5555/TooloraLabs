"use client";
import { useTranslations } from "next-intl";

/**
 * Fixed illustrative example (1/2 + 1/3) — unlike FractionBarDiagram/PieDiagram
 * above, which show what a single fraction *is*, this diagram shows the actual
 * ADD operation this tool performs: both fractions are first redrawn over a
 * shared denominator (the LCM of 2 and 3 is 6, so 1/2 → 3/6 and 1/3 → 2/6),
 * then the shaded cells are combined into one 6-cell bar totalling 5/6 — the
 * same common-denominator method the tool's own add/subtract logic uses.
 */
const DEN = 6;
const CELL = 26;
const GAP = 3;
const STEP = CELL + GAP;
const WIDTH = DEN * STEP - GAP;
const ROW_H = 34;

function Row({ shaded, label }: { shaded: number; label: string }) {
  return (
    <div dir="ltr" className="flex flex-col items-center gap-1">
      <svg viewBox={`0 0 ${WIDTH} ${CELL}`} role="img" aria-label={label} className="h-auto w-full max-w-[220px] text-current">
        {Array.from({ length: DEN }, (_, i) => (
          <rect
            key={i}
            x={i * STEP}
            y={0}
            width={CELL}
            height={CELL}
            rx={4}
            fill={i < shaded ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth={1.5}
            opacity={i < shaded ? 0.85 : 0.35}
          />
        ))}
      </svg>
      <span className="text-xs opacity-70">{label}</span>
    </div>
  );
}

export default function FractionAdditionDiagram() {
  const t = useTranslations("tools.fraction-calculator.additionDiagram");

  return (
    <figure className="my-2 flex flex-col items-center gap-2" style={{ minHeight: ROW_H * 3 + 40 }}>
      <Row shaded={3} label={t("rowA")} />
      <span className="text-lg opacity-60">+</span>
      <Row shaded={2} label={t("rowB")} />
      <span className="text-lg opacity-60">=</span>
      <Row shaded={5} label={t("rowSum")} />
      <figcaption className="mt-1 text-center text-sm opacity-70">{t("caption")}</figcaption>
    </figure>
  );
}
