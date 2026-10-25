"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { ltr } from "@/components/tool-ui/MixedText";
import { IndicatorCard, KitControls, KitTable, KitTrack, useMeasuredSize, useStepper, type KitRow } from "@/components/tool-ui/indicator-kit/CardKit";
import { ViewportScene } from "@/components/tool-ui/three/ViewportScene";
import { TYPE_COLOR } from "./sgMath";
import { PER_ROW, RIBBON_WORDS } from "./sgWords";
import { svgPx } from "@/components/tool-ui/svgPx";
import { labelW } from "@/components/tool-ui/labelLayout";

/** 6. (3D) The stored paragraph's real words in reading order; the words the tool flags stand tall. */
const RibbonScene3D = dynamic(() => import("./SGScene3D"), { ssr: false, loading: () => null });

/** 2D twin (no WebGL, off screen, or no free slot): the same rows of words seen from above. */
function Ribbon2D({ n }: { n: number }) {
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 520, h: 260 });
  const rows = Math.ceil(RIBBON_WORDS.length / PER_ROW);
  const cw = (W - 24) / PER_ROW;
  const rh = (H - 16) / rows;
  const wide = cw >= 44;
  const short = (word: string) => (word.length > 8 ? `${word.slice(0, 7)}…` : word);
  // a word in the first or last column stays whole inside the drawing
  // (measured as 13.5px text: the flagged words are drawn extra bold, wider than the 12px estimate)
  const inside = (cx: number, word: string) => Math.max(labelW(short(word), 13.5) / 2 + 2, Math.min(W - labelW(short(word), 13.5) / 2 - 2, cx));
  return (
    <div ref={box} className="relative min-h-[260px] w-full flex-1">
      <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={String(n)}>
        {RIBBON_WORDS.slice(0, n).map((w, i) => {
          const cx = 12 + cw * ((i % PER_ROW) + 0.5);
          const cy = 8 + rh * (Math.floor(i / PER_ROW) + 0.5);
          return (
            <g key={i}>
              <circle cx={cx} cy={cy - 8} r={w.type ? 9 : 4} style={{ fill: w.type ? TYPE_COLOR[w.type] : "var(--ph-ink-muted)" }} />
              {/* Narrow boxes label only the flagged words, alternating above/below so neighbours never touch (§39). */}
              {(wide || w.type) && (
                <text x={inside(cx, w.w)} y={wide ? cy + 14 : i % 2 ? cy + 24 : cy - 22} fontWeight={w.type ? 800 : 500} textAnchor="middle" style={{ fontSize: svgPx(12), fill: w.type ? "var(--ph-ink)" : "var(--ph-ink-muted)" }}>
                  {short(w.w)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export function SGRibbonCard({ side }: { side: "visual-left" | "table-left" }) {
  const t = useTranslations("tools.spelling-grammar-checker.visuals.ribbon");
  const tc = useTranslations("toolPage.indicatorKit");
  const s = useStepper(22, { min: 1, max: RIBBON_WORDS.length, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const words = RIBBON_WORDS.slice(0, s.value);
  const flagged = words.filter((w) => w.type).length;
  const last = words[words.length - 1];
  const valueText = t("valueText", { n: s.value, f: flagged });
  const rows: KitRow[] = [
    { key: "n", label: t("rowWords"), value: `${s.value} / ${RIBBON_WORDS.length}` },
    { key: "flagged", label: t("rowFlagged"), value: String(flagged), isKey: true },
    { key: "clean", label: t("rowClean"), value: String(s.value - flagged) },
    { key: "share", label: t("rowShare"), value: `${Math.round((flagged / s.value) * 100)} %` },
    { key: "last", label: t("rowLast"), value: last.w },
  ];
  return (
    <IndicatorCard
      idPrefix="sg"
      n={6}
      side={side}
      kind="3d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { n: ltr(String(s.value)), f: ltr(String(flagged)) })}
      controls={
        <>
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="sg-c6-handle" ticks={[1, 22, RIBBON_WORDS.length].map((v) => ({ at: v, text: String(v) }))} />
          <KitControls s={s} valueText={t("valueShort", { n: s.value })} testId="sg-c6" />
        </>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={<ViewportScene testId="sg-c6" className="min-h-[260px] flex-1" fallback={<Ribbon2D n={s.value} />} render3d={() => <RibbonScene3D n={s.value} hover={hover} />} />}
    />
  );
}
