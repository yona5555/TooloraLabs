"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { TimeCalculator as TimeTool } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import TimeInputPanel from "./TimeInputPanel";
import TimeResult from "./TimeResult";
import TimeQuickReference from "./TimeQuickReference";
import type { TimeOperation } from "./types";

const tool = new TimeTool();

function toInt(s: string): number {
  if (!s.trim()) return 0;
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : -1;
}

export default function TimeCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.time-calculator.nav");
  const [h1, setH1] = useState("1");
  const [m1, setM1] = useState("30");
  const [s1, setS1] = useState("0");
  const [h2, setH2] = useState("0");
  const [m2, setM2] = useState("45");
  const [s2, setS2] = useState("0");
  const [operation, setOperation] = useState<TimeOperation>("add");

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
            />
          }
          result={<TimeResult result={result} />}
          sidebar={<RelatedToolsSidebar currentSlug="time-calculator" category="date-time" />}
          secondary={
            <div className="flex flex-col gap-6">
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
