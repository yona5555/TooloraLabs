"use client";
import { useTranslations } from "next-intl";
import { RotateCcw } from "lucide-react";
import { mtDifferenceOfSquares } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { MtView, MultiplicationTableMode } from "./types";

type Props = {
  mode: MultiplicationTableMode;
  onModeChange: (value: MultiplicationTableMode) => void;
  number: string;
  onNumberChange: (value: string) => void;
  maxMultiplier: string;
  onMaxMultiplierChange: (value: string) => void;
  rangeStart: string;
  onRangeStartChange: (value: string) => void;
  rangeEnd: string;
  onRangeEndChange: (value: string) => void;
  onRangePreset: (lo: number, hi: number) => void;
  onPick: (a: number, b: number) => void;
  onClear: () => void;
  view: MtView | null;
};

const QUICK_NUMBERS = [2, 3, 4, 5, 6, 7, 8, 9, 11, 12, 15, 25];
const RANGE_PRESETS: [number, number][] = [
  [1, 10],
  [1, 12],
  [1, 20],
  [11, 20],
];

const pill = (on: boolean) =>
  `rounded-lg border px-2 py-1 font-mono text-xs font-semibold transition ${
    on ? "border-blue-500 bg-blue-600 text-white" : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
  }`;

function Slider({ label, value, min, max, onChange, testId }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; testId: string }) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-xs font-medium text-zinc-600 dark:text-zinc-300">
        {label}
        <span dir="ltr" className="font-mono text-sm font-bold text-blue-700 dark:text-blue-300">
          {value}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={Math.max(min, max)}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        data-testid={testId}
        className="mt-1 w-full accent-blue-600"
      />
    </label>
  );
}

export default function MTInputPanel(props: Props) {
  const t = useTranslations("tools.multiplication-table-generator.form");
  const { mode, view } = props;
  const parsedNumber = Number(props.number);

  // Difference-of-squares neighbourhood of the selected fact: the squares around (a + b) / 2.
  const dos = view ? mtDifferenceOfSquares(view.a, view.b) : null;
  const centre = dos ? Math.floor(dos.mid) : 1;
  const squares = Array.from({ length: 13 }, (_, i) => centre - 6 + i).filter((n) => n >= 1);

  return (
    <SectionCard title={t("inputTitle")} className="flex h-full flex-col" bodyClassName="flex flex-1 flex-col gap-4 p-4 lg:p-6">
      <div className="flex gap-2">
        {(["single", "range"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => props.onModeChange(m)}
            aria-pressed={mode === m}
            className={`flex-1 rounded-xl border px-3 py-2.5 text-sm font-semibold transition ${
              mode === m ? "border-blue-400 bg-blue-600 text-white" : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            }`}
          >
            {m === "single" ? t("modeSingle") : t("modeRange")}
          </button>
        ))}
      </div>

      {mode === "single" ? (
        <div className="grid grid-cols-2 gap-3">
          <ToolInput label={t("numberLabel")} type="text" inputMode="numeric" value={props.number} onChange={(e) => props.onNumberChange(e.target.value)} data-testid="mt-number" />
          <ToolInput label={t("maxMultiplierLabel")} type="text" inputMode="numeric" value={props.maxMultiplier} onChange={(e) => props.onMaxMultiplierChange(e.target.value)} data-testid="mt-max" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <ToolInput label={t("rangeStartLabel")} type="text" inputMode="numeric" value={props.rangeStart} onChange={(e) => props.onRangeStartChange(e.target.value)} data-testid="mt-from" />
          <ToolInput label={t("rangeEndLabel")} type="text" inputMode="numeric" value={props.rangeEnd} onChange={(e) => props.onRangeEndChange(e.target.value)} data-testid="mt-to" />
        </div>
      )}

      {/* §20 quick picks: one tap swaps the whole page to another table. */}
      <div>
        <p className="mb-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400">{mode === "single" ? t("quickNumbers") : t("quickRanges")}</p>
        <div dir="ltr" className="flex flex-wrap gap-1.5">
          {mode === "single"
            ? QUICK_NUMBERS.map((n) => (
                <button key={n} type="button" className={pill(parsedNumber === n)} onClick={() => props.onNumberChange(String(n))}>
                  {n}
                </button>
              ))
            : RANGE_PRESETS.map(([lo, hi]) => (
                <button key={`${lo}-${hi}`} type="button" className={pill(view?.lo === lo && view?.hi === hi)} onClick={() => props.onRangePreset(lo, hi)}>
                  {lo}–{hi}
                </button>
              ))}
        </div>
      </div>

      {view && (
        <div className="space-y-3 rounded-xl bg-zinc-50 p-3 dark:bg-zinc-800/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{t("selectedFact")}</p>
          {mode === "range" && <Slider label={t("rowLabel")} value={view.a} min={view.lo} max={view.hi} onChange={(v) => props.onPick(v, view.b)} testId="mt-row-slider" />}
          <Slider
            label={mode === "single" ? t("multiplierLabel") : t("columnLabel")}
            value={view.b}
            min={view.multipliers[0]}
            max={view.multipliers[view.multipliers.length - 1]}
            onChange={(v) => props.onPick(view.a, v)}
            testId="mt-b-slider"
          />
        </div>
      )}

      <button
        type="button"
        onClick={props.onClear}
        className="flex w-fit items-center gap-2 rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <RotateCcw size={16} />
        {t("clear")}
      </button>

      {/* Fills the rest of the column with the difference-of-squares shortcut for the selected fact. */}
      {view && dos && (
        <div className="flex min-h-[6.5rem] flex-1 flex-col rounded-xl border border-zinc-200 dark:border-zinc-700">
          <div className="border-b border-zinc-200 px-3 py-2 dark:border-zinc-700">
            <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{t("squaresTitle")}</p>
            <p dir="ltr" className="mt-1 font-mono text-xs text-zinc-600 dark:text-zinc-300" data-testid="mt-dos">
              {dos.exact
                ? `${view.fmt(view.a)} × ${view.fmt(view.b)} = ${view.fmt(dos.mid)}² − ${view.fmt(dos.half)}² = ${view.fmt(dos.mid * dos.mid)} − ${view.fmt(dos.half * dos.half)}`
                : `${view.fmt(view.a)} × ${view.fmt(view.b)} = ${view.fmt(view.a)} × ${view.fmt(view.b - 1)} + ${view.fmt(view.a)}`}
            </p>
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400">{dos.exact ? t("squaresExact") : t("squaresOdd")}</p>
          </div>
          <ul dir="ltr" className="max-h-48 min-h-0 flex-1 divide-y lg:max-h-none lg:basis-0 divide-zinc-100 overflow-y-auto dark:divide-zinc-800">
            {squares.map((n) => (
              <li key={n} className={`flex items-center justify-between px-3 py-1 font-mono text-xs ${n === dos.mid ? "bg-blue-50 font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300" : "text-zinc-600 dark:text-zinc-300"}`}>
                <span>
                  {view.fmt(n)}²
                </span>
                <span>{view.fmt(n * n)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </SectionCard>
  );
}
