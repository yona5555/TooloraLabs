"use client";
import { useTranslations } from "next-intl";
import { OHMS_LAW_KNOWN_PAIRS, type OhmsLawKnownPair } from "./types";

type OhmsLawModeTabsProps = {
  knownPair: OhmsLawKnownPair;
  onKnownPairChange: (pair: OhmsLawKnownPair) => void;
};

export default function OhmsLawModeTabs({ knownPair, onKnownPairChange }: OhmsLawModeTabsProps) {
  const t = useTranslations("tools.ohms-law-calculator.form");

  return (
    <div role="tablist" aria-label={t("knownPairLabel")} className="flex flex-wrap gap-1.5">
      {OHMS_LAW_KNOWN_PAIRS.map((value) => (
        <button
          key={value}
          type="button"
          role="tab"
          aria-selected={knownPair === value}
          onClick={() => onKnownPairChange(value)}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition sm:text-sm ${
            knownPair === value
              ? "border-blue-400 bg-blue-600 text-white"
              : "border-zinc-300 text-zinc-600 hover:bg-zinc-100 hover:text-blue-600 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-blue-600"
          }`}
        >
          {t(`pair.${value}`)}
        </button>
      ))}
    </div>
  );
}
