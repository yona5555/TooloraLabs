import ForexConverter from "@/components/tools/forex-converter/ForexConverter";
import ForexEducation from "@/components/tools/forex-converter/ForexEducation";
import { getForexSnapshot } from "@/lib/forex/exchangerate";
import type { ToolEntryProps } from "./types";

export default async function ToolEntry({ locale }: ToolEntryProps) {
  const snapshot = await getForexSnapshot();
  return (
    <ForexConverter
      initialCurrencies={snapshot?.currencies ?? []}
      lastUpdatedUnix={snapshot?.lastUpdatedUnix ?? null}
      education={<ForexEducation currencies={snapshot?.currencies ?? []} lastUpdatedUnix={snapshot?.lastUpdatedUnix ?? null} locale={locale} />}
    />
  );
}
