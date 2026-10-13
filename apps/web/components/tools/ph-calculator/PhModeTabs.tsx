"use client";
import { useTranslations } from "next-intl";
import { PH_OPERATIONS, type PhOperation } from "./types";
import { PhText } from "./PhCardKit";

type PhModeTabsProps = {
  operation: PhOperation;
  onOperationChange: (operation: PhOperation) => void;
};

export default function PhModeTabs({ operation, onOperationChange }: PhModeTabsProps) {
  const t = useTranslations("tools.ph-calculator.form");

  return (
    <div role="tablist" aria-label={t("operationLabel")} className="flex flex-wrap gap-1.5">
      {PH_OPERATIONS.map((value) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={operation === value}
          onClick={() => onOperationChange(value)}
          // Rims use the pH line token so every tab keeps ≥3:1 against the card in light and dark.
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
            operation === value
              ? "border-blue-700 bg-blue-600 text-white dark:border-blue-300"
              : "text-zinc-600 hover:bg-zinc-100 hover:text-blue-600 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-blue-400"
          }`}
          style={operation === value ? undefined : { borderColor: "var(--ph-line)" }}
        >
          <PhText text={t(`operation.${value}`)} />
        </button>
      ))}
    </div>
  );
}
