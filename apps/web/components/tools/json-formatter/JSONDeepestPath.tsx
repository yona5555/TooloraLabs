"use client";
import { useTranslations } from "next-intl";
import type { JSONPathStep } from "@tooloralabs/tools";
import JSONIndicatorCard, { JSONIndicatorUnavailable } from "./JSONIndicatorCard";
import { KIND_FILL, useJSONModel } from "./JSONLiveContext";
import { clip } from "./jsonSvg";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const STEP_H = 34;
const MAX_STEPS = 7;
const PILL_W = 132;

/** JSONPath of a step list: $.books[2].tags[0]. */
function pathOf(steps: JSONPathStep[]): string {
  return steps.map((s, i) => (i === 0 ? "$" : s.key.startsWith("[") ? s.key : /^[A-Za-z_$][\w$]*$/.test(s.key) ? `.${s.key}` : `[${JSON.stringify(s.key)}]`)).join("");
}

/**
 * Type #13 (Stepped Diagram): the staircase from the root down to the deepest value, one step per
 * nesting level, each coloured by the kind of value found there.
 */
export default function JSONDeepestPath() {
  const t = useTranslations("tools.json-formatter.education.lab.path");
  const tk = useTranslations("tools.json-formatter.education.lab.kindNames");
  const { a, f } = useJSONModel();
  if (!a) return <JSONIndicatorUnavailable title={t("title")} />;

  const all = a.deepestPath;
  // Long paths keep the first three and last three steps, with one "…" step between them.
  const steps: (JSONPathStep | null)[] = all.length > MAX_STEPS ? [...all.slice(0, 3), null, ...all.slice(-3)] : all;
  const dx = steps.length > 1 ? (W - PILL_W) / (steps.length - 1) : 0;
  const H = steps.length * STEP_H + 6;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {steps.map((s, i) => {
        const x = i * dx;
        const y = i * STEP_H + 3;
        const next = i < steps.length - 1;
        return (
          <g key={i}>
            {next && <path d={`M ${x + 14} ${y + 26} V ${y + STEP_H + 13} H ${x + dx}`} fill="none" strokeWidth={1.5} className="stroke-zinc-300 dark:stroke-zinc-600" />}
            {s ? (
              <>
                <rect x={x} y={y} width={PILL_W} height={26} rx={13} className={KIND_FILL[s.kind]} />
                <text style={{ fontSize: svgPx(12) }} x={x + 12} y={y + 17} fontWeight={700} fontFamily="var(--font-mono)" className="fill-white">
                  {clip(s.key, 11)}
                </text>
                <text style={{ fontSize: svgPx(12) }} x={x + PILL_W - 10} y={y + 17} textAnchor="end" className="fill-white/90">
                  {i === 0 ? 1 : all.indexOf(s) + 1}
                </text>
              </>
            ) : (
              <text style={{ fontSize: svgPx(14) }} x={x + 10} y={y + 18} fontWeight={700} className="fill-zinc-400 dark:fill-zinc-500">
                {t("skipped", { n: all.length - 6 })}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );

  const leaf = all[all.length - 1];
  return (
    <JSONIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("path"), value: clip(pathOf(all), 34) },
        { label: t("steps"), value: f(all.length) },
        { label: t("leafKind"), value: tk(leaf.kind) },
        {
          label: t("containersOnPath"),
          value: f(all.filter((s) => s.kind === "object" || s.kind === "array").length),
        },
        { label: t("depth"), value: f(a.maxDepth), emphasize: true },
      ]}
    />
  );
}
