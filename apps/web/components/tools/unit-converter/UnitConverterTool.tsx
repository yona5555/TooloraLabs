"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeftRight } from "lucide-react";
import { parseLocalizedNumber, formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { UnitConverter, type UnitCategory } from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import CopyButton from "@/components/tool-ui/CopyButton";
import { UNIT_CATEGORIES, UNITS_BY_CATEGORY, DEFAULT_UNIT } from "./units";

const tool = new UnitConverter();

const selectClass =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

export default function UnitConverterTool() {
  const t = useTranslations("tools.unit-converter");
  const [category, setCategory] = useState<UnitCategory>("length");
  const [from, setFrom] = useState(DEFAULT_UNIT.length[0]);
  const [to, setTo] = useState(DEFAULT_UNIT.length[1]);
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");

  function handleCategoryChange(nextCategory: UnitCategory) {
    setCategory(nextCategory);
    setFrom(DEFAULT_UNIT[nextCategory][0]);
    setTo(DEFAULT_UNIT[nextCategory][1]);
    setResult(null);
    setError("");
  }

  function swap() {
    setFrom(to);
    setTo(from);
    setResult(null);
  }

  function convert() {
    setError("");
    setResult(null);

    const parsedValue = parseLocalizedNumber(value);
    if (Number.isNaN(parsedValue)) {
      setError(t("errors.required"));
      return;
    }
    if (Math.abs(parsedValue) > 1_000_000_000) {
      setError(t("errors.outOfRange"));
      return;
    }

    const output = tool.execute({ category, from, to, value: parsedValue }, { locale: "en-US" });
    if (!output.success) {
      setError(t("errors.invalidUnit"));
      return;
    }
    setResult(output.data.result);
    setDigitStyle(resolveDigitStyle(value));
  }

  return (
    <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <div className="flex flex-wrap gap-2">
        {UNIT_CATEGORIES.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => handleCategoryChange(item)}
            className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
              category === item
                ? "bg-blue-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }`}
          >
            {t(`categories.${item}`)}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <label className="block space-y-2">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t("form.from")}
          </span>
          <select value={from} onChange={(e) => setFrom(e.target.value)} className={selectClass}>
            {UNITS_BY_CATEGORY[category].map((unit) => (
              <option key={unit} value={unit}>
                {t(`units.${unit}`)}
              </option>
            ))}
          </select>
        </label>

        <div className="flex items-end justify-center pb-3 sm:pb-0 sm:pt-8">
          <button
            type="button"
            onClick={swap}
            aria-label={t("form.swap")}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-zinc-300 text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ArrowLeftRight size={16} />
          </button>
        </div>

        <label className="block space-y-2">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t("form.to")}
          </span>
          <select value={to} onChange={(e) => setTo(e.target.value)} className={selectClass}>
            {UNITS_BY_CATEGORY[category].map((unit) => (
              <option key={unit} value={unit}>
                {t(`units.${unit}`)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ToolInput
        type="text"
        inputMode="decimal"
        placeholder={t("form.valuePlaceholder")}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <ToolButton type="button" onClick={convert}>
        {t("form.convert")}
      </ToolButton>

      {result !== null && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-6 py-5 text-center dark:border-zinc-700 dark:bg-zinc-800">
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatLocalizedNumber(result, digitStyle, { maximumFractionDigits: 6 })}
          </p>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            {t(`units.${to}`)}
          </p>
          <div className="mt-4 flex justify-center">
            <CopyButton
              text={`${formatLocalizedNumber(result, digitStyle, { maximumFractionDigits: 6 })} ${t(`units.${to}`)}`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
