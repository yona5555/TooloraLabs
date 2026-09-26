type InvoiceNet30TimelineDiagramProps = {
  issueLabel: string;
  dueLabel: string;
  creditPeriodLabel: string;
};

/** Plain HTML dot-line-dot timeline — a chronological span, not bordered boxes linked by arrows. */
export default function InvoiceNet30TimelineDiagram({ issueLabel, dueLabel, creditPeriodLabel }: InvoiceNet30TimelineDiagramProps) {
  return (
    <div dir="ltr" className="w-full" role="img" aria-label={`${issueLabel} → ${dueLabel}`}>
      <div className="flex items-center">
        <span className="h-3 w-3 shrink-0 rounded-full bg-sky-600 dark:bg-sky-400" />
        <span className="mx-1 h-1 flex-1 rounded bg-sky-300 dark:bg-sky-400/50" aria-hidden="true" />
        <span className="h-3.5 w-3.5 shrink-0 rounded-full bg-sky-700 dark:bg-sky-300" />
      </div>
      <div className="mt-2 flex items-start justify-between gap-4">
        <span className="text-xs font-bold text-sky-700 dark:text-sky-300">{issueLabel}</span>
        <span className="text-xs font-bold text-sky-600 dark:text-sky-400">{creditPeriodLabel}</span>
        <span className="text-xs font-bold text-sky-800 dark:text-sky-200">{dueLabel}</span>
      </div>
    </div>
  );
}
