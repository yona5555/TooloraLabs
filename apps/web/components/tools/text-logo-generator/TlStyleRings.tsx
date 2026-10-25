"use client";
import { useTranslations } from "next-intl";
import { useTlLive } from "./TlLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const SIZE = 168;
const C = SIZE / 2;
const STROKE = 7;
const GAP = 3;
export const STYLE_STROKES = [
  "stroke-blue-600 dark:stroke-blue-400",
  "stroke-violet-500 dark:stroke-violet-400",
  "stroke-fuchsia-500 dark:stroke-fuchsia-400",
  "stroke-emerald-500 dark:stroke-emerald-400",
  "stroke-amber-500 dark:stroke-amber-400",
  "stroke-cyan-500 dark:stroke-cyan-400",
  "stroke-rose-500 dark:stroke-rose-400",
];

/** Multi-ring donut (§31 #6): one ring per style, filled by the share of characters that style restyled. Click a ring to select the style. */
export default function TlStyleRings() {
  const t = useTranslations("tools.text-logo-generator.live.rings");
  const { styles, activeStyle, setActiveStyle, active, pct, styleName } = useTlLive();

  return (
    <div data-preview="visual" className="flex w-full flex-col items-center gap-2">
      <svg direction="ltr" width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={t("aria")} className="block h-auto w-full max-w-[300px]">
        {styles.map((s, i) => {
          const r = C - STROKE / 2 - 2 - i * (STROKE + GAP);
          const len = 2 * Math.PI * r;
          const share = s.characters ? s.mapped / s.characters : 0;
          const on = s.style === activeStyle;
          return (
            <g key={s.style} className="cursor-pointer" onClick={() => setActiveStyle(s.style)} opacity={on ? 1 : 0.45} style={{ transition: "opacity 200ms ease" }}>
              <title>{`${styleName(s.style)} · ${pct(share)}`}</title>
              <circle cx={C} cy={C} r={r} fill="none" strokeWidth={STROKE} className="stroke-zinc-200 dark:stroke-zinc-700" />
              <circle
                cx={C}
                cy={C}
                r={r}
                fill="none"
                strokeWidth={STROKE}
                strokeLinecap="round"
                strokeDasharray={`${len * share} ${len}`}
                transform={`rotate(-90 ${C} ${C})`}
                className={STYLE_STROKES[i % STYLE_STROKES.length]}
                style={{ transition: "stroke-dasharray 400ms ease" }}
              />
            </g>
          );
        })}
        <text style={{ fontSize: svgPx(15) }} x={C} y={C + 2} textAnchor="middle" fontWeight={700} className="fill-zinc-900 dark:fill-zinc-50">
          {pct(active.characters ? active.mapped / active.characters : 0)}
        </text>
        <text style={{ fontSize: svgPx(12) }} x={C} y={C + 15} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
          {t("center")}
        </text>
      </svg>
      <p className="text-center text-[11px] text-zinc-500 dark:text-zinc-400">{t("caption", { style: styleName(activeStyle) })}</p>
    </div>
  );
}
