"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeftRight } from "lucide-react";
import { parseLocalizedNumber, formatLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { FileSizeConverter, type FileSizeUnit } from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";
import ToolInput from "@/components/tool-ui/ToolInput";
import ToolButton from "@/components/tool-ui/ToolButton";
import CopyButton from "@/components/tool-ui/CopyButton";

const tool = new FileSizeConverter();

const UNITS: FileSizeUnit[] = ["B", "KB", "MB", "GB", "TB", "PB"];

const selectClass =
  "w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100";

export default function FileSizeConverterTool() {
  const t = useTranslations("tools.file-size-converter");
  const [from, setFrom] = useState<FileSizeUnit>("MB");
  const [to, setTo] = useState<FileSizeUnit>("KB");
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [digitStyle, setDigitStyle] = useState<DigitStyle>("western");

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

    const output = tool.execute({ value: parsedValue, from, to }, { locale: "en-US" });
    if (!output.success) {
      setError(t("errors.negativeValue"));
      return;
    }
    setResult(output.data.result);
    setDigitStyle(resolveDigitStyle(value));
  }

  return (
    <div className="space-y-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <label className="block space-y-2">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t("form.from")}
          </span>
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value as FileSizeUnit)}
            className={selectClass}
          >
            {UNITS.map((unit) => (
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
            className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-300 text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <ArrowLeftRight size={16} />
          </button>
        </div>

        <label className="block space-y-2">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t("form.to")}
          </span>
          <select
            value={to}
            onChange={(e) => setTo(e.target.value as FileSizeUnit)}
            className={selectClass}
          >
            {UNITS.map((unit) => (
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
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">{t(`units.${to}`)}</p>
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
