"use client";
import { useTranslations } from "next-intl";
import SdIndicatorCard from "./SdIndicatorCard";
import { useSdModel } from "./SdLiveContext";

const W = 300;
const H = 210;
const TOP = 18;
const BASE = 170;
const BAR = 22;

const SERIES = [
  { key: "actual", cls: "fill-blue-600 dark:fill-blue-400" },
  { key: "normal", cls: "fill-zinc-400 dark:fill-zinc-500" },
  { key: "chebyshev", cls: "fill-amber-500 dark:fill-amber-400" },
] as const;

/** Type #1 (Labeled Bar Chart): share of the data inside μ ± kσ for k = 1, 2, 3 — yours vs the normal 68-95-99.7 rule vs Chebyshev's guaranteed minimum. */
export default function SdEmpiricalBars() {
  const t = useTranslations("tools.standard-deviation-calculator.education.lab.empirical");
  const tl = useTranslations("tools.standard-deviation-calculator.live3d");
  const { a, pct } = useSdModel();
  if (!a) return null;

  const groupW = W / 3;
  const y = (share: number) => BASE - share * (BASE - TOP);

  const svg = (
    <div className="w-full max-w-[300px]">
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
        <line x1={0} y1={BASE} x2={W} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
        {a.bands.map((b, gi) => {
          const shares = [b.actualShare, b.normalShare, b.chebyshevShare];
          const gx = gi * groupW + (groupW - BAR * 3 - 8) / 2;
          return (
            <g key={b.k}>
              {shares.map((s, si) => {
                const x = gx + si * (BAR + 4);
                return (
                  <g key={si}>
                    <rect x={x} y={y(s)} width={BAR} height={Math.max(1, BASE - y(s))} rx={3} className={SERIES[si].cls} />
                    <text x={x + BAR / 2} y={y(s) - 4} textAnchor="middle" fontSize={9} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
                      {Math.round(s * 100)}
                    </text>
                  </g>
                );
              })}
              <text x={gi * groupW + groupW / 2} y={BASE + 16} textAnchor="middle" fontSize={11} fontWeight={600} className="fill-zinc-700 dark:fill-zinc-200">
                {`±${b.k}σ`}
              </text>
              <text x={gi * groupW + groupW / 2} y={BASE + 30} textAnchor="middle" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
                {`${b.inside}/${a.n}`}
              </text>
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-zinc-600 dark:text-zinc-300">
        {SERIES.map((s) => (
          <span key={s.key} className="inline-flex items-center gap-1">
            <svg width={10} height={10} aria-hidden>
              <rect width={10} height={10} rx={2} className={s.cls} />
            </svg>
            {t(s.key)}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <SdIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        ...a.bands.map((b) => ({ label: tl("band", { k: b.k }), value: `${b.inside}/${a.n} = ${pct(b.actualShare)}`, note: `${t("normal")} ${pct(b.normalShare)} · ${t("chebyshev")} ≥ ${pct(b.chebyshevShare)}` })),
        { label: t("gap"), value: `${pct(a.bands[0].actualShare)} − ${pct(a.bands[0].normalShare)}`, emphasize: true, note: pct(a.bands[0].actualShare - a.bands[0].normalShare) },
      ]}
    />
  );
}
