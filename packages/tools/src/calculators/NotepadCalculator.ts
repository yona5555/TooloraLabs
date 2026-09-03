import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";
import { parseExpression, evaluateExpression } from "./GraphingCalculator";

export type NotepadCalculatorInput = {
  text: string;
};

export type NotepadLineResult = {
  text: string;
  result: string | null;
};

export type NotepadCalculatorOutput = {
  lines: NotepadLineResult[];
};

const ASSIGNMENT_PATTERN = /^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/;
const RESERVED_NAMES = new Set(["pi", "e"]);

function fmt(n: number): string {
  const rounded = Math.round(n * 1e8) / 1e8;
  return Object.is(rounded, -0) ? "0" : String(rounded);
}

/**
 * Evaluates a multi-line free-text notepad line by line, Soulver-style:
 * a line matching "name = expression" defines a variable that later lines
 * can reference by name, and any other line is evaluated as a standalone
 * expression using every variable defined so far. Lines that don't parse
 * as either (plain prose, headings, blank lines) simply show no result —
 * that's expected, not an error, since the whole point is mixing notes and
 * calculations freely in the same document.
 */
export class NotepadCalculator extends BaseCalculator<NotepadCalculatorInput, NotepadCalculatorOutput> {
  metadata = {
    id: "notepad-calculator",
    slug: "notepad-calculator",
    name: "Notepad Calculator",
    category: "calculators",
    description: "Type free-form notes mixed with math — every line that contains a calculation is evaluated live, with variables carried from line to line.",
    version: "1.0.0",
  };

  execute(input: NotepadCalculatorInput, _context: ToolContext): ToolResult<NotepadCalculatorOutput> {
    const scope: Record<string, number> = {};
    const rawLines = input.text.split("\n");
    const lines: NotepadLineResult[] = [];

    for (const rawLine of rawLines) {
      const line = rawLine.trim();
      if (!line) {
        lines.push({ text: rawLine, result: null });
        continue;
      }

      const assignment = line.match(ASSIGNMENT_PATTERN);
      if (assignment && !RESERVED_NAMES.has(assignment[1].toLowerCase())) {
        const [, name, expr] = assignment;
        const value = this.tryEvaluate(expr, scope);
        if (value !== null) {
          scope[name.toLowerCase()] = value;
          lines.push({ text: rawLine, result: fmt(value) });
          continue;
        }
      }

      const value = this.tryEvaluate(line, scope);
      lines.push({ text: rawLine, result: value !== null ? fmt(value) : null });
    }

    return { success: true, data: { lines }, metadata: {} };
  }

  private tryEvaluate(expr: string, scope: Record<string, number>): number | null {
    try {
      const ast = parseExpression(expr);
      const value = evaluateExpression(ast, scope);
      return Number.isFinite(value) ? value : null;
    } catch {
      return null;
    }
  }
}
