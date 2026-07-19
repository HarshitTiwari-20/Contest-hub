import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Keep file tracing scoped to this app (not the monorepo api/)
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
