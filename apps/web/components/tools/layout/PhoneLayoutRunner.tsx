"use client";
import { useLayoutEffect, useRef } from "react";
import { phoneLayout } from "@/lib/phone/layout";

/** After a client-side navigation the inline script never runs; this runs the same pass before paint. */
export default function PhoneLayoutRunner() {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => phoneLayout(ref.current), []);
  return <span ref={ref} hidden />;
}
