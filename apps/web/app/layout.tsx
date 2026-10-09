import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site";
import { buildVerificationMetadata } from "@/lib/analytics";
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

// <html>/<body> live in HtmlDocument, rendered by app/[locale]/layout.tsx, the embed page and
// app/not-found.tsx, since only they know the request locale for <html lang dir>.
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
