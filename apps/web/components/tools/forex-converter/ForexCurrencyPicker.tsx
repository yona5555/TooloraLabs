"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Search as SearchIcon } from "lucide-react";
import { filterCurrenciesByQuery, type CurrencyRate } from "@tooloralabs/tools";
import { getCurrencyDisplayName } from "@/lib/forex/currencyNames";

type ForexCurrencyPickerProps = {
  label: string;
  currencies: CurrencyRate[];
  value: string;
  onChange: (code: string) => void;
};

/**
 * Unlike CryptoCoinPicker, this never calls out to a search API: ExchangeRate-API's
 * free plan returns all ~161 supported currencies in a single `/latest` call, so the
 * full pickable universe is already in `currencies` — filtering is purely local.
 */
export default function ForexCurrencyPicker({ label, currencies, value, onChange }: ForexCurrencyPickerProps) {
  const t = useTranslations("tools.forex-converter.aboveFold");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const displayNamed = useMemo(
    () => currencies.map((currency) => ({ ...currency, name: getCurrencyDisplayName(currency.code, locale, currency.name) })),
    [currencies, locale]
  );
  const selectedCurrency = displayNamed.find((currency) => currency.code === value);
  const matches = useMemo(() => filterCurrenciesByQuery(displayNamed, query).slice(0, 12), [displayNamed, query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{label}</span>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-start dark:border-zinc-700 dark:bg-zinc-800"
      >
        {selectedCurrency ? (
          <span className="flex min-w-0 items-center gap-2">
            <span dir="ltr" className="shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-bold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
              {selectedCurrency.code}
            </span>
            <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">{selectedCurrency.name}</span>
          </span>
        ) : (
          <span className="text-zinc-400">{t("pickerPlaceholder")}</span>
        )}
        <ChevronDown size={16} className="shrink-0 text-zinc-400" />
      </button>

      {isOpen && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center gap-2 border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
            <SearchIcon size={16} className="shrink-0 text-zinc-400" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("pickerSearchPlaceholder")}
              className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>

          <ul className="max-h-72 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
            {matches.map((currency) => (
              <li key={currency.code}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(currency.code);
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-start text-sm transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  <span dir="ltr" className="shrink-0 rounded bg-zinc-100 px-1.5 py-0.5 text-xs font-bold text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400">
                    {currency.code}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-zinc-800 dark:text-zinc-200">{currency.name}</span>
                </button>
              </li>
            ))}

            {matches.length === 0 && (
              <li className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">{t("pickerNoResults")}</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
