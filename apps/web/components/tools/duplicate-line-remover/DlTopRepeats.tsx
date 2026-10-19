"use client";
import { useTranslations } from "next-intl";
import DlIndicatorCard, { DlIndicatorUnavailable } from "./DlIndicatorCard";
import { useDlModel } from "./DlLiveContext";

const W = 340;
const LABEL = 150;
const BAR_X = LABEL + 8;
const BAR_W = 140;
const ROW = 28;

/** Type #5 (Ranked Horizontal Bar List): the lines that repeat most, with how many copies were removed from each. */
export default function DlTopRepeats() {
  const t = useTranslations("tools.duplicate-line-remover.education.lab.top");
  const { out, f, pct } = useDlModel();
  if (!out) return <DlIndicatorUnavailable title={t("title")} />;
  if (out.duplicates.length === 0) {
    return (
      <DlIndicatorCard
        title={t("title")}
        intro={t("intro")}
        indicator={<p className="w-[21rem] max-w-full text-center text-sm text-zinc-500 dark:text-zinc-400">{t("none")}</p>}
        rows={[{ label: t("groups"), value: "0", emphasize: true }]}
      />
    );
  }

  const rows = out.duplicates.slice(0, 8);
  const peak = rows[0].count;
  const H = rows.length * ROW + 4;
  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {rows.map((r, i) => {
        const y = i * ROW;
        const w = (r.count / peak) * BAR_W;
        const keptW = w / r.count;
        return (
          <g key={r.line}>
            <text x={LABEL} y={y + 18} textAnchor="end" fontSize={11} fontFamily="ui-monospace, monospace" className="fill-zinc-700 dark:fill-zinc-200">
              {r.line.length > 20 ? `${r.line.slice(0, 19)}…` : r.line}
            </text>
            <rect x={BAR_X} y={y + 6} width={keptW} height={ROW - 12} rx={3} className="fill-emerald-500 dark:fill-emerald-400" />
            <rect x={BAR_X + keptW} y={y + 6} width={w - keptW} height={ROW - 12} rx={3} className="fill-rose-400 dark:fill-rose-500" />
            <text x={BAR_X + w + 5} y={y + 18} fontSize={12} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-700 dark:fill-zinc-200">
              ×{r.count}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const removedTop = rows[0].count - 1;
  return (
    <DlIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("groups"), value: f(out.duplicates.length) },
        { label: t("topLine"), value: rows[0].line.length > 20 ? `${rows[0].line.slice(0, 19)}…` : rows[0].line },
        { label: t("topRemoved"), value: f(removedTop) },
        { label: t("topShare"), value: pct(removedTop, out.removedCount) },
        { label: t("removed"), value: f(out.removedCount), emphasize: true },
      ]}
    />
  );
}
