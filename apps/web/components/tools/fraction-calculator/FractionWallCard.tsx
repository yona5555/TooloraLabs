"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { GlassIndicatorCard, GlassTable } from "@/components/tool-ui/glass/GlassPrimitives";
import { useFractionCardState } from "./useFractionCardState";
import { formatMathValue } from "@tooloralabs/tools";

function Row({ label, segments, color, cutAt }: { label: string; segments: number; color: string; cutAt: number }) {
  return (
    <div className="flex flex-1 items-center gap-2">
      <span className="w-7 shrink-0 text-[10px] font-bold" style={{ color: "var(--glass-muted)" }}>
        {label}
      </span>
      <div className="relative flex h-full flex-1 gap-0.5">
        {Array.from({ length: segments }, (_, i) => (
          <div key={i} className="flex-1 rounded-sm text-center text-[9px] leading-[2.25rem]" style={{ background: color, color: "var(--color-white)", opacity: 0.9, borderInlineStart: i === 0 ? "none" : "1px solid color-mix(in oklab, var(--color-white) 30%, transparent)" }}>
            1/{segments}
          </div>
        ))}
        <div className="absolute inset-y-0 w-0.5" style={{ left: `${cutAt * 100}%`, background: "var(--glass-accent-3-strong)" }} />
      </div>
    </div>
  );
}

/** Every row cuts the same whole into a different number of equal pieces — the accent line marks
 * the live result's own position; drag it to explore any value between 0 and 1. The wall fills
 * the card's full visual column instead of floating as a small fixed-width block. */
export default function FractionWallCard() {
  const t = useTranslations("tools.fraction-calculator.education.wall");
  const { dims } = useFractionCardState();
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
          className="flex h-44 w-full flex-col gap-3 lg:h-52"
          onPointerDown={(e) => e.currentTarget.setPointerCapture(e.pointerId)}
          onPointerMove={(e) => {
            if (e.buttons !== 1) return;
            const rect = e.currentTarget.getBoundingClientRect();
            setCut(Math.max(0, Math.min(1, (e.clientX - rect.left - 28) / (rect.width - 28))));
          }}
        >
          <Row label="1" segments={1} color="var(--glass-muted)" cutAt={position} />
          <Row label="A" segments={Math.max(1, Math.round(denominatorA))} color="var(--glass-accent-1-strong)" cutAt={position} />
          <Row label="B" segments={Math.max(1, Math.round(denominatorB))} color="var(--glass-accent-2-strong)" cutAt={position} />
          <Row label="R" segments={6} color="var(--glass-accent-3-strong)" cutAt={position} />
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
