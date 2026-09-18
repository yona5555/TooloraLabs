type BreakEvenContributionMarginBarProps = {
  priceLabel: string;
  variableCostLabel: string;
  marginLabel: string;
  caption: string;
  title: string;
};

const WIDTH = 260;
const BAR_H = 34;
const PRICE = 50;
const VARIABLE_COST = 20;
const MARGIN = PRICE - VARIABLE_COST;

export default function BreakEvenContributionMarginBar({ priceLabel, variableCostLabel, marginLabel, caption, title }: BreakEvenContributionMarginBarProps) {
  const variableW = (VARIABLE_COST / PRICE) * WIDTH;
  const marginW = WIDTH - variableW;

  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${BAR_H + 46}`} role="img" aria-label={title} className="h-auto w-full" style={{ minWidth: 240 }}>
          <text x={0} y={12} fontSize={9} fontWeight={700} className="fill-teal-700 dark:fill-teal-300">
            {priceLabel}: ${PRICE}
          </text>
          <rect x={0} y={18} width={variableW} height={BAR_H} className="fill-teal-200 dark:fill-teal-700" />
          <rect x={variableW} y={18} width={marginW} height={BAR_H} className="fill-teal-500 dark:fill-teal-400" />
          <text x={variableW / 2} y={18 + BAR_H / 2 + 4} textAnchor="middle" fontSize={9} fontWeight={700} className="fill-teal-800 dark:fill-teal-100">
            ${VARIABLE_COST}
          </text>
          <text x={variableW + marginW / 2} y={18 + BAR_H / 2 + 4} textAnchor="middle" fontSize={9} fontWeight={700} fill="white">
            ${MARGIN}
          </text>
          <text x={variableW / 2} y={18 + BAR_H + 14} textAnchor="middle" fontSize={8} className="fill-zinc-500 dark:fill-zinc-400">
            {variableCostLabel}
          </text>
          <text x={variableW + marginW / 2} y={18 + BAR_H + 14} textAnchor="middle" fontSize={8} fontWeight={700} className="fill-teal-700 dark:fill-teal-300">
            {marginLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
