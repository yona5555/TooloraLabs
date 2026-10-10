"use client";
import { useTranslations } from "next-intl";
import SdIndicatorCard, { scaleX } from "./SdIndicatorCard";
import { BAND_FILL, bandOf, useSdModel } from "./SdLiveContext";

const W = 320;
const H = 150;
const STRIP_Y = 86;
const STRIP_H = 18;
const PAD = 10;

const ZONE_FILL = [
  "fill-emerald-200 dark:fill-emerald-500/30",
  "fill-amber-200 dark:fill-amber-500/30",
  "fill-orange-200 dark:fill-orange-500/30",
  "fill-red-200 dark:fill-red-500/30",
] as const;

/** Type #19 (Zone Strip): the number line coloured by σ zones (within 1σ, 1–2σ, 2–3σ, beyond 3σ), with every value placed on it. */
export default function SdZoneStrip() {
  const t = useTranslations("tools.standard-deviation-calculator.education.lab.zones");
  const { a, f } = useSdModel();
  if (!a) return null;

  const s = a.populationStdDev || 1;
  const lo = Math.min(a.mean - 3.4 * s, a.min);
  const hi = Math.max(a.mean + 3.4 * s, a.max);
  const sx = scaleX(lo, hi, PAD, W - PAD);
  const edges = [-Infinity, -3, -2, -1, 1, 2, 3, Infinity].map((k) => Math.max(lo, Math.min(hi, a.mean + k * s)));
  const zoneOfSegment = [3, 2, 1, 0, 1, 2, 3];
  const counts = [0, 0, 0, 0];
  a.points.forEach((p) => counts[bandOf(p.z)]++);

  const seen = new Map<number, number>();

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {zoneOfSegment.map((z, i) => {
        const x0 = sx(edges[i]);
        const x1 = sx(edges[i + 1]);
        return x1 - x0 > 0.5 ? <rect key={i} x={x0} y={STRIP_Y} width={x1 - x0} height={STRIP_H} className={ZONE_FILL[z]} /> : null;
      })}
      {a.populationStdDev > 0 &&
        [-3, -2, -1, 0, 1, 2, 3].map((k) => {
          const x = sx(a.mean + k * s);
          return (
            <g key={k}>
              <line x1={x} y1={STRIP_Y - 2} x2={x} y2={STRIP_Y + STRIP_H + 3} className={k === 0 ? "stroke-blue-600 dark:stroke-blue-400" : "stroke-zinc-400 dark:stroke-zinc-500"} strokeWidth={k === 0 ? 2 : 1} />
              <text x={x} y={STRIP_Y + STRIP_H + 15} textAnchor="middle" fontSize={9} className="fill-zinc-500 dark:fill-zinc-400">
                {k === 0 ? "μ" : `${k > 0 ? "+" : "−"}${Math.abs(k)}σ`}
              </text>
              {Math.abs(k) !== 2 && (
                <text x={x} y={STRIP_Y + STRIP_H + 27} textAnchor="middle" fontSize={9} fontFamily="ui-monospace, monospace" className="fill-zinc-600 dark:fill-zinc-300">
                  {f(a.mean + k * s, 2)}
                </text>
              )}
            </g>
          );
        })}
      {a.points.map((p) => {
        const level = seen.get(p.value) ?? 0;
        seen.set(p.value, level + 1);
        return <circle key={p.index} cx={sx(p.value)} cy={STRIP_Y - 8 - Math.min(level, 5) * 11} r={5} className={`${BAND_FILL[bandOf(p.z)]} stroke-white dark:stroke-zinc-900`} strokeWidth={1} />;
      })}
      <text x={W / 2} y={14} textAnchor="middle" fontFamily="ui-monospace, monospace" fontSize={11} fontWeight={600} className="fill-zinc-700 dark:fill-zinc-200">
        {`μ = ${f(a.mean)} · σ = ${f(a.populationStdDev)}`}
      </text>
    </svg>
  );

  return (
    <SdIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("inside1"), value: `${counts[0]}/${a.n}`, note: `|z| ≤ 1 · [${f(a.bands[0].lo)}, ${f(a.bands[0].hi)}]` },
        { label: t("inside2"), value: `${counts[1]}/${a.n}`, note: "1 < |z| ≤ 2" },
        { label: t("inside3"), value: `${counts[2]}/${a.n}`, note: "2 < |z| ≤ 3" },
        { label: t("beyond"), value: `${counts[3]}/${a.n}`, emphasize: true, note: `|z| > 3 · ${f(a.bands[2].lo)} / ${f(a.bands[2].hi)}` },
      ]}
    />
  );
}
