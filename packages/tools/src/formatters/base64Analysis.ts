/**
 * Analysis behind the Base64 tool's indicators, for one (bytes, Base64 text) pair whichever way the
 * user converted: 3-byte → 4-sextet groups, sizes and padding, MIME line wrapping, the same bytes in
 * other text encodings, the alphabet usage and Shannon entropy of the Base64 text, and the byte classes
 * of the raw data.
 */
import { bytesToBase64, type Base64Variant } from "./Base64Tool";

export type Base64Group = {
  /** Up to three input bytes. */
  bytes: number[];
  /** The four 6-bit values (null where the group is short and padding takes over). */
  sextets: (number | null)[];
  chars: string[];
};

export type Base64Analysis = {
  byteCount: number;
  /** Base64 characters including padding. */
  textLength: number;
  padding: number;
  /** Characters a padded standard encoding would use: 4 × ⌈n / 3⌉. */
  paddedLength: number;
  /** MIME (RFC 2045) output: 76-character lines separated by CRLF. */
  mimeLength: number;
  mimeLines: number;
  groups: Base64Group[];
  /** Size of the same bytes in other textual encodings. */
  encodings: { hex: number; base32: number; base64: number; ascii85: number; percent: number };
  alphabet: { upper: number; lower: number; digits: number; symbols: number; padding: number };
  /** Shannon entropy of the Base64 characters, bits per character (max log2 64 = 6). */
  entropy: number;
  byteClasses: { ascii: number; control: number; lead: number; continuation: number; invalid: number };
  standard: string;
  urlSafe: string;
};

const UNRESERVED = /[A-Za-z0-9\-._~]/;

/** Length of the bytes percent-encoded as in a URL component: unreserved ASCII stays, every other byte is %XX. */
export function percentEncodedLength(bytes: number[]): number {
  return bytes.reduce((s, b) => s + (b < 128 && UNRESERVED.test(String.fromCharCode(b)) ? 1 : 3), 0);
}

export function analyzeBase64(bytes: number[], text: string, variant: Base64Variant): Base64Analysis {
  const n = bytes.length;
  const standard = bytesToBase64(bytes, "standard");
  const urlSafe = bytesToBase64(bytes, "urlSafe");
  const padding = (text.match(/=+$/)?.[0].length ?? 0);
  const groups: Base64Group[] = [];
  const chars = variant === "urlSafe" ? urlSafe : standard;
  for (let i = 0, g = 0; i < n; i += 3, g++) {
    const b = bytes.slice(i, i + 3);
    const triplet = (b[0] << 16) | ((b[1] ?? 0) << 8) | (b[2] ?? 0);
    const sextets = [(triplet >> 18) & 63, (triplet >> 12) & 63, b.length > 1 ? (triplet >> 6) & 63 : null, b.length > 2 ? triplet & 63 : null];
    groups.push({ bytes: b, sextets, chars: [0, 1, 2, 3].map((k) => (sextets[k] === null ? (variant === "standard" ? "=" : "") : chars[g * 4 + k])) });
  }
  const paddedLength = 4 * Math.ceil(n / 3);
  const mimeLines = Math.max(1, Math.ceil(paddedLength / 76));

  const counts = new Map<string, number>();
  for (const c of text.replace(/=+$/, "")) counts.set(c, (counts.get(c) ?? 0) + 1);
  const len = [...counts.values()].reduce((s, v) => s + v, 0);
  const entropy = len ? -[...counts.values()].reduce((s, v) => s + (v / len) * Math.log2(v / len), 0) : 0;

  const byteClasses = { ascii: 0, control: 0, lead: 0, continuation: 0, invalid: 0 };
  for (const b of bytes) {
    if (b < 32 || b === 127) byteClasses.control++;
    else if (b < 128) byteClasses.ascii++;
    else if (b < 0xc0) byteClasses.continuation++;
    else if (b < 0xf8) byteClasses.lead++;
    else byteClasses.invalid++;
  }

  return {
    byteCount: n,
    textLength: text.length,
    padding,
    paddedLength,
    mimeLength: paddedLength + (mimeLines - 1) * 2,
    mimeLines,
    groups,
    encodings: {
      hex: n * 2,
      base32: 8 * Math.ceil(n / 5),
      base64: paddedLength,
      // Adobe Ascii85 without the "~>" frame: 5 characters per 4 bytes, a final partial group of k bytes takes k + 1.
      ascii85: Math.floor(n / 4) * 5 + (n % 4 ? (n % 4) + 1 : 0),
      percent: percentEncodedLength(bytes),
    },
    alphabet: {
      upper: [...text].filter((c) => c >= "A" && c <= "Z").length,
      lower: [...text].filter((c) => c >= "a" && c <= "z").length,
      digits: [...text].filter((c) => c >= "0" && c <= "9").length,
      symbols: [...text].filter((c) => "+/-_".includes(c)).length,
      padding,
    },
    entropy,
    byteClasses,
    standard,
    urlSafe,
  };
}
