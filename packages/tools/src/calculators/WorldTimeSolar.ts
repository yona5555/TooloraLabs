/**
 * Sun geometry for the World Time day/night map: solar declination and equation of time (the
 * Astronomical Almanac low-precision solar coordinates: mean longitude, mean anomaly, ecliptic
 * longitude and obliquity, good to about 0.01° in declination and a few seconds in EoT), the subsolar point, solar elevation anywhere, the night/twilight regions
 * as per-longitude latitude intervals, and sunrise/sunset times. Pure math; no DOM.
 */

const RAD = Math.PI / 180;
const DEG = 180 / Math.PI;

/** Sun at the horizon including refraction and the solar semidiameter (sunrise/sunset). */
export const WT_SUNRISE_ELEVATION = -0.833;
export const WT_CIVIL_ELEVATION = -6;
export const WT_NAUTICAL_ELEVATION = -12;
export const WT_ASTRONOMICAL_ELEVATION = -18;

export type WtSolarPosition = {
  declinationDeg: number;
  /** Apparent minus mean solar time, minutes. */
  equationOfTimeMin: number;
  subsolarLatDeg: number;
  subsolarLonDeg: number;
};

function normLon(lon: number): number {
  const x = (((lon + 180) % 360) + 360) % 360;
  return x - 180;
}

export function wtSolarPosition(utcMs: number): WtSolarPosition {
  const d = new Date(utcMs);
  const hours = d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600 + d.getUTCMilliseconds() / 3_600_000;
  // Days from J2000.0 (2000-01-01 12:00 TT ≈ UTC at this precision).
  const n = (utcMs - Date.UTC(2000, 0, 1, 12)) / 86_400_000;
  const L = (((280.46 + 0.9856474 * n) % 360) + 360) % 360; // mean longitude
  const g = (357.528 + 0.9856003 * n) * RAD; // mean anomaly
  const lambda = (L + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD; // ecliptic longitude
  const eps = (23.439 - 0.0000004 * n) * RAD; // obliquity
  const decl = Math.asin(Math.sin(eps) * Math.sin(lambda));
  const ra = (((Math.atan2(Math.cos(eps) * Math.sin(lambda), Math.cos(lambda)) * DEG) % 360) + 360) % 360;
  let diff = L - ra;
  diff = ((((diff + 180) % 360) + 360) % 360) - 180;
  const eot = diff * 4;

  return {
    declinationDeg: decl * DEG,
    equationOfTimeMin: eot,
    subsolarLatDeg: decl * DEG,
    // The sun is overhead where apparent solar time is 12:00.
    subsolarLonDeg: normLon(-15 * (hours - 12 + eot / 60)),
  };
}

export type WtLatLon = { lat: number; lon: number };

/** Solar elevation in degrees at a point, for a given subsolar point (no refraction). */
export function wtSolarElevation(point: WtLatLon, subsolar: WtLatLon): number {
  const phi = point.lat * RAD;
  const dec = subsolar.lat * RAD;
  const h = (point.lon - subsolar.lon) * RAD;
  const s = Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(h);
  return Math.asin(Math.max(-1, Math.min(1, s))) * DEG;
}

/** The antisolar point (the sun is straight below the horizon there: local solar midnight). */
export function wtAntisolarPoint(subsolar: WtLatLon): WtLatLon {
  return { lat: -subsolar.lat, lon: normLon(subsolar.lon + 180) };
}

/**
 * The latitude interval [south, north] on meridian `lonDeg` where the sun is below `elevationDeg`,
 * or null when the whole meridian is above it. Along a meridian the elevation sine is
 * R·sin(φ + β), so the region below a threshold is one arc, intersected with [−90°, 90°].
 */
export function wtNightInterval(lonDeg: number, subsolar: WtLatLon, elevationDeg: number): [number, number] | null {
  const dec = subsolar.lat * RAD;
  const A = Math.sin(dec);
  const B = Math.cos(dec) * Math.cos((lonDeg - subsolar.lon) * RAD);
  const R = Math.hypot(A, B);
  const s = Math.sin(elevationDeg * RAD);
  if (R < 1e-12) return s > 0 ? [-90, 90] : null;
  const ratio = s / R;
  if (ratio <= -1) return null;
  if (ratio >= 1) return [-90, 90];
  const a = Math.asin(ratio) * DEG;
  const beta = Math.atan2(B, A) * DEG;
  // sin(x) < sin(a) for x in (−180 − a, a); x = φ + β.
  const lo = -180 - a - beta;
  const hi = a - beta;
  for (const k of [-1, 0, 1]) {
    const s0 = Math.max(-90, lo + 360 * k);
    const s1 = Math.min(90, hi + 360 * k);
    if (s1 > s0) return [s0, s1];
  }
  return null;
}

export type WtNightBand = {
  elevationDeg: number;
  /** Polygons in [lon, lat] degrees, one per contiguous run of meridians that have night. */
  polygons: [number, number][][];
};

/** Night (sun below `elevationDeg`) as equirectangular polygons, sampled every `stepDeg` of longitude. */
export function wtNightBand(subsolar: WtLatLon, elevationDeg: number, stepDeg = 2): WtNightBand {
  const polygons: [number, number][][] = [];
  let top: [number, number][] = [];
  let bottom: [number, number][] = [];
  const flush = () => {
    if (top.length > 1) polygons.push([...top, ...bottom.reverse()]);
    top = [];
    bottom = [];
  };
  for (let lon = -180; lon <= 180 + 1e-9; lon += stepDeg) {
    const iv = wtNightInterval(lon, subsolar, elevationDeg);
    if (!iv) {
      flush();
      continue;
    }
    top.push([lon, iv[1]]);
    bottom.push([lon, iv[0]]);
  }
  flush();
  return { elevationDeg, polygons };
}

/** The terminator (sun at `elevationDeg`) as a list of polylines in [lon, lat]: the band outlines without the map-edge segments. */
export function wtTerminatorLines(subsolar: WtLatLon, elevationDeg = WT_SUNRISE_ELEVATION, stepDeg = 1): [number, number][][] {
  const lines: [number, number][][] = [];
  const north: [number, number][] = [];
  const south: [number, number][] = [];
  for (let lon = -180; lon <= 180 + 1e-9; lon += stepDeg) {
    const iv = wtNightInterval(lon, subsolar, elevationDeg);
    if (!iv) continue;
    if (iv[1] < 90 - 1e-6) north.push([lon, iv[1]]);
    if (iv[0] > -90 + 1e-6) south.push([lon, iv[0]]);
  }
  if (north.length > 1) lines.push(north);
  if (south.length > 1) lines.push(south);
  return lines;
}

export type WtSunTimes = {
  /** Local minutes of day (can fall slightly outside 0–1440 for zones far from their meridian). */
  solarNoon: number;
  sunrise: number | null;
  sunset: number | null;
  civilDawn: number | null;
  civilDusk: number | null;
  dayLengthMin: number;
  civilTwilightMin: number;
  polar: "day" | "night" | null;
};

function hourAngleDeg(latDeg: number, declDeg: number, elevationDeg: number): number | "day" | "night" {
  const phi = latDeg * RAD;
  const dec = declDeg * RAD;
  const c = (Math.sin(elevationDeg * RAD) - Math.sin(phi) * Math.sin(dec)) / (Math.cos(phi) * Math.cos(dec));
  if (c > 1) return "night";
  if (c < -1) return "day";
  return Math.acos(c) * DEG;
}

/**
 * Sunrise, sunset and civil twilight on a local calendar date (NOAA method: solar noon from the
 * equation of time and longitude, half-day arc from the hour angle at −0.833° / −6°).
 */
export function wtSunTimes(latDeg: number, lonDeg: number, date: { year: number; month: number; day: number }, utcOffsetMinutes: number): WtSunTimes {
  const midnightUtc = Date.UTC(date.year, date.month - 1, date.day);
  const noonGuess = midnightUtc + (720 - lonDeg * 4) * 60_000;
  const pos = wtSolarPosition(noonGuess);
  const noonUtcMin = 720 - 4 * lonDeg - pos.equationOfTimeMin;
  const solarNoon = noonUtcMin + utcOffsetMinutes;

  const h0 = hourAngleDeg(latDeg, pos.declinationDeg, WT_SUNRISE_ELEVATION);
  const h6 = hourAngleDeg(latDeg, pos.declinationDeg, WT_CIVIL_ELEVATION);
  const polar = typeof h0 === "number" ? null : h0;
  const day = typeof h0 === "number" ? h0 * 8 : h0 === "day" ? 1440 : 0;
  const civil = typeof h6 === "number" ? h6 * 8 : h6 === "day" ? 1440 : 0;
  return {
    solarNoon,
    sunrise: typeof h0 === "number" ? solarNoon - h0 * 4 : null,
    sunset: typeof h0 === "number" ? solarNoon + h0 * 4 : null,
    civilDawn: typeof h6 === "number" ? solarNoon - h6 * 4 : null,
    civilDusk: typeof h6 === "number" ? solarNoon + h6 * 4 : null,
    dayLengthMin: day,
    civilTwilightMin: Math.max(0, civil - day),
    polar,
  };
}
