import { createContext } from "react";

/**
 * True inside a phone top mini card (PhoneMiniMirror): the shared `Drawing` then renders its SVG only,
 * scaled into the chip, with no handle and no measured refs (the source card keeps those).
 */
export const MiniContext = createContext(false);
