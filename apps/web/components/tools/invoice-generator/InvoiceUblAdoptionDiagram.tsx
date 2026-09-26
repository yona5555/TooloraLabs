type InvoiceUblAdoptionDiagramProps = {
  regions: string[];
  mandatedLabel: string;
};

/** Plain HTML wrapping chips — no fixed-width SVG rects, no overflow risk for longer translated region names. */
export default function InvoiceUblAdoptionDiagram({ regions, mandatedLabel }: InvoiceUblAdoptionDiagramProps) {
  return (
    <div>
      <p className="text-center text-xs font-bold text-cyan-600 dark:text-cyan-400">{mandatedLabel}</p>
      <div className="mt-2 flex flex-wrap justify-center gap-2" role="img" aria-label={mandatedLabel}>
        {regions.map((region) => (
          <span key={region} className="rounded-full border-2 border-cyan-500 bg-cyan-50 px-3 py-1 text-sm font-bold text-cyan-700 dark:border-cyan-400 dark:bg-cyan-500/10 dark:text-cyan-300">
            {region}
          </span>
        ))}
      </div>
    </div>
  );
}
