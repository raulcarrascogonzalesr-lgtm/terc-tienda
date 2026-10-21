import { getPublicClient } from "./supabase";
import { SAMPLE_PRODUCTS } from "./sample-products";
import type { Product } from "./types";

// Columnas públicas. El costo del proveedor nunca se envía al navegador.
const PRODUCT_COLUMNS =
  "id, slug, name, brand, category, grade, price, list_price, compare_price, stock, on_demand, battery_health, warranty_months, description, image_url, images";

export async function listProducts(): Promise<Product[]> {
  const supabase = getPublicClient();
  if (!supabase) return SAMPLE_PRODUCTS;

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("active", true)
    .gt("stock", 0)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Product[];
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = getPublicClient();
  if (!supabase) return SAMPLE_PRODUCTS.find((p) => p.slug === slug) ?? null;

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("slug", slug)
    .eq("active", true)
    .maybeSingle();
  if (error) throw error;
  return data as Product | null;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  const supabase = getPublicClient();
  if (!supabase) return SAMPLE_PRODUCTS.filter((p) => ids.includes(p.id));

  // Solo productos visibles: si uno se ocultó mientras estaba en un carrito, ya no se puede pagar.
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_COLUMNS)
    .in("id", ids)
    .eq("active", true);
  if (error) throw error;
  return data as Product[];
}
