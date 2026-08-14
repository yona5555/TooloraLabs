// All values are optional and read from environment variables that are unset
// until the account owner creates the real accounts — see docs/SEO_SETUP.md
// for the manual steps required to obtain each one.
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

export const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "";
export const BING_SITE_VERIFICATION = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION || "";
export const BRAVE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_BRAVE_SITE_VERIFICATION || "";

/** Builds the Next.js Metadata `verification` object, omitting any provider whose env var isn't set yet. */
export function buildVerificationMetadata() {
  const other: Record<string, string> = {};
  if (BING_SITE_VERIFICATION) other["msvalidate.01"] = BING_SITE_VERIFICATION;
  if (BRAVE_SITE_VERIFICATION) other["brave-site-verification"] = BRAVE_SITE_VERIFICATION;

  return {
    ...(GOOGLE_SITE_VERIFICATION ? { google: GOOGLE_SITE_VERIFICATION } : {}),
    ...(Object.keys(other).length > 0 ? { other } : {}),
  };
}
