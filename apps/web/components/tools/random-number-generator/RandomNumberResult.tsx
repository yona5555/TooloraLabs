"use client";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { chiSquareUniform, histogram, uniformMoments, type RandomNumberGeneratorOutput } from "@tooloralabs/tools";
import CopyButton from "@/components/tool-ui/CopyButton";
import RandomNumberShareExportModal from "./RandomNumberShareExportModal";
import { pc, type RngFormatters } from "./format";

type Props = { result: RandomNumberGeneratorOutput; seed: number; f: RngFormatters };

const MAX_CHIPS = 300;

/**
 * The hero: the drawn numbers pop in one after another (re-keyed on every new seed), and a live
 * histogram of this very draw rises against the uniform expectation line beneath them.
 */
export default function RandomNumberResult({ result, seed, f }: Props) {
  const t = useTranslations("tools.random-number-generator.result");
  const tRoot = useTranslations("tools.random-number-generator");

  const live = useMemo(() => {
    if (result.error) return null;
    const bins = histogram(result.drawn, result.lo, result.hi);
    return { bins, mu: uniformMoments(result.lo, result.hi).mean, chi: chiSquareUniform(bins) };
  }, [result]);

  if (result.error || !live) {
    const messageKey = result.error === "invalid-range" ? "invalidRange" : result.error === "invalid-count" ? "invalidCount" : "rangeTooSmall";
    return (
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
        <div className="rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
          <h2 className="font-bold text-white">{t("heading")}</h2>
        </div>
        <p className="p-6 text-center text-sm leading-6 text-zinc-600 dark:text-zinc-300" data-testid="rng-error">
          {t(messageKey)}
        </p>
      </div>
    );
  }

  const { bins, mu, chi } = live;
  const scale = Math.max(...bins.map((b) => Math.max(b.count, b.expected)), 1) * 1.15;
  const chips = result.numbers.slice(0, MAX_CHIPS);
  const verdict = chi.pValue < 0.01 ? "uneven" : chi.pValue < 0.05 ? "borderline" : "even";
  const verdictTone =
    verdict === "even"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300"
      : verdict === "borderline"
        ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300"
        : "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300";

  return (
    <div className="rounded-2xl border border-blue-200 bg-white shadow-sm dark:border-blue-500/30 dark:bg-zinc-900 dark:shadow-none">
      <style>{"@keyframes rng-pop{0%{opacity:0;transform:translateY(8px) scale(.6)}70%{transform:translateY(-2px) scale(1.08)}100%{opacity:1;transform:none}}@media (prefers-reduced-motion:reduce){.rng-chip{animation:none!important}}"}</style>
      <div className="flex w-full items-center justify-between gap-3 rounded-t-2xl bg-blue-600 px-4 py-2.5 lg:px-6 lg:py-3">
        <h2 className="font-bold text-white">{t("heading")}</h2>
        <div className="flex items-center gap-2">
          <RandomNumberShareExportModal
            operationLabel=""
            inputRows={[]}
            resultRows={[
              { label: t("countLabel"), value: f.int(result.numbers.length) },
              { label: t("sumLabel"), value: f.num(result.sum) },
              { label: t("averageLabel"), value: f.num(result.average) },
              { label: t("seedLabel"), value: String(seed) },
            ]}
            heroLabel={t("heading")}
            heroValue={result.numbers.map(f.int).join(", ")}
            sentence={tRoot("shareExport.summarySentence", { count: result.numbers.length, average: f.num(result.average) })}
          />
          <CopyButton text={result.numbers.join(", ")} className="!text-white dark:!text-white" />
        </div>
      </div>

      <div className="p-4 lg:p-6">
        <div dir="ltr" className="flex max-h-40 flex-wrap justify-center gap-1.5 overflow-y-auto" data-testid="rng-numbers">
          {chips.map((n, i) => (
            <span
              key={`${seed}-${i}-${n}`}
              className="rng-chip inline-flex min-w-[2.5rem] items-center justify-center rounded-lg bg-gradient-to-b from-blue-500 to-blue-700 px-2 py-1.5 font-mono text-base font-bold text-white shadow-sm"
              style={{ animation: `rng-pop 420ms ease-out ${Math.min(i, 24) * 30}ms both` }}
            >
              {f.int(n)}
            </span>
          ))}
        </div>
        {result.numbers.length > MAX_CHIPS && <p className="mt-2 text-center text-xs text-zinc-500">{t("moreHidden", { count: result.numbers.length - MAX_CHIPS })}</p>}

        {/* Live histogram of this draw against the uniform expectation (amber ticks). */}
        <div className="mt-5">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{t("spreadTitle")}</p>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${verdictTone}`} data-testid="rng-verdict">
              {t(`verdict.${verdict}`)}
            </span>
          </div>
          <div dir="ltr" className="mt-2 flex h-24 items-end gap-1" data-testid="rng-hero-hist">
            {bins.map((b) => (
              <div key={b.from} className="relative flex h-full min-w-0 flex-1 flex-col justify-end">
                <span className="mb-0.5 text-center font-mono text-[10px] font-bold text-zinc-700 dark:text-zinc-200">{f.int(b.count)}</span>
                <div className="rounded-t-md bg-blue-600 transition-all duration-500 dark:bg-blue-500" style={{ height: pc((b.count / scale) * 100) }} />
                <div className="absolute inset-x-0 border-t-2 border-dashed border-amber-500" style={{ bottom: pc((b.expected / scale) * 100) }} />
              </div>
            ))}
          </div>
          <div dir="ltr" className="mt-1 flex justify-between font-mono text-[10px] text-zinc-400">
            <span>{f.int(result.lo)}</span>
            <span>{f.int(result.hi)}</span>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">{t("spreadLegend", { expected: f.num(bins[0].expected, 1) })}</p>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-2 border-t border-zinc-100 pt-4 text-sm dark:border-zinc-800">
          {[
            { id: "count", k: t("countLabel"), v: f.int(result.numbers.length) },
            { id: "sum", k: t("sumLabel"), v: f.num(result.sum) },
            { id: "mean", k: t("averageLabel"), v: f.num(result.average) },
            { id: "mu", k: t("expectedLabel"), v: f.num(mu) },
          ].map((row) => (
            <div key={row.k} className="flex items-center justify-between gap-2 rounded-lg bg-zinc-50 px-3 py-1.5 dark:bg-zinc-800/50">
              <dt className="text-xs text-zinc-500 dark:text-zinc-400">{row.k}</dt>
              <dd dir="ltr" className="font-mono text-sm font-semibold text-zinc-900 dark:text-zinc-100" data-testid={`rng-stat-${row.id}`}>
                {row.v}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
