"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { TimeCalculator as TimeTool } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import TimeInputPanel from "./TimeInputPanel";
import TimeResult from "./TimeResult";
import TimeQuickReference from "./TimeQuickReference";
import type { TimeOperation, TimeScenario } from "./types";

const tool = new TimeTool();

function toInt(s: string): number {
  if (!s.trim()) return 0;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : -1;
}

const DEFAULTS = { h1: "1", m1: "30", s1: "0", h2: "0", m2: "45", s2: "0", operation: "add" as TimeOperation };

export default function TimeCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.time-calculator.nav");
  const [h1, setH1] = useState(DEFAULTS.h1);
  const [m1, setM1] = useState(DEFAULTS.m1);
  const [s1, setS1] = useState(DEFAULTS.s1);
  const [h2, setH2] = useState(DEFAULTS.h2);
  const [m2, setM2] = useState(DEFAULTS.m2);
  const [s2, setS2] = useState(DEFAULTS.s2);
  const [operation, setOperation] = useState<TimeOperation>(DEFAULTS.operation);

  function handleScenarioPreset(scenario: TimeScenario) {
    setH1(scenario.h1); setM1(scenario.m1); setS1(scenario.s1);
    setH2(scenario.h2); setM2(scenario.m2); setS2(scenario.s2);
    setOperation(scenario.operation);
  }

  function handleClear() {
    setH1(DEFAULTS.h1); setM1(DEFAULTS.m1); setS1(DEFAULTS.s1);
    setH2(DEFAULTS.h2); setM2(DEFAULTS.m2); setS2(DEFAULTS.s2);
    setOperation(DEFAULTS.operation);
  }

  const result = useMemo(() => {
    const output = tool.execute(
      {
        time1: { hours: toInt(h1), minutes: toInt(m1), seconds: toInt(s1) },
        time2: { hours: toInt(h2), minutes: toInt(m2), seconds: toInt(s2) },
        operation,
      },
      { locale: "en-US" },
    );
    return output.data;
  }, [h1, m1, s1, h2, m2, s2, operation]);

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
            <TimeInputPanel
              h1={h1} m1={m1} s1={s1} onH1Change={setH1} onM1Change={setM1} onS1Change={setS1}
              h2={h2} m2={m2} s2={s2} onH2Change={setH2} onM2Change={setM2} onS2Change={setS2}
              operation={operation} onOperationChange={setOperation}
              onScenarioPreset={handleScenarioPreset} onClear={handleClear}
            />
          }
          result={<TimeResult result={result} />}
          sidebar={<RelatedToolsSidebar currentSlug="time-calculator" category="date-time" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="time-calculator" />
              <SectionNav items={navItems} />
              <TimeQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
