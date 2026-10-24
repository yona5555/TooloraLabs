"use client";
import { useRef } from "react";
import { useServerInsertedHTML } from "next/navigation";

const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem("theme");var d=s?s==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark");}catch(e){}})();`;

/**
 * Injects the dark-mode init script directly into the SSR HTML stream via
 * `useServerInsertedHTML` instead of rendering a `<script>` element through
 * `next/script`. React never owns this node as a fiber (this component
 * always renders `null`, on both server and client), so it can never be
 * recreated client-side via `createElement("script")` — which is what
 * triggers React 19's dev-only "Encountered a script tag while rendering
 * React component" warning for `<script>` elements that ARE part of the
 * reconciled tree. The script still runs before paint either way, so
 * dark-mode-without-flicker behavior is unaffected. The callback runs at every
 * flush of the streamed HTML, so it inserts the script on the first flush only
 * (one `id="theme-init"` per page, never a duplicate id).
 */
export default function ThemeInitScript() {
  const inserted = useRef(false);
  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;
    return <script id="theme-init" dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />;
  });
  return null;
}
