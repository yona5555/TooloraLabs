import type { ToolContext, ToolResult } from "@tooloralabs/core";
import { BaseCalculator } from "./BaseCalculator";

export type MultiplicationTableMode = "single" | "range";

export type MultiplicationTableInput = {
  mode: MultiplicationTableMode;
  /** Required for "single" mode. */
  number?: number;
  /** Optional for "single" mode; defaults to 12. */
  maxMultiplier?: number;
  /** Required for "range" mode. */
  rangeStart?: number;
  /** Required for "range" mode. */
  rangeEnd?: number;
};

export type MultiplicationTableError = "invalid-number" | "invalid-multiplier" | "invalid-range" | "range-too-large";

export type SingleTableRow = { multiplier: number; result: number };
export type GridRow = { rowNumber: number; cells: number[] };
export type MultiplicationGrid = { headers: number[]; rows: GridRow[] };

export type MultiplicationTableOutput = {
  error: MultiplicationTableError | null;
  singleRows: SingleTableRow[] | null;
  grid: MultiplicationGrid | null;
};

const MIN_NUMBER = 1;
const MAX_NUMBER = 1000;
const MIN_MULTIPLIER = 1;
const MAX_MULTIPLIER = 100;
const MAX_RANGE_SPAN = 30;

export class MultiplicationTableCalculator extends BaseCalculator<MultiplicationTableInput, MultiplicationTableOutput> {
  metadata = {
    id: "multiplication-table-generator",
    slug: "multiplication-table-generator",
    name: "Multiplication Table Generator",
    category: "math",
    description: "Generate a multiplication table for a single number or a printable grid for a range of numbers.",
    version: "1.0.0",
  };

  execute(input: MultiplicationTableInput, _context: ToolContext): ToolResult<MultiplicationTableOutput> {
    if (input.mode === "single") {
      return this.executeSingle(input);
    }
    return this.executeRange(input);
  }

  private executeSingle(input: MultiplicationTableInput): ToolResult<MultiplicationTableOutput> {
    const { number, maxMultiplier = 12 } = input;

    if (number === undefined || !Number.isInteger(number) || number < MIN_NUMBER || number > MAX_NUMBER) {
      return this.error("invalid-number");
    }
    if (!Number.isInteger(maxMultiplier) || maxMultiplier < MIN_MULTIPLIER || maxMultiplier > MAX_MULTIPLIER) {
      return this.error("invalid-multiplier");
    }

    const singleRows: SingleTableRow[] = [];
    for (let m = 1; m <= maxMultiplier; m++) {
      singleRows.push({ multiplier: m, result: number * m });
    }

    return {
      success: true,
      data: { error: null, singleRows, grid: null },
      metadata: {},
    };
  }

  private executeRange(input: MultiplicationTableInput): ToolResult<MultiplicationTableOutput> {
    const { rangeStart, rangeEnd } = input;

    if (
      rangeStart === undefined ||
      rangeEnd === undefined ||
      !Number.isInteger(rangeStart) ||
      !Number.isInteger(rangeEnd) ||
      rangeStart < MIN_NUMBER ||
      rangeEnd > MAX_NUMBER ||
      rangeStart > rangeEnd
    ) {
      return this.error("invalid-range");
    }

    if (rangeEnd - rangeStart + 1 > MAX_RANGE_SPAN) {
      return this.error("range-too-large");
    }

    const headers: number[] = [];
    for (let n = rangeStart; n <= rangeEnd; n++) headers.push(n);

    const rows: GridRow[] = headers.map((rowNumber) => ({
      rowNumber,
      cells: headers.map((colNumber) => rowNumber * colNumber),
    }));

    return {
      success: true,
      data: { error: null, singleRows: null, grid: { headers, rows } },
      metadata: {},
    };
  }

  private error(error: MultiplicationTableError): ToolResult<MultiplicationTableOutput> {
    return { success: true, data: { error, singleRows: null, grid: null }, metadata: {} };
  }
}
