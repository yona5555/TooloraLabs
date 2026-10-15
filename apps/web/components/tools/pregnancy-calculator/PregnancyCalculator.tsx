"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { PregnancyCalculator as PregnancyTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import PregnancyInputPanel from "./PregnancyInputPanel";
import PregnancyResult from "./PregnancyResult";
import PregnancyWeekLadder from "./PregnancyWeekLadder";
import { PregnancyLiveContext, type PregnancyLive } from "./PregnancyLiveContext";
import { addDaysISO, clampGa, snapshotOf, todayISO, type PregSnapshot } from "./preg";
import type { PregnancyScenario } from "./types";

const tool = new PregnancyTool();

function lastPeriodDateForWeeksAlong(weeksAlong: number): string {
  return addDaysISO(todayISO(), -7 * weeksAlong);
}

const DEFAULT_WEEKS_ALONG = 10;

function compute(lastPeriodDate: string) {
  const today = todayISO();
  const data = tool.execute({ lastPeriodDate, referenceDate: today }, { locale: "en-US" }).data;
  const snap: PregSnapshot | null = data && !data.error ? snapshotOf(lastPeriodDate, today, data) : null;
  return { data, snap };
}

export default function PregnancyCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.pregnancy-calculator.nav");
  const tv = useTranslations("tools.pregnancy-calculator.visuals");
  const [lastPeriodDate, setLastPeriodDate] = useState(lastPeriodDateForWeeksAlong(DEFAULT_WEEKS_ALONG));

  function handleScenarioPreset(scenario: PregnancyScenario) {
    setLastPeriodDate(lastPeriodDateForWeeksAlong(scenario.weeksAlong));
  }

  function handleClear() {
    setLastPeriodDate(lastPeriodDateForWeeksAlong(DEFAULT_WEEKS_ALONG));
  }

  const digitStyle = resolveDigitStyle();

  // Live: every valid date updates the result at once; an invalid, future or half-typed date keeps
  // the last good result on screen, with the calculator's own error note in the Result card.
  const live = useMemo(() => compute(lastPeriodDate), [lastPeriodDate]);
  const [good, setGood] = useState<PregSnapshot>(() => compute(lastPeriodDateForWeeksAlong(DEFAULT_WEEKS_ALONG)).snap!);
  if (live.snap && good !== live.snap) setGood(live.snap);
  const shown = live.snap ?? good;

  const liveCtx = useMemo<PregnancyLive>(
    () => ({
      snap: shown,
      setGa: (days: number) => setLastPeriodDate(addDaysISO(shown.today, -clampGa(Math.round(days)))),
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
    <PregnancyLiveContext.Provider value={liveCtx}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          input={
            <div className="flex flex-col gap-4 lg:h-full">
              <PregnancyInputPanel
                lastPeriodDate={lastPeriodDate}
                onLastPeriodDateChange={setLastPeriodDate}
                onScenarioPreset={handleScenarioPreset}
                onClear={handleClear}
              />
              <PregnancyWeekLadder />
            </div>
          }
          result={
            <div className="flex flex-col gap-4 lg:h-full">
              <PregnancyResult fill snap={shown} error={live.data?.error ?? null} digitStyle={digitStyle} />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="pregnancy-calculator" category="health-fitness" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="pregnancy-calculator" />
            </div>
          }
        />
      </div>

      {education}
    </PregnancyLiveContext.Provider>
  );
}
