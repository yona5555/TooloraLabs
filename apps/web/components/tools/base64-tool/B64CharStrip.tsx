"use client";
import { useTranslations } from "next-intl";
import B64IndicatorCard, { B64IndicatorUnavailable } from "./B64IndicatorCard";
import { GROUP_FILL, useB64Model } from "./B64LiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const COLS = 16;
const CELL = W / COLS;
const MAX_ROWS = 6;

/**
 * Type #19 (Zone Strip): the first characters of the Base64 text laid out sixteen to a row, each
 * coloured by the 3-byte group it belongs to and with padding in red, so the 4-character rhythm shows.
 */
export default function B64CharStrip() {
  const t = useTranslations("tools.base64-tool.education.lab.strip");
  const { a, f } = useB64Model();
  if (!a) return <B64IndicatorUnavailable title={t("title")} />;

  const chars = a.groups.flatMap((g, gi) => g.chars.filter(Boolean).map((c) => ({ c, gi }))).slice(0, COLS * MAX_ROWS);
  const rows = Math.ceil(chars.length / COLS);
  const H = rows * (CELL + 4) + 22;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {chars.map(({ c, gi }, i) => {
        const x = (i % COLS) * CELL;
        const y = Math.floor(i / COLS) * (CELL + 4);
        const pad = c === "=";
        return (
          <g key={i}>
            <rect x={x + 1} y={y + 1} width={CELL - 2} height={CELL - 2} rx={4} className={pad ? "fill-rose-500 dark:fill-rose-400" : GROUP_FILL[gi % 2]} opacity={pad ? 1 : 0.9} />
            <text style={{ fontSize: svgPx(14) }} x={x + CELL / 2} y={y + CELL / 2 + 5} textAnchor="middle" fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-white">
              {c}
            </text>
          </g>
        );
      })}
      <text style={{ fontSize: svgPx(12) }} x={0} y={H - 4} className="fill-zinc-500 dark:fill-zinc-400">
        {t("shown", { n: chars.length, total: a.textLength })}
      </text>
    </svg>
  );

  const last = a.groups[a.groups.length - 1];
  return (
    <B64IndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("groups"), value: f(a.groups.length) },
        { label: t("lastGroup"), value: last ? `${last.bytes.length} B → ${last.chars.join("")}` : "—" },
        { label: t("padChars"), value: f(a.padding) },
        { label: t("multipleOf4"), value: a.textLength % 4 === 0 ? t("yes") : t("no") },
        { label: t("perRow"), value: t("perRowValue", { c: COLS, b: (COLS / 4) * 3 }), emphasize: true },
      ]}
    />
  );
}
