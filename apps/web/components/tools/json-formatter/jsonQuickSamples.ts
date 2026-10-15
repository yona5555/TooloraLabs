/** Four real-world JSON shapes the input panel's "Quick samples" row can load. Pure data, no DOM. */
export type QuickSample = { key: string; json: string };

const API_RESPONSE = {
  status: 200,
  ok: true,
  data: {
    id: "usr_9f21a",
    name: "Ada Lovelace",
    roles: ["admin", "billing"],
    lastLogin: "2026-10-12T09:41:00Z",
  },
  meta: { requestId: "req_7d3c1", durationMs: 42 },
};

const PACKAGE_JSON = {
  name: "@tooloralabs/example-tool",
  version: "1.4.2",
  private: true,
  scripts: { dev: "next dev", build: "next build", test: "vitest run" },
  dependencies: { next: "15.1.0", react: "19.0.0" },
  devDependencies: { typescript: "5.6.3", vitest: "2.1.4" },
  engines: { node: ">=20" },
};

const GEOJSON_FEATURE = {
  type: "Feature",
  properties: { name: "Golden Gate Bridge", builtYear: 1937 },
  geometry: {
    type: "Point",
    coordinates: [-122.4783, 37.8199],
  },
};

const NESTED_SETTINGS = {
  theme: "system",
  notifications: {
    email: { enabled: true, frequency: "daily" },
    push: { enabled: false, frequency: null },
  },
  privacy: {
    profileVisibility: "friends",
    blockedUsers: [],
  },
  featureFlags: { betaDashboard: true, newEditor: false },
};

export const QUICK_SAMPLES: QuickSample[] = [
  { key: "apiResponse", json: JSON.stringify(API_RESPONSE, null, 2) },
  { key: "packageJson", json: JSON.stringify(PACKAGE_JSON, null, 2) },
  { key: "geoJson", json: JSON.stringify(GEOJSON_FEATURE, null, 2) },
  { key: "nestedSettings", json: JSON.stringify(NESTED_SETTINGS, null, 2) },
];
