import { UnitConverter } from "./UnitConverter";

const converter = new UnitConverter();
const ctx = { locale: "en-US" };

export type FeetInches = { feet: number; inches: number };

export function feetInchesToCm({ feet, inches }: FeetInches): number {
  const totalInches = feet * 12 + inches;
  const output = converter.execute(
    { category: "length", from: "in", to: "cm", value: totalInches },
    ctx
  );
  return output.data.result;
}

export function cmToFeetInches(cm: number): FeetInches {
  const output = converter.execute(
    { category: "length", from: "cm", to: "in", value: cm },
    ctx
  );
  const totalInches = output.data.result;
  let feet = Math.floor(totalInches / 12);
  let inches = Number((totalInches - feet * 12).toFixed(1));

  if (inches >= 12) {
    feet += 1;
    inches = 0;
  }

  return { feet, inches };
}

export function lbToKg(lb: number): number {
  const output = converter.execute(
    { category: "weight", from: "lb", to: "kg", value: lb },
    ctx
  );
  return output.data.result;
}

export function kgToLb(kg: number): number {
  const output = converter.execute(
    { category: "weight", from: "kg", to: "lb", value: kg },
    ctx
  );
  return output.data.result;
}
