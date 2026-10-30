import type { Metadata } from "next";
import { shareKey, shareTitle } from "@/lib/indexable-pages";

export const SHARE_IMAGE_SIZE = { width: 1200, height: 630 };

/**
 * og:image + twitter:image of an indexable page (lib/indexable-pages.ts), served by
 * app/share/[locale]/[image]/route.tsx. path: the locale-free page path ("" for home).
 */
export async function shareImageMetadata(locale: string, path: string): Promise<Pick<Metadata, "twitter"> & { images: NonNullable<Metadata["openGraph"]>["images"] }> {
  const key = shareKey(path);
  const alt = await shareTitle(key, locale);
  if (alt === undefined) throw new Error(`shareImageMetadata: ${path || "/"} is not in lib/indexable-pages.ts`);
  const url = `/share/${locale}/${key}.png`;
  return {
    images: [{ url, ...SHARE_IMAGE_SIZE, alt, type: "image/png" }],
    twitter: { card: "summary_large_image", images: [{ url, alt }] },
  };
}

/** The same, as the openGraph/twitter metadata of a page that sets no other Open Graph field. */
export async function shareMetadata(locale: string, path: string): Promise<Pick<Metadata, "openGraph" | "twitter">> {
  const { images, twitter } = await shareImageMetadata(locale, path);
  return { openGraph: { images }, twitter };
}
