/**
 * Reads a ZIP archive's own records (APPNOTE.TXT: local headers, central directory, end of central
 * directory) to report per-entry method, CRC-32 and compressed/uncompressed sizes, how the archive's
 * bytes split between data and headers, plus byte statistics (Shannon entropy, byte-value histogram)
 * that explain why some files shrink and others do not. Also builds deterministic sample files.
 */

export type ZipEntryInfo = {
  name: string;
  /** 0 = stored, 8 = DEFLATE. */
  method: number;
  crc32: number;
  compressedSize: number;
  uncompressedSize: number;
  /** Local file header bytes (30 + name + extra). */
  localHeader: number;
  /** Central directory record bytes (46 + name + extra + comment). */
  centralRecord: number;
};

export type ZipLayout = {
  entries: ZipEntryInfo[];
  archiveBytes: number;
  dataBytes: number;
  localHeaderBytes: number;
  centralDirectoryBytes: number;
  endRecordBytes: number;
};

const u16 = (b: Uint8Array, o: number) => b[o] | (b[o + 1] << 8);
const u32 = (b: Uint8Array, o: number) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;
const decoder = new TextDecoder();

/** Parses the central directory of a (non-ZIP64) archive; returns null if no end record is found. */
export function readZipLayout(zip: Uint8Array): ZipLayout | null {
  let eocd = -1;
  for (let i = zip.length - 22; i >= Math.max(0, zip.length - 22 - 65535); i--) {
    if (u32(zip, i) === 0x06054b50) {
      eocd = i;
      break;
    }
  }
  if (eocd < 0) return null;
  const count = u16(zip, eocd + 10);
  const cdSize = u32(zip, eocd + 12);
  let p = u32(zip, eocd + 16);
  const entries: ZipEntryInfo[] = [];
  for (let k = 0; k < count; k++) {
    if (u32(zip, p) !== 0x02014b50) return null;
    const nameLen = u16(zip, p + 28);
    const extraLen = u16(zip, p + 30);
    const commentLen = u16(zip, p + 32);
    const localOffset = u32(zip, p + 42);
    const name = decoder.decode(zip.subarray(p + 46, p + 46 + nameLen));
    const localExtra = u16(zip, localOffset + 28);
    const localName = u16(zip, localOffset + 26);
    if (!name.endsWith("/"))
      entries.push({
        name,
        method: u16(zip, p + 10),
        crc32: u32(zip, p + 16),
        compressedSize: u32(zip, p + 20),
        uncompressedSize: u32(zip, p + 24),
        localHeader: 30 + localName + localExtra,
        centralRecord: 46 + nameLen + extraLen + commentLen,
      });
    p += 46 + nameLen + extraLen + commentLen;
  }
  const dataBytes = entries.reduce((s, e) => s + e.compressedSize, 0);
  const localHeaderBytes = entries.reduce((s, e) => s + e.localHeader, 0);
  return { entries, archiveBytes: zip.length, dataBytes, localHeaderBytes, centralDirectoryBytes: cdSize, endRecordBytes: zip.length - eocd };
}

/** Shannon entropy in bits per byte (0 = one repeated byte, 8 = uniformly random). */
export function byteEntropy(data: Uint8Array): number {
  if (data.length === 0) return 0;
  const counts = new Array(256).fill(0);
  for (const b of data) counts[b]++;
  const h = -counts.reduce((s, c) => (c ? s + (c / data.length) * Math.log2(c / data.length) : s), 0);
  return h === 0 ? 0 : h;
}

/** Byte values counted in 16 bands of 16 (0–15, 16–31, …, 240–255). */
export function byteHistogram(data: Uint8Array): number[] {
  const bins = new Array(16).fill(0);
  for (const b of data) bins[b >> 4]++;
  return bins;
}

export type FileKind = "text" | "data" | "image" | "archive" | "other";

export function fileKind(name: string): FileKind {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  if (["txt", "md", "html", "htm", "css", "js", "ts", "xml", "svg", "log"].includes(ext)) return "text";
  if (["csv", "json", "tsv", "yaml", "yml", "sql"].includes(ext)) return "data";
  if (["jpg", "jpeg", "png", "gif", "webp", "avif", "heic", "bin"].includes(ext)) return "image";
  if (["zip", "gz", "7z", "rar", "xz", "bz2", "pdf", "mp3", "mp4"].includes(ext)) return "archive";
  return "other";
}

/** Deterministic sample files: plain prose, a CSV table and pseudo-random bytes standing in for a photo. */
export function sampleZipFiles(): { name: string; data: Uint8Array }[] {
  const enc = new TextEncoder();
  const sentences = [
    "ZIP archives compress every file on its own with DEFLATE, the algorithm Phil Katz introduced with PKZIP 2.0 in 1993.",
    "DEFLATE combines LZ77, which replaces repeated strings with back-references, and Huffman coding, which gives frequent symbols short codes.",
    "Text and tables repeat words and digits constantly, so they shrink a lot; photos and videos are already compressed and barely change.",
  ];
  const notes = Array.from({ length: 24 }, (_, i) => sentences[i % sentences.length]).join("\n");
  const rows = ["date,city,temperature_c,humidity_pct"];
  const cities = ["Cairo", "Amman", "Riyadh", "Dubai", "Rabat", "Tunis"];
  for (let d = 0; d < 180; d++) rows.push(`2026-${String(1 + Math.floor(d / 30)).padStart(2, "0")}-${String(1 + (d % 30)).padStart(2, "0")},${cities[d % 6]},${18 + ((d * 7) % 17)},${30 + ((d * 13) % 50)}`);
  // xorshift32: high-entropy bytes, like an already-compressed JPEG.
  let x = 2463534242;
  const photo = new Uint8Array(6000).map(() => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return (x >>> 0) & 0xff;
  });
  return [
    { name: "notes.txt", data: enc.encode(notes) },
    { name: "weather.csv", data: enc.encode(rows.join("\n")) },
    { name: "photo.bin", data: photo },
  ];
}
