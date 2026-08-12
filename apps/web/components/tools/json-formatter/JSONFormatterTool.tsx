"use client";
import { useMemo, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { JSONFormatter, type JSONFormatterMode, type JSONIndent } from "@tooloralabs/tools";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import JSONInputPanel from "./JSONInputPanel";
import JSONResult from "./JSONResult";
import JSONCommonErrorsReference from "./JSONCommonErrorsReference";

const tool = new JSONFormatter();

const SAMPLE_JSON = `{
  "name": "TooloraLabs",
  "tools": ["calculators", "converters", "generators"],
  "free": true,
  "rating": 4.8
}`;

export default function JSONFormatterTool({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.json-formatter.nav");

  const [json, setJson] = useState(SAMPLE_JSON);
  const [mode, setMode] = useState<JSONFormatterMode>("format");
  const [indent, setIndent] = useState<JSONIndent>(2);
  const [sortKeys, setSortKeys] = useState(false);

  const output = useMemo(() => {
    if (!json.trim()) return null;
    return tool.execute({ json, mode, indent, sortKeys }, { locale: "en-US" });
  }, [json, mode, indent, sortKeys]);

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
            <JSONInputPanel
              json={json}
              onJsonChange={setJson}
              mode={mode}
              onModeChange={setMode}
              indent={indent}
              onIndentChange={setIndent}
              sortKeys={sortKeys}
              onSortKeysChange={setSortKeys}
            />
          }
          result={
            <JSONResult
              isEmpty={!output}
              result={output?.data.result ?? ""}
              stats={output?.data.stats ?? null}
              errorMessage={output?.success === false ? output.data.errorMessage : ""}
              errorLine={output?.success === false ? output.data.errorLine : 0}
              errorColumn={output?.success === false ? output.data.errorColumn : 0}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="json-formatter" category="developer-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <JSONCommonErrorsReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
