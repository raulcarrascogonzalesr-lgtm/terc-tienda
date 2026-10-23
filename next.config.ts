import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Genera una versión autónoma de la tienda para correrla en Docker o en un servidor Node.
  output: "standalone",
  // No anunciar en cada respuesta que la tienda está hecha con Next.js.
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Protecciones básicas del navegador para todo el sitio.
        source: "/:path*",
        headers: [
          // Siempre por HTTPS (candado), incluso si alguien escribe http://.
          { key: "Strict-Transport-Security", value: "max-age=31536000" },
          // Nadie puede mostrar terc.cl dentro de otra página para engañar clics.
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // El panel nunca debe aparecer en Google.
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  experimental: {
    // Permite subir fotos de productos desde el panel.
    serverActions: { bodySizeLimit: "6mb" },
  },
};

export default nextConfig;
