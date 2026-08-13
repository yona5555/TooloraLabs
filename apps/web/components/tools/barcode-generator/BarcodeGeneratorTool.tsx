"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { BarcodeGenerator, type BarcodeSymbology } from "@tooloralabs/tools";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import BarcodeInputPanel from "./BarcodeInputPanel";
import BarcodeResult from "./BarcodeResult";
import BarcodeTypesReference from "./BarcodeTypesReference";
import BarcodeDisclaimer from "./BarcodeDisclaimer";

const tool = new BarcodeGenerator();

const DEFAULT_VALUES: Record<BarcodeSymbology, string> = {
  "upc-a": "03600029145",
  "ean-13": "590123412345",
  code128: "TOOLORA-2026",
};

const ERROR_KEYS: Record<string, string> = {
  EMPTY_INPUT: "required",
  INVALID_LENGTH_UPC: "invalidLengthUpc",
  INVALID_LENGTH_EAN: "invalidLengthEan",
  NON_DIGIT: "nonDigit",
  UNSUPPORTED_CHARACTER: "unsupportedCharacter",
  TOO_LONG: "tooLong",
};

export default function BarcodeGeneratorTool({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.barcode-generator.errors");
  const tNav = useTranslations("tools.barcode-generator.nav");

  const [symbology, setSymbology] = useState<BarcodeSymbology>("upc-a");
  const [value, setValue] = useState(DEFAULT_VALUES["upc-a"]);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoPlacement, setLogoPlacement] = useState<"beside" | "none">("none");

  function handleSymbologyChange(next: BarcodeSymbology) {
    if (next === symbology) return;
    setSymbology(next);
    setValue(DEFAULT_VALUES[next]);
  }

  function handleLogoSelect(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      setLogoDataUrl(reader.result as string);
      setLogoPlacement("beside");
    };
    reader.readAsDataURL(file);
  }

  function handleLogoClear() {
    setLogoDataUrl(null);
    setLogoPlacement("none");
  }

  const output = useMemo(() => tool.execute({ symbology, value }, { locale: "en-US" }), [symbology, value]);

  const errorMessage = output.success ? "" : t(ERROR_KEYS[String(output.metadata.error)] ?? "required");

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
            <BarcodeInputPanel
              symbology={symbology}
              onSymbologyChange={handleSymbologyChange}
              value={value}
              onValueChange={setValue}
              logoDataUrl={logoDataUrl}
              onLogoSelect={handleLogoSelect}
              onLogoClear={handleLogoClear}
              logoPlacement={logoPlacement}
              onLogoPlacementChange={setLogoPlacement}
            />
          }
          result={
            <BarcodeResult
              segments={output.success ? output.data.segments : null}
              displayText={output.success ? output.data.displayText : ""}
              quietZoneModules={output.success ? output.data.quietZoneModules : 0}
              errorMessage={errorMessage}
              logoDataUrl={logoDataUrl}
              logoPlacement={logoPlacement}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="barcode-generator" category="developer-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <BarcodeDisclaimer />
              <BarcodeTypesReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
