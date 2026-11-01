"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useTranslations } from "next-intl";
import DlIndicatorCard, { DlIndicatorUnavailable } from "./DlIndicatorCard";
import { useDlModel } from "./DlLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const STEP = 46;
const PILL_W = 230;

/** Type #3 (Hierarchical Flow): from raw lines to the cleaned list — blanks dropped, lines compared, duplicates removed, optionally sorted. */
export default function DlFlow() {
  const t = useTranslations("tools.duplicate-line-remover.education.lab.flow");
  const { draft, a, out, f } = useDlModel();
  if (!a || !out) return <DlIndicatorUnavailable title={t("title")} />;

  const raw = draft.text.split(/\r\n|\r|\n/).length;
  const steps = [
    { label: t("raw"), value: f(raw), cls: "fill-zinc-500 dark:fill-zinc-400" },
    { label: t("nonBlank"), value: f(out.totalLines), cls: "fill-sky-500 dark:fill-sky-400" },
    { label: draft.caseSensitive ? t("compareExact") : t("compareCaseless"), value: f(out.totalLines), cls: "fill-blue-600 dark:fill-blue-400" },
    { label: t("removed"), value: `−${f(out.removedCount)}`, cls: "fill-rose-500 dark:fill-rose-400" },
    { label: draft.sort ? t("sorted") : t("ordered"), value: f(out.uniqueLines), cls: "fill-emerald-600 dark:fill-emerald-400" },
  ];
  const H = steps.length * STEP;
  const x0 = (W - PILL_W) / 2;

  const svg = (
    <FitSvg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {steps.map((s, i) => {
        const y = i * STEP + 4;
        return (
          <g key={i}>
            {i < steps.length - 1 && <path d={`M ${W / 2} ${y + 30} V ${y + STEP} m -5 -7 l 5 7 l 5 -7`} fill="none" strokeWidth={1.5} className="stroke-zinc-400 dark:stroke-zinc-500" />}
            <rect x={x0} y={y} width={PILL_W} height={30} rx={15} className={s.cls} />
            <text style={{ fontSize: svgPx(12) }} x={x0 + 14} y={y + 20} fontWeight={600} className="fill-white">
              {s.label}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={x0 + PILL_W - 14} y={y + 20} textAnchor="end" fontWeight={700} fontFamily="var(--font-mono)" className="fill-white">
              {s.value}
            </text>
          </g>
        );
      })}
    </FitSvg>
  );

  return (
    <DlIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("blank"), value: f(a.blankLines) },
        { label: t("keep"), value: draft.keepOccurrence === "first" ? t("keepFirst") : t("keepLast") },
        { label: t("trim"), value: draft.trimWhitespace ? t("on") : t("off") },
        { label: t("formula"), value: `${f(out.totalLines)} − ${f(out.removedCount)} = ${f(out.uniqueLines)}` },
        { label: t("output"), value: f(out.uniqueLines), emphasize: true },
      ]}
    />
  );
}
