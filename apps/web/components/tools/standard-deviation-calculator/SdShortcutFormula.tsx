"use client";
import { useTranslations } from "next-intl";
import SdIndicatorCard from "./SdIndicatorCard";
import { useSdModel } from "./SdLiveContext";

const W = 300;
const H = 220;

/**
 * Type #18 (Formula Diagram): the computational shortcut Σx² − (Σx)²/n built term by term from
 * the live data, landing on the same sum of squares as the definition Σ(x − μ)².
 */
export default function SdShortcutFormula() {
  const t = useTranslations("tools.standard-deviation-calculator.education.lab.shortcut");
  const tl = useTranslations("tools.standard-deviation-calculator.live3d");
  const { a, f } = useSdModel();
  if (!a) return null;
  const correction = (a.sum * a.sum) / a.n;
  const match = Math.abs(a.sumSquaresShortcut - a.sumSquares) <= 1e-9 * Math.max(1, a.sumOfSquaresRaw);

  const box = (x: number, y: number, w: number, top: string, value: string, cls: string) => (
    <g>
      <rect x={x} y={y} width={w} height={52} rx={10} strokeWidth={1.5} className={cls} />
      <text x={x + w / 2} y={y + 20} textAnchor="middle" fontSize={11} className="fill-zinc-500 dark:fill-zinc-400">
        {top}
      </text>
      <text x={x + w / 2} y={y + 40} textAnchor="middle" fontSize={14} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
        {value}
      </text>
    </g>
  );

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {box(4, 6, 126, "Σx²", f(a.sumOfSquaresRaw), "fill-sky-100 stroke-sky-500 dark:fill-sky-500/15 dark:stroke-sky-400")}
      <text x={150} y={40} textAnchor="middle" fontSize={22} fontWeight={700} className="fill-zinc-500 dark:fill-zinc-400">
        −
      </text>
      {box(170, 6, 126, `(${f(a.sum)})² / ${a.n}`, f(correction), "fill-amber-100 stroke-amber-500 dark:fill-amber-500/15 dark:stroke-amber-400")}
      <path d="M 67 62 L 67 84 L 233 84 L 233 62" fill="none" strokeWidth={1.5} className="stroke-zinc-400 dark:stroke-zinc-500" />
      <line x1={150} y1={84} x2={150} y2={100} strokeWidth={1.5} className="stroke-zinc-400 dark:stroke-zinc-500" />
      {box(60, 100, 180, t("shortcutLabel"), f(a.sumSquaresShortcut), "fill-violet-100 stroke-violet-500 dark:fill-violet-500/15 dark:stroke-violet-400")}
      <text x={150} y={176} textAnchor="middle" fontSize={20} fontWeight={700} className={match ? "fill-emerald-600 dark:fill-emerald-400" : "fill-red-600 dark:fill-red-400"}>
        {match ? "=" : "≈"}
      </text>
      <rect x={60} y={184} width={180} height={32} rx={10} strokeWidth={1.5} className="fill-emerald-50 stroke-emerald-600 dark:fill-emerald-500/10 dark:stroke-emerald-400" />
      <text x={150} y={205} textAnchor="middle" fontSize={13} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
        {`Σ(x − μ)² = ${f(a.sumSquares)}`}
      </text>
    </svg>
  );

  return (
    <SdIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: "Σx²", value: f(a.sumOfSquaresRaw, 4) },
        { label: "(Σx)² / n", value: `${f(a.sum)}² / ${a.n} = ${f(correction, 4)}` },
        { label: t("shortcutLabel"), value: f(a.sumSquaresShortcut, 4) },
        { label: tl("ss"), value: f(a.sumSquares, 4), emphasize: true, note: match ? t("match") : t("rounding") },
      ]}
    />
  );
}
