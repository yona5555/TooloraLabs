"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Search as SearchIcon } from "lucide-react";
import type { FiatRate } from "./types";

type CryptoFiatPickerProps = {
  rates: FiatRate[];
  value: string;
  onChange: (code: string) => void;
};

/** Searchable list of every fiat currency the data source quotes, named in the page's language. */
export default function CryptoFiatPicker({ rates, value, onChange }: CryptoFiatPickerProps) {
  const t = useTranslations("tools.crypto-converter.aboveFold");
  const locale = useLocale();
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const options = useMemo(() => {
    let names: Intl.DisplayNames | null = null;
    try {
      names = new Intl.DisplayNames([locale], { type: "currency" });
    } catch {
      names = null;
    }
    return rates
      .map((r) => {
        const local = names?.of(r.code);
        return { code: r.code, name: local && local !== r.code ? local : r.name, english: r.name };
      })
      .sort((a, b) => a.code.localeCompare(b.code));
  }, [rates, locale]);

  const q = query.trim().toLowerCase();
  const matches = q ? options.filter((o) => `${o.code} ${o.name} ${o.english}`.toLowerCase().includes(q)) : options;
  const selected = options.find((o) => o.code === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("fiatLabel")}</span>
      <button
        type="button"
        data-testid="fiat-picker"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-start dark:border-zinc-700 dark:bg-zinc-800"
      >
        <span className="flex min-w-0 items-center gap-2">
          <span dir="ltr" className="shrink-0 rounded bg-blue-50 px-1.5 py-0.5 font-mono text-xs font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
            {value}
          </span>
          <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">{selected?.name ?? value}</span>
        </span>
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
              placeholder={t("fiatSearchPlaceholder")}
              data-testid="fiat-search"
              className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100 dark:placeholder:text-zinc-500"
            />
          </div>
          <ul className="max-h-72 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
            {matches.map((o) => (
              <li key={o.code}>
                <button
                  type="button"
                  data-fiat={o.code}
                  onClick={() => {
                    onChange(o.code);
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className={`flex w-full items-center gap-3 px-4 py-2.5 text-start text-sm transition hover:bg-zinc-50 dark:hover:bg-zinc-800 ${
                    o.code === value ? "bg-blue-50/70 dark:bg-blue-500/10" : ""
                  }`}
                >
                  <span dir="ltr" className="w-10 shrink-0 font-mono text-xs font-bold text-zinc-500 dark:text-zinc-400">
                    {o.code}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-zinc-800 dark:text-zinc-200">{o.name}</span>
                </button>
              </li>
            ))}
            {matches.length === 0 && <li className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">{t("fiatNoResults")}</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
