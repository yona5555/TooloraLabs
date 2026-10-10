"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { GraphDraft } from "./types";

type Props = {
  draft: GraphDraft;
  error: "invalidExpression" | "invalidRange" | "noValidPoints" | null;
  onChange: (draft: GraphDraft) => void;
  onClear: () => void;
};

/** Live input: every keystroke re-graphs; while the draft is invalid the last valid graph stays on screen. */
export default function GraphInputPanel({ draft, error, onChange, onClear }: Props) {
  const t = useTranslations("tools.graphing-calculator.form");
  const tr = useTranslations("tools.graphing-calculator.result");

  function patch(partial: Partial<GraphDraft>) {
    onChange({ ...draft, ...partial });
  }

  return (
    <SectionCard title={t("inputTitle")}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
        <ToolInput
          label={t("expressionLabel")}
          dir="ltr"
          placeholder={t("expressionPlaceholder")}
          value={draft.expression}
          onChange={(e) => patch({ expression: e.target.value })}
        />
        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("expressionHint")}</p>

        <div className="grid grid-cols-2 gap-3">
          <ToolInput label={t("xMinLabel")} type="text" inputMode="decimal" value={draft.xMin} onChange={(e) => patch({ xMin: e.target.value })} />
          <ToolInput label={t("xMaxLabel")} type="text" inputMode="decimal" value={draft.xMax} onChange={(e) => patch({ xMax: e.target.value })} />
        </div>

        {error && (
          <p role="alert" className="rounded-lg bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">
            {tr(error)}
          </p>
        )}

        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {t("clear")}
        </button>
      </form>
    </SectionCard>
  );
}
