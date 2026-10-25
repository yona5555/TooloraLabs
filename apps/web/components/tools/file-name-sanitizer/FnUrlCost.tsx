"use client";
import { useTranslations } from "next-intl";
import FnIndicatorCard, { FnIndicatorUnavailable } from "./FnIndicatorCard";
import { useFnModel } from "./FnLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const LABEL = 70;
const BAR_X = LABEL + 8;
const BAR_W = 200;
const ROW = 28;
const enc = new TextEncoder();

/**
 * Type #5 (Ranked Horizontal Bar List): the characters of the original name that cost the most when
 * the name goes into a URL — every byte outside A–Z a–z 0–9 - . _ ~ becomes a three-character %XX escape.
 */
export default function FnUrlCost() {
  const t = useTranslations("tools.file-name-sanitizer.education.lab.url");
  const { draft, a, f } = useFnModel();
  if (!a) return <FnIndicatorUnavailable title={t("title")} />;

  const costs = new Map<string, number>();
  for (const ch of draft.fileName.trim()) {
    const bytes = enc.encode(ch);
    const cost = [...bytes].reduce((s, b) => s + (b < 128 && /[A-Za-z0-9\-._~]/.test(String.fromCharCode(b)) ? 0 : 2), 0);
    if (cost) costs.set(ch, (costs.get(ch) ?? 0) + cost);
  }
  const ranked = [...costs.entries()].sort((x, y) => y[1] - x[1]).slice(0, 8);
  if (ranked.length === 0) {
    return (
      <FnIndicatorCard
        title={t("title")}
        intro={t("intro")}
        indicator={<p className="w-[21rem] max-w-full text-center text-sm text-zinc-500 dark:text-zinc-400">{t("none")}</p>}
        rows={[{ label: t("extra"), value: "0", emphasize: true }]}
      />
    );
  }
  const peak = ranked[0][1];
  const H = ranked.length * ROW + 4;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {ranked.map(([ch, cost], i) => {
        const y = i * ROW;
        const w = Math.max(4, (cost / peak) * BAR_W);
        const esc = [...enc.encode(ch)].map((b) => `%${b.toString(16).toUpperCase().padStart(2, "0")}`).join("");
        return (
          <g key={ch}>
            <text style={{ fontSize: svgPx(14) }} x={LABEL} y={y + 18} textAnchor="end" fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {/\s/.test(ch) ? "␣" : ch}
            </text>
            <rect x={BAR_X} y={y + 6} width={w} height={ROW - 12} rx={3} className={i === 0 ? "fill-rose-500 dark:fill-rose-400" : "fill-rose-300 dark:fill-rose-700"} />
            <text style={{ fontSize: svgPx(12) }} x={BAR_X + w + 5} y={y + 18} fontFamily="ui-monospace, monospace" className="fill-zinc-600 dark:fill-zinc-300">
              +{cost} · {esc.length > 12 ? `${esc.slice(0, 12)}…` : esc}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const total = [...costs.values()].reduce((s, v) => s + v, 0);
  return (
    <FnIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("costly"), value: f(costs.size, 0) },
        { label: t("top"), value: `"${/\s/.test(ranked[0][0]) ? "␣" : ranked[0][0]}" +${ranked[0][1]}` },
        { label: t("originalUrl"), value: f(a.lengths.original.url, 0) },
        { label: t("resultUrl"), value: f(a.lengths.result.url, 0) },
        { label: t("extra"), value: `+${f(total, 0)}`, emphasize: true },
      ]}
    />
  );
}
