"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import Base64InputPanel from "./Base64InputPanel";
import Base64Result from "./Base64Result";
import Base64FilePanel from "./Base64FilePanel";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import { useNavBarVisible } from "@/components/tool-ui/useNavBarVisible";
import { B64_DEFAULTS, B64_EXAMPLES, B64LiveProvider, buildB64Model, type B64Draft } from "./B64LiveContext";

export default function Base64ToolUI({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.base64-tool.nav");
  const tEx = useTranslations("tools.base64-tool.examples");
  const [draft, setDraft] = useState<B64Draft>(B64_DEFAULTS);
  const [activeExample, setActiveExample] = useState<string | null>("mixed");
  const [sentinelRef, navBarVisible] = useNavBarVisible();

  function setDim<K extends keyof B64Draft>(key: K, value: B64Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setActiveExample(null);
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <B64LiveProvider value={{ dims: draft, setDim }}>
      <div ref={sentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <Base64InputPanel
                text={draft.text}
                onTextChange={(v) => setDim("text", v)}
                mode={draft.mode}
                onModeChange={(v) => setDim("mode", v)}
                variant={draft.variant}
                onVariantChange={(v) => setDim("variant", v)}
                onClear={() => {
                  setDraft(B64_DEFAULTS);
                  setActiveExample("mixed");
                }}
              />
              <QuickExamplesCard
                title={tEx("title")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={(id) => {
                  const ex = B64_EXAMPLES.find((e) => e.id === id);
                  if (!ex) return;
                  setDraft(ex.draft);
                  setActiveExample(id);
                }}
                examples={B64_EXAMPLES.map((ex) => {
                  const m = buildB64Model(ex.draft);
                  return { id: ex.id, label: tEx(ex.id), detail: m.result.length > 34 ? `${m.result.slice(0, 33)}…` : m.result };
                })}
              />
            </div>
          }
          result={<Base64Result />}
          sidebar={<RelatedToolsSidebar fill currentSlug="base64-tool" category="developer-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="base64-tool" />
              <SectionNav items={navItems} visible={navBarVisible} />
              <Base64FilePanel />
            </div>
          }
        />
      </div>

      {education}
    </B64LiveProvider>
  );
}
