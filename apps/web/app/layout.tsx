import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TooloraLabs",
  description: "All the Tools You Need in One Place",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  );
}
