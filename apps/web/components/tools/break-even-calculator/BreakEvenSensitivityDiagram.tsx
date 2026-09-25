import BreakEvenWorkedExampleTable from "./BreakEvenWorkedExampleTable";

type Point = { price: number; units: number };

type BreakEvenSensitivityDiagramProps = {
  points: Point[];
  currentPrice: number;
  columnPrice: string;
  columnUnits: string;
  currentPriceLabel: string;
  caption: string;
};

/**
 * Was a purple line-and-dot chart (a path through 6 price/units points, one
 * highlighted with a circle at the user's current price) — the banned
 * pattern, sitting in the tool page's own secondary column right above the
 * long-form content, which is exactly the spot flagged as a partially
 * visible line-chart fragment during a full top-to-bottom page sweep. A
 * table of the same real, live-computed price/units pairs (still computed
 * from the user's own typed inputs by the parent) makes the same
 * sensitivity point without a plotted line, and highlights the row
 * matching the user's current price instead of a dot on a curve.
 */
export default function BreakEvenSensitivityDiagram({ points, currentPrice, columnPrice, columnUnits, currentPriceLabel, caption }: BreakEvenSensitivityDiagramProps) {
  const rows = points.map((p) => {
    const isCurrent = Math.abs(p.price - currentPrice) < 0.01;
    const priceText = Math.round(p.price).toLocaleString("en-US");
    const unitsText = Math.round(p.units).toLocaleString("en-US");
    return [priceText, isCurrent ? { text: `${unitsText} (${currentPriceLabel})`, kind: "highlight" as const } : unitsText];
  });

  return <BreakEvenWorkedExampleTable columns={[columnPrice, columnUnits]} rows={rows} caption={caption} />;
}
