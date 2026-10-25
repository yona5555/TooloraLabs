"use client";
import { useTranslations } from "next-intl";
import B64IndicatorCard, { B64IndicatorUnavailable } from "./B64IndicatorCard";
import { useB64Model } from "./B64LiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const LABEL = 92;
const BAR_X = LABEL + 8;
const BAR_W = 190;
const ROW = 30;

/**
 * Type #5 (Ranked Horizontal Bar List): the same bytes written as text five ways — raw, Ascii85,
 * Base64, Base32, hexadecimal and URL percent-encoding — ranked by length.
 */
export default function B64EncodingRanking() {
  const t = useTranslations("tools.base64-tool.education.lab.encodings");
  const { a, f, pct } = useB64Model();
  if (!a) return <B64IndicatorUnavailable title={t("title")} />;

  const rows = [
    { key: "raw", v: a.byteCount },
    { key: "ascii85", v: a.encodings.ascii85 },
    { key: "base64", v: a.encodings.base64 },
    { key: "base32", v: a.encodings.base32 },
    { key: "hex", v: a.encodings.hex },
    { key: "percent", v: a.encodings.percent },
  ].sort((x, y) => x.v - y.v);
  const peak = Math.max(...rows.map((r) => r.v));
  const H = rows.length * ROW + 4;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {rows.map((r, i) => {
        const y = i * ROW;
        const w = Math.max(3, (r.v / peak) * BAR_W);
        const me = r.key === "base64";
        return (
          <g key={r.key}>
            <text style={{ fontSize: svgPx(12) }} x={LABEL} y={y + 19} textAnchor="end" fontWeight={me ? 700 : 500} className={me ? "fill-blue-700 dark:fill-blue-300" : "fill-zinc-600 dark:fill-zinc-300"}>
              {t(r.key)}
            </text>
            <rect
              x={BAR_X}
              y={y + 6}
              width={w}
              height={ROW - 12}
              rx={3}
              className={me ? "fill-blue-600 dark:fill-blue-400" : r.key === "raw" ? "fill-zinc-400 dark:fill-zinc-500" : "fill-zinc-300 dark:fill-zinc-600"}
            />
            <text style={{ fontSize: svgPx(12) }} x={BAR_X + w + 5} y={y + 19} fontWeight={me ? 700 : 500} fontFamily="ui-monospace, monospace" className="fill-zinc-700 dark:fill-zinc-200">
              {f(r.v)}
            </text>
          </g>
        );
      })}
    </svg>
  );

  return (
    <B64IndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("hex"), value: `2 × ${f(a.byteCount)} = ${f(a.encodings.hex)}` },
        { label: t("base32"), value: `8 × ⌈${f(a.byteCount)} / 5⌉ = ${f(a.encodings.base32)}` },
        { label: t("ascii85"), value: `5 / 4 → ${f(a.encodings.ascii85)}` },
        { label: t("vsHex"), value: `−${pct(a.encodings.hex - a.encodings.base64, a.encodings.hex)}` },
        { label: t("base64"), value: f(a.encodings.base64), emphasize: true },
      ]}
    />
  );
}
