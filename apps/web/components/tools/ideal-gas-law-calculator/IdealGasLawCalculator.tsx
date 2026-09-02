"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { IdealGasLawCalculator as IdealGasLawCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import GasLawInputPanel from "./GasLawInputPanel";
import GasLawResult from "./GasLawResult";
import GasLawQuickReference from "./GasLawQuickReference";
import type { GasLawSolveFor } from "./types";

const tool = new IdealGasLawCalculatorTool();

export default function IdealGasLawCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.ideal-gas-law-calculator.nav");

  const [solveFor, setSolveFor] = useState<GasLawSolveFor>("volume");
  const [pressureAtm, setPressureAtm] = useState("1");
  const [volumeLiters, setVolumeLiters] = useState("22.414");
  const [moles, setMoles] = useState("1");
  const [temperatureKelvin, setTemperatureKelvin] = useState("273.15");

  const digitStyle: DigitStyle = resolveDigitStyle(pressureAtm, volumeLiters, moles, temperatureKelvin);

  const result = useMemo(() => {
    const output = tool.execute(
      {
        solveFor,
        pressureAtm: parseLocalizedNumber(pressureAtm) || 0,
        volumeLiters: parseLocalizedNumber(volumeLiters) || 0,
        moles: parseLocalizedNumber(moles) || 0,
        temperatureKelvin: parseLocalizedNumber(temperatureKelvin) || 0,
      },
      { locale: "en-US" }
    );
    return output.data;
  }, [solveFor, pressureAtm, volumeLiters, moles, temperatureKelvin]);

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
            <GasLawInputPanel
              solveFor={solveFor}
              onSolveForChange={setSolveFor}
              pressureAtm={pressureAtm}
              onPressureAtmChange={setPressureAtm}
              volumeLiters={volumeLiters}
              onVolumeLitersChange={setVolumeLiters}
              moles={moles}
              onMolesChange={setMoles}
              temperatureKelvin={temperatureKelvin}
              onTemperatureKelvinChange={setTemperatureKelvin}
            />
          }
          result={<GasLawResult result={result} solveFor={solveFor} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="ideal-gas-law-calculator" category="chemistry" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <GasLawQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
