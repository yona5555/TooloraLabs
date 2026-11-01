import { preload } from "react-dom";
import ThemeInitScript from "@/components/layout/ThemeInitScript";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import FitNumbers from "@/components/layout/FitNumbers";

/**
 * The <html>/<body> shell. Rendered by each root-level segment ([locale] layout, embed page,
 * global not-found) rather than app/layout.tsx, because only those know the request locale:
 * <html lang dir> must match it for SEO and screen readers.
 */
export default function HtmlDocument({
  lang,
  dir,
  fontPreload,
  children,
}: {
  lang: string;
  dir: "ltr" | "rtl";
  /** The page's locale font (lib/fonts.ts). Not on app/not-found.tsx: its tree renders with every page, in English, and would add Arimo to all of them. */
  fontPreload?: string;
  children: React.ReactNode;
}) {
  // preload(), not a <link>: React writes a <link> element and its own hint for it, so the tag reached <head> twice.
  if (fontPreload) preload(fontPreload, { as: "font", type: "font/woff2", crossOrigin: "" });
  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <body className="text-zinc-900 antialiased dark:text-zinc-100">
        <ThemeInitScript />
        <GoogleAnalytics />
        <FitNumbers />
        {children}
      </body>
    </html>
  );
}
