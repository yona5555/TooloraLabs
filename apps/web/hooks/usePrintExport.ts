"use client";

import { useRef } from "react";

export function usePrintExport<T extends HTMLElement = HTMLDivElement>() {
  const printRef = useRef<T>(null);

  function handlePrint() {
    window.print();
  }

  return { printRef, handlePrint };
}
