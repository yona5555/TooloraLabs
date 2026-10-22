"use client";
import { useTranslations } from "next-intl";
import { QR_LEVELS, QR_RECOVERY } from "@tooloralabs/tools";
import QRIndicatorCard, { QRIndicatorUnavailable } from "./QRIndicatorCard";
import { useQRModel } from "./QRLiveContext";

const W = 340;
const H = 210;
const BASE = H - 40;
const TOP = 24;

/**
 * Type #13 (Stepped Diagram): the smallest version (and grid size) your content needs at each
 * error-correction level — the staircase you climb when you ask for more damage tolerance.
 */
export default function QRMinVersionSteps() {
  const t = useTranslations("tools.qr-code-generator.education.lab.steps");
  const { draft, a, f } = useQRModel();
  if (!a) return <QRIndicatorUnavailable title={t("title")} />;

  const vs = QR_LEVELS.map((l) => a.minVersion[l] ?? 41);
  const maxV = Math.max(...vs, 4);
  const step = W / 4;
  const y = (v: number) => BASE - (v / maxV) * (BASE - TOP);

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <path d={vs.map((v, i) => `${i ? "L" : "M"} ${i * step} ${y(v)} H ${(i + 1) * step}`).join(" ")} fill="none" strokeWidth={2} className="stroke-blue-600 dark:stroke-blue-400" />
      {QR_LEVELS.map((l, i) => {
        const v = vs[i];
        const active = l === draft.errorCorrectionLevel;
        return (
          <g key={l}>
            <rect x={i * step + 6} y={y(v)} width={step - 12} height={BASE - y(v)} rx={4} className={active ? "fill-blue-600/80 dark:fill-blue-400/80" : "fill-blue-200 dark:fill-blue-900"} />
            <text x={i * step + step / 2} y={y(v) - 6} textAnchor="middle" fontSize={12} fontWeight={700} className="fill-zinc-800 dark:fill-zinc-100">
              {v > 40 ? "—" : `v${v}`}
            </text>
            {v <= 40 && (
              <text x={i * step + step / 2} y={BASE - 8} textAnchor="middle" fontSize={11} fontFamily="ui-monospace, monospace" className={active ? "fill-white" : "fill-blue-800 dark:fill-blue-200"}>
                {17 + 4 * v}²
              </text>
            )}
            <text x={i * step + step / 2} y={BASE + 16} textAnchor="middle" fontSize={13} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
              {l}
            </text>
            <text x={i * step + step / 2} y={BASE + 32} textAnchor="middle" fontSize={11} className="fill-zinc-500 dark:fill-zinc-400">
              {Math.round(QR_RECOVERY[l] * 100)}%
            </text>
          </g>
        );
      })}
    </svg>
  );

  const l = a.minVersion.L ?? 41;
  const h = a.minVersion.H ?? 41;
  return (
    <QRIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        ...QR_LEVELS.map((lv, i) => ({ label: lv, value: vs[i] > 40 ? t("tooLong") : `v${vs[i]} · ${17 + 4 * vs[i]} × ${17 + 4 * vs[i]}` })),
        { label: t("cost"), value: l <= 40 && h <= 40 ? `+${f((17 + 4 * h) ** 2 - (17 + 4 * l) ** 2)} ${t("modules")}` : "—", emphasize: true },
      ]}
    />
  );
}
