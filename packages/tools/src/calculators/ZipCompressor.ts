import JSZip from "jszip";

export type ZipEntryInput = { name: string; data: Uint8Array };
export type ZipEntryOutput = { name: string; data: Uint8Array; size: number };

/**
 * Compresses a set of named files into a single ZIP archive using the
 * DEFLATE algorithm. Runs entirely in memory (works in both Node and
 * the browser via JSZip), so no file is ever written to disk or sent
 * to a server by this function itself.
 */
export async function zipFiles(files: ZipEntryInput[]): Promise<Uint8Array> {
  const zip = new JSZip();
  for (const file of files) {
    zip.file(file.name, file.data);
  }
  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
}

/**
 * Extracts every file entry from a ZIP archive's bytes, skipping
 * directory entries, and returns each file's name, raw bytes, and
 * decompressed size.
 */
export async function extractZip(data: Uint8Array): Promise<ZipEntryOutput[]> {
  const zip = await JSZip.loadAsync(data);
  const entries: ZipEntryOutput[] = [];

  const names = Object.keys(zip.files);
  for (const name of names) {
    const entry = zip.files[name];
    if (entry.dir) continue;
    const bytes = await entry.async("uint8array");
    entries.push({ name, data: bytes, size: bytes.length });
  }

  return entries;
}

export function getTotalSize(files: { size: number }[]): number {
  return files.reduce((sum, file) => sum + file.size, 0);
}
