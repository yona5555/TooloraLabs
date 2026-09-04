"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CircleCalculator as CircleTool } from "@tooloralabs/tools";
import { parseLocalizedNumber } from "@tooloralabs/core";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import CircleInputPanel from "./CircleInputPanel";
import CircleResult from "./CircleResult";
import CircleQuickReference from "./CircleQuickReference";
import type { CircleKnownField } from "./types";

const tool = new CircleTool();

export default function CircleCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.circle-calculator.nav");
  const [knownField, setKnownField] = useState<CircleKnownField>("radius");
  const [value, setValue] = useState("5");

  const digitStyle = resolveDigitStyle(value);

  const result = useMemo(() => {
    const numericValue = parseLocalizedNumber(value);
    const output = tool.execute({ knownField, value: Number.isNaN(numericValue) ? -1 : numericValue }, { locale: "en-US" });
    return output.data;
  }, [knownField, value]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={<CircleInputPanel knownField={knownField} onKnownFieldChange={setKnownField} value={value} onValueChange={setValue} />}
          result={<CircleResult result={result} knownField={knownField} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="circle-calculator" category="math" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <CircleQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
