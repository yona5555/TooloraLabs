export function formatResult(value: number): string {
  if (value === 0) return "0";
  if (!Number.isFinite(value)) return "Error";
  const rounded = Number(value.toPrecision(12));
  return rounded.toString();
}
