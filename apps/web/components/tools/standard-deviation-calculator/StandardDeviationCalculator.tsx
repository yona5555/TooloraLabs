"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { StandardDeviationCalculator as StandardDeviationTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import StandardDeviationInputPanel from "./StandardDeviationInputPanel";
import StandardDeviationResult from "./StandardDeviationResult";
import StandardDeviationQuickReference from "./StandardDeviationQuickReference";
import { SdLiveProvider } from "./SdLiveContext";
import { parseDataSet, STANDARD_DEVIATION_SCENARIOS } from "./types";

const tool = new StandardDeviationTool();
const DEFAULT_DATA = "2, 4, 4, 4, 5, 5, 7, 9";

export default function StandardDeviationCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.standard-deviation-calculator.nav");
  const tScenarios = useTranslations("tools.standard-deviation-calculator.scenarios");
  const tCommon = useTranslations("common.live3d");
  const [rawData, setRawData] = useState(DEFAULT_DATA);
  const [activeExample, setActiveExample] = useState<string | null>("classic");

  function change(next: string) {
    setRawData(next);
    setActiveExample(null);
  }

  function handlePick(id: string) {
    const scenario = STANDARD_DEVIATION_SCENARIOS.find((s) => s.key === id);
    if (!scenario) return;
    setRawData(scenario.rawData);
    setActiveExample(id);
  }

  function handleClear() {
    setRawData(DEFAULT_DATA);
    setActiveExample("classic");
  }

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
    <SdLiveProvider value={{ dims: { rawData }, setDim: (key, value) => key === "rawData" && change(value as string) }}>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <StandardDeviationInputPanel rawData={rawData} onRawDataChange={change} onClear={handleClear} />
              <QuickExamplesCard
                title={tCommon("quickExamples")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={handlePick}
                examples={STANDARD_DEVIATION_SCENARIOS.map((s) => ({ id: s.key, label: tScenarios(s.key), detail: `{${s.rawData}}` }))}
              />
            </div>
          }
          result={<StandardDeviationResult result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="standard-deviation-calculator" category="math" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ViewDocsLink slug="standard-deviation-calculator" />
              <StandardDeviationQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </SdLiveProvider>
  );
}
