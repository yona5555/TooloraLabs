// Types for the qrcode package's internal core modules (CommonJS, no published typings).
declare module "qrcode/lib/core/version.js" {
  export function getCapacity(version: number, errorCorrectionLevel: { bit: number }, mode?: unknown): number;
}
declare module "qrcode/lib/core/error-correction-code.js" {
  export function getTotalCodewordsCount(version: number, errorCorrectionLevel: { bit: number }): number;
  export function getBlocksCount(version: number, errorCorrectionLevel: { bit: number }): number;
}
declare module "qrcode/lib/core/error-correction-level.js" {
  export const L: { bit: number };
  export const M: { bit: number };
  export const Q: { bit: number };
  export const H: { bit: number };
}
declare module "qrcode/lib/core/utils.js" {
  export function getSymbolTotalCodewords(version: number): number;
}
declare module "qrcode/lib/core/mode.js" {
  export const NUMERIC: unknown;
  export const ALPHANUMERIC: unknown;
  export const BYTE: unknown;
}
declare module "qrcode/lib/core/alignment-pattern.js" {
  export function getPositions(version: number): [number, number][];
}
