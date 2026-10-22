"use client";
import { useTranslations } from "next-intl";
import { textLogoBlockOf, type TextLogoBlock } from "@tooloralabs/tools";
import TlIndicatorCard from "./TlIndicatorCard";
import { hex, useTlLive } from "./TlLiveContext";
import { STYLE_FILLS } from "./tlMath";

const W = 330;
const LEFT = 64;
const ROW = 18;
const TOP = 26;
const LO = Math.log2(0x20);
const HI = Math.log2(0x1ffff);
const ZONES: { block: TextLogoBlock; from: number; to: number; fill: string }[] = [
  { block: "basicLatin", from: 0x20, to: 0x7f, fill: "fill-zinc-200 dark:fill-zinc-700/60" },
  { block: "letterlike", from: 0x2100, to: 0x214f, fill: "fill-amber-200 dark:fill-amber-500/30" },
  { block: "enclosed", from: 0x2460, to: 0x24ff, fill: "fill-rose-200 dark:fill-rose-500/30" },
  { block: "fullwidth", from: 0xff00, to: 0xffef, fill: "fill-cyan-200 dark:fill-cyan-500/30" },
  { block: "mathAlphanumeric", from: 0x1d400, to: 0x1d7ff, fill: "fill-blue-200 dark:fill-blue-500/30" },
];
const sx = (cp: number) => LEFT + ((Math.log2(Math.max(0x20, cp)) - LO) / (HI - LO)) * (W - LEFT - 6);

/** Zone strip (§31 #19) on a log code-point axis: where each style's characters live in Unicode. */
export default function TlBlockMap() {
  const t = useTranslations("tools.text-logo-generator.live.blockMap");
  const tb = useTranslations("tools.text-logo-generator.live.blocks");
  const { styles, active, activeStyle, setActiveStyle, styleName, f } = useTlLive();
  const H = TOP + styles.length * ROW + 6;
  const counts = new Map<TextLogoBlock, number>();
  for (const g of active.glyphs) {
    const b = textLogoBlockOf(g.styledCodePoint);
    counts.set(b, (counts.get(b) ?? 0) + 1);
  }
  const lowest = Math.min(...active.glyphs.map((g) => g.styledCodePoint));
  const highest = Math.max(...active.glyphs.map((g) => g.styledCodePoint));

  const indicator = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="block max-w-full">
      {ZONES.map((z) => (
        <g key={z.block}>
          <rect x={sx(z.from)} y={TOP - 4} width={Math.max(3, sx(z.to) - sx(z.from))} height={styles.length * ROW} rx={2} className={z.fill} />
          <text x={sx(z.from)} y={TOP - 8} fontSize={7.5} fontFamily="ui-monospace, monospace" className="fill-zinc-500 dark:fill-zinc-400">
            {hex(z.from)}
          </text>
        </g>
      ))}
      {styles.map((s, i) => {
        const y = TOP + i * ROW + ROW / 2 - 4;
        const on = s.style === activeStyle;
        return (
          <g key={s.style} className="cursor-pointer" onClick={() => setActiveStyle(s.style)} opacity={on ? 1 : 0.5} style={{ transition: "opacity 200ms ease" }}>
            <text x={LEFT - 6} y={y + 3} textAnchor="end" fontSize={9} fontWeight={on ? 700 : 500} className="fill-zinc-700 dark:fill-zinc-200">
              {styleName(s.style)}
            </text>
            {s.glyphs.map((g, gi) => (
              <circle
                key={gi}
                cx={sx(g.styledCodePoint)}
                cy={y}
                r={on ? 3.2 : 2.4}
                className={g.exception ? "fill-zinc-900 dark:fill-white" : STYLE_FILLS[i % STYLE_FILLS.length]}
                style={{ transition: "cx 400ms ease" }}
              />
            ))}
          </g>
        );
      })}
    </svg>
  );

  return (
    <TlIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        ...ZONES.filter((z) => counts.has(z.block)).map((z) => ({ label: tb(z.block), value: f(counts.get(z.block) ?? 0) })),
        ...(counts.has("latinSupplement") || counts.has("other") ? [{ label: tb("other"), value: f((counts.get("latinSupplement") ?? 0) + (counts.get("other") ?? 0)) }] : []),
        { label: t("span"), value: `${hex(lowest)} – ${hex(highest)}`, emphasize: true, note: styleName(active.style) },
      ]}
    />
  );
}
