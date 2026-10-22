"use client";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { foldJSON } from "@tooloralabs/tools";
import JSONIndicatorCard, { JSONIndicatorUnavailable } from "./JSONIndicatorCard";
import JSONCodeView from "./JSONCodeView";
import { formatBytes, useJSONModel } from "./JSONLiveContext";

/**
 * Interactive piece: drag the slider to fold every container deeper than the chosen level into a
 * one-line "{…n}" / "[…n]" summary, and watch the outline shrink to the document's skeleton.
 */
export default function JSONFoldExplorer() {
  const t = useTranslations("tools.json-formatter.education.lab.fold");
  const { parsed, a, f } = useJSONModel();
  const [level, setLevel] = useState(2);
  if (!a) return <JSONIndicatorUnavailable title={t("title")} />;

  const max = Math.max(1, a.maxDepth);
  const depth = Math.min(level, max);
  const folded = foldJSON(parsed, depth);
  const lines = folded.split("\n").length;
  const hidden = (folded.match(/…\d+/g) ?? []).length;
  const shownNodes = a.depthCounts.slice(0, depth).reduce((s, n) => s + n, 0);

  const indicator = (
    <div className="w-[22rem] max-w-full">
      <label className="flex items-center gap-3 text-sm font-medium text-zinc-600 dark:text-zinc-300">
        <span className="shrink-0">{t("slider")}</span>
        <input type="range" min={1} max={max} value={depth} onChange={(e) => setLevel(Number(e.target.value))} className="w-full accent-blue-600" aria-label={t("slider")} />
        <span dir="ltr" className="w-10 shrink-0 text-end font-mono font-bold text-blue-700 dark:text-blue-300">
          {depth}/{max}
        </span>
      </label>
      <JSONCodeView text={folded} unit="  " className="mt-3 h-72" />
    </div>
  );

  return (
    <JSONIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={indicator}
      rows={[
        { label: t("level"), value: `${depth} / ${max}` },
        { label: t("lines"), value: `${f(lines)} / ${f(a.formattedLines)}` },
        { label: t("folded"), value: f(hidden) },
        { label: t("nodes"), value: `${f(shownNodes)} / ${f(a.nodes)}` },
        {
          label: t("bytes"),
          value: formatBytes(new TextEncoder().encode(folded).length),
        },
        {
          label: t("saved"),
          value: `${f(100 - (lines / a.formattedLines) * 100, 1)}%`,
          emphasize: true,
        },
      ]}
    />
  );
}
