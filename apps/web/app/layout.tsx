import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { buildVerificationMetadata } from "@/lib/analytics";
import ThemeInitScript from "@/components/layout/ThemeInitScript";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "TooloraLabs",
  description: "All the Tools You Need in One Place",
  verification: buildVerificationMetadata(),
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className="bg-[#F4F4F4] text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        <ThemeInitScript />
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  );
}
