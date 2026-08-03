"use client";
import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { differenceInCalendarDays, intervalToDuration } from "date-fns";
import ToolInput from "@/components/tool-ui/ToolInput";

function parseISODateLocal(value: string): Date | null {
  const parts = value.split("-").map(Number);
  if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) return null;
  const [year, month, day] = parts;
  return new Date(year, month - 1, day);
}

export default function AgeMiniDateDiff() {
  const t = useTranslations("tools.age-calculator.aboveFold");
  const [isOpen, setIsOpen] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const result = useMemo(() => {
    const start = parseISODateLocal(from);
    const end = parseISODateLocal(to);
    if (!start || !end || end < start) return null;

    const duration = intervalToDuration({ start, end });
    return {
      years: duration.years ?? 0,
      months: duration.months ?? 0,
      days: duration.days ?? 0,
      totalDays: differenceInCalendarDays(end, start),
    };
  }, [from, to]);

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between px-5 py-3.5 text-sm font-semibold text-zinc-900 dark:text-zinc-100"
        aria-expanded={isOpen}
      >
        {t("miniDateDiffTitle")}
        <ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="space-y-3 border-t border-zinc-200 p-5 dark:border-zinc-800">
          <div className="grid grid-cols-2 gap-3">
            <ToolInput
              label={t("miniDateDiffFrom")}
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
            <ToolInput
              label={t("miniDateDiffTo")}
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>

          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            {result
              ? t("miniDateDiffResult", { years: result.years, months: result.months, days: result.days, totalDays: result.totalDays })
              : t("miniDateDiffPlaceholder")}
          </p>
        </div>
      )}
    </div>
  );
}
