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
import OvulationKeyDates from "./OvulationKeyDates";
import { OvulationLiveContext, type OvLive } from "./OvulationLiveContext";
import { snapOf, type OvSnap } from "./ovulation";
import type { OvulationScenario } from "./types";
import { shiftISO, useTodayISO } from "@/lib/use-today";

const tool = new OvulationTool();

/**
 * Instant result on load: the "Typical 28-Day Cycle" example (last period 5 days ago, 28-day
 * cycle, 14-day luteal phase), so today sits inside the cycle on the wheel and the cards.
 */
const DEFAULTS = { daysAgo: 5, cycleLengthDays: "28", lutealPhaseDays: "14" };

function compute(lastPeriodDate: string, cycleLengthDays: string, lutealPhaseDays: string, today: string) {
  const cycleNum = parseInt(cycleLengthDays, 10);
  const lutealNum = parseInt(lutealPhaseDays, 10);
  const cycle = Number.isFinite(cycleNum) ? cycleNum : -1;
  const luteal = Number.isFinite(lutealNum) ? lutealNum : -1;
  const data = tool.execute({ lastPeriodDate, cycleLengthDays: cycle, lutealPhaseDays: luteal }, { locale: "en-US" }).data;
  const snap: OvSnap | null = data && !data.error && data.cycles.length ? snapOf(lastPeriodDate, cycle, luteal, data, today) : null;
  return { data, snap };
}

export default function OvulationCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.ovulation-calculator.nav");
  const tv = useTranslations("tools.ovulation-calculator.visuals");
  // Today comes from useTodayISO (the render day while hydrating, then the browser's day); an untouched
  // date stays relative to it (null = the default), so the first client render matches the HTML.
  const today = useTodayISO();
  const [pickedDate, setLastPeriodDate] = useState<string | null>(null);
  const lastPeriodDate = pickedDate ?? shiftISO(today, -DEFAULTS.daysAgo);
  const [cycleLengthDays, setCycleLengthDays] = useState(DEFAULTS.cycleLengthDays);
  const [lutealPhaseDays, setLutealPhaseDays] = useState(DEFAULTS.lutealPhaseDays);

  function handleScenarioPreset(scenario: OvulationScenario) {
    setLastPeriodDate(shiftISO(today, -scenario.daysAgo));
    setCycleLengthDays(scenario.cycleLengthDays);
    setLutealPhaseDays(scenario.lutealPhaseDays);
  }

  function handleClear() {
    setLastPeriodDate(null);
    setCycleLengthDays(DEFAULTS.cycleLengthDays);
    setLutealPhaseDays(DEFAULTS.lutealPhaseDays);
  }

  // Live: every valid edit updates the result at once; an invalid or half-typed field keeps the
  // last good result on screen, with the calculator's own error note in the Result card.
  const live = useMemo(() => compute(lastPeriodDate, cycleLengthDays, lutealPhaseDays, today), [lastPeriodDate, cycleLengthDays, lutealPhaseDays, today]);
  const [good, setGood] = useState<OvSnap>(() => compute(shiftISO(today, -DEFAULTS.daysAgo), DEFAULTS.cycleLengthDays, DEFAULTS.lutealPhaseDays, today).snap!);
  if (live.snap && good !== live.snap) setGood(live.snap);
  const shown = live.snap ?? good;

  const liveCtx = useMemo<OvLive>(
    () => ({
      snap: shown,
      setCycle: (d: number) => setCycleLengthDays(String(Math.round(d))),
      setLuteal: (d: number) => setLutealPhaseDays(String(Math.round(d))),
    }),
    [shown],
  );

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
    { id: "notices", label: tv("notices.title") },
  ];

  return (
    <OvulationLiveContext.Provider value={liveCtx}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          input={
            <div className="flex flex-col gap-4 lg:h-full">
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
              <OvulationKeyDates />
            </div>
          }
          result={
            <div className="flex flex-col gap-4 lg:h-full">
              <OvulationResult fill snap={shown} error={live.data?.error ?? null} />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="ovulation-calculator" category="health-fitness" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="ovulation-calculator" />
            </div>
          }
        />
      </div>

      {education}
    </OvulationLiveContext.Provider>
  );
}
