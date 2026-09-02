"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { type DigitStyle } from "@tooloralabs/core";
import { StatisticsCalculator as StatisticsCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import StatisticsInputPanel from "./StatisticsInputPanel";
import StatisticsResult from "./StatisticsResult";
import StatisticsQuickReference from "./StatisticsQuickReference";
import { parseDataSet } from "./types";

const tool = new StatisticsCalculatorTool();

export default function StatisticsCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.statistics-calculator.nav");

  const [rawData, setRawData] = useState("2, 4, 4, 4, 5, 5, 7, 9");

  const values = useMemo(() => parseDataSet(rawData), [rawData]);
  const digitStyle: DigitStyle = resolveDigitStyle(rawData);

  const result = useMemo(() => {
    const output = tool.execute({ values }, { locale: "en-US" });
    return output.data;
  }, [values]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={<StatisticsInputPanel rawData={rawData} onRawDataChange={setRawData} />}
          result={<StatisticsResult result={result} values={values} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="statistics-calculator" category="math" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <StatisticsQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
