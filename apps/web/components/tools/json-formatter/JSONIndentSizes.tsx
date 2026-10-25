"use client";
import { useTranslations } from "next-intl";
import JSONIndicatorCard, { JSONIndicatorUnavailable } from "./JSONIndicatorCard";
import { formatBytes, useJSONModel } from "./JSONLiveContext";
import { svgPx } from "@/components/tool-ui/svgPx";

const W = 340;
const LABEL = 76;
const BAR_X = LABEL + 8;
const BAR_W = 180;
const ROW = 30;
const TOP = 24;

/**
 * Type #11 (Side-by-Side Equivalence): the same data written five ways. Each bar splits into the
 * payload every style shares (blue) and the whitespace that style adds (amber); the active style is bold.
 */
export default function JSONIndentSizes() {
  const t = useTranslations("tools.json-formatter.education.lab.indent");
  const { draft, a, f, pct } = useJSONModel();
  if (!a) return <JSONIndicatorUnavailable title={t("title")} />;

  const s = a.sizes;
  const styles = [
    { key: "input", bytes: s.input, active: false },
    { key: "minified", bytes: s.minified, active: draft.mode === "minify" },
    {
      key: "two",
      bytes: s.indent2,
      active: draft.mode === "format" && draft.indent === 2,
    },
    {
      key: "four",
      bytes: s.indent4,
      active: draft.mode === "format" && draft.indent === 4,
    },
    {
      key: "tab",
      bytes: s.tab,
      active: draft.mode === "format" && draft.indent === "tab",
    },
  ] as const;
  const max = Math.max(...styles.map((x) => x.bytes));
  const H = TOP + styles.length * ROW;

  const svg = (
    <svg direction="ltr" width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label={t("aria")} className="mx-auto block max-w-full">
      <circle cx={BAR_X + 4} cy={10} r={5} className="fill-blue-500 dark:fill-blue-400" />
      <text style={{ fontSize: svgPx(12) }} x={BAR_X + 14} y={14} className="fill-zinc-500 dark:fill-zinc-400">
        {t("payloadKey")}
      </text>
      <circle cx={BAR_X + 104} cy={10} r={5} className="fill-amber-400 dark:fill-amber-500" />
      <text style={{ fontSize: svgPx(12) }} x={BAR_X + 114} y={14} className="fill-zinc-500 dark:fill-zinc-400">
        {t("whitespaceKey")}
      </text>
      {styles.map((st, i) => {
        const y = TOP + i * ROW;
        const total = (st.bytes / max) * BAR_W;
        const core = (Math.min(s.minified, st.bytes) / max) * BAR_W;
        const weight = st.active ? 700 : 500;
        return (
          <g key={st.key}>
            <text style={{ fontSize: svgPx(12) }} x={LABEL} y={y + 17} textAnchor="end" fontWeight={weight} className={st.active ? "fill-blue-700 dark:fill-blue-300" : "fill-zinc-600 dark:fill-zinc-300"}>
              {t(st.key)}
            </text>
            <rect x={BAR_X} y={y + 5} width={Math.max(2, core)} height={18} rx={3} className="fill-blue-500 dark:fill-blue-400" />
            {total - core > 0.5 && <rect x={BAR_X + core} y={y + 5} width={total - core} height={18} rx={3} className="fill-amber-400 dark:fill-amber-500" />}
            <text style={{ fontSize: svgPx(12) }}
              x={BAR_X + total + 6}
              y={y + 18}
              fontWeight={weight}
              fontFamily="ui-monospace, monospace"
              className={st.active ? "fill-blue-700 dark:fill-blue-300" : "fill-zinc-500 dark:fill-zinc-400"}
            >
              {formatBytes(st.bytes)}
            </text>
          </g>
        );
      })}
    </svg>
  );

  return (
    <JSONIndicatorCard
      title={t("title")}
      intro={t("intro")}
      indicator={svg}
      rows={[
        { label: t("minified"), value: formatBytes(s.minified) },
        {
          label: t("two"),
          value: `+${f(s.indent2 - s.minified)} B (+${pct(s.indent2 - s.minified, s.minified)})`,
        },
        {
          label: t("four"),
          value: `+${f(s.indent4 - s.minified)} B (+${pct(s.indent4 - s.minified, s.minified)})`,
        },
        {
          label: t("tab"),
          value: `+${f(s.tab - s.minified)} B (+${pct(s.tab - s.minified, s.minified)})`,
        },
        {
          label: t("saving"),
          value: `${f(s.input - s.minified)} B (${pct(s.input - s.minified, s.input)})`,
          emphasize: true,
        },
      ]}
    />
  );
}
