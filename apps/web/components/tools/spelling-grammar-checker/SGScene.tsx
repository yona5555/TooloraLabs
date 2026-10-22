"use client";
import { useCallback, useRef } from "react";
import { useTranslations } from "next-intl";
import { KitControls, SvgHandle, useMeasuredSize, useSvgDrag, type Stepper } from "@/components/tool-ui/indicator-kit/CardKit";
import { snap } from "@/components/tool-ui/indicator-kit/format";
import type { GrammarIssue } from "./types";
import { ISSUE_TYPES, TYPE_COLOR } from "./sgMath";

/**
 * §44 (2D): the main visual at the top of the Results card — an issue map. The axis is the full
 * source text (character positions); every issue the tool found sits on its type's lane at the
 * place it starts, as wide as the text it covers. The handle sets how many words are checked
 * (it writes the text field); typing in the field moves it.
 */
export default function SGScene({ issues, checkedLen, sourceLen, words, totalWords, onWords }: { issues: GrammarIssue[]; checkedLen: number; sourceLen: number; words: number; totalWords: number; onWords: (v: number) => void }) {
  const t = useTranslations("tools.spelling-grammar-checker.visuals.hero");
  const max = Math.max(1, totalWords);
  const set = useCallback((v: number) => onWords(snap(v, 1, 1, max)), [onWords, max]);
  const s: Stepper = {
    value: words,
    set,
    inc: () => set(words + 1),
    dec: () => set(words - 1),
    reset: () => set(max),
    flash: 0,
    atMin: words <= 1,
    atMax: words >= max,
    isSeed: words === max,
    min: 1,
    max,
    step: 1,
  };
  const [box, { w: W, h: H }] = useMeasuredSize<HTMLDivElement>({ w: 420, h: 260 });
  const X0 = 108;
  const X1 = W - 18;
  const trackY = H - 26;
  const len = Math.max(1, sourceLen);
  const xc = (c: number) => X0 + (c / len) * (X1 - X0);
  const xw = (v: number) => X0 + ((v - 1) / Math.max(1, max - 1)) * (X1 - X0);
  const ref = useRef<SVGSVGElement>(null);
  const drag = useSvgDrag(ref, W, H, (x) => set(1 + ((x - X0) / (X1 - X0)) * (max - 1)));
  const top = 28;
  const laneBot = trackY - 40;
  const laneH = (laneBot - top) / ISSUE_TYPES.length;
  const counts = ISSUE_TYPES.map((ty) => issues.filter((i) => i.type === ty).length);
  const valueText = t("valueText", { w: words, n: issues.length });

  return (
    <div data-ph-scene-block className="flex flex-1 flex-col gap-3">
      <div ref={box} dir="ltr" data-preview="visual" className="relative min-h-[260px] w-full flex-1" data-testid="sg-hero-drawing">
        <svg ref={ref} viewBox={`0 0 ${W} ${H}`} width={W} height={H} className="absolute inset-0 block" role="img" aria-label={valueText}>
          <text x={12} y={16} fontSize={11} fontWeight={700} style={{ fill: "var(--ph-ink-muted)" }}>
            {t("axis", { c: checkedLen, t: sourceLen })}
          </text>
          {/* The part of the source that is not being checked is shaded. */}
          <rect x={xc(checkedLen)} y={top - 4} width={Math.max(0, X1 - xc(checkedLen))} height={laneBot - top + 8} rx={8} style={{ fill: "var(--glass-track)" }} />
          {ISSUE_TYPES.map((ty, li) => {
            const y = top + li * laneH + laneH / 2;
            return (
              <g key={ty}>
                <text x={12} y={y - 2} fontSize={11} fontWeight={700} style={{ fill: TYPE_COLOR[ty] }}>
                  {t(`lane.${ty}`)}
                </text>
                <text x={12} y={y + 12} fontSize={10.5} fontWeight={700} className="tabular-nums" style={{ fill: "var(--ph-ink)" }}>
                  {counts[li]}
                </text>
                <line x1={X0} y1={y} x2={X1} y2={y} style={{ stroke: "var(--ph-grid)" }} strokeWidth={10} strokeLinecap="round" />
                {issues
                  .filter((i) => i.type === ty)
                  .map((i, k) => {
                    const x0 = xc(i.start);
                    const w = Math.max(10, xc(i.end) - x0);
                    return <rect key={k} x={x0} y={y - 7} width={w} height={14} rx={7} style={{ fill: TYPE_COLOR[ty] }} />;
                  })}
              </g>
            );
          })}
          {[0, Math.round(len / 2), len].map((c, i) => (
            <text key={i} x={xc(c)} y={laneBot + 16} fontSize={10} fontWeight={600} textAnchor={i === 0 ? "start" : i === 2 ? "end" : "middle"} className="tabular-nums" style={{ fill: "var(--ph-ink-muted)" }}>
              {c}
            </text>
          ))}
          <line x1={X0} y1={trackY} x2={X1} y2={trackY} style={{ stroke: "var(--glass-track)" }} strokeWidth={10} strokeLinecap="round" />
          <line x1={X0} y1={trackY} x2={xw(words)} y2={trackY} style={{ stroke: "var(--ai-a)" }} strokeWidth={10} strokeLinecap="round" />
          <text x={12} y={trackY + 4} fontSize={10.5} fontWeight={700} style={{ fill: "var(--ph-ink-muted)" }}>
            {t("words")}
          </text>
        </svg>
        <SvgHandle x={xw(words)} y={trackY} viewW={W} viewH={H} direction="horizontal" label={t("handle")} valueText={valueText} s={s} drag={drag} testId="sg-hero-handle" />
      </div>
      <KitControls s={s} valueText={t("valueShort", { w: words, t: max })} testId="sg-hero" />
    </div>
  );
}
