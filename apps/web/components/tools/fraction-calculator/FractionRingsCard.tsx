"use client";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useFractionCardState } from "./useFractionCardState";
import { formatMathValue } from "@tooloralabs/tools";

function Ring({ num, den, color, onDrag, label }: { num: number; den: number; color: string; onDrag: (newNum: number) => void; label: string }) {
  const r = 38;
  const circ = 2 * Math.PI * r;
  const frac = den !== 0 ? Math.max(0, Math.min(1, num / den)) : 0;
  function handlePointer(e: React.PointerEvent<SVGSVGElement>) {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - cy, e.clientX - cx) + Math.PI / 2;
    const norm = ((angle / (Math.PI * 2)) % 1 + 1) % 1;
    const newNum = Math.round(norm * Math.abs(den || 1));
    onDrag(Math.max(0, Math.min(Math.abs(den || 1), newNum)));
  }
  return (
    <div className="flex flex-col items-center gap-1">
      <svg
        viewBox="0 0 100 100"
        width="150"
        height="150"
        className="w-full max-w-[150px] cursor-grab touch-none active:cursor-grabbing"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          handlePointer(e);
        }}
        onPointerMove={(e) => {
          if (e.buttons === 1) handlePointer(e);
        }}
      >
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--glass-track)" strokeWidth="10" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="10" strokeDasharray={circ} strokeDashoffset={circ * (1 - frac)} strokeLinecap="round" transform="rotate(-90 50 50)" />
        <circle cx={50 + r * Math.sin(frac * Math.PI * 2)} cy={50 - r * Math.cos(frac * Math.PI * 2)} r="6" fill={color} stroke="white" strokeWidth="2" />
        <text x="50" y="54" textAnchor="middle" fontSize="13" fontWeight="700" fill="var(--glass-title)">
          {formatMathValue(num)}/{formatMathValue(den)}
        </text>
      </svg>
      <span className="text-[10px] font-semibold" style={{ color: "var(--glass-muted)" }}>
        {label}
      </span>
    </div>
  );
}

/** Each ring is one whole, split into `denominator` equal parts; drag around the ring edge to
 * change how many parts are taken (the numerator) — writes straight back to the shared draft. */
export default function FractionRingsCard() {
  const t = useTranslations("tools.fraction-calculator.education.rings");
  const { dims, setDim } = useFractionCardState();
  return (
    <GlassIndicatorCard
      n={2}
      accent="blue"
      title={t("title")}
      subtitle={t("subtitle")}
      visual={
        <div className="flex w-full flex-wrap items-center justify-around gap-4">
          <Ring num={dims.numeratorA} den={dims.denominatorA} color="var(--glass-accent-1-strong)" onDrag={(n) => setDim("numeratorA", n)} label={t("labelA", { den: formatMathValue(dims.denominatorA) })} />
          <Ring num={dims.numeratorB} den={dims.denominatorB} color="var(--glass-accent-2-strong)" onDrag={(n) => setDim("numeratorB", n)} label={t("labelB", { den: formatMathValue(dims.denominatorB) })} />
        </div>
      }
      table={
        <GlassTable
          columns={[
            { key: "item", label: t("colItem") },
            { key: "parts", label: t("colParts") },
            { key: "taken", label: t("colTaken") },
          ]}
          rows={[
            { item: "A", parts: formatMathValue(dims.denominatorA), taken: formatMathValue(dims.numeratorA) },
            { item: "B", parts: formatMathValue(dims.denominatorB), taken: formatMathValue(dims.numeratorB) },
            { item: t("colAasPercent"), parts: "", taken: `${formatMathValue((dims.numeratorA / (dims.denominatorA || 1)) * 100)}%` },
          ]}
        />
      }
    />
  );
}
