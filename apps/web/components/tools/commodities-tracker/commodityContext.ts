"use client";
import { createContext, useContext } from "react";
import type { CommodityId } from "./types";

/** The tracker's selected commodity, readable by client islands inside the server-rendered encyclopedia. */
export const CommodityContext = createContext<CommodityId>("gold");
export const useSelectedCommodity = () => useContext(CommodityContext);
