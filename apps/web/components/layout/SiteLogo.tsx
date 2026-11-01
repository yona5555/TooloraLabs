import { LOGO_MARKUP } from "@/components/layout/logo-markup";

const COLOR = "text-black dark:text-[#f0f0f0]";

/** The full logo, inline so it needs no request and paints with the page in either theme. Once per page (its ids are unique): Navbar. */
export function SiteLogo({ className }: { className: string }) {
  return (
    <svg role="img" aria-label="TooloraLabs" viewBox="0 0 900 225" width="1200" height="300" className={`${COLOR} ${className}`}>
      <g id="site-logo" dangerouslySetInnerHTML={{ __html: LOGO_MARKUP }} />
    </svg>
  );
}

/** A second copy on the same page, drawn from the Navbar's. */
export function SiteLogoCopy({ className }: { className: string }) {
  return (
    <svg role="img" aria-label="TooloraLabs" viewBox="0 0 900 225" width="1200" height="300" className={`${COLOR} ${className}`}>
      <use href="#site-logo" />
    </svg>
  );
}
