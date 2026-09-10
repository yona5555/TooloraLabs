"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { OvulationCalculator as OvulationTool } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import OvulationInputPanel from "./OvulationInputPanel";
import OvulationResult from "./OvulationResult";
import OvulationQuickReference from "./OvulationQuickReference";
import type { OvulationScenario } from "./types";

const tool = new OvulationTool();

function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function isoDaysAgo(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const DEFAULTS = { cycleLengthDays: "28", lutealPhaseDays: "14" };

export default function OvulationCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.ovulation-calculator.nav");
  const [lastPeriodDate, setLastPeriodDate] = useState(todayISO());
  const [cycleLengthDays, setCycleLengthDays] = useState(DEFAULTS.cycleLengthDays);
  const [lutealPhaseDays, setLutealPhaseDays] = useState(DEFAULTS.lutealPhaseDays);

  function handleScenarioPreset(scenario: OvulationScenario) {
    setLastPeriodDate(isoDaysAgo(scenario.daysAgo));
    setCycleLengthDays(scenario.cycleLengthDays);
    setLutealPhaseDays(scenario.lutealPhaseDays);
  }

  function handleClear() {
    setLastPeriodDate(todayISO());
    setCycleLengthDays(DEFAULTS.cycleLengthDays);
    setLutealPhaseDays(DEFAULTS.lutealPhaseDays);
  }

  const result = useMemo(() => {
    const cycleNum = parseInt(cycleLengthDays, 10);
    const lutealNum = parseInt(lutealPhaseDays, 10);
    const output = tool.execute(
      {
        lastPeriodDate,
        cycleLengthDays: Number.isFinite(cycleNum) ? cycleNum : -1,
        lutealPhaseDays: Number.isFinite(lutealNum) ? lutealNum : -1,
      },
      { locale: "en-US" },
    );
    return output.data;
  }, [lastPeriodDate, cycleLengthDays, lutealPhaseDays]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <OvulationInputPanel
              lastPeriodDate={lastPeriodDate}
              onLastPeriodDateChange={setLastPeriodDate}
              cycleLengthDays={cycleLengthDays}
              onCycleLengthDaysChange={setCycleLengthDays}
              lutealPhaseDays={lutealPhaseDays}
              onLutealPhaseDaysChange={setLutealPhaseDays}
              onScenarioPreset={handleScenarioPreset}
              onClear={handleClear}
            />
          }
          result={<OvulationResult result={result} />}
          sidebar={<RelatedToolsSidebar currentSlug="ovulation-calculator" category="health-fitness" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="ovulation-calculator" />
              <OvulationQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
