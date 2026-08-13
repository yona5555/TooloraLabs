"use client";
import { useTranslations } from "next-intl";
import type { QRErrorCorrectionLevel } from "@tooloralabs/tools";
import SectionCard from "@/components/tool-ui/SectionCard";

const LEVELS: { level: QRErrorCorrectionLevel; recovery: string }[] = [
  { level: "L", recovery: "7%" },
  { level: "M", recovery: "15%" },
  { level: "Q", recovery: "25%" },
  { level: "H", recovery: "30%" },
];

type QRCustomizePanelProps = {
  errorCorrectionLevel: QRErrorCorrectionLevel;
  onErrorCorrectionLevelChange: (level: QRErrorCorrectionLevel) => void;
  darkColor: string;
  onDarkColorChange: (color: string) => void;
  lightColor: string;
  onLightColorChange: (color: string) => void;
  lockedToHigh?: boolean;
};

export default function QRCustomizePanel({
  errorCorrectionLevel,
  onErrorCorrectionLevelChange,
  darkColor,
  onDarkColorChange,
  lightColor,
  onLightColorChange,
  lockedToHigh = false,
}: QRCustomizePanelProps) {
  const t = useTranslations("tools.qr-code-generator.customize");

  return (
    <SectionCard title={t("title")}>
      <div>
        <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("errorCorrectionLabel")}</span>
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {LEVELS.map(({ level, recovery }) => {
            const disabled = lockedToHigh && level !== "H";
            return (
              <button
                key={level}
                type="button"
                disabled={disabled}
                onClick={() => onErrorCorrectionLevelChange(level)}
                className={`flex flex-col items-center rounded-lg border px-2 py-2 text-xs font-semibold transition ${
                  errorCorrectionLevel === level
                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300"
                    : disabled
                      ? "cursor-not-allowed border-zinc-100 text-zinc-300 dark:border-zinc-800 dark:text-zinc-600"
                      : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
                }`}
              >
                <span>{level}</span>
                <span className="mt-0.5 font-normal opacity-70">{recovery}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          {lockedToHigh ? t("errorCorrectionLockedHint") : t("errorCorrectionHint")}
        </p>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4">
        <label className="block space-y-2">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("darkColorLabel")}</span>
          <input
            type="color"
            value={darkColor}
            onChange={(e) => onDarkColorChange(e.target.value)}
            className="h-11 w-full cursor-pointer rounded-lg border border-zinc-300 dark:border-zinc-700"
          />
        </label>
        <label className="block space-y-2">
          <span className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">{t("lightColorLabel")}</span>
          <input
            type="color"
            value={lightColor}
            onChange={(e) => onLightColorChange(e.target.value)}
            className="h-11 w-full cursor-pointer rounded-lg border border-zinc-300 dark:border-zinc-700"
          />
        </label>
      </div>
    </SectionCard>
  );
}
