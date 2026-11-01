"use client";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown, Search as SearchIcon } from "lucide-react";
import { wtSearchCities, type WtCity } from "@tooloralabs/tools";
import type { Fmt } from "./state";

type Props = {
  f: Fmt;
  /** Selected city (select mode) — omit for an "add a city" button. */
  value?: WtCity;
  onPick: (id: string) => void;
  exclude?: string[];
  buttonContent?: ReactNode;
  buttonClassName?: string;
  disabled?: boolean;
  ariaLabel: string;
};

/** Searchable city list: English/Arabic names, the IANA zone and the localized country name. */
export default function WtCityPicker({ f, value, onPick, exclude = [], buttonContent, buttonClassName, disabled, ariaLabel }: Props) {
  const t = useTranslations("tools.world-time-converter.wt.picker");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const matches = useMemo(
    () => wtSearchCities(query, (c) => `${f.city(c)} ${f.country(c)}`).filter((c) => !exclude.includes(c.id)).slice(0, 14),
    [query, exclude, f],
  );

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={
          buttonClassName ??
          "flex w-full items-center justify-between gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-start text-sm dark:border-zinc-700 dark:bg-zinc-800"
        }
      >
        {buttonContent ?? (
          <>
            <span className="min-w-0 truncate font-semibold text-zinc-900 dark:text-zinc-100">
              {value ? `${f.city(value)} — ${f.country(value)}` : t("placeholder")}
            </span>
            <ChevronDown size={16} className="shrink-0 text-zinc-400" />
          </>
        )}
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-30 mt-1 min-w-[240px] overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
          <div className="flex items-center gap-2 border-b border-zinc-200 px-3 py-2 dark:border-zinc-800">
            <SearchIcon size={15} className="shrink-0 text-zinc-400" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search")}
              className="min-w-0 flex-1 bg-transparent text-sm text-zinc-900 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
            />
          </div>
          <ul className="max-h-64 divide-y divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
            {matches.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    onPick(c.id);
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-start text-sm transition hover:bg-blue-50 dark:hover:bg-blue-500/10"
                >
                  <span className="min-w-0 truncate text-zinc-800 dark:text-zinc-200">
                    {f.city(c)} <span className="text-zinc-500 dark:text-zinc-400">— {f.country(c)}</span>
                  </span>
                  <span dir="ltr" className="shrink-0 font-mono text-xs text-zinc-400">{c.zone.split("/").pop()?.replace(/_/g, " ")}</span>
                </button>
              </li>
            ))}
            {matches.length === 0 && <li className="px-3 py-2.5 text-sm text-zinc-500 dark:text-zinc-400">{t("none")}</li>}
          </ul>
        </div>
      )}
    </div>
  );
}
