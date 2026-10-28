import type { Metadata } from "next";

export const SHARE_IMAGE_SIZE = { width: 1200, height: 630 };

/** og:image + twitter:image for a page's share image (app/share/[locale]/[image]/route.tsx). key: "home" or a tool slug. */
export function shareImageMetadata(locale: string, key: string, alt: string): Pick<Metadata, "twitter"> & { images: NonNullable<Metadata["openGraph"]>["images"] } {
  const url = `/share/${locale}/${key}.png`;
  return {
    images: [{ url, ...SHARE_IMAGE_SIZE, alt, type: "image/png" }],
    twitter: { card: "summary_large_image", images: [{ url, alt }] },
  };
}
