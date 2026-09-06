"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { SpeechWordCountCalculator as SWTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import SWInputPanel from "./SWInputPanel";
import SWResult from "./SWResult";
import SWQuickReference from "./SWQuickReference";
import { SPEECH_PACE_PRESETS } from "./types";
import type { SpeechPacePreset } from "./types";

const tool = new SWTool();

export default function SpeechWordCountCalculator({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.speech-word-count-calculator.nav");
  const [text, setText] = useState("");
  const [preset, setPreset] = useState<SpeechPacePreset>("normal");
  const [customWpm, setCustomWpm] = useState("140");

  const digitStyle: DigitStyle = resolveDigitStyle(customWpm);

  const wordsPerMinute = preset === "custom" ? parseLocalizedNumber(customWpm) || 0 : SPEECH_PACE_PRESETS[preset];

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
            <SWInputPanel
              text={text}
              onTextChange={setText}
              preset={preset}
              onPresetChange={setPreset}
              customWpm={customWpm}
              onCustomWpmChange={setCustomWpm}
            />
          }
          result={<SWResult result={result} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="speech-word-count-calculator" category="text-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <SWQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
