import type { MetadataRoute } from "next";
import { listProducts } from "@/lib/products";

export const revalidate = 3600;

// Páginas públicas para Google. Los productos agotados u ocultos no aparecen.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://terc.cl";
  const products = await listProducts().catch(() => []);
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/por-que-terc`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/empresas`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/garantia-y-devoluciones`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacidad`, changeFrequency: "yearly", priority: 0.2 },
    ...products.map((p) => ({
      url: `${base}/producto/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
