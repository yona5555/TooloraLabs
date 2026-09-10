"use client";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

type Props = {
  text: string;
  onTextChange: (value: string) => void;
  onClear: () => void;
};

export default function LogoInputPanel({ text, onTextChange, onClear }: Props) {
  const t = useTranslations("tools.text-logo-generator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <ToolInput
        label={t("textLabel")}
        type="text"
        value={text}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={t("textPlaceholder")}
      />
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{t("hint")}</p>

      <button
        type="button"
        onClick={onClear}
        className="mt-5 flex items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <RotateCcw size={16} />
        {t("clear")}
      </button>
    </SectionCard>
  );
}
