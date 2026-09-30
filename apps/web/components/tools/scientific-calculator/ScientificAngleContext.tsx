import { createLiveToolState } from "@/lib/create-live-tool-state";

/**
 * Shared live angle (degrees) for the hero unit-circle explorer and the six supporting
 * indicators whose own math is genuinely angle-based (trig curves, derivative/integral of
 * sin, inverse-trig ranges, angle-unit conversion). The other nine indicators cover math
 * domains with no real relationship to an angle (factorials, logs, combinatorics, memory,
 * sign, percent, precedence) and are intentionally NOT wired to this context — each gets
 * its own embedded live control instead, so no indicator fakes a connection §23 forbids.
 */
export type ScientificAngleDims = { angleDeg: number };
export const { LiveProvider: ScientificAngleProvider, useLiveState: useScientificAngle } = createLiveToolState<ScientificAngleDims>();
