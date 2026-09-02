"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { EnergyWorkPowerCalculator as EnergyWorkPowerCalculatorTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import EnergyInputPanel from "./EnergyInputPanel";
import EnergyResult from "./EnergyResult";
import EnergyQuickReference from "./EnergyQuickReference";
import type { EnergyWorkPowerMode } from "./types";

const tool = new EnergyWorkPowerCalculatorTool();

export default function EnergyWorkPowerCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.energy-work-power-calculator.nav");

  const [mode, setMode] = useState<EnergyWorkPowerMode>("work");
  const [force, setForce] = useState("10");
  const [distance, setDistance] = useState("5");
  const [angleDegrees, setAngleDegrees] = useState("0");
  const [mass, setMass] = useState("2");
  const [velocity, setVelocity] = useState("3");
  const [height, setHeight] = useState("5");
  const [workValue, setWorkValue] = useState("100");
  const [time, setTime] = useState("10");

  const digitStyle: DigitStyle = resolveDigitStyle(force, distance, angleDegrees, mass, velocity, height, workValue, time);

  const result = useMemo(() => {
    const output = tool.execute(
      {
        mode,
        force: parseLocalizedNumber(force) || 0,
        distance: parseLocalizedNumber(distance) || 0,
        angleDegrees: parseLocalizedNumber(angleDegrees) || 0,
        mass: parseLocalizedNumber(mass) || 0,
        velocity: parseLocalizedNumber(velocity) || 0,
        height: parseLocalizedNumber(height) || 0,
        workValue: parseLocalizedNumber(workValue) || 0,
        time: parseLocalizedNumber(time) || 0,
      },
      { locale: "en-US" }
    );
    return output.data;
  }, [mode, force, distance, angleDegrees, mass, velocity, height, workValue, time]);

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
            <EnergyInputPanel
              mode={mode}
              onModeChange={setMode}
              force={force}
              onForceChange={setForce}
              distance={distance}
              onDistanceChange={setDistance}
              angleDegrees={angleDegrees}
              onAngleDegreesChange={setAngleDegrees}
              mass={mass}
              onMassChange={setMass}
              velocity={velocity}
              onVelocityChange={setVelocity}
              height={height}
              onHeightChange={setHeight}
              workValue={workValue}
              onWorkValueChange={setWorkValue}
              time={time}
              onTimeChange={setTime}
            />
          }
          result={<EnergyResult result={result} mode={mode} angleDegrees={parseLocalizedNumber(angleDegrees) || 0} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="energy-work-power-calculator" category="physics" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <EnergyQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
