type Props = {
  labelPrincipal: string;
  labelContributions: string;
  labelInterest: string;
  labelTotal: string;
  caption: string;
};

const WIDTH = 480;
const HEIGHT = 140;
const BAR_HEIGHT = 56;
const BAR_TOP = 30;

// A representative example ($10,000 starting + $100/mo for 10 years at 7%,
// annually compounded), broken into its three components — not tied to a
// visitor's actual inputs, since this diagram documents the *shape* of a
// result, not one specific calculation.
const PRINCIPAL = 10000;
const CONTRIBUTIONS = 12000;
const INTEREST = 8100;
const TOTAL = PRINCIPAL + CONTRIBUTIONS + INTEREST;

export default function ResultAnatomyDiagram({ labelPrincipal, labelContributions, labelInterest, labelTotal, caption }: Props) {
  const principalWidth = (PRINCIPAL / TOTAL) * WIDTH;
  const contributionsWidth = (CONTRIBUTIONS / TOTAL) * WIDTH;
  const interestWidth = (INTEREST / TOTAL) * WIDTH;

  const segments = [
    { width: principalWidth, x: 0, label: labelPrincipal, className: "fill-blue-600 dark:fill-blue-400" },
    { width: contributionsWidth, x: principalWidth, label: labelContributions, className: "fill-orange-400 dark:fill-orange-500" },
    { width: interestWidth, x: principalWidth + contributionsWidth, label: labelInterest, className: "fill-emerald-500 dark:fill-emerald-400" },
  ];

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={caption} className="h-auto w-full max-w-lg">
          {segments.map((seg) => (
            <rect key={seg.label} x={seg.x} y={BAR_TOP} width={seg.width} height={BAR_HEIGHT} className={seg.className} />
          ))}
          <rect x={0} y={BAR_TOP} width={WIDTH} height={BAR_HEIGHT} rx={8} fill="none" stroke="currentColor" strokeWidth={1} className="text-zinc-300 dark:text-zinc-700" />

          {segments.map((seg) => (
            <text
              key={`label-${seg.label}`}
              x={seg.x + seg.width / 2}
              y={BAR_TOP + BAR_HEIGHT / 2 + 4}
              textAnchor="middle"
              fontSize={11}
              fontWeight={600}
              className="fill-white"
            >
              {seg.width > 60 ? seg.label : ""}
            </text>
          ))}

          <text x={WIDTH / 2} y={BAR_TOP - 10} textAnchor="middle" fontSize={12} fontWeight={700} className="fill-zinc-700 dark:fill-zinc-200">
            {labelTotal}
          </text>

          <g transform={`translate(0, ${BAR_TOP + BAR_HEIGHT + 24})`}>
            {[
              { label: labelPrincipal, className: "fill-blue-600 dark:fill-blue-400" },
              { label: labelContributions, className: "fill-orange-400 dark:fill-orange-500" },
              { label: labelInterest, className: "fill-emerald-500 dark:fill-emerald-400" },
            ].map((item, i) => (
              <g key={item.label} transform={`translate(${i * 160}, 0)`}>
                <rect width={10} height={10} rx={2} className={item.className} />
                <text x={16} y={9} fontSize={11} className="fill-zinc-600 dark:fill-zinc-300">
                  {item.label}
                </text>
              </g>
            ))}
          </g>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm text-zinc-500 dark:text-zinc-400">{caption}</figcaption>
    </figure>
  );
}
