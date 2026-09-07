type GasPressureGaugeDiagramProps = {
  pressureAtm: number;
  caption: string;
  label: string;
};

const CX = 100;
const CY = 90;
const R = 60;
const MAX_ATM = 5;

/**
 * A dial-style pressure gauge with the needle angle scaled to the actual
 * computed pressure, referenced against 1 atm (marked) as standard
 * atmospheric pressure.
 */
export default function GasPressureGaugeDiagram({ pressureAtm, caption, label }: GasPressureGaugeDiagramProps) {
  const clamped = Math.max(0, Math.min(MAX_ATM, pressureAtm));
  const angle = -180 + (clamped / MAX_ATM) * 180;
  const radians = (angle * Math.PI) / 180;
  const needleX = CX + (R - 8) * Math.cos(radians);
  const needleY = CY + (R - 8) * Math.sin(radians);
  const oneAtmAngle = -180 + (1 / MAX_ATM) * 180;
  const oneAtmRad = (oneAtmAngle * Math.PI) / 180;
  const oneAtmX = CX + R * Math.cos(oneAtmRad);
  const oneAtmY = CY + R * Math.sin(oneAtmRad);

  return (
    <figure className="my-2">
      <div dir="ltr" className="flex justify-center overflow-x-auto">
        <svg viewBox="0 0 200 130" role="img" aria-label={caption} className="h-auto w-full max-w-[220px] text-current">
          <path d={`M ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX + R} ${CY}`} fill="none" stroke="currentColor" strokeWidth={6} opacity={0.2} />
          <line x1={oneAtmX} y1={oneAtmY} x2={CX + (R - 14) * Math.cos(oneAtmRad)} y2={CY + (R - 14) * Math.sin(oneAtmRad)} stroke="currentColor" strokeWidth={2} opacity={0.5} />
          <line x1={CX} y1={CY} x2={needleX} y2={needleY} stroke="currentColor" strokeWidth={2.5} className="text-blue-600 dark:text-blue-400" />
          <circle cx={CX} cy={CY} r={4} className="fill-blue-600 dark:fill-blue-400" />
          <text x={CX} y={CY + 24} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-blue-700 dark:fill-blue-300">
            {label}
          </text>
        </svg>
      </div>
      <figcaption className="mt-2 text-center text-sm opacity-70">{caption}</figcaption>
    </figure>
  );
}
