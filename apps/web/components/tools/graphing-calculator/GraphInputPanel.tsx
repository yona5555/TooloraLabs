"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { GraphDraft } from "./types";

type Props = {
  draft: GraphDraft;
  onChange: (draft: GraphDraft) => void;
};

export default function GraphInputPanel({ draft, onChange }: Props) {
  const t = useTranslations("tools.graphing-calculator.form");

  function patch(partial: Partial<GraphDraft>) {
    onChange({ ...draft, ...partial });
  }

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="space-y-5">
        <ToolInput
          label={t("expressionLabel")}
          dir="ltr"
          placeholder={t("expressionPlaceholder")}
          value={draft.expression}
          onChange={(e) => patch({ expression: e.target.value })}
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("expressionHint")}</p>
        <div className="grid grid-cols-2 gap-3">
          <ToolInput
            label={t("xMinLabel")}
            type="text"
            inputMode="decimal"
            value={draft.xMin}
            onChange={(e) => patch({ xMin: e.target.value })}
          />
          <ToolInput
            label={t("xMaxLabel")}
            type="text"
            inputMode="decimal"
            value={draft.xMax}
            onChange={(e) => patch({ xMax: e.target.value })}
          />
        </div>
      </div>
    </SectionCard>
  );
}
