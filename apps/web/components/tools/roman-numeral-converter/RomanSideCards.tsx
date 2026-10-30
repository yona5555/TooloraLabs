"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import { places, toRoman } from "./romanMath";

/**
 * §41: the cards that keep the input column flush with the Result column. Both follow the
 * converter live: the entered number split into its Roman symbol groups (one per decimal place),
 * and a list of quick examples that load straight into the converter, with a count of each symbol
 * the current numeral uses.
 */
const n0 = (v: number) => v.toLocaleString("en-US");
const EXAMPLES = [2026, 1994, 1776, 1066, 3999, 500, 444, 99, 49];

export function RomanBreakdownCard({ value }: { value: number }) {
  const t = useTranslations("tools.roman-numeral-converter.sideCards");
  const groups = places(value).filter((g) => g.d > 0);
  return (
    <SectionCard title={t("breakdownTitle")} bodyClassName="p-4">
      {/* One row per decimal place: its symbol group, its share of the total, its value. */}
      <ul dir="ltr" className="flex flex-col gap-1.5" data-testid="roman-breakdown">
        {groups.map((g) => (
          <li key={g.p} className="flex items-center gap-3 rounded-xl px-3 py-1.5" style={{ background: "var(--glass-table-wrap-bg)" }}>
            <span className="w-16 shrink-0 text-base font-bold tracking-wide" style={{ color: "var(--cv-from)" }}>
              {g.piece}
            </span>
            <span className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ background: "var(--glass-track)" }}>
              <span className="block h-full rounded-full" style={{ width: `${(g.value / value) * 100}%`, background: "var(--cv-from)" }} />
            </span>
            <span className="w-12 shrink-0 text-end text-sm font-semibold tabular-nums" style={{ color: "var(--ph-ink)" }}>
              {n0(g.value)}
            </span>
          </li>
        ))}
        <li className="flex items-baseline justify-between gap-3 px-3 pt-1 text-sm font-bold" style={{ color: "var(--ph-ink)" }}>
          <span className="tracking-wide">{toRoman(value)}</span>
          <span className="tabular-nums">{n0(value)}</span>
        </li>
      </ul>
    </SectionCard>
  );
}

const SYMBOLS: [string, number][] = [
  ["I", 1],
  ["V", 5],
  ["X", 10],
  ["L", 50],
  ["C", 100],
  ["D", 500],
  ["M", 1000],
];

export function RomanExamplesCard({ value, onPick }: { value: number; onPick: (v: number) => void }) {
  const t = useTranslations("tools.roman-numeral-converter.sideCards");
  const numeral = value > 0 ? toRoman(value) : "";
  const counts = SYMBOLS.map(([sym, v]) => ({ sym, v, n: [...numeral].filter((c) => c === sym).length }));
  const most = Math.max(1, ...counts.map((c) => c.n));
  return (
    <SectionCard title={t("examplesTitle")} className="flex flex-col lg:flex-1" bodyClassName="flex flex-1 flex-col p-4">
      <div dir="ltr" className="grid grid-cols-3 gap-2" data-testid="roman-examples">
        {EXAMPLES.map((n) => {
          const on = n === value;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onPick(n)}
              aria-pressed={on}
              title={t("examplesIntro")}
              className="flex min-h-11 flex-col items-center justify-center rounded-xl border px-1 py-1.5 text-center transition"
              style={{ borderColor: on ? "var(--ph-accent-strong)" : "var(--ph-line)", background: on ? "var(--ph-accent-soft)" : "transparent" }}
            >
              <span className="text-sm font-bold tabular-nums" style={{ color: "var(--ph-ink)" }}>
                {n0(n)}
              </span>
              <span className="text-xs font-semibold" style={{ color: "var(--cv-from)" }}>
                {toRoman(n)}
              </span>
            </button>
          );
        })}
      </div>
      {/* How many of each symbol the current numeral uses; this chart takes the spare height (§41). */}
      <div className="mt-4 flex flex-1 flex-col border-t border-zinc-200 pt-3 dark:border-zinc-800" data-testid="roman-symbol-counts">
        <p className="text-xs font-semibold" style={{ color: "var(--ph-ink)" }}>
          {t("symbolsTitle", { numeral: numeral || "—" })}
        </p>
        <div dir="ltr" className="mt-2 flex min-h-[110px] flex-1 items-stretch gap-1.5">
          {counts.map((c) => (
            <div key={c.sym} className="flex flex-1 flex-col items-center gap-1" data-symbol={c.sym} data-count={c.n}>
              <span className="text-xs font-bold tabular-nums" style={{ color: c.n ? "var(--ph-ink)" : "var(--ph-ink-muted)" }}>
                ×{c.n}
              </span>
              <span className="flex w-full flex-1 flex-col justify-end">
                <span
                  className="block w-full rounded-t-md transition-[height] duration-300"
                  style={{ height: c.n ? `${(c.n / most) * 100}%` : 3, background: c.n ? "var(--cv-from)" : "var(--glass-track)" }}
                />
              </span>
              <span className="text-sm font-bold" style={{ color: "var(--cv-from)" }}>
                {c.sym}
              </span>
              <span className="text-xs tabular-nums" style={{ color: "var(--ph-ink-muted)" }}>
                {n0(c.v)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  );
}
