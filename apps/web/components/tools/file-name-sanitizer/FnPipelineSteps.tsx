"use client";
import { useTranslations } from "next-intl";
import FnIndicatorCard, { FnIndicatorUnavailable } from "./FnIndicatorCard";
import { useFnModel } from "./FnLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const ROW = 42;
const LABEL = 96;

/**
 * Type #13 (Stepped Diagram): the name after each stage of the pipeline — trim, transliterate, drop
 * illegal characters, replace whitespace, final clean-up — with its length shrinking step by step.
 */
export default function FnPipelineSteps() {
  const t = useTranslations("tools.file-name-sanitizer.education.lab.pipeline");
  const { a, f } = useFnModel();
  if (!a) return <FnIndicatorUnavailable title={t("title")} />;

  const lens = a.stages.map((s) => [...s.value].length);
  const max = Math.max(...lens, 1);
  const H = a.stages.length * ROW + 4;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {a.stages.map((s, i) => {
        const y = i * ROW;
        const w = Math.max(4, (lens[i] / max) * (W - LABEL - 40));
        const last = i === a.stages.length - 1;
        return (
          <g key={s.key}>
            <text style={{ fontSize: svgPx(12) }} x={LABEL - 6} y={y + 16} textAnchor="end" fontWeight={600} className="fill-zinc-700 dark:fill-zinc-200">
              {t(s.key)}
            </text>
            <rect x={LABEL} y={y + 4} width={w} height={16} rx={4} className={last ? "fill-emerald-500 dark:fill-emerald-400" : "fill-blue-500 dark:fill-blue-400"} />
            <text style={{ fontSize: svgPx(12) }} x={LABEL + w + 5} y={y + 16} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-700 dark:fill-zinc-200">
              {f(lens[i], 0)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={LABEL} y={y + 35} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
              {s.value.length > 40 ? `${s.value.slice(0, 39)}…` : s.value || "∅"}
            </text>
          </g>
        );
      })}
    </svg>
  );

  return (
    <FnIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("input"), value: f(lens[0], 0) },
        { label: t("removed"), value: f(lens[0] - lens[2], 0) },
        { label: t("replaced"), value: f([...a.stages[2].value].filter((c) => /\s/.test(c)).length, 0) },
        { label: t("result"), value: f(lens[lens.length - 1], 0) },
        { label: t("shrink"), value: `−${f(lens[0] - lens[lens.length - 1], 0)}`, emphasize: true },
      ]}
    />
  );
}
