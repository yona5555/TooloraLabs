"use client";
import { useTranslations } from "next-intl";
import ProbabilityIndicatorCard, { REGION_BG } from "./ProbabilityIndicatorCard";
import { REGION_SYMBOLS, useProbabilityModel } from "./ProbabilityLiveContext";

/**
 * Type #15 (Stacked Segmented Bar): the whole sample space (100%) cut into its four disjoint
 * regions; the segments of the calculated event are outlined, so the answer is their total width.
 */
export default function ProbabilityRegionStackedBar() {
  const t = useTranslations("tools.probability-calculator.education.lab.regions");
  const tl = useTranslations("tools.probability-calculator.live3d");
  const { b, r, symbol, target, pct } = useProbabilityModel();
  const parts = [b.pAB, b.aOnly, b.bOnly, b.neither];
  const names = [tl("intersection"), tl("aOnly"), tl("bOnly"), tl("neither")];

  const bar = (
    <div className="w-full lg:w-[320px]">
      <div dir="ltr" className="flex h-14 w-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700">
        {parts.map((p, i) =>
          p > 0 ? (
            <div
              key={i}
              style={{ width: `${p * 100}%` }}
              className={`${REGION_BG[i]} flex items-center justify-center ${target[i] ? "ring-2 ring-inset ring-zinc-900 dark:ring-white" : "opacity-70"}`}
            >
              {p >= 0.09 && <span className="font-mono text-[11px] font-bold text-white drop-shadow">{pct(p, 1)}</span>}
            </div>
          ) : null,
        )}
      </div>
      <div dir="ltr" className="mt-1 flex justify-between font-mono text-[10px] text-zinc-400">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs">
        {parts.map((p, i) => (
          <li key={i} className="flex items-center gap-1.5">
            <span className={`h-3 w-3 shrink-0 rounded-sm ${REGION_BG[i]}`} />
            <span className="text-zinc-600 dark:text-zinc-300">{names[i]}</span>
            <span dir="ltr" className="ms-auto font-mono font-semibold text-zinc-800 dark:text-zinc-100">{pct(p, 1)}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const picked = parts.map((p, i) => (target[i] ? pct(p) : null)).filter(Boolean);

  return (
    <ProbabilityIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={bar}
      rows={[
        ...REGION_SYMBOLS.map((s, i) => ({ label: s, value: pct(parts[i]) })),
        { label: t("total"), value: "100%" },
        {
          label: symbol,
          value: target.filter(Boolean).length > 1 ? `${picked.join(" + ")} = ${pct(r)}` : symbol === "P(A|B)" ? `${pct(b.pAB)} / ${pct(b.pB)} = ${pct(r)}` : pct(r),
          emphasize: true,
        },
      ]}
    />
  );
}
