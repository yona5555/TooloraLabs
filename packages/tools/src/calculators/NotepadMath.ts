import { evaluateExpression, parseExpression, type ExprNode } from "./GraphingCalculator";
import { formatNotepadNumber } from "./NotepadCalculator";

/**
 * Line-by-line analysis of a notepad, built on the same parser/evaluator as NotepadCalculator,
 * so every indicator on the page reads the exact numbers the answer column shows.
 */

export type NotepadLineKind = "blank" | "note" | "assign" | "expr";
export type NotepadOpFamily = "add" | "mul" | "pow" | "fn" | "neg";

export type NotepadLine = {
  index: number;
  text: string;
  kind: NotepadLineKind;
  /** Variable name for an assignment line (lower-cased, as the evaluator stores it). */
  name: string | null;
  /** The expression that was evaluated (right-hand side for an assignment). */
  expr: string | null;
  value: number | null;
  /** Variables read by this line, each resolved to the line that last defined it. */
  deps: { name: string; line: number }[];
  ops: Record<NotepadOpFamily, number>;
  depth: number;
  /** True when this assignment overwrites a name defined on an earlier line. */
  reassign: boolean;
};

export type NotepadVariable = {
  name: string;
  value: number;
  /** Line of the last definition (the value later lines see). */
  line: number;
  assignments: number;
  /** Defined from numbers only (no other variables) and assigned once: a what-if input. */
  isInput: boolean;
  usedBy: number;
};

export type NotepadAnalysis = {
  lines: NotepadLine[];
  variables: NotepadVariable[];
  /** Last line with a result: the note's bottom line. */
  finalIndex: number;
  finalValue: number | null;
  counts: Record<NotepadLineKind, number> & { calculated: number; nonBlank: number };
  opTotals: Record<NotepadOpFamily, number>;
  /** Calculated lines as a share of non-blank lines, 0–100. */
  coverage: number;
};

const ASSIGNMENT = /^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/;
const RESERVED = new Set(["pi", "e"]);
const emptyOps = (): Record<NotepadOpFamily, number> => ({ add: 0, mul: 0, pow: 0, fn: 0, neg: 0 });

function tryParse(expr: string, scope: Record<string, number>): { node: ExprNode; value: number } | null {
  try {
    const node = parseExpression(expr);
    const value = evaluateExpression(node, scope);
    return Number.isFinite(value) ? { node, value } : null;
  } catch {
    return null;
  }
}

function walk(node: ExprNode, visit: (n: ExprNode) => void) {
  visit(node);
  if (node.type === "binary") {
    walk(node.left, visit);
    walk(node.right, visit);
  } else if (node.type === "unary") walk(node.arg, visit);
  else if (node.type === "call") node.args.forEach((a) => walk(a, visit));
}

export function exprDepth(node: ExprNode): number {
  if (node.type === "binary") return 1 + Math.max(exprDepth(node.left), exprDepth(node.right));
  if (node.type === "unary") return 1 + exprDepth(node.arg);
  if (node.type === "call") return 1 + Math.max(0, ...node.args.map(exprDepth));
  return 0;
}

/** Analyse a notepad top to bottom. `overrides` replaces the value of an assigned name (what-if). */
export function analyzeNotepad(text: string, overrides: Record<string, number> = {}): NotepadAnalysis {
  const scope: Record<string, number> = {};
  const definedAt: Record<string, number> = {};
  const lines: NotepadLine[] = [];

  text.split("\n").forEach((raw, index) => {
    const trimmed = raw.trim();
    const base = { index, text: raw, name: null, expr: null, value: null, deps: [], ops: emptyOps(), depth: 0, reassign: false };
    if (!trimmed) return void lines.push({ ...base, kind: "blank" });

    const finish = (kind: "assign" | "expr", name: string | null, expr: string, node: ExprNode, value: number): NotepadLine => {
      const ops = emptyOps();
      const seen = new Set<string>();
      const deps: { name: string; line: number }[] = [];
      walk(node, (n) => {
        if (n.type === "binary") ops[n.op === "+" || n.op === "-" ? "add" : n.op === "^" ? "pow" : "mul"]++;
        else if (n.type === "unary") ops.neg++;
        else if (n.type === "call") ops.fn++;
        else if (n.type === "var" && n.name in definedAt && !seen.has(n.name)) {
          seen.add(n.name);
          deps.push({ name: n.name, line: definedAt[n.name] });
        }
      });
      return { ...base, kind, name, expr, value, deps, ops, depth: exprDepth(node), reassign: name !== null && name in definedAt };
    };

    const m = trimmed.match(ASSIGNMENT);
    if (m && !RESERVED.has(m[1].toLowerCase())) {
      const name = m[1].toLowerCase();
      const parsed = tryParse(m[2], scope);
      if (parsed) {
        const value = name in overrides ? overrides[name] : parsed.value;
        const line = finish("assign", name, m[2].trim(), parsed.node, value);
        scope[name] = value;
        definedAt[name] = index;
        return void lines.push(line);
      }
    }
    const parsed = tryParse(trimmed, scope);
    lines.push(parsed ? finish("expr", null, trimmed, parsed.node, parsed.value) : { ...base, kind: "note" });
  });

  const counts = { blank: 0, note: 0, assign: 0, expr: 0, calculated: 0, nonBlank: 0 };
  const opTotals = emptyOps();
  for (const l of lines) {
    counts[l.kind]++;
    if (l.value !== null) counts.calculated++;
    if (l.kind !== "blank") counts.nonBlank++;
    for (const k of Object.keys(opTotals) as NotepadOpFamily[]) opTotals[k] += l.ops[k];
  }

  const byName = new Map<string, NotepadVariable>();
  for (const l of lines) {
    if (l.kind !== "assign" || !l.name) continue;
    const prev = byName.get(l.name);
    byName.set(l.name, {
      name: l.name,
      value: l.value as number,
      line: l.index,
      assignments: (prev?.assignments ?? 0) + 1,
      isInput: !prev && l.deps.length === 0,
      usedBy: 0,
    });
  }
  for (const l of lines) for (const d of l.deps) {
    const v = byName.get(d.name);
    if (v) v.usedBy++;
  }
  const variables = [...byName.values()].map((v) => (v.assignments > 1 ? { ...v, isInput: false } : v));

  let finalIndex = -1;
  for (const l of lines) if (l.value !== null) finalIndex = l.index;

  return {
    lines,
    variables,
    finalIndex,
    finalValue: finalIndex >= 0 ? lines[finalIndex].value : null,
    counts,
    opTotals,
    coverage: counts.nonBlank ? (counts.calculated / counts.nonBlank) * 100 : 0,
  };
}

/** Value of one line after overriding a variable — the line index is fixed so the same bottom line is compared. */
export function valueWithOverride(text: string, lineIndex: number, name: string, value: number): number | null {
  return analyzeNotepad(text, { [name]: value }).lines[lineIndex]?.value ?? null;
}

/** Bottom-line value at several values of one input (the what-if curve). */
export function sweepVariable(text: string, lineIndex: number, name: string, values: number[]): { x: number; y: number | null }[] {
  return values.map((x) => ({ x, y: valueWithOverride(text, lineIndex, name, x) }));
}

export type InputImpact = { name: string; base: number; low: number | null; high: number | null; delta: number; elasticity: number };

/** Change in the bottom line when each input moves by ±pct %, largest effect first. */
export function inputImpacts(a: NotepadAnalysis, text: string, pct = 10): InputImpact[] {
  if (a.finalIndex < 0 || a.finalValue === null) return [];
  const f0 = a.finalValue;
  return a.variables
    .filter((v) => v.isInput && v.line < a.finalIndex)
    .map((v) => {
      const low = valueWithOverride(text, a.finalIndex, v.name, v.value * (1 - pct / 100));
      const high = valueWithOverride(text, a.finalIndex, v.name, v.value * (1 + pct / 100));
      const delta = high === null ? 0 : high - f0;
      return { name: v.name, base: v.value, low, high, delta, elasticity: f0 !== 0 ? delta / f0 / (pct / 100) : 0 };
    })
    .sort((x, y) => Math.abs(y.delta) - Math.abs(x.delta));
}

export type DependencyNode = { name: string | null; line: number; value: number; children: DependencyNode[] };

/** The tree of definitions feeding a line (indices strictly decrease, so it is always finite). */
export function dependencyTree(a: NotepadAnalysis, lineIndex: number, maxDepth = 6): DependencyNode | null {
  const l = a.lines[lineIndex];
  if (!l || l.value === null) return null;
  const build = (line: NotepadLine, depth: number): DependencyNode => ({
    name: line.name,
    line: line.index,
    value: line.value as number,
    children: depth >= maxDepth ? [] : line.deps.map((d) => build(a.lines[d.line], depth + 1)),
  });
  return build(l, 0);
}

export type EvalStep = { kind: "var" | "op" | "fn" | "neg"; text: string; value: number };

/** Post-order evaluation steps: substitutions first, then each operation in the order it runs. */
export function evaluationSteps(expr: string, scope: Record<string, number>): EvalStep[] {
  const node = parseExpression(expr);
  const steps: EvalStep[] = [];
  const f = formatNotepadNumber;
  const run = (n: ExprNode): number => {
    switch (n.type) {
      case "num":
        return n.value;
      case "var": {
        const v = evaluateExpression(n, scope);
        steps.push({ kind: "var", text: `${n.name} → ${f(v)}`, value: v });
        return v;
      }
      case "unary": {
        const v = -run(n.arg);
        steps.push({ kind: "neg", text: `−(${f(-v)}) = ${f(v)}`, value: v });
        return v;
      }
      case "call": {
        const args = n.args.map(run);
        const v = evaluateExpression({ type: "call", name: n.name, args: args.map((x) => ({ type: "num", value: x })) }, scope);
        steps.push({ kind: "fn", text: `${n.name}(${args.map(f).join(", ")}) = ${f(v)}`, value: v });
        return v;
      }
      case "binary": {
        const l = run(n.left);
        const r = run(n.right);
        const v = evaluateExpression({ type: "binary", op: n.op, left: { type: "num", value: l }, right: { type: "num", value: r } }, scope);
        const sym = { "+": "+", "-": "−", "*": "×", "/": "÷", "^": "^" }[n.op];
        steps.push({ kind: "op", text: `${f(l)} ${sym} ${f(r)} = ${f(v)}`, value: v });
        return v;
      }
    }
  };
  run(node);
  return steps;
}

/** Scope (variable → value) as seen just before a given line. */
export function scopeBefore(a: NotepadAnalysis, lineIndex: number): Record<string, number> {
  const scope: Record<string, number> = {};
  for (const l of a.lines) {
    if (l.index >= lineIndex) break;
    if (l.kind === "assign" && l.name) scope[l.name] = l.value as number;
  }
  return scope;
}

/** The expression with every variable replaced by the value it had on that line. */
export function substituteExpression(expr: string, scope: Record<string, number>): string {
  return expr.replace(/[a-zA-Z_][a-zA-Z0-9_]*/g, (id) => {
    const k = id.toLowerCase();
    return k in scope ? formatNotepadNumber(scope[k]) : id;
  });
}

export type RoundingViews = { raw: string; shown: string; twoDp: string; scientific: string; hiddenError: number };

/** How one result looks at full float precision, as the notepad shows it (8 dp), at 2 dp and in scientific form. */
export function roundingViews(v: number): RoundingViews {
  const shown = formatNotepadNumber(v);
  return {
    raw: String(v),
    shown,
    twoDp: (Math.round(v * 100) / 100).toFixed(2),
    scientific: v.toExponential(4),
    hiddenError: Math.abs(v - Number(shown)),
  };
}

/** Order of magnitude (floor log10 |v|) of a result; zero sits at 0. */
export function magnitude(v: number): number {
  return v === 0 ? 0 : Math.floor(Math.log10(Math.abs(v)));
}

/** Replace the right-hand side of the assignment on `lineIndex` with a number (keeps indentation). */
export function rewriteAssignment(text: string, lineIndex: number, value: number): string {
  const rows = text.split("\n");
  const row = rows[lineIndex];
  if (row === undefined) return text;
  const m = row.match(/^(\s*[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*)/);
  if (!m) return text;
  rows[lineIndex] = m[1] + formatNotepadNumber(value);
  return rows.join("\n");
}
