// Share (Open Graph / Twitter) image of the home page and every tool page: Σ mark + wordmark (public/logo.svg)
// and the page title, 1200×630 PNG at /share/{locale}/{home|slug}.png. The title is shaped by HarfBuzz into
// glyph paths (lib/share-image/shape.ts) so Arabic and Devanagari render as Chromium renders them; satori only
// places the two images. Inputs are the files and the messages alone (no clock, no network, no randomness),
// so the same build always serves the same bytes. Prerendered for every locale × page.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { notFound } from "next/navigation";
import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { tools } from "@/data/tools";
import { shapeTitle } from "@/lib/share-image/shape";
import { SHARE_IMAGE_SIZE } from "@/lib/share-image/meta";

export const runtime = "nodejs";
export const dynamic = "force-static";
export const dynamicParams = false;

const PAD = 80;
const LOGO = { width: 288, height: 72 };
const logoSrc = `data:image/svg+xml;base64,${readFileSync(join(process.cwd(), "public/logo.svg")).toString("base64")}`;

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => ["home", ...tools.map((t) => t.slug)].map((key) => ({ locale, image: `${key}.png` })));
}

export async function GET(_req: Request, { params }: { params: Promise<{ locale: string; image: string }> }) {
  const { locale, image } = await params;
  const key = image.replace(/\.png$/, "");
  if (!hasLocale(routing.locales, locale) || !image.endsWith(".png") || (key !== "home" && !tools.some((t) => t.slug === key))) notFound();
  const title =
    key === "home"
      ? (await getTranslations({ locale, namespace: "site" }))("description")
      : (await getTranslations({ locale, namespace: "tools" }))(`${key}.title`);
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
