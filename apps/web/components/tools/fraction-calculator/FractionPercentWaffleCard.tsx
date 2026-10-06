"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassHandle, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useFractionCardState } from "./useFractionCardState";
import { formatMathValue, formatPercent } from "@tooloralabs/tools";

const R = 44;
const CIRC = 2 * Math.PI * R;

/** §38: percent as a continuous ring gauge -- never a 100-cell waffle. The ring's own dash-offset
 * IS the percentage, a smooth arc rather than a count of filled cells; drag around the ring (or
 * the handle on its edge) to set the live result's own numerator directly. */
export default function FractionPercentWaffleCard() {
  const t = useTranslations("tools.fraction-calculator.education.percentWaffle");
  const tCommon = useTranslations("common");
  const { dims, setDim } = useFractionCardState();
  const { numeratorA, denominatorA, numeratorB, denominatorB, operation } = dims;
  const valueA = numeratorA / (denominatorA || 1);
  const valueB = numeratorB / (denominatorB || 1);
  const result = operation === "add" ? valueA + valueB : operation === "subtract" ? valueA - valueB : operation === "multiply" ? valueA * valueB : valueB !== 0 ? valueA / valueB : 0;
  const pct = Math.max(0, Math.min(100, result * 100));
  const frac = pct / 100;
  const handleAngle = frac * 360 - 90;

  function setFromAngle(clientX: number, clientY: number, rect: DOMRect) {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = Math.atan2(clientY - cy, clientX - cx) + Math.PI / 2;
    const norm = (((angle / (Math.PI * 2)) % 1) + 1) % 1;
    setDim("numeratorA", Math.round(norm * denominatorA));
  }
  function handlePointer(e: React.PointerEvent<SVGSVGElement>) {
    setFromAngle(e.clientX, e.clientY, e.currentTarget.getBoundingClientRect());
  }
  function stepPct(delta: 1 | -1) {
    setDim("numeratorA", Math.max(0, Math.min(denominatorA, numeratorA + delta)));
  }

  return (
    <GlassIndicatorCard
      n={6}
      accent="mint"
      title={t("title")}
      subtitle={t("subtitle", { pct: formatPercent(pct) })}
      visual={
        <div className="relative flex w-full flex-col items-center gap-2">
          <div className="relative w-full max-w-[180px]">
            <svg
              viewBox="0 0 100 100"
              width="180"
              height="180"
              className="w-full cursor-grab touch-none active:cursor-grabbing"
              onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); handlePointer(e); }}
              onPointerMove={(e) => e.buttons === 1 && handlePointer(e)}
            >
              <circle cx="50" cy="50" r={R} fill="none" stroke="var(--glass-track)" strokeWidth="11" />
              <circle
                cx="50"
                cy="50"
                r={R}
                fill="none"
                stroke="var(--glass-accent-3-strong)"
                strokeWidth="11"
                strokeLinecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={CIRC * (1 - frac)}
                transform="rotate(-90 50 50)"
                className="transition-[stroke-dashoffset] duration-300 ease-out"
              />
              <text x="50" y="54" textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--glass-title)">
                {`${formatPercent(pct)}%`}
              </text>
            </svg>
            <GlassHandle
              direction="circular"
              ariaLabel={tCommon("dragToChange")}
              onStep={stepPct}
              style={{
                left: `${50 + 44 * Math.cos((handleAngle * Math.PI) / 180)}%`,
                top: `${50 + 44 * Math.sin((handleAngle * Math.PI) / 180)}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
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
            { k: t("result"), v: `${formatMathValue(numeratorA)}/${formatMathValue(denominatorA)}` },
            { k: t("percent"), v: `${formatPercent(pct)}%`, isKeyResult: true },
            { k: t("rounded"), v: `${Math.round(pct)}%` },
          ]}
        />
      }
    />
  );
}
