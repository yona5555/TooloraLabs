/**
 * Pure, string-aware auto-fixer for the four JSON mistakes the Result card's error panel offers
 * to repair automatically: trailing commas, single-quoted strings/keys, unquoted object keys, and
 * `//`/`/* *\/` comments. A single left-to-right scan (not independent regex passes) so a quote or
 * comment token is never mistaken for one sitting inside a string literal.
 */
export type JSONAutoFixKind = "trailingComma" | "singleQuotes" | "unquotedKeys" | "comments";

export type JSONAutoFixResult = {
  fixed: string;
  changed: boolean;
  kinds: JSONAutoFixKind[];
};

function lastNonSpace(out: string): string | undefined {
  let k = out.length - 1;
  while (k >= 0 && /\s/.test(out[k])) k--;
  return k >= 0 ? out[k] : undefined;
}

/** Looks past whitespace and comments (without consuming them) to find the next real character. */
function skipWsAndComments(input: string, start: number): { index: number; hadComment: boolean } {
  const n = input.length;
  let j = start;
  let hadComment = false;
  for (;;) {
    while (j < n && /\s/.test(input[j])) j++;
    if (input[j] === "/" && input[j + 1] === "/") {
      hadComment = true;
      j += 2;
      while (j < n && input[j] !== "\n") j++;
      continue;
    }
    if (input[j] === "/" && input[j + 1] === "*") {
      hadComment = true;
      j += 2;
      while (j < n && !(input[j] === "*" && input[j + 1] === "/")) j++;
      j = Math.min(j + 2, n);
      continue;
    }
    break;
  }
  return { index: j, hadComment };
}

export function autoFixJSON(input: string): JSONAutoFixResult {
  const n = input.length;
  const kinds = new Set<JSONAutoFixKind>();
  let out = "";
  let i = 0;

  while (i < n) {
    const c = input[i];

    // Quoted string (single or double): re-emit as a proper double-quoted JSON string.
    if (c === '"' || c === "'") {
      const quote = c;
      let j = i + 1;
      let content = "";
      while (j < n) {
        const cj = input[j];
        if (cj === "\\" && j + 1 < n) {
          content += cj + input[j + 1];
          j += 2;
          continue;
        }
        if (cj === quote) {
          j++;
          break;
        }
        content += cj;
        j++;
      }
      if (quote === "'") {
        kinds.add("singleQuotes");
        const reEscaped = content.replace(/\\'/g, "'").replace(/(?<!\\)"/g, '\\"');
        out += '"' + reEscaped + '"';
      } else {
        out += quote + content + quote;
      }
      i = j;
      continue;
    }

    // Line and block comments.
    if (c === "/" && input[i + 1] === "/") {
      let j = i + 2;
      while (j < n && input[j] !== "\n") j++;
      kinds.add("comments");
      i = j;
      continue;
    }
    if (c === "/" && input[i + 1] === "*") {
      let j = i + 2;
      while (j < n && !(input[j] === "*" && input[j + 1] === "/")) j++;
      j = Math.min(j + 2, n);
      kinds.add("comments");
      i = j;
      continue;
    }

    // Unquoted object key: a bare identifier right after `{` or `,`, followed by `:`.
    if (/[A-Za-z_$]/.test(c) && (lastNonSpace(out) === "{" || lastNonSpace(out) === ",")) {
      let j = i;
      while (j < n && /[A-Za-z0-9_$]/.test(input[j])) j++;
      let k = j;
      while (k < n && /\s/.test(input[k])) k++;
      if (input[k] === ":") {
        kinds.add("unquotedKeys");
        out += '"' + input.slice(i, j) + '"';
        i = j;
        continue;
      }
    }

    // Trailing comma right before a closing `}` or `]` (even across whitespace/comments).
    if (c === ",") {
      const { index: j, hadComment } = skipWsAndComments(input, i + 1);
      if (input[j] === "}" || input[j] === "]") {
        kinds.add("trailingComma");
        if (hadComment) kinds.add("comments");
        i += 1;
        continue;
      }
    }

    out += c;
    i++;
  }

  return { fixed: out, changed: kinds.size > 0, kinds: Array.from(kinds) };
}
