type CompositionChartProps = {
  bmiLabel: string;
  muscularLabel: string;
  fatLabel: string;
};

const CX = 50;
const Y = {
  head: 16,
  jaw: 26,
  shoulder: 34,
  chest: 46,
  waist: 64,
  hip: 82,
  pelvisFloor: 90,
  knee: 112,
  ankle: 136,
};

/**
 * Two torsos sharing one BMI value but different composition. Both outlines
 * and every internal line below are original path math (no traced source):
 * the muscular figure gets a pectoral shelf, a linea-alba centerline, a
 * simplified six-pack grid, deltoid caps and a quad split; the higher-body-fat
 * figure keeps a smooth, uninterrupted contour with a soft waist bulge and a
 * light stippled texture standing in for subcutaneous fat.
 */
function MuscularFigure() {
  const shoulderHalf = 19;
  const chestHalf = 22;
  const waistHalf = 15;
  const hipHalf = 17;

  const torso = `
    M ${CX - shoulderHalf} ${Y.shoulder}
    C ${CX - shoulderHalf - 2} ${Y.shoulder + 6}, ${CX - chestHalf} ${Y.shoulder + 5}, ${CX - chestHalf} ${Y.chest}
    C ${CX - chestHalf} ${Y.chest + 8}, ${CX - waistHalf} ${Y.waist - 8}, ${CX - waistHalf} ${Y.waist}
    C ${CX - waistHalf} ${Y.waist + 7}, ${CX - hipHalf} ${Y.hip - 8}, ${CX - hipHalf} ${Y.hip}
    Q ${CX - hipHalf} ${Y.pelvisFloor}, ${CX - 3} ${Y.pelvisFloor}
    L ${CX + 3} ${Y.pelvisFloor}
    Q ${CX + hipHalf} ${Y.pelvisFloor}, ${CX + hipHalf} ${Y.hip}
    C ${CX + hipHalf} ${Y.hip - 8}, ${CX + waistHalf} ${Y.waist + 7}, ${CX + waistHalf} ${Y.waist}
    C ${CX + waistHalf} ${Y.waist - 8}, ${CX + chestHalf} ${Y.chest + 8}, ${CX + chestHalf} ${Y.chest}
    C ${CX + chestHalf} ${Y.shoulder + 5}, ${CX + shoulderHalf + 2} ${Y.shoulder + 6}, ${CX + shoulderHalf} ${Y.shoulder}
    Z
  `;

  const pecLine = `M ${CX - chestHalf + 3} ${Y.chest - 4} Q ${CX} ${Y.chest + 1} ${CX + chestHalf - 3} ${Y.chest - 4}`;
  const linea = `M ${CX} ${Y.chest + 2} L ${CX} ${Y.waist + 6}`;
  const abRows = [Y.chest + 8, Y.chest + 15, Y.chest + 22];

  const armSpread = shoulderHalf + 1;
  const armElbow = Y.shoulder + (Y.hip - Y.shoulder) * 0.55;
  const armEnd = Y.hip + 6;
  const leftArm = `M ${CX - armSpread} ${Y.shoulder + 2} C ${CX - chestHalf - 2} ${Y.shoulder + 12}, ${CX - armSpread - 3} ${armElbow}, ${CX - armSpread - 1} ${armElbow + 6} C ${CX - armSpread - 2} ${armElbow + 14}, ${CX - armSpread} ${armEnd - 6}, ${CX - armSpread + 1} ${armEnd}`;
  const rightArm = `M ${CX + armSpread} ${Y.shoulder + 2} C ${CX + chestHalf + 2} ${Y.shoulder + 12}, ${CX + armSpread + 3} ${armElbow}, ${CX + armSpread + 1} ${armElbow + 6} C ${CX + armSpread + 2} ${armElbow + 14}, ${CX + armSpread} ${armEnd - 6}, ${CX + armSpread - 1} ${armEnd}`;

  const leftLeg = `M ${CX - 6} ${Y.pelvisFloor} C ${CX - hipHalf * 0.7} ${Y.pelvisFloor + 9}, ${CX - 7} ${Y.knee - 8}, ${CX - 6.5} ${Y.knee} C ${CX - 6} ${Y.knee + 12}, ${CX - 4} ${Y.ankle - 8}, ${CX - 4} ${Y.ankle}`;
  const rightLeg = `M ${CX + 6} ${Y.pelvisFloor} C ${CX + hipHalf * 0.7} ${Y.pelvisFloor + 9}, ${CX + 7} ${Y.knee - 8}, ${CX + 6.5} ${Y.knee} C ${CX + 6} ${Y.knee + 12}, ${CX + 4} ${Y.ankle - 8}, ${CX + 4} ${Y.ankle}`;

  return (
    <g className="text-zinc-800 dark:text-zinc-200">
      <circle cx={CX} cy={Y.head} r={10.5} fill="none" stroke="currentColor" strokeWidth={1.6} />
      <path d={`M ${CX - 4} ${Y.jaw} L ${CX - 5} ${Y.shoulder} M ${CX + 4} ${Y.jaw} L ${CX + 5} ${Y.shoulder}`} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
      <path d={leftArm} fill="none" stroke="currentColor" strokeWidth={3.6} strokeLinecap="round" />
      <path d={rightArm} fill="none" stroke="currentColor" strokeWidth={3.6} strokeLinecap="round" />
      <path d={torso} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
      <path d={pecLine} fill="none" stroke="currentColor" strokeWidth={1.2} strokeOpacity={0.7} />
      <path d={linea} stroke="currentColor" strokeWidth={1} strokeOpacity={0.6} />
      {abRows.map((y) => (
        <line key={y} x1={CX - 7} y1={y} x2={CX + 7} y2={y} stroke="currentColor" strokeWidth={1} strokeOpacity={0.65} />
      ))}
      <path d={leftLeg} fill="none" stroke="currentColor" strokeWidth={5} strokeLinecap="round" />
      <path d={rightLeg} fill="none" stroke="currentColor" strokeWidth={5} strokeLinecap="round" />
    </g>
  );
}

function HigherFatFigure() {
  const shoulderHalf = 17;
  const chestHalf = 21;
  const waistHalf = 25;
  const hipHalf = 22;

  const torso = `
    M ${CX - shoulderHalf} ${Y.shoulder}
    C ${CX - shoulderHalf - 3} ${Y.shoulder + 7}, ${CX - chestHalf - 1} ${Y.shoulder + 8}, ${CX - chestHalf} ${Y.chest}
    C ${CX - chestHalf - 2} ${Y.chest + 9}, ${CX - waistHalf} ${Y.waist - 12}, ${CX - waistHalf} ${Y.waist}
    C ${CX - waistHalf} ${Y.waist + 8}, ${CX - hipHalf - 1} ${Y.hip - 8}, ${CX - hipHalf} ${Y.hip}
    Q ${CX - hipHalf} ${Y.pelvisFloor}, ${CX - 4} ${Y.pelvisFloor}
    L ${CX + 4} ${Y.pelvisFloor}
    Q ${CX + hipHalf} ${Y.pelvisFloor}, ${CX + hipHalf} ${Y.hip}
    C ${CX + hipHalf + 1} ${Y.hip - 8}, ${CX + waistHalf} ${Y.waist + 8}, ${CX + waistHalf} ${Y.waist}
    C ${CX + waistHalf} ${Y.waist - 12}, ${CX + chestHalf + 2} ${Y.chest + 9}, ${CX + chestHalf} ${Y.chest}
    C ${CX + chestHalf + 1} ${Y.shoulder + 8}, ${CX + shoulderHalf + 3} ${Y.shoulder + 7}, ${CX + shoulderHalf} ${Y.shoulder}
    Z
  `;

  const armSpread = shoulderHalf + 2;
  const armElbow = Y.shoulder + (Y.hip - Y.shoulder) * 0.5;
  const armEnd = Y.hip + 4;
  const leftArm = `M ${CX - armSpread} ${Y.shoulder + 3} C ${CX - chestHalf - 5} ${Y.shoulder + 14}, ${CX - armSpread - 4} ${armElbow}, ${CX - armSpread - 2} ${armElbow + 5} C ${CX - armSpread - 3} ${armElbow + 13}, ${CX - armSpread - 1} ${armEnd - 5}, ${CX - armSpread + 1} ${armEnd}`;
  const rightArm = `M ${CX + armSpread} ${Y.shoulder + 3} C ${CX + chestHalf + 5} ${Y.shoulder + 14}, ${CX + armSpread + 4} ${armElbow}, ${CX + armSpread + 2} ${armElbow + 5} C ${CX + armSpread + 3} ${armElbow + 13}, ${CX + armSpread + 1} ${armEnd - 5}, ${CX + armSpread - 1} ${armEnd}`;

  const leftLeg = `M ${CX - 7} ${Y.pelvisFloor} C ${CX - hipHalf * 0.75} ${Y.pelvisFloor + 8}, ${CX - 8.5} ${Y.knee - 8}, ${CX - 8} ${Y.knee} C ${CX - 7.5} ${Y.knee + 12}, ${CX - 4.5} ${Y.ankle - 8}, ${CX - 4.5} ${Y.ankle}`;
  const rightLeg = `M ${CX + 7} ${Y.pelvisFloor} C ${CX + hipHalf * 0.75} ${Y.pelvisFloor + 8}, ${CX + 8.5} ${Y.knee - 8}, ${CX + 8} ${Y.knee} C ${CX + 7.5} ${Y.knee + 12}, ${CX + 4.5} ${Y.ankle - 8}, ${CX + 4.5} ${Y.ankle}`;

  const dots: [number, number][] = [];
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 4; col++) {
      const y = Y.chest + 4 + row * 7;
      const rowNarrow = row === 0 || row === 4 ? 2 : 0;
      dots.push([CX - 12 + col * 8 + rowNarrow, y]);
    }
  }

  return (
    <g className="text-zinc-800 dark:text-zinc-200">
      <circle cx={CX} cy={Y.head} r={10.5} fill="none" stroke="currentColor" strokeWidth={1.6} />
      <path d={`M ${CX - 5} ${Y.jaw - 1} Q ${CX} ${Y.jaw + 2.5} ${CX + 5} ${Y.jaw - 1}`} fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinecap="round" />
      <path d={`M ${CX - 4} ${Y.jaw} L ${CX - 4.5} ${Y.shoulder} M ${CX + 4} ${Y.jaw} L ${CX + 4.5} ${Y.shoulder}`} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
      <path d={leftArm} fill="none" stroke="currentColor" strokeWidth={4.2} strokeLinecap="round" />
      <path d={rightArm} fill="none" stroke="currentColor" strokeWidth={4.2} strokeLinecap="round" />
      <path d={torso} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
      {dots.map(([x, y]) => (
        <circle key={`${x}-${y}`} cx={x} cy={y} r={1} fill="currentColor" fillOpacity={0.4} />
      ))}
      <path d={leftLeg} fill="none" stroke="currentColor" strokeWidth={5.6} strokeLinecap="round" />
      <path d={rightLeg} fill="none" stroke="currentColor" strokeWidth={5.6} strokeLinecap="round" />
    </g>
  );
}

export default function BMICompositionChart({ bmiLabel, muscularLabel, fatLabel }: CompositionChartProps) {
  return (
    <svg viewBox="0 0 220 180" role="img" className="mx-auto w-full max-w-xs">
      <g transform="translate(0, 0)">
        <MuscularFigure />
        <text x={CX} y={158} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-zinc-800 dark:fill-zinc-200">
          {bmiLabel}
        </text>
        <text x={CX} y={172} textAnchor="middle" fontSize={9} className="fill-zinc-800 dark:fill-zinc-200" fillOpacity={0.7}>
          {muscularLabel}
        </text>
      </g>
      <g transform="translate(120, 0)">
        <HigherFatFigure />
        <text x={CX} y={158} textAnchor="middle" fontSize={11} fontWeight={700} className="fill-zinc-800 dark:fill-zinc-200">
          {bmiLabel}
        </text>
        <text x={CX} y={172} textAnchor="middle" fontSize={9} className="fill-zinc-800 dark:fill-zinc-200" fillOpacity={0.7}>
          {fatLabel}
        </text>
      </g>
    </svg>
  );
}
