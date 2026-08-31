"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";
import type { HouseAffordabilityMode } from "./types";

type AffordabilityGuidelinesCardProps = {
  mode: HouseAffordabilityMode;
};

const ROWS = [
  { key: "home", modes: ["homePrice", "requiredIncome"] },
  { key: "car", modes: ["car"] },
  { key: "personal", modes: ["personal"] },
  { key: "business", modes: ["business"] },
] as const;

/**
 * Compact reference table listing every lending-guideline ratio the tool's five modes rely on,
 * with the active mode's row highlighted. Fills the vertical gap that opens up next to the result
 * card once the (much longer) input column runs past it, and directly reinforces the ratio bars
 * shown above in the result card rather than being unrelated filler.
 */
export default function AffordabilityGuidelinesCard({ mode }: AffordabilityGuidelinesCardProps) {
  const t = useTranslations("tools.house-affordability-calculator.aboveFold");

  return (
    <SectionCard title={t("guidelinesCardTitle")}>
      <ul className="flex flex-col gap-2">
        {ROWS.map((row) => {
          const active = (row.modes as readonly string[]).includes(mode);
          return (
            <li
              key={row.key}
              className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
                active
                  ? "border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200"
                  : "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-800 dark:bg-zinc-800/40 dark:text-zinc-400"
              }`}
            >
              {t(`guidelinesCard.${row.key}`)}
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}
