import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import clientMessageDeps from "@/data/client-message-deps.json";

// The full dictionary is ~4 MB per locale; handing all of it to the client
// provider inlined it in every page's HTML. Client components only read the
// small shared namespaces, every tool's title/description (menus, sidebars,
// related-tool cards) and the full `tools.<slug>` namespaces of the tool(s) on
// the page — data/client-message-deps.json (scripts/gen-client-message-deps.mjs)
// lists which ones each tool reaches. `docs` is read by server components only.

type ToolMessages = Record<string, Record<string, unknown>>;

const deps = clientMessageDeps as Record<string, string[]>;
const SERVER_ONLY_NAMESPACES = new Set(["docs"]);

export async function getClientMessages(locale: string, toolSlugs: readonly string[] = []) {
  const { tools, ...rest } = (await getMessages({ locale })) as { tools: ToolMessages } & Record<string, unknown>;
  const full = new Set(["*", ...toolSlugs].flatMap((key) => deps[key] ?? [key]).flatMap((slug) => deps[slug] ?? [slug]));
  const shared = Object.fromEntries(Object.entries(rest).filter(([key]) => !SERVER_ONLY_NAMESPACES.has(key)));
  const clientTools = Object.fromEntries(
    Object.entries(tools).map(([slug, value]) => [
      slug,
      full.has(slug) ? value : { title: value.title, description: value.description },
    ]),
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
