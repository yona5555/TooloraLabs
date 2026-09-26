type Stat = { label: string; value: string; emphasize?: boolean };

type BreakEvenBusinessTypeDiagramProps = {
  softwareLabel: string;
  lowMarginLabel: string;
  softwareTraits: string[];
  lowMarginTraits: string[];
  statsTitle: string;
  softwareStats: Stat[];
  lowMarginStats: Stat[];
  caption: string;
};

function StatBlock({ title, stats }: { title: string; stats: Stat[] }) {
  return (
    <dl className="mt-3 space-y-1.5 border-t border-current/15 pt-3 text-sm">
      <p className="text-[10px] font-semibold uppercase tracking-wide opacity-60">{title}</p>
      {stats.map((stat, i) => (
        <div key={i} className={`flex items-baseline justify-between gap-3 ${stat.emphasize ? "font-bold" : ""}`}>
          <dt>{stat.label}</dt>
          <dd dir="ltr" className="font-mono">
            {stat.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Plain HTML two-column cards, not the fixed-width SVG diagram this used to
 * be. The SVG version drew each trait as an un-wrapping <text> element
 * inside a fixed 134px-wide <rect> — a string like "Near-zero cost per
 * extra user" at that font size needs more width than the box itself, so
 * it spilled past the box's own edge and into the neighboring box's space
 * (only a 16px gap separated them), reading as the two cards overlapping
 * with clipped, unreadable text on both sides. Real HTML text wraps to fit
 * its container at any width — this class of bug can't recur here no
 * matter how long a trait string is or how narrow the viewport gets.
 */
export default function BreakEvenBusinessTypeDiagram({
  softwareLabel,
  lowMarginLabel,
  softwareTraits,
  lowMarginTraits,
  statsTitle,
  softwareStats,
  lowMarginStats,
  caption,
}: BreakEvenBusinessTypeDiagramProps) {
  return (
    <figure className="my-2">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-violet-400 bg-violet-50 p-4 dark:border-violet-400/60 dark:bg-violet-500/10">
          <p className="font-bold text-violet-700 dark:text-violet-300">{softwareLabel}</p>
          <ul className="mt-2 space-y-1.5 text-sm text-violet-700 dark:text-violet-300">
            {softwareTraits.map((trait) => (
              <li key={trait} className="flex gap-1.5">
                <span aria-hidden="true">•</span>
                <span>{trait}</span>
              </li>
            ))}
          </ul>
          <div className="text-violet-700 dark:text-violet-300">
            <StatBlock title={statsTitle} stats={softwareStats} />
          </div>
        </div>

        <div className="rounded-xl border border-violet-600 bg-violet-100 p-4 dark:border-violet-400 dark:bg-violet-500/20">
          <p className="font-bold text-violet-800 dark:text-violet-200">{lowMarginLabel}</p>
          <ul className="mt-2 space-y-1.5 text-sm text-violet-800 dark:text-violet-200">
            {lowMarginTraits.map((trait) => (
              <li key={trait} className="flex gap-1.5">
                <span aria-hidden="true">•</span>
                <span>{trait}</span>
              </li>
            ))}
          </ul>
          <div className="text-violet-800 dark:text-violet-200">
            <StatBlock title={statsTitle} stats={lowMarginStats} />
          </div>
        </div>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
