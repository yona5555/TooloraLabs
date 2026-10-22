"use client";
import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { addDaysIso } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { EXAM_COLORS, MAX_EXAMS, newId, useFmt, useStudyT, type StudioExam, type StudioState } from "./studio";

type Props = { state: StudioState; onChange: (next: StudioState) => void; onReset: () => void };

const field =
  "w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-blue-500/20";
const label = "mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300";

const num = (v: string, lo: number, hi: number) => {
  const n = Number.parseFloat(v.replace(",", "."));
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : lo;
};

export default function StudyStudioInput({ state, onChange, onReset }: Props) {
  const t = useStudyT();
  const f = useFmt();
  const set = (patch: Partial<StudioState>) => onChange({ ...state, ...patch });
  const setExam = (id: string, patch: Partial<StudioExam>) => set({ exams: state.exams.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  const lastDate = state.exams.reduce((a, e) => (e.date > a ? e.date : a), state.start);

  return (
    <SectionCard title={t("input.title")} bodyClassName="p-4 space-y-4">
      <label className="block">
        <span className={label}>{t("input.start")}</span>
        <input type="date" dir="ltr" value={state.start} onChange={(e) => e.target.value && set({ start: e.target.value })} className={field} />
      </label>

      <fieldset>
        <legend className={label}>{t("input.weekly")}</legend>
        <div className="grid grid-cols-7 gap-1">
          {state.weekly.map((h, i) => (
            <label key={i} className="block text-center">
              <span className="block truncate text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">{f.weekday(i)}</span>
              <input
                type="number"
                min={0}
                max={16}
                step={0.5}
                dir="ltr"
                value={h}
                onChange={(e) => set({ weekly: state.weekly.map((w, j) => (j === i ? num(e.target.value, 0, 16) : w)) })}
                className={`${field} px-0.5 text-center`}
              />
            </label>
          ))}
        </div>
        <p className="mt-1 text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">{t("input.weeklyHint")}</p>
      </fieldset>

      <div className="space-y-2.5 border-t border-zinc-200 pt-3 dark:border-zinc-700">
        <p className="text-sm font-bold text-blue-700 dark:text-blue-300">{t("input.exams", { n: state.exams.length })}</p>
        {state.exams.map((e, i) => (
          <fieldset key={e.id} className="rounded-xl border border-zinc-200 p-2.5 dark:border-zinc-700" style={{ borderInlineStartWidth: 4, borderInlineStartColor: EXAM_COLORS[i % EXAM_COLORS.length] }}>
            <div className="mb-1.5 flex items-center gap-1.5">
              <input dir="auto" value={e.name} onChange={(ev) => setExam(e.id, { name: ev.target.value })} aria-label={t("input.name")} placeholder={t("input.name")} className={`${field} font-semibold`} />
              <button
                type="button"
                onClick={() => state.exams.length > 1 && set({ exams: state.exams.filter((x) => x.id !== e.id) })}
                disabled={state.exams.length <= 1}
                aria-label={t("input.remove")}
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-red-500 disabled:opacity-30 dark:hover:bg-zinc-800"
              >
                <Trash2 size={14} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <label className="col-span-2 block">
                <span className={label}>{t("input.date")}</span>
                <input type="date" dir="ltr" value={e.date} min={state.start} onChange={(ev) => ev.target.value && setExam(e.id, { date: ev.target.value })} className={field} />
              </label>
              <div className="col-span-2">
                <span className={label}>{t("input.difficulty")}</span>
                <div role="radiogroup" aria-label={t("input.difficulty")} className="grid grid-cols-5 gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800" data-bp-inner>
                  {[1, 2, 3, 4, 5].map((d) => (
                    <button
                      key={d}
                      type="button"
                      role="radio"
                      aria-checked={e.difficulty === d}
                      onClick={() => setExam(e.id, { difficulty: d })}
                      className={`rounded-md py-1 text-xs font-bold transition ${e.difficulty === d ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-white dark:text-zinc-300 dark:hover:bg-zinc-700"}`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              {(
                [
                  { k: "credits", lo: 1, hi: 10, step: 1 },
                  { k: "topics", lo: 0, hi: 99, step: 1 },
                  { k: "hours", lo: 0, hi: 200, step: 0.5 },
                ] as const
              ).map(({ k, lo, hi, step }) => (
                <label key={k} className={`block ${k === "hours" ? "col-span-2" : ""}`}>
                  <span className={label}>{t(`input.${k}`)}</span>
                  <input type="number" dir="ltr" min={lo} max={hi} step={step} value={e[k]} onChange={(ev) => setExam(e.id, { [k]: num(ev.target.value, lo, hi) })} className={field} />
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        <button
          type="button"
          disabled={state.exams.length >= MAX_EXAMS}
          onClick={() =>
            set({
              exams: [
                ...state.exams,
                { id: newId(), name: t("input.newExam", { n: state.exams.length + 1 }), date: addDaysIso(lastDate, 4), difficulty: 3, credits: 3, topics: 5, hours: 8 },
              ],
            })
          }
          className="flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline disabled:opacity-40 dark:text-blue-300"
        >
          <Plus size={14} />
          {t("input.add")}
        </button>
      </div>

      <fieldset className="border-t border-zinc-200 pt-3 dark:border-zinc-700">
        <legend className="sr-only">{t("input.pomodoro")}</legend>
        <p className="mb-1.5 text-sm font-bold text-blue-700 dark:text-blue-300">{t("input.pomodoro")}</p>
        <div className="grid grid-cols-2 gap-1.5">
          {(
            [
              { k: "workMinutes", key: "work", lo: 5, hi: 90 },
              { k: "shortBreakMinutes", key: "short", lo: 0, hi: 30 },
              { k: "longBreakMinutes", key: "long", lo: 0, hi: 60 },
              { k: "longBreakEvery", key: "every", lo: 1, hi: 8 },
            ] as const
          ).map(({ k, key, lo, hi }) => (
            <label key={k} className="block">
              <span className={label}>{t(`input.${key}`)}</span>
              <input
                type="number"
                dir="ltr"
                min={lo}
                max={hi}
                value={state.pomodoro[k]}
                onChange={(ev) => set({ pomodoro: { ...state.pomodoro, [k]: Math.round(num(ev.target.value, lo, hi)) } })}
                className={field}
              />
            </label>
          ))}
        </div>
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
