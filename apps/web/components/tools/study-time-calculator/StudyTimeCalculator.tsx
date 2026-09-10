"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { StudyTimeCalculator as StudyTimeCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import StudyTimeInputPanel from "./StudyTimeInputPanel";
import StudyTimeResult from "./StudyTimeResult";
import StudyTimeQuickReference from "./StudyTimeQuickReference";
import type { StudySessionScenario } from "./types";

const tool = new StudyTimeCalculatorTool();

const DEFAULTS = { totalMinutes: "120", workMinutes: "25", shortBreakMinutes: "5", longBreakMinutes: "15", pomodorosBeforeLongBreak: "4" };

export default function StudyTimeCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.study-time-calculator.nav");

  const [totalMinutes, setTotalMinutes] = useState(DEFAULTS.totalMinutes);
  const [workMinutes, setWorkMinutes] = useState(DEFAULTS.workMinutes);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(DEFAULTS.shortBreakMinutes);
  const [longBreakMinutes, setLongBreakMinutes] = useState(DEFAULTS.longBreakMinutes);
  const [pomodorosBeforeLongBreak, setPomodorosBeforeLongBreak] = useState(DEFAULTS.pomodorosBeforeLongBreak);

  function handleScenarioPreset(scenario: StudySessionScenario) {
    setTotalMinutes(scenario.totalMinutes);
    setWorkMinutes(scenario.workMinutes);
    setShortBreakMinutes(scenario.shortBreakMinutes);
    setLongBreakMinutes(scenario.longBreakMinutes);
    setPomodorosBeforeLongBreak(scenario.pomodorosBeforeLongBreak);
  }

  function handleClear() {
    setTotalMinutes(DEFAULTS.totalMinutes);
    setWorkMinutes(DEFAULTS.workMinutes);
    setShortBreakMinutes(DEFAULTS.shortBreakMinutes);
    setLongBreakMinutes(DEFAULTS.longBreakMinutes);
    setPomodorosBeforeLongBreak(DEFAULTS.pomodorosBeforeLongBreak);
  }

  const digitStyle: DigitStyle = resolveDigitStyle(
    totalMinutes,
    workMinutes,
    shortBreakMinutes,
    longBreakMinutes,
    pomodorosBeforeLongBreak
  );

  const result = useMemo(() => {
    const output = tool.execute(
      {
        totalMinutes: parseLocalizedNumber(totalMinutes) || 0,
        workMinutes: parseLocalizedNumber(workMinutes) || 0,
        shortBreakMinutes: parseLocalizedNumber(shortBreakMinutes) || 0,
        longBreakMinutes: parseLocalizedNumber(longBreakMinutes) || 0,
        pomodorosBeforeLongBreak: parseLocalizedNumber(pomodorosBeforeLongBreak) || 0,
      },
      { locale: "en-US" }
    );
    return output.data;
  }, [totalMinutes, workMinutes, shortBreakMinutes, longBreakMinutes, pomodorosBeforeLongBreak]);

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
            <StudyTimeInputPanel
              totalMinutes={totalMinutes}
              onTotalMinutesChange={setTotalMinutes}
              workMinutes={workMinutes}
              onWorkMinutesChange={setWorkMinutes}
              shortBreakMinutes={shortBreakMinutes}
              onShortBreakMinutesChange={setShortBreakMinutes}
              longBreakMinutes={longBreakMinutes}
              onLongBreakMinutesChange={setLongBreakMinutes}
              pomodorosBeforeLongBreak={pomodorosBeforeLongBreak}
              onPomodorosBeforeLongBreakChange={setPomodorosBeforeLongBreak}
              onScenarioPreset={handleScenarioPreset}
              onClear={handleClear}
            />
          }
          result={<StudyTimeResult result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="study-time-calculator" category="student-productivity" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="study-time-calculator" />
              <SectionNav items={navItems} />
              <StudyTimeQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
