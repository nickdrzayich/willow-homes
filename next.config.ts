import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow the dev server to serve JS/hydration assets when accessed from a
  // phone on the LAN (by IP, not localhost) -- otherwise Next.js blocks those
  // cross-origin dev asset requests, the page renders but never hydrates, and
  // every onClick handler (expand/collapse, etc.) silently does nothing.
  allowedDevOrigins: ["192.168.4.156"],
};

export default nextConfig;
