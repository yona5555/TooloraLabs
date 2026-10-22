"use client";
import { useTranslations } from "next-intl";
import { QR_LEVELS, QR_RECOVERY } from "@tooloralabs/tools";
import QRIndicatorCard, { QRIndicatorUnavailable } from "./QRIndicatorCard";
import { useQRLive, useQRModel } from "./QRLiveContext";

const W = 340;
const H = 210;
const TOP = 26;
const BASE = H - 40;

/**
 * Type #1 (Labeled Bar Chart), clickable: how many bytes this version holds at each error-correction
 * level, with the payload drawn as a line. Click a bar to switch the level for the whole page.
 */
export default function QRLevelBars() {
  const t = useTranslations("tools.qr-code-generator.education.lab.levels");
  const { setDim } = useQRLive();
  const { draft, a, f, pct } = useQRModel();
  if (!a) return <QRIndicatorUnavailable title={t("title")} />;

  const peak = Math.max(...QR_LEVELS.map((l) => a.capacityAtVersion[l]), a.payloadBytes);
  const slot = W / 4;
  const y = (v: number) => BASE - (v / peak) * (BASE - TOP);

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <line x1={0} y1={BASE} x2={W} y2={BASE} className="stroke-zinc-300 dark:stroke-zinc-600" />
      {QR_LEVELS.map((l, i) => {
        const cap = a.capacityAtVersion[l];
        const x = i * slot + slot * 0.18;
        const w = slot * 0.64;
        const active = l === draft.errorCorrectionLevel;
        const fits = a.payloadBytes <= cap;
        return (
          <g key={l} onClick={() => setDim("errorCorrectionLevel", l)} className="cursor-pointer">
            <rect
              x={x}
              y={y(cap)}
              width={w}
              height={BASE - y(cap)}
              rx={5}
              className={active ? "fill-blue-600 dark:fill-blue-400" : fits ? "fill-blue-300 hover:fill-blue-400 dark:fill-blue-800" : "fill-zinc-300 dark:fill-zinc-700"}
            />
            <text x={x + w / 2} y={y(cap) - 6} textAnchor="middle" fontSize={12} fontWeight={700} fontFamily="ui-monospace, monospace" className="fill-zinc-800 dark:fill-zinc-100">
              {f(cap)}
            </text>
            <text x={x + w / 2} y={BASE + 16} textAnchor="middle" fontSize={13} fontWeight={700} className={active ? "fill-blue-700 dark:fill-blue-300" : "fill-zinc-600 dark:fill-zinc-300"}>
              {l}
            </text>
            <text x={x + w / 2} y={BASE + 32} textAnchor="middle" fontSize={11} className="fill-zinc-500 dark:fill-zinc-400">
              {Math.round(QR_RECOVERY[l] * 100)}%
            </text>
          </g>
        );
      })}
      <line x1={0} y1={y(a.payloadBytes)} x2={W} y2={y(a.payloadBytes)} strokeDasharray="5 4" strokeWidth={1.5} className="stroke-rose-500 dark:stroke-rose-400" />
      <text x={W} y={y(a.payloadBytes) - 5} textAnchor="end" fontSize={11} fontWeight={600} className="fill-rose-600 dark:fill-rose-300">
        {t("payload", { n: a.payloadBytes })}
      </text>
    </svg>
  );

  const lv = draft.errorCorrectionLevel;
  return (
    <QRIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("version"), value: String(a.version) },
        { label: t("current"), value: `${lv} · ${f(a.capacityAtVersion[lv])} B` },
        { label: t("recovery"), value: `${Math.round(QR_RECOVERY[lv] * 100)}%` },
        { label: t("lToH"), value: `${f(a.capacityAtVersion.L)} → ${f(a.capacityAtVersion.H)} B` },
        { label: t("used"), value: pct(a.payloadBytes, a.capacityAtVersion[lv]), emphasize: true },
      ]}
    />
  );
}
