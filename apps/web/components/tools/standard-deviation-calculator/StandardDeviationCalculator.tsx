"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { StandardDeviationCalculator as StandardDeviationTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import StandardDeviationInputPanel from "./StandardDeviationInputPanel";
import StandardDeviationResult from "./StandardDeviationResult";
import StandardDeviationQuickReference from "./StandardDeviationQuickReference";
import { parseDataSet } from "./types";

const tool = new StandardDeviationTool();
const DEFAULT_DATA = "2, 4, 4, 4, 5, 5, 7, 9";

export default function StandardDeviationCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.standard-deviation-calculator.nav");
  const [rawData, setRawData] = useState(DEFAULT_DATA);

  const digitStyle = resolveDigitStyle(rawData);

  const result = useMemo(() => {
    const values = parseDataSet(rawData);
    const output = tool.execute({ values }, { locale: "en-US" });
    return output.data;
  }, [rawData]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={<StandardDeviationInputPanel rawData={rawData} onRawDataChange={setRawData} />}
          result={<StandardDeviationResult result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="standard-deviation-calculator" category="math" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <StandardDeviationQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
