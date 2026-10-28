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
import { addDaysISO, clampGa, snapshotOf, type PregSnapshot } from "./preg";
import { useTodayISO } from "@/lib/use-today";
import type { PregnancyScenario } from "./types";

const tool = new PregnancyTool();

function lastPeriodDateForWeeksAlong(today: string, weeksAlong: number): string {
  return addDaysISO(today, -7 * weeksAlong);
}

const DEFAULT_WEEKS_ALONG = 10;

function compute(lastPeriodDate: string, today: string) {
  const data = tool.execute({ lastPeriodDate, referenceDate: today }, { locale: "en-US" }).data;
  const snap: PregSnapshot | null = data && !data.error ? snapshotOf(lastPeriodDate, today, data) : null;
  return { data, snap };
}

export default function PregnancyCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.pregnancy-calculator.nav");
  const tv = useTranslations("tools.pregnancy-calculator.visuals");
  // Today comes from useTodayISO (the render day while hydrating, then the browser's day); an untouched
  // date stays relative to it (null = the default), so the first client render matches the HTML.
  const today = useTodayISO();
  const [pickedDate, setLastPeriodDate] = useState<string | null>(null);
  const lastPeriodDate = pickedDate ?? lastPeriodDateForWeeksAlong(today, DEFAULT_WEEKS_ALONG);

  function handleScenarioPreset(scenario: PregnancyScenario) {
    setLastPeriodDate(lastPeriodDateForWeeksAlong(today, scenario.weeksAlong));
  }

  function handleClear() {
    setLastPeriodDate(null);
  }

  const digitStyle = resolveDigitStyle();

  // Live: every valid date updates the result at once; an invalid, future or half-typed date keeps
  // the last good result on screen, with the calculator's own error note in the Result card.
  const live = useMemo(() => compute(lastPeriodDate, today), [lastPeriodDate, today]);
  const [good, setGood] = useState<PregSnapshot>(() => compute(lastPeriodDateForWeeksAlong(today, DEFAULT_WEEKS_ALONG), today).snap!);
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
