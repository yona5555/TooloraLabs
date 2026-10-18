"use client";
import { useTranslations } from "next-intl";
import { NAME_CHAR_CLASSES } from "@tooloralabs/tools";
import FnIndicatorCard, { FnIndicatorUnavailable } from "./FnIndicatorCard";
import { CLASS_FILL, useFnModel } from "./FnLiveContext";

const W = 340;
const H = 230;
const CX = 95;
const CY = 105;

function ring(r0: number, r1: number, t0: number, t1: number) {
  const span = Math.min(t1 - t0, 0.9999);
  const a0 = t0 * 2 * Math.PI - Math.PI / 2;
  const a1 = (t0 + span) * 2 * Math.PI - Math.PI / 2;
  const lg = span > 0.5 ? 1 : 0;
  const p = (r: number, a: number) => `${(CX + r * Math.cos(a)).toFixed(2)} ${(CY + r * Math.sin(a)).toFixed(2)}`;
  return `M ${p(r1, a0)} A ${r1} ${r1} 0 ${lg} 1 ${p(r1, a1)} L ${p(r0, a1)} A ${r0} ${r0} 0 ${lg} 0 ${p(r0, a0)} Z`;
}

/** Type #6 (Donut): the original name's characters by kind — Latin letters, digits, accented letters, other scripts, spaces, illegal characters, dots and other punctuation. */
export default function FnClassDonut() {
  const t = useTranslations("tools.file-name-sanitizer.education.lab.donut");
  const tc = useTranslations("tools.file-name-sanitizer.education.lab.classes");
  const { a, f, pct } = useFnModel();
  if (!a) return <FnIndicatorUnavailable title={t("title")} />;

  const counts = NAME_CHAR_CLASSES.map((c) => a.classCounts[c]);
  const total = a.chars.length || 1;
  const cum = counts.map((_, i) => [counts.slice(0, i).reduce((s, v) => s + v, 0) / total, counts.slice(0, i + 1).reduce((s, v) => s + v, 0) / total]);

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {NAME_CHAR_CLASSES.map((c, i) => (counts[i] > 0 ? <path key={c} d={ring(52, 88, cum[i][0], cum[i][1])} className={`${CLASS_FILL[c]} stroke-white dark:stroke-zinc-900`} strokeWidth={1.5} /> : null))}
      <text x={CX} y={CY + 6} textAnchor="middle" fontSize={20} fontWeight={700} className="fill-zinc-800 dark:fill-zinc-100">
        {f(a.chars.length, 0)}
      </text>
      {NAME_CHAR_CLASSES.map((c, i) => {
        const y = 16 + i * 27;
        return (
          <g key={c} opacity={counts[i] ? 1 : 0.4}>
            <circle cx={208} cy={y} r={6} className={CLASS_FILL[c]} />
            <text x={220} y={y + 4} fontSize={12} className="fill-zinc-600 dark:fill-zinc-300">
              {tc(c)}
            </text>
            <text x={W - 4} y={y + 4} textAnchor="end" fontSize={12} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {f(counts[i], 0)}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const safe = a.classCounts.ascii + a.classCounts.digit + a.classCounts.dot;
  return (
    <FnIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("safe"), value: `${f(safe, 0)} (${pct(safe, total)})` },
        { label: t("illegal"), value: f(a.classCounts.illegal, 0) },
        { label: t("spaces"), value: f(a.classCounts.space, 0) },
        { label: t("nonAscii"), value: f(a.classCounts.accented + a.classCounts.nonLatin, 0) },
        { label: t("total"), value: f(a.chars.length, 0), emphasize: true },
      ]}
    />
  );
}
