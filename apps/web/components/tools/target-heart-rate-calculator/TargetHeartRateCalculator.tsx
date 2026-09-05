"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { TargetHeartRateCalculator as TargetHeartRateTool } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import TargetHeartRateInputPanel from "./TargetHeartRateInputPanel";
import TargetHeartRateResult from "./TargetHeartRateResult";
import TargetHeartRateQuickReference from "./TargetHeartRateQuickReference";

const tool = new TargetHeartRateTool();

function toNum(s: string): number | undefined {
  if (!s.trim()) return undefined;
  const n = parseLocalizedNumber(s);
  return Number.isNaN(n) ? undefined : n;
}

export default function TargetHeartRateCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.target-heart-rate-calculator.nav");
  const [age, setAge] = useState("30");
  const [useRestingHeartRate, setUseRestingHeartRate] = useState(false);
  const [restingHeartRate, setRestingHeartRate] = useState("60");

  const digitStyle = resolveDigitStyle(age, restingHeartRate);

  const result = useMemo(() => {
    const ageNum = toNum(age) ?? -1;
    const restingNum = useRestingHeartRate ? toNum(restingHeartRate) : undefined;
    const output = tool.execute({ age: ageNum, restingHeartRate: restingNum }, { locale: "en-US" });
    return output.data;
  }, [age, useRestingHeartRate, restingHeartRate]);

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
            <TargetHeartRateInputPanel
              age={age}
              onAgeChange={setAge}
              useRestingHeartRate={useRestingHeartRate}
              onUseRestingHeartRateChange={setUseRestingHeartRate}
              restingHeartRate={restingHeartRate}
              onRestingHeartRateChange={setRestingHeartRate}
            />
          }
          result={<TargetHeartRateResult result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="target-heart-rate-calculator" category="health-fitness" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <TargetHeartRateQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
