"use client";
import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { CsvJsonMode } from "@tooloralabs/tools";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import CsvJsonInputPanel from "./CsvJsonInputPanel";
import CsvJsonResult from "./CsvJsonResult";
import CsvVsJsonReference from "./CsvVsJsonReference";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import { useNavBarVisible } from "@/components/tool-ui/useNavBarVisible";
import { buildCsvModel, CSV_EXAMPLES, CsvLiveProvider, delimiterName, SAMPLE_CSV, SAMPLE_JSON, type CsvDraft } from "./CsvLiveContext";

export default function CsvJsonConverterUI({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.csv-json-converter.nav");
  const tEx = useTranslations("tools.csv-json-converter.examples");
  const [draft, setDraft] = useState<CsvDraft>(CSV_EXAMPLES[0].draft);
  const [activeExample, setActiveExample] = useState<string | null>("inventory");
  const [sentinelRef, navBarVisible] = useNavBarVisible();

  function setDim<K extends keyof CsvDraft>(key: K, value: CsvDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setActiveExample(null);
  }

  function handleModeChange(next: CsvJsonMode) {
    if (next === draft.mode) return;
    setDraft((d) => ({ ...d, mode: next, input: next === "csvToJson" ? SAMPLE_CSV : SAMPLE_JSON }));
    setActiveExample(next === "csvToJson" ? "inventory" : "nested");
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <CsvLiveProvider value={{ dims: draft, setDim }}>
      <div ref={sentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <CsvJsonInputPanel
                input={draft.input}
                onInputChange={(v) => setDim("input", v)}
                mode={draft.mode}
                onModeChange={handleModeChange}
                delimiter={draft.delimiter}
                onDelimiterChange={(v) => setDim("delimiter", v)}
                hasHeader={draft.hasHeader}
                onHasHeaderChange={(v) => setDim("hasHeader", v)}
                onClear={() => {
                  setDraft(CSV_EXAMPLES[0].draft);
                  setActiveExample("inventory");
                }}
              />
              <QuickExamplesCard
                title={tEx("title")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={(id) => {
                  const ex = CSV_EXAMPLES.find((e) => e.id === id);
                  if (!ex) return;
                  setDraft(ex.draft);
                  setActiveExample(id);
                }}
                examples={CSV_EXAMPLES.map((ex) => {
                  const m = buildCsvModel(ex.draft);
                  return { id: ex.id, label: tEx(ex.id), detail: m.a ? tEx("detail", { rows: m.a.rows.length, cols: m.a.headers.length, delim: delimiterName(m.delimiter) }) : "" };
                })}
              />
            </div>
          }
          result={<CsvJsonResult />}
          sidebar={<RelatedToolsSidebar fill currentSlug="csv-json-converter" category="file-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="csv-json-converter" />
              <SectionNav items={navItems} visible={navBarVisible} />
              <CsvVsJsonReference />
            </div>
          }
        />
      </div>

      {education}
    </CsvLiveProvider>
  );
}
