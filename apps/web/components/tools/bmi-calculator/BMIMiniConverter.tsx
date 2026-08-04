"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { UnitConverter, type UnitCategory } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";
import ToolInput from "@/components/tool-ui/ToolInput";
import SectionCard from "@/components/tool-ui/SectionCard";

const converter = new UnitConverter();

const UNITS: Record<Extract<UnitCategory, "length" | "weight">, string[]> = {
  length: ["cm", "m", "in", "ft"],
  weight: ["kg", "g", "lb", "oz"],
};

export default function BMIMiniConverter() {
  const t = useTranslations("tools.bmi-calculator.aboveFold");
  const [isOpen, setIsOpen] = useState(false);
  const [category, setCategory] = useState<"length" | "weight">("weight");
  const [from, setFrom] = useState("kg");
  const [to, setTo] = useState("lb");
  const [value, setValue] = useState("1");

  const result = useMemo(() => {
    const numeric = parseLocalizedNumber(value);
    if (Number.isNaN(numeric)) return null;
    const output = converter.execute({ category, from, to, value: numeric }, { locale: "en-US" });
    return output.success ? output.data.result : null;
  }, [category, from, to, value]);

  function handleCategoryChange(next: "length" | "weight") {
    setCategory(next);
    setFrom(UNITS[next][0]);
    setTo(UNITS[next][1]);
  }

  return (
    <SectionCard
      title={t("miniConverterTitle")}
      onToggle={() => setIsOpen((prev) => !prev)}
      action={
        <ChevronDown
          size={16}
          className={`text-white transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      }
      bodyClassName={isOpen ? "space-y-3 p-4 lg:p-6" : "hidden"}
    >
      <div className="inline-flex rounded-lg border border-zinc-200 p-1 dark:border-zinc-800">
        {(["weight", "length"] as const).map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => handleCategoryChange(c)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition ${
              category === c ? "bg-blue-600 text-white" : "text-zinc-500 dark:text-zinc-400"
            }`}
          >
            {c === "weight" ? "kg / lb" : "cm / in"}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
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
              {unit}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
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
              {unit}
            </option>
          ))}
        </select>
      </div>
    </SectionCard>
  );
}
