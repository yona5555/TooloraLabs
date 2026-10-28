import type { MetadataRoute } from "next";

// Web app manifest (Android install / home screen). Icons come from the Σ mark: scripts/brand-icons.mjs.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TooloraLabs",
    short_name: "TooloraLabs",
    description: "All the Tools You Need in One Place",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
