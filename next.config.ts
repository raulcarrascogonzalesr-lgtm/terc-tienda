import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Genera una versión autónoma de la tienda para correrla en Docker o en un servidor Node.
  output: "standalone",
  experimental: {
    // Permite subir fotos de productos desde el panel.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
