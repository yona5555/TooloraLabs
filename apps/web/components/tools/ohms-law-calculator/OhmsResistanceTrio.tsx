"use client";
import { useLocale, useTranslations } from "next-intl";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";
import { ltr } from "@/components/tool-ui/MixedText";
import OhmsIndicatorCard, { OhmsIndicatorUnavailable } from "./OhmsIndicatorCard";
import { useOhmsModel } from "./OhmsLiveContext";

const W = 340;
const H = 220;
const BASE = 160;
const TOP = 44;
const BAR = 34;
const CLS = ["fill-emerald-500 dark:fill-emerald-400", "fill-blue-600 dark:fill-blue-400", "fill-amber-500 dark:fill-amber-400"];

/**
 * Type #12 (Sensitivity Trio): the same voltage across R/2, your R and 2R. Each group shows the
 * current (solid) and the power (outlined) — halving R doubles both I and P.
 */
export default function OhmsResistanceTrio() {
  const t = useTranslations("tools.ohms-law-calculator.education.lab.trio");
  const rtl = useLocale() === "ar";
  const { a, f } = useOhmsModel();
  if (!a || a.resistance === 0) return <OhmsIndicatorUnavailable title={t("title")} />;

  const items = a.sensitivity;
  const maxI = Math.max(...items.map((i) => Math.abs(i.current)), 1e-30);
  const maxP = Math.max(...items.map((i) => Math.abs(i.power)), 1e-30);
  const names = [t("half"), t("current"), t("double")];

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <line x1={0} y1={BASE} x2={W} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {items.map((it, i) => {
        const cx = (W / 3) * i + W / 6;
        const hI = (Math.abs(it.current) / maxI) * (BASE - TOP);
        const hP = (Math.abs(it.power) / maxP) * (BASE - TOP);
        return (
          <g key={it.factor}>
            <rect x={cx - BAR - 2} y={BASE - hI} width={BAR} height={Math.max(1, hI)} rx={5} className={CLS[i]} />
            <rect x={cx + 2} y={BASE - hP} width={BAR} height={Math.max(1, hP)} rx={5} strokeWidth={2} className="fill-red-500/15 stroke-red-500 dark:fill-red-400/15 dark:stroke-red-400" />
            <text x={cx - BAR / 2 - 2} y={BASE - hI - 6} textAnchor="middle" fontSize={10} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {`${f(it.current, 3)} A`}
            </text>
            <text x={cx + BAR / 2 + 2} y={BASE - hP - 18} textAnchor="middle" fontSize={10} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-red-600 dark:fill-red-400">
              {`${f(it.power, 3)} W`}
            </text>
            <text x={cx} y={BASE + 16} textAnchor="middle" fontSize={11} fontWeight={600} className="fill-zinc-600 dark:fill-zinc-300">
              {names[i]}
            </text>
            <text x={cx} y={BASE + 31} textAnchor="middle" fontSize={10} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
              {`${f(it.resistance)} Ω`}
            </text>
          </g>
        );
      })}
      <text x={rtl ? W - 4 : 4} y={14} direction={rtl ? "rtl" : "ltr"} fontSize={10} className="fill-zinc-500 dark:fill-zinc-400">
        {`${ltr(`V = ${f(a.voltage)} V`)} · ${t("legend")}`}
      </text>
    </svg>
  );

  return (
    <OhmsIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={<PhoneMini slot={1} title={t("title")}>{svg}</PhoneMini>}
      rows={[
        ...items.map((it, i) => ({
          label: names[i],
          value: `${f(a.voltage)} / ${f(it.resistance)} = ${f(it.current)} A · ${f(it.power)} W`,
          emphasize: it.factor === 1,
        })),
        { label: t("ratio"), value: `${f(items[0].current / (items[2].current || 1))} : 1`, note: t("ratioNote") },
      ]}
    />
  );
}
