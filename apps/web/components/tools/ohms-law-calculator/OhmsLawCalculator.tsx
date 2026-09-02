"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { OhmsLawCalculator as OhmsLawCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import OhmsLawInputPanel from "./OhmsLawInputPanel";
import OhmsLawResult from "./OhmsLawResult";
import OhmsLawQuickReference from "./OhmsLawQuickReference";
import type { OhmsLawKnownPair } from "./types";

const tool = new OhmsLawCalculatorTool();

export default function OhmsLawCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.ohms-law-calculator.nav");

  const [knownPair, setKnownPair] = useState<OhmsLawKnownPair>("VI");
  const [voltage, setVoltage] = useState("12");
  const [current, setCurrent] = useState("2");
  const [resistance, setResistance] = useState("6");
  const [power, setPower] = useState("24");

  const digitStyle: DigitStyle = resolveDigitStyle(voltage, current, resistance, power);

  const result = useMemo(() => {
    const output = tool.execute(
      {
        knownPair,
        voltage: parseLocalizedNumber(voltage) || 0,
        current: parseLocalizedNumber(current) || 0,
        resistance: parseLocalizedNumber(resistance) || 0,
        power: parseLocalizedNumber(power) || 0,
      },
      { locale: "en-US" }
    );
    return output.data;
  }, [knownPair, voltage, current, resistance, power]);

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
            <OhmsLawInputPanel
              knownPair={knownPair}
              onKnownPairChange={setKnownPair}
              voltage={voltage}
              onVoltageChange={setVoltage}
              current={current}
              onCurrentChange={setCurrent}
              resistance={resistance}
              onResistanceChange={setResistance}
              power={power}
              onPowerChange={setPower}
            />
          }
          result={<OhmsLawResult result={result} knownPair={knownPair} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="ohms-law-calculator" category="physics" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <OhmsLawQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
