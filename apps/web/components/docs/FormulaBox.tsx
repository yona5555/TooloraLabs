type Props = {
  expression: string;
  note: string;
};

export default function FormulaBox({ expression, note }: Props) {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-5 dark:border-blue-500/30 dark:bg-blue-500/5">
      <p dir="ltr" className="overflow-x-auto text-center font-mono text-lg font-semibold text-blue-700 dark:text-blue-400">
        {expression}
      </p>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-300">{note}</p>
    </div>
  );
}
