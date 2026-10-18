"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import FileSizeInputPanel from "./FileSizeInputPanel";
import FileSizeResult from "./FileSizeResult";
import TransferTimeReference from "./TransferTimeReference";
import type { FileSizeScenario } from "./types";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import { useNavBarVisible } from "@/components/tool-ui/useNavBarVisible";
import { buildFsModel, FS_DEFAULTS, FsLiveProvider, useFsModel, type FsDraft } from "./FsLiveContext";

export default function FileSizeConverterTool({ education }: { education: ReactNode }) {
  const tNav = useTranslations("tools.file-size-converter.nav");
  const tEx = useTranslations("tools.file-size-converter.examples");
  const [draft, setDraft] = useState<FsDraft>(FS_DEFAULTS);
  const [activeExample, setActiveExample] = useState<string | null>("usb");
  const [sentinelRef, navBarVisible] = useNavBarVisible();

  function setDim<K extends keyof FsDraft>(key: K, value: FsDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    setActiveExample(null);
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <FsLiveProvider value={{ dims: draft, setDim }}>
      <div ref={sentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <FileSizeInputPanel
                value={draft.value}
                onValueChange={(v) => setDim("value", v)}
                unit={draft.unit}
                onUnitChange={(v) => setDim("unit", v)}
                standard={draft.standard}
                onStandardChange={(v) => setDim("standard", v)}
                onScenarioPreset={(s: FileSizeScenario) => {
                  setDraft({ value: s.value, unit: s.unit, standard: s.standard });
                  setActiveExample(null);
                }}
                onClear={() => {
                  setDraft(FS_DEFAULTS);
                  setActiveExample("usb");
                }}
              />
              <QuickExamplesCard
                title={tEx("title")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={(id) => {
                  const ex = FS_EXAMPLES.find((e) => e.id === id);
                  if (!ex) return;
                  setDraft(ex.draft);
                  setActiveExample(id);
                }}
                examples={FS_EXAMPLES.map((ex) => {
                  const m = buildFsModel(ex.draft);
                  return { id: ex.id, label: tEx(ex.id), detail: m.out ? `${m.f(m.out.bytes, 0)} B` : "" };
                })}
              />
            </div>
          }
          result={<FileSizeResult />}
          sidebar={<RelatedToolsSidebar fill currentSlug="file-size-converter" category="file-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="file-size-converter" />
              <SectionNav items={navItems} visible={navBarVisible} />
              <TransferTimeReferenceLive />
            </div>
          }
        />
      </div>

      {education}
    </FsLiveProvider>
  );
}

function TransferTimeReferenceLive() {
  const { out, ds } = useFsModel();
  return <TransferTimeReference bytes={out?.bytes ?? 0} digitStyle={ds} />;
}

/** Real capacities: a CD-ROM is 700 MiB, a DVD-5 4.7 GB, a single-layer Blu-ray 25 GB, a 3.5" floppy 1,440 KiB. */
const FS_EXAMPLES: { id: string; draft: FsDraft }[] = [
  { id: "usb", draft: FS_DEFAULTS },
  { id: "floppy", draft: { value: "1440", unit: "KB", standard: "binary" } },
  { id: "cd", draft: { value: "700", unit: "MB", standard: "binary" } },
  { id: "dvd", draft: { value: "4.7", unit: "GB", standard: "decimal" } },
  { id: "hdd", draft: { value: "1", unit: "TB", standard: "decimal" } },
];
