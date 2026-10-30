"use client";
import { useTranslations } from "next-intl";
import DlIndicatorCard, { DlIndicatorUnavailable } from "./DlIndicatorCard";
import { useDlModel } from "./DlLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const ROW = 46;

/**
 * Type #4 (Icon Comparison Rows): lines that are written differently but become the same once case
 * and surrounding spaces are ignored — the near-duplicates an exact comparison keeps apart.
 */
export default function DlVariants() {
  const t = useTranslations("tools.duplicate-line-remover.education.lab.variants");
  const { draft, a, f } = useDlModel();
  if (!a) return <DlIndicatorUnavailable title={t("title")} />;
  if (a.variantGroups.length === 0) {
    return (
      <DlIndicatorCard
        title={t("title")}
        intro={t("intro")}
        indicator={<p className="w-[21rem] max-w-full text-center text-sm text-zinc-500 dark:text-zinc-400">{t("none")}</p>}
        rows={[{ label: t("groups"), value: "0", emphasize: true }]}
      />
    );
  }

  const groups = a.variantGroups.slice(0, 5);
  const H = groups.length * ROW + 4;
  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {groups.map((g, i) => {
        const y = i * ROW;
        return (
          <g key={g.canonical}>
            <circle cx={12} cy={y + 22} r={10} className="fill-amber-500" />
            <text style={{ fontSize: svgPx(12) }} x={12} y={y + 26} textAnchor="middle" fontWeight={700} className="fill-white">
              {g.variants.length}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={30} y={y + 18} fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-800 dark:fill-zinc-100">
              {g.canonical.length > 34 ? `${g.canonical.slice(0, 33)}…` : g.canonical}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={30} y={y + 35} fontFamily="var(--font-mono)" className="fill-zinc-500 dark:fill-zinc-400">
              {g.variants
                .map((v) => `"${v.replace(/ /g, "·")}"`)
                .join("  ")
                .slice(0, 46)}
            </text>
          </g>
        );
      })}
    </svg>
  );

  return (
    <DlIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("groups"), value: f(a.variantGroups.length) },
        { label: t("spellings"), value: f(a.variantGroups.reduce((s, g) => s + g.variants.length, 0)) },
        { label: t("case"), value: draft.caseSensitive ? t("kept") : t("merged") },
        { label: t("space"), value: draft.trimWhitespace ? t("merged") : t("kept") },
        { label: t("tip"), value: draft.caseSensitive || !draft.trimWhitespace ? t("tipOn") : t("tipDone"), emphasize: true },
      ]}
    />
  );
}
