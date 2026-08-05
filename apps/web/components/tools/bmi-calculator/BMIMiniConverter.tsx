"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { UnitConverter, type UnitCategory } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";
import ToolInput from "@/components/tool-ui/ToolInput";
import SectionCard from "@/components/tool-ui/SectionCard";

const converter = new UnitConverter();

type MiniCategory = Extract<UnitCategory, "length" | "weight" | "temperature">;

const UNITS: Record<MiniCategory, string[]> = {
  weight: ["kg", "g", "lb", "oz"],
  length: ["cm", "m", "in", "ft"],
  temperature: ["celsius", "fahrenheit"],
};

const CATEGORY_LABELS: Record<MiniCategory, string> = {
  weight: "kg / lb",
  length: "cm / in",
  temperature: "°C / °F",
};

const UNIT_SYMBOLS: Record<string, string> = {
  celsius: "°C",
  fahrenheit: "°F",
};

export default function BMIMiniConverter() {
  const t = useTranslations("tools.bmi-calculator.aboveFold");
  const [category, setCategory] = useState<MiniCategory>("weight");
  const [from, setFrom] = useState("kg");
  const [to, setTo] = useState("lb");
  const [value, setValue] = useState("1");

  const result = useMemo(() => {
    const numeric = parseLocalizedNumber(value);
    if (Number.isNaN(numeric)) return null;
    const output = converter.execute({ category, from, to, value: numeric }, { locale: "en-US" });
    return output.success ? output.data.result : null;
  }, [category, from, to, value]);

  function handleCategoryChange(next: MiniCategory) {
    setCategory(next);
    setFrom(UNITS[next][0]);
    setTo(UNITS[next][1]);
  }

  return (
    <SectionCard title={t("miniConverterTitle")}>
      <div className="inline-flex rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
        {(["weight", "length", "temperature"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => handleCategoryChange(c)}
            className={`rounded-md px-3 py-3.5 text-xs font-medium transition ${
              category === c ? "bg-blue-600 text-white" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {CATEGORY_LABELS[c]}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <ToolInput
          type="text"
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="!py-2 text-base"
        />
        <select
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="rounded-xl border border-zinc-300 bg-white px-2 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        >
          {UNITS[category].map((unit) => (
            <option key={unit} value={unit}>
              {UNIT_SYMBOLS[unit] ?? unit}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-3 flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
        <span>{t("miniConverterResultPrefix")}</span>
        <span dir="ltr" className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
          {result ?? "—"}
        </span>
        <select
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="ms-auto rounded-xl border border-zinc-300 bg-white px-2 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        >
          {UNITS[category].map((unit) => (
            <option key={unit} value={unit}>
              {UNIT_SYMBOLS[unit] ?? unit}
            </option>
          ))}
        </select>
      </div>
    </SectionCard>
  );
}
