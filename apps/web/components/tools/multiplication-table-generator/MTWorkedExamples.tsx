"use client";
import { useTranslations } from "next-intl";
import { mtDigitalRoot, mtDistinctProducts, mtFriendlySplit, mtGridSum, mtRowSum, mtUnitsCycle } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { digitChain } from "./MTIndicators";

type Step = { k: string; v: string };
const fmt = (n: number) => new Intl.NumberFormat("en-US").format(n);
const range = (lo: number, hi: number) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

/** Three classic problems, solved with the same functions the indicators use. */
export default function MTWorkedExamples() {
  const t = useTranslations("tools.multiplication-table-generator.examples");

  // 1 — 7 × 8 by breaking 7 apart, checked by casting out nines.
  const [s1, s2] = mtFriendlySplit(7);
  const ex1: Step[] = [
    { k: t("area.s1"), v: `7 = ${s1} + ${s2}` },
    { k: t("area.s2"), v: `${s1} × 8 = ${s1 * 8}` },
    { k: t("area.s3"), v: `${s2} × 8 = ${s2 * 8}` },
    { k: t("area.s4"), v: `${s1 * 8} + ${s2 * 8} = ${7 * 8}` },
    { k: t("area.s5"), v: `${digitChain(56).join(" → ")} ; 7 × 8 → ${mtDigitalRoot(56)}` },
  ];

  // 2 — the 9 times table up to 12: its sum and its units-digit countdown.
  const row = mtRowSum(9, range(1, 12));
  const cyc = mtUnitsCycle(9);
  const ex2: Step[] = [
    { k: t("nines.s1"), v: `1 + 2 + … + 12 = ${row.multiplierSum}` },
    { k: t("nines.s2"), v: `9 × ${row.multiplierSum} = ${fmt(row.sum)}` },
    { k: t("nines.s3"), v: cyc.digits.join(", ") },
    { k: t("nines.s4"), v: `9 × 7 = 63 → 6 + 3 = 9` },
  ];

  // 3 — every cell of the 1–10 grid added up, and how many different values it holds.
  const g = mtGridSum(1, 10);
  const distinct = mtDistinctProducts(1, 10);
  const ex3: Step[] = [
    { k: t("grid.s1"), v: `10 × 10 = 100` },
    { k: t("grid.s2"), v: `1 + … + 10 = ${g.side}` },
    { k: t("grid.s3"), v: `${g.side}² = ${fmt(g.sum)}` },
    { k: t("grid.s4"), v: `${fmt(g.sum)} ÷ 100 = ${g.sum / 100}` },
    { k: t("grid.s5"), v: `${distinct} / 100` },
  ];

  const examples = [
    { key: "area", steps: ex1, answer: "56" },
    { key: "nines", steps: ex2, answer: fmt(row.sum) },
    { key: "grid", steps: ex3, answer: fmt(g.sum) },
  ] as const;

  return (
    <SectionCard id="worked-examples" title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {examples.map((ex) => (
          <article key={ex.key} className="flex flex-col rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{t(`${ex.key}.title`)}</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t(`${ex.key}.scenario`)}</p>
            <ol className="mt-3 flex-1 space-y-1.5 text-sm">
              {ex.steps.map((s, i) => (
                <li key={i} className="flex flex-wrap items-baseline justify-between gap-x-3 border-b border-dashed border-zinc-200 pb-1 dark:border-zinc-700">
                  <span className="text-zinc-600 dark:text-zinc-300">
                    <span className="me-1 font-mono text-xs text-blue-600 dark:text-blue-400">{i + 1}.</span>
                    {s.k}
                  </span>
                  <span dir="ltr" className="ms-auto font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {s.v}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-3 flex items-baseline justify-between rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-500/10">
              <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">{t("answer")}</span>
              <span dir="ltr" className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">
                {ex.answer}
              </span>
            </p>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t(`${ex.key}.takeaway`)}</p>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
