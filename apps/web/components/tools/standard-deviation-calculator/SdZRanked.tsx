"use client";
import { useTranslations } from "next-intl";
import SdIndicatorCard from "./SdIndicatorCard";
import { BAND_FILL, bandOf, useSdModel } from "./SdLiveContext";

const W = 300;
const ROW = 24;
const LABEL_W = 78;
const VALUE_W = 56;
const MAX_ROWS = 10;

/** Type #5 (Ranked Horizontal Bar List): every value ranked by its distance from the mean in σ units (|z|), coloured by σ band. */
export default function SdZRanked() {
  const t = useTranslations("tools.standard-deviation-calculator.education.lab.zRank");
  const tl = useTranslations("tools.standard-deviation-calculator.live3d");
  const { a, f } = useSdModel();
  if (!a) return null;

  const rows = [...a.points].sort((p, q) => Math.abs(q.z) - Math.abs(p.z)).slice(0, MAX_ROWS);
  const maxZ = Math.max(3, ...rows.map((r) => Math.abs(r.z)));
  const barW = W - LABEL_W - VALUE_W;
  const H = rows.length * ROW + 22;
  const sx = (z: number) => LABEL_W + (Math.abs(z) / maxZ) * barW;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {[1, 2, 3].map((k) => (
        <g key={k}>
          <line x1={sx(k)} y1={0} x2={sx(k)} y2={rows.length * ROW} strokeDasharray="3 3" className="stroke-zinc-300 dark:stroke-zinc-600" />
          <text x={sx(k)} y={rows.length * ROW + 14} textAnchor="middle" fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
            {`${k}σ`}
          </text>
        </g>
      ))}
      {rows.map((r, i) => {
        const y = i * ROW;
        return (
          <g key={r.index}>
            <text x={LABEL_W - 6} y={y + 16} textAnchor="end" fontSize={11} fontFamily="ui-monospace, monospace" className="fill-zinc-700 dark:fill-zinc-200">
              {`x = ${f(r.value)}`}
            </text>
            <rect x={LABEL_W} y={y + 5} width={Math.max(2, sx(r.z) - LABEL_W)} height={ROW - 9} rx={4} className={BAND_FILL[bandOf(r.z)]} />
            <text x={W} y={y + 16} textAnchor="end" fontSize={11} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {`${r.z >= 0 ? "+" : "−"}${f(Math.abs(r.z), 2)}`}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const top = rows[0];
  return (
    <SdIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: "μ", value: f(a.mean, 4) },
        { label: "σ", value: f(a.populationStdDev, 4) },
        { label: t("top"), value: `(${f(top.value)} − ${f(a.mean)}) / ${f(a.populationStdDev)}` },
        { label: "z", value: f(top.z, 3), emphasize: true },
        { label: tl("zMin"), value: f(a.zMin, 3) },
        { label: tl("zMax"), value: f(a.zMax, 3) },
      ]}
    />
  );
}
