import ThemeInitScript from "@/components/layout/ThemeInitScript";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";

/**
 * The <html>/<body> shell. Rendered by each root-level segment ([locale] layout, embed page,
 * global not-found) rather than app/layout.tsx, because only those know the request locale:
 * <html lang dir> must match it for SEO and screen readers.
 */
export default function HtmlDocument({
  lang,
  dir,
  children,
}: {
  lang: string;
  dir: "ltr" | "rtl";
  children: React.ReactNode;
}) {
  return (
    <html lang={lang} dir={dir} suppressHydrationWarning>
      <body className="bg-[#F4F4F4] text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        <ThemeInitScript />
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
