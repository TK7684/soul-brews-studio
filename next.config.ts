import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  // Demo subdirectory deployment (pedpro.online/demos-v2/<slug>/):
  // - trailingSlash so /cafe-demo exports to cafe-demo/index.html (directory deploy like liff-booking)
  // - assetPrefix '/demos-v2' = shared _next tree for ALL subdir demos (Day-14: with the
  //   per-demo prefix, a second demo's chunks would 404 against the first demo's path)
  trailingSlash: true,
  assetPrefix: "/demos-v2",
};

export default nextConfig;
