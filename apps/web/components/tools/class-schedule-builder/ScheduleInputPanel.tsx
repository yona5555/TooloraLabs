"use client";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";
import { DAY_CODES, emptyClass, type DraftClass } from "./types";

type ScheduleInputPanelProps = {
  classes: DraftClass[];
  onClassesChange: (classes: DraftClass[]) => void;
};

export default function ScheduleInputPanel({ classes, onClassesChange }: ScheduleInputPanelProps) {
  const t = useTranslations("tools.class-schedule-builder.form");

  function updateClass(index: number, patch: Partial<DraftClass>) {
    onClassesChange(classes.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  }
  function toggleDay(index: number, day: string) {
    const cls = classes[index];
    const days = cls.days.includes(day) ? cls.days.filter((d) => d !== day) : [...cls.days, day];
    updateClass(index, { days });
  }
  function addClass() {
    onClassesChange([...classes, emptyClass()]);
  }
  function removeClass(index: number) {
    onClassesChange(classes.length > 1 ? classes.filter((_, i) => i !== index) : classes);
  }

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="space-y-5">
        {classes.map((cls, index) => (
          <div key={index} className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-700">
            <div className="mb-3 flex items-end gap-2">
              <div className="flex-1">
                <ToolInput
                  label={t("classNameLabel")}
                  placeholder={t("classNamePlaceholder")}
                  value={cls.name}
                  onChange={(e) => updateClass(index, { name: e.target.value })}
                />
              </div>
              <button
                type="button"
                onClick={() => removeClass(index)}
                aria-label={t("removeClass")}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-zinc-300 text-zinc-500 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
              >
                <Trash2 size={18} />
              </button>
            </div>

            <p className="mb-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("daysLabel")}</p>
            <div dir="ltr" className="mb-3 flex flex-wrap gap-1.5">
              {DAY_CODES.map((day) => {
                const active = cls.days.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(index, day)}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {t(`day.${day}`)}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ToolInput
                label={t("startTimeLabel")}
                type="time"
                value={cls.startTime}
                onChange={(e) => updateClass(index, { startTime: e.target.value })}
              />
              <ToolInput
                label={t("endTimeLabel")}
                type="time"
                value={cls.endTime}
                onChange={(e) => updateClass(index, { endTime: e.target.value })}
              />
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addClass}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 px-4 py-3 text-sm font-semibold text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          <Plus size={16} />
          {t("addClass")}
        </button>
      </div>
    </SectionCard>
  );
}
