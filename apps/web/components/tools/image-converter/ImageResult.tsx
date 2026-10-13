"use client";
import { useTranslations } from "next-intl";
import { Download, Hand } from "lucide-react";
import SectionCard from "@/components/tool-ui/SectionCard";
import { KitControls } from "@/components/tool-ui/indicator-kit/CardKit";
import { DualRingGauge, evenTicks } from "@/components/tool-ui/indicator-kit/DualRingGauge";
import { formatBytes } from "./formatBytes";
import type { Dimensions } from "./resizeMath";
import type { OutputFormat } from "./ImageInputPanel";
import ImageShareExportModal from "./ImageShareExportModal";
import ImageCompare from "./ImageCompare";
import ImageQualityCurve, { type SweepPoint } from "./ImageQualityCurve";
import { qualityStepper } from "./qualityStepper";

type ImageResultProps = {
  originalUrl: string;
  resultUrl: string;
  resultSize: number;
  originalSize: number;
  originalDimensions: Dimensions | null;
  outputDimensions: Dimensions | null;
  isConverting: boolean;
  onDownload: () => void;
  format: OutputFormat;
  quality: number;
  onQualityChange: (q: number) => void;
  isSample: boolean;
  sweep: SweepPoint[];
};

/**
 * §44 (2D): the Result card carries the before / after comparison at its top, then the approved
 * double-ring gauge: the outer ring is the quality setting (its handle and buttons write the
 * Quality field), the inner ring is the converted file's size as a share of the original's. Every
 * number comes from the actual conversion (blob sizes, canvas dimensions).
 */
export default function ImageResult({
  originalUrl,
  resultUrl,
  resultSize,
  originalSize,
  originalDimensions,
  outputDimensions,
  isConverting,
  onDownload,
  format,
  quality,
  onQualityChange,
  isSample,
  sweep,
}: ImageResultProps) {
  const t = useTranslations("tools.image-converter");
  const tv = useTranslations("tools.image-converter.visuals.result");
  const tc = useTranslations("toolPage.indicatorKit");

  const ready = Boolean(resultUrl) && originalSize > 0;
  const percentChange = ready ? Math.round((1 - resultSize / originalSize) * 100) : 0;
  const formatLabel = format.split("/")[1].toUpperCase();
  const lossless = format === "image/png";

  const q = Math.round(quality * 100);
  const s = qualityStepper(quality, onQualityChange);
  const share = ready ? resultSize / originalSize : 0;
  const saving = percentChange > 0 ? `−${percentChange} %` : percentChange < 0 ? `+${Math.abs(percentChange)} %` : "0 %";
  const dims = (d: Dimensions | null) => (d ? `${d.width} × ${d.height} px` : "—");

  return (
    <div data-ph-visual data-ph-hero data-ph-result className="flex flex-col leading-normal lg:flex-1" style={{ fontFamily: "var(--glass-font)" }}>
      <SectionCard
        id="image-result"
        title={t("aboveFold.resultTitle")}
        className="flex flex-col lg:flex-1"
        bodyClassName="flex flex-1 flex-col gap-4 p-4 lg:p-6"
        action={
          <span className="flex items-center gap-2">
            <span role="img" aria-label={tc("interactive")} title={tc("interactive")} data-ph-interactive className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
              <Hand size={15} aria-hidden />
            </span>
            {ready && (
              <ImageShareExportModal
                operationLabel={formatLabel}
                inputRows={[{ label: t("form.formatLabel"), value: formatLabel }]}
                resultRows={[
                  { label: t("aboveFold.originalSize"), value: formatBytes(originalSize) },
                  { label: t("aboveFold.newSize"), value: formatBytes(resultSize) },
                  ...(outputDimensions ? [{ label: t("shareExport.dimensionsLabel"), value: `${outputDimensions.width} × ${outputDimensions.height}px` }] : []),
                ]}
                heroLabel={t("aboveFold.newSize")}
                heroValue={formatBytes(resultSize)}
                sentence={t("shareExport.summarySentence", { format: formatLabel, size: formatBytes(resultSize) })}
              />
            )}
          </span>
        }
      >
        {originalUrl && originalDimensions ? (
          <ImageCompare
            originalUrl={originalUrl}
            resultUrl={resultUrl}
            width={originalDimensions.width}
            height={originalDimensions.height}
            formatLabel={lossless ? formatLabel : `${formatLabel} ${q} %`}
            isSample={isSample}
          />
        ) : (
          <p className="rounded-xl px-4 py-8 text-center text-sm" style={{ background: "var(--glass-track)", color: "var(--ph-ink-muted)" }}>
            {t("form.converting")}
          </p>
        )}

        <div className="flex flex-col gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800" data-testid="image-gauge">
          <p className="text-center text-xs font-semibold" style={{ color: "var(--ph-ink-muted)" }}>
            <span style={{ color: "var(--cv-from)" }}>● {tv("outerRing")}</span>
            <span className="mx-2">·</span>
            <span style={{ color: "var(--cv-to)" }}>● {tv("innerRing")}</span>
          </p>
          <DualRingGauge
            s={s}
            frac={q / 100}
            innerFrac={share}
            fromFrac={(f) => f * 100}
            outer={{ ticks: evenTicks(10, 100), color: "var(--cv-from)", tickColor: "var(--ph-ink)" }}
            inner={{ ticks: evenTicks(10, 100), color: "var(--cv-to)", tickColor: "var(--ph-ink-muted)" }}
            center={[ready ? saving : "…", lossless ? tv("lossless") : `Q ${q} %`, ready ? formatBytes(resultSize) : "…"]}
            label={tv("gaugeHandle")}
            valueText={`Q ${q} %: ${ready ? `${formatBytes(originalSize)} → ${formatBytes(resultSize)} (${saving})` : ""}`}
            testId="image-gauge"
          />
          <KitControls s={s} valueText={`Q ${q} %`} testId="image-gauge" />
        </div>

        {/* Real encodes across the quality range; this curve takes the card's spare height (§41). */}
        <div className="flex flex-1 flex-col gap-2 border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <ImageQualityCurve s={s} points={sweep} current={ready ? resultSize : 0} originalSize={originalSize} formatLabel={formatLabel} />
          {lossless && (
            <p className="text-center text-xs" style={{ color: "var(--ph-ink-muted)" }}>
              {tv("curvePng")}
            </p>
          )}
        </div>

        <dl className="grid grid-cols-2 gap-2 text-center" data-testid="image-stats">
          {[
            { k: "orig", label: t("aboveFold.originalSize"), value: formatBytes(originalSize) },
            { k: "new", label: t("aboveFold.newSize"), value: ready ? formatBytes(resultSize) : "…" },
            { k: "dimsIn", label: tv("dimsOriginal"), value: dims(originalDimensions) },
            { k: "dimsOut", label: tv("dimsConverted"), value: dims(outputDimensions) },
          ].map((r) => (
            <div key={r.k} className="rounded-xl px-2 py-2" style={{ background: "var(--glass-table-wrap-bg)" }}>
              <dt className="text-xs" style={{ color: "var(--ph-ink-muted)" }}>
                {r.label}
              </dt>
              <dd dir="ltr" data-testid={`image-stat-${r.k}`} className="m-0 mt-0.5 text-sm font-semibold tabular-nums" style={{ color: "var(--ph-ink)" }}>
                {r.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap items-stretch gap-2">
        <div
          data-testid="image-saving"
          className={`flex flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-center text-sm font-semibold ${
            percentChange > 0
              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
              : percentChange < 0
                ? "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                : "bg-zinc-50 text-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-300"
          }`}
        >
          {!ready
            ? isConverting
              ? t("form.converting")
              : "…"
            : percentChange > 0
              ? t("aboveFold.smallerBy", { percent: percentChange })
              : percentChange < 0
                ? t("aboveFold.largerBy", { percent: Math.abs(percentChange) })
                : t("aboveFold.sameSize")}
        </div>

        <button
          type="button"
          onClick={onDownload}
          disabled={!ready}
          className="flex items-center justify-center gap-2 rounded-lg border border-zinc-300 px-4 py-3 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-700"
        >
          <Download size={16} />
          {t("form.download")}
        </button>
        </div>
      </SectionCard>
    </div>
  );
}
