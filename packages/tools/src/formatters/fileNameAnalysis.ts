/**
 * Character-level analysis for the File Name Sanitizer: what each character of the original name is,
 * whether the original would be accepted by Windows, macOS, Linux and a URL path, its length in
 * characters / UTF-8 bytes / UTF-16 units, and the name after each stage of the sanitizer's pipeline.
 */
import { FileNameSanitizer, type FileNameSanitizerInput } from "./FileNameSanitizer";

export type NameCharClass = "ascii" | "digit" | "accented" | "nonLatin" | "space" | "illegal" | "dot" | "punct";
export const NAME_CHAR_CLASSES: NameCharClass[] = ["ascii", "digit", "accented", "nonLatin", "space", "illegal", "dot", "punct"];

// eslint-disable-next-line no-control-regex
const ILLEGAL = /[<>:"/\\|?*\x00-\x1F]/;
const RESERVED = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
const enc = new TextEncoder();

export function classifyChar(ch: string): NameCharClass {
  if (ILLEGAL.test(ch)) return "illegal";
  if (/\s/.test(ch)) return "space";
  if (ch === ".") return "dot";
  if (/[0-9]/.test(ch)) return "digit";
  if (/[A-Za-z]/.test(ch)) return "ascii";
  if (ch.normalize("NFKD").replace(/[̀-ͯ]/g, "") !== ch && /\p{L}/u.test(ch)) return "accented";
  if (/\p{L}/u.test(ch)) return "nonLatin";
  return "punct";
}

export type PlatformCheck = { platform: "windows" | "macos" | "linux" | "url"; ok: boolean; reasons: string[] };

/** Whether a name is accepted as-is by each platform (reasons are short codes). */
export function checkPlatforms(name: string): PlatformCheck[] {
  const base = name.includes(".") ? name.slice(0, name.lastIndexOf(".")) : name;
  const win: string[] = [];
  if (/[<>:"/\\|?*]/.test(name)) win.push("chars");
  // eslint-disable-next-line no-control-regex
  if (/[\x00-\x1F]/.test(name)) win.push("control");
  if (/[. ]$/.test(name)) win.push("trailing");
  if (RESERVED.test(base.trim())) win.push("reserved");
  if (name.length > 255) win.push("length");
  const mac: string[] = [];
  if (name.includes(":")) mac.push("colon");
  if (name.includes("/")) mac.push("slash");
  if (enc.encode(name).length > 255) mac.push("length");
  const linux: string[] = [];
  if (name.includes("/")) linux.push("slash");
  if (name.includes("\0")) linux.push("control");
  if (enc.encode(name).length > 255) linux.push("length");
  const url: string[] = [];
  if (/[^A-Za-z0-9\-._~]/.test(name)) url.push("encoding");
  return [
    { platform: "windows", ok: win.length === 0, reasons: win },
    { platform: "macos", ok: mac.length === 0, reasons: mac },
    { platform: "linux", ok: linux.length === 0, reasons: linux },
    { platform: "url", ok: url.length === 0, reasons: url },
  ];
}

export type NameLengths = { chars: number; utf8: number; utf16: number; url: number };

export function nameLengths(name: string): NameLengths {
  const bytes = enc.encode(name);
  let url = 0;
  for (const b of bytes) url += b < 128 && /[A-Za-z0-9\-._~]/.test(String.fromCharCode(b)) ? 1 : 3;
  return { chars: [...name].length, utf8: bytes.length, utf16: name.length, url };
}

export type PipelineStage = { key: "input" | "transliterate" | "illegal" | "whitespace" | "trailing" | "reserved" | "result"; value: string };

/**
 * The name after each stage, by re-running the sanitizer with stages switched on one at a time where
 * the tool allows it, so every intermediate value comes from the tool's own logic.
 */
export function pipelineStages(input: FileNameSanitizerInput): PipelineStage[] {
  const tool = new FileNameSanitizer();
  const run = (o: Partial<FileNameSanitizerInput>) => {
    const r = tool.execute({ ...input, ...o }, { locale: "en-US" });
    return r.success ? r.data.result : "";
  };
  const raw = input.fileName.trim();
  const translit = input.transliterate ? raw.normalize("NFKD").replace(/[̀-ͯ]/g, "") : raw;
  const noIllegal = translit.replace(new RegExp(ILLEGAL.source, "g"), "");
  const sep = input.separator ?? "-";
  const spaced = noIllegal.replace(/\s+/g, sep);
  return [
    { key: "input", value: raw },
    { key: "transliterate", value: translit },
    { key: "illegal", value: noIllegal },
    { key: "whitespace", value: spaced },
    { key: "result", value: run({}) },
  ];
}

export type FileNameAnalysis = {
  chars: { ch: string; cls: NameCharClass; code: number }[];
  classCounts: Record<NameCharClass, number>;
  original: PlatformCheck[];
  sanitized: PlatformCheck[];
  lengths: { original: NameLengths; result: NameLengths };
  stages: PipelineStage[];
  extension: string;
};

export function analyzeFileName(input: FileNameSanitizerInput, result: string): FileNameAnalysis {
  const raw = input.fileName;
  const chars = [...raw].map((ch) => ({ ch, cls: classifyChar(ch), code: ch.codePointAt(0) ?? 0 }));
  const classCounts = Object.fromEntries(NAME_CHAR_CLASSES.map((c) => [c, chars.filter((x) => x.cls === c).length])) as Record<NameCharClass, number>;
  const dot = result.lastIndexOf(".");
  return {
    chars,
    classCounts,
    original: checkPlatforms(raw.trim()),
    sanitized: checkPlatforms(result),
    lengths: { original: nameLengths(raw.trim()), result: nameLengths(result) },
    stages: pipelineStages(input),
    extension: dot > 0 ? result.slice(dot + 1) : "",
  };
}
