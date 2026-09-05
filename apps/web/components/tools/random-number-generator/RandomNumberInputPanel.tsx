"use client";
import { useTranslations } from "next-intl";
import { Dices } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import { SORT_ORDERS } from "./types";
import type { SortOrder } from "./types";

type Props = {
  min: string;
  onMinChange: (value: string) => void;
  max: string;
  onMaxChange: (value: string) => void;
  count: string;
  onCountChange: (value: string) => void;
  allowDuplicates: boolean;
  onAllowDuplicatesChange: (value: boolean) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (value: SortOrder) => void;
  onGenerate: () => void;
};

export default function RandomNumberInputPanel({
  min,
  onMinChange,
  max,
  onMaxChange,
  count,
  onCountChange,
  allowDuplicates,
  onAllowDuplicatesChange,
  sortOrder,
  onSortOrderChange,
  onGenerate,
}: Props) {
  const t = useTranslations("tools.random-number-generator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <ToolInput label={t("minLabel")} type="text" inputMode="numeric" value={min} onChange={(e) => onMinChange(e.target.value)} />
          <ToolInput label={t("maxLabel")} type="text" inputMode="numeric" value={max} onChange={(e) => onMaxChange(e.target.value)} />
        </div>

        <ToolInput label={t("countLabel")} type="text" inputMode="numeric" value={count} onChange={(e) => onCountChange(e.target.value)} />

        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("duplicatesLabel")}</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onAllowDuplicatesChange(true)}
              className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                allowDuplicates
                  ? "border-blue-400 bg-blue-600 text-white"
                  : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {t("duplicatesAllow")}
            </button>
            <button
              type="button"
              onClick={() => onAllowDuplicatesChange(false)}
              className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
                !allowDuplicates
                  ? "border-blue-400 bg-blue-600 text-white"
                  : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }`}
            >
              {t("duplicatesDisallow")}
            </button>
          </div>
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("sortOrderLabel")}</span>
          <div className="flex flex-wrap gap-1.5">
            {SORT_ORDERS.map((order) => (
              <button
                key={order}
                type="button"
                onClick={() => onSortOrderChange(order)}
                className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
                  sortOrder === order
                    ? "border-blue-400 bg-blue-600 text-white"
                    : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                {t(`sortOrders.${order}`)}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Dices size={18} />
          {t("generate")}
        </button>
      </div>
    </SectionCard>
  );
}
