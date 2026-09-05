"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { PregnancyCalculator as PregnancyTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import PregnancyInputPanel from "./PregnancyInputPanel";
import PregnancyResult from "./PregnancyResult";
import PregnancyQuickReference from "./PregnancyQuickReference";

const tool = new PregnancyTool();

function todayISO(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function defaultLastPeriodDate(): string {
  const now = new Date();
  now.setDate(now.getDate() - 7 * 10); // default to ~10 weeks along, for a meaningful preview
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

export default function PregnancyCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.pregnancy-calculator.nav");
  const [lastPeriodDate, setLastPeriodDate] = useState(defaultLastPeriodDate());

  const digitStyle = resolveDigitStyle();

  const result = useMemo(() => {
    const output = tool.execute({ lastPeriodDate, referenceDate: todayISO() }, { locale: "en-US" });
    return output.data;
  }, [lastPeriodDate]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={<PregnancyInputPanel lastPeriodDate={lastPeriodDate} onLastPeriodDateChange={setLastPeriodDate} />}
          result={<PregnancyResult result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="pregnancy-calculator" category="health-fitness" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <PregnancyQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
