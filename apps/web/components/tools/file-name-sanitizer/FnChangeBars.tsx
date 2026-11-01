"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useTranslations } from "next-intl";
import FnIndicatorCard, { FnIndicatorUnavailable } from "./FnIndicatorCard";
import { useFnModel } from "./FnLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 210;
const BASE = H - 40;
const TOP = 24;

/**
 * Type #1 (Labeled Bar Chart): how many characters each kind of fix touched — accents stripped,
 * illegal characters dropped, whitespace turned into separators, letters lower-cased, and the rest kept.
 */
export default function FnChangeBars() {
  const t = useTranslations("tools.file-name-sanitizer.education.lab.changes");
  const { draft, a, result, f } = useFnModel();
  if (!a) return <FnIndicatorUnavailable title={t("title")} />;

  const raw = draft.fileName.trim();
  const accents = draft.transliterate ? a.classCounts.accented : 0;
  const illegal = a.classCounts.illegal;
  const spaces = [...raw].filter((c) => /\s/.test(c)).length;
  const lowered = draft.lowercase ? [...raw].filter((c) => c !== c.toLowerCase()).length : 0;
  const kept = [...result].filter((c) => raw.includes(c)).length;
  const bars = [
    { key: "accents", v: accents, cls: "fill-violet-500 dark:fill-violet-400" },
    { key: "illegal", v: illegal, cls: "fill-rose-500 dark:fill-rose-400" },
    { key: "spaces", v: spaces, cls: "fill-zinc-400 dark:fill-zinc-500" },
    { key: "lowered", v: lowered, cls: "fill-amber-500 dark:fill-amber-400" },
    { key: "kept", v: kept, cls: "fill-emerald-500 dark:fill-emerald-400" },
  ];
  const peak = Math.max(...bars.map((b) => b.v), 1);
  const slot = W / bars.length;

  const svg = (
    <FitSvg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <line x1={0} y1={BASE} x2={W} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {bars.map((b, i) => {
        const h = Math.max(2, (b.v / peak) * (BASE - TOP));
        const x = i * slot + slot * 0.2;
        const w = slot * 0.6;
        return (
          <g key={b.key}>
            <rect x={x} y={BASE - h} width={w} height={h} rx={4} className={b.cls} />
            <text style={{ fontSize: svgPx(12) }} x={x + w / 2} y={BASE - h - 6} textAnchor="middle" fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-800 dark:fill-zinc-100">
              {f(b.v, 0)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={x + w / 2} y={BASE + 16} textAnchor="middle" className="fill-zinc-600 dark:fill-zinc-300">
              {t(b.key)}
            </text>
          </g>
        );
      })}
    </FitSvg>
  );

  return (
    <FnIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("accents"), value: draft.transliterate ? f(accents, 0) : t("off") },
        { label: t("illegal"), value: f(illegal, 0) },
        { label: t("spaces"), value: `${f(spaces, 0)} → "${draft.separator}"` },
        { label: t("lowered"), value: draft.lowercase ? f(lowered, 0) : t("off") },
        { label: t("touched"), value: f(accents + illegal + spaces + lowered, 0), emphasize: true },
      ]}
    />
  );
}
