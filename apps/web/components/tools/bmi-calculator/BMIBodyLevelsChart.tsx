type Level = { bmi: number; label: string };

const FIGURE_WIDTH = 80;
const DOMAIN_MIN = 15;
const DOMAIN_MAX = 45;
const CX = 40;

function widthFactor(bmi: number) {
  const clamped = Math.min(Math.max(bmi, DOMAIN_MIN), DOMAIN_MAX);
  return (clamped - DOMAIN_MIN) / (DOMAIN_MAX - DOMAIN_MIN);
}

/**
 * Original silhouette built entirely from parametric path math (no traced or
 * copied reference artwork). `f` (0-1) drives every measurement so the same
 * generator produces the whole underweight-to-obesity sequence: waist width
 * grows fastest with `f` (abdominal fat is the most BMI-sensitive region),
 * shoulders/hips grow more mildly — mirroring how body composition
 * actually redistributes rather than just scaling a blob uniformly.
 */
function bodyMetrics(f: number) {
  const neckHalf = 4 + f * 2;
  const shoulderHalf = 13 + f * 6;
  const chestHalf = shoulderHalf + 2 + f * 5;
  const waistHalf = 9 + f * 18;
  const hipHalf = 12 + f * 10;
  const crotchHalf = Math.max(3, 5.5 - f * 1.5);
  const kneeHalf = 5 + f * 2.5;
  const ankleHalf = 3.2 + f * 1.2;

  return { neckHalf, shoulderHalf, chestHalf, waistHalf, hipHalf, crotchHalf, kneeHalf, ankleHalf };
}

const Y = {
  head: 16,
  jaw: 26,
  shoulder: 36,
  chest: 50,
  waist: 66,
  hip: 84,
  pelvisFloor: 92,
  knee: 114,
  ankle: 138,
};

function Figure({ bmi, label, index }: { bmi: number; label: string; index: number }) {
  const f = widthFactor(bmi);
  const m = bodyMetrics(f);
  const headR = 10.5;

  const torso = `
    M ${CX - m.shoulderHalf} ${Y.shoulder}
    C ${CX - m.shoulderHalf - 2} ${Y.shoulder + 7}, ${CX - m.chestHalf} ${Y.shoulder + 6}, ${CX - m.chestHalf} ${Y.chest}
    C ${CX - m.chestHalf} ${Y.chest + 7}, ${CX - m.waistHalf - 1} ${Y.waist - 9}, ${CX - m.waistHalf} ${Y.waist}
    C ${CX - m.waistHalf + 1} ${Y.waist + 8}, ${CX - m.hipHalf} ${Y.hip - 9}, ${CX - m.hipHalf} ${Y.hip}
    Q ${CX - m.hipHalf} ${Y.pelvisFloor}, ${CX - m.crotchHalf} ${Y.pelvisFloor}
    L ${CX + m.crotchHalf} ${Y.pelvisFloor}
    Q ${CX + m.hipHalf} ${Y.pelvisFloor}, ${CX + m.hipHalf} ${Y.hip}
    C ${CX + m.hipHalf} ${Y.hip - 9}, ${CX + m.waistHalf - 1} ${Y.waist + 8}, ${CX + m.waistHalf} ${Y.waist}
    C ${CX + m.waistHalf + 1} ${Y.waist - 9}, ${CX + m.chestHalf} ${Y.chest + 7}, ${CX + m.chestHalf} ${Y.chest}
    C ${CX + m.chestHalf} ${Y.shoulder + 6}, ${CX + m.shoulderHalf + 2} ${Y.shoulder + 7}, ${CX + m.shoulderHalf} ${Y.shoulder}
    Z
  `;

  const neck = `
    M ${CX - m.neckHalf} ${Y.jaw}
    L ${CX - m.neckHalf - 1.5} ${Y.shoulder}
    M ${CX + m.neckHalf} ${Y.jaw}
    L ${CX + m.neckHalf + 1.5} ${Y.shoulder}
  `;

  const armY0 = Y.shoulder + 2;
  const armElbow = Y.shoulder + (Y.hip - Y.shoulder) * 0.55;
  const armEnd = Y.hip + 6;
  const armSpread = m.shoulderHalf + 1.5;
  const armOut = m.chestHalf + 2.5;

  const leftArm = `M ${CX - armSpread} ${armY0} C ${CX - armOut} ${armY0 + 10}, ${CX - armOut - 1} ${armElbow}, ${CX - armSpread - 2} ${armElbow + 6} C ${CX - armSpread - 3} ${armElbow + 14}, ${CX - armSpread - 1} ${armEnd - 6}, ${CX - armSpread + 1} ${armEnd}`;
  const rightArm = `M ${CX + armSpread} ${armY0} C ${CX + armOut} ${armY0 + 10}, ${CX + armOut + 1} ${armElbow}, ${CX + armSpread + 2} ${armElbow + 6} C ${CX + armSpread + 3} ${armElbow + 14}, ${CX + armSpread + 1} ${armEnd - 6}, ${CX + armSpread - 1} ${armEnd}`;

  const legTop = Y.pelvisFloor;
  const legX0 = m.crotchHalf * 0.55;
  const thighOut = m.hipHalf * 0.62;

  const leftLeg = `M ${CX - legX0} ${legTop} C ${CX - thighOut} ${legTop + 10}, ${CX - m.kneeHalf - 1} ${Y.knee - 8}, ${CX - m.kneeHalf} ${Y.knee} C ${CX - m.kneeHalf + 0.5} ${Y.knee + 12}, ${CX - m.ankleHalf} ${Y.ankle - 8}, ${CX - m.ankleHalf} ${Y.ankle}`;
  const rightLeg = `M ${CX + legX0} ${legTop} C ${CX + thighOut} ${legTop + 10}, ${CX + m.kneeHalf + 1} ${Y.knee - 8}, ${CX + m.kneeHalf} ${Y.knee} C ${CX + m.kneeHalf - 0.5} ${Y.knee + 12}, ${CX + m.ankleHalf} ${Y.ankle - 8}, ${CX + m.ankleHalf} ${Y.ankle}`;

  const leftFoot = `M ${CX - m.ankleHalf - 1} ${Y.ankle} Q ${CX - m.ankleHalf - 6} ${Y.ankle + 3}, ${CX - m.ankleHalf - 7} ${Y.ankle + 4.5}`;
  const rightFoot = `M ${CX + m.ankleHalf + 1} ${Y.ankle} Q ${CX + m.ankleHalf + 6} ${Y.ankle + 3}, ${CX + m.ankleHalf + 7} ${Y.ankle + 4.5}`;

  return (
    <g transform={`translate(${index * FIGURE_WIDTH}, 0)`} className="text-zinc-800 dark:text-zinc-200">
      <circle cx={CX} cy={Y.head} r={headR} fill="none" stroke="currentColor" strokeWidth={1.6} />
      <path d={neck} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" />
      <path d={leftArm} fill="none" stroke="currentColor" strokeWidth={3.4} strokeLinecap="round" />
      <path d={rightArm} fill="none" stroke="currentColor" strokeWidth={3.4} strokeLinecap="round" />
      <path d={torso} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinejoin="round" />
      <path d={leftLeg} fill="none" stroke="currentColor" strokeWidth={4.6} strokeLinecap="round" />
      <path d={rightLeg} fill="none" stroke="currentColor" strokeWidth={4.6} strokeLinecap="round" />
      <path d={leftFoot} fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" />
      <path d={rightFoot} fill="none" stroke="currentColor" strokeWidth={2.6} strokeLinecap="round" />
      <text x={CX} y={158} textAnchor="middle" fontSize={11} fontWeight={700} fill="currentColor">
        {bmi}
      </text>
      <text x={CX} y={172} textAnchor="middle" fontSize={9} fill="currentColor" fillOpacity={0.7}>
        {label}
      </text>
    </g>
  );
}

export default function BMIBodyLevelsChart({ levels }: { levels: Level[] }) {
  const width = levels.length * FIGURE_WIDTH;

  return (
    <svg viewBox={`0 0 ${width} 180`} role="img" className="mx-auto w-full max-w-md">
      {levels.map((level, index) => (
        <Figure key={level.bmi} bmi={level.bmi} label={level.label} index={index} />
      ))}
    </svg>
  );
}
