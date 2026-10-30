"use client";
import type { ReactNode } from "react";
import Sparkline from "@/components/tools-page/PulseSparkline";

/**
 * APPROVED PHONE STANDARD top mini cards (visuals.md): two live indicators in one row under the title,
 * phone only (< 768px) — the site's ticker chip (label, value, change, sparkline) at 64px. Only for
 * tools whose page already loads that live data from a verified source; a missing value is never
 * filled in (no value hides the card, no history hides only the change and the line).
 * crypto-converter keeps its own tappable version (CryptoPhoneTicker).
 */
export type PhoneMiniCard = {
  key: string;
  label: string;
  value: string;
  /** Percent change; null/undefined hides it. */
  change?: number | null;
  /** Text after the change, e.g. "24h". */
  changeLabel?: string;
  /** Secondary line instead of a change (e.g. "12° / 19°"). */
  detail?: string;
  trend?: number[] | null;
  /** Not a price: blue line, no up/down colour. */
  neutral?: boolean;
  trailing?: ReactNode;
};

export default function PhoneMiniCards({ label, cards }: { label: string; cards: PhoneMiniCard[] }) {
  if (cards.length === 0) return null;
  return (
    <ul aria-label={label} data-phone-ticker="" className="mb-4 grid grid-cols-2 gap-2 md:hidden">
      {cards.map((c) => {
        const hasChange = c.change !== null && c.change !== undefined && Number.isFinite(c.change);
        const up = hasChange ? c.change! >= 0 : (c.trend ? c.trend[c.trend.length - 1] >= c.trend[0] : true);
        return (
          <li key={c.key} className="min-w-0">
            <div data-ticker-card="" className="flex h-16 w-full items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-3 dark:border-zinc-700 dark:bg-zinc-900">
              <span className="flex min-w-0 flex-col gap-0.5 leading-4">
                <span className="truncate text-xs font-medium text-zinc-500 dark:text-zinc-400">{c.label}</span>
                <span dir="ltr" className="truncate text-start text-sm font-bold tabular-nums text-zinc-900 dark:text-zinc-50">
                  {c.value}
                </span>
                {hasChange ? (
                  <span dir="ltr" className={`truncate text-start text-xs font-semibold tabular-nums ${up ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                    {up ? "+" : ""}
                    {c.change!.toFixed(2)}%{c.changeLabel ? ` · ${c.changeLabel}` : ""}
                  </span>
                ) : (
                  c.detail && (
                    <span dir="ltr" className="truncate text-start text-xs font-medium tabular-nums text-zinc-500 dark:text-zinc-400">
                      {c.detail}
                    </span>
                  )
                )}
              </span>
              {c.trailing ?? (c.trend && c.trend.length >= 2 && <Sparkline points={c.trend} up={up} neutral={c.neutral} />)}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
