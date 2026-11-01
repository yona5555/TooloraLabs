"use client";
import { useTranslations } from "next-intl";
import FsIndicatorCard, { FsIndicatorUnavailable } from "./FsIndicatorCard";
import { useFsModel } from "./FsLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const H = 210;

/**
 * Type #18 (Formula Diagram): the chain behind every conversion — value × base^level = bytes, × 8 = bits —
 * filled with your numbers, plus the megabits-vs-megabytes trap of connection speeds.
 */
export default function FsBitsFormula() {
  const t = useTranslations("tools.file-size-converter.education.lab.formula");
  const { draft, a, f } = useFsModel();
  if (!a) return <FsIndicatorUnavailable title={t("title")} />;

  const base = draft.standard === "binary" ? 1024 : 1000;
  const level = ["B", "KB", "MB", "GB", "TB", "PB"].indexOf(draft.unit);
  const terms = [
    { top: draft.value, bottom: t("value"), cls: "fill-blue-600 dark:fill-blue-400" },
    { top: `${base}^${level}`, bottom: draft.standard === "binary" ? t("binary") : t("decimal"), cls: "fill-violet-500 dark:fill-violet-400" },
    { top: "8", bottom: t("bitsPerByte"), cls: "fill-amber-500 dark:fill-amber-400" },
  ];

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      {terms.map((tm, i) => {
        const cx = 56 + i * 114;
        return (
          <g key={i}>
            <circle cx={cx} cy={58} r={36} className={tm.cls} />
            <text style={{ fontSize: svgPx(tm.top.length > 6 ? 13 : 17) }} x={cx} y={64} textAnchor="middle" fontWeight={700} fontFamily="var(--font-mono)" className="fill-white">
              {tm.top}
            </text>
            <text style={{ fontSize: svgPx(12) }} x={cx} y={112} textAnchor="middle" className="fill-zinc-500 dark:fill-zinc-400">
              {tm.bottom}
            </text>
            {i < 2 && (
              <text style={{ fontSize: svgPx(20) }} x={cx + 57} y={64} textAnchor="middle" fontWeight={700} className="fill-zinc-400">
                ×
              </text>
            )}
          </g>
        );
      })}
      <text style={{ fontSize: svgPx(13) }} x={W / 2} y={150} textAnchor="middle" fontWeight={700} fontFamily="var(--font-mono)" className="fill-zinc-800 dark:fill-zinc-100">
        = {f(a.bytes, 0)} B = {f(a.bits, 0)} bit
      </text>
      <text style={{ fontSize: svgPx(12) }} x={W / 2} y={182} textAnchor="middle" className="fill-rose-600 dark:fill-rose-300">
        {t("trap")}
      </text>
    </svg>
  );

  return (
    <FsIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("bytes"), value: f(a.bytes, 0) },
        { label: t("bits"), value: f(a.bits, 0) },
        { label: t("megabits"), value: `${f(a.bits / 1e6, 3)} Mb` },
        { label: t("megabytes"), value: `${f(a.bytes / 1e6, 3)} MB` },
        { label: t("speed"), value: t("speedValue"), emphasize: true },
      ]}
    />
  );
}
