"use client";

import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import HistoryTape from "@/components/tool-ui/HistoryTape";
import { formatResult } from "./formatResult";

export type SciTapeItem = { id: string; expression: string; result: number };

type ScientificHistoryPanelProps = {
  history: SciTapeItem[];
  onSelect: (value: number) => void;
  onDelete: (id: string) => void;
  onClear: () => void;
};

export default function ScientificHistoryPanel({ history, onSelect, onDelete, onClear }: ScientificHistoryPanelProps) {
  const t = useTranslations("tools.scientific-calculator.history");

  return (
    <SectionCard title={t("title")}>
      <HistoryTape
        entries={history.map((h) => ({ id: h.id, label: h.expression, value: h.result, valueText: formatResult(h.result) }))}
        onSelect={(e) => onSelect(e.value)}
        onDelete={onDelete}
        onClear={onClear}
        formatTotal={formatResult}
        emptyText={t("empty")}
        maxHeightClass="max-h-[260px]"
      />
    </SectionCard>
  );
}
