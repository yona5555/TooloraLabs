"use client";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import { emptyCourse, LETTER_GRADES, type DraftCourse, type GpaOperation } from "./types";

type GpaInputPanelProps = {
  operation: GpaOperation;
  onOperationChange: (operation: GpaOperation) => void;
  courses: DraftCourse[];
  onCoursesChange: (courses: DraftCourse[]) => void;
  currentGpa: string;
  onCurrentGpaChange: (value: string) => void;
  currentCredits: string;
  onCurrentCreditsChange: (value: string) => void;
  targetGpa: string;
  onTargetGpaChange: (value: string) => void;
  plannedCredits: string;
  onPlannedCreditsChange: (value: string) => void;
};

export default function GpaInputPanel({
  operation,
  onOperationChange,
  courses,
  onCoursesChange,
  currentGpa,
  onCurrentGpaChange,
  currentCredits,
  onCurrentCreditsChange,
  targetGpa,
  onTargetGpaChange,
  plannedCredits,
  onPlannedCreditsChange,
}: GpaInputPanelProps) {
  const t = useTranslations("tools.gpa-calculator.form");

  function updateCourse(index: number, patch: Partial<DraftCourse>) {
    onCoursesChange(courses.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }
  function addCourse() {
    onCoursesChange([...courses, emptyCourse()]);
  }
  function removeCourse(index: number) {
    onCoursesChange(courses.length > 1 ? courses.filter((_, i) => i !== index) : courses);
  }

  return (
    <SectionCard title={t("inputTitle")}>
      <label className="block space-y-2">
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("operationLabel")}</span>
        <select
          value={operation}
          onChange={(e) => onOperationChange(e.target.value as GpaOperation)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
        >
          <option value="calculate">{t("operation.calculate")}</option>
          <option value="target">{t("operation.target")}</option>
        </select>
      </label>

      {operation === "calculate" ? (
        <div className="mt-5 space-y-3">
          {courses.map((course, index) => (
            <div key={index} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
              <label className="block space-y-2">
                {index === 0 && (
                  <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("gradeLabel")}</span>
                )}
                <select
                  value={course.grade}
                  onChange={(e) => updateCourse(index, { grade: e.target.value as DraftCourse["grade"] })}
                  className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-zinc-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-500 dark:focus:ring-blue-500/20"
                >
                  {LETTER_GRADES.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </label>

              <ToolInput
                label={index === 0 ? t("creditHoursLabel") : undefined}
                type="text"
                inputMode="decimal"
                placeholder={t("creditHoursPlaceholder")}
                value={course.creditHours}
                onChange={(e) => updateCourse(index, { creditHours: e.target.value })}
              />

              <button
                type="button"
                onClick={() => removeCourse(index)}
                aria-label={t("removeCourse")}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-300 text-zinc-500 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addCourse}
            className="flex items-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            <Plus size={16} />
            {t("addCourse")}
          </button>
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          <ToolInput
            label={t("currentGpaLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("currentGpaPlaceholder")}
            value={currentGpa}
            onChange={(e) => onCurrentGpaChange(e.target.value)}
          />
          <ToolInput
            label={t("currentCreditsLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("currentCreditsPlaceholder")}
            value={currentCredits}
            onChange={(e) => onCurrentCreditsChange(e.target.value)}
          />
          <ToolInput
            label={t("targetGpaLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("targetGpaPlaceholder")}
            value={targetGpa}
            onChange={(e) => onTargetGpaChange(e.target.value)}
          />
          <ToolInput
            label={t("plannedCreditsLabel")}
            type="text"
            inputMode="decimal"
            placeholder={t("plannedCreditsPlaceholder")}
            value={plannedCredits}
            onChange={(e) => onPlannedCreditsChange(e.target.value)}
          />
        </div>
      )}
    </SectionCard>
  );
}
