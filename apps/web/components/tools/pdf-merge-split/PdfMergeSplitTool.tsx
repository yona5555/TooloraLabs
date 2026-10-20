"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import JSZip from "jszip";
import { createSamplePdf, inspectPdf, mergePdfs, parsePageRanges, splitPdf } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import { useNavBarVisible } from "@/components/tool-ui/useNavBarVisible";
import PdfMergeSplitInputPanel, { type PdfMode } from "./PdfMergeSplitInputPanel";
import PdfMergeSplitResult from "./PdfMergeSplitResult";
import PdfMergeSplitReference from "./PdfMergeSplitReference";
import { PdfLiveProvider, type PdfDocInfo, type PdfDraft } from "./PdfLiveContext";

const MAX_TOTAL_BYTES = 25 * 1024 * 1024;
let nextId = 0;

type FileEntry = { file: File; id: string };

/** Sample documents generated in the browser so the page opens on a real merge and a real split. */
const SAMPLES = {
  report: { title: "Annual Report", pages: 3, paper: "A4" as const },
  invoice: { title: "Invoice", pages: 2, paper: "Letter" as const },
  appendix: { title: "Appendix", pages: 1, paper: "A4" as const },
  handbook: { title: "Handbook", pages: 6, paper: "A4" as const },
};
type SampleKey = keyof typeof SAMPLES;
/** The merge set the page opens on (the first example). */
const SEED_MERGE: SampleKey[] = ["report", "invoice", "appendix"];

const EXAMPLES: { id: string; mode: PdfMode; files: SampleKey[]; ranges?: string }[] = [
  { id: "mergeThree", mode: "merge", files: ["report", "invoice", "appendix"] },
  { id: "mergeTwo", mode: "merge", files: ["invoice", "report"] },
  { id: "splitChapters", mode: "split", files: ["handbook"], ranges: "1-2,3,5-6" },
  { id: "splitEvery", mode: "split", files: ["handbook"], ranges: "" },
  { id: "splitPairs", mode: "split", files: ["handbook"], ranges: "1-2,3-4,5-6" },
];

async function sampleFile(key: SampleKey): Promise<File> {
  const s = SAMPLES[key];
  const bytes = await createSamplePdf(s.title, s.pages, s.paper);
  return new File([new Uint8Array(bytes)], `${key}.pdf`, { type: "application/pdf" });
}

async function infoOf(file: File): Promise<PdfDocInfo> {
  const info = await inspectPdf(new Uint8Array(await file.arrayBuffer()));
  return { ...info, name: file.name };
}

export default function PdfMergeSplitTool({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.pdf-merge-split");
  const tNav = useTranslations("tools.pdf-merge-split.nav");
  const tEx = useTranslations("tools.pdf-merge-split.examples");
  const [sentinelRef, navBarVisible] = useNavBarVisible();

  const [mode, setMode] = useState<PdfMode>("merge");
  const [mergeFiles, setMergeFiles] = useState<FileEntry[]>([]);
  const [infos, setInfos] = useState<Record<string, PdfDocInfo>>({});
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [splitInfo, setSplitInfo] = useState<PdfDocInfo | null>(null);
  const [rangesInput, setRangesInput] = useState("1-2,3,5-6");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultCount, setResultCount] = useState(0);
  const [outputSizes, setOutputSizes] = useState<number[]>([]);
  const [activeExample, setActiveExample] = useState<string | null>("mergeThree");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function resetResult() {
    setError("");
    setResultBlob(null);
    setOutputSizes([]);
  }

  async function addMergeFiles(files: File[]) {
    const entries = files.map((file) => ({ file, id: String(nextId++) }));
    setMergeFiles((prev) => [...prev, ...entries]);
    for (const entry of entries) {
      try {
        const info = await infoOf(entry.file);
        setInfos((prev) => ({ ...prev, [entry.id]: info }));
      } catch {
        setError(t("errors.invalidPdf"));
      }
    }
  }

  async function loadExample(id: string) {
    const ex = EXAMPLES.find((e) => e.id === id);
    if (!ex) return;
    resetResult();
    setActiveExample(id);
    setMode(ex.mode);
    const files = await Promise.all(ex.files.map(sampleFile));
    if (ex.mode === "merge") {
      setMergeFiles([]);
      setInfos({});
      await addMergeFiles(files);
    } else {
      setRangesInput(ex.ranges ?? "");
      await handleSplitFileSelect(files[0]);
    }
  }

  // Open on real results: build the sample merge set and the sample split document after mount.
  const seeded = useRef(false);
  const [seedPending, setSeedPending] = useState(true);
  useEffect(() => {
    // Effects run twice in development (Strict Mode); seed the samples only once.
    if (seeded.current) return;
    seeded.current = true;
    void (async () => {
      const [report, invoice, appendix, handbook] = await Promise.all(([...SEED_MERGE, "handbook"] as SampleKey[]).map(sampleFile));
      await addMergeFiles([report, invoice, appendix]);
      setSeedPending(false);
      setSplitFile(handbook);
      setSplitInfo(await infoOf(handbook));
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleClear() {
    setMergeFiles([]);
    setInfos({});
    setSplitFile(null);
    setSplitInfo(null);
    setRangesInput("");
    setActiveExample(null);
    resetResult();
  }

  function handleModeChange(next: PdfMode) {
    resetResult();
    setMode(next);
    setActiveExample(null);
  }

  function handleMergeFilesAdd(files: FileList) {
    resetResult();
    setActiveExample(null);
    void addMergeFiles(Array.from(files).filter((f) => f.type === "application/pdf"));
  }

  function handleMergeFileRemove(id: string) {
    resetResult();
    setActiveExample(null);
    setMergeFiles((prev) => prev.filter((entry) => entry.id !== id));
  }

  function handleMergeFileMove(id: string, direction: "up" | "down") {
    resetResult();
    setActiveExample(null);
    setMergeFiles((prev) => {
      const index = prev.findIndex((entry) => entry.id === id);
      const swapWith = direction === "up" ? index - 1 : index + 1;
      if (index < 0 || swapWith < 0 || swapWith >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[swapWith]] = [next[swapWith], next[index]];
      return next;
    });
  }

  async function handleSplitFileSelect(file: File) {
    resetResult();
    setSplitFile(file);
    setSplitInfo(null);
    if (file.size > MAX_TOTAL_BYTES) {
      setError(t("errors.tooLarge"));
      return;
    }
    try {
      setSplitInfo(await infoOf(file));
    } catch {
      setError(t("errors.invalidPdf"));
    }
  }

  function handleRangesInputChange(value: string) {
    resetResult();
    setActiveExample(null);
    setRangesInput(value);
  }

  async function handleProcess() {
    setError("");
    setResultBlob(null);

    if (mode === "merge") {
      if (mergeFiles.length < 2) {
        setError(t("errors.needTwoFiles"));
        return;
      }
      const totalSize = mergeFiles.reduce((sum, entry) => sum + entry.file.size, 0);
      if (totalSize > MAX_TOTAL_BYTES) {
        setError(t("errors.tooLarge"));
        return;
      }

      setIsProcessing(true);
      try {
        const buffers = await Promise.all(mergeFiles.map(async (entry) => new Uint8Array(await entry.file.arrayBuffer())));
        const merged = await mergePdfs(buffers);
        setResultBlob(new Blob([new Uint8Array(merged)], { type: "application/pdf" }));
        setOutputSizes([merged.length]);
      } catch {
        setError(t("errors.processingFailed"));
      } finally {
        setIsProcessing(false);
      }
    } else {
      if (!splitFile) {
        setError(t("errors.needFile"));
        return;
      }

      setIsProcessing(true);
      try {
        const bytes = new Uint8Array(await splitFile.arrayBuffer());
        const ranges = parsePageRanges(rangesInput);
        const parts = await splitPdf(bytes, ranges.length ? ranges : undefined);
        if (parts.length === 0) {
          setError(t("errors.noPages"));
          return;
        }

        if (parts.length === 1) {
          setResultBlob(new Blob([new Uint8Array(parts[0])], { type: "application/pdf" }));
        } else {
          const zip = new JSZip();
          parts.forEach((part, index) => {
            zip.file(`page-${index + 1}.pdf`, part);
          });
          setResultBlob(await zip.generateAsync({ type: "blob" }));
        }
        setResultCount(parts.length);
        setOutputSizes(parts.map((p) => p.length));
      } catch {
        setError(t("errors.processingFailed"));
      } finally {
        setIsProcessing(false);
      }
    }
  }

  function handleDownload() {
    if (!resultBlob) return;
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = mode === "merge" ? "merged.pdf" : resultCount > 1 ? "split-pages.zip" : "split.pdf";
    link.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const ready = mode === "merge" ? mergeFiles.length >= 2 : splitFile !== null;
    if (!ready) return;

    debounceRef.current = setTimeout(() => {
      void handleProcess();
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, mergeFiles, splitFile, rangesInput]);

  const draft: PdfDraft = {
    mode,
    rangesInput,
    mergeDocs: mergeFiles.map((e) => infos[e.id]).filter((x): x is PdfDocInfo => Boolean(x)),
    splitDoc: splitInfo,
    outputSizes,
  };

  function setDim<K extends keyof PdfDraft>(key: K, value: PdfDraft[K]) {
    if (key === "rangesInput") handleRangesInputChange(value as string);
    else if (key === "mode") handleModeChange(value as PdfMode);
  }

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <PdfLiveProvider value={{ dims: draft, setDim }}>
      <div ref={sentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <PdfMergeSplitInputPanel
                mode={mode}
                onModeChange={handleModeChange}
                mergeFiles={mergeFiles}
                pendingMergeNames={seedPending ? SEED_MERGE.map((key) => `${key}.pdf`) : undefined}
                onMergeFilesAdd={handleMergeFilesAdd}
                onMergeFileRemove={handleMergeFileRemove}
                onMergeFileMove={handleMergeFileMove}
                splitFile={splitFile}
                onSplitFileSelect={(file) => {
                  setActiveExample(null);
                  void handleSplitFileSelect(file);
                }}
                splitPageCount={splitInfo?.pageCount ?? null}
                rangesInput={rangesInput}
                onRangesInputChange={handleRangesInputChange}
                error={error}
                onClear={handleClear}
              />
              <QuickExamplesCard
                title={tEx("title")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={(id) => void loadExample(id)}
                examples={EXAMPLES.map((ex) => ({
                  id: ex.id,
                  label: tEx(ex.id),
                  detail: ex.mode === "merge" ? ex.files.map((k) => `${SAMPLES[k].title} (${SAMPLES[k].pages})`).join(" + ") : `${SAMPLES.handbook.title} (6) · ${ex.ranges || tEx("everyPage")}`,
                }))}
              />
            </div>
          }
          result={<PdfMergeSplitResult isProcessing={isProcessing} resultCount={resultCount} onDownload={handleDownload} />}
          sidebar={<RelatedToolsSidebar fill currentSlug="pdf-merge-split" category="file-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="pdf-merge-split" />
              <SectionNav items={navItems} visible={navBarVisible} />
              <PdfMergeSplitReference />
            </div>
          }
        />
      </div>

      {education}
    </PdfLiveProvider>
  );
}
