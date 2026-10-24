import { Children, cloneElement, isValidElement, type ReactNode } from "react";

const SUFFIX = "-mini";
const ID_LIST_PROPS = new Set(["aria-labelledby", "aria-describedby", "aria-controls", "aria-owns", "aria-activedescendant", "htmlFor"]);
const HREF_PROPS = new Set(["href", "xlinkHref"]);

type Props = Record<string, unknown>;

function collectIds(node: ReactNode, ids: Set<string>): void {
  Children.forEach(node, (child) => {
    if (!isValidElement(child)) return;
    const props = child.props as Props;
    if (typeof child.type === "string" && typeof props.id === "string") ids.add(props.id);
    if (typeof props.children !== "function") collectIds(props.children as ReactNode, ids);
  });
}

function renameRefs(value: string, ids: Set<string>): string {
  return value.replace(/url\(#([^)]+)\)/g, (match, id: string) => (ids.has(id) ? `url(#${id}${SUFFIX})` : match));
}

function rewrite(node: ReactNode, ids: Set<string>): ReactNode {
  return Children.map(node, (child) => {
    if (!isValidElement(child)) return child;
    const props = child.props as Props;
    const next: Props = {};
    for (const [key, value] of Object.entries(props)) {
      if (key === "children") continue;
      if (key === "data-testid" && typeof value === "string") next[key] = value + SUFFIX;
      else if (key === "id" && typeof child.type === "string" && typeof value === "string" && ids.has(value)) next[key] = value + SUFFIX;
      else if (HREF_PROPS.has(key) && typeof value === "string" && value.startsWith("#") && ids.has(value.slice(1))) next[key] = value + SUFFIX;
      else if (ID_LIST_PROPS.has(key) && typeof value === "string") next[key] = value.split(/\s+/).map((id) => (ids.has(id) ? id + SUFFIX : id)).join(" ");
      else if (typeof value === "string" && value.includes("url(#")) next[key] = renameRefs(value, ids);
      else if (key === "style" && value && typeof value === "object") {
        next[key] = Object.fromEntries(Object.entries(value).map(([k, v]) => [k, typeof v === "string" ? renameRefs(v, ids) : v]));
      }
    }
    if (typeof props.children !== "function" && props.children !== undefined) next.children = rewrite(props.children as ReactNode, ids);
    return cloneElement(child, next);
  });
}

/**
 * The phone mini copy of an indicator (PhoneMiniCopy, PhoneMiniMirror) is a NEW render of the
 * indicator's elements, not the original's markup: an id baked into those elements by the tool (a
 * gradient, clipPath or pattern id from the parent's useId()) would otherwise appear twice on the page.
 * Every id the elements define, every reference to one (url(#id), href="#id", aria id lists) and every
 * data-testid get a "-mini" suffix. Components inside the copy are new instances, so ids they make
 * with useId() themselves are already unique.
 */
export function miniCopy(node: ReactNode): ReactNode {
  const ids = new Set<string>();
  collectIds(node, ids);
  return rewrite(node, ids);
}
