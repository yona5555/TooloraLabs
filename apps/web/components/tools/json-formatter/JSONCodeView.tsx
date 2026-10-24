"use client";

const TOKEN = /("(?:[^"\\]|\\.)*")(\s*:)?|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|\b(true|false|null)\b|([{}[\],])|(…\d+)/g;

const RAIL = ["border-blue-400/60", "border-violet-400/60", "border-emerald-400/60", "border-amber-400/60", "border-rose-400/60"];

function Line({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(TOKEN)) {
    const i = m.index ?? 0;
    if (i > last) parts.push(text.slice(last, i));
    const [whole, str, colon, num, lit, punct, fold] = m;
    if (str && colon) {
      parts.push(
        <span key={i} className="text-blue-700 dark:text-blue-300">
          {str}
        </span>,
        colon,
      );
    } else if (str) {
      parts.push(
        <span key={i} className="text-emerald-700 dark:text-emerald-300">
          {str}
        </span>,
      );
    } else if (num) {
      parts.push(
        <span key={i} className="text-amber-700 dark:text-amber-300">
          {num}
        </span>,
      );
    } else if (lit) {
      parts.push(
        <span key={i} className={lit === "null" ? "text-zinc-500 dark:text-zinc-400" : "text-rose-600 dark:text-rose-300"}>
          {lit}
        </span>,
      );
    } else if (punct) {
      parts.push(
        <span key={i} className="text-zinc-500 dark:text-zinc-400">
          {punct}
        </span>,
      );
    } else if (fold) {
      parts.push(
        <span key={i} className="rounded bg-violet-100 px-1 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
          {fold}
        </span>,
      );
    } else {
      parts.push(whole);
    }
    last = i + whole.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

/**
 * Syntax-coloured JSON with line numbers and one coloured rail per nesting level, so the depth of
 * every line is visible at a glance. `unit` = the indent string the text was formatted with.
 */
/** Phone: long lines wrap between tokens instead of scrolling sideways (desktop keeps one line each). */
export const PHONE_WRAP = "max-md:min-w-0 max-md:whitespace-pre-wrap max-md:[word-break:normal] max-md:[overflow-wrap:anywhere]";

export default function JSONCodeView({ text, unit, className = "" }: { text: string; unit: string; className?: string }) {
  // Minified text is one long line: wrap it instead of scrolling sideways. Phone (below md) wraps every
  // line between tokens; a token with no space in it breaks only when it alone is wider than the box.
  const wrap = !text.includes("\n");
  const lines = text.split("\n");
  const gutter = String(lines.length).length;
  return (
    <div dir="ltr" className={`overflow-auto rounded-xl border border-zinc-200 bg-zinc-50 py-2 font-mono text-[13px] leading-6 dark:border-zinc-700 dark:bg-zinc-800/60 ${className}`}>
      {lines.map((line, n) => {
        const lead = line.match(/^[ \t]*/)?.[0] ?? "";
        const depth = unit ? Math.floor(lead.length / unit.length) : 0;
        return (
          <div key={n} className={wrap ? "flex" : "flex min-w-max max-md:min-w-0"}>
            <span className="sticky left-0 shrink-0 bg-zinc-50 ps-2 pe-3 text-end text-zinc-400 select-none dark:bg-zinc-800 dark:text-zinc-500" style={{ width: `${gutter + 2}ch` }}>
              {n + 1}
            </span>
            {Array.from({ length: depth }, (_, d) => (
              <span key={d} className={`inline-block shrink-0 border-s-2 ${RAIL[d % RAIL.length]}`} style={{ width: "2ch" }} />
            ))}
            <span className={`pe-3 text-zinc-800 dark:text-zinc-100 ${wrap ? "min-w-0 break-all whitespace-pre-wrap" : "whitespace-pre"} ${PHONE_WRAP}`}>
              <Line text={line.slice(depth * unit.length)} />
            </span>
          </div>
        );
      })}
    </div>
  );
}
