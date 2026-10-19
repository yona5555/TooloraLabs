"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import DuplicateLineInputPanel from "./DuplicateLineInputPanel";
import DuplicateLineResult from "./DuplicateLineResult";
import DedupeReference from "./DedupeReference";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import { useNavBarVisible } from "@/components/tool-ui/useNavBarVisible";
import { buildDlModel, DL_DEFAULTS, DL_EXAMPLES, DlLiveProvider, type DlDraft } from "./DlLiveContext";

export default function DuplicateLineRemoverTool({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.duplicate-line-remover.nav");
  const tEx = useTranslations("tools.duplicate-line-remover.examples");
  const [draft, setDraft] = useState<DlDraft>(DL_DEFAULTS);
  const [activeExample, setActiveExample] = useState<string | null>("emails");
  const [sentinelRef, navBarVisible] = useNavBarVisible();

  function setDim<K extends keyof DlDraft>(key: K, value: DlDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setActiveExample(null);
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <DlLiveProvider value={{ dims: draft, setDim }}>
      <div ref={sentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <DuplicateLineInputPanel
                text={draft.text}
                onTextChange={(v) => setDim("text", v)}
                caseSensitive={draft.caseSensitive}
                onCaseSensitiveChange={(v) => setDim("caseSensitive", v)}
                sort={draft.sort}
                onSortChange={(v) => setDim("sort", v)}
                trimWhitespace={draft.trimWhitespace}
                onTrimWhitespaceChange={(v) => setDim("trimWhitespace", v)}
                keepOccurrence={draft.keepOccurrence}
                onKeepOccurrenceChange={(v) => setDim("keepOccurrence", v)}
                onClear={() => {
                  setDraft(DL_DEFAULTS);
                  setActiveExample("emails");
                }}
              />
              <QuickExamplesCard
                title={tEx("title")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={(id) => {
                  const ex = DL_EXAMPLES.find((e) => e.id === id);
                  if (!ex) return;
                  setDraft(ex.draft);
                  setActiveExample(id);
                }}
                examples={DL_EXAMPLES.map((ex) => {
                  const m = buildDlModel(ex.draft);
                  return { id: ex.id, label: tEx(ex.id), detail: m.out ? `${m.f(m.out.totalLines)} → ${m.f(m.out.uniqueLines)}` : "" };
                })}
              />
            </div>
          }
          result={<DuplicateLineResult />}
          sidebar={<RelatedToolsSidebar fill currentSlug="duplicate-line-remover" category="file-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="duplicate-line-remover" />
              <SectionNav items={navItems} visible={navBarVisible} />
              <DedupeReference />
            </div>
          }
        />
      </div>

      {education}
    </DlLiveProvider>
  );
}
