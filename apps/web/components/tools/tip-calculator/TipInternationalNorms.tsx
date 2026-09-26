"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

type NormRow = { context: string; norm: string };

/**
 * Rows are grouped by service context (wage structure, whether service is
 * priced into the menu, cultural expectation) rather than by country or
 * region name — the same real-world variation in tipping norms, without
 * naming any country/nationality (site-wide content rule, six-tool
 * architecture pass, 2026-09-26). "TipInternationalNorms" keeps its
 * filename since the underlying idea — norms differ around the world — is
 * unchanged; only the per-row framing moved from geography to context.
 */
export default function TipInternationalNorms() {
  const t = useTranslations("tools.tip-calculator.aboveFold");
  const rows = t.raw("internationalNorms.rows") as NormRow[];

  return (
    <SectionCard title={t("internationalNorms.title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("internationalNorms.intro")}</p>
      <div className="mt-4 space-y-2">
        {rows.map((row) => (
          <div key={row.context} className="rounded-xl border border-zinc-100 px-3 py-2.5 dark:border-zinc-800/60">
            <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">{row.context}</span>
            <span className="mt-0.5 block text-sm text-zinc-600 dark:text-zinc-300">{row.norm}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-zinc-400 dark:text-zinc-500">{t("internationalNorms.disclaimer")}</p>
    </SectionCard>
  );
}
