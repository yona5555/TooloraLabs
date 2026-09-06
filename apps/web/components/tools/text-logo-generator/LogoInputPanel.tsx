"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

type Props = {
  text: string;
  onTextChange: (value: string) => void;
};

export default function LogoInputPanel({ text, onTextChange }: Props) {
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
    </SectionCard>
  );
}
