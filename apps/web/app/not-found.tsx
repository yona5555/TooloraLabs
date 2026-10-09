import HtmlDocument from "@/components/layout/HtmlDocument";

// Unmatched paths outside [locale] (e.g. /embed, which the proxy skips) render here; app/layout.tsx
// has no <html>, so this page supplies its own.
export default function GlobalNotFound() {
  return (
    <HtmlDocument lang="en" dir="ltr">
      <main className="flex min-h-screen items-center justify-center gap-4 text-sm">
        <h1 className="border-e border-zinc-300 pe-4 text-2xl font-medium dark:border-zinc-700">404</h1>
        <p>This page could not be found.</p>
      </main>
    </HtmlDocument>
  );
}
