"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CsvJsonConverter, type CsvJsonMode, type CsvDelimiter } from "@tooloralabs/tools";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import CsvJsonInputPanel from "./CsvJsonInputPanel";
import CsvJsonResult from "./CsvJsonResult";
import CsvVsJsonReference from "./CsvVsJsonReference";

const tool = new CsvJsonConverter();

const SAMPLE_CSV = `name,age,city
Alice,30,Cairo
Bob,25,Giza`;

const SAMPLE_JSON = JSON.stringify(
  [
    { name: "Alice", age: 30, city: "Cairo" },
    { name: "Bob", age: 25, city: "Giza" },
  ],
  null,
  2
);

const ERROR_MESSAGE_KEYS: Record<string, string> = {
  INVALID_JSON: "invalidJson",
  EXPECTED_ARRAY: "expectedArray",
  EMPTY_INPUT: "required",
};

export default function CsvJsonConverterUI({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.csv-json-converter.errors");
  const tNav = useTranslations("tools.csv-json-converter.nav");

  const [input, setInput] = useState(SAMPLE_CSV);
  const [mode, setMode] = useState<CsvJsonMode>("csvToJson");
  const [delimiter, setDelimiter] = useState<CsvDelimiter>(",");
  const [hasHeader, setHasHeader] = useState(true);

  function handleModeChange(next: CsvJsonMode) {
    if (next === mode) return;
    setMode(next);
    setInput(next === "csvToJson" ? SAMPLE_CSV : SAMPLE_JSON);
  }

  const output = useMemo(() => {
    if (!input.trim()) return null;
    return tool.execute({ text: input, mode, delimiter, hasHeader }, { locale: "en-US" });
  }, [input, mode, delimiter, hasHeader]);

  const errorMessage = output?.success === false ? t(ERROR_MESSAGE_KEYS[String(output.metadata.error)] ?? "required") : "";

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
            <CsvJsonInputPanel
              input={input}
              onInputChange={setInput}
              mode={mode}
              onModeChange={handleModeChange}
              delimiter={delimiter}
              onDelimiterChange={setDelimiter}
              hasHeader={hasHeader}
              onHasHeaderChange={setHasHeader}
            />
          }
          result={
            <CsvJsonResult
              isEmpty={!output}
              result={output?.data.result ?? ""}
              errorMessage={errorMessage}
              filename={mode === "csvToJson" ? "converted.json" : "converted.csv"}
              mimeType={mode === "csvToJson" ? "application/json;charset=utf-8" : "text/csv;charset=utf-8"}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="csv-json-converter" category="file-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <CsvVsJsonReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
