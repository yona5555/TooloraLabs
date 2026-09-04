"use client";
import { useTranslations } from "next-intl";
import type { FormEvent } from "react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolButton from "@/components/tool-ui/ToolButton";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { GraphDraft } from "./types";

type Props = {
  draft: GraphDraft;
  onChange: (draft: GraphDraft) => void;
  onCalculate: (e: FormEvent<HTMLFormElement>) => void;
  onClear: () => void;
};

const PRESETS: Array<{ key: string; expression: string; xMin: string; xMax: string }> = [
  { key: "parabola", expression: "x^2", xMin: "-10", xMax: "10" },
  { key: "sine", expression: "sin(x)", xMin: "-6.28", xMax: "6.28" },
  { key: "sqrt", expression: "sqrt(x)", xMin: "0", xMax: "20" },
  { key: "reciprocal", expression: "1 / x", xMin: "-10", xMax: "10" },
];

export default function GraphInputPanel({ draft, onChange, onCalculate, onClear }: Props) {
  const t = useTranslations("tools.graphing-calculator.form");

  function patch(partial: Partial<GraphDraft>) {
    onChange({ ...draft, ...partial });
  }

  return (
    <SectionCard title={t("inputTitle")}>
      <form onSubmit={onCalculate} className="space-y-5">
        <ToolInput
          label={t("expressionLabel")}
          dir="ltr"
          placeholder={t("expressionPlaceholder")}
          value={draft.expression}
          onChange={(e) => patch({ expression: e.target.value })}
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("expressionHint")}</p>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => patch({ expression: preset.expression, xMin: preset.xMin, xMax: preset.xMax })}
              className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {t(`preset.${preset.key}`)}
            </button>
          ))}
        </div>

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

        <div className="flex flex-wrap gap-4">
          <ToolButton type="submit">{t("calculate")}</ToolButton>
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t("clear")}
          </button>
        </div>
      </form>
    </SectionCard>
  );
}
