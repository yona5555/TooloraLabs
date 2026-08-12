"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ImageInputPanel, { type OutputFormat } from "./ImageInputPanel";
import ImageResult from "./ImageResult";
import ImageFormatReference from "./ImageFormatReference";
import { computeResizedDimensions, type Dimensions } from "./resizeMath";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const CONVERT_DEBOUNCE_MS = 250;

const FORMAT_EXTENSIONS: Record<OutputFormat, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

export default function ImageConverterTool({ education }: { education: ReactNode }) {
  const t = useTranslations("tools.image-converter");

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [format, setFormat] = useState<OutputFormat>("image/webp");
  const [quality, setQuality] = useState(0.85);
  const [resizeEnabled, setResizeEnabled] = useState(false);
  const [maxWidth, setMaxWidth] = useState("1920");
  const [error, setError] = useState("");

  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [outputDimensions, setOutputDimensions] = useState<Dimensions | null>(null);
  const [isConverting, setIsConverting] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      if (resultUrl) URL.revokeObjectURL(resultUrl);
    };
  }, [resultUrl]);

  function handleFileSelect(selected: File) {
    setError("");
    setResultUrl("");

    if (!selected.type.startsWith("image/")) {
      setError(t("errors.invalidFile"));
      return;
    }
    if (selected.size > MAX_FILE_SIZE) {
      setError(t("errors.tooLarge"));
      return;
    }

    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!previewUrl) return;

    debounceRef.current = setTimeout(() => {
      setIsConverting(true);
      const img = new window.Image();
      img.onload = () => {
        const parsedMaxWidth = resizeEnabled ? Number(maxWidth) || null : null;
        const dims = computeResizedDimensions({ width: img.naturalWidth, height: img.naturalHeight }, parsedMaxWidth, null);

        const canvas = document.createElement("canvas");
        canvas.width = dims.width;
        canvas.height = dims.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          setIsConverting(false);
          setError(t("errors.conversionFailed"));
          return;
        }
        ctx.drawImage(img, 0, 0, dims.width, dims.height);
        canvas.toBlob(
          (blob) => {
            setIsConverting(false);
            if (!blob) {
              setError(t("errors.conversionFailed"));
              return;
            }
            setResultUrl((prev) => {
              if (prev) URL.revokeObjectURL(prev);
              return URL.createObjectURL(blob);
            });
            setResultSize(blob.size);
            setOutputDimensions(dims);
          },
          format,
          format === "image/png" ? undefined : quality
        );
      };
      img.onerror = () => {
        setIsConverting(false);
        setError(t("errors.conversionFailed"));
      };
      img.src = previewUrl;
    }, CONVERT_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewUrl, format, quality, resizeEnabled, maxWidth]);

  function download() {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `converted.${FORMAT_EXTENSIONS[format]}`;
    link.click();
  }

  const tNav = useTranslations("tools.image-converter.nav");
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
            <ImageInputPanel
              file={file}
              previewUrl={previewUrl}
              onFileSelect={handleFileSelect}
              format={format}
              onFormatChange={setFormat}
              quality={quality}
              onQualityChange={setQuality}
              resizeEnabled={resizeEnabled}
              onResizeEnabledChange={setResizeEnabled}
              maxWidth={maxWidth}
              onMaxWidthChange={setMaxWidth}
              error={error}
            />
          }
          result={
            <ImageResult
              resultUrl={resultUrl}
              resultSize={resultSize}
              originalSize={file?.size ?? 0}
              outputDimensions={outputDimensions}
              isConverting={isConverting}
              onDownload={download}
            />
          }
          sidebar={<RelatedToolsSidebar currentSlug="image-converter" category="converters" />}
          secondary={
            <div className="flex flex-col gap-6">
              <SectionNav items={navItems} />
              <ImageFormatReference />
            </div>
          }
        />
      </div>

      {education}
    </>
  );
}
