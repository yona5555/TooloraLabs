"use client";
import { useRef, type PointerEvent } from "react";
import { useTranslations } from "next-intl";
import { percentageInputsForShare } from "@tooloralabs/tools";
import IndicatorCard from "@/components/tools/markets/IndicatorCard";
import { usePercentage, usePercentageLive } from "./PercentageLiveContext";

const CELL = 15;
const GAP = 2;
const SIDE = 10 * CELL + 9 * GAP;

const round = (v: number, d = 4) => Number(v.toFixed(d));

/**
 * The "wow" piece: paint the two 100-grids (drag across the squares, or use the slider) to set
 * the percentage. The painted share is written back into the calculator's own two fields, so the
 * Result card, the 3D board, the live table and every indicator on the page follow the brush.
 */
export default function PercentageGridLab() {
  const t = useTranslations("tools.percentage-calculator.ind");
  const { setDim } = usePercentageLive();
  const { mode, a, b, frame, fmt, labelA, labelB } = usePercentage();
  const { f, sp } = fmt;
  const painting = useRef(false);
  const max = mode === "percentage-difference" ? 199 : 200;
  const share = Math.min(Math.max(frame.share, 0), 200);
  const loss = mode === "percentage-change" && share < 100;

  function apply(next: number) {
    const s = Math.min(Math.max(round(next, 2), 0), max);
    const v = percentageInputsForShare(mode, a, b, s);
    if (v.first !== a) setDim("first", String(round(v.first)));
    if (v.second !== b) setDim("second", String(round(v.second)));
  }

  function shareAt(e: PointerEvent<HTMLDivElement>, offset: number) {
    const r = e.currentTarget.getBoundingClientRect();
    const col = Math.min(9, Math.max(0, Math.floor(((e.clientX - r.left) / r.width) * 10)));
    const row = Math.min(9, Math.max(0, Math.floor(((e.clientY - r.top) / r.height) * 10)));
    return offset + row * 10 + col + 1;
  }

  const handlers = (offset: number) => ({
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
      painting.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      apply(shareAt(e, offset));
    },
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
      if (painting.current) apply(shareAt(e, offset));
    },
    onPointerUp: () => {
      painting.current = false;
    },
    onPointerCancel: () => {
      painting.current = false;
    },
  });

  const cellClass = (i: number) => {
    const fill = Math.min(Math.max(share - i, 0), 1);
    if (fill >= 1) return i >= 100 ? "bg-emerald-500 dark:bg-emerald-400" : "bg-blue-600 dark:bg-blue-400";
    if (i < 100 && loss) return "bg-red-400/80 dark:bg-red-500/60";
    return "bg-zinc-200 dark:bg-zinc-700";
  };
  const partial = (i: number) => {
    const fill = share - i;
    return fill > 0 && fill < 1 ? fill : 0;
  };

  const grid = (offset: number, caption: string) => (
    <div className="flex flex-col items-center gap-1.5">
      <div
        {...handlers(offset)}
        role="slider"
        aria-label={caption}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={round(share, 2)}
        className="grid cursor-crosshair touch-none select-none"
        style={{ gridTemplateColumns: `repeat(10, ${CELL}px)`, gap: GAP, width: SIDE, height: SIDE }}
      >
        {Array.from({ length: 100 }, (_, k) => {
          const i = offset + k;
          const part = partial(i);
          return (
            <div key={k} className={`relative overflow-hidden rounded-[3px] ${cellClass(i)}`} style={{ width: CELL, height: CELL }}>
              {part > 0 && <div className={`absolute inset-y-0 start-0 ${i >= 100 ? "bg-emerald-500 dark:bg-emerald-400" : "bg-blue-600 dark:bg-blue-400"}`} style={{ width: `${part * 100}%` }} />}
            </div>
          );
        })}
      </div>
      <span className="font-mono text-[11px] text-zinc-500 dark:text-zinc-400">{caption}</span>
    </div>
  );

  const written = ["percentage-change", "percentage-difference"].includes(mode) ? { label: labelB, value: b } : { label: labelA, value: a };

  return (
    <IndicatorCard
      id="grid-lab"
      title={t("lab.title")}
      heading={t("lab.heading")}
      intro={t(`lab.intro.${mode}`)}
      controls={
        <label className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="shrink-0">{t("lab.slider")}</span>
          <input
            type="range"
            min={0}
            max={max}
            step={0.5}
            value={round(share, 1)}
            onChange={(e) => apply(Number(e.target.value))}
            className="w-full accent-blue-600"
            aria-label={t("lab.slider")}
          />
          <span dir="ltr" className="w-16 shrink-0 text-end font-mono font-semibold text-blue-700 dark:text-blue-300">{`${f(share, 2)}%`}</span>
        </label>
      }
      worked={{
        title: t("worked"),
        rows: [
          { label: t("lab.rowShare"), value: `${f(share, 2)}%` },
          { label: t("lab.rowCells"), value: `${f(Math.floor(share))} + ${f(share - Math.floor(share), 2)}` },
          { label: t("lab.rowBase"), value: f(frame.base) },
          { label: t("lab.rowPart"), value: `${f(frame.base)} × ${f(share, 2)}% = ${f((frame.base * share) / 100)}` },
          { label: t("lab.rowRest"), value: share <= 100 ? `${f(100 - share, 2)}% = ${f((frame.base * (100 - share)) / 100)}` : `+${f(share - 100, 2)}%` },
          { label: t("lab.rowWritten", { field: written.label }), value: f(written.value) },
          { label: t("lab.rowResult"), value: mode === "percent-of-number" ? f(frame.part) : mode === "reverse-percentage" ? f(frame.base) : sp(frame.percent), emphasize: true },
        ],
      }}
    >
      <div dir="ltr" className="flex flex-wrap items-start justify-center gap-5">
        {grid(0, "0 – 100%")}
        {grid(100, "100 – 200%")}
      </div>
      <div className="mt-3 flex flex-wrap justify-center gap-4 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-blue-600 dark:bg-blue-400" />{t("lab.legendShare")}</span>
        <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-emerald-500 dark:bg-emerald-400" />{t("lab.legendAbove")}</span>
        {loss && <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-red-400/80" />{t("lab.legendLost")}</span>}
      </div>
    </IndicatorCard>
  );
}
