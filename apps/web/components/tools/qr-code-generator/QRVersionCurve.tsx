"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useTranslations } from "next-intl";
import QRIndicatorCard, { QRIndicatorUnavailable } from "./QRIndicatorCard";
import { useQRModel } from "./QRLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 220;
const L = 42;
const R = 10;
const T = 14;
const B = 32;

/**
 * Type #7 (Trend Line with Highlighted Reference Point): byte capacity of all 40 QR versions at the
 * current error-correction level, with your payload as a line and the version actually used marked.
 */
export default function QRVersionCurve() {
  const t = useTranslations("tools.qr-code-generator.education.lab.versions");
  const { draft, a, f } = useQRModel();
  if (!a) return <QRIndicatorUnavailable title={t("title")} />;

  const caps = a.capacityByVersion;
  const maxY = caps[39];
  const x = (v: number) => L + ((v - 1) / 39) * (W - L - R);
  const y = (c: number) => Math.round((H - B - (c / maxY) * (H - B - T)) * 100) / 100;
  const line = caps.map((c, i) => `${i ? "L" : "M"} ${x(i + 1)} ${y(c)}`).join(" ");
  const cap = caps[a.version - 1];

  const svg = (
    <FitSvg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {[0, 1000, 2000].map((v) => (
        <g key={v}>
          <line x1={L} y1={y(v)} x2={W - R} y2={y(v)} className="stroke-zinc-200 dark:stroke-zinc-700" />
          <text style={{ fontSize: svgPx(12) }} x={L - 6} y={y(v) + 4} textAnchor="end" className="fill-zinc-500 dark:fill-zinc-400">
            {f(v)}
          </text>
        </g>
      ))}
      {[1, 10, 20, 30, 40].map((v) => (
        <text style={{ fontSize: svgPx(12) }} key={v} x={x(v)} y={H - B + 16} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
          {v}
        </text>
      ))}
      <text style={{ fontSize: svgPx(12) }} x={(L + W - R) / 2} y={H - 4} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
        {t("axis", { level: draft.errorCorrectionLevel })}
      </text>
      <line x1={L} y1={y(a.payloadBytes)} x2={W - R} y2={y(a.payloadBytes)} strokeDasharray="5 4" className="stroke-rose-500 dark:stroke-rose-400" />
      <path d={line} fill="none" strokeWidth={2.5} className="stroke-blue-600 dark:stroke-blue-400" />
      <circle cx={x(a.version)} cy={y(cap)} r={7} strokeWidth={2.5} className="fill-amber-500 stroke-white dark:fill-amber-400 dark:stroke-zinc-900" />
      <text style={{ fontSize: svgPx(12) }} x={Math.min(x(a.version) + 10, W - 110)} y={y(cap) - 10} fontWeight={700} className="fill-amber-700 dark:fill-amber-300">
        {t("point", { v: a.version, c: f(cap) })}
      </text>
    </FitSvg>
  );

  const prev = a.version > 1 ? caps[a.version - 2] : 0;
  return (
    <QRIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("payload"), value: `${f(a.payloadBytes)} B` },
        { label: t("thisVersion"), value: `v${a.version} · ${f(cap)} B` },
        { label: t("previous"), value: a.version > 1 ? `v${a.version - 1} · ${f(prev)} B` : "—" },
        { label: t("headroom"), value: `${f(cap - a.payloadBytes)} B` },
        { label: t("max"), value: `v40 · ${f(maxY)} B`, emphasize: true },
      ]}
    />
  );
}
