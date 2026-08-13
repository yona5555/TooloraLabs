"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { parseLocalizedNumber, type DigitStyle } from "@tooloralabs/core";
import { FileSizeConverter, type FileSizeUnit, type FileSizeStandard } from "@tooloralabs/tools";
import { resolveDigitStyle } from "@/lib/digit-style";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import FileSizeInputPanel from "./FileSizeInputPanel";
import FileSizeResult from "./FileSizeResult";
import TransferTimeReference from "./TransferTimeReference";

const tool = new FileSizeConverter();

export default function FileSizeConverterTool({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.file-size-converter.errors");
  const tNav = useTranslations("tools.file-size-converter.nav");

  const [value, setValue] = useState("");
  const [unit, setUnit] = useState<FileSizeUnit>("MB");
  const [standard, setStandard] = useState<FileSizeStandard>("decimal");

  const digitStyle: DigitStyle = resolveDigitStyle(value);

  const { data, errorKey } = useMemo(() => {
    if (!value.trim()) return { data: null, errorKey: "" };

    const parsedValue = parseLocalizedNumber(value);
    if (Number.isNaN(parsedValue)) return { data: null, errorKey: "required" };

    const output = tool.execute({ value: parsedValue, fromUnit: unit, standard }, { locale: "en-US" });
    if (!output.success) return { data: null, errorKey: "negativeValue" };

    return { data: output.data, errorKey: "" };
  }, [value, unit, standard]);

  const errorMessage = errorKey ? t(errorKey) : "";

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
            <FileSizeInputPanel
              value={value}
              onValueChange={setValue}
              unit={unit}
              onUnitChange={setUnit}
              standard={standard}
              onStandardChange={setStandard}
            />
          }
          result={<FileSizeResult data={data} errorMessage={errorMessage} digitStyle={digitStyle} />}
          sidebar={<RelatedToolsSidebar currentSlug="file-size-converter" category="file-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <TransferTimeReference bytes={data?.bytes ?? 0} digitStyle={digitStyle} />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
