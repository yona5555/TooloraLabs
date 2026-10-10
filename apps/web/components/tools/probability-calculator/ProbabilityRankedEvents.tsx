"use client";
import { useTranslations } from "next-intl";
import ProbabilityIndicatorCard from "./ProbabilityIndicatorCard";
import { useProbabilityModel } from "./ProbabilityLiveContext";

/**
 * Type #5 (Ranked Horizontal Bar List): every event the joint model defines, sorted from most to
 * least likely, the calculated one highlighted — the ranking always respects
 * P(A∩B) ≤ min(P(A), P(B)) ≤ max(P(A), P(B)) ≤ P(A∪B).
 */
export default function ProbabilityRankedEvents() {
  const t = useTranslations("tools.probability-calculator.education.lab.ranked");
  const tl = useTranslations("tools.probability-calculator.live3d");
  const { b, r, symbol, pct } = useProbabilityModel();

  const items = [
    { sym: "P(A∪B)", name: tl("union"), v: b.union },
    { sym: "P(A)", name: "A", v: b.pA },
    { sym: "P(B)", name: "B", v: b.pB },
    { sym: "P(A∩B)", name: tl("intersection"), v: b.pAB },
    { sym: "P(A|B)", name: "A | B", v: Number.isFinite(b.aGivenB) ? b.aGivenB : 0 },
    { sym: "P(B|A)", name: "B | A", v: Number.isFinite(b.bGivenA) ? b.bGivenA : 0 },
    { sym: "P(A′∩B′)", name: tl("neither"), v: b.neither },
    { sym: tl("exactlyOne"), name: "", v: b.exactlyOne },
  ].sort((x, y) => y.v - x.v);

  const list = (
    <ul className="w-full space-y-1.5 lg:w-[320px]">
      {items.map((it) => {
        const hit = it.sym === symbol;
        return (
          <li key={it.sym} className="flex items-center gap-2">
            <span dir="ltr" className={`w-[86px] shrink-0 truncate font-mono text-[11px] font-semibold ${hit ? "text-blue-700 dark:text-blue-300" : "text-zinc-600 dark:text-zinc-300"}`}>{it.sym}</span>
            <div className="h-4 flex-1 overflow-hidden rounded bg-zinc-100 dark:bg-zinc-800">
              <div style={{ width: `${Math.max(0.5, it.v * 100)}%` }} className={`h-full rounded ${hit ? "bg-blue-600 dark:bg-blue-400" : "bg-blue-300 dark:bg-blue-500/50"}`} />
            </div>
            <span dir="ltr" className="w-[54px] shrink-0 text-end font-mono text-[11px] font-bold text-zinc-800 dark:text-zinc-100">{pct(it.v, 1)}</span>
          </li>
        );
      })}
    </ul>
  );

  const ordered = b.pAB <= Math.min(b.pA, b.pB) + 1e-12 && Math.max(b.pA, b.pB) <= b.union + 1e-12;
  return (
    <ProbabilityIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={list}
      rows={[
        { label: t("highest"), value: `${items[0].sym} = ${pct(items[0].v)}` },
        { label: t("lowest"), value: `${items[items.length - 1].sym} = ${pct(items[items.length - 1].v)}` },
        { label: t("spread"), value: pct(items[0].v - items[items.length - 1].v) },
        { label: t("chain"), value: `${pct(b.pAB, 1)} ≤ ${pct(Math.min(b.pA, b.pB), 1)} ≤ ${pct(Math.max(b.pA, b.pB), 1)} ≤ ${pct(b.union, 1)}` },
        { label: t("check"), value: ordered ? "✓" : "✗" },
        { label: symbol, value: pct(r), emphasize: true },
      ]}
    />
  );
}
