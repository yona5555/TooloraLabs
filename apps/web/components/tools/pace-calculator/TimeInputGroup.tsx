"use client";
import { useTranslations } from "next-intl";

type TimeInputGroupProps = {
  label: string;
  hours: string;
  minutes: string;
  seconds: string;
  onHoursChange: (value: string) => void;
  onMinutesChange: (value: string) => void;
  onSecondsChange: (value: string) => void;
};

const DIGIT_ONLY_CHAR = /[0-9٠-٩۰-۹]/;

function sanitize(value: string): string {
  return Array.from(value)
    .filter((char) => DIGIT_ONLY_CHAR.test(char))
    .join("");
}

const fieldClass =
  "w-full rounded-xl border border-zinc-300 bg-white px-3 py-3 text-center text-lg text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:border-blue-500 dark:focus:ring-blue-500/20";

export default function TimeInputGroup({ label, hours, minutes, seconds, onHoursChange, onMinutesChange, onSecondsChange }: TimeInputGroupProps) {
  const t = useTranslations("tools.pace-calculator.form");

  return (
    <div className="space-y-2">
      <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{label}</span>
      <div dir="ltr" className="grid grid-cols-3 gap-2">
        <div>
          <input
            type="text"
            inputMode="numeric"
            value={hours}
            onChange={(e) => onHoursChange(sanitize(e.target.value))}
            className={fieldClass}
            aria-label={t("hours")}
          />
          <span className="mt-1 block text-center text-xs text-zinc-500 dark:text-zinc-400">{t("hours")}</span>
        </div>
        <div>
          <input
            type="text"
            inputMode="numeric"
            value={minutes}
            onChange={(e) => onMinutesChange(sanitize(e.target.value))}
            className={fieldClass}
            aria-label={t("minutes")}
          />
          <span className="mt-1 block text-center text-xs text-zinc-500 dark:text-zinc-400">{t("minutes")}</span>
        </div>
        <div>
          <input
            type="text"
            inputMode="numeric"
            value={seconds}
            onChange={(e) => onSecondsChange(sanitize(e.target.value))}
            className={fieldClass}
            aria-label={t("seconds")}
          />
          <span className="mt-1 block text-center text-xs text-zinc-500 dark:text-zinc-400">{t("seconds")}</span>
        </div>
      </div>
    </div>
  );
}
