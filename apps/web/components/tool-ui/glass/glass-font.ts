import { Inter } from "next/font/google";

/**
 * The hard rules for this tool's glass cards call for Inter specifically. The site's own default
 * body font is Arial/Helvetica (app/globals.css), so Inter isn't loaded anywhere else -- this is
 * the one place it's pulled in, scoped to these cards only via the CSS variable below rather than
 * changed site-wide.
 */
export const glassInter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--glass-font-inter", display: "swap" });
