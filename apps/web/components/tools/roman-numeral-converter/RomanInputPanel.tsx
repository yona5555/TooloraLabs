"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { RomanConversionDirection } from "./types";

type Props = {
  direction: RomanConversionDirection;
  onDirectionChange: (value: RomanConversionDirection) => void;
  arabicValue: string;
  onArabicValueChange: (value: string) => void;
  romanValue: string;
  onRomanValueChange: (value: string) => void;
};

export default function RomanInputPanel({
  direction,
  onDirectionChange,
  arabicValue,
  onArabicValueChange,
  romanValue,
  onRomanValueChange,
}: Props) {
  const t = useTranslations("tools.roman-numeral-converter.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => onDirectionChange("toRoman")}
          className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
            direction === "toRoman"
              ? "border-blue-400 bg-blue-600 text-white"
              : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          {t("toRoman")}
        </button>
        <button
          type="button"
          onClick={() => onDirectionChange("toArabic")}
          className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
            direction === "toArabic"
              ? "border-blue-400 bg-blue-600 text-white"
              : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          }`}
        >
          {t("toArabic")}
        </button>
      </div>

      {direction === "toRoman" ? (
        <ToolInput
          label={t("arabicLabel")}
          type="text"
          inputMode="numeric"
          value={arabicValue}
          onChange={(e) => onArabicValueChange(e.target.value)}
          hint={t("arabicHint")}
        />
      ) : (
        <ToolInput
          label={t("romanLabel")}
          type="text"
          value={romanValue}
          onChange={(e) => onRomanValueChange(e.target.value.toUpperCase())}
          placeholder="MCMXCIV"
          dir="ltr"
        />
      )}
    </SectionCard>
  );
}
