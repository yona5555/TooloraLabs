"use client";
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import ToolAboveFold from "@/components/tools/layout/ToolAboveFold";
import RelatedToolsSidebar from "@/components/tool-ui/RelatedToolsSidebar";
import SectionNav from "@/components/tool-ui/SectionNav";
import ViewDocsLink from "@/components/tool-ui/ViewDocsLink";
import { GlassPage } from "@/components/tool-ui/glass/GlassPrimitives";
import { useNavBarVisible } from "@/components/tool-ui/useNavBarVisible";
import ImageInputPanel, { type OutputFormat } from "./ImageInputPanel";
import ImageResult from "./ImageResult";
import ImageFormatReference from "./ImageFormatReference";
import { computeResizedDimensions, type Dimensions } from "./resizeMath";
import { makeSampleImage } from "./sampleImage";
import { Q_SEED } from "./qualityStepper";

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
  const [quality, setQuality] = useState(Q_SEED / 100);
  const [resizeEnabled, setResizeEnabled] = useState(false);
  const [maxWidth, setMaxWidth] = useState("1920");
  const [error, setError] = useState("");
  // The page opens on a built-in sample so the Result card is never empty; an upload replaces it.
  const [isSample, setIsSample] = useState(false);
  const [originalDimensions, setOriginalDimensions] = useState<Dimensions | null>(null);

  const [resultUrl, setResultUrl] = useState("");
  const [resultSize, setResultSize] = useState(0);
  const [outputDimensions, setOutputDimensions] = useState<Dimensions | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  // The same image encoded in all three formats at the current quality (the format guide's chart).
  // The current format encoded at 10, 20 … 100 % quality (the Result card's size curve).
  const [sweep, setSweep] = useState<{ q: number; size: number }[]>([]);
  const [formatSizes, setFormatSizes] = useState<Partial<Record<OutputFormat, number>>>({});

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

  // An upload (or a newer sample load) bumps this, so a slow sample fetch can never overwrite it.
  const sampleToken = useRef(0);
  const loadSample = useCallback(() => {
    const token = ++sampleToken.current;
    makeSampleImage().then((sample) => {
      if (!sample || token !== sampleToken.current) return;
      setFile(sample);
      setIsSample(true);
      setPreviewUrl(URL.createObjectURL(sample));
    });
  }, []);

  useEffect(() => {
    loadSample();
  }, [loadSample]);

  function handleFileSelect(selected: File) {
    sampleToken.current++;
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
    setIsSample(false);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!previewUrl) return;

    debounceRef.current = setTimeout(() => {
      setIsConverting(true);
      const img = new window.Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.naturalWidth, height: img.naturalHeight });
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
            setFormatSizes((prev) => ({ ...prev, [format]: blob.size }));
            setOutputDimensions(dims);
          },
          format,
          format === "image/png" ? undefined : quality
        );
        // Then the other two formats, for the format guide's size chart.
        (Object.keys(FORMAT_EXTENSIONS) as OutputFormat[])
          .filter((f) => f !== format)
          .forEach((f) =>
            canvas.toBlob(
              (b) => {
                if (b) setFormatSizes((prev) => ({ ...prev, [f]: b.size }));
              },
              f,
              f === "image/png" ? undefined : quality
            )
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

  useEffect(() => {
    if (!previewUrl) return;
    let cancelled = false;
    const timer = setTimeout(() => {
      const img = new window.Image();
      img.onload = () => {
        const parsedMaxWidth = resizeEnabled ? Number(maxWidth) || null : null;
        const dims = computeResizedDimensions({ width: img.naturalWidth, height: img.naturalHeight }, parsedMaxWidth, null);
        const canvas = document.createElement("canvas");
        canvas.width = dims.width;
        canvas.height = dims.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, dims.width, dims.height);
        // PNG ignores quality, so one encode gives the whole (flat) curve.
        const qs = format === "image/png" ? [10, 100] : [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
        const out: { q: number; size: number }[] = [];
        let pngSize = 0;
        const next = (i: number) => {
          if (cancelled) return;
          if (i >= qs.length) {
            setSweep(out);
            return;
          }
          if (format === "image/png" && pngSize) {
            out.push({ q: qs[i], size: pngSize });
            next(i + 1);
            return;
          }
          canvas.toBlob(
            (b) => {
              if (b) {
                pngSize = b.size;
                out.push({ q: qs[i], size: b.size });
              }
              next(i + 1);
            },
            format,
            format === "image/png" ? undefined : qs[i] / 100
          );
        };
        next(0);
      };
      img.src = previewUrl;
    }, CONVERT_DEBOUNCE_MS * 2);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [previewUrl, format, resizeEnabled, maxWidth]);

  // Clear returns to the sample (the Result card is never left empty).
  function handleClear() {
    setFormat("image/webp");
    setQuality(Q_SEED / 100);
    setResizeEnabled(false);
    setMaxWidth("1920");
    setError("");
    loadSample();
  }

  function download() {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `converted.${FORMAT_EXTENSIONS[format]}`;
    link.click();
  }

  const tNav = useTranslations("tools.image-converter.nav");
  const [navSentinelRef, navBarVisible] = useNavBarVisible();
  const navItems = [
    { id: "tool", label: tNav("tool") },
    { id: "faq", label: tNav("faq") },
    { id: "behind-the-tool", label: tNav("behindTheTool") },
  ];

  return (
    <GlassPage>
      {/* Inter everywhere on this page; drag-handle rims use the shared line token so they keep ≥3:1 in light mode. */}
      <div data-kit-page style={{ fontFamily: "var(--glass-font)", ["--glass-handle-border" as string]: "var(--ph-line)" } as CSSProperties}>
      <div ref={navSentinelRef} aria-hidden="true" />
      <div id="tool" className="scroll-mt-32">
        <ToolAboveFold
          tight
          stretchInput
          stretchResult
          sidebarMatchRow
          input={
            <div className="flex flex-col gap-4 lg:h-full">
              <ImageInputPanel
                file={file}
                isSample={isSample}
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
                onClear={handleClear}
              />
              {/* Desktop: under the input card (keeps the columns flush). Phone: after the Result card. */}
              <div className="hidden flex-1 flex-col lg:flex">
                <ImageFormatReference format={format} onFormatChange={setFormat} sizes={formatSizes} originalSize={file?.size ?? 0} quality={quality} />
              </div>
            </div>
          }
          result={
            <div className="flex flex-col gap-4 lg:h-full">
              <ImageResult
                originalUrl={previewUrl}
                resultUrl={resultUrl}
                resultSize={resultSize}
                originalSize={file?.size ?? 0}
                originalDimensions={originalDimensions}
                outputDimensions={outputDimensions}
                isConverting={isConverting}
                onDownload={download}
                format={format}
                quality={quality}
                onQualityChange={setQuality}
                isSample={isSample}
                sweep={sweep}
              />
              <div className="flex flex-col lg:hidden">
                <ImageFormatReference format={format} onFormatChange={setFormat} sizes={formatSizes} originalSize={file?.size ?? 0} quality={quality} />
              </div>
            </div>
          }
          sidebar={<RelatedToolsSidebar fill currentSlug="image-converter" category="converters" />}
          secondary={
            <div className="flex flex-col gap-4">
              <ViewDocsLink slug="image-converter" />
              <SectionNav items={navItems} visible={navBarVisible} />
            </div>
          }
        />
      </div>

      {education}
      </div>
    </GlassPage>
  );
}
