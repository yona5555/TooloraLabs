"use client";
import { useTranslations } from "next-intl";
import DlIndicatorCard, { DlIndicatorUnavailable } from "./DlIndicatorCard";
import { useDlModel } from "./DlLiveContext";

const W = 340;
const BAR_Y = 26;
const BAR_H = 32;

/** Type #15 (Stacked Segmented Bar): the input's UTF-8 bytes split into what stays in the cleaned list and what was removed (duplicates, blank lines, stray spaces). */
export default function DlBytesBar() {
  const t = useTranslations("tools.duplicate-line-remover.education.lab.bytes");
  const { a, f, pct } = useDlModel();
  if (!a || a.bytes.input === 0) return <DlIndicatorUnavailable title={t("title")} />;

  const b = a.bytes;
  const parts = [
    { key: "kept", v: b.output, cls: "fill-emerald-500 dark:fill-emerald-400" },
    { key: "removed", v: Math.max(0, b.removed), cls: "fill-rose-400 dark:fill-rose-500" },
  ];
  const H = BAR_Y + BAR_H + 18 + parts.length * 24;
  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <text x={0} y={14} fontSize={12} className="fill-zinc-500 dark:fill-zinc-400">
        {t("axis", { n: f(b.input) })}
      </text>
      {parts.map((p, i) => {
        const x = i === 0 ? 0 : (parts[0].v / b.input) * W;
        const w = (p.v / b.input) * W;
        return (
          <g key={p.key}>
            <rect x={x} y={BAR_Y} width={Math.max(1, w - 1.5)} height={BAR_H} rx={4} className={p.cls} />
            {w > 40 && (
              <text x={x + w / 2} y={BAR_Y + BAR_H / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={700} className="fill-white">
                {pct(p.v, b.input)}
              </text>
            )}
          </g>
        );
      })}
      {parts.map((p, i) => {
        const y = BAR_Y + BAR_H + 30 + i * 24;
        return (
          <g key={p.key}>
            <circle cx={6} cy={y - 4} r={6} className={p.cls} />
            <text x={20} y={y} fontSize={12} className="fill-zinc-600 dark:fill-zinc-300">
              {t(p.key)}
            </text>
            <text x={W} y={y} textAnchor="end" fontSize={12} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {f(p.v)} B
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
        { label: t("input"), value: `${f(b.input)} B` },
        { label: t("output"), value: `${f(b.output)} B` },
        { label: t("blank"), value: f(a.blankLines) },
        { label: t("perLine"), value: `${f(b.output / Math.max(1, a.lines.filter((l) => l.kept).length), 1)} B` },
        { label: t("saved"), value: pct(Math.max(0, b.removed), b.input), emphasize: true },
      ]}
    />
  );
}
