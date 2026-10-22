"use client";
import { useTranslations } from "next-intl";
import type { BarcodeSymbology } from "@tooloralabs/tools";

type TypeRow = { type: string; usedFor: string };
const ORDER: BarcodeSymbology[] = ["upc-a", "ean-13", "code128"];

/** The three symbologies compared — lives in the input column, right under the symbology picker it explains. */
export default function BarcodeTypesReference({ symbology }: { symbology: BarcodeSymbology }) {
  const t = useTranslations("tools.barcode-generator.aboveFold.typesGuide");
  const rows = t.raw("rows") as TypeRow[];

  return (
    <div data-testid="bc-types">
      <h3 className="mb-1 text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{t("title")}</h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("intro")}</p>
      <div className="mt-2 space-y-2">
        {rows.map((row, i) => {
          const on = ORDER[i] === symbology;
          return (
            <div key={row.type} className="rounded-xl border px-3 py-2 text-sm" style={{ borderColor: on ? "var(--ph-focus)" : "var(--ph-line)", background: on ? "var(--ph-accent-soft)" : undefined }}>
              <p dir="ltr" className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
                {row.type}
              </p>
              <p className="mt-0.5 text-xs leading-5 text-zinc-600 dark:text-zinc-300">{row.usedFor}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
