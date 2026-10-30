"use client";
import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * Today's date for the "generated on" line of a print/export sheet. The pages are prerendered at build
 * time, so a date rendered on the server is the build day: on any later day it no longer matches the
 * browser's date, React rejects the hydration (#418) and re-renders the whole document on the client,
 * which also drops the `dark` class ThemeInitScript set on <html>. The server renders nothing here and
 * the browser fills in its own date right after hydration.
 */
export function useTodayDate(locale?: string) {
  return useSyncExternalStore(subscribe, () => new Date().toLocaleDateString(locale), () => "");
}

export default function TodayDate({ locale }: { locale?: string }) {
  return useTodayDate(locale);
}
