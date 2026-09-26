type SalesTaxBreakdownBarProps = {
  price: number;
  taxAmount: number;
  priceLabel: string;
  taxLabel: string;
  priceFormatted: string;
  taxFormatted: string;
};

/**
 * Single stacked SVG bar — one continuous shape, not multiple bordered boxes,
 * so it stays outside the banned "boxes connected by arrows" pattern. Rebuilt
 * fresh (not just left alone) per the rm-all-indicators pass, following
 * EduBarChart's habit of never placing a label inside a segment that might
 * be too narrow for it: both value labels render below the bar, at a fixed
 * width, instead of inside the colored fill.
 */
export default function SalesTaxBreakdownBar({ price, taxAmount, priceLabel, taxLabel, priceFormatted, taxFormatted }: SalesTaxBreakdownBarProps) {
  const total = Math.max(price + taxAmount, 0.01);
  const pricePct = Math.min(Math.max((price / total) * 100, 0), 100);
  const taxPct = 100 - pricePct;

  return (
    <div dir="ltr">
      <div className="flex h-8 w-full overflow-hidden rounded-lg" role="img" aria-label={`${priceLabel}: ${priceFormatted}, ${taxLabel}: +${taxFormatted}`}>
        <div className="bg-blue-600 dark:bg-blue-400" style={{ width: `${pricePct}%` }} />
        <div className="bg-amber-500 dark:bg-amber-400" style={{ width: `${taxPct}%` }} />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-blue-600 dark:bg-blue-400" />
          <span className="text-zinc-600 dark:text-zinc-300">{priceLabel}</span>
          <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">{priceFormatted}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 shrink-0 rounded-sm bg-amber-500 dark:bg-amber-400" />
          <span className="text-zinc-600 dark:text-zinc-300">{taxLabel}</span>
          <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">+{taxFormatted}</span>
        </span>
      </div>
    </div>
  );
}
