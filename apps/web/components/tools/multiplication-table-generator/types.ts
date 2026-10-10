export type { MultiplicationTableMode, MultiplicationTableOutput } from "@tooloralabs/tools";
import type { MultiplicationTableMode } from "@tooloralabs/tools";

/**
 * The live "selected fact" every indicator follows: a × b with a the table's number (or the grid's
 * selected row) and b the selected multiplier (or column), plus the multipliers on show and the
 * square grid lo…hi the grid-wide indicators study.
 */
export type MtView = {
  mode: MultiplicationTableMode;
  a: number;
  b: number;
  product: number;
  multipliers: number[];
  lo: number;
  hi: number;
  fmt: (n: number) => string;
};

/** Picks a fact from any indicator; the page decides how that maps onto its inputs. */
export type PickFact = (a: number, b: number) => void;
