"use client";
import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { JSONFormatter, type JSONFormatterMode, type JSONIndent } from "@tooloralabs/tools";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionCard from "@/components/tool-ui/SectionCard";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import { GlassPage } from "@/components/tool-ui/glass/GlassPrimitives";
import { useNavBarVisible } from "@/components/tool-ui/useNavBarVisible";
import JSONInputPanel from "./JSONInputPanel";
import JSONResult from "./JSONResult";
import JSONCommonErrorsReference from "./JSONCommonErrorsReference";
import { SAMPLE_JSON } from "./jsonTreeData";

const tool = new JSONFormatter();

/**
 * §41: real content for the `sidebarMatchRow` space the related-tools card doesn't use (this
 * page's Result column is tall — bulb scene + outline — so the sidebar's own tool list rarely
 * reaches that far) instead of the invisible spacer `RelatedToolsSidebar` leaves by default.
 */
function JSONCheatSheetFill() {
  const t = useTranslations("tools.json-formatter.sidebar.cheatSheet");
  const rows = t.raw("rows") as { id: string; label: string; value: string }[];
  return (
    <SectionCard title={t("title")} bodyClassName="p-0">
      <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-2 text-xs lg:px-6">
            <span className="text-zinc-600 dark:text-zinc-300">{r.label}</span>
            <span dir="ltr" className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">
              {r.value}
            </span>
          </div>
        ))}
      </div>
      <p className="border-t border-zinc-100 px-4 py-1.5 text-[10px] text-zinc-400 dark:border-zinc-800 dark:text-zinc-500 lg:px-6">{t("note")}</p>
    </SectionCard>
  );
}

export default function JSONFormatterTool({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.json-formatter.nav");

  const [json, setJson] = useState(SAMPLE_JSON);
  const [mode, setMode] = useState<JSONFormatterMode>("format");
  const [indent, setIndent] = useState<JSONIndent>(2);
  const [sortKeys, setSortKeys] = useState(false);

  function handleClear() {
    setJson(SAMPLE_JSON);
    setMode("format");
    setIndent(2);
    setSortKeys(false);
  }

  const output = useMemo(() => {
    if (!json.trim()) return null;
    return tool.execute({ json, mode, indent, sortKeys }, { locale: "en-US" });
  }, [json, mode, indent, sortKeys]);

  // Stats-only: the minified size shown beside the formatted size in the Result card's stat row.
  const altOutput = useMemo(() => {
    if (!json.trim()) return null;
    const altMode: JSONFormatterMode = mode === "format" ? "minify" : "format";
    return tool.execute({ json, mode: altMode, indent, sortKeys }, { locale: "en-US" });
  }, [json, mode, indent, sortKeys]);

  // The input column's schema/file-status panels draw the real parsed document; re-parsed rather
  // than reusing the formatter's stringified output, since it never returns the parsed value itself.
  const parsed = useMemo(() => {
    try {
      return JSON.parse(json);
    } catch {
      return null;
    }
  }, [json]);

  const [navSentinelRef, navBarVisible] = useNavBarVisible();
  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behindTheTool", label: tNav("behindTheTool") },
  ];

  return (
    <GlassPage>
      {/* Inter everywhere on this page; drag-handle rims use the shared line token so they keep ≥3:1 in light mode. */}
      <div data-kit-page style={{ fontFamily: "var(--glass-font)", ["--glass-handle-border" as string]: "var(--ph-line)" } as CSSProperties}>
      <div ref={navSentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          tight
          sidebarMatchRow
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
              parsed={parsed}
              isValid={output?.success === true}
              stats={output?.data.stats ?? null}
              onClear={handleClear}
            />
          }
          result={
            <JSONResult
              json={json}
              isEmpty={!output}
              result={output?.data.result ?? ""}
              stats={output?.data.stats ?? null}
              altSizeBytes={altOutput?.success === true ? altOutput.data.stats?.sizeBytes ?? null : null}
              errorMessage={output?.success === false ? output.data.errorMessage : ""}
              errorLine={output?.success === false ? output.data.errorLine : 0}
              errorColumn={output?.success === false ? output.data.errorColumn : 0}
              onApplyFix={setJson}
            />
          }
          sidebar={<RelatedToolsSidebar fill fillContent={<JSONCheatSheetFill />} currentSlug="json-formatter" category="developer-tools" />}
          secondary={
            <div className="flex flex-col gap-4">
              <ViewDocsLink slug="json-formatter" />
              <SectionNav items={navItems} visible={navBarVisible} />
              <JSONCommonErrorsReference />
            </div>
          }
        />
      </div>

      {education}
      </div>
    </GlassPage>
  );
}
