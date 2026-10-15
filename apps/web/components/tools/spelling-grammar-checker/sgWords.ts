import type { IssueType } from "./types";
import { check, MESSY } from "./sgMath";

/** Words of the stored messy paragraph with the type of the first issue that touches each one. */
export const RIBBON_WORDS: { w: string; type: IssueType | null }[] = (() => {
  const issues = check(MESSY).issues;
  return [...MESSY.matchAll(/\S+/g)].map((m) => {
    const a = m.index ?? 0;
    const b = a + m[0].length;
    const hit = issues.find((i) => i.start < b && i.end > a);
    return { w: m[0], type: hit ? hit.type : null };
  });
})();
export const PER_ROW = 11;
