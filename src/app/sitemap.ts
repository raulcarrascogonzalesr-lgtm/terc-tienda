import type { MetadataRoute } from "next";
import { energyCategoriesIn, energyHref, splitWorlds } from "@/lib/energy";
import { listProducts } from "@/lib/products";

export const revalidate = 3600;

// Páginas públicas para Google. Los productos agotados u ocultos no aparecen.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://terc.cl";
  const products = await listProducts().catch(() => []);
  const { pcs, energy } = splitWorlds(products);
  const categories = [...new Set(pcs.map((p) => p.category))].sort();
  return [
    { url: `${base}/`, changeFrequency: "daily", priority: 1 },
    { url: `${base}/por-que-terc`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/empresas`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/garantia-y-devoluciones`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terminos`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/privacidad`, changeFrequency: "yearly", priority: 0.2 },
    ...categories.map((c) => ({
      url: `${base}/?categoria=${encodeURIComponent(c)}`,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...(energy.length
      ? [
          { url: `${base}/energia`, changeFrequency: "daily" as const, priority: 0.9 },
          ...energyCategoriesIn(energy).map((c) => ({
            url: `${base}${energyHref(c).replace("#productos", "")}`,
            changeFrequency: "daily" as const,
            priority: 0.8,
          })),
        ]
      : []),
    ...products.map((p) => ({
      url: `${base}/producto/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
