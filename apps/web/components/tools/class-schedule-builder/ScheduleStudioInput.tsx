"use client";
import { Copy, Minus, Plus, RotateCcw, Trash2 } from "lucide-react";
import { CLASS_KINDS, DAY_CODES, type DayCode } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { CLASS_COLORS, classColor, newId, toMinutes, type StudioClass, type StudioState } from "./studio";
import { useSchedT } from "./ScheduleShared";

type Props = { state: StudioState; onChange: (next: StudioState) => void; onReset: () => void; timeZone: string | null };

const field =
  "w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-blue-500/20";
const label = "mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300";
const stepBtn =
  "flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-300 text-zinc-600 transition hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800";

export default function ScheduleStudioInput({ state, onChange, onReset, timeZone }: Props) {
  const t = useSchedT();
  const sel = state.classes.find((c) => c.id === state.selectedId) ?? state.classes[0];
  const update = (patch: Partial<StudioClass>) => onChange({ ...state, classes: state.classes.map((c) => (c.id === sel.id ? { ...c, ...patch } : c)) });
  const toggleDay = (day: DayCode) => update({ days: sel.days.includes(day) ? sel.days.filter((d) => d !== day) : DAY_CODES.filter((d) => d === day || sel.days.includes(d)) });
  const add = (c: StudioClass) => onChange({ ...state, classes: [...state.classes, c], selectedId: c.id });
  const remove = () => {
    if (state.classes.length <= 1) return;
    const classes = state.classes.filter((c) => c.id !== sel.id);
    onChange({ ...state, classes, selectedId: classes[0].id });
  };
  const timeError = toMinutes(sel.end) <= toMinutes(sel.start);

  return (
    <SectionCard title={t("input.title")} bodyClassName="p-4 space-y-4">
      <div>
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className={label}>{t("input.classes", { n: state.classes.length })}</span>
          <button
            type="button"
            onClick={() =>
              add({ id: newId(), name: "", code: "", kind: "lecture", days: ["tue"], start: "15:00", end: "15:50", room: "", instructor: "", credits: 3, color: state.classes.length })
            }
            className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline dark:text-blue-300"
          >
            <Plus size={14} />
            {t("input.add")}
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {state.classes.map((c) => {
            const on = c.id === sel.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onChange({ ...state, selectedId: c.id })}
                aria-pressed={on}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${
                  on ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-300 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                <span className="inline-block h-2.5 w-2.5 rounded-full ring-1 ring-white/70" style={{ backgroundColor: classColor(c) }} />
                <bdi>{c.code || c.name || t("input.untitled")}</bdi>
              </button>
            );
          })}
        </div>
      </div>

      <fieldset className="space-y-3 rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
        <legend className="px-1 text-sm font-bold text-blue-700 dark:text-blue-300">{t("input.editing")}</legend>
        <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-2">
          <label className="block">
            <span className={label}>{t("input.code")}</span>
            <input dir="auto" value={sel.code} onChange={(e) => update({ code: e.target.value })} className={field} />
          </label>
          <label className="block">
            <span className={label}>{t("input.name")}</span>
            <input dir="auto" value={sel.name} onChange={(e) => update({ name: e.target.value })} className={field} />
          </label>
        </div>

        <div role="radiogroup" aria-label={t("input.kind")} className="grid grid-cols-4 gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800" data-bp-inner>
          {CLASS_KINDS.map((k) => (
            <button
              key={k}
              type="button"
              role="radio"
              aria-checked={sel.kind === k}
              onClick={() => update({ kind: k })}
              className={`rounded-md px-1 py-1.5 text-[11px] font-semibold transition ${sel.kind === k ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-white dark:text-zinc-300 dark:hover:bg-zinc-700"}`}
            >
              {t(`kinds.${k}`)}
            </button>
          ))}
        </div>

        <div>
          <span className={label}>{t("input.days")}</span>
          <div className="grid grid-cols-7 gap-1">
            {DAY_CODES.map((d) => {
              const on = sel.days.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleDay(d)}
                  className={`rounded-md border py-1.5 text-[11px] font-bold transition ${
                    on ? "border-blue-600 bg-blue-600 text-white" : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  }`}
                >
                  {t(`days.${d}`)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className={label}>{t("input.start")}</span>
            <input type="time" dir="ltr" step={300} value={sel.start} onChange={(e) => update({ start: e.target.value })} className={field} />
          </label>
          <label className="block">
            <span className={label}>{t("input.end")}</span>
            <input type="time" dir="ltr" step={300} value={sel.end} onChange={(e) => update({ end: e.target.value })} className={`${field} ${timeError ? "border-red-500" : ""}`} />
          </label>
        </div>
        {(timeError || sel.days.length === 0) && (
          <p role="alert" className="text-[11px] font-semibold text-red-600 dark:text-red-400">
            {timeError ? t("input.errorTime") : t("input.errorDays")}
          </p>
        )}

        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className={label}>{t("input.room")}</span>
            <input dir="auto" value={sel.room} onChange={(e) => update({ room: e.target.value })} className={field} />
          </label>
          <label className="block">
            <span className={label}>{t("input.instructor")}</span>
            <input dir="auto" value={sel.instructor} onChange={(e) => update({ instructor: e.target.value })} className={field} />
          </label>
        </div>

        <div className="flex items-end justify-between gap-3">
          <div>
            <span className={label}>{t("input.credits")}</span>
            <div className="flex items-center gap-1.5">
              <button type="button" className={stepBtn} aria-label={t("input.less")} disabled={sel.credits <= 0} onClick={() => update({ credits: Math.max(0, sel.credits - 1) })}>
                <Minus size={14} />
              </button>
              <span dir="ltr" className="w-6 text-center font-mono text-sm font-bold text-zinc-900 dark:text-zinc-100">
                {sel.credits}
              </span>
              <button type="button" className={stepBtn} aria-label={t("input.more")} disabled={sel.credits >= 8} onClick={() => update({ credits: Math.min(8, sel.credits + 1) })}>
                <Plus size={14} />
              </button>
            </div>
          </div>
          <div>
            <span className={label}>{t("input.color")}</span>
            <div className="flex gap-1">
              {CLASS_COLORS.map((c, i) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`${t("input.color")} ${i + 1}`}
                  aria-pressed={sel.color === i}
                  onClick={() => update({ color: i })}
                  className={`h-5 w-5 rounded-full transition ${sel.color === i ? "ring-2 ring-zinc-900 ring-offset-1 dark:ring-white dark:ring-offset-zinc-900" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between gap-2 border-t border-zinc-200 pt-2 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => add({ ...sel, id: newId(), code: sel.code ? `${sel.code}*` : sel.code, color: sel.color + 1 })}
            className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline dark:text-blue-300"
          >
            <Copy size={13} />
            {t("input.duplicate")}
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={state.classes.length <= 1}
            className="flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline disabled:opacity-40 dark:text-red-400"
          >
            <Trash2 size={13} />
            {t("input.delete")}
          </button>
        </div>
      </fieldset>

      <fieldset className="space-y-2 rounded-xl border border-zinc-200 p-3 dark:border-zinc-700">
        <legend className="px-1 text-sm font-bold text-blue-700 dark:text-blue-300">{t("input.term")}</legend>
        <div className="grid grid-cols-2 gap-2">
          <label className="block">
            <span className={label}>{t("input.termStart")}</span>
            <input type="date" dir="ltr" value={state.termStart} onChange={(e) => e.target.value && onChange({ ...state, termStart: e.target.value })} className={field} />
          </label>
          <label className="block">
            <span className={label}>{t("input.termEnd")}</span>
            <input type="date" dir="ltr" value={state.termEnd} onChange={(e) => e.target.value && onChange({ ...state, termEnd: e.target.value })} className={field} />
          </label>
          <label className="block">
            <span className={label}>{t("input.breakStart")}</span>
            <input type="date" dir="ltr" value={state.breakStart} onChange={(e) => onChange({ ...state, breakStart: e.target.value })} className={field} />
          </label>
          <label className="block">
            <span className={label}>{t("input.breakEnd")}</span>
            <input type="date" dir="ltr" value={state.breakEnd} onChange={(e) => onChange({ ...state, breakEnd: e.target.value })} className={field} />
          </label>
        </div>
        {state.termEnd < state.termStart && <p className="text-[11px] font-semibold text-red-600 dark:text-red-400">{t("input.errorTerm")}</p>}
        <label className="flex items-start gap-2 text-xs text-zinc-600 dark:text-zinc-300">
          <input type="checkbox" checked={state.useTz && !!timeZone} disabled={!timeZone} onChange={(e) => onChange({ ...state, useTz: e.target.checked })} className="mt-0.5 accent-blue-600" />
          <span>
            {t("input.useTz")} <bdi dir="ltr" className="font-mono font-semibold text-zinc-800 dark:text-zinc-100">{timeZone ?? "—"}</bdi>
            <span className="block text-[11px] text-zinc-500 dark:text-zinc-400">{state.useTz && timeZone ? t("input.tzNote") : t("input.floatingNote")}</span>
          </span>
        </label>
      </fieldset>

      <button
        type="button"
        onClick={onReset}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <RotateCcw size={15} />
        {t("input.reset")}
      </button>
      <p className="text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">{t("input.savedNote")}</p>
    </SectionCard>
  );
}
