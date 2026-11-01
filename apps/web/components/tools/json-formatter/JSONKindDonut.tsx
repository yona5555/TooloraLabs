"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useTranslations } from "next-intl";
import { JSON_VALUE_KINDS } from "@tooloralabs/tools";
import JSONIndicatorCard, { JSONIndicatorUnavailable } from "./JSONIndicatorCard";
import { KIND_FILL, useJSONModel } from "./JSONLiveContext";
import { ringPath, turns } from "./jsonSvg";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 190;
const CX = 95;
const CY = 95;

/**
 * Type #6 (Multi-Ring Donut): inner ring = containers vs scalar values, outer ring = the six JSON
 * value kinds, every count read from the parsed document.
 */
export default function JSONKindDonut() {
  const t = useTranslations("tools.json-formatter.education.lab.kinds");
  const tk = useTranslations("tools.json-formatter.education.lab.kindNames");
  const { a, f, pct } = useJSONModel();
  if (!a) return <JSONIndicatorUnavailable title={t("title")} />;

  const counts = JSON_VALUE_KINDS.map((k) => a.kinds[k]);
  const outer = turns(counts);
  const containers = a.kinds.object + a.kinds.array;
  const scalars = a.nodes - containers;
  const inner = turns([containers, scalars]);

  const svg = (
    <FitSvg data-preview="visual" data-preview-hero direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {JSON_VALUE_KINDS.map((k, i) =>
        counts[i] > 0 ? <path key={k} d={ringPath(CX, CY, 62, 88, outer[i][0], outer[i][1])} className={`${KIND_FILL[k]} stroke-white dark:stroke-zinc-900`} strokeWidth={1.5} /> : null,
      )}
      {containers > 0 && <path d={ringPath(CX, CY, 34, 58, inner[0][0], inner[0][1])} className="fill-blue-300 stroke-white dark:fill-blue-800 dark:stroke-zinc-900" strokeWidth={1.5} />}
      {scalars > 0 && <path d={ringPath(CX, CY, 34, 58, inner[1][0], inner[1][1])} className="fill-emerald-200 stroke-white dark:fill-emerald-900 dark:stroke-zinc-900" strokeWidth={1.5} />}
      <text style={{ fontSize: svgPx(20) }} x={CX} y={CY - 2} textAnchor="middle" fontWeight={700} className="fill-zinc-800 dark:fill-zinc-100">
        {f(a.nodes)}
      </text>
      <text style={{ fontSize: svgPx(12) }} x={CX} y={CY + 15} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
        {t("values")}
      </text>
      {JSON_VALUE_KINDS.map((k, i) => {
        const y = 22 + i * 26;
        return (
          <g key={k}>
            <circle cx={208} cy={y} r={6} className={KIND_FILL[k]} />
            <text style={{ fontSize: svgPx(12) }} x={220} y={y + 4} className="fill-zinc-600 dark:fill-zinc-300">
              {tk(k)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={W - 4} y={y + 4} textAnchor="end" fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-800 dark:fill-zinc-100">
              {f(counts[i])}
            </text>
          </g>
        );
      })}
    </FitSvg>
  );

  const top = JSON_VALUE_KINDS.reduce((best, k) => (a.kinds[k] > a.kinds[best] ? k : best), JSON_VALUE_KINDS[0]);

  return (
    <JSONIndicatorCard
      mini={0}
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        {
          label: t("containers"),
          value: `${f(containers)} (${pct(containers, a.nodes)})`,
        },
        {
          label: t("scalars"),
          value: `${f(scalars)} (${pct(scalars, a.nodes)})`,
        },
        {
          label: t("perContainer"),
          value: containers ? f((a.nodes - 1) / containers, 2) : "0",
        },
        {
          label: t("most"),
          value: `${tk(top)} · ${pct(a.kinds[top], a.nodes)}`,
        },
        { label: t("total"), value: f(a.nodes), emphasize: true },
      ]}
    />
  );
}
