"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { UnitConverter, type UnitCategory } from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import UnitInputPanel from "./UnitInputPanel";
import UnitResult from "./UnitResult";
import UnitCommonReference from "./UnitCommonReference";
import { DEFAULT_UNIT } from "./units";

const tool = new UnitConverter();

export default function UnitConverterTool({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.unit-converter.nav");

  const [category, setCategory] = useState<UnitCategory>("length");
  const [from, setFrom] = useState(DEFAULT_UNIT.length[0]);
  const [to, setTo] = useState(DEFAULT_UNIT.length[1]);
  const [value, setValue] = useState("10");

  function handleCategoryChange(next: UnitCategory) {
    if (next === category) return;
    setCategory(next);
    setFrom(DEFAULT_UNIT[next][0]);
    setTo(DEFAULT_UNIT[next][1]);
  }

  function swap() {
    setFrom(to);
    setTo(from);
  }

  const digitStyle: DigitStyle = resolveDigitStyle(value);

  const { result, allConversions } = useMemo(() => {
    const parsedValue = parseLocalizedNumber(value) || 0;
    const output = tool.execute({ category, from, to, value: parsedValue }, { locale: "en-US" });
    if (!output.success) return { result: null, allConversions: {} };
    return { result: output.data.result, allConversions: output.data.allConversions };
  }, [category, from, to, value]);

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
            <UnitInputPanel
              category={category}
              onCategoryChange={handleCategoryChange}
              value={value}
              onValueChange={setValue}
              from={from}
              onFromChange={setFrom}
              to={to}
              onSwap={swap}
            />
          }
          result={
            <UnitResult
              category={category}
              to={to}
              onToChange={setTo}
              result={result}
              allConversions={allConversions}
              digitStyle={digitStyle}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="unit-converter" category="converters" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <UnitCommonReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
