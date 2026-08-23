"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import JSZip from "jszip";
import { mergePdfs, splitPdf, getPdfPageCount, parsePageRanges } from "@tooloralabs/tools";

import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import PdfMergeSplitInputPanel, { type PdfMode } from "./PdfMergeSplitInputPanel";
import PdfMergeSplitResult from "./PdfMergeSplitResult";

const MAX_TOTAL_BYTES = 25 * 1024 * 1024;
let nextId = 0;

type FileEntry = { file: File; id: string };

export default function PdfMergeSplitTool({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.pdf-merge-split");
  const tNav = useTranslations("tools.pdf-merge-split.nav");

  const [mode, setMode] = useState<PdfMode>("merge");
  const [mergeFiles, setMergeFiles] = useState<FileEntry[]>([]);
  const [splitFile, setSplitFile] = useState<File | null>(null);
  const [splitPageCount, setSplitPageCount] = useState<number | null>(null);
  const [rangesInput, setRangesInput] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [resultCount, setResultCount] = useState(0);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function resetResult() {
    setError("");
    setResultBlob(null);
  }

  function handleModeChange(next: PdfMode) {
    resetResult();
    setMode(next);
  }

  function handleMergeFilesAdd(files: FileList) {
    resetResult();
    const additions = Array.from(files)
      .filter((f) => f.type === "application/pdf")
      .map((file) => ({ file, id: String(nextId++) }));
    setMergeFiles((prev) => [...prev, ...additions]);
  }

  function handleMergeFileRemove(id: string) {
    resetResult();
    setMergeFiles((prev) => prev.filter((entry) => entry.id !== id));
  }

  function handleMergeFileMove(id: string, direction: "up" | "down") {
    resetResult();
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
    setSplitPageCount(null);
    if (file.size > MAX_TOTAL_BYTES) {
      setError(t("errors.tooLarge"));
      return;
    }
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      setSplitPageCount(await getPdfPageCount(bytes));
    } catch {
      setError(t("errors.invalidPdf"));
    }
  }

  function handleRangesInputChange(value: string) {
    resetResult();
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
            <PdfMergeSplitInputPanel
              mode={mode}
              onModeChange={handleModeChange}
              mergeFiles={mergeFiles}
              onMergeFilesAdd={handleMergeFilesAdd}
              onMergeFileRemove={handleMergeFileRemove}
              onMergeFileMove={handleMergeFileMove}
              splitFile={splitFile}
              onSplitFileSelect={handleSplitFileSelect}
              splitPageCount={splitPageCount}
              rangesInput={rangesInput}
              onRangesInputChange={handleRangesInputChange}
              error={error}
            />
          }
          result={
            <PdfMergeSplitResult
              mode={mode}
              isProcessing={isProcessing}
              resultReady={resultBlob !== null}
              resultCount={resultCount}
              onDownload={handleDownload}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="pdf-merge-split" category="file-tools" />}
          secondary={<SectionNav items={navItems} />}
        />
      </div>

      {education}
    </>
  );
}
