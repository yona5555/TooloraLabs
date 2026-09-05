"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { DueDateCalculator as DueDateTool } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import DueDateInputPanel from "./DueDateInputPanel";
import DueDateResult from "./DueDateResult";
import DueDateQuickReference from "./DueDateQuickReference";
import type { DueDateMethod } from "./types";

const tool = new DueDateTool();

function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default function DueDateCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.due-date-calculator.nav");
  const [method, setMethod] = useState<DueDateMethod>("lmp");
  const [date, setDate] = useState(todayISO());
  const [cycleLengthDays, setCycleLengthDays] = useState("28");

  const result = useMemo(() => {
    const cycleNum = parseInt(cycleLengthDays, 10);
    const output = tool.execute(
      { method, date, cycleLengthDays: Number.isFinite(cycleNum) ? cycleNum : -1 },
      { locale: "en-US" },
    );
    return output.data;
  }, [method, date, cycleLengthDays]);

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
            <DueDateInputPanel
              method={method}
              onMethodChange={setMethod}
              date={date}
              onDateChange={setDate}
              cycleLengthDays={cycleLengthDays}
              onCycleLengthDaysChange={setCycleLengthDays}
            />
          }
          result={<DueDateResult result={result} />}
          sidebar={<RelatedToolsSidebar currentSlug="due-date-calculator" category="health-fitness" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <DueDateQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
