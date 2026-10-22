"use client";
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { BarcodeGenerator, type BarcodeSymbology } from "@tooloralabs/tools";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import { GlassPage } from "@/components/tool-ui/glass/GlassPrimitives";
import { useNavBarVisible } from "@/components/tool-ui/useNavBarVisible";
import BarcodeInputPanel from "./BarcodeInputPanel";
import BarcodeResult from "./BarcodeResult";
import BarcodeCheatSheet from "./BarcodeCheatSheet";
import BarcodeDisclaimer from "./BarcodeDisclaimer";
import type { BarcodeErrorKey } from "./BarcodeErrorPanel";
import { SAMPLE_VALUES } from "./barcodeMath";

const tool = new BarcodeGenerator();

const ERROR_KEYS: Record<string, BarcodeErrorKey> = {
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
  const tForm = useTranslations("tools.barcode-generator.form");

  const [symbology, setSymbology] = useState<BarcodeSymbology>("upc-a");
  const [value, setValue] = useState(SAMPLE_VALUES["upc-a"]);
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoPlacement, setLogoPlacement] = useState<"beside" | "none">("none");

  function handleSymbologyChange(next: BarcodeSymbology) {
    if (next === symbology) return;
    setSymbology(next);
    setValue(SAMPLE_VALUES[next]);
  }

  function handlePick(next: BarcodeSymbology, v: string) {
    setSymbology(next);
    setValue(v);
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

  function handleClear() {
    setSymbology("upc-a");
    setValue(SAMPLE_VALUES["upc-a"]);
    handleLogoClear();
  }

  const output = useMemo(() => tool.execute({ symbology, value }, { locale: "en-US" }), [symbology, value]);
  const errorKey = output.success ? null : (ERROR_KEYS[String(output.metadata.error)] ?? "required");
  const errorMessage = errorKey ? t(errorKey) : "";

  const [navSentinelRef, navBarVisible] = useNavBarVisible();
  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <GlassPage>
      <div data-kit-page style={{ fontFamily: "var(--glass-font)", ["--glass-handle-border" as string]: "var(--ph-line)" } as CSSProperties}>
        <div ref={navSentinelRef} aria-hidden="true" />
        <div id="tool" className="scroll-mt-32">
          <ToolAboveFold
            tight
            sidebarMatchRow
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
                onClear={handleClear}
                valid={output.success}
                onPick={handlePick}
              />
            }
            result={
              <BarcodeResult
                symbology={symbology}
                value={value}
                output={output.success ? output.data : null}
                errorKey={errorKey}
                errorMessage={errorMessage}
                logoDataUrl={logoDataUrl}
                logoPlacement={logoPlacement}
                symbologyLabel={tForm(`symbology.${symbology}`)}
                isSample={value === SAMPLE_VALUES[symbology]}
                onApplyFix={setValue}
              />
            }
            sidebar={<RelatedToolsSidebar fill fillContent={<BarcodeCheatSheet />} currentSlug="barcode-generator" category="developer-tools" />}
            secondary={
              <div className="flex flex-col gap-4">
                <ViewDocsLink slug="barcode-generator" />
                <SectionNav items={navItems} visible={navBarVisible} />
                <BarcodeDisclaimer />
              </div>
            }
          />
        </div>

        {education}
      </div>
    </GlassPage>
  );
}
