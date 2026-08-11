"use client";

import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

type ReferenceItem = { symbol: string; description: string };

export default function FunctionReferenceCard() {
  const t = useTranslations("tools.scientific-calculator.aboveFold");
  const items = t.raw("functionReference.items") as ReferenceItem[];

  return (
    <SectionCard title={t("functionReference.title")}>
      <div dir="ltr" className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
        {items.map((item) => (
          <div key={item.symbol}>
            <p className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">{item.symbol}</p>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">{item.description}</p>
          </div>
        ))}
      </div>
    </SectionCard>
  );
}
