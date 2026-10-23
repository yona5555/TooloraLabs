"use client";
import { useLayoutEffect, useRef } from "react";
import { useServerInsertedHTML } from "next/navigation";
import { PHONE_LAYOUT_BOOT, phoneLayout } from "@/lib/phone/layout";

/**
 * The approved phone layout pass (lib/phone/layout.ts), placed after the tool page's content.
 * Same pattern as ThemeInitScript: the boot script goes into the server HTML stream through
 * `useServerInsertedHTML`, so it is never a React fiber and React 19 never recreates a <script> on
 * the client. The sentinel <span> marks the end of the content for it; after a client-side navigation
 * (no server HTML) the layout effect runs the same pass before paint.
 */
export default function PhoneLayoutScript() {
  const inserted = useRef(false);
  useServerInsertedHTML(() => {
    if (inserted.current) return null;
    inserted.current = true;
    return <script id="phone-layout" dangerouslySetInnerHTML={{ __html: PHONE_LAYOUT_BOOT }} />;
  });
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => phoneLayout(ref.current), []);
  return <span ref={ref} data-phone-end="" hidden />;
}
