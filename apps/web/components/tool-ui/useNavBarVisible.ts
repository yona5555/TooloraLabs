"use client";
import { useEffect, useRef, useState } from "react";

/**
 * The SectionNav bar shown only once the page header has scrolled away (the molar-mass pattern),
 * so a `visible={false}` bar never takes in-flow space under the tool cards (§41). Put the
 * returned ref on a zero-height sentinel at the top of the page.
 */
export function useNavBarVisible() {
  const [visible, setVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    let shown = false;
    const show = new IntersectionObserver(
      ([e]) => {
        if (!e.isIntersecting && !shown) {
          shown = true;
          setVisible(true);
        }
      },
      { rootMargin: "-88px 0px 0px 0px", threshold: 0 },
    );
    const hide = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && shown) {
          shown = false;
          setVisible(false);
        }
      },
      { rootMargin: "-56px 0px 0px 0px", threshold: 0 },
    );
    show.observe(el);
    hide.observe(el);
    return () => {
      show.disconnect();
      hide.disconnect();
    };
  }, []);
  return [sentinelRef, visible] as const;
}
