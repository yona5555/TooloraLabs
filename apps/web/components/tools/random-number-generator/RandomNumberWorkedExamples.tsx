"use client";
import { useTranslations } from "next-intl";
import {
  appearanceProbability,
  chiSquareCritical,
  chiSquareUniform,
  drawsForDuplicateChance,
  duplicateProbability,
  exactCombination,
  expectedDistinct,
  sumDistribution,
  uniformMoments,
} from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { rngFormatters } from "./format";

/** Observed faces from 60 real-looking die rolls used by the fairness example. */
const DIE_COUNTS = [8, 12, 9, 11, 6, 14];

/** Three draws solved step by step with the same functions the generator and its indicators use. */
export default function RandomNumberWorkedExamples() {
  const t = useTranslations("tools.random-number-generator.examples");
  const f = rngFormatters("western");

  const lotto = { n: 49, k: 6 };
  const combos = exactCombination(lotto.n, lotto.k) ?? 0;
  const lottoSum = sumDistribution(1, 49, 6, false);
  const lottoSigma = uniformMoments(1, 49).sd;

  const bday = { n: 365, k: 23 };
  const pRepeat = duplicateProbability(bday.n, bday.k);

  const rolls = DIE_COUNTS.reduce((s, c) => s + c, 0);
  const bins = DIE_COUNTS.map((count, i) => ({ from: i + 1, to: i + 1, count, expected: rolls / 6 }));
  const chi = chiSquareUniform(bins);
  const crit = chiSquareCritical(chi.df, 0.05);

  const examples = [
    {
      key: "lottery",
      steps: [
        { k: t("lottery.s1"), v: `C(49, 6) = 49! ÷ (6! · 43!)` },
        { k: t("lottery.s2"), v: `(49·48·47·46·45·44) ÷ 720 = ${f.int(combos)}` },
        { k: t("lottery.s3"), v: `6 ÷ 49 = ${f.pct(appearanceProbability(49, 6, false), 2)}` },
        { k: t("lottery.s4"), v: `6 × 25 = ${f.int(lottoSum.expected)}` },
        { k: t("lottery.s5"), v: `${f.num(lottoSigma, 2)} × √6 × √(43/48) = ${f.num(lottoSum.sd, 1)}` },
      ],
      answer: `1 : ${f.int(combos)}`,
    },
    {
      key: "birthday",
      steps: [
        { k: t("birthday.s1"), v: `1 − ∏(1 − i/365), i = 1…22` },
        { k: t("birthday.s2"), v: `${f.pct(1 - pRepeat, 2)}` },
        { k: t("birthday.s3"), v: `1 − ${f.pct(1 - pRepeat, 2)} = ${f.pct(pRepeat, 2)}` },
        { k: t("birthday.s4"), v: `365 × (1 − (364/365)^23) = ${f.num(expectedDistinct(365, 23), 2)}` },
        { k: t("birthday.s5"), v: `k = ${f.int(drawsForDuplicateChance(365, 0.5))}` },
      ],
      answer: f.pct(pRepeat, 2),
    },
    {
      key: "dice",
      steps: [
        { k: t("dice.s1"), v: DIE_COUNTS.map((c) => f.int(c)).join(" · ") },
        { k: t("dice.s2"), v: `${f.int(rolls)} ÷ 6 = ${f.int(rolls / 6)}` },
        { k: t("dice.s3"), v: `(4² + 2² + 1² + 1² + 4² + 4²) ÷ 10 = ${f.num(chi.stat, 2)}` },
        { k: t("dice.s4"), v: `df = ${f.int(chi.df)} → ${f.num(crit, 2)}` },
        { k: t("dice.s5"), v: `p = ${f.num(chi.pValue, 3)}` },
      ],
      answer: `${f.num(chi.stat, 2)} < ${f.num(crit, 2)}`,
    },
  ] as const;

  return (
    <SectionCard id="worked-examples" title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {examples.map((ex) => (
          <article key={ex.key} className="flex flex-col rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{t(`${ex.key}.title`)}</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t(`${ex.key}.scenario`)}</p>
            <ol className="mt-3 flex-1 space-y-2 text-sm">
              {ex.steps.map((s, i) => (
                <li key={i} className="border-b border-dashed border-zinc-200 pb-1.5 dark:border-zinc-700">
                  <span className="text-zinc-600 dark:text-zinc-300">
                    <span className="me-1 font-mono text-xs text-blue-600 dark:text-blue-400">{i + 1}.</span>
                    {s.k}
                  </span>
                  <span dir="ltr" className="mt-0.5 block text-end font-mono text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                    {s.v}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-3 flex items-baseline justify-between gap-2 rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-500/10">
              <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">{t("answer")}</span>
              <span dir="ltr" className="font-mono text-base font-bold text-blue-700 dark:text-blue-300">{ex.answer}</span>
            </p>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t(`${ex.key}.takeaway`)}</p>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
