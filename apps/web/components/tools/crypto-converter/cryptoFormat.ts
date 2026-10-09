"use client";
import { useMarketFormatters, marketFormatters } from "@/components/tools/markets/fiat";

export { FiatContext, useFiat, changeColor } from "@/components/tools/markets/fiat";

/** Crypto pages use the shared market formatters; kept under these names for the crypto cards. */
export const cryptoFormatters = marketFormatters;
export const useCryptoFormatters = useMarketFormatters;
