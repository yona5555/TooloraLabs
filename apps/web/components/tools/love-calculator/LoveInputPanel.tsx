"use client";
import { useTranslations } from "next-intl";
import { Heart, RotateCcw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

type Props = {
  name1: string;
  onName1Change: (value: string) => void;
  name2: string;
  onName2Change: (value: string) => void;
  onCalculate: () => void;
  onClear: () => void;
};

export default function LoveInputPanel({ name1, onName1Change, name2, onName2Change, onCalculate, onClear }: Props) {
  const t = useTranslations("tools.love-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="space-y-4">
        <ToolInput
          label={t("name1Label")}
          type="text"
          value={name1}
          onChange={(e) => onName1Change(e.target.value)}
          placeholder={t("name1Placeholder")}
        />
        <ToolInput
          label={t("name2Label")}
          type="text"
          value={name2}
          onChange={(e) => onName2Change(e.target.value)}
          placeholder={t("name2Placeholder")}
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCalculate}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-pink-700"
          >
            <Heart size={18} />
            {t("calculateButton")}
          </button>
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <RotateCcw size={16} />
            {t("clear")}
          </button>
        </div>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("disclaimer")}</p>
      </div>
    </SectionCard>
  );
}
