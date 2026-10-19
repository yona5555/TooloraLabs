import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";

/**
 * canonical + hreflang links for one page, shared by every route's
 * generateMetadata so all pages point to the same six locale URLs (plus
 * x-default, the default locale) and stay reciprocal. `path` is the
 * locale-less path ("" for home, "/tools/bmi-calculator", ...).
 */
export function localeAlternates(locale: string, path: string) {
  return {
    canonical: `/${locale}${path}`,
    languages: {
      ...Object.fromEntries(routing.locales.map((loc) => [loc, `/${loc}${path}`])),
      "x-default": `/${routing.defaultLocale}${path}`,
    },
  };
}

/** Serialises a schema.org object for a <script type="application/ld+json">. */
export function jsonLdHtml(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}

/** BreadcrumbList from ordered {name, path} crumbs; paths are locale-prefixed site paths. */
export function breadcrumbJsonLd(crumbs: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: `${SITE_URL}${crumb.path}`,
    })),
  };
}

/** The site's publisher; rendered once per page from the locale layout. */
export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TooloraLabs",
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512.png`,
};
