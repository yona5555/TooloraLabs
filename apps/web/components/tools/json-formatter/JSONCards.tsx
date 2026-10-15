"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { JSONFormatter } from "@tooloralabs/tools";
import { ltr } from "@/components/tool-ui/MixedText";
import { usePrefersReducedMotion } from "@/components/tool-ui/glass/GlassPrimitives";
import { IndicatorCard, KitControls, KitTable, KitTrack, useStepper, type KitRow } from "@/components/tool-ui/indicator-kit/CardKit";
import { Drawing, INK, MUTED, px2, SvgLabel, useDrawing } from "@/components/tool-ui/indicator-kit/SvgBits";
import { fmtSmart } from "@/components/tool-ui/indicator-kit/format";
import {
  ERROR_SAMPLES,
  flattenAll,
  heaviestNodes,
  isFlatObjectArray,
  layoutTree,
  maxDepthOf,
  SAMPLE_DATA,
  SAMPLE_TREE,
  sunburstRings,
  textByteLength,
  toCSV,
  toXML,
  toYAML,
  typeCounts,
  TYPE_TAG,
  TYPE_TOKEN,
  type JSONNodeType,
} from "./jsonTreeData";

/**
 * The eight 2D JSON Formatter indicator cards. Every number comes from the tool's own real
 * default sample document (never a hypothetical formula): the same SAMPLE_TREE/SAMPLE_DATA the
 * Result card shows by default, re-measured by each card's own real computation (byte sizes,
 * type counts, the real parser's error locations, real YAML/XML/CSV renderings). Each card keeps
 * its own seeded, independent state — never linked to the Result card or to another card.
 */
type Side = "visual-left" | "table-left";
const g = (v: number, sig = 4) => fmtSmart(v, sig);
const T = SvgLabel;
const bytes = textByteLength;
/** Zero-width-space after path separators so a long dot-path/pointer can wrap inside a table cell instead of forcing it wider (mobile overflow). */
const wrapPath = (s: string) => s.replace(/([./[])/g, "​$1");
const CV = ["var(--cv-from)", "var(--cv-to)", "var(--cv-third)", "var(--cv-warm)", "var(--cv-cool)"];

function useCardText(key: string) {
  return { t: useTranslations(`tools.json-formatter.visuals.${key}`), tc: useTranslations("toolPage.indicatorKit") };
}

// ── 1. Structure Sunburst: one ring per depth level, each segment sized by that branch's bytes ──
export function JSONStructureSunburstCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("sunburst");
  const cappedDepth = Math.min(maxDepthOf(SAMPLE_TREE), 5);
  const s = useStepper(2, { min: 1, max: cappedDepth, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const rings = useMemo(() => sunburstRings(SAMPLE_TREE, cappedDepth), [cappedDepth]);
  const HMIN = 280;
  const R0 = 26;
  const RING_W = 26;
  const d = useDrawing(HMIN, s, (x, y, W, H) => {
    const dist = Math.hypot(x - W / 2, y - H / 2);
    return Math.max(1, Math.min(cappedDepth, Math.round((dist - R0) / RING_W + 0.5)));
  });
  const { W, H } = d;
  const cx = W / 2;
  const cy = H / 2;
  const selected = rings[s.value - 1] ?? [];
  const selTotalBytes = selected.reduce((sum, sl) => sum + sl.node.bytes, 0) || 1;
  const topSlice = selected.reduce((m, sl) => (sl.frac > (m?.frac ?? -1) ? sl : m), selected[0]);
  const arcPath = (r: number, a0: number, a1: number) => {
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const x0 = px2(cx + r * Math.cos(a0 - Math.PI / 2));
    const y0 = px2(cy + r * Math.sin(a0 - Math.PI / 2));
    const x1 = px2(cx + r * Math.cos(a1 - Math.PI / 2));
    const y1 = px2(cy + r * Math.sin(a1 - Math.PI / 2));
    return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
  };
  const valueText = `level ${s.value} — ${selected.length} branches, ${g(selTotalBytes, 4)} B`;
  const rows: KitRow[] = selected.slice(0, 8).map((sl, i) => ({
    key: `${s.value}-${i}`,
    label: sl.node.depth === 1 ? sl.node.key : wrapPath(sl.node.dotPath.split(".").slice(-2).join(".")),
    value: `${(sl.frac * 100).toFixed(1)}% (${g(sl.node.bytes, 3)} B)`,
    isKey: sl === topSlice,
  }));
  return (
    <IndicatorCard
      idPrefix="json"
      n={1}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { level: ltr(String(s.value)), n: ltr(String(selected.length)) })}
      controls={<KitControls s={s} valueText={`L${s.value}`} testId="json-c1" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: cx, y: cy - (R0 + (s.value - 0.5) * RING_W), dir: "vertical" }} s={s} testId="json-c1">
          {rings.map((ring, ringIdx) => {
            const level = ringIdx + 1;
            const r = R0 + (level - 0.5) * RING_W;
            const on = level === s.value;
            return (
              <g key={level} opacity={on ? 1 : 0.3}>
                {ring.map((sl, i) => (
                  <path
                    key={i}
                    d={arcPath(r, sl.a0 * 2 * Math.PI, Math.max(sl.a0 * 2 * Math.PI + 0.01, sl.a1 * 2 * Math.PI - 0.01))}
                    fill="none"
                    stroke={TYPE_TOKEN[sl.node.type]}
                    strokeWidth={RING_W - 4}
                    onPointerEnter={() => on && setHover(`${s.value}-${i}`)}
                    onPointerLeave={() => setHover(null)}
                  />
                ))}
              </g>
            );
          })}
          <T x={cx} y={cy - 4} text={`L${s.value}`} size={15} bold style={INK} />
          <T x={cx} y={cy + 14} text={`${selected.length} nodes`} size={10.5} style={MUTED} />
        </Drawing>
      }
    />
  );
}

// ── 2. Type Distribution: a donut of the 6 JSON types across the whole document ──────────
const TYPE_ORDER: JSONNodeType[] = ["object", "array", "string", "number", "boolean", "null"];
export function JSONTypeDistributionCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("typeDistribution");
  const s = useStepper(0, { min: 0, max: 5, step: 1 });
  const [hover, setHover] = useState<JSONNodeType | null>(null);
  const counts = useMemo(() => typeCounts(SAMPLE_TREE), []);
  const total = TYPE_ORDER.reduce((sum, ty) => sum + counts[ty], 0) || 1;
  const HMIN = 260;
  const d = useDrawing(HMIN, s, (x, y, W, H) => {
    let a = Math.atan2(x - W / 2, -(y - H / 2));
    if (a < 0) a += 2 * Math.PI;
    let acc = 0;
    for (let i = 0; i < TYPE_ORDER.length; i++) {
      acc += counts[TYPE_ORDER[i]] / total;
      if (a / (2 * Math.PI) <= acc) return i;
    }
    return TYPE_ORDER.length - 1;
  });
  const { W, H } = d;
  const cx = W / 2;
  const cy = H / 2 - 6;
  const R2 = Math.min(W, H) * 0.34;
  const r1 = R2 * 0.58;
  const arcs = TYPE_ORDER.reduce<{ list: { type: JSONNodeType; a0: number; a1: number; frac: number }[]; acc: number }>(
    (state, type) => {
      const frac = counts[type] / total;
      const a0 = state.acc * 2 * Math.PI - Math.PI / 2;
      const acc = state.acc + frac;
      const a1 = acc * 2 * Math.PI - Math.PI / 2;
      return { list: [...state.list, { type, a0, a1, frac }], acc };
    },
    { list: [], acc: 0 },
  ).list;
  const arcPath = (r: number, a0: number, a1: number) => {
    const large = a1 - a0 > Math.PI ? 1 : 0;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
  };
  const selectedType = TYPE_ORDER[s.value];
  const selArc = arcs[s.value];
  const handleAngle = (selArc.a0 + selArc.a1) / 2;
  const valueText = `${selectedType}: ${counts[selectedType]} of ${total} values`;
  const topType = TYPE_ORDER.reduce((m, ty) => (counts[ty] > counts[m] ? ty : m), TYPE_ORDER[0]);
  const rows: KitRow[] = TYPE_ORDER.map((type) => ({
    key: type,
    label: t(`row.${type}`),
    value: `${counts[type]} (${((counts[type] / total) * 100).toFixed(1)}%)`,
    isKey: type === topType,
  }));
  return (
    <IndicatorCard
      idPrefix="json"
      n={2}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { type: t(`row.${selectedType}`), count: ltr(String(counts[selectedType])) })}
      controls={<KitControls s={s} valueText={t(`row.${selectedType}`)} testId="json-c2" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover ?? selectedType} onHover={(k) => setHover(k as JSONNodeType | null)} caption={tc("worked")} />}
      visual={
        <Drawing
          {...d}
          hMin={HMIN}
          label={t("handle")}
          valueText={valueText}
          handle={{ x: cx + (R2 + 14) * Math.cos(handleAngle), y: cy + (R2 + 14) * Math.sin(handleAngle), dir: "circular" }}
          s={s}
          testId="json-c2"
        >
          <circle cx={cx} cy={cy} r={r1} style={{ fill: "var(--ph-surface)" }} />
          {arcs.map((a) => (
            <path
              key={a.type}
              d={arcPath(R2, a.a0, a.a1)}
              style={{ fill: TYPE_TOKEN[a.type], opacity: a.type === selectedType ? 1 : 0.55, stroke: "var(--ph-surface)", strokeWidth: 1.5 }}
              onPointerEnter={() => setHover(a.type)}
              onPointerLeave={() => setHover(null)}
            />
          ))}
          <circle cx={cx} cy={cy} r={r1 + 1} fill="none" style={{ stroke: "var(--ph-surface)" }} strokeWidth={2} />
          <T x={cx} y={cy - 4} text={TYPE_TAG[selectedType]} size={16} bold style={{ fill: TYPE_TOKEN[selectedType] }} />
          <T x={cx} y={cy + 14} text={`${counts[selectedType]}`} size={11.5} style={MUTED} />
          <T x={cx} y={cy + R2 + 22} text={valueText} size={11} bold style={INK} />
        </Drawing>
      }
    />
  );
}

// ── 3. Pretty vs Minified: real byte sizes across indent widths ──────────────────────────
export function JSONPrettyMinifiedCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("prettyMinified");
  const s = useStepper(2, { min: 0, max: 8, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const sizeAt = (n: number) => bytes(n === 0 ? JSON.stringify(SAMPLE_DATA) : JSON.stringify(SAMPLE_DATA, null, n));
  const minified = useMemo(() => sizeAt(0), []);
  const twoSp = useMemo(() => sizeAt(2), []);
  const fourSp = useMemo(() => sizeAt(4), []);
  const tabSize = useMemo(() => bytes(JSON.stringify(SAMPLE_DATA, null, "\t")), []);
  const current = sizeAt(s.value);
  const BARS = [
    { key: "minified", label: t("rowMinified"), size: minified },
    { key: "twoSp", label: t("row2sp"), size: twoSp },
    { key: "fourSp", label: t("row4sp"), size: fourSp },
    { key: "tab", label: t("rowTab"), size: tabSize },
  ];
  const maxS = Math.max(...BARS.map((b) => b.size), current);
  const HMIN = 250;
  const X0 = 90;
  const d = useDrawing(HMIN, s, (x, _y, W) => Math.round(((x - X0) / (W - 14 - X0)) * 8));
  const { W, H } = d;
  const barW = W - 14 - X0;
  const rowGap = (H - 36) / 4;
  const saving = (size: number) => ((maxS - size) / maxS) * 100;
  const valueText = `${s.value} spaces → ${current} B`;
  const rows: KitRow[] = [
    ...BARS.map((b) => ({ key: b.key, label: b.label, value: `${b.size} B · −${g(saving(b.size), 3)}%` })),
    { key: "current", label: t("rowCustom", { n: ltr(String(s.value)) }), value: `${current} B`, isKey: true },
  ];
  const curX = X0 + (current / maxS) * barW;
  return (
    <IndicatorCard
      idPrefix="json"
      n={3}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { n: ltr(String(s.value)), size: ltr(`${current}B`) })}
      controls={<KitControls s={s} valueText={`${s.value} sp`} testId="json-c3" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: curX, y: 20, dir: "horizontal" }} s={s} testId="json-c3">
          {BARS.map((b, i) => {
            const y = 34 + i * rowGap;
            const w = (b.size / maxS) * barW;
            const on = hover === b.key;
            return (
              <g key={b.key} onPointerEnter={() => setHover(b.key)} onPointerLeave={() => setHover(null)}>
                <text x={X0 - 8} y={y + 5} fontSize={10.5} textAnchor="end" style={on ? INK : MUTED}>
                  {b.label}
                </text>
                <rect x={X0} y={y - 7} width={barW} height={14} rx={7} style={{ fill: "var(--glass-track)" }} />
                <rect x={X0} y={y - 7} width={Math.max(2, w)} height={14} rx={7} style={{ fill: "var(--cv-to)", opacity: on ? 1 : 0.8 }} />
                <text x={X0 + w + 6} y={y + 5} fontSize={10} style={INK} className="tabular-nums">
                  {b.size}B
                </text>
              </g>
            );
          })}
          <line x1={curX} y1={24} x2={curX} y2={34 + 3.5 * rowGap + 7} stroke="var(--ph-focus)" strokeWidth={2} strokeDasharray="3 3" />
          <T x={W / 2} y={H - 8} text={valueText} size={12} bold style={INK} />
        </Drawing>
      }
    />
  );
}

// ── 4. Error Locator: real parser output on curated common-mistake snippets ───────────────
const formatter = new JSONFormatter();
const ERROR_RESULTS = ERROR_SAMPLES.map(({ key, json }) => ({
  key,
  json,
  result: formatter.execute({ json, mode: "format", indent: 2, sortKeys: false }, { locale: "en-US" }),
}));
export function JSONErrorLocatorCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("errorLocator");
  const s = useStepper(0, { min: 0, max: ERROR_RESULTS.length - 1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const current = ERROR_RESULTS[s.value];
  const err = current.result.data;
  const lines = current.json.split("\n");
  const HMIN = 220;
  const d = useDrawing(HMIN, s, (x, _y, W) => Math.round((x / W) * (ERROR_RESULTS.length - 1)));
  const { W, H } = d;
  const lineH = 20;
  const charW = 7.2;
  const topY = 20;
  const errLine = err?.errorLine ?? 1;
  const errCol = err?.errorColumn ?? 1;
  const caretX = 14 + (errCol - 1) * charW;
  const caretY = topY + (errLine - 1) * lineH;
  const valueText = `${t(`kind.${current.key}`)} — line ${errLine}, col ${errCol}`;
  const rows: KitRow[] = [
    { key: "kind", label: t("rowKind"), value: t(`kind.${current.key}`) },
    { key: "line", label: t("rowLine"), value: String(errLine) },
    { key: "column", label: t("rowColumn"), value: String(errCol) },
    { key: "message", label: t("rowMessage"), value: err?.errorMessage ?? "", isKey: true },
  ];
  return (
    <IndicatorCard
      idPrefix="json"
      n={4}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { kind: t(`kind.${current.key}`), line: ltr(String(errLine)), col: ltr(String(errCol)) })}
      controls={<KitControls s={s} valueText={t(`kind.${current.key}`)} testId="json-c4" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: W - 20, y: caretY, dir: "horizontal" }} s={s} testId="json-c4">
          <rect x={4} y={caretY - lineH / 2} width={W - 8} height={lineH} rx={4} style={{ fill: "var(--glass-danger-soft)" }} />
          {lines.map((line, i) => (
            <text key={i} x={14} y={topY + i * lineH + 4} fontSize={11.5} fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" style={i + 1 === errLine ? { fill: "var(--glass-danger-strong)" } : INK}>
              {line || " "}
            </text>
          ))}
          <path d={`M ${caretX} ${caretY - 16} L ${caretX} ${caretY - 6}`} stroke="var(--glass-danger-strong)" strokeWidth={2} markerEnd="url(#json-err-arrow)" />
          <defs>
            <marker id="json-err-arrow" markerWidth={8} markerHeight={8} refX={4} refY={7} orient="auto">
              <path d="M0,0 L8,0 L4,8 Z" fill="var(--glass-danger-strong)" />
            </marker>
          </defs>
          <T x={W / 2} y={H - 8} text={valueText} size={11.5} bold style={INK} />
        </Drawing>
      }
    />
  );
}

const ALL_NODES = flattenAll(SAMPLE_TREE);

// ── 5. JSON Tree: the same tidy-tree the Result card used to show, now its own indicator ──
const TREE_ROW_H = 26;
const TREE_LEVEL_W = 140;
const TREE_PILL_H = 20;
const TREE_PILL_W = 118;
const TREE_TOP = 14;
const TREE_LEFT = 14;
function truncateLabel(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
export function JSONTreeCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("tree");
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set());
  const [hoverId, setHoverId] = useState<string | null>(null);
  const maxDepth = Math.max(1, maxDepthOf(SAMPLE_TREE));
  const s = useStepper(Math.min(3, maxDepth), { min: 1, max: maxDepth, step: 1 });
  const depth = s.value;

  const { nodes, width, height } = useMemo(() => layoutTree(SAMPLE_TREE, collapsed, depth, TREE_ROW_H, TREE_LEVEL_W), [collapsed, depth]);
  const byId = useMemo(() => new Map(nodes.map((n) => [n.node.id, n])), [nodes]);
  const counts = useMemo(() => {
    const c = { object: 0, array: 0, value: 0 };
    for (const n of nodes) {
      if (n.node.type === "object") c.object++;
      else if (n.node.type === "array") c.array++;
      else c.value++;
    }
    return c;
  }, [nodes]);

  function toggle(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const valueText = ltr(`depth ${depth} of ${maxDepth} — ${nodes.length} nodes shown`);
  const hovered = hoverId ? byId.get(hoverId)?.node : null;
  const W = Math.max(280, width + TREE_LEFT * 2);
  const H = Math.max(160, height + TREE_TOP * 2);
  const rows: KitRow[] = [
    { key: "depth", label: t("rowDepth"), value: `${depth} / ${maxDepth}`, isKey: true },
    { key: "nodes", label: t("rowNodes"), value: String(nodes.length) },
    { key: "objects", label: t("rowObjects"), value: String(counts.object) },
    { key: "arrays", label: t("rowArrays"), value: String(counts.array) },
    { key: "values", label: t("rowValues"), value: String(counts.value) },
  ];

  return (
    <IndicatorCard
      idPrefix="json"
      n={5}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { shown: ltr(String(nodes.length)), depth: ltr(String(depth)), max: ltr(String(maxDepth)) })}
      controls={
        <div className="flex flex-col gap-2">
          <KitTrack s={s} label={t("handle")} valueText={valueText} testId="json-c5" ticks={Array.from({ length: maxDepth }, (_, i) => ({ at: i + 1, text: String(i + 1) }))} />
          <KitControls s={s} valueText={String(depth)} testId="json-c5" />
        </div>
      }
      table={<KitTable rows={rows} flash={s.flash} activeKey={hoverId} onHover={setHoverId} caption={tc("worked")} />}
      visual={
        <div data-ph-scene-block className="flex flex-1 flex-col gap-2">
          <div
            dir="ltr"
            className="json-scroll relative w-full flex-1 overflow-auto rounded-xl"
            style={{ background: "var(--glass-track)", minHeight: 200, maxHeight: 280 }}
            data-testid="json-tree-card-drawing"
          >
            <svg viewBox={`0 0 ${W} ${H}`} width={W} height={H} role="img" aria-label={valueText} className="block">
              {nodes.map((entry) => {
                const n = entry.node;
                const parent = entry.parentId !== null ? byId.get(entry.parentId) : null;
                if (!parent) return null;
                const x0 = parent.x + TREE_LEFT + TREE_PILL_W;
                const y0 = parent.y + TREE_TOP;
                const x1 = entry.x + TREE_LEFT;
                const y1 = entry.y + TREE_TOP;
                const midX = (x0 + x1) / 2;
                return <path key={`edge-${n.id}`} d={`M ${x0} ${y0} C ${midX} ${y0}, ${midX} ${y1}, ${x1} ${y1}`} fill="none" stroke="var(--ph-line)" strokeWidth={1.3} />;
              })}
              {nodes.map((entry) => {
                const n = entry.node;
                const x = entry.x + TREE_LEFT;
                const y = entry.y + TREE_TOP;
                const label = n.depth === 0 ? "$" : n.key;
                const text = truncateLabel(`${label}: ${n.preview}`, 18);
                const on = hoverId === n.id;
                return (
                  <g
                    key={n.id}
                    onPointerEnter={() => setHoverId(n.id)}
                    onPointerLeave={() => setHoverId(null)}
                    onFocus={() => setHoverId(n.id)}
                    onBlur={() => setHoverId(null)}
                    onClick={() => entry.canExpand && toggle(n.id)}
                    tabIndex={0}
                    role="treeitem"
                    aria-expanded={entry.canExpand ? entry.expanded : undefined}
                    aria-label={n.dotPath}
                    style={{ cursor: entry.canExpand ? "pointer" : "default" }}
                  >
                    <title>{n.dotPath}</title>
                    <rect
                      x={x}
                      y={y - TREE_PILL_H / 2}
                      width={TREE_PILL_W}
                      height={TREE_PILL_H}
                      rx={TREE_PILL_H / 2}
                      fill={TYPE_TOKEN[n.type]}
                      opacity={on ? 1 : 0.88}
                      stroke={on ? "var(--ph-focus)" : "none"}
                      strokeWidth={on ? 2 : 0}
                    />
                    <text x={x + 9} y={y + 4} fontSize={10} fontWeight={600} fill="var(--ph-surface)" className="tabular-nums">
                      {text}
                    </text>
                    {entry.canExpand && (
                      <text x={x + TREE_PILL_W - 11} y={y + 4} fontSize={10.5} fontWeight={800} textAnchor="middle" fill="var(--ph-surface)">
                        {entry.expanded ? "−" : "+"}
                      </text>
                    )}
                    {!entry.expanded && entry.hidden > 0 && (
                      <text x={x + TREE_PILL_W + 8} y={y + 4} fontSize={10} fontWeight={700} fill="var(--ph-ink-muted)">
                        +{entry.hidden}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
          <p dir="auto" className="min-h-[1.1rem] truncate text-center text-xs font-semibold" style={{ color: "var(--ph-accent-strong)" }}>
            {hovered ? <span dir="ltr">{hovered.dotPath}</span> : t("hoverHint")}
          </p>
        </div>
      }
    />
  );
}

// ── 6. Format Comparison: the same records as JSON, minified, YAML, XML and CSV ──────────
const USERS_NODE = ALL_NODES.find((n) => n.id === "/data/users");
const USERS_SEED = (USERS_NODE?.raw as Record<string, unknown>[]) ?? [];
const FORMATS = [
  { key: "json", text: JSON.stringify(USERS_SEED, null, 2) },
  { key: "minified", text: JSON.stringify(USERS_SEED) },
  { key: "yaml", text: toYAML(USERS_SEED) },
  { key: "xml", text: toXML(USERS_SEED, "users") },
  { key: "csv", text: isFlatObjectArray(USERS_SEED) ? toCSV(USERS_SEED) : null },
] as const;
export function JSONFormatComparisonCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("formatComparison");
  const s = useStepper(0, { min: 0, max: FORMATS.length - 1, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const sizes = FORMATS.map((f) => (f.text === null ? 0 : bytes(f.text)));
  const maxS = Math.max(...sizes);
  const HMIN = 340;
  const X0 = 86;
  const EXCERPT_H = 92;
  const d = useDrawing(HMIN, s, (_x, y, _W, H) => Math.round((y / H) * (FORMATS.length - 1)));
  const { W, H } = d;
  const barW = W - 30 - X0;
  const barsTop = 26;
  const excerptY = H - EXCERPT_H - 8;
  const rowGap = (excerptY - 16 - barsTop) / FORMATS.length;
  const current = FORMATS[s.value];
  const excerpt = (current.text ?? t("notApplicable")).split("\n").slice(0, 4).join("\n");
  const valueText = `${t(`format.${current.key}`)} — ${current.text === null ? t("notApplicable") : `${sizes[s.value]} B`}`;
  const rows: KitRow[] = FORMATS.map((f, i) => ({
    key: f.key,
    label: t(`format.${f.key}`),
    value: f.text === null ? t("notApplicable") : `${sizes[i]} B`,
    isKey: f.key === current.key,
  }));
  return (
    <IndicatorCard
      idPrefix="json"
      n={6}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { format: t(`format.${current.key}`) })}
      controls={<KitControls s={s} valueText={t(`format.${current.key}`)} testId="json-c6" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover ?? current.key} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: W - 16, y: barsTop + s.value * rowGap, dir: "vertical" }} s={s} testId="json-c6">
          {FORMATS.map((f, i) => {
            const y = barsTop + i * rowGap;
            const w = maxS > 0 ? (sizes[i] / maxS) * barW : 0;
            const on = f.key === current.key || hover === f.key;
            return (
              <g key={f.key} onPointerEnter={() => setHover(f.key)} onPointerLeave={() => setHover(null)}>
                <text x={X0 - 8} y={y + 5} fontSize={10.5} textAnchor="end" style={on ? INK : MUTED}>
                  {t(`format.${f.key}`)}
                </text>
                <rect x={X0} y={y - 7} width={barW} height={14} rx={7} style={{ fill: "var(--glass-track)" }} />
                <rect x={X0} y={y - 7} width={Math.max(f.text === null ? 0 : 2, w)} height={14} rx={7} style={{ fill: CV[i], opacity: on ? 1 : 0.75 }} />
                <text x={X0 + w + 6} y={y + 5} fontSize={10} style={INK} className="tabular-nums">
                  {f.text === null ? t("notApplicable") : `${sizes[i]}B`}
                </text>
              </g>
            );
          })}
          <rect x={14} y={excerptY} width={W - 28} height={EXCERPT_H} rx={8} style={{ fill: "var(--glass-track)" }} />
          <foreignObject x={14} y={excerptY} width={W - 28} height={EXCERPT_H}>
            <pre
              dir="ltr"
              style={{ margin: 0, padding: "8px 10px", fontSize: "10.5px", lineHeight: 1.5, color: "var(--ph-ink)", fontFamily: "ui-monospace, monospace", whiteSpace: "pre-wrap", overflow: "hidden" }}
            >
              {excerpt}
            </pre>
          </foreignObject>
        </Drawing>
      }
    />
  );
}

// ── 7. JSON as Live State: a traffic light literally driven by a small editable JSON doc ──
const LIVE_STATE_ORDER = ["green", "yellow", "red"] as const;
type SignalState = (typeof LIVE_STATE_ORDER)[number];
const LIVE_STATE_SEED_DOC = { state: "green" as SignalState, timings: { green: 5, yellow: 2, red: 5 } };
const LIVE_STATE_SEED_TEXT = JSON.stringify(LIVE_STATE_SEED_DOC, null, 2);
const liveStateFormatter = new JSONFormatter();

function parseLiveState(text: string): { state: SignalState; timings: Record<SignalState, number> } | null {
  const result = liveStateFormatter.execute({ json: text, mode: "format", indent: 2, sortKeys: false }, { locale: "en-US" });
  if (!result.success) return null;
  try {
    const value = JSON.parse(text) as { state?: unknown; timings?: Record<string, unknown> };
    const state = LIVE_STATE_ORDER.includes(value.state as SignalState) ? (value.state as SignalState) : "green";
    const timings = LIVE_STATE_ORDER.reduce(
      (acc, k) => {
        const raw = value.timings?.[k];
        acc[k] = typeof raw === "number" && raw > 0 && Number.isFinite(raw) ? raw : 3;
        return acc;
      },
      {} as Record<SignalState, number>,
    );
    return { state, timings };
  } catch {
    return null;
  }
}

function withState(text: string, state: SignalState): string {
  try {
    const value = JSON.parse(text) as Record<string, unknown>;
    value.state = state;
    return JSON.stringify(value, null, 2);
  } catch {
    return text;
  }
}

function lineIndexOfKey(text: string, key: string): number {
  const idx = text.indexOf(`"${key}"`);
  if (idx < 0) return 0;
  return text.slice(0, idx).split("\n").length - 1;
}

export function JSONLiveStateCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("liveState");
  const s = useStepper(2, { min: 1, max: 6, step: 1 }); // index into SPEED_OPTIONS
  const SPEED_OPTIONS = [0.5, 1, 1.5, 2, 2.5, 3];
  const speed = SPEED_OPTIONS[s.value - 1];

  const [docText, setDocText] = useState(LIVE_STATE_SEED_TEXT);
  const [flashTick, setFlashTick] = useState(0);
  const [visible, setVisible] = useState(true);
  const [remaining, setRemaining] = useState(LIVE_STATE_SEED_DOC.timings.green);
  const reduced = usePrefersReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const stateStart = useRef(0);

  const parsed = useMemo(() => parseLiveState(docText), [docText]);
  const err = useMemo(() => {
    if (parsed) return null;
    const result = liveStateFormatter.execute({ json: docText, mode: "format", indent: 2, sortKeys: false }, { locale: "en-US" });
    return result.success === false ? result.data : null;
  }, [docText, parsed]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!parsed || !visible) return;
    stateStart.current = performance.now();
    const id = setInterval(() => {
      const elapsedSec = ((performance.now() - stateStart.current) / 1000) * speed;
      const total = parsed.timings[parsed.state];
      const left = Math.max(0, total - elapsedSec);
      setRemaining(left);
      if (left <= 0) {
        const nextIdx = (LIVE_STATE_ORDER.indexOf(parsed.state) + 1) % LIVE_STATE_ORDER.length;
        const next = LIVE_STATE_ORDER[nextIdx];
        setDocText((prev) => withState(prev, next));
        setFlashTick((f) => f + 1);
      }
    }, 200);
    return () => clearInterval(id);
  }, [parsed, visible, speed]);

  function handleReset() {
    setDocText(LIVE_STATE_SEED_TEXT);
    s.reset();
  }

  const cycleLength = parsed ? parsed.timings.green + parsed.timings.yellow + parsed.timings.red : 0;
  const lineH = 18;
  const padTop = 10;
  const stateLineIdx = lineIndexOfKey(docText, "state");

  const rows: KitRow[] = [
    { key: "state", label: t("rowState"), value: parsed ? t(`signal.${parsed.state}`) : t("rowInvalid"), isKey: true },
    { key: "remaining", label: t("rowTimeLeft"), value: parsed ? `${remaining.toFixed(1)} s` : "—" },
    { key: "cycle", label: t("rowCycleLength"), value: parsed ? `${cycleLength} s` : "—" },
  ];

  return (
    <IndicatorCard
      idPrefix="json"
      n={7}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={parsed ? t("caption", { state: t(`signal.${parsed.state}`), left: ltr(remaining.toFixed(1)) }) : t("captionInvalid")}
      controls={
        <div className="flex flex-col gap-2">
          <KitTrack
            s={{ ...s, reset: handleReset, isSeed: s.isSeed && docText === LIVE_STATE_SEED_TEXT }}
            label={t("handle")}
            valueText={`${speed}×`}
            testId="json-c7"
            ticks={SPEED_OPTIONS.map((v, i) => ({ at: i + 1, text: `${v}×` }))}
          />
          <KitControls s={{ ...s, reset: handleReset, isSeed: s.isSeed && docText === LIVE_STATE_SEED_TEXT }} valueText={`${speed}×`} testId="json-c7" />
        </div>
      }
      table={<KitTable rows={rows} flash={flashTick} activeKey={null} onHover={() => {}} caption={tc("worked")} />}
      visual={
        <div ref={rootRef} className="flex flex-1 flex-col items-center justify-center gap-4 sm:flex-row sm:items-stretch" data-testid="json-live-state">
          <div className="flex flex-col items-center justify-center gap-2 rounded-2xl p-3" style={{ background: "var(--json-signal-housing)" }}>
            {LIVE_STATE_ORDER.map((sig) => {
              const on = parsed?.state === sig;
              const color = on
                ? sig === "green"
                  ? "var(--json-signal-green-on)"
                  : sig === "yellow"
                    ? "var(--json-signal-yellow-on)"
                    : "var(--json-signal-red-on)"
                : sig === "green"
                  ? "var(--json-signal-green-off)"
                  : sig === "yellow"
                    ? "var(--json-signal-yellow-off)"
                    : "var(--json-signal-red-off)";
              return (
                <svg key={sig} width={44} height={44} viewBox="0 0 44 44" aria-hidden>
                  <circle cx={22} cy={22} r={16} fill={color} style={{ transition: reduced ? "none" : "fill 250ms ease", filter: on && !reduced ? `drop-shadow(0 0 8px ${color})` : "none" }} />
                </svg>
              );
            })}
          </div>
          <div className="relative min-w-0 flex-1">
            {!reduced && (
              <div
                key={flashTick}
                className="glass-value-flash pointer-events-none absolute inset-x-0 rounded"
                style={{ top: padTop + stateLineIdx * lineH, height: lineH }}
              />
            )}
            <label className="sr-only" htmlFor="json-live-state-doc">
              {t("editDocLabel")}
            </label>
            <textarea
              id="json-live-state-doc"
              value={docText}
              onChange={(e) => setDocText(e.target.value)}
              spellCheck={false}
              dir="ltr"
              rows={9}
              className="json-scroll relative w-full rounded-xl border px-3 py-2.5 font-mono text-[11.5px] leading-[18px]"
              style={{
                background: "var(--json-code-dark-bg)",
                color: "var(--json-code-dark-ink)",
                borderColor: "var(--json-code-dark-border)",
              }}
            />
            {err && (
              <p dir="auto" className="mt-1 text-xs font-semibold" style={{ color: "var(--json-bulb-error)" }}>
                {t("errorAt", { line: ltr(String(err.errorLine)), column: ltr(String(err.errorColumn)) })}
              </p>
            )}
          </div>
        </div>
      }
    />
  );
}

// ── 8. Heaviest Keys and Values: ranked by real byte share of the whole document ─────────
export function JSONHeaviestKeysCard({ side }: { side: Side }) {
  const { t, tc } = useCardText("heaviestKeys");
  const s = useStepper(6, { min: 3, max: 10, step: 1 });
  const [hover, setHover] = useState<string | null>(null);
  const nodes = useMemo(() => heaviestNodes(SAMPLE_TREE, s.value), [s.value]);
  const total = SAMPLE_TREE.bytes || 1;
  const maxB = nodes[0]?.bytes ?? 1;
  const HMIN = 230;
  const X0 = 100;
  const d = useDrawing(HMIN, s, (_x, y, _W, H) => Math.max(3, Math.min(10, Math.round((y / H) * 10))));
  const { W, H } = d;
  const barW = W - 14 - X0;
  const rowGap = (H - 20) / s.value;
  const valueText = `top ${s.value} — heaviest ${nodes[0]?.key ?? ""}`;
  const rows: KitRow[] = nodes.map((n, i) => ({
    key: n.id,
    label: `#${i + 1} ${n.key}`,
    value: `${g(n.bytes, 4)} B · ${((n.bytes / total) * 100).toFixed(1)}%`,
    isKey: i === 0,
  }));
  return (
    <IndicatorCard
      idPrefix="json"
      n={8}
      side={side}
      kind="2d"
      title={t("title")}
      subtitle={t("subtitle")}
      caption={t("caption", { n: ltr(String(s.value)), key: nodes[0]?.key ?? "" })}
      controls={<KitControls s={s} valueText={String(s.value)} testId="json-c8" />}
      table={<KitTable rows={rows} flash={s.flash} activeKey={hover} onHover={setHover} caption={tc("worked")} />}
      visual={
        <Drawing {...d} hMin={HMIN} label={t("handle")} valueText={valueText} handle={{ x: W - 16, y: 10 + (s.value - 3) * ((H - 20) / 7), dir: "vertical" }} s={s} testId="json-c8">
          {nodes.map((n, i) => {
            const y = 14 + i * rowGap;
            const w = (n.bytes / maxB) * barW;
            const on = hover === n.id;
            return (
              <g key={n.id} onPointerEnter={() => setHover(n.id)} onPointerLeave={() => setHover(null)}>
                <text x={X0 - 8} y={y + 5} fontSize={10} textAnchor="end" style={on ? INK : MUTED}>
                  {n.key.length > 12 ? `${n.key.slice(0, 11)}…` : n.key}
                </text>
                <rect x={X0} y={y - 6} width={barW} height={12} rx={6} style={{ fill: "var(--glass-track)" }} />
                <rect x={X0} y={y - 6} width={Math.max(2, w)} height={12} rx={6} style={{ fill: TYPE_TOKEN[n.type], opacity: on || i === 0 ? 1 : 0.75 }} />
                <text x={X0 + w + 6} y={y + 4} fontSize={9.5} style={INK} className="tabular-nums">
                  {g(n.bytes, 3)}B
                </text>
              </g>
            );
          })}
        </Drawing>
      }
    />
  );
}
