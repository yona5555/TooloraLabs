"use client";
import { useTranslations } from "next-intl";
import { speedSensitivity } from "@tooloralabs/tools";
import PmIndicatorCard from "./PmIndicatorCard";
import { usePmModel } from "./PmLiveContext";

const BAR_MAX = 120;

/**
 * Type #12 (Sensitivity Trio): range at v₀ − 10 %, the current v₀ and v₀ + 10 %, at the live
 * angle, height and gravity. On level ground range grows with v², so ±10 % in speed moves the
 * range by about −19 % / +21 %.
 */
export default function PmSpeedSensitivity() {
  const t = useTranslations("tools.projectile-motion-calculator.education.lab.sensitivity");
  const { a, f, pct } = usePmModel();
  if (!a) return null;

  const trio = speedSensitivity(a, 0.1);
  const top = Math.max(...trio.map((p) => p.range), 1e-9);
  const tone = [
    { box: "border-amber-300 dark:border-amber-500/50", bar: "bg-amber-500 dark:bg-amber-400", text: "text-amber-700 dark:text-amber-300" },
    { box: "border-blue-400 bg-blue-50 dark:border-blue-500/60 dark:bg-blue-500/10", bar: "bg-blue-600 dark:bg-blue-400", text: "text-blue-700 dark:text-blue-300" },
    { box: "border-emerald-300 dark:border-emerald-500/50", bar: "bg-emerald-500 dark:bg-emerald-400", text: "text-emerald-700 dark:text-emerald-300" },
  ];
  const names = [t("low"), t("current"), t("high")];

  const indicator = (
    <div className="grid w-[380px] max-w-full grid-cols-3 gap-2">
      {trio.map((p, i) => (
        <div key={i} className={`flex flex-col items-center rounded-xl border p-2 ${tone[i].box}`}>
          <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{names[i]}</span>
          <span dir="ltr" className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{`${f(p.speed, 1)} m/s`}</span>
          <div className="mt-2 flex w-10 items-end rounded-md bg-zinc-100 dark:bg-zinc-800" style={{ height: BAR_MAX }}>
            <div className={`w-full rounded-md ${tone[i].bar}`} style={{ height: `${Math.max(2, (p.range / top) * 100)}%` }} />
          </div>
          <span dir="ltr" className="mt-2 font-mono text-sm font-bold text-zinc-800 dark:text-zinc-100">{`${f(p.range, 1)} m`}</span>
          <span dir="ltr" className={`font-mono text-xs font-semibold ${tone[i].text}`}>{i === 1 ? pct(0) : `${p.change >= 0 ? "+" : "−"}${pct(Math.abs(p.change))}`}</span>
        </div>
      ))}
    </div>
  );

  return (
    <PmIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("low"), value: `R(${f(trio[0].speed, 1)}) = ${f(trio[0].range)} m` },
        { label: t("current"), value: `R(${f(trio[1].speed, 1)}) = ${f(trio[1].range)} m` },
        { label: t("high"), value: `R(${f(trio[2].speed, 1)}) = ${f(trio[2].range)} m` },
        { label: t("squared"), value: `0.9² = 0.81 · 1.1² = 1.21` },
        { label: t("swing"), value: `${f(trio[2].range - trio[0].range)} m`, emphasize: true, note: t("swingNote") },
      ]}
    />
  );
}
