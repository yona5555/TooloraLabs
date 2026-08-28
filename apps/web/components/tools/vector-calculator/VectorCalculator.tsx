"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { VectorCalculator as VectorCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import VectorInputPanel from "./VectorInputPanel";
import VectorResult from "./VectorResult";
import VectorQuickReference from "./VectorQuickReference";

const tool = new VectorCalculatorTool();

export default function VectorCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.vector-calculator.nav");

  const [ax, setAx] = useState("3");
  const [ay, setAy] = useState("4");
  const [az, setAz] = useState("0");
  const [bx, setBx] = useState("1");
  const [by, setBy] = useState("2");
  const [bz, setBz] = useState("2");

  const digitStyle: DigitStyle = resolveDigitStyle(ax, ay, az, bx, by, bz);

  const axValue = parseLocalizedNumber(ax) || 0;
  const ayValue = parseLocalizedNumber(ay) || 0;
  const azValue = parseLocalizedNumber(az) || 0;
  const bxValue = parseLocalizedNumber(bx) || 0;
  const byValue = parseLocalizedNumber(by) || 0;
  const bzValue = parseLocalizedNumber(bz) || 0;

  const result = useMemo(() => {
    const output = tool.execute(
      { ax: axValue, ay: ayValue, az: azValue, bx: bxValue, by: byValue, bz: bzValue },
      { locale: "en-US" }
    );
    return output.data;
  }, [axValue, ayValue, azValue, bxValue, byValue, bzValue]);

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
            <VectorInputPanel
              ax={ax}
              onAxChange={setAx}
              ay={ay}
              onAyChange={setAy}
              az={az}
              onAzChange={setAz}
              bx={bx}
              onBxChange={setBx}
              by={by}
              onByChange={setBy}
              bz={bz}
              onBzChange={setBz}
            />
          }
          result={<VectorResult result={result} ax={axValue} ay={ayValue} bx={bxValue} by={byValue} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="vector-calculator" category="math-science" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <VectorQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
