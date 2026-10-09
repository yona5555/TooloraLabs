"use client";
import { createContext, useContext } from "react";

/** The converter's current pair, readable by client islands inside the server-rendered encyclopedia. */
export const ForexPairContext = createContext<{ from: string; to: string }>({ from: "USD", to: "EUR" });
export const useForexPair = () => useContext(ForexPairContext);
