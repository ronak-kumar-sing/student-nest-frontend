import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    // Pin the workspace root to this project so a stray lockfile in a parent
    // directory is not picked up as the root.
    root: path.join(__dirname),
  },
};

export default nextConfig;
