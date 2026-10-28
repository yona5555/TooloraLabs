"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { DueDateCalculator as DueDateTool } from "@tooloralabs/tools";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import DueDateInputPanel from "./DueDateInputPanel";
import DueDateResult from "./DueDateResult";
import DueDateKeyDates from "./DueDateKeyDates";
import { DueDateLiveContext, type DueLive } from "./DueDateLiveContext";
import { snapOf, type DueSnap } from "./dueDate";
import { shiftISO, useTodayISO } from "@/lib/use-today";
import type { DueDateMethod, DueDateScenario } from "./types";

const tool = new DueDateTool();

/** Instant result on load: the "Typical Cycle (LMP)" example, an LMP 10 weeks ago (10+0). */
const DEFAULTS = { method: "lmp" as DueDateMethod, daysAgo: 70, cycleLengthDays: "28" };

function compute(method: DueDateMethod, date: string, cycleLengthDays: string, today: string) {
  const cycleNum = parseInt(cycleLengthDays, 10);
  const cycle = Number.isFinite(cycleNum) ? cycleNum : -1;
  const data = tool.execute({ method, date, cycleLengthDays: cycle, referenceDate: today }, { locale: "en-US" }).data;
  const snap: DueSnap | null = data && !data.error ? snapOf(method, date, cycle, data) : null;
  return { data, snap };
}

export default function DueDateCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.due-date-calculator.nav");
  const tv = useTranslations("tools.due-date-calculator.visuals");
  // Today comes from useTodayISO (the render day while hydrating, then the browser's day); an untouched
  // date stays relative to it (null = the default), so the first client render matches the HTML.
  const today = useTodayISO();
  const [method, setMethod] = useState<DueDateMethod>(DEFAULTS.method);
  const [pickedDate, setDate] = useState<string | null>(null);
  const date = pickedDate ?? shiftISO(today, -DEFAULTS.daysAgo);
  const [cycleLengthDays, setCycleLengthDays] = useState(DEFAULTS.cycleLengthDays);

  function handleScenarioPreset(scenario: DueDateScenario) {
    setMethod(scenario.method);
    setDate(shiftISO(today, -scenario.daysAgo));
    setCycleLengthDays(scenario.cycleLengthDays);
  }

  function handleClear() {
    setMethod(DEFAULTS.method);
    setDate(null);
    setCycleLengthDays(DEFAULTS.cycleLengthDays);
  }

  // Live: every valid edit updates the result at once; an invalid or half-typed field keeps the
  // last good result on screen, with the calculator's own error note in the Result card.
  const live = useMemo(() => compute(method, date, cycleLengthDays, today), [method, date, cycleLengthDays, today]);
  const [good, setGood] = useState<DueSnap>(() => compute(DEFAULTS.method, shiftISO(today, -DEFAULTS.daysAgo), DEFAULTS.cycleLengthDays, today).snap!);
  if (live.snap && good !== live.snap) setGood(live.snap);
  const shown = live.snap ?? good;

  const liveCtx = useMemo<DueLive>(() => ({ snap: shown, setCycle: (d: number) => setCycleLengthDays(String(Math.round(d))) }), [shown]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
    { id: "notices", label: tv("notices.title") },
  ];

  return (
    <DueDateLiveContext.Provider value={liveCtx}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          input={
            <div className="flex flex-col gap-4 lg:h-full">
              <DueDateInputPanel
                method={method}
                onMethodChange={setMethod}
                date={date}
                onDateChange={setDate}
                cycleLengthDays={cycleLengthDays}
                onCycleLengthDaysChange={setCycleLengthDays}
                onScenarioPreset={handleScenarioPreset}
                onClear={handleClear}
              />
              <DueDateKeyDates />
            </div>
          }
          result={
            <div className="flex flex-col gap-4 lg:h-full">
              <DueDateResult fill snap={shown} error={live.data?.error ?? null} />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="due-date-calculator" category="health-fitness" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="due-date-calculator" />
            </div>
          }
        />
      </div>

      {education}
    </DueDateLiveContext.Provider>
  );
}
