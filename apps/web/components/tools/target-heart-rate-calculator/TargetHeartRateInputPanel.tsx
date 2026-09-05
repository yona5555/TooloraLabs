"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import ToolInput from "@/components/tool-ui/ToolInput";

type Props = {
  age: string;
  onAgeChange: (value: string) => void;
  useRestingHeartRate: boolean;
  onUseRestingHeartRateChange: (value: boolean) => void;
  restingHeartRate: string;
  onRestingHeartRateChange: (value: string) => void;
};

export default function TargetHeartRateInputPanel({
  age,
  onAgeChange,
  useRestingHeartRate,
  onUseRestingHeartRateChange,
  restingHeartRate,
  onRestingHeartRateChange,
}: Props) {
  const t = useTranslations("tools.target-heart-rate-calculator.form");

  return (
    <SectionCard title={t("inputTitle")}>
      <div className="space-y-3">
        <ToolInput label={t("age")} type="text" inputMode="numeric" value={age} onChange={(e) => onAgeChange(e.target.value)} />

        <label className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={useRestingHeartRate}
            onChange={(e) => onUseRestingHeartRateChange(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-300 text-blue-600 focus:ring-blue-500 dark:border-zinc-600"
          />
          {t("useRestingHeartRate")}
        </label>

        {useRestingHeartRate && (
          <ToolInput
            label={t("restingHeartRate")}
            type="text"
            inputMode="numeric"
            value={restingHeartRate}
            onChange={(e) => onRestingHeartRateChange(e.target.value)}
          />
        )}
      </div>
      <p className="mt-3 text-xs text-zinc-500 dark:text-zinc-400">{useRestingHeartRate ? t("hintKarvonen") : t("hintSimple")}</p>
    </SectionCard>
  );
}
