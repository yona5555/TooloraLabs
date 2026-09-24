"use client";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import HomeShareExportModal from "./HomeShareExportModal";
import type { CalculatorState } from "./homeCalculatorReducer";

type CalculatorBottomBarProps = {
  state: CalculatorState;
  onSaveHistory: () => void;
  justSaved: boolean;
};

export default function CalculatorBottomBar({ state, onSaveHistory, justSaved }: CalculatorBottomBarProps) {
  const tHome = useTranslations("homeCalculator");

  return (
    <div className="flex items-center justify-between gap-3 border-t border-zinc-200 px-3 py-2.5 dark:border-zinc-800">
      <button
        type="button"
        onClick={onSaveHistory}
        disabled={state.history.length === 0}
        className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 underline-offset-2 transition hover:text-blue-600 hover:underline disabled:opacity-50 disabled:hover:no-underline dark:text-zinc-400 dark:hover:text-blue-400 sm:text-sm"
      >
        {justSaved && <Check size={14} className="text-blue-600 dark:text-blue-400" />}
        {justSaved ? tHome("bottomBar.savedConfirmation") : tHome("bottomBar.saveHistory")}
      </button>
      <HomeShareExportModal history={state.history} currentDisplay={state.display} />
    </div>
  );
}
