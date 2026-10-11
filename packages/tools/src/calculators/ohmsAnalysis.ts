/**
 * Pure analysis behind the Ohm's Law calculator's live table, 3D drawing and indicators.
 * Everything is derived from the calculator's own solved V, I, R and P, so every visual on
 * the page agrees with the result. No DOM, no I/O.
 */
import { JOULES_PER_CALORIE } from "./energyAnalysis";

/** Elementary charge e (C, exact since the 2019 SI redefinition). */
export const ELEMENTARY_CHARGE = 1.602176634e-19;
/** Resistivity of copper at 20 °C (Ω·m, common handbook value). */
export const COPPER_RESISTIVITY = 1.68e-8;
/** Standard miniature/blade fuse current ratings (A). */
export const STANDARD_FUSE_RATINGS = [1, 2, 3, 5, 10, 13, 15, 20, 30] as const;
/** Common fixed-resistor power ratings (W): 1/8, 1/4, 1/2, 1 and 2 W. */
export const RESISTOR_POWER_RATINGS = [0.125, 0.25, 0.5, 1, 2] as const;
/** IEC 60063 E12 preferred-value series (one decade). */
export const E12_SERIES = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2] as const;

/** Approximate everyday resistances (Ω), conductor to insulator. */
export const RESISTANCE_REFERENCES: { key: string; resistance: number }[] = [
  { key: "copperWire", resistance: 0.02 },
  { key: "led", resistance: 10 },
  { key: "incandescentBulb", resistance: 240 },
  { key: "humanBody", resistance: 100000 },
  { key: "wood", resistance: 1e10 },
  { key: "glass", resistance: 1e12 },
];

export type OhmsSensitivity = { factor: number; resistance: number; current: number; power: number };

export type OhmsAnalysis = {
  voltage: number;
  current: number;
  resistance: number;
  power: number;
  /** G = 1 / R (S). */
  conductance: number;
  milliamps: number;
  kilohms: number;
  milliwatts: number;
  kilowatts: number;
  /** Charge through the resistor per second and per minute (C). */
  chargePerSecond: number;
  chargePerMinute: number;
  /** Electrons per second: I / e. */
  electronsPerSecond: number;
  /** Energy turned into heat in one minute (J), one hour (Wh) and one day (kWh). */
  joulesPerMinute: number;
  wattHoursPerHour: number;
  kWhPerDay: number;
  /** Heat per minute in kilocalories. */
  kcalPerMinute: number;
  /** The three equivalent power formulas: V·I, I²R, V²/R. */
  powerViaVI: number;
  powerViaI2R: number;
  powerViaV2R: number;
  /** Same voltage across R/2, R and 2R. */
  sensitivity: OhmsSensitivity[];
  /** Smallest standard fuse rated at or above |I| (the largest when none is). */
  fuse: number;
  /** True when |I| is above every standard fuse rating. */
  fuseExceeded: boolean;
  /** Smallest standard resistor wattage ≥ 2·|P| (the usual 2× derating), or null when above 2 W. */
  resistorRating: number | null;
  /** Nearest E12 preferred value to R (Ω). */
  e12: number;
  /** Length of 1 mm² copper wire with this resistance (m). */
  copperLength1mm2: number;
};

function nearestE12(r: number): number {
  if (!(r > 0) || !Number.isFinite(r)) return 0;
  const decade = Math.floor(Math.log10(r));
  let best = 0;
  let bestErr = Infinity;
  for (const d of [decade - 1, decade, decade + 1]) {
    for (const m of E12_SERIES) {
      const v = Number((m * 10 ** d).toPrecision(3));
      const err = Math.abs(Math.log(v / r));
      if (err < bestErr) {
        bestErr = err;
        best = v;
      }
    }
  }
  return best;
}

export function fuseFor(current: number): { rating: number; exceeded: boolean } {
  const a = Math.abs(current);
  const found = STANDARD_FUSE_RATINGS.find((r) => r >= a);
  return { rating: found ?? STANDARD_FUSE_RATINGS[STANDARD_FUSE_RATINGS.length - 1], exceeded: found === undefined };
}

export function analyzeOhms(voltage: number, current: number, resistance: number, power: number): OhmsAnalysis {
  const fuse = fuseFor(current);
  const absP = Math.abs(power);
  return {
    voltage,
    current,
    resistance,
    power,
    conductance: resistance !== 0 ? 1 / resistance : Infinity,
    milliamps: current * 1000,
    kilohms: resistance / 1000,
    milliwatts: power * 1000,
    kilowatts: power / 1000,
    chargePerSecond: current,
    chargePerMinute: current * 60,
    electronsPerSecond: Math.abs(current) / ELEMENTARY_CHARGE,
    joulesPerMinute: power * 60,
    wattHoursPerHour: power,
    kWhPerDay: (power * 24) / 1000,
    kcalPerMinute: (power * 60) / JOULES_PER_CALORIE / 1000,
    powerViaVI: voltage * current,
    powerViaI2R: current * current * resistance,
    powerViaV2R: resistance !== 0 ? (voltage * voltage) / resistance : Infinity,
    sensitivity: [0.5, 1, 2].map((factor) => {
      const r = resistance * factor;
      const i = r !== 0 ? voltage / r : Infinity;
      return { factor, resistance: r, current: i, power: voltage * i };
    }),
    fuse: fuse.rating,
    fuseExceeded: fuse.exceeded,
    resistorRating: RESISTOR_POWER_RATINGS.find((r) => r >= 2 * absP) ?? null,
    e12: nearestE12(Math.abs(resistance)),
    copperLength1mm2: (Math.abs(resistance) * 1e-6) / COPPER_RESISTIVITY,
  };
}

export type DimmerState = {
  /** Total series resistance R + Rd (Ω). */
  total: number;
  current: number;
  /** Voltage across the load and across the dimmer (V). */
  loadVoltage: number;
  dimmerVoltage: number;
  /** Power in the load and in the dimmer (W). */
  loadPower: number;
  dimmerPower: number;
  /** Load power as a share of its full power V²/R (0…1): (R / (R + Rd))². */
  brightness: number;
};

/** A source V driving a load R through a series rheostat Rd (a simple resistive dimmer). */
export function dimmerCircuit(voltage: number, load: number, dimmer: number): DimmerState {
  const total = load + Math.max(0, dimmer);
  const current = total !== 0 ? voltage / total : 0;
  const loadVoltage = current * load;
  const dimmerVoltage = voltage - loadVoltage;
  const share = total !== 0 ? load / total : 0;
  return {
    total,
    current,
    loadVoltage,
    dimmerVoltage,
    loadPower: current * loadVoltage,
    dimmerPower: current * dimmerVoltage,
    brightness: share * share,
  };
}

/** V = I·R sampled from 0 to `maxCurrent` for a resistance R. */
export function viLine(resistance: number, maxCurrent: number, n = 2): { current: number; voltage: number }[] {
  return Array.from({ length: n + 1 }, (_, k) => {
    const i = (maxCurrent * k) / n;
    return { current: i, voltage: i * resistance };
  });
}
