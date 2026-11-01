"use client";
import FitSvg from "@/components/tool-ui/FitSvg";
import { useTranslations } from "next-intl";
import PhoneMini from "@/components/tool-ui/indicator-kit/PhoneMini";
import QRIndicatorCard, { QRIndicatorUnavailable } from "./QRIndicatorCard";
import { useQRModel } from "./QRLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 190;
const CX = 95;
const CY = 95;
const KINDS = [
  { key: "letters", fill: "fill-blue-600 dark:fill-blue-400" },
  { key: "digits", fill: "fill-amber-500 dark:fill-amber-400" },
  { key: "punctuation", fill: "fill-rose-500 dark:fill-rose-400" },
  { key: "spaces", fill: "fill-zinc-400 dark:fill-zinc-500" },
  { key: "multibyte", fill: "fill-violet-500 dark:fill-violet-400" },
] as const;

function ring(r0: number, r1: number, t0: number, t1: number) {
  const span = Math.min(t1 - t0, 0.9999);
  const a0 = t0 * 2 * Math.PI - Math.PI / 2;
  const a1 = (t0 + span) * 2 * Math.PI - Math.PI / 2;
  const lg = span > 0.5 ? 1 : 0;
  const p = (r: number, a: number) => `${(CX + r * Math.cos(a)).toFixed(2)} ${(CY + r * Math.sin(a)).toFixed(2)}`;
  return `M ${p(r1, a0)} A ${r1} ${r1} 0 ${lg} 1 ${p(r1, a1)} L ${p(r0, a1)} A ${r0} ${r0} 0 ${lg} 0 ${p(r0, a0)} Z`;
}

/**
 * Type #6 (Donut): every byte of the exact text encoded (the payload, including the format syntax
 * like "WIFI:" or "BEGIN:VCARD") by kind; non-ASCII characters cost 2–4 bytes each in UTF-8.
 */
export default function QRPayloadDonut() {
  const t = useTranslations("tools.qr-code-generator.education.lab.bytes");
  const { a, payload, f, pct } = useQRModel();
  if (!a) return <QRIndicatorUnavailable title={t("title")} />;

  const vals = KINDS.map((k) => a.byteKinds[k.key]);
  const total = a.payloadBytes;
  const cum = vals.map((_, i) => [vals.slice(0, i).reduce((s, v) => s + v, 0) / total, vals.slice(0, i + 1).reduce((s, v) => s + v, 0) / total]);
  const prefix = payload.match(/^(WIFI:|BEGIN:VCARD|mailto:|SMSTO:|https?:\/\/)/)?.[0];

  const svg = (
    <FitSvg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {KINDS.map((k, i) => (vals[i] > 0 ? <path key={k.key} d={ring(52, 88, cum[i][0], cum[i][1])} className={`${k.fill} stroke-white dark:stroke-zinc-900`} strokeWidth={1.5} /> : null))}
      <text style={{ fontSize: svgPx(20) }} x={CX} y={CY - 2} textAnchor="middle" fontWeight={700} className="fill-zinc-800 dark:fill-zinc-100">
        {f(total)}
      </text>
      <text style={{ fontSize: svgPx(12) }} x={CX} y={CY + 15} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
        {t("bytes")}
      </text>
      {KINDS.map((k, i) => {
        const y = 22 + i * 30;
        return (
          <g key={k.key} opacity={vals[i] ? 1 : 0.45}>
            <circle cx={208} cy={y} r={6} className={k.fill} />
            <text style={{ fontSize: svgPx(12) }} x={220} y={y + 4} className="fill-zinc-600 dark:fill-zinc-300">
              {t(k.key)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={W - 4} y={y + 4} textAnchor="end" fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-800 dark:fill-zinc-100">
              {f(vals[i])}
            </text>
          </g>
        );
      })}
    </FitSvg>
  );

  return (
    <QRIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={<PhoneMini slot={1} title={t("title")}>{svg}</PhoneMini>}
      rows={[
        { label: t("chars"), value: f(a.payloadChars) },
        { label: t("utf8"), value: `${f(a.payloadBytes)} B` },
        { label: t("syntax"), value: prefix ? `"${prefix}"` : t("none") },
        { label: t("extra"), value: f(a.payloadBytes - a.payloadChars) },
        { label: t("ascii"), value: pct(a.payloadBytes - a.byteKinds.multibyte, a.payloadBytes), emphasize: true },
      ]}
    />
  );
}
