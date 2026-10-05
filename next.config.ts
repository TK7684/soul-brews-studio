import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  // Demo subdirectory deployment (pedpro.online/demos-v2/cafe-next/):
  // - trailingSlash so /cafe-demo exports to cafe-demo/index.html (directory deploy like liff-booking)
  // - absolute assetPrefix so /_next assets resolve under the demo path, not site root
  trailingSlash: true,
  assetPrefix: "/demos-v2/cafe-next",
};

export default nextConfig;
