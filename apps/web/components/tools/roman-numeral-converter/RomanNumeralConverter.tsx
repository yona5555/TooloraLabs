"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { RomanNumeralCalculator as RomanTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import RomanInputPanel from "./RomanInputPanel";
import RomanResult from "./RomanResult";
import RomanQuickReference from "./RomanQuickReference";
import type { RomanConversionDirection } from "./types";

const tool = new RomanTool();

export default function RomanNumeralConverter({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.roman-numeral-converter.nav");
  const [direction, setDirection] = useState<RomanConversionDirection>("toRoman");
  const [arabicValue, setArabicValue] = useState("1994");
  const [romanValue, setRomanValue] = useState("MCMXCIV");

  const digitStyle: DigitStyle = resolveDigitStyle(arabicValue);

  const result = useMemo(() => {
    const output = tool.execute(
      {
        direction,
        arabicValue: direction === "toRoman" ? parseLocalizedNumber(arabicValue) : undefined,
        romanValue: direction === "toArabic" ? romanValue : undefined,
      },
      { locale: "en-US" },
    );
    return output.data;
  }, [direction, arabicValue, romanValue]);

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
            <RomanInputPanel
              direction={direction}
              onDirectionChange={setDirection}
              arabicValue={arabicValue}
              onArabicValueChange={setArabicValue}
              romanValue={romanValue}
              onRomanValueChange={setRomanValue}
            />
          }
          result={<RomanResult result={result} direction={direction} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="roman-numeral-converter" category="converters" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <RomanQuickReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
