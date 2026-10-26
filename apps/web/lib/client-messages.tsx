import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import clientMessageDeps from "@/data/client-message-deps.json";

// The full dictionary is ~4 MB per locale; handing all of it to the client
// provider inlined it in every page's HTML. Client components only read the
// small shared namespaces, every tool's title/description (menus, sidebars,
// related-tool cards) and the full `tools.<slug>` namespaces of the tool(s) on
// the page — data/client-message-deps.json (scripts/gen-client-message-deps.mjs)
// lists which ones each tool reaches. `docs` is read by server components only,
// and so is most of each tool's `education` article: a full namespace keeps only
// the education subtrees the page's code names (`education` in the same file).

type ToolMessages = Record<string, Record<string, unknown>>;
type Tree = Record<string, unknown>;

const deps: Record<string, string[]> = clientMessageDeps.namespaces;
const clientEducation: Record<string, string[]> = clientMessageDeps.education;
const SERVER_ONLY_NAMESPACES = new Set(["docs"]);

// The same `{ title, description }` object for a tool in every provider of a
// request, so the RSC payload sends it once and the tool page's provider
// references the layout's copy.
const summaries = new WeakMap<Tree, Tree>();
const summary = (value: Tree) => {
  if (!summaries.has(value)) summaries.set(value, { title: value.title, description: value.description });
  return summaries.get(value)!;
};

/** Copies only the `paths` ("education.intro.diagram") subtrees of `tree`. */
function pick(tree: Tree, paths: readonly string[]): Tree {
  const out: Tree = {};
  for (const path of paths) {
    const keys = path.split(".");
    let src: unknown = tree;
    for (const key of keys) src = (src as Tree | undefined)?.[key];
    if (src === undefined) continue;
    let dst = out;
    keys.slice(0, -1).forEach((key) => (dst = (dst[key] ??= {}) as Tree));
    dst[keys[keys.length - 1]] = src;
  }
  return out;
}

export async function getClientMessages(locale: string, toolSlugs: readonly string[] = []) {
  const { tools, ...rest } = (await getMessages({ locale })) as { tools: ToolMessages } & Record<string, unknown>;
  const pages = ["*", ...toolSlugs];
  const full = new Set(pages.flatMap((key) => deps[key] ?? [key]).flatMap((slug) => deps[slug] ?? [slug]));
  const educationPaths = [...new Set(pages.flatMap((key) => clientEducation[key] ?? []))];
  const shared = Object.fromEntries(Object.entries(rest).filter(([key]) => !SERVER_ONLY_NAMESPACES.has(key)));
  const clientTools = Object.fromEntries(
    Object.entries(tools).map(([slug, value]) => {
      if (!full.has(slug)) return [slug, summary(value)];
      const { education, ...rest } = value;
      return [slug, education ? { ...rest, ...pick({ education }, educationPaths) } : value];
    }),
  );
  return { ...shared, tools: clientTools };
}

/** Re-provides the client messages with the full namespaces of `toolSlugs`. */
export async function ToolMessagesProvider({
  locale,
  toolSlugs,
  children,
}: {
  locale: string;
  toolSlugs: readonly string[];
  children: ReactNode;
}) {
  return (
    <NextIntlClientProvider locale={locale} messages={await getClientMessages(locale, toolSlugs)}>
      {children}
    </NextIntlClientProvider>
  );
}
