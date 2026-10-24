"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Link2, RotateCcw } from "lucide-react";
import type { LeapDayRule } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import {
  AGE_SCENARIOS,
  switchCalendar,
  withBirth,
  type AgeError,
  type AgeScenario,
  type AgeState,
  type CalendarSystem,
  type Derived,
  type Formatters,
} from "./ageModel";

type Props = {
  state: AgeState;
  onChange: (next: AgeState) => void;
  onReset: () => void;
  d: Derived;
  f: Formatters;
  copyText: string;
};

const field =
  "w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-blue-500/20";
const label = "mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300";

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" className="grid gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} data-bp-inner>
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          role="radio"
          aria-checked={value === o.v}
          onClick={() => onChange(o.v)}
          className={`rounded-md px-2 py-1.5 text-xs font-semibold transition ${
            value === o.v ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-white dark:text-zinc-300 dark:hover:bg-zinc-700"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function AgeInputCard({ state, onChange, onReset, d, f, copyText }: Props) {
  const t = useTranslations("tools.age-calculator.dual");
  const [copied, setCopied] = useState<"" | "result" | "link">("");
  const set = (patch: Partial<AgeState>) => onChange({ ...state, ...patch });
  const { report } = d;

  async function copy(kind: "result" | "link") {
    try {
      await navigator.clipboard.writeText(kind === "link" ? window.location.href : copyText);
      setCopied(kind);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      /* clipboard unavailable (insecure context): nothing to recover */
    }
  }

  function applyScenario(s: AgeScenario) {
    onChange({ ...withBirth({ ...state, cal: "gregorian" }, s.birth), useRef: !!s.ref, ref: s.ref ?? "", leap: s.leap ?? state.leap });
  }

  const errorText = (e: AgeError) => (e ? t(`errors.${e}`) : "");

  return (
    <SectionCard phoneRole="tool" title={t("input.title")} bodyClassName="p-4 space-y-4">
      <div>
        <span className={label}>{t("input.examples")}</span>
        <div className="flex flex-wrap gap-1.5">
          {AGE_SCENARIOS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => applyScenario(s)}
              className="rounded-lg border border-zinc-300 px-2.5 py-1 text-xs font-medium text-zinc-600 transition hover:border-blue-400 hover:text-blue-700 dark:border-zinc-600 dark:text-zinc-300 dark:hover:text-blue-300"
            >
              {t(`scenarios.${s.key}`)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className={label}>{t("input.enterIn")}</span>
        <Segmented<CalendarSystem>
          value={state.cal}
          onChange={(cal) => onChange(switchCalendar(state, cal))}
          options={[
            { v: "gregorian", label: t("cal.gregorian") },
            { v: "hijri", label: t("cal.hijri") },
          ]}
        />
      </div>

      {state.cal === "gregorian" ? (
        <label className="block">
          <span className={label}>{t("input.birth")}</span>
          <input type="date" value={state.birth} min="1900-01-01" onChange={(e) => onChange(withBirth(state, e.target.value))} className={field} />
        </label>
      ) : (
        <div>
          <span className={label}>{t("input.birthHijri")}</span>
          <div className="grid grid-cols-[3.5rem_minmax(0,1fr)_4.5rem] gap-1.5">
            <input inputMode="numeric" value={state.hd} onChange={(e) => set({ hd: e.target.value })} aria-label={t("input.day")} placeholder={t("input.day")} className={`${field} text-center`} />
            <select value={state.hm} onChange={(e) => set({ hm: e.target.value })} aria-label={t("input.month")} className={field}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={String(i + 1)}>
                  {i + 1} · {f.hijriMonth(i + 1)}
                </option>
              ))}
            </select>
            <input inputMode="numeric" value={state.hy} onChange={(e) => set({ hy: e.target.value })} aria-label={t("input.year")} placeholder={t("input.year")} className={`${field} text-center`} />
          </div>
        </div>
      )}
      {!d.error && (
        <p className="-mt-2 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs text-blue-800 dark:bg-blue-500/10 dark:text-blue-200" data-bp-inner>
          {state.cal === "gregorian"
            ? t("input.equalsHijri", { date: f.hijri(report.birth) })
            : t("input.equalsGregorian", { date: f.greg(report.birth) })}
          {" · "}
          {f.weekday(report.birthWeekday)}
        </p>
      )}

      <div>
        <span className={label}>{t("input.ageOn")}</span>
        <Segmented<"today" | "date">
          value={state.useRef ? "date" : "today"}
          onChange={(v) => set({ useRef: v === "date", ref: v === "date" && !state.ref ? f.iso(d.today) : state.ref })}
          options={[
            { v: "today", label: t("input.today") },
            { v: "date", label: t("input.specificDate") },
          ]}
        />
        {state.useRef && (
          <input type="date" value={state.ref} min="1900-01-01" onChange={(e) => set({ ref: e.target.value })} aria-label={t("input.specificDate")} className={`${field} mt-1.5`} />
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className={label}>{t("input.leapRule")}</span>
          <select value={state.leap} onChange={(e) => set({ leap: e.target.value as LeapDayRule })} className={field}>
            <option value="feb28">{t("input.leapFeb28")}</option>
            <option value="mar1">{t("input.leapMar1")}</option>
          </select>
        </label>
        <label className="block">
          <span className={label}>{t("input.sex")}</span>
          <select value={state.sex} onChange={(e) => set({ sex: e.target.value as AgeState["sex"] })} className={field}>
            <option value="male">{t("input.male")}</option>
            <option value="female">{t("input.female")}</option>
          </select>
        </label>
      </div>
      <p className="-mt-2 text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">{t("input.leapNote")}</p>

      {d.error && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {errorText(d.error)}
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => copy("result")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-2 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
        >
          {copied === "result" ? <Check size={14} /> : <Copy size={14} />}
          {copied === "result" ? t("input.copied") : t("input.copyResult")}
        </button>
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
      <p className="text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">{t("input.linkNote")}</p>
    </SectionCard>
  );
}
