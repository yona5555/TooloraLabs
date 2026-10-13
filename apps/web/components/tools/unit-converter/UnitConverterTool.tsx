"use client";
import { useCallback, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { UnitConverter, type UnitCategory } from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import { GlassPage } from "@/components/tool-ui/glass/GlassPrimitives";
import { useNavBarVisible } from "@/components/tool-ui/useNavBarVisible";
import UnitInputPanel from "./UnitInputPanel";
import UnitResult from "./UnitResult";
import UnitCommonReference from "./UnitCommonReference";
import UnitInstrumentCard from "./UnitInstrumentCard";
import { DEFAULT_UNIT, DEFAULT_VALUE, UNIT_SYMBOL } from "./units";

const tool = new UnitConverter();

export default function UnitConverterTool({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.unit-converter.nav");

  const [category, setCategory] = useState<UnitCategory>("length");
  const [from, setFrom] = useState(DEFAULT_UNIT.length[0]);
  const [to, setTo] = useState(DEFAULT_UNIT.length[1]);
  const [value, setValue] = useState(String(DEFAULT_VALUE));

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

  function handleClear() {
    setCategory("length");
    setFrom(DEFAULT_UNIT.length[0]);
    setTo(DEFAULT_UNIT.length[1]);
    setValue(String(DEFAULT_VALUE));
  }

  const digitStyle: DigitStyle = resolveDigitStyle(value);

  const { result, allConversions } = useMemo(() => {
    const parsedValue = parseLocalizedNumber(value) || 0;
    const output = tool.execute({ category, from, to, value: parsedValue }, { locale: "en-US" });
    if (!output.success) return { result: null, allConversions: {} };
    return { result: output.data.result, allConversions: output.data.allConversions };
  }, [category, from, to, value]);

  const numericValue = parseLocalizedNumber(value) || 0;
  // The Result scene's handle writes the Value field (plain digits, no float dust).
  const setFromScene = useCallback((v: number) => setValue(String(Number(v.toFixed(6)))), []);
  const conv = useCallback(
    (v: number) => {
      const out = tool.execute({ category, from, to, value: v }, { locale: "en-US" });
      return out.success ? out.data.result : Number.NaN;
    },
    [category, from, to],
  );

  const sideCards = <UnitInstrumentCard category={category} from={from} value={numericValue} seed={DEFAULT_VALUE} conv={conv} onSet={setFromScene} fromSym={UNIT_SYMBOL[from]} toSym={UNIT_SYMBOL[to]} />;

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
            <UnitInputPanel
              category={category}
              onCategoryChange={handleCategoryChange}
              value={value}
              onValueChange={setValue}
              from={from}
              onFromChange={setFrom}
              to={to}
              onSwap={swap}
              onClear={handleClear}
            />
              {/* Desktop: under the input card (keeps the columns flush). Phone: after the Result card. */}
              <div className="hidden flex-1 flex-col lg:flex">{sideCards}</div>
            </div>
          }
          result={
            <div className="flex flex-col gap-4 lg:h-full">
            <UnitResult
              category={category}
              from={from}
              fromValue={value}
              numericValue={numericValue}
              onSetValue={setFromScene}
              conv={conv}
              to={to}
              onToChange={setTo}
              result={result}
              allConversions={allConversions}
              digitStyle={digitStyle}
            />
              <div className="flex flex-col lg:hidden">{sideCards}</div>
            </div>
          }
          sidebar={<RelatedToolsSidebar fill currentSlug="unit-converter" category="converters" />}
          secondary={
            <div className="flex flex-col gap-4">
              <ViewDocsLink slug="unit-converter" />
              <SectionNav items={navItems} visible={navBarVisible} />
              <UnitCommonReference />
            </div>
          }
        />
      </div>

      {education}
      </div>
    </GlassPage>
  );
}
