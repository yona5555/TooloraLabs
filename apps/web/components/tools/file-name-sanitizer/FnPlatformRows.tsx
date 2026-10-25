"use client";
import { useTranslations } from "next-intl";
import FnIndicatorCard, { FnIndicatorUnavailable } from "./FnIndicatorCard";
import { useFnModel } from "./FnLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const ROW = 50;

/**
 * Type #4 (Icon Comparison Rows): whether the original name is accepted as-is on Windows, macOS, Linux
 * and in a URL path, with the exact rule it breaks on each, next to the verdict for the sanitized name.
 */
export default function FnPlatformRows() {
  const t = useTranslations("tools.file-name-sanitizer.education.lab.platformRows");
  const tp = useTranslations("tools.file-name-sanitizer.education.lab.platforms");
  const tr = useTranslations("tools.file-name-sanitizer.education.lab.reasons");
  const { a } = useFnModel();
  if (!a) return <FnIndicatorUnavailable title={t("title")} />;

  const H = a.original.length * ROW + 4;
  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {a.original.map((p, i) => {
        const y = i * ROW + ROW / 2;
        const after = a.sanitized[i];
        return (
          <g key={p.platform}>
            <text style={{ fontSize: svgPx(13) }} x={0} y={y - 4} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
              {tp(p.platform)}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={0} y={y + 13} className={p.ok ? "fill-zinc-400 dark:fill-zinc-500" : "fill-rose-600 dark:fill-rose-300"}>
              {p.ok ? t("fine") : p.reasons.map((r) => tr(r)).join(" · ")}
            </text>
            <circle cx={W - 62} cy={y} r={13} className={p.ok ? "fill-emerald-500" : "fill-rose-500"} />
            <text style={{ fontSize: svgPx(14) }} x={W - 62} y={y + 5} textAnchor="middle" fontWeight={700} className="fill-white">
              {p.ok ? "✓" : "✕"}
            </text>
            <path d={`M ${W - 44} ${y} H ${W - 34} m -4 -4 l 4 4 l -4 4`} fill="none" strokeWidth={1.5} className="stroke-zinc-400" />
            <circle cx={W - 14} cy={y} r={13} className={after.ok ? "fill-emerald-500" : "fill-amber-500"} />
            <text style={{ fontSize: svgPx(14) }} x={W - 14} y={y + 5} textAnchor="middle" fontWeight={700} className="fill-white">
              {after.ok ? "✓" : "%"}
            </text>
          </g>
        );
      })}
    </svg>
  );

  const fails = a.original.filter((p) => !p.ok).length;
  return (
    <FnIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("originalFails"), value: `${fails} / ${a.original.length}` },
        { label: t("resultFails"), value: `${a.sanitized.filter((p) => !p.ok).length} / ${a.sanitized.length}` },
        { label: t("strictest"), value: tp("windows") },
        { label: t("urlNote"), value: a.sanitized[3].ok ? t("urlSafe") : t("urlEncode") },
        { label: t("verdict"), value: a.sanitized.slice(0, 3).every((p) => p.ok) ? t("portable") : t("notPortable"), emphasize: true },
      ]}
    />
  );
}
