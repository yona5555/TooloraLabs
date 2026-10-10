"use client";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { nearestBenchmark, percentComparisons, percentForms, percentToUndo, percentUpThenDown } from "@tooloralabs/tools";
import LiveTable3DLayout, { type LiveTableGroup, type LiveTableRow } from "@/components/tool-ui/three/LiveTable3DLayout";
import Scene3D from "@/components/tool-ui/three/Scene3D";
import { usePercentage, type PercentageLive } from "./PercentageLiveContext";

// three/drei live only in this dynamically imported chunk, never in the page chunk.
const PercentageScene3D = dynamic(() => import("./PercentageScene3D"), { ssr: false });

/** Deep live table (left) + 10×10 board of 3D cubes (right) for the active calculation. */
export default function PercentageLive3D({ live }: { live: PercentageLive }) {
  const t = useTranslations("tools.percentage-calculator.live3d");
  const tc = useTranslations("common.live3d");
  const { mode, a, b, frame, fmt, labelA, labelB } = live;
  const { f, n, sp } = fmt;
  const { base: B, percent: p, part: P } = frame;
  const forms = percentForms(p);
  const bench = nearestBenchmark(Math.abs(p));
  const ud = percentUpThenDown(B, p);
  const undo = percentToUndo(p);
  const changeMode = mode === "percentage-change" || mode === "percentage-difference";
  const [x, y] = changeMode ? [a, b] : [B, B + P];
  const cmp = percentComparisons(x, y);
  const opt = (v: number | null, fn: (v: number) => string) => (v === null ? "—" : fn(v));

  const steps: Record<typeof mode, LiveTableRow[]> = {
    "percent-of-number": [
      { label: t("rows.decimal"), formula: `${n(p)} ÷ 100`, value: f(p / 100, 6) },
      { label: t("rows.part"), formula: `${n(p / 100, 6)} × ${n(B)}`, value: f(P), emphasize: true },
    ],
    "what-percent": [
      { label: t("rows.ratio"), formula: `${n(P)} ÷ ${n(B)}`, value: f(P / B, 6) },
      { label: t("rows.percent"), formula: `${n(P / B, 6)} × 100`, value: f(p), unit: "%", emphasize: true },
    ],
    "percentage-change": [
      { label: t("rows.gap"), formula: `${n(b)} − ${n(a)}`, value: f(P) },
      { label: t("rows.ratio"), formula: `${n(P)} ÷ ${n(a)}`, value: f(P / a, 6) },
      { label: t("rows.change"), formula: `${n(P / a, 6)} × 100`, value: sp(p, 4), emphasize: true },
    ],
    "reverse-percentage": [
      { label: t("rows.decimal"), formula: `${n(p)} ÷ 100`, value: f(p / 100, 6) },
      { label: t("rows.base"), formula: `${n(P)} ÷ ${n(p / 100, 6)}`, value: f(B), emphasize: true },
    ],
    "percentage-difference": [
      { label: t("rows.gap"), formula: `|${n(a)} − ${n(b)}|`, value: f(P) },
      { label: t("rows.mean"), formula: `(${n(a)} + ${n(b)}) ÷ 2`, value: f(B) },
      { label: t("rows.difference"), formula: `${n(P)} ÷ ${n(B)} × 100`, value: f(p, 4), unit: "%", emphasize: true },
    ],
  };

  const groups: LiveTableGroup[] = [
    {
      title: t("groups.given"),
      rows: [
        { label: labelA, formula: t("given"), value: f(a) },
        { label: labelB, formula: t("given"), value: f(b) },
      ],
    },
    { title: t("groups.steps"), rows: steps[mode] },
    {
      title: t("groups.frame"),
      rows: [
        { label: t("rows.base"), formula: "100%", value: f(B) },
        { label: t("rows.part"), formula: `${n(B)} × ${n(p)}%`, value: f(P) },
        { label: t("rows.remainder"), formula: `${n(B)} − ${n(P)}`, value: f(B - P) },
      ],
    },
    {
      title: t("groups.forms"),
      rows: [
        { label: t("rows.fraction"), formula: `${n(p)}/100`, value: `${forms.fraction.num}/${forms.fraction.den}` },
        { label: t("rows.perMille"), formula: `${n(p)} × 10`, value: f(forms.perMille), unit: "‰" },
        { label: t("rows.basisPoints"), formula: `${n(p)} × 100`, value: f(forms.basisPoints), unit: "bp" },
        { label: t("rows.oneIn"), formula: `100 ÷ ${n(Math.abs(p))}`, value: Number.isFinite(forms.oneIn) ? `1 : ${f(forms.oneIn, 2)}` : "—" },
        { label: t("rows.benchmark"), formula: `${bench.num}/${bench.den} = ${n(bench.percent, 2)}%`, value: sp(bench.gap, 2) },
      ],
    },
    {
      title: t("groups.reverse"),
      rows: [
        { label: t("rows.reverseBase"), formula: `${n(P)} ÷ ${n(p / 100, 6)}`, value: p === 0 ? "—" : f(P / (p / 100)) },
        { label: t("rows.increased"), formula: `${n(B)} × ${n(forms.multiplierUp, 6)}`, value: f(B * forms.multiplierUp) },
        { label: t("rows.decreased"), formula: `${n(B)} × ${n(forms.multiplierDown, 6)}`, value: f(B * forms.multiplierDown) },
        { label: t("rows.undo"), formula: `−p ÷ (100 + p)`, value: Number.isFinite(undo) ? sp(undo, 3) : "—" },
      ],
    },
    {
      title: t("groups.compare"),
      rows: [
        { label: t("rows.changeAB"), formula: `(${n(y)} − ${n(x)}) ÷ ${n(x)}`, value: opt(cmp.changeAB, (v) => sp(v, 3)) },
        { label: t("rows.changeBA"), formula: `(${n(x)} − ${n(y)}) ÷ ${n(y)}`, value: opt(cmp.changeBA, (v) => sp(v, 3)) },
        { label: t("rows.pctDifference"), formula: `|Δ| ÷ ${n((x + y) / 2)}`, value: opt(cmp.difference, (v) => `${f(v, 3)}%`) },
        { label: t("rows.points"), formula: `${n(p)} + 1 → ${n(p + 1)}%`, value: f((B * (p + 1)) / 100) },
        { label: t("rows.relative"), formula: `${n(p)} × 1.1 → ${n(p * 1.1)}%`, value: f((B * p * 1.1) / 100) },
      ],
    },
    {
      title: t("groups.twice"),
      rows: [
        { label: t("rows.compoundTwice"), formula: `${n(B)} × ${n(forms.multiplierUp, 4)}²`, value: f(B * forms.multiplierUp ** 2), emphasize: true },
        { label: t("rows.simpleTwice"), formula: `${n(B)} × (1 + 2 × ${n(p / 100, 4)})`, value: f(B * (1 + (2 * p) / 100)) },
        { label: t("rows.upDown"), formula: `${n(B)} × ${n(forms.multiplierUp, 4)} × ${n(forms.multiplierDown, 4)}`, value: f(ud.upDown) },
        { label: t("rows.net"), formula: `−(${n(p / 100, 4)})² × 100`, value: sp(ud.netPercent, 4) },
      ],
    },
  ];

  return (
    <LiveTable3DLayout
      groups={groups}
      headings={[tc("colQuantity"), tc("colFormula"), tc("colValue")]}
      hint={tc("hint")}
      drawing={
        <Scene3D camera={[3.2, 4.6, 4.6]} autoRotate>
          <PercentageScene3D
            share={frame.share}
            loss={mode === "percentage-change" && frame.share < 100}
            labels={{ share: `${n(frame.share, 2)}% → ${n(mode === "percentage-change" ? b : (B * frame.share) / 100)}`, base: `100% = ${n(B)}` }}
          />
        </Scene3D>
      }
    />
  );
}

/** Education copy: follows the live input (holding the last valid pair mid-edit). */
export function PercentageLive3DLive() {
  const live = usePercentage();
  return <PercentageLive3D live={live} />;
}
