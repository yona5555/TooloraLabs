"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import DlIndicatorCard, { DlIndicatorUnavailable } from "./DlIndicatorCard";
import { useDlModel } from "./DlLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;

/**
 * Interactive piece: one cell per input line, green if kept and red if removed, with arcs joining
 * each removed line to the line it repeats. Click a cell to read that line's record.
 */
export default function DlLineMap() {
  const t = useTranslations("tools.duplicate-line-remover.education.lab.map");
  const { a, f } = useDlModel();
  const [pick, setPick] = useState(0);
  if (!a || a.lines.length === 0) return <DlIndicatorUnavailable title={t("title")} />;

  const lines = a.lines.slice(0, 40);
  const cw = W / lines.length;
  const cy = 120;
  const k = Math.min(pick, lines.length - 1);
  const sel = lines[k];
  const H = 170;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {lines.map((l, i) => {
        if (l.kept || l.firstPosition - 1 >= lines.length) return null;
        const x1 = (l.firstPosition - 1) * cw + cw / 2;
        const x2 = i * cw + cw / 2;
        const h = Math.min(100, Math.abs(x2 - x1) * 0.6 + 10);
        return (
          <path
            key={i}
            d={`M ${x1} ${cy - 12} Q ${(x1 + x2) / 2} ${cy - 12 - h} ${x2} ${cy - 12}`}
            fill="none"
            strokeWidth={i === k || l.firstPosition - 1 === k ? 2.5 : 1.2}
            className="stroke-rose-400 dark:stroke-rose-500"
          />
        );
      })}
      {lines.map((l, i) => (
        <g key={i} onClick={() => setPick(i)} className="cursor-pointer">
          <rect
            x={i * cw + 1}
            y={cy - 12}
            width={cw - 2}
            height={24}
            rx={4}
            className={l.kept ? "fill-emerald-500 dark:fill-emerald-400" : "fill-rose-500 dark:fill-rose-400"}
            opacity={i === k ? 1 : 0.75}
            strokeWidth={i === k ? 2.5 : 0}
            stroke="currentColor"
          />
          {cw >= 14 && (
            <text style={{ fontSize: svgPx(12) }} x={i * cw + cw / 2} y={cy + 30} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
              {l.position}
            </text>
          )}
        </g>
      ))}
    </svg>
  );

  return (
    <DlIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("line"), value: `${sel.position} / ${a.lines.length}` },
        { label: t("text"), value: sel.raw.length > 22 ? `${sel.raw.slice(0, 21)}…` : sel.raw },
        { label: t("occurrences"), value: f(sel.occurrences) },
        { label: t("first"), value: f(sel.firstPosition) },
        { label: t("fate"), value: sel.kept ? t("kept") : t("removed", { n: sel.firstPosition }), emphasize: true },
      ]}
    />
  );
}
