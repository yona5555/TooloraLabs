/**
 * Pure tokenizer for the Result card's code image: splits already-formatted JSON text into typed
 * runs (key / string / number / boolean / null / punctuation / whitespace) so each can take its
 * own theme colour, and into lines for line numbers. No DOM, no fabricated text — it only re-reads
 * the real formatted output the tool already produced.
 */
export type JSONTokenType = "key" | "string" | "number" | "boolean" | "null" | "punct" | "ws";
export type JSONToken = { type: JSONTokenType; text: string };

const TOKEN_RE = /"(?:\\.|[^"\\])*"(?=\s*:)|"(?:\\.|[^"\\])*"|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|\btrue\b|\bfalse\b|\bnull\b|[{}[\],:]|[ \t]+|\r?\n/g;

function classify(raw: string, followedByColon: boolean): JSONTokenType {
  if (raw === "\n" || raw === "\r\n" || /^[ \t]+$/.test(raw)) return "ws";
  if (raw === "true" || raw === "false") return "boolean";
  if (raw === "null") return "null";
  if (/^[{}[\],:]$/.test(raw)) return "punct";
  if (raw.startsWith('"')) return followedByColon ? "key" : "string";
  return "number";
}

/** Tokenizes `text`, then regroups into one token array per line (newlines dropped, not a token). */
export function tokenizeJSONLines(text: string): JSONToken[][] {
  const lines: JSONToken[][] = [[]];
  let m: RegExpExecArray | null;
  TOKEN_RE.lastIndex = 0;
  let last = 0;
  while ((m = TOKEN_RE.exec(text))) {
    if (m.index > last) lines[lines.length - 1].push({ type: "string", text: text.slice(last, m.index) });
    const raw = m[0];
    if (raw === "\n" || raw === "\r\n") {
      lines.push([]);
    } else {
      const after = text.slice(m.index + raw.length).match(/^\s*(.)/);
      const type = classify(raw, raw.startsWith('"') && after?.[1] === ":");
      lines[lines.length - 1].push({ type, text: raw });
    }
    last = m.index + raw.length;
  }
  if (last < text.length) lines[lines.length - 1].push({ type: "string", text: text.slice(last) });
  return lines;
}
