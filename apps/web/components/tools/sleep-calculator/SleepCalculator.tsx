"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { SleepCalculator as SleepTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import SleepInputPanel from "./SleepInputPanel";
import SleepResult from "./SleepResult";
import SleepTimeLadder from "./SleepTimeLadder";
import { SleepLiveContext, type SleepLive } from "./SleepLiveContext";
import { nightsFor, type SleepSnapshot } from "./sleep";
import { minutesToTimeString, timeStringToMinutes, type SleepMode, type SleepScenario } from "./types";

const tool = new SleepTool();

const DEFAULTS = { mode: "wakeUp" as SleepMode, time: "07:00", fallAsleepMinutes: "15" };

function compute(mode: SleepMode, time: string, fallAsleepMinutes: string) {
  const timeMinutes = timeStringToMinutes(time);
  const fallAsleep = parseInt(fallAsleepMinutes, 10);
  const latency = Number.isFinite(fallAsleep) ? fallAsleep : -1;
  const data = tool.execute({ mode, timeMinutes, fallAsleepMinutes: latency }, { locale: "en-US" }).data;
  return { data, timeMinutes, latency };
}

function snapshotOf(mode: SleepMode, time: string, fallAsleepMinutes: string): SleepSnapshot | null {
  const { data, timeMinutes, latency } = compute(mode, time, fallAsleepMinutes);
  if (!data || data.error) return null;
  return { mode, anchor: timeMinutes, latency, nights: nightsFor(mode, timeMinutes, latency, data.options) };
}

export default function SleepCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.sleep-calculator.nav");
  const tv = useTranslations("tools.sleep-calculator.visuals");
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

  // Live: every valid edit updates the result at once; an invalid or half-typed field keeps the
  // last good result on screen, with the calculator's own error note in the Result card.
  const live = useMemo(() => compute(mode, time, fallAsleepMinutes), [mode, time, fallAsleepMinutes]);
  const liveSnap = useMemo(() => snapshotOf(mode, time, fallAsleepMinutes), [mode, time, fallAsleepMinutes]);
  const [good, setGood] = useState<SleepSnapshot>(() => snapshotOf(DEFAULTS.mode, DEFAULTS.time, DEFAULTS.fallAsleepMinutes)!);
  if (liveSnap && good !== liveSnap) setGood(liveSnap);
  const shown = liveSnap ?? good;

  const liveCtx = useMemo<SleepLive>(
    () => ({
      snap: shown,
      setAnchor: (m: number) => setTime(minutesToTimeString(((Math.round(m) % 1440) + 1440) % 1440)),
      setLatency: (m: number) => setFallAsleepMinutes(String(Math.round(m))),
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
    <SleepLiveContext.Provider value={liveCtx}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          input={
            <div className="flex flex-col gap-4 lg:h-full">
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
              <SleepTimeLadder />
            </div>
          }
          result={
            <div className="flex flex-col gap-4 lg:h-full">
              <SleepResult fill snap={shown} error={live.data?.error ?? null} digitStyle={resolveDigitStyle(fallAsleepMinutes)} />
            </div>
          }
          sidebar={<RelatedToolsSidebar currentSlug="sleep-calculator" category="health-fitness" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="sleep-calculator" />
            </div>
          }
        />
      </div>

      {education}
    </SleepLiveContext.Provider>
  );
}
