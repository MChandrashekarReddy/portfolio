import type { NextConfig } from "next";

// GitHub Pages serves this repo at /portfolio/ (not domain root), so the
// base path is only applied for that build target — Vercel/local stay at "/".
const isGithubPages = process.env.GITHUB_PAGES === "true";
const basePath = isGithubPages ? "/portfolio" : "";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
