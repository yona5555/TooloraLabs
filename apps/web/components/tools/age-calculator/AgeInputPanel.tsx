import { useTranslations } from "next-intl";
import type { Gender } from "@tooloralabs/tools";
import ToolButton from "@/components/tool-ui/ToolButton";
import ToolInput from "@/components/tool-ui/ToolInput";
import type { CalendarSystem } from "./types";

type AgeInputPanelProps = {
  calendarSystem: CalendarSystem;
  onCalendarSystemChange: (system: CalendarSystem) => void;

  birthDate: string;
  onBirthDateChange: (value: string) => void;

  gender: Gender;
  onGenderChange: (value: Gender) => void;

  hijriDay: string;
  onHijriDayChange: (value: string) => void;
  hijriMonth: string;
  onHijriMonthChange: (value: string) => void;
  hijriYear: string;
  onHijriYearChange: (value: string) => void;

  useCustomReference: boolean;
  onUseCustomReferenceChange: (value: boolean) => void;
  referenceDate: string;
  onReferenceDateChange: (value: string) => void;

  error: string;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  onReset: () => void;
};

export default function AgeInputPanel({
  calendarSystem,
  onCalendarSystemChange,
  birthDate,
  onBirthDateChange,
  gender,
  onGenderChange,
  hijriDay,
  onHijriDayChange,
  hijriMonth,
  onHijriMonthChange,
  hijriYear,
  onHijriYearChange,
  useCustomReference,
  onUseCustomReferenceChange,
  referenceDate,
  onReferenceDateChange,
  error,
  onSubmit,
  onReset,
}: AgeInputPanelProps) {
  const t = useTranslations("tools.age-calculator");
  const hijriMonths = t.raw("form.hijriMonths") as string[];

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <form onSubmit={onSubmit} className="space-y-5">
        {calendarSystem === "gregorian" ? (
          <ToolInput
            label={t("form.birthDateLabel")}
            type="date"
            value={birthDate}
            onChange={(e) => onBirthDateChange(e.target.value)}
          />
        ) : (
          <div>
            <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              {t("form.birthDateLabel")}
            </span>
            <div className="grid grid-cols-3 gap-2">
              <ToolInput
                type="text"
                inputMode="numeric"
                placeholder={t("form.hijriDayPlaceholder")}
                value={hijriDay}
                onChange={(e) => onHijriDayChange(e.target.value)}
              />
              <select
                value={hijriMonth}
                onChange={(e) => onHijriMonthChange(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 bg-white px-2 py-3 text-sm text-zinc-900 outline-none focus:border-blue-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
              >
                {hijriMonths.map((name, index) => (
                  <option key={name} value={index + 1}>
                    {name}
                  </option>
                ))}
              </select>
              <ToolInput
                type="text"
                inputMode="numeric"
                placeholder={t("form.hijriYearPlaceholder")}
                value={hijriYear}
                onChange={(e) => onHijriYearChange(e.target.value)}
              />
            </div>
            <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t("form.hijriNote")}</p>
          </div>
        )}

        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t("form.calendarSystemLabel")}
          </span>
          <div className="flex gap-3">
            {(["gregorian", "hijri"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onCalendarSystemChange(value)}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  calendarSystem === value
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
                    : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                {value === "gregorian" ? t("form.calendarGregorian") : t("form.calendarHijri")}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={useCustomReference}
              onChange={(e) => onUseCustomReferenceChange(e.target.checked)}
              className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-700"
            />
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("form.customReferenceLabel")}
            </span>
          </label>

          {useCustomReference && (
            <div className="mt-3">
              <ToolInput
                type="date"
                value={referenceDate}
                onChange={(e) => onReferenceDateChange(e.target.value)}
              />
              <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t("form.customReferenceHint")}</p>
            </div>
          )}
        </div>

        <div>
          <span className="mb-2 block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            {t("form.genderLabel")}
          </span>
          <div className="flex gap-3">
            {(["male", "female"] as const).map((value) => (
              <label
                key={value}
                className={`flex flex-1 cursor-pointer items-center justify-center rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  gender === value
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-500/10 dark:text-blue-400"
                    : "border-zinc-300 text-zinc-600 hover:border-zinc-400 dark:border-zinc-700 dark:text-zinc-300"
                }`}
              >
                <input
                  type="radio"
                  name="age-gender"
                  value={value}
                  checked={gender === value}
                  onChange={() => onGenderChange(value)}
                  className="sr-only"
                />
                {value === "male" ? t("form.genderMale") : t("form.genderFemale")}
              </label>
            ))}
          </div>
          <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">{t("form.genderNote")}</p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <ToolButton type="submit">{t("form.calculate")}</ToolButton>
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl border border-zinc-300 px-6 py-3 font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            {t("form.reset")}
          </button>
        </div>
      </form>
    </div>
  );
}
