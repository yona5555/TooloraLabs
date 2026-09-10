"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { SleepCalculator as SleepTool } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import SleepInputPanel from "./SleepInputPanel";
import SleepResult from "./SleepResult";
import SleepQuickReference from "./SleepQuickReference";
import { timeStringToMinutes, type SleepMode, type SleepScenario } from "./types";

const tool = new SleepTool();

const DEFAULTS = { mode: "wakeUp" as SleepMode, time: "07:00", fallAsleepMinutes: "15" };

export default function SleepCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.sleep-calculator.nav");
  const [mode, setMode] = useState<SleepMode>(DEFAULTS.mode);
  const [time, setTime] = useState(DEFAULTS.time);
  const [fallAsleepMinutes, setFallAsleepMinutes] = useState(DEFAULTS.fallAsleepMinutes);

  function handleScenarioPreset(scenario: SleepScenario) {
    setMode(scenario.mode);
    setTime(scenario.time);
    setFallAsleepMinutes(scenario.fallAsleepMinutes);
  }

  function handleClear() {
    setMode(DEFAULTS.mode);
    setTime(DEFAULTS.time);
    setFallAsleepMinutes(DEFAULTS.fallAsleepMinutes);
  }

  const result = useMemo(() => {
    const timeMinutes = timeStringToMinutes(time);
    const fallAsleep = parseInt(fallAsleepMinutes, 10);
    const output = tool.execute(
      { mode, timeMinutes, fallAsleepMinutes: Number.isFinite(fallAsleep) ? fallAsleep : -1 },
      { locale: "en-US" },
    );
    return output.data;
  }, [mode, time, fallAsleepMinutes]);

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
            <SleepInputPanel
              mode={mode}
              onModeChange={setMode}
              time={time}
              onTimeChange={setTime}
              fallAsleepMinutes={fallAsleepMinutes}
              onFallAsleepMinutesChange={setFallAsleepMinutes}
              onScenarioPreset={handleScenarioPreset}
              onClear={handleClear}
            />
          }
          result={<SleepResult result={result} mode={mode} />}
          sidebar={<RelatedToolsSidebar currentSlug="sleep-calculator" category="health-fitness" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="sleep-calculator" />
              <SleepQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
