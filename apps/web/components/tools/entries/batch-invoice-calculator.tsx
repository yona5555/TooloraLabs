import BatchInvoiceCalculator from "@/components/tools/batch-invoice-calculator/BatchInvoiceCalculator";
import BatchInvoiceEducation from "@/components/tools/batch-invoice-calculator/BatchInvoiceEducation";
import { getUsdRateTable } from "@/lib/forex/frankfurter";

export default async function ToolEntry() {
  // Latest ECB reference fixing (the forex-converter's keyless source) for the grand total in other currencies.
  const fx = await getUsdRateTable(10)
    .then((table) => {
      const i = table.dates.length - 1;
      if (i < 0) return null;
      const perUsd = Object.fromEntries(Object.entries(table.rates).map(([c, v]) => [c, v[i]]).filter(([, v]) => Number.isFinite(v)));
      return { date: table.dates[i], perUsd: perUsd as Record<string, number> };
    })
    .catch(() => null);
  return <BatchInvoiceCalculator fx={fx} education={<BatchInvoiceEducation />} />;
}
