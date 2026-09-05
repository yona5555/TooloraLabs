"use client";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

type Props = {
  name1: string;
  onName1Change: (value: string) => void;
  name2: string;
  onName2Change: (value: string) => void;
  onCalculate: () => void;
};

export default function LoveInputPanel({ name1, onName1Change, name2, onName2Change, onCalculate }: Props) {
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

        <button
          type="button"
          onClick={onCalculate}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-pink-700"
        >
          <Heart size={18} />
          {t("calculateButton")}
        </button>

        <p className="text-xs text-zinc-500 dark:text-zinc-400">{t("disclaimer")}</p>
      </div>
    </SectionCard>
  );
}
