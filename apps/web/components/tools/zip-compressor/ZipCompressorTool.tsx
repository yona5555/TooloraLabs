"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { byteEntropy, byteHistogram, extractZip, fileKind, readZipLayout, sampleZipFiles, zipFiles, type ZipLayout } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import ZipCompressorInputPanel, { type ZipMode } from "./ZipCompressorInputPanel";
import ZipCompressorResult, { type ExtractedEntry } from "./ZipCompressorResult";
import ZipCompressorReference from "./ZipCompressorReference";
import QuickExamplesCard from "@/components/tool-ui/QuickExamplesCard";
import { useNavBarVisible } from "@/components/tool-ui/useNavBarVisible";
import { ZipLiveProvider, type ZipDraft, type ZipFileStat } from "./ZipLiveContext";

const statOf = (name: string, data: Uint8Array): ZipFileStat => ({ name, size: data.length, entropy: byteEntropy(data), histogram: byteHistogram(data), kind: fileKind(name) });

/** Quick examples: subsets of the deterministic sample files (prose, CSV table, high-entropy bytes). */
const EXAMPLES: { id: string; mode: ZipMode; files: string[] }[] = [
  { id: "mixed", mode: "compress", files: ["notes.txt", "weather.csv", "photo.bin"] },
  { id: "text", mode: "compress", files: ["notes.txt"] },
  { id: "table", mode: "compress", files: ["weather.csv"] },
  { id: "random", mode: "compress", files: ["photo.bin"] },
  { id: "extract", mode: "extract", files: ["notes.txt", "weather.csv", "photo.bin"] },
];
const sampleFiles = (names: string[]) =>
  sampleZipFiles()
    .filter((f) => names.includes(f.name))
    .map((f) => new File([new Uint8Array(f.data)], f.name));

const MAX_TOTAL_BYTES = 50 * 1024 * 1024;
let nextId = 0;

type FileEntry = { file: File; id: string };

export default function ZipCompressorTool({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.zip-compressor");
  const tNav = useTranslations("tools.zip-compressor.nav");
  const tEx = useTranslations("tools.zip-compressor.examples");
  const [sentinelRef, navBarVisible] = useNavBarVisible();
  const [stats, setStats] = useState<ZipFileStat[]>([]);
  const [layout, setLayout] = useState<ZipLayout | null>(null);
  const [activeExample, setActiveExample] = useState<string | null>("mixed");

  const [mode, setMode] = useState<ZipMode>("compress");
  const [compressFiles, setCompressFiles] = useState<FileEntry[]>([]);
  const [extractFile, setExtractFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [compressedBlob, setCompressedBlob] = useState<Blob | null>(null);
  const [extractedEntries, setExtractedEntries] = useState<ExtractedEntry[]>([]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      extractedEntries.forEach((entry) => URL.revokeObjectURL(entry.url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function resetResult() {
    setError("");
    setCompressedBlob(null);
    setLayout(null);
    setExtractedEntries((prev) => {
      prev.forEach((entry) => URL.revokeObjectURL(entry.url));
      return [];
    });
  }

  async function loadExample(id: string) {
    const ex = EXAMPLES.find((e) => e.id === id);
    if (!ex) return;
    resetResult();
    setActiveExample(id);
    setMode(ex.mode);
    const files = sampleFiles(ex.files);
    if (ex.mode === "compress") setCompressFiles(files.map((file) => ({ file, id: String(nextId++) })));
    else {
      const zipped = await zipFiles(await Promise.all(files.map(async (f) => ({ name: f.name, data: new Uint8Array(await f.arrayBuffer()) }))));
      setExtractFile(new File([new Uint8Array(zipped)], "samples.zip", { type: "application/zip" }));
    }
  }

  // Open on a real result: compress the three sample files after mount (once, even under Strict Mode).
  const seeded = useRef(false);
  useEffect(() => {
    if (seeded.current) return;
    seeded.current = true;
    setCompressFiles(sampleFiles(EXAMPLES[0].files).map((file) => ({ file, id: String(nextId++) })));
  }, []);

  function handleModeChange(next: ZipMode) {
    resetResult();
    setActiveExample(null);
    setMode(next);
  }

  function handleCompressFilesAdd(files: FileList) {
    resetResult();
    setActiveExample(null);
    const additions = Array.from(files).map((file) => ({ file, id: String(nextId++) }));
    setCompressFiles((prev) => [...prev, ...additions]);
  }

  function handleCompressFileRemove(id: string) {
    resetResult();
    setActiveExample(null);
    setCompressFiles((prev) => prev.filter((entry) => entry.id !== id));
  }

  function handleExtractFileSelect(file: File) {
    resetResult();
    setActiveExample(null);
    setExtractFile(file);
  }

  function handleClear() {
    setActiveExample(null);
    setCompressFiles([]);
    setExtractFile(null);
    resetResult();
  }

  async function handleProcess() {
    setError("");

    if (mode === "compress") {
      const totalSize = compressFiles.reduce((sum, entry) => sum + entry.file.size, 0);
      if (compressFiles.length === 0) return;
      if (totalSize > MAX_TOTAL_BYTES) {
        setError(t("errors.tooLarge"));
        return;
      }

      setIsProcessing(true);
      try {
        const entries = await Promise.all(
          compressFiles.map(async (entry) => ({
            name: entry.file.name,
            data: new Uint8Array(await entry.file.arrayBuffer()),
          })),
        );
        const zipped = await zipFiles(entries);
        setCompressedBlob(new Blob([new Uint8Array(zipped)], { type: "application/zip" }));
        setStats(entries.map((e) => statOf(e.name, e.data)));
        setLayout(readZipLayout(zipped));
      } catch {
        setError(t("errors.processingFailed"));
      } finally {
        setIsProcessing(false);
      }
    } else {
      if (!extractFile) return;
      if (extractFile.size > MAX_TOTAL_BYTES) {
        setError(t("errors.tooLarge"));
        return;
      }

      setIsProcessing(true);
      try {
        const bytes = new Uint8Array(await extractFile.arrayBuffer());
        const entries = await extractZip(bytes);
        setStats(entries.map((e) => statOf(e.name, e.data)));
        setLayout(readZipLayout(bytes));
        if (entries.length === 0) {
          setError(t("errors.emptyZip"));
          return;
        }
        setExtractedEntries(
          entries.map((entry) => ({
            name: entry.name,
            size: entry.size,
            url: URL.createObjectURL(new Blob([new Uint8Array(entry.data)])),
          })),
        );
      } catch {
        setError(t("errors.invalidZip"));
      } finally {
        setIsProcessing(false);
      }
    }
  }

  function handleDownloadZip() {
    if (!compressedBlob) return;
    const url = URL.createObjectURL(compressedBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "archive.zip";
    link.click();
    URL.revokeObjectURL(url);
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const ready = mode === "compress" ? compressFiles.length > 0 : extractFile !== null;
    if (!ready) return;

    debounceRef.current = setTimeout(() => {
      void handleProcess();
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, compressFiles, extractFile]);

  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  const draft: ZipDraft = { mode, files: stats, layout };

  return (
    <ZipLiveProvider value={{ dims: draft, setDim: (key, value) => key === "mode" && handleModeChange(value as ZipMode) }}>
      <div ref={sentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          stretchInput
          stretchResult
          sidebarMatchRow
          input={
            <div className="flex flex-col gap-6 lg:h-full">
              <ZipCompressorInputPanel
                mode={mode}
                onModeChange={handleModeChange}
                compressFiles={compressFiles}
                onCompressFilesAdd={handleCompressFilesAdd}
                onCompressFileRemove={handleCompressFileRemove}
                extractFile={extractFile}
                onExtractFileSelect={handleExtractFileSelect}
                error={error}
                onClear={handleClear}
              />
              <QuickExamplesCard
                title={tEx("title")}
                className="lg:flex-1"
                activeId={activeExample}
                onPick={(id) => void loadExample(id)}
                examples={EXAMPLES.map((ex) => ({ id: ex.id, label: tEx(ex.id), detail: ex.files.join(" + ") }))}
              />
            </div>
          }
          result={<ZipCompressorResult isProcessing={isProcessing} onDownloadZip={handleDownloadZip} extractedEntries={extractedEntries} />}
          sidebar={<RelatedToolsSidebar fill currentSlug="zip-compressor" category="file-tools" />}
          secondary={
            <div className="flex flex-col gap-6">
              <ViewDocsLink slug="zip-compressor" />
              <SectionNav items={navItems} visible={navBarVisible} />
              <ZipCompressorReference />
            </div>
          }
        />
      </div>

      {education}
    </ZipLiveProvider>
  );
}
