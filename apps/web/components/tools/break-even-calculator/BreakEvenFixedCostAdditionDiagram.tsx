import BreakEvenWorkedExampleTable from "./BreakEvenWorkedExampleTable";

type BreakEvenFixedCostAdditionDiagramProps = {
  beforeLabel: string;
  afterLabel: string;
  columnFixedCosts: string;
  columnBreakEvenUnits: string;
  caption: string;
};

/**
 * Was a two-box-plus-arrow diagram (before box -> "+$2,000" -> after box) —
 * a disguised version of the same banned pattern as the boxed-math-symbol
 * rule, just with a currency delta instead of an operator. A worked-example
 * table showing the same $10,000 -> $12,000 fixed-cost scenario (still the
 * file's shared $20 variable / $50 price reference, so 334 -> 400 units is
 * real arithmetic: ($10,000 + $2,000) / $30 margin per unit = 400) makes the
 * same point without a box or an arrow.
 */
export default function BreakEvenFixedCostAdditionDiagram({ beforeLabel, afterLabel, columnFixedCosts, columnBreakEvenUnits, caption }: BreakEvenFixedCostAdditionDiagramProps) {
  return (
    <BreakEvenWorkedExampleTable
      columns={[" ", columnFixedCosts, columnBreakEvenUnits]}
      rows={[
        [beforeLabel, "$10,000", "334"],
        [afterLabel, "$12,000", "400"],
      ]}
      caption={caption}
    />
  );
}
