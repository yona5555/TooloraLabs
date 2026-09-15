"use client";
import { useTranslations } from "next-intl";
import SectionCard from "@/components/tool-ui/SectionCard";

/**
 * Same fixed example (12, 18) as the other GCF/LCM diagrams, but this one
 * shows the step BEFORE the Venn diagram and ladder method can even be
 * drawn: breaking each number down into its prime factors via a factor
 * tree (12 → 2×6 → 2×2×3; 18 → 2×9 → 2×3×3). GcfLcmConceptDiagram assumes
 * the reader already has "12 = 2²×3, 18 = 2×3²" — this diagram shows where
 * those factorizations actually come from.
 */
type TreeNode = { value: number; children?: [TreeNode, TreeNode] };

const TREE_A: TreeNode = {
  value: 12,
  children: [{ value: 2 }, { value: 6, children: [{ value: 2 }, { value: 3 }] }],
};
const TREE_B: TreeNode = {
  value: 18,
  children: [{ value: 2 }, { value: 9, children: [{ value: 3 }, { value: 3 }] }],
};

const NODE_R = 15;

function TreeSvg({ root, width }: { root: TreeNode; width: number }) {
  const rowGap = 42;

  type Positioned = { value: number; x: number; y: number; isPrime: boolean; children?: Positioned[] };

  function layout(node: TreeNode, depth: number, xStart: number, xEnd: number): Positioned {
    const x = (xStart + xEnd) / 2;
    const y = 20 + depth * rowGap;
    const isPrime = !node.children;
    if (!node.children) return { value: node.value, x, y, isPrime };
    const mid = (xStart + xEnd) / 2;
    return {
      value: node.value,
      x,
      y,
      isPrime,
      children: [layout(node.children[0], depth + 1, xStart, mid), layout(node.children[1], depth + 1, mid, xEnd)],
    };
  }

  const positioned = layout(root, 0, 10, width - 10);

  const nodes: Positioned[] = [];
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  function collect(n: Positioned) {
    nodes.push(n);
    if (n.children) {
      for (const c of n.children) {
        edges.push({ x1: n.x, y1: n.y, x2: c.x, y2: c.y });
        collect(c);
      }
    }
  }
  collect(positioned);

  const height = 20 + 2 * rowGap + NODE_R + 4;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" className="mx-auto block w-full max-w-[220px] text-current">
      {edges.map((e, i) => (
        <line key={i} x1={e.x1} y1={e.y1 + NODE_R} x2={e.x2} y2={e.y2 - NODE_R} stroke="currentColor" strokeWidth={1.5} opacity={0.35} />
      ))}
      {nodes.map((n, i) => (
        <g key={i}>
          <circle
            cx={n.x}
            cy={n.y}
            r={NODE_R}
            className={n.isPrime ? "fill-emerald-500/20 stroke-emerald-600 dark:fill-emerald-400/20 dark:stroke-emerald-300" : "fill-blue-500/15 stroke-blue-600 dark:fill-blue-400/15 dark:stroke-blue-300"}
            strokeWidth={1.5}
          />
          <text x={n.x} y={n.y + 4} textAnchor="middle" fontSize={12} fontWeight={600} fill="currentColor">
            {n.value}
          </text>
        </g>
      ))}
    </svg>
  );
}

export default function GcfLcmFactorTreeDiagram() {
  const d = useTranslations("tools.gcf-lcm-calculator.factorTreeDiagram");

  return (
    <SectionCard title={d("title")}>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{d("intro")}</p>
      <div dir="ltr" className="mt-4 flex flex-wrap items-start justify-center gap-8 overflow-x-auto">
        <div className="flex flex-col items-center gap-1">
          <TreeSvg root={TREE_A} width={140} />
          <span className="text-xs opacity-70">{d("labelA", { a: 12 })}</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <TreeSvg root={TREE_B} width={140} />
          <span className="text-xs opacity-70">{d("labelB", { b: 18 })}</span>
        </div>
      </div>
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {d("legendPrime")}
        </span>
      </div>
      <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{d("caption")}</p>
    </SectionCard>
  );
}
