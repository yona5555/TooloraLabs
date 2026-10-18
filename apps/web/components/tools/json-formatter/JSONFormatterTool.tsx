"use client";
import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import { useNavBarVisible } from "@/components/tool-ui/useNavBarVisible";
import JSONInputPanel from "./JSONInputPanel";
import JSONResult from "./JSONResult";
import JSONCommonErrorsReference from "./JSONCommonErrorsReference";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import { buildJSONModel, formatBytes, JSON_DEFAULTS, JSON_EXAMPLES, JSONLiveProvider, type JSONDraft } from "./JSONLiveContext";

export default function JSONFormatterTool({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.json-formatter.nav");
  const t = useTranslations("tools.json-formatter.aboveFold");
  const [draft, setDraft] = useState<JSONDraft>(JSON_DEFAULTS);
  const [activeExample, setActiveExample] = useState<string | null>("library");
  const [sentinelRef, navBarVisible] = useNavBarVisible();

  function setDim<K extends keyof JSONDraft>(key: K, value: JSONDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    if (key === "json") setActiveExample(null);
  }

  /** Each example's detail line is computed by the formatter itself: size and depth, or where it breaks. */
  const examples = JSON_EXAMPLES.map((ex) => {
    const m = buildJSONModel({ ...JSON_DEFAULTS, json: ex.json });
    const detail = m.a
      ? `${formatBytes(m.a.sizes.minified)} · ${t("exampleDepth", { depth: m.a.maxDepth })}`
      : t("exampleError", {
          line: m.output?.errorLine ?? 0,
          column: m.output?.errorColumn ?? 0,
        });
    return { id: ex.id, label: t(`examples.${ex.id}`), detail };
  });

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <JSONLiveProvider value={{ dims: draft, setDim }}>
      <div ref={sentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <JSONInputPanel
                json={draft.json}
                onJsonChange={(v) => setDim("json", v)}
                mode={draft.mode}
                onModeChange={(v) => setDim("mode", v)}
                indent={draft.indent}
                onIndentChange={(v) => setDim("indent", v)}
                sortKeys={draft.sortKeys}
                onSortKeysChange={(v) => setDim("sortKeys", v)}
                onClear={() => {
                  setDraft(JSON_DEFAULTS);
                  setActiveExample("library");
                }}
              />
              <QuickExamplesCard
                title={t("examplesTitle")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={(id) => {
                  const ex = JSON_EXAMPLES.find((e) => e.id === id);
                  if (!ex) return;
                  setDraft((d) => ({ ...d, json: ex.json }));
                  setActiveExample(id);
                }}
                examples={examples}
              />
            </div>
          }
          result={<JSONResult />}
          sidebar={<RelatedToolsSidebar fill currentSlug="json-formatter" category="developer-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="json-formatter" />
              <SectionNav items={navItems} visible={navBarVisible} />
              <JSONCommonErrorsReference />
            </div>
          }
        />
      </div>

      {education}
    </JSONLiveProvider>
  );
}
