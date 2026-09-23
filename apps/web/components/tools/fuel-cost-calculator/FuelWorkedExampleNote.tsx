type Row = { label: string; value: string; emphasize?: boolean; note?: string };

type Props = {
  title: string;
  rows: Row[];
};

/**
 * Fills the empty space beside a narrow fixed-width education chart (EduLineChart/
 * EduBarChart/this tool's own inline SVGs cap out around 340px, far short of the card's
 * real column width) with a real worked example tied to that same chart's own numbers —
 * never a decorative filler, always the exact values already plotted.
 */
export default function FuelWorkedExampleNote({ title, rows }: Props) {
  return (
    <div className="min-w-[200px] flex-1 rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/40">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">{title}</p>
      {/* No `dir="ltr"` here: that used to force the whole label+value row into
          LTR flex order regardless of page direction, so on an RTL page the
          (Arabic) label ended up pinned at the far left and the value at the
          far right — a straight mirror-inversion of the intended layout, not
          a mirror of it. Letting the row inherit the ambient `dir` (set on
          `<html>` per locale) makes the flex order follow reading direction
          generically, for this or any future RTL locale, without a
          hardcoded per-language branch. Only the value cell keeps its own
          `dir="ltr"`, matching the `Stat` cards in FuelResult.tsx, so its
          digits/currency code stay correctly ordered either way. */}
      <dl className="mt-3 space-y-2 text-sm">
        {rows.map((row, i) => (
          <div key={i}>
            <div
              className={`flex items-baseline justify-between gap-3 ${
                row.emphasize ? "border-t border-zinc-200 pt-2 dark:border-zinc-700" : ""
              }`}
            >
              <dt className="text-zinc-500 dark:text-zinc-400">{row.label}</dt>
              <dd
                dir="ltr"
                className={`font-mono font-semibold ${
                  row.emphasize ? "text-base text-blue-700 dark:text-blue-300" : "text-zinc-800 dark:text-zinc-100"
                }`}
              >
                {row.value}
              </dd>
            </div>
            {row.note && <p className="text-end text-xs text-zinc-400 dark:text-zinc-500">{row.note}</p>}
          </div>
        ))}
      </dl>
    </div>
  );
}
