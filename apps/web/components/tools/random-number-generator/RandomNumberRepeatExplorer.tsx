"use client";
import { useEffect, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { Coordinates, Line, Mafs, Polyline, Text, useMovablePoint } from "mafs";
import "mafs/core.css";
import "@/components/tool-ui/mafsTheme.css";
import { drawsForDuplicateChance, duplicateProbability, expectedDistinct } from "@tooloralabs/tools";
import IndicatorCard from "@/components/tools/markets/IndicatorCard";
import { useIsDarkMode } from "@/lib/use-dark-mode";
import type { RngFormatters } from "./format";

type Props = { n: number; k: number; allowDuplicates: boolean; onCountChange: (k: number) => void; f: RngFormatters; fallback?: React.ReactNode };

function niceStep(span: number, parts = 5): number {
  const raw = span / parts;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const r = raw / mag;
  return (r < 1.5 ? 1 : r < 3.5 ? 2 : r < 7.5 ? 5 : 10) * mag;
}

/**
 * The "wow" piece: the birthday-problem curve for the current range, with a draggable point on
 * it. Dragging sets How Many Numbers itself, so the draw, the hero and every indicator move too.
 */
export default function RandomNumberRepeatExplorer({ n, k, allowDuplicates, onCountChange, f, fallback }: Props) {
  const t = useTranslations("tools.random-number-generator.ind");
  const isDark = useIsDarkMode();
  const blue = isDark ? "#60a5fa" : "#2563eb";
  const amber = isDark ? "#fbbf24" : "#d97706";

  const { xMax, curve, k50 } = useMemo(() => {
    const k50 = drawsForDuplicateChance(n, 0.5);
    const k99 = drawsForDuplicateChance(n, 0.99);
    const xMax = Math.max(10, Math.min(10000, Math.ceil(k99 * 1.2)));
    const step = Math.max(1, Math.ceil(xMax / 160));
    const curve: [number, number][] = [];
    let logNoRepeat = 0;
    for (let x = 1; x <= xMax; x++) {
      if (x > 1) logNoRepeat += x - 1 >= n ? -Infinity : Math.log1p(-(x - 1) / n);
      if (x === 1 || x % step === 0 || x === xMax) curve.push([x, -Math.expm1(logNoRepeat)]);
    }
    return { xMax, curve, k50 };
  }, [n]);

  const kMax = allowDuplicates ? xMax : Math.min(xMax, n);
  const clampK = (x: number) => Math.min(kMax, Math.max(1, Math.round(x)));
  const shownK = clampK(k);

  const point = useMovablePoint([shownK, duplicateProbability(n, shownK)], {
    color: blue,
    constrain: (p) => {
      const kk = clampK(p[0]);
      return [kk, duplicateProbability(n, kk)];
    },
  });

  // Two-way sync: typing a count moves the point; dragging the point writes the count.
  const lastK = useRef(shownK);
  const lastN = useRef(n);
  const suppress = useRef(false);
  useEffect(() => {
    if (shownK !== lastK.current || n !== lastN.current) {
      suppress.current = true;
      lastK.current = shownK;
      lastN.current = n;
      point.setPoint([shownK, duplicateProbability(n, shownK)]);
    }
  }, [shownK, n, point]);
  useEffect(() => {
    if (suppress.current) {
      suppress.current = false;
      return;
    }
    const kk = clampK(point.point[0]);
    if (kk !== lastK.current) {
      lastK.current = kk;
      onCountChange(kk);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to the point moving
  }, [point.point]);

  const p = duplicateProbability(n, shownK);
  const noRepeat = 1 - p;
  const xStep = niceStep(xMax);

  return (
    <IndicatorCard
      id="repeat-odds"
      title={t("dup.title")}
      heading={t("dup.heading", { k: f.int(shownK), n: f.int(n) })}
      intro={t("dup.intro")}
      fallback={fallback}
      worked={{
        title: t("worked"),
        rows: [
          { label: t("dup.rowN"), value: f.int(n) },
          { label: t("dup.rowK"), value: f.int(shownK) },
          { label: t("dup.rowNoRepeat"), value: `∏(1 − i/${f.int(n)}) = ${f.pct(noRepeat, 2)}` },
          { label: t("dup.rowHalf"), value: k50 > n ? "—" : f.int(k50) },
          { label: t("dup.rowDistinct"), value: f.num(expectedDistinct(n, shownK), 2) },
          { label: t("dup.rowRepeat"), value: f.pct(p, 2), emphasize: true, note: allowDuplicates ? undefined : t("dup.noteNoDup") },
        ],
      }}
    >
      <div dir="ltr" className="mb-2 flex flex-wrap items-center gap-1.5">
        <span className="rounded-full bg-blue-50 px-2.5 py-1 font-mono text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" data-testid="dup-k">
          k = {f.int(shownK)}
        </span>
        <span className="rounded-full bg-amber-50 px-2.5 py-1 font-mono text-xs font-semibold text-amber-700 dark:bg-amber-500/10 dark:text-amber-300" data-testid="dup-p">
          P = {f.pct(p, 2)}
        </span>
        <span className="rounded-full bg-zinc-100 px-2.5 py-1 font-mono text-xs font-semibold text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
          50% @ k = {k50 > n ? "—" : f.int(k50)}
        </span>
      </div>
      <div dir="ltr" className="mafs-canvas w-full overflow-hidden rounded-xl" aria-label={t("dup.hint")} data-testid="dup-mafs">
        <Mafs viewBox={{ x: [-xMax * 0.06, xMax * 1.03], y: [-0.14, 1.08] }} height={260} pan={false} zoom={false} preserveAspectRatio={false}>
          <Coordinates.Cartesian
            xAxis={{ lines: xStep, labels: (x) => (x > 0 ? f.int(x) : "") }}
            yAxis={{ lines: 0.25, labels: (y) => (y > 0 && y <= 1 ? `${Math.round(y * 100)}%` : "") }}
          />
          {k50 <= xMax && <Line.Segment point1={[k50, 0]} point2={[k50, 0.5]} color={amber} style="dashed" opacity={0.8} />}
          <Line.Segment point1={[0, 0.5]} point2={[Math.min(k50, xMax), 0.5]} color={amber} style="dashed" opacity={0.8} />
          <Polyline points={curve} color={blue} weight={3} />
          <Line.Segment point1={[shownK, 0]} point2={point.point} color={blue} opacity={0.5} />
          <Text x={point.point[0]} y={Math.min(1.02, point.point[1] + 0.09)} size={13} color={blue}>
            {f.pct(p, 1)}
          </Text>
          {point.element}
        </Mafs>
      </div>
      <p className="mt-2 text-center text-xs text-zinc-500 dark:text-zinc-400">{t("dup.hint")}</p>
    </IndicatorCard>
  );
}
