import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import ThemeInitScript from "@/components/layout/ThemeInitScript";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "TooloraLabs",
  description: "All the Tools You Need in One Place",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body className="bg-white text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        <ThemeInitScript />
        {children}
      </body>
    </html>
  );
}
