"use client";
import { useTranslations } from "next-intl";
import ForceIndicatorCard, { ForceIndicatorUnavailable } from "./ForceIndicatorCard";
import { useForceModel } from "./ForceLiveContext";

const W = 320;
const H = 210;
const BASE = 160;
const TOP = 48;
const BAR = 60;
const CLS = ["fill-emerald-500 dark:fill-emerald-400", "fill-blue-600 dark:fill-blue-400", "fill-amber-500 dark:fill-amber-400"];

/** Type #12 (Sensitivity Trio): the same force on half the mass, the current mass and double the mass → a = F / m. */
export default function ForceMassTrio() {
  const t = useTranslations("tools.force-calculator.education.lab.trio");
  const { sl, f } = useForceModel();
  if (!sl) return <ForceIndicatorUnavailable title={t("title")} />;

  const items = sl.massSensitivity;
  const maxA = Math.max(...items.map((i) => Math.abs(i.acceleration)), 1e-30);
  const names = [t("half"), t("current"), t("double")];

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <line x1={0} y1={BASE} x2={W} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {items.map((it, i) => {
        const cx = (W / 3) * i + W / 6;
        const h = (Math.abs(it.acceleration) / maxA) * (BASE - TOP);
        return (
          <g key={it.factor}>
            <rect x={cx - BAR / 2} y={BASE - h} width={BAR} height={Math.max(1, h)} rx={6} className={CLS[i]} />
            <text x={cx} y={BASE - h - 8} textAnchor="middle" fontSize={12} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {f(it.acceleration, 3)}
            </text>
            <text x={cx} y={BASE + 16} textAnchor="middle" fontSize={11} fontWeight={600} className="fill-zinc-600 dark:fill-zinc-300">
              {names[i]}
            </text>
            <text x={cx} y={BASE + 31} textAnchor="middle" fontSize={10} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
              {`${f(it.mass)} kg`}
            </text>
          </g>
        );
      })}
      <text x={4} y={14} fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
        {`a (m/s²) · F = ${f(sl.force)} N`}
      </text>
    </svg>
  );

  return (
    <ForceIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("half"), value: `${f(sl.force)} / ${f(items[0].mass)} = ${f(items[0].acceleration)} m/s²` },
        { label: t("current"), value: `${f(sl.force)} / ${f(items[1].mass)} = ${f(items[1].acceleration)} m/s²`, emphasize: true },
        { label: t("double"), value: `${f(sl.force)} / ${f(items[2].mass)} = ${f(items[2].acceleration)} m/s²` },
        { label: t("ratio"), value: `${f(items[0].acceleration / (items[2].acceleration || 1))} : 1`, note: t("ratioNote") },
      ]}
    />
  );
}
