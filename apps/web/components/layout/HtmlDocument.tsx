import ThemeInitScript from "@/components/layout/ThemeInitScript";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import FitNumbers from "@/components/layout/FitNumbers";
import { fontVariables } from "@/lib/fonts";

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
  /** The page's locale font (lib/locale-font-preload.ts). Not on app/not-found.tsx: its tree renders with every page, in English, and would add Arimo to all of them. */
  fontPreload?: string;
  children: React.ReactNode;
}) {
  return (
    <html lang={lang} dir={dir} className={fontVariables} suppressHydrationWarning>
      <body className="text-zinc-900 antialiased dark:text-zinc-100">
        {fontPreload && <link rel="preload" href={fontPreload} as="font" type="font/woff2" crossOrigin="" />}
        <ThemeInitScript />
        <GoogleAnalytics />
        <FitNumbers />
        {children}
      </body>
    </html>
  );
}
