"use client";
import { useTranslations } from "next-intl";
import SdIndicatorCard from "./SdIndicatorCard";
import { useSdModel } from "./SdLiveContext";

const W = 300;
const H = 200;
const BASE = 150;
const TOP = 30;
const BAR = 56;

/** Type #12 (Sensitivity Trio): σ if the farthest value were removed · current σ · σ if the closest value were removed (leave-one-out). */
export default function SdSensitivityTrio() {
  const t = useTranslations("tools.standard-deviation-calculator.education.lab.trio");
  const { a, f } = useSdModel();
  if (!a) return null;

  const loo = (i: number) => a.leaveOneOut.find((l) => l.index === i)!.populationStdDev;
  const cur = a.populationStdDev;
  const items = [
    { key: "dropFar", v: a.n > 1 ? loo(a.farthest.index) : cur, sub: `− ${f(a.farthest.value)}`, cls: "fill-emerald-500 dark:fill-emerald-400" },
    { key: "current", v: cur, sub: `n = ${a.n}`, cls: "fill-blue-600 dark:fill-blue-400" },
    { key: "dropNear", v: a.n > 1 ? loo(a.closest.index) : cur, sub: `− ${f(a.closest.value)}`, cls: "fill-amber-500 dark:fill-amber-400" },
  ] as const;
  const maxV = Math.max(...items.map((i) => i.v), 1e-9);
  const change = (v: number) => (cur > 0 ? ((v - cur) / cur) * 100 : 0);

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <line x1={0} y1={BASE} x2={W} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {items.map((it, i) => {
        const cx = (W / 3) * i + W / 6;
        const h = (it.v / maxV) * (BASE - TOP);
        const d = change(it.v);
        return (
          <g key={it.key}>
            <rect x={cx - BAR / 2} y={BASE - h} width={BAR} height={Math.max(1, h)} rx={6} className={it.cls} />
            <text x={cx} y={BASE - h - 16} textAnchor="middle" fontSize={12} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {f(it.v)}
            </text>
            {it.key !== "current" && (
              <text x={cx} y={BASE - h - 4} textAnchor="middle" fontSize={10} fontWeight={600} className={d < 0 ? "fill-emerald-700 dark:fill-emerald-300" : "fill-amber-700 dark:fill-amber-300"}>
                {`${d >= 0 ? "+" : "−"}${f(Math.abs(d), 1)}%`}
              </text>
            )}
            <text x={cx} y={BASE + 16} textAnchor="middle" fontSize={11} fontWeight={600} className="fill-zinc-700 dark:fill-zinc-200">
              {t(it.key)}
            </text>
            <text x={cx} y={BASE + 30} textAnchor="middle" fontSize={10} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
              {it.sub}
            </text>
          </g>
        );
      })}
    </svg>
  );

  return (
    <SdIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("dropFar"), value: `σ = ${f(items[0].v, 4)}`, note: `${f(change(items[0].v), 1)}%` },
        { label: t("current"), value: `σ = ${f(cur, 4)}`, emphasize: true },
        { label: t("dropNear"), value: `σ = ${f(items[2].v, 4)}`, note: `${f(change(items[2].v), 1)}%` },
        { label: t("swing"), value: f(items[2].v - items[0].v, 4) },
      ]}
    />
  );
}
