"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { zipFiles, extractZip } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ZipCompressorInputPanel, { type ZipMode } from "./ZipCompressorInputPanel";
import ZipCompressorResult, { type ExtractedEntry } from "./ZipCompressorResult";

const MAX_TOTAL_BYTES = 50 * 1024 * 1024;
let nextId = 0;

type FileEntry = { file: File; id: string };

export default function ZipCompressorTool({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.zip-compressor");
  const tNav = useTranslations("tools.zip-compressor.nav");

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
    setExtractedEntries((prev) => {
      prev.forEach((entry) => URL.revokeObjectURL(entry.url));
      return [];
    });
  }

  function handleModeChange(next: ZipMode) {
    resetResult();
    setMode(next);
  }

  function handleCompressFilesAdd(files: FileList) {
    resetResult();
    const additions = Array.from(files).map((file) => ({ file, id: String(nextId++) }));
    setCompressFiles((prev) => [...prev, ...additions]);
  }

  function handleCompressFileRemove(id: string) {
    resetResult();
    setCompressFiles((prev) => prev.filter((entry) => entry.id !== id));
  }

  function handleExtractFileSelect(file: File) {
    resetResult();
    setExtractFile(file);
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
          }))
        );
        const zipped = await zipFiles(entries);
        setCompressedBlob(new Blob([new Uint8Array(zipped)], { type: "application/zip" }));
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
        if (entries.length === 0) {
          setError(t("errors.emptyZip"));
          return;
        }
        setExtractedEntries(
          entries.map((entry) => ({
            name: entry.name,
            size: entry.size,
            url: URL.createObjectURL(new Blob([new Uint8Array(entry.data)])),
          }))
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

  return (
    <>
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          input={
            <ZipCompressorInputPanel
              mode={mode}
              onModeChange={handleModeChange}
              compressFiles={compressFiles}
              onCompressFilesAdd={handleCompressFilesAdd}
              onCompressFileRemove={handleCompressFileRemove}
              extractFile={extractFile}
              onExtractFileSelect={handleExtractFileSelect}
              error={error}
            />
          }
          result={
            <ZipCompressorResult
              mode={mode}
              isProcessing={isProcessing}
              compressedReady={compressedBlob !== null}
              compressedSize={compressedBlob?.size ?? 0}
              onDownloadZip={handleDownloadZip}
              extractedEntries={extractedEntries}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="zip-compressor" category="file-tools" />}
          secondary={<SectionNav items={navItems} />}
        />
      </div>

      {education}
    </>
  );
}
