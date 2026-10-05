"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useFractionLive } from "./FractionLiveContext";
import { formatMathValue } from "@tooloralabs/tools";

function Row({ label, segments, color, cutAt }: { label: string; segments: number; color: string; cutAt: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-7 shrink-0 text-[10px] font-bold text-zinc-400">{label}</span>
      <div className="relative flex h-6 flex-1 gap-0.5">
        {Array.from({ length: segments }, (_, i) => (
          <div key={i} className="flex-1 rounded-sm text-center text-[9px] leading-6" style={{ background: color, opacity: 0.25 + (0.6 * (i + 1)) / segments }}>
            1/{segments}
          </div>
        ))}
        <div className="absolute inset-y-0 w-0.5 bg-emerald-500" style={{ left: `${cutAt * 100}%` }} />
      </div>
    </div>
  );
}

/** Every row cuts the same whole into a different number of equal pieces — the green line marks
 * the live result's own position; drag it to explore any value between 0 and 1. */
export default function FractionWallCard() {
  const t = useTranslations("tools.fraction-calculator.education.wall");
  const { dims } = useFractionLive();
  const { numeratorA, denominatorA, numeratorB, denominatorB, operation } = dims;
  const valueA = numeratorA / (denominatorA || 1);
  const valueB = numeratorB / (denominatorB || 1);
  const result = operation === "add" ? valueA + valueB : operation === "subtract" ? valueA - valueB : operation === "multiply" ? valueA * valueB : valueB !== 0 ? valueA / valueB : 0;
  const [cut, setCut] = useState<number | null>(null);
  const position = Math.max(0, Math.min(1, cut ?? result));

  return (
    <GlassIndicatorCard
      n={4}
      accent="blue"
      title={t("title")}
      subtitle={t("subtitle")}
      visual={
        <div
          className="flex w-56 flex-col gap-2"
          onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
          onPointerMove={(e) => {
            if (e.buttons !== 1) return;
            const rect = e.currentTarget.getBoundingClientRect();
            setCut(Math.max(0, Math.min(1, (e.clientX - rect.left - 28) / (rect.width - 28))));
          }}
        >
          <Row label="1" segments={1} color="#94A3B8" cutAt={position} />
          <Row label="A" segments={Math.max(1, Math.round(denominatorA))} color="#5B6EF5" cutAt={position} />
          <Row label="B" segments={Math.max(1, Math.round(denominatorB))} color="#F0507A" cutAt={position} />
          <Row label="R" segments={6} color="#1FC89C" cutAt={position} />
        </div>
      }
      table={
        <GlassTable
          columns={[
            { key: "row", label: t("colRow") },
            { key: "cut", label: t("colCut") },
            { key: "shows", label: t("colShows") },
          ]}
          rows={[
            { row: "A", cut: t("halves", { n: formatMathValue(denominatorA) }), shows: `${formatMathValue(numeratorA)}/${formatMathValue(denominatorA)}` },
            { row: "B", cut: t("halves", { n: formatMathValue(denominatorB) }), shows: `${formatMathValue(numeratorB)}/${formatMathValue(denominatorB)}` },
            { row: "Result", cut: t("sixths"), shows: formatMathValue(result) },
            { row: t("cursor"), cut: "", shows: formatMathValue(position) },
          ]}
        />
      }
    />
  );
}
