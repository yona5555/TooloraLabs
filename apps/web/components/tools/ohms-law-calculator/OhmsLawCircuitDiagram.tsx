type OhmsLawCircuitDiagramProps = {
  voltageText: string;
  currentText: string;
  resistanceText: string;
  caption: string;
};

/**
 * A simple single-loop circuit schematic (battery + resistor) labeled with
 * this result's live V/I/R values — the same three quantities as the
 * mnemonic triangle, but shown as the physical circuit they describe rather
 * than an abstract formula shape.
 */
export default function OhmsLawCircuitDiagram({ voltageText, currentText, resistanceText, caption }: OhmsLawCircuitDiagramProps) {
  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox="0 0 280 160" role="img" aria-label={caption} className="h-auto w-full max-w-xs text-current">
          <rect x={20} y={35} width={240} height={90} fill="none" stroke="currentColor" strokeWidth={2} opacity={0.6} />

          <rect x={5} y={60} width={30} height={40} className="fill-white dark:fill-zinc-900" stroke="currentColor" strokeWidth={2} />
          <line x1={12} y1={67} x2={28} y2={67} stroke="currentColor" strokeWidth={2} />
          <line x1={16} y1={73} x2={24} y2={73} stroke="currentColor" strokeWidth={2} />
          <line x1={12} y1={87} x2={28} y2={87} stroke="currentColor" strokeWidth={2} />
          <line x1={16} y1={93} x2={24} y2={93} stroke="currentColor" strokeWidth={2} />
          <text x={20} y={53} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
            {voltageText}
          </text>

          <rect x={110} y={25} width={60} height={20} className="fill-white dark:fill-zinc-900" stroke="currentColor" strokeWidth={2} />
          <text x={140} y={17} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
            {resistanceText}
          </text>

          <polygon points="230,75 245,65 245,85" fill="currentColor" opacity={0.7} />
          <text x={240} y={140} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
            {currentText}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
