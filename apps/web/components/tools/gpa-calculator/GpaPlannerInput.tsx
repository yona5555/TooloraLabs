"use client";
import { useTranslations } from "next-intl";
import { Plus, Printer, RotateCcw, Trash2, X } from "lucide-react";
import { GPA_SCALES, type GpaScaleId } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";
import { emptyCourse, newId, switchScale, type EntryMode, type PlannerCourse, type PlannerState } from "./planner";

type Props = {
  state: PlannerState;
  onChange: (next: PlannerState) => void;
  onReset: () => void;
  onPrint: () => void;
};

const SCALE_IDS: GpaScaleId[] = ["sa5", "sa4", "us4"];
const field =
  "w-full min-w-0 rounded-lg border border-zinc-300 bg-white px-2 py-1.5 text-sm text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:ring-blue-500/20";
const label = "mb-1 block text-xs font-semibold text-zinc-600 dark:text-zinc-300";

export default function GpaPlannerInput({ state, onChange, onReset, onPrint }: Props) {
  const t = useTranslations("tools.gpa-calculator.planner");
  const scale = GPA_SCALES[state.scale];

  const set = (patch: Partial<PlannerState>) => onChange({ ...state, ...patch });
  const updateCourse = (si: number, ci: number, patch: Partial<PlannerCourse>) =>
    set({
      semesters: state.semesters.map((s, i) =>
        i === si ? { ...s, courses: s.courses.map((c, j) => (j === ci ? { ...c, ...patch } : c)) } : s,
      ),
    });
  const removeCourse = (si: number, ci: number) =>
    set({
      semesters: state.semesters.map((s, i) =>
        i === si && s.courses.length > 1 ? { ...s, courses: s.courses.filter((_, j) => j !== ci) } : s,
      ),
    });
  const addCourse = (si: number) =>
    set({ semesters: state.semesters.map((s, i) => (i === si ? { ...s, courses: [...s.courses, emptyCourse(state.scale)] } : s)) });
  const addSemester = () =>
    set({ semesters: [...state.semesters, { id: newId(), courses: [emptyCourse(state.scale), emptyCourse(state.scale)] }] });
  const removeSemester = (si: number) =>
    state.semesters.length > 1 && set({ semesters: state.semesters.filter((_, i) => i !== si) });

  return (
    <SectionCard title={t("input.title")} bodyClassName="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <label className="col-span-2 block">
          <span className={label}>{t("input.scale")}</span>
          <select value={state.scale} onChange={(e) => onChange(switchScale(state, e.target.value as GpaScaleId))} className={field}>
            {SCALE_IDS.map((id) => (
              <option key={id} value={id}>
                {t(`scales.${id}`)}
              </option>
            ))}
          </select>
        </label>
        <div className="col-span-2">
          <span className={label}>{t("input.entry")}</span>
          <div role="radiogroup" className="grid grid-cols-2 gap-1 rounded-lg bg-zinc-100 p-1 dark:bg-zinc-800" data-bp-inner>
            {(["letter", "percent"] as EntryMode[]).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={state.entry === m}
                onClick={() => set({ entry: m })}
                className={`rounded-md px-2 py-1.5 text-xs font-semibold transition ${
                  state.entry === m ? "bg-blue-600 text-white" : "text-zinc-600 hover:bg-white dark:text-zinc-300 dark:hover:bg-zinc-700"
                }`}
              >
                {t(`input.entryMode.${m}`)}
              </button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className={label}>{t("input.priorGpa", { max: scale.max.toFixed(2) })}</span>
          <input inputMode="decimal" value={state.priorGpa} onChange={(e) => set({ priorGpa: e.target.value })} className={field} />
        </label>
        <label className="block">
          <span className={label}>{t("input.priorCredits")}</span>
          <input inputMode="decimal" value={state.priorCredits} onChange={(e) => set({ priorCredits: e.target.value })} className={field} />
        </label>
      </div>

      {state.semesters.map((sem, si) => (
        <fieldset key={sem.id} className="rounded-xl border border-zinc-200 p-2.5 dark:border-zinc-700">
          <legend className="flex items-center gap-2 px-1 text-sm font-bold text-blue-700 dark:text-blue-300">
            {t("semesterN", { n: si + 1 })}
            {si === state.semesters.length - 1 && (
              <span className="rounded bg-blue-100 px-1.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-500/20 dark:text-blue-300">
                {t("input.current")}
              </span>
            )}
            {state.semesters.length > 1 && (
              <button type="button" onClick={() => removeSemester(si)} aria-label={t("input.removeSemester")} className="text-zinc-400 hover:text-red-500">
                <X size={14} />
              </button>
            )}
          </legend>
          <div className="grid grid-cols-[minmax(0,1fr)_3rem_4.5rem_1.75rem] gap-1.5 text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">
            <span>{t("input.course")}</span>
            <span>{t("input.credits")}</span>
            <span>{state.entry === "percent" ? t("input.percent") : t("input.grade")}</span>
            <span />
          </div>
          <div className="mt-1 space-y-1.5">
            {sem.courses.map((c, ci) => (
              <div key={c.id} className="grid grid-cols-[minmax(0,1fr)_3rem_4.5rem_1.75rem] items-center gap-1.5">
                <input
                  value={c.name}
                  placeholder={t("input.courseN", { n: ci + 1 })}
                  onChange={(e) => updateCourse(si, ci, { name: e.target.value })}
                  aria-label={t("input.course")}
                  className={field}
                />
                <input
                  inputMode="decimal"
                  value={c.credits}
                  onChange={(e) => updateCourse(si, ci, { credits: e.target.value })}
                  aria-label={t("input.credits")}
                  className={`${field} text-center`}
                />
                {state.entry === "percent" ? (
                  <input
                    inputMode="decimal"
                    value={c.percent}
                    onChange={(e) => updateCourse(si, ci, { percent: e.target.value })}
                    aria-label={t("input.percent")}
                    className={`${field} text-center`}
                  />
                ) : (
                  <select
                    value={c.letter}
                    onChange={(e) => updateCourse(si, ci, { letter: e.target.value })}
                    aria-label={t("input.grade")}
                    className={`${field} px-1`}
                    dir="ltr"
                  >
                    {scale.grades.map((g) => (
                      <option key={g.letter} value={g.letter}>
                        {g.letter} · {g.points.toFixed(2)}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  type="button"
                  onClick={() => removeCourse(si, ci)}
                  aria-label={t("input.removeCourse")}
                  className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-400 transition hover:bg-zinc-100 hover:text-red-500 dark:hover:bg-zinc-800"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => addCourse(si)}
            className="mt-2 flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline dark:text-blue-300"
          >
            <Plus size={14} />
            {t("input.addCourse")}
          </button>
        </fieldset>
      ))}

      <button
        type="button"
        onClick={addSemester}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
      >
        <Plus size={16} />
        {t("input.addSemester")}
      </button>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className={label}>{t("input.target")}</span>
          <input inputMode="decimal" value={state.target} onChange={(e) => set({ target: e.target.value })} className={field} />
        </label>
        <label className="block">
          <span className={label}>{t("input.plannedCredits")}</span>
          <input inputMode="decimal" value={state.plannedCredits} onChange={(e) => set({ plannedCredits: e.target.value })} className={field} />
        </label>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrint}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          <Printer size={15} />
          {t("input.print")}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-300 px-3 py-2 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <RotateCcw size={15} />
          {t("input.reset")}
        </button>
      </div>
      <p className="text-[11px] leading-4 text-zinc-500 dark:text-zinc-400">{t("input.savedNote")}</p>
    </SectionCard>
  );
}
