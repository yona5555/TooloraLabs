"use client";
import { useState } from "react";
import ResultActionButton from "@/components/tool-ui/ResultActionButton";
import { useTranslations } from "next-intl";
import { Check, Copy, Link2, Plus, RotateCcw, X } from "lucide-react";
import { civilWeekday, parseCivilDate, type DateSpanUnit, type WeekendPreset } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import {
  DATE_PRO_SCENARIOS,
  UNITS,
  fieldCivil,
  fieldFromIso,
  patchHijri,
  switchFieldCalendar,
  type CalendarSystem,
  type DateField,
  type DateMode,
  type DateState,
  type Derived,
  type Formatters,
} from "./dateModel";

type Props = {
  state: DateState;
  onChange: (next: DateState) => void;
  onReset: () => void;
  d: Derived;
  f: Formatters;
  copyText: string;
};

export const field =
  "w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-blue-500/20";
export const label = "mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300";

export function Segmented<T extends string>({ value, options, onChange, small }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void; small?: boolean }) {
  return (
    <div role="radiogroup" className="grid gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} data-bp-inner>
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          role="radio"
          aria-checked={value === o.v}
          onClick={() => onChange(o.v)}
          className={`rounded-md px-2 font-semibold transition ${small ? "py-1 text-xs" : "py-1.5 text-xs"} ${
            value === o.v ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-white dark:text-zinc-300 dark:hover:bg-zinc-700"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** A date entered in Gregorian or Hijri (Umm al-Qura), always echoed in the other calendar. */
export function DualDateInput({ title, value, onChange, f }: { title: string; value: DateField; onChange: (v: DateField) => void; f: Formatters }) {
  const t = useTranslations("tools.date-calculator.pro");
  const civil = fieldCivil(value);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">{title}</span>
        <div className="w-36">
          <Segmented<CalendarSystem>
            small
            value={value.cal}
            onChange={(cal) => onChange(switchFieldCalendar(value, cal))}
            options={[
              { v: "gregorian", label: t("cal.gShort") },
              { v: "hijri", label: t("cal.hShort") },
            ]}
          />
        </div>
      </div>
      {value.cal === "gregorian" ? (
        <input type="date" value={value.iso} min="1600-01-01" max="2600-12-31" onChange={(e) => onChange(fieldFromIso(e.target.value))} aria-label={title} className={field} />
      ) : (
        <div className="grid grid-cols-[3.25rem_minmax(0,1fr)_4.25rem] gap-1.5">
          <input inputMode="numeric" value={value.hd} onChange={(e) => onChange(patchHijri(value, { hd: e.target.value }))} aria-label={t("input.day")} placeholder={t("input.day")} className={`${field} text-center`} />
          <select value={value.hm} onChange={(e) => onChange(patchHijri(value, { hm: e.target.value }))} aria-label={t("input.month")} className={field}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i} value={String(i + 1)}>
                {i + 1} · {f.hijriMonth(i + 1)}
              </option>
            ))}
          </select>
          <input inputMode="numeric" value={value.hy} onChange={(e) => onChange(patchHijri(value, { hy: e.target.value }))} aria-label={t("input.year")} placeholder={t("input.year")} className={`${field} text-center`} />
        </div>
      )}
      <p className="mt-1 rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-800 dark:bg-blue-500/10 dark:text-blue-200" data-bp-inner>
        {civil
          ? `${value.cal === "gregorian" ? f.hijri(civil) : f.greg(civil)} · ${f.weekday(civilWeekday(civil))}`
          : t("input.invalidDate")}
      </p>
    </div>
  );
}

export default function DateInputCard({ state, onChange, onReset, d, f, copyText }: Props) {
  const t = useTranslations("tools.date-calculator.pro");
  const [copied, setCopied] = useState<"" | "result" | "link">("");
  const [holidayDraft, setHolidayDraft] = useState("");
  const set = (patch: Partial<DateState>) => onChange({ ...state, ...patch });

  async function copy(kind: "result" | "link") {
    try {
      await navigator.clipboard.writeText(kind === "link" ? window.location.href : copyText);
      setCopied(kind);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      /* clipboard unavailable (insecure context): nothing to recover */
    }
  }

  function addHoliday() {
    if (!parseCivilDate(holidayDraft) || state.holidays.includes(holidayDraft)) return;
    set({ holidays: [...state.holidays, holidayDraft].sort() });
  }

  return (
    <SectionCard phoneRole="output" title={t("input.title")} bodyClassName="p-4 space-y-3.5">
      <div>
        <span className={label}>{t("input.examples")}</span>
        <div className="flex flex-wrap gap-1.5">
          {DATE_PRO_SCENARIOS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => onChange(s.apply(state))}
              className="rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-600 transition hover:border-blue-400 hover:text-blue-700 dark:border-zinc-600 dark:text-zinc-300 dark:hover:text-blue-300"
            >
              {t(`scenarios.${s.key}`)}
            </button>
          ))}
        </div>
      </div>

      <Segmented<DateMode>
        value={state.mode}
        onChange={(mode) => set({ mode })}
        options={[
          { v: "difference", label: t("input.modeDifference") },
          { v: "add", label: t("input.modeAdd") },
        ]}
      />

      <DualDateInput title={state.mode === "difference" ? t("input.start") : t("input.base")} value={state.start} onChange={(start) => set({ start })} f={f} />

      {state.mode === "difference" ? (
        <>
          <DualDateInput title={t("input.end")} value={state.end} onChange={(end) => set({ end })} f={f} />
          <label className="flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
            <input type="checkbox" checked={state.includeEnd} onChange={(e) => set({ includeEnd: e.target.checked })} className="h-4 w-4 accent-blue-600" />
            {t("input.includeEnd")}
          </label>
        </>
      ) : (
        <div className="grid grid-cols-[minmax(0,1fr)_4.5rem_minmax(0,1.3fr)] items-end gap-1.5">
          <div>
            <span className={label}>{t("input.operation")}</span>
            <select value={state.op} onChange={(e) => set({ op: e.target.value as DateState["op"] })} className={field}>
              <option value="add">{t("input.opAdd")}</option>
              <option value="subtract">{t("input.opSubtract")}</option>
            </select>
          </div>
          <label className="block">
            <span className={label}>{t("input.amount")}</span>
            <input inputMode="numeric" value={state.amount} onChange={(e) => set({ amount: e.target.value })} className={`${field} text-center`} />
          </label>
          <label className="block">
            <span className={label}>{t("input.unit")}</span>
            <select value={state.unit} onChange={(e) => set({ unit: e.target.value as DateSpanUnit })} className={field}>
              {UNITS.map((u) => (
                <option key={u} value={u}>
                  {t(`units.${u}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div>
        <span className={label}>{t("input.weekend")}</span>
        <Segmented<WeekendPreset>
          value={state.weekend}
          onChange={(weekend) => set({ weekend })}
          options={[
            { v: "fri-sat", label: t("weekend.fri-sat") },
            { v: "sat-sun", label: t("weekend.sat-sun") },
          ]}
        />
      </div>

      <div>
        <span className={label}>{t("input.holidays", { n: f.int(state.holidays.length) })}</span>
        <div className="flex gap-1.5">
          <input type="date" value={holidayDraft} onChange={(e) => setHolidayDraft(e.target.value)} aria-label={t("input.holidayDate")} className={field} />
          <button
            type="button"
            onClick={addHoliday}
            className="flex shrink-0 items-center gap-1 rounded-lg bg-blue-600 px-2.5 text-xs font-semibold text-white transition hover:bg-blue-700"
          >
            <Plus size={14} />
            {t("input.addHoliday")}
          </button>
        </div>
        {state.holidays.length > 0 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {state.holidays.map((h) => {
              const c = parseCivilDate(h)!;
              return (
                <span key={h} className="flex items-center gap-1 rounded-md bg-amber-50 py-0.5 ps-2 pe-1 text-xs font-medium text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
                  {f.greg(c)}
                  <button type="button" onClick={() => set({ holidays: state.holidays.filter((x) => x !== h) })} aria-label={t("input.removeHoliday")} className="rounded hover:text-red-600">
                    <X size={12} />
                  </button>
                </span>
              );
            })}
            <button type="button" onClick={() => set({ holidays: [] })} className="px-1 text-xs font-semibold text-zinc-500 hover:text-red-600 dark:text-zinc-400">
              {t("input.clearHolidays")}
            </button>
          </div>
        )}
      </div>

      {d.error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {t(`errors.${d.error}`)}
        </p>
      )}

      <div className="flex gap-2">
        <ResultActionButton action="copy"
          type="button"
          onClick={() => copy("result")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-2 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
        >
          {copied === "result" ? <Check size={14} /> : <Copy size={14} />}
          {copied === "result" ? t("input.copied") : t("input.copyResult")}
        </ResultActionButton>
        <button
          type="button"
          onClick={() => copy("link")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-blue-600 px-2 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10"
        >
          {copied === "link" ? <Check size={14} /> : <Link2 size={14} />}
          {copied === "link" ? t("input.copied") : t("input.copyLink")}
        </button>
        <button
          type="button"
          onClick={onReset}
          aria-label={t("input.reset")}
          title={t("input.reset")}
          className="flex items-center justify-center rounded-lg border border-zinc-300 px-2.5 py-2 text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <RotateCcw size={14} />
        </button>
      </div>
      <p className="text-xs leading-4 text-zinc-500 dark:text-zinc-400">{t("input.linkNote")}</p>
    </SectionCard>
  );
}
