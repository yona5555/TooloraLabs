"use client";
import { useTranslations } from "next-intl";
import DensityIndicatorCard, { DensityIndicatorUnavailable } from "./DensityIndicatorCard";
import { useDensityModel } from "./DensityLiveContext";

const W = 340;
const ROW = 30;
const TOP = 26;
const LABEL = 96;
const BAR_X = LABEL + 8;
const BAR_W = 170;

/**
 * Type #15 (Stacked Segmented Bar): for each of six real liquids, the cube's height split into the
 * part under the surface (ρ / ρ_f) and the part riding above it; a full red bar means it sinks.
 */
export default function DensityFluidDepthBars() {
  const t = useTranslations("tools.density-calculator.education.lab.fluids");
  const tFluids = useTranslations("tools.density-calculator.live3d.fluids");
  const { a, f } = useDensityModel();
  if (!a) return <DensityIndicatorUnavailable title={t("title")} />;

  const H = TOP + a.fluids.length * ROW + 4;
  const floatsIn = a.fluids.filter((fl) => fl.floats);
  const lightest = floatsIn[0];

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <rect x={BAR_X} y={6} width={10} height={10} rx={2} className="fill-sky-500 dark:fill-sky-400" />
      <text x={BAR_X + 14} y={15} fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
        {t("under")}
      </text>
      <rect x={BAR_X + 90} y={6} width={10} height={10} rx={2} className="fill-amber-400 dark:fill-amber-500" />
      <text x={BAR_X + 104} y={15} fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
        {t("above")}
      </text>
      {a.fluids.map((fl, i) => {
        const y = TOP + i * ROW;
        const under = fl.submergedFraction * BAR_W;
        return (
          <g key={fl.key}>
            <text x={LABEL} y={y + 11} textAnchor="end" fontSize={11} fontWeight={600} className="fill-zinc-700 dark:fill-zinc-200">
              {tFluids(fl.key)}
            </text>
            <text x={LABEL} y={y + 23} textAnchor="end" fontSize={9.5} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
              {`${f(fl.density)} g/cm³`}
            </text>
            {fl.floats ? (
              <>
                <rect x={BAR_X} y={y + 4} width={under} height={ROW - 10} className="fill-sky-500 dark:fill-sky-400" />
                <rect x={BAR_X + under} y={y + 4} width={BAR_W - under} height={ROW - 10} className="fill-amber-400 dark:fill-amber-500" />
              </>
            ) : (
              <rect x={BAR_X} y={y + 4} width={BAR_W} height={ROW - 10} className="fill-red-500/80 dark:fill-red-400/80" />
            )}
            <text x={BAR_X + BAR_W + 6} y={y + 18} fontSize={10.5} fontWeight={700} fontFamily={fl.floats ? "ui-monospace, monospace" : undefined} className={fl.floats ? "fill-sky-700 dark:fill-sky-300" : "fill-red-600 dark:fill-red-400"}>
              {fl.floats ? `${f(fl.submergedFraction * 100, 1)} %` : t("sinks")}
            </text>
          </g>
        );
      })}
    </svg>
  );

  return (
    <DensityIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("count"), value: `${floatsIn.length} / ${a.fluids.length}`, emphasize: true },
        ...(lightest ? [{ label: tFluids(lightest.key), value: `${f(a.density)} / ${f(lightest.density)} = ${f(lightest.submergedFraction * 100, 1)} %` }] : []),
        ...a.fluids
          .filter((fl) => (fl.key === "water" || fl.key === "mercury") && fl.key !== lightest?.key)
          .map((fl) => ({ label: tFluids(fl.key), value: fl.floats ? `${f(fl.submergedFraction * 100, 1)} %` : `ρ ≥ ${f(fl.density)}` })),
      ]}
    />
  );
}
