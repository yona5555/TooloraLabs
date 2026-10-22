"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import FileNameInputPanel from "./FileNameInputPanel";
import FileNameResult from "./FileNameResult";
import PlatformRulesReference from "./PlatformRulesReference";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import { useNavBarVisible } from "@/components/tool-ui/useNavBarVisible";
import { FN_DEFAULTS, FN_EXAMPLES, FnLiveProvider, sanitize, type FnDraft } from "./FnLiveContext";

export default function FileNameSanitizerTool({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.file-name-sanitizer.nav");
  const tEx = useTranslations("tools.file-name-sanitizer.examples");
  const [draft, setDraft] = useState<FnDraft>(FN_DEFAULTS);
  const [activeExample, setActiveExample] = useState<string | null>("resume");
  const [sentinelRef, navBarVisible] = useNavBarVisible();

  function setDim<K extends keyof FnDraft>(key: K, value: FnDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setActiveExample(null);
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <FnLiveProvider value={{ dims: draft, setDim }}>
      <div ref={sentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <FileNameInputPanel
                fileName={draft.fileName}
                onFileNameChange={(v) => setDim("fileName", v)}
                separator={draft.separator}
                onSeparatorChange={(v) => setDim("separator", v)}
                lowercase={draft.lowercase}
                onLowercaseChange={(v) => setDim("lowercase", v)}
                transliterate={draft.transliterate}
                onTransliterateChange={(v) => setDim("transliterate", v)}
                onClear={() => {
                  setDraft(FN_DEFAULTS);
                  setActiveExample("resume");
                }}
              />
              <QuickExamplesCard
                title={tEx("title")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={(id) => {
                  const ex = FN_EXAMPLES.find((e) => e.id === id);
                  if (!ex) return;
                  setDraft(ex.draft);
                  setActiveExample(id);
                }}
                examples={FN_EXAMPLES.map((ex) => {
                  const r = sanitize(ex.draft);
                  return { id: ex.id, label: tEx(ex.id), detail: r.success ? `→ ${r.data.result}` : "" };
                })}
              />
            </div>
          }
          result={<FileNameResult />}
          sidebar={<RelatedToolsSidebar fill currentSlug="file-name-sanitizer" category="file-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="file-name-sanitizer" />
              <SectionNav items={navItems} visible={navBarVisible} />
              <PlatformRulesReference />
            </div>
          }
        />
      </div>

      {education}
    </FnLiveProvider>
  );
}
