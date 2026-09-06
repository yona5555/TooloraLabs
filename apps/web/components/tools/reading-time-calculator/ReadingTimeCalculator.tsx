"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { ReadingTimeCalculator as RTTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import RTInputPanel from "./RTInputPanel";
import RTResult from "./RTResult";
import RTQuickReference from "./RTQuickReference";
import { READING_SPEED_PRESETS } from "./types";
import type { ReadingSpeedPreset } from "./types";

const tool = new RTTool();

export default function ReadingTimeCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.reading-time-calculator.nav");
  const [text, setText] = useState("");
  const [preset, setPreset] = useState<ReadingSpeedPreset>("average");
  const [customWpm, setCustomWpm] = useState("230");

  const digitStyle: DigitStyle = resolveDigitStyle(customWpm);

  const wordsPerMinute = preset === "custom" ? parseLocalizedNumber(customWpm) || 0 : READING_SPEED_PRESETS[preset];

  const result = useMemo(() => {
    const output = tool.execute({ text, wordsPerMinute }, { locale: "en-US" });
    return output.data;
  }, [text, wordsPerMinute]);

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
            <RTInputPanel
              text={text}
              onTextChange={setText}
              preset={preset}
              onPresetChange={setPreset}
              customWpm={customWpm}
              onCustomWpmChange={setCustomWpm}
            />
          }
          result={<RTResult result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="reading-time-calculator" category="text-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <RTQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
