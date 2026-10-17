"use client";
import { useTranslations } from "next-intl";
import { Check, Copy, Link2, Minus, Plus, RotateCcw, Trash2 } from "lucide-react";
import type { TcOvertimeBasis, TcRoundMode, WeekendPreset } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { INCREMENTS, MODES, newRowId, weekDaysFor, ZONES, type Derived, type Fmt, type Mode, type SumRow, type TcState } from "./state";

type Props = {
  s: TcState;
  set: (patch: Partial<TcState>) => void;
  d: Derived;
  f: Fmt;
  onCopy: () => void;
  onShare: () => void;
  onReset: () => void;
  copied: "result" | "link" | null;
};

export const field =
  "w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-blue-500/20";
const label = "mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300";
const chip =
  "rounded-full border border-zinc-300 px-2.5 py-1 text-[11px] font-semibold text-zinc-600 transition hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-300";

export function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" className="flex flex-wrap gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800" data-bp-inner>
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          role="radio"
          aria-checked={value === o.v}
          onClick={() => onChange(o.v)}
          className={`flex-1 rounded-md px-2 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
            value === o.v ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-white dark:text-zinc-300 dark:hover:bg-zinc-700"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function HmsFields({ h, m, s, onChange, t }: { h: string; m: string; s: string; onChange: (p: { h?: string; m?: string; s?: string }) => void; t: (k: string) => string }) {
  return (
    <div className="grid grid-cols-3 gap-1.5" dir="ltr">
      {(["h", "m", "s"] as const).map((k) => (
        <label key={k} className="block">
          <span className={label}>{t(`input.${k}`)}</span>
          <input inputMode="numeric" value={{ h, m, s }[k]} onChange={(e) => onChange({ [k]: e.target.value })} className={`${field} text-center`} />
        </label>
      ))}
    </div>
  );
}

export default function TcInput({ s, set, d, f, onCopy, onShare, onReset, copied }: Props) {
  const t = useTranslations("tools.time-calculator.tc");

  const updateRow = (i: number, patch: Partial<SumRow>) => set({ rows: s.rows.map((r, j) => (j === i ? { ...r, ...patch } : r)) });
  const zoneSelect = (
    <label className="block">
      <span className={label}>{t("input.zone")}</span>
      <select value={s.zone} onChange={(e) => set({ zone: e.target.value })} className={field}>
        {ZONES.map((z) => (
          <option key={z || "floating"} value={z}>
            {z ? z.replace(/_/g, " ") : t("input.floating")}
          </option>
        ))}
      </select>
    </label>
  );

  return (
    <SectionCard title={t("input.title")} bodyClassName="p-4 space-y-4">
      <div>
        <span className={label}>{t("input.mode")}</span>
        <Segmented<Mode> value={s.mode} onChange={(mode) => set({ mode })} options={MODES.map((m) => ({ v: m, label: t(`modes.${m}`) }))} />
        <p className="mt-1.5 text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">{t(`modeHint.${s.mode}`)}</p>
      </div>

      <div>
        <span className={label}>{t("input.display")}</span>
        <Segmented<"24" | "12"> value={s.h12 ? "12" : "24"} onChange={(v) => set({ h12: v === "12" })} options={[{ v: "24", label: t("input.h24") }, { v: "12", label: t("input.h12") }]} />
      </div>

      {s.mode === "sum" && (
        <div>
          <div className="grid grid-cols-[1.9rem_minmax(0,1fr)_2.6rem_2.3rem_2.3rem_1.6rem] gap-1 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
            <span />
            <span>{t("input.entry")}</span>
            <span className="text-center">{t("input.h")}</span>
            <span className="text-center">{t("input.m")}</span>
            <span className="text-center">{t("input.s")}</span>
            <span />
          </div>
          <div className="mt-1 space-y-1.5">
            {s.rows.map((r, i) => (
              <div key={r.id} className="grid grid-cols-[1.9rem_minmax(0,1fr)_2.6rem_2.3rem_2.3rem_1.6rem] items-center gap-1">
                <button
                  type="button"
                  onClick={() => updateRow(i, { sign: r.sign === 1 ? -1 : 1 })}
                  aria-label={r.sign === 1 ? t("input.add") : t("input.subtract")}
                  title={t("input.toggleSign")}
                  className={`flex h-8 items-center justify-center rounded-md text-white ${r.sign === 1 ? "bg-emerald-600" : "bg-red-600"}`}
                >
                  {r.sign === 1 ? <Plus size={14} /> : <Minus size={14} />}
                </button>
                <input value={r.label} placeholder={t("input.entryN", { n: i + 1 })} onChange={(e) => updateRow(i, { label: e.target.value })} aria-label={t("input.entry")} className={field} />
                {(["h", "m", "s"] as const).map((k) => (
                  <input key={k} inputMode="numeric" dir="ltr" value={r[k]} onChange={(e) => updateRow(i, { [k]: e.target.value })} aria-label={t(`input.${k}`)} className={`${field} px-1 text-center`} />
                ))}
                <button
                  type="button"
                  onClick={() => s.rows.length > 1 && set({ rows: s.rows.filter((_, j) => j !== i) })}
                  aria-label={t("input.removeRow")}
                  className="flex h-7 w-6 items-center justify-center rounded-md text-zinc-400 transition hover:text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => set({ rows: [...s.rows, { id: newRowId(), label: "", sign: 1, h: "1", m: "0", s: "0" }] })}
              className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline dark:text-blue-300"
            >
              <Plus size={14} />
              {t("input.addRow")}
            </button>
            <span dir="ltr" className="font-mono text-sm font-bold text-blue-700 dark:text-blue-300">Σ {f.dur(d.sheet.totalSeconds)}</span>
          </div>
        </div>
      )}

      {s.mode === "span" && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {[
              ["night", "22:00", "06:00", "30"],
              ["day", "09:00", "17:30", "60"],
              ["long", "07:00", "19:00", "60"],
            ].map(([k, a, b, brk]) => (
              <button key={k} type="button" className={chip} onClick={() => set({ span: { ...s.span, start: a, end: b, brk, endDate: "" } })}>
                {t(`presets.${k}`)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="col-span-2 block">
              <span className={label}>{t("input.startDate")}</span>
              <input type="date" value={s.span.date} onChange={(e) => e.target.value && set({ span: { ...s.span, date: e.target.value } })} className={field} />
            </label>
            <label className="block">
              <span className={label}>{t("input.start")}</span>
              <input type="time" value={s.span.start} onChange={(e) => e.target.value && set({ span: { ...s.span, start: e.target.value } })} className={field} />
            </label>
            <label className="block">
              <span className={label}>{t("input.end")}</span>
              <input type="time" value={s.span.end} onChange={(e) => e.target.value && set({ span: { ...s.span, end: e.target.value } })} className={field} />
            </label>
            <label className="col-span-2 flex items-center gap-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300">
              <input
                type="checkbox"
                checked={!!s.span.endDate}
                onChange={(e) => set({ span: { ...s.span, endDate: e.target.checked ? `${d.span.endDate.year}-${String(d.span.endDate.month).padStart(2, "0")}-${String(d.span.endDate.day).padStart(2, "0")}` : "" } })}
                className="accent-blue-600"
              />
              {t("input.setEndDate")}
            </label>
            {s.span.endDate ? (
              <label className="col-span-2 block">
                <span className={label}>{t("input.endDate")}</span>
                <input type="date" value={s.span.endDate} onChange={(e) => e.target.value && set({ span: { ...s.span, endDate: e.target.value } })} className={field} />
              </label>
            ) : (
              <p className="col-span-2 text-[11px] text-zinc-500 dark:text-zinc-400">{t("input.autoEnd", { date: f.date(d.span.endDate) })}</p>
            )}
            <label className="block">
              <span className={label}>{t("input.breakMin")}</span>
              <input inputMode="numeric" value={s.span.brk} onChange={(e) => set({ span: { ...s.span, brk: e.target.value } })} className={field} />
            </label>
            <div className="self-end">{zoneSelect}</div>
          </div>
        </div>
      )}

      {s.mode === "add" && (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {[
              ["p8", 1, "8", "0"],
              ["p12", 1, "12", "0"],
              ["p36", 1, "36", "0"],
              ["m90", -1, "1", "30"],
            ].map(([k, op, h, m]) => (
              <button key={k as string} type="button" className={chip} onClick={() => set({ add: { ...s.add, op: op as 1 | -1, h: h as string, m: m as string, s: "0" } })}>
                {t(`presets.${k}`)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <label className="block">
              <span className={label}>{t("input.startDate")}</span>
              <input type="date" value={s.add.date} onChange={(e) => e.target.value && set({ add: { ...s.add, date: e.target.value } })} className={field} />
            </label>
            <label className="block">
              <span className={label}>{t("input.start")}</span>
              <input type="time" value={s.add.time} onChange={(e) => e.target.value && set({ add: { ...s.add, time: e.target.value } })} className={field} />
            </label>
          </div>
          <Segmented<"1" | "-1"> value={s.add.op === 1 ? "1" : "-1"} onChange={(v) => set({ add: { ...s.add, op: v === "1" ? 1 : -1 } })} options={[{ v: "1", label: t("input.add") }, { v: "-1", label: t("input.subtract") }]} />
          <HmsFields h={s.add.h} m={s.add.m} s={s.add.s} onChange={(p) => set({ add: { ...s.add, ...p } })} t={t} />
          {zoneSelect}
        </div>
      )}

      {s.mode === "week" && (
        <div className="space-y-3">
          <label className="block">
            <span className={label}>{t("input.weekend")}</span>
            <select
              value={s.week.weekend}
              onChange={(e) => {
                const weekend = e.target.value as WeekendPreset;
                set({ week: { ...s.week, weekend, days: weekDaysFor(weekend, s.week.days) } });
              }}
              className={field}
            >
              <option value="fri-sat">{t("input.weekendFriSat")}</option>
              <option value="sat-sun">{t("input.weekendSatSun")}</option>
            </select>
          </label>
          <div className="space-y-1">
            <div className="grid grid-cols-[3.6rem_minmax(0,1fr)_minmax(0,1fr)_2.6rem] gap-1 text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">
              <span>{t("input.day")}</span>
              <span>{t("input.start")}</span>
              <span>{t("input.end")}</span>
              <span>{t("input.breakShort")}</span>
            </div>
            {d.order.map((wd) => {
              const day = s.week.days[wd];
              const upd = (p: Partial<typeof day>) => set({ week: { ...s.week, days: s.week.days.map((x, j) => (j === wd ? { ...x, ...p } : x)) } });
              return (
                <div key={wd} className={`grid grid-cols-[3.6rem_minmax(0,1fr)_minmax(0,1fr)_2.6rem] items-center gap-1 ${day.on ? "" : "opacity-50"}`}>
                  <label className="flex items-center gap-1 text-xs font-semibold text-zinc-700 dark:text-zinc-200">
                    <input type="checkbox" checked={day.on} onChange={(e) => upd({ on: e.target.checked })} className="accent-blue-600" />
                    {f.weekday(wd)}
                  </label>
                  <input type="time" value={day.start} disabled={!day.on} onChange={(e) => e.target.value && upd({ start: e.target.value })} aria-label={t("input.start")} className={`${field} px-1 text-xs`} />
                  <input type="time" value={day.end} disabled={!day.on} onChange={(e) => e.target.value && upd({ end: e.target.value })} aria-label={t("input.end")} className={`${field} px-1 text-xs`} />
                  <input inputMode="numeric" value={day.brk} disabled={!day.on} onChange={(e) => upd({ brk: e.target.value })} aria-label={t("input.breakMin")} className={`${field} px-1 text-center text-xs`} />
                </div>
              );
            })}
          </div>
          <div>
            <span className={label}>{t("input.basis")}</span>
            <Segmented<TcOvertimeBasis> value={s.week.basis} onChange={(basis) => set({ week: { ...s.week, basis } })} options={[{ v: "weekly", label: t("input.basisWeekly") }, { v: "daily", label: t("input.basisDaily") }]} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <label className="block">
              <span className={label}>{t("input.weeklyH")}</span>
              <input inputMode="decimal" value={s.week.weeklyH} onChange={(e) => set({ week: { ...s.week, weeklyH: e.target.value } })} className={field} />
            </label>
            <label className="block">
              <span className={label}>{t("input.dailyH")}</span>
              <input inputMode="decimal" value={s.week.dailyH} onChange={(e) => set({ week: { ...s.week, dailyH: e.target.value } })} className={field} />
            </label>
            <label className="block">
              <span className={label}>{t("input.mult")}</span>
              <input inputMode="decimal" value={s.week.mult} onChange={(e) => set({ week: { ...s.week, mult: e.target.value } })} className={field} />
            </label>
          </div>
        </div>
      )}

      {s.mode === "dec" && (
        <div className="space-y-3">
          <Segmented<"toHms" | "toDec"> value={s.dec.dir} onChange={(dir) => set({ dec: { ...s.dec, dir } })} options={[{ v: "toHms", label: t("input.toHms") }, { v: "toDec", label: t("input.toDec") }]} />
          {s.dec.dir === "toHms" ? (
            <>
              <label className="block">
                <span className={label}>{t("input.decimal")}</span>
                <input inputMode="decimal" dir="ltr" value={s.dec.decimal} onChange={(e) => set({ dec: { ...s.dec, decimal: e.target.value } })} className={field} />
              </label>
              <div className="flex flex-wrap gap-1.5">
                {["7.5", "7.75", "8.33", "37.5", "0.1"].map((v) => (
                  <button key={v} type="button" dir="ltr" className={chip} onClick={() => set({ dec: { ...s.dec, decimal: v } })}>
                    {v} h
                  </button>
                ))}
              </div>
            </>
          ) : (
            <HmsFields h={s.dec.h} m={s.dec.m} s={s.dec.s} onChange={(p) => set({ dec: { ...s.dec, ...p } })} t={t} />
          )}
          <div>
            <span className={label}>{t("input.increment")}</span>
            <Segmented<string> value={String(s.dec.inc)} onChange={(v) => set({ dec: { ...s.dec, inc: Number(v) } })} options={INCREMENTS.map((i) => ({ v: String(i), label: t("input.minutesN", { n: i }) }))} />
          </div>
          <label className="block">
            <span className={label}>{t("input.roundMode")}</span>
            <select value={s.dec.round} onChange={(e) => set({ dec: { ...s.dec, round: e.target.value as TcRoundMode } })} className={field}>
              {(["nearest", "down", "up"] as const).map((r) => (
                <option key={r} value={r}>
                  {t(`round.${r}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="grid grid-cols-[1fr_1fr_auto] gap-2">
        <button type="button" onClick={onCopy} className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-2 py-2 text-xs font-semibold text-white transition hover:bg-blue-700">
          {copied === "result" ? <Check size={14} /> : <Copy size={14} />}
          {copied === "result" ? t("input.copied") : t("input.copy")}
        </button>
        <button
          type="button"
          onClick={onShare}
          className="flex items-center justify-center gap-1.5 rounded-lg border border-blue-600 px-2 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10"
        >
          {copied === "link" ? <Check size={14} /> : <Link2 size={14} />}
          {copied === "link" ? t("input.linkCopied") : t("input.share")}
        </button>
        <button
          type="button"
          onClick={onReset}
          aria-label={t("input.reset")}
          title={t("input.reset")}
          className="flex items-center justify-center rounded-lg border border-zinc-300 px-2.5 py-2 text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <RotateCcw size={15} />
        </button>
      </div>
      <p className="text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">{t("input.savedNote")}</p>
    </SectionCard>
  );
}
