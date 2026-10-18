"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import B64IndicatorCard, { B64IndicatorUnavailable } from "./B64IndicatorCard";
import { useB64Model } from "./B64LiveContext";

const W = 340;
const H = 210;
const BIT = 13;
const X0 = (W - 24 * BIT) / 2;
const SEXTET_FILL = ["fill-blue-600 dark:fill-blue-400", "fill-emerald-600 dark:fill-emerald-400", "fill-amber-500 dark:fill-amber-400", "fill-rose-500 dark:fill-rose-400"];

/**
 * Interactive piece: drag the slider to any 3-byte group of your data. Its 24 bits are shown as three
 * bytes on top and regrouped below into four 6-bit values, each mapped to its Base64 character.
 */
export default function B64BitExplorer() {
  const t = useTranslations("tools.base64-tool.education.lab.bits");
  const { a, f } = useB64Model();
  const [pick, setPick] = useState(0);
  if (!a || a.groups.length === 0) return <B64IndicatorUnavailable title={t("title")} />;

  const gi = Math.min(pick, a.groups.length - 1);
  const g = a.groups[gi];
  const bits = g.bytes
    .map((b) => b.toString(2).padStart(8, "0"))
    .join("")
    .padEnd(24, "·");

  const svg = (
    <div className="w-[340px] max-w-full">
      <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
        {[0, 1, 2].map((k) => (
          <g key={k}>
            <text x={X0 + k * 8 * BIT + 4 * BIT} y={14} textAnchor="middle" fontSize={12} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-700 dark:fill-zinc-200">
              {g.bytes[k] !== undefined ? `0x${g.bytes[k].toString(16).padStart(2, "0")} = ${g.bytes[k]}` : t("missing")}
            </text>
            <path d={`M ${X0 + k * 8 * BIT + 2} 22 H ${X0 + (k + 1) * 8 * BIT - 2}`} strokeWidth={2} className="stroke-zinc-400 dark:stroke-zinc-500" />
          </g>
        ))}
        {[...bits].map((b, i) => (
          <text
            key={i}
            x={X0 + i * BIT + BIT / 2}
            y={44}
            textAnchor="middle"
            fontSize={13}
            fontWeight={700}
            fontFamily="ui-monospace, monospace"
            className={b === "·" ? "fill-zinc-300 dark:fill-zinc-600" : SEXTET_FILL[Math.floor(i / 6)]}
          >
            {b === "·" ? "0" : b}
          </text>
        ))}
        {[0, 1, 2, 3].map((k) => {
          const cx = X0 + k * 6 * BIT + 3 * BIT;
          const v = g.sextets[k];
          return (
            <g key={k}>
              <path
                d={`M ${X0 + k * 6 * BIT + 2} 54 H ${X0 + (k + 1) * 6 * BIT - 2}`}
                strokeWidth={3}
                className={v === null ? "stroke-zinc-300 dark:stroke-zinc-600" : SEXTET_FILL[k].replace(/fill-/g, "stroke-")}
              />
              <path d={`M ${cx} 58 V 92`} strokeWidth={1.5} className="stroke-zinc-300 dark:stroke-zinc-600" />
              <text x={cx} y={84} textAnchor="middle" fontSize={12} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
                {v === null ? "—" : v}
              </text>
              <circle cx={cx} cy={126} r={26} className={v === null ? "fill-rose-100 dark:fill-rose-900/50" : SEXTET_FILL[k]} />
              <text x={cx} y={135} textAnchor="middle" fontSize={24} fontWeight={700} fontFamily="ui-monospace, monospace" className={v === null ? "fill-rose-500" : "fill-white"}>
                {g.chars[k] || "∅"}
              </text>
            </g>
          );
        })}
        <text x={W / 2} y={184} textAnchor="middle" fontSize={12} className="fill-zinc-500 dark:fill-zinc-400">
          {t("group", { n: gi + 1, total: a.groups.length })}
        </text>
      </svg>
      <input type="range" min={0} max={a.groups.length - 1} value={gi} onChange={(e) => setPick(Number(e.target.value))} aria-label={t("slider")} className="w-full accent-blue-600" />
    </div>
  );

  return (
    <B64IndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("bytesRow"), value: g.bytes.map((b) => b.toString(16).padStart(2, "0")).join(" ") },
        { label: t("sextetsRow"), value: g.sextets.map((s) => (s === null ? "—" : s)).join(", ") },
        { label: t("charsRow"), value: g.chars.join("") },
        { label: t("bitsUsed"), value: `${g.bytes.length * 8} / 24` },
        { label: t("offset"), value: `${f(gi * 3)}–${f(gi * 3 + g.bytes.length - 1)}`, emphasize: true },
      ]}
    />
  );
}
