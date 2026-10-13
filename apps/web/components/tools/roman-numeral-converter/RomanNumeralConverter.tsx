"use client";
import { useCallback, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { RomanNumeralCalculator as RomanTool } from "@tooloralabs/tools";

import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import { GlassPage } from "@/components/tool-ui/glass/GlassPrimitives";
import { useNavBarVisible } from "@/components/tool-ui/useNavBarVisible";
import RomanInputPanel from "./RomanInputPanel";
import RomanResult from "./RomanResult";
import RomanQuickReference from "./RomanQuickReference";
import { RomanBreakdownCard, RomanExamplesCard } from "./RomanSideCards";
import { ROMAN_SEED, toRoman } from "./romanMath";
import type { RomanConversionDirection } from "./types";

const tool = new RomanTool();

export default function RomanNumeralConverter({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.roman-numeral-converter.nav");
  const [direction, setDirection] = useState<RomanConversionDirection>("toRoman");
  const [arabicValue, setArabicValue] = useState("1994");
  const [romanValue, setRomanValue] = useState("MCMXCIV");

  function handleClear() {
    setDirection("toRoman");
    setArabicValue("1994");
    setRomanValue("MCMXCIV");
  }

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

  // The board keeps showing the last valid number while the field holds an invalid entry.
  const valid = result.arabicValue !== null && !result.error ? result.arabicValue : null;
  const [lastValid, setLastValid] = useState(ROMAN_SEED);
  if (valid !== null && valid !== lastValid) setLastValid(valid);
  const boardValue = valid ?? lastValid;
  // The board's handle writes whichever field is active (a number, or its standard numeral).
  const setFromBoard = useCallback((v: number) => (direction === "toRoman" ? setArabicValue(String(v)) : setRomanValue(toRoman(v))), [direction]);

  const sideCards = (
    <>
      <RomanBreakdownCard value={boardValue} />
      <RomanExamplesCard value={boardValue} onPick={setFromBoard} />
    </>
  );

  const [navSentinelRef, navBarVisible] = useNavBarVisible();
  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <GlassPage>
      {/* Inter everywhere on this page; drag-handle rims use the shared line token so they keep ≥3:1 in light mode. */}
      <div data-kit-page style={{ fontFamily: "var(--glass-font)", ["--glass-handle-border" as string]: "var(--ph-line)" } as CSSProperties}>
      <div ref={navSentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          tight
          stretchInput
          stretchResult
          sidebarMatchRow
          input={
            <div className="flex flex-col gap-4 lg:h-full">
            <RomanInputPanel
              direction={direction}
              onDirectionChange={setDirection}
              arabicValue={arabicValue}
              onArabicValueChange={setArabicValue}
              romanValue={romanValue}
              onRomanValueChange={setRomanValue}
              onClear={handleClear}
            />
              {/* Desktop: under the input card (keeps the columns flush). Phone: after the Result column. */}
              <div className="hidden flex-1 flex-col gap-4 lg:flex">{sideCards}</div>
            </div>
          }
          result={
            <div className="flex flex-col gap-4 lg:h-full">
              <RomanResult result={result} direction={direction} digitStyle={digitStyle} boardValue={boardValue} onSetValue={setFromBoard} />
              <RomanQuickReference />
              <div className="flex flex-col gap-4 lg:hidden">{sideCards}</div>
            </div>
          }
          sidebar={<RelatedToolsSidebar fill currentSlug="roman-numeral-converter" category="converters" />}
          secondary={
            <div className="flex flex-col gap-4">
              <ViewDocsLink slug="roman-numeral-converter" />
              <SectionNav items={navItems} visible={navBarVisible} />
            </div>
          }
        />
      </div>

      {education}
      </div>
    </GlassPage>
  );
}
