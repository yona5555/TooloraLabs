import ForexConverter from "@/components/tools/forex-converter/ForexConverter";
import ForexEducation from "@/components/tools/forex-converter/ForexEducation";
import { getForexSnapshot } from "@/lib/forex/exchangerate";
import { getUsdRateTable } from "@/lib/forex/frankfurter";
import type { ToolEntryProps } from "./types";

export default async function ToolEntry({ locale }: ToolEntryProps) {
  // Phone top cards' 1-day change and line: the ECB table /tools already reads (same arguments, same
  // cache entry); a failed fetch only hides them.
  const [snapshot, usdTable] = await Promise.all([getForexSnapshot(), getUsdRateTable(10).catch(() => null)]);
  return (
    <ForexConverter
      initialCurrencies={snapshot?.currencies ?? []}
      lastUpdatedUnix={snapshot?.lastUpdatedUnix ?? null}
      usdTable={usdTable}
      education={<ForexEducation currencies={snapshot?.currencies ?? []} lastUpdatedUnix={snapshot?.lastUpdatedUnix ?? null} locale={locale} />}
    />
  );
}
