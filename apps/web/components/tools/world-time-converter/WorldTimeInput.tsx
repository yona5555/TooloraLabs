"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy, Home, Link2, Plus, RotateCcw, X } from "lucide-react";
import { civilToUtcMs, formatIsoDate, gregorianToHijri, hijriToGregorian, parseCivilDate, zonedParts } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import WtCityPicker from "./WtCityPicker";
import { cityOf, MAX_CITIES, PRESETS, type Derived, type Fmt, type WtState } from "./state";

type Props = {
  s: WtState;
  set: (patch: Partial<WtState>) => void;
  d: Derived;
  f: Fmt;
  now: number;
  onCopy: () => void;
  onShare: () => void;
  onReset: () => void;
  copied: "result" | "link" | null;
};

const field =
  "w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-blue-500/20";
const label = "mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300";
const HOURS = Array.from({ length: 49 }, (_, i) => i * 30);

function Segmented<T extends string>({ value, options, onChange }: { value: T; options: { v: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div role="radiogroup" className="grid grid-flow-col gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800" data-bp-inner>
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

function HijriDateInput({ s, set, f }: { s: WtState; set: Props["set"]; f: Fmt }) {
  const t = useTranslations("tools.world-time-converter.wt.input");
  const g = parseCivilDate(s.date)!;
  const h0 = gregorianToHijri(g);
  const [h, setH] = useState(h0);
  const [invalid, setInvalid] = useState(false);
  const update = (patch: Partial<typeof h>) => {
    const next = { ...h, ...patch };
    setH(next);
    const greg = hijriToGregorian(next);
    setInvalid(!greg);
    if (greg) set({ date: formatIsoDate(greg) });
  };
  return (
    <div>
      <div className="grid grid-cols-[3.5rem_minmax(0,1fr)_4.5rem] gap-1.5">
        <select aria-label={t("hijriDay")} value={h.day} onChange={(e) => update({ day: Number(e.target.value) })} className={`${field} px-1`}>
          {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <select aria-label={t("hijriMonth")} value={h.month} onChange={(e) => update({ month: Number(e.target.value) })} className={`${field} px-1`}>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
            const first = hijriToGregorian({ year: h.year, month: m, day: 1 });
            return (
              <option key={m} value={m}>
                {m} · {first ? f.hijriMonth(civilToUtcMs(first)) : m}
              </option>
            );
          })}
        </select>
        <input
          aria-label={t("hijriYear")}
          inputMode="numeric"
          value={h.year}
          onChange={(e) => {
            const y = Number(e.target.value.replace(/\D/g, ""));
            if (y >= 1300 && y <= 1600) update({ year: y });
            else setH({ ...h, year: y });
          }}
          className={`${field} text-center`}
        />
      </div>
      <p className={`mt-1 text-[11px] ${invalid ? "text-red-600 dark:text-red-400" : "text-zinc-500 dark:text-zinc-400"}`}>
        {invalid ? t("hijriInvalid") : t("hijriEquals", { date: f.date(civilToUtcMs(g) + 12 * 3_600_000, "UTC") })}
      </p>
    </div>
  );
}

export default function WorldTimeInput({ s, set, d, f, now, onCopy, onShare, onReset, copied }: Props) {
  const t = useTranslations("tools.world-time-converter.wt.input");
  const tp = useTranslations("tools.world-time-converter.wt.presets");

  const switchMode = (mode: WtState["mode"]) => {
    if (mode === s.mode) return;
    if (mode === "custom") {
      const p = zonedParts(now, d.from.zone);
      set({ mode, date: formatIsoDate(p), time: `${String(p.hour).padStart(2, "0")}:${String(Math.floor(p.minute / 15) * 15).padStart(2, "0")}` });
    } else set({ mode });
  };
  const setFrom = (id: string) => set({ from: id, cities: s.cities.filter((c) => c !== id).concat(s.cities.includes(id) ? [s.from] : []) });
  const status = d.conv.status;

  return (
    <SectionCard title={t("title")} bodyClassName="p-4 space-y-4">
      <div>
        <span className={label}>{t("presets")}</span>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => set({ from: p.from, cities: p.cities })}
              className="rounded-lg border border-zinc-300 px-2 py-1 text-xs font-medium text-zinc-700 transition hover:border-blue-400 hover:text-blue-700 dark:border-zinc-600 dark:text-zinc-300 dark:hover:text-blue-300"
            >
              {tp(p.key)}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span className={label}>{t("from")}</span>
        <WtCityPicker f={f} value={d.from} onPick={setFrom} ariaLabel={t("from")} />
      </div>

      <div className="space-y-2">
        <Segmented
          value={s.mode}
          onChange={switchMode}
          options={[
            { v: "now", label: t("modeNow") },
            { v: "custom", label: t("modeCustom") },
          ]}
        />
        {s.mode === "custom" && (
          <div className="space-y-2 rounded-xl border border-zinc-200 p-2.5 dark:border-zinc-700">
            <Segmented
              value={s.cal}
              onChange={(cal) => set({ cal })}
              options={[
                { v: "greg", label: t("calGreg") },
                { v: "hijri", label: t("calHijri") },
              ]}
            />
            <div className="grid grid-cols-[minmax(0,1fr)_6rem] gap-1.5">
              <label className="block">
                <span className={label}>{t("date")}</span>
                {s.cal === "greg" ? (
                  <input type="date" value={s.date} onChange={(e) => parseCivilDate(e.target.value) && set({ date: e.target.value })} className={field} />
                ) : (
                  <span className="block text-xs text-zinc-500 dark:text-zinc-400">{t("hijriBelow")}</span>
                )}
              </label>
              <label className="block">
                <span className={label}>{t("time")}</span>
                <input type="time" step={60} value={s.time} onChange={(e) => e.target.value && set({ time: e.target.value })} className={field} />
              </label>
            </div>
            {s.cal === "hijri" && <HijriDateInput key={s.date.slice(0, 7)} s={s} set={set} f={f} />}
            <p className="text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">{t("customHint", { city: f.city(d.from) })}</p>
          </div>
        )}
        {status !== "ok" && (
          <p role="status" className="rounded-lg border border-amber-300 bg-amber-50 px-2.5 py-2 text-xs leading-5 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200">
            {status === "gap"
              ? t("gap", { city: f.city(d.from), input: s.time, used: f.time(d.conv.utcMs, d.from.zone), min: d.conv.gapMinutes })
              : t("overlap", {
                  city: f.city(d.from),
                  time: s.time,
                  first: f.offset(d.conv.rows[0].offsetMinutes),
                  second: d.conv.laterUtcMs ? f.time(d.conv.laterUtcMs, "UTC") : "",
                })}
          </p>
        )}
      </div>

      <div>
        <span className={label}>{t("cities", { n: s.cities.length, max: MAX_CITIES })}</span>
        <ul className="space-y-1">
          <li className="flex items-center gap-2 rounded-lg bg-blue-50 px-2 py-1.5 text-sm dark:bg-blue-500/10" data-bp-inner>
            <Home size={14} className="shrink-0 text-blue-600 dark:text-blue-300" />
            <span className="min-w-0 flex-1 truncate font-semibold text-zinc-900 dark:text-zinc-100">{f.city(d.from)}</span>
            <span dir="ltr" className="font-mono text-xs font-semibold text-blue-700 dark:text-blue-300">{f.time(d.conv.utcMs, d.from.zone)}</span>
          </li>
          {s.cities.map((id) => {
            const c = cityOf(id);
            return (
              <li key={id} className="flex items-center gap-2 rounded-lg border border-zinc-200 px-2 py-1 text-sm dark:border-zinc-700">
                <button type="button" onClick={() => setFrom(id)} title={t("makeHome")} className="min-w-0 flex-1 truncate text-start text-zinc-800 hover:text-blue-700 dark:text-zinc-200 dark:hover:text-blue-300">
                  {f.city(c)}
                </button>
                <span dir="ltr" className="font-mono text-xs text-zinc-600 dark:text-zinc-300">{f.time(d.conv.utcMs, c.zone)}</span>
                <button
                  type="button"
                  onClick={() => set({ cities: s.cities.filter((x) => x !== id) })}
                  aria-label={t("remove", { city: f.city(c) })}
                  className="flex h-6 w-6 items-center justify-center rounded text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                >
                  <X size={13} />
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-1.5">
          <WtCityPicker
            f={f}
            onPick={(id) => set({ cities: [...s.cities, id] })}
            exclude={[s.from, ...s.cities]}
            disabled={s.cities.length >= MAX_CITIES}
            ariaLabel={t("add")}
            buttonClassName="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-zinc-300 px-2 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-40 dark:border-zinc-600 dark:text-blue-300 dark:hover:bg-blue-500/10"
            buttonContent={
              <>
                <Plus size={14} />
                {t("add")}
              </>
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className={label}>{t("workStart")}</span>
          <select dir="ltr" value={s.ws} onChange={(e) => set({ ws: Number(e.target.value), we: Math.max(s.we, Number(e.target.value) + 30) })} className={field}>
            {HOURS.slice(0, 48).map((m) => (
              <option key={m} value={m}>{f.hhmm(m)}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className={label}>{t("workEnd")}</span>
          <select dir="ltr" value={s.we} onChange={(e) => set({ we: Number(e.target.value) })} className={field}>
            {HOURS.filter((m) => m > s.ws).map((m) => (
              <option key={m} value={m}>{m === 1440 ? "24:00" : f.hhmm(m)}</option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={onCopy} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
          {copied === "result" ? <Check size={15} /> : <Copy size={15} />}
          {copied === "result" ? t("copied") : t("copy")}
        </button>
        <button type="button" onClick={onShare} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-blue-600 px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-500/10">
          {copied === "link" ? <Check size={15} /> : <Link2 size={15} />}
          {copied === "link" ? t("linkCopied") : t("share")}
        </button>
        <button type="button" onClick={onReset} aria-label={t("reset")} title={t("reset")} className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800">
          <RotateCcw size={15} />
        </button>
      </div>
      <p className="text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">{t("savedNote")}</p>
    </SectionCard>
  );
}
