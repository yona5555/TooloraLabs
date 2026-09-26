type CostFlowDiagramProps = {
  fifoTitle: string;
  lifoTitle: string;
  oldestLabel: string;
  newestLabel: string;
  outLabel: string;
};

/**
 * Plain HTML two-column comparison — no bordered boxes connected by an
 * arrow. Each column is one vertical stack of purchase layers (newest on
 * top, like real purchases piling up); which layer is consumed first is
 * shown by highlighting that row and tagging it with `outLabel` directly,
 * not by drawing a line from the row to a separate label. Matches the
 * grid-cols-2 comparison-card pattern from BreakEvenBusinessTypeDiagram.
 */
function Stack({ title, consumeTop, oldestLabel, newestLabel, outLabel, accentClass, highlightClass }: {
  title: string;
  consumeTop: boolean;
  oldestLabel: string;
  newestLabel: string;
  outLabel: string;
  accentClass: string;
  highlightClass: string;
}) {
  const layers = [
    { label: newestLabel, consumed: consumeTop },
    { label: "", consumed: false },
    { label: oldestLabel, consumed: !consumeTop },
  ];

  return (
    <div className="rounded-xl border border-zinc-100 p-4 dark:border-zinc-800/60">
      <p className={`text-center text-sm font-bold ${accentClass}`}>{title}</p>
      <div className="mt-3 flex flex-col gap-1.5">
        {layers.map((layer, i) => (
          <div
            key={i}
            className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-xs font-semibold ${
              layer.consumed ? `${highlightClass} text-white` : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
            }`}
          >
            <span>{layer.label}</span>
            {layer.consumed && <span className="text-[10px] font-bold tracking-wide uppercase opacity-90">{outLabel}</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CostFlowDiagram({ fifoTitle, lifoTitle, oldestLabel, newestLabel, outLabel }: CostFlowDiagramProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Stack title={fifoTitle} consumeTop={false} oldestLabel={oldestLabel} newestLabel={newestLabel} outLabel={outLabel} accentClass="text-teal-600 dark:text-teal-400" highlightClass="bg-teal-600 dark:bg-teal-500" />
      <Stack title={lifoTitle} consumeTop={true} oldestLabel={oldestLabel} newestLabel={newestLabel} outLabel={outLabel} accentClass="text-orange-600 dark:text-orange-400" highlightClass="bg-orange-600 dark:bg-orange-500" />
    </div>
  );
}
