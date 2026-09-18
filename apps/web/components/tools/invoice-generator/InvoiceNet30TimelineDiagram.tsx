type InvoiceNet30TimelineDiagramProps = {
  issueLabel: string;
  dueLabel: string;
  creditPeriodLabel: string;
  caption: string;
};

const WIDTH = 300;
const HEIGHT = 76;
const LINE_Y = 40;

export default function InvoiceNet30TimelineDiagram({ issueLabel, dueLabel, creditPeriodLabel, caption }: InvoiceNet30TimelineDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="overflow-x-auto">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={`${issueLabel} → ${dueLabel}`} className="h-auto w-full" style={{ minWidth: 280 }}>
          <line x1={20} y1={LINE_Y} x2={WIDTH - 20} y2={LINE_Y} className="stroke-sky-400 dark:stroke-sky-400/70" strokeWidth={4} strokeLinecap="round" />
          <circle cx={20} cy={LINE_Y} r={6} className="fill-sky-600 dark:fill-sky-400" />
          <circle cx={WIDTH - 20} cy={LINE_Y} r={6} className="fill-sky-700 dark:fill-sky-300" />
          <text x={20} y={LINE_Y - 14} textAnchor="start" fontSize={10} fontWeight={700} className="fill-sky-700 dark:fill-sky-300">
            {issueLabel}
          </text>
          <text x={WIDTH - 20} y={LINE_Y - 14} textAnchor="end" fontSize={10} fontWeight={700} className="fill-sky-800 dark:fill-sky-200">
            {dueLabel}
          </text>
          <text x={WIDTH / 2} y={LINE_Y + 22} textAnchor="middle" fontSize={10} fontWeight={700} className="fill-sky-600 dark:fill-sky-400">
            {creditPeriodLabel}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
