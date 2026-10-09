"use client";
import { useTranslations } from "next-intl";
import { batchOverview, type BatchInvoice } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { invoiceFormatters } from "./format";

type Example = { key: "freelance" | "riyadh" | "dubai"; currency: string; invoices: BatchInvoice[] };

/** Three real-world batches, solved with the same functions the calculator uses. */
const EXAMPLES: Example[] = [
  {
    key: "freelance",
    currency: "USD",
    invoices: [
      { id: "a", number: "INV-201", date: "2026-05-04", client: "", taxPercent: 8.5, items: [{ name: "hosting", quantity: 12, unitPrice: 25 }, { name: "domain", quantity: 2, unitPrice: 15 }, { name: "setup", quantity: 1, unitPrice: 120 }] },
    ],
  },
  {
    key: "riyadh",
    currency: "SAR",
    invoices: [{ id: "b", number: "INV-310", date: "2026-06-11", client: "", taxPercent: 15, items: [{ name: "catering", quantity: 40, unitPrice: 55 }, { name: "rental", quantity: 1, unitPrice: 800 }] }],
  },
  {
    key: "dubai",
    currency: "AED",
    invoices: [
      { id: "c", number: "INV-A", date: "2026-07-01", client: "", taxPercent: 5, items: [{ name: "local", quantity: 1, unitPrice: 10000 }] },
      { id: "d", number: "INV-B", date: "2026-07-03", client: "", taxPercent: 0, items: [{ name: "export", quantity: 1, unitPrice: 4000 }] },
    ],
  },
];

export default function InvoiceWorkedExamples() {
  const t = useTranslations("tools.batch-invoice-calculator.examples");

  return (
    <SectionCard id="worked-examples" title={t("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {EXAMPLES.map((ex) => {
          const f = invoiceFormatters("western", ex.currency);
          const o = batchOverview(ex.invoices);
          const steps = [
            ...ex.invoices.flatMap((inv, i) =>
              inv.items.map((it, j) => ({ k: t(`${ex.key}.items.${it.name}`), v: `${f.num(it.quantity)} × ${f.money(it.unitPrice)} = ${f.money(o.perInvoice[i].lineTotals[j])}` }))
            ),
            ...o.perInvoice.map((r) => ({ k: t("stepTax", { n: r.number, rate: f.pct(r.taxPercent, 2) }), v: `${f.money(r.subtotal)} × ${f.pct(r.taxPercent, 2)} = ${f.money(r.tax)}` })),
            ...(ex.invoices.length > 1 ? [{ k: t("stepBlended"), v: `${f.money(o.tax)} ÷ ${f.money(o.net)} = ${f.pct(o.effectiveTaxRate, 3)}` }] : []),
            { k: t("stepTotal"), v: `${f.money(o.net)} + ${f.money(o.tax)}` },
          ];
          return (
            <article key={ex.key} className="flex flex-col rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{t(`${ex.key}.title`)}</h3>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t(`${ex.key}.scenario`)}</p>
              <ol className="mt-3 space-y-1.5 text-sm">
                {steps.map((s, i) => (
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
              {/* Net vs tax of this example, filling the card down to its answer. */}
              <div className="flex flex-1 flex-col justify-center py-3">
                <div dir="ltr" className="flex h-3 overflow-hidden rounded-full">
                  <div className="bg-sky-500" style={{ width: `${(o.net / o.grand) * 100}%` }} />
                  <div className="bg-amber-500" style={{ width: `${(o.tax / o.grand) * 100}%` }} />
                </div>
                <div className="mt-1 flex justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
                  <span>{t("netShare", { pct: f.pct((o.net / o.grand) * 100) })}</span>
                  <span>{t("taxShare", { pct: f.pct((o.tax / o.grand) * 100) })}</span>
                </div>
              </div>
              <p className="flex items-baseline justify-between rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-500/10">
                <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">{t("answer")}</span>
                <span dir="ltr" className="font-mono text-lg font-bold text-blue-700 dark:text-blue-300">{f.money(o.grand)}</span>
              </p>
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t(`${ex.key}.takeaway`)}</p>
            </article>
          );
        })}
      </div>
    </SectionCard>
  );
}
