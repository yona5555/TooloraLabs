"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRightLeft } from "lucide-react";
import { convert, unitsForCategory, type UnitCategory } from "@/lib/home-calculator/unitConversions";

const CATEGORIES: UnitCategory[] = ["length", "weight", "temperature", "volume"];

function formatResult(value: number): string {
  if (!Number.isFinite(value)) return "—";
  if (Number.isInteger(value)) return String(value);
  return Number(value.toPrecision(10)).toString();
}

export default function UnitConverter() {
  const tHome = useTranslations("homeCalculator");
  const [category, setCategory] = useState<UnitCategory>("length");
  const units = useMemo(() => unitsForCategory(category), [category]);
  const [fromUnit, setFromUnit] = useState(units[0]);
  const [toUnit, setToUnit] = useState(units[1] ?? units[0]);
  const [value, setValue] = useState("1");

  function selectCategory(next: UnitCategory) {
    const nextUnits = unitsForCategory(next);
    setCategory(next);
    setFromUnit(nextUnits[0]);
    setToUnit(nextUnits[1] ?? nextUnits[0]);
  }

  function swap() {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  }

  const numericValue = parseFloat(value);
  const result = Number.isFinite(numericValue) ? convert(numericValue, category, fromUnit, toUnit) : null;

  return (
    <div dir="ltr" className="flex flex-col gap-3 p-3 sm:p-4">
      <div className="flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => selectCategory(cat)}
            className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
              category === cat ? "bg-blue-500 text-white" : "border border-zinc-200 text-zinc-600 hover:bg-zinc-100 calcdark:border-zinc-700 calcdark:text-zinc-300 calcdark:hover:bg-zinc-800"
            }`}
          >
            {tHome(`converter.categories.${cat}`)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500 calcdark:text-zinc-400">{tHome("converter.from")}</label>
          <input
            type="number"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-blue-400 calcdark:border-zinc-600 calcdark:bg-zinc-800 calcdark:text-zinc-100"
          />
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-700 outline-none calcdark:border-zinc-600 calcdark:bg-zinc-800 calcdark:text-zinc-200"
          >
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={swap}
          aria-label={tHome("converter.swap")}
          className="mb-1.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-200 text-zinc-500 transition hover:bg-zinc-100 calcdark:border-zinc-700 calcdark:text-zinc-400 calcdark:hover:bg-zinc-800"
        >
          <ArrowRightLeft size={15} />
        </button>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-500 calcdark:text-zinc-400">{tHome("converter.to")}</label>
          <div className="truncate rounded-lg border border-blue-200 bg-blue-50/50 px-3 py-2 text-sm font-semibold text-blue-700 calcdark:border-blue-500/30 calcdark:bg-blue-500/10 calcdark:text-blue-400">
            {result === null ? "—" : formatResult(result)}
          </div>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-700 outline-none calcdark:border-zinc-600 calcdark:bg-zinc-800 calcdark:text-zinc-200"
          >
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>

      {result !== null && (
        <p className="text-center text-sm text-zinc-500 calcdark:text-zinc-400">
          {value} {fromUnit} = {formatResult(result)} {toUnit}
        </p>
      )}
    </div>
  );
}
