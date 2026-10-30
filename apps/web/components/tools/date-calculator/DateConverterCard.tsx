"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowLeftRight } from "lucide-react";
import { civilWeekday, gregorianToHijri, hijriMonthLength, hijriToGregorian, parseCivilDate, type CivilDate } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { field, label } from "./DateInputCard";
import { fieldCivil, patchHijri, fieldFromIso, type Formatters } from "./dateModel";

type Props = { f: Formatters; seed: CivilDate };

function MonthFacts({ c, f }: { c: CivilDate; f: Formatters }) {
  const t = useTranslations("tools.date-calculator.pro.converter");
  const h = gregorianToHijri(c);
  const len = hijriMonthLength(h.year, h.month);
  const first = hijriToGregorian({ year: h.year, month: h.month, day: 1 });
  const last = hijriToGregorian({ year: h.year, month: h.month, day: len });
  const rows = [
    { k: t("weekday"), v: f.weekday(civilWeekday(c)) },
    { k: t("hijriMonth"), v: `${f.hijriMonth(h.month)} ${f.int(h.year)}` },
    { k: t("monthLength"), v: t("days", { n: f.int(len) }) },
    { k: t("monthSpan"), v: first && last ? `${f.greg(first)} → ${f.greg(last)}` : "" },
  ];
  return (
    <dl className="mt-2 space-y-1 text-xs">
      {rows.map((r) => (
        <div key={r.k} className="flex justify-between gap-2 border-t border-zinc-100 pt-1 dark:border-zinc-800">
          <dt className="text-zinc-500 dark:text-zinc-400">{r.k}</dt>
          <dd className="text-end font-semibold text-zinc-800 dark:text-zinc-100">{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Standalone Gregorian ⇄ Hijri (Umm al-Qura) converter, both directions side by side. */
export default function DateConverterCard({ f, seed }: Props) {
  const t = useTranslations("tools.date-calculator.pro");
  const tc = useTranslations("tools.date-calculator.pro.converter");
  const [g, setG] = useState(() => f.iso(seed));
  const [h, setH] = useState(() => fieldFromIso(f.iso(seed), "hijri"));
  const gCivil = parseCivilDate(g);
  const hCivil = fieldCivil(h);

  return (
    <SectionCard title={tc("title")} id="date-converter">
      <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-300">{tc("intro")}</p>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-blue-700 dark:text-blue-300">
            {t("cal.gregorian")} <ArrowLeftRight size={14} /> {t("cal.hijri")}
          </p>
          <label className="block">
            <span className={label}>{tc("gregorianDate")}</span>
            <input type="date" value={g} min="1883-01-01" max="2174-12-31" onChange={(e) => setG(e.target.value)} className={field} />
          </label>
          <p className="mt-2 text-lg font-bold text-emerald-700 dark:text-emerald-300">{gCivil ? f.hijriLong(gCivil) : t("input.invalidDate")}</p>
          {gCivil && <MonthFacts c={gCivil} f={f} />}
        </div>
        <div className="rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
          <p className="mb-2 flex items-center gap-1.5 text-sm font-bold text-emerald-700 dark:text-emerald-300">
            {t("cal.hijri")} <ArrowLeftRight size={14} /> {t("cal.gregorian")}
          </p>
          <span className={label}>{tc("hijriDate")}</span>
          <div className="grid grid-cols-[3.25rem_minmax(0,1fr)_4.25rem] gap-1.5">
            <input inputMode="numeric" value={h.hd} onChange={(e) => setH(patchHijri(h, { hd: e.target.value }))} aria-label={t("input.day")} className={`${field} text-center`} />
            <select value={h.hm} onChange={(e) => setH(patchHijri(h, { hm: e.target.value }))} aria-label={t("input.month")} className={field}>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i} value={String(i + 1)}>
                  {i + 1} · {f.hijriMonth(i + 1)}
                </option>
              ))}
            </select>
            <input inputMode="numeric" value={h.hy} onChange={(e) => setH(patchHijri(h, { hy: e.target.value }))} aria-label={t("input.year")} className={`${field} text-center`} />
          </div>
          <p className="mt-2 text-lg font-bold text-blue-700 dark:text-blue-300">{hCivil ? f.gregLong(hCivil) : t("input.invalidHijri")}</p>
          {hCivil && <MonthFacts c={hCivil} f={f} />}
        </div>
      </div>
      <p className="mt-3 text-xs leading-4 text-zinc-500 dark:text-zinc-400">{tc("note")}</p>
    </SectionCard>
  );
}
