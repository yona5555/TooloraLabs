// Share (Open Graph / Twitter) image of every indexable page (lib/indexable-pages.ts): Σ mark + wordmark
// (public/logo.svg) and the page title, 1200×630 PNG at /share/{locale}/{key}.png. The title is shaped by HarfBuzz into
// glyph paths (lib/share-image/shape.ts) so Arabic and Devanagari render as Chromium renders them; satori only
// places the two images. Inputs are the files and the messages alone (no clock, no network, no randomness),
// so the same build always serves the same bytes. Prerendered for every locale × page.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { shareKeys, shareTitle } from "@/lib/indexable-pages";
import { shapeTitle } from "@/lib/share-image/shape";
import { SHARE_IMAGE_SIZE } from "@/lib/share-image/meta";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const dynamicParams = false;

const PAD = 80;
const LOGO = { width: 288, height: 72 };
const logoSrc = `data:image/svg+xml;base64,${readFileSync(join(process.cwd(), "public/logo.svg")).toString("base64")}`;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => shareKeys.map((key) => ({ locale, image: `${key}.png` })));
}

export async function GET(_req: Request, { params }: { params: Promise<{ locale: string; image: string }> }) {
  const { locale, image } = await params;
  const key = image.replace(/\.png$/, "");
  if (!hasLocale(routing.locales, locale) || !image.endsWith(".png")) notFound();
  const title = await shareTitle(key, locale);
  if (title === undefined) notFound();
  const shaped = shapeTitle(title, locale, { fontSize: 76, maxWidth: SHARE_IMAGE_SIZE.width - 2 * PAD, maxLines: 3, color: "#18181b" });
  const end = locale === "ar" ? "flex-end" : "flex-start";
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: "#ffffff" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: end, padding: PAD }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={LOGO.width} height={LOGO.height} alt="" />
          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`data:image/svg+xml;base64,${Buffer.from(shaped.svg).toString("base64")}`} width={shaped.width} height={shaped.height} alt="" />
          </div>
        </div>
        <div style={{ height: 16, background: "#2563eb" }} />
      </div>
    ),
    SHARE_IMAGE_SIZE,
  );
}
