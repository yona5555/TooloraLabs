"use client";
import { useTranslations } from "next-intl";
import FsIndicatorCard, { FsIndicatorUnavailable } from "./FsIndicatorCard";
import { useFsModel } from "./FsLiveContext";

const W = 340;
const H = 210;
const BASE = H - 36;
const TOP = 22;

/**
 * Type #11 (Side-by-Side Equivalence): the same byte count read in decimal and binary units at the
 * level that suits it best and the levels around it — the binary number is always the smaller one.
 */
export default function FsGapBars() {
  const t = useTranslations("tools.file-size-converter.education.lab.gapBars");
  const { out, a, f } = useFsModel();
  if (!out || !a || a.bytes === 0) return <FsIndicatorUnavailable title={t("title")} />;

  const center = Math.max(1, a.decimalLevel);
  const levels = [center - 1, center, center + 1].filter((k) => k >= 0 && k <= 5);
  const slot = W / levels.length;
  const peak = Math.max(...levels.map((k) => out.decimal[k].value));
  const y = (v: number) => Math.round((BASE - (Math.log10(1 + v) / Math.log10(1 + peak)) * (BASE - TOP)) * 100) / 100;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <line x1={0} y1={BASE} x2={W} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {levels.map((k, i) => {
        const cx = i * slot + slot / 2;
        const d = out.decimal[k];
        const b = out.binary[k];
        return (
          <g key={k}>
            <rect x={cx - 34} y={Math.round(y(d.value) * 100) / 100} width={30} height={Math.max(2, BASE - Math.round(y(d.value) * 100) / 100)} rx={4} className="fill-blue-600 dark:fill-blue-400" />
            <rect
              x={cx + 4}
              y={Math.round(y(b.value) * 100) / 100}
              width={30}
              height={Math.max(2, BASE - Math.round(y(b.value) * 100) / 100)}
              rx={4}
              className="fill-emerald-600 dark:fill-emerald-400"
            />
            <text x={cx - 19} y={y(d.value) - 5} textAnchor="middle" fontSize={10} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-blue-700 dark:fill-blue-300">
              {f(d.value, d.value < 10 ? 2 : 0)}
            </text>
            <text x={cx + 19} y={y(b.value) - 5} textAnchor="middle" fontSize={10} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-emerald-700 dark:fill-emerald-300">
              {f(b.value, b.value < 10 ? 2 : 0)}
            </text>
            <text x={cx} y={BASE + 16} textAnchor="middle" fontSize={12} fontWeight={600} className="fill-zinc-600 dark:fill-zinc-300">
              {d.unit} / {b.unit}
            </text>
          </g>
        );
      })}
      <text x={0} y={12} fontSize={11} className="fill-zinc-500 dark:fill-zinc-400">
        {t("axis")}
      </text>
    </svg>
  );

  const k = a.decimalLevel || 1;
  return (
    <FsIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: out.decimal[k].unit, value: f(out.decimal[k].value, 3) },
        { label: out.binary[k].unit, value: f(out.binary[k].value, 3) },
        { label: t("formula"), value: `${f(out.decimal[k].value, 3)} × (1000/1024)^${k}` },
        { label: t("difference"), value: f(out.decimal[k].value - out.binary[k].value, 3) },
        { label: t("shrink"), value: `−${f(a.displayedShrink || (1 - 1 / Math.pow(1.024, k)) * 100, 2)}%`, emphasize: true },
      ]}
    />
  );
}
