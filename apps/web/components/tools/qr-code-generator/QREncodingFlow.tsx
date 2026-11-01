"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useTranslations } from "next-intl";
import QRIndicatorCard, { QRIndicatorUnavailable } from "./QRIndicatorCard";
import { useQRModel } from "./QRLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";
import { labelW } from "@/components/tool-ui/labelLayout";

const W = 340;
const STEP = 46;

/**
 * Type #3 (Hierarchical Flow): how your content becomes modules — characters, UTF-8 bytes, bits with
 * mode and length headers, data codewords, plus error-correction codewords, then the module grid.
 */
export default function QREncodingFlow() {
  const t = useTranslations("tools.qr-code-generator.education.lab.flow");
  const { a, f } = useQRModel();
  if (!a) return <QRIndicatorUnavailable title={t("title")} />;

  const steps = [
    { key: "chars", value: f(a.payloadChars), cls: "fill-zinc-500 dark:fill-zinc-400" },
    { key: "bytes", value: f(a.payloadBytes), cls: "fill-sky-500 dark:fill-sky-400" },
    { key: "bits", value: f(a.usedBits), cls: "fill-blue-600 dark:fill-blue-400" },
    { key: "data", value: f(a.dataCodewords), cls: "fill-violet-500 dark:fill-violet-400" },
    { key: "total", value: `${f(a.dataCodewords)} + ${f(a.ecCodewords)} = ${f(a.totalCodewords)}`, cls: "fill-amber-500 dark:fill-amber-400" },
    { key: "modules", value: `${a.size} × ${a.size}`, cls: "fill-emerald-600 dark:fill-emerald-400" },
  ];
  const H = steps.length * STEP;
  // each pill as wide as its name and value need side by side (widths allow for the up-to-1.15× a
  // phone draws them at), so "Codewords + EC" never runs into "28 + 16 = 44" (§39)
  const PILL_W = Math.min(W - 4, Math.max(200, ...steps.map((s) => (labelW(t(s.key)) + labelW(s.value)) * 1.15 + 40)));
  const x0 = (W - PILL_W) / 2;

  const svg = (
    <FitSvg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {steps.map((s, i) => {
        const y = i * STEP + 4;
        return (
          <g key={s.key}>
            {i < steps.length - 1 && <path d={`M ${W / 2} ${y + 30} V ${y + STEP} m -5 -7 l 5 7 l 5 -7`} fill="none" strokeWidth={1.5} className="stroke-zinc-400 dark:stroke-zinc-500" />}
            <rect x={x0} y={y} width={PILL_W} height={30} rx={15} className={s.cls} />
            <text style={{ fontSize: svgPx(12) }} x={x0 + 14} y={y + 20} fontWeight={600} className="fill-white">
              {t(s.key)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={x0 + PILL_W - 14} y={y + 20} textAnchor="end" fontWeight={700} fontFamily="var(--font-mono)" className="fill-white">
              {s.value}
            </text>
          </g>
        );
      })}
    </FitSvg>
  );

  const seg = a.segments[0];
  return (
    <QRIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("mode"), value: a.segments.map((s) => `${s.mode} (${s.length})`).join(" + ") },
        { label: t("header"), value: `${f(a.usedBits - a.segments.reduce((s, g) => s + g.bits, 0))} ${t("bitsUnit")}` },
        { label: t("payloadBits"), value: seg ? `${f(a.segments.reduce((s, g) => s + g.bits, 0))} ${t("bitsUnit")}` : "0" },
        { label: t("bitsPerByte"), value: f(a.usedBits / Math.max(1, a.payloadBytes), 2) },
        { label: t("modulesPerByte"), value: f((a.size * a.size) / Math.max(1, a.payloadBytes), 1), emphasize: true },
      ]}
    />
  );
}
