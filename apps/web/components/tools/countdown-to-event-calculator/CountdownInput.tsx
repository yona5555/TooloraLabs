"use client";
import { useMemo, useState } from "react";
import ResultActionButton from "@/components/tool-ui/ResultActionButton";
import { useLocale, useTranslations } from "next-intl";
import { Bookmark, CalendarPlus, Check, Copy, Link2, Moon, RotateCcw } from "lucide-react";
import { buildCountdownIcs, countdownIcsFileName, type CountdownPreset } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { downloadTextFile } from "@/lib/export";
import { hijriMonthName, withHijriFields, withHijriFromIso, zoneOptions, type CdCalendar, type CdState, type Derived } from "./model";

type Props = {
  state: CdState;
  onChange: (next: CdState) => void;
  d: Derived | null;
  presets: CountdownPreset[];
  onPreset: (p: CountdownPreset) => void;
  onReset: () => void;
  onSave: () => void;
  viewerZone: string;
  nowMs: number;
  resultText: string;
};

const field =
  "w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-blue-500/20";
const label = "mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300";
const chip =
  "rounded-lg border px-2 py-1 text-xs font-semibold transition hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10";

function Segmented<T extends string>({ value, options, onChange, labelOf }: { value: T; options: T[]; onChange: (v: T) => void; labelOf: (v: T) => string }) {
  return (
    <div role="radiogroup" className="grid gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }} data-bp-inner>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          role="radio"
          aria-checked={value === o}
          onClick={() => onChange(o)}
          className={`rounded-md px-2 py-1.5 text-xs font-semibold transition ${value === o ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-white dark:text-zinc-300 dark:hover:bg-zinc-700"}`}
        >
          {labelOf(o)}
        </button>
      ))}
    </div>
  );
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function CountdownInput({ state, onChange, d, presets, onPreset, onReset, onSave, viewerZone, nowMs, resultText }: Props) {
  const t = useTranslations("tools.countdown-to-event-calculator.pro");
  const locale = useLocale();
  const [flash, setFlash] = useState<"" | "copy" | "link" | "save">("");
  const set = (patch: Partial<CdState>) => onChange({ ...state, ...patch });
  const nowMinute = Math.floor(nowMs / 60_000);
  // Offsets only change at DST transitions; recompute the option labels once a minute at most.
  const zones = useMemo(() => zoneOptions(locale, nowMinute * 60_000, [viewerZone, state.zone]), [locale, nowMinute, viewerZone, state.zone]);
  const hy = Number(state.hy) || 1448;
  const hijriMonths = useMemo(() => Array.from({ length: 12 }, (_, i) => hijriMonthName(locale, hy, i + 1)), [locale, hy]);
  const pulse = (k: typeof flash) => {
    setFlash(k);
    setTimeout(() => setFlash(""), 1600);
  };

  const hijriPresets = presets.filter((p) => p.calendar === "hijri");
  const gregPresets = presets.filter((p) => p.calendar === "gregorian");
  const showMoonNote = state.cal === "hijri" || presets.some((p) => p.key === state.preset && p.moonSighting);

  const downloadIcs = () => {
    if (!d) return;
    const title = state.title || t("saved.untitled");
    const ics = buildCountdownIcs({
      uid: `${d.target.utcMs.toString(36)}-${Math.random().toString(36).slice(2, 8)}@tooloralabs.com`,
      title,
      description: resultText,
      url: window.location.href,
      startUtcMs: d.target.utcMs,
      durationMinutes: 60,
      stampUtcMs: Date.now(),
      zone: state.zone,
      // iCalendar repeats on the Gregorian calendar only; Hijri yearly events are exported as the next occurrence.
      yearly: state.yearly && state.cal === "gregorian",
      alarmMinutesBefore: 1440,
    });
    downloadTextFile(countdownIcsFileName(title, d.target.date), ics, "text/calendar;charset=utf-8");
  };

  return (
    <SectionCard phoneRole="output" title={t("input.title")} bodyClassName="p-4 space-y-3">
      <div>
        <span className={label}>{t("input.presetsHijri")}</span>
        <div className="flex flex-wrap gap-1.5">
          {hijriPresets.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => onPreset(p)}
              className={`${chip} ${state.preset === p.key ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" : "border-zinc-300 text-zinc-700 dark:border-zinc-600 dark:text-zinc-200"}`}
            >
              {t(`presets.${p.key}`)}
            </button>
          ))}
        </div>
        <span className={`${label} mt-2`}>{t("input.presetsGregorian")}</span>
        <div className="flex flex-wrap gap-1.5">
          {gregPresets.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => onPreset(p)}
              className={`${chip} ${state.preset === p.key ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" : "border-zinc-300 text-zinc-700 dark:border-zinc-600 dark:text-zinc-200"}`}
            >
              {t(`presets.${p.key}`)}
            </button>
          ))}
        </div>
      </div>

      <label className="block">
        <span className={label}>{t("input.name")}</span>
        <input value={state.title} maxLength={80} placeholder={t("input.namePlaceholder")} onChange={(e) => onChange({ ...state, title: e.target.value })} className={field} />
      </label>

      <div>
        <span className={label}>{t("input.calendar")}</span>
        <Segmented<CdCalendar>
          value={state.cal}
          options={["gregorian", "hijri"]}
          onChange={(cal) => onChange(withHijriFromIso({ ...state, cal }, state.date))}
          labelOf={(c) => t(`input.cal.${c}`)}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {state.cal === "gregorian" ? (
          <label className="block">
            <span className={label}>{t("input.date")}</span>
            <input type="date" value={state.date} onChange={(e) => onChange({ ...withHijriFromIso(state, e.target.value), preset: null })} className={field} />
          </label>
        ) : (
          <div className="col-span-2 grid grid-cols-[4.5rem_minmax(0,1fr)_4rem] gap-2">
            <label className="block">
              <span className={label}>{t("input.hijriDay")}</span>
              <input inputMode="numeric" value={state.hd} onChange={(e) => onChange({ ...withHijriFields(state, { hd: e.target.value }), preset: null })} className={`${field} text-center`} />
            </label>
            <label className="block">
              <span className={label}>{t("input.hijriMonth")}</span>
              <select value={state.hm} onChange={(e) => onChange({ ...withHijriFields(state, { hm: e.target.value }), preset: null })} className={field}>
                {hijriMonths.map((name, i) => (
                  <option key={i} value={String(i + 1)}>
                    {i + 1} · {name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className={label}>{t("input.hijriYear")}</span>
              <input inputMode="numeric" value={state.hy} onChange={(e) => onChange({ ...withHijriFields(state, { hy: e.target.value }), preset: null })} className={`${field} text-center`} />
            </label>
          </div>
        )}
        <label className="block">
          <span className={label}>{t("input.time")}</span>
          <input type="time" value={state.time} onChange={(e) => set({ time: e.target.value || "00:00" })} className={field} />
        </label>
        {state.cal === "hijri" && (
          <div className="block self-end pb-1.5 text-xs text-zinc-500 dark:text-zinc-400" dir="ltr">
            = {state.date || "—"}
          </div>
        )}
      </div>
      {!d && <p className="rounded-lg bg-red-50 px-2 py-1.5 text-xs font-semibold text-red-700 dark:bg-red-500/10 dark:text-red-300">{t("input.invalid")}</p>}

      <label className="block">
        <span className={label}>{t("input.zone")}</span>
        <select value={state.zone} onChange={(e) => set({ zone: e.target.value })} className={field}>
          {zones.map((z) => (
            <option key={z.zone} value={z.zone}>
              {z.label}
              {z.zone === viewerZone ? ` · ${t("input.yourZone")}` : ""}
            </option>
          ))}
        </select>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="flex items-center gap-2 text-xs font-semibold text-zinc-700 dark:text-zinc-200">
          <input type="checkbox" checked={state.yearly} onChange={(e) => set({ yearly: e.target.checked })} className="h-4 w-4 accent-blue-600" />
          {t("input.yearly")}
        </label>
        {state.yearly && state.cal === "gregorian" && state.date.slice(5) === "02-29" ? (
          <label className="block">
            <span className={label}>{t("input.leap")}</span>
            <select value={state.leap} onChange={(e) => set({ leap: e.target.value === "mar1" ? "mar1" : "feb28" })} className={field}>
              <option value="feb28">{t("input.leapRule.feb28")}</option>
              <option value="mar1">{t("input.leapRule.mar1")}</option>
            </select>
          </label>
        ) : (
          <label className="block">
            <span className={label}>{t("input.start")}</span>
            <input type="date" value={state.start} onChange={(e) => set({ start: e.target.value })} className={field} />
          </label>
        )}
      </div>

      <div>
        <span className={label}>{t("input.weekend")}</span>
        <Segmented value={state.weekend} options={["fri-sat", "sat-sun"]} onChange={(weekend) => set({ weekend })} labelOf={(w) => t(`weekend.${w}`)} />
      </div>

      {showMoonNote && (
        <p className="flex gap-1.5 rounded-lg bg-amber-50 px-2 py-1.5 text-[11px] leading-4 text-amber-800 dark:bg-amber-500/10 dark:text-amber-200">
          <Moon size={14} className="mt-0.5 shrink-0" aria-hidden />
          {t("input.moonNote")}
        </p>
      )}

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => {
            onSave();
            pulse("save");
          }}
          disabled={!d}
          className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {flash === "save" ? <Check size={15} /> : <Bookmark size={15} />}
          {flash === "save" ? t("input.saved") : t("input.save")}
        </button>
        <button
          type="button"
          onClick={downloadIcs}
          disabled={!d}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-blue-300 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-50 dark:border-blue-500/40 dark:text-blue-300 dark:hover:bg-blue-500/10"
        >
          <CalendarPlus size={15} />
          {t("input.ics")}
        </button>
        <ResultActionButton action="copy"
          type="button"
          onClick={async () => (await copyText(resultText)) && pulse("copy")}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {flash === "copy" ? <Check size={14} /> : <Copy size={14} />}
          {flash === "copy" ? t("input.copied") : t("input.copy")}
        </ResultActionButton>
        <button
          type="button"
          onClick={async () => (await copyText(window.location.href)) && pulse("link")}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
        >
          {flash === "link" ? <Check size={14} /> : <Link2 size={14} />}
          {flash === "link" ? t("input.linkCopied") : t("input.share")}
        </button>
      </div>
      <button
        type="button"
        onClick={onReset}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-300 px-3 py-1.5 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <RotateCcw size={14} />
        {t("input.reset")}
      </button>
    </SectionCard>
  );
}
