"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { MolarityCalculator as MolarityCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import MolarityInputPanel from "./MolarityInputPanel";
import MolarityResult from "./MolarityResult";
import MolarityQuickReference from "./MolarityQuickReference";
import type { ConcentrationBasis, DilutionSolveFor, MolarityMode } from "./types";

const tool = new MolarityCalculatorTool();

export default function MolarityCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.molarity-calculator.nav");

  const [mode, setMode] = useState<MolarityMode>("concentration");
  const [concentrationBasis, setConcentrationBasis] = useState<ConcentrationBasis>("moles");
  const [moles, setMoles] = useState("0.5");
  const [massGrams, setMassGrams] = useState("58.44");
  const [molarMass, setMolarMass] = useState("58.44");
  const [volumeLiters, setVolumeLiters] = useState("2");
  const [dilutionSolveFor, setDilutionSolveFor] = useState<DilutionSolveFor>("c2");
  const [c1, setC1] = useState("2");
  const [v1, setV1] = useState("0.5");
  const [c2, setC2] = useState("1");
  const [v2, setV2] = useState("1");

  const digitStyle: DigitStyle = resolveDigitStyle(moles, massGrams, molarMass, volumeLiters, c1, v1, c2, v2);

  const result = useMemo(() => {
    const output = tool.execute(
      {
        mode,
        concentrationBasis,
        moles: parseLocalizedNumber(moles) || 0,
        massGrams: parseLocalizedNumber(massGrams) || 0,
        molarMass: parseLocalizedNumber(molarMass) || 0,
        volumeLiters: parseLocalizedNumber(volumeLiters) || 0,
        dilutionSolveFor,
        c1: parseLocalizedNumber(c1) || 0,
        v1: parseLocalizedNumber(v1) || 0,
        c2: parseLocalizedNumber(c2) || 0,
        v2: parseLocalizedNumber(v2) || 0,
      },
      { locale: "en-US" }
    );
    return output.data;
  }, [mode, concentrationBasis, moles, massGrams, molarMass, volumeLiters, dilutionSolveFor, c1, v1, c2, v2]);

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
            <MolarityInputPanel
              mode={mode}
              onModeChange={setMode}
              concentrationBasis={concentrationBasis}
              onConcentrationBasisChange={setConcentrationBasis}
              moles={moles}
              onMolesChange={setMoles}
              massGrams={massGrams}
              onMassGramsChange={setMassGrams}
              molarMass={molarMass}
              onMolarMassChange={setMolarMass}
              volumeLiters={volumeLiters}
              onVolumeLitersChange={setVolumeLiters}
              dilutionSolveFor={dilutionSolveFor}
              onDilutionSolveForChange={setDilutionSolveFor}
              c1={c1}
              onC1Change={setC1}
              v1={v1}
              onV1Change={setV1}
              c2={c2}
              onC2Change={setC2}
              v2={v2}
              onV2Change={setV2}
            />
          }
          result={<MolarityResult result={result} mode={mode} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="molarity-calculator" category="math-science" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <MolarityQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
