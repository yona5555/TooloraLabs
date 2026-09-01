import { Caveat } from "next/font/google";

/**
 * Self-hosted at build time by next/font (no runtime request to Google's CDN, no render-blocking
 * network hop), scoped to a CSS variable rather than applied globally — used only by
 * HeroMathDoodles for the handful of short algebra snippets in its decorative background, not by
 * any other component or page.
 */
export const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-hero-doodle",
  display: "swap",
});
