import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export', // Static export for Tauri
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true, // Better compatibility with static hosting
};

export default nextConfig;
