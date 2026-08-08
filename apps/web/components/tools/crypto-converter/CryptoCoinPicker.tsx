"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Search as SearchIcon } from "lucide-react";
import { filterCoinsByQuery, type CryptoCoin } from "@tooloralabs/tools";

type ExternalResult = { id: string; name: string; symbol: string; thumb: string };

type CryptoCoinPickerProps = {
  label: string;
  coins: CryptoCoin[];
  value: string;
  onChange: (coinId: string) => void;
  onCoinDiscovered: (coin: CryptoCoin) => void;
};

export default function CryptoCoinPicker({ label, coins, value, onChange, onCoinDiscovered }: CryptoCoinPickerProps) {
  const t = useTranslations("tools.crypto-converter.aboveFold");
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [externalResults, setExternalResults] = useState<ExternalResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isResolving, setIsResolving] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedCoin = coins.find((coin) => coin.id === value);
  const localMatches = useMemo(() => filterCoinsByQuery(coins, query).slice(0, 8), [coins, query]);
  const localIds = useMemo(() => new Set(coins.map((coin) => coin.id)), [coins]);

  useEffect(() => {
    const normalized = query.trim();
    if (normalized.length < 2) {
      return;
    }

    let cancelled = false;
    const handle = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/crypto/search?q=${encodeURIComponent(normalized)}`);
        const json = (await res.json()) as { coins: ExternalResult[] };
        if (!cancelled) {
          setExternalResults(json.coins.filter((coin) => !localIds.has(coin.id)));
        }
      } catch {
        if (!cancelled) setExternalResults([]);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, localIds]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function selectExternalCoin(id: string) {
    setIsResolving(id);
    try {
      const res = await fetch(`/api/crypto/coin?id=${encodeURIComponent(id)}`);
      if (res.ok) {
        const json = (await res.json()) as { coin: CryptoCoin };
        onCoinDiscovered(json.coin);
        onChange(json.coin.id);
        setIsOpen(false);
        setQuery("");
      }
    } finally {
      setIsResolving(null);
    }
  }

  return (
    <div ref={containerRef} className="relative">
      <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{label}</span>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-start dark:border-zinc-700 dark:bg-zinc-800"
      >
        {selectedCoin ? (
          <span className="flex min-w-0 items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={selectedCoin.image} alt="" width={20} height={20} className="shrink-0 rounded-full" />
            <span className="truncate font-medium text-zinc-900 dark:text-zinc-100">{selectedCoin.name}</span>
            <span dir="ltr" className="shrink-0 text-xs uppercase text-zinc-400">
              {selectedCoin.symbol}
            </span>
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
            {localMatches.map((coin) => (
              <li key={coin.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(coin.id);
                    setIsOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-start text-sm transition hover:bg-zinc-50 dark:hover:bg-zinc-800"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={coin.image} alt="" width={20} height={20} className="shrink-0 rounded-full" />
                  <span className="min-w-0 flex-1 truncate text-zinc-800 dark:text-zinc-200">{coin.name}</span>
                  <span dir="ltr" className="shrink-0 text-xs uppercase text-zinc-400">
                    {coin.symbol}
                  </span>
                </button>
              </li>
            ))}

            {query.trim().length >= 2 && externalResults.length > 0 && (
              <>
                <li className="bg-zinc-50 px-4 py-1.5 text-xs font-medium text-zinc-400 dark:bg-zinc-800/60">
                  {t("pickerMoreResultsLabel")}
                </li>
                {externalResults.map((coin) => (
                  <li key={coin.id}>
                    <button
                      type="button"
                      onClick={() => selectExternalCoin(coin.id)}
                      disabled={isResolving === coin.id}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-start text-sm transition hover:bg-zinc-50 disabled:opacity-50 dark:hover:bg-zinc-800"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={coin.thumb} alt="" width={20} height={20} className="shrink-0 rounded-full" />
                      <span className="min-w-0 flex-1 truncate text-zinc-800 dark:text-zinc-200">{coin.name}</span>
                      <span dir="ltr" className="shrink-0 text-xs uppercase text-zinc-400">
                        {coin.symbol}
                      </span>
                    </button>
                  </li>
                ))}
              </>
            )}

            {query.trim().length >= 2 && localMatches.length === 0 && externalResults.length === 0 && (
              <li className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400">
                {isSearching ? t("pickerSearching") : t("pickerNoResults")}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
