"use client";
import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { BarcodeSymbology } from "@tooloralabs/tools";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import { useNavBarVisible } from "@/components/tool-ui/useNavBarVisible";
import BarcodeInputPanel from "./BarcodeInputPanel";
import BarcodeResult from "./BarcodeResult";
import BarcodeTypesReference from "./BarcodeTypesReference";
import BarcodeDisclaimer from "./BarcodeDisclaimer";
import { BARCODE_DEFAULTS, BARCODE_EXAMPLES, BarcodeLiveProvider, buildBarcodeModel, DEFAULT_VALUES, type BarcodeDraft } from "./BarcodeLiveContext";

export default function BarcodeGeneratorTool({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.barcode-generator.nav");
  const tForm = useTranslations("tools.barcode-generator.form");
  const tEx = useTranslations("tools.barcode-generator.examples");
  const [draft, setDraft] = useState<BarcodeDraft>(BARCODE_DEFAULTS);
  const [activeExample, setActiveExample] = useState<string | null>("upc");
  const [sentinelRef, navBarVisible] = useNavBarVisible();

  function setDim<K extends keyof BarcodeDraft>(key: K, value: BarcodeDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    if (key === "value" || key === "symbology") setActiveExample(null);
  }

  function handleSymbologyChange(next: BarcodeSymbology) {
    if (next === draft.symbology) return;
    setDraft((d) => ({ ...d, symbology: next, value: DEFAULT_VALUES[next] }));
    setActiveExample(BARCODE_EXAMPLES.find((e) => e.symbology === next && e.value === DEFAULT_VALUES[next])?.id ?? null);
  }

  function handleLogoSelect(file: File) {
    const reader = new FileReader();
    reader.onload = () => setDraft((d) => ({ ...d, logoDataUrl: reader.result as string, logoPlacement: "beside" }));
    reader.readAsDataURL(file);
  }

  /** Each example's detail line is computed by the generator: the full code with its check character. */
  const examples = BARCODE_EXAMPLES.map((ex) => {
    const m = buildBarcodeModel({ ...BARCODE_DEFAULTS, symbology: ex.symbology, value: ex.value });
    return { id: ex.id, label: tEx(ex.id), detail: `${tForm(`symbology.${ex.symbology}`)} · ${m.a?.fullText ?? ex.value}` };
  });

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <BarcodeLiveProvider value={{ dims: draft, setDim }}>
      <div ref={sentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <BarcodeInputPanel
                symbology={draft.symbology}
                onSymbologyChange={handleSymbologyChange}
                value={draft.value}
                onValueChange={(v) => setDim("value", v)}
                logoDataUrl={draft.logoDataUrl}
                onLogoSelect={handleLogoSelect}
                onLogoClear={() => setDraft((d) => ({ ...d, logoDataUrl: null, logoPlacement: "none" }))}
                logoPlacement={draft.logoPlacement}
                onLogoPlacementChange={(v) => setDim("logoPlacement", v)}
                onClear={() => {
                  setDraft(BARCODE_DEFAULTS);
                  setActiveExample("upc");
                }}
              />
              <QuickExamplesCard
                title={tEx("title")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={(id) => {
                  const ex = BARCODE_EXAMPLES.find((e) => e.id === id);
                  if (!ex) return;
                  setDraft((d) => ({ ...d, symbology: ex.symbology, value: ex.value }));
                  setActiveExample(id);
                }}
                examples={examples}
              />
            </div>
          }
          result={<BarcodeResult />}
          sidebar={<RelatedToolsSidebar fill currentSlug="barcode-generator" category="developer-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="barcode-generator" />
              <SectionNav items={navItems} visible={navBarVisible} />
              <BarcodeTypesReference />
              <BarcodeDisclaimer />
            </div>
          }
        />
      </div>

      {education}
    </BarcodeLiveProvider>
  );
}
