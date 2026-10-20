import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Genera una versión autónoma de la tienda para correrla en Docker o en un servidor Node.
  output: "standalone",
};

export default nextConfig;
